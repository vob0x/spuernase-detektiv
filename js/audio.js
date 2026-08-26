/* Audio-Engine: alles synthetisiert, keine einzige Audiodatei.
   Drei Busse (Musik, Kulisse, Effekte) laufen ueber einen gemeinsamen
   Hall und einen Kompressor, damit nichts uebersteuert. */

let ctx = null, master, komp, hallBus, trocken, busMusik, busAmb, busSfx, rauschBuf, hellBuf;
let tonAn = true, musikAn = false;
let aktuelleKulisse = null, kulisseName = null, gewuenscht = null, musikHandle = null;

/* ---------------- Grundgeruest ---------------- */

function rauschbuffer(sek = 2.5) {
  const len = Math.floor(ctx.sampleRate * sek);
  const b = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;   // leicht braunes Rauschen, angenehmer als weisses
      d[i] = last * 3.2;
    }
  }
  return b;
}

/* Weisses Rauschen fuer alles Helle: Papier, Glas, Besen, Grillen. */
function hellbuffer(sek = 2.5) {
  const len = Math.floor(ctx.sampleRate * sek);
  const b = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  return b;
}

function impulsantwort(sek = 1.5, abfall = 3.2) {
  const len = Math.floor(ctx.sampleRate * sek);
  const b = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      const t = i / len;
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, abfall);
    }
    // eine fruehe Reflexion, damit der Raum nicht nach Blechdose klingt
    const e = Math.floor(ctx.sampleRate * 0.021);
    if (e < len) d[e] += 0.35;
  }
  return b;
}

function aufbauen() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();

  komp = ctx.createDynamicsCompressor();
  komp.threshold.value = -14; komp.knee.value = 22;
  komp.ratio.value = 3.2; komp.attack.value = 0.004; komp.release.value = 0.22;

  master = ctx.createGain();
  master.gain.value = tonAn ? 0.5 : 0;
  master.connect(komp); komp.connect(ctx.destination);

  const hall = ctx.createConvolver();
  hall.buffer = impulsantwort();
  hallBus = ctx.createGain(); hallBus.gain.value = 0.34;
  hallBus.connect(hall); hall.connect(master);

  trocken = ctx.createGain(); trocken.gain.value = 1;
  trocken.connect(master);

  const bus = (v) => { const g = ctx.createGain(); g.gain.value = v;
    g.connect(trocken); const s = ctx.createGain(); s.gain.value = 0.5;
    g.connect(s); s.connect(hallBus); return g; };

  busSfx   = bus(0.85);
  busAmb   = bus(0.0);      // wird beim Wechsel eingeblendet
  busMusik = bus(0.0);

  rauschBuf = rauschbuffer();
  hellBuf = hellbuffer();
  return ctx;
}

export function unlock() {
  const c = aufbauen();
  if (!c) return;
  if (c.state === 'suspended') c.resume().then(anwenden).catch(() => {});
  else anwenden();
}

export function setSound(v) {
  tonAn = !!v;
  if (master) master.gain.setTargetAtTime(tonAn ? 0.5 : 0, ctx.currentTime, 0.05);
  if (!tonAn) { kulisseStoppen(); musikStoppen(); }
  else anwenden();
}
export function soundOn() { return tonAn; }

export function setMusik(v) {
  musikAn = !!v;
  if (musikAn) musikStarten(); else musikStoppen();
}
export function musikLaeuft() { return musikAn; }

/* ---------------- Bausteine ---------------- */

function ton({ f = 440, t = 0, d = 0.2, typ = 'sine', vol = 0.4, ziel = null, glide = null, bus = null }) {
  if (!ctx || !tonAn) return;
  const now = ctx.currentTime + t;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = typ;
  o.frequency.setValueAtTime(f, now);
  if (glide) o.frequency.exponentialRampToValueAtTime(Math.max(30, glide), now + d);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(vol, now + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, now + d);
  o.connect(g); g.connect(ziel || bus || busSfx);
  o.start(now); o.stop(now + d + 0.06);
  return o;
}

/* Vibraphon: Grundton plus zwei leise Obertoene, weicher Anschlag */
function glocke({ f = 660, t = 0, d = 1.1, vol = 0.32, bus = null }) {
  if (!ctx || !tonAn) return;
  [[1, 1], [2.01, 0.34], [3.02, 0.12], [4.98, 0.05]].forEach(([m, a]) => {
    ton({ f: f * m, t, d: d * (1 / Math.sqrt(m)), typ: 'sine', vol: vol * a, bus });
  });
}

function rausch({ t = 0, d = 0.3, vol = 0.2, f = 1200, q = 0.9, typ = 'bandpass', bus = null, glide = null, hell = false }) {
  if (!ctx || !tonAn) return;
  const now = ctx.currentTime + t;
  const s = ctx.createBufferSource();
  s.buffer = hell ? hellBuf : rauschBuf; s.loop = true;
  s.playbackRate.value = 0.8 + Math.random() * 0.4;
  const bp = ctx.createBiquadFilter();
  bp.type = typ; bp.frequency.setValueAtTime(f, now); bp.Q.value = q;
  if (glide) bp.frequency.exponentialRampToValueAtTime(glide, now + d);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(vol, now + Math.min(0.05, d * 0.25));
  g.gain.exponentialRampToValueAtTime(0.0001, now + d);
  s.connect(bp); bp.connect(g); g.connect(bus || busSfx);
  s.start(now); s.stop(now + d + 0.05);
}

/* Dauerhafter Rauschteppich mit langsamer Bewegung */
function teppich({ f = 500, q = 0.7, typ = 'bandpass', vol = 0.1, lfoHz = 0.08, lfoTiefe = 0.5, hell = false }) {
  const s = ctx.createBufferSource();
  s.buffer = hell ? hellBuf : rauschBuf; s.loop = true;
  const bp = ctx.createBiquadFilter();
  bp.type = typ; bp.frequency.value = f; bp.Q.value = q;
  const g = ctx.createGain(); g.gain.value = vol;
  const lfo = ctx.createOscillator(), lg = ctx.createGain();
  lfo.frequency.value = lfoHz; lg.gain.value = vol * lfoTiefe;
  lfo.connect(lg); lg.connect(g.gain);
  s.connect(bp); bp.connect(g); g.connect(busAmb);
  s.start(); lfo.start();
  return () => { try { s.stop(); lfo.stop(); } catch (e) {} };
}

/* Zufaellig wiederkehrendes Ereignis */
function ereignis(fn, minS, maxS) {
  let id = null, tot = false;
  const plan = () => {
    id = setTimeout(() => {
      if (tot) return;
      if (tonAn && ctx && ctx.state === 'running') fn();
      plan();
    }, (minS + Math.random() * (maxS - minS)) * 1000);
  };
  plan();
  return () => { tot = true; clearTimeout(id); };
}

/* ---------------- Naturklaenge ---------------- */

function vogel() {
  const basis = 2300 + Math.random() * 1400;
  const n = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) {
    const t = i * (0.07 + Math.random() * 0.05);
    const o = ton({ f: basis, t, d: 0.075, typ: 'sine', vol: 0.05, bus: busAmb });
    if (o) {
      const now = ctx.currentTime + t;
      o.frequency.setValueAtTime(basis * 0.72, now);
      o.frequency.linearRampToValueAtTime(basis * 1.25, now + 0.035);
      o.frequency.linearRampToValueAtTime(basis * 0.9, now + 0.075);
    }
  }
}

function grille() {
  for (let i = 0; i < 4; i++)
    rausch({ t: i * 0.035, d: 0.022, vol: 0.09, f: 5200, q: 12, bus: busAmb, hell: true });
}

function glockeKirche() {
  glocke({ f: 294, d: 3.4, vol: 0.09, bus: busAmb });
  glocke({ f: 294, t: 1.9, d: 3.4, vol: 0.075, bus: busAmb });
}

function zugVorbei() {
  rausch({ d: 5.5, vol: 0.075, f: 260, q: 0.5, glide: 900, bus: busAmb });
  rausch({ t: 2.6, d: 4.5, vol: 0.055, f: 900, q: 0.5, glide: 220, bus: busAmb });
}

function perronGong() {
  glocke({ f: 784, d: 1.3, vol: 0.07, bus: busAmb });
  glocke({ f: 587, t: 0.42, d: 1.7, vol: 0.07, bus: busAmb });
}

function ticken() {
  rausch({ d: 0.02, vol: 0.14, f: 2600, q: 5, bus: busAmb, hell: true });
}

function knarren() {
  const o = ton({ f: 180, d: 0.9, typ: 'sawtooth', vol: 0.022, glide: 120, bus: busAmb });
  rausch({ d: 0.9, vol: 0.014, f: 700, q: 3, bus: busAmb });
  return o;
}

/* ---------------- Kulissen ---------------- */

const KULISSEN = {
  schule: () => {
    const s = [
      teppich({ f: 260, q: 0.4, typ: 'lowpass', vol: 0.055, lfoHz: 0.05 }),
      teppich({ f: 1900, q: 0.5, vol: 0.10, lfoHz: 0.13, lfoTiefe: 0.6, hell: true }),   // Regen
      ereignis(() => rausch({ d: 0.5, vol: 0.02, f: 420, q: 2, bus: busAmb }), 9, 22)
    ];
    return () => s.forEach(f => f());
  },
  bahnhof: () => {
    const s = [
      teppich({ f: 140, q: 0.4, typ: 'lowpass', vol: 0.07, lfoHz: 0.04 }),
      teppich({ f: 620, q: 0.5, vol: 0.032, lfoHz: 0.09 }),
      ereignis(zugVorbei, 22, 48),
      ereignis(perronGong, 30, 70),
      ereignis(vogel, 8, 20)
    ];
    return () => s.forEach(f => f());
  },
  dorfplatz: () => {
    const s = [
      teppich({ f: 420, q: 0.5, vol: 0.035, lfoHz: 0.07 }),
      teppich({ f: 2900, q: 0.7, vol: 0.07, lfoHz: 0.22, lfoTiefe: 0.35, hell: true }), // Brunnen
      ereignis(vogel, 4, 11),
      ereignis(glockeKirche, 45, 90)
    ];
    return () => s.forEach(f => f());
  },
  museum: () => {
    const s = [
      teppich({ f: 180, q: 0.4, typ: 'lowpass', vol: 0.06, lfoHz: 0.03 }),
      ereignis(ticken, 1.0, 1.05),
      ereignis(knarren, 18, 42)
    ];
    return () => s.forEach(f => f());
  },
  wald: () => {
    const s = [
      teppich({ f: 780, q: 0.4, vol: 0.09, lfoHz: 0.06, lfoTiefe: 0.7, hell: true }),
      teppich({ f: 200, q: 0.4, typ: 'lowpass', vol: 0.03, lfoHz: 0.04 }),
      ereignis(vogel, 3, 9),
      ereignis(grille, 5, 14)
    ];
    return () => s.forEach(f => f());
  },
  buero: () => {
    const s = [
      teppich({ f: 150, q: 0.4, typ: 'lowpass', vol: 0.045, lfoHz: 0.03 }),
      ereignis(ticken, 2.0, 2.05)
    ];
    return () => s.forEach(f => f());
  }
};

function kulisseStoppen() {
  if (aktuelleKulisse) { aktuelleKulisse(); aktuelleKulisse = null; }
  kulisseName = null;
  if (busAmb) busAmb.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
}

function anwenden() {
  if (!ctx || !tonAn) return;
  if (gewuenscht === kulisseName) return;
  if (aktuelleKulisse) { aktuelleKulisse(); aktuelleKulisse = null; }
  kulisseName = gewuenscht;
  if (!gewuenscht || !KULISSEN[gewuenscht]) {
    busAmb.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
    return;
  }
  aktuelleKulisse = KULISSEN[gewuenscht]();
  busAmb.gain.setTargetAtTime(0.9, ctx.currentTime, 0.9);
}

export function kulisse(name) { gewuenscht = name; anwenden(); }

/* ---------------- Musik ---------------- */
/* Leichtes Detektiv-Thema: gehende Bassfigur, Besen auf 2 und 4,
   darueber eine kurze Vibraphon-Melodie. */

const N = (halbton) => 440 * Math.pow(2, halbton / 12);
const AKKORDE = [
  { bass: [-24, -19, -17, -15], mel: [0, 3, 7, 10] },   // Am7
  { bass: [-19, -14, -12, -10], mel: [5, 8, 12, 15] },  // Dm7
  { bass: [-17, -13, -10, -13], mel: [4, 8, 11, 14] },  // E7
  { bass: [-24, -17, -20, -15], mel: [0, 7, 3, 0] }     // Am7
];
const MOTIV = [0, 2, 3, 5, 4, 2, 0, -2];

function musikStarten() {
  aufbauen();
  if (!ctx || musikHandle) return;
  busMusik.gain.setTargetAtTime(0.55, ctx.currentTime, 1.2);
  const bpm = 94, beat = 60 / bpm;
  let takt = 0, naechster = ctx.currentTime + 0.15;

  const schritt = () => {
    while (naechster < ctx.currentTime + 0.5) {
      const a = AKKORDE[takt % 4];
      const t0 = naechster - ctx.currentTime;
      for (let b = 0; b < 4; b++) {
        const t = t0 + b * beat;
        // Bass
        ton({ f: N(a.bass[b]), t, d: beat * 0.82, typ: 'triangle', vol: 0.16, bus: busMusik });
        // Besen auf 2 und 4
        if (b % 2 === 1) rausch({ t, d: 0.17, vol: 0.10, f: 4200, q: 1.0, bus: busMusik, hell: true });
        rausch({ t: t + beat * 0.5, d: 0.07, vol: 0.045, f: 6800, q: 1.5, bus: busMusik, hell: true });
        // Melodie: nur in den Takten 1 und 3, damit es luftig bleibt
        if (takt % 2 === 0) {
          const stufe = MOTIV[(takt * 4 + b) % MOTIV.length];
          const note = a.mel[b % a.mel.length] + (stufe > 3 ? 0 : 0);
          if (b !== 2) glocke({ f: N(note + stufe), t, d: 1.0, vol: 0.075, bus: busMusik });
        }
      }
      naechster += beat * 4;
      takt++;
    }
  };
  schritt();
  musikHandle = setInterval(schritt, 180);
}

function musikStoppen() {
  if (musikHandle) { clearInterval(musikHandle); musikHandle = null; }
  if (busMusik && ctx) busMusik.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
}

/* ---------------- Effekte ---------------- */

export const sfx = {
  tap() { rausch({ d: 0.05, vol: 0.16, f: 1600, q: 2.2, hell: true }); ton({ f: 420, d: 0.05, typ: 'sine', vol: 0.13 }); },
  page() { rausch({ d: 0.24, vol: 0.22, f: 3000, q: 0.6, hell: true });
           rausch({ t: 0.07, d: 0.18, vol: 0.15, f: 5200, q: 0.8, hell: true }); },
  lupe() { rausch({ d: 0.14, vol: 0.075, f: 2400, q: 1.2, glide: 3800, hell: true }); },
  found() {
    glocke({ f: 880, d: 0.9, vol: 0.24 });
    glocke({ f: 1320, t: 0.09, d: 0.7, vol: 0.16 });
    rausch({ t: 0.02, d: 0.22, vol: 0.09, f: 6000, q: 1, hell: true });
  },
  right() { [523, 659, 784, 1047].forEach((f, i) => glocke({ f, t: i * 0.078, d: 0.85, vol: 0.2 })); },
  wrong() {
    ton({ f: 300, d: 0.16, typ: 'triangle', vol: 0.16, glide: 250 });
    ton({ f: 232, t: 0.13, d: 0.28, typ: 'triangle', vol: 0.15, glide: 196 });
  },
  stempel() {
    rausch({ d: 0.1, vol: 0.3, f: 240, q: 0.6 });
    ton({ f: 84, d: 0.14, typ: 'sine', vol: 0.32 });
    rausch({ t: 0.02, d: 0.13, vol: 0.16, f: 2200, q: 0.8, hell: true });
  },
  sirene() {
    for (let i = 0; i < 3; i++) {
      const t = i * 0.62;
      [0, 0.31].forEach((o, k) => {
        const f = k ? 494 : 659;
        ton({ f, t: t + o, d: 0.3, typ: 'square', vol: 0.055 });
        ton({ f: f * 1.5, t: t + o, d: 0.3, typ: 'square', vol: 0.022 });
      });
    }
  },
  bark() {
    ton({ f: 420, d: 0.09, typ: 'sawtooth', vol: 0.16, glide: 190 });
    rausch({ d: 0.1, vol: 0.1, f: 900, q: 2.2, glide: 500 });
    ton({ f: 360, t: 0.16, d: 0.08, typ: 'sawtooth', vol: 0.11, glide: 180 });
    rausch({ t: 0.16, d: 0.09, vol: 0.07, f: 800, q: 2.2, glide: 450 });
  },
  win() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => glocke({ f, t: i * 0.11, d: 1.5, vol: 0.24 }));
    [1568, 2093].forEach((f, i) => glocke({ f, t: 0.6 + i * 0.13, d: 1.8, vol: 0.12 }));
    rausch({ t: 0.55, d: 0.9, vol: 0.1, f: 7000, q: 0.8, hell: true });
  },
  rang() {
    [392, 523, 659, 784, 1047].forEach((f, i) => glocke({ f, t: i * 0.13, d: 1.9, vol: 0.2 }));
  }
};

/* Nur fuer den automatischen Test: misst den Pegel hinter dem Kompressor. */
export function _pegel() {
  aufbauen();
  if (!ctx) return null;
  const an = ctx.createAnalyser();
  an.fftSize = 2048;
  komp.connect(an);
  const buf = new Float32Array(an.fftSize);
  return () => {
    an.getFloatTimeDomainData(buf);
    let s = 0;
    for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
    return Math.sqrt(s / buf.length);
  };
}
