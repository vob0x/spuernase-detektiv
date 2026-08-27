# Spürnase — Detektivbüro Bärenmoos

**Zielgruppe:** Kinder ab 8 Jahren (Schweiz, 2.–4. Klasse)
**Plattform:** Progressive Web App, **Querformat**, mobile-first, vollständig offline
**Sprache:** Standarddeutsch, kurze Sätze, Schweizer Rechtschreibung (ss statt ß)
**Vertonung:** jede Zeile ist gesprochen — 135 Aufnahmen mit eigenem
Aussprachewörterbuch, keine Gerätestimme

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

135 Aufnahmen, erzeugt mit **Gemini 3.1 Flash TTS** über die REST-API. Der
Vorgänger war Piper (lokal, `de_DE-thorsten`); der Wechsel ist in Runde 6
gemessen worden:

| | Piper | Gemini |
|---|---|---|
| Tonumfang Median | 3,64 Halbtöne | **7,12** |
| Hörprobe durchgefallen | 27 % | **8 %** |
| «Znüni», «Rösti» | nur per Eingriff in die Lautschrift | auf Anhieb |
| Stimmen | 1 Sprecher, 8 Färbungen | **30 eigenständige** |
| Kosten je Vollausgabe | 0 | ~0,19 USD |

Ungewöhnlich daran: Lebendigkeit und Verständlichkeit ziehen sonst
gegeneinander. Hier gewinnen beide.

### Besetzung: gemessen, nicht nach Namen geraten

Die Stimmennamen sagen nichts über das Geschlecht, und die Dokumentation
schweigt dazu. **Puck** klingt nach Kobold und ist ein Mann mit 120 Hz — so
wurde Frau Hübscher im ersten Anlauf von einem Mann gesprochen.

Deshalb laufen alle 30 Stimmen einmal durch denselben neutralen Satz. Der
Grundton allein reicht nicht: zwischen 150 und 175 Hz liegen hohe Männer- und
tiefe Frauenstimmen übereinander. Erst die **Formanten** trennen sauber, weil
sie die Länge des Ansatzrohrs zeigen und von der Tonhöhe unabhängig sind.

| Stimme | Grundton | F3 | Lage | Rolle |
|---|---|---|---|---|
| Iapetus | 126 Hz | 2746 | männlich | Erzähler (108 Zeilen) |
| Rasalgethi | 139 Hz | 2746 | männlich | Herr Frei |
| Alnilam | 110 Hz | 2713 | männlich | Herr Kunz |
| Algenib | 129 Hz | 2508 | männlich | Herr Sutter |
| Gacrux | 152 Hz | 2958 | weiblich | Frau Odermatt |
| Kore | 171 Hz | 2909 | weiblich | Frau Rüegg |
| Callirrhoe | 169 Hz | 2951 | weiblich | Frau Beeler |
| Vindemiatrix | 163 Hz | 2880 | weiblich | Frau Hübscher |
| Fenrir | 193 Hz | 3032 | weiblich | Kevin |
| Leda | 181 Hz | 3057 | weiblich | Luis |

Insgesamt: 14 männlich, 15 weiblich, 1 Grenzfall.

Gemini hat **keine Kinderstimmen**. Kevin und Luis bekommen eine helle Stimme
plus das Alter als Regieanweisung («Du bist ein zehnjähriger Junge») — beim
Synchronisieren von Kinderrollen das übliche Vorgehen, und es wirkt messbar:
dieselbe Stimme steigt dadurch von 118 auf 141 Hz.

### Was das Modell schlechter kann als Piper

* Es **spricht gelegentlich die Regieanweisung mit** («Neugierig fragend? Wer
  hat andere Schuhe?»). Deshalb hört `tools/voice.py` jede frische Aufnahme
  sofort ab und wiederholt bis zu viermal. Behalten wird der beste Versuch,
  nicht der letzte — Gemini ist nicht deterministisch, dieselbe Zeile kam im
  Messlauf einmal als «Wellenzule» und einmal als «Wellensohle» zurück.
* Es ist ein **Vorschaumodell ohne Zusicherung**. Die fertigen MP3 sind davon
  nicht betroffen, ein Neubau in einem Jahr kann anders klingen.
* Es gibt **keine Lautschrift-Ebene** mehr. Wo bei Piper ein Eingriff in die
  Phonemkette möglich war, bleibt nur die Orthografie: `regie.LAUTSCHREIBUNG`
  enthält genau einen gemessenen Eintrag («Zickzack-Sohle» → «Zick-Zack-Sohle»,
  sonst «Tick-Tack-Sole»). Er ändert nur den gesprochenen Text, nie den auf
  dem Bildschirm.
* Die Aufnahmen sind **63 % länger** (4,65 statt 2,86 Sekunden im Schnitt).
  Das Spiel wartet zwischen den Schritten entsprechend länger.

### Die Zeugenaussagen — die eine Regel, die nicht verhandelbar ist

Alle Aussagen eines Zeugen bekommen **exakt dieselbe** Anweisung. Klänge die
Lüge anders als die Wahrheit, wäre das Rätsel verraten.

Der naheliegende Einwand gegen ein Sprachmodell lautet: es *versteht* den Satz,
also betont es eine Ausrede vielleicht ausweichender. Gemessen:

* Dreimal exakt dieselbe Aussage streut um **0,48 Halbtöne** und **0,73 dB** —
  weit unter den 2,86 Halbtönen, die zwischen den Erzählerzeilen bewusst als
  hörbarer Unterschied eingerichtet sind.
* Über drei unabhängige Durchgänge ist die Lüge in 6 von 6 Fällen melodischer,
  im Mittel um 1,50 Halbtöne. **Aber:** dieselben sechs Sätze zeigen bei Piper
  dasselbe Muster — und Piper versteht kein Wort von dem, was es liest. Der
  Effekt kommt vom Satzbau, nicht vom Inhalt.

Das Rätsel ist mit Gemini also nicht stärker gefährdet als vorher. Die
Stichprobe ist mit zwei Zeugen dünn; wer das genauer wissen will, muss mehr
Zeugen messen.

### Regie: warum jede Zeile anders gelesen wird

Eine Stimme wirkt nicht monoton, weil ihr innerhalb eines Satzes die Melodie
fehlt – die hat sie. Sie wirkt monoton, weil **alle Zeilen gleich gelesen
werden**. Die erste vertonte Fassung war genau das: über 108 Erzählerzeilen
gemessen unterschieden sich die Zeilen um 1,15 Halbtöne im Grundton und
1,5 dB in der Lautheit. Vom Fallbeginn bis zur Verhaftung derselbe Tonfall.

Das war ein selbstgemachter Fehler: die Stimmen wurden nach *Verständlichkeit*
ausgewählt, und am leichtesten zu erkennen ist eine flache, gleichförmige
Stimme. Tempoänderungen hatte ich aus demselben Grund ganz gestrichen.

`tools/regie.py` gibt nun jeder Zeile eine Anweisung – Färbung, Tempo,
Lautheit, Tonhöhe – abgeleitet aus dem, was gerade passiert:

| Lage | Beispiel | Färbung | Tempo | Lautheit |
|---|---|---|---|---|
| ernst | Fallbeginn, Wusstest-du | neutral | langsam | leise |
| fund | Spur gefunden | amüsiert | schnell | laut |
| frage | Laborfrage, Gegenüberstellung | überrascht | normal | laut |
| erklaerung | Begründung | neutral | langsam | mittel |
| heimlich | dunkles Museum | schläfrig | sehr langsam | sehr leise |
| draengend | Rösti bellt | überrascht | schnell | laut |
| triumph | Fall gelöst, Beförderung | überrascht | schnell | am lautesten |
| sanft | falsch geraten | schläfrig | langsam | leise |

Dazu kommt ein kleiner, fester Versatz je Zeile, damit nicht alle Zeilen
derselben Lage exakt gleich klingen. Er wird aus der Kennung berechnet – so
klingt dieselbe Zeile bei jedem Neuaufbau gleich.

**Eine Ausnahme:** Zeugenaussagen bekommen alle dieselbe Anweisung. Würde die
Lüge anders klingen als die Wahrheit, wäre das Rätsel verraten.

Was das bringt, gemessen mit `tools/lebendigkeit.py`:

| | vorher | nachher |
|---|---|---|
| Tonumfang je Zeile | 3,15 Halbtöne | **3,64** |
| Grundton-Unterschied zwischen den Zeilen | 1,15 Halbtöne | **2,86** |
| Lautheits-Unterschied zwischen den Zeilen | 1,53 dB | **2,41** |
| Hörprobe (verstanden) | 102 von 135 | 99 von 135 |

Die drei Aufnahmen, die dabei verloren gehen, sind der Preis. Zu kräftige
Anweisungen kosten mehr: mit Ausdrucksregler auf 1,0 statt der Modellvorgabe
0,667 fiel die Hörprobe auf 89 von 135. Der Regler steht deshalb nahe der
Vorgabe – die Abwechslung kommt aus Färbung, Tempo, Lautheit und Tonhöhe,
und die kosten nichts.

### Warum nicht eine ausdrucksstärkere Engine?

Geprüft wurde XTTS-v2, das deutlich melodischer spricht. Über dieselben
Zeilen gemessen: **Tonumfang 6,2 Halbtöne** gegen 3,6 bei Piper – hörbar
lebendiger, und «Znüni» kann es von sich aus.

Es scheitert an der Zuverlässigkeit. XTTS erfindet bei kurzen Eingaben Wörter,
und drei von fünf Zeilen im Spiel sind kurz:

> «Mira fährt Rennvelo. Aaron fährt Trottinett.»
> → *«Mira ferdrenvelo. Aaron fert trottinetz ton blaorola. Desa alszona.»*

Mit automatischer Rückprüfung und Neuwürfeln liessen sich 13 von 14 Zeilen
sauber erzeugen – bei 36 % Wiederholungsrate, rund einer Stunde Rechenzeit für
alle 135 Zeilen und einer Zeile, die auch nach drei Versuchen nicht sass. Für
einen festen Bestand an Spieldateien ist das zu unsicher: eine still verdrehte
Zeile fällt erst dem Kind auf.

Dazu kommt: XTTS-v2 steht unter einer Lizenz, die nur nicht-kommerzielle
Nutzung erlaubt.

### Aussprache

Gemini liest «Znüni», «Rösti», «Guetzli» und «Bärenmoos» auf Anhieb richtig.
Das war bei Piper der grösste Einzelaufwand der ganzen Vertonung und ist jetzt
schlicht kein Thema mehr.

Was bleibt, ist ein anderer Fehlertyp: das Modell liest gelegentlich ein Wort
anders, als es beim vorigen Aufruf gelesen hat. «Wellensohle» kam einmal als
«Wellenzule» zurück und beim nächsten Versuch tadellos. Deshalb wird jede
Aufnahme abgehört und notfalls wiederholt — nicht ein Wörterbuch gepflegt.

Nur wo ein Wort **wiederholt** danebengeht, kommt eine Schreibregel in
`regie.LAUTSCHREIBUNG`. Derzeit genau eine: «Zickzack-Sohle» kam dreimal als
«Tick-Tack-Sole», «Zick-Zack-Sohle» sitzt. Die Regel ändert nur den Text, der
ans Modell geht — auf dem Bildschirm steht weiter das Original.

Zwei Messfallen aus dem Umbau, beide lehrreich:

1. **Die Prüfung war zu streng.** Der Erkenner trennt Komposita auf:
   «Zickzack-Sohle» kommt als «Zick zack Sohle» zurück — wortweise ein
   Totalausfall, gesprochen tadellos. Das kostete vier Modellaufrufe, bis der
   buchstabenweise Vergleich dazukam.
2. **Und dann zu milde.** Buchstabenweise sind «Röstis» und «Rustys» 0,88 —
   der Hund heisst aber anders. Es gilt jetzt: sauber ist, was wortweise
   ≥ 0,85 **oder** buchstabenweise ≥ 0,97 erreicht.

Der Name «Luis» kommt vom Erkenner als «Louis» zurück: dieselbe Aussprache,
die gebräuchlichere Schreibweise. Das ist in `hoerprobe.ZAHL` normalisiert —
«Louise» bewusst nicht, denn das ist ein anderer Name.

Aus der Piper-Zeit übrig geblieben, nicht mehr in Gebrauch:
`tools/aussprache.py` mit zwanzig Lautschrift-Einträgen. Die Datei bleibt als
Beleg liegen; wer je zu einem lokalen Modell zurückkehrt, braucht sie wieder.

Nachbearbeitung mit ffmpeg: Hochpass bei 70 Hz, Lautheitsangleich auf einen
Zielwert **je nach Lage** (−13 dB im Jubel, −20 dB im dunklen Museum), dann
**MP3, 64 kbit/s, mono, 22 kHz**. Gesamt rund 3,0 MB.

Während gesprochen wird, senkt `ducken()` Kulisse und Musik ab.
Das Vorlesen ist abschaltbar; der Text bleibt dann sichtbar stehen.

### Effekte und Kulisse

Vollständig synthetisiert über die WebAudio-API. Drei Busse (Musik, Kulisse,
Effekte) laufen über einen gemeinsamen Hall (prozedural erzeugte Impulsantwort)
und einen Kompressor.

**Die Kulissen sind neu gebaut.** Der erste Ansatz — Rauschen durch einen
breiten Bandpass — klang zwangsläufig nach Rauschen: ein Zischteppich mit
konstantem Pegel und alle 20 bis 70 Sekunden ein Ereignis. Gemessen an der
Schwankung des Kurzzeitpegels lag er bei **0,02 bis 0,04**; ein gleichmässiges
Rauschen liegt bei 0,02.

Jetzt wird jedes Klangbett einmal als Sample ausgerechnet (`js/kulisse.js`) und
in Schleife gespielt. Darin stecken tausende Einzelereignisse:

| Bett | Woraus es besteht | Schwankung |
|---|---|---|
| Regen | 420 Tropfen pro Sekunde plus dumpfe Aufschläge aufs Fensterbrett | 0,54 |
| Wind | braunes Rauschen mit wandernder Klangfarbe, Böen, Blätterrascheln | 0,42 |
| Wasser | 170 Wasserstösse pro Sekunde plus aufsteigende Blasen | 0,35 |
| Raumton | sehr tiefes Grundrauschen, vereinzeltes Knacken im Gebälk | 0,34 |
| Stimmen | Sprechrhythmus ohne Worte, Formanten statt Silben | 0,35 |
| Grillen | sieben Tiere, jedes im eigenen Takt | 1,34 |

Alles schreibt mit Modulo-Umbruch in den Puffer, damit die Schleifenstelle
nahtlos ist. Die Betten mischen sich pro Ort (Schulhaus = Regen + Raum +
ferne Stimmen, Waldrand = Wind + Grillen), und darüber liegen die Ereignisse,
die man einzeln wiedererkennen soll: Schulhausglocke, Perrondurchsage,
Zugdurchfahrt, Kirchenglocke, Velo, Specht, knackender Ast, Heizungsrohr.
Deutlich häufiger als vorher — sonst hört man dazwischen nur den Grundton.

`tools/audiotest.js` misst die Pegelschwankung jeder Kulisse im Browser mit und
schlägt Alarm, wenn sie unter 0,12 fällt: dann wäre es wieder Rauschen.

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
