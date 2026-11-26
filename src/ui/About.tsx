import type { About } from '../content/schema.ts';
import { StageHeading } from './Heading.tsx';

/**
 * „O hre“, rendered from content/about.yaml: what the game is, privacy, feedback for adults, the help line.
 * Addresses are plain text: the game opens no links (same rule as the help screen).
 */
export function AboutScreen({ about, onClose }: { about: About; onClose: () => void }) {
  return (
    <section class="screen" aria-label={about.title} data-screen="about">
      <StageHeading>{about.title}</StageHeading>
      {about.sections.map((s) => (
        <section key={s.id} class="about-section" data-about={s.id} aria-labelledby={`about-${s.id}`}>
          <h3 id={`about-${s.id}`}>{s.heading}</h3>
          {s.text.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
          {s.address && (
            <p class="about-address">
              <span class="sr-only">Adresa: </span>
              {s.address}
            </p>
          )}
          {s.address_note && <p class="small">{s.address_note}</p>}
        </section>
      ))}
      <p class="note">{about.help_line}</p>
      <button type="button" class="btn" onClick={onClose}>
        Späť do hry
      </button>
    </section>
  );
}
