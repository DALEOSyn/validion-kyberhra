/**
 * Azure Functions v4 adapter (Node 22): `func azure functionapp publish <name>` (see README.md). Route
 * /api/feedback, anonymous (the origin allow-list, honeypot and limits are in core.ts). The client IP comes from the
 * first x-forwarded-for entry (port removed) and is used only for the in-memory rate limit; it is never logged.
 */
import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions';
import { type FeedbackEnv, handleFeedback } from './core.ts';

/** The first x-forwarded-for address without its port ("1.2.3.4:5678", "[::1]:80"). */
export function clientIp(forwardedFor: string | null): string | null {
  const first = (forwardedFor ?? '').split(',')[0]?.trim() ?? '';
  if (!first) return null;
  const v6 = /^\[([^\]]+)\](?::\d+)?$/.exec(first);
  if (v6) return v6[1] ?? null;
  return /^[\d.]+:\d+$/.test(first) ? (first.split(':')[0] ?? null) : first;
}

app.http('feedback', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'feedback',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    const request = new Request(req.url, {
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
      body: req.method === 'POST' ? req.body : undefined,
      // Node's fetch Request needs this for a streamed body.
      ...(req.method === 'POST' ? { duplex: 'half' } : {}),
    } as RequestInit);
    const env: FeedbackEnv = {
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
      FEEDBACK_REPO: process.env.FEEDBACK_REPO,
      GITHUB_TOKEN: process.env.GITHUB_TOKEN,
      DAILY_CAP: process.env.DAILY_CAP,
    };
    const res = await handleFeedback(request, env, { ip: clientIp(req.headers.get('x-forwarded-for')) });
    return { status: res.status, headers: Object.fromEntries(res.headers.entries()), body: res.status === 204 ? undefined : await res.text() };
  },
});
