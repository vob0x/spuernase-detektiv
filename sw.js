/* Service Worker – volles Precache, damit das Spiel offline läuft. */

const VERSION = 'spuernase-v7';
const ASSETS = [
  './',
  'index.html',
  'css/app.css',
  'js/app.js',
  'js/art.js',
  'js/audio.js',
  'js/cases.js',
  'js/state.js',
  'js/voice.js',
  'js/voice-liste.js',
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
  'assets/img/tatort-5.webp',
  'assets/portraits/aaron.webp',
  'assets/portraits/ammann.webp',
  'assets/portraits/baertschi.webp',
  'assets/portraits/beeler.webp',
  'assets/portraits/bruennli.webp',
  'assets/portraits/dario.webp',
  'assets/portraits/egli.webp',
  'assets/portraits/enia.webp',
  'assets/portraits/frei.webp',
  'assets/portraits/huebscher.webp',
  'assets/portraits/jill.webp',
  'assets/portraits/kevin.webp',
  'assets/portraits/kunz.webp',
  'assets/portraits/livia.webp',
  'assets/portraits/luis.webp',
  'assets/portraits/mira.webp',
  'assets/portraits/nina.webp',
  'assets/portraits/nora.webp',
  'assets/portraits/odermatt.webp',
  'assets/portraits/roesti-froh.webp',
  'assets/portraits/roesti.webp',
  'assets/portraits/ruben.webp',
  'assets/portraits/rueegg.webp',
  'assets/portraits/selina.webp',
  'assets/portraits/steiner.webp',
  'assets/portraits/sutter.webp',
  'assets/portraits/timo.webp',
  'assets/portraits/zaugg.webp'
];

/* 135 Sprachaufnahmen (~4,9 MB). Seit dem Wechsel auf Gemini TTS sind sie
   laenger – im Schnitt 4,65 statt 2,86 Sekunden – und damit rund 60 % groesser.
   Werden im Hintergrund nachgeladen, damit die Installation nicht daran haengt. */
const STIMMEN = [
  'assets/voice/f1-auf0.mp3',
  'assets/voice/f1-auf1.mp3',
  'assets/voice/f1-auf2.mp3',
  'assets/voice/f1-intro.mp3',
  'assets/voice/f1-lab0-e.mp3',
  'assets/voice/f1-lab0-f.mp3',
  'assets/voice/f1-lin0-f.mp3',
  'assets/voice/f1-lin0-w.mp3',
  'assets/voice/f1-s1.mp3',
  'assets/voice/f1-s2.mp3',
  'assets/voice/f1-s3.mp3',
  'assets/voice/f1-wusst.mp3',
  'assets/voice/f2-auf0.mp3',
  'assets/voice/f2-auf1.mp3',
  'assets/voice/f2-auf2.mp3',
  'assets/voice/f2-intro.mp3',
  'assets/voice/f2-lab0-e.mp3',
  'assets/voice/f2-lab0-f.mp3',
  'assets/voice/f2-lab1-e.mp3',
  'assets/voice/f2-lab1-f.mp3',
  'assets/voice/f2-lin0-f.mp3',
  'assets/voice/f2-lin0-w.mp3',
  'assets/voice/f2-lin1-f.mp3',
  'assets/voice/f2-lin1-w.mp3',
  'assets/voice/f2-s1.mp3',
  'assets/voice/f2-s2.mp3',
  'assets/voice/f2-s3.mp3',
  'assets/voice/f2-s4.mp3',
  'assets/voice/f2-verf-f.mp3',
  'assets/voice/f2-verf-z.mp3',
  'assets/voice/f2-wusst.mp3',
  'assets/voice/f3-auf0.mp3',
  'assets/voice/f3-auf1.mp3',
  'assets/voice/f3-auf2.mp3',
  'assets/voice/f3-intro.mp3',
  'assets/voice/f3-lin0-f.mp3',
  'assets/voice/f3-lin0-w.mp3',
  'assets/voice/f3-lin1-f.mp3',
  'assets/voice/f3-lin1-w.mp3',
  'assets/voice/f3-s1.mp3',
  'assets/voice/f3-s2.mp3',
  'assets/voice/f3-s3.mp3',
  'assets/voice/f3-s4.mp3',
  'assets/voice/f3-wusst.mp3',
  'assets/voice/f3-z0-a0.mp3',
  'assets/voice/f3-z0-a1.mp3',
  'assets/voice/f3-z0-a2.mp3',
  'assets/voice/f3-z1-a0.mp3',
  'assets/voice/f3-z1-a1.mp3',
  'assets/voice/f3-z1-a2.mp3',
  'assets/voice/f3-z1-w.mp3',
  'assets/voice/f3-z2-a0.mp3',
  'assets/voice/f3-z2-a1.mp3',
  'assets/voice/f3-z2-a2.mp3',
  'assets/voice/f3-zeit-f.mp3',
  'assets/voice/f3-zeit-w.mp3',
  'assets/voice/f4-auf0.mp3',
  'assets/voice/f4-auf1.mp3',
  'assets/voice/f4-auf2.mp3',
  'assets/voice/f4-intro.mp3',
  'assets/voice/f4-lab0-e.mp3',
  'assets/voice/f4-lab0-f.mp3',
  'assets/voice/f4-lab1-e.mp3',
  'assets/voice/f4-lab1-f.mp3',
  'assets/voice/f4-lin0-f.mp3',
  'assets/voice/f4-lin0-w.mp3',
  'assets/voice/f4-lin1-f.mp3',
  'assets/voice/f4-lin1-w.mp3',
  'assets/voice/f4-lin2-f.mp3',
  'assets/voice/f4-lin2-w.mp3',
  'assets/voice/f4-s1.mp3',
  'assets/voice/f4-s2.mp3',
  'assets/voice/f4-s3.mp3',
  'assets/voice/f4-s4.mp3',
  'assets/voice/f4-s5.mp3',
  'assets/voice/f4-wusst.mp3',
  'assets/voice/f4-z0-a0.mp3',
  'assets/voice/f4-z0-a1.mp3',
  'assets/voice/f4-z0-a2.mp3',
  'assets/voice/f4-z1-a0.mp3',
  'assets/voice/f4-z1-a1.mp3',
  'assets/voice/f4-z1-a2.mp3',
  'assets/voice/f4-z1-w.mp3',
  'assets/voice/f4-z2-a0.mp3',
  'assets/voice/f4-z2-a1.mp3',
  'assets/voice/f4-z2-a2.mp3',
  'assets/voice/f5-auf0.mp3',
  'assets/voice/f5-auf1.mp3',
  'assets/voice/f5-auf2.mp3',
  'assets/voice/f5-intro.mp3',
  'assets/voice/f5-lab0-e.mp3',
  'assets/voice/f5-lab0-f.mp3',
  'assets/voice/f5-lin0-f.mp3',
  'assets/voice/f5-lin0-w.mp3',
  'assets/voice/f5-lin1-f.mp3',
  'assets/voice/f5-lin1-w.mp3',
  'assets/voice/f5-lin2-f.mp3',
  'assets/voice/f5-lin2-w.mp3',
  'assets/voice/f5-s1.mp3',
  'assets/voice/f5-s2.mp3',
  'assets/voice/f5-s3.mp3',
  'assets/voice/f5-s4.mp3',
  'assets/voice/f5-verf-f.mp3',
  'assets/voice/f5-verf-z.mp3',
  'assets/voice/f5-wusst.mp3',
  'assets/voice/f5-z0-a0.mp3',
  'assets/voice/f5-z0-a1.mp3',
  'assets/voice/f5-z0-a2.mp3',
  'assets/voice/f5-z0-w.mp3',
  'assets/voice/f5-z1-a0.mp3',
  'assets/voice/f5-z1-a1.mp3',
  'assets/voice/f5-z1-a2.mp3',
  'assets/voice/f5-z2-a0.mp3',
  'assets/voice/f5-z2-a1.mp3',
  'assets/voice/f5-z2-a2.mp3',
  'assets/voice/g-alle.mp3',
  'assets/voice/g-befoerdert.mp3',
  'assets/voice/g-drei.mp3',
  'assets/voice/g-dunkel.mp3',
  'assets/voice/g-erwischt.mp3',
  'assets/voice/g-falsch.mp3',
  'assets/voice/g-fastfalsch.mp3',
  'assets/voice/g-hinweis-links.mp3',
  'assets/voice/g-hinweis-oben.mp3',
  'assets/voice/g-hinweis-rechts.mp3',
  'assets/voice/g-hinweis-unten.mp3',
  'assets/voice/g-lineup.mp3',
  'assets/voice/g-quer.mp3',
  'assets/voice/g-richtig.mp3',
  'assets/voice/g-tatort.mp3',
  'assets/voice/g-verhaften.mp3',
  'assets/voice/g-verhaftet.mp3',
  'assets/voice/g-weiter.mp3',
  'assets/voice/g-willkommen.mp3',
  'assets/voice/g-zeuge.mp3'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    // Einzeln, damit eine fehlende Datei nicht die ganze Installation kippt.
    await Promise.all(ASSETS.map(u => cache.add(u).catch(() => {})));
    await self.skipWaiting();
    // Stimmen danach, in kleinen Wellen, ohne die Installation aufzuhalten.
    (async () => {
      for (let i = 0; i < STIMMEN.length; i += 8)
        await Promise.all(STIMMEN.slice(i, i + 8).map(u => cache.add(u).catch(() => {})));
    })();
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
