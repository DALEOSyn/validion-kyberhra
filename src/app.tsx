import { useEffect, useRef, useState } from 'preact/hooks';
import { content } from './content/content.ts';
import type { TrackId } from './content/schema.ts';
import { clearProgress, isUnlocked, loadProgress, saveProgress, trackStars, type Progress } from './engine/progress.ts';
import { rankFor } from './engine/scoring.ts';
import { CaseView } from './ui/CaseView.tsx';
import { HelpScreen } from './ui/Help.tsx';
import { StartScreen } from './ui/StartScreen.tsx';
import { TrackScreen } from './ui/TrackScreen.tsx';
import { setSound } from './ui/sound.ts';

type Screen = { name: 'start' } | { name: 'track'; track: TrackId } | { name: 'case'; track: TrackId; caseId: string; play: number };

export function App() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [screen, setScreen] = useState<Screen>({ name: 'start' });
  const [helpOpen, setHelpOpen] = useState(false);
  const helpBtn = useRef<HTMLButtonElement>(null);

  const track = screen.name === 'start' ? undefined : content.tracks.find((t) => t.id === screen.track);
  const theme = track?.theme ?? 'junior';

  useEffect(() => {
    document.documentElement.dataset['theme'] = theme;
  }, [theme]);
  useEffect(() => setSound(progress.sound), [progress.sound]);

  const update = (p: Progress) => {
    setProgress(p);
    saveProgress(p);
  };

  const pickTrack = (id: TrackId) => {
    update({ ...progress, lastTrack: id });
    setScreen({ name: 'track', track: id });
  };

  const closeHelp = () => {
    setHelpOpen(false);
    requestAnimationFrame(() => helpBtn.current?.focus());
  };

  const caseIndex = track && screen.name === 'case' ? track.cases.indexOf(screen.caseId) : -1;
  const rank = track ? rankFor(track.ranks, trackStars(progress, track)) : null;

  let view = null;
  if (screen.name === 'start') {
    view = <StartScreen tracks={content.tracks} onPick={pickTrack} />;
  } else if (track && screen.name === 'track') {
    view = (
      <TrackScreen
        track={track}
        cases={content.cases}
        progress={progress}
        onOpen={(caseId) => setScreen({ name: 'case', track: track.id, caseId, play: Date.now() })}
        onReset={() => setProgress({ ...clearProgress(), sound: progress.sound, lastTrack: progress.lastTrack })}
        onBack={() => setScreen({ name: 'start' })}
      />
    );
  } else if (track && screen.name === 'case') {
    const c = content.cases[screen.caseId];
    const nextId = track.cases[caseIndex + 1];
    const next = nextId && isUnlocked(progress, track, nextId) ? content.cases[nextId] : undefined;
    if (c) {
      view = (
        <CaseView
          key={screen.play}
          c={c}
          track={track}
          progress={progress}
          help={content.help}
          nextCase={next ?? null}
          onProgress={update}
          onNextCase={() => nextId && setScreen({ name: 'case', track: track.id, caseId: nextId, play: Date.now() })}
          onAgain={() => setScreen({ ...screen, play: Date.now() })}
          onList={() => setScreen({ name: 'track', track: track.id })}
        />
      );
    }
  }

  return (
    <div class="wrap">
      <header class="hud">
        <div class="hud-group">
          {screen.name !== 'start' && (
            <button type="button" onClick={() => { setHelpOpen(false); setScreen({ name: 'start' }); }}>
              Úvod
            </button>
          )}
          {track && screen.name === 'case' && (
            <span class="chip">
              Prípad <b>{caseIndex + 1}</b> z {Math.max(track.planned_cases ?? 0, track.cases.length)}
            </span>
          )}
          {track && rank && (
            <span class="chip">
              {track.rank_label}: <b>{rank.name}</b>
            </span>
          )}
        </div>
        <div class="hud-group">
          <button type="button" aria-pressed={progress.sound} onClick={() => update({ ...progress, sound: !progress.sound })}>
            Zvuk: {progress.sound ? 'zap' : 'vyp'}
          </button>
          <button type="button" class="help-btn" ref={helpBtn} aria-expanded={helpOpen} onClick={() => (helpOpen ? closeHelp() : setHelpOpen(true))}>
            Pomoc
          </button>
        </div>
      </header>
      <main class="folder">
        <span class="pin" aria-hidden="true" />
        {helpOpen && <HelpScreen help={content.help} onClose={closeHelp} />}
        <div hidden={helpOpen}>{view}</div>
      </main>
      <footer class="foot">
        {track?.footer ?? 'Všetky aplikácie, hry, mená a adresy v hre sú vymyslené.'} Hra nič neodosiela.
      </footer>
    </div>
  );
}
