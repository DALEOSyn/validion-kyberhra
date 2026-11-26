import type { AboutLine } from './schema.ts';

/**
 * The paragraphs of one „O hre“ section for this build: plain strings always, `{ text, when_send }` only when
 * `when_send` matches whether the build has „Odoslať“ (VITE_FEEDBACK_ENDPOINT). Pure, unit-tested.
 */
export function aboutLines(lines: readonly AboutLine[], send: boolean): string[] {
  return lines.flatMap((l) => (typeof l === 'string' ? [l] : l.when_send === send ? [l.text] : []));
}
