/* Service Worker – volles Precache, damit das Spiel offline läuft. */

const VERSION = 'spuernase-v1';
const ASSETS = [
  './',
  'index.html',
  'css/app.css',
  'js/app.js',
  'js/art.js',
  'js/audio.js',
  'js/cases.js',
  'js/state.js',
  'manifest.webmanifest',
  'assets/icons/favicon.svg',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/maskable-512.png',
  'assets/icons/apple-touch-icon.png',
  'assets/img/hero.webp',
  'assets/img/tatort-1.webp',
  'assets/img/tatort-2.webp',
  'assets/img/tatort-3.webp',
  'assets/img/tatort-4.webp',
  'assets/img/tatort-5.webp'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    // Einzeln, damit eine fehlende Datei nicht die ganze Installation kippt.
    await Promise.all(ASSETS.map(u => cache.add(u).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const net = await fetch(req);
        const cache = await caches.open(VERSION);
        cache.put(req, net.clone());
        return net;
      } catch (err) {
        return (await caches.match(req)) ||
               (await caches.match('index.html')) ||
               (await caches.match('./')) ||
               new Response('Offline', { status: 503 });
      }
    })());
    return;
  }

  e.respondWith((async () => {
    const hit = await caches.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const net = await fetch(req);
      if (net && net.status === 200 && net.type === 'basic') {
        const cache = await caches.open(VERSION);
        cache.put(req, net.clone());
      }
      return net;
    } catch (err) {
      return new Response('', { status: 504 });
    }
  })());
});
