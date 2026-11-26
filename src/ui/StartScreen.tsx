import type { Track, TrackId } from '../content/schema.ts';
import type { Progress } from '../engine/progress.ts';

/**
 * Neutral start screen that frames both tracks equally (PSYCHOLOGY finding 3). Each track card carries its own
 * theme tokens (data-theme), so the teen card looks like Ozvena and not like part of the junior club.
 */
export function StartScreen({ title, tracks, progress, onPick, pilot = null }: { title: string; tracks: Track[]; progress: Progress; onPick: (id: TrackId) => void; pilot?: string | null }) {
  return (
    <section class="screen">
      {/* An eyebrow line, not a heading: the h1 comes first in the outline (QA F18). */}
      <p class="stamp">{title}</p>
      <h1 class="logo">Vyber si trasu</h1>
      <p class="note">Na internete sa skrývajú falošné ponuky, ukradnuté účty a nastražené odkazy. Vyber si trasu.</p>
      <div class="tracks">
        {tracks.map((t) => {
          const closed = t.cases.filter((id) => progress.cases[id]?.closed).length;
          const total = Math.max(t.planned_cases ?? 0, t.cases.length);
          return (
            <button key={t.id} type="button" class={`track-card track-${t.theme}`} data-theme={t.theme} data-track={t.id} onClick={() => onPick(t.id)}>
              <span class="name">{t.title}</span>
              <span class="small track-age">{t.age}</span>
              <span>{t.tagline}</span>
              <span class="small track-progress">
                Uzavreté: {closed}/{total}
              </span>
            </button>
          );
        })}
      </div>
      <p class="muted small">Hra o tebe nič neodosiela. Postup sa ukladá len v tomto prehliadači.</p>
      {/* A calm pilot label, driven by PILOT in src/config.ts. */}
      {pilot && (
        <p class="pilot-label small" data-testid="pilot-label">
          {pilot}
        </p>
      )}
    </section>
  );
}
