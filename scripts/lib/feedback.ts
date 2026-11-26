/**
 * Pilot feedback captured as GitHub issues (issue forms in .github/ISSUE_TEMPLATE/), exported into the repository
 * as docs/feedback/feedback.csv and docs/feedback/SUMMARY.md by scripts/feedback-export.ts. See docs/FEEDBACK.md.
 * Pure functions, unit-tested in tests/unit/feedback.test.ts. The game itself sends nothing (Red Line 7).
 */

/** Every feedback issue carries this label; the form label says which kind it is. */
export const FEEDBACK_LABEL = 'spatna-vazba';
/** A maintainer adds this label after checking an issue for personal data. Only approved issues are exported. */
export const APPROVED_LABEL = 'schvalene';
/** A maintainer adds this label to keep an issue out of the export even if approved (personal data, spam, off-topic). */
export const HIDE_LABEL = 'skryt';

export const KINDS = {
  lekcia: 'Pilotná hodina (učiteľ)',
  recenzia: 'Odborná recenzia',
  pripomienka: 'Pripomienka alebo chyba',
} as const;
export type Kind = keyof typeof KINDS;

/** The question labels used in the issue forms. Tests check the forms use exactly these. */
export const F = {
  track: 'Trať',
  cases: 'Prípady',
  case: 'Prípad',
  children: 'Počet detí na hodine',
  finished: 'Koľko detí dokončilo aspoň jeden prípad',
  minutes: 'Koľko minút trval jeden prípad (zvyčajne)',
  fun: 'Bavilo vás to? (počet hlasov)',
  clear: 'Bolo to zrozumiteľné? (počet hlasov)',
  stuck: 'Kde sa deti zasekli',
  quotes: 'Čo povedali deti (bez mien)',
  upset: 'Bol niekto rozrušený',
  again: 'Použili by ste hru znova',
  role: 'Odbornosť',
  area: 'Oblasť',
  severity: 'Závažnosť',
  where: 'Kde presne (citát alebo obrazovka)',
  comment: 'Pripomienka',
  suggestion: 'Návrh zmeny',
  type: 'Typ',
  device: 'Zariadenie a prehliadač',
  privacy: 'Ochrana súkromia',
} as const;

/** Case titles as offered in the forms' dropdowns (content/cases/<track>/<id>.yaml). */
export const CASE_OPTIONS = [
  'J1 Drak zadarmo',
  'J2 Kód pre kamaráta',
  'J3 Zámok na účte',
  'J4 Kričiaca obrazovka',
  'T1 Ľahká brigáda',
  'T2 Cheat zadarmo',
  'T3 Bez signálu',
  'T4 Nové číslo',
] as const;
export const WHOLE_GAME = 'Celá hra';
export const AREA_OPTIONS = ['Text a jazyk', 'Vek a náročnosť', 'Tón a emočná bezpečnosť', 'Fakty a zdroje', 'Pomoc a kontakty', 'Ovládanie a prístupnosť'] as const;
export const SEVERITY_OPTIONS = ['Blokuje vydanie', 'Dôležité', 'Drobnosť'] as const;

export interface Issue {
  number: number;
  title: string;
  body: string | null;
  state: string;
  created_at: string;
  html_url: string;
  labels: (string | { name?: string })[];
  pull_request?: unknown;
}

export interface Row {
  number: number;
  kind: Kind | 'ina';
  state: string;
  created: string;
  cases: string[];
  severity: string;
  fields: Record<string, string>;
  url: string;
}

const NO_RESPONSE = '_No response_';

/**
 * Splits a rendered issue-form body ("### Label\n\nvalue", fields in form order) into label → value. `order` is the
 * form's question labels in order. Each header is taken as the LAST "### Label" line before the next field's header,
 * so a "### " line typed inside an answer can never move another field's value. Empty answers become "".
 */
export function parseFormBody(body: string, order: readonly string[]): Record<string, string> {
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const found: [string, number][] = [];
  let limit = lines.length;
  for (const label of [...order].reverse()) {
    let at = -1;
    for (let i = limit - 1; i >= 0; i--) if (lines.at(i)?.trimEnd() === `### ${label}`) { at = i; break; }
    if (at >= 0) { found.unshift([label, at]); limit = at; }
  }
  const out: Record<string, string> = {};
  found.forEach(([label, at], k) => {
    const value = lines.slice(at + 1, found.at(k + 1)?.[1] ?? lines.length).join('\n').trim();
    out[label] = value === NO_RESPONSE ? '' : value;
  });
  return out;
}

/** Question labels in form order, per feedback kind, read from the issue forms (form `labels` name the kind). */
export function formOrders(forms: { labels?: string[]; body: { type: string; attributes?: { label?: string } }[] }[]): Partial<Record<Kind, string[]>> {
  const out: Partial<Record<Kind, string[]>> = {};
  for (const f of forms) {
    const kind = kindOf(f.labels ?? []);
    if (kind !== 'ina') out[kind] = f.body.filter((b) => b.type !== 'markdown').map((b) => b.attributes?.label ?? '');
  }
  return out;
}

/** Keeps only answers that are options of a dropdown (comma-separated for multi-select); free text is dropped. */
export function onlyOptions(value: string, options: readonly string[]): string {
  return value.split(/,\s*/).map((v) => v.trim()).filter((v) => options.includes(v)).join(', ');
}

function labelNames(issue: Issue): string[] {
  return issue.labels.map((l) => (typeof l === 'string' ? l : (l.name ?? '')));
}

export function kindOf(labels: string[]): Kind | 'ina' {
  for (const k of Object.keys(KINDS) as Kind[]) if (labels.includes(k)) return k;
  return 'ina';
}

/** Case codes (J1…T4, or "Celá hra") named in a dropdown answer. */
export function casesIn(value: string): string[] {
  if (!value) return [];
  return value
    .split(/,\s*/)
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => (v === WHOLE_GAME ? WHOLE_GAME : (v.split(' ')[0] ?? v)));
}

/** Feedback issues to export: labelled, approved by a maintainer, not hidden, not pull requests. */
export function toRows(issues: Issue[], orders: Partial<Record<Kind, string[]>>): Row[] {
  return issues
    .filter((i) => !i.pull_request)
    .filter((i) => {
      const l = labelNames(i);
      return l.includes(FEEDBACK_LABEL) && l.includes(APPROVED_LABEL) && !l.includes(HIDE_LABEL);
    })
    .map((i) => {
      const kind = kindOf(labelNames(i));
      const fields = parseFormBody(i.body ?? '', (kind === 'ina' ? undefined : orders[kind]) ?? []);
      delete fields[F.privacy];
      return {
        number: i.number,
        kind,
        state: i.state,
        created: i.created_at.slice(0, 10),
        cases: casesIn(onlyOptions(fields[F.cases] ?? fields[F.case] ?? '', [...CASE_OPTIONS, WHOLE_GAME])),
        severity: onlyOptions(fields[F.severity] ?? '', SEVERITY_OPTIONS),
        fields,
        url: i.html_url,
      };
    })
    .sort((a, b) => a.number - b.number);
}

function csvCell(s: string): string {
  // Leading = + - @ would run as a formula in a spreadsheet; prefix them so the cell stays text.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** One CSV row per issue: fixed columns first, then every form question in the order of F. */
export function toCsv(rows: Row[]): string {
  const questions = Object.values(F).filter((q) => q !== F.privacy);
  const head = ['issue', 'druh', 'stav', 'datum', 'pripady', ...questions];
  const lines = [head.map(csvCell).join(',')];
  for (const r of rows) {
    lines.push([String(r.number), r.kind, r.state, r.created, r.cases.join(' '), ...questions.map((q) => r.fields[q] ?? '')].map(csvCell).join(','));
  }
  return lines.join('\n') + '\n';
}

/** A short Markdown overview for triage: counts per kind and case, and open expert items by severity. */
export function toSummary(rows: Row[], generatedAt: string): string {
  const count = (pred: (r: Row) => boolean) => rows.filter(pred).length;
  const out: string[] = [];
  out.push('# Spätná väzba z pilotu', '');
  out.push(`Vygenerované ${generatedAt} skriptom \`scripts/feedback-export.ts\` zo schválených issues (\`${FEEDBACK_LABEL}\` + \`${APPROVED_LABEL}\`). Needitujte ručne. Voľný text je iba v \`feedback.csv\`.`, '');
  out.push('| Druh | Spolu | Otvorené |', '| --- | --- | --- |');
  for (const k of Object.keys(KINDS) as Kind[]) out.push(`| ${KINDS[k]} | ${count((r) => r.kind === k)} | ${count((r) => r.kind === k && r.state === 'open')} |`);
  out.push('', '| Prípad | Hodiny | Recenzie | Pripomienky |', '| --- | --- | --- | --- |');
  for (const c of [...CASE_OPTIONS.map((o) => o.split(' ')[0] ?? o), WHOLE_GAME]) {
    const n = (k: Kind) => count((r) => r.kind === k && r.cases.includes(c));
    out.push(`| ${c} | ${n('lekcia')} | ${n('recenzia')} | ${n('pripomienka')} |`);
  }
  const lessons = rows.filter((r) => r.kind === 'lekcia');
  const mins = lessons.map((r) => Number.parseFloat((r.fields[F.minutes] ?? '').replace(',', '.'))).filter((m) => Number.isFinite(m));
  if (mins.length) {
    const sorted = [...mins].sort((a, b) => a - b);
    const median = sorted.length % 2 ? (sorted.at(sorted.length >> 1) ?? 0) : ((sorted.at((sorted.length >> 1) - 1) ?? 0) + (sorted.at(sorted.length >> 1) ?? 0)) / 2;
    out.push('', `Dĺžka prípadu podľa učiteľov: medián ${median} min z ${mins.length} hodín (cieľ 7–9 min).`);
  }
  const open = rows.filter((r) => r.state === 'open' && r.kind === 'recenzia');
  if (open.length) {
    out.push('', '## Otvorené odborné pripomienky', '');
    for (const sev of ['Blokuje vydanie', 'Dôležité', 'Drobnosť', '']) {
      for (const r of open.filter((x) => x.severity === sev)) {
        out.push(`- #${r.number} · ${sev || 'bez závažnosti'} · ${r.cases.join(', ') || '—'} · ${onlyOptions(r.fields[F.area] ?? '', AREA_OPTIONS)}`);
      }
    }
  }
  return out.join('\n') + '\n';
}
