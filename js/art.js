/* Alle Beweismittel werden prozedural als SVG gezeichnet.
   Grund: Probe und richtige Antwort muessen garantiert identisch aussehen —
   das kann eine Bildgenerierung nicht zusichern. */

const NS = 'http://www.w3.org/2000/svg';

const PAPIER = '#f3ecdd';
const TINTE  = '#2a2f3a';
const GRAU   = '#8a8577';
const ROT    = '#b0341d';

const svg = (vb, inner, cls = '') =>
  `<svg xmlns="${NS}" viewBox="${vb}" class="${cls}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${inner}</svg>`;

const pfad = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');

/* Papierkorn und Vignette, einmal definiert und ueberall wiederverwendet */
const FILTER = `
<filter id="korn" x="-5%" y="-5%" width="110%" height="110%">
  <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="7" result="n"/>
  <feColorMatrix in="n" type="saturate" values="0"/>
  <feComponentTransfer><feFuncA type="linear" slope="0.09"/></feComponentTransfer>
  <feBlend in2="SourceGraphic" mode="multiply"/>
</filter>
<filter id="weich"><feGaussianBlur stdDeviation="0.7"/></filter>`;

/* ============================ FINGERABDRUECKE ============================ */
/* Die Rillen folgen einem Stroemungsfeld – so entsteht ein Muster, das dem
   echten Bogen-, Schleifen- und Wirbeltyp entspricht und nicht nach
   konzentrischen Kreisen aussieht. */

function ridgesBogen() {
  let d = '';
  for (let i = 0; i < 38; i++) {
    const basis = 144 - i * 3.35;
    const hoehe = 32 - i * 0.45;
    const breite = 22 + i * 0.55;
    const pts = [];
    for (let x = 2; x <= 98; x += 3)
      pts.push([x, basis - hoehe * Math.exp(-Math.pow((x - 50) / breite, 2))]);
    d += `<path d="${pfad(pts)}"/>`;
  }
  return d;
}

/* Eine Schleifenrille: kommt links herein, dreht rechts um und geht links wieder hinaus. */
function schleifeRille(cx, cy, r, links) {
  const rand = links ? 0 : 100;
  const sweep = links ? 1 : 0;
  return `<path d="M${rand} ${(cy - r).toFixed(1)} H${cx} A${r.toFixed(1)} ${r.toFixed(1)} 0 0 ${sweep} ${cx} ${(cy + r).toFixed(1)} H${rand}"/>`;
}

function ridgesSchleife() {
  let d = '';
  const cx = 40, cy = 66;
  for (let i = 0; i < 16; i++) d += schleifeRille(cx, cy, 5 + i * 3.6, true);
  // Rillen unterhalb des Kerns, die dem Fingerkissen folgen
  for (let i = 0; i < 7; i++) {
    const y = 128 - i * 3.4;
    const pts = [];
    for (let x = 2; x <= 98; x += 3)
      pts.push([x, y + 6 * Math.exp(-Math.pow((x - 46) / 30, 2))]);
    d += `<path d="${pfad(pts)}"/>`;
  }
  d += `<path d="M20 112 L33 92 M33 92 L47 110" stroke-width="1.5"/>`;
  return d;
}

function ridgesWirbel() {
  let d = '';
  // Spirale
  const pts = [];
  for (let t = 0; t < Math.PI * 12; t += 0.12) {
    const r = 2.4 + t * 2.05;
    pts.push([50 + Math.cos(t) * r * 0.86, 66 + Math.sin(t) * r]);
  }
  d += `<path d="${pfad(pts)}"/>`;
  for (let i = 0; i < 5; i++) {
    const rr = 30 + i * 4.4;
    d += `<ellipse cx="50" cy="66" rx="${rr * 0.86}" ry="${rr}"/>`;
  }
  for (let i = 0; i < 5; i++) {
    const y = 128 - i * 3.6;
    const p = [];
    for (let x = 4; x <= 96; x += 4) p.push([x, y + 8 * Math.exp(-Math.pow((x - 50) / 34, 2))]);
    d += `<path d="${pfad(p)}"/>`;
    const q = [];
    for (let x = 4; x <= 96; x += 4) q.push([x, 12 + i * 3.6 - 8 * Math.exp(-Math.pow((x - 50) / 34, 2))]);
    d += `<path d="${pfad(q)}"/>`;
  }
  d += `<path d="M14 100 L26 76 M26 76 L38 96" stroke-width="1.6"/>`;
  d += `<path d="M86 100 L74 76 M74 76 L62 96" stroke-width="1.6"/>`;
  return d;
}

function ridgesDoppel() {
  let d = '';
  for (let i = 0; i < 11; i++) {
    d += schleifeRille(46, 42, 4 + i * 3.1, true);
    d += schleifeRille(54, 96, 4 + i * 3.1, false);
  }
  d += `<path d="M14 74 L28 58 M28 58 L40 74" stroke-width="1.5"/>`;
  d += `<path d="M86 66 L72 82 M72 82 L60 66" stroke-width="1.5"/>`;
  return d;
}

export function fingerabdruck(typ) {
  const kissen = 'M50 6 C76 6 90 26 90 58 C90 96 74 134 50 134 C26 134 10 96 10 58 C10 26 24 6 50 6 Z';
  const rillen = { bogen: ridgesBogen, schleife: ridgesSchleife,
                   wirbel: ridgesWirbel, doppel: ridgesDoppel }[typ] || ridgesBogen;
  const id = 'fp' + typ;
  return svg('0 0 100 140', `
    <defs>${FILTER}<clipPath id="${id}"><path d="${kissen}"/></clipPath></defs>
    <rect width="100" height="140" rx="6" fill="${PAPIER}"/>
    <g clip-path="url(#${id})">
      <path d="${kissen}" fill="#e6dcc6"/>
      <g fill="none" stroke="${TINTE}" stroke-width="1.15" stroke-linecap="round" opacity=".92">
        ${rillen()}
      </g>
    </g>
    <path d="${kissen}" fill="none" stroke="${GRAU}" stroke-width="1.4" stroke-dasharray="3 2.5"/>
    <rect width="100" height="140" rx="6" fill="transparent" filter="url(#korn)"/>`);
}

/* ============================ SCHUHSOHLEN ============================ */
/* Dargestellt als Abdruck im Staub: heller Grund, dunkles Profil. */

export function sohle(muster) {
  const ballen = 'M50 8 C72 8 82 26 82 48 C82 66 76 78 70 88 C62 100 38 100 30 88 C24 78 18 66 18 48 C18 26 28 8 50 8 Z';
  const ferse  = 'M50 108 C66 108 74 120 74 136 C74 152 64 162 50 162 C36 162 26 152 26 136 C26 120 34 108 50 108 Z';
  let p = '';
  const M = (x, y, w, h, r = 2) => `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${r}"/>`;

  if (muster === 'zickzack') {
    for (let y = 14; y < 160; y += 9) {
      const pts = [];
      for (let x = 16; x <= 84; x += 8.5) pts.push([x, y + ((x / 8.5) % 2 < 1 ? 0 : 5)]);
      p += `<path d="${pfad(pts)}" fill="none" stroke="${TINTE}" stroke-width="3.4" stroke-linejoin="round"/>`;
    }
  } else if (muster === 'punkte') {
    for (let y = 14; y < 162; y += 10)
      for (let x = 20; x < 82; x += 10)
        p += `<circle cx="${x + (Math.floor(y / 10) % 2 ? 5 : 0)}" cy="${y}" r="2.8"/>`;
  } else if (muster === 'wellen') {
    for (let y = 14; y < 162; y += 9) {
      const pts = [];
      for (let x = 16; x <= 84; x += 3) pts.push([x, y + Math.sin((x - 16) / 8) * 3.2]);
      p += `<path d="${pfad(pts)}" fill="none" stroke="${TINTE}" stroke-width="3.2" stroke-linecap="round"/>`;
    }
  } else if (muster === 'raster') {
    for (let y = 14; y < 162; y += 11) p += `<rect x="16" y="${y}" width="68" height="3.4" rx="1.5"/>`;
    for (let x = 20; x <= 80; x += 11) p += `<rect x="${x}" y="10" width="3.4" height="154" rx="1.5"/>`;
  } else { /* stollen */
    for (let y = 16; y < 162; y += 15)
      for (let x = 24; x < 80; x += 17)
        p += M(x + (Math.floor(y / 15) % 2 ? 8 : 0), y, 12, 10, 3);
  }

  return svg('0 0 100 172', `
    <defs>${FILTER}
      <clipPath id="so${muster}"><path d="${ballen}"/><path d="${ferse}"/></clipPath></defs>
    <rect width="100" height="172" rx="6" fill="#ded3bb"/>
    <g opacity=".5" fill="#c9bda2">
      <circle cx="18" cy="20" r="7"/><circle cx="86" cy="150" r="9"/><circle cx="88" cy="34" r="5"/>
    </g>
    <g clip-path="url(#so${muster})">
      <rect width="100" height="172" fill="#b3a68b"/>
      <g fill="${TINTE}" opacity=".88">${p}</g>
    </g>
    <g fill="none" stroke="${TINTE}" stroke-width="1.6" opacity=".55" stroke-dasharray="4 3">
      <path d="${ballen}"/><path d="${ferse}"/>
    </g>
    <rect width="100" height="172" rx="6" fill="transparent" filter="url(#korn)"/>`);
}

/* ============================ REIFENSPUREN ============================ */

export function reifen(typ) {
  let p = '';
  if (typ === 'rennvelo') {
    for (let y = 4; y < 168; y += 7) p += `<rect x="42" y="${y}" width="16" height="3" rx="1.5"/>`;
    p += `<rect x="48.5" y="2" width="3" height="168"/>`;
  } else if (typ === 'mountainbike') {
    for (let y = 6; y < 166; y += 14) {
      p += `<rect x="26" y="${y}" width="15" height="9" rx="2.5"/>`;
      p += `<rect x="59" y="${y + 7}" width="15" height="9" rx="2.5"/>`;
      p += `<rect x="43" y="${y + 3}" width="9" height="7" rx="2"/>`;
    }
  } else if (typ === 'trottinett') {
    p += `<rect x="41" y="2" width="4.5" height="168" rx="2"/><rect x="54.5" y="2" width="4.5" height="168" rx="2"/>`;
    for (let y = 10; y < 166; y += 22) p += `<rect x="45" y="${y}" width="10" height="3" rx="1.5"/>`;
  } else { /* kinderwagen */
    for (let y = 6; y < 166; y += 9) {
      const pts = [];
      for (let x = 32; x <= 68; x += 3) pts.push([x, y + Math.sin((x - 32) / 6) * 2.4]);
      p += `<path d="${pfad(pts)}" fill="none" stroke="${TINTE}" stroke-width="3" stroke-linecap="round"/>`;
    }
  }
  return svg('0 0 100 172', `
    <defs>${FILTER}<clipPath id="rf${typ}"><rect x="20" y="2" width="60" height="168" rx="8"/></clipPath></defs>
    <rect width="100" height="172" rx="6" fill="#ded3bb"/>
    <g opacity=".45" fill="#c9bda2"><circle cx="12" cy="40" r="6"/><circle cx="90" cy="120" r="8"/></g>
    <g clip-path="url(#rf${typ})">
      <rect x="20" y="2" width="60" height="168" fill="#b3a68b"/>
      <g fill="${TINTE}" opacity=".9">${p}</g>
    </g>
    <rect x="20" y="2" width="60" height="168" rx="8" fill="none" stroke="${TINTE}"
      stroke-width="1.6" opacity=".5" stroke-dasharray="4 3"/>
    <rect width="100" height="172" rx="6" fill="transparent" filter="url(#korn)"/>`);
}

/* ============================ MIKROSKOP ============================ */

export function faser(farbe, wellig = false) {
  const pts = [];
  for (let t = 0; t <= 1.001; t += 0.02) {
    const x = 8 + t * 84;
    const y = wellig ? 66 + Math.sin(t * Math.PI * 3.1) * 22 : 116 - t * 84;
    pts.push([x, y]);
  }
  const d = pfad(pts);
  return svg('0 0 132 132', `
    <defs>
      <radialGradient id="feld"><stop offset="0" stop-color="#fbf7ec"/>
        <stop offset=".72" stop-color="#efe7d4"/><stop offset="1" stop-color="#c9bea4"/></radialGradient>
      <clipPath id="ok"><circle cx="66" cy="66" r="58"/></clipPath>
      <filter id="fw"><feGaussianBlur stdDeviation="1.6"/></filter>
    </defs>
    <circle cx="66" cy="66" r="62" fill="#22262f"/>
    <circle cx="66" cy="66" r="58" fill="url(#feld)"/>
    <g clip-path="url(#ok)">
      <g transform="translate(3,3)" opacity=".35" filter="url(#fw)">
        <path d="${d}" fill="none" stroke="${farbe}" stroke-width="13" stroke-linecap="round"/>
      </g>
      <path d="${d}" fill="none" stroke="${farbe}" stroke-width="11" stroke-linecap="round"/>
      <path d="${d}" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="3"
        stroke-linecap="round" transform="translate(-2,-2)"/>
      <g opacity=".2" fill="#7c7364">
        <circle cx="30" cy="34" r="2.4"/><circle cx="98" cy="44" r="1.8"/>
        <circle cx="44" cy="102" r="2"/><circle cx="104" cy="96" r="2.6"/>
      </g>
    </g>
    <circle cx="66" cy="66" r="58" fill="none" stroke="#3a4150" stroke-width="4"/>
    <g stroke="#3a4150" stroke-width="1.4" opacity=".55">
      <path d="M66 12 L66 24 M66 108 L66 120 M12 66 L24 66 M108 66 L120 66"/>
    </g>
    <g fill="#3a4150"><rect x="86" y="112" width="30" height="3" rx="1.5"/></g>`);
}

/* ============================ HANDSCHRIFT ============================ */

export function handschrift(stil) {
  const neig = { steil: 0, rechts: -26, links: 24, dick: -6 }[stil] ?? 0;
  const dick = stil === 'dick' ? 6.5 : 3.6;
  const w = `
    <path d="M18 66 C18 40 26 34 32 34 C40 34 42 44 40 54 C38 64 30 68 24 62"/>
    <path d="M50 30 L50 68 M50 30 C64 30 66 46 50 47 C66 47 68 68 50 68"/>
    <path d="M82 46 C74 46 72 54 74 60 C76 66 86 66 88 60 C90 54 88 46 82 46"/>
    <path d="M104 68 L104 44 C110 38 118 40 118 50 L118 68"/>
    <path d="M132 40 L132 68 M132 52 C136 44 142 42 146 46"/>`;
  return svg('0 0 170 96', `
    <defs>${FILTER}</defs>
    <path d="M4 6 L166 4 L164 90 L6 92 Z" fill="${PAPIER}"/>
    <path d="M4 6 L166 4 L164 90 L6 92 Z" fill="none" stroke="#ddd2b8" stroke-width="1"/>
    <path d="M12 78 L156 76" stroke="#c8bda3" stroke-width="1.4"/>
    <g transform="translate(85,50) skewX(${neig}) scale(.86) translate(-85,-50)" fill="none"
       stroke="#1f3557" stroke-width="${dick}" stroke-linecap="round" stroke-linejoin="round">${w}</g>
    <rect width="170" height="96" fill="transparent" filter="url(#korn)"/>`);
}

/* ============================ BAHNHOFSUHR ============================ */
/* Nach dem Vorbild der Schweizer Bahnhofsuhr: Balkenziffern, roter
   Sekundenzeiger mit Scheibe. */

export function uhr(h, m) {
  const P = (deg, len) => [50 + Math.cos((deg - 90) * Math.PI / 180) * len,
                           50 + Math.sin((deg - 90) * Math.PI / 180) * len];
  let ticks = '';
  for (let i = 0; i < 60; i++) {
    const gross = i % 5 === 0;
    const [x1, y1] = P(i * 6, gross ? 30 : 37);
    const [x2, y2] = P(i * 6, 41);
    ticks += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}"
      stroke-width="${gross ? 4.4 : 1.5}"/>`;
  }
  const ah = ((h % 12) + m / 60) * 30, am = m * 6;
  const [hx, hy] = P(ah, 25), [mx, my] = P(am, 36);
  const [hbx, hby] = P(ah + 180, 7), [mbx, mby] = P(am + 180, 8);
  const [sx, sy] = P(am * 0 + 222, 30);
  return svg('0 0 100 100', `
    <defs><filter id="uhrsch" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-opacity=".25"/></filter></defs>
    <circle cx="50" cy="50" r="47" fill="#1d232c"/>
    <circle cx="50" cy="50" r="44" fill="#fbf9f4"/>
    <g stroke="#1d232c" stroke-linecap="butt">${ticks}</g>
    <g filter="url(#uhrsch)">
      <path d="M${hbx.toFixed(1)} ${hby.toFixed(1)} L${hx.toFixed(1)} ${hy.toFixed(1)}"
        stroke="#1d232c" stroke-width="7.2" stroke-linecap="butt"/>
      <path d="M${mbx.toFixed(1)} ${mby.toFixed(1)} L${mx.toFixed(1)} ${my.toFixed(1)}"
        stroke="#1d232c" stroke-width="4.6" stroke-linecap="butt"/>
      <path d="M50 50 L${sx.toFixed(1)} ${sy.toFixed(1)}" stroke="${ROT}" stroke-width="1.6"/>
      <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="5" fill="${ROT}"/>
    </g>
    <circle cx="50" cy="50" r="2.6" fill="#1d232c"/>`);
}

/* ============================ LINEAL ============================ */

export function lineal(cm) {
  const E = 8.6, X0 = 14;
  let marks = '';
  for (let i = 0; i <= 30; i++) {
    const x = X0 + i * E;
    const lang = i % 5 === 0;
    marks += `<path d="M${x} 104 L${x} ${lang ? 86 : 94}" stroke-width="${lang ? 1.6 : 1}"/>`;
    if (lang) marks += `<text x="${x}" y="82" font-size="9" fill="#3a4150" text-anchor="middle"
      font-family="ui-rounded, system-ui, sans-serif" font-weight="600">${i}</text>`;
  }
  const abdruck = X0 + cm * E;
  return svg('0 0 300 118', `
    <defs>${FILTER}</defs>
    <rect width="300" height="118" rx="6" fill="#ded3bb"/>
    <g>
      <path d="M${X0 + 4} 40 C${X0 + 4} 20 ${X0 + 16} 12 ${X0 + 30} 12
               C${abdruck - 34} 12 ${abdruck - 12} 18 ${abdruck - 6} 30
               C${abdruck} 40 ${abdruck - 10} 58 ${abdruck - 30} 60
               C${X0 + 24} 64 ${X0 + 4} 56 ${X0 + 4} 40 Z" fill="#a2967c"/>
      <g fill="#8b7f66" opacity=".9">
        ${Array.from({ length: 6 }, (_, i) =>
          `<rect x="${X0 + 14 + i * (abdruck - X0 - 36) / 6}" y="26" width="${(abdruck - X0) / 16}" height="9" rx="4"/>`).join('')}
      </g>
    </g>
    <path d="M${abdruck} 8 L${abdruck} 74" stroke="${ROT}" stroke-width="1.4" stroke-dasharray="3 3"/>
    <rect x="6" y="74" width="288" height="36" rx="4" fill="#f6f2e6" stroke="#c7bda6" stroke-width="1.4"/>
    <g stroke="#3a4150">${marks}</g>
    <rect width="300" height="118" rx="6" fill="transparent" filter="url(#korn)"/>`);
}

/* ============================ ICONS ============================ */

const ICONS = {
  fingerabdruck: `<path d="M12 3.4c4.1 0 7.1 3.5 7.1 8.2 0 3-.6 6.1-1.7 8.6"/><path d="M12 3.4c-4.1 0-7.1 3.5-7.1 8.2 0 2 .3 3.7.8 5.2"/><path d="M8.4 20.8c1-2.3 1.5-5.1 1.5-8.2 0-1.6 1-2.7 2.1-2.7s2.1 1.1 2.1 2.7c0 3-.4 5.5-1 7.5"/><path d="M12 6.7c2.7 0 4.5 2.3 4.5 5.7 0 2.7-.4 5.2-1.1 7.3"/>`,
  schuh:         `<path d="M3.2 16.4h7.4l3.6-2.7 3.9 1c1.4.4 2.1 1.2 2.1 2.5v1.6H3.2z"/><path d="M3.2 16.4V9.2l3.9-1 2 3"/><path d="M6.5 18.8v1.4M10 18.8v1.4M13.6 18.8v1.4M17.2 18.8v1.4"/>`,
  reifen:        `<circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="3.1"/><path d="M12 3.8v4.2M12 16v4.2M3.8 12H8M16 12h4.2M6.2 6.2l2.9 2.9M14.9 14.9l2.9 2.9M17.8 6.2l-2.9 2.9M9.1 14.9l-2.9 2.9"/>`,
  haar:          `<path d="M4.2 20.4c3.8-2.2 4.9-6.3 3.7-10.6"/><path d="M9.2 20.6c3.9-3.1 4.8-8.2 2.9-13.2"/><path d="M14.2 20.4c3.9-4.1 3.9-9.3 1.9-14.2"/><path d="M19 20c2.4-3.4 2.6-7.4 1.4-10.9"/>`,
  zettel:        `<path d="M6 2.8h8.4L19 7.4v13.8H6z"/><path d="M14.4 2.8v4.6H19"/><path d="M8.8 12h7.2M8.8 15.4h5.6M8.8 18h3.6"/>`,
  kruemel:       `<circle cx="7.6" cy="14.4" r="2.1"/><circle cx="14" cy="10.2" r="2.5"/><circle cx="16.4" cy="16.2" r="1.6"/><circle cx="10.2" cy="7.8" r="1.4"/><circle cx="11" cy="18" r="1.1"/><circle cx="19" cy="11.6" r="1"/>`,
  farbe:         `<path d="M5.2 10.4a6.8 6.8 0 0 1 13.6 0v5.8a3 3 0 0 1-3 3H8.2a3 3 0 0 1-3-3z"/><path d="M9 10.4h6"/><path d="M9.4 6.2V3.4h5.2v2.8"/>`,
  schluessel:    `<circle cx="8" cy="14.2" r="4.2"/><path d="M11.1 11.2 19.4 2.9"/><path d="M17 5.3l2.4 2.4M14.8 7.5l2.4 2.4"/>`,
  ticket:        `<path d="M3 8.2a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z"/><path d="M12 6.2v1.6M12 10.4v1.6M12 14.2v-.8"/>`,
  handschuh:     `<path d="M7 21V9.2a2 2 0 0 1 4 0V4a1.6 1.6 0 0 1 3.2 0v5.6"/><path d="M14.2 9.6a1.6 1.6 0 0 1 3.2 0V16c0 3-2 5-5 5H7"/>`,
  knopf:         `<circle cx="12" cy="12" r="8.2"/><circle cx="9.8" cy="9.8" r="1.15"/><circle cx="14.2" cy="9.8" r="1.15"/><circle cx="9.8" cy="14.2" r="1.15"/><circle cx="14.2" cy="14.2" r="1.15"/>`,
  pfote:         `<ellipse cx="6.8" cy="10.2" rx="1.9" ry="2.4"/><ellipse cx="11.6" cy="7.6" rx="2.1" ry="2.6"/><ellipse cx="16.6" cy="9.4" rx="1.9" ry="2.4"/><ellipse cx="19.6" cy="13.6" rx="1.6" ry="2"/><path d="M12 12.6c3.2 0 5.4 2.1 5.4 4.5S15.2 20.6 12 20.6 6.6 19.5 6.6 17.1 8.8 12.6 12 12.6z"/>`,
  leiter:        `<path d="M6.6 2.6 5 21.4M17.4 2.6 19 21.4"/><path d="M6.2 7.2h11.6M5.9 11.4h12.2M5.6 15.6h12.8M5.3 19.8h13.4"/>`,
  glas:          `<path d="M6.6 3.4h10.8l-1.2 6.2a4.4 4.4 0 0 1-8.4 0z"/><path d="M12 13.6v6.4M8.6 20.4h6.8"/>`,
  fenster:       `<rect x="3.6" y="3.6" width="16.8" height="16.8" rx="1.4"/><path d="M12 3.6v16.8M3.6 12h16.8"/><path d="M3.6 20.4h16.8"/>`,
  velo:          `<circle cx="6" cy="16" r="4.2"/><circle cx="18" cy="16" r="4.2"/><path d="M6 16l4.2-8.2h4.6L18 16"/><path d="M8.8 7.8h4.4M10.2 16h4"/>`,
  lupe:          `<circle cx="10.6" cy="10.6" r="6.6"/><path d="M15.4 15.4 21 21"/>`,
  stempel:       `<path d="M7 20.6h10M8.4 17.4h7.2l.8 3.2H7.6z"/><path d="M12 3.4c1.9 0 3 1.4 2.6 3.2l-.8 3.6h-3.6l-.8-3.6C9 4.8 10.1 3.4 12 3.4z"/><path d="M5.8 14.2h12.4v3.2H5.8z"/>`
};

export function icon(name, stroke = '#c98a2b', w = 24) {
  return `<svg xmlns="${NS}" viewBox="0 0 24 24" width="${w}" height="${w}" fill="none"
    stroke="${stroke}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true">${ICONS[name] || ICONS.zettel}</svg>`;
}

/* Tatortmarker: Sucher-Reticle mit Nummer, wie eine Beweismittelmarkierung */
export function clueMarker(name, nr) {
  return `<svg xmlns="${NS}" viewBox="0 0 72 72" width="72" height="72" aria-hidden="true">
    <circle class="clue__halo" cx="36" cy="36" r="31" fill="rgba(10,16,26,.30)"/>
    <circle class="clue__ring" cx="36" cy="36" r="26" fill="none" stroke="#ffc55c"
      stroke-width="2.6" stroke-dasharray="5 4"/>
    <g class="clue__ecken" stroke="#ffc55c" stroke-width="2.6" stroke-linecap="round" fill="none">
      <path d="M12 22 V14 a2 2 0 0 1 2-2 h8"/><path d="M60 22 V14 a2 2 0 0 0-2-2 h-8"/>
      <path d="M12 50 v8 a2 2 0 0 0 2 2 h8"/><path d="M60 50 v8 a2 2 0 0 1-2 2 h-8"/>
    </g>
    <g transform="translate(24,24)" fill="none" stroke="#fff1d6"
       stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      ${ICONS[name] || ICONS.zettel}
    </g>
    ${nr ? `<g class="clue__nr"><circle cx="58" cy="14" r="9" fill="#c9451f" stroke="#fff1d6" stroke-width="1.6"/>
      <text x="58" y="18" font-size="11" font-weight="800" fill="#fff1d6" text-anchor="middle"
        font-family="ui-rounded, system-ui, sans-serif">${nr}</text></g>` : ''}
  </svg>`;
}

/* ============================ NOTFALL-GESICHT ============================ */
/* Nur, falls ein Portraet fehlt. Im Normalbetrieb ungenutzt. */

export function gesicht(seed = 1) {
  const h = ['#e8c39e', '#d7a678', '#b9825a'][seed % 3];
  return svg('0 0 100 100', `
    <rect width="100" height="100" rx="14" fill="#cfe0ee"/>
    <circle cx="50" cy="46" r="26" fill="${h}"/>
    <path d="M24 44a26 26 0 0 1 52 0q-26-14-52 0z" fill="#5b4632"/>
    <circle cx="41" cy="46" r="2.8" fill="#26303c"/><circle cx="59" cy="46" r="2.8" fill="#26303c"/>
    <path d="M43 58q7 5 14 0" fill="none" stroke="#7a4132" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M16 100q10-20 34-20t34 20z" fill="#4a7ba7"/>`);
}

/* ============================ FALLBACK-SZENEN ============================ */

export function szeneFallback(kind) {
  const grund = `
    <defs>
      <linearGradient id="sk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2a4f77"/><stop offset="1" stop-color="#4c7f9e"/></linearGradient>
      <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3a6a45"/><stop offset="1" stop-color="#25452e"/></linearGradient>
    </defs>
    <rect width="1000" height="667" fill="url(#sk)"/>
    <path d="M0 380 L160 300 L300 372 L440 288 L580 372 L720 296 L880 372 L1000 316 L1000 430 L0 430Z"
      fill="#2b5478" opacity=".85"/>
    <rect y="420" width="1000" height="247" fill="url(#gr)"/>`;
  const haus = (x, w, h, f, d) => `
    <rect x="${x}" y="${420 - h}" width="${w}" height="${h}" fill="${f}"/>
    <path d="M${x - 14} ${420 - h} L${x + w / 2} ${420 - h - 56} L${x + w + 14} ${420 - h} Z" fill="${d}"/>`;
  const s = {
    schule: `${grund}${haus(140, 360, 230, '#c9bfae', '#8d3b31')}${haus(560, 280, 180, '#b9c4cd', '#3f5d78')}`,
    bahnhof: `${grund}${haus(90, 480, 200, '#b6ac99', '#6b4a3a')}<rect y="430" width="1000" height="90" fill="#3b3f45"/>`,
    gemeindehaus: `${grund}${haus(230, 520, 270, '#d6cfc0', '#7a4a3a')}`,
    museum: `${grund}<rect x="160" y="180" width="680" height="250" fill="#cfc7b6"/>
      <path d="M130 180 L500 80 L870 180 Z" fill="#a8927a"/>`,
    wald: `${grund}<circle cx="180" cy="300" r="110" fill="#2f6b3d"/><circle cx="820" cy="320" r="120" fill="#2a5f36"/>`
  };
  return svg('0 0 1000 667', s[kind] || s.schule, 'scene__svg');
}
