# Testbericht

Automatisiert über `node tools/test.js` (Playwright, Chromium, Profil
"iPhone 13", 390x844, Touch, Locale de-CH).

## Was geprüft wird

**Datenkonsistenz je Fall**
- Nach allen Ausschlussschritten bleibt genau eine Person übrig
- Diese Person ist der hinterlegte Täter
- Jede Laboraufgabe hat eine Option, die als richtig markiert ist
- Genau ein Zeugenwiderspruch pro Fall, und dieser hat eine Begründung
- Jede Spur liegt vollständig innerhalb der Szene (390x260 px, Marker 64 px)
- Keine zwei Spuren liegen näher als 68 px beieinander

**Vollständiger Spieldurchlauf, alle fünf Fälle**
- Tatort: Zeiger über jede Spur führen, Aufnahme prüfen
- Labor: alle Aufgaben richtig lösen
- Zeugen: den Widerspruch antippen
- Ausschluss: alle Schritte durchlaufen
- Verhaftung: Täter benennen
- Ergebnis: 3 Sterne bei null Fehlern, Rangaufstieg

**PWA**
- Service Worker registriert und aktiv
- Manifest ladbar, drei Icons, display standalone, start_url relativ
- Reload im Offline-Modus liefert das Spiel aus dem Cache

**Darstellung**
- Keine Konsolenfehler, keine fehlgeschlagenen Anfragen
- Kein horizontales Scrollen

## Letzter Lauf
```
  ✓ f1 Der verschwundene Znüni-Kuchen
  ✓ f2 Das gestohlene Velo
  ✓ f3 Farbe am Gemeindehaus
  ✓ f4 Das goldene Murmeltier
  ✓ f5 Wo ist Rösti?
  ▶ f1: durchgespielt in 12.6s – 3★, Fehler 0, Rang Spürnase
  ▶ f2: durchgespielt in 13.3s – 3★, Fehler 0, Rang Wachtmeister:in
  ▶ f3: durchgespielt in 14.2s – 3★, Fehler 0, Rang Inspektor:in
  ▶ f4: durchgespielt in 15.0s – 3★, Fehler 0, Rang Inspektor:in
  ▶ f5: durchgespielt in 15.5s – 3★, Fehler 0, Rang Chefinspektor:in
  PWA: {"sw":true,"aktiv":true,"manifest":true,"icons":3,"display":"standalone","start":"./"}
  Offline-Reload: 200 | Titel: Spürnase

✓ Alle Prüfungen bestanden
```

## Manuell zu prüfen (nicht automatisierbar)

- Echtes Wischen mit dem Finger auf einem Telefon (der Test bewegt einen Zeiger)
- `backdrop-filter` der Lupe: in Headless-Chromium ohne Wirkung, auf echten
  Geräten sichtbar
- Ton: WebAudio startet erst nach der ersten Berührung
- Installation über "Zum Home-Bildschirm" auf iOS und Android
