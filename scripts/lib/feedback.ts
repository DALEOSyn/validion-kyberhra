/**
 * Pilot feedback captured as GitHub issues (issue forms in .github/ISSUE_TEMPLATE/), exported into the repository
 * as docs/feedback/feedback.csv and docs/feedback/SUMMARY.md by scripts/feedback-export.ts. See docs/FEEDBACK.md.
 * Pure functions, unit-tested in tests/unit/feedback.test.ts. The game itself sends nothing (Red Line 7).
 */

/** Every feedback issue carries this label; the form label says which kind it is. */
export const FEEDBACK_LABEL = 'spatna-vazba';
/** A maintainer adds this label to keep an issue out of the export (personal data, spam, off-topic). */
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
  children: 'Počet detí v hodine',
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

/** Splits a rendered issue-form body ("### Label\n\nvalue") into label → value. Empty answers become "". */
export function parseFormBody(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  const parts = body.replace(/\r\n/g, '\n').split(/^### /m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf('\n');
    const label = (nl < 0 ? part : part.slice(0, nl)).trim();
    const value = (nl < 0 ? '' : part.slice(nl + 1)).trim();
    out[label] = value === NO_RESPONSE ? '' : value;
  }
  return out;
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

/** Feedback issues to export: labelled, not hidden, not pull requests. */
export function toRows(issues: Issue[]): Row[] {
  return issues
    .filter((i) => !i.pull_request)
    .filter((i) => {
      const l = labelNames(i);
      return l.includes(FEEDBACK_LABEL) && !l.includes(HIDE_LABEL);
    })
    .map((i) => {
      const fields = parseFormBody(i.body ?? '');
      delete fields[F.privacy];
      return {
        number: i.number,
        kind: kindOf(labelNames(i)),
        state: i.state,
        created: i.created_at.slice(0, 10),
        cases: casesIn(fields[F.cases] ?? fields[F.case] ?? ''),
        severity: fields[F.severity] ?? '',
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
  out.push(`Vygenerované ${generatedAt} skriptom \`scripts/feedback-export.ts\` z issues s označením \`${FEEDBACK_LABEL}\`. Needitujte ručne.`, '');
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
        out.push(`- #${r.number} · ${sev || 'bez závažnosti'} · ${r.cases.join(', ') || '—'} · ${r.fields[F.area] ?? ''}`);
      }
    }
  }
  return out.join('\n') + '\n';
}
