/**
 * Red-line linter rules (pure functions, unit-tested in tests/unit/redline.test.ts). See docs/CONTENT_SCHEMA.md
 * ("Red-line linter") for what each rule catches and how to fix a hit. The linter reads YAML *values*, so
 * comments and keys are never checked.
 *
 * 1. domains   Any domain or URL whose top-level domain is not .example, .test or .invalid (Red Lines 1, 3).
 *              Not checked in sources.yaml and help.yaml, where real organisations are named on purpose.
 * 2. denylist  Real brand names from scripts/redline-denylist.txt (Red Line 1). Same exemption.
 * 3. gender    Gendered forms about the player (Red Line 9): "(a)" or "/a" endings, "hráč", and second-person
 *              past or adjective forms such as "klikol si", "ak si klikla", "si pripravený". A heuristic:
 *              it catches the common shapes, not every one. Reviewers still read for tone.
 * 4. exclaim   Exclamation marks in teaching text (Red Line 5): hints, decoys, why, consequence, later, calm,
 *              lock-up feedback and the whole debrief.
 */

export interface Hit {
  rule: 'domains' | 'denylist' | 'gender' | 'exclaim';
  path: string;
  message: string;
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

const CONJ = '(?:ak|keď|že|či|aby|keby|už|ešte|kým|lebo|tak|čo|kde|ako|odkedy|kedy|potom|ty)';
const OBJ = '(?:(?:to|už|ho|ju|ich|mu|jej|tam|sa)\\s+)?';
const L_PART = '\\p{L}+(?:ol|al|il|el|ul|yl|la|li)';
const START = `(?:^|[.!?…:;]\\s*|\\b${CONJ}\\s+)`;
const GENDER_RULES: [RegExp, string][] = [
  [/\p{L}\((?:a|la|á|ka|ia|ova)\)/iu, 'a "(a)" ending'],
  [/\p{L}\/(?:a|la|á|ka|ia)(?![\p{L}])/iu, 'a "/a" ending'],
  [/(?<![\p{L}])hráč/iu, '"hráč/hráčka" (address the player as ty)'],
  [new RegExp(`${START}si\\s+${OBJ}${L_PART}(?![\\p{L}])`, 'iu'), 'a gendered past form with "si" (e.g. "ak si klikol")'],
  [new RegExp(`(?:^|[.!?…:;,]\\s*)${L_PART}\\s+si(?![\\p{L}])`, 'iu'), 'a gendered past form (e.g. "klikla si")'],
  [new RegExp(`${START}si\\s+\\p{L}+[ýá](?![\\p{L}])`, 'iu'), 'a gendered adjective with "si" (e.g. "si pripravený")'],
];

export function genderIssues(text: string): string[] {
  return GENDER_RULES.filter(([re]) => re.test(text)).map(([, what]) => `${what}: use present tense, an imperative or a noun phrase`);
}

const TEACHING_KEYS = new Set(['hint', 'decoy', 'why', 'consequence', 'later', 'calm', 'correct', 'wrong_order_hint', 'debrief']);

/** True when a value at this path is teaching text (no exclamation marks). */
export function isTeachingPath(path: (string | number)[]): boolean {
  return path.some((p) => typeof p === 'string' && TEACHING_KEYS.has(p));
}

export function exclaimIssues(text: string): string[] {
  return text.includes('!') ? ['an exclamation mark in teaching text (keep it calm)'] : [];
}

/** Every string value in parsed YAML with its path. */
export function* strings(value: unknown, path: (string | number)[] = []): Generator<[(string | number)[], string]> {
  if (typeof value === 'string') yield [path, value];
  else if (Array.isArray(value)) for (const [i, v] of value.entries()) yield* strings(v, [...path, i]);
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) yield* strings(v, [...path, k]);
}

/** Lints one parsed content file. `realNamesAllowed` is true for sources.yaml and help.yaml. */
export function lintValue(value: unknown, matchers: DenyMatcher[], realNamesAllowed: boolean): Hit[] {
  const hits: Hit[] = [];
  for (const [path, text] of strings(value)) {
    const p = path.join('.');
    if (!realNamesAllowed) {
      for (const m of domainIssues(text)) hits.push({ rule: 'domains', path: p, message: m });
      for (const m of denylistIssues(text, matchers)) hits.push({ rule: 'denylist', path: p, message: m });
    }
    // Source titles are other people's words; everything else speaks to the player.
    if (!(realNamesAllowed && path[0] === 'sources')) for (const m of genderIssues(text)) hits.push({ rule: 'gender', path: p, message: m });
    if (isTeachingPath(path)) for (const m of exclaimIssues(text)) hits.push({ rule: 'exclaim', path: p, message: m });
  }
  return hits;
}
