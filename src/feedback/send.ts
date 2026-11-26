/**
 * „Odoslať“ in the comment box (Roman, 2026-11-26): the one place in the game that may call fetch (eslint exception
 * for this file only). It is used only when the build sets VITE_FEEDBACK_ENDPOINT; without it the import is a dead
 * branch and is dropped from the bundle.
 *
 * What is sent is only what the adult typed or chose, plus the game version: {v, app_version, role, case, rating,
 * text, hp}. No ids, no progress, no timestamps, no device data, no cookies (credentials 'omit'), no referrer. Nothing
 * is stored. The server is server/feedback/ (it redacts contact details and files a private GitHub issue).
 * Pure helpers plus one small sender, unit-tested in tests/unit/send.test.ts.
 */
import { CASE_OPTIONS, type Comment, MAX_TEXT, type Role, WHOLE_GAME } from './comment.ts';

/** Version of the JSON shape the server accepts (server/feedback/src/core.ts). */
export const PAYLOAD_VERSION = 1;
/** Give up after this long and point the adult to „Kopírovať text“. */
export const SEND_TIMEOUT_MS = 10_000;
/** The server refuses larger bodies (server/feedback MAX_BODY_BYTES). */
export const MAX_BODY_BYTES = 2048;

export interface Payload {
  v: typeof PAYLOAD_VERSION;
  app_version: string;
  role: Role;
  case: string;
  rating: number | null;
  text: string;
  /** The hidden honeypot field: empty for people. The server drops the comment silently when it is filled. */
  hp: string;
}

/** The JSON body: exactly these seven keys, the text trimmed and cut to MAX_TEXT, unknown cases as „Celá hra“. */
export function payload(c: Comment, version: string, hp: string): Payload {
  const rating = c.rating !== null && Number.isInteger(c.rating) && c.rating >= 1 && c.rating <= 5 ? c.rating : null;
  const kase = c.case === WHOLE_GAME || (CASE_OPTIONS as readonly string[]).includes(c.case) ? c.case : WHOLE_GAME;
  const text = c.text.replace(/\r\n?/g, '\n').trim().slice(0, MAX_TEXT).trim();
  return { v: PAYLOAD_VERSION, app_version: version, role: c.role, case: kase, rating, text, hp };
}

/** The fetch options: a plain JSON POST that carries no cookies, no referrer and no cache, and follows no redirect. */
export function requestInit(body: string, signal: AbortSignal): RequestInit {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    mode: 'cors',
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    cache: 'no-store',
    redirect: 'error',
    signal,
  };
}

export type SendResult = 'sent' | 'failed' | 'offline';

/**
 * Posts the comment. 'offline' when the browser knows it has no network, 'failed' on any error, timeout or non-2xx
 * answer, 'sent' otherwise. Never throws. `deps` lets the unit tests pass a fake fetch and short timeout.
 */
export async function sendComment(
  endpoint: string,
  p: Payload,
  deps: { fetchImpl?: typeof fetch; online?: boolean; timeoutMs?: number } = {},
): Promise<SendResult> {
  const online = deps.online ?? (typeof navigator === 'undefined' || navigator.onLine !== false);
  if (!online) return 'offline';
  const body = JSON.stringify(p);
  if (new TextEncoder().encode(body).length > MAX_BODY_BYTES) return 'failed';
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), deps.timeoutMs ?? SEND_TIMEOUT_MS);
  try {
    const res = await (deps.fetchImpl ?? fetch)(endpoint, requestInit(body, ctrl.signal));
    return res.ok ? 'sent' : 'failed';
  } catch {
    return 'failed';
  } finally {
    clearTimeout(timer);
  }
}
