/**
 * Loads and validates everything in content/ (build time and tests). Returns the normalised GameContent the
 * browser receives, plus every schema and cross-reference error found, so a writer sees all problems at once.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { parse } from 'yaml';
import type { z } from 'zod';
import {
  AboutFileSchema,
  CaseSchema,
  HelpFileSchema,
  SourcesFileSchema,
  TracksFileSchema,
  type About,
  type Case,
  type GameContent,
  type Help,
  type Source,
  type Track,
} from '../../src/content/schema.ts';

export interface LoadResult {
  content: GameContent | null;
  sources: Source[];
  errors: string[];
  /** Every file read, for the dev server to watch. */
  files: string[];
}

function formatIssues(file: string, error: z.ZodError): string[] {
  return error.issues.map((i) => `${file}: ${i.path.join('.') || '(root)'}: ${i.message}`);
}

function readYaml(path: string, root: string, errors: string[]): unknown {
  try {
    return parse(readFileSync(path, 'utf8'));
  } catch (e) {
    errors.push(`${relative(root, path)}: YAML error: ${(e as Error).message}`);
    return undefined;
  }
}

function parseFile<S extends z.ZodType>(schema: S, path: string, root: string, errors: string[], files: string[]): z.output<S> | null {
  files.push(path);
  if (!existsSync(path)) {
    errors.push(`${relative(root, path)}: file is missing`);
    return null;
  }
  const raw = readYaml(path, root, errors);
  if (raw === undefined) return null;
  const res = schema.safeParse(raw);
  if (!res.success) {
    errors.push(...formatIssues(relative(root, path), res.error));
    return null;
  }
  return res.data;
}

/** Cross-references inside one case and to tracks/sources. Pure, so it is unit-tested directly. */
export function caseIssues(c: Case, track: Track | undefined, sources: Map<string, Source>): string[] {
  const out: string[] = [];
  const where = `case ${c.id}`;
  if (!track) out.push(`${where}: track "${c.track}" is not in tracks.yaml`);
  for (const s of c.sources) if (!sources.has(s)) out.push(`${where}: source "${s}" is not in sources.yaml`);
  // Red Line 6: at least one Slovak or EU source that is not only supporting (tier 4) or from outside the EU.
  const cited = c.sources.map((s) => sources.get(s)).filter((s): s is Source => !!s);
  if (cited.length > 0 && !cited.some(isPrimarySource)) out.push(`${where}: cite at least one Slovak or EU source of tier 1-3 (Red Line 6)`);

  const cast = new Set(track?.cast.map((m) => m.id) ?? []);
  const speakers = [...c.intro.lines, ...c.decision.prompt, ...(c.verify?.prompt ?? []), ...(c.arc_scene?.lines ?? [])].map((l) => l.speaker);
  for (const sp of speakers) if (track && !cast.has(sp)) out.push(`${where}: speaker "${sp}" is not in the cast of track ${c.track}`);

  const clueIds: string[] = [];
  for (const ev of c.evidence) for (const line of ev.lines) for (const seg of line.segments) if ('clue' in seg && seg.clue) clueIds.push(seg.clue.id);
  const dup = clueIds.filter((x, i) => clueIds.indexOf(x) !== i);
  if (dup.length) out.push(`${where}: duplicate clue ids: ${[...new Set(dup)].join(', ')}`);
  if (c.scan.min_clues > clueIds.length) out.push(`${where}: scan.min_clues (${c.scan.min_clues}) is more than the ${clueIds.length} clues in the evidence`);

  for (const r of c.stars) {
    if (r.type === 'clues' && r.min > clueIds.length) out.push(`${where}: star rule clues.min (${r.min}) is more than the ${clueIds.length} clues`);
    if (r.type === 'trust_or_trap' && !c.trust_or_trap) out.push(`${where}: star rule trust_or_trap needs a trust_or_trap step`);
    if (r.type === 'trust_or_trap' && c.trust_or_trap && r.min > c.trust_or_trap.items.length) out.push(`${where}: star rule trust_or_trap.min (${r.min}) is more than the ${c.trust_or_trap.items.length} items`);
    if ((r.type === 'verify_best' || r.type === 'decision_and_verify_best') && !c.verify) out.push(`${where}: star rule ${r.type} needs a verify step`);
    if (r.type === 'lock_up' && !c.lock_up) out.push(`${where}: star rule lock_up needs a lock_up step`);
  }
  for (const pf of c.scan.pre_found) if (!clueIds.includes(pf)) out.push(`${where}: scan.pre_found "${pf}" is not a clue id in the evidence`);
  if (c.risk.length > 0) {
    const opts = [...c.decision.options, ...(c.verify?.options ?? [])];
    if (!opts.some((o) => o.tells_adult && o.outcome !== 'bad')) out.push(`${where}: risk (${c.risk.join(', ')}) needs a best or ok option with tells_adult: true (Red Line 8)`);
  }
  for (const dc of c.debrief.clues) if (dc.clue && !clueIds.includes(dc.clue)) out.push(`${where}: debrief clue "${dc.clue}" is not a clue id in the evidence`);
  if (c.trust_or_trap) {
    const kinds = new Set(c.trust_or_trap.items.map((i) => i.answer));
    if (kinds.size < 2) out.push(`${where}: trust_or_trap needs both trust and trap items (GDD §4.5)`);
  }
  return out;
}

/** A source that can carry a claim on its own: region SK or EU (when given) and tier 1-3 (when given). */
export function isPrimarySource(s: Source): boolean {
  const regionOk = s.region === undefined || ['SK', 'EU'].includes(s.region.toUpperCase());
  const tierOk = s.tier === undefined || s.tier <= 3;
  return regionOk && tierOk;
}

const digits = (s: string | undefined) => (s ?? '').replace(/\D/g, '');
const CHILD_LINE = '116111';

/**
 * help.yaml rules (Red Line 8): the first entry is Linka detskej istoty 116 111 (HelpLine shows entries[0] under every
 * debrief), and every topic card points to 116 111. Entry ids are unique; topic contacts exist.
 */
export function helpIssues(help: Help): string[] {
  const out: string[] = [];
  const first = help.entries[0];
  if (!first || digits(first.phone) !== CHILD_LINE || first.topic) out.push('help.yaml: the first entry must be the Linka detskej istoty contact with phone 116 111 (Red Line 8)');
  const ids = help.entries.map((e) => e.id);
  if (new Set(ids).size !== ids.length) out.push('help.yaml: entry ids must be unique');
  for (const e of help.entries) {
    for (const cid of e.contacts) {
      const target = help.entries.find((x) => x.id === cid);
      if (!target) out.push(`help.yaml: entry ${e.id}: contact "${cid}" is not an entry id`);
      else if (target.topic) out.push(`help.yaml: entry ${e.id}: contact "${cid}" is a topic card, not a contact`);
    }
    if (e.contacts.length > 0 && !e.topic) out.push(`help.yaml: entry ${e.id}: contacts are only for topic cards`);
    if (e.topic) {
      const linked = e.contacts.some((cid) => digits(help.entries.find((x) => x.id === cid)?.phone) === CHILD_LINE);
      const named = digits(e.phone) === CHILD_LINE || /116\s?111/.test(e.text);
      if (!linked && !named) out.push(`help.yaml: topic card ${e.id} must point to 116 111 (phone, text or contacts) (Red Line 8)`);
    }
  }
  return out;
}

/**
 * about.yaml rules: the closing help line names 116 111 (Red Line 8); section ids are unique; addresses are plain
 * text, so they carry no scheme (the game opens no links).
 */
export function aboutIssues(about: About): string[] {
  const out: string[] = [];
  if (!/116\s?111/.test(about.help_line)) out.push('about.yaml: help_line must name Linka detskej istoty 116 111 (Red Line 8)');
  const ids = about.sections.map((s) => s.id);
  if (new Set(ids).size !== ids.length) out.push('about.yaml: section ids must be unique');
  for (const s of about.sections) {
    if (s.address && /^[a-z][a-z0-9+.-]*:/i.test(s.address)) out.push(`about.yaml: section ${s.id}: write the address without a scheme (plain text, never a link)`);
    if (s.address_note && !s.address) out.push(`about.yaml: section ${s.id}: address_note needs an address`);
  }
  return out;
}

export function trackIssues(t: Track): string[] {
  const out: string[] = [];
  if (!t.ranks.some((r) => r.min_stars === 0)) out.push(`track ${t.id}: one rank needs min_stars: 0`);
  const mins = t.ranks.map((r) => r.min_stars);
  if (mins.some((m, i) => i > 0 && m <= (mins[i - 1] ?? -1))) out.push(`track ${t.id}: ranks must be listed with rising min_stars`);
  if (new Set(t.cast.map((m) => m.id)).size !== t.cast.length) out.push(`track ${t.id}: cast ids must be unique`);
  if (new Set(t.cases).size !== t.cases.length) out.push(`track ${t.id}: case ids must be unique`);
  if (t.planned_cases !== undefined && t.planned_cases < t.cases.length) out.push(`track ${t.id}: planned_cases is less than the listed cases`);
  return out;
}

export function loadContent(root: string): LoadResult {
  const errors: string[] = [];
  const files: string[] = [];
  const tracksFile = parseFile(TracksFileSchema, join(root, 'tracks.yaml'), root, errors, files);
  const sourcesFile = parseFile(SourcesFileSchema, join(root, 'sources.yaml'), root, errors, files);
  const help: Help | null = parseFile(HelpFileSchema, join(root, 'help.yaml'), root, errors, files);

  if (help) errors.push(...helpIssues(help));
  const about: About | null = parseFile(AboutFileSchema, join(root, 'about.yaml'), root, errors, files);
  if (about) errors.push(...aboutIssues(about));
  const sources = sourcesFile?.sources ?? [];
  const sourceMap = new Map(sources.map((s) => [s.id, s]));
  if (sourceMap.size !== sources.length) errors.push('sources.yaml: source ids must be unique');

  const tracks = tracksFile?.tracks ?? [];
  if (new Set(tracks.map((t) => t.id)).size !== tracks.length) errors.push('tracks.yaml: track ids must be unique');
  for (const t of tracks) errors.push(...trackIssues(t));

  const cases: Record<string, Case> = {};
  const casesDir = join(root, 'cases');
  const trackDirs = existsSync(casesDir) ? readdirSync(casesDir, { withFileTypes: true }).filter((d) => d.isDirectory()) : [];
  for (const dir of trackDirs) {
    for (const f of readdirSync(join(casesDir, dir.name)).filter((n) => n.endsWith('.yaml')).sort()) {
      const path = join(casesDir, dir.name, f);
      const c = parseFile(CaseSchema, path, root, errors, files);
      if (!c) continue;
      const rel = relative(root, path);
      if (basename(f, '.yaml') !== c.id) errors.push(`${rel}: file name must be <id>.yaml (id is "${c.id}")`);
      if (dir.name !== c.track) errors.push(`${rel}: lives in cases/${dir.name}/ but says track: ${c.track}`);
      if (cases[c.id]) errors.push(`${rel}: case id "${c.id}" is used twice`);
      cases[c.id] = c;
      errors.push(...caseIssues(c, tracks.find((t) => t.id === c.track), sourceMap));
    }
  }

  for (const t of tracks) {
    t.cases.forEach((cid, i) => {
      const c = cases[cid];
      if (!c) errors.push(`track ${t.id}: case "${cid}" has no file cases/${t.id}/${cid}.yaml`);
      else if (c.number !== i + 1) errors.push(`case ${cid}: number is ${c.number} but it is case ${i + 1} in tracks.yaml`);
    });
  }
  for (const c of Object.values(cases)) {
    if (!tracks.some((t) => t.cases.includes(c.id))) errors.push(`case ${c.id}: not listed in tracks.yaml under track ${c.track}`);
  }

  const ok = errors.length === 0 && tracksFile && help && about;
  return { content: ok ? { tracks, cases, help, about } : null, sources, errors, files };
}
