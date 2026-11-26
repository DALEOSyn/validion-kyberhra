import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import { aboutLines } from '../../src/content/about.ts';
import { aboutIssues, caseIssues, helpIssues, loadContent, trackIssues } from '../../scripts/lib/content.ts';
import { AboutFileSchema, CaseSchema, HelpEntrySchema, RecallSchema } from '../../src/content/schema.ts';

const CONTENT = resolve(import.meta.dirname, '../../content');
const res = loadContent(CONTENT);

describe('content/', () => {
  it('validates against the schema with no cross-reference errors', () => {
    expect(res.errors).toEqual([]);
    expect(res.content).not.toBeNull();
  });

  it('has both tracks, each with at least one case', () => {
    const ids = res.content?.tracks.map((t) => t.id);
    expect(ids).toEqual(['junior', 'teen']);
    for (const t of res.content?.tracks ?? []) expect(t.cases.length).toBeGreaterThan(0);
  });

  it('every case cites sources that exist in sources.yaml', () => {
    const ids = new Set(res.sources.map((s) => s.id));
    for (const c of Object.values(res.content?.cases ?? {})) {
      expect(c.sources.length).toBeGreaterThan(0);
      for (const s of c.sources) expect(ids.has(s), `${c.id} → ${s}`).toBe(true);
    }
  });

  it('every case has a debrief with rule, clues, "ak sa to už stalo" and a story clue (Red Line 4)', () => {
    for (const c of Object.values(res.content?.cases ?? {})) {
      expect(c.debrief.rule.length).toBeGreaterThan(0);
      expect(c.debrief.clues.length).toBeGreaterThan(0);
      expect(c.debrief.if_it_happened.length).toBeGreaterThan(0);
      expect(c.debrief.story_clue.text.length).toBeGreaterThan(0);
    }
  });

  it('J1 is ported from the prototype: 5 clues, 2 decoys, 3 options, 5 trust-or-trap items, 3 stars', () => {
    const j1 = res.content?.cases['j1-drak-zadarmo'];
    expect(j1).toBeDefined();
    if (!j1) return;
    const segs = j1.evidence.flatMap((e) => e.lines.flatMap((l) => l.segments));
    expect(segs.filter((s) => s.clue).length).toBe(5);
    expect(segs.filter((s) => s.decoy).length).toBe(2);
    expect(j1.decision.options).toHaveLength(3);
    expect(j1.trust_or_trap?.items).toHaveLength(5);
    expect(j1.stars).toHaveLength(3);
  });

  it('normalises shorthand strings into segments and lines', () => {
    const j1 = res.content?.cases['j1-drak-zadarmo'];
    const sender = j1?.evidence[0]?.lines[0];
    expect(sender?.style).toBe('sender');
    expect(sender?.segments[1]).toEqual({ text: ' · nový kontakt' });
  });
});

describe('cross-reference checks', () => {
  const tracks = res.content?.tracks ?? [];
  const junior = tracks.find((t) => t.id === 'junior');
  const j1 = res.content?.cases['j1-drak-zadarmo'];

  it('reports a missing source, an unknown speaker and impossible star rules', () => {
    if (!j1 || !junior) throw new Error('fixtures missing');
    const broken = structuredClone(j1);
    broken.sources = ['nope'];
    broken.intro.lines[0] = { speaker: 'stranger', text: 'Ahoj.' };
    broken.scan.min_clues = 9;
    broken.stars = [{ type: 'verify_best' }, { type: 'lock_up', max_errors: 1 }, { type: 'trust_or_trap', min: 99 }];
    broken.debrief.clues = [{ text: 'x', clue: 'no-such-clue' }];
    const issues = caseIssues(broken, junior, new Map(res.sources.map((s) => [s.id, s])));
    expect(issues.join('\n')).toMatch(/source "nope"/);
    expect(issues.join('\n')).toMatch(/speaker "stranger"/);
    expect(issues.join('\n')).toMatch(/min_clues/);
    expect(issues.join('\n')).toMatch(/verify_best needs a verify step/);
    expect(issues.join('\n')).toMatch(/lock_up needs a lock_up step/);
    expect(issues.join('\n')).toMatch(/trust_or_trap.min/);
    expect(issues.join('\n')).toMatch(/debrief clue "no-such-clue"/);
  });

  it('needs one Slovak or EU source of tier 1-3 (Red Line 6)', () => {
    if (!j1 || !junior) throw new Error('fixtures missing');
    const only = new Map([
      ['ch', { id: 'ch', publisher: 'p', title: 't', region: 'CH', tier: 2 }],
      ['news', { id: 'news', publisher: 'p', title: 't', region: 'SK', tier: 4 }],
    ]);
    expect(caseIssues({ ...j1, sources: ['ch', 'news'] }, junior, only).join('\n')).toMatch(/Red Line 6/);
  });

  it('reports ranks without a 0 entry', () => {
    if (!junior) throw new Error('fixtures missing');
    expect(trackIssues({ ...junior, ranks: [{ min_stars: 1, name: 'x' }] })[0]).toMatch(/min_stars: 0/);
  });

  it('the schema rejects a decision without exactly one best option', () => {
    if (!j1) throw new Error('fixtures missing');
    const raw = JSON.parse(JSON.stringify(j1)) as Record<string, unknown> & { decision: { options: { outcome: string }[] } };
    for (const o of raw.decision.options) o.outcome = 'ok';
    expect(CaseSchema.safeParse(raw).success).toBe(false);
  });

  it('the schema needs a drill (trust_or_trap or lock_up) and fills lock-up ranks from the order', () => {
    if (!j1) throw new Error('fixtures missing');
    const raw = JSON.parse(JSON.stringify(j1)) as Record<string, unknown>;
    delete raw['trust_or_trap'];
    raw['stars'] = [{ type: 'decision_best' }];
    expect(CaseSchema.safeParse(raw).success).toBe(false);
    raw['lock_up'] = { title: 'T', prompt: 'P', correct: 'C', steps: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }, { id: 'c', text: 'C' }] };
    const parsed = CaseSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.lock_up?.steps.map((s) => s.rank)).toEqual([1, 2, 3]);
  });

  it('the schema rejects unknown fields (typos)', () => {
    if (!j1) throw new Error('fixtures missing');
    expect(CaseSchema.safeParse({ ...JSON.parse(JSON.stringify(j1)), debreif: {} }).success).toBe(false);
  });
});

describe('help.yaml rules (Red Line 8)', () => {
  const help = res.content?.help;
  it('116 111 is the first entry (shown under every debrief)', () => {
    if (!help) throw new Error('help missing');
    expect(help.entries[0]?.phone?.replace(/\D/g, '')).toBe('116111');
    expect(helpIssues(help)).toEqual([]);
    const reordered = { ...help, entries: [...help.entries.slice(1), ...help.entries.slice(0, 1)] };
    expect(helpIssues(reordered).join('\n')).toMatch(/first entry/);
  });
  it('topic cards are optional, must point to 116 111 and may list contacts', () => {
    if (!help) throw new Error('help missing');
    const first = help.entries[0];
    if (!first) throw new Error('help empty');
    const topic = HelpEntrySchema.parse({ id: 'vydieranie', name: 'Vydieranie', topic: 'vydieranie', text: 'Nie je to tvoja chyba.' });
    expect(helpIssues({ ...help, entries: [...help.entries, topic] }).join('\n')).toMatch(/must point to 116 111/);
    expect(helpIssues({ ...help, entries: [...help.entries, { ...topic, contacts: [first.id] }] })).toEqual([]);
    expect(helpIssues({ ...help, entries: [...help.entries, { ...topic, text: 'Zavolaj na 116 111.' }] })).toEqual([]);
    expect(helpIssues({ ...help, entries: [...help.entries, { ...topic, contacts: ['nope'] }] }).join('\n')).toMatch(/"nope" is not an entry id/);
  });
});

describe('optional case fields', () => {
  const tracks = res.content?.tracks ?? [];
  const junior = tracks.find((t) => t.id === 'junior');
  const j1 = res.content?.cases['j1-drak-zadarmo'];
  const sources = new Map(res.sources.map((s) => [s.id, s]));

  it('recall: 2-3 options, exactly one correct', () => {
    const ok = { question: 'Ako pokračuje pravidlo?', options: [{ id: 'a', text: 'A', correct: true }, { id: 'b', text: 'B' }], feedback: 'Keď…, tak…' };
    expect(RecallSchema.safeParse(ok).success).toBe(true);
    expect(RecallSchema.safeParse({ ...ok, options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }] }).success).toBe(false);
    expect(RecallSchema.safeParse({ ...ok, options: [{ id: 'a', text: 'A', correct: true }] }).success).toBe(false);
  });

  it('risk needs a best or ok option that tells a trusted adult; pre_found ids must exist', () => {
    if (!j1 || !junior) throw new Error('fixtures missing');
    const risky = { ...j1, risk: ['stranger' as const], decision: { ...j1.decision, options: j1.decision.options.map((o) => ({ ...o, tells_adult: false })) } };
    expect(caseIssues(risky, junior, sources).join('\n')).toMatch(/tells_adult/);
    const fixed = { ...risky, decision: { ...risky.decision, options: risky.decision.options.map((o) => ({ ...o, tells_adult: o.outcome === 'best' })) } };
    expect(caseIssues(fixed, junior, sources)).toEqual([]);
    expect(caseIssues({ ...j1, scan: { ...j1.scan, pre_found: ['nope'] } }, junior, sources).join('\n')).toMatch(/pre_found "nope"/);
  });

  it('risk is required, and an explicit empty list is allowed (sceptic re-review minor 1)', () => {
    if (!j1) throw new Error('fixtures missing');
    const raw = JSON.parse(JSON.stringify(j1)) as Record<string, unknown>;
    delete raw['risk'];
    expect(CaseSchema.safeParse(raw).success).toBe(false);
    expect(CaseSchema.safeParse({ ...raw, risk: [] }).success).toBe(true);
  });
});

describe('about.yaml („O hre“)', () => {
  const about = res.content?.about;
  it('is loaded, names 116 111 and shows the issues address as plain text', () => {
    if (!about) throw new Error('about missing');
    expect(aboutIssues(about)).toEqual([]);
    expect(about.help_line).toMatch(/116 111/);
    const fb = about.sections.find((s) => s.address);
    expect(fb?.address).toBe('github.com/DALEOSyn/validion-kyberhra/issues');
    expect(fb?.address_note).toMatch(/verejné/);
  });
  it('rejects unknown keys, a help line without 116 111, duplicate ids and linked addresses', () => {
    if (!about) throw new Error('about missing');
    expect(AboutFileSchema.safeParse({ ...about, extra: 1 }).success).toBe(false);
    expect(AboutFileSchema.safeParse({ ...about, sections: [] }).success).toBe(false);
    expect(aboutIssues({ ...about, help_line: 'Povedz to dospelému.' }).join('\n')).toMatch(/116 111/);
    const first = about.sections[0];
    if (!first) throw new Error('about empty');
    expect(aboutIssues({ ...about, sections: [first, first] }).join('\n')).toMatch(/unique/);
    expect(aboutIssues({ ...about, sections: [{ ...first, address: 'https://x.example/' }] }).join('\n')).toMatch(/without a scheme/);
    expect(aboutIssues({ ...about, sections: [{ ...first, address: undefined, address_note: 'Verejné.' }] }).join('\n')).toMatch(/needs an address/);
  });
  it('the privacy text fits the build: „Odoslať“ is named only in builds that have it (when_send)', () => {
    if (!about) throw new Error('about missing');
    const all = (send: boolean) => about.sections.flatMap((s) => aboutLines(s.text, send)).join('\n');
    expect(all(true)).toContain('„Odoslať“');
    expect(all(false)).not.toContain('Odoslať');
    expect(all(false)).toContain('Hra ju sama nikam neodošle.');
    const priv = about.sections.find((s) => s.id === 'sukromie');
    expect(aboutLines(priv?.text ?? [], false)[0]).toBe('Hra o tebe nič nikam neodosiela. Neodosiela ani postup, ani nič o tvojom zariadení.');
    // the adult-only detail sits in the adults' section
    expect(aboutLines(priv?.text ?? [], false).join(' ')).not.toMatch(/skopírovať/);
    expect(aboutLines(about.sections.find((s) => s.id === 'pripomienky')?.text ?? [], false).join(' ')).toMatch(/skopírovať/);
  });
  it('aboutLines keeps plain lines and picks when_send lines by build; a section empty in one build is an issue', () => {
    const lines = ['a', { text: 'send', when_send: true }, { text: 'nosend', when_send: false }];
    expect(aboutLines(lines, true)).toEqual(['a', 'send']);
    expect(aboutLines(lines, false)).toEqual(['a', 'nosend']);
    expect(AboutFileSchema.safeParse({ title: 'O', help_line: '116 111', sections: [{ id: 'x', heading: 'X', text: [{ text: 'a', when_send: 'yes' }] }] }).success).toBe(false);
    expect(AboutFileSchema.safeParse({ title: 'O', help_line: '116 111', sections: [{ id: 'x', heading: 'X', text: [{ text: 'a', when_send: true, extra: 1 }] }] }).success).toBe(false);
    if (!about) throw new Error('about missing');
    const first = about.sections[0];
    if (!first) throw new Error('about empty');
    expect(aboutIssues({ ...about, sections: [{ ...first, text: [{ text: 'a', when_send: true }] }] }).join('\n')).toMatch(/no paragraph in a build without/);
  });
});
