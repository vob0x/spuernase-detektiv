# Testbericht

Vier Prüfläufe: zwei im Browser über Playwright (Spiel und Ton), zwei in Python
für die Sprache. Bühne 1000 × 480 (Querformat), `deviceScaleFactor: 2`.

## 1. Spiel — `node tools/test.js`

### Datenprüfung je Fall (ohne Browser-Interaktion)

- Jede Phase in `phasen` ist bekannt und hat auch Daten
  (kein `labor` ohne Aufgaben, kein `zeugen` ohne Zeugen)
- Nach Zeitstrahl **und** Gegenüberstellung bleibt genau eine Person übrig —
  und das ist der in `taeter` genannte
- Jede Laboraufgabe hat eine als richtig markierte Option
- Genau eine Zeugenlüge pro Fall, mit Begründung
- Keine Spur liegt am Bildrand, keine zwei Spuren näher als 84 Punkte

### Vollständiger Durchlauf aller fünf Fälle

Jeder Fall startet aus einem frisch gesetzten Fortschritt — so färbt kein
Fehler aus dem vorherigen Fall auf den nächsten ab. Der Testlauf zieht die
Lupe wirklich über die Szene (Zeigerbewegung, Halten), löst jede Phase in
ihrer eigenen Mechanik und prüft am Ende die Sterne.

Zusätzlich wird jedes `new Audio(...)` mitgeschrieben: welche Aufnahme
angefordert wurde, welche bis zum Ende lief und welche einen Fehler warf.
Ein Codec-Ausfall wäre damit nicht mehr unsichtbar.

### PWA

Service Worker registriert und aktiv, Manifest mit drei Icons,
`display: standalone`, `orientation: landscape`, und ein Neuladen im
Flugmodus, das den Titelbildschirm zeigt.

### Letzter Lauf

```
Fälle geladen: 5
  ✓ f1 Fallakte in Ordnung
  ✓ f2 Fallakte in Ordnung
  ✓ f3 Fallakte in Ordnung
  ✓ f4 Fallakte in Ordnung
  ✓ f5 Fallakte in Ordnung
Fall 1 "Der Znüni-Kuchen": 4 Phasen [tatort → labor → lineup → verhaftung], 3/3 Sterne, 16.1s, sauber
Fall 2 "Das gestohlene Velo": 5 Phasen [tatort → labor → verfolgung → lineup → verhaftung], 3/3 Sterne, 27.6s, sauber
Fall 3 "Farbe am Gemeindehaus": 5 Phasen [tatort → zeitstrahl → zeugen → lineup → verhaftung], 3/3 Sterne, 24.9s, sauber
Fall 4 "Das goldene Murmeltier": 5 Phasen [tatort → labor → zeugen → lineup → verhaftung], 3/3 Sterne, 40.8s, sauber
Fall 5 "Wo ist Rösti?": 6 Phasen [tatort → verfolgung → labor → zeugen → lineup → verhaftung], 3/3 Sterne, 35.7s, sauber
Sprachaufnahmen angefordert: 86 verschiedene, 29 davon bis zum Ende gespielt
Insgesamt vorhanden: 135 Aufnahmen
PWA: Service Worker registriert und aktiv, 3 Icons, display "standalone", orientation "landscape"
Offline-Neuladen: 200 · Titel "Spürnase – Detektivbüro Bärenmoos"

Keine Probleme. Alle fünf Fälle fehlerfrei durchgespielt.
```

Dass nur 29 von 86 Aufnahmen bis zum Ende laufen, ist kein Mangel: der
Testlauf tippt schneller als ein Kind und schneidet die Zeilen ab. Gemeldet
würde ein echter Abspielfehler oder wenn fast nichts mehr durchliefe.

## 2. Ton — `node tools/audiotest.js`

Chromium mit `--autoplay-policy=no-user-gesture-required`. Hinter dem
Kompressor hängt ein Analyser; gemessen wird der Spitzenpegel während der
Wiedergabe. Geprüft werden alle 19 Effekte, alle sechs Klangkulissen, die
Titelmusik und dass der Stummschalter wirklich stumm schaltet.

Dazu die **Pegelschwankung jeder Kulisse**: gemessen wird, wie stark der
Kurzzeitpegel über sechs Sekunden schwankt. Ein Rauschteppich liegt bei 0,02,
eine Umgebung aus Ereignissen deutlich höher. Fällt ein Wert unter 0,12,
schlägt der Test an — dann wäre die Kulisse wieder ein Zischen.

```
  ✓ schule    0.24    ✓ bahnhof   0.18    ✓ dorfplatz 0.15
  ✓ museum    0.17    ✓ wald      0.33    ✓ buero     0.17
```

Für die Sprache zusätzlich: **alle 135 Dateien** werden abgerufen und auf
Erreichbarkeit und Mindestgrösse geprüft, eine wird wirklich abgespielt
(läuft die Wiedergabezeit?) und drei Stichproben werden auf plausible Länge
kontrolliert.

### Letzter Lauf

```
  Effekte
  ✓ tap 0.0102   ✓ page 0.0115   ✓ lupe 0.0024   ✓ found 0.0727
  ✓ right 0.0692 ✓ wrong 0.0250  ✓ stempel 0.0504 ✓ sirene 0.0162
  ✓ bark 0.0206  ✓ win 0.0967    ✓ rang 0.0837   ✓ ausloeser 0.0226
  ✓ akte 0.0336  ✓ zuschlag 0.0601 ✓ whoosh 0.0048 ✓ tick 0.0010
  ✓ treffer 0.0639 ✓ aufdecken 0.0380 ✓ schritt 0.0029
  Klangkulissen
  ✓ schule 0.0160 ✓ bahnhof 0.0070 ✓ dorfplatz 0.0097
  ✓ museum 0.0063 ✓ wald 0.0121   ✓ buero 0.0045
  Musik
  ✓ Titelmusik 0.0217
  Sprachaufnahmen
  ✓ 135 Aufnahmen          2238 KB, 0 fehlend/leer
  ✓ Abspielen laeuft       0.76 s in 0,8 s
  ✓ f1-auf0                2.86 s
  ✓ f4-lin1-w              2.25 s
  ✓ g-zeuge                2.36 s
  Ton aus
  ✓ Ton aus schaltet stumm   Spitzenpegel 0.00000

✓ Audio vollständig
```


## 3. Aussprache — `python3 tools/aussprachetest.py`

Lautet alle 135 Zeilen ein und prüft drei Dinge:

- **Greift jeder Wörterbucheintrag?** Tote Einträge werden als solche gemeldet.
- **Ist die falsche Lautfolge danach verschwunden?** Jeder Eintrag wird gezählt,
  vorher und nachher.
- **Kennt jede Stimme jeden Laut, den wir erzeugen?** Diese Prüfung fand den
  Fehler, bei dem aus «ich» ein «ick» wurde.

```
  ✓  tsˈɛtnˈyːniː           -> tsnˈyːni             3x ersetzt
  ✓  ɡuːˈɛtsliː             -> ɡˈuːtsli             2x ersetzt
  ✓  rˈœstiː                -> rˈøːsti              6x ersetzt
  ...
Buchstabierte Wortanfänge:
  vorher 2 Wörter betroffen (Znüni, Znüni-Kuchen), jetzt 0
Lautbestand der Stimmen:
  ✓ de_DE-thorsten-high: alle Laute vorhanden
  ✓ de_DE-thorsten_emotional-medium: alle Laute vorhanden
✓ Aussprachewörterbuch greift vollständig
```

## 4. Hörprobe — `python3 tools/hoerprobe.py`

Ein Spracherkenner hört jede Aufnahme ab und vergleicht sie mit dem Text.
Zahlen werden vorher vereinheitlicht, damit «24 cm» und «vierundzwanzig
Zentimeter» als gleich gelten.

| | vorher | nachher |
|---|---|---|
| alle Aufnahmen sauber verstanden | 93 von 135 | 102 von 135 |
| **Figurenzeilen** | **5 von 27** | **21 von 27** |
| Erzählerzeilen | 88 von 108 | 81 von 108 |

Der Erzähler blieb unverändert (`thorsten-high`, keine Bearbeitung); die
Schwankung dort ist der Erkenner, nicht die Sprache. Eine Gegenprobe mit einem
grösseren Modell hat 14 der 27 auffälligen Erzählerzeilen als sauber bestätigt.
Was übrig bleibt, sind Namen und Fremdwörter, die der Erkenner nicht kennt:
Rüegg, Beeler, Egli, Znüni, Guetzli, Mountainbike.

Das Werkzeug ist ein **Diagnose-Instrument, kein Qualitätsurteil**. Es findet
grobe Fehler zuverlässig — buchstabierte Wörter, unverständliche Stimmen — und
sagt nichts darüber, ob eine Stimme angenehm klingt.

## Was die Tests in dieser Runde gefunden haben

| Fund | Ursache | Behoben |
|---|---|---|
| «Znüni» wurde «Zett-Nüni» | espeak kann /tsn/ am Wortanfang nicht bilden und liest das Z als Buchstabennamen | Korrektur direkt in der Lautschrift |
| 81 % der Figurenzeilen unverständlich | Stimmenmodell `mls-medium` | ersetzt durch `thorsten_emotional`, Auswahl gemessen |
| Stimmen klangen gepresst | `asetrate` verschiebt die Formanten mit | `rubberband` mit erhaltenen Formanten, keine Tempoänderung mehr |
| «ich» klang wie «ick» | espeak liefert das ch als Kombinationszeichen, das kleine Stimmen nicht kennen | Lautschrift wird zusammengesetzt (NFC), Test prüft den Lautbestand |
| Kulissen rauschten | Rauschen durch breiten Bandpass, Pegelschwankung 0,02 | Klangbetten aus Einzelereignissen, Schwankung 0,15–0,33 |
| Eine Spur in Fall 2 nicht auffindbar | Marker lag hinter der Sprechzeile, die als Geschwisterelement die Zeigerereignisse schluckte | Sprechzeile klickdurchlässig, blendet am Tatort nach dem Vorlesen aus |
| Phase «Zeugen» wurde übersprungen | Labor und Gegenüberstellung schalteten über Sprachende **und** Notfall-Timer weiter | `einmal()`: höchstens ein Wechsel, und nur solange der Bildschirm steht |
| Tierfährten unsichtbar | SVG ohne `width`-Attribut, dazu `width: auto` | Container gibt die Breite vor |
| Manifest stand auf `orientation: portrait` | Rest aus der Hochformat-Fassung | auf `landscape` gesetzt |
| Sprache liess sich nicht prüfen | AAC fehlt im quelloffenen Chromium | alles neu als MP3 |
| Vier Bildschirme mit dunkler Schrift auf dunklem Holz | `kopf--dunkel` fälschlich gesetzt | auf hell umgestellt |

## Was die Tests **nicht** abdecken

- **Echte Geräte.** Getestet wird headless Chromium unter Linux. iOS-Safari
  verhält sich beim Autoplay und bei der Bildschirmdrehung anders.
- **Wie es klingt.** Die Audiotests messen Pegel und Dateilänge, nicht
  Klangqualität. Ob die synthetischen Stimmen für ein Kind angenehm sind,
  entscheidet nur Zuhören.
- **Ob die Rätsel für Achtjährige lösbar sind.** Das zeigt erst ein Kind.
