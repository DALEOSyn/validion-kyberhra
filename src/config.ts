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
