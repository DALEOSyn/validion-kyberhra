/**
 * Source of the service worker (written to dist/sw.js by vite.config.ts). It precaches the listed own files and
 * answers same-origin GET requests from that cache. It never caches or fetches anything from another origin.
 */
export function serviceWorkerSource(version: string, files: string[]): string {
  return `// Kancelária STOPA service worker. Generated at build time. Caches only the game's own files.
const CACHE = 'stopa-${version}';
const FILES = ${JSON.stringify(['./', ...files.map((f) => './' + f)])};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('stopa-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then((r) => r || caches.match('./')).then((r) => r || fetch(req)),
    );
    return;
  }
  event.respondWith(caches.match(req, { ignoreSearch: true, ignoreVary: true }).then((r) => r || fetch(req)));
});
`;
}
