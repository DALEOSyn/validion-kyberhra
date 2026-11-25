import type { Help as HelpData } from '../content/schema.ts';
import { StageHeading } from './Heading.tsx';

/** "Kde nájsť pomoc", rendered from content/help.yaml. Web addresses are plain text: the game opens no links. */
export function HelpScreen({ help, onClose }: { help: HelpData; onClose: () => void }) {
  return (
    <section class="screen" aria-label={help.title}>
      <StageHeading>{help.title}</StageHeading>
      <p>{help.intro}</p>
      <ul class="help-entries">
        {help.entries.map((e) => (
          <li key={e.id} class="help-entry" data-help={e.id}>
            <h3>{e.name}</h3>
            {e.phone && (
              <p class="phone">
                <span class="sr-only">Telefón: </span>
                {e.phone}
              </p>
            )}
            <p>{e.text}</p>
            {(e.url_label ?? e.url) && <p class="muted small">Web: {e.url_label ?? e.url}</p>}
          </li>
        ))}
      </ul>
      <p class="note">{help.trusted_adult}</p>
      <button type="button" class="btn" onClick={onClose}>
        Späť do hry
      </button>
    </section>
  );
}

/** One calm line with the first help entry, shown under every debrief. */
export function HelpLine({ help }: { help: HelpData }) {
  const first = help.entries[0];
  if (!first) return null;
  return (
    <p class="help-line">
      Trápi ťa niečo na internete? {first.name}
      {first.phone && (
        <>
          {' '}
          <strong>{first.phone}</strong>
        </>
      )}
      : {first.text}
    </p>
  );
}
