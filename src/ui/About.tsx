import type { About } from '../content/schema.ts';
import type { Draft } from '../feedback/comment.ts';
import { StageHeading } from './Heading.tsx';
import { CommentBox } from './CommentBox.tsx';
import { aboutLines } from '../content/about.ts';

/** Whether this build has „Odoslať“ (build-time constant; picks the `when_send` paragraphs of about.yaml). */
const SEND = __FEEDBACK_ENDPOINT__ !== null;

/**
 * „O hre“, rendered from content/about.yaml: what the game is, privacy, feedback for adults, the help line.
 * The section with `comment_box: true` also shows the comment box (CommentBox.tsx; it sends a comment only when an adult presses „Odoslať“ in a build with an endpoint).
 * Addresses are plain text: no links except the comment box's mailto: (same rule as the help screen).
 */
export function AboutScreen({ about, onClose, draft, onDraft }: { about: About; onClose: () => void; draft: Draft; onDraft: (d: Draft | ((prev: Draft) => Draft)) => void }) {
  return (
    <section class="screen" aria-label={about.title} data-screen="about">
      <StageHeading>{about.title}</StageHeading>
      {about.sections.map((s) => (
        <section key={s.id} class="about-section" data-about={s.id} aria-labelledby={`about-${s.id}`}>
          <h3 id={`about-${s.id}`}>{s.heading}</h3>
          {aboutLines(s.text, SEND).map((t, i) => (
            <p key={i}>{t}</p>
          ))}
          {s.address && (
            <p class="about-address">
              <span class="sr-only">Adresa: </span>
              {s.address}
            </p>
          )}
          {s.address_note && <p class="small">{s.address_note}</p>}
          {s.comment_box && <CommentBox version={__APP_VERSION__} draft={draft} onDraft={onDraft} />}
        </section>
      ))}
      <p class="note">{about.help_line}</p>
      <button type="button" class="btn" onClick={onClose}>
        Späť do hry
      </button>
    </section>
  );
}
