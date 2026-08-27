/* Klangbetten für die Kulissen.

   Der alte Ansatz – weisses Rauschen durch einen breiten Bandpass – klingt
   zwangsläufig nach Rauschen: das Ohr hört einen konstanten Zischteppich und
   keine Umgebung. Regen ist aber kein Rauschen, sondern sehr viele einzelne
   Tropfen; ein Brunnen sind Wasserstösse; Wind ist ein Rauschen, dessen
   Klangfarbe sich dauernd verschiebt.

   Darum wird hier jedes Bett einmal als Sample ausgerechnet – mit tausenden
   Einzelereignissen darin – und danach in Schleife abgespielt. Alles schreibt
   mit Modulo-Umbruch, damit die Schleifenstelle nahtlos ist.

   Reine Rechnung auf Float32Array, ohne Browser-Bezug: dieselbe Datei läuft
   im Spiel und im Prüfwerkzeug unter Node. */

/* Kleiner, wiederholbarer Zufall – so klingt jedes Bett bei jedem Start gleich
   und der Prüflauf misst dieselben Zahlen wie das Spiel. */
export function zufall(saat = 1) {
  let s = saat >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
}

/* Ein abklingender Anschlag, umlaufend in den Puffer geschrieben. */
function schlag(d, pos, dauer, amp, freq, rate, rnd, rauheit = 0.55) {
  const n = Math.max(2, Math.floor(dauer * rate));
  const w = 2 * Math.PI * freq / rate;
  const zerfall = Math.exp(-6.5 / n);
  let a = amp, ph = rnd() * 6.283;
  const L = d.length;
  for (let i = 0; i < n; i++) {
    const k = (pos + i) % L;
    const rein = Math.sin(ph + w * i);
    d[k] += a * (rein * (1 - rauheit) + (rnd() * 2 - 1) * rauheit);
    a *= zerfall;
  }
}

/* Einpoliges Tiefpassfilter, dessen Grenzfrequenz sich langsam bewegt. */
function tiefpassBewegt(d, rate, fMin, fMax, tempo, rnd) {
  const L = d.length;
  let y = 0, phase = rnd() * 6.283;
  for (let i = 0; i < L; i++) {
    const m = 0.5 + 0.5 * Math.sin(phase + i * 2 * Math.PI * tempo / rate);
    const f = fMin + (fMax - fMin) * m;
    const a = 1 - Math.exp(-2 * Math.PI * f / rate);
    y += a * (d[i] - y);
    d[i] = y;
  }
}

/* Braunes Rauschen als Grundlage für Wind und Raumton. */
function braun(d, rate, amp, rnd) {
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    last = (last + 0.02 * (rnd() * 2 - 1)) / 1.02;
    d[i] += last * amp * 3.2;
  }
}

/* Auf Spitzenwert normieren, damit alle Betten vergleichbar laut sind. */
function normieren(d, ziel = 0.9) {
  let max = 0;
  for (let i = 0; i < d.length; i++) max = Math.max(max, Math.abs(d[i]));
  if (max < 1e-9) return d;
  const k = ziel / max;
  for (let i = 0; i < d.length; i++) d[i] *= k;
  return d;
}

/* Weiche Blende über die Schleifennaht, falls doch ein Sprung bleibt. */
function nahtGlaetten(d, rate) {
  const n = Math.floor(rate * 0.02);
  for (let i = 0; i < n; i++) {
    const k = i / n;
    const a = d[i], b = d[d.length - n + i];
    d[i] = a * k + b * (1 - k);
    d[d.length - n + i] = b * k + a * (1 - k);
  }
}

/* ============================ DIE BETTEN ============================ */

/* Regen am Fenster: viele einzelne Tropfen, dazu ein tiefes Prasseln.
   Die Tropfen sind das Entscheidende – ohne sie bleibt es ein Zischen. */
function regen(d, rate, rnd) {
  const L = d.length;
  const tropfen = Math.floor(L / rate * 420);
  for (let i = 0; i < tropfen; i++) {
    const pos = Math.floor(rnd() * L);
    const gross = rnd() < 0.09;
    schlag(d, pos, gross ? 0.035 : 0.010,
           (gross ? 0.5 : 0.16) * (0.4 + rnd()),
           gross ? 900 + rnd() * 700 : 2600 + rnd() * 3800,
           rate, rnd, 0.75);
  }
  // Scheibe und Fensterbrett: einzelne dumpfe Aufschläge
  for (let i = 0; i < Math.floor(L / rate * 9); i++)
    schlag(d, Math.floor(rnd() * L), 0.09, 0.5 + rnd() * 0.4,
           150 + rnd() * 120, rate, rnd, 0.35);
  const grund = new Float32Array(L);
  braun(grund, rate, 0.35, rnd);
  tiefpassBewegt(grund, rate, 300, 800, 0.09, rnd);
  for (let i = 0; i < L; i++) d[i] += grund[i];
}

/* Wind im Laub: braunes Rauschen mit wandernder Klangfarbe und Böen. */
function wind(d, rate, rnd) {
  const L = d.length;
  braun(d, rate, 1.0, rnd);
  tiefpassBewegt(d, rate, 240, 2600, 0.055, rnd);
  // Böen als langsame Lautstärkewelle, damit es atmet statt zu stehen
  let h = 0.5;
  for (let i = 0; i < L; i++) {
    if (i % 512 === 0) h += (rnd() - 0.5) * 0.06;
    h = Math.min(1, Math.max(0.22, h));
    d[i] *= h;
  }
  // einzelne Blätterrascheln
  for (let i = 0; i < Math.floor(L / rate * 26); i++)
    schlag(d, Math.floor(rnd() * L), 0.05, 0.10 + rnd() * 0.1,
           3200 + rnd() * 2600, rate, rnd, 0.95);
}

/* Brunnen: fallendes Wasser aus vielen Stössen, dazu Blasen. */
function wasser(d, rate, rnd) {
  const L = d.length;
  // Nicht zu dicht: ab etwa 400 Stössen pro Sekunde verschmelzen sie zu
  // Rauschen. 170 lassen den einzelnen Wasserstoss noch hörbar.
  for (let i = 0; i < Math.floor(L / rate * 170); i++)
    schlag(d, Math.floor(rnd() * L), 0.012 + rnd() * 0.030,
           0.30 + rnd() * 0.40, 1400 + rnd() * 3600, rate, rnd, 0.8);
  // Blasen: kurze Aufwärtsglissandi
  for (let i = 0; i < Math.floor(L / rate * 14); i++) {
    const pos = Math.floor(rnd() * L);
    const n = Math.floor(0.045 * rate);
    const f0 = 380 + rnd() * 420;
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const f = f0 * (1 + 1.7 * t);
      d[(pos + k) % L] += 0.16 * Math.sin(2 * Math.PI * f * k / rate) * (1 - t) * (1 - t);
    }
  }
  const grund = new Float32Array(L);
  braun(grund, rate, 0.28, rnd);
  tiefpassBewegt(grund, rate, 400, 1000, 0.13, rnd);
  for (let i = 0; i < L; i++) d[i] += grund[i];
}

/* Raumton: sehr tiefes Grundrauschen, fast nur zu spüren.
   Bewusst leise – ein Raum klingt nicht, er trägt nur. */
function raum(d, rate, rnd) {
  braun(d, rate, 1.0, rnd);
  tiefpassBewegt(d, rate, 60, 170, 0.02, rnd);
  // Knacken im Gebälk, sehr vereinzelt
  for (let i = 0; i < Math.floor(d.length / rate * 0.7); i++)
    schlag(d, Math.floor(rnd() * d.length), 0.14, 0.35,
           110 + rnd() * 90, rate, rnd, 0.5);
}

/* Ferne Stimmen auf dem Perron oder Pausenplatz: Sprechrhythmus ohne Worte. */
function stimmen(d, rate, rnd) {
  const L = d.length;
  const silben = Math.floor(L / rate * 5.5);
  for (let i = 0; i < silben; i++) {
    const pos = Math.floor(rnd() * L);
    const n = Math.floor((0.08 + rnd() * 0.12) * rate);
    const f0 = 95 + rnd() * 95;                    // Sprechgrundton
    const fo = [520, 1180, 2400][Math.floor(rnd() * 3)];  // ein Formant
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const huell = Math.sin(Math.PI * t);
      let v = 0;
      for (let h = 1; h <= 6; h++)
        v += Math.sin(2 * Math.PI * f0 * h * k / rate) *
             Math.exp(-Math.pow((f0 * h - fo) / 700, 2)) / h;
      d[(pos + k) % L] += 0.055 * v * huell;
    }
  }
  const grund = new Float32Array(L);
  braun(grund, rate, 0.28, rnd);
  tiefpassBewegt(grund, rate, 120, 400, 0.05, rnd);
  for (let i = 0; i < L; i++) d[i] += grund[i];
}

/* Grillen: regelmässiges Zirpen, viele Tiere leicht versetzt. */
function grillen(d, rate, rnd) {
  const L = d.length;
  for (let tier = 0; tier < 7; tier++) {
    const takt = (0.34 + rnd() * 0.5) * rate;
    const f = 4300 + rnd() * 2600;
    const laut = 0.05 + rnd() * 0.05;
    for (let pos = Math.floor(rnd() * takt); pos < L; pos += takt) {
      for (let s = 0; s < 3; s++)
        schlag(d, Math.floor(pos + s * 0.028 * rate), 0.016, laut, f, rate, rnd, 0.25);
    }
  }
}

export const BETTEN = { regen, wind, wasser, raum, stimmen, grillen };

/* Erzeugt ein Bett als Float32Array. */
export function bettBauen(name, rate, sekunden = 8, saat = 7) {
  const bau = BETTEN[name];
  if (!bau) throw new Error('Unbekanntes Bett: ' + name);
  const d = new Float32Array(Math.floor(rate * sekunden));
  bau(d, rate, zufall(saat));
  normieren(d, 0.9);
  nahtGlaetten(d, rate);
  return d;
}

/* Aus welchen Betten besteht welcher Ort, und wie laut ist jedes.
   Zwei Betten pro Ort reichen: eines trägt, eines charakterisiert. */
export const ORTE = {
  schule:    [['regen', 0.42], ['raum', 0.16], ['stimmen', 0.07]],
  bahnhof:   [['raum', 0.30], ['stimmen', 0.16], ['wind', 0.10]],
  dorfplatz: [['wasser', 0.26], ['wind', 0.11], ['stimmen', 0.06]],
  museum:    [['raum', 0.34]],
  wald:      [['wind', 0.30], ['grillen', 0.16]],
  buero:     [['raum', 0.26], ['regen', 0.07]]
};
