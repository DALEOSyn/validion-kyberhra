/**
 * The comment receiver for the game's „Odoslať“ button (Roman, 2026-11-26). Platform-neutral: it takes a standard
 * Request and returns a standard Response, so the Azure Functions adapter (azure.ts) and the Cloudflare Worker
 * adapter (worker.ts) are a few lines each. Unit-tested in tests/unit/feedback-server.test.ts with a fake fetch.
 *
 * What it does: CORS for an allow-list of origins, POST JSON of at most 2 KB validated with zod, a honeypot that
 * drops bots silently, redaction of contact details, a best-effort rate limit and daily cap, then one GitHub issue in
 * the private feedback repository in the same `### Label` shape the exporter (scripts/lib/feedback.ts) reads.
 *
 * Privacy: it never logs or stores the IP address, the user agent or the comment. The IP is used only in memory, as
 * a salted SHA-256 hash with a random salt made at start-up, to count requests for the rate limit.
 */
import { z } from 'zod';

/** Same lists as src/feedback/comment.ts (a unit test checks they match; this folder deploys on its own). */
export const ROLE_OPTIONS = ['Zo školy', 'Z rodiny', 'Odborná verejnosť', 'Iné'] as const;
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
export const MAX_TEXT = 500;
export const MAX_BODY_BYTES = 2048;
export const REDACTED = '[odstránené]';
export const LABELS = ['spatna-vazba', 'hra'] as const;
export const DEFAULT_ORIGINS = 'https://daleosyn.github.io';
export const DEFAULT_REPO = 'DALEOSyn/validion-kyberhra-feedback';
export const DEFAULT_DAILY_CAP = 200;
export const RATE_LIMIT = 5;
export const RATE_WINDOW_MS = 10 * 60 * 1000;

export interface FeedbackEnv {
  /** Comma-separated origins allowed to post, e.g. "https://daleosyn.github.io,https://hra.validion.example". */
  ALLOWED_ORIGINS?: string;
  /** owner/name of the private repository the issues go to. */
  FEEDBACK_REPO?: string;
  /** Fine-grained token with Issues: read and write on FEEDBACK_REPO only. */
  GITHUB_TOKEN?: string;
  /** Most comments filed per UTC day (per running instance). */
  DAILY_CAP?: string;
}

export const PayloadSchema = z.strictObject({
  v: z.literal(1),
  app_version: z.string().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}$/),
  role: z.enum(ROLE_OPTIONS),
  case: z.enum([WHOLE_GAME, ...CASE_OPTIONS]),
  rating: z.number().int().min(1).max(5).nullable(),
  text: z.string().max(MAX_TEXT).refine((t) => t.trim().length > 0, 'empty'),
  hp: z.string().max(200),
});
export type Payload = z.infer<typeof PayloadSchema>;

const EMAIL = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)+/giu;
const URL_SCHEME = /\b(?:[a-z][a-z0-9+.-]*:\/\/|www\.)[^\s<>"']+/gi;
const URL_BARE = /\b(?:[a-z0-9-]+\.)+(?:[a-z]{2,24}\/[^\s<>"']*|(?:sk|cz|eu|com|org|net|info|io|app|me|de|at|hu|pl|ua|uk|example|test|invalid)\b)/gi;
/** An IBAN as people write it: uppercase country code, check digits, then groups of 4 (spaced or not). */
const IBAN = /\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]{4}){2,7}(?:[ ]?[A-Z0-9]{1,4})?\b/g;
const PHONE = /(?<![\p{L}\p{N}])\+?\d(?:[ \t()./-]*\d){8,}(?![\p{L}\p{N}])/gu;

/**
 * Normalises the text (NFKC), then removes contact details and links from free text: e-mail addresses, URLs (with a scheme, www., or a bare domain
 * with a path or a common TLD), IBAN-like strings and phone-like numbers with 9 or more digits all become
 * "[odstránené]". Then makes the text inert in a GitHub issue: a line starting with "#" is escaped (it cannot fake a
 * "### Label" field or a heading), "<" is escaped (no HTML), and "@name" gets a space (no mentions).
 */
export function redact(text: string): string {
  const cleaned = text
    // NFKC first, so full-width or other compatibility forms of digits, letters and "@" are caught by the patterns.
    .normalize('NFKC')
    .replace(/\r\n?/g, '\n')
    .trim()
    .replace(EMAIL, REDACTED)
    .replace(URL_SCHEME, REDACTED)
    .replace(URL_BARE, REDACTED)
    .replace(IBAN, REDACTED)
    .replace(PHONE, REDACTED)
    .replace(/</g, '&lt;')
    .replace(/@(?=[\p{L}\p{N}_-])/gu, '@ ');
  return cleaned
    .split('\n')
    .map((l) => l.replace(/^(\s*)#/, '$1\\#'))
    .join('\n');
}

/** The issue body: the `hra` issue-form shape the exporter reads (HRA_ORDER), plus the game version. */
export function issueBody(p: Payload): string {
  return [
    ['Kto píše', p.role],
    ['Prípad', p.case],
    ['Hodnotenie', p.rating === null ? '_No response_' : String(p.rating)],
    ['Pripomienka', redact(p.text.slice(0, MAX_TEXT))],
    ['Verzia hry', p.app_version],
  ]
    .map(([label, value]) => `### ${label}\n\n${value}`)
    .join('\n\n');
}

/** The exact GitHub REST request that files the comment as an issue. Pure, so it is unit-tested. */
export function githubRequest(p: Payload, repo: string, token: string): { url: string; init: RequestInit } {
  return {
    url: `https://api.github.com/repos/${repo}/issues`,
    init: {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'kancelaria-stopa-feedback',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ title: `Komentár z hry: ${p.case}`, body: issueBody(p), labels: [...LABELS] }),
    },
  };
}

function randomSalt(): string {
  return [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(s: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Best-effort limits, in memory of one running instance (a restart or a second instance starts again at zero):
 * RATE_LIMIT comments per RATE_WINDOW_MS per salted IP hash, and a daily cap per UTC day. Keys are hashes only.
 */
export class Limiter {
  // Created on first use: Cloudflare Workers forbid random values at startup (global scope).
  private salt: string | null;
  private readonly hits = new Map<string, number[]>();
  private day = '';
  private count = 0;
  constructor(salt?: string) {
    this.salt = salt ?? null;
  }
  async check(ip: string | null | undefined, now: number, cap: number): Promise<'ok' | 'rate' | 'cap'> {
    const day = new Date(now).toISOString().slice(0, 10);
    if (day !== this.day) {
      this.day = day;
      this.count = 0;
    }
    if (this.count >= cap) return 'cap';
    if (ip) {
      this.salt ??= randomSalt();
      const key = await sha256(`${this.salt}\0${ip}`);
      const recent = (this.hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
      if (recent.length >= RATE_LIMIT) {
        this.hits.set(key, recent);
        return 'rate';
      }
      recent.push(now);
      this.hits.set(key, recent);
      if (this.hits.size > 1000) for (const [k, v] of this.hits) if (now - (v.at(-1) ?? 0) >= RATE_WINDOW_MS) this.hits.delete(k);
    }
    this.count++;
    return 'ok';
  }
  /** Number of IP hashes held (tests). */
  get size(): number {
    return this.hits.size;
  }
}

let sharedLimiter: Limiter | null = null;

export interface Deps {
  /** The client IP from the platform (used only for the in-memory rate limit, never logged). */
  ip?: string | null;
  fetchImpl?: typeof fetch;
  now?: () => number;
  limiter?: Limiter;
  /** Logs fixed messages and status codes only, never request data. */
  log?: (msg: string) => void;
}

export function allowedOrigins(env: FeedbackEnv): string[] {
  return (env.ALLOWED_ORIGINS ?? DEFAULT_ORIGINS)
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers },
  });
}

async function readLimited(req: Request, max: number): Promise<string | null> {
  const declared = Number(req.headers.get('content-length') ?? '0');
  if (Number.isFinite(declared) && declared > max) return null;
  if (!req.body) return '';
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) {
      await reader.cancel().catch(() => undefined);
      return null;
    }
    chunks.push(value);
  }
  const all = new Uint8Array(total);
  let at = 0;
  for (const c of chunks) {
    all.set(c, at);
    at += c.byteLength;
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(all);
}

/** Handles one request. Never throws: every outcome is a Response. */
export async function handleFeedback(request: Request, env: FeedbackEnv, deps: Deps = {}): Promise<Response> {
  const log = deps.log ?? ((m: string) => console.log(`feedback: ${m}`));
  const origin = (request.headers.get('origin') ?? '').replace(/\/+$/, '');
  const allowed = origin !== '' && allowedOrigins(env).includes(origin);
  const cors: Record<string, string> = allowed ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : { Vary: 'Origin' };

  if (request.method !== 'POST' && request.method !== 'OPTIONS') return json(405, { ok: false, error: 'method' }, { ...cors, Allow: 'POST, OPTIONS' });
  if (!allowed) return json(403, { ok: false, error: 'origin' }, { Vary: 'Origin' });
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: { ...cors, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400', 'Cache-Control': 'no-store' },
    });
  }
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) return json(415, { ok: false, error: 'content-type' }, cors);

  let raw: string | null;
  try {
    raw = await readLimited(request, MAX_BODY_BYTES);
  } catch {
    return json(400, { ok: false, error: 'body' }, cors);
  }
  if (raw === null) return json(413, { ok: false, error: 'size' }, cors);
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: 'json' }, cors);
  }
  const parsed = PayloadSchema.safeParse(data);
  if (!parsed.success) return json(400, { ok: false, error: 'invalid' }, cors);
  const p = parsed.data;

  // Honeypot filled: a bot. Answer as if it worked, file nothing.
  if (p.hp !== '') return json(200, { ok: true }, cors);

  const capRaw = Number.parseInt(env.DAILY_CAP ?? '', 10);
  const cap = Number.isFinite(capRaw) && capRaw >= 0 ? capRaw : DEFAULT_DAILY_CAP;
  const limit = await (deps.limiter ?? (sharedLimiter ??= new Limiter())).check(deps.ip, (deps.now ?? Date.now)(), cap);
  if (limit !== 'ok') {
    log(limit === 'cap' ? 'daily cap reached' : 'rate limited');
    return json(429, { ok: false, error: limit }, { ...cors, 'Retry-After': limit === 'cap' ? '3600' : '600' });
  }

  const repo = env.FEEDBACK_REPO?.trim() || DEFAULT_REPO;
  if (!env.GITHUB_TOKEN || !/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    log('not configured (GITHUB_TOKEN or FEEDBACK_REPO)');
    return json(500, { ok: false, error: 'config' }, cors);
  }
  const { url, init } = githubRequest(p, repo, env.GITHUB_TOKEN);
  try {
    const res = await (deps.fetchImpl ?? fetch)(url, { ...init, signal: AbortSignal.timeout(10_000) });
    if (!res.ok) {
      log(`GitHub answered ${res.status}`);
      return json(502, { ok: false, error: 'upstream' }, cors);
    }
  } catch {
    log('GitHub request failed');
    return json(502, { ok: false, error: 'upstream' }, cors);
  }
  return json(200, { ok: true }, cors);
}
