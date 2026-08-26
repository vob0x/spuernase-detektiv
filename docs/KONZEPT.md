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

## Technische Entscheide

- **Kein Framework, kein Build-Schritt.** Vanilla ES-Module. Wer das Spiel in
  fünf Jahren öffnet, braucht kein npm install.
- **Grafik: Inline-SVG, prozedural zusammengesetzt.** Keine Bilddateien.
  Begründung: scharf auf jedem Display, ~2 KB statt ~400 KB pro Szene,
  Hotspots liegen im selben Koordinatensystem wie die Grafik.
- **Ton: WebAudio-Synthese.** Keine Audiodateien. Gleiche Begründung.
  Ton startet erst nach der ersten Nutzergeste (Autoplay-Politik).
- **Offline:** Service Worker mit vollständigem Precache. Nach dem ersten
  Laden funktioniert das Spiel im Flugmodus.
