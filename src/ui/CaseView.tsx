import { useMemo, useRef, useState } from 'preact/hooks';
import type { Case, CastMember, Decision, DialogueLine, Option, Track } from '../content/schema.ts';
import { clueIds, emptyLockUp, nextAllowed, nextStage, shuffledOrder, tapLockUp, type Stage } from '../engine/flow.ts';
import { bestOptionId, computeStars, emptyRun, maxStars, rankFor, ruleMet, ruleLabel, type CaseRun } from '../engine/scoring.ts';
import { recordCase, trackStars, type Progress } from '../engine/progress.ts';
import { Avatar } from './Avatar.tsx';
import { Evidence, type TapResult } from './Evidence.tsx';
import { StageHeading, Stars } from './Heading.tsx';
import { beep } from './sound.ts';
import { HelpLine } from './Help.tsx';
import type { Help } from '../content/schema.ts';

const LETTERS = ['A', 'B', 'C', 'D'];

export function Dialogue({ lines, cast }: { lines: DialogueLine[]; cast: CastMember[] }) {
  return (
    <ul class="chat">
      {lines.map((l, i) => {
        const who = cast.find((c) => c.id === l.speaker);
        return (
          <li class="msg" key={i}>
            <div class="ava">{who && <Avatar avatar={who.avatar} />}</div>
            <div class="bubble">
              <div class="who">{who ? (who.role ? `${who.name}, ${who.role}` : who.name) : l.speaker}</div>
              {l.text}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function DecisionStep({ decision, cast, onChoose }: { decision: Decision; cast: CastMember[]; onChoose: (o: Option) => void }) {
  return (
    <section class="screen" aria-labelledby="stage-h">
      <StageHeading>{decision.title}</StageHeading>
      {decision.prompt.length > 0 && <Dialogue lines={decision.prompt} cast={cast} />}
      <div class="choices">
        {decision.options.map((o, i) => (
          <button key={o.id} type="button" class="choice" data-option={o.id} onClick={() => onChoose(o)}>
            <span class="k" aria-hidden="true">
              {LETTERS[i]}
            </span>
            <span>{o.text}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ResultStep({ option, button, onNext }: { option: Option; button: string; onNext: () => void }) {
  return (
    <section class="screen">
      <StageHeading>Čo sa stalo ďalej</StageHeading>
      <div class={`result ${option.outcome}`} role="status">
        <p class="label">{option.label}</p>
        {option.later ? (
          <>
            <p>
              <b>Hneď:</b> {option.consequence}
            </p>
            <p>
              <b>Neskôr:</b> {option.later}
            </p>
          </>
        ) : (
          <p>{option.consequence}</p>
        )}
      </div>
      <p class="calm">{option.calm}</p>
      <button type="button" class="btn" onClick={onNext}>
        {button}
      </button>
    </section>
  );
}

function ScanStep({ c, run, setRun, onNext }: { c: Case; run: CaseRun; setRun: (r: CaseRun) => void; onNext: () => void }) {
  const total = useMemo(() => clueIds(c).length, [c]);
  const [missed, setMissed] = useState<Set<string>>(new Set());
  const [tip, setTip] = useState<{ text: string; flag: boolean }>({ text: c.scan.prompt, flag: false });
  const found = new Set(run.found);
  const onTap = (key: string, r: TapResult) => {
    if (r.kind === 'clue') {
      if (!found.has(r.id)) {
        setRun({ ...run, found: [...run.found, r.id] });
        beep(880, 0.09);
      }
      setTip({ text: r.hint, flag: true });
    } else {
      setMissed(new Set([...missed, key]));
      if (!run.decoys.includes(key)) setRun({ ...run, decoys: [...run.decoys, key] });
      setTip({ text: r.hint, flag: false });
      beep(300, 0.08, 'sine');
    }
  };
  /** Points to the artefact with the nearest unfound clue, without giving the clue away. */
  const showTip = () => {
    const ev = c.evidence.find((e) => e.lines.some((l) => l.segments.some((sg) => sg.clue && !found.has(sg.clue.id))));
    setTip({ text: ev ? `Tip: pozri sa ešte raz na „${ev.label}“. Čo od teba chcú a kto to píše?` : 'Všetky stopy sú nájdené. Môžeš pokračovať.', flag: false });
  };
  const n = found.size;
  return (
    <section class="screen">
      {c.evidence.map((ev, i) => (
        <div key={i} class="screen">
          {i === 0 ? <StageHeading>{ev.label}</StageHeading> : <h2 class="stamp">{ev.label}</h2>}
          <Evidence evidence={ev} found={found} missed={missed} onTap={onTap} index={i} />
        </div>
      ))}
      <div class="meter">
        <span>Stopy</span>
        <span class="mag" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => (
            <i key={i} class={i < n ? 'on' : ''} />
          ))}
        </span>
        <span data-testid="clue-count">
          {n}/{total}
        </span>
      </div>
      <p class={`tip${tip.flag ? ' flag' : ''}`} aria-live="polite">
        {tip.text}
      </p>
      <div class="row">
        {n >= c.scan.min_clues ? (
          <button type="button" class="btn" onClick={onNext}>
            {c.scan.button}
          </button>
        ) : (
          <p class="muted small">
            Nájdi ešte {c.scan.min_clues - n} {c.scan.min_clues - n === 1 ? 'stopu' : c.scan.min_clues - n < 5 ? 'stopy' : 'stôp'}.
          </p>
        )}
        <button type="button" class="btn alt" onClick={showTip}>
          Tip
        </button>
      </div>
    </section>
  );
}

function TrustTrapStep({ c, run, setRun, onDone }: { c: Case; run: CaseRun; setRun: (r: CaseRun) => void; onDone: () => void }) {
  const tt = c.trust_or_trap;
  const items = tt?.items ?? [];
  const idx = run.trustTrap.length;
  const [answered, setAnswered] = useState(false);
  const current = answered ? idx - 1 : idx;
  const item = items[current];
  const nextRef = useRef<HTMLButtonElement>(null);
  if (!item || !tt) return null;
  const last = run.trustTrap[current];
  const answer = (a: 'trust' | 'trap') => {
    const ok = a === item.answer;
    setRun({ ...run, trustTrap: [...run.trustTrap, ok] });
    setAnswered(true);
    beep(ok ? 880 : 200, 0.12);
    requestAnimationFrame(() => nextRef.current?.focus());
  };
  const next = () => {
    if (current >= items.length - 1) onDone();
    else setAnswered(false);
  };
  return (
    <section class="screen">
      <StageHeading>{tt.title}</StageHeading>
      <ol class="dots" aria-label={`Karta ${current + 1} z ${items.length}`}>
        {items.map((_, i) => {
          const r = run.trustTrap[i];
          return <li key={i} class={r === true ? 'y' : r === false ? 'n' : i === current ? 'c' : ''} />;
        })}
      </ol>
      <div class="card">
        <p class="src">{item.source}</p>
        <p>{item.text}</p>
      </div>
      {!answered && (
        <div class="tt-btns">
          <button type="button" class="b-safe" onClick={() => answer('trust')}>
            {tt.trust_label}
          </button>
          <button type="button" class="b-trap" onClick={() => answer('trap')}>
            {tt.trap_label}
          </button>
        </div>
      )}
      <p class={`tip${answered && !last ? ' flag' : ''}`} aria-live="polite">
        {answered ? `${last ? 'Správne.' : 'Tentoraz nie.'} ${item.answer === 'trust' ? tt.trust_label : tt.trap_label}. ${item.why}` : 'Je to v poriadku, alebo je to pasca?'}
      </p>
      {answered && (
        <button type="button" class="btn" ref={nextRef} onClick={next}>
          {current >= items.length - 1 ? (c.lock_up ? 'Ďalej' : 'Uzavrieť prípad') : 'Ďalej'}
        </button>
      )}
    </section>
  );
}

function LockUpStep({ c, run, setRun, onDone }: { c: Case; run: CaseRun; setRun: (r: CaseRun) => void; onDone: () => void }) {
  const lock = c.lock_up;
  const pool = useMemo(() => (lock ? shuffledOrder([...lock.steps, ...lock.distractors].map((x) => x.id), c.id) : []), [lock, c.id]);
  const [st, setSt] = useState(emptyLockUp);
  const [msg, setMsg] = useState<{ text: string; flag: boolean }>({ text: '', flag: false });
  const [shake, setShake] = useState<string | null>(null);
  if (!lock) return null;
  const done = st.placed.length === lock.steps.length;
  const text = (id: string) => [...lock.steps, ...lock.distractors].find((x) => x.id === id)?.text ?? id;
  const helpIds = st.slotErrors >= 3 && !done ? nextAllowed(lock, st) : [];
  const tap = (id: string) => {
    const [next, r] = tapLockUp(lock, st, id);
    setSt(next);
    if (r.kind === 'placed') {
      beep(660, 0.08);
      setShake(null);
      if (r.done) {
        setRun({ ...run, lockUpErrors: next.errors });
        setMsg({ text: lock.correct, flag: false });
        beep(990, 0.2);
      } else setMsg({ text: `Krok ${next.placed.length} je na mieste.`, flag: false });
    } else if (r.kind === 'early' || r.kind === 'distractor') {
      setShake(id);
      setMsg({ text: r.hint, flag: true });
      beep(300, 0.12);
    }
  };
  return (
    <section class="screen">
      <StageHeading>{lock.title}</StageHeading>
      <p>{lock.prompt}</p>
      <ol class="steps" aria-label="Poradie krokov">
        {lock.steps.map((_, i) => {
          const id = st.placed[i];
          return (
            <li key={i} class={`step${id ? ' right' : ''}`} data-slot={i + 1}>
              <span class="num" aria-hidden="true">
                {i + 1}.
              </span>
              <span class="txt">{id ? text(id) : <span class="muted">…</span>}</span>
            </li>
          );
        })}
      </ol>
      {!done && (
        <>
          <p class="small muted">Ťukni na krok, ktorý patrí na miesto {st.placed.length + 1}.</p>
          <div class="choices">
            {pool
              .filter((id) => !st.placed.includes(id))
              .map((id) => {
                const rejected = st.rejected.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    class={`choice lock-card${rejected ? ' rejected' : ''}${shake === id ? ' shake' : ''}${helpIds.includes(id) ? ' suggest' : ''}`}
                    data-card={id}
                    aria-disabled={rejected}
                    onClick={() => tap(id)}
                  >
                    <span>{text(id)}</span>
                  </button>
                );
              })}
          </div>
        </>
      )}
      <p class={`tip${msg.flag ? ' flag' : ''}`} aria-live="polite">
        {msg.text || 'Začni krokom, ktorý treba urobiť ako prvý.'}
      </p>
      {done && (
        <button type="button" class="btn" onClick={onDone}>
          Uzavrieť prípad
        </button>
      )}
    </section>
  );
}

interface DebriefInfo {
  stars: number;
  rankBefore: string;
  rankAfter: string;
}

function DebriefStep(props: { c: Case; track: Track; run: CaseRun; info: DebriefInfo; help: Help; nextCase: Case | null; onScene: () => void; onNext: () => void; onAgain: () => void; onList: () => void }) {
  const { c, track, run, info, help, nextCase } = props;
  const d = c.debrief;
  const found = new Set(run.found);
  const seen = d.clues.filter((x) => !x.clue || found.has(x.clue));
  const missed = d.clues.filter((x) => x.clue && !found.has(x.clue));
  const best = run.decision === bestOptionId(c.decision.options);
  return (
    <section class="screen">
      <StageHeading>Spis prípadu č. {c.number}</StageHeading>
      <Stars count={info.stars} max={maxStars(c)} big />
      <div class="closed">
        <span class="rubber" aria-hidden="true">
          UZAVRETÉ
        </span>
        <p class="sr-only">Prípad je uzavretý.</p>
        <h3 class="rule">{d.rule}</h3>
        <div>
          <b>Stopy v tomto prípade</b>
          <ul>
            {seen.map((x, i) => (
              <li key={i}>
                {x.text}
                {x.clue && <span class="sr-only"> (nájdená)</span>}
              </li>
            ))}
          </ul>
        </div>
        {missed.length > 0 && (
          <div>
            <b>Prehliadnuté stopy</b>
            <ul>
              {missed.map((x, i) => (
                <li key={i}>{x.text}</li>
              ))}
            </ul>
          </div>
        )}
        {d.note && <p>{d.note}</p>}
        <div>
          <b>Ak sa to už stalo</b>
          <ol>
            {d.if_it_happened.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ol>
        </div>
        <div>
          <b>Hviezdy</b>
          <ul class="checklist">
            {c.stars.map((r, i) => (
              <li key={i} class={ruleMet(c, r, run) ? 'met' : ''}>
                {ruleLabel(r)}
                <span class="sr-only">{ruleMet(c, r, run) ? ' (splnené)' : ' (zatiaľ nie)'}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div class="story-clue">
        <svg viewBox="0 0 54 54" width="54" height="54" aria-hidden="true">
          <rect x="4" y="8" width="46" height="38" rx="4" fill="#fffaf0" />
          <rect x="4" y="8" width="46" height="8" fill="#ffe066" />
          <circle cx="24" cy="30" r="8" fill="none" stroke="#1f2330" stroke-width="3" />
          <path d="M30 36 L38 44" stroke="#1f2330" stroke-width="4" stroke-linecap="round" />
        </svg>
        <div>
          <b>{d.story_clue.title}</b>
          {d.story_clue.text}
        </div>
      </div>
      {info.rankAfter !== info.rankBefore && (
        <p class="rank" role="status">
          Nový {track.rank_label.toLowerCase()}: {info.rankAfter}.
        </p>
      )}
      {!best && <p class="calm">{d.calm}</p>}
      <div class="row">
        {c.arc_scene && (
          <button type="button" class="btn" onClick={props.onScene}>
            {c.arc_scene.button}
          </button>
        )}
        {nextCase && (
          <button type="button" class={c.arc_scene ? 'btn alt' : 'btn'} onClick={props.onNext}>
            Ďalší prípad: {nextCase.title}
          </button>
        )}
        <button type="button" class={nextCase ? 'btn alt' : 'btn'} onClick={props.onAgain}>
          Hrať znova
        </button>
        <button type="button" class="btn alt" onClick={props.onList}>
          Späť na prípady
        </button>
      </div>
      {d.next_teaser && <p class="muted small">{d.next_teaser}</p>}
      <HelpLine help={help} />
    </section>
  );
}

export interface CaseViewProps {
  c: Case;
  track: Track;
  progress: Progress;
  help: Help;
  nextCase: Case | null;
  onProgress: (p: Progress) => void;
  onNextCase: () => void;
  onAgain: () => void;
  onList: () => void;
}

/** Plays one case: intro, scan, decision, (verify), trust-or-trap, (lock-up), debrief. */
export function CaseView(props: CaseViewProps) {
  const { c, track } = props;
  const [stage, setStage] = useState<Stage>('intro');
  const [run, setRun] = useState<CaseRun>(emptyRun);
  const [info, setInfo] = useState<DebriefInfo | null>(null);

  const advance = (r: CaseRun = run) => {
    const next = nextStage(c, stage);
    if (next === 'debrief') {
      const stars = computeStars(c, r);
      const before = rankFor(track.ranks, trackStars(props.progress, track)).name;
      const p = recordCase(props.progress, c.id, stars);
      const after = rankFor(track.ranks, trackStars(p, track)).name;
      setInfo({ stars, rankBefore: before, rankAfter: after });
      props.onProgress(p);
      beep(1046, 0.3);
    } else {
      beep(520, 0.1);
    }
    setStage(next);
  };

  // The verify step may be retried; the run keeps the first pick (for scoring) and `lastVerify` shows feedback.
  const [lastVerify, setLastVerify] = useState<string | null>(null);
  const choose = (field: 'decision' | 'verify') => (o: Option) => {
    if (field === 'decision') setRun({ ...run, decision: o.id });
    else {
      setLastVerify(o.id);
      if (run.verify === null) setRun({ ...run, verify: o.id });
    }
    beep(o.outcome === 'bad' ? 160 : o.outcome === 'ok' ? 440 : 990, 0.25);
    setStage(field === 'decision' ? 'decision-result' : 'verify-result');
  };
  const chosen = (d: Decision | undefined, id: string | null) => d?.options.find((o) => o.id === id);

  switch (stage) {
    case 'intro':
      return (
        <section class="screen">
          <StageHeading>{c.intro.stamp ?? `Prípad č. ${c.number} · ${c.title}`}</StageHeading>
          {c.placeholder && <p class="placeholder-banner">PLACEHOLDER: tento prípad nahradí scenárista.</p>}
          <Dialogue lines={c.intro.lines} cast={track.cast} />
          <button type="button" class="btn" onClick={() => advance()}>
            {c.intro.button}
          </button>
        </section>
      );
    case 'scan':
      return <ScanStep c={c} run={run} setRun={setRun} onNext={() => advance()} />;
    case 'decision':
      return <DecisionStep decision={c.decision} cast={track.cast} onChoose={choose('decision')} />;
    case 'decision-result': {
      const o = chosen(c.decision, run.decision);
      const button = c.decision.next_button ?? (c.verify ? 'Ďalej: ako to overiť' : (c.trust_or_trap?.start_button ?? 'Ďalej'));
      return o ? <ResultStep option={o} button={button} onNext={() => advance()} /> : null;
    }
    case 'verify':
      return c.verify ? <DecisionStep decision={c.verify} cast={track.cast} onChoose={choose('verify')} /> : null;
    case 'verify-result': {
      const o = chosen(c.verify, lastVerify);
      if (!o) return null;
      if (o.outcome !== 'best') return <ResultStep key={o.id} option={o} button="Vybrať iný spôsob overenia" onNext={() => setStage('verify')} />;
      return <ResultStep key={o.id} option={o} button={c.verify?.next_button ?? c.trust_or_trap?.start_button ?? 'Ďalej'} onNext={() => advance()} />;
    }
    case 'trust-or-trap':
      return <TrustTrapStep c={c} run={run} setRun={setRun} onDone={() => advance()} />;
    case 'lock-up':
      return <LockUpStep c={c} run={run} setRun={setRun} onDone={() => advance()} />;
    case 'debrief':
      return info ? (
        <DebriefStep c={c} track={track} run={run} info={info} help={props.help} nextCase={props.nextCase} onScene={() => setStage('arc-scene')} onNext={props.onNextCase} onAgain={props.onAgain} onList={props.onList} />
      ) : null;
    case 'arc-scene':
      return c.arc_scene ? (
        <section class="screen">
          <StageHeading>{c.arc_scene.stamp}</StageHeading>
          <Dialogue lines={c.arc_scene.lines} cast={track.cast} />
          {c.arc_scene.closing && <p class="note">{c.arc_scene.closing}</p>}
          <div class="row">
            <button type="button" class="btn" onClick={props.onList}>
              Späť na prípady
            </button>
            <button type="button" class="btn alt" onClick={() => setStage('debrief')}>
              Späť na spis
            </button>
          </div>
          <HelpLine help={props.help} />
        </section>
      ) : null;
  }
}
