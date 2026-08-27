# Spürnase — Detektivbüro Bärenmoos

**Zielgruppe:** Kinder ab 8 Jahren (Schweiz, 2.–4. Klasse)
**Plattform:** Progressive Web App, **Querformat**, mobile-first, vollständig offline
**Sprache:** Standarddeutsch, kurze Sätze, Schweizer Rechtschreibung (ss statt ß)
**Vertonung:** jede Zeile ist gesprochen — 135 Aufnahmen, keine Gerätestimme

## Leitidee

Das Kind arbeitet im Detektivbüro der fiktiven Kleinstadt **Bärenmoos** und löst
fünf Fälle. Kein Zeitdruck, keine Gewalt, keine Verlierer-Bildschirme. Wer falsch
tippt, bekommt einen Hinweis und darf weiterarbeiten.

Drei Regeln bestimmen jede Gestaltungsentscheidung:

1. **Zeigen statt beschreiben.** Was ein Bild oder eine Bewegung sagen kann,
   steht nicht als Text da.
2. **Hören statt lesen.** Jede Zeile wird vorgelesen; der Text daneben ist die
   Absicherung, nicht der Hauptkanal.
3. **Kein Fall spielt sich wie der vorherige.** Die Phasen sind pro Fall
   unterschiedlich zusammengestellt.

## Die Bühne

Das Spiel läuft auf einer **festen Bühne von 1000 × 480 Punkten**, die als
Ganzes auf den Bildschirm skaliert wird (`transform: scale`). Damit sitzt jedes
Element auf jedem Gerät an derselben Stelle — kein Umbruch, keine
Sonderfälle für kleine Bildschirme.

Im Hochformat erscheint eine Sperre mit der Aufforderung, das Gerät zu drehen.
Eine Zwangsdrehung wäre technisch nicht verlässlich: `screen.orientation.lock()`
gibt es auf iOS-Safari nicht.

## Phasen und ihre Zusammensetzung

Es gibt sieben Phasenarten. Jeder Fall setzt sich aus einer eigenen Auswahl
zusammen — das ist der Hebel gegen den Eindruck, alle Fälle seien gleich:

| Fall | Phasen | Anzahl |
|---|---|---|
| 1 Der Znüni-Kuchen | Tatort → Labor → Gegenüberstellung → Verhaftung | 4 |
| 2 Das gestohlene Velo | Tatort → Labor → **Verfolgung** → Gegenüberstellung → Verhaftung | 5 |
| 3 Farbe am Gemeindehaus | Tatort → **Zeitstrahl** → **Zeugen** → Gegenüberstellung → Verhaftung | 5 |
| 4 Das goldene Murmeltier | Tatort (**Taschenlampe**) → Labor → Zeugen → Gegenüberstellung → Verhaftung | 5 |
| 5 Wo ist Rösti? | Tatort → Verfolgung → Labor → Zeugen → Gegenüberstellung → Verhaftung | 6 |

Fall 1 ist bewusst kurz: vier Phasen, keine Zeugen, ein einziger Beweis in der
Gegenüberstellung. Er ist das Tutorial und soll in wenigen Minuten durch sein.

| Phase | Mechanik | Trainiert |
|---|---|---|
| Tatort | Lupe (oder Taschenlampe) über die Szene ziehen, Spuren aufdecken | Gerichtete Aufmerksamkeit, systematisches Absuchen |
| Spurenlabor | Muster vergleichen, messen, umrechnen | Genaues Vergleichen, Grössen und Masse |
| Verfolgung | An jeder Weggabelung die richtige Fährte wählen | Merkmale wiedererkennen, Entscheidungen begründen |
| Zeitstrahl | Balken im Tatzeitfenster prüfen, Alibis ausschliessen | Zeitverständnis, Uhrzeiten lesen |
| Zeugen | Aussagen anhören, den Widerspruch zum Fakt finden | Zuhören, Quellenkritik |
| Gegenüberstellung | Beweis für Beweis Verdächtige ausschliessen | Logisches Ausschlussverfahren |
| Verhaftung | Die übrig gebliebene Person benennen | Schlussfolgern |

Dazu **Wusstest-du-Karten** mit Schweizer Sachwissen: Notruf 117,
Kantonspolizei vs. Stadtpolizei, Velo-Codierung, Fundbüro, Spurensicherung.

## Bewegung

Kein Bildschirm erscheint einfach. Was animiert ist und warum:

- **Fall-Intro:** Kameraauslöser → das Tatortfoto fällt auf den Tisch → der
  Aktenstempel knallt darauf → Wachtmeister Brünnli spricht → die Fakten ticken
  einzeln herein. Erst danach erscheint der Knopf zum Tatort.
- **Tatort:** Wetterpartikel (Regen im Schulhaus, Staub im Museum), der
  Marker pulsiert, wenn die Lupe nahe ist, und **fliegt beim Fund in das
  Beweisregal** am rechten Rand.
- **Sprechzeile:** blendet nach dem Vorlesen aus, damit sie keine Spur verdeckt,
  und ist grundsätzlich klickdurchlässig — nur der Hörknopf reagiert.
- **Gegenüberstellung:** Wer ausscheidet, sackt ab, wird grau und bekommt einen
  «Raus»-Stempel quer über das Bild.
- **Verhaftung:** Blaulicht flutet den Raum, Zweiklanghorn.
- **Ergebnis:** Sterne fliegen einzeln herein, der Täterstempel knallt auf das
  Passfoto, die drei Auflösungszeilen erscheinen im Takt des Vorlesens.

## Bildsprache

Leitbild: **Akten auf einer Schreibtischplatte.** Der Hintergrund ist dunkles
Holz mit Lampenlicht von oben, darauf liegen helle Papierflächen.

- Tatorte sind **Fotos**, in die Mappe geklebt
- Laborproben sind **Beweismittelkarten** auf Karton
- Verdächtige sind **Passfotos** an einer Messwand
- Spuren am Tatort sind **nummerierte Sucherrahmen** wie bei der Spurensicherung

Farben: Papier (#f5efe1) und Tinte (#23272f) als Grundpaar, Messing für Aktionen,
Polizeiblau für Fakten, Rot für Stempel und Widersprüche.

## Grafik: was gezeichnet und was generiert ist

| Element | Herkunft | Warum |
|---|---|---|
| Tatorte, Titelbild | KI-Illustration, WebP ~75 KB | Atmosphäre, die Vektorgrafik nicht liefert |
| 28 Figurenporträts | KI-Illustration, WebP ~10 KB | Wiedererkennbare Personen |
| Fingerabdrücke, Sohlen, Reifen, Fasern, Handschrift, Uhr, Lineal, Tierfährten | prozedurales SVG | Probe und richtige Antwort **müssen** identisch sein – das kann eine Bildgenerierung nicht zusichern |
| Icons, Marker, Stempel | prozedurales SVG | beliebig einfärbbar, gestochen scharf |

Die Fingerabdrücke folgen einem Strömungsfeld und bilden damit die echten
Grundmuster ab: Bogen, Schleife, Wirbel, Doppelschleife. Die Uhr ist der
Schweizer Bahnhofsuhr nachempfunden. Die Tierfährten unterscheiden sich in
Grösse, Zehenzahl, Krallen und Schrittweite — nicht bloss im Massstab.

## Ton

### Sprache

135 Aufnahmen, erzeugt mit **Piper** (neuronales TTS, lokal) aus zwei deutschen
Modellen:

- **Wachtmeister Brünnli und alle Erklärtexte:** `de_DE-thorsten-high`
- **26 Figuren:** `de_DE-mls-medium`, zehn verschiedene Sprecher-Kennungen,
  jede Figur zusätzlich in Tonhöhe (0,97–1,16) und Tempo (0,95–1,04) verstellt.
  Kinder klingen dadurch hörbar jünger als Erwachsene.

Nachbearbeitung mit ffmpeg: Hochpass bei 70 Hz, Lautheitsangleich auf −16 LUFS,
dann **MP3, 48 kbit/s, mono, 24 kHz**. Gesamt rund 2,2 MB.

MP3 und nicht AAC: AAC fehlt in quelloffenen Chromium-Bauten und lässt sich
darum in der Testumgebung nicht prüfen. MP3 spielt jedes Zielgerät ab.

Während gesprochen wird, senkt `ducken()` Kulisse und Musik ab.
Das Vorlesen ist abschaltbar; der Text bleibt dann sichtbar stehen.

### Effekte und Kulisse

Vollständig synthetisiert über die WebAudio-API. Drei Busse (Musik, Kulisse,
Effekte) laufen über einen gemeinsamen Hall (prozedural erzeugte Impulsantwort)
und einen Kompressor.

- **Fünf ortsbezogene Klangkulissen:** Regen am Klassenfenster, Bahnhof mit
  Zugdurchfahrt und Perrongong, Dorfplatz mit Vögeln, Brunnen und Kirchenglocke,
  Museum bei Nacht mit Uhrticken und Knarren, Waldrand mit Wind, Vögeln und Grillen.
  Jede Kulisse besteht aus Rauschteppichen plus zufällig eingestreuten Ereignissen –
  dadurch wiederholt sie sich nie hörbar.
- **Titelmusik:** leichtes Detektiv-Thema mit gehender Bassfigur, Besen auf 2 und 4
  und einer Vibraphon-Melodie. Standardmässig **aus**, per Schalter einschaltbar.
- **19 Effekte**, vom Kameraauslöser über Aktenschublade und Schritte bis zum
  Zweiklanghorn.

Ton startet erst nach der ersten Berührung (Autoplay-Politik der Browser).

## Fortschritt

Rangaufstieg: Anwärter:in → Spürnase → Wachtmeister:in → Inspektor:in →
Chefinspektor:in. Pro Fall 1–3 Sterne, abhängig von Fehlversuchen.
Fortschritt in `localStorage`, kein Konto, keine Datenübertragung.

## Technische Entscheide

- **Kein Framework, kein Build-Schritt.** Vanilla ES-Module. Wer das Spiel in
  fünf Jahren öffnet, braucht kein npm install.
- **Feste Bühne statt Media Queries.** Ein Layout, das überall gleich sitzt.
- **Offline:** Service Worker. Programm und Bilder werden bei der Installation
  geladen, die 135 Sprachdateien danach im Hintergrund in Achterwellen — so
  hängt die Installation nicht an 2,2 MB Audio.
