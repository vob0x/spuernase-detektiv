/* Ton komplett synthetisch – keine Audiodateien, damit die App offline
   klein bleibt. Der AudioContext startet erst nach der ersten Nutzergeste. */

let ctx = null;
let master = null;
let on = true;

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.28;
  master.connect(ctx.destination);
  return ctx;
}

export function unlock() {
  const c = ensure();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
}

export function setSound(v) {
  on = !!v;
  if (master) master.gain.value = on ? 0.28 : 0;
}

export function soundOn() { return on; }

function tone({ f = 440, t = 0, d = 0.16, type = 'sine', vol = 0.6, glide = null }) {
  const c = ensure();
  if (!c || !on) return;
  const now = c.currentTime + t;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f, now);
  if (glide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, glide), now + d);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(vol, now + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, now + d);
  osc.connect(g); g.connect(master);
  osc.start(now); osc.stop(now + d + 0.05);
}

function noise({ t = 0, d = 0.25, vol = 0.25, freq = 1200, q = 0.8 }) {
  const c = ensure();
  if (!c || !on) return;
  const now = c.currentTime + t;
  const len = Math.ceil(c.sampleRate * d);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q;
  const g = c.createGain();
  g.gain.value = vol;
  src.connect(bp); bp.connect(g); g.connect(master);
  src.start(now);
}

export const sfx = {
  tap()    { tone({ f: 520, d: 0.07, type: 'triangle', vol: 0.35 }); },
  page()   { noise({ d: 0.18, freq: 2600, vol: 0.12 }); },
  found()  {
    tone({ f: 660, d: 0.12, type: 'triangle', vol: 0.5 });
    tone({ f: 990, t: 0.09, d: 0.18, type: 'triangle', vol: 0.45 });
  },
  right()  {
    [523, 659, 784, 1047].forEach((f, i) =>
      tone({ f, t: i * 0.075, d: 0.2, type: 'triangle', vol: 0.45 }));
  },
  wrong()  {
    tone({ f: 200, d: 0.22, type: 'sawtooth', vol: 0.3, glide: 130 });
  },
  win()    {
    [523, 659, 784, 1047, 1319].forEach((f, i) =>
      tone({ f, t: i * 0.1, d: 0.32, type: 'triangle', vol: 0.5 }));
    noise({ t: 0.5, d: 0.5, freq: 3000, vol: 0.1 });
  },
  siren()  {
    for (let i = 0; i < 3; i++) {
      tone({ f: 660, t: i * 0.42, d: 0.2, type: 'square', vol: 0.16, glide: 940 });
      tone({ f: 940, t: i * 0.42 + 0.21, d: 0.2, type: 'square', vol: 0.16, glide: 660 });
    }
  },
  bark()   {
    tone({ f: 340, d: 0.1, type: 'sawtooth', vol: 0.3, glide: 190 });
    noise({ d: 0.12, freq: 700, vol: 0.18 });
  },
  stamp()  {
    noise({ d: 0.12, freq: 260, vol: 0.4, q: 0.5 });
    tone({ f: 90, d: 0.14, type: 'sine', vol: 0.4 });
  },
  rank()   {
    [392, 523, 659, 784].forEach((f, i) =>
      tone({ f, t: i * 0.12, d: 0.45, type: 'sine', vol: 0.4 }));
  }
};
