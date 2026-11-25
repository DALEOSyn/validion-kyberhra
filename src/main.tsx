import { render } from 'preact';
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/app.css';
import { App } from './app.tsx';

const root = document.getElementById('app');
if (root) render(<App />, root);

// Offline play: the service worker caches only this game's own files (generated at build, see scripts/lib/sw.ts).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* offline play is optional; the game works without it */
    });
  });
}
