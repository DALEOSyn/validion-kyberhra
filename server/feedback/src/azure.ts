/**
 * Azure Functions v4 adapter (Node 22): `func azure functionapp publish <name>` (see README.md). Route
 * /api/feedback, anonymous (the origin allow-list, honeypot and limits are in core.ts). The client IP comes from the
 * last (rightmost) x-forwarded-for entry, the one the platform's front end appends (port removed); earlier entries
 * are whatever the client sent and could be forged to dodge the rate limit. It is used only for the in-memory rate
 * limit and is never logged.
 */
import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions';
import { type FeedbackEnv, handleFeedback } from './core.ts';
import { clientIp } from './ip.ts';

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
