const { chromium, devices } = require('playwright');

const BASE = process.argv[2] || 'http://localhost:8099/';
const ONLY = process.argv[3] ? Number(process.argv[3]) : null;

(async () => {
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const browser = await chromium.launch(proxy && !/localhost|127\.0\.0\.1/.test(BASE)
    ? { proxy: { server: proxy }, args: ['--ignore-certificate-errors'] } : {});
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    ...devices['iPhone 13'],
    locale: 'de-CH',
    hasTouch: true, isMobile: true
  });
  const page = await ctx.newPage();
  const errors = [], warns = [];
  page.on('console', m => {
    if (m.type() === 'error') errors.push('console: ' + m.text());
    if (m.type() === 'warning') warns.push(m.text());
  });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('requestfailed', r => {
    const u = r.url();
    if (!/\.(webp|png|jpg)$/.test(u)) errors.push('reqfail: ' + u + ' ' + (r.failure()?.errorText || ''));
  });

  const log = (...a) => console.log(...a);
  await page.goto(BASE, { waitUntil: 'networkidle' });

  /* ---- Datenkonsistenz aller Fälle ---- */
  const check = await page.evaluate(() => {
    const out = [];
    for (const f of window.SPUERNASE.FAELLE) {
      const raus = new Set(f.ausschluss.flatMap(a => a.raus));
      const rest = f.verdaechtige.filter(v => !raus.has(v.id)).map(v => v.id);
      const probleme = [];
      if (rest.length !== 1) probleme.push('nach Ausschluss bleiben ' + rest.length + ' übrig');
      if (rest[0] !== f.taeter) probleme.push('übrig ist ' + rest[0] + ', Täter ist ' + f.taeter);
      f.labor.forEach((l, i) => {
        if (!l.optionen.some(o => o.id === l.richtig)) probleme.push('Labor ' + i + ': richtige Option fehlt');
      });
      const luegen = f.zeugen.filter(z => z.luege >= 0);
      if (luegen.length !== 1) probleme.push(luegen.length + ' Widersprüche statt 1');
      luegen.forEach(z => { if (!z.warum) probleme.push(z.name + ' ohne Begründung'); });
      // Szene auf einem 390px breiten Handy, 3:2 -> 390x260, Marker 64px
      const W = 390, H = 260, M = 32;
      f.spuren.forEach(s => {
        if (s.x * W < M || s.x * W > W - M || s.y * H < M || s.y * H > H - M)
          probleme.push('Spur ' + s.id + ' ragt aus der Szene');
      });
      for (let i = 0; i < f.spuren.length; i++)
        for (let j = i + 1; j < f.spuren.length; j++) {
          const a = f.spuren[i], b = f.spuren[j];
          const d = Math.hypot((a.x - b.x) * W, (a.y - b.y) * H);
          if (d < 68) probleme.push('Spuren ' + a.id + '/' + b.id + ' ueberlappen (' + Math.round(d) + 'px)');
        }
      out.push({ id: f.id, titel: f.titel, probleme });
    }
    return out;
  });
  let dataOk = true;
  check.forEach(c => {
    if (c.probleme.length) { dataOk = false; errors.push(c.id + ': ' + c.probleme.join(' | ')); log('  ✗', c.id, c.probleme.join(' | ')); }
    else log('  ✓', c.id, c.titel);
  });

  await page.screenshot({ path: '/tmp/shot-start.png' });

  /* ---- Durchspielen ---- */
  const faelle = await page.evaluate(() => window.SPUERNASE.FAELLE.map(f => f.id));
  const ziel = ONLY ? [faelle[ONLY - 1]] : faelle;

  for (const fid of ziel) {
    const t0 = Date.now();
    await page.evaluate((fid) => {
      const S = window.SPUERNASE;
      const f = S.FAELLE.find(x => x.id === fid);
      window.__start(f);
    }, fid).catch(() => {});

    // Über die UI navigieren
    await page.evaluate(() => window.SPUERNASE.go(window.SPUERNASE.scrFaelle));
    await page.waitForSelector('[data-fall="' + fid + '"]');
    const btn = page.locator('[data-fall="' + fid + '"]');
    if (await btn.isDisabled()) { log('  ⤼', fid, 'noch gesperrt – überspringe'); continue; }
    await btn.click();
    await page.waitForSelector('[data-act="start"]');
    await page.click('[data-act="start"]');
    await page.waitForSelector('#scene');

    /* Tatort */
    const box = await page.locator('#scene').boundingBox();
    const spuren = await page.evaluate(() => window.SPUERNASE.F.spuren.map(s => ({ id: s.id, x: s.x, y: s.y })));
    for (const s of spuren) {
      const x = box.x + s.x * box.width, y = box.y + s.y * box.height;
      await page.mouse.move(x - 30, y - 30);
      await page.mouse.move(x, y, { steps: 6 });
      await page.waitForTimeout(560);
    }
    const gefunden = await page.evaluate(() => window.SPUERNASE.E.gefunden.length);
    if (gefunden !== spuren.length) { errors.push(fid + ': nur ' + gefunden + '/' + spuren.length + ' Spuren gefunden'); }
    if (fid === 'f1') await page.screenshot({ path: '/tmp/shot-tatort.png' });
    await page.click('#weiter');

    /* Labor */
    for (;;) {
      const st = await page.evaluate(() => {
        const F = window.SPUERNASE.F, E = window.SPUERNASE.E;
        return { i: E.laborIdx, n: F.labor.length, richtig: F.labor[E.laborIdx]?.richtig };
      });
      if (st.i >= st.n) break;
      await page.waitForSelector('[data-opt]');
      if (fid === 'f1' && st.i === 0) await page.screenshot({ path: '/tmp/shot-labor.png' });
      await page.click('[data-opt="' + st.richtig + '"]');
      await page.waitForTimeout(1700);
    }

    /* Zeugen */
    await page.waitForSelector('.bubble');
    if (fid === 'f1') await page.screenshot({ path: '/tmp/shot-zeugen.png' });
    const l = await page.evaluate(() => {
      const F = window.SPUERNASE.F;
      const zi = F.zeugen.findIndex(z => z.luege >= 0);
      return { zi, si: F.zeugen[zi].luege };
    });
    await page.click(`.bubble[data-z="${l.zi}"][data-s="${l.si}"]`);
    await page.waitForSelector('#weiterZ');
    await page.click('#weiterZ');

    /* Ausschluss */
    for (;;) {
      const st = await page.evaluate(() => {
        const F = window.SPUERNASE.F, E = window.SPUERNASE.E;
        const s = F.ausschluss[E.ausschlussIdx];
        return s ? { raus: s.raus.filter(x => !E.raus.includes(x)) } : null;
      });
      if (!st) break;
      await page.waitForSelector('[data-v]');
      if (fid === 'f1') await page.screenshot({ path: '/tmp/shot-ausschluss.png' });
      for (const id of st.raus) { await page.click('[data-v="' + id + '"]'); await page.waitForTimeout(200); }
      await page.waitForSelector('#weiterA');
      await page.click('#weiterA');
      await page.waitForTimeout(200);
    }

    /* Verhaftung */
    await page.waitForSelector('[data-v]');
    const taeter = await page.evaluate(() => window.SPUERNASE.F.taeter);
    await page.click('[data-v="' + taeter + '"]');
    await page.waitForTimeout(1400);

    const erg = await page.evaluate(() => ({
      fehler: window.SPUERNASE.E.fehler,
      sterne: window.SPUERNASE.S.sterneFuer(window.SPUERNASE.F.id),
      rang: window.SPUERNASE.S.rang().name,
      txt: document.body.innerText.slice(0, 60)
    }));
    if (fid === 'f5') await page.screenshot({ path: '/tmp/shot-ergebnis.png', fullPage: true });
    if (erg.sterne !== 3) errors.push(fid + ': erwartet 3 Sterne, bekommen ' + erg.sterne + ' (Fehler ' + erg.fehler + ')');
    log(`  ▶ ${fid}: durchgespielt in ${((Date.now() - t0) / 1000).toFixed(1)}s – ${erg.sterne}★, Fehler ${erg.fehler}, Rang ${erg.rang}`);
  }

  /* ---- PWA ---- */
  const pwa = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    const mani = document.querySelector('link[rel=manifest]');
    const r = await fetch(mani.href).then(x => x.json()).catch(() => null);
    return {
      sw: !!reg, aktiv: !!(reg && reg.active),
      manifest: !!r, icons: r ? r.icons.length : 0,
      display: r ? r.display : null, start: r ? r.start_url : null
    };
  });
  log('  PWA:', JSON.stringify(pwa));
  if (!pwa.sw) errors.push('Service Worker nicht registriert');
  if (!pwa.manifest) errors.push('Manifest nicht ladbar');

  /* ---- Offline ---- */
  await ctx.setOffline(true);
  const off = await page.goto(BASE, { waitUntil: 'domcontentloaded' }).then(r => r && r.status()).catch(e => 'FEHLER: ' + e.message);
  const offTitel = await page.evaluate(() => document.querySelector('.title')?.textContent || '').catch(() => '');
  log('  Offline-Reload:', off, '| Titel:', offTitel);
  if (!offTitel.includes('Spür')) errors.push('Offline-Reload zeigt das Spiel nicht');
  await ctx.setOffline(false);

  /* ---- horizontales Scrollen? ---- */
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 2) errors.push('Seite scrollt horizontal um ' + overflow + 'px');

  await browser.close();
  log('\n' + (errors.length ? '✗ FEHLER:\n' + errors.map(e => '   - ' + e).join('\n')
                            : '✓ Alle Prüfungen bestanden'));
  process.exit(errors.length || !dataOk ? 1 : 0);
})();
