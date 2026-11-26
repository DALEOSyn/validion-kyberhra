import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { denyMatchers, denylistIssues, domainIssues, exclaimIssues, fileRules, genderIssues, ibanIssues, ibanValid, lintValue, parseDenylist, phoneIssues } from '../../scripts/lib/redline.ts';

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
  it.each(['Ak si klikol na odkaz', 'Klikla si na odkaz.', 'Keď si to zadal, zmeň heslo.', 'Bol(a) si opatrný.', 'Si pripravený?', 'Ahoj hráč', 'Mal/a by si',
    // sceptic MVP review, finding 6
    'Ak si to už poslal', 'Ak si ho už nainštaloval', 'Keď si už heslo zadal', 'Dobre si to zvládla', 'a klikol si', 'Buď opatrný', 'Zostaň pokojná', 'si skvelý detektív', 'Teraz si skvelý detektív'])('flags "%s"', (t) => {
    expect(genderIssues(t)).not.toEqual([]);
  });
  it.each(['Ak klikneš na odkaz, zmeň heslo.', 'Kto ťa ženie, nechce, aby si to niekto stihol overiť.', 'Si medzi 50 výhercami.', 'Lea si zmenila heslo.', 'Pozri si to.', 'vraj som vyhrala draka', 'Pozri si nový telefón.', 'aby si to Lea stihla', 'Buď pokojne doma.'])('passes "%s"', (t) => {
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

describe('about.yaml exemption (pilot „O hre“ screen)', () => {
  it('fileRules exempts only top-level sources.yaml, help.yaml and about.yaml', () => {
    expect(fileRules('about.yaml')).toEqual({ realNamesAllowed: true, allTeaching: true });
    expect(fileRules('help.yaml')).toEqual({ realNamesAllowed: true, allTeaching: false });
    expect(fileRules('sources.yaml')).toEqual({ realNamesAllowed: true, allTeaching: false });
    expect(fileRules('tracks.yaml')).toEqual({ realNamesAllowed: false, allTeaching: false });
    expect(fileRules('cases/junior/about.yaml')).toEqual({ realNamesAllowed: false, allTeaching: false });
    expect(fileRules('cases\\teen\\help.yaml').realNamesAllowed).toBe(false);
  });
  it('allows real names, domains and help lines in about.yaml, but keeps gender, exclaim and iban', () => {
    const { realNamesAllowed, allTeaching } = fileRules('about.yaml');
    const ok = { sections: [{ text: ['Hra od VALIDION, chyby na github.com/DALEOSyn/validion-kyberhra/issues, aj Google.'] }], help_line: 'Zavolaj na 116 111 alebo 0800 221 021.' };
    expect(lintValue(ok, matchers, realNamesAllowed, allTeaching)).toEqual([]);
    expect(lintValue(ok, matchers, false).map((h) => h.rule)).toContain('domains');
    const bad = { title: 'O hre!', sections: [{ text: ['Ak si klikol na odkaz.', 'SK: GB82WEST12345698765432'] }] };
    expect(lintValue(bad, matchers, realNamesAllowed, allTeaching).map((h) => h.rule).sort()).toEqual(['exclaim', 'gender', 'iban']);
  });
  it('the real content/about.yaml is clean under its rules', () => {
    const raw: unknown = parse(readFileSync(resolve(import.meta.dirname, '../../content/about.yaml'), 'utf8'));
    const { realNamesAllowed, allTeaching } = fileRules('about.yaml');
    expect(lintValue(raw, matchers, realNamesAllowed, allTeaching)).toEqual([]);
  });
});

describe('phone numbers and IBANs (Red Line 3)', () => {
  it('flags unmasked phone-like numbers, not masked ones or amounts', () => {
    expect(phoneIssues('Volaj 0905 123 456')).toHaveLength(1);
    expect(phoneIssues('+421 905 123 456')).toHaveLength(1);
    expect(phoneIssues('0905123456')).toHaveLength(1);
    expect(phoneIssues('0905 xxx xxx, +421 9•• ••• •12, 5 000 kryštálov, 1 000 000 €, o 19:41, kód 482 913')).toEqual([]);
  });
  it('flags only IBANs that pass mod-97', () => {
    expect(ibanValid('DE89 3704 0044 0532 0130 00')).toBe(true);
    expect(ibanValid('SK00 0000 0000 0026 9812 3456')).toBe(false);
    expect(ibanIssues('IBAN DE89 3704 0044 0532 0130 00')).toHaveLength(1);
    expect(ibanIssues('IBAN SK00 0000 0000 0026 9812 3456')).toEqual([]);
    expect(phoneIssues('SK00 0000 0000 0026 9812 3456 · Vanesa K.')).toEqual([]);
  });
  it('lintValue checks phones outside help/sources and IBANs everywhere', () => {
    expect(lintValue({ text: 'Zavolaj 0905 123 456' }, matchers, false).map((h) => h.rule)).toEqual(['phone']);
    expect(lintValue({ text: 'Zavolaj 0905 123 456' }, matchers, true)).toEqual([]);
    expect(lintValue({ text: 'GB82WEST12345698765432' }, matchers, true).map((h) => h.rule)).toEqual(['iban']);
  });
});
