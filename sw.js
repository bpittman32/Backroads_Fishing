// Backroads Fishing offline support.
// The game page is fetched fresh when online (so updates arrive on their own)
// and served from the phone's copy when offline. Fonts and icons are kept once loaded.
const CACHE = 'backroads-v43';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function withTimeout(p, ms) {
  return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // The stats dashboard is not part of the game: always load it straight from the network.
  if (url.pathname.endsWith('/stats.html')) return;

  // The game page: try the network briefly, fall back to the saved copy.
  if (req.mode === 'navigate') {
    e.respondWith(
      withTimeout(fetch(req), 3000)
        .then(res => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); }
          return res;
        })
        .catch(() => caches.match('./index.html', { ignoreSearch: true }))
    );
    return;
  }

  // Google Fonts and our own files: use the saved copy, refresh it in the background.
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (isFont || url.origin === self.location.origin) {
    e.respondWith(
      caches.open(CACHE).then(c =>
        c.match(req, { ignoreSearch: !isFont }).then(hit => {
          const net = fetch(req).then(res => {
            if (res.ok || res.type === 'opaque') c.put(req, res.clone());
            return res;
          }).catch(() => hit);
          return hit || net;
        })
      )
    );
  }
});
