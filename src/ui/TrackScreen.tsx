import { useRef, useState } from 'preact/hooks';
import type { Case, Track } from '../content/schema.ts';
import { isUnlocked, trackStars, type Progress } from '../engine/progress.ts';
import { maxStars, rankFor } from '../engine/scoring.ts';
import { StageHeading, Stars } from './Heading.tsx';

interface Props {
  track: Track;
  cases: Record<string, Case>;
  progress: Progress;
  onOpen: (caseId: string) => void;
  onReset: () => void;
  onBack: () => void;
}

export function TrackScreen({ track, cases, progress, onOpen, onReset, onBack }: Props) {
  const [confirm, setConfirm] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  const resetBtn = useRef<HTMLButtonElement>(null);
  const total = trackStars(progress, track);
  const rank = rankFor(track.ranks, total);
  const planned = Math.max(track.planned_cases ?? 0, track.cases.length);
  return (
    <section class="screen">
      <StageHeading>{track.tagline}</StageHeading>
      <h1 class="logo">{track.title}</h1>
      {track.placeholder && <p class="placeholder-banner">PLACEHOLDER: príbeh tejto trasy ešte len vzniká.</p>}
      <p class="note">{track.intro}</p>
      <p class="rank">
        {track.rank_label}: {rank.name} · hviezdy spolu: {total}
      </p>
      <ul class="cases">
        {Array.from({ length: planned }, (_, i) => {
          const id = track.cases[i];
          const c = id ? cases[id] : undefined;
          if (!c || !id) {
            return (
              <li key={`planned-${i}`}>
                <button type="button" class="case-card locked" aria-disabled="true">
                  <span class="name">Prípad č. {i + 1}</span>
                  <span class="status">Pribudne v ďalšej verzii.</span>
                </button>
              </li>
            );
          }
          const open = isUnlocked(progress, track, id);
          const cp = progress.cases[id];
          return (
            <li key={id}>
              {/* Locked cases stay focusable (aria-disabled), so keyboard users hear why they are locked (QA F12). */}
              <button type="button" class={`case-card${open ? '' : ' locked'}`} aria-disabled={!open} data-case={id} onClick={() => open && onOpen(id)}>
                <span class="name">
                  Prípad č. {c.number}: {c.title}
                </span>
                <span>{c.summary}</span>
                {cp?.closed ? (
                  <span class="status">
                    Uzavretý · <Stars count={cp.stars} max={maxStars(c)} />
                  </span>
                ) : (
                  <span class="status">{open ? 'Otvorený spis' : 'Zamknutý. Najprv uzavri predchádzajúci prípad.'}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <div class="row">
        <button type="button" class="btn alt" onClick={onBack}>
          Zmeniť trasu
        </button>
        {!confirm ? (
          <button type="button" class="btn alt" ref={resetBtn} onClick={() => setConfirm(true)}>
            Vymazať postup
          </button>
        ) : (
          <>
            <span>Naozaj vymazať všetky hviezdy na oboch trasách?</span>
            <button
              type="button"
              class="btn danger"
              onClick={() => {
                onReset();
                setConfirm(false);
                setResetMsg('Postup je vymazaný.');
                // The confirm buttons unmount: keep focus in place (QA F10).
                requestAnimationFrame(() => resetBtn.current?.focus());
              }}
            >
              Áno, vymazať
            </button>
            <button
              type="button"
              class="btn alt"
              onClick={() => {
                setConfirm(false);
                requestAnimationFrame(() => resetBtn.current?.focus());
              }}
            >
              Nie
            </button>
          </>
        )}
      </div>
      <p class="muted small" aria-live="polite">
        {resetMsg}
      </p>
    </section>
  );
}
