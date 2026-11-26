# Comment receiver for „Odoslať“ (`server/feedback/`)

A small HTTP function that receives an adult's comment from the game's comment box („O hre“ > „Pripomienka pre
dospelých“ > „Odoslať“) and files it as an issue in the **private** repository `DALEOSyn/validion-kyberhra-feedback`.
Roman decided on 2026-11-26 that adults' comments may be sent directly. Nothing about the child is ever sent: the game
posts only `{v, app_version, role, case, rating, text, hp}` (see `src/feedback/send.ts` in the game).

The logic is one platform-neutral function, `handleFeedback(request, env, deps?)` in `src/core.ts` (standard `Request`
in, `Response` out). Two thin adapters run it:

- `src/azure.ts`: Azure Functions v4, Node 22 (route `/api/feedback`).
- `src/worker.ts`: Cloudflare Worker.

Roman chooses one; only one is deployed. Unit tests: `tests/unit/feedback-server.test.ts` in the game repository
(`npm test` at the root).

## What it does

1. Answers `POST` and `OPTIONS` (CORS preflight) only; anything else is 405.
2. Accepts only origins in `ALLOWED_ORIGINS` (403 otherwise, without CORS headers). No cookies or credentials.
3. Accepts `Content-Type: application/json`, at most 2 KB, in exactly the game's shape (zod, strict): role and case
   from the game's lists, rating 1–5 or null, text 1–500 characters, version `x.y.z`, honeypot `hp`.
4. A filled honeypot gets 200 and is dropped silently.
5. Best-effort limits, in memory of one running instance: 5 comments per 10 minutes per client (keyed by a SHA-256
   hash of the IP with a random salt made at start-up), and `DAILY_CAP` comments per UTC day. Over a limit: 429. A
   restart or a second instance starts at zero; that is accepted for a pilot.
6. Replaces e-mail addresses, phone-like numbers (9 or more digits), links and IBAN-like strings with „[odstránené]“;
   escapes lines starting with `#`, `<` and `@mentions` so the text is inert in a GitHub issue.
7. Creates the issue with `GITHUB_TOKEN`: title „Komentár z hry: <case>“, labels `spatna-vazba` and `hra`, body in
   the `hra` issue-form shape (`### Kto píše`, `### Prípad`, `### Hodnotenie`, `### Pripomienka`) plus
   `### Verzia hry`. `scripts/feedback-export.ts` reads it after a maintainer adds `schvalene`.

It **never logs or stores the IP address, the user agent or the comment**. Logs are fixed messages and GitHub status
codes only. Do not turn on request logging that records client IPs (Azure Application Insights request telemetry,
Cloudflare Logpush or Workers Logs with headers); `wrangler.toml` keeps observability off, and `host.json` turns off
request and dependency telemetry by default (`Host.Results` and `Host.Aggregator` at `None`, requests and
dependencies excluded from Application Insights, no live metrics, no extended HTTP trigger info); only this
function's own fixed log lines are kept.

## Environment

| Variable | Default | Meaning |
| --- | --- | --- |
| `ALLOWED_ORIGINS` | `https://daleosyn.github.io` | Comma-separated origins allowed to post. List the GitHub Pages origin **and every VALIDION domain** that serves the game, e.g. `https://daleosyn.github.io,https://<validion-domain>`. An origin is scheme + host (+ port), no path. |
| `FEEDBACK_REPO` | `DALEOSyn/validion-kyberhra-feedback` | `owner/name` of the private repository the issues go to. |
| `GITHUB_TOKEN` | (none; required) | A **fine-grained** personal access token, resource owner DALEOSyn, repository access **only** `validion-kyberhra-feedback`, permission **Issues: Read and write** (Metadata: read is added automatically). Nothing else. Set an expiry and renew it. Without it every comment gets 500. |
| `DAILY_CAP` | `200` | Most comments filed per UTC day per instance. |

The labels `spatna-vazba` and `hra` must exist in the feedback repository (the Feedback export workflow creates them
there when `FEEDBACK_REPO_TOKEN` is set; or create them by hand).

## Build and test locally

```
cd server/feedback
npm ci
npm run typecheck
npm run build        # tsc → dist/ (Azure runs dist/azure.js)
```

## Deploy to Azure Functions (Node 22, Functions v4)

Needs the Azure CLI and Azure Functions Core Tools v4. Create a Function App (Linux, runtime Node 22, plan
Consumption or Flex Consumption, region in the EU), then:

```
cd server/feedback
npm ci && npm run build
az functionapp config appsettings set -g <resource-group> -n <name> --settings \
  ALLOWED_ORIGINS="https://daleosyn.github.io,https://<validion-domain>" \
  FEEDBACK_REPO="DALEOSyn/validion-kyberhra-feedback" DAILY_CAP=200 GITHUB_TOKEN="<token>"
func azure functionapp publish <name>
```

Better: keep `GITHUB_TOKEN` in Azure Key Vault and reference it from the app setting. Do not enable Application
Insights for this app, or if it is required, keep its default IP masking on and do not log request headers. Leave
the platform CORS setting empty: the function answers CORS itself. The endpoint is
`https://<name>.azurewebsites.net/api/feedback`.

## Deploy to Cloudflare Workers

Needs a Cloudflare account and `wrangler` (a dev dependency here). Edit the `[vars]` in `wrangler.toml`
(`ALLOWED_ORIGINS` above all), then:

```
cd server/feedback
npm ci
npx wrangler login
npx wrangler secret put GITHUB_TOKEN
npx wrangler deploy
```

The endpoint is `https://kancelaria-stopa-feedback.<account>.workers.dev/` (any path), or a route on a VALIDION
domain if you add one.

## Turn it on in the game

Set the repository variable `FEEDBACK_ENDPOINT` in `DALEOSyn/validion-kyberhra` (Settings > Secrets and variables >
Actions > Variables) to the endpoint URL (https, no query). The next Pages deploy shows „Odoslať“ and adds only that
origin to the CSP `connect-src`. Delete the variable to turn it off again. To read sent comments in the weekly
export, add the secret `FEEDBACK_REPO_TOKEN` (fine-grained, Issues: read and write on the feedback repository only).
