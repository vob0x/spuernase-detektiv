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
- **Sprache:** 135 Aufnahmen, lokal mit Piper erzeugt (`de_DE-thorsten-high` für
  den Erzähler, `de_DE-mls-medium` mit zehn Sprecher-Kennungen und
  Tonhöhen-/Tempoversatz für 26 Figuren), MP3 48 kbit/s mono, ~2,2 MB
- **Ton:** Effekte, Kulissen und Musik vollständig über die WebAudio-API
  synthetisiert. Drei Busse über gemeinsamen Hall und Kompressor, fünf
  ortsbezogene Klangkulissen, optionale Titelmusik, 19 Effekte
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
js/voice.js             Abspielen der Sprachaufnahmen
js/voice-liste.js       erzeugte Liste aller Aufnahme-Kennungen
js/state.js             Fortschritt, Ränge
assets/img/             Tatort-Illustrationen und Titelbild
assets/portraits/       28 Figurenporträts
assets/voice/           135 Sprachaufnahmen (MP3)
assets/icons/           App-Icons
tools/                  Entwicklungswerkzeuge (nicht Teil der App)
docs/                   Konzept, Arbeitsprotokoll, Testbericht
```

## Lokal starten

```bash
node tools/serve.js .        # http://localhost:8099
node tools/test.js           # spielt alle fünf Fälle automatisch durch
node tools/audiotest.js      # misst jeden Klang und prüft den Stummschalter
```

`tools/preview.html` zeigt alle prozeduralen Beweismittel nebeneinander –
praktisch, wenn man an `js/art.js` schraubt.
`tools/portraits.py` schneidet einen 2x2-Porträtbogen in Einzelbilder.

### Sprache neu erzeugen

```bash
python3 tools/voice.py                 # nur geänderte Zeilen, per Hash-Sperre
python3 tools/voice.py --nur f3        # nur einen Fall
```

Braucht `piper` und `ffmpeg` sowie die Modelle unter `~/voices`. Das Werkzeug
schreibt `js/voice-liste.js` mit; diese Liste wandert in den Service Worker.

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
