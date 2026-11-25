import type { Track, TrackId } from '../content/schema.ts';
import { StageHeading } from './Heading.tsx';

export function StartScreen({ tracks, onPick }: { tracks: Track[]; onPick: (id: TrackId) => void }) {
  return (
    <section class="screen">
      <StageHeading focus={false}>Detektívny klub · Lipovec</StageHeading>
      <h1 class="logo">
        Kancelária <span>STOPA</span>
      </h1>
      <p class="note">Na internete sa skrývajú falošné výhry, kradnuté účty a nastražené odkazy. Vyber si svoju trasu a začni vyšetrovať.</p>
      <div class="tracks">
        {tracks.map((t) => (
          <button key={t.id} type="button" class={`track-card${t.theme === 'teen' ? ' teen-preview' : ''}`} data-track={t.id} onClick={() => onPick(t.id)}>
            <span class="name">{t.title}</span>
            <span class="muted small">{t.age}</span>
            <span>{t.tagline}</span>
          </button>
        ))}
      </div>
      <p class="muted small">Hra nič neodosiela. Postup sa ukladá len v tomto prehliadači.</p>
    </section>
  );
}
