# Spürnase — Detektivbüro Bärenmoos

Ein Detektiv- und Polizeispiel als **Progressive Web App** für Kinder ab 8 Jahren.
Schweizer Kontext, Standarddeutsch, mobil-first, läuft vollständig offline.

**Spielen:** https://vob0x.github.io/spuernase-detektiv/

## Was das Kind macht

Fünf Fälle, jeder in fünf Schritten:

1. **Tatort** — Lupe über die Szene ziehen und Spuren sichern
2. **Spurenlabor** — Muster vergleichen, ausmessen, Uhr lesen
3. **Zeugen** — die Aussage finden, die den Fakten widerspricht
4. **Ausschluss** — Verdächtige Beweis für Beweis eliminieren
5. **Verhaftung** — Täter benennen, Auflösung und ein Stück Sachwissen lesen

Rangaufstieg von Anwärter:in bis Chefinspektor:in, 1–3 Sterne pro Fall.

## Technik

- Vanilla ES-Module, kein Framework, kein Build-Schritt
- Grafik: KI-Illustrationen als Hintergrundplatten (WebP, ~470 KB gesamt) plus
  prozedural erzeugtes SVG für alles Interaktive
- Ton: vollständig synthetisiert über die WebAudio-API, keine Audiodateien
- Offline: Service Worker mit vollständigem Precache
- Fortschritt in `localStorage`, kein Konto, keine Datenübertragung, keine Werbung

## Struktur

```
index.html              Einstieg
manifest.webmanifest    PWA-Manifest
sw.js                   Service Worker (Precache + Offline)
css/app.css             gesamtes Styling
js/app.js               Spiellogik und Bildschirme
js/cases.js             die fünf Fallakten (reine Daten)
js/art.js               SVG-Generatoren (Fingerabdrücke, Sohlen, Uhren, Gesichter)
js/audio.js             WebAudio-Synthese
js/state.js             Fortschritt, Ränge
assets/img/             Hintergrundbilder der Tatorte
assets/icons/           App-Icons
tools/                  Entwicklungswerkzeuge (nicht Teil der App)
docs/                   Konzept, Arbeitsprotokoll, Testbericht
```

## Lokal starten

```bash
node tools/serve.js .        # http://localhost:8099
node tools/test.js           # spielt alle fünf Fälle automatisch durch
```

## Einen Fall ändern oder hinzufügen

Alles Inhaltliche steht in `js/cases.js`. Ein Fall ist ein Objekt mit `spuren`
(x/y als Anteil der Szene), `labor`, `zeugen`, `verdaechtige`, `ausschluss`,
`taeter`, `aufloesung` und `wusstest`. `node tools/test.js` prüft danach
automatisch, ob nach dem Ausschlussverfahren genau eine Person übrig bleibt,
ob jede Laboraufgabe eine richtige Antwort hat und ob sich Spuren auf dem
Handy überlappen würden.

## Lizenz / Nutzung

Privates Familienprojekt. Alle Personen, Orte und Fälle sind erfunden.
