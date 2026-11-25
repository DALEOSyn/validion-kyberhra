import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { CaseSchema } from '../../src/content/schema.ts';
import { caseIssues, loadContent } from '../../scripts/lib/content.ts';
import { denyMatchers, lintValue, parseDenylist } from '../../scripts/lib/redline.ts';

const root = resolve(import.meta.dirname, '../..');

describe('docs/CONTENT_SCHEMA.md', () => {
  it('its complete example (§12) is a valid, red-line-clean case', () => {
    const md = readFileSync(resolve(root, 'docs/CONTENT_SCHEMA.md'), 'utf8');
    const block = md.split('## 12.')[1]?.split('```yaml\n')[1]?.split('```')[0] ?? '';
    const raw: unknown = parse(block);
    const r = CaseSchema.safeParse(raw);
    expect(r.error?.issues ?? []).toEqual([]);
    const res = loadContent(resolve(root, 'content'));
    const junior = res.content?.tracks.find((t) => t.id === 'junior');
    if (!r.data) throw new Error('example did not parse');
    expect(caseIssues(r.data, junior, new Map(res.sources.map((s) => [s.id, s])))).toEqual([]);
    const m = denyMatchers(parseDenylist(readFileSync(resolve(root, 'scripts/redline-denylist.txt'), 'utf8')));
    expect(lintValue(raw, m, false)).toEqual([]);
  });
});
