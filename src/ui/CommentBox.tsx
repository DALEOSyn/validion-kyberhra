import { useEffect, useRef, useState } from 'preact/hooks';
import { feedbackEmail } from '../config.ts';
import { CASE_OPTIONS, type Comment, commentActions, commentBody, commentSubject, type Draft, EMPTY_DRAFT, MAX_TEXT, ROLE_OPTIONS, TEXTS, WHOLE_GAME } from '../feedback/comment.ts';
import { payload, sendComment } from '../feedback/send.ts';

/**
 * The comment box on the „O hre“ screen (section with `comment_box: true` in content/about.yaml). „Kopírovať text“
 * copies the comment to the clipboard, and „Poslať e-mailom“ is a plain mailto: link that opens the adult's own mail
 * app. That link is the only mailto: and the only <a> in the game; the eslint exception is for this file alone and
 * allows only an <a> whose href is `mailtoUrl(...)`. Only when the build sets VITE_FEEDBACK_ENDPOINT, „Odoslať“ posts
 * what the adult typed (src/feedback/send.ts; Red Line 7 as narrowed 2026-11-26). The draft lives in App's memory
 * (props), never in storage; the honeypot lives in this component's state.
 */

/** Build-time address; null hides „Poslať e-mailom“. */
const EMAIL = feedbackEmail(import.meta.env.VITE_FEEDBACK_EMAIL);
/** Build-time endpoint (vite.config.ts `define`); null hides „Odoslať“ and drops the send code from the bundle. */
const ENDPOINT: string | null = __FEEDBACK_ENDPOINT__;

/** The mailto: URL for a comment (RFC 6068: line breaks as CRLF, everything percent-encoded). Pure, unit-tested. */
export function mailtoUrl(email: string, subject: string, body: string): string {
  const enc = (s: string) => encodeURIComponent(s.replace(/\r?\n/g, '\r\n'));
  return `mailto:${encodeURI(email)}?subject=${enc(subject)}&body=${enc(body)}`;
}

type Status = 'idle' | 'needRole' | 'needText' | 'copied' | 'copyFailed' | 'mailOpened' | 'sending' | 'sent' | 'sendFailed' | 'offline';

export function CommentBox({ version, draft, onDraft, email = EMAIL }: { version: string; draft: Draft; onDraft: (d: Draft) => void; email?: string | null }) {
  const [status, setStatus] = useState<Status>('idle');
  const [hp, setHp] = useState('');
  const fallback = useRef<HTMLTextAreaElement>(null);
  const copyButton = useRef<HTMLButtonElement>(null);
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
  useEffect(() => {
    if (status === 'sendFailed' || status === 'offline') copyButton.current?.focus();
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
  const send = async () => {
    if (status === 'sending') return;
    if (problem || !comment || !ENDPOINT) return setStatus(problem ?? 'needRole');
    setStatus('sending');
    const result = await sendComment(ENDPOINT, payload(comment, version, hp));
    if (result === 'sent') {
      onDraft(EMPTY_DRAFT);
      setHp('');
      setStatus('sent');
    } else setStatus(result === 'offline' ? 'offline' : 'sendFailed');
  };
  const mailTo = commentActions(email ?? null).includes('mail') ? email : null;
  // Read straight from the build-time constant (not a prop), so that without an endpoint every `sendTo &&` branch,
  // send() and src/feedback/send.ts are dead code and the bundler drops them.
  const sendTo = ENDPOINT;

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
      <p>{sendTo ? TEXTS.introSend : mailTo ? TEXTS.introEmail : TEXTS.intro}</p>
      {sendTo && <p class="small">{TEXTS.sendNote}</p>}
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

      {sendTo && (
        // Honeypot: off-screen and hidden from assistive tech, never focused by Tab. People leave it empty.
        <div class="comment-hp" aria-hidden="true">
          <label>
            {TEXTS.honeypot}
            <input type="text" name="stopa_hp" tabIndex={-1} autoComplete="off" value={hp} onInput={(e) => setHp(e.currentTarget.value)} />
          </label>
        </div>
      )}

      {mailTo && <p class="small">{sendTo ? TEXTS.mailNoteSend : TEXTS.mailNote}</p>}
      <div class="row">
        {sendTo && (
          <button type="button" class="btn" data-comment-send aria-disabled={status === 'sending' ? 'true' : undefined} onClick={() => void send()}>
            {TEXTS.send}
          </button>
        )}
        {mailTo && (
          <a class={sendTo ? 'btn alt' : 'btn'} data-comment-mail href={mailtoUrl(mailTo, commentSubject(version), body)} onClick={onMail}>
            {TEXTS.mail}
          </a>
        )}
        <button type="button" ref={copyButton} class={mailTo || sendTo ? 'btn alt' : 'btn'} onClick={() => void copy()}>
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
