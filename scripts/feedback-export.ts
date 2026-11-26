/**
 * Exports pilot feedback (GitHub issues labelled "spatna-vazba", see docs/FEEDBACK.md) into the repository:
 * docs/feedback/feedback.csv (one row per issue) and docs/feedback/SUMMARY.md (counts for triage).
 *
 *   GITHUB_TOKEN=... npx tsx scripts/feedback-export.ts [--repo owner/name] [--out docs/feedback]
 *   npx tsx scripts/feedback-export.ts --input issues.json      # offline: Issue[] with approved_at and last_edited_at
 *
 * Runs locally or in .github/workflows/feedback-export.yml. Never part of the game build.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { APPROVED_LABEL, FEEDBACK_LABEL, formOrders, type Issue, staleApprovals, toCsv, toRows, toSummary } from './lib/feedback.ts';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : undefined;
}

const QUERY = `query($owner: String!, $name: String!, $label: String!, $after: String) {
  repository(owner: $owner, name: $name) {
    issues(labels: [$label], first: 100, after: $after, orderBy: {field: CREATED_AT, direction: ASC}) {
      pageInfo { hasNextPage endCursor }
      nodes {
        number title body state createdAt url lastEditedAt
        labels(first: 30) { nodes { name } }
        timelineItems(itemTypes: [LABELED_EVENT], last: 50) { nodes { ... on LabeledEvent { createdAt label { name } } } }
      }
    }
  }
}`;

interface GqlIssue {
  number: number; title: string; body: string; state: string; createdAt: string; url: string; lastEditedAt: string | null;
  labels: { nodes: { name: string }[] };
  timelineItems: { nodes: { createdAt?: string; label?: { name: string } }[] };
}

/** Issues with the feedback label, with their last edit time and the time the approval label was last added (GraphQL). */
async function fetchIssues(repo: string, token: string | undefined): Promise<Issue[]> {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error(`--repo must be owner/name, got "${repo}"`);
  if (!token) throw new Error('GITHUB_TOKEN is required (GitHub GraphQL API)');
  const [owner, name] = repo.split('/');
  const all: Issue[] = [];
  let after: string | null = null;
  for (let page = 0; page < 50; page++) {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: QUERY, variables: { owner, name, label: FEEDBACK_LABEL, after } }),
    });
    if (!res.ok) throw new Error(`GitHub GraphQL ${res.status}`);
    const json = (await res.json()) as { errors?: unknown[]; data?: { repository: { issues: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: GqlIssue[] } } } };
    if (json.errors?.length || !json.data) throw new Error(`GitHub GraphQL errors: ${JSON.stringify(json.errors)}`);
    const { nodes, pageInfo } = json.data.repository.issues;
    for (const n of nodes) {
      const approvals = n.timelineItems.nodes.filter((t) => t.label?.name === APPROVED_LABEL).map((t) => t.createdAt ?? '').sort();
      all.push({
        number: n.number, title: n.title, body: n.body, state: n.state.toLowerCase(), created_at: n.createdAt, html_url: n.url,
        labels: n.labels.nodes, last_edited_at: n.lastEditedAt, approved_at: approvals.at(-1) ?? null,
      });
    }
    if (!pageInfo.hasNextPage) break;
    after = pageInfo.endCursor;
  }
  return all;
}

const input = arg('input');
const repo = arg('repo') ?? process.env.GITHUB_REPOSITORY ?? 'daleosyn/validion-kyberhra';
const outDir = resolve(arg('out') ?? 'docs/feedback');
const issues = input ? (JSON.parse(readFileSync(input, 'utf8')) as Issue[]) : await fetchIssues(repo, process.env.GITHUB_TOKEN);
const formDir = resolve(import.meta.dirname, '../.github/ISSUE_TEMPLATE');
const forms = readdirSync(formDir).filter((f) => f.endsWith('.yml') && f !== 'config.yml').map((f) => parse(readFileSync(resolve(formDir, f), 'utf8')) as Parameters<typeof formOrders>[0][number]);
const rows = toRows(issues, formOrders(forms));
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, 'feedback.csv'), toCsv(rows));
writeFileSync(resolve(outDir, 'SUMMARY.md'), toSummary(rows, new Date().toISOString().slice(0, 10)));
console.log(`feedback-export: ${rows.length} approved feedback issues → ${outDir}`);
const stale = staleApprovals(issues);
if (stale.length) console.log(`feedback-export: not exported, edited after approval or approval time unknown (check again, then remove and re-add "${APPROVED_LABEL}"): ${stale.map((n) => `#${n}`).join(', ')}`);
