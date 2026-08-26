/* Spürnase – Detektivbüro Bärenmoos
   Spiellogik und Bildschirme. Vanilla ES-Module, kein Build-Schritt. */

import { FAELLE, RANG_TEXTE } from './cases.js';
import * as art from './art.js';
import * as S from './state.js';
import { sfx, unlock, setSound, soundOn, setMusik, musikLaeuft, kulisse } from './audio.js';

const app = document.getElementById('app');
const toastEl = document.getElementById('toast');
const sheet = document.getElementById('sheet');
const sheetTitle = document.getElementById('sheetTitle');
const sheetBody = document.getElementById('sheetBody');

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* Szenenname der Fallakte auf eine Klangkulisse abbilden */
const KLANG = { schule: 'schule', bahnhof: 'bahnhof', gemeindehaus: 'dorfplatz',
                museum: 'museum', wald: 'wald' };

let F = null, E = null;

function neueErmittlung(fall) {
  F = fall;
  E = { gefunden: [], laborIdx: 0, laborErg: [], zeugeGeloest: false,
        ausschlussIdx: 0, raus: [], fehler: 0 };
}

/* ---------------- Bausteine ---------------- */

function portraet(key, cls = '') {
  const p = `assets/portraits/${key}.webp`;
  return `<span class="avatar ${cls}"><img src="${p}" alt=""
    onerror="this.style.display='none'"></span>`;
}

function akte(reiter, inhalt) {
  return `<div class="screen">
    <div class="reiter">${reiter}</div>
    <div class="akte">${inhalt}</div>
  </div>`;
}
const lasche = (t, art = '') =>
  `<span class="reiter__lasche ${art ? 'reiter__lasche--' + art : ''}">${esc(t)}</span>`;

function topbar(titel, sub, opts = {}) {
  return `<div class="topbar">
    ${opts.zurueck ? `<button class="iconbtn" data-act="zurueck" aria-label="Zurück">‹</button>` : ''}
    <h1 class="topbar__title">${esc(titel)}${sub ? `<span class="topbar__sub">${esc(sub)}</span>` : ''}</h1>
    ${opts.notiz ? `<button class="iconbtn" data-act="notiz" aria-label="Notizbuch">
      ${art.icon('zettel', '#5d6473', 21)}</button>` : ''}
  </div>`;
}

function fortschritt(stufe) {
  const namen = ['Tatort', 'Labor', 'Zeugen', 'Ausschluss', 'Verhaftung'];
  return `<div class="progress" role="img" aria-label="Schritt ${stufe + 1} von 5: ${namen[stufe]}">
    ${namen.map((n, i) => `<span class="pip ${i < stufe ? 'pip--done' : i === stufe ? 'pip--now' : ''}"></span>`).join('')}
  </div>`;
}

const sterneText = (n) =>
  `<span class="stars">${'★'.repeat(n)}<span class="stars--leer">${'★'.repeat(3 - n)}</span></span>`;

function bildFuer(spec) {
  if (!spec) return '';
  const { art: a, v } = spec;
  if (a === 'sohle') return art.sohle(v);
  if (a === 'reifen') return art.reifen(v);
  if (a === 'faser') return art.faser(v[0], v[1]);
  if (a === 'fingerabdruck') return art.fingerabdruck(v);
  if (a === 'handschrift') return art.handschrift(v);
  if (a === 'uhr') return art.uhr(v[0], v[1]);
  if (a === 'lineal') return art.lineal(v);
  return '';
}

function fotoblock(bild, szene, badge) {
  return `<div class="fotorahmen"><div class="foto">
    ${art.szeneFallback(szene)}
    <img src="${bild}" alt="" onerror="this.remove()">
    ${badge ? `<span class="foto__badge">${esc(badge)}</span>` : ''}
  </div></div>`;
}

/* ---------------- Rückmeldung ---------------- */

let toastTimer = null;
function toast(text, variante = '') {
  toastEl.textContent = text;
  toastEl.className = 'toast' + (variante ? ' toast--' + variante : '');
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2800);
}

function fehler(text) {
  E.fehler++;
  sfx.wrong();
  toast(text, 'bad');
  if (navigator.vibrate) navigator.vibrate(55);
}

/* ---------------- Notizbuch ---------------- */

function oeffneNotizbuch() {
  sfx.page();
  sheetTitle.textContent = 'Notizbuch — ' + F.titel;
  const t = [];
  t.push(`<h3>Gesicherte Fakten</h3><div class="faktenbox">
    ${F.fakten.map(f => `<div class="fakt">${esc(f)}</div>`).join('')}</div>`);
  t.push(`<h3>Spuren ${E.gefunden.length} von ${F.spuren.length}</h3>`);
  if (!E.gefunden.length) t.push(`<p class="muted small">Noch nichts gesichert.</p>`);
  F.spuren.filter(s => E.gefunden.includes(s.id)).forEach(s => t.push(
    `<div class="notiz">${art.icon(s.icon, '#9d6d18', 22)}<div><b>${esc(s.name)}</b>
      <small>${esc(s.wert)}</small></div></div>`));
  if (E.laborErg.length) {
    t.push(`<h3>Ergebnisse</h3>`);
    E.laborErg.forEach(r => t.push(
      `<div class="notiz">${art.icon('glas', '#1f4f86', 22)}<div><b>${esc(r)}</b></div></div>`));
  }
  if (E.raus.length) {
    t.push(`<h3>Ausgeschlossen</h3>`);
    E.raus.forEach(id => {
      const v = F.verdaechtige.find(x => x.id === id);
      t.push(`<div class="notiz">${art.icon('stempel', '#b0341d', 22)}<div><b>${esc(v.name)}</b></div></div>`);
    });
  }
  sheetBody.innerHTML = t.join('');
  sheet.hidden = false;
}
$$('[data-close-sheet]').forEach(el => el.addEventListener('click', () => { sheet.hidden = true; }));

/* ================= START ================= */

function scrStart() {
  const r = S.rang(), naechst = S.naechsterRang(), ges = S.gesamtSterne();
  app.innerHTML = akte(
    lasche('Bärenmoos') + lasche('Detektivbüro', 'blau'),
    `<div class="stack">
      ${fotoblock('assets/img/hero.webp', 'schule', 'Dein Schreibtisch')}
      <div>
        <h1 class="title">Spür<span>nase</span></h1>
        <p class="lead">Fünf Fälle. Echte Spuren. Und ein Hund, der bellt, wenn du zu weit weg suchst.</p>
      </div>
      <div class="rangbalken">
        <span class="rangbalken__medaille">${art.icon(r.icon, '#4a3208', 24)}</span>
        <span class="grow"><b>${esc(r.name)}</b>
          <small>${ges} von 15 Sternen${naechst ? ` · noch ${naechst.min - ges} bis ${esc(naechst.name)}` : ' · höchster Rang'}</small>
        </span>
      </div>
      <button class="btn btn--wide" data-act="faelle">${ges ? 'Weiterermitteln' : 'Los geht’s'}</button>
      <div class="row">
        <button class="btn btn--ghost grow" data-act="ton">${soundOn() ? 'Ton an' : 'Ton aus'}</button>
        <button class="btn btn--ghost grow" data-act="musik">${musikLaeuft() ? 'Musik an' : 'Musik aus'}</button>
      </div>
      <button class="btn btn--ghost btn--wide" data-act="anleitung">Wie ermittelt man?</button>
      ${ges ? `<button class="btn btn--ghost btn--wide small" data-act="reset">Fortschritt löschen</button>` : ''}
      <p class="small muted center">Läuft offline. Der Fortschritt bleibt nur auf diesem Gerät.</p>
    </div>`);

  bind({
    faelle: () => go(scrFaelle),
    ton: () => { const v = !soundOn(); setSound(v); S.setTon(v); if (v) { sfx.tap(); kulisse('buero'); } scrStart(); },
    musik: () => { const v = !musikLaeuft(); setMusik(v); S.setMusikPref(v); scrStart(); },
    anleitung: zeigeAnleitung,
    reset: () => { if (confirm('Wirklich allen Fortschritt löschen?')) { S.reset(); scrStart(); } }
  });
}

function zeigeAnleitung() {
  sheetTitle.textContent = 'So ermittelst du';
  const z = [
    ['lupe', '1 · Tatort', 'Zieh den Finger über das Foto. Die Lupe leuchtet auf, wenn eine Spur in der Nähe ist. Halt kurz drauf – dann landet sie im Notizbuch.'],
    ['fingerabdruck', '2 · Spurenlabor', 'Vergleiche Muster, miss nach, lies die Uhr.'],
    ['zettel', '3 · Zeugen', 'Eine Aussage passt nicht zu den Fakten. Finde sie.'],
    ['stempel', '4 · Ausschluss', 'Streiche alle durch, die es nicht gewesen sein können.'],
    ['schuh', '5 · Verhaftung', 'Wer übrig bleibt, war es. Weniger Fehler = mehr Sterne.']
  ];
  sheetBody.innerHTML = z.map(([i, t, s]) =>
    `<div class="notiz">${art.icon(i, '#9d6d18', 22)}<div><b>${t}</b><small>${s}</small></div></div>`).join('')
    + `<p class="small muted">Das Notizbuch oben rechts zeigt dir jederzeit alles, was du schon weisst.</p>`;
  sheet.hidden = false;
}

/* ================= FALLLISTE ================= */

function scrFaelle() {
  const items = FAELLE.map((f, i) => {
    const st = S.sterneFuer(f.id);
    const offen = i === 0 || S.geloest(FAELLE[i - 1].id);
    return `<button class="caseitem ${st ? 'caseitem--fertig' : ''}" data-fall="${f.id}" ${offen ? '' : 'disabled'}>
      <span class="caseitem__nr">${offen ? f.nr : '?'}</span>
      <span class="caseitem__txt">
        <b>${esc(f.titel)}</b>
        <small>${esc(f.ort)} · ${'●'.repeat(f.schwierigkeit)}${'○'.repeat(5 - f.schwierigkeit)}</small>
      </span>
      ${offen ? sterneText(st) : `<span class="stars stars--leer">gesperrt</span>`}
    </button>`;
  }).join('');

  app.innerHTML = akte(lasche('Fallakten') + lasche('Bärenmoos', 'blau'),
    `${topbar('Fallakten', 'Wähle einen Fall', { zurueck: true })}
     <div class="caselist">${items}</div>
     <div class="grow"></div>
     <p class="small muted center">Ein Fall öffnet sich, sobald du den davor gelöst hast.</p>`);

  bind({ zurueck: () => go(scrStart) });
  $$('[data-fall]').forEach(b => b.addEventListener('click', () => {
    sfx.tap();
    neueErmittlung(FAELLE.find(f => f.id === b.dataset.fall));
    go(scrBriefing);
  }));
}

/* ================= BRIEFING ================= */

function scrBriefing() {
  app.innerHTML = akte(
    lasche('Akte ' + F.nr, 'rot') + lasche(F.ort),
    `${topbar('Fall ' + F.nr, F.titel, { zurueck: true })}
     <div class="stack">
       ${fotoblock(F.bild, F.szene, F.ort)}
       ${F.briefing.map((t, i) => `<div class="rede">
         ${portraet('bruennli')}
         <div>${i === 0 ? '<b>Wachtmeister Brünnli</b>' : ''}<p class="small">${esc(t)}</p></div>
       </div>`).join('')}
       <div class="rede">${portraet('roesti')}
         <div><b>Rösti</b><p class="small">Wuff. (Er hilft dir am Tatort, wenn du nicht weiterkommst.)</p></div></div>
       <div class="card card--flat">
         <h3>Was wir sicher wissen</h3>
         <div class="faktenbox">${F.fakten.map(f => `<div class="fakt">${esc(f)}</div>`).join('')}</div>
       </div>
       <button class="btn btn--wide" data-act="start">Zum Tatort</button>
     </div>`);
  bind({ zurueck: () => go(scrFaelle), start: () => go(scrTatort) });
}

/* ================= TATORT ================= */

let tatortCleanup = null;

function scrTatort() {
  const marker = F.spuren.map((s, i) => `
    <button class="clue" data-clue="${s.id}"
      style="left:${s.x * 100}%; top:${s.y * 100}%"
      aria-label="Spur ${i + 1} untersuchen">${art.clueMarker(s.icon, i + 1)}</button>`).join('');

  app.innerHTML = akte(
    lasche('Akte ' + F.nr, 'rot') + lasche('Tatort'),
    `${topbar('Tatort absuchen', F.ort, { zurueck: true, notiz: true })}
     ${fortschritt(0)}
     <div class="fotorahmen"><div class="scene" id="scene">
       ${art.szeneFallback(F.szene)}
       <img class="scene__bg" src="${F.bild}" alt="" onerror="this.remove()">
       <div class="scene__dark"></div>
       ${marker}
       <div class="scene__lens" id="lens" style="left:50%; top:50%"></div>
       <div class="scene__hint" id="hint">Zieh den Finger über das Foto</div>
     </div></div>
     <div class="card">
       <div class="row"><b class="grow small" id="spurZahl">0 von ${F.spuren.length} Spuren</b>
         <button class="iconbtn iconbtn--label" data-act="hilfe">${art.icon('pfote', '#5d6473', 19)}Rösti</button></div>
       <p id="spurText">Fahre mit dem Finger über den Tatort. Die Lupe leuchtet auf, wenn eine Spur in der Nähe ist.</p>
       <div class="evidence-row" id="evRow">${F.spuren.map(() =>
         `<span class="evchip evchip--leer">?</span>`).join('')}</div>
     </div>
     <div class="grow"></div>
     <button class="btn btn--wide" id="weiter" disabled>Erst alle Spuren sichern</button>`);

  const scene = $('#scene'), lens = $('#lens'), hint = $('#hint');
  let lastMove = Date.now(), hoverTimer = null, hoverId = null, lupeTon = 0;

  function pos(ev) {
    const r = scene.getBoundingClientRect();
    const p = ev.touches ? ev.touches[0] : ev;
    return { x: p.clientX - r.left, y: p.clientY - r.top, w: r.width, h: r.height };
  }

  function update(px, py, w, h) {
    lens.style.left = px + 'px';
    lens.style.top = py + 'px';
    let naechste = null, minD = 1e9;
    F.spuren.forEach(s => {
      const el = scene.querySelector(`[data-clue="${s.id}"]`);
      const d = Math.hypot(px - s.x * w, py - s.y * h);
      if (E.gefunden.includes(s.id)) { el.classList.add('clue--found'); return; }
      if (d < minD) { minD = d; naechste = s; }
      el.classList.toggle('clue--near', d < 80);
    });
    if (naechste && minD < 44) {
      if (hoverId !== naechste.id) {
        hoverId = naechste.id;
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => sammle(naechste.id), 420);
      }
    } else { hoverId = null; clearTimeout(hoverTimer); }
  }

  function onMove(ev) {
    ev.preventDefault();
    lastMove = Date.now();
    hint.style.opacity = '0';
    const p = pos(ev);
    update(p.x, p.y, p.w, p.h);
    if (Date.now() - lupeTon > 700) { lupeTon = Date.now(); sfx.lupe(); }
  }

  scene.addEventListener('pointermove', onMove, { passive: false });
  scene.addEventListener('pointerdown', onMove, { passive: false });

  $$('[data-clue]', scene).forEach(b => b.addEventListener('click', (e) => {
    e.stopPropagation();
    if (b.classList.contains('clue--near')) sammle(b.dataset.clue);
  }));

  function sammle(id) {
    if (E.gefunden.includes(id)) return;
    const s = F.spuren.find(x => x.id === id);
    E.gefunden.push(id);
    sfx.found();
    if (navigator.vibrate) navigator.vibrate(28);
    scene.querySelector(`[data-clue="${id}"]`).classList.add('clue--found');
    $('#spurZahl').textContent = `${E.gefunden.length} von ${F.spuren.length} Spuren gesichert`;
    $('#evRow').innerHTML = F.spuren.map(sp => E.gefunden.includes(sp.id)
      ? `<span class="evchip">${art.icon(sp.icon, '#9d6d18', 17)}${esc(sp.name)}</span>`
      : `<span class="evchip evchip--leer">?</span>`).join('');
    const st = $('#spurText');
    if (st) st.innerHTML = `<b>${esc(s.name)}:</b> ${esc(s.text)}`;

    if (E.gefunden.length === F.spuren.length) {
      const w = $('#weiter');
      w.disabled = false;
      w.textContent = 'Ab ins Spurenlabor';
      sfx.right();
      toast('Alle Spuren gesichert!', 'gut');
    }
  }

  let hilfen = 0;
  function roestiHinweis(s, direkt) {
    sfx.bark();
    const wo = (s.y > 0.6 ? 'unten' : s.y < 0.4 ? 'oben' : 'in der Mitte') + ' ' +
               (s.x > 0.62 ? 'rechts' : s.x < 0.38 ? 'links' : '');
    toast('Rösti bellt: Schau mal ' + wo.trim() + '!');
    if (direkt) hilfen++;
    if (hilfen >= 2) {
      const el = scene.querySelector(`[data-clue="${s.id}"]`);
      if (el) el.classList.add('clue--near');
    }
  }

  const nudge = setInterval(() => {
    if (Date.now() - lastMove < 18000) return;
    lastMove = Date.now();
    const offen = F.spuren.filter(s => !E.gefunden.includes(s.id));
    if (offen.length) roestiHinweis(offen[0], false);
  }, 4000);

  $('[data-act="hilfe"]').addEventListener('click', () => {
    const offen = F.spuren.filter(s => !E.gefunden.includes(s.id));
    if (!offen.length) { toast('Du hast schon alles!', 'gut'); return; }
    roestiHinweis(offen[0], true);
  });

  $('#weiter').addEventListener('click', () => { sfx.tap(); go(scrLabor); });
  bind({ zurueck: () => go(scrFaelle), notiz: oeffneNotizbuch });
  tatortCleanup = () => { clearInterval(nudge); clearTimeout(hoverTimer); };
}

/* ================= LABOR ================= */

function scrLabor() {
  const a = F.labor[E.laborIdx];
  if (!a) { go(scrZeugen); return; }

  let mitte = '';
  if (a.typ === 'vergleich') {
    mitte = `<div class="probe">
        <span class="probe__bild">${bildFuer(a.probe)}</span>
        <span><b>${esc(a.probe.label)}</b><br><small class="muted">${esc(a.hilfe)}</small></span>
      </div>
      <div class="options">${a.optionen.map(o => `
        <button class="beweis" data-opt="${o.id}">
          <span class="beweis__bild">${bildFuer(o)}</span>
          <span class="beweis__label">${esc(o.label)}</span>
        </button>`).join('')}</div>`;
  } else {
    mitte = `${a.bild ? `<div class="card card--flat" style="display:grid;place-items:center">${bildFuer(a.bild)}</div>` : ''}
      ${a.tabelle ? `<div class="card card--flat"><h3>Umrechnungstabelle</h3>
        <div class="tabelle">${a.tabelle.map(([l, g]) =>
          `<div><span>${esc(l)}</span><b>${esc(g)}</b></div>`).join('')}</div></div>` : ''}
      ${a.hilfe ? `<p class="small muted">${esc(a.hilfe)}</p>` : ''}
      <div class="options options--1">${a.optionen.map(o => `
        <button class="opt" data-opt="${o.id}">${esc(o.label)}</button>`).join('')}</div>`;
  }

  app.innerHTML = akte(
    lasche('Akte ' + F.nr, 'rot') + lasche('Labor'),
    `${topbar('Spurenlabor', `Aufgabe ${E.laborIdx + 1} von ${F.labor.length}`, { zurueck: true, notiz: true })}
     ${fortschritt(1)}
     <div class="stack">
       <div class="card"><h2>${esc(a.frage)}</h2></div>
       ${mitte}
     </div>`);

  $$('[data-opt]').forEach(b => b.addEventListener('click', () => {
    const richtig = b.dataset.opt === a.richtig;
    const kl = b.classList.contains('beweis') ? 'beweis' : 'opt';
    if (richtig) {
      b.classList.add(kl + '--richtig');
      sfx.right();
      E.laborErg.push(a.ergebnis);
      toast(a.ergebnis, 'gut');
      $$('[data-opt]').forEach(x => x.style.pointerEvents = 'none');
      setTimeout(() => { E.laborIdx++; go(scrLabor); }, 1600);
    } else {
      b.classList.add(kl + '--falsch');
      fehler('Das passt nicht. Schau nochmal genau hin.');
      setTimeout(() => b.classList.remove(kl + '--falsch'), 900);
    }
  }));

  bind({ zurueck: () => go(scrTatort), notiz: oeffneNotizbuch });
}

/* ================= ZEUGEN ================= */

function scrZeugen() {
  app.innerHTML = akte(
    lasche('Akte ' + F.nr, 'rot') + lasche('Zeugen', 'blau'),
    `${topbar('Zeugen befragen', 'Eine Aussage kann nicht stimmen', { zurueck: true, notiz: true })}
     ${fortschritt(2)}
     <div class="stack">
       <div class="card card--flat">
         <h3>Vergleiche mit den Fakten</h3>
         <div class="faktenbox">
           ${F.fakten.map(f => `<div class="fakt">${esc(f)}</div>`).join('')}
           ${E.laborErg.map(f => `<div class="fakt">${esc(f)}</div>`).join('')}
         </div>
       </div>
       ${F.zeugen.map((z, zi) => `<div class="zeuge">
         ${portraet(z.bild)}
         <div class="bubbles">
           <div><b>${esc(z.name)}</b> <small class="muted">${esc(z.rolle)}</small></div>
           ${z.aussagen.map((s, si) =>
             `<button class="bubble" data-z="${zi}" data-s="${si}">${esc(s)}</button>`).join('')}
         </div>
       </div>`).join('')}
     </div>`);

  $$('.bubble').forEach(b => b.addEventListener('click', () => {
    const z = F.zeugen[+b.dataset.z], si = +b.dataset.s;
    if (z.luege === si) {
      b.classList.add('bubble--richtig');
      sfx.right();
      $$('.bubble').forEach(x => { if (x !== b) x.classList.add('bubble--aus'); });
      E.zeugeGeloest = true;
      E.laborErg.push('Widerspruch bei ' + z.name + ': ' + z.warum);
      const wrap = document.createElement('div');
      wrap.className = 'stack';
      wrap.innerHTML = `<div class="card"><div class="row"><span class="stempel">Erwischt</span></div>
        <p style="margin-top:8px">${esc(z.warum)}</p></div>
        <button class="btn btn--wide" id="weiterZ">Verdächtige ausschliessen</button>`;
      $('.akte .stack').appendChild(wrap);
      $('#weiterZ').addEventListener('click', () => { sfx.tap(); go(scrAusschluss); });
      $('#weiterZ').scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      b.classList.add('bubble--falsch');
      fehler('Diese Aussage passt zu den Fakten. Lies weiter.');
      setTimeout(() => b.classList.remove('bubble--falsch'), 1000);
    }
  }));

  bind({ zurueck: () => go(scrTatort), notiz: oeffneNotizbuch });
}

/* ================= AUSSCHLUSS ================= */

function verdaechtigenKarte(v, extra = '') {
  return `<button class="suspect ${E.raus.includes(v.id) ? 'suspect--raus' : ''}" data-v="${v.id}">
    <span class="suspect__pic"><img src="assets/portraits/${v.bild}.webp" alt=""
      onerror="this.style.display='none'"></span>
    <b>${esc(v.name)}</b>
    ${extra}
  </button>`;
}

function scrAusschluss() {
  const step = F.ausschluss[E.ausschlussIdx];
  if (!step) { go(scrVerhaftung); return; }
  const noch = step.raus.filter(id => !E.raus.includes(id));

  app.innerHTML = akte(
    lasche('Akte ' + F.nr, 'rot') + lasche('Ausschluss'),
    `${topbar('Ausschlussverfahren', `Schritt ${E.ausschlussIdx + 1} von ${F.ausschluss.length}`, { zurueck: true, notiz: true })}
     ${fortschritt(3)}
     <div class="stack">
       <div class="card"><h2>${esc(step.frage)}</h2>
         <p class="small muted">${esc(step.hinweis)}</p></div>
       <div class="suspects">${F.verdaechtige.map(v => verdaechtigenKarte(v,
         `<span class="tags">${v.merkmale.map(m => `<span class="tag">${esc(m)}</span>`).join('')}</span>`)).join('')}</div>
       <p class="small muted center" id="rest">Noch ${noch.length} ausschliessen</p>
     </div>`);

  $$('[data-v]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.v;
    if (E.raus.includes(id)) { toast('Die oder der ist schon draussen.'); return; }
    if (step.raus.includes(id)) {
      E.raus.push(id);
      b.classList.add('suspect--raus');
      sfx.stempel();
      if (navigator.vibrate) navigator.vibrate(35);
      const offen = step.raus.filter(x => !E.raus.includes(x));
      $('#rest').textContent = offen.length ? `Noch ${offen.length} ausschliessen` : 'Richtig!';
      if (!offen.length) {
        sfx.right();
        const wrap = document.createElement('div');
        wrap.innerHTML = `<div class="card"><div class="row"><span class="stempel stempel--gut">Genau</span></div>
          <p style="margin-top:8px">${esc(step.warum)}</p></div>
          <div class="spacer"></div>
          <button class="btn btn--wide" id="weiterA">Weiter</button>`;
        $('.akte .stack').appendChild(wrap);
        $('#weiterA').addEventListener('click', () => { sfx.tap(); E.ausschlussIdx++; go(scrAusschluss); });
        $('#weiterA').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      b.classList.add('suspect--falsch');
      fehler('Nein – diese Person passt zur Spur.');
      setTimeout(() => b.classList.remove('suspect--falsch'), 900);
    }
  }));

  bind({ zurueck: () => go(scrZeugen), notiz: oeffneNotizbuch });
}

/* ================= VERHAFTUNG ================= */

function scrVerhaftung() {
  app.innerHTML = akte(
    lasche('Akte ' + F.nr, 'rot') + lasche('Verhaftung'),
    `${topbar('Wer war es?', 'Tippe die Person an', { zurueck: true, notiz: true })}
     ${fortschritt(4)}
     <div class="stack">
       <div class="card"><h2>Deine Ermittlung ist fertig.</h2>
         <p class="small muted">Alle Gestempelten kommen nicht in Frage. Wer bleibt übrig?</p></div>
       <div class="suspects">${F.verdaechtige.map(v => verdaechtigenKarte(v)).join('')}</div>
     </div>`);

  $$('[data-v]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.v;
    if (id !== F.taeter) {
      b.classList.add('suspect--falsch');
      fehler(E.raus.includes(id)
        ? 'Diese Person hast du selbst ausgeschlossen.'
        : 'Die Spuren zeigen auf jemand anderen.');
      setTimeout(() => b.classList.remove('suspect--falsch'), 900);
      return;
    }
    b.classList.add('suspect--taeter');
    sfx.sirene();
    setTimeout(() => go(scrErgebnis), 1100);
  }));

  bind({ zurueck: () => go(scrAusschluss), notiz: oeffneNotizbuch });
}

/* ================= ERGEBNIS ================= */

function scrErgebnis() {
  const st = E.fehler <= 1 ? 3 : E.fehler <= 4 ? 2 : 1;
  const alterRang = S.rang().name;
  S.setSterne(F.id, st);
  const neuerRang = S.rang();
  const aufgestiegen = alterRang !== neuerRang.name;
  const taeter = F.verdaechtige.find(v => v.id === F.taeter);
  const naechster = FAELLE[FAELLE.findIndex(f => f.id === F.id) + 1];

  sfx.win();
  if (aufgestiegen) setTimeout(() => sfx.rang(), 1000);

  app.innerHTML = akte(
    lasche('Akte ' + F.nr + ' geschlossen', 'blau'),
    `${topbar('Fall gelöst', F.titel)}
     <div class="stack center">
       <div><span class="stempel stempel--gut">Fall abgeschlossen</span></div>
       <div class="bigstars">${'★'.repeat(st)}<span class="stars--leer">${'★'.repeat(3 - st)}</span></div>
       <p class="small muted">${E.fehler === 0 ? 'Kein einziger Fehler. Sauber.'
          : `${E.fehler} Fehlversuch${E.fehler > 1 ? 'e' : ''}`}</p>
       <div class="card">
         <div class="row">${portraet(taeter.bild, 'avatar--gross')}
           <span style="text-align:left"><small class="muted">Überführt</small><br><b>${esc(taeter.name)}</b></span></div>
       </div>
       <div class="card" style="text-align:left">${F.aufloesung.map(t => `<p>${esc(t)}</p>`).join('')}</div>
       <div class="wusstest" style="text-align:left">
         <b>Wusstest du? ${esc(F.wusstest.titel)}</b>
         <p class="small" style="margin-top:6px">${esc(F.wusstest.text)}</p>
       </div>
       ${aufgestiegen ? `<div class="rangbalken">
         <span class="rangbalken__medaille">${art.icon(neuerRang.icon, '#4a3208', 24)}</span>
         <span class="grow" style="text-align:left"><b>Befördert: ${esc(neuerRang.name)}</b>
         <small>${esc(RANG_TEXTE[neuerRang.name] || '')}</small></span></div>` : ''}
       ${naechster
         ? `<button class="btn btn--wide" data-act="next">Nächster Fall: ${esc(naechster.titel)}</button>`
         : `<div class="card"><b>Alle fünf Fälle gelöst.</b>
              <p class="small muted">Bärenmoos kann ruhig schlafen. Du kannst jeden Fall nochmals spielen und deine Sterne verbessern.</p></div>`}
       <button class="btn btn--ghost btn--wide" data-act="liste">Zu den Fallakten</button>
     </div>`);

  bind({
    next: () => { neueErmittlung(naechster); go(scrBriefing); },
    liste: () => go(scrFaelle)
  });
}

/* ---------------- Router ---------------- */

const IM_FALL = new Set([scrBriefing, scrTatort, scrLabor, scrZeugen, scrAusschluss, scrVerhaftung]);

function go(fn) {
  if (tatortCleanup) { tatortCleanup(); tatortCleanup = null; }
  sheet.hidden = true;
  window.scrollTo(0, 0);
  fn();
  kulisse(IM_FALL.has(fn) && F ? (KLANG[F.szene] || 'buero') : 'buero');
}

function bind(map) {
  Object.entries(map).forEach(([act, fn]) => {
    $$(`[data-act="${act}"]`).forEach(el => el.addEventListener('click', () => {
      unlock(); sfx.tap(); fn();
    }));
  });
}

/* ---------------- Start ---------------- */

S.load();
setSound(S.get().ton);
document.addEventListener('pointerdown', () => {
  unlock();
  if (S.get().musik) setMusik(true);
  kulisse('buero');
}, { once: true });
scrStart();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

let installEvt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installEvt = e;
  const b = document.createElement('button');
  b.className = 'btn btn--ghost';
  b.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 14px);z-index:80';
  b.textContent = 'Auf den Startbildschirm';
  b.onclick = () => { b.remove(); installEvt.prompt(); installEvt = null; };
  document.body.appendChild(b);
  setTimeout(() => b.remove(), 12000);
});

window.SPUERNASE = { FAELLE, S, go, scrStart, scrFaelle, get E() { return E; }, get F() { return F; } };
