import { describe, expect, it } from 'vitest';
import {
  STORAGE_KEY,
  clearProgress,
  emptyProgress,
  isUnlocked,
  loadProgress,
  parseProgress,
  recordCase,
  saveProgress,
  trackStars,
  type StorageLike,
} from '../../src/engine/progress.ts';
import type { Track } from '../../src/content/schema.ts';

function memory(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}
const throwing: StorageLike = {
  getItem: () => {
    throw new Error('denied');
  },
  setItem: () => {
    throw new Error('quota');
  },
  removeItem: () => {
    throw new Error('denied');
  },
};

const track = { id: 'junior', cases: ['c1', 'c2', 'c3'], ranks: [{ min_stars: 0, name: 'n' }] } as unknown as Track;

describe('progress', () => {
  it('round-trips through storage under a versioned key', () => {
    const s = memory();
    const p = recordCase(emptyProgress(), 'c1', 2);
    expect(saveProgress(p, s)).toBe(true);
    expect(s.data.has(STORAGE_KEY)).toBe(true);
    expect(loadProgress(s)).toEqual(p);
  });

  it('survives storage that throws (private mode, full disk)', () => {
    expect(loadProgress(throwing)).toEqual(emptyProgress());
    expect(saveProgress(emptyProgress(), throwing)).toBe(false);
    expect(clearProgress(throwing)).toEqual(emptyProgress());
    expect(loadProgress(null)).toEqual(emptyProgress());
  });

  it('ignores malformed or foreign data', () => {
    expect(parseProgress('not json')).toEqual(emptyProgress());
    expect(parseProgress('{"version":99,"cases":{"c1":{"stars":3,"closed":true}}}')).toEqual(emptyProgress());
    const p = parseProgress('{"version":1,"cases":{"c1":{"stars":"3","closed":"yes"},"c2":{"stars":99,"closed":true},"c3":null},"lastTrack":"evil"}');
    expect(p.cases['c1']).toEqual({ stars: 0, closed: false });
    expect(p.cases['c2']).toEqual({ stars: 4, closed: true });
    expect(p.cases['c3']).toBeUndefined();
    expect(p.lastTrack).toBeNull();
  });

  it('keeps the best stars when a case is replayed', () => {
    let p = recordCase(emptyProgress(), 'c1', 3);
    p = recordCase(p, 'c1', 1);
    expect(p.cases['c1']).toEqual({ stars: 3, closed: true });
  });

  it('unlocks the next case only when the previous one is closed', () => {
    let p = emptyProgress();
    expect(isUnlocked(p, track, 'c1')).toBe(true);
    expect(isUnlocked(p, track, 'c2')).toBe(false);
    p = recordCase(p, 'c1', 0);
    expect(isUnlocked(p, track, 'c2')).toBe(true);
    expect(isUnlocked(p, track, 'c3')).toBe(false);
    expect(isUnlocked(p, track, 'unknown')).toBe(false);
  });

  it('sums stars per track and clears everything', () => {
    const s = memory();
    let p = recordCase(recordCase(emptyProgress(), 'c1', 2), 'c2', 3);
    p = recordCase(p, 'other-track-case', 3);
    expect(trackStars(p, track)).toBe(5);
    saveProgress(p, s);
    expect(clearProgress(s)).toEqual(emptyProgress());
    expect(s.data.has(STORAGE_KEY)).toBe(false);
  });
});
