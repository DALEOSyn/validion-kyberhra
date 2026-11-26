/**
 * The „O hre“ comment box (Roman, 2026-11-26): an adult writes a short comment, and the game turns it into text in
 * issue-form shape ("### Label\n\nvalue") that the adult copies or sends from their own e-mail app. When the build
 * sets VITE_FEEDBACK_ENDPOINT, „Odoslať“ also posts the comment on purpose (src/feedback/send.ts, the only fetch in
 * the game; Red Line 7 as narrowed by Roman, 2026-11-26: nothing about the child is ever sent). Nothing is stored.
 * A maintainer pastes copied or e-mailed text into an issue labelled `spatna-vazba` + `hra`; the server files sent
 * comments in the same shape. scripts/feedback-export.ts parses both (kind `hra`, field order HRA_ORDER there).
 * Pure functions and constants, unit-tested in tests/unit/comment.test.ts.
 */

/** Who is writing: shown in the box and written as-is into the `### Kto píše` field the exporter reads. Gender-neutral. */
export const ROLE_OPTIONS = ['Zo školy', 'Z rodiny', 'Odborná verejnosť', 'Iné'] as const;
export type Role = (typeof ROLE_OPTIONS)[number];

/** Case titles, the same list as the issue forms (scripts/lib/feedback.ts re-exports it; a test checks the titles). */
export const CASE_OPTIONS = [
  'J1 Drak zadarmo',
  'J2 Kód pre kamaráta',
  'J3 Zámok na účte',
  'J4 Kričiaca obrazovka',
  'T1 Ľahká brigáda',
  'T2 Cheat zadarmo',
  'T3 Bez signálu',
  'T4 Nové číslo',
] as const;
export const WHOLE_GAME = 'Celá hra';

/** The longest comment, in characters (the textarea's maxlength and the counter). */
export const MAX_TEXT = 500;

/** The question labels, in this order, of a comment from the game (scripts/lib/feedback.ts uses them as HRA_ORDER). */
export const HRA_LABELS = { who: 'Kto píše', case: 'Prípad', rating: 'Hodnotenie', comment: 'Pripomienka', version: 'Verzia hry' } as const;

/** How GitHub issue forms write an empty answer; the exporter turns it into "". */
const NO_RESPONSE = '_No response_';

export interface Comment {
  role: Role;
  case: string;
  /** 1 to 5, or null when not rated (the rating is optional). */
  rating: number | null;
  text: string;
}

/**
 * The comment in issue-form shape. Text is trimmed and cut to MAX_TEXT; a line of the comment that starts with "#"
 * gets a leading space, so it can never look like a "### Label" header to the exporter.
 */
export function commentBody(c: Comment): string {
  const text = c.text.replace(/\r\n?/g, '\n').trim().slice(0, MAX_TEXT).trim().split('\n').map((l) => (l.startsWith('#') ? ` ${l}` : l)).join('\n');
  const rating = c.rating !== null && Number.isInteger(c.rating) && c.rating >= 1 && c.rating <= 5 ? String(c.rating) : NO_RESPONSE;
  const kase = c.case === WHOLE_GAME || (CASE_OPTIONS as readonly string[]).includes(c.case) ? c.case : WHOLE_GAME;
  return [
    [HRA_LABELS.who, c.role],
    [HRA_LABELS.case, kase],
    [HRA_LABELS.rating, rating],
    [HRA_LABELS.comment, text || NO_RESPONSE],
  ].map(([label, value]) => `### ${label}\n\n${value}`).join('\n\n');
}

/** The e-mail subject. */
export function commentSubject(version: string): string {
  return `Pripomienka k hre ${version}`;
}

/** Every word the box shows. Kept here so the red-line rules (gender, exclamation marks) are unit-tested on them. */
export const TEXTS = {
  heading: 'Pripomienka pre dospelých',
  intro: 'Hra pripomienku nikam neodošle. Pripraví z nej text, ktorý môžete skopírovať a poslať ďalej.',
  introEmail: 'Hra pripomienku nikam neodošle. Pripraví z nej text, ktorý môžete skopírovať alebo poslať zo svojho e-mailu.',
  introSend: 'Pripomienku môžete odoslať tlačidlom „Odoslať“. Odošle sa len to, čo vyplníte tu, a verzia hry. Nič iné sa neodošle.',
  sendNote: 'Odoslaná pripomienka sa uloží ako neverejný záznam (issue) na GitHube, čo je služba z USA. Číta ju tím pilotu VALIDION. Po kontrole a bez osobných údajov ju môžeme zverejniť na stránke hry na GitHube.',
  warning: 'Nepíšte sem mená, školu, kontakty ani nič osobné o deťoch. Ak vám dieťa zverilo niečo vážne, postupujte podľa školského postupu ochrany detí.',
  openForm: 'Formulár pre dospelých',
  childNote: 'Si dieťa a niečo ťa trápi? Nepíš to sem. Povedz to dospelému, ktorému dôveruješ, alebo zavolaj na Linku detskej istoty 116 111.',
  role: 'Kto píše',
  case: 'Ku ktorému prípadu',
  rating: 'Hodnotenie (nepovinné)',
  ratingHint: '1 je najmenej, 5 je najviac.',
  noRating: 'Bez hodnotenia',
  text: 'Pripomienka',
  counter: (n: number) => `${n} z ${MAX_TEXT} znakov`,
  mailNote: 'Otvorí sa vaša e-mailová aplikácia. Hra sama nič neodošle.',
  mailNoteSend: 'Tlačidlo „Poslať e-mailom“ otvorí vašu e-mailovú aplikáciu.',
  send: 'Odoslať',
  sending: 'Pripomienka sa odosiela.',
  sent: 'Ďakujeme. Pripomienka je odoslaná. Na pripomienky neodpovedáme. Ak niekto potrebuje pomoc hneď, volajte Linku detskej istoty 116 111.',
  sendFailed: 'Pripomienku sa teraz nepodarilo odoslať. Text zostal v poli. Môžete ho skopírovať tlačidlom „Kopírovať text“.',
  offline: 'Zariadenie je bez pripojenia. Text zostal v poli. Môžete ho skopírovať tlačidlom „Kopírovať text“ a poslať neskôr.',
  rate: 'Teraz prišlo veľa pripomienok naraz. Skúste to znova o pár minút alebo text skopírujte tlačidlom „Kopírovať text“.',
  tooLong: 'Pripomienka je na odoslanie príliš dlhá. Skráťte ju, prosím, alebo text skopírujte tlačidlom „Kopírovať text“.',
  honeypot: 'Toto pole nechajte prázdne',
  mail: 'Poslať e-mailom',
  copy: 'Kopírovať text',
  needRole: 'Vyberte, prosím, kto píše.',
  needText: 'Najprv napíšte pripomienku.',
  copied: 'Text je skopírovaný. Môžete ho vložiť do e-mailu alebo do formulára.',
  copyFailed: 'Kopírovanie sa nepodarilo. Text je v poli nižšie, môžete ho označiť a skopírovať.',
  copyField: 'Text na skopírovanie',
  mailOpened: 'Ak sa e-mailová aplikácia neotvorila, použite tlačidlo „Kopírovať text“.',
} as const;

/**
 * The box's buttons: „Odoslať“ only with a build-time endpoint, „Poslať e-mailom“ only with a build-time address,
 * „Kopírovať text“ always.
 */
export function commentActions(email: string | null, endpoint: string | null = null): ('send' | 'mail' | 'copy')[] {
  return [...(endpoint ? (['send'] as const) : []), ...(email ? (['mail'] as const) : []), 'copy'];
}

/**
 * What is typed into the box. App keeps it in memory (never in storage), so closing „O hre“ by Escape, „Späť do hry“
 * or „Pomoc“ keeps the text until the page is closed (QA, comment-box review).
 */
export interface Draft {
  role: Role | null;
  case: string;
  rating: number | null;
  text: string;
}
export const EMPTY_DRAFT: Draft = { role: null, case: WHOLE_GAME, rating: null, text: '' };

/** True when two drafts hold the same choices and text (after „Odoslať“ the box is cleared only if nothing changed). */
export function sameDraft(a: Draft, b: Draft): boolean {
  return a.role === b.role && a.case === b.case && a.rating === b.rating && a.text === b.text;
}
