# Spürnase — Detektivbüro Bärenmoos

**Zielgruppe:** Kinder ab 8 Jahren (Schweiz, 2.–4. Klasse)
**Plattform:** Progressive Web App, mobile-first, vollständig offline
**Sprache:** Standarddeutsch, kurze Sätze, Schweizer Rechtschreibung (ss statt ß)

## Leitidee

Das Kind arbeitet im Detektivbüro der fiktiven Kleinstadt **Bärenmoos** und löst
fünf Fälle. Kein Zeitdruck, keine Gewalt, keine Verlierer-Bildschirme. Wer falsch
tippt, bekommt einen Hinweis und darf weiterarbeiten.

## Warum das lehrreich ist (und nicht nur Klicken)

Jede Phase trainiert eine benannte Fähigkeit:

| Phase | Mechanik | Trainiert |
|---|---|---|
| 1 Tatort | Lupe über die Szene ziehen, Spuren finden | Gerichtete Aufmerksamkeit, systematisches Absuchen |
| 2 Spurenlabor | Muster vergleichen, messen, umrechnen | Genaues Vergleichen, Grössen/Masse, Zahlenraum bis 100 |
| 3 Zeugen | Aussagen lesen, Widerspruch zu gesichertem Fakt finden | Leseverständnis, Quellenkritik |
| 4 Ausschluss | Beweis für Beweis Verdächtige eliminieren | Logisches Ausschlussverfahren, "wenn ... dann nicht ..." |
| 5 Auflösung | Täter benennen, Begründung lesen | Schlussfolgern, Begründen |

Dazu **Wusstest-du-Karten** mit Schweizer Sachwissen: Notruf 117,
Kantonspolizei vs. Stadtpolizei, Velo-Codierung, Fundbüro, Spurensicherung.

## Fortschritt

Rangaufstieg: Anwärter:in -> Spürnase -> Wachtmeister:in -> Inspektor:in ->
Chefinspektor:in. Pro Fall 1-3 Sterne, abhängig von Fehlversuchen.
Fortschritt in `localStorage`, kein Konto, keine Datenübertragung.

## Fälle

1. **Der verschwundene Znüni-Kuchen** — Tutorial, Schulhaus
2. **Das gestohlene Velo** — Bahnhof, Schuhgrösse + Reifenspur
3. **Farbe am Gemeindehaus** — Uhrzeiten und Alibis
4. **Das goldene Murmeltier** — Museum, 4 Verdächtige, Logikraster
5. **Wo ist Rösti?** — Finale, alles kombiniert, versöhnliches Ende

## Bildsprache

Leitbild: **Akten auf einer Schreibtischplatte.** Der Hintergrund ist dunkles
Holz mit Lampenlicht von oben, darauf liegen helle Papierflächen mit
Aktenreitern. Alles Inhaltliche wirkt wie Material aus einer echten Fallakte:

- Tatorte sind **Fotos mit Fotoecken**, in die Mappe geklebt
- Laborproben sind **Beweismittelkarten** auf Karton, mit Beschriftungsstreifen
- Verdächtige sind **Passfotos**; wer ausscheidet, bekommt einen roten
  Stempel «Ausgeschlossen» quer über das Bild
- Spuren am Tatort sind **nummerierte Sucherrahmen** wie bei der Spurensicherung
- Zeugenaussagen stehen auf Notizzetteln mit blauer Kante

Farben: Papier (#f5efe1) und Tinte (#262b34) als Grundpaar, Messing für Aktionen,
Polizeiblau für Fakten, Rot für Stempel und Widersprüche.

## Grafik: was gezeichnet und was generiert ist

| Element | Herkunft | Warum |
|---|---|---|
| Tatorte, Titelbild | KI-Illustration, WebP ~75 KB | Atmosphäre, die Vektorgrafik nicht liefert |
| 28 Figurenporträts | KI-Illustration, WebP ~10 KB | Wiedererkennbare Personen |
| Fingerabdrücke, Sohlen, Reifen, Fasern, Handschrift, Uhr, Lineal | prozedurales SVG | Probe und richtige Antwort **müssen** identisch sein – das kann eine Bildgenerierung nicht zusichern |
| Icons, Marker, Stempel | prozedurales SVG | beliebig einfärbbar, gestochen scharf |

Die Fingerabdrücke folgen einem Strömungsfeld und bilden damit die echten
Grundmuster ab: Bogen, Schleife, Wirbel, Doppelschleife. Die Uhr ist der
Schweizer Bahnhofsuhr nachempfunden.

## Ton

Vollständig synthetisiert über die WebAudio-API, keine einzige Audiodatei.
Drei Busse (Musik, Kulisse, Effekte) laufen über einen gemeinsamen Hall
(prozedural erzeugte Impulsantwort) und einen Kompressor.

- **Fünf ortsbezogene Klangkulissen:** Regen am Klassenfenster, Bahnhof mit
  Zugdurchfahrt und Perrongong, Dorfplatz mit Vögeln, Brunnen und Kirchenglocke,
  Museum bei Nacht mit Uhrticken und Knarren, Waldrand mit Wind, Vögeln und Grillen.
  Jede Kulisse besteht aus Rauschteppichen plus zufällig eingestreuten Ereignissen –
  dadurch wiederholt sie sich nie hörbar.
- **Titelmusik:** leichtes Detektiv-Thema mit gehender Bassfigur, Besen auf 2 und 4
  und einer Vibraphon-Melodie. Standardmässig **aus**, per Schalter einschaltbar.
- **Elf Effekte**, vom Papierrascheln bis zum Zweiklanghorn.

Ton startet erst nach der ersten Berührung (Autoplay-Politik der Browser).

## Technische Entscheide

- **Kein Framework, kein Build-Schritt.** Vanilla ES-Module. Wer das Spiel in
  fünf Jahren öffnet, braucht kein npm install.
- **Offline:** Service Worker mit vollständigem Precache. Nach dem ersten
  Laden funktioniert das Spiel im Flugmodus.
