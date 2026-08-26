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
  for (const n of ['tap', 'page', 'lupe', 'found', 'right', 'wrong', 'stempel', 'sirene', 'bark', 'win', 'rang'])
    await messen(n, `A.sfx.${n}()`, 900);

  console.log('  Klangkulissen');
  for (const k of ['schule', 'bahnhof', 'dorfplatz', 'museum', 'wald', 'buero'])
    await messen(k, `A.kulisse(null); A.kulisse('${k}'); await new Promise(r=>setTimeout(r,1400));`, 2600);
  await page.evaluate(async () => { (await import('./js/audio.js')).kulisse(null); });

  console.log('  Musik');
  await messen('Titelmusik', `A.setMusik(true); await new Promise(r=>setTimeout(r,1500));`, 3000);
  await page.evaluate(async () => { (await import('./js/audio.js')).setMusik(false); });

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
