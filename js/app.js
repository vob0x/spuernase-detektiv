/* Spürnase – Detektivbüro Bärenmoos
   Spiellogik, Bildschirme, Eingabe. Vanilla ES-Module, kein Build-Schritt. */

import { FAELLE, RANG_TEXTE } from './cases.js';
import * as art from './art.js';
import * as S from './state.js';
import { sfx, unlock, setSound, soundOn } from './audio.js';

const app = document.getElementById('app');
const toastEl = document.getElementById('toast');
const sheet = document.getElementById('sheet');
const sheetTitle = document.getElementById('sheetTitle');
const sheetBody = document.getElementById('sheetBody');

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"]/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------------- Laufende Ermittlung ---------------- */

let F = null;              // aktuelle Fallakte
let E = null;              // Ermittlungsstand

function neueErmittlung(fall) {
  F = fall;
  E = { gefunden: [], laborIdx: 0, laborErg: [], zeugeGeloest: false,
        ausschlussIdx: 0, raus: [], fehler: 0 };
}

/* ---------------- Rückmeldung ---------------- */

let toastTimer = null;
function toast(text, variante = '') {
  toastEl.textContent = text;
  toastEl.className = 'toast' + (variante ? ' toast--' + variante : '');
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2600);
}

function fehler(text) {
  E.fehler++;
  sfx.wrong();
  toast(text, 'bad');
  if (navigator.vibrate) navigator.vibrate(60);
}

/* ---------------- Notizbuch ---------------- */

function oeffneNotizbuch() {
  sfx.page();
  sheetTitle.textContent = 'Notizbuch – ' + F.titel;
  const teile = [];

  teile.push(`<h3>Gesicherte Fakten</h3>`);
  F.fakten.forEach(f => teile.push(
    `<div class="fact">${esc(f)}</div>`));

  teile.push(`<h3>Spuren (${E.gefunden.length}/${F.spuren.length})</h3>`);
  if (!E.gefunden.length) teile.push(`<p class="muted small">Noch nichts gefunden.</p>`);
  F.spuren.filter(s => E.gefunden.includes(s.id)).forEach(s => teile.push(
    `<div class="note">${art.icon(s.icon)}<div><b>${esc(s.name)}</b>
      <small>${esc(s.wert)}</small></div></div>`));

  if (E.laborErg.length) {
    teile.push(`<h3>Laborergebnisse</h3>`);
    E.laborErg.forEach(r => teile.push(
      `<div class="note">${art.icon('glas', '#4aa3ff')}<div><b>${esc(r)}</b></div></div>`));
  }
  if (E.raus.length) {
    teile.push(`<h3>Ausgeschlossen</h3>`);
    E.raus.forEach(id => {
      const v = F.verdaechtige.find(x => x.id === id);
      teile.push(`<div class="note">${art.icon('zettel', '#ff8080')}<div><b>${esc(v.name)}</b></div></div>`);
    });
  }
  sheetBody.innerHTML = teile.join('');
  sheet.hidden = false;
}

$$('[data-close-sheet]').forEach(el =>
  el.addEventListener('click', () => { sheet.hidden = true; }));

/* ---------------- Bausteine ---------------- */

function topbar(titel, sub, opts = {}) {
  return `<div class="topbar">
    ${opts.zurueck ? `<button class="iconbtn" data-act="zurueck" aria-label="Zurück">‹</button>` : ''}
    <h1 class="topbar__title">${esc(titel)}${sub ? `<span class="topbar__sub">${esc(sub)}</span>` : ''}</h1>
    ${opts.notiz ? `<button class="iconbtn" data-act="notiz" aria-label="Notizbuch">${art.icon('zettel','#ffd08a',22)}</button>` : ''}
  </div>`;
}

function fortschritt(stufe) {
  const namen = ['Tatort', 'Labor', 'Zeugen', 'Ausschluss', 'Verhaftung'];
  return `<div class="progress" role="img" aria-label="Schritt ${stufe + 1} von 5: ${namen[stufe]}">
    ${namen.map((n, i) => `<span class="pip ${i < stufe ? 'pip--done' : i === stufe ? 'pip--now' : ''}"></span>`).join('')}
  </div>`;
}

function sterneText(n) {
  return `<span class="stars">${'★'.repeat(n)}<span class="stars--empty">${'★'.repeat(3 - n)}</span></span>`;
}

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

function avatar(p) {
  return `<div class="avatar">${art.gesicht(p.seed, p.opts || {})}</div>`;
}

/* ================= BILDSCHIRM: START ================= */

function scrStart() {
  const r = S.rang(), naechst = S.naechsterRang(), ges = S.gesamtSterne();
  app.innerHTML = `<div class="screen">
    <div class="stack">
      <div class="hero">
        ${art.szeneFallback('schule')}
        <img src="assets/img/hero.webp" alt="" onerror="this.remove()">
        <div class="hero__badge">Detektivbüro Bärenmoos</div>
      </div>
      <div>
        <h1 class="title">Spür<span>nase</span></h1>
        <p class="lead">Fünf Fälle. Echte Spuren. Und ein Hund, der bellt, wenn du zu weit weg suchst.</p>
      </div>
      <div class="rankbar">
        <div class="rankbar__medal">${r.medal}</div>
        <div class="grow"><b>${esc(r.name)}</b>
          <small>${ges} von 15 Sternen${naechst ? ` · noch ${naechst.min - ges} bis ${esc(naechst.name)}` : ' · Höchster Rang'}</small>
        </div>
      </div>
      <button class="btn btn--wide" data-act="faelle">${ges ? 'Weiterermitteln' : 'Los geht’s'}</button>
      <div class="row">
        <button class="btn btn--ghost grow" data-act="ton">${soundOn() ? '🔊 Ton an' : '🔇 Ton aus'}</button>
        <button class="btn btn--ghost grow" data-act="anleitung">Anleitung</button>
      </div>
      ${ges ? `<button class="btn btn--ghost" data-act="reset">Fortschritt löschen</button>` : ''}
      <p class="small muted center">Läuft offline. Dein Fortschritt bleibt nur auf diesem Gerät.</p>
    </div>
  </div>`;

  bind({
    faelle: () => go(scrFaelle),
    ton: () => { const v = !soundOn(); setSound(v); S.setTon(v); sfx.tap(); scrStart(); },
    anleitung: () => zeigeAnleitung(),
    reset: () => {
      if (confirm('Wirklich allen Fortschritt löschen?')) { S.reset(); scrStart(); }
    }
  });
}

function zeigeAnleitung() {
  sheetTitle.textContent = 'So ermittelst du';
  sheetBody.innerHTML = `
    <div class="note">${art.icon('glas')}<div><b>1. Tatort</b>
      <small>Zieh den Finger über das Bild. Die Lupe leuchtet auf, wenn eine Spur in der Nähe ist. Halt kurz drauf – dann landet sie im Notizbuch.</small></div></div>
    <div class="note">${art.icon('fingerabdruck')}<div><b>2. Labor</b>
      <small>Vergleiche Muster, miss nach, lies die Uhr.</small></div></div>
    <div class="note">${art.icon('zettel')}<div><b>3. Zeugen</b>
      <small>Eine Aussage passt nicht zu den Fakten. Finde sie.</small></div></div>
    <div class="note">${art.icon('knopf')}<div><b>4. Ausschluss</b>
      <small>Streiche alle durch, die es nicht gewesen sein können.</small></div></div>
    <div class="note">${art.icon('schuh')}<div><b>5. Verhaftung</b>
      <small>Wer übrig bleibt, war es. Weniger Fehler = mehr Sterne.</small></div></div>
    <p class="small muted">Das Notizbuch 📓 oben rechts zeigt dir jederzeit alles, was du schon weisst.</p>`;
  sheet.hidden = false;
}

/* ================= BILDSCHIRM: FALLLISTE ================= */

function scrFaelle() {
  const items = FAELLE.map((f, i) => {
    const st = S.sterneFuer(f.id);
    const offen = i === 0 || S.geloest(FAELLE[i - 1].id);
    return `<button class="caseitem" data-fall="${f.id}" ${offen ? '' : 'disabled'}>
      <span class="caseitem__nr">${offen ? f.nr : '🔒'}</span>
      <span class="caseitem__txt">
        <b>${esc(f.titel)}</b>
        <small>${esc(f.ort)} · ${'●'.repeat(f.schwierigkeit)}${'○'.repeat(5 - f.schwierigkeit)}</small>
      </span>
      ${offen ? sterneText(st) : ''}
    </button>`;
  }).join('');

  app.innerHTML = `<div class="screen">
    ${topbar('Fallakten', 'Wähle einen Fall', { zurueck: true })}
    <div class="caselist">${items}</div>
    <div class="spacer"></div>
    <p class="small muted center">Ein Fall öffnet sich, sobald du den davor gelöst hast.</p>
  </div>`;

  bind({ zurueck: () => go(scrStart) });
  $$('[data-fall]').forEach(b => b.addEventListener('click', () => {
    sfx.tap();
    neueErmittlung(FAELLE.find(f => f.id === b.dataset.fall));
    go(scrBriefing);
  }));
}

/* ================= BILDSCHIRM: BRIEFING ================= */

function scrBriefing() {
  app.innerHTML = `<div class="screen">
    ${topbar('Fall ' + F.nr, F.titel, { zurueck: true })}
    <div class="stack">
      <div class="hero">
        ${art.szeneFallback(F.szene)}
        <img src="${F.bild}" alt="" onerror="this.remove()">
        <div class="hero__badge">${esc(F.ort)}</div>
      </div>
      ${F.briefing.map(t => `<div class="speech">
        <div class="avatar">${art.polizist()}</div>
        <div><b>Wachtmeister Brünnli</b><p class="small">${esc(t)}</p></div>
      </div>`).join('')}
      <div class="card card--flat">
        <h3>Was wir sicher wissen</h3>
        <div class="faktenbox">${F.fakten.map(f => `<div class="fact">${esc(f)}</div>`).join('')}</div>
      </div>
      <button class="btn btn--wide" data-act="start">Zum Tatort</button>
    </div>
  </div>`;
  bind({ zurueck: () => go(scrFaelle), start: () => go(scrTatort) });
}

/* ================= BILDSCHIRM: TATORT (Lupe) ================= */

let tatortCleanup = null;

function scrTatort() {
  const marker = F.spuren.map(s => `
    <button class="clue" data-clue="${s.id}"
      style="left:${s.x * 100}%; top:${s.y * 100}%"
      aria-label="Spur untersuchen">${art.clueMarker(s.icon)}</button>`).join('');

  app.innerHTML = `<div class="screen">
    ${topbar('Tatort absuchen', F.ort, { zurueck: true, notiz: true })}
    ${fortschritt(0)}
    <div class="scene" id="scene">
      ${art.szeneFallback(F.szene)}
      <img class="scene__bg" src="${F.bild}" alt="" onerror="this.remove()">
      <div class="scene__dark"></div>
      ${marker}
      <div class="scene__lens" id="lens" style="left:50%; top:50%"></div>
      <div class="scene__hint" id="hint">Zieh den Finger über das Bild</div>
    </div>
    <div class="spacer"></div>
    <div class="card">
      <div class="row"><b class="grow small" id="spurZahl">0 von ${F.spuren.length} Spuren</b>
        <button class="iconbtn iconbtn--label" data-act="hilfe">${art.icon('pfote','#ffd08a',20)}Rösti</button></div>
      <p class="small muted" id="spurText">Fahre mit dem Finger über den Tatort. Die Lupe leuchtet auf, wenn eine Spur in der Nähe ist.</p>
      <div class="evidence-row" id="evRow">${F.spuren.map(() =>
        `<span class="evchip evchip--empty">?</span>`).join('')}</div>
    </div>
    <div class="grow"></div>
    <button class="btn btn--wide" id="weiter" disabled>Erst alle Spuren sichern</button>
  </div>`;

  const scene = $('#scene'), lens = $('#lens'), hint = $('#hint');
  let lastMove = Date.now();
  let hoverTimer = null, hoverId = null;

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
      const cx = s.x * w, cy = s.y * h;
      const d = Math.hypot(px - cx, py - cy);
      if (E.gefunden.includes(s.id)) { el.classList.add('clue--found'); return; }
      if (d < minD) { minD = d; naechste = s; }
      el.classList.toggle('clue--near', d < 78);
    });
    if (naechste && minD < 42) {
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
    if (navigator.vibrate) navigator.vibrate(30);
    scene.querySelector(`[data-clue="${id}"]`).classList.add('clue--found');
    $('#spurZahl').textContent = `${E.gefunden.length} von ${F.spuren.length} Spuren gesichert`;
    $('#evRow').innerHTML = F.spuren.map(sp => E.gefunden.includes(sp.id)
      ? `<span class="evchip">${art.icon(sp.icon)}${esc(sp.name)}</span>`
      : `<span class="evchip evchip--empty">?</span>`).join('');
    const st = $('#spurText');
    if (st) { st.innerHTML = '<b>' + esc(s.name) + ':</b> ' + esc(s.text); st.classList.add('spurText--neu');
      setTimeout(() => st.classList.remove('spurText--neu'), 900); }

    if (E.gefunden.length === F.spuren.length) {
      const w = $('#weiter');
      w.disabled = false;
      w.textContent = 'Ab ins Spurenlabor';
      sfx.right();
      toast('Alle Spuren gesichert!', 'good');
    }
  }

  const nudge = setInterval(() => {
    if (Date.now() - lastMove < 18000) return;
    lastMove = Date.now();
    const offen = F.spuren.filter(s => !E.gefunden.includes(s.id));
    if (!offen.length) return;
    roestiHinweis(offen[0]);
  }, 4000);

  let hilfen = 0;
  function roestiHinweis(s, direkt) {
    sfx.bark();
    const wo = (s.y > 0.6 ? 'unten' : s.y < 0.4 ? 'oben' : 'in der Mitte') + ' ' +
               (s.x > 0.62 ? 'rechts' : s.x < 0.38 ? 'links' : '');
    toast('Rösti bellt: Schau mal ' + wo.trim() + '!');
    // Beim zweiten Mal zeigt Rösti die Spur direkt – niemand soll stecken bleiben.
    if (direkt) hilfen++;
    if (hilfen >= 2 || !direkt && hilfen >= 2) {
      const el = scene.querySelector(`[data-clue="${s.id}"]`);
      if (el) el.classList.add('clue--near');
    }
  }

  $('[data-act="hilfe"]').addEventListener('click', () => {
    const offen = F.spuren.filter(s => !E.gefunden.includes(s.id));
    if (!offen.length) { toast('Du hast schon alles!', 'good'); return; }
    roestiHinweis(offen[0], true);
  });

  $('#weiter').addEventListener('click', () => { sfx.tap(); go(scrLabor); });

  bind({ zurueck: () => go(scrFaelle), notiz: oeffneNotizbuch });
  tatortCleanup = () => { clearInterval(nudge); clearTimeout(hoverTimer); };
}

/* ================= BILDSCHIRM: LABOR ================= */

function scrLabor() {
  const a = F.labor[E.laborIdx];
  if (!a) { go(scrZeugen); return; }

  let mitte = '';
  if (a.typ === 'vergleich') {
    mitte = `<div class="sample">
        <div>${bildFuer(a.probe)}</div>
        <div><b>${esc(a.probe.label)}</b><br><small class="muted">${esc(a.hilfe)}</small></div>
      </div>
      <div class="options">${a.optionen.map(o => `
        <button class="opt" data-opt="${o.id}">${bildFuer(o)}<span>${esc(o.label)}</span></button>`).join('')}</div>`;
  } else {
    mitte = `${a.bild ? `<div class="card card--flat">${bildFuer(a.bild)}</div>` : ''}
      ${a.tabelle ? `<div class="card card--flat"><h3>Umrechnungstabelle</h3>
        ${a.tabelle.map(([l, g]) => `<div class="row"><span class="grow">${esc(l)}</span><b>${esc(g)}</b></div>`).join('')}
      </div>` : ''}
      <p class="small muted">${esc(a.hilfe || '')}</p>
      <div class="options options--1">${a.optionen.map(o => `
        <button class="opt" data-opt="${o.id}"><span>${esc(o.label)}</span></button>`).join('')}</div>`;
  }

  app.innerHTML = `<div class="screen">
    ${topbar('Spurenlabor', `Aufgabe ${E.laborIdx + 1} von ${F.labor.length}`, { zurueck: true, notiz: true })}
    ${fortschritt(1)}
    <div class="stack">
      <div class="card"><h2>${esc(a.frage)}</h2></div>
      ${mitte}
    </div>
  </div>`;

  $$('[data-opt]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.opt === a.richtig) {
      b.classList.add('opt--right');
      sfx.right();
      E.laborErg.push(a.ergebnis);
      toast(a.ergebnis, 'good');
      $$('[data-opt]').forEach(x => x.style.pointerEvents = 'none');
      setTimeout(() => { E.laborIdx++; go(scrLabor); }, 1500);
    } else {
      b.classList.add('opt--wrong');
      fehler('Das passt nicht. Schau nochmal genau hin.');
      setTimeout(() => b.classList.remove('opt--wrong'), 900);
    }
  }));

  bind({ zurueck: () => go(scrTatort), notiz: oeffneNotizbuch });
}

/* ================= BILDSCHIRM: ZEUGEN ================= */

function scrZeugen() {
  app.innerHTML = `<div class="screen">
    ${topbar('Zeugen befragen', 'Eine Aussage kann nicht stimmen', { zurueck: true, notiz: true })}
    ${fortschritt(2)}
    <div class="stack">
      <div class="card card--flat">
        <h3>Vergleiche mit den Fakten</h3>
        <div class="faktenbox">
          ${F.fakten.map(f => `<div class="fact">${esc(f)}</div>`).join('')}
          ${E.laborErg.map(f => `<div class="fact">${esc(f)}</div>`).join('')}
        </div>
      </div>
      ${F.zeugen.map((z, zi) => `<div class="witness">
        ${avatar(z)}
        <div class="bubbles">
          <div><b>${esc(z.name)}</b> <small class="muted">${esc(z.rolle)}</small></div>
          ${z.aussagen.map((s, si) =>
            `<button class="bubble" data-z="${zi}" data-s="${si}">${esc(s)}</button>`).join('')}
        </div>
      </div>`).join('')}
    </div>
  </div>`;

  $$('.bubble').forEach(b => b.addEventListener('click', () => {
    const z = F.zeugen[+b.dataset.z], si = +b.dataset.s;
    if (z.luege === si) {
      b.classList.add('bubble--right');
      sfx.right();
      $$('.bubble').forEach(x => x.classList.add('bubble--off'));
      E.zeugeGeloest = true;
      E.laborErg.push('Widerspruch bei ' + z.name + ': ' + z.warum);
      const wrap = document.createElement('div');
      wrap.className = 'stack';
      wrap.innerHTML = `<div class="card"><h3>Erwischt!</h3><p>${esc(z.warum)}</p></div>
        <button class="btn btn--wide" id="weiterZ">Verdächtige ausschliessen</button>`;
      $('.screen .stack').appendChild(wrap);
      $('#weiterZ').scrollIntoView({ behavior: 'smooth', block: 'center' });
      $('#weiterZ').addEventListener('click', () => { sfx.tap(); go(scrAusschluss); });
    } else {
      b.classList.add('bubble--wrong');
      fehler('Diese Aussage passt zu den Fakten. Lies weiter.');
      setTimeout(() => b.classList.remove('bubble--wrong'), 1000);
    }
  }));

  bind({ zurueck: () => go(scrTatort), notiz: oeffneNotizbuch });
}

/* ================= BILDSCHIRM: AUSSCHLUSS ================= */

function scrAusschluss() {
  const step = F.ausschluss[E.ausschlussIdx];
  if (!step) { go(scrVerhaftung); return; }
  const noch = step.raus.filter(id => !E.raus.includes(id));

  app.innerHTML = `<div class="screen">
    ${topbar('Ausschlussverfahren', `Schritt ${E.ausschlussIdx + 1} von ${F.ausschluss.length}`, { zurueck: true, notiz: true })}
    ${fortschritt(3)}
    <div class="stack">
      <div class="card"><h2>${esc(step.frage)}</h2>
        <p class="small muted">${esc(step.hinweis)}</p></div>
      <div class="suspects">${F.verdaechtige.map(v => `
        <button class="suspect ${E.raus.includes(v.id) ? 'suspect--out' : ''}" data-v="${v.id}">
          <span class="suspect__pic">${art.gesicht(v.seed, v.opts || {})}</span>
          <b>${esc(v.name)}</b>
          <span class="tags">${v.merkmale.map(m => `<span class="tag">${esc(m)}</span>`).join('')}</span>
        </button>`).join('')}</div>
      <p class="small muted center" id="rest">Noch ${noch.length} ausschliessen</p>
    </div>
  </div>`;

  $$('[data-v]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.v;
    if (E.raus.includes(id)) { toast('Die/der ist schon draussen.'); return; }
    if (step.raus.includes(id)) {
      E.raus.push(id);
      b.classList.add('suspect--out');
      sfx.stamp();
      const offen = step.raus.filter(x => !E.raus.includes(x));
      $('#rest').textContent = offen.length ? `Noch ${offen.length} ausschliessen` : 'Richtig!';
      if (!offen.length) {
        sfx.right();
        const wrap = document.createElement('div');
        wrap.innerHTML = `<div class="card"><h3>Genau</h3><p>${esc(step.warum)}</p></div>
          <div class="spacer"></div>
          <button class="btn btn--wide" id="weiterA">Weiter</button>`;
        $('.screen .stack').appendChild(wrap);
        $('#weiterA').addEventListener('click', () => {
          sfx.tap(); E.ausschlussIdx++; go(scrAusschluss);
        });
        $('#weiterA').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      b.classList.add('opt--wrong');
      fehler('Nein – diese Person passt zur Spur.');
      setTimeout(() => b.classList.remove('opt--wrong'), 900);
    }
  }));

  bind({ zurueck: () => go(scrZeugen), notiz: oeffneNotizbuch });
}

/* ================= BILDSCHIRM: VERHAFTUNG ================= */

function scrVerhaftung() {
  app.innerHTML = `<div class="screen">
    ${topbar('Wer war es?', 'Tippe die Person an', { zurueck: true, notiz: true })}
    ${fortschritt(4)}
    <div class="stack">
      <div class="card"><h2>Deine Ermittlung ist fertig.</h2>
        <p class="small muted">Alle Durchgestrichenen kommen nicht in Frage. Wer bleibt übrig?</p></div>
      <div class="suspects">${F.verdaechtige.map(v => `
        <button class="suspect ${E.raus.includes(v.id) ? 'suspect--out' : ''}" data-v="${v.id}">
          <span class="suspect__pic">${art.gesicht(v.seed, v.opts || {})}</span>
          <b>${esc(v.name)}</b>
        </button>`).join('')}</div>
    </div>
  </div>`;

  $$('[data-v]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.v;
    if (id !== F.taeter) {
      b.classList.add('opt--wrong');
      fehler(E.raus.includes(id)
        ? 'Diese Person hast du selbst ausgeschlossen.'
        : 'Die Spuren zeigen auf jemand anderen.');
      setTimeout(() => b.classList.remove('opt--wrong'), 900);
      return;
    }
    b.classList.add('suspect--right');
    sfx.siren();
    setTimeout(() => go(scrErgebnis), 900);
  }));

  bind({ zurueck: () => go(scrAusschluss), notiz: oeffneNotizbuch });
}

/* ================= BILDSCHIRM: ERGEBNIS ================= */

function scrErgebnis() {
  const st = E.fehler <= 1 ? 3 : E.fehler <= 4 ? 2 : 1;
  const alterRang = S.rang().name;
  S.setSterne(F.id, st);
  const neuerRang = S.rang();
  const aufgestiegen = alterRang !== neuerRang.name;
  const taeter = F.verdaechtige.find(v => v.id === F.taeter);
  const naechster = FAELLE[FAELLE.findIndex(f => f.id === F.id) + 1];

  sfx.win();
  if (aufgestiegen) setTimeout(() => sfx.rank(), 900);

  app.innerHTML = `<div class="screen">
    ${topbar('Fall gelöst', F.titel)}
    <div class="stack center">
      <div class="bigstars">${'★'.repeat(st)}<span class="stars--empty">${'★'.repeat(3 - st)}</span></div>
      <p class="small muted">${E.fehler === 0 ? 'Kein einziger Fehler. Sauber.' : `${E.fehler} Fehlversuch${E.fehler > 1 ? 'e' : ''}`}</p>
      <div class="card">
        <div class="row"><div class="avatar">${art.gesicht(taeter.seed, taeter.opts || {})}</div>
          <div style="text-align:left"><small class="muted">Überführt</small><br><b>${esc(taeter.name)}</b></div></div>
      </div>
      <div class="card" style="text-align:left">
        ${F.aufloesung.map(t => `<p>${esc(t)}</p>`).join('')}
      </div>
      <div class="didyouknow" style="text-align:left">
        <b>Wusstest du? ${esc(F.wusstest.titel)}</b>
        <p class="small" style="margin-top:6px">${esc(F.wusstest.text)}</p>
      </div>
      ${aufgestiegen ? `<div class="rankbar"><div class="rankbar__medal">${neuerRang.medal}</div>
        <div class="grow" style="text-align:left"><b>Befördert: ${esc(neuerRang.name)}</b>
        <small>${esc(RANG_TEXTE[neuerRang.name] || '')}</small></div></div>` : ''}
      ${naechster
        ? `<button class="btn btn--wide" data-act="next">Nächster Fall: ${esc(naechster.titel)}</button>`
        : `<div class="card"><b>Alle fünf Fälle gelöst.</b>
             <p class="small muted">Bärenmoos kann ruhig schlafen. Du kannst jeden Fall nochmals spielen und deine Sterne verbessern.</p></div>`}
      <button class="btn btn--ghost btn--wide" data-act="liste">Zu den Fallakten</button>
    </div>
  </div>`;

  bind({
    next: () => { neueErmittlung(naechster); go(scrBriefing); },
    liste: () => go(scrFaelle)
  });
}

/* ---------------- Router ---------------- */

function go(fn) {
  if (tatortCleanup) { tatortCleanup(); tatortCleanup = null; }
  sheet.hidden = true;
  window.scrollTo(0, 0);
  fn();
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
document.addEventListener('pointerdown', unlock, { once: true });
scrStart();

/* Service Worker */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

/* Installations-Hinweis */
let installEvt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installEvt = e;
  const b = document.createElement('button');
  b.className = 'btn btn--ghost';
  b.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 14px);z-index:80';
  b.textContent = '📲 Auf den Startbildschirm';
  b.onclick = async () => { b.remove(); installEvt.prompt(); installEvt = null; };
  document.body.appendChild(b);
  setTimeout(() => b.remove(), 12000);
});

window.SPUERNASE = { FAELLE, S, go, scrStart, scrFaelle, get E() { return E; }, get F() { return F; } };
