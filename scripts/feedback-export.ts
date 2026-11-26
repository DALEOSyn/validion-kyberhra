/**
 * Exports pilot feedback (GitHub issues labelled "spatna-vazba", see docs/FEEDBACK.md) into the repository:
 * docs/feedback/feedback.csv (one row per issue) and docs/feedback/SUMMARY.md (counts for triage). Reads this
 * repository with GITHUB_TOKEN and, when FEEDBACK_REPO_TOKEN is set, also the private repository where comments
 * sent from the game are filed (--feedback-repo, default DALEOSyn/validion-kyberhra-feedback; rows "feedback#12").
 *
 *   GITHUB_TOKEN=... [FEEDBACK_REPO_TOKEN=...] npx tsx scripts/feedback-export.ts [--repo owner/name]
 *       [--feedback-repo owner/name] [--out docs/feedback]
 *   npx tsx scripts/feedback-export.ts --input issues.json      # offline: Issue[] with approved_at and last_edited_at
 *
 * Runs locally or in .github/workflows/feedback-export.yml. Never part of the game build.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { APPROVED_LABEL, formOrders, type Issue, staleApprovals, toCsv, toRows, toSummary } from './lib/feedback.ts';
import { collectIssues, DEFAULT_FEEDBACK_REPO } from './lib/feedback-fetch.ts';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : undefined;
}

const input = arg('input');
const repo = arg('repo') ?? process.env.GITHUB_REPOSITORY ?? 'daleosyn/validion-kyberhra';
const outDir = resolve(arg('out') ?? 'docs/feedback');
const feedbackRepo = arg('feedback-repo') ?? DEFAULT_FEEDBACK_REPO;
const issues = input
  ? (JSON.parse(readFileSync(input, 'utf8')) as Issue[])
  : await collectIssues({ repo, token: process.env.GITHUB_TOKEN, feedbackRepo, feedbackToken: process.env.FEEDBACK_REPO_TOKEN });
const formDir = resolve(import.meta.dirname, '../.github/ISSUE_TEMPLATE');
const forms = readdirSync(formDir).filter((f) => f.endsWith('.yml') && f !== 'config.yml').map((f) => parse(readFileSync(resolve(formDir, f), 'utf8')) as Parameters<typeof formOrders>[0][number]);
const rows = toRows(issues, formOrders(forms));
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, 'feedback.csv'), toCsv(rows));
writeFileSync(resolve(outDir, 'SUMMARY.md'), toSummary(rows, new Date().toISOString().slice(0, 10)));
console.log(`feedback-export: ${rows.length} approved feedback issues → ${outDir}`);
const stale = issues.filter((i) => staleApprovals([i]).length).map((i) => `${i.source ?? ''}#${i.number}`);
if (stale.length) console.log(`feedback-export: not exported, edited after approval or approval time unknown (check again, then remove and re-add "${APPROVED_LABEL}"): ${stale.join(', ')}`);
