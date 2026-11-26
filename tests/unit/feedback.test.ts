import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { CASE_OPTIONS, F, FEEDBACK_LABEL, HIDE_LABEL, type Issue, KINDS, parseFormBody, toCsv, toRows, toSummary, WHOLE_GAME } from '../../scripts/lib/feedback.ts';

const root = resolve(import.meta.dirname, '../..');
const formDir = resolve(root, '.github/ISSUE_TEMPLATE');

interface FormItem { type: string; id?: string; attributes: { label?: string; options?: (string | { label: string; required?: boolean })[] } }
interface Form { name: string; labels: string[]; body: FormItem[] }
const forms: Form[] = readdirSync(formDir).filter((f) => f !== 'config.yml' && f.endsWith('.yml')).map((f) => parse(readFileSync(resolve(formDir, f), 'utf8')) as Form);

const body = (pairs: [string, string][]) => pairs.map(([k, v]) => `### ${k}\n\n${v}`).join('\n\n');
const issue = (n: number, labels: string[], b: string, state = 'open'): Issue => ({ number: n, title: `#${n}`, body: b, state, created_at: '2026-12-11T09:00:00Z', html_url: `https://example.test/${n}`, labels: labels.map((name) => ({ name })) });

describe('issue forms', () => {
  it('there is one form per feedback kind, each labelled spatna-vazba + its kind', () => {
    expect(forms.map((f) => f.name).sort()).toEqual(Object.values(KINDS).sort());
    for (const f of forms) {
      expect(f.labels).toContain(FEEDBACK_LABEL);
      expect(f.labels.filter((l) => l in KINDS)).toHaveLength(1);
    }
  });
  it('use only the question labels the exporter knows, and end with a required privacy check', () => {
    const known = new Set<string>(Object.values(F));
    for (const f of forms) {
      for (const item of f.body.filter((i) => i.type !== 'markdown')) expect(known.has(item.attributes.label ?? '')).toBe(true);
      const last = f.body.at(-1);
      expect(last?.attributes.label).toBe(F.privacy);
      expect(last?.attributes.options?.every((o) => typeof o === 'object' && o.required)).toBe(true);
    }
  });
  it('offer exactly the game cases (and "Celá hra" where one case is picked)', () => {
    for (const f of forms) {
      for (const item of f.body.filter((i) => i.attributes.label === F.cases || i.attributes.label === F.case)) {
        const opts = (item.attributes.options ?? []).filter((o) => o !== WHOLE_GAME);
        expect(opts).toEqual([...CASE_OPTIONS]);
      }
    }
  });
  it('the case list matches content/cases titles', () => {
    for (const opt of CASE_OPTIONS) {
      const [code, ...title] = opt.split(' ');
      const track = code?.startsWith('J') ? 'junior' : 'teen';
      const file = readdirSync(resolve(root, 'content/cases', track)).find((f) => f.startsWith(`${code?.toLowerCase()}-`));
      expect(file, opt).toBeDefined();
      const c = parse(readFileSync(resolve(root, 'content/cases', track, file ?? ''), 'utf8')) as { title: string };
      expect(c.title).toBe(title.join(' '));
    }
  });
});

describe('export', () => {
  it('parses an issue-form body, empty answers become ""', () => {
    expect(parseFormBody(body([[F.track, 'Ozvena (13–15 rokov)'], [F.stuck, '_No response_'], [F.fun, 'Áno, veľmi: 12\nTrochu: 8']]))).toEqual({
      [F.track]: 'Ozvena (13–15 rokov)',
      [F.stuck]: '',
      [F.fun]: 'Áno, veľmi: 12\nTrochu: 8',
    });
  });
  it('keeps labelled issues, drops hidden ones, pull requests and the privacy box', () => {
    const rows = toRows([
      issue(3, [FEEDBACK_LABEL, 'lekcia'], body([[F.cases, 'J1 Drak zadarmo, J2 Kód pre kamaráta'], [F.minutes, '8'], [F.privacy, '- [X] ok']])),
      issue(4, [FEEDBACK_LABEL, 'recenzia', HIDE_LABEL], body([[F.case, 'Celá hra']])),
      issue(5, ['bug'], ''),
      { ...issue(6, [FEEDBACK_LABEL], ''), pull_request: {} },
      issue(2, [FEEDBACK_LABEL, 'recenzia'], body([[F.case, 'Celá hra'], [F.severity, 'Dôležité']]), 'closed'),
    ]);
    expect(rows.map((r) => [r.number, r.kind, r.cases])).toEqual([[2, 'recenzia', [WHOLE_GAME]], [3, 'lekcia', ['J1', 'J2']]]);
    expect(rows[1]?.fields[F.privacy]).toBeUndefined();
  });
  it('writes CSV that a spreadsheet will not run as a formula', () => {
    const rows = toRows([issue(1, [FEEDBACK_LABEL, 'pripomienka'], body([[F.comment, '=HYPERLINK("x")'], [F.device, 'Android, Chrome']]))]);
    const csv = toCsv(rows);
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
    expect(csv).toContain('"Android, Chrome"');
    expect(csv.split('\n')[0]).toMatch(/^issue,druh,stav,datum,pripady,/);
  });
  it('summarises counts, median case length and open expert items', () => {
    const rows = toRows([
      issue(1, [FEEDBACK_LABEL, 'lekcia'], body([[F.cases, 'J1 Drak zadarmo'], [F.minutes, '7']])),
      issue(2, [FEEDBACK_LABEL, 'lekcia'], body([[F.cases, 'J1 Drak zadarmo'], [F.minutes, '9,5']])),
      issue(3, [FEEDBACK_LABEL, 'recenzia'], body([[F.case, 'T3 Bez signálu'], [F.severity, 'Blokuje vydanie'], [F.area, 'Fakty a zdroje']])),
    ]);
    const md = toSummary(rows, '2026-12-20');
    expect(md).toContain('| J1 | 2 | 0 | 0 |');
    expect(md).toContain('medián 8.25 min z 2 hodín');
    expect(md).toContain('- #3 · Blokuje vydanie · T3 · Fakty a zdroje');
  });
});
