/* Vollständiger Durchlauf aller fünf Fälle über die Phasen-Engine.
   Prüft: keine JS-Fehler, keine fehlenden Dateien, jede Phase erreichbar,
   jede Sprachaufnahme, die abgespielt wird, existiert, Fall endet bei 3 Sternen. */

const { chromium } = require('playwright');
const BASIS = process.env.BASIS || 'http://127.0.0.1:8099';

const log = [];
const sag = (t) => { log.push(t); console.log(t); };

(async () => {
  const browser = await chromium.launch({
    args: ['--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required', '--mute-audio']
  });
  browser.on('disconnected', () => console.log('!! Browser hat sich beendet'));
  const ctx = await browser.newContext({
    viewport: { width: 1000, height: 480 }, deviceScaleFactor: 2
  });
  const page = await ctx.newPage();
  page.on('crash', () => console.log('!! Seite abgestuerzt'));

  const probleme = [];
  page.on('pageerror', e => probleme.push('JS-Fehler: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') probleme.push('Konsole: ' + m.text()); });
  page.on('response', r => {
    if (r.status() >= 400) probleme.push('HTTP ' + r.status() + ': ' + r.url().replace(BASIS, ''));
  });

  await page.goto(BASIS + '/index.html', { waitUntil: 'networkidle' });
  // Stumm schalten: Audio-Elemente sollen laden, aber nicht bremsen.
  await page.addStyleTag({ content: '*{animation-duration:.01s!important;transition-duration:.01s!important}' });

  const FAELLE = await page.evaluate(async () => {
    const m = await import('./js/cases.js');
    return m.FAELLE.map(f => ({
      id: f.id, nr: f.nr, titel: f.titel, phasen: f.phasen, taeter: f.taeter,
      spuren: f.spuren.map(s => s.id),
      labor: (f.labor || []).map(l => l.richtig),
      verfolgung: f.verfolgung ? f.verfolgung.schritte.map(s => s.richtig) : null,
      zeitstrahl: f.zeitstrahl ? f.zeitstrahl.raus : null,
      zeugen: (f.zeugen || []).map(z => z.luege),
      lineup: (f.lineup || []).map(l => l.raus)
    }));
  });
  sag('Fälle geladen: ' + FAELLE.length);

  /* ---- Datenprüfung: stimmt die Fallakte überhaupt? ---- */
  const daten = await page.evaluate(async () => {
    const { FAELLE } = await import('./js/cases.js');
    const PHASEN = ['tatort','labor','verfolgung','zeitstrahl','zeugen','lineup','verhaftung'];
    const out = [];
    for (const f of FAELLE) {
      const m = [];
      for (const ph of f.phasen) {
        if (!PHASEN.includes(ph)) m.push(`unbekannte Phase "${ph}"`);
        if (ph === 'labor' && !(f.labor || []).length) m.push('Phase labor ohne Aufgaben');
        if (ph === 'zeugen' && !(f.zeugen || []).length) m.push('Phase zeugen ohne Zeugen');
        if (ph === 'verfolgung' && !f.verfolgung) m.push('Phase verfolgung ohne Daten');
        if (ph === 'zeitstrahl' && !f.zeitstrahl) m.push('Phase zeitstrahl ohne Daten');
        if (ph === 'lineup' && !(f.lineup || []).length) m.push('Phase lineup ohne Beweise');
      }
      // Ausschluss muss genau eine Person übrig lassen, und das muss der Täter sein
      const raus = new Set();
      if (f.phasen.includes('zeitstrahl') && f.zeitstrahl)
        f.zeitstrahl.raus.forEach(x => raus.add(x));
      if (f.phasen.includes('lineup'))
        (f.lineup || []).forEach(l => l.raus.forEach(x => raus.add(x)));
      const uebrig = f.verdaechtige.filter(v => !raus.has(v.id));
      if (uebrig.length !== 1) m.push(`nach dem Ausschluss bleiben ${uebrig.length} Personen übrig`);
      else if (uebrig[0].id !== f.taeter) m.push('die übrig bleibende Person ist nicht der Täter');
      // Laboraufgaben: die richtige Antwort muss es geben
      (f.labor || []).forEach((l, i) => {
        if (!l.optionen.some(o => o.id === l.richtig)) m.push(`Laboraufgabe ${i + 1} ohne richtige Antwort`);
      });
      // Zeugen: genau eine Lüge, mit Begründung
      const luegen = (f.zeugen || []).filter(z => z.luege >= 0);
      if ((f.zeugen || []).length && luegen.length !== 1)
        m.push(`${luegen.length} Lügen statt genau einer`);
      luegen.forEach(z => { if (!z.warum) m.push(`Lüge von ${z.name} ohne Begründung`); });
      // Spuren: im Bild, nicht zu nah beieinander (Marker 80 px auf 1000x480)
      f.spuren.forEach((a, i) => {
        if (a.x < 0.05 || a.x > 0.95 || a.y < 0.09 || a.y > 0.93)
          m.push(`Spur ${a.id} liegt zu nah am Bildrand`);
        f.spuren.slice(i + 1).forEach(b => {
          const d = Math.hypot((a.x - b.x) * 1000, (a.y - b.y) * 480);
          if (d < 84) m.push(`Spuren ${a.id}/${b.id} nur ${Math.round(d)} px auseinander`);
        });
      });
      out.push({ id: f.id, maengel: m });
    }
    return out;
  });
  for (const d of daten) {
    sag(`  ${d.maengel.length ? '✗' : '✓'} ${d.id} Fallakte` +
        (d.maengel.length ? ': ' + d.maengel.join('; ') : ' in Ordnung'));
    d.maengel.forEach(m => probleme.push(d.id + ': ' + m));
  }


  const gespielt = [];
  let fertigGespielt = 0;
  await page.evaluate(() => {
    window.__voice = [];
    const A = window.Audio;
    window.Audio = function (src) { const a = new A(src); window.__voice.push(src); return a; };
  });

  // Waehrend des Bildwechsels haengt kurz noch der alte Bildschirm im DOM.
  // Alles wird daher auf den obersten Bildschirm bezogen.
  const L = (sel) => page.locator('.buehne > .scr:not(.scr--raus)').last().locator(sel);
  const warte = (ms) => page.waitForTimeout(ms);

  async function klick(sel, nr = 0) {
    const l = L(sel).nth(nr);
    await l.waitFor({ state: 'visible', timeout: 8000 });
    await l.click({ force: true });
    await warte(240);
  }

  async function screen() {
    return page.evaluate(() => {
      const alle = [...document.querySelectorAll('#buehne > .scr:not(.scr--raus)')];
      const b = alle[alle.length - 1] || document.getElementById('buehne');
      if (b.querySelector('.titelbild')) return 'titel';
      if (b.querySelector('.akten')) return 'akten';
      if (b.querySelector('.introFoto')) return 'intro';
      if (b.querySelector('#szene')) return 'tatort';
      if (b.querySelector('.laborProbe')) return 'labor';
      if (b.querySelector('.verfolgung')) return 'verfolgung';
      if (b.querySelector('.zsBox')) return 'zeitstrahl';
      if (b.querySelector('.zeugenReihe')) return 'zeugen';
      if (b.querySelector('.beweiskarte')) return 'lineup';
      if (b.querySelector('.blaulicht')) return 'verhaftung';
      if (b.querySelector('.ergSterne')) return 'ergebnis';
      return '?';
    });
  }

  async function warteAuf(name, ms = 12000) {
    const bis = Date.now() + ms;
    while (Date.now() < bis) {
      if (await screen() === name) return true;
      await warte(180);
    }
    probleme.push(`Timeout: "${name}" nicht erreicht (war "${await screen()}")`);
    return false;
  }

  /* ---- Phasen ---- */

  async function tatort(F) {
    for (const id of F.spuren) {
      const m = L(`[data-spur="${id}"]`);
      await m.waitFor({ state: 'visible', timeout: 6000 });
      const box = await m.boundingBox();
      const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
      await page.mouse.move(cx - 6, cy - 6);
      await page.mouse.move(cx, cy);
      await warte(560);                              // Halte-Timer 400 ms
      const ok = await m.evaluate(e => e.classList.contains('spur--gefunden') ||
                                       e.classList.contains('spur--weg'));
      if (!ok) { await m.click({ force: true }); await warte(400); }
    }
    const alle = await L('.spur--weg, .spur--gefunden').count();
    if (alle < F.spuren.length) probleme.push(`${F.id}: nur ${alle}/${F.spuren.length} Spuren gesichert`);
    await warte(1400);
    await klick('.btn--gross:has-text("Weiter")');
  }

  async function labor(F) {
    for (const richtig of F.labor) {
      await warteAuf('labor', 25000);
      // Erst weitertippen, wenn der naechste Versuch frisch ist (keine Karte markiert).
      await page.waitForFunction(() => {
        const scr = [...document.querySelectorAll('#buehne > .scr:not(.scr--raus)')].pop();
        return scr && scr.querySelector('.karten') && !scr.querySelector('.karte--richtig');
      }, null, { timeout: 25000 });
      await klick(`[data-opt="${richtig}"]`);
    }
  }

  async function verfolgung(F) {
    for (const seite of F.verfolgung) {
      await warteAuf('verfolgung');
      await klick(`[data-seite="${seite}"]`);
      await warte(1100);
    }
    await klick('[data-k="w"]');
  }

  async function zeitstrahl(F) {
    await warteAuf('zeitstrahl');
    for (const id of F.zeitstrahl) { await klick(`[data-b="${id}"]`); await warte(400); }
    await warte(700);
    await klick('.btn--gross:has-text("Weiter")');
  }

  async function zeugen(F) {
    await warteAuf('zeugen');
    const zi = F.zeugen.findIndex(l => l >= 0);
    await klick(`[data-z="${zi}"]`);
    await L(`.blase[data-a="${F.zeugen[zi]}"]`).waitFor({ state: 'visible', timeout: 40000 });
    await warte(500);
    await klick(`.blase[data-a="${F.zeugen[zi]}"]`);
    await warte(900);
    await klick('.btn--gross:has-text("Weiter")');
  }

  async function lineup(F) {
    /* Nicht mit fester Wartezeit weiterklicken. Die App wechselt erst zur
       naechsten Runde, wenn die Erklaerung zu Ende gesprochen ist – und die
       Aufnahmen sind seit dem Wechsel auf Gemini im Schnitt 4,65 statt 2,86
       Sekunden lang. Ein fester Wert von 2,9 Sekunden klickte in die noch
       laufende Runde hinein und brachte den ganzen Ablauf aus dem Tritt.
       Deshalb: auf den Rundenzaehler im Kopf warten. */
    const runde = () => page.evaluate(() => {
      const s = document.querySelector('.kopf__titel small');
      return s ? s.textContent.trim() : '';
    });
    for (let i = 0; i < F.lineup.length; i++) {
      await warteAuf('lineup', 25000);
      const vorher = await runde();
      for (const id of F.lineup[i]) {
        const p = L(`[data-v="${id}"]`);
        if (await p.evaluate(e => e.classList.contains('person--raus'))) continue;
        await p.click({ force: true }); await warte(350);
      }
      // Warten, bis der Zaehler weiterspringt oder die Phase wechselt.
      const bis = Date.now() + 25000;
      while (Date.now() < bis) {
        if (await screen() !== 'lineup') break;
        if (await runde() !== vorher) break;
        await warte(200);
      }
    }
  }

  async function verhaftung(F) {
    // Grosszuegiger als frueher: die Schlusserklaerung der letzten
    // Lineup-Runde laeuft noch, wenn diese Phase beginnt.
    await warteAuf('verhaftung', 25000);
    await klick(`[data-v="${F.taeter}"]`);
    await warte(2600);
  }

  const PHASE = { tatort, labor, verfolgung, zeitstrahl, zeugen, lineup, verhaftung };

  /* ---- Durchlauf ---- */

  for (const F of FAELLE) {
    // Jeder Fall startet aus einem sauberen Zustand: so faerbt kein Fehler
    // aus dem vorherigen Fall den naechsten ein.
    await page.goto(BASIS + '/index.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.setItem('spuernase.v1', JSON.stringify(
      { sterne: { f1: 3, f2: 3, f3: 3, f4: 3 }, ton: true, musik: false, sprache: true, gesehen: true })));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await warte(900);
    await page.evaluate(() => {
      window.__voice = []; window.__voiceOk = []; window.__voiceErr = [];
      const A = window.Audio;
      window.Audio = function (src) {
        const a = new A(src);
        window.__voice.push(src);
        a.addEventListener('ended', () => window.__voiceOk.push(src));
        a.addEventListener('error', () => window.__voiceErr.push(src));
        return a;
      };
    });

    const t0 = Date.now();
    const vor = probleme.length;
    await klick('[data-k="start"]');
    await warteAuf('akten');
    await klick(`[data-fall="${F.id}"]`);
    await warteAuf('intro');
    await warte(2600);
    await klick('[data-k="los"]');

    let abgebrochen = false;
    for (const ph of F.phasen) {
      const da = await warteAuf(ph, 25000);
      if (!da) { abgebrochen = true; break; }
      try { await PHASE[ph](F); }
      catch (err) {
        probleme.push(`${F.id}/${ph}: ${String(err).split('\n')[0]}`);
        await page.screenshot({ path: `/tmp/fail-${F.id}-${ph}.png` });
        abgebrochen = true; break;
      }
    }

    const ende = !abgebrochen && await warteAuf('ergebnis', 25000);
    const sterne = ende ? await L('.ergSterne span').evaluateAll(
      els => els.filter(e => !e.style.color).length) : 0;
    const dauer = ((Date.now() - t0) / 1000).toFixed(1);
    const neu = probleme.length - vor;
    sag(`Fall ${F.nr} "${F.titel}": ${F.phasen.length} Phasen [${F.phasen.join(' → ')}], ` +
        `${ende ? sterne + '/3 Sterne' : 'NICHT BEENDET'}, ${dauer}s, ${neu ? neu + ' Probleme' : 'sauber'}`);
    if (ende && sterne !== 3) probleme.push(`${F.id}: fehlerfreier Durchlauf ergibt ${sterne} Sterne statt 3`);
    if (ende) await page.screenshot({ path: `/tmp/shot-${F.id}-ergebnis.png` });

    const v = await page.evaluate(() => ({
      alle: window.__voice || [], ok: window.__voiceOk || [], err: window.__voiceErr || [] }));
    for (const src of v.alle) gespielt.push(src);
    if (v.err.length) probleme.push(`${F.id}: ${v.err.length} Sprachdateien liessen sich nicht abspielen`);
    fertigGespielt += new Set(v.ok).size;
  }

  /* ---- Sprachdateien prüfen ---- */
  const angefordert = [...new Set(gespielt)];
  sag(`Sprachaufnahmen angefordert: ${angefordert.length} verschiedene, ` +
      `${fertigGespielt} davon bis zum Ende gespielt`);
  // Der Testlauf tippt schneller als ein Kind – viele Zeilen werden vom
  // naechsten Bildschirm abgeschnitten. Entscheidend ist: kein Abspielfehler,
  // und ein spuerbarer Teil laeuft wirklich durch.
  if (fertigGespielt < 15)
    probleme.push(`nur ${fertigGespielt} Aufnahmen liefen bis zum Ende – Verdacht auf Codec-Problem`);
  const vorhanden = await page.evaluate(async () => {
    const m = await import('./js/voice-liste.js');
    return m.STIMMEN;
  });
  const fehlend = angefordert
    .map(u => (u.split('/').pop() || '').replace('.mp3', ''))
    .filter(id => id && !vorhanden.includes(id));
  if (fehlend.length) probleme.push('Sprachdateien fehlen: ' + fehlend.join(', '));
  sag(`Insgesamt vorhanden: ${vorhanden.length} Aufnahmen`);

  /* ---- PWA: Service Worker, Manifest, Offline ---- */
  await page.goto(BASIS + '/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  const pwa = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    const m = await (await fetch('manifest.webmanifest')).json();
    return { sw: !!reg, aktiv: !!(reg && reg.active), icons: (m.icons || []).length,
             anzeige: m.display, start: m.start_url, quer: m.orientation || '(keine)' };
  });
  sag(`PWA: Service Worker ${pwa.sw ? 'registriert' : 'FEHLT'}` +
      `${pwa.aktiv ? ' und aktiv' : ''}, ${pwa.icons} Icons, ` +
      `display "${pwa.anzeige}", orientation "${pwa.quer}"`);
  if (!pwa.sw || !pwa.aktiv) probleme.push('Service Worker nicht aktiv');
  if (pwa.icons < 3) probleme.push('Manifest hat nur ' + pwa.icons + ' Icons');
  if (pwa.quer !== 'landscape') probleme.push('Manifest steht auf orientation "' + pwa.quer + '" statt landscape');

  await ctx.setOffline(true);
  let offline = 'Fehler';
  try {
    const r = await page.reload({ waitUntil: 'domcontentloaded' });
    offline = (r ? r.status() : '?') + ' · Titel "' + await page.title() + '"';
    const gemalt = await page.locator('.titelbild').count();
    if (!gemalt) probleme.push('Offline-Neuladen zeigt keinen Titelbildschirm');
  } catch (e) { probleme.push('Offline-Neuladen schlug fehl: ' + String(e).split('\n')[0]); }
  sag('Offline-Neuladen: ' + offline);
  await ctx.setOffline(false);

  sag('');
  if (probleme.length) { sag('PROBLEME (' + probleme.length + '):'); probleme.forEach(p => sag('  - ' + p)); }
  else sag('Keine Probleme. Alle fünf Fälle fehlerfrei durchgespielt.');

  require('fs').writeFileSync('/tmp/testlog.txt', log.join('\n'));
  await browser.close();
  process.exit(probleme.length ? 1 : 0);
})();
