/** Pure scoring rules: stars per case, rank per track. */
import type { Case, Rank, StarRule } from '../content/schema.ts';

/** What the player did in one play of a case. */
export interface CaseRun {
  found: string[];
  /** Keys of the decoys tapped (each counts once). */
  decoys: string[];
  decision: string | null;
  /** The first verify pick (only the first pick scores). */
  verify: string | null;
  /** One entry per trust-or-trap item answered: true when right. */
  trustTrap: boolean[];
  /** Wrong taps in the lock-up; null until the lock-up is finished. */
  lockUpErrors: number | null;
}

export const emptyRun = (): CaseRun => ({ found: [], decoys: [], decision: null, verify: null, trustTrap: [], lockUpErrors: null });

export function bestOptionId(options: { id: string; outcome: string }[]): string | undefined {
  return options.find((o) => o.outcome === 'best')?.id;
}

function decisionBest(c: Case, run: CaseRun): boolean {
  return run.decision !== null && run.decision === bestOptionId(c.decision.options);
}

function verifyBest(c: Case, run: CaseRun): boolean {
  return !!c.verify && run.verify !== null && run.verify === bestOptionId(c.verify.options);
}

export function ruleMet(c: Case, rule: StarRule, run: CaseRun): boolean {
  switch (rule.type) {
    case 'clues':
      return new Set(run.found).size >= rule.min && (rule.max_decoys === undefined || new Set(run.decoys).size <= rule.max_decoys);
    case 'decision_best':
      return decisionBest(c, run);
    case 'verify_best':
      return verifyBest(c, run);
    case 'decision_and_verify_best':
      return decisionBest(c, run) && verifyBest(c, run);
    case 'trust_or_trap':
      return run.trustTrap.filter(Boolean).length >= rule.min;
    case 'lock_up':
      return !!c.lock_up && run.lockUpErrors !== null && run.lockUpErrors <= rule.max_errors;
  }
  return false;
}

export function computeStars(c: Case, run: CaseRun): number {
  return c.stars.filter((r) => ruleMet(c, r, run)).length;
}

export function maxStars(c: Case): number {
  return c.stars.length;
}

/** The highest rank whose min_stars the total reaches. Ranks are listed with rising min_stars. */
export function rankFor(ranks: Rank[], totalStars: number): Rank {
  let best = ranks[0];
  for (const r of ranks) if (totalStars >= r.min_stars) best = r;
  if (!best) throw new Error('a track needs at least one rank');
  return best;
}

/** Default label of a star rule, shown in the debrief checklist. */
export function ruleLabel(rule: StarRule): string {
  if (rule.label) return rule.label;
  switch (rule.type) {
    case 'clues':
      return rule.max_decoys === undefined ? `Nájsť aspoň ${rule.min} stopy` : `Nájsť aspoň ${rule.min} stopy a označiť najviac ${rule.max_decoys} neutrálne detaily`;
    case 'decision_best':
      return 'Vybrať najbezpečnejšie riešenie';
    case 'verify_best':
      return 'Overiť to správnou cestou na prvý raz';
    case 'decision_and_verify_best':
      return 'Najbezpečnejšie riešenie a správne overenie na prvý raz';
    case 'trust_or_trap':
      return `Aspoň ${rule.min} správne vo výcviku`;
    case 'lock_up':
      return rule.max_errors === 0 ? 'Zoradiť kroky bez chyby' : `Zoradiť kroky, najviac ${rule.max_errors} ${rule.max_errors === 1 ? 'chyba' : rule.max_errors < 5 ? 'chyby' : 'chýb'}`;
  }
  return '';
}
