/**
 * Exports pilot feedback (GitHub issues labelled "spatna-vazba", see docs/FEEDBACK.md) into the repository:
 * docs/feedback/feedback.csv (one row per issue) and docs/feedback/SUMMARY.md (counts for triage).
 *
 *   GITHUB_TOKEN=... npx tsx scripts/feedback-export.ts [--repo owner/name] [--out docs/feedback]
 *   npx tsx scripts/feedback-export.ts --input issues.json      # offline, from a saved API response
 *
 * Runs locally or in .github/workflows/feedback-export.yml. Never part of the game build.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { FEEDBACK_LABEL, formOrders, type Issue, toCsv, toRows, toSummary } from './lib/feedback.ts';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : undefined;
}

async function fetchIssues(repo: string, token: string | undefined): Promise<Issue[]> {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error(`--repo must be owner/name, got "${repo}"`);
  const all: Issue[] = [];
  for (let page = 1; page <= 50; page++) {
    const url = `https://api.github.com/repos/${repo}/issues?labels=${FEEDBACK_LABEL}&state=all&per_page=100&page=${page}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status} for ${url}`);
    const batch = (await res.json()) as Issue[];
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

const input = arg('input');
const repo = arg('repo') ?? process.env.GITHUB_REPOSITORY ?? 'daleosyn/cybersec-for-children';
const outDir = resolve(arg('out') ?? 'docs/feedback');
const issues = input ? (JSON.parse(readFileSync(input, 'utf8')) as Issue[]) : await fetchIssues(repo, process.env.GITHUB_TOKEN);
const formDir = resolve(import.meta.dirname, '../.github/ISSUE_TEMPLATE');
const forms = readdirSync(formDir).filter((f) => f.endsWith('.yml') && f !== 'config.yml').map((f) => parse(readFileSync(resolve(formDir, f), 'utf8')) as Parameters<typeof formOrders>[0][number]);
const rows = toRows(issues, formOrders(forms));
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, 'feedback.csv'), toCsv(rows));
writeFileSync(resolve(outDir, 'SUMMARY.md'), toSummary(rows, new Date().toISOString().slice(0, 10)));
console.log(`feedback-export: ${rows.length} feedback issues → ${outDir}`);
