/**
 * Cloudflare Worker adapter: `wrangler deploy` (see README.md and wrangler.toml). The client IP comes from the
 * cf-connecting-ip header and is used only for the in-memory rate limit (core.ts); it is never logged.
 */
import { type FeedbackEnv, handleFeedback } from './core.ts';

export default {
  async fetch(request: Request, env: FeedbackEnv): Promise<Response> {
    return handleFeedback(request, env, { ip: request.headers.get('cf-connecting-ip') });
  },
};
