import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import { caseIssues, loadContent, trackIssues } from '../../scripts/lib/content.ts';
import { CaseSchema } from '../../src/content/schema.ts';

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
