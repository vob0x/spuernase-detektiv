# Testbericht

Fünf Prüfläufe: zwei im Browser über Playwright (Spiel und Ton), drei in Python
für die Sprache – Regie, Verständlichkeit und Lebendigkeit. Bühne 1000 × 480
(Querformat), `deviceScaleFactor: 2`.

Stand: Runde 6, Vertonung über Gemini 3.1 Flash TTS.

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


## 3. Regie — `python3 tools/regietest.py`

Läuft **vor** der Vertonung, damit nicht 135 Modellaufrufe an einem Fehler
scheitern, den man vorher sehen kann. Vier Prüfungen:

- **Greift jede Schreibregel?** Eine Regel, die auf keiner Zeile mehr zutrifft,
  ist toter Code und wird gemeldet.
- **Steht ein Regiewort auch im Spieltext?** Dann meldete die Hörprobe in
  `voice.py` einen Fehlalarm und wiederholte eine tadellose Zeile viermal.
  («Detektivbüro» und «Zeuge» stehen deshalb bewusst nicht auf der Liste.)
- **Hat jeder Zeuge genau eine Anweisung für alle seine Aussagen?** Das ist die
  einzige Prüfung hier, deren Ausfall nicht den Klang, sondern das **Rätsel**
  kaputtmacht: unterschiedliche Anweisungen verraten die Lüge am Tonfall.
- **Ist jede sprechende Rolle besetzt?**

```
✓ «Zickzack-Sohle» → «Zick-Zack-Sohle»  (1×: f1-lab0-e)
✓ 25 Regiewörter, keines im Spieltext
✓ 9 Zeugen, je eine einzige Anweisung für alle Aussagen
✓ 10 sprechende Rollen, alle besetzt
    beeler         3 Zeilen  →  Callirrhoe
    erzaehler    108 Zeilen  →  Iapetus
    frei           3 Zeilen  →  Rasalgethi
    huebscher      3 Zeilen  →  Vindemiatrix
    kevin          3 Zeilen  →  Fenrir
    kunz           3 Zeilen  →  Alnilam
    luis           3 Zeilen  →  Leda
    odermatt       3 Zeilen  →  Gacrux
    rueegg         3 Zeilen  →  Kore
    sutter         3 Zeilen  →  Algenib

✓ Regie in Ordnung
```

## 4. Hörprobe — `python3 tools/hoerprobe.py`

Ein Spracherkenner hört jede Aufnahme ab und vergleicht sie mit dem Text.
Zahlen werden vorher vereinheitlicht, damit «24 cm» und «vierundzwanzig
Zentimeter» als gleich gelten.

| | Piper (Runde 5) | Gemini (Runde 6) |
|---|---|---|
| alle Aufnahmen sauber verstanden | 99 von 135 | **132 von 135** |

Die drei verbliebenen Auffälligkeiten sind samt und sonders Tokenisierung des
Erkenners, keine Aussprachefehler:

```
  f1-lab0-e   Text: Zickzack-Sohle.              Gehört: Zick zack Sohle.
  f2-verf-f   Text: Folge der Mountainbike-Spur! Gehört: Folge der Mountain-Bike-Spur
  f5-z1-a2    Text: ... ich bin weitergelaufen.  Gehört: ... ich bin weiter gelaufen.
```

Beim Wechsel auf Gemini kam eine zweite Verwendung dazu: `voice.py` hört
**jede frische Aufnahme sofort ab**, noch bevor sie liegen bleibt. Das Modell
spricht gelegentlich die Regieanweisung mit («Neugierig fragend? Wer hat andere
Schuhe?») — ein Fehler, den kein Blick auf die Datei findet. Bis zu vier
Anläufe, behalten wird der beste.

Das Werkzeug ist ein **Diagnose-Instrument, kein Qualitätsurteil**. Es findet
grobe Fehler zuverlässig — buchstabierte Wörter, unverständliche Stimmen — und
sagt nichts darüber, ob eine Stimme angenehm klingt.


## 5. Lebendigkeit — `python3 tools/lebendigkeit.py`

Die Hörprobe misst nur, ob man es versteht. Wer allein darauf optimiert, landet
bei einer flachen Stimme – die ist am leichtesten zu erkennen. Dieses Werkzeug
misst das Gegenstück, über eine Tonhöhenanalyse (Praat):

- **Tonumfang** – Schwankung der Sprechmelodie in Halbtönen. Nüchternes
  Vorlesen liegt bei 2 bis 3, lebendiges Erzählen bei 4 bis 7.
- **Tonspanne** – Abstand zwischen oberem und unterem Zehntel.
- **Rhythmus** – Schwankung der Silbenlänge.
- **Abwechslung zwischen den Zeilen** – die entscheidende Grösse. Eine Stimme
  kann in jedem Satz Melodie haben und trotzdem langweilen, wenn alle Zeilen
  gleich hoch, gleich laut und gleich schnell gelesen werden.

Der Lauf schlägt an, wenn der Tonumfang unter 2,6 Halbtöne fällt, eine Rolle
unter 2,0 liegt, oder die Abwechslung zwischen den Zeilen unter 1,8 Halbtöne
beziehungsweise 1,8 dB sinkt.

### Letzter Lauf

```
Rolle           Zeilen  Tonumfang  Tonspanne  Rhythmus  Urteil
erzaehler          108      6.53      16.61      0.54  sehr lebendig
odermatt             3      5.24      12.00      0.36  sehr lebendig
kevin                3      5.14      12.65      0.35  sehr lebendig
...
ALLE               135      6.13      15.77      0.52  sehr lebendig

Abwechslung zwischen den 108 Erzählerzeilen:
  Grundton    5.04 Halbtöne
  Tempo         25 %
  Lautheit    3.29 dB
```

### Die beiden Messungen im Widerstreit

Sie ziehen in entgegengesetzte Richtungen, und das ist beabsichtigt:

| Fassung | Hörprobe | Tonumfang |
|---|---|---|
| Piper, ohne Regie | 102 von 135 | 3,15 |
| Piper, Ausdruck 0,80–1,00 | 89 von 135 | 3,90 |
| Piper, Ausdruck 0,667–0,75 mit Regie | 99 von 135 | 3,64 |
| **Gemini mit Regie** | **132 von 135** | **6,13** |

Bei Piper war es ein Kompromiss: mehr Ausdruck kostete Verständlichkeit. Der
Wechsel auf Gemini löst den Zielkonflikt auf — beide Werte steigen. Das ist
ungewöhnlich genug, um es zu benennen, statt es als selbstverständlich zu
verbuchen.

## Was die Tests in dieser Runde gefunden haben

| Fund | Ursache | Behoben |
|---|---|---|
| «Znüni» wurde «Zett-Nüni» | espeak kann /tsn/ am Wortanfang nicht bilden und liest das Z als Buchstabennamen | Korrektur direkt in der Lautschrift |
| 81 % der Figurenzeilen unverständlich | Stimmenmodell `mls-medium` | ersetzt durch `thorsten_emotional`, Auswahl gemessen |
| Stimmen klangen gepresst | `asetrate` verschiebt die Formanten mit | `rubberband` mit erhaltenen Formanten, keine Tempoänderung mehr |
| «ich» klang wie «ick» | espeak liefert das ch als Kombinationszeichen, das kleine Stimmen nicht kennen | Lautschrift wird zusammengesetzt (NFC), Test prüft den Lautbestand |
| Kulissen rauschten | Rauschen durch breiten Bandpass, Pegelschwankung 0,02 | Klangbetten aus Einzelereignissen, Schwankung 0,15–0,33 |
| Stimme monoton | alle Zeilen gleich gelesen: 1,15 Halbtöne und 1,5 dB Unterschied zwischen 108 Zeilen | Regieanweisung je Zeile, jetzt 2,86 Halbtöne und 2,4 dB |
| zu viel Ausdruck | `noise_scale` weit über der Modellvorgabe | zurück auf 0,667–0,75, gemessen gegen die Hörprobe |
| Eine Spur in Fall 2 nicht auffindbar | Marker lag hinter der Sprechzeile, die als Geschwisterelement die Zeigerereignisse schluckte | Sprechzeile klickdurchlässig, blendet am Tatort nach dem Vorlesen aus |
| Phase «Zeugen» wurde übersprungen | Labor und Gegenüberstellung schalteten über Sprachende **und** Notfall-Timer weiter | `einmal()`: höchstens ein Wechsel, und nur solange der Bildschirm steht |
| Tierfährten unsichtbar | SVG ohne `width`-Attribut, dazu `width: auto` | Container gibt die Breite vor |
| Manifest stand auf `orientation: portrait` | Rest aus der Hochformat-Fassung | auf `landscape` gesetzt |
| Sprache liess sich nicht prüfen | AAC fehlt im quelloffenen Chromium | alles neu als MP3 |
| Vier Bildschirme mit dunkler Schrift auf dunklem Holz | `kopf--dunkel` fälschlich gesetzt | auf hell umgestellt |
| Frau Hübscher sprach mit Männerstimme | Besetzung nach Stimmennamen statt nach Messung — «Puck» klingt nach Kobold und ist ein Mann mit 120 Hz | alle 30 Stimmen eingemessen, Grundton **und** Formanten |
| Vier Modellaufrufe an einer tadellosen Zeile verschwendet | Prüfung wortweise; der Erkenner trennt «Zickzack-Sohle» zu «Zick zack Sohle» | zusätzlich buchstabenweiser Vergleich |
| «Röstis» kam als «Rustys» durch | buchstabenweise allein ist zu milde (0,88) | sauber ist wortweise ≥ 0,85 **oder** buchstabenweise ≥ 0,97 |
| Wiederholung machte eine Zeile schlechter | es wurde der letzte Versuch behalten, nicht der beste | `bauen()` behält den bestbewerteten Anlauf |
| Spieltest lief in vier Timeouts | Aufnahmen 63 % länger, der Test klickte mit fester Wartezeit in eine laufende Lineup-Runde | `test.js` wartet auf den Rundenzähler statt auf die Uhr |

## Was die Tests **nicht** abdecken

- **Echte Geräte.** Getestet wird headless Chromium unter Linux. iOS-Safari
  verhält sich beim Autoplay und bei der Bildschirmdrehung anders.
- **Wie es klingt.** Die Audiotests messen Pegel und Dateilänge, nicht
  Klangqualität. Ob die synthetischen Stimmen für ein Kind angenehm sind,
  entscheidet nur Zuhören.
- **Ob die Rätsel für Achtjährige lösbar sind.** Das zeigt erst ein Kind.
- **Ob eine Stimme zur Figur passt.** Gemessen ist nur, ob sie männlich oder
  weiblich klingt. Ob Frau Odermatt nach Ladenbesitzerin klingt und Kevin nach
  einem Jungen und nicht nach einer jungen Frau, entscheidet das Ohr.
- **Ob das Spiel jetzt zäh wirkt.** Die Aufnahmen sind im Schnitt 63 % länger.
  Kein Messwert sagt, ob ein Kind das als ruhiger oder als langsamer erlebt.
