import { useState } from 'preact/hooks';
import { feedbackEmail } from '../config.ts';
import { CASE_OPTIONS, type Comment, commentActions, commentBody, commentSubject, MAX_TEXT, type Role, ROLE_OPTIONS, TEXTS, WHOLE_GAME } from '../feedback/comment.ts';

/**
 * The comment box on the „O hre“ screen (section with `comment_box: true` in content/about.yaml). The game sends
 * nothing (Red Line 7): „Kopírovať text“ copies the comment to the clipboard, and „Poslať e-mailom“ is a plain
 * mailto: link that opens the adult's own mail app. That link is the only mailto: and the only <a> in the game; the
 * eslint exception is for this file alone. The text lives in component state only and is never stored.
 */

/** Build-time address; null hides „Poslať e-mailom“. */
const EMAIL = feedbackEmail(import.meta.env.VITE_FEEDBACK_EMAIL);

/** The mailto: URL for a comment (RFC 6068: line breaks as CRLF, everything percent-encoded). Pure, unit-tested. */
export function mailtoUrl(email: string, subject: string, body: string): string {
  const enc = (s: string) => encodeURIComponent(s.replace(/\r?\n/g, '\r\n'));
  return `mailto:${email}?subject=${enc(subject)}&body=${enc(body)}`;
}

type Status = 'idle' | 'needRole' | 'needText' | 'copied' | 'copyFailed' | 'mailOpened';

export function CommentBox({ version, email = EMAIL }: { version: string; email?: string | null }) {
  const [role, setRole] = useState<Role | null>(null);
  const [kase, setKase] = useState<string>(WHOLE_GAME);
  const [rating, setRating] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const comment: Comment | null = role ? { role, case: kase, rating, text } : null;
  const body = comment ? commentBody(comment) : '';
  const problem: Status | null = !role ? 'needRole' : !text.trim() ? 'needText' : null;

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
  const edit = () => status !== 'idle' && setStatus('idle');
  const actions = commentActions(email);
  const mailTo = actions.includes('mail') && email ? email : null;

  return (
    <div
      class="comment-box"
      data-comment-box
      role="group"
      aria-labelledby="comment-box-h"
      // Escape closes „O hre“; while a comment is typed, it must not throw the text away.
      onKeyDown={(e) => e.key === 'Escape' && text.trim() && e.stopPropagation()}
    >
      <h4 id="comment-box-h">{TEXTS.heading}</h4>
      <p>{mailTo ? TEXTS.introEmail : TEXTS.intro}</p>
      <p class="comment-warning">{TEXTS.warning}</p>

      <fieldset>
        <legend>{TEXTS.role}</legend>
        <div class="comment-choices">
          {ROLE_OPTIONS.map((r) => (
            <label key={r}>
              <input type="radio" name="comment-role" value={r} checked={role === r} onChange={() => { setRole(r); edit(); }} /> {r}
            </label>
          ))}
        </div>
      </fieldset>

      <label class="comment-field">
        <span>{TEXTS.case}</span>
        <select value={kase} onChange={(e) => { setKase(e.currentTarget.value); edit(); }}>
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
              <input type="radio" name="comment-rating" value={n} checked={rating === n} onChange={() => { setRating(n); edit(); }} /> {n}
            </label>
          ))}
          <label>
            <input type="radio" name="comment-rating" value="" checked={rating === null} onChange={() => { setRating(null); edit(); }} /> {TEXTS.noRating}
          </label>
        </div>
      </fieldset>

      <label class="comment-field">
        <span>{TEXTS.text}</span>
        <textarea rows={5} maxLength={MAX_TEXT} value={text} aria-describedby="comment-counter" onInput={(e) => { setText(e.currentTarget.value.slice(0, MAX_TEXT)); edit(); }} />
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
          <textarea rows={8} readOnly value={body} />
        </label>
      )}
    </div>
  );
}
