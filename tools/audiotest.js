const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://127.0.0.1:8099/';

(async () => {
  const browser = await chromium.launch({
    args: ['--autoplay-policy=no-user-gesture-required', '--mute-audio']
  });
  const page = await browser.newPage();
  const fehler = [];
  page.on('pageerror', e => fehler.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') fehler.push('console: ' + m.text()); });
  await page.goto(BASE, { waitUntil: 'networkidle' });

  const messen = async (name, code, dauerMs) => {
    const r = await page.evaluate(async ({ code, dauerMs }) => {
      const A = await import('./js/audio.js');
      A.unlock(); A.setSound(true);
      const lies = A._pegel();
      // eslint-disable-next-line no-new-func
      await new Function('A', 'return (async()=>{' + code + '})()')(A);
      let max = 0;
      const t0 = performance.now();
      while (performance.now() - t0 < dauerMs) {
        max = Math.max(max, lies());
        await new Promise(r => requestAnimationFrame(r));
      }
      return max;
    }, { code, dauerMs });
    const ok = r > 0.0008;
    console.log(`  ${ok ? '✓' : '✗'} ${name.padEnd(22)} Spitzenpegel ${r.toFixed(4)}`);
    if (!ok) fehler.push(name + ': kein hoerbares Signal (' + r.toFixed(5) + ')');
    return r;
  };

  console.log('  Effekte');
  for (const n of ['tap', 'page', 'lupe', 'found', 'right', 'wrong', 'stempel', 'sirene', 'bark',
                   'win', 'rang', 'ausloeser', 'akte', 'zuschlag', 'whoosh', 'tick', 'treffer', 'aufdecken'])
    await messen(n, `A.sfx.${n}()`, 900);
  await messen('schritt', `A.sfx.schritt(0); A.sfx.schritt(2)`, 900);

  console.log('  Klangkulissen');
  for (const k of ['schule', 'bahnhof', 'dorfplatz', 'museum', 'wald', 'buero'])
    await messen(k, `A.kulisse(null); A.kulisse('${k}'); await new Promise(r=>setTimeout(r,1400));`, 2600);
  await page.evaluate(async () => { (await import('./js/audio.js')).kulisse(null); });

  console.log('  Musik');
  await messen('Titelmusik', `A.setMusik(true); await new Promise(r=>setTimeout(r,1500));`, 3000);
  await page.evaluate(async () => { (await import('./js/audio.js')).setMusik(false); });

  console.log('  Sprachaufnahmen');
  const stimmenBericht = await page.evaluate(async () => {
    const { STIMMEN } = await import('./js/voice-liste.js');
    const proben = [STIMMEN[0], STIMMEN[Math.floor(STIMMEN.length / 2)], STIMMEN[STIMMEN.length - 1]];
    const ergebnis = [];
    let fehlend = 0, bytes = 0;
    // Alle Dateien pruefen: erreichbar, richtiger Typ, nicht leer.
    for (const id of STIMMEN) {
      const r = await fetch('assets/voice/' + id + '.mp3');
      if (!r.ok) { fehlend++; continue; }
      const b = await r.blob();
      bytes += b.size;
      if (b.size < 800) fehlend++;
    }
    // Drei Stichproben wirklich abspielen und die Laenge messen.
    for (const id of proben) {
      const a = new Audio('assets/voice/' + id + '.mp3');
      const dauer = await new Promise((fertig) => {
        a.addEventListener('loadedmetadata', () => fertig(a.duration));
        a.addEventListener('error', () => fertig(-1));
        setTimeout(() => fertig(-2), 4000);
      });
      ergebnis.push({ id, dauer });
    }
    // Eine Aufnahme wirklich abspielen und pruefen, dass die Zeit laeuft.
    const a = new Audio('assets/voice/' + STIMMEN[0] + '.mp3');
    a.volume = 0;
    let gelaufen = -1;
    try {
      await a.play();
      await new Promise(r => setTimeout(r, 800));
      gelaufen = a.currentTime;
      a.pause();
    } catch (e) { gelaufen = -2; }
    return { anzahl: STIMMEN.length, fehlend, kb: Math.round(bytes / 1024),
             proben: ergebnis, gelaufen };
  });
  const sOk = stimmenBericht.fehlend === 0;
  console.log(`  ${sOk ? '✓' : '✗'} ${String(stimmenBericht.anzahl + ' Aufnahmen').padEnd(22)} ` +
              `${stimmenBericht.kb} KB, ${stimmenBericht.fehlend} fehlend/leer`);
  if (!sOk) fehler.push(stimmenBericht.fehlend + ' Sprachdateien fehlen oder sind leer');
  const lauf = stimmenBericht.gelaufen > 0.25;
  console.log(`  ${lauf ? '✓' : '✗'} ${'Abspielen laeuft'.padEnd(22)} ${stimmenBericht.gelaufen.toFixed(2)} s in 0,8 s`);
  if (!lauf) fehler.push('Sprachaufnahme spielt nicht ab (currentTime ' + stimmenBericht.gelaufen + ')');
  for (const p of stimmenBericht.proben) {
    const ok = p.dauer > 0.3 && p.dauer < 30;
    console.log(`  ${ok ? '✓' : '✗'} ${p.id.padEnd(22)} ${p.dauer.toFixed(2)} s`);
    if (!ok) fehler.push('Aufnahme ' + p.id + ' hat Laenge ' + p.dauer);
  }

  console.log('  Ton aus');
  const stumm = await page.evaluate(async () => {
    const A = await import('./js/audio.js');
    A.setSound(false);
    await new Promise(r => setTimeout(r, 500));   // kurze Ausblende statt hartem Schnitt
    const lies = A._pegel();
    A.sfx.win();
    let max = 0;
    const t0 = performance.now();
    while (performance.now() - t0 < 900) { max = Math.max(max, lies()); await new Promise(r => requestAnimationFrame(r)); }
    return max;
  });
  console.log(`  ${stumm < 0.0008 ? '✓' : '✗'} Ton aus schaltet stumm   Spitzenpegel ${stumm.toFixed(5)}`);
  if (stumm >= 0.0008) fehler.push('Ton aus schaltet nicht stumm');

  await browser.close();
  console.log('\n' + (fehler.length ? '✗ FEHLER:\n' + fehler.map(f => '   - ' + f).join('\n')
                                    : '✓ Audio vollständig'));
  process.exit(fehler.length ? 1 : 0);
})();
