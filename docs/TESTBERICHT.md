# Testbericht

Zwei automatisierte Suiten, beide über Playwright mit echtem Chromium.

## 1. Spiel — `node tools/test.js`

Profil "iPhone 13", 390x844, Touch, Locale de-CH.

**Datenkonsistenz je Fall**
- Nach allen Ausschlussschritten bleibt genau eine Person übrig, und das ist der Täter
- Jede Laboraufgabe hat eine als richtig markierte Option
- Genau ein Zeugenwiderspruch pro Fall, mit Begründung
- Jede Spur liegt vollständig in der Szene (390x260 px, Marker 72 px)
- Keine zwei Spuren liegen näher als 78 px beieinander

**Vollständiger Durchlauf aller fünf Fälle**
Tatort absuchen, Laboraufgaben lösen, Widerspruch finden, ausschliessen,
verhaften, Sterne und Rang prüfen.

**PWA und Darstellung**
Service Worker aktiv, Manifest mit drei Icons, Offline-Reload, keine
Konsolenfehler, kein horizontales Scrollen.

### Letzter Lauf
```
✓ f1 Der verschwundene Znüni-Kuchen
  ✓ f2 Das gestohlene Velo
  ✓ f3 Farbe am Gemeindehaus
  ✓ f4 Das goldene Murmeltier
  ✓ f5 Wo ist Rösti?
  ▶ f1: durchgespielt in 12.2s – 3★, Fehler 0, Rang Spürnase
  ▶ f2: durchgespielt in 13.8s – 3★, Fehler 0, Rang Wachtmeister:in
  ▶ f3: durchgespielt in 14.2s – 3★, Fehler 0, Rang Inspektor:in
  ▶ f4: durchgespielt in 15.2s – 3★, Fehler 0, Rang Inspektor:in
  ▶ f5: durchgespielt in 17.0s – 3★, Fehler 0, Rang Chefinspektor:in
  PWA: {"sw":true,"aktiv":true,"manifest":true,"icons":3,"display":"standalone","start":"./"}
  Offline-Reload: 200 | Titel: Spürnase

✓ Alle Prüfungen bestanden
```

## 2. Ton — `node tools/audiotest.js`

Chromium mit `--autoplay-policy=no-user-gesture-required`. Hinter dem Kompressor
hängt ein Analyser; gemessen wird der Spitzenpegel während der Wiedergabe.
Geprüft werden alle elf Effekte, alle sechs Klangkulissen, die Titelmusik und
dass der Stummschalter wirklich stumm schaltet.

### Letzter Lauf
```
Effekte
  ✓ tap                    Spitzenpegel 0.0076
  ✓ page                   Spitzenpegel 0.0108
  ✓ lupe                   Spitzenpegel 0.0024
  ✓ found                  Spitzenpegel 0.0726
  ✓ right                  Spitzenpegel 0.0688
  ✓ wrong                  Spitzenpegel 0.0251
  ✓ stempel                Spitzenpegel 0.0503
  ✓ sirene                 Spitzenpegel 0.0165
  ✓ bark                   Spitzenpegel 0.0207
  ✓ win                    Spitzenpegel 0.0972
  ✓ rang                   Spitzenpegel 0.0836
  Klangkulissen
  ✓ schule                 Spitzenpegel 0.0157
  ✓ bahnhof                Spitzenpegel 0.0069
  ✓ dorfplatz              Spitzenpegel 0.0095
  ✓ museum                 Spitzenpegel 0.0059
  ✓ wald                   Spitzenpegel 0.0122
  ✓ buero                  Spitzenpegel 0.0045
  Musik
  ✓ Titelmusik             Spitzenpegel 0.0209
  Ton aus
  ✓ Ton aus schaltet stumm   Spitzenpegel 0.00000

✓ Audio vollständig
```

## Prüfung der veröffentlichten Version

Der Ausgangs-Proxy dieser Umgebung lässt Browser-Verkehr zu github.io nicht
durch, wohl aber curl. Deshalb: jede Datei einzeln über HTTPS abrufen, byteweise
mit dem lokalen Stand vergleichen, die heruntergeladenen Dateien unter demselben
Unterpfad lokal ausliefern und die Testsuite darauf laufen lassen. Zusätzlich im
Chrome auf dem Mac öffnen.

## Manuell zu prüfen (nicht automatisierbar)

- Echtes Wischen mit dem Finger auf einem Telefon
- Wie die Klangkulissen auf Handy-Lautsprechern wirken (der Test misst nur, dass
  ein Signal da ist, nicht ob es angenehm klingt)
- Installation über "Zum Home-Bildschirm" auf iOS und Android
