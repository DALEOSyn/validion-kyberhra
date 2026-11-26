/**
 * Red-line linter rules (pure functions, unit-tested in tests/unit/redline.test.ts). See docs/CONTENT_SCHEMA.md
 * ("Red-line linter") for what each rule catches and how to fix a hit. The linter reads YAML *values*, so
 * comments and keys are never checked.
 *
 * 1. domains   Any domain or URL whose top-level domain is not .example, .test or .invalid (Red Lines 1, 3).
 *              Not checked in sources.yaml, help.yaml and about.yaml, where real organisations are named on purpose.
 * 2. denylist  Real brand names from scripts/redline-denylist.txt (Red Line 1). Same exemption.
 * 3. gender    Gendered forms about the player (Red Line 9): "(a)" or "/a" endings, "hráč", and second-person
 *              past or adjective forms such as "klikol si", "ak si klikla", "si pripravený". A heuristic:
 *              it catches the common shapes, not every one. Reviewers still read for tone.
 * 4. exclaim   Exclamation marks in teaching text (Red Line 5): hints, decoys, why, consequence, later, calm,
 *              lock-up feedback, recall feedback and the whole debrief. All of about.yaml is teaching text too.
 * 5. phone     An unmasked phone-like number: 9 or more digits in one run of digits, spaces, dashes or slashes, with
 *              an optional "+" (Red Line 3). Mask digits with x or • ("0900 xxx xxx"). Not checked in sources.yaml,
 *              help.yaml and about.yaml, where real help lines are listed on purpose.
 * 6. iban      An IBAN whose check digits pass mod-97 (Red Line 3: IBANs must fail the checksum). Checked everywhere.
 */

export interface Hit {
  rule: 'domains' | 'denylist' | 'gender' | 'exclaim' | 'phone' | 'iban';
  path: string;
  message: string;
}

/**
 * Top-level files of content/ that may name real organisations, domains and help-line numbers (Red Line 1: the help
 * screen, the sources list and the „O hre“ screen). Every other rule (gender, exclaim, iban) still applies there.
 */
export const REAL_NAMES_FILES = ['sources.yaml', 'help.yaml', 'about.yaml'] as const;
/** Files whose every value is player-facing explanation, so the exclamation-mark rule applies to all of it. */
export const ALL_TEACHING_FILES = ['about.yaml'] as const;

export interface FileRules {
  realNamesAllowed: boolean;
  allTeaching: boolean;
}

/** Which exemptions apply to a file, given its path relative to the content dir (only top-level files qualify). */
export function fileRules(relPath: string): FileRules {
  const p = relPath.split('\\').join('/');
  const top = !p.includes('/');
  return {
    realNamesAllowed: top && (REAL_NAMES_FILES as readonly string[]).includes(p),
    allTeaching: top && (ALL_TEACHING_FILES as readonly string[]).includes(p),
  };
}

export const ALLOWED_TLDS = ['example', 'test', 'invalid'];

const DOMAIN_RE = /(?<![\p{L}\p{N}_@.-])(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?\.)+(\p{L}{2,24})(?![\p{L}\p{N}-])/gu;
const EMAIL_HOST_RE = /@((?:[\p{L}\p{N}-]+\.)+(\p{L}{2,24}))(?![\p{L}\p{N}-])/gu;
const URL_RE = /\b[a-z][a-z0-9+.-]*:\/\/([^\s/?#"'<>]*)/giu;

/** Domains and URLs that are not on a reserved, non-routable TLD. */
export function domainIssues(text: string): string[] {
  const out = new Set<string>();
  for (const m of text.matchAll(URL_RE)) {
    const host = (m[1] ?? '').toLowerCase().replace(/:\d+$/, '');
    const tld = host.split('.').pop() ?? '';
    if (!ALLOWED_TLDS.includes(tld)) out.add(`URL "${m[0]}" (only .example, .test or .invalid hosts)`);
  }
  for (const re of [DOMAIN_RE, EMAIL_HOST_RE]) {
    for (const m of text.matchAll(re)) {
      const tld = (m[re === DOMAIN_RE ? 1 : 2] ?? '').toLowerCase();
      if (!ALLOWED_TLDS.includes(tld)) out.add(`domain "${re === DOMAIN_RE ? m[0] : m[1]}" (use .example, .test or .invalid)`);
    }
  }
  return [...out];
}

/** Lowercase, without diacritics, so "Bazoš" also catches "bazos". */
export function fold(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function parseDenylist(src: string): string[] {
  return src
    .split('\n')
    .map((l) => l.replace(/#.*/, '').trim())
    .filter(Boolean);
}

export interface DenyMatcher {
  name: string;
  re: RegExp;
}

/**
 * Each word of a name matches as a stem: words of 5+ letters lose a final vowel and may take up to 4 more letters
 * (Slovak case endings: "Robloxe", "TikToku", "Slovenskej sporiteľne"). Shorter words match whole.
 */
export function denyMatchers(names: string[]): DenyMatcher[] {
  return names.map((name) => {
    const words = fold(name).split(/\s+/).map((w) => {
      if (w.replace(/[^a-z0-9]/g, '').length < 5) return escapeRe(w);
      return `${escapeRe(w.replace(/[aeiouy]$/, ''))}\\p{L}{0,4}`;
    });
    return { name, re: new RegExp(`(?<![\\p{L}\\p{N}])${words.join('\\s+')}(?![\\p{L}\\p{N}])`, 'u') };
  });
}

export function denylistIssues(text: string, matchers: DenyMatcher[]): string[] {
  const t = fold(text);
  return matchers.filter((m) => m.re.test(t)).map((m) => `real brand "${m.name}" (use a fictional brand)`);
}

const CONJ_WORDS = 'ak|keď|že|či|aby|keby|už|ešte|kým|lebo|tak|čo|kde|ako|odkedy|kedy|potom|ty|dobre|skvele|výborne|super|fajn|naozaj|určite|teraz|tentoraz|vždy|zase|znova';
const OBJ_WORDS = 'to|už|ho|ju|ich|mu|jej|tam|sa|ešte|všetko|niečo|nič|sem|tu|vtedy|včera|dnes';
const CONJ = `(?:${CONJ_WORDS})`;
const OBJ = `(?:(?:${OBJ_WORDS})\\s+)?`;
const L_PART = '\\p{L}+(?:ol|al|il|el|ul|yl|la|li)';
const START = `(?:^|[.!?…:;]\\s*|\\b${CONJ}\\s+)`;
/** Case-insensitive first letter only, for the one rule that needs case (names are capitalised). */
const ci = (alts: string) => alts.split('|').map((w) => `[${w[0] ?? ''}${(w[0] ?? '').toUpperCase()}]${w.slice(1)}`).join('|');
/** A second, lowercase word after an object word ("si už heslo zadal"), but not a new subject ("aby si to niekto stihol", "aby si to Lea stihla"). */
const FREE_WORD = '(?!(?:niekto|nikto|niečo|nič|každý|ktokoľvek|on|ona|ono|oni|ony|mama|otec|brat|sestra|kamarát|kamarátka)(?![\\p{L}]))\\p{Ll}+';
const START_CS = `(?:^|[.!?…:;]\\s*|\\b(?:${ci(CONJ_WORDS)})\\s+)`;
const GENDER_RULES: [RegExp, string][] = [
  [/\p{L}\((?:a|la|á|ka|ia|ova)\)/iu, 'a "(a)" ending'],
  [/\p{L}\/(?:a|la|á|ka|ia)(?![\p{L}])/iu, 'a "/a" ending'],
  [/(?<![\p{L}])hráč/iu, '"hráč/hráčka" (address the player as ty)'],
  [new RegExp(`${START}si\\s+${OBJ}${L_PART}(?![\\p{L}])`, 'iu'), 'a gendered past form with "si" (e.g. "ak si klikol")'],
  [new RegExp(`(?:^|[.!?…:;,]\\s*|\\b(?:a|aj|no|ale)\\s+)${L_PART}\\s+si(?![\\p{L}])`, 'iu'), 'a gendered past form (e.g. "klikla si")'],
  [new RegExp(`${START}si\\s+\\p{L}+[ýá](?![\\p{L}])`, 'iu'), 'a gendered adjective with "si" (e.g. "si pripravený")'],
  [new RegExp(`${START_CS}[sS]i\\s+(?:${ci(OBJ_WORDS)})\\s+${FREE_WORD}\\s+${L_PART}(?![\\p{L}])`, 'u'), 'a gendered past form with "si" (e.g. "keď si už heslo zadal")'],
  [/(?<![\p{L}])(?:buď|zostaň|ostaň|buďte)\s+\p{L}{3,}[ýá](?![\p{L}])/iu, 'a gendered adjective with an imperative (e.g. "buď opatrný")'],
];

export function genderIssues(text: string): string[] {
  return GENDER_RULES.filter(([re]) => re.test(text)).map(([, what]) => `${what}: use present tense, an imperative or a noun phrase`);
}

const TEACHING_KEYS = new Set(['hint', 'decoy', 'why', 'consequence', 'later', 'calm', 'correct', 'wrong_order_hint', 'debrief', 'feedback']);

/** True when a value at this path is teaching text (no exclamation marks). */
export function isTeachingPath(path: (string | number)[]): boolean {
  return path.some((p) => typeof p === 'string' && TEACHING_KEYS.has(p));
}

export function exclaimIssues(text: string): string[] {
  return text.includes('!') ? ['an exclamation mark in teaching text (keep it calm)'] : [];
}

const IBAN_RE = /(?<![\p{L}\p{N}])([A-Z]{2})(\d{2})((?:[ ]?[A-Z0-9]{4}){2,7}(?:[ ]?[A-Z0-9]{1,3})?)(?![\p{L}\p{N}])/gu;

/** True when an IBAN (spaces allowed) passes the ISO 13616 mod-97 check. */
export function ibanValid(iban: string): boolean {
  const s = iban.replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{8,30}$/.test(s)) return false;
  const moved = s.slice(4) + s.slice(0, 4);
  let rem = 0;
  for (const ch of moved) {
    const v = /\d/.test(ch) ? ch : String(ch.charCodeAt(0) - 55);
    for (const d of v) rem = (rem * 10 + Number(d)) % 97;
  }
  return rem === 1;
}

/** IBANs that pass the checksum (they must fail it). */
export function ibanIssues(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(IBAN_RE)) if (ibanValid(m[0])) out.push(`IBAN "${m[0]}" passes the mod-97 check (use check digits that fail it, e.g. 00)`);
  return out;
}

const PHONE_RE = /(?<![\p{L}\p{N}])\+?\d[\d \-/]*\d(?![\p{N}])/gu;

/** Phone-like numbers with 9 or more visible digits (IBANs are left to ibanIssues). */
export function phoneIssues(text: string): string[] {
  const out: string[] = [];
  const rest = text.replace(IBAN_RE, ' ');
  for (const m of rest.matchAll(PHONE_RE)) {
    if (m[0].replace(/\D/g, '').length >= 9) out.push(`unmasked number "${m[0].trim()}" (mask digits: "0900 xxx xxx")`);
  }
  return out;
}

/** Every string value in parsed YAML with its path. */
export function* strings(value: unknown, path: (string | number)[] = []): Generator<[(string | number)[], string]> {
  if (typeof value === 'string') yield [path, value];
  else if (Array.isArray(value)) for (const [i, v] of value.entries()) yield* strings(v, [...path, i]);
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) yield* strings(v, [...path, k]);
}

/**
 * Lints one parsed content file. `realNamesAllowed` is true for the REAL_NAMES_FILES; `allTeaching` (about.yaml)
 * applies the exclamation-mark rule to every value. See fileRules().
 */
export function lintValue(value: unknown, matchers: DenyMatcher[], realNamesAllowed: boolean, allTeaching = false): Hit[] {
  const hits: Hit[] = [];
  for (const [path, text] of strings(value)) {
    const p = path.join('.');
    // A case's top-level `sources:` list holds citation ids, never shown to the player and checked against
    // content/sources.yaml by the validator; ids may name the real body or app a source is about.
    if (!realNamesAllowed && path.length === 2 && path[0] === 'sources' && typeof path[1] === 'number') continue;
    if (!realNamesAllowed) {
      for (const m of domainIssues(text)) hits.push({ rule: 'domains', path: p, message: m });
      for (const m of denylistIssues(text, matchers)) hits.push({ rule: 'denylist', path: p, message: m });
      for (const m of phoneIssues(text)) hits.push({ rule: 'phone', path: p, message: m });
    }
    for (const m of ibanIssues(text)) hits.push({ rule: 'iban', path: p, message: m });
    // Source titles are other people's words; everything else speaks to the player.
    if (!(realNamesAllowed && path[0] === 'sources')) for (const m of genderIssues(text)) hits.push({ rule: 'gender', path: p, message: m });
    if (allTeaching || isTeachingPath(path)) for (const m of exclaimIssues(text)) hits.push({ rule: 'exclaim', path: p, message: m });
  }
  return hits;
}
