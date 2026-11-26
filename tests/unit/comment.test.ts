import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { feedbackEmail } from '../../src/config.ts';
import { CASE_OPTIONS, commentActions, commentBody, commentSubject, MAX_TEXT, ROLE_OPTIONS, TEXTS, WHOLE_GAME } from '../../src/feedback/comment.ts';
import { mailtoUrl } from '../../src/ui/CommentBox.tsx';
import { denyMatchers, lintValue, parseDenylist } from '../../scripts/lib/redline.ts';

const root = resolve(import.meta.dirname, '../..');

describe('comment box (src/feedback/comment.ts)', () => {
  it('writes the comment in issue-form shape, in the exporter field order', () => {
    expect(commentBody({ role: 'Učiteľ', case: 'J2 Kód pre kamaráta', rating: 5, text: '  Deti pochopili pravidlo.\r\nDruhý riadok.  ' })).toBe(
      '### Kto píše\n\nUčiteľ\n\n### Prípad\n\nJ2 Kód pre kamaráta\n\n### Hodnotenie\n\n5\n\n### Pripomienka\n\nDeti pochopili pravidlo.\nDruhý riadok.',
    );
  });
  it('writes "_No response_" for no rating, falls back to "Celá hra", cuts the text at 500 and defuses "#" lines', () => {
    const b = commentBody({ role: 'Iné', case: 'X9 nie je prípad', rating: null, text: `# nadpis\n${'a'.repeat(600)}` });
    expect(b).toContain('### Prípad\n\nCelá hra\n\n### Hodnotenie\n\n_No response_\n\n### Pripomienka\n\n # nadpis\n');
    expect(b.split('### Pripomienka\n\n')[1]?.length).toBe(MAX_TEXT + 1);
    expect(commentBody({ role: 'Rodič', case: WHOLE_GAME, rating: 7, text: 'x' })).toContain('### Hodnotenie\n\n_No response_');
  });
  it('builds the mailto: URL with the versioned subject and a CRLF, percent-encoded body', () => {
    const body = commentBody({ role: 'Odborník', case: 'T4 Nové číslo', rating: 3, text: 'Text & ďalší?' });
    const url = mailtoUrl('pripomienky@validion.example', commentSubject('0.2.0'), body);
    expect(url.startsWith('mailto:pripomienky@validion.example?subject=Pripomienka%20k%20hre%200.2.0&body=')).toBe(true);
    expect(url).not.toMatch(/\s/);
    expect(url.split('&').length).toBe(2);
    expect(url).toContain('%23%23%23%20Kto%20p%C3%AD%C5%A1e%0D%0A%0D%0AOdborn%C3%ADk');
    const decoded = decodeURIComponent(url.split('&body=')[1] ?? '');
    expect(decoded).toBe(body.replace(/\n/g, '\r\n'));
  });
  it('offers „Poslať e-mailom“ only when a build-time address is set; „Kopírovať text“ always', () => {
    expect(commentActions(null)).toEqual(['copy']);
    expect(commentActions(feedbackEmail(undefined))).toEqual(['copy']);
    expect(commentActions(feedbackEmail('  '))).toEqual(['copy']);
    expect(commentActions(feedbackEmail('pripomienky@validion.example'))).toEqual(['mail', 'copy']);
  });
  it('accepts only one plain address in VITE_FEEDBACK_EMAIL', () => {
    expect(feedbackEmail(' a.b+c@x-y.example ')).toBe('a.b+c@x-y.example');
    for (const bad of ['a@b', 'a@b.example?cc=c@d.example', 'a@b.example,c@d.example', 'mailto:a@b.example', 'a b@c.example']) expect(() => feedbackEmail(bad)).toThrow();
  });
  it('offers the same roles and cases the exporter knows', () => {
    expect([...ROLE_OPTIONS]).toEqual(['Učiteľ', 'Rodič', 'Odborník', 'Iné']);
    expect(CASE_OPTIONS).toHaveLength(8);
  });
  it('its texts pass the red-line rules for teaching text (gender, exclamation marks)', () => {
    const m = denyMatchers(parseDenylist(readFileSync(resolve(root, 'scripts/redline-denylist.txt'), 'utf8')));
    const texts = Object.fromEntries(Object.entries(TEXTS).map(([k, v]) => [k, typeof v === 'function' ? v(123) : v]));
    expect(lintValue(texts, m, false, true)).toEqual([]);
    expect(TEXTS.warning).toBe('Nepíšte sem mená, školu ani kontakty.');
  });
});

describe('the game sends nothing (Red Line 7)', () => {
  const files = (dir: string): string[] => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? files(join(dir, n)) : [join(dir, n)]));
  const src = files(resolve(root, 'src')).filter((f) => /\.(ts|tsx)$/.test(f));
  it('only src/ui/CommentBox.tsx writes "mailto:" or renders an <a>, and no file calls fetch or stores the comment', () => {
    const rel = (f: string) => relative(root, f).split('\\').join('/');
    expect(src.filter((f) => /mailto:/i.test(readFileSync(f, 'utf8'))).map(rel)).toEqual(['src/ui/CommentBox.tsx']);
    expect(src.filter((f) => /<a[\s>]/.test(readFileSync(f, 'utf8'))).map(rel)).toEqual(['src/ui/CommentBox.tsx']);
    expect(src.filter((f) => /\bfetch\s*\(|sendBeacon|XMLHttpRequest/.test(readFileSync(f, 'utf8'))).map(rel)).toEqual([]);
    const box = readFileSync(resolve(root, 'src/ui/CommentBox.tsx'), 'utf8') + readFileSync(resolve(root, 'src/feedback/comment.ts'), 'utf8');
    expect(box).not.toMatch(/\b(localStorage|sessionStorage|indexedDB|caches)\s*[.[]/);
  });
});
