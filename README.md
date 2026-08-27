# Spürnase — Detektivbüro Bärenmoos

Ein Detektiv- und Polizeispiel als **Progressive Web App** für Kinder ab 8 Jahren.
Schweizer Kontext, Standarddeutsch, **Querformat**, mobil-first, läuft vollständig
offline. Jede Zeile im Spiel wird vorgelesen — 135 Aufnahmen, keine Gerätestimme.

**Spielen:** https://vob0x.github.io/spuernase-detektiv/

## Was das Kind macht

Sieben Phasenarten, aus denen jeder Fall **anders** zusammengesetzt ist:

| Phase | Was passiert |
|---|---|
| Tatort | Lupe (oder Taschenlampe) über die Szene ziehen, Spuren aufdecken |
| Spurenlabor | Muster vergleichen, ausmessen, Uhr lesen |
| Verfolgung | An jeder Weggabelung die richtige Fährte wählen |
| Zeitstrahl | Alibis im Tatzeitfenster prüfen |
| Zeugen | Aussagen anhören und den Widerspruch finden |
| Gegenüberstellung | Verdächtige Beweis für Beweis ausschliessen |
| Verhaftung | Die übrig gebliebene Person benennen |

Fall 1 hat vier Phasen (Tutorial), Fall 5 hat sechs. Kein Fall spielt sich
wie der vorherige.

Rangaufstieg von Anwärter:in bis Chefinspektor:in, 1–3 Sterne pro Fall.

## Bildsprache

Akten auf einer Schreibtischplatte: dunkles Holz, darauf helle Papierflächen.
Tatorte sind Fotos, Laborproben sind Beweismittelkarten, Verdächtige sind
Passfotos an einer Messwand und bekommen beim Ausschluss einen «Raus»-Stempel
quer über das Bild. Kein Bildschirm erscheint einfach: der Fall beginnt mit
Kameraauslöser und fallendem Foto, gefundene Spuren fliegen ins Beweisregal,
am Ende flutet Blaulicht den Raum.

## Technik

- Vanilla ES-Module, kein Framework, kein Build-Schritt
- **Feste Querformat-Bühne** 1000 × 480, die als Ganzes skaliert wird; im
  Hochformat erscheint eine Drehaufforderung
- **Grafik:** KI-Illustrationen für Tatorte und 28 Figurenporträts (WebP, ~750 KB
  gesamt); alles Beweiserhebliche – Fingerabdrücke, Sohlen, Reifenprofile,
  Fasern, Handschriften, Uhr, Lineal, Tierfährten – wird prozedural als SVG
  erzeugt, damit Probe und richtige Antwort garantiert identisch aussehen
- **Sprache:** 135 Aufnahmen, erzeugt mit **Gemini 3.1 Flash TTS**, MP3
  64 kbit/s mono, ~4,9 MB. Jede sprechende Rolle hat eine eigene Stimme, und
  die Besetzung ist **gemessen, nicht geraten**: alle 30 Stimmen einmal durch
  denselben Satz, dann Grundton **und Formanten** gemessen — die Namen verraten
  das Geschlecht nicht («Puck» klingt nach Kobold und ist ein Mann)
- **Regie:** jede Zeile bekommt aus `tools/regie.py` eine Anweisung, formuliert
  wie für eine Sprecherin im Studio: «Leise und geheimnisvoll, fast geflüstert»
  gegen «Triumphierend und stolz, der Fall ist gelöst». Ohne das lesen sich alle
  135 Zeilen gleich. Zeugenaussagen bekommen bewusst **alle dieselbe**
  Anweisung — sonst verriete der Tonfall die Lüge
- **Prüfung:** jede frische Aufnahme wird sofort von einem Spracherkenner
  abgehört. Spricht das Modell die Regieanweisung mit oder nuschelt es, wird die
  Zeile wiederholt und der **beste** Versuch behalten
- **Ton:** Effekte, Kulissen und Musik vollständig über die WebAudio-API
  synthetisiert. Die Klangbetten der Kulissen (`js/kulisse.js`) werden als
  Sample mit tausenden Einzelereignissen ausgerechnet — Regen besteht aus
  Tropfen, nicht aus gefiltertem Rauschen. Drei Busse über gemeinsamen Hall und
  Kompressor, sechs Orte, optionale Titelmusik, 19 Effekte
- Offline: Service Worker. Programm und Bilder im Precache, die Sprachdateien
  danach im Hintergrund
- Fortschritt in `localStorage`, kein Konto, keine Datenübertragung, keine Werbung

## Struktur

```
index.html              Einstieg
manifest.webmanifest    PWA-Manifest
sw.js                   Service Worker (Precache + Offline)
css/app.css             gesamtes Styling
js/app.js               Spiellogik und Bildschirme
js/cases.js             die fünf Fallakten (reine Daten)
js/art.js               SVG-Generatoren (Fingerabdrücke, Sohlen, Uhren, Marker)
js/audio.js             Audio-Engine: Kulissen, Musik, Effekte
js/kulisse.js           Klangbetten der Orte (Regen, Wind, Wasser, Stimmen)
js/voice.js             Abspielen der Sprachaufnahmen
js/voice-liste.js       erzeugte Liste aller Aufnahme-Kennungen
js/state.js             Fortschritt, Ränge
assets/img/             Tatort-Illustrationen und Titelbild
assets/portraits/       28 Figurenporträts
assets/voice/           135 Sprachaufnahmen (MP3)
assets/icons/           App-Icons
tools/                  Entwicklungswerkzeuge (nicht Teil der App)
  regie.py              Regieanweisung und Stimmenbesetzung je Zeile
  regietest.py          prüft die Regie, bevor 135 Aufrufe ans Modell gehen
  aussprache.py         Lautschrift-Wörterbuch aus der Piper-Zeit, ungenutzt
docs/                   Konzept, Arbeitsprotokoll, Testbericht
```

## Lokal starten

```bash
node tools/serve.js .        # http://localhost:8099
node tools/test.js           # spielt alle fünf Fälle automatisch durch
node tools/audiotest.js      # misst jeden Klang, die Kulissen und den Stummschalter
python3 tools/regietest.py        # prüft Regie, Besetzung und Schreibregeln
python3 tools/hoerprobe.py        # hört jede Aufnahme ab und vergleicht mit dem Text
python3 tools/lebendigkeit.py     # misst Sprechmelodie und Abwechslung
```

Die letzten beiden ziehen absichtlich in entgegengesetzte Richtungen: wer nur
auf Verständlichkeit optimiert, bekommt eine flache Stimme.

`tools/preview.html` zeigt alle prozeduralen Beweismittel nebeneinander –
praktisch, wenn man an `js/art.js` schraubt.
`tools/portraits.py` schneidet einen 2x2-Porträtbogen in Einzelbilder.

### Sprache neu erzeugen

```bash
python3 tools/voice.py                 # nur geänderte Zeilen, per Hash-Sperre
python3 tools/voice.py --nur f3        # nur einen Fall
```

Braucht `ffmpeg`, `faster-whisper` und einen Gemini-API-Schlüssel in der Datei,
auf die `GEMINI_KEY` zeigt (Vorgabe `/tmp/.gk`). Der Schlüssel steht nirgends im
Projekt. Ein vollständiger Neubau kostet rund 0,19 USD.

Das Werkzeug schreibt `js/voice-liste.js` mit; diese Liste wandert in den
Service Worker. Wörter, die das Modell falsch liest, kommen als Schreibregel in
`regie.LAUTSCHREIBUNG` — sie ändern nur den gesprochenen Text, nie den auf dem
Bildschirm, und jeder Eintrag wird gemessen statt geraten.

## Einen Fall ändern oder hinzufügen

Alles Inhaltliche steht in `js/cases.js`. Ein Fall ist ein Objekt mit `phasen`
(welche Bildschirme in welcher Reihenfolge), `spuren` (x/y als Anteil der Szene),
optional `labor`, `verfolgung`, `zeitstrahl`, `zeugen`, dazu `verdaechtige`,
`lineup`, `taeter`, `aufloesung` und `wusstest`.

Danach:

```bash
python3 tools/voice.py       # vertont die neuen Zeilen
node tools/test.js           # spielt den Fall durch und prüft ihn
```

`tools/test.js` prüft, ob jede Phase erreichbar ist, ob ein fehlerfreier
Durchlauf drei Sterne ergibt und ob jede angeforderte Sprachaufnahme existiert.

## Lizenz / Nutzung

Privates Familienprojekt. Alle Personen, Orte und Fälle sind erfunden.
