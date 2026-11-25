import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { denyMatchers, denylistIssues, domainIssues, exclaimIssues, genderIssues, lintValue, parseDenylist } from '../../scripts/lib/redline.ts';

const matchers = denyMatchers(parseDenylist(readFileSync(resolve(import.meta.dirname, '../../scripts/redline-denylist.txt'), 'utf8')));

describe('domains', () => {
  it('allows only .example, .test and .invalid', () => {
    expect(domainIssues('Klikni na kryptoria-odmeny.example/login')).toEqual([]);
    expect(domainIssues('podpora@ucet.example a https://hra.test/x a shop.invalid')).toEqual([]);
    expect(domainIssues('Choď na kryptoria.sk')).toHaveLength(1);
    expect(domainIssues('https://evil.com/login')).not.toEqual([]);
    expect(domainIssues('napíš na podpora@hra.com')).not.toEqual([]);
  });
  it('does not flag ordinary Slovak text', () => {
    expect(domainIssues('Haf. Bzuk je appka. 5 000 kryštálov, s.r.o., atď., verzia 0.2, o 19:41.')).toEqual([]);
  });
});

describe('denylist', () => {
  it('matches real brands case-insensitively, without diacritics and in Slovak forms', () => {
    expect(denylistIssues('Hráme ROBLOX', matchers)).toHaveLength(1);
    expect(denylistIssues('v Robloxe a na TikToku', matchers)).toHaveLength(2);
    expect(denylistIssues('na bazose', matchers)).toHaveLength(1);
    expect(denylistIssues('Slovenskej sporiteľne', matchers)).toHaveLength(1);
  });
  it('does not match inside other words or fictional brands', () => {
    expect(denylistIssues('Kryptoria, Bzuk, Pixelbrána, Lipovec, telekomunikácie, stena', matchers)).toEqual([]);
    expect(denylistIssues('GLSX a o2x', matchers)).toEqual([]);
  });
});

describe('gendered forms', () => {
  it.each(['Ak si klikol na odkaz', 'Klikla si na odkaz.', 'Keď si to zadal, zmeň heslo.', 'Bol(a) si opatrný.', 'Si pripravený?', 'Ahoj hráč', 'Mal/a by si'])('flags "%s"', (t) => {
    expect(genderIssues(t)).not.toEqual([]);
  });
  it.each(['Ak klikneš na odkaz, zmeň heslo.', 'Kto ťa ženie, nechce, aby si to niekto stihol overiť.', 'Si medzi 50 výhercami.', 'Lea si zmenila heslo.', 'Pozri si to.', 'vraj som vyhrala draka'])('passes "%s"', (t) => {
    expect(genderIssues(t)).toEqual([]);
  });
});

describe('lintValue', () => {
  it('flags exclamation marks only in teaching text', () => {
    expect(exclaimIssues('Pozor!')).toHaveLength(1);
    const hits = lintValue({ intro: { lines: [{ text: 'GRATULUJEME!' }] }, debrief: { rule: 'Neklikaj!' } }, matchers, false);
    expect(hits.map((h) => h.rule)).toEqual(['exclaim']);
    expect(hits[0]?.path).toBe('debrief.rule');
  });
  it('allows real names and URLs on the help screen and in sources, but not elsewhere', () => {
    const v = { entries: [{ text: 'Linka detskej istoty, https://www.ldi.sk, aj Google' }] };
    expect(lintValue(v, matchers, true)).toEqual([]);
    expect(lintValue(v, matchers, false).map((h) => h.rule).sort()).toEqual(['denylist', 'domains', 'domains']);
  });
});
