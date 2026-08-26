/* Alle Grafiken werden als SVG erzeugt. Kein einziges Bild-Asset nötig,
   ausser den optionalen Hintergrund-Platten der Tatorte. */

const NS = 'http://www.w3.org/2000/svg';

/* deterministischer Zufall, damit dieselbe Spur immer gleich aussieht */
function rnd(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const wrap = (vb, inner, cls = '') =>
  `<svg xmlns="${NS}" viewBox="${vb}" class="${cls}" role="img" aria-hidden="true">${inner}</svg>`;

/* ---------- Fingerabdrücke ---------- */

export function fingerabdruck(typ, seed = 7) {
  const r = rnd(seed * 97 + 3);
  const pad = `<path d="M50 4 C74 4 88 22 88 50 C88 84 72 116 50 116 C28 116 12 84 12 50 C12 22 26 4 50 4 Z"/>`;
  let ridges = '';
  const jit = () => (r() - 0.5) * 3.2;

  if (typ === 'bogen') {
    for (let i = 0; i < 13; i++) {
      const y = 104 - i * 4.4, peak = 92 - i * 6.4 + jit();
      ridges += `<path d="M6 ${y + 6} Q28 ${peak + 8} 50 ${peak} Q72 ${peak + 8} 94 ${y + 6}" />`;
    }
  } else if (typ === 'schleife') {
    for (let i = 0; i < 13; i++) {
      const y = 106 - i * 4.2, t = i * 3.1;
      ridges += `<path d="M6 ${y + 4} Q26 ${y - 22 - t} 52 ${y - 30 - t} Q76 ${y - 34 - t} 74 ${y - 8 - t} Q72 ${y + 12 - t} 52 ${y + 4 - t}" />`;
    }
    ridges += `<path d="M22 108 L36 74" />`;
  } else if (typ === 'wirbel') {
    for (let i = 0; i < 8; i++) {
      const rr = 6 + i * 5.2;
      ridges += `<ellipse cx="50" cy="58" rx="${rr}" ry="${rr * 1.12}" />`;
    }
    for (let i = 0; i < 4; i++) {
      const y = 104 - i * 5;
      ridges += `<path d="M6 ${y} Q50 ${y + 12} 94 ${y}" />`;
      ridges += `<path d="M6 ${18 - i * 4} Q50 ${6 - i * 4} 94 ${18 - i * 4}" />`;
    }
  } else { /* doppel */
    for (let i = 0; i < 6; i++) {
      const rr = 5 + i * 4.4;
      ridges += `<ellipse cx="36" cy="44" rx="${rr}" ry="${rr}" />`;
      ridges += `<ellipse cx="64" cy="76" rx="${rr}" ry="${rr}" />`;
    }
    for (let i = 0; i < 4; i++)
      ridges += `<path d="M6 ${102 - i * 5} Q50 ${118 - i * 5} 94 ${100 - i * 5}" />`;
  }

  return wrap('0 0 100 120', `
    <defs><clipPath id="fp${typ}${seed}">${pad}</clipPath></defs>
    <g clip-path="url(#fp${typ}${seed})">
      <rect x="0" y="0" width="100" height="120" fill="#0f2136"/>
      <g fill="none" stroke="#d8e8ff" stroke-width="2.4" stroke-linecap="round">${ridges}</g>
    </g>
    <g fill="none" stroke="#5b82ad" stroke-width="2.5">${pad}</g>`);
}

/* ---------- Schuhsohlen ---------- */

export function sohle(muster) {
  const outline = `M50 6 C74 6 84 26 84 54 C84 76 80 92 78 112 C76 134 66 154 50 154 C34 154 24 134 22 112 C20 92 16 76 16 54 C16 26 26 6 50 6 Z`;
  let inner = '';
  if (muster === 'zickzack') {
    for (let y = 18; y < 148; y += 11)
      inner += `<path d="M22 ${y} L36 ${y + 7} L50 ${y} L64 ${y + 7} L78 ${y}"/>`;
  } else if (muster === 'punkte') {
    for (let y = 18; y < 148; y += 12)
      for (let x = 24; x < 80; x += 12)
        inner += `<circle cx="${x}" cy="${y}" r="3.4" fill="#d8e8ff" stroke="none"/>`;
  } else if (muster === 'wellen') {
    for (let y = 18; y < 148; y += 10)
      inner += `<path d="M20 ${y} Q35 ${y - 6} 50 ${y} T80 ${y}"/>`;
  } else if (muster === 'raster') {
    for (let y = 18; y < 150; y += 12) inner += `<path d="M20 ${y} L80 ${y}"/>`;
    for (let x = 24; x <= 76; x += 13) inner += `<path d="M${x} 14 L${x} 150"/>`;
  } else { /* stollen */
    for (let y = 20; y < 148; y += 16)
      for (let x = 26; x < 80; x += 18)
        inner += `<rect x="${x - 7}" y="${y - 6}" width="14" height="12" rx="3" fill="#d8e8ff" stroke="none"/>`;
  }
  return wrap('0 0 100 160', `
    <defs><clipPath id="so${muster}"><path d="${outline}"/></clipPath></defs>
    <path d="${outline}" fill="#12263d"/>
    <g clip-path="url(#so${muster})" fill="none" stroke="#d8e8ff" stroke-width="2.6" stroke-linecap="round">${inner}</g>
    <path d="${outline}" fill="none" stroke="#5b82ad" stroke-width="3"/>`);
}

/* ---------- Reifenspuren ---------- */

export function reifen(typ) {
  let inner = '';
  if (typ === 'rennvelo') {
    for (let y = 6; y < 154; y += 8) inner += `<path d="M40 ${y} L60 ${y}"/>`;
    inner += `<path d="M50 4 L50 156" stroke-width="1.6"/>`;
  } else if (typ === 'mountainbike') {
    for (let y = 8; y < 152; y += 15) {
      inner += `<rect x="26" y="${y}" width="14" height="10" rx="2" fill="#d8e8ff" stroke="none"/>`;
      inner += `<rect x="60" y="${y + 7}" width="14" height="10" rx="2" fill="#d8e8ff" stroke="none"/>`;
    }
  } else if (typ === 'trottinett') {
    inner += `<path d="M44 4 L44 156"/><path d="M56 4 L56 156"/>`;
  } else { /* kinderwagen */
    for (let y = 8; y < 152; y += 10)
      inner += `<path d="M32 ${y} Q50 ${y + 6} 68 ${y}"/>`;
  }
  return wrap('0 0 100 160', `
    <rect x="18" y="2" width="64" height="156" rx="10" fill="#12263d" stroke="#5b82ad" stroke-width="3"/>
    <g fill="none" stroke="#d8e8ff" stroke-width="3" stroke-linecap="round">${inner}</g>`);
}

/* ---------- Fasern / Haare ---------- */

export function faser(farbe, wellig = false) {
  const d = wellig
    ? 'M10 80 Q30 30 50 80 T90 80'
    : 'M8 108 C34 78 56 46 92 16';
  return wrap('0 0 100 120', `
    <circle cx="50" cy="60" r="48" fill="#0f2136" stroke="#5b82ad" stroke-width="3"/>
    <g stroke="${farbe}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".95">
      <path d="${d}"/>
    </g>
    <g stroke="${farbe}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6">
      <path d="${d}" transform="translate(6,14)"/>
    </g>`);
}

/* ---------- Handschrift ---------- */

export function handschrift(stil) {
  const skew = { steil: 0, rechts: -14, links: 12 }[stil] ?? 0;
  const dick = stil === 'dick' ? 7 : 4;
  return wrap('0 0 160 90', `
    <rect x="0" y="0" width="160" height="90" rx="8" fill="#f4efe2"/>
    <g transform="skewX(${skew}) translate(${skew < 0 ? 14 : 0},0)"
       fill="none" stroke="#1b2f4a" stroke-width="${dick}" stroke-linecap="round">
      <path d="M24 62 L34 30 L44 62 M27 52 H41"/>
      <path d="M56 30 V62 M56 30 q16 0 16 10 t-16 10 M56 50 q18 0 18 12"/>
      <path d="M92 40 q-12 0 -12 11 t12 11 q12 0 12 -11 t-12 -11"/>
      <path d="M118 62 V38 q12 -10 12 6 V62"/>
    </g>
    <path d="M14 72 H146" stroke="#c3b9a3" stroke-width="2"/>`);
}

/* ---------- Analoguhr ---------- */

export function uhr(h, m) {
  const ah = ((h % 12) + m / 60) * 30 - 90;
  const am = m * 6 - 90;
  const p = (deg, len) => [50 + Math.cos(deg * Math.PI / 180) * len,
                           50 + Math.sin(deg * Math.PI / 180) * len];
  const [hx, hy] = p(ah, 24), [mx, my] = p(am, 34);
  let ticks = '';
  for (let i = 0; i < 12; i++) {
    const [x1, y1] = p(i * 30 - 90, 38), [x2, y2] = p(i * 30 - 90, 43);
    ticks += `<path d="M${x1} ${y1} L${x2} ${y2}" stroke-width="${i % 3 ? 2 : 3.6}"/>`;
  }
  return wrap('0 0 100 100', `
    <circle cx="50" cy="50" r="46" fill="#f4efe2" stroke="#5b82ad" stroke-width="3"/>
    <g stroke="#1b2f4a" stroke-linecap="round">${ticks}</g>
    <path d="M50 50 L${hx} ${hy}" stroke="#1b2f4a" stroke-width="6" stroke-linecap="round"/>
    <path d="M50 50 L${mx} ${my}" stroke="#1b2f4a" stroke-width="4" stroke-linecap="round"/>
    <circle cx="50" cy="50" r="4" fill="#d98f22"/>`);
}

/* ---------- Lineal mit Abdruck ---------- */

export function lineal(cm) {
  const px = cm * 9;
  let marks = '';
  for (let i = 0; i <= 30; i++) {
    const x = 10 + i * 9;
    marks += `<path d="M${x} 96 L${x} ${i % 5 ? 88 : 80}"/>`;
    if (i % 5 === 0) marks += `<text x="${x}" y="${74}" font-size="9" fill="#1b2f4a"
      text-anchor="middle" font-family="system-ui">${i}</text>`;
  }
  return wrap('0 0 290 110', `
    <rect x="6" y="6" width="278" height="58" rx="8" fill="#12263d" stroke="#5b82ad" stroke-width="2"/>
    <rect x="10" y="14" width="${px}" height="42" rx="12" fill="#2b4666" stroke="#d8e8ff" stroke-width="2"/>
    <rect x="4" y="70" width="282" height="34" rx="5" fill="#f4efe2"/>
    <g stroke="#1b2f4a" stroke-width="1.6">${marks}</g>`);
}

/* ---------- Spuren-Icons ---------- */

const ICONS = {
  fingerabdruck: `<path d="M12 3c4 0 7 3.4 7 8 0 3-.6 6-1.6 8.4M12 3C8 3 5 6.4 5 11c0 2 .3 3.6.8 5M8.6 20.6C9.6 18.4 10 15.6 10 12.6 10 11 11 10 12 10s2 1 2 2.6c0 3-.4 5.4-1 7.4M12 6.5c2.6 0 4.4 2.2 4.4 5.6 0 2.6-.4 5-1 7"/>`,
  schuh:         `<path d="M3 16h8l4-3 4 1c1.4.4 2 1.2 2 2.4V19H3z"/><path d="M3 16V9l4-1 2 3"/>`,
  reifen:        `<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4v4M12 16v4M4 12h4M16 12h4"/>`,
  haar:          `<path d="M4 20c4-2 5-6 4-10M9 20c4-3 5-8 3-13M14 20c4-4 4-9 2-14"/>`,
  zettel:        `<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 12h7M9 16h5"/>`,
  kruemel:       `<circle cx="8" cy="14" r="2"/><circle cx="14" cy="10" r="2.4"/><circle cx="16" cy="16" r="1.6"/><circle cx="10" cy="8" r="1.4"/>`,
  farbe:         `<path d="M5 10a7 7 0 0 1 14 0v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/><path d="M9 10h6"/>`,
  schluessel:    `<circle cx="8" cy="14" r="4"/><path d="M11 12l8-8M17 6l2 2M15 8l2 2"/>`,
  ticket:        `<path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z"/><path d="M12 6v10"/>`,
  handschuh:     `<path d="M7 21V9a2 2 0 0 1 4 0V4a1.6 1.6 0 0 1 3.2 0v5.6M14.2 9.6a1.6 1.6 0 0 1 3.2 0V16c0 3-2 5-5 5H7"/>`,
  knopf:         `<circle cx="12" cy="12" r="8"/><circle cx="10" cy="10" r="1.2"/><circle cx="14" cy="10" r="1.2"/><circle cx="10" cy="14" r="1.2"/><circle cx="14" cy="14" r="1.2"/>`,
  pfote:         `<circle cx="7" cy="10" r="2"/><circle cx="12" cy="7.5" r="2.2"/><circle cx="17" cy="10" r="2"/><path d="M12 12c3.2 0 5 2 5 4.4S15 20 12 20s-5-1.2-5-3.6S8.8 12 12 12z"/>`,
  leiter:        `<path d="M7 3v18M17 3v18M7 8h10M7 13h10M7 18h10"/>`,
  glas:          `<path d="M6 4h12l-1 5a5 5 0 0 1-10 0z"/><path d="M12 14v6M8 20h8"/>`,
  fenster:       `<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M12 4v16M4 12h16"/>`,
  velo:          `<circle cx="6" cy="16" r="4"/><circle cx="18" cy="16" r="4"/><path d="M6 16l4-8h5l3 8M9 8h4"/>`
};

export function icon(name, stroke = '#ffd08a', w = 24) {
  const d = ICONS[name] || ICONS.zettel;
  return `<svg xmlns="${NS}" viewBox="0 0 24 24" width="${w}" height="${w}" fill="none"
    stroke="${stroke}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true">${d}</svg>`;
}

/* Marker für den Tatort: Ring + Icon */
export function clueMarker(name) {
  return `<svg xmlns="${NS}" viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
    <circle class="clue__ring" cx="32" cy="32" r="27" fill="rgba(13,24,38,.55)"
      stroke="#ffb547" stroke-width="3"/>
    <g transform="translate(20,20) scale(1)" fill="none" stroke="#ffe0ad"
       stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      ${ICONS[name] || ICONS.zettel}
    </g></svg>`;
}

/* ---------- Gesichter (Fallback ohne Bilder) ---------- */

const HAUT = ['#f0c9a4', '#e0aa7e', '#c98b5f', '#9c6440', '#f6ddc0'];
const HAARF = ['#3a2a1c', '#7a4a22', '#d9b45c', '#b1442c', '#2b2b2b', '#8e8e8e'];

export function gesicht(seed = 1, opts = {}) {
  const r = rnd(seed * 131 + 11);
  const haut = opts.haut || HAUT[Math.floor(r() * HAUT.length)];
  const haar = opts.haar || HAARF[Math.floor(r() * HAARF.length)];
  const lang = opts.lang ?? r() > 0.5;
  const brille = opts.brille ?? r() > 0.7;
  const muetze = opts.muetze ?? false;
  return wrap('0 0 100 100', `
    <rect width="100" height="100" rx="14" fill="#24405f"/>
    ${lang ? `<path d="M18 92 V52 a32 32 0 0 1 64 0 V92" fill="${haar}"/>` : ''}
    <circle cx="50" cy="52" r="27" fill="${haut}"/>
    <path d="M23 48 a27 27 0 0 1 54 0 q-27 -14 -54 0z" fill="${haar}"/>
    ${muetze ? `<path d="M20 44 q30 -26 60 0 z" fill="#2e6bb0"/><rect x="18" y="42" width="64" height="7" rx="3.5" fill="#1f4d84"/>` : ''}
    <circle cx="40" cy="52" r="3.2" fill="#20323f"/>
    <circle cx="60" cy="52" r="3.2" fill="#20323f"/>
    ${brille ? `<g fill="none" stroke="#20323f" stroke-width="2.4">
      <circle cx="40" cy="52" r="8"/><circle cx="60" cy="52" r="8"/><path d="M48 52h4"/></g>` : ''}
    <path d="M42 66 q8 6 16 0" fill="none" stroke="#7a3f30" stroke-width="3" stroke-linecap="round"/>
    <path d="M14 100 q10 -18 36 -18 t36 18 z" fill="#3d6ea8"/>`);
}

export function hund() {
  return wrap('0 0 100 100', `
    <rect width="100" height="100" rx="14" fill="#24405f"/>
    <path d="M22 34 L18 8 L40 22 Z" fill="#8a5a34"/>
    <path d="M78 34 L82 8 L60 22 Z" fill="#8a5a34"/>
    <ellipse cx="50" cy="56" rx="30" ry="28" fill="#a9713f"/>
    <ellipse cx="50" cy="72" rx="17" ry="14" fill="#e2c39c"/>
    <circle cx="39" cy="50" r="3.6" fill="#20323f"/>
    <circle cx="61" cy="50" r="3.6" fill="#20323f"/>
    <ellipse cx="50" cy="66" rx="6" ry="4.6" fill="#20323f"/>
    <path d="M50 71 v5 M50 76 q-7 5 -12 1 M50 76 q7 5 12 1"
      fill="none" stroke="#6b4526" stroke-width="2.4" stroke-linecap="round"/>`);
}

export function polizist() {
  return gesicht(3, { muetze: true, haut: '#e8bd92', haar: '#4a3320', lang: false, brille: false });
}

/* ---------- Fallback-Szenen ---------- */

export function szeneFallback(kind) {
  const himmel = `<defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1b3f6b"/><stop offset="1" stop-color="#2f6a8f"/>
      </linearGradient>
      <linearGradient id="grd" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2f5a3a"/><stop offset="1" stop-color="#1d3a26"/>
      </linearGradient>
    </defs>
    <rect width="1000" height="750" fill="url(#sky)"/>
    <path d="M0 430 L150 350 L280 420 L420 330 L560 420 L700 340 L860 420 L1000 360 L1000 470 L0 470 Z"
      fill="#20456b" opacity=".8"/>
    <rect y="460" width="1000" height="290" fill="url(#grd)"/>`;

  const haus = (x, w, h, farbe, dach) => `
    <rect x="${x}" y="${470 - h}" width="${w}" height="${h}" fill="${farbe}"/>
    <path d="M${x - 12} ${470 - h} L${x + w / 2} ${470 - h - 60} L${x + w + 12} ${470 - h} Z" fill="${dach}"/>
    ${Array.from({ length: Math.floor(h / 70) }, (_, r) =>
      Array.from({ length: Math.floor(w / 60) }, (_, c) =>
        `<rect x="${x + 18 + c * 60}" y="${470 - h + 26 + r * 70}" width="30" height="38" rx="3" fill="#ffd98a" opacity=".85"/>`
      ).join('')).join('')}`;

  const baum = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})">
      <rect x="-8" y="-40" width="16" height="46" fill="#5a3d22"/>
      <circle cx="0" cy="-64" r="44" fill="#2f6b3d"/>
      <circle cx="-30" cy="-44" r="30" fill="#356f43"/>
      <circle cx="30" cy="-46" r="28" fill="#2a5f36"/></g>`;

  const scenes = {
    schule: `${himmel}
      ${haus(120, 380, 250, '#c8bfae', '#8d3b31')}
      ${haus(560, 300, 190, '#b9c4cd', '#3f5d78')}
      ${baum(880, 470, 1.1)}${baum(60, 470, .8)}
      <rect x="420" y="560" width="260" height="120" rx="10" fill="#6b5033"/>
      <rect x="430" y="548" width="240" height="16" rx="6" fill="#8a6a45"/>
      <rect x="150" y="600" width="180" height="70" rx="12" fill="#3c5c7d"/>`,
    bahnhof: `${himmel}
      ${haus(80, 520, 220, '#b6ac99', '#6b4a3a')}
      <rect x="0" y="470" width="1000" height="120" fill="#3b3f45"/>
      <rect x="0" y="512" width="1000" height="10" fill="#8d949c"/>
      <rect x="0" y="548" width="1000" height="10" fill="#8d949c"/>
      ${Array.from({ length: 14 }, (_, i) => `<rect x="${i * 74}" y="500" width="26" height="70" fill="#5a4632"/>`).join('')}
      <g>${Array.from({ length: 5 }, (_, i) =>
        `<rect x="${140 + i * 140}" y="600" width="90" height="60" rx="8" fill="#2c4a6b"/>
         <circle cx="${162 + i * 140}" cy="668" r="12" fill="#1b2b3d"/>
         <circle cx="${208 + i * 140}" cy="668" r="12" fill="#1b2b3d"/>`).join('')}</g>
      ${baum(930, 470, .9)}`,
    gemeindehaus: `${himmel}
      ${haus(220, 560, 300, '#d6cfc0', '#7a4a3a')}
      <rect x="440" y="330" width="120" height="140" fill="#7c4a2e"/>
      <circle cx="500" cy="200" r="42" fill="#f4efe2" stroke="#7a4a3a" stroke-width="8"/>
      ${baum(120, 500, 1)}${baum(880, 500, 1)}
      <rect x="0" y="640" width="1000" height="110" fill="#4a4d52"/>`,
    museum: `${himmel}
      <rect x="150" y="190" width="700" height="280" fill="#cfc7b6"/>
      <path d="M120 190 L500 80 L880 190 Z" fill="#a8927a"/>
      ${Array.from({ length: 6 }, (_, i) =>
        `<rect x="${200 + i * 110}" y="230" width="46" height="240" rx="6" fill="#e6ded0"/>`).join('')}
      <rect x="0" y="470" width="1000" height="280" fill="#2a3b4d"/>
      <rect x="380" y="500" width="240" height="180" rx="10" fill="#1f2e3d"/>`,
    wald: `${himmel}
      ${baum(120, 500, 1.5)}${baum(300, 470, 1.1)}${baum(520, 520, 1.7)}
      ${baum(720, 480, 1.2)}${baum(900, 520, 1.5)}
      <path d="M0 700 Q300 620 520 690 T1000 660 L1000 750 L0 750 Z" fill="#6b5a3e"/>`
  };
  return wrap('0 0 1000 750', scenes[kind] || scenes.schule, 'scene__svg');
}

export { wrap as svgWrap };
