import { describe, expect, it } from 'vitest';
import { collectIssues, DEFAULT_FEEDBACK_REPO, FEEDBACK_SOURCE } from '../../scripts/lib/feedback-fetch.ts';
import { APPROVED_LABEL, F, FEEDBACK_LABEL, formOrders, toCsv, toRows, toSummary } from '../../scripts/lib/feedback.ts';
import { githubRequest } from '../../server/feedback/src/core.ts';
import { commentBody } from '../../src/feedback/comment.ts';

/** A fake GitHub GraphQL endpoint that serves different issues per repository and records who asked with which token. */
function fakeGitHub(byRepo: Record<string, { number: number; body: string }[]>) {
  const calls: { repo: string; auth: string }[] = [];
  const f = (async (_url: string | URL | Request, init?: RequestInit) => {
    const { variables } = JSON.parse(String(init?.body)) as { variables: { owner: string; name: string; label: string } };
    const repo = `${variables.owner}/${variables.name}`;
    calls.push({ repo, auth: String((init?.headers as Record<string, string>).Authorization) });
    expect(variables.label).toBe(FEEDBACK_LABEL);
    const nodes = (byRepo[repo] ?? []).map((i) => ({
      number: i.number, title: `#${i.number}`, body: i.body, state: 'OPEN', createdAt: '2026-12-01T09:00:00Z', url: `https://github.example/${repo}/issues/${i.number}`, lastEditedAt: null,
      labels: { nodes: [{ name: FEEDBACK_LABEL }, { name: 'hra' }, { name: APPROVED_LABEL }] },
      timelineItems: { nodes: [{ createdAt: '2026-12-02T09:00:00Z', label: { name: APPROVED_LABEL } }] },
    }));
    return new Response(JSON.stringify({ data: { repository: { issues: { pageInfo: { hasNextPage: false, endCursor: null }, nodes } } } }), { status: 200 });
  }) as typeof fetch;
  return { f, calls };
}

const pasted = commentBody({ role: 'Z rodiny', case: 'J1 Drak zadarmo', rating: 5, text: 'Pekné.' });
const sentBody = (JSON.parse(String(githubRequest({ v: 1, app_version: '0.2.0', role: 'Zo školy', case: 'T1 Ľahká brigáda', rating: 3, text: 'Dobré.', hp: '' }, DEFAULT_FEEDBACK_REPO, 't').init.body)) as { body: string }).body;

describe('feedback export reads two repositories', () => {
  it('reads this repository and the private feedback repository, each with its own token, and marks the source', async () => {
    const { f, calls } = fakeGitHub({ 'daleosyn/validion-kyberhra': [{ number: 3, body: pasted }], [DEFAULT_FEEDBACK_REPO]: [{ number: 3, body: sentBody }] });
    const logs: string[] = [];
    const issues = await collectIssues({ repo: 'daleosyn/validion-kyberhra', token: 'main-token', feedbackRepo: DEFAULT_FEEDBACK_REPO, feedbackToken: 'fb-token', fetchImpl: f, log: (m) => logs.push(m) });
    expect(calls).toEqual([
      { repo: 'daleosyn/validion-kyberhra', auth: 'Bearer main-token' },
      { repo: DEFAULT_FEEDBACK_REPO, auth: 'Bearer fb-token' },
    ]);
    expect(issues.map((i) => [i.number, i.source])).toEqual([[3, undefined], [3, FEEDBACK_SOURCE]]);
    expect(logs).toEqual([`feedback-export: 1 issues from daleosyn/validion-kyberhra, 1 from ${DEFAULT_FEEDBACK_REPO}`]);

    // the same issue number in both repositories stays two rows, told apart by the source
    const rows = toRows(issues, formOrders([]));
    expect(rows.map((r) => r.ref)).toEqual(['3', 'feedback#3']);
    expect(rows[1]?.fields[F.version]).toBe('0.2.0');
    expect(rows[1]?.cases).toEqual(['T1']);
    const csv = toCsv(rows).split('\n');
    expect(csv[1]?.startsWith('3,hra,')).toBe(true);
    expect(csv[2]?.startsWith('feedback#3,hra,')).toBe(true);
    expect(toSummary(rows, '2026-12-20')).toContain('| Komentár z hry | 2 | 2 |');
  });
  it('skips the feedback repository with a log line when FEEDBACK_REPO_TOKEN is not set', async () => {
    const { f, calls } = fakeGitHub({ 'daleosyn/validion-kyberhra': [{ number: 1, body: pasted }] });
    const logs: string[] = [];
    const issues = await collectIssues({ repo: 'daleosyn/validion-kyberhra', token: 'main-token', feedbackRepo: DEFAULT_FEEDBACK_REPO, feedbackToken: undefined, fetchImpl: f, log: (m) => logs.push(m) });
    expect(calls.map((c) => c.repo)).toEqual(['daleosyn/validion-kyberhra']);
    expect(issues).toHaveLength(1);
    expect(logs).toEqual([`feedback-export: FEEDBACK_REPO_TOKEN not set, skipping ${DEFAULT_FEEDBACK_REPO} (comments sent from the game)`]);
  });
  it('fails clearly on a bad repository name or a GitHub error', async () => {
    const { f } = fakeGitHub({});
    await expect(collectIssues({ repo: 'a/b', token: 't', feedbackRepo: 'not a repo', feedbackToken: 'x', fetchImpl: f })).rejects.toThrow(/owner\/name/);
    const failing = (async () => new Response('', { status: 401 })) as typeof fetch;
    await expect(collectIssues({ repo: 'a/b', token: 't', feedbackRepo: 'c/d', feedbackToken: undefined, fetchImpl: failing })).rejects.toThrow('GitHub GraphQL 401 for a/b');
  });
});
