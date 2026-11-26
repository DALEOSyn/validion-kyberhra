import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { connectSrc, feedbackEndpoint } from '../../src/config.ts';
import { commentActions, TEXTS } from '../../src/feedback/comment.ts';
import { MAX_BODY_BYTES, payload, requestInit, SEND_TIMEOUT_MS, sendComment, tooLong } from '../../src/feedback/send.ts';

const root = resolve(import.meta.dirname, '../..');
const URL_ = 'https://feedback.validion.example/api/feedback';
const C = { role: 'Zo školy', case: 'T1 Ľahká brigáda', rating: 4, text: '  Deti pochopili pravidlo.\r\n' } as const;

describe('„Odoslať“ is off without a build-time endpoint', () => {
  it('no endpoint: no „Odoslať“ and connect-src stays the game itself', () => {
    for (const raw of [undefined, '', '   ']) {
      expect(feedbackEndpoint(raw)).toBeNull();
      expect(commentActions(null, feedbackEndpoint(raw))).toEqual(['copy']);
      expect(commentActions('a@b.example', feedbackEndpoint(raw))).toEqual(['mail', 'copy']);
    }
    expect(connectSrc(null)).toBe("'self'");
  });
  it('with an endpoint: „Odoslať“ first, the fallbacks kept, and only its origin added to connect-src', () => {
    const e = feedbackEndpoint(` ${URL_} `);
    expect(e).toBe(URL_);
    expect(commentActions(null, e)).toEqual(['send', 'copy']);
    expect(commentActions('a@b.example', e)).toEqual(['send', 'mail', 'copy']);
    expect(connectSrc(e)).toBe("'self' https://feedback.validion.example");
    expect(connectSrc(feedbackEndpoint('http://127.0.0.1:4176/api/feedback'))).toBe("'self' http://127.0.0.1:4176");
  });
  it('a malformed endpoint fails the build', () => {
    for (const bad of ['feedback.example', 'http://feedback.example/api', 'https://u:p@feedback.example/', 'https://feedback.example/?a=1', 'https://feedback.example/#x', "https://feedback.example/'; script-src *", 'javascript:alert(1)']) {
      expect(() => feedbackEndpoint(bad)).toThrow();
    }
  });
  it('the default build drops the send code: CommentBox reads the endpoint from the build-time constant only', () => {
    const tsx = readFileSync(resolve(root, 'src/ui/CommentBox.tsx'), 'utf8');
    expect(tsx).toContain('const ENDPOINT: string | null = __FEEDBACK_ENDPOINT__;');
    expect(tsx).toContain('const sendTo = ENDPOINT;');
    expect(tsx).not.toMatch(/endpoint\s*[?]?:/);
  });
});

describe('the client sender (src/feedback/send.ts)', () => {
  it('sends exactly v, app_version, role, case, rating, text and hp: no ids, no timestamps, nothing about the device', () => {
    const p = payload({ ...C }, '0.2.0', '');
    expect(p).toEqual({ v: 1, app_version: '0.2.0', role: 'Zo školy', case: 'T1 Ľahká brigáda', rating: 4, text: 'Deti pochopili pravidlo.', hp: '' });
    expect(Object.keys(p)).toEqual(['v', 'app_version', 'role', 'case', 'rating', 'text', 'hp']);
    expect(payload({ ...C, case: 'X9', rating: 9, text: 'a'.repeat(700) }, '0.2.0', 'bot').text).toHaveLength(500);
    expect(payload({ ...C, case: 'X9', rating: 9 }, '0.2.0', 'bot')).toMatchObject({ case: 'Celá hra', rating: null, hp: 'bot' });
  });
  it('posts JSON with no cookies, no referrer, no cache and no redirects', () => {
    const signal = new AbortController().signal;
    expect(requestInit('{}', signal)).toEqual({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      mode: 'cors',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      cache: 'no-store',
      redirect: 'error',
      signal,
    });
  });
  it('calls the endpoint once with those options and reports sent, failed or offline', async () => {
    const calls: [string, RequestInit][] = [];
    const ok = (async (u: string | URL | Request, i?: RequestInit) => {
      calls.push([String(u), i ?? {}]);
      return new Response('{"ok":true}', { status: 200 });
    }) as typeof fetch;
    const p = payload({ ...C }, '0.2.0', '');
    expect(await sendComment(URL_, p, { fetchImpl: ok, online: true })).toBe('sent');
    expect(calls).toHaveLength(1);
    expect(calls[0]?.[0]).toBe(URL_);
    expect(calls[0]?.[1]).toMatchObject({ method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer' });
    expect(JSON.parse(String(calls[0]?.[1].body))).toEqual(p);
    expect(calls[0]?.[1].signal).toBeInstanceOf(AbortSignal);

    expect(await sendComment(URL_, p, { fetchImpl: (async () => new Response('', { status: 502 })) as typeof fetch, online: true })).toBe('failed');
    expect(await sendComment(URL_, p, { fetchImpl: (async () => { throw new TypeError('network'); }) as typeof fetch, online: true })).toBe('failed');
    let called = false;
    expect(await sendComment(URL_, p, { fetchImpl: (async () => { called = true; return new Response(''); }) as typeof fetch, online: false })).toBe('offline');
    expect(called).toBe(false);
    const huge = { ...p, text: '😀'.repeat(MAX_BODY_BYTES / 4) };
    expect(tooLong(huge)).toBe(true);
    expect(tooLong(p)).toBe(false);
    expect(await sendComment(URL_, huge, { fetchImpl: ok, online: true })).toBe('tooLong');
    expect(await sendComment(URL_, huge, { fetchImpl: ok, online: false })).toBe('tooLong');
    expect(calls).toHaveLength(1);
    expect(await sendComment(URL_, p, { fetchImpl: (async () => new Response('{"ok":false}', { status: 429 })) as typeof fetch, online: true })).toBe('rate');
  });
  it('gives up after the timeout (10 s by default)', async () => {
    expect(SEND_TIMEOUT_MS).toBe(10_000);
    const hang = ((_u: string | URL | Request, i?: RequestInit) =>
      new Promise<Response>((_res, rej) => i?.signal?.addEventListener('abort', () => rej(new DOMException('aborted', 'AbortError'))))) as typeof fetch;
    expect(await sendComment(URL_, payload({ ...C }, '0.2.0', ''), { fetchImpl: hang, online: true, timeoutMs: 20 })).toBe('failed');
  });
  it('the new texts are calm and point to „Kopírovať text“ on failure', () => {
    expect(TEXTS.send).toBe('Odoslať');
    expect(TEXTS.sendFailed).toContain('„Kopírovať text“');
    expect(TEXTS.offline).toContain('„Kopírovať text“');
    expect(TEXTS.introSend).toContain('Nič iné sa neodošle.');
    expect(TEXTS.sendNote).toContain('na stránke hry na GitHube');
    expect(TEXTS.sendNote).toContain('USA');
    expect(TEXTS.sendNote).toContain('Cloudflare');
    expect(TEXTS.sent).toBe('Ďakujeme. Pripomienka je odoslaná. Na pripomienky neodpovedáme. Ak niekto potrebuje pomoc hneď, volajte Linku detskej istoty 116 111.');
    expect(TEXTS.rate).toBe('Teraz prišlo veľa pripomienok naraz. Skúste to znova o pár minút alebo text skopírujte tlačidlom „Kopírovať text“.');
    expect(TEXTS.tooLong).toContain('„Kopírovať text“');
  });
});
