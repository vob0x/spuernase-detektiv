/* Sprachausgabe aus vorproduzierten Aufnahmen.
   Keine Gerätestimme – jede Zeile wurde mit einem neuronalen Modell
   gesprochen und liegt als MP3 im Ordner assets/voice.

   ## Warum hier eine Warteschlange steht

   Die erste Fassung begann jede Zeile mit einem `stopp()`. Das heisst: wer
   zuletzt spricht, schneidet dem vorigen das Wort ab. Solange immer nur eine
   Zeile fiel, war das unauffällig. An den Stellen, wo zwei Dinge gleichzeitig
   passieren, war es kaputt:

   * Letzte Spur gefunden: die Spurenzeile läuft, 900 ms später schaltet sich
     «Alle Spuren gefunden» darüber – die Spurenzeile bricht mitten im Wort ab.
   * Verfolgung: «Genau richtig» wird nach 620 ms vom Zieltext überfahren.
   * Fallende: «Drei Sterne» wird nach 900 ms von «Du wirst befördert»
     überfahren.

   Seit die Aufnahmen von Gemini kommen, sind sie im Schnitt 4,65 statt 2,86
   Sekunden lang. Die alten Wartezeiten waren auf die kurzen Piper-Aufnahmen
   eingestellt – der Fehler war also immer da und ist nur sichtbarer geworden.

   Jetzt gilt: **Zeilen reihen sich an, sie überfahren einander nicht.**

   ## Wann trotzdem unterbrochen wird

   Nicht jede Unterbrechung ist ein Fehler. Drei Fälle brauchen sie:

   * **Bildschirmwechsel** – was zum alten Bild gehört, ist nicht mehr wahr.
   * **Falsche Antwort** – die Rückmeldung muss sofort kommen, sonst bezieht
     das Kind sie nicht mehr auf seinen Tipp.
   * **«Nochmal vorlesen»** – das Kind hat gerade jetzt gefragt.

   Dafür gibt es `{ sofort: true }`. Und weil ein harter Schnitt knackt, wird
   in 120 ms ausgeblendet statt abgewürgt.

   ## Reaktionen überleben den Bildschirmwechsel

   Ein Bildschirmwechsel beendet, was zum alten Bild gehörte – die Frage, den
   Spurentext, die Anleitung. **Nicht** aber die kurze Antwort auf das, was
   das Kind gerade getan hat: «Genau richtig», «Alle Spuren gefunden», «Drei
   Sterne». Die gehören zur Handlung, nicht zum Bild, und wurden bisher vom
   Neuaufbau des Bildschirms mitten im Wort gekappt – bei der Verfolgung nach
   620 ms, im Labor nach 2200.

   Welche Zeilen das sind, steht unten in REAKTION.

   ## Warum die Schlange kurz ist

   Höchstens drei wartende Zeilen. Wer viermal hintereinander etwas auslöst,
   will nicht eine Minute Monolog hören – die älteste wartende fällt raus.
   Sie löst ihr Versprechen trotzdem auf, sonst bliebe ein Ablauf hängen,
   der auf ihr Ende wartet. */

import { ducken, soundOn } from './audio.js';

const MAX_WARTEND = 4;
const AUSBLENDEN_MS = 120;

/* Kurze Rückmeldungen auf eine Handlung des Kindes. Sie hängen nicht am
   Bildschirm, sondern an dem, was es gerade getan hat – ein Bildwechsel
   beendet sie darum nicht. Alles andere (Fragen, Spurentexte, Anleitungen)
   gehört zum Bild und geht mit ihm. */
const REAKTION = new Set([
  'g-richtig', 'g-alle', 'g-erwischt', 'g-drei', 'g-befoerdert',
  'g-verhaftet', 'g-falsch', 'g-fastfalsch',
]);

/* Anleitungen: «Such den Tatort ab», «Wähle einen Fall». Sie sagen, was zu
   tun ist – sobald das Kind es tut, sind sie überholt. Sie dürfen darum
   unterbrochen werden und belegen keinen Platz in der Schlange.

   Ohne diese Unterscheidung frisst die Anleitung den Anfang: im Messlauf
   lief «Such den Tatort ab» noch, während das Kind schon drei Spuren fand –
   die Zeile zur **ersten** Spur fiel hinten aus der Schlange und war weg.
   Das Kind tippt und hört nichts: schlimmer als der Fehler, den ich
   reparieren wollte. */
const ANLEITUNG = new Set([
  'g-tatort', 'g-dunkel', 'g-zeuge', 'g-lineup', 'g-verhaften',
  'g-quer', 'g-weiter', 'g-willkommen',
]);
const istAnleitung = (id) => ANLEITUNG.has(id) || String(id).startsWith('g-hinweis-');

let an = true;
let aktuell = null;          // gerade spielendes Audio-Element
let aktuellSchluss = null;   // loest das Versprechen der laufenden Zeile auf
let laufendeId = null;
let geduckt = false;
const schlange = [];         // [{ id, danach, aufloesen, reaktion }]
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
export function wartend() { return schlange.length; }
export function beiWechsel(fn) { horcher.add(fn); return () => horcher.delete(fn); }
function melde() { horcher.forEach(f => { try { f(laufendeId); } catch (e) {} }); }

/* Ducken nur beim Übergang schalten, nicht bei jeder Zeile: sonst pumpt die
   Kulisse zwischen zwei angereihten Sätzen hörbar auf und ab. */
function duckenSetzen(v) {
  if (geduckt === v) return;
  geduckt = v;
  ducken(v);
}

/* Sanft ausblenden statt hart abwürgen – ein harter Schnitt knackt. */
function ausblenden(a) {
  const start = a.volume;
  const schritte = 6;
  let i = 0;
  const t = setInterval(() => {
    i++;
    try { a.volume = Math.max(0, start * (1 - i / schritte)); } catch (e) {}
    if (i >= schritte) {
      clearInterval(t);
      try { a.pause(); a.currentTime = 0; a.volume = 1; } catch (e) {}
    }
  }, AUSBLENDEN_MS / schritte);
}

function verwerfen(e) {
  try { e.danach && e.danach(); } catch (err) {}
  e.aufloesen(false);
}

/* Beendet alles: laufende Zeile und alles, was noch wartet. Jedes Versprechen
   wird aufgelöst, damit kein Ablauf auf ein Ende wartet, das nie kommt. */
export function stopp() {
  const lief = aktuell, schluss = aktuellSchluss;
  aktuell = null; aktuellSchluss = null;
  if (lief) ausblenden(lief);
  // Das Versprechen der abgebrochenen Zeile sofort aufloesen. Ohne das haengt
  // es an der 25-Sekunden-Notbremse, und ein Ablauf, der darauf wartet, steht
  // eine halbe Minute still.
  if (schluss) schluss(false);
  while (schlange.length) verwerfen(schlange.shift());
  if (laufendeId) { laufendeId = null; melde(); }
  duckenSetzen(false);
}

/* Beim Bildschirmwechsel: alles beenden, was zum alten Bild gehörte – aber
   eine laufende Rückmeldung zu Ende sprechen lassen. */
export function stoppBildwechsel() {
  const bleibt = schlange.filter(e => e.reaktion);
  schlange.filter(e => !e.reaktion).forEach(verwerfen);
  schlange.length = 0;
  schlange.push(...bleibt);

  if (aktuell && !REAKTION.has(laufendeId)) {
    const lief = aktuell, schluss = aktuellSchluss;
    aktuell = null; aktuellSchluss = null;
    ausblenden(lief);
    laufendeId = null;
    melde();
    if (schluss) schluss(false);
    if (!aktuell) { if (schlange.length) naechste(); else duckenSetzen(false); }
  }
}

function naechste() {
  const e = schlange.shift();
  if (!e) {
    laufendeId = null;
    aktuell = null;
    duckenSetzen(false);
    melde();
    return;
  }
  if (!an || !soundOn()) {
    try { e.danach && e.danach(); } catch (err) {}
    e.aufloesen(false);
    return naechste();
  }

  const a = hole(e.id);
  aktuell = a;
  laufendeId = e.id;
  duckenSetzen(true);
  melde();

  let erledigt = false;
  const schluss = (ok) => {
    if (erledigt) return;
    erledigt = true;
    clearTimeout(notbremse);
    a.removeEventListener('ended', beiEnde);
    a.removeEventListener('error', beiFehler);
    try { e.danach && e.danach(); } catch (err) {}
    e.aufloesen(ok);
    // Nur weitermachen, wenn dieses Element noch das aktuelle ist. Nach einem
    // stopp() hat schon jemand anderes uebernommen.
    if (aktuell === a) { aktuellSchluss = null; naechste(); }
  };
  aktuellSchluss = schluss;
  const beiEnde = () => schluss(true);
  const beiFehler = () => schluss(false);
  a.addEventListener('ended', beiEnde);
  a.addEventListener('error', beiFehler);

  try { a.volume = 1; a.currentTime = 0; } catch (err) {}
  const p = a.play();
  if (p && p.catch) p.catch(() => schluss(false));
  const notbremse = setTimeout(() => schluss(false), 25000);
}

/* Reiht eine Zeile ein. Das Versprechen loest auf, wenn **diese** Zeile
   fertig ist – auch dann, wenn sie nie gespielt wurde, damit Ablaeufe nie
   haengen bleiben.

   Optionen:
     danach  – Rueckruf am Ende dieser Zeile
     sofort  – laufende Zeile ausblenden und Schlange leeren (Fehlermeldung,
               «nochmal vorlesen»)
     reaktion – überschreibt, ob die Zeile einen Bildwechsel überlebt */
export function sprich(id, { danach, sofort, reaktion } = {}) {
  if (!an || !soundOn() || !id) { danach && danach(); return Promise.resolve(false); }

  if (sofort) stopp();
  const istReaktion = reaktion === undefined ? REAKTION.has(id) : !!reaktion;

  // Eine laufende Anleitung weicht dem, was das Kind gerade ausgeloest hat.
  if (aktuell && istAnleitung(laufendeId) && !istAnleitung(id)) {
    const lief = aktuell, schluss = aktuellSchluss;
    aktuell = null; aktuellSchluss = null;
    ausblenden(lief);
    laufendeId = null;
    if (schluss) schluss(false);
    melde();
  }

  // Dieselbe Zeile nicht doppelt: ein zweiter Tipp auf denselben Knopf soll
  // sie nicht ein zweites Mal in die Schlange legen.
  if (laufendeId === id || schlange.some(e => e.id === id)) {
    danach && danach();
    return Promise.resolve(false);
  }

  return new Promise((aufloesen) => {
    schlange.push({ id, danach, aufloesen, reaktion: istReaktion });
    // Schlange kurz halten: die aelteste wartende faellt raus, weil das
    // Neueste das ist, was das Kind gerade ausgeloest hat.
    while (schlange.length > MAX_WARTEND) verwerfen(schlange.shift());
    if (!aktuell) naechste();
  });
}

/* Mehrere Zeilen nacheinander. Sie werden gemeinsam eingereiht, damit sich
   nichts dazwischenschiebt. */
export async function sprichFolge(ids, proZeile) {
  const alle = ids.map(id => {
    if (proZeile) proZeile(id);
    return sprich(id);
  });
  await Promise.all(alle);
}

/* Wärmt die Aufnahmen des nächsten Falls vor, damit nichts stockt. */
export function vorladen(ids) {
  ids.slice(0, 40).forEach(id => { try { hole(id).load(); } catch (e) {} });
}
