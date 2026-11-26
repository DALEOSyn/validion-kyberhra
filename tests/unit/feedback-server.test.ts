import { describe, expect, it } from 'vitest';
import * as client from '../../src/feedback/comment.ts';
import { payload } from '../../src/feedback/send.ts';
import {
  CASE_OPTIONS,
  DEFAULT_REPO,
  githubRequest,
  handleFeedback,
  Limiter,
  MAX_BODY_BYTES,
  MAX_TEXT,
  type Payload,
  RATE_WINDOW_MS,
  redact,
  REDACTED,
  ROLE_OPTIONS,
  WHOLE_GAME,
} from '../../server/feedback/src/core.ts';
import worker from '../../server/feedback/src/worker.ts';
import { clientIp } from '../../server/feedback/src/ip.ts';
import { parseFormBody, HRA_ORDER, F } from '../../scripts/lib/feedback.ts';

const ORIGIN = 'https://daleosyn.github.io';
const URL_ = 'https://feedback.validion.example/api/feedback';
const ENV = { GITHUB_TOKEN: 'test-token' };
const GOOD: Payload = { v: 1, app_version: '0.2.0', role: 'Zo školy', case: 'T1 Ľahká brigáda', rating: 4, text: 'Deti pochopili pravidlo.', hp: '' };

interface Call { url: string; init: RequestInit }
function fakeFetch(status = 201) {
  const calls: Call[] = [];
  const f = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response('{}', { status });
  }) as typeof fetch;
  return { f, calls };
}
function post(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request(URL_, { method: 'POST', headers: { Origin: ORIGIN, 'Content-Type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
}
const quiet = () => undefined;
async function run(req: Request, env: Record<string, string> = ENV, extra: { ip?: string; limiter?: Limiter; now?: () => number; status?: number } = {}) {
  const { f, calls } = fakeFetch(extra.status);
  const res = await handleFeedback(req, env, { fetchImpl: f, ip: extra.ip ?? '192.0.2.1', limiter: extra.limiter ?? new Limiter('salt'), now: extra.now, log: quiet });
  return { res, calls };
}

describe('server/feedback core: method, CORS, origin', () => {
  it('answers only POST and OPTIONS', async () => {
    for (const method of ['GET', 'PUT', 'DELETE']) {
      const { res, calls } = await run(new Request(URL_, { method, headers: { Origin: ORIGIN } }));
      expect(res.status).toBe(405);
      expect(res.headers.get('Allow')).toBe('POST, OPTIONS');
      expect(calls).toEqual([]);
    }
  });
  it('answers a preflight from an allowed origin with CORS headers for POST and Content-Type', async () => {
    const { res } = await run(new Request(URL_, { method: 'OPTIONS', headers: { Origin: ORIGIN, 'Access-Control-Request-Method': 'POST' } }));
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN);
    expect(res.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
    expect(res.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
    expect(res.headers.get('Access-Control-Allow-Credentials')).toBeNull();
    expect(res.headers.get('Vary')).toBe('Origin');
  });
  it('refuses other origins and requests without an Origin, without CORS headers', async () => {
    for (const h of [{ Origin: 'https://evil.example' }, { Origin: 'https://daleosyn.github.io.evil.example' }, {}] as Record<string, string>[]) {
      const { res, calls } = await run(new Request(URL_, { method: 'POST', headers: { 'Content-Type': 'application/json', ...h }, body: JSON.stringify(GOOD) }));
      expect(res.status).toBe(403);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
      expect(calls).toEqual([]);
    }
  });
  it('reads the allow-list from ALLOWED_ORIGINS (comma-separated, trailing slash ignored)', async () => {
    const env = { ...ENV, ALLOWED_ORIGINS: 'https://daleosyn.github.io/, https://hra.validion.example' };
    const { res } = await run(post(GOOD, { Origin: 'https://hra.validion.example' }), env);
    expect(res.status).toBe(200);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://hra.validion.example');
    const other = await run(post(GOOD, { Origin: 'https://hra.validion.example' }));
    expect(other.res.status).toBe(403);
  });
});

describe('server/feedback core: size, validation, honeypot', () => {
  it('refuses bodies over 2 KB, by Content-Length or by bytes read', async () => {
    const big = JSON.stringify({ ...GOOD, text: 'á'.repeat(1100) });
    expect(new TextEncoder().encode(big).length).toBeGreaterThan(MAX_BODY_BYTES);
    expect((await run(post(big))).res.status).toBe(413);
    const stream = new ReadableStream<Uint8Array>({ start(c) { c.enqueue(new TextEncoder().encode(big)); c.close(); } });
    const req = new Request(URL_, { method: 'POST', headers: { Origin: ORIGIN, 'Content-Type': 'application/json' }, body: stream, duplex: 'half' } as RequestInit);
    expect((await run(req)).res.status).toBe(413);
  });
  it('needs JSON, the exact shape and known values', async () => {
    expect((await run(post(GOOD, { 'Content-Type': 'text/plain' }))).res.status).toBe(415);
    expect((await run(post('{not json'))).res.status).toBe(400);
    const bad: unknown[] = [
      { ...GOOD, v: 2 },
      { ...GOOD, role: 'Učiteľ' },
      { ...GOOD, case: 'X9' },
      { ...GOOD, rating: 6 },
      { ...GOOD, rating: 2.5 },
      { ...GOOD, text: '   ' },
      { ...GOOD, text: 'a'.repeat(MAX_TEXT + 1) },
      { ...GOOD, app_version: '0.2.0; drop' },
      { ...GOOD, id: 'abc' },
      { ...GOOD, timestamp: 1 },
      (({ hp: _hp, ...rest }) => rest)(GOOD),
    ];
    for (const b of bad) {
      const { res, calls } = await run(post(b));
      expect(res.status).toBe(400);
      expect(calls).toEqual([]);
    }
    expect((await run(post({ ...GOOD, rating: null }))).res.status).toBe(200);
  });
  it('drops a comment with a filled honeypot silently: 200, nothing filed, not counted', async () => {
    const limiter = new Limiter('salt');
    const { res, calls } = await run(post({ ...GOOD, hp: 'https://spam.example' }), ENV, { limiter });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(calls).toEqual([]);
    expect(limiter.size).toBe(0);
  });
  it('accepts exactly what the game client sends', async () => {
    const p = payload({ role: 'Odborná verejnosť', case: 'J3 Zámok na účte', rating: null, text: ' Dobré. ' }, '0.2.0', '');
    const { res, calls } = await run(post(p));
    expect(res.status).toBe(200);
    expect(calls).toHaveLength(1);
  });
});

describe('server/feedback core: redaction', () => {
  it('removes e-mails, phone-like numbers, URLs and IBAN-like strings', () => {
    const t = [
      'Píšte na jana.novakova@skola.example alebo volajte +421 900 123 456.',
      'Pozri https://hra.example/x?y=1 a www.niekde.example a skola.sk/kontakt a skola.sk.',
      'Účet SK31 1200 0000 1987 4263 7541, tel. 0900/123-456, (02) 1234 5678.',
      'Linka 116 111 a rok 2026 a 12345678 ostávajú.',
    ].join('\n');
    const r = redact(t);
    for (const gone of ['jana', 'skola.example', '+421', '900 123', 'https', 'hra.example', 'www', 'niekde', 'skola.sk', 'SK31', '7541', '0900', '1234 5678']) expect(r).not.toContain(gone);
    expect(r).toContain('Linka 116 111 a rok 2026 a 12345678 ostávajú.');
    expect(r.split(REDACTED).length - 1).toBe(9);
  });
  it('does not cut ordinary words that only look a little like an IBAN', () => {
    for (const t of ['Úloha J1 je ok12 hra je super dobra', 'Prípad T4 a sk12 abcd efgh ijkl ostávajú.', 'Verzia 0.2.0, trieda 7.B, 25 detí.']) expect(redact(t)).toBe(t);
  });
  it('still removes a spaced or unspaced SK IBAN, also in full-width digits (NFKC)', () => {
    expect(redact('Účet SK31 1200 0000 1987 4263 7541 je tu.')).toBe(`Účet ${REDACTED} je tu.`);
    expect(redact('IBAN SK3112000000198742637541.')).toBe(`IBAN ${REDACTED}.`);
    expect(redact('Účet ＳＫ３１ １２００ ００００ １９８７ ４２６３ ７５４１')).toBe(`Účet ${REDACTED}`);
    expect(redact('Píšte na ｊａｎａ＠ｓｋｏｌａ．ｅｘａｍｐｌｅ')).toBe(`Píšte na ${REDACTED}`);
  });
  it('neutralises "#" lines, HTML and @mentions', () => {
    const r = redact('# nadpis\n  ### Prípad\nText <img src=x> pre @DALEOSyn a #12');
    expect(r).toBe('\\# nadpis\n  \\### Prípad\nText &lt;img src=x> pre @ DALEOSyn a #12');
    expect(r.split('\n').some((l) => /^\s*#/.test(l))).toBe(false);
  });
});

describe('server/feedback azure adapter: client IP', () => {
  it('takes the rightmost x-forwarded-for entry (appended by the platform), not the client-supplied first one', () => {
    expect(clientIp('6.6.6.6, 203.0.113.7')).toBe('203.0.113.7');
    expect(clientIp('6.6.6.6, 1.1.1.1, 203.0.113.7:54321')).toBe('203.0.113.7');
    expect(clientIp('[2001:db8::1]:443')).toBe('2001:db8::1');
    expect(clientIp('203.0.113.7, ')).toBe('203.0.113.7');
    expect(clientIp('2001:db8::2')).toBe('2001:db8::2');
    expect(clientIp(null)).toBeNull();
    expect(clientIp(' , ')).toBeNull();
  });
});

describe('server/feedback core: rate limit and daily cap', () => {
  it('allows 5 comments per IP in 10 minutes, then 429; other IPs and later times pass', async () => {
    const limiter = new Limiter('salt');
    let t = Date.UTC(2026, 11, 1, 9);
    const now = () => t;
    for (let i = 0; i < 5; i++) expect((await run(post(GOOD), ENV, { limiter, now, ip: '192.0.2.7' })).res.status).toBe(200);
    const sixth = await run(post(GOOD), ENV, { limiter, now, ip: '192.0.2.7' });
    expect(sixth.res.status).toBe(429);
    expect(sixth.calls).toEqual([]);
    expect((await run(post(GOOD), ENV, { limiter, now, ip: '192.0.2.8' })).res.status).toBe(200);
    t += RATE_WINDOW_MS;
    expect((await run(post(GOOD), ENV, { limiter, now, ip: '192.0.2.7' })).res.status).toBe(200);
  });
  it('keeps only salted hashes of IPs', async () => {
    const limiter = new Limiter('salt');
    await limiter.check('192.0.2.9', 0, 10);
    const keys = [...(limiter as unknown as { hits: Map<string, number[]> }).hits.keys()];
    expect(keys).toHaveLength(1);
    expect(keys[0]).toMatch(/^[0-9a-f]{64}$/);
    expect(keys[0]).not.toContain('192');
    const other = new Limiter();
    await other.check('192.0.2.9', 0, 10);
    expect([...(other as unknown as { hits: Map<string, number[]> }).hits.keys()][0]).not.toBe(keys[0]);
  });
  it('stops at DAILY_CAP (default 200) per UTC day and starts again the next day', async () => {
    const limiter = new Limiter('salt');
    let t = Date.UTC(2026, 11, 1, 9);
    const now = () => t;
    const env = { ...ENV, DAILY_CAP: '3' };
    for (let i = 0; i < 3; i++) expect((await run(post(GOOD), env, { limiter, now, ip: `192.0.2.${i}` })).res.status).toBe(200);
    const over = await run(post(GOOD), env, { limiter, now, ip: '192.0.2.50' });
    expect(over.res.status).toBe(429);
    expect(await over.res.json()).toEqual({ ok: false, error: 'cap' });
    t += 24 * 3600 * 1000;
    expect((await run(post(GOOD), env, { limiter, now, ip: '192.0.2.50' })).res.status).toBe(200);
    const def = new Limiter('salt');
    for (let i = 0; i < 200; i++) expect(await def.check(null, 0, 200)).toBe('ok');
    expect(await def.check(null, 0, 200)).toBe('cap');
  });
});

describe('server/feedback core: the GitHub issue', () => {
  it('builds the exact REST request: private repo, title, labels, issue-form body plus version', () => {
    const { url, init } = githubRequest({ ...GOOD, text: 'Pozri x@y.example\n### Prípad' }, DEFAULT_REPO, 'tok');
    expect(url).toBe('https://api.github.com/repos/DALEOSyn/validion-kyberhra-feedback/issues');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({
      Accept: 'application/vnd.github+json',
      Authorization: 'Bearer tok',
      'Content-Type': 'application/json',
      'User-Agent': 'kancelaria-stopa-feedback',
      'X-GitHub-Api-Version': '2022-11-28',
    });
    expect(JSON.parse(String(init.body))).toEqual({
      title: 'Komentár z hry: T1 Ľahká brigáda',
      labels: ['spatna-vazba', 'hra'],
      body: '### Kto píše\n\nZo školy\n\n### Prípad\n\nT1 Ľahká brigáda\n\n### Hodnotenie\n\n4\n\n### Pripomienka\n\nPozri [odstránené]\n\\### Prípad\n\n### Verzia hry\n\n0.2.0',
    });
  });
  it('sends it with the token to FEEDBACK_REPO and nothing about the sender', async () => {
    const { res, calls } = await run(post({ ...GOOD, rating: null }, { 'User-Agent': 'Secret/1.0', 'X-Forwarded-For': '198.51.100.4' }), { ...ENV, FEEDBACK_REPO: 'org/private-fb' });
    expect(res.status).toBe(200);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe('https://api.github.com/repos/org/private-fb/issues');
    const sent = JSON.stringify(calls[0]?.init);
    for (const leak of ['Secret/1.0', '198.51.100.4', '192.0.2.1', ORIGIN]) expect(sent).not.toContain(leak);
    expect(JSON.parse(String(calls[0]?.init.body)).body).toContain('### Hodnotenie\n\n_No response_');
  });
  it('the exporter reads the filed body (with the version) like a pasted comment', () => {
    const { init } = githubRequest(GOOD, DEFAULT_REPO, 'tok');
    const fields = parseFormBody((JSON.parse(String(init.body)) as { body: string }).body, HRA_ORDER);
    expect(fields).toEqual({ [F.who]: 'Zo školy', [F.case]: 'T1 Ľahká brigáda', [F.rating]: '4', [F.comment]: 'Deti pochopili pravidlo.', [F.version]: '0.2.0' });
  });
  it('answers 502 when GitHub fails, 500 without a token, and never echoes the comment', async () => {
    const bad = await run(post(GOOD), ENV, { status: 401 });
    expect(bad.res.status).toBe(502);
    expect(await bad.res.text()).not.toContain('pochopili');
    const none = await run(post(GOOD), {});
    expect(none.res.status).toBe(500);
    expect(none.calls).toEqual([]);
  });
  it('logs no request data', async () => {
    const lines: string[] = [];
    const { f } = fakeFetch(500);
    await handleFeedback(post(GOOD, { 'User-Agent': 'Secret/1.0' }), ENV, { fetchImpl: f, ip: '192.0.2.77', limiter: new Limiter('s'), log: (m) => lines.push(m) });
    expect(lines).toEqual(['GitHub answered 500']);
  });
});

describe('server/feedback lists match the game', () => {
  it('roles, cases, "Celá hra" and the text limit are the same as src/feedback/comment.ts', () => {
    expect([...ROLE_OPTIONS]).toEqual([...client.ROLE_OPTIONS]);
    expect([...CASE_OPTIONS]).toEqual([...client.CASE_OPTIONS]);
    expect(WHOLE_GAME).toBe(client.WHOLE_GAME);
    expect(MAX_TEXT).toBe(client.MAX_TEXT);
  });
  it('the Worker adapter passes requests to the core (an unknown origin is refused before anything else)', async () => {
    const res = await worker.fetch(new Request(URL_, { method: 'POST', headers: { Origin: 'https://x.example' } }), {});
    expect(res.status).toBe(403);
  });
});
