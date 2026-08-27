/* Sprachausgabe aus vorproduzierten Aufnahmen.
   Keine Gerätestimme – jede Zeile wurde mit einem neuronalen Modell
   gesprochen und liegt als MP3 im Ordner assets/voice. */

import { ducken, soundOn } from './audio.js';

let an = true;
let aktuell = null;
let laufendeId = null;
const cache = new Map();
const horcher = new Set();

function hole(id) {
  let a = cache.get(id);
  if (!a) {
    a = new Audio(`assets/voice/${id}.mp3`);
    a.preload = 'auto';
    cache.set(id, a);
  }
  return a;
}

export function setSprache(v) { an = !!v; if (!an) stopp(); }
export function spracheAn() { return an; }
export function laeuft() { return laufendeId; }
export function beiWechsel(fn) { horcher.add(fn); return () => horcher.delete(fn); }
function melde() { horcher.forEach(f => { try { f(laufendeId); } catch (e) {} }); }

export function stopp() {
  if (aktuell) { try { aktuell.pause(); aktuell.currentTime = 0; } catch (e) {} }
  aktuell = null;
  if (laufendeId) { laufendeId = null; ducken(false); melde(); }
}

/* Spielt eine Zeile. Gibt ein Promise zurück, das am Ende auflöst –
   auch wenn die Datei fehlt, damit Abläufe nie hängen bleiben. */
export function sprich(id, { danach } = {}) {
  stopp();
  if (!an || !soundOn() || !id) { danach && danach(); return Promise.resolve(false); }
  const a = hole(id);
  aktuell = a; laufendeId = id;
  ducken(true); melde();
  return new Promise((fertig) => {
    let erledigt = false;
    const schluss = (ok) => {
      if (erledigt) return;
      erledigt = true;
      a.removeEventListener('ended', beiEnde);
      a.removeEventListener('error', beiFehler);
      if (aktuell === a) { aktuell = null; laufendeId = null; ducken(false); melde(); }
      danach && danach();
      fertig(ok);
    };
    const beiEnde = () => schluss(true);
    const beiFehler = () => schluss(false);
    a.addEventListener('ended', beiEnde);
    a.addEventListener('error', beiFehler);
    a.currentTime = 0;
    const p = a.play();
    if (p && p.catch) p.catch(() => schluss(false));
    // Notbremse, falls das Ende-Ereignis ausbleibt
    setTimeout(() => schluss(false), 25000);
  });
}

/* Mehrere Zeilen nacheinander */
export async function sprichFolge(ids, proZeile) {
  for (const id of ids) {
    if (proZeile) proZeile(id);
    await sprich(id);
    if (!an || !soundOn()) break;
  }
}

/* Wärmt die Aufnahmen des nächsten Falls vor, damit nichts stockt. */
export function vorladen(ids) {
  ids.slice(0, 40).forEach(id => { try { hole(id).load(); } catch (e) {} });
}
