/* Spürnase – Detektivbüro Bärenmoos
   Feste Querformat-Bühne, animierte Abläufe, vertonte Texte. */

import { FAELLE, RANG_TEXTE } from './cases.js';
import * as art from './art.js';
import * as S from './state.js';
import { sfx, unlock, setSound, soundOn, setMusik, musikLaeuft, kulisse } from './audio.js';
import { sprich, stopp, stoppBildwechsel, setSprache, spracheAn, sprichFolge, vorladen, beiWechsel, laeuft } from './voice.js';

const buehne = document.getElementById('buehne');
const B = { w: 1000, h: 480 };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const warte = (ms) => new Promise(r => setTimeout(r, ms));
const KLANG = { schule: 'schule', bahnhof: 'bahnhof', gemeindehaus: 'dorfplatz',
                museum: 'museum', wald: 'wald' };

let F = null, E = null, aufraeumen = null;

/* ---------------- Bühne skalieren ---------------- */

function passen() {
  const vw = window.innerWidth, vh = window.innerHeight;
  document.body.classList.toggle('hochkant', vh > vw * 1.02);
  const s = Math.min(vw / B.w, vh / B.h);
  buehne.style.transform = `translate(-50%,-50%) scale(${s})`;
}
addEventListener('resize', passen);
addEventListener('orientationchange', () => setTimeout(passen, 120));

/* ---------------- Bildschirmwechsel ---------------- */

function zeige(html, klasse = '') {
  if (aufraeumen) { aufraeumen(); aufraeumen = null; }
  // Nicht stopp(): eine laufende Rueckmeldung («Genau richtig») gehoert zu
  // dem, was das Kind getan hat, und soll den Wechsel ueberleben.
  stoppBildwechsel();
  const alt = buehne.firstElementChild;
  if (alt) { alt.classList.add('scr--raus'); setTimeout(() => alt.remove(), 220); }
  const neu = document.createElement('div');
  neu.className = 'scr ' + klasse;
  neu.innerHTML = html;
  buehne.appendChild(neu);
  return neu;
}

/* Fuehrt fn hoechstens einmal aus – und nur, solange der Bildschirm noch
   im Dokument haengt. Verhindert, dass Sprachende und Notfall-Timer
   gemeinsam weiterschalten und dabei einen Schritt ueberspringen. */
function einmal(scr, fn) {
  let getan = false;
  return () => {
    if (getan || !scr.isConnected) return;
    getan = true; fn();
  };
}

function tippen(wurzel, wahl, fn) {
  $$(wahl, wurzel).forEach(el => el.addEventListener('click', (e) => { unlock(); fn(el, e); }));
}

/* ---------------- Bausteine ---------------- */

const portraet = (key, cls = '') =>
  `<span class="portraet ${cls}"><img src="assets/portraits/${key}.webp" alt=""
     onerror="this.style.display='none'"></span>`;

const hoerIcon = art.icon('lautsprecher', 'currentColor', 20);

function kopf(titel, unter, opts = {}) {
  return `<div class="kopf ${opts.dunkel ? 'kopf--dunkel' : ''}">
    ${opts.zurueck !== false ? `<button class="rund" data-k="zurueck" aria-label="Zurück">
      ${art.icon('pfeilLinks', '#23272f', 22)}</button>` : ''}
    <div class="kopf__titel">${esc(titel)}${unter ? `<small>${esc(unter)}</small>` : ''}</div>
    ${opts.schritte ? `<div class="schritte">${opts.schritte}</div>` : ''}
    ${opts.notiz ? `<button class="rund" data-k="notiz" aria-label="Notizbuch">
      ${art.icon('zettel', '#23272f', 22)}</button>` : ''}
  </div>`;
}

function schrittPips() {
  return F.phasen.map((p, i) =>
    `<span class="pip ${i < E.idx ? 'pip--done' : i === E.idx ? 'pip--now' : ''}"></span>`).join('');
}

/* Bedienung auf der Szene statt Kopfleiste darueber.

   Die braune Holzleiste mit Titel und Untertitel nahm oben 60 Pixel weg und
   erklaerte in Worten, was das Bild ohnehin zeigt: «Tatort – Bahnhof
   Bärenmoos». Sie ist weg. Was bleibt, sind vier feste Plaetze, auf allen
   Bildschirmen gleich:

     oben links    was gesucht wird (nur wo es das gibt)
     oben rechts   Notizbuch
     unten links   zurueck
     unten Mitte   Fortschritt
     unten rechts  nochmal hoeren

   Wer immer am selben Ort sucht, muss nicht lesen, wo etwas steht. */
function bedien(opts = {}) {
  return `
    ${opts.zurueck !== false ? `<button class="rund knopf knopf--zurueck" data-k="zurueck"
      aria-label="Zurück">${art.icon('pfeilLinks', '#23272f', 22)}</button>` : ''}
    ${opts.notiz ? `<button class="rund knopf knopf--notiz" data-k="notiz"
      aria-label="Notizbuch">${art.icon('zettel', '#23272f', 22)}</button>` : ''}
    ${opts.sage ? `<button class="rund knopf knopf--hoer" data-sage="${opts.sage}"
      aria-label="Nochmal hören">${hoerIcon}</button>` : ''}
    ${opts.pips ? `<div class="fortschritt">${opts.pips}</div>` : ''}`;
}

/* Der gesprochene Satz steht nur dann noch geschrieben da, wenn er nicht
   gesprochen werden kann – Ton aus oder Vorlesen aus. Sonst waere das Spiel
   ohne Ton unspielbar, und das waere ein zu hoher Preis fuer einen
   aufgeraeumten Bildschirm. */
function stillText(text, id, hell) {
  return (spracheAn() && soundOn()) ? '' : sageBox(text, id, hell);
}

/* Sprechzeile unten: Text sichtbar, Stimme dazu */
function sageBox(text, id, hell) {
  return `<div class="sage ${hell ? 'sage--hell' : ''}" data-sage="${id || ''}">
    ${id ? `<button class="sage__hoer" aria-label="Nochmal vorlesen">${hoerIcon}</button>` : ''}
    <span>${esc(text)}</span></div>`;
}

/* Der Kasten selbst schluckt keine Zeiger — sonst liesse sich eine Spur, die
   darunter liegt, nicht mit der Lupe finden. Nur der Hoer-Knopf ist anfassbar. */
function sageVerbinden(wurzel) {
  const box = $('[data-sage]', wurzel);
  if (!box || !box.dataset.sage) return;
  const hoer = $('.sage__hoer', box) || (box.classList.contains('rund') ? box : null);
  // Die Kennung wird erst beim Klick gelesen: der Kasten wechselt seinen Text.
  (hoer || box).addEventListener('click', () => { unlock(); sprich(box.dataset.sage, { sofort: true }); });
  const ab = beiWechsel((l) => hoer && hoer.classList.toggle('laut', l === box.dataset.sage));
  const alt = aufraeumen;
  aufraeumen = () => { ab(); alt && alt(); };
}

function meldung(text, art2 = '') {
  const alt = $('.meldung', buehne);
  if (alt) alt.remove();
  const m = document.createElement('div');
  m.className = 'meldung ' + (art2 ? 'meldung--' + art2 : '');
  m.textContent = text;
  buehne.appendChild(m);
  setTimeout(() => m.remove(), 2600);
}

function fehler(text, stimme = 'g-falsch') {
  E.fehler++;
  sfx.wrong();
  meldung(text, 'schlecht');
  // Sofort: eine Rueckmeldung auf einen falschen Tipp muss beim Tipp
  // ankommen, sonst bezieht das Kind sie nicht mehr darauf.
  sprich(stimme, { sofort: true });
  if (navigator.vibrate) navigator.vibrate(50);
}

const sterneText = (n) =>
  `<span class="sterne">${'★'.repeat(n)}<span class="sterne--leer">${'★'.repeat(3 - n)}</span></span>`;

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
  if (a === 'tierspur') return art.tierspur(v);
  return '';
}

/* ================= TITEL ================= */

function scrTitel() {
  const r = S.rang(), ges = S.gesamtSterne(), n = S.naechsterRang();
  const s = zeige(`
    <div class="titelbild"><img src="assets/img/hero.webp" alt=""></div>
    <div class="titelinhalt">
      <h1 class="titel">Spür<span>nase</span></h1>
      <p class="untertitel">Fünf Fälle. Echte Spuren. Und ein Hund, der bellt, wenn du zu weit weg suchst.</p>
      <div class="rangchip">
        <span class="rangchip__m">${art.icon(r.icon, '#4a3208', 24)}</span>
        <span><b>${esc(r.name)}</b><small>${ges} von 15 Sternen${
          n ? ` · noch ${n.min - ges} bis ${esc(n.name)}` : ' · höchster Rang'}</small></span>
      </div>
      <div class="titelknoepfe">
        <button class="btn btn--gross" data-k="start">${ges ? 'Weiterermitteln' : 'Los geht’s'}</button>
      </div>
      <div class="titelknoepfe">
        <button class="btn btn--geist btn--klein" data-k="ton">${soundOn() ? 'Ton an' : 'Ton aus'}</button>
        <button class="btn btn--geist btn--klein" data-k="musik">${musikLaeuft() ? 'Musik an' : 'Musik aus'}</button>
        <button class="btn btn--geist btn--klein" data-k="stimme">${spracheAn() ? 'Vorlesen an' : 'Vorlesen aus'}</button>
      </div>
    </div>`);

  tippen(s, '[data-k]', (el) => {
    const k = el.dataset.k;
    sfx.tap();
    if (k === 'start') return go(scrAkten);
    if (k === 'ton') { const v = !soundOn(); setSound(v); S.setTon(v); if (v) kulisse('buero'); }
    if (k === 'musik') { const v = !musikLaeuft(); setMusik(v); S.setMusikPref(v); }
    if (k === 'stimme') { const v = !spracheAn(); setSprache(v); S.setSprachePref(v); }
    scrTitel();
  });
}

/* ================= FALLAKTEN ================= */

function scrAkten() {
  const karten = FAELLE.map((f, i) => {
    const st = S.sterneFuer(f.id);
    const offen = i === 0 || S.geloest(FAELLE[i - 1].id);
    return `<button class="akte ${offen ? '' : 'akte--zu'}" data-fall="${f.id}"
        style="animation-delay:${i * 70}ms" ${offen ? '' : 'disabled'}>
      <span class="akte__bild"><img src="${f.bild}" alt="">
        <span class="akte__nr">${offen ? f.nr : '?'}</span></span>
      <span class="akte__txt">
        <b>${esc(f.titel)}</b>
        <small>${esc(f.ort)}</small>
        ${offen ? sterneText(st) : `<span class="sterne sterne--leer">gesperrt</span>`}
      </span>
    </button>`;
  }).join('');

  const s = zeige(kopf('Fallakten', 'Wähle einen Fall') + `<div class="akten">${karten}</div>`);
  sprich('g-willkommen');
  tippen(s, '[data-k="zurueck"]', () => { sfx.tap(); go(scrTitel); });
  tippen(s, '[data-fall]', (el) => {
    sfx.akte();
    starteFall(FAELLE.find(f => f.id === el.dataset.fall));
  });
}

function starteFall(fall) {
  F = fall;
  E = { idx: 0, gefunden: [], laborIdx: 0, zeugeOk: false, lineupIdx: 0,
        raus: [], fehler: 0, ergebnisse: [], verfIdx: 0 };
  vorladen([`${F.id}-intro`, ...F.spuren.map(s => `${F.id}-${s.id}`)]);
  go(scrIntro);
}

/* ================= FALL-INTRO ================= */

function scrIntro() {
  const s = zeige(`
    ${kopf('Fall ' + F.nr, F.titel)}
    <div class="introFoto">
      <div class="introFoto__inner">
        ${art.szeneFallback(F.szene)}
        <img src="${F.bild}" alt="" onerror="this.remove()">
      </div>
      <div class="introStempel"><span class="stempel" style="opacity:0">Akte ${F.nr}</span></div>
    </div>
    <div class="introRechts">
      <div class="rede" style="opacity:0">
        ${portraet('bruennli')}
        <div><b>Wachtmeister Brünnli</b><p>${esc(F.intro.text)}</p></div>
      </div>
      <div class="fakten">
        ${F.intro.fakten.map(f => `<div class="fakt" style="opacity:0">
          ${art.icon(f.icon, '#1f4f86', 24)}<span>${esc(f.text)}</span></div>`).join('')}
      </div>
      <div style="margin-top:auto;opacity:0" data-los>
        <button class="btn btn--gross btn--wide" data-k="los">Zum Tatort</button>
      </div>
    </div>`);

  (async () => {
    sfx.ausloeser();
    await warte(420);
    const st = $('.introStempel .stempel', s);
    st.style.opacity = ''; st.classList.add('stempel--knall'); sfx.stempel();
    await warte(280);
    const rede = $('.rede', s);
    rede.style.opacity = ''; rede.style.animation = 'redeRein .45s cubic-bezier(.2,1.3,.4,1) both';
    sprich(`${F.id}-intro`);
    await warte(420);
    for (const [i, f] of $$('.fakt', s).entries()) {
      f.style.opacity = ''; f.style.animation = 'faktRein .4s cubic-bezier(.2,1.3,.4,1) both';
      sfx.tick();
      await warte(210);
    }
    const los = $('[data-los]', s);
    los.style.opacity = ''; los.style.animation = 'redeRein .4s ease both';
  })();

  tippen(s, '[data-k="zurueck"]', () => { sfx.zuschlag(); go(scrAkten); });
  tippen(s, '[data-k="los"]', () => { sfx.tap(); E.idx = 0; phase(); });
}

/* ---------------- Phasensteuerung ---------------- */

const SCREENS = {
  tatort: () => scrTatort(), labor: () => scrLabor(), verfolgung: () => scrVerfolgung(),
  zeitstrahl: () => scrZeitstrahl(), zeugen: () => scrZeugen(),
  lineup: () => scrLineup(), verhaftung: () => scrVerhaftung()
};

function phase() { go(SCREENS[F.phasen[E.idx]] || scrErgebnis); }
function weiter() { E.idx++; E.idx >= F.phasen.length ? go(scrErgebnis) : phase(); }

function go(fn) {
  fn();
  kulisse(F && SCREENS[F.phasen[E && E.idx]] ? (KLANG[F.szene] || 'buero') : 'buero');
  passen();
}

/* ================= TATORT ================= */

function scrTatort() {
  const lampe = F.licht === 'taschenlampe';
  const marker = F.spuren.map((sp, i) => `
    <button class="spur" data-spur="${sp.id}" style="left:${sp.x * 100}%;top:${sp.y * 100}%"
      aria-label="Spur ${i + 1}">${art.spurMarker(sp.icon, i + 1)}</button>`).join('');

  const s = zeige(`
    <div class="szene ${lampe ? 'szene--nacht' : ''}" id="szene">
      ${art.szeneFallback(F.szene)}
      <img class="szene__bg" src="${F.bild}" alt="" onerror="this.remove()">
      <div class="szene__dunkel"></div>
      <div class="wetter" id="wetter"></div>
      ${marker}
      <div class="lupe ${lampe ? 'lupe--lampe' : ''}" id="lupe" style="left:50%;top:52%"></div>
    </div>
    ${bedien({ notiz: true, sage: lampe ? 'g-dunkel' : 'g-tatort', pips: schrittPips() })}
    <div class="beweisleiste">
      ${F.spuren.map(sp => `<span class="bslot" data-slot="${sp.id}">
        ${art.icon(sp.icon, 'rgba(255,255,255,.4)', 27)}</span>`).join('')}
    </div>
    ${stillText(lampe ? 'Es ist dunkel. Leuchte mit der Taschenlampe.'
                      : 'Zieh die Lupe über das Bild und such nach Spuren.',
                lampe ? 'g-dunkel' : 'g-tatort')}`, 'scr--tatort');

  wetterMachen($('#wetter', s), F.szene);
  // Die Zeile bleibt so lange stehen, wie sie gesprochen wird – mindestens aber
  // 3,5 s, damit sie auch bei ausgeschaltetem Vorlesen zu lesen ist.
  const sageWeg = (p) => Promise.all([p, warte(3500)])
    .then(() => { const b = $('.sage', s); if (b) b.classList.add('sage--weg'); });
  sageWeg(sprich(lampe ? 'g-dunkel' : 'g-tatort'));

  const szene = $('#szene', s), lupe = $('#lupe', s);
  let letzte = Date.now(), haltId = null, haltTimer = null, lupeTon = 0, hilfen = 0;

  const nah = lampe ? 108 : 74, greif = lampe ? 60 : 42;

  function bewege(ev) {
    ev.preventDefault();
    letzte = Date.now();
    const r = szene.getBoundingClientRect();
    const p = ev.touches ? ev.touches[0] : ev;
    const skala = r.width / B.w;
    const x = (p.clientX - r.left) / skala, y = (p.clientY - r.top) / skala;
    lupe.style.left = x + 'px'; lupe.style.top = y + 'px';
    let ziel = null, min = 1e9;
    F.spuren.forEach(sp => {
      const el = szene.querySelector(`[data-spur="${sp.id}"]`);
      if (!el || E.gefunden.includes(sp.id)) return;
      const d = Math.hypot(x - sp.x * B.w, y - sp.y * B.h);
      if (d < min) { min = d; ziel = sp; }
      el.classList.toggle('spur--nah', d < nah);
    });
    if (ziel && min < greif) {
      if (haltId !== ziel.id) {
        haltId = ziel.id; clearTimeout(haltTimer);
        haltTimer = setTimeout(() => sammle(ziel.id), 400);
      }
    } else { haltId = null; clearTimeout(haltTimer); }
    if (Date.now() - lupeTon > 620) { lupeTon = Date.now(); sfx.lupe(); }
  }
  szene.addEventListener('pointermove', bewege, { passive: false });
  szene.addEventListener('pointerdown', bewege, { passive: false });
  tippen(s, '[data-spur]', (el) => {
    if (el.classList.contains('spur--nah')) sammle(el.dataset.spur);
  });

  function sammle(id) {
    if (E.gefunden.includes(id)) return;
    const sp = F.spuren.find(x => x.id === id);
    E.gefunden.push(id);
    sfx.found();
    if (navigator.vibrate) navigator.vibrate(25);
    const mk = szene.querySelector(`[data-spur="${id}"]`);
    const slot = s.querySelector(`[data-slot="${id}"]`);
    mk.classList.add('spur--gefunden');
    // Marker fliegt in die Beweisleiste
    const mr = mk.getBoundingClientRect(), sr = slot.getBoundingClientRect();
    const sk = szene.getBoundingClientRect().width / B.w;
    mk.style.setProperty('--dx', ((sr.left + sr.width / 2 - mr.left - mr.width / 2) / sk) + 'px');
    mk.style.setProperty('--dy', ((sr.top + sr.height / 2 - mr.top - mr.height / 2) / sk) + 'px');
    setTimeout(() => { mk.classList.add('spur--weg'); sfx.whoosh(); }, 260);
    setTimeout(() => {
      slot.classList.add('bslot--voll');
      slot.innerHTML = art.icon(sp.icon, '#96690f', 27);
    }, 700);

    // Der Textkasten steht nur noch da, wenn nicht gesprochen werden kann.
    // Sonst traegt der Hoer-Knopf unten rechts die Kennung.
    const box = $('.sage', s);
    if (box) {
      box.classList.remove('sage--weg');
      box.dataset.sage = `${F.id}-${sp.id}`;
      const zeile = $('.sage span:last-child', box);
      if (zeile) zeile.textContent = sp.name + ': ' + sp.sagt;
    }
    const hoer = $('.knopf--hoer', s);
    if (hoer) hoer.dataset.sage = `${F.id}-${sp.id}`;
    sageWeg(sprich(`${F.id}-${sp.id}`));

    if (E.gefunden.length === F.spuren.length) {
      sfx.right();
      setTimeout(() => {
        meldung('Alle Spuren gesichert!', 'gut');
        const w = document.createElement('button');
        w.className = 'btn btn--gross weiterBtn';
        w.textContent = 'Weiter';
        w.onclick = () => { sfx.tap(); weiter(); };
        s.appendChild(w);
        sprich('g-alle');
      }, 900);
    }
  }

  const stups = setInterval(() => {
    if (Date.now() - letzte < 15000) return;
    // Nicht hineinbellen, wenn gerade gesprochen wird – das Kind hoert zu.
    if (laeuft()) return;
    letzte = Date.now();
    const offen = F.spuren.filter(x => !E.gefunden.includes(x.id));
    if (offen.length) hinweis(offen[0]);
  }, 3000);

  function hinweis(sp) {
    sfx.bark();
    hilfen++;
    const wo = sp.y > 0.62 ? 'unten' : sp.y < 0.4 ? 'oben' : (sp.x > 0.55 ? 'rechts' : 'links');
    sprich('g-hinweis-' + (['oben', 'unten', 'links', 'rechts'].includes(wo) ? wo : 'unten'));
    meldung('Rösti bellt: schau ' + wo + '!');
    if (hilfen >= 2) {
      const el = szene.querySelector(`[data-spur="${sp.id}"]`);
      if (el) el.classList.add('spur--nah');
    }
  }

  tippen(s, '[data-k="zurueck"]', () => { sfx.zuschlag(); go(scrAkten); });
  tippen(s, '[data-k="notiz"]', notizbuch);
  sageVerbinden(s);
  const alt = aufraeumen;
  aufraeumen = () => { clearInterval(stups); clearTimeout(haltTimer); alt && alt(); };
}

function wetterMachen(box, szene) {
  if (!box) return;
  if (szene === 'schule') {
    for (let i = 0; i < 46; i++) {
      const t = document.createElement('i');
      t.className = 'tropfen';
      t.style.left = Math.random() * 100 + '%';
      t.style.animationDuration = (0.5 + Math.random() * 0.5) + 's';
      t.style.animationDelay = (-Math.random() * 2) + 's';
      t.style.opacity = 0.35 + Math.random() * 0.4;
      box.appendChild(t);
    }
  } else if (szene === 'museum' || szene === 'wald') {
    for (let i = 0; i < 26; i++) {
      const d = document.createElement('i');
      d.className = 'staub';
      d.style.left = Math.random() * 100 + '%';
      d.style.top = (40 + Math.random() * 60) + '%';
      d.style.animationDuration = (7 + Math.random() * 9) + 's';
      d.style.animationDelay = (-Math.random() * 10) + 's';
      box.appendChild(d);
    }
  }
}

/* ================= LABOR ================= */

function scrLabor() {
  const a = F.labor[E.laborIdx];
  if (!a) { weiter(); return; }
  const zahl = a.typ !== 'vergleich';
  const karten = a.optionen.map((o, i) => zahl
    ? `<button class="karte karte--zahl" data-opt="${o.id}" style="animation-delay:${i * 80}ms">${esc(o.label)}</button>`
    // Bei Bildkarten faellt die Beschriftung weg: verglichen wird das Muster,
    // nicht der Buchstabe. Bei Zahlkarten ist die Zahl der Inhalt und bleibt.
    : `<button class="karte" data-opt="${o.id}" style="animation-delay:${i * 80}ms"
         aria-label="${esc(o.label)}">${bildFuer(o)}</button>`).join('');

  const s = zeige(`
    ${bedien({ notiz: true, sage: `${F.id}-lab${E.laborIdx}-f`,
               pips: F.labor.map((_, i) =>
                 `<span class="pip ${i < E.laborIdx ? 'pip--done' : i === E.laborIdx ? 'pip--now' : ''}"></span>`).join('') })}
    <div class="laborProbe">${bildFuer(a.probe || a.bild)}</div>
    <div class="karten ${zahl ? 'karten--zahl' : ''} ${a.optionen.length === 3 && !zahl ? 'karten--3' : ''}">${karten}</div>
    ${stillText(a.frage, `${F.id}-lab${E.laborIdx}-f`, true)}`, 'scr--labor');

  sprich(`${F.id}-lab${E.laborIdx}-f`);

  tippen(s, '[data-opt]', (el) => {
    if (el.dataset.opt === a.richtig) {
      el.classList.add('karte--richtig');
      sfx.treffer();
      E.ergebnisse.push(a.ergebnis);
      $$('[data-opt]', s).forEach(x => x.style.pointerEvents = 'none');
      meldung(a.ergebnis, 'gut');
      const naechste = einmal(s, () => { E.laborIdx++; go(scrLabor); });
      // Weiter, sobald die Zeile fertig ist – aber nie vor 2,2 s.
      Promise.all([sprich(`${F.id}-lab${E.laborIdx}-e`), warte(2200)]).then(naechste);
    } else {
      el.classList.add('karte--falsch');
      fehler('Das passt nicht. Schau nochmal genau hin.');
      setTimeout(() => el.classList.remove('karte--falsch'), 900);
    }
  });
  tippen(s, '[data-k="zurueck"]', () => { sfx.zuschlag(); go(scrAkten); });
  tippen(s, '[data-k="notiz"]', notizbuch);
  sageVerbinden(s);
}

/* ================= VERFOLGUNG ================= */

/* Die Verfolgung war ein Quiz mit Tapete: zwei Karten vor einem
   abgedunkelten Foto, dazu Kopfleiste, Titel, Untertitel und ein schwarzer
   Textkasten. Gemessen ragten die Karten 28 Pixel unter die Bühne hinaus –
   das untere Drittel des Profils war gar nicht zu sehen.

   Jetzt liegt die Szene ungeschnitten da, die Spuren liegen **im Weg** und
   laufen perspektivisch nach hinten, und nach der richtigen Wahl fährt die
   Kamera in den gewählten Ast weiter. Aus drei Fragen wird ein Weg.

   Kein Titel, keine Kopfleiste, kein Textkasten: gesprochen wird sowieso,
   und der Bildschirm gehört der Szene. Nur zwei runde Knöpfe bleiben —
   zurück und nochmal hören. */

/* Wo die beiden Fährten liegen. Bühnenmass 1000x480, vorne unten breit,
   hinten an der Weggabel schmal. */
const VF_BAHN = {
  links:  { von: [318, 500], stuetz: [352, 320], nach: [452, 176] },
  rechts: { von: [706, 500], stuetz: [714, 318], nach: [648, 168] },
};
const VF_SZENE = { f2: 'assets/img/gabel-2.webp', f5: 'assets/img/gabel-5.webp' };

function scrVerfolgung() {
  const V = F.verfolgung;
  const schritt = V.schritte[E.verfIdx];
  if (!schritt) { weiter(); return; }
  const szene = VF_SZENE[F.id] || F.bild;

  const ast = (seite) => {
    const b = VF_BAHN[seite];
    return `<g class="vfAst" data-seite="${seite}">
      ${art.faehrte(schritt[seite], b.von, b.stuetz, b.nach)}
    </g>`;
  };
  const lupenKnopf = (seite) => {
    const b = VF_BAHN[seite];
    const P = seite === 'links' ? [372, 300] : [676, 296];
    return `<button class="vfLupe vfLupe--${seite}" data-seite="${seite}"
        style="left:${P[0]}px;top:${P[1]}px"
        aria-label="Diese Spur wählen">${art.faehrteLupe(schritt[seite], 104)}</button>`;
  };

  const s = zeige(`
    <div class="vf">
      <div class="vfKamera">
        <img class="vfSzene" src="${szene}" alt="" onerror="this.style.opacity=0">
        <svg class="vfSpuren" viewBox="0 0 1000 480" aria-hidden="true">
          ${ast('links')}${ast('rechts')}
        </svg>
        ${lupenKnopf('links')}${lupenKnopf('rechts')}
      </div>
      <div class="vfSuch">
        ${art.faehrteLupe(V.referenz, 92)}
        <span class="vfSuch__ring"></span>
      </div>
      <button class="rund vfZurueck" data-k="zurueck" aria-label="Zurück">
        ${art.icon('pfeilLinks', '#23272f', 22)}</button>
      <button class="rund vfHoer" data-sage="${F.id}-verf-f" aria-label="Nochmal hören">
        ${hoerIcon}</button>
      <div class="vfPips">${V.schritte.map((_, i) =>
        `<span class="pip ${i < E.verfIdx ? 'pip--done' : i === E.verfIdx ? 'pip--now' : ''}"></span>`).join('')}</div>
    </div>`, 'scr--vf');

  sprich(`${F.id}-verf-f`);

  const kamera = $('.vfKamera', s);
  let gesperrt = false;

  tippen(s, '[data-seite]', (el) => {
    if (gesperrt) return;
    const seite = el.dataset.seite;
    const gWahl = $(`.vfAst[data-seite="${seite}"]`, s);
    const lupe = $(`.vfLupe--${seite}`, s);

    if (seite !== schritt.richtig) {
      lupe.classList.add('vfLupe--falsch');
      fehler('Das ist eine andere Spur.');
      setTimeout(() => lupe.classList.remove('vfLupe--falsch'), 900);
      return;
    }

    gesperrt = true;
    lupe.classList.add('vfLupe--richtig');
    gWahl.classList.add('vfAst--gewaehlt');
    [0, 1, 2, 3].forEach(i => setTimeout(() => sfx.schritt(i), i * 190));

    // Kamerafahrt in den gewählten Ast. Der Drehpunkt wird auf das Ende der
    // gewählten Fährte gelegt – dann bleibt genau dieser Punkt stehen und
    // alles andere waechst um ihn herum. Das ist das Bild, das entsteht, wenn
    // man auf etwas zugeht. Erst den Drehpunkt setzen, im naechsten Bild die
    // Skalierung: sonst springt es.
    const ende = VF_BAHN[seite].nach;
    kamera.style.transformOrigin = `${ende[0] / 10}% ${ende[1] / 4.8}%`;
    requestAnimationFrame(() => { kamera.style.transform = 'scale(1.85)'; });
    setTimeout(() => $$('.vfLupe', s).forEach(l => l.classList.add('vfLupe--weg')), 260);

    E.verfIdx++;
    if (E.verfIdx < V.schritte.length) sprich('g-richtig');
    setTimeout(() => {
      if (E.verfIdx < V.schritte.length) { go(scrVerfolgung); return; }
      sfx.treffer();
      const e = zeige(`
        <div class="vf">
          <div class="vfKamera vfKamera--nah">
            <img class="vfSzene" src="${szene}" alt="" onerror="this.style.opacity=0">
          </div>
          <div class="vfStempel"><div class="stempel stempel--gut stempel--knall">Spur verfolgt</div></div>
          <button class="rund vfHoer" data-sage="${F.id}-verf-z" aria-label="Nochmal hören">
            ${hoerIcon}</button>
          <button class="btn btn--gross weiterBtn" data-k="w">Weiter</button>
        </div>`, 'scr--vf');
      sprich(`${F.id}-verf-z`);
      tippen(e, '[data-k="w"]', () => { sfx.tap(); weiter(); });
      sageVerbinden(e);
    }, 1150);
  });

  tippen(s, '[data-k="zurueck"]', () => { sfx.zuschlag(); go(scrAkten); });
  sageVerbinden(s);
}

/* ================= ZEITSTRAHL ================= */

function scrZeitstrahl() {
  const Z = F.zeitstrahl;
  const spanne = Z.bis - Z.von;
  const pct = (t) => ((t - Z.von) / spanne) * 100;
  const uhr = (t) => `${String(Math.floor(t)).padStart(2, '0')}:${String(Math.round((t % 1) * 60)).padStart(2, '0')}`;
  let marken = '';
  for (let t = Math.ceil(Z.von); t <= Z.bis; t++)
    marken += `<span style="left:${pct(t)}%">${t}</span><i style="left:${pct(t)}%"></i>`;

  const s = zeige(`
    ${bedien({ notiz: true, sage: `${F.id}-zeit-f`, pips: schrittPips() })}
    <div class="zsTatzeit">${uhr(Z.tatVon)}<span>–</span>${uhr(Z.tatBis)}</div>
    <div class="zsBox">
      <div class="zsSkala">${marken}
        <div class="zsFenster" style="left:${pct(Z.tatVon)}%;width:${pct(Z.tatBis) - pct(Z.tatVon)}%">
          <b>Tatzeit</b></div>
      </div>
      ${Z.balken.map((b, i) => {
        const v = F.verdaechtige.find(x => x.id === b.id);
        return `<div class="zsReihe">
          <span class="zsName">${portraet(v.bild)}${esc(b.name)}</span>
          <span class="zsBahn">
            <button class="zsBalken" data-b="${b.id}" style="left:${pct(b.von)}%;
              width:${pct(b.bis) - pct(b.von)}%;animation-delay:${i * 120}ms">
              ${uhr(b.von)}–${uhr(b.bis)}</button>
          </span></div>`;
      }).join('')}
    </div>
    ${stillText(Z.text, `${F.id}-zeit-f`, true)}`, 'scr--zeit');

  sprich(`${F.id}-zeit-f`);
  const offen = new Set(Z.raus.filter(id => !E.raus.includes(id)));

  tippen(s, '[data-b]', (el) => {
    const id = el.dataset.b;
    if (Z.raus.includes(id)) {
      if (E.raus.includes(id)) return;
      E.raus.push(id); offen.delete(id);
      el.classList.add('zsBalken--raus');
      sfx.stempel();
      if (!offen.size) {
        sfx.right();
        sprich(`${F.id}-zeit-w`);
        meldung(Z.warum, 'gut');
        const w = document.createElement('button');
        w.className = 'btn btn--gross weiterBtn';
        w.textContent = 'Weiter';
        w.onclick = () => { sfx.tap(); weiter(); };
        s.appendChild(w);
      }
    } else {
      el.classList.add('zsBalken--falsch');
      fehler('Diese Person war während der Tatzeit da.');
      setTimeout(() => el.classList.remove('zsBalken--falsch'), 900);
    }
  });
  tippen(s, '[data-k="zurueck"]', () => { sfx.zuschlag(); go(scrAkten); });
  tippen(s, '[data-k="notiz"]', notizbuch);
  sageVerbinden(s);
}

/* ================= ZEUGEN ================= */

function scrZeugen() {
  const s = zeige(`
    <div class="szene"><img class="szene__bg" src="${F.bild}" alt="" style="filter:brightness(.45) saturate(.8)">
      <div class="szene__dunkel"></div></div>
    ${bedien({ notiz: true, sage: 'g-zeuge', pips: schrittPips() })}
    <div class="blasen" id="blasen"></div>
    <div class="zeugenReihe">
      ${F.zeugen.map((z, i) => `<button class="zeuge" data-z="${i}" style="animation-delay:${i * 90}ms">
        <span class="zeuge__bild"><img src="assets/portraits/${z.bild}.webp" alt=""></span>
        <span class="zeuge__name">${esc(z.name)}<small>${esc(z.rolle)}</small></span>
      </button>`).join('')}
    </div>
    ${stillText('Tippe eine Person an und hör zu.', 'g-zeuge')}`, 'scr--zeugen');

  // Die Anweisung verschwindet, sobald sie gelesen ist – darunter stehen die Namen.
  const sageWeg = () => { const b = $('.sage', s); if (b) b.classList.add('sage--weg'); };
  Promise.all([sprich('g-zeuge'), warte(3200)]).then(sageWeg);
  const blasen = $('#blasen', s);
  let aktiv = -1, laeuftGerade = false;

  tippen(s, '[data-z]', async (el) => {
    if (laeuftGerade) return;
    const zi = +el.dataset.z;
    aktiv = zi;
    $$('.zeuge', s).forEach((z, i) => {
      z.classList.toggle('zeuge--aktiv', i === zi);
      z.classList.toggle('zeuge--aus', i !== zi);
    });
    const z = F.zeugen[zi];
    sageWeg();
    blasen.innerHTML = '';
    laeuftGerade = true;
    for (let ai = 0; ai < z.aussagen.length; ai++) {
      const b = document.createElement('button');
      b.className = 'blase';
      b.dataset.a = ai;
      b.innerHTML = hoerIcon + '<span>' + esc(z.aussagen[ai]) + '</span>';
      b.addEventListener('click', () => pruefe(zi, ai, b));
      blasen.appendChild(b);
      await sprich(`${F.id}-z${zi}-a${ai}`);
      await warte(120);
    }
    laeuftGerade = false;
  });

  function pruefe(zi, ai, b) {
    const z = F.zeugen[zi];
    if (z.luege === ai) {
      b.classList.add('blase--richtig');
      $$('.blase', s).forEach(x => { if (x !== b) x.classList.add('blase--aus'); });
      sfx.right();
      E.zeugeOk = true;
      E.ergebnisse.push('Widerspruch bei ' + z.name + ': ' + z.warum);
      $$('.zeuge', s)[zi].classList.add('zeuge--fertig');
      meldung('Erwischt!', 'gut');
      sprichFolge(['g-erwischt', `${F.id}-z${zi}-w`]);
      const w = document.createElement('button');
      w.className = 'btn btn--gross weiterBtn';
      w.textContent = 'Weiter';
      w.onclick = () => { sfx.tap(); weiter(); };
      s.appendChild(w);
    } else {
      b.classList.add('blase--falsch');
      fehler('Diese Aussage passt zu den Fakten.');
      setTimeout(() => b.classList.remove('blase--falsch'), 900);
    }
  }

  tippen(s, '[data-k="zurueck"]', () => { sfx.zuschlag(); go(scrAkten); });
  tippen(s, '[data-k="notiz"]', notizbuch);
  sageVerbinden(s);
}

/* ================= GEGENÜBERSTELLUNG ================= */

function personHtml(v, zeigeWerte, treffer) {
  /* Die Merkmale stehen **über** dem Porträt, nicht darunter: unter der
     Reihe war kein Platz mehr, über ihr lagen 340 Pixel leere Wand. Und sie
     zeigen den Wert als Bild statt als Wort — verglichen wird mit der
     Beweiskarte, und ein Bild vergleicht sich schneller als ein Wort. Der
     Wert bleibt im aria-label, sonst wäre der Bildschirm für Vorlesehilfen
     leer. */
  const marken = zeigeWerte ? Object.entries(v.werte) : [];
  return `<button class="person ${E.raus.includes(v.id) ? 'person--raus' : ''}" data-v="${v.id}">
    ${marken.length ? `<span class="person__marken" data-n="${marken.length}">${marken.map(([k, w]) =>
      `<span class="marke ${treffer && treffer.feld === k && String(w) === String(treffer.label) ? 'marke--treffer' : ''}"
        title="${esc(k)}: ${esc(w)}" aria-label="${esc(k)}: ${esc(w)}">
        ${art.merkmal(k, w, F.merkmalIcons[k])}</span>`).join('')}</span>` : ''}
    <span class="person__bild"><img src="assets/portraits/${v.bild}.webp" alt=""></span>
    <span class="person__name">${esc(v.name)}</span>
  </button>`;
}

function scrLineup() {
  const step = F.lineup[E.lineupIdx];
  if (!step) { weiter(); return; }
  const offen = new Set(step.raus.filter(id => !E.raus.includes(id)));

  const s = zeige(`
    <div class="lineup"><div class="wand"></div>
      <div class="reihe">${F.verdaechtige.map(v => personHtml(v, true, step)).join('')}</div>
    </div>
    ${bedien({ notiz: true, sage: `${F.id}-lin${E.lineupIdx}-f`,
               pips: F.lineup.map((_, i) =>
                 `<span class="pip ${i < E.lineupIdx ? 'pip--done' : i === E.lineupIdx ? 'pip--now' : ''}"></span>`).join('') })}
    <div class="beweiskarte">
      <span class="beweiskarte__bild">${art.merkmal(step.feld, step.label, step.icon)}</span>
      <span class="beweiskarte__ring"></span>
    </div>
    ${stillText(step.frage, `${F.id}-lin${E.lineupIdx}-f`, true)}`, 'scr--lineup');

  sfx.whoosh();
  sprich(`${F.id}-lin${E.lineupIdx}-f`);

  tippen(s, '[data-v]', (el) => {
    const id = el.dataset.v;
    if (E.raus.includes(id)) return;
    if (step.raus.includes(id)) {
      E.raus.push(id); offen.delete(id);
      el.classList.add('person--raus');
      sfx.stempel();
      if (navigator.vibrate) navigator.vibrate(32);
      if (!offen.size) {
        sfx.right();
        meldung(step.warum, 'gut');
        const naechster = einmal(s, () => { E.lineupIdx++; go(scrLineup); });
        Promise.all([sprich(`${F.id}-lin${E.lineupIdx}-w`), warte(2400)]).then(naechster);
      }
    } else {
      el.classList.add('person--falsch');
      fehler('Diese Person passt zur Spur.', 'g-fastfalsch');
      setTimeout(() => el.classList.remove('person--falsch'), 900);
    }
  });
  tippen(s, '[data-k="zurueck"]', () => { sfx.zuschlag(); go(scrAkten); });
  tippen(s, '[data-k="notiz"]', notizbuch);
  sageVerbinden(s);
}

/* ================= VERHAFTUNG ================= */

function scrVerhaftung() {
  const s = zeige(`
    <div class="lineup"><div class="wand"></div>
      <div class="reihe">${F.verdaechtige.map(v => personHtml(v, false)).join('')}</div>
    </div>
    <div class="blaulicht" id="blaulicht"></div>
    ${bedien({ notiz: true, sage: 'g-verhaften', pips: schrittPips() })}
    ${stillText('Wer bleibt übrig? Tippe die Person an.', 'g-verhaften')}`, 'scr--verhaftung');

  Promise.all([sprich('g-verhaften'), warte(3200)])
    .then(() => { const b = $('.sage', s); if (b) b.classList.add('sage--weg'); });

  tippen(s, '[data-v]', (el) => {
    if (el.dataset.v !== F.taeter) {
      el.classList.add('person--falsch');
      fehler(E.raus.includes(el.dataset.v)
        ? 'Diese Person hast du selbst ausgeschlossen.'
        : 'Die Spuren zeigen auf jemand anderen.');
      setTimeout(() => el.classList.remove('person--falsch'), 900);
      return;
    }
    el.classList.add('person--taeter');
    $('#blaulicht', s).classList.add('blaulicht--an');
    sfx.sirene();
    sprich('g-verhaftet');
    if (navigator.vibrate) navigator.vibrate([60, 80, 60]);
    setTimeout(() => go(scrErgebnis), 2100);
  });
  tippen(s, '[data-k="zurueck"]', () => { sfx.zuschlag(); go(scrAkten); });
  tippen(s, '[data-k="notiz"]', notizbuch);
  sageVerbinden(s);
}

/* ================= ERGEBNIS ================= */

function scrErgebnis() {
  const st = E.fehler <= 1 ? 3 : E.fehler <= 4 ? 2 : 1;
  const alt = S.rang().name;
  S.setSterne(F.id, st);
  const neu = S.rang(), auf = alt !== neu.name;
  const t = F.verdaechtige.find(v => v.id === F.taeter);
  const naechst = FAELLE[FAELLE.findIndex(f => f.id === F.id) + 1];

  const s = zeige(`
    ${kopf('Fall gelöst', F.titel, { zurueck: false })}
    <div class="ergLinks">
      <div class="ergSterne" id="sterne"></div>
      ${portraet(t.bild, 'portraet--gross')}
      <div class="stempel stempel--gut stempel--knall">${esc(t.name)}</div>
      ${auf ? `<div class="rangchip"><span class="rangchip__m">${art.icon(neu.icon, '#4a3208', 24)}</span>
        <span><b>${esc(neu.name)}</b><small>${esc(RANG_TEXTE[neu.name] || '')}</small></span></div>` : ''}
    </div>
    <div class="ergRechts">
      ${F.aufloesung.map((z, i) => `<div class="ergZeile" data-zeile="${i}"
        style="opacity:0">${esc(z)}</div>`).join('')}
      <div class="wusstest" style="opacity:0" data-wusst>
        ${art.icon(F.wusstest.icon, '#96690f', 30)}
        <span><b>Wusstest du? ${esc(F.wusstest.titel)}</b>${esc(F.wusstest.text)}</span>
      </div>
      <div style="display:flex;gap:10px;margin-top:4px">
        ${naechst ? `<button class="btn" data-k="next">Nächster Fall</button>` : ''}
        <button class="btn btn--geist" data-k="liste">Fallakten</button>
      </div>
    </div>`);

  (async () => {
    sfx.win();
    const box = $('#sterne', s);
    for (let i = 0; i < 3; i++) {
      const sp = document.createElement('span');
      sp.textContent = '★';
      sp.style.color = i < st ? '' : '#d9cdb2';
      sp.style.animationDelay = '0ms';
      box.appendChild(sp);
      if (i < st) sfx.treffer();
      await warte(280);
    }
    if (st === 3) { sprich('g-drei'); await warte(900); }
    if (auf) { sfx.rang(); sprich('g-befoerdert'); await warte(1100); }
    for (const [i, z] of $$('[data-zeile]', s).entries()) {
      z.style.opacity = ''; z.style.animation = 'redeRein .4s cubic-bezier(.2,1.3,.4,1) both';
      await sprich(`${F.id}-auf${i}`);
      await warte(140);
    }
    const w = $('[data-wusst]', s);
    w.style.opacity = ''; w.style.animation = 'redeRein .4s ease both';
    sprich(`${F.id}-wusst`);
  })();

  tippen(s, '[data-k="next"]', () => { sfx.akte(); starteFall(naechst); });
  tippen(s, '[data-k="liste"]', () => { sfx.zuschlag(); go(scrAkten); });
}

/* ================= NOTIZBUCH ================= */

function notizbuch() {
  sfx.page();
  const teile = [];
  teile.push('<h3>Fakten</h3>');
  F.intro.fakten.forEach(f => teile.push(
    `<div class="notiz">${art.icon(f.icon, '#1f4f86', 22)}<div><b>${esc(f.text)}</b></div></div>`));
  teile.push(`<h3>Spuren ${E.gefunden.length} von ${F.spuren.length}</h3>`);
  F.spuren.filter(x => E.gefunden.includes(x.id)).forEach(x => teile.push(
    `<div class="notiz">${art.icon(x.icon, '#96690f', 22)}<div><b>${esc(x.name)}</b>
      <small>${esc(x.sagt)}</small></div></div>`));
  if (E.ergebnisse.length) {
    teile.push('<h3>Ergebnisse</h3>');
    E.ergebnisse.forEach(r => teile.push(
      `<div class="notiz">${art.icon('glas', '#1f4f86', 22)}<div><b>${esc(r)}</b></div></div>`));
  }
  if (E.raus.length) {
    teile.push('<h3>Ausgeschlossen</h3>');
    E.raus.forEach(id => {
      const v = F.verdaechtige.find(x => x.id === id);
      teile.push(`<div class="notiz">${art.icon('stempel', '#b0341d', 22)}<div><b>${esc(v.name)}</b></div></div>`);
    });
  }
  const d = document.createElement('div');
  d.className = 'blatt';
  d.innerHTML = `<div class="blatt__bg"></div><div class="blatt__panel">
    ${teile.join('')}<div style="margin-top:14px;text-align:right">
    <button class="btn btn--geist" data-zu>Schliessen</button></div></div>`;
  document.body.appendChild(d);
  const zu = () => d.remove();
  $('.blatt__bg', d).addEventListener('click', zu);
  $('[data-zu]', d).addEventListener('click', zu);
}

/* ---------------- Start ---------------- */

S.load();
setSound(S.get().ton);
setSprache(S.get().sprache !== false);
passen();
document.addEventListener('pointerdown', () => {
  unlock();
  if (S.get().musik) setMusik(true);
  kulisse('buero');
}, { once: true });
scrTitel();

if ('serviceWorker' in navigator) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

let installEvt = null;
addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); installEvt = e;
  const b = document.createElement('button');
  b.className = 'btn btn--geist';
  b.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:10px;z-index:150';
  b.textContent = 'Auf den Startbildschirm';
  b.onclick = () => { b.remove(); installEvt.prompt(); installEvt = null; };
  document.body.appendChild(b);
  setTimeout(() => b.remove(), 10000);
});

window.SPUERNASE = {
  FAELLE, S, starteFall, scrTitel, scrAkten, weiter, phase,
  get E() { return E; }, get F() { return F; }
};
