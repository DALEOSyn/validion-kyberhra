import { useEffect, useRef, useState } from 'preact/hooks';
import { feedbackEmail } from '../config.ts';
import { CASE_OPTIONS, type Comment, commentActions, commentBody, commentSubject, type Draft, MAX_TEXT, ROLE_OPTIONS, TEXTS, WHOLE_GAME } from '../feedback/comment.ts';

/**
 * The comment box on the „O hre“ screen (section with `comment_box: true` in content/about.yaml). The game sends
 * nothing (Red Line 7): „Kopírovať text“ copies the comment to the clipboard, and „Poslať e-mailom“ is a plain
 * mailto: link that opens the adult's own mail app. That link is the only mailto: and the only <a> in the game; the
 * eslint exception is for this file alone and allows only an <a> whose href is `mailtoUrl(...)`. The draft lives in
 * App's memory (props), never in storage.
 */

/** Build-time address; null hides „Poslať e-mailom“. */
const EMAIL = feedbackEmail(import.meta.env.VITE_FEEDBACK_EMAIL);

/** The mailto: URL for a comment (RFC 6068: line breaks as CRLF, everything percent-encoded). Pure, unit-tested. */
export function mailtoUrl(email: string, subject: string, body: string): string {
  const enc = (s: string) => encodeURIComponent(s.replace(/\r?\n/g, '\r\n'));
  return `mailto:${encodeURI(email)}?subject=${enc(subject)}&body=${enc(body)}`;
}

type Status = 'idle' | 'needRole' | 'needText' | 'copied' | 'copyFailed' | 'mailOpened';

export function CommentBox({ version, draft, onDraft, email = EMAIL }: { version: string; draft: Draft; onDraft: (d: Draft) => void; email?: string | null }) {
  const [status, setStatus] = useState<Status>('idle');
  const fallback = useRef<HTMLTextAreaElement>(null);
  const { role, rating, text } = draft;

  const comment: Comment | null = role ? { role, case: draft.case, rating, text } : null;
  const body = comment ? commentBody(comment) : '';
  const problem: Status | null = !role ? 'needRole' : !text.trim() ? 'needText' : null;

  // QA 4: when copying fails, the text is ready in the fallback field, focused and selected.
  useEffect(() => {
    if (status !== 'copyFailed') return;
    fallback.current?.focus();
    fallback.current?.select();
  }, [status]);

  const set = (patch: Partial<Draft>) => {
    onDraft({ ...draft, ...patch });
    if (status !== 'idle') setStatus('idle');
  };
  const copy = async () => {
    if (problem) return setStatus(problem);
    try {
      await navigator.clipboard.writeText(body);
      setStatus('copied');
    } catch {
      setStatus('copyFailed');
    }
  };
  const onMail = (e: MouseEvent) => {
    if (problem) {
      e.preventDefault();
      setStatus(problem);
    } else setStatus('mailOpened');
  };
  const mailTo = commentActions(email ?? null).includes('mail') ? email : null;

  return (
    <div
      class="comment-box"
      data-comment-box
      role="group"
      aria-labelledby="comment-box-h"
      // Escape inside the box does not close „O hre“ while a comment is typed (the draft is kept anyway).
      onKeyDown={(e) => e.key === 'Escape' && text.trim() && e.stopPropagation()}
    >
      <h4 id="comment-box-h">{TEXTS.heading}</h4>
      <p>{mailTo ? TEXTS.introEmail : TEXTS.intro}</p>
      <p class="comment-warning">{TEXTS.warning}</p>
      <p class="comment-child">{TEXTS.childNote}</p>

      <fieldset>
        <legend>{TEXTS.role}</legend>
        <div class="comment-choices">
          {ROLE_OPTIONS.map((r) => (
            <label key={r}>
              <input type="radio" name="comment-role" value={r} checked={role === r} onChange={() => set({ role: r })} /> {r}
            </label>
          ))}
        </div>
      </fieldset>

      <label class="comment-field">
        <span>{TEXTS.case}</span>
        <select value={draft.case} onChange={(e) => set({ case: e.currentTarget.value })}>
          {[WHOLE_GAME, ...CASE_OPTIONS].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend>{TEXTS.rating}</legend>
        <p class="small">{TEXTS.ratingHint}</p>
        <div class="comment-choices">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n}>
              <input type="radio" name="comment-rating" value={n} checked={rating === n} onChange={() => set({ rating: n })} /> {n}
            </label>
          ))}
          <label>
            <input type="radio" name="comment-rating" value="" checked={rating === null} onChange={() => set({ rating: null })} /> {TEXTS.noRating}
          </label>
        </div>
      </fieldset>

      <label class="comment-field">
        <span>{TEXTS.text}</span>
        <textarea rows={5} maxLength={MAX_TEXT} value={text} aria-describedby="comment-counter" onInput={(e) => set({ text: e.currentTarget.value.slice(0, MAX_TEXT) })} />
      </label>
      <p id="comment-counter" class="small">{TEXTS.counter(text.length)}</p>

      {mailTo && <p class="small">{TEXTS.mailNote}</p>}
      <div class="row">
        {mailTo && (
          <a class="btn" data-comment-mail href={mailtoUrl(mailTo, commentSubject(version), body)} onClick={onMail}>
            {TEXTS.mail}
          </a>
        )}
        <button type="button" class={mailTo ? 'btn alt' : 'btn'} onClick={() => void copy()}>
          {TEXTS.copy}
        </button>
      </div>
      <p class="comment-status" role="status">
        {status === 'idle' ? '' : TEXTS[status]}
      </p>
      {status === 'copyFailed' && (
        <label class="comment-field">
          <span>{TEXTS.copyField}</span>
          <textarea ref={fallback} rows={8} readOnly value={body} />
        </label>
      )}
    </div>
  );
}
