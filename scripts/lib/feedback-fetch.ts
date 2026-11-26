/**
 * Reads feedback issues from GitHub for scripts/feedback-export.ts: this repository (pasted comments, issue forms)
 * and the private feedback repository (comments sent from the game by server/feedback/). Network code with an
 * injectable fetch, unit-tested in tests/unit/feedback-fetch.test.ts. Never part of the game build.
 */
import { APPROVED_LABEL, FEEDBACK_LABEL, type Issue } from './feedback.ts';

/** Where comments sent with „Odoslať“ are filed (server/feedback DEFAULT_REPO). */
export const DEFAULT_FEEDBACK_REPO = 'DALEOSyn/validion-kyberhra-feedback';
/** Issue.source for issues from the feedback repository (CSV `issue` column "feedback#12"). */
export const FEEDBACK_SOURCE = 'feedback';

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
export async function fetchIssues(repo: string, token: string | undefined, fetchImpl: typeof fetch = fetch, source?: string): Promise<Issue[]> {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error(`repository must be owner/name, got "${repo}"`);
  if (!token) throw new Error(`a token is required to read ${repo} (GitHub GraphQL API)`);
  const [owner, name] = repo.split('/');
  const all: Issue[] = [];
  let after: string | null = null;
  for (let page = 0; page < 50; page++) {
    const res = await fetchImpl('https://api.github.com/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: QUERY, variables: { owner, name, label: FEEDBACK_LABEL, after } }),
    });
    if (!res.ok) throw new Error(`GitHub GraphQL ${res.status} for ${repo}`);
    const json = (await res.json()) as { errors?: unknown[]; data?: { repository: { issues: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: GqlIssue[] } } | null } };
    if (json.errors?.length || !json.data?.repository) throw new Error(`GitHub GraphQL errors for ${repo}: ${JSON.stringify(json.errors ?? 'no repository')}`);
    const { nodes, pageInfo } = json.data.repository.issues;
    for (const n of nodes) {
      const approvals = n.timelineItems.nodes.filter((t) => t.label?.name === APPROVED_LABEL).map((t) => t.createdAt ?? '').sort();
      all.push({
        number: n.number, title: n.title, body: n.body, state: n.state.toLowerCase(), created_at: n.createdAt, html_url: n.url,
        labels: n.labels.nodes, last_edited_at: n.lastEditedAt, approved_at: approvals.at(-1) ?? null,
        ...(source ? { source } : {}),
      });
    }
    if (!pageInfo.hasNextPage) break;
    after = pageInfo.endCursor;
  }
  return all;
}

export interface CollectOptions {
  repo: string;
  token: string | undefined;
  feedbackRepo: string;
  /** FEEDBACK_REPO_TOKEN: read access to the private feedback repository. Unset: that repository is skipped. */
  feedbackToken: string | undefined;
  fetchImpl?: typeof fetch;
  log?: (msg: string) => void;
}

/** Issues from this repository, then from the feedback repository (skipped with a log line when its token is unset). */
export async function collectIssues(o: CollectOptions): Promise<Issue[]> {
  const log = o.log ?? console.log;
  const f = o.fetchImpl ?? fetch;
  const main = await fetchIssues(o.repo, o.token, f);
  if (!o.feedbackToken) {
    log(`feedback-export: FEEDBACK_REPO_TOKEN not set, skipping ${o.feedbackRepo} (comments sent from the game)`);
    return main;
  }
  const sent = await fetchIssues(o.feedbackRepo, o.feedbackToken, f, FEEDBACK_SOURCE);
  log(`feedback-export: ${main.length} issues from ${o.repo}, ${sent.length} from ${o.feedbackRepo}`);
  return [...main, ...sent];
}
