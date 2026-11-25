/** The order of a case's stages. Optional stages (verify, lock_up) are skipped when the case has none. */
import type { Case } from '../content/schema.ts';

export type Stage = 'intro' | 'scan' | 'decision' | 'decision-result' | 'verify' | 'verify-result' | 'trust-or-trap' | 'lock-up' | 'debrief' | 'arc-scene';

export function stagesFor(c: Case): Stage[] {
  const s: Stage[] = ['intro', 'scan', 'decision', 'decision-result'];
  if (c.verify) s.push('verify', 'verify-result');
  if (c.trust_or_trap) s.push('trust-or-trap');
  if (c.lock_up) s.push('lock-up');
  s.push('debrief');
  if (c.arc_scene) s.push('arc-scene');
  return s;
}

export function nextStage(c: Case, current: Stage): Stage {
  const s = stagesFor(c);
  const i = s.indexOf(current);
  return s[Math.min(i + 1, s.length - 1)] ?? 'debrief';
}

/** All clue ids of a case, in reading order. */
export function clueIds(c: Case): string[] {
  const out: string[] = [];
  for (const ev of c.evidence) for (const l of ev.lines) for (const seg of l.segments) if ('clue' in seg && seg.clue) out.push(seg.clue.id);
  return out;
}

/**
 * Deterministic shuffle (seeded by the case id) that never returns the original order, so the lock-up puzzle
 * is the same for a whole class and is never solved before it starts.
 */
export function shuffledOrder<T>(items: T[], seed: string): T[] {
  if (items.length < 2) return [...items];
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  if (out.every((x, i) => x === items[i])) out.push(out.shift() as T);
  return out;
}

/** Lock-up (GDD M4a) state: placed step ids in slot order, distractors already rejected, wrong taps. */
export interface LockUpState {
  placed: string[];
  rejected: string[];
  errors: number;
  /** Wrong taps since the last correct placement (after 3, the game highlights a right card). */
  slotErrors: number;
}

export const emptyLockUp = (): LockUpState => ({ placed: [], rejected: [], errors: 0, slotErrors: 0 });

export interface LockUpData {
  steps: { id: string; rank: number; hint?: string | undefined }[];
  distractors: { id: string; hint: string }[];
  wrong_order_hint: string;
}

export type LockUpTap = { kind: 'placed'; done: boolean } | { kind: 'early'; hint: string } | { kind: 'distractor'; hint: string } | { kind: 'ignored' };

/** The steps that may go into the next slot: unplaced steps with the lowest remaining rank. */
export function nextAllowed(l: LockUpData, st: LockUpState): string[] {
  const left = l.steps.filter((s) => !st.placed.includes(s.id));
  const low = Math.min(...left.map((s) => s.rank));
  return left.filter((s) => s.rank === low).map((s) => s.id);
}

/** Applies one tap on a card. Pure: returns the new state and what to tell the player. */
export function tapLockUp(l: LockUpData, st: LockUpState, id: string): [LockUpState, LockUpTap] {
  if (st.placed.includes(id) || st.rejected.includes(id)) return [st, { kind: 'ignored' }];
  const distractor = l.distractors.find((d) => d.id === id);
  if (distractor) return [{ ...st, rejected: [...st.rejected, id], errors: st.errors + 1, slotErrors: st.slotErrors + 1 }, { kind: 'distractor', hint: distractor.hint }];
  const step = l.steps.find((s) => s.id === id);
  if (!step) return [st, { kind: 'ignored' }];
  if (nextAllowed(l, st).includes(id)) {
    const placed = [...st.placed, id];
    return [{ ...st, placed, slotErrors: 0 }, { kind: 'placed', done: placed.length === l.steps.length }];
  }
  return [{ ...st, errors: st.errors + 1, slotErrors: st.slotErrors + 1 }, { kind: 'early', hint: step.hint ?? l.wrong_order_hint }];
}
