import { useEffect, useRef, useState } from 'preact/hooks';
import { content } from './content/content.ts';
import type { TrackId } from './content/schema.ts';
import { clearProgress, isUnlocked, loadProgress, saveProgress, trackStars, type Progress } from './engine/progress.ts';
import { rankFor } from './engine/scoring.ts';
import { pilotLabel } from './config.ts';
import { AboutScreen } from './ui/About.tsx';
import { CaseView } from './ui/CaseView.tsx';
import { HelpScreen } from './ui/Help.tsx';
import { StartScreen } from './ui/StartScreen.tsx';
import { TrackScreen } from './ui/TrackScreen.tsx';
import { setSound } from './ui/sound.ts';

/** Neutral game title on the start screen; each track keeps its own name and look inside it. */
export const START_TITLE = 'Lipovec · internetové prípady';

type Screen = { name: 'start' } | { name: 'track'; track: TrackId } | { name: 'case'; track: TrackId; caseId: string; play: number };

export function App() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [screen, setScreen] = useState<Screen>({ name: 'start' });
  const [helpOpen, setHelpOpen] = useState(false);
  /** „O hre“ (pilot build): opened from the start screen only, closed like help (button, Escape). */
  const [aboutOpen, setAboutOpen] = useState(false);
  const helpBtn = useRef<HTMLButtonElement>(null);
  const aboutBtn = useRef<HTMLButtonElement>(null);
  const homeBtn = useRef<HTMLButtonElement>(null);
  const stayBtn = useRef<HTMLButtonElement>(null);
  /** True while a case is mid-play (its stars are saved only at the debrief). CaseView writes it while rendering. */
  const busyRef = useRef(false);
  /** Where the player wants to go when "leave the case?" is open. */
  const [leaveTo, setLeaveTo] = useState<Screen | null>(null);

  const track = screen.name === 'start' ? undefined : content.tracks.find((t) => t.id === screen.track);
  // The start screen is neutral; each track keeps its own branding inside it (PSYCHOLOGY finding 3).
  const theme = track?.theme ?? 'start';

  useEffect(() => {
    document.documentElement.dataset['theme'] = theme;
    document.title = track ? `${track.title} · ${START_TITLE}` : START_TITLE;
  }, [theme, track]);

  // Browser and Android Back (QA F7): one history entry of our own while away from the start screen. Back from a case
  // goes to its track (asking first while the case is mid-play), back from a track goes to the start screen. The
  // entry is never popped by code (history.back() is async and races fast taps); after an in-app return to the start
  // screen it is reused by the next track.
  const away = screen.name !== 'start';
  const pushed = useRef(false);
  useEffect(() => {
    if (away && !pushed.current) {
      history.pushState({ stopa: true }, '');
      pushed.current = true;
    }
  }, [away]);
  // Read through refs: the listener is registered once, so it never sees a stale screen (effects run after paint).
  const screenRef = useRef(screen);
  screenRef.current = screen;
  useEffect(() => {
    const onPop = () => {
      pushed.current = false;
      const cur = screenRef.current;
      if (cur.name === 'case') {
        history.pushState({ stopa: true }, '');
        pushed.current = true;
        const back: Screen = { name: 'track', track: cur.track };
        if (busyRef.current) setLeaveTo(back);
        else setScreen(back);
      } else if (cur.name === 'track') {
        setHelpOpen(false);
        setAboutOpen(false);
        setScreen({ name: 'start' });
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (leaveTo) requestAnimationFrame(() => stayBtn.current?.focus());
  }, [leaveTo]);

  const goHome = () => {
    const home: Screen = { name: 'start' };
    if (screen.name === 'case' && busyRef.current) {
      setLeaveTo(home);
      return;
    }
    setHelpOpen(false);
    setScreen(home);
  };
  const confirmLeave = () => {
    if (!leaveTo) return;
    setHelpOpen(false);
    busyRef.current = false;
    setScreen(leaveTo);
    setLeaveTo(null);
  };
  const stay = () => {
    setLeaveTo(null);
    requestAnimationFrame(() => homeBtn.current?.focus());
  };
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
  const openHelp = () => {
    setAboutOpen(false);
    setHelpOpen(true);
  };
  const closeAbout = () => {
    setAboutOpen(false);
    requestAnimationFrame(() => aboutBtn.current?.focus());
  };
  const openAbout = () => {
    setHelpOpen(false);
    setAboutOpen(true);
  };
  // Escape closes the help screen (QA F9). Registered once and read through a ref, so it works right after opening.
  const helpOpenRef = useRef(helpOpen);
  helpOpenRef.current = helpOpen;
  const aboutOpenRef = useRef(aboutOpen);
  aboutOpenRef.current = aboutOpen;
  // Escape in the leave-case dialog means "Zostať v prípade" (QA F17).
  const leaveOpenRef = useRef(false);
  leaveOpenRef.current = leaveTo !== null;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (leaveOpenRef.current) {
        e.preventDefault();
        setLeaveTo(null);
        requestAnimationFrame(() => homeBtn.current?.focus());
        return;
      }
      if (aboutOpenRef.current) {
        setAboutOpen(false);
        requestAnimationFrame(() => aboutBtn.current?.focus());
        return;
      }
      if (!helpOpenRef.current) return;
      setHelpOpen(false);
      requestAnimationFrame(() => helpBtn.current?.focus());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const caseIndex = track && screen.name === 'case' ? track.cases.indexOf(screen.caseId) : -1;
  const rank = track ? rankFor(track.ranks, trackStars(progress, track)) : null;

  let view = null;
  if (screen.name === 'start') {
    view = <StartScreen title={START_TITLE} tracks={content.tracks} progress={progress} onPick={pickTrack} pilot={pilotLabel(__APP_VERSION__)} />;
  } else if (track && screen.name === 'track') {
    view = (
      <TrackScreen
        track={track}
        cases={content.cases}
        progress={progress}
        onOpen={(caseId) => setScreen({ name: 'case', track: track.id, caseId, play: Date.now() })}
        onReset={() => update({ ...clearProgress(), sound: progress.sound, lastTrack: progress.lastTrack })}
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
          busyRef={busyRef}
        />
      );
    }
  }

  // Case and help screens get a page-level h1 for screen-reader navigation (QA F18); the start and track screens
  // show their own visible h1.
  const caseTitle = screen.name === 'case' ? content.cases[screen.caseId]?.title : undefined;
  const pageH1 = helpOpen ? 'Pomoc' : aboutOpen ? 'O hre' : track && caseTitle ? `${track.title}: ${caseTitle}` : null;
  /** While the leave-case dialog is open, everything else is inert, so the dialog is truly modal (QA F17). */
  const modal = leaveTo !== null;

  return (
    <div class="wrap">
      <header class="hud" inert={modal}>
        <div class="hud-group">
          {screen.name !== 'start' && (
            <button type="button" ref={homeBtn} onClick={goHome}>
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
          {screen.name === 'start' && (
            <button type="button" class="about-btn" ref={aboutBtn} aria-expanded={aboutOpen} onClick={() => (aboutOpen ? closeAbout() : openAbout())}>
              O hre
            </button>
          )}
          <button type="button" class="help-btn" ref={helpBtn} aria-expanded={helpOpen} onClick={() => (helpOpen ? closeHelp() : openHelp())}>
            Pomoc
          </button>
        </div>
      </header>
      <main class="folder">
        <span class="pin" aria-hidden="true" />
        {leaveTo && (
          <div class="leave" role="alertdialog" aria-modal="true" aria-labelledby="leave-h" aria-describedby="leave-d">
            <p id="leave-h" class="leave-title">
              Odísť z prípadu?
            </p>
            <p id="leave-d">Rozohraný prípad sa neuloží. Hviezdy sa ukladajú až v spise.</p>
            <div class="row">
              <button type="button" class="btn" ref={stayBtn} onClick={stay}>
                Zostať v prípade
              </button>
              <button type="button" class="btn alt" onClick={confirmLeave}>
                Odísť
              </button>
            </div>
          </div>
        )}
        <div inert={modal}>
          {pageH1 && <h1 class="sr-only">{pageH1}</h1>}
          {helpOpen && <HelpScreen help={content.help} onClose={closeHelp} />}
          {aboutOpen && !helpOpen && <AboutScreen about={content.about} onClose={closeAbout} />}
          <div hidden={helpOpen || aboutOpen}>{view}</div>
        </div>
      </main>
      <footer class="foot" inert={modal}>
        {track?.footer ?? 'Všetky aplikácie, hry, mená a adresy v hre sú vymyslené.'} Hra nič neodosiela.
      </footer>
    </div>
  );
}
