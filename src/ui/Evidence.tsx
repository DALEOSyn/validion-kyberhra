import type { Evidence as EvidenceData, Segment } from '../content/schema.ts';

export type TapResult = { kind: 'clue'; id: string; hint: string } | { kind: 'decoy'; hint: string };

interface Props {
  evidence: EvidenceData;
  found: Set<string>;
  missed: Set<string>;
  onTap: (key: string, r: TapResult) => void;
  /** Unique prefix for decoy keys. */
  index: number;
}

function SegmentView({ seg, segKey, found, missed, onTap }: { seg: Segment; segKey: string; found: Set<string>; missed: Set<string>; onTap: Props['onTap'] }) {
  if ('clue' in seg && seg.clue) {
    const clue = seg.clue;
    const hit = found.has(clue.id);
    return (
      <button type="button" class={`tap${hit ? ' hit' : ''}`} aria-pressed={hit} data-clue={clue.id} onClick={() => onTap(clue.id, { kind: 'clue', id: clue.id, hint: clue.hint })}>
        {seg.text}
      </button>
    );
  }
  if ('decoy' in seg && seg.decoy) {
    const hint = seg.decoy;
    return (
      <button type="button" class={`tap${missed.has(segKey) ? ' miss' : ''}`} data-decoy="" onClick={() => onTap(segKey, { kind: 'decoy', hint })}>
        {seg.text}
      </button>
    );
  }
  return <span>{seg.text}</span>;
}

/** One artefact (chat, SMS, e-mail, profile, web page, pop-up, call transcript). Each tappable part is a button. */
export function Evidence({ evidence, found, missed, onTap, index }: Props) {
  return (
    <div class={`evidence ev-${evidence.kind}`} role="group" aria-label={evidence.aria_label}>
      <div class="evbar">
        <span>{evidence.header}</span>
        {evidence.meta && <span>{evidence.meta}</span>}
      </div>
      <div class="ev-body">
        {evidence.lines.map((line, li) => (
          <div key={li} class={`line-${line.style}`}>
            {line.speaker && <span class="speaker">{line.speaker}:</span>}
            {line.segments.map((seg, si) => (
              <SegmentView key={si} seg={seg} segKey={`d${index}-${li}-${si}`} found={found} missed={missed} onTap={onTap} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
