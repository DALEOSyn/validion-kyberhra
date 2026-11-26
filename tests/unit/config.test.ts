import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NOINDEX_META, PILOT, pilotLabel, withNoindex } from '../../src/config.ts';

const root = resolve(import.meta.dirname, '../..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');

describe('pilot switch (src/config.ts)', () => {
  it('is on for the 0.2.0 public pilot', () => {
    expect(PILOT).toBe(true);
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string };
    expect(pkg.version).toBe('0.2.0');
  });
  it('labels the start screen only while the pilot is on', () => {
    expect(pilotLabel('0.2.0', true)).toBe('Pilotná verzia 0.2.0');
    expect(pilotLabel('1.0.0', false)).toBeNull();
  });
  it('adds noindex to index.html only while the pilot is on, once', () => {
    expect(html).not.toContain('name="robots"');
    const on = withNoindex(html, true);
    expect(on).toContain(NOINDEX_META);
    expect(on.indexOf(NOINDEX_META)).toBeGreaterThan(on.indexOf('<meta charset="UTF-8" />'));
    expect(withNoindex(on, true)).toBe(on);
    expect(withNoindex(html, false)).toBe(html);
  });
});
