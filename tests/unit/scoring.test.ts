import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import { loadContent } from '../../scripts/lib/content.ts';
import { computeStars, emptyRun, rankFor, ruleLabel } from '../../src/engine/scoring.ts';
import { clueIds, emptyLockUp, nextAllowed, nextStage, shuffledOrder, stagesFor, tapLockUp } from '../../src/engine/flow.ts';

const content = loadContent(resolve(import.meta.dirname, '../../content')).content;
const j1 = content?.cases['j1-drak-zadarmo'];
const t1 = content?.cases['t1-lahka-brigada'];
const t4 = content?.cases['t4-nove-cislo'];
if (!j1 || !t1 || !t4) throw new Error('content missing');

describe('stars', () => {
  it('gives 0 for an empty run and 3 for a perfect J1 run', () => {
    expect(computeStars(j1, emptyRun())).toBe(0);
    const run = { ...emptyRun(), found: clueIds(j1), decision: 'verify', trustTrap: [true, true, true, true, true] };
    expect(computeStars(j1, run)).toBe(3);
  });

  it('applies each J1 rule on its own (clues >= 4, best decision, trust-or-trap >= 4)', () => {
    expect(computeStars(j1, { ...emptyRun(), found: ['sender', 'prize', 'hurry'] })).toBe(0);
    expect(computeStars(j1, { ...emptyRun(), found: ['sender', 'prize', 'hurry', 'link'] })).toBe(1);
    expect(computeStars(j1, { ...emptyRun(), decision: 'ask' })).toBe(0);
    expect(computeStars(j1, { ...emptyRun(), decision: 'verify' })).toBe(1);
    expect(computeStars(j1, { ...emptyRun(), trustTrap: [true, true, true, false, true] })).toBe(1);
    expect(computeStars(j1, { ...emptyRun(), trustTrap: [true, true, true, false, false] })).toBe(0);
  });

  it('counts a clue found twice once', () => {
    expect(computeStars(j1, { ...emptyRun(), found: ['sender', 'sender', 'sender', 'sender'] })).toBe(0);
  });

  it('scores decoys, decision + first verify pick, and lock-up errors (teen T1)', () => {
    const base = { ...emptyRun(), found: clueIds(t1), decision: 'refuse', verify: 'ask-in-person', lockUpErrors: 1 };
    expect(computeStars(t1, base)).toBe(3);
    expect(computeStars(t1, { ...base, decoys: ['a', 'b', 'c'] })).toBe(2);
    expect(computeStars(t1, { ...base, decoys: ['a', 'a', 'b'] })).toBe(3);
    expect(computeStars(t1, { ...base, verify: 'followers' })).toBe(2);
    expect(computeStars(t1, { ...base, decision: 'contract' })).toBe(2);
    expect(computeStars(t1, { ...base, lockUpErrors: 2 })).toBe(2);
    expect(computeStars(t1, { ...base, lockUpErrors: null })).toBe(2);
  });

  it('has a readable default label for every rule', () => {
    expect(ruleLabel({ type: 'clues', min: 3 })).toMatch(/3/);
    expect(ruleLabel({ type: 'lock_up', max_errors: 1, label: 'X' })).toBe('X');
    expect(ruleLabel({ type: 'lock_up', max_errors: 2 })).toMatch(/2 chyby/);
  });
});

describe('ranks', () => {
  const ranks = [
    { min_stars: 0, name: 'nováčik' },
    { min_stars: 2, name: 'detektív' },
    { min_stars: 6, name: 'hlavný detektív' },
  ];
  it('picks the highest rank reached', () => {
    expect(rankFor(ranks, 0).name).toBe('nováčik');
    expect(rankFor(ranks, 1).name).toBe('nováčik');
    expect(rankFor(ranks, 2).name).toBe('detektív');
    expect(rankFor(ranks, 99).name).toBe('hlavný detektív');
  });
});

describe('flow', () => {
  it('skips optional stages', () => {
    expect(stagesFor(j1)).toEqual(['intro', 'scan', 'decision', 'decision-result', 'trust-or-trap', 'debrief']);
    expect(stagesFor(t1)).not.toContain('trust-or-trap');
    expect(stagesFor(t1).at(-1)).toBe('debrief');
    expect(stagesFor(t4).at(-1)).toBe('arc-scene');
    expect(stagesFor(t4)).toContain('trust-or-trap');
    expect(stagesFor(t1)).toContain('verify');
    expect(stagesFor(t1)).toContain('lock-up');
    expect(nextStage(j1, 'decision-result')).toBe('trust-or-trap');
    expect(nextStage(j1, 'debrief')).toBe('debrief');
  });

  it('shuffles deterministically and never into the solved order', () => {
    const ids = ['a', 'b', 'c', 'd'];
    const s = shuffledOrder(ids, 't1-lahka-brigada');
    expect(s).toEqual(shuffledOrder(ids, 't1-lahka-brigada'));
    expect(s).not.toEqual(ids);
    expect([...s].sort()).toEqual(ids);
    for (const seed of ['a', 'b', 'c', 'x', 'yy', 'zzz']) expect(shuffledOrder(['p', 'q', 'r'], seed)).not.toEqual(['p', 'q', 'r']);
  });

  it('lock-up: places by rank, treats equal ranks as interchangeable, counts errors and distractors', () => {
    const l = {
      steps: [
        { id: 'a', rank: 1 },
        { id: 'b', rank: 2, hint: 'b later' },
        { id: 'c', rank: 2 },
      ],
      distractors: [{ id: 'x', hint: 'not this' }],
      wrong_order_hint: 'later',
    };
    let st = emptyLockUp();
    let r;
    [st, r] = tapLockUp(l, st, 'b');
    expect(r).toEqual({ kind: 'early', hint: 'b later' });
    [st, r] = tapLockUp(l, st, 'x');
    expect(r).toEqual({ kind: 'distractor', hint: 'not this' });
    [st, r] = tapLockUp(l, st, 'x');
    expect(r.kind).toBe('ignored');
    expect(st.errors).toBe(2);
    [st, r] = tapLockUp(l, st, 'a');
    expect(r).toEqual({ kind: 'placed', done: false });
    expect(st.slotErrors).toBe(0);
    expect(nextAllowed(l, st).sort()).toEqual(['b', 'c']);
    [st] = tapLockUp(l, st, 'c');
    [st, r] = tapLockUp(l, st, 'b');
    expect(r).toEqual({ kind: 'placed', done: true });
    expect(st.placed).toEqual(['a', 'c', 'b']);
    expect(st.errors).toBe(2);
  });
});
