/* Prüft, dass sich Sprachzeilen anreihen statt einander abzuschneiden.

   Der Fehler, den dieses Werkzeug fernhalten soll: `sprich()` begann jede
   Zeile mit einem `stopp()`. Wer zuletzt sprach, schnitt dem vorigen das Wort
   ab — bei der letzten gefundenen Spur, in der Verfolgung, am Fallende. Das
   fällt in keinem der anderen Tests auf: das Spiel läuft dabei fehlerfrei
   durch, es klingt nur kaputt.

   Gemessen wird deshalb nicht «lief es durch», sondern **wie viele Zeilen
   vorzeitig aufhörten** — Abbruch heisst: das Element wurde pausiert, bevor
   es sein Ende erreicht hat.

   Aufruf:  node tools/stimmtest.js
*/
const { chromium } = require('playwright');
const BASIS = process.env.BASIS || 'http://127.0.0.1:8099';

(async () => {
  const browser = await chromium.launch({
    args: ['--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required', '--mute-audio']
  });
  const ctx = await browser.newContext({ viewport: { width: 1000, height: 480 } });
  const page = await ctx.newPage();
  const probleme = [];
  page.on('pageerror', e => probleme.push('JS-Fehler: ' + e.message));

  await page.goto(BASIS + '/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);

  /* Jedes Audio-Element mitschreiben: wann es startet, wann es endet, und ob
     es pausiert wurde, bevor es fertig war. */
  await page.evaluate(() => {
    window.__tonlog = [];
    const P = HTMLMediaElement.prototype;
    const play = P.play, pause = P.pause;
    P.play = function () {
      if ((this.src || '').includes('/voice/')) {
        this.__start = performance.now();
        this.__id = this.src.split('/').pop().replace('.mp3', '');
        window.__tonlog.push({ id: this.__id, art: 'start', t: this.__start });
        // Ein natuerliches Ende loest kein pause() aus – es muss eigens
        // mitgeschrieben werden, sonst zaehlt der Test nur Abbrueche und
        // meldet «alles gut», wenn ueberhaupt nichts gespielt wurde.
        if (!this.__horcht) {
          this.__horcht = true;
          this.addEventListener('ended', () => {
            window.__tonlog.push({ id: this.__id, art: 'ende', t: performance.now(),
                                   bei: this.currentTime, dauer: this.duration || 0 });
          });
        }
      }
      return play.apply(this, arguments);
    };
    P.pause = function () {
      if (this.__id && !this.paused && !this.ended) {
        const fertig = this.duration && this.currentTime >= this.duration - 0.15;
        window.__tonlog.push({
          id: this.__id, art: fertig ? 'ende' : 'abbruch',
          t: performance.now(), bei: this.currentTime, dauer: this.duration || 0,
        });
      }
      return pause.apply(this, arguments);
    };
  });

  const V = () => page.evaluate(() => import('./js/voice.js'));

  async function fall(id, tuen) {
    await page.evaluate((fid) => {
      const S = window.SPUERNASE;
      S.starteFall(S.FAELLE.find(f => f.id === fid));
    }, id);
    await page.waitForTimeout(500);
    await tuen();
  }

  /* --- Fall 1: letzte Spur finden. Hier fiel es dem Nutzer auf. --- */
  await fall('f1', async () => {
    await page.evaluate(() => {
      const S = window.SPUERNASE, F = S.F, E = S.E;
      E.idx = F.phasen.indexOf('tatort'); S.phase();
    });
    await page.waitForTimeout(1500);
    const spuren = await page.evaluate(() => window.SPUERNASE.F.spuren.map(s => s.id));
    for (const sp of spuren) {
      await page.click(`[data-spur="${sp}"]`, { force: true }).catch(() => {});
      await page.waitForTimeout(1100);          // absichtlich kurz: der Ernstfall
    }
    await page.waitForTimeout(9000);
  });

  /* --- Zwei Zeilen dicht hintereinander, direkt über das Modul --- */
  await page.evaluate(async () => {
    const v = await import('./js/voice.js');
    v.sprich('f1-intro');
    await new Promise(r => setTimeout(r, 300));
    v.sprich('g-alle');                          // darf die erste nicht kappen
  });
  await page.waitForTimeout(18000);

  const log = await page.evaluate(() => window.__tonlog);
  await browser.close();

  /* Anleitungen («Such den Tatort ab») duerfen unterbrochen werden, sobald
     das Kind handelt – das ist der gewollte Fall, nicht der Fehler. Gezaehlt
     werden nur abgeschnittene Inhaltszeilen. */
  const anleitung = (id) => ['g-tatort','g-dunkel','g-zeuge','g-lineup','g-verhaften',
    'g-quer','g-weiter','g-willkommen'].includes(id) || id.startsWith('g-hinweis-');
  const abbrueche = log.filter(x => x.art === 'abbruch' && !anleitung(x.id));
  const gewollt = log.filter(x => x.art === 'abbruch' && anleitung(x.id));
  const starts = log.filter(x => x.art === 'start');
  const enden = log.filter(x => x.art === 'ende');

  console.log(`${starts.length} Zeilen gestartet, ${enden.length} zu Ende gesprochen, `
            + `${abbrueche.length} abgebrochen`);

  /* Ein Test, der nichts messen konnte, darf nicht gruen melden. */
  if (starts.length < 5) {
    console.log('\n✗ Zu wenige Zeilen gespielt – der Test hat nichts gemessen');
    process.exit(1);
  }

  /* Überlappung: zwei Zeilen, die gleichzeitig liefen. Die 120 ms
     Ausblendung sind erlaubt – ohne sie knackt jede Unterbrechung. */
  const AUSBLENDEN = 300;
  const alleEnden = log.filter(x => x.art === 'ende' || x.art === 'abbruch');
  let ueberlappt = 0;
  for (let i = 0; i < starts.length - 1; i++) {
    const ende = alleEnden.find(e => e.id === starts[i].id && e.t > starts[i].t);
    if (ende && starts[i + 1].t < ende.t - AUSBLENDEN) {
      ueberlappt++;
      console.log(`  gleichzeitig: ${starts[i].id} und ${starts[i + 1].id}`);
    }
  }

  console.log('Reihenfolge: ' + starts.map(x => x.id).join(' → '));
  if (gewollt.length)
    console.log(`(${gewollt.length} Anleitung${gewollt.length > 1 ? 'en' : ''} wich${
      gewollt.length > 1 ? 'en' : ''} dem Kind: ${gewollt.map(x => x.id).join(', ')})`);

  /* Jede Spurenzeile muss gespielt worden sein. Die Schlange darf keine
     verschlucken – genau das war beim ersten Anlauf der Fall. */
  const spuren = starts.filter(x => /^f1-s\d+$/.test(x.id)).map(x => x.id);
  const fehlend = ['f1-s1', 'f1-s2', 'f1-s3'].filter(x => !spuren.includes(x));
  if (fehlend.length) console.log('  verschluckt: ' + fehlend.join(', '));

  if (abbrueche.length) {
    console.log('\nAbgebrochen:');
    for (const a of abbrueche)
      console.log(`  ${a.id}  bei ${a.bei.toFixed(1)}s von ${a.dauer.toFixed(1)}s`);
  }
  if (ueberlappt) console.log(`\n${ueberlappt} Zeilen liefen gleichzeitig`);
  probleme.forEach(p => console.log('  ' + p));

  console.log();
  if (abbrueche.length || ueberlappt || probleme.length || fehlend.length) {
    console.log('✗ Zeilen schneiden einander ab');
    process.exit(1);
  }
  console.log('✓ Keine Zeile wurde abgeschnitten, keine zwei liefen gleichzeitig');
})();
