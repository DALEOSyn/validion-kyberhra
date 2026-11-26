import type { HelpEntry, Help as HelpData } from '../content/schema.ts';
import { StageHeading } from './Heading.tsx';

/** "Kde nájsť pomoc", rendered from content/help.yaml. Web addresses are plain text: no links except the comment box's mailto:. */
function ContactCard({ e }: { e: HelpEntry }) {
  return (
    <li class="help-entry" data-help={e.id}>
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
  );
}

/**
 * Contacts first (116 111 on top), then the trusted-adult note, then calm topic cards (Red Line 8: sextortion,
 * grooming, cyberbullying appear only here). Topic cards use the same quiet colours as contacts, no alarm colour.
 */
export function HelpScreen({ help, onClose }: { help: HelpData; onClose: () => void }) {
  const contacts = help.entries.filter((e) => !e.topic);
  const topics = help.entries.filter((e) => e.topic);
  return (
    <section class="screen" aria-label={help.title}>
      <StageHeading>{help.title}</StageHeading>
      <p>{help.intro}</p>
      <ul class="help-entries">
        {contacts.map((e) => (
          <ContactCard key={e.id} e={e} />
        ))}
      </ul>
      <p class="note">{help.trusted_adult}</p>
      {topics.length > 0 && (
        <section class="help-topics" aria-labelledby="help-topics-h">
          <h3 id="help-topics-h">{help.topics_title}</h3>
          <ul class="help-entries">
            {topics.map((e) => (
              <li key={e.id} class="help-entry help-topic" data-help={e.id} data-topic={e.topic}>
                <h4>{e.name}</h4>
                <p>{e.text}</p>
                {e.phone && (
                  <p>
                    <span class="sr-only">Telefón: </span>
                    <strong>{e.phone}</strong>
                  </p>
                )}
                {e.contacts.length > 0 && (
                  <p class="small">
                    Kam sa obrátiť:{' '}
                    {e.contacts
                      .map((id) => help.entries.find((x) => x.id === id))
                      .filter((x): x is HelpEntry => !!x)
                      .map((x) => (x.phone ? `${x.name} ${x.phone}` : x.name))
                      .join(' · ')}
                  </p>
                )}
                <p class="small">{help.trusted_adult}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      <button type="button" class="btn" onClick={onClose}>
        Späť do hry
      </button>
    </section>
  );
}

/** One calm line with the first help entry, shown under every debrief. */
export function HelpLine({ help }: { help: HelpData }) {
  const first = help.entries.find((e) => !e.topic);
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
