/**
 * The client IP for the rate limit (azure.ts; its own file, so the unit tests need no @azure/functions): the rightmost x-forwarded-for address (appended by the platform, not by the client) without its port
 * ("1.2.3.4:5678", "[::1]:80"). Empty entries are skipped.
 */
export function clientIp(forwardedFor: string | null): string | null {
  const last = (forwardedFor ?? '').split(',').map((e) => e.trim()).filter(Boolean).at(-1) ?? '';
  if (!last) return null;
  const v6 = /^\[([^\]]+)\](?::\d+)?$/.exec(last);
  if (v6) return v6[1] ?? null;
  return /^[\d.]+:\d+$/.test(last) ? (last.split(':')[0] ?? null) : last;
}
