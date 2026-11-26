/**
 * Release switches. Build-time and runtime code both read this file (vite.config.ts imports it), so keep it free of
 * browser-only globals.
 *
 * PILOT: the public pilot (Roman, 2026-11-26). While true, the start screen shows „Pilotná verzia <version>“ and the
 * built index.html carries `<meta name="robots" content="noindex">` (reachable by link, not listed in search
 * engines). For v1.0 set it to false: both go away.
 */
export const PILOT = true;

/** The start-screen label for a pilot build, or null when PILOT is off. Pure, so it is unit-tested. */
export function pilotLabel(version: string, pilot: boolean = PILOT): string | null {
  return pilot ? `Pilotná verzia ${version}` : null;
}

/** The robots meta tag the build adds to index.html while PILOT is on. */
export const NOINDEX_META = '<meta name="robots" content="noindex" />';

/** Adds the noindex meta right after the charset meta when `pilot` is on. Pure, so it is unit-tested. */
export function withNoindex(html: string, pilot: boolean = PILOT): string {
  if (!pilot || html.includes('name="robots"')) return html;
  const out = html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    ${NOINDEX_META}`);
  if (!out.includes('name="robots"')) throw new Error('withNoindex: no <meta charset="UTF-8" /> in index.html, cannot add noindex');
  return out;
}

/**
 * The address the comment box's „Poslať e-mailom“ button writes to, from the build-time env VITE_FEEDBACK_EMAIL.
 * Unset or empty: null (the box offers „Kopírovať text“ only). Anything that is not one plain address throws, so a
 * typo fails the build (vite.config.ts) instead of shipping a broken button. Pure, so it is unit-tested.
 */
export function feedbackEmail(raw: string | undefined): string | null {
  const v = (raw ?? '').trim();
  if (!v) return null;
  if (!/^[A-Za-z0-9._+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/.test(v)) throw new Error(`VITE_FEEDBACK_EMAIL is not one plain e-mail address: "${v}"`);
  return v;
}

/**
 * The URL the comment box's „Odoslať“ button posts to, from the build-time env VITE_FEEDBACK_ENDPOINT (repository
 * variable FEEDBACK_ENDPOINT in pages.yml). Unset or empty: null, and the build is the same as without the feature
 * (no „Odoslať“, CSP `connect-src 'self'`). Only an https URL without credentials, query or fragment is accepted
 * (http only for localhost and 127.0.0.1, for the e2e build); anything else throws, so a typo fails the build
 * (vite.config.ts). Pure, so it is unit-tested.
 */
export function feedbackEndpoint(raw: string | undefined): string | null {
  const v = (raw ?? '').trim();
  if (!v) return null;
  let u: URL;
  try {
    u = new URL(v);
  } catch {
    throw new Error(`VITE_FEEDBACK_ENDPOINT is not a URL: "${v}"`);
  }
  const local = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
  if (u.protocol !== 'https:' && !(u.protocol === 'http:' && local)) throw new Error(`VITE_FEEDBACK_ENDPOINT must be https: "${v}"`);
  if (u.username || u.password || u.search || u.hash || v.includes('?') || v.includes('#')) throw new Error(`VITE_FEEDBACK_ENDPOINT must have no credentials, query or fragment: "${v}"`);
  if (/[\s'";,]/.test(v)) throw new Error(`VITE_FEEDBACK_ENDPOINT has characters that do not belong in a URL: "${v}"`);
  return u.href;
}

/** The CSP `connect-src` value: the game's own origin, plus the endpoint's origin when one is set. Pure, unit-tested. */
export function connectSrc(endpoint: string | null): string {
  return endpoint ? `'self' ${new URL(endpoint).origin}` : "'self'";
}
