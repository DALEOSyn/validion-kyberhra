/**
 * Progress: best stars per case and closed cases, per track. Lives in localStorage only (Red Line 7),
 * behind a versioned key. Every storage call is wrapped: private mode or a full disk must never break play.
 */
import type { Track, TrackId } from '../content/schema.ts';

export const STORAGE_KEY = 'stopa.progress.v1';
const VERSION = 1;

export interface CaseProgress {
  stars: number;
  closed: boolean;
}

export interface Progress {
  version: 1;
  cases: Record<string, CaseProgress>;
  lastTrack: TrackId | null;
  sound: boolean;
}

export const emptyProgress = (): Progress => ({ version: VERSION, cases: {}, lastTrack: null, sound: false });

/** Minimal storage surface, so tests can pass a fake or a throwing one. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function defaultStorage(): StorageLike | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

/** Parses a stored value; anything unknown or malformed falls back to empty progress. */
export function parseProgress(raw: string | null): Progress {
  if (!raw) return emptyProgress();
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return emptyProgress();
    const d = data as Record<string, unknown>;
    if (d['version'] !== VERSION) return emptyProgress();
    const out = emptyProgress();
    const cases = d['cases'];
    if (typeof cases === 'object' && cases !== null) {
      for (const [id, v] of Object.entries(cases as Record<string, unknown>)) {
        if (typeof v !== 'object' || v === null) continue;
        const cp = v as Record<string, unknown>;
        const stars = typeof cp['stars'] === 'number' && Number.isFinite(cp['stars']) ? Math.max(0, Math.min(4, Math.floor(cp['stars']))) : 0;
        out.cases[id] = { stars, closed: cp['closed'] === true };
      }
    }
    if (d['lastTrack'] === 'junior' || d['lastTrack'] === 'teen') out.lastTrack = d['lastTrack'];
    out.sound = d['sound'] === true;
    return out;
  } catch {
    return emptyProgress();
  }
}

export function loadProgress(storage: StorageLike | null = defaultStorage()): Progress {
  if (!storage) return emptyProgress();
  try {
    return parseProgress(storage.getItem(STORAGE_KEY));
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(p: Progress, storage: StorageLike | null = defaultStorage()): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(p));
    return true;
  } catch {
    return false;
  }
}

export function clearProgress(storage: StorageLike | null = defaultStorage()): Progress {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to do: progress simply stays in memory as empty */
  }
  return emptyProgress();
}

/** Closes a case, keeping the best star count. Returns a new object. */
export function recordCase(p: Progress, caseId: string, stars: number): Progress {
  const prev = p.cases[caseId];
  return { ...p, cases: { ...p.cases, [caseId]: { stars: Math.max(prev?.stars ?? 0, stars), closed: true } } };
}

export function trackStars(p: Progress, track: Track): number {
  return track.cases.reduce((sum, id) => sum + (p.cases[id]?.stars ?? 0), 0);
}

/** The first case is always open; each next case opens when the previous one is closed. */
export function isUnlocked(p: Progress, track: Track, caseId: string): boolean {
  const i = track.cases.indexOf(caseId);
  if (i < 0) return false;
  if (i === 0) return true;
  const prevId = track.cases[i - 1];
  return prevId !== undefined && p.cases[prevId]?.closed === true;
}
