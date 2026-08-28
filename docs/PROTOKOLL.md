# Arbeitsprotokoll

Projekt: Spürnase – Detektivbüro Bärenmoos
Datum: 26. August 2026

## Ablauf

| # | Schritt | Ergebnis |
|---|---|---|
| 1 | Umgebung geprüft | Container hat Node, Python, Git, Netz. Chrome auf dem Mac verbunden. |
| 2 | GitHub-Zugang geklärt | Container-Token gehört zu `vob0x`, darf aber keine neuen Repos anlegen ("sessions are bound to their configured repositories") und nicht in neue Repos pushen. Deployment läuft deshalb über den Browser. |
| 3 | Repo angelegt | `vob0x/spuernase-detektiv`, öffentlich, über die GitHub-Weboberfläche. |
| 4 | Konzept | Fünf Fälle, fünf Phasen, jede Phase trainiert eine benannte Fähigkeit. Siehe KONZEPT.md. |
| 5 | Gerüst | index.html, app.css, ES-Module für Logik, Fälle, Grafik, Ton, Fortschritt. |
| 6 | Fallakten | Fünf Fälle geschrieben, jeder mit Spuren, Laboraufgaben, Zeugenaussagen, Ausschlussschritten, Auflösung und Sachwissen-Karte. |
| 7 | Icons | PWA-Icons (192/512/maskable/apple-touch) mit Pillow gezeichnet. |
| 8 | PWA-Schicht | Manifest, Service Worker mit vollständigem Precache, iOS-Meta-Tags. |
| 9 | Automatischer Test | Playwright spielt alle fünf Fälle auf iPhone-Viewport durch, prüft Konsole, Service Worker, Manifest, Offline-Reload und horizontales Scrollen. |
| 10 | Bilder | Sechs Illustrationen mit Gemini erzeugt, über den Browser in den Container geholt, auf 900 px WebP reduziert. |
| 11 | Spurenkoordinaten | Nach den Bildern neu gesetzt, automatische Prüfung auf Überlappung und Randabstand ergänzt. |
| 12 | Politur | Toast nach oben (verdeckte den Hauptbutton), Spurentext unter die Szene, Faktenbox kompakter, Rösti-Hilfe zeigt beim zweiten Mal die Spur direkt. |
| 13 | Deployment | Dateien über die GitHub-Weboberfläche hochgeladen, GitHub Pages aktiviert. Live unter https://vob0x.github.io/spuernase-detektiv/ |
| 14 | Abnahme der Live-Version | Alle Dateien 200 mit korrektem Content-Type, byteidentisch mit dem lokalen Stand, Testsuite auf dem ausgelieferten Stand unter dem echten Unterpfad grün, Installierbarkeit im Chrome bestätigt. |

## Entscheide und Begründungen

**Kein Framework, kein Build-Schritt.**
Das Spiel soll in fünf Jahren noch startklar sein, ohne `npm install`.
Vanilla ES-Module reichen für den Umfang vollständig.

**Bilder nur als Hintergrundplatten, alles Interaktive als SVG.**
Die Spurenmarker liegen als eigene Ebene über dem Bild. Damit sind sie
unabhängig davon, was die Bildgenerierung tatsächlich gezeichnet hat, und die
Trefferzonen stimmen exakt. Fingerabdrücke, Sohlen, Reifenprofile, Uhren und
Gesichter werden prozedural erzeugt – so sind Probe und richtige Antwort
garantiert identisch, was bei generierten Bildern nicht sicherzustellen wäre.

**Ton synthetisch.**
Elf Effekte über WebAudio statt elf Audiodateien. Kein Byte Download,
kein Ladezustand, funktioniert offline ab der ersten Sekunde.

**Ursprünglicher Einwand gegen KI-Bilder – und wie er ausgegangen ist.**
Der Einwand war die Downloadgrösse. Er hat sich in dieser Grössenordnung
nicht bestätigt: sechs Bilder à 900 px WebP ergeben zusammen rund 470 KB,
die ganze App liegt unter 800 KB. Der Einwand wäre erst ab etwa dreissig
Bildern relevant geworden. Der Nutzer hatte in der Sache recht.

**Kein Zeitdruck, keine Verlierer-Bildschirme.**
Für Achtjährige erzeugt ein Timer Frustration statt Spannung. Falsche
Antworten kosten Sterne, nie den Fortschritt. Nach zweimaligem Nachfragen
zeigt Rösti die Spur direkt – niemand bleibt stecken.

**Öffentliches Repository.**
GitHub Pages braucht für ein privates Repository ein kostenpflichtiges Konto.
Das Spiel enthält keine persönlichen Daten, deshalb öffentlich.

## Zweite Runde: Artwork und Ton (gleicher Tag)

Rückmeldung: «Das Artwork ist teilweise noch rudimentär.» Zutreffend – die
Figuren waren prozedurale Vektorgesichter und die Oberfläche generisches
Dunkelblau. Gewählte Richtung nach Rückfrage: Akten auf einer Schreibtischplatte,
alle 27 Figuren als Illustration.

| # | Schritt | Ergebnis |
|---|---|---|
| 15 | Figuren | Sieben 2x2-Bögen mit Gemini erzeugt, mit `tools/portraits.py` an den weissen Trennlinien automatisch geschnitten, 28 Porträts à ~10 KB. Haarfarben gegen die Falllogik geprüft (Fall 1 hängt daran). |
| 16 | Beweismittel neu gezeichnet | Fingerabdrücke folgen jetzt einem Strömungsfeld statt konzentrischen Kreisen; Sohlen und Reifen als Abdruck im Staub; Fasern unter dem Mikroskop mit Vignette und Massstab; Uhr als Schweizer Bahnhofsuhr. |
| 17 | Oberfläche | Vollständig auf Aktenmappe umgebaut: Holzgrund, Papierflächen, Aktenreiter, Fotoecken, Beweismittelkarten, Stempel «Ausgeschlossen» statt durchgestrichener Kacheln, nummerierte Sucherrahmen als Spurenmarker. |
| 18 | Audio-Engine | Neu aufgebaut: drei Busse über Hall und Kompressor, fünf ortsbezogene Klangkulissen, Detektiv-Titelmusik, elf überarbeitete Effekte. Alles synthetisiert. |
| 19 | Spurenkoordinaten | Marker sind von 64 auf 72 px gewachsen. Ein Entzerrungslauf hat alle Spuren automatisch auf mindestens 84 px Abstand geschoben, danach wieder auf plausible Bildstellen geprüft. |
| 20 | Audio-Test | Neues Werkzeug `tools/audiotest.js` misst den Pegel hinter dem Kompressor und prüft jeden Effekt, jede Kulisse, die Musik und den Stummschalter. |

### Was dabei schiefging und wie es gefunden wurde

- **Papierrascheln und Lupenzug waren unhörbar.** Der Audio-Test hat es gezeigt
  (Pegel 0.0005 statt 0.01). Ursache: die gemeinsame Rauschquelle war braunes
  Rauschen und hat oberhalb von 3 kHz fast keine Energie. Lösung: zweite Quelle
  mit weissem Rauschen für alles Helle.
- **Die Kulisse startete nicht.** Wird `kulisse()` vor der ersten Berührung
  aufgerufen, gibt es noch keinen AudioContext. Die alte Fassung merkte sich
  trotzdem den Namen und hielt ihn danach für bereits gesetzt. Jetzt gibt es
  einen Wunschzustand, der nach dem Entsperren angewandt wird.
- **Der Stempel war grau statt rot.** Der Graustufenfilter lag auf der ganzen
  Karte und damit auch auf dem Stempel. Jetzt liegt er nur auf dem Foto.

## Runde 3 — Querformat, Bewegung, Vertonung

Rückmeldung: *«Aktuell noch viel zu viel lesen, Fälle sehr uniform, Grafiken zu
klein, alles in allem zu statisch. Alles Querformat. Animierte Sequenzen, mehr
Ton, weniger Text.»* Und danach: *«Das Spiel braucht echte Atmosphäre. Die
Sprachausgabe soll nicht vom Gerät sein, wenn sie mechanisch klingt.»* →
**alles vertonen.**

| # | Schritt | Was gemacht wurde |
|---|---|---|
| 21 | Feste Bühne | Alles auf 1000 × 480 Punkte umgestellt, als Ganzes skaliert. Ein Layout für alle Geräte, im Hochformat eine Drehaufforderung. Eine erzwungene Drehung ist nicht möglich: `screen.orientation.lock()` fehlt auf iOS-Safari. |
| 22 | Phasen-Engine | Fälle bestimmen jetzt selbst, aus welchen Bildschirmen sie bestehen (`phasen`). Drei neue Phasenarten: Verfolgung, Zeitstrahl, Zeugen mit Sprechblasen. Fall 1 hat 4 Phasen, Fall 5 hat 6 — keine zwei Fälle laufen gleich. |
| 23 | Text gekürzt | Jede Bildschirmzeile auf einen Satz gestutzt. Der Fliesstext ist ins Notizbuch gewandert, das jederzeit über den Kopfknopf erreichbar ist. |
| 24 | Bewegung | Intro als Sequenz (Auslöser, fallendes Foto, Stempelknall, Fakten ticken einzeln herein), Spurenmarker fliegen ins Beweisregal, Sterne fliegen einzeln ein, Blaulicht bei der Verhaftung. |
| 25 | Vertonung | 135 Zeilen mit Piper gesprochen. Erzähler `de_DE-thorsten-high`, 26 Figuren aus `de_DE-mls-medium` mit zehn Sprecher-Kennungen plus Tonhöhen- und Tempoversatz. ffmpeg: Hochpass, Lautheit auf −16 LUFS, MP3 48 kbit/s mono. |
| 26 | Audio-Ducking | Kulisse und Musik senken ab, solange gesprochen wird. |
| 27 | Neue Effekte | Kameraauslöser, Aktenschublade, Zuschlagen, Whoosh, Schritte, Ticken, Treffer, Aufdecken — die Effektliste ist von 11 auf 19 gewachsen. |
| 28 | Tierfährten | Neuer SVG-Generator für Fall 5: grosser Hund, kleiner Hund, Katze, Vogel. Unterscheiden sich in Grösse, Zehenzahl, Krallen und Schrittweite, nicht bloss im Massstab. |
| 29 | Testlauf umgebaut | `tools/test.js` spielt jetzt über die Phasen-Engine, prüft jede Phase einzeln, misst die Sterne und gleicht jede angeforderte Sprachaufnahme gegen die erzeugte Liste ab. `tools/audiotest.js` prüft zusätzlich alle 135 Dateien und misst drei Stichproben. |

### Was dabei schiefging und wie es gefunden wurde

- **Eine Spur liess sich nicht finden.** In Fall 2 lag ein Marker hinter der
  Sprechzeile. Die Zeile ist ein Geschwisterelement der Szene und schluckte die
  Zeigerereignisse — die Szene bekam nie ein `pointermove`. Zwei Korrekturen:
  die Sprechzeile ist jetzt klickdurchlässig (nur der Hörknopf reagiert), und
  am Tatort blendet sie nach dem Vorlesen aus.
- **Eine Phase wurde übersprungen.** Labor und Gegenüberstellung schalteten
  über zwei Wege weiter: das Sprachende **und** einen Notfall-Timer. Endete die
  Aufnahme vor dem Timer, lief beides. Bei zwei Laboraufgaben sprang das Spiel
  von Aufgabe 1 direkt an den Zeugen vorbei. Ersetzt durch `einmal()`: der
  Wechsel läuft höchstens einmal und nur, solange der Bildschirm noch steht.
- **Fährten waren unsichtbar.** Die SVG-Generatoren geben nur `viewBox` aus,
  kein `width`/`height`. Mit `width: auto` fielen sie auf null zusammen. Die
  Container geben jetzt die Breite vor.
- **Dunkle Schrift auf dunklem Holz.** Vier Bildschirme setzten den Kopf auf
  `kopf--dunkel`, obwohl dort die Schreibtischplatte liegt. Ebenso die Namen am
  Zeitstrahl und die Faktenzeilen im Intro. Alle auf hell umgestellt.
- **Sprechzeile über den Namen.** Bei Zeugen, Gegenüberstellung und Verhaftung
  verdeckte die zentrierte Sprechzeile genau die Information, die verglichen
  werden sollte. Die Frage der Gegenüberstellung steht jetzt in der
  Beweiskarte; bei Zeugen und Verhaftung blendet die Zeile nach dem Vorlesen aus.
- **AAC liess sich nicht prüfen.** Die erste Vertonung lag als m4a vor. Der
  quelloffene Chromium-Bau, mit dem getestet wird, kann AAC nicht dekodieren
  (`canPlayType('audio/mp4; codecs="mp4a.40.2"')` gibt leer zurück) — der
  Testlauf hätte einen Totalausfall der Sprache nicht bemerkt. Alles neu als
  MP3: rund 800 KB grösser, dafür auf jedem Zielgerät und im Test überprüfbar.

## Runde 4 — Aussprache und Kulisse

Rückmeldung: *«Die Sprachqualität ist schlecht. Znüni wird als "Zett-Nüni"
ausgesprochen. Zudem: Die Soundkulisse rauscht anstatt zu klingen.»*

Beide Befunde waren richtig, und beide hatten eine tiefere Ursache als den
genannten Einzelfall.

### Was wirklich kaputt war

Zuerst gemessen statt geraten. Neues Werkzeug `tools/hoerprobe.py`: ein
Spracherkenner (faster-whisper) hört jede der 135 Aufnahmen ab und vergleicht
sie mit dem Text, der gesprochen werden sollte.

**Ergebnis des ersten Laufs: 93 von 135 Aufnahmen sauber verstanden.** Nach
Rollen aufgeschlüsselt war das Bild eindeutig:

| | Zeilen | auffällig |
|---|---|---|
| Erzähler (`thorsten-high`) | 108 | 20 (18 %) |
| Figuren (`mls-medium`) | 27 | **22 (81 %)** |

Aus «Ich mache jede Stunde eine Runde.» wurde «Wie soll das denn jetzt erwarten
sein?». Das Problem war nicht ein Wort, sondern das Stimmenmodell.

| # | Schritt | Was gemacht wurde |
|---|---|---|
| 30 | Aussprache diagnostiziert | Alle 491 Wörter der Spieltexte eingelautet und die Lautschrift durchgesehen. «Znüni» → `tsˈɛtnˈyːniː`: espeak liest das Z als Buchstabennamen, weil es /tsn/ am Wortanfang nicht bilden kann. Dazu 19 weitere Fehler: fehlendes h in «Forsthaus», fehlendes ch in «durchs», «ch» zu «k» in «erreichst», Notrufnummer 117 als «einhundertsiebzehn». |
| 31 | Aussprachewörterbuch | `tools/aussprache.py` korrigiert auf Textebene (Notrufnummern ziffernweise) und auf Lautebene (direkt an den Phonemen). Ersatzschreibweisen wurden vorher durchprobiert und verworfen: «Tsnüni», «Snüni», «Z'nüni» und neun weitere wurden von espeak wieder buchstabiert oder klangen schlechter. |
| 32 | Stimmen neu besetzt | 40 mls-Sprecher und alle Alternativen durchgemessen. `thorsten_emotional-medium` schlägt `mls-medium` deutlich (0,97 gegen 0,72). Neue Besetzung: Erzähler `thorsten-high`, alle Figuren `thorsten_emotional` in acht Färbungen mit Tonhöhenversatz. |
| 33 | Tonhöhe und Tempo | `asetrate` (verschiebt die Formanten mit) ersetzt durch `rubberband` mit erhaltenen Formanten. Tempoänderungen ganz gestrichen: sie kosteten in jeder Messung Verständlichkeit. Kodierung von 48 kbit/s bei 24 kHz auf 64 kbit/s bei 22 kHz — das native Format des Modells statt einer sinnlosen Hochrechnung. |
| 34 | Kulissen neu gebaut | `js/kulisse.js`: jedes Klangbett wird als Sample mit tausenden Einzelereignissen ausgerechnet und in Schleife gespielt, statt Rauschen durch einen Bandpass zu schicken. |
| 35 | Neue Kulissen-Ereignisse | Schulhausglocke, Stuhlrücken, Perrondurchsage, Velo, Heizungsrohr, Specht, knackender Ast, Blättern — und alle Ereignisse deutlich häufiger. |
| 36 | Zwei neue Prüfwerkzeuge | `tools/aussprachetest.py` (greift jeder Wörterbucheintrag, und kennt jede Stimme jeden Laut?) und die Pegelschwankungsmessung in `tools/audiotest.js`. |

### Was dabei schiefging und wie es gefunden wurde

- **Eine Korrektur war schlechter als der Fehler.** Für «Fingerabdrücke» hatte
  ich `fˈɪŋɐʔapdrˌʏkə` eingetragen, weil espeaks `fˈɪŋeːrˌabdrʏkə` ein falsches
  langes e hat. Die Gegenprobe: espeaks Fassung wird zu 1,00 verstanden, meine
  zu 0,62. Eintrag gestrichen. Seither wird jeder Eintrag gegengeprüft.
- **«ich» wurde zu «ick».** espeak liefert das ch in einem allein stehenden
  «ich» als zwei Zeichen (c + Cedille) statt als ç. Stimmen mit kleinem
  Lautbestand kennen das Kombinationszeichen nicht und werfen es weg. Jetzt
  wird die Lautschrift vorher zusammengesetzt (Unicode-NFC), und der Test
  prüft für jede Stimme, ob sie jeden erzeugten Laut kennt.
- **Tonhöhe und Tempo zusammen zerstören die Stimme.** Einzeln waren −4 %
  Tonhöhe und Tempo 0,95 je 1,00; zusammen 0,80. Deshalb gibt es jetzt gar
  keine Tempoänderung mehr.
- **Die weibliche Stimme war die schlechteste.** `eva_k` ist die einzige
  weibliche deutsche Piper-Stimme, aber in der Qualitätsstufe x_low: 0,76
  gegen 0,97. Ersetzt durch helle Färbungen des guten Sprechers. Das kostet
  Vielfalt und ist der offenkundigste Kompromiss dieser Runde.
- **Der Messwert sättigt.** Am Ende blieben 33 auffällige Zeilen. Eine
  Gegenprobe mit einem grösseren Erkennungsmodell zeigte: 14 davon sind sauber
  gesprochen, das kleine Modell kennt nur die Wörter nicht (Rüegg, Beeler,
  Egli, Znüni, Guetzli, Mountainbike). Ab hier würde man den Spracherkenner
  optimieren statt das Spiel.

### Wo es steht

| | vorher | nachher |
|---|---|---|
| Figurenzeilen sauber verstanden | 5 von 27 | 21 von 27 |
| Pegelschwankung der Kulissen | 0,02–0,04 | 0,15–0,33 |
| Buchstabierte Wörter | 2 | 0 |

## Runde 5 — gegen die Monotonie

Rückmeldung: *«Aussprache korrekt. Aber die Stimme ist langweilig und monoton.»*

Berechtigt, und selbst verschuldet. In Runde 4 wurden die Stimmen nach
Verständlichkeit ausgewählt – gemessen mit einem Spracherkenner. Am
leichtesten zu erkennen ist aber genau eine flache, gleichförmige Stimme, und
Tempoänderungen hatte ich aus demselben Grund komplett gestrichen. Die
Messgrösse war für diese Frage die falsche.

### Was die Zahlen zeigten

Neues Werkzeug `tools/lebendigkeit.py` (Tonhöhenanalyse über Praat). Der
Tonumfang *innerhalb* der Sätze war mit 3,15 Halbtönen gar nicht schlecht.
Das Problem lag zwischen den Zeilen:

| Über 108 Erzählerzeilen | vorher |
|---|---|
| Unterschied im Grundton | **1,15 Halbtöne** |
| Unterschied in der Lautheit | **1,53 dB** |

Jede Zeile gleich hoch, gleich laut, gleich schnell – vom Fallbeginn bis zur
Verhaftung. Die Lautheit war sogar direkt mein Werk: `loudnorm=I=-16` auf
jeder einzelnen Datei.

| # | Schritt | Was gemacht wurde |
|---|---|---|
| 37 | Lebendigkeit messbar gemacht | `tools/lebendigkeit.py`: Tonumfang, Tonspanne, Rhythmus und – entscheidend – die Abwechslung zwischen den Zeilen. |
| 38 | Regieanweisungen | `tools/regie.py` ordnet jeder Zeile eine Lage zu (ernst, fund, frage, triumph, heimlich, drängend, sanft …) und daraus Färbung, Tempo, Lautheit, Tonhöhe, Rhythmus und Ausdruck. |
| 39 | Erzähler auf das Färbungsmodell | Nur so lässt sich der Tonfall je Situation wechseln. `thorsten-high` kann nur einen Tonfall. |
| 40 | Lautheit nach Lage | Statt −16 dB für alles: −13 dB im Jubel, −20 dB im dunklen Museum. |
| 41 | Ausdrucksregler eingemessen | `noise_scale` und `noise_w_scale` von Piper, vorher nie angefasst. |
| 42 | Fremde Engine geprüft | XTTS-v2 gegen Piper gemessen – siehe unten. |

### Was dabei schiefging und wie es gefunden wurde

- **Zu viel Ausdruck kostet Verständlichkeit.** Mit dem Ausdrucksregler auf
  0,8 bis 1,0 statt der Modellvorgabe 0,667 fiel die Hörprobe von 102 auf
  **89 von 135**. Zurückgenommen auf 0,667 bis 0,75.
- **Die lautesten Zeilen fielen zuerst durch.** Bei Tonhöhe +9 % und Tempo
  0,88 wurden ausgerechnet die kurzen Rufe (Hundebellen, Jubel, Beförderung)
  unverständlich. Auf +5 % und 0,93 zurückgenommen.
- **XTTS-v2 ist melodischer, aber unzuverlässig.** Tonumfang 6,2 gegen 3,6
  Halbtöne, und «Znüni» kann es ohne Wörterbuch. Aber es erfindet bei kurzen
  Eingaben Wörter: aus «Mira fährt Rennvelo. Aaron fährt Trottinett.» wurde
  «Mira ferdrenvelo. Aaron fert trottinetz ton blaorola. Desa alszona.» Mit
  automatischer Rückprüfung und Neuwürfeln kam ich auf 13 von 14 sauberen
  Zeilen bei 36 % Wiederholungsrate und rund einer Stunde Rechenzeit. Für
  einen festen Dateibestand zu unsicher. Zusätzlich: Lizenz nur für
  nicht-kommerzielle Nutzung.

### Wo es steht

| | vorher | nachher |
|---|---|---|
| Tonumfang je Zeile | 3,15 Halbtöne | **3,64** |
| Grundton zwischen den Zeilen | 1,15 Halbtöne | **2,86** |
| Lautheit zwischen den Zeilen | 1,53 dB | **2,41** |
| Hörprobe | 102 von 135 | 99 von 135 |

Drei Aufnahmen weniger sauber verstanden, dafür klingt das Spiel nicht mehr
wie eine Bahnhofsdurchsage. Zwei Messungen halten sich jetzt gegenseitig in
Schach: `hoerprobe.py` fragt, ob man es versteht, `lebendigkeit.py`, ob es lebt.

## Stolpersteine beim Deployment

- Der Container-Token darf keine neuen Repositories anlegen und nicht in sie
  pushen. Alles lief deshalb über die GitHub-Weboberfläche im Browser.
- Klicks auf Formularknöpfe über Element-Referenzen lösten bei GitHub kein
  Absenden aus; nur echte Koordinatenklicks funktionierten. Die erste
  Upload-Runde wurde dadurch stillschweigend verworfen und musste wiederholt
  werden. Kontrolle über die Commit-Liste im Repo ist hier Pflicht.
- Nach jedem Dateiupload bleibt kurz ein nativer Dateidialog offen und blockiert
  Klicks. Ein Escape davor löst es.
- Der Ausgangs-Proxy lässt curl zu github.io durch, den Testbrowser aber nicht.
  Die Live-Prüfung läuft deshalb über einen lokalen Spiegel der ausgelieferten
  Dateien unter demselben Unterpfad.

## Offene Punkte

- **Standarddeutsch, nicht Mundart.** Piper hat kein Schweizerdeutsch-Modell.
  Eine Mundartfassung bräuchte echte Sprecheraufnahmen.
- **Die Grenze ist Piper.** Mehr Melodie geht mit diesem Modell nur auf Kosten
  der Verständlichkeit. Wer eine wirklich lebendige Erzählstimme will, kommt um
  eingesprochene Aufnahmen nicht herum.
- **Alle Figuren sind derselbe Sprecher** in verschiedenen Färbungen. Für
  Deutsch gibt es bei Piper keine zweite gute Stimme; die einzige weibliche ist
  messbar schlechter. Wer echte Vielfalt will, spricht die 135 Zeilen selbst
  ein: die Kennungen stehen in `js/voice-liste.js`, das Format ist MP3 mono;
  sonst ändert sich nichts am Programm.
- **«Znüni» bleibt schwierig.** Die Lautschrift ist jetzt richtig (/tsnyːni/),
  aber die Lautfolge /tsn/ am Wortanfang liegt am Rand dessen, was das Modell
  sauber bildet. Wer es ganz sicher haben will, benennt den Fall um.
- **3,0 MB Sprache** sind die grösste Einzelposition der App. Sie werden nach
  der Installation im Hintergrund nachgeladen — der erste Start wartet nicht
  darauf, ein Fall ohne Netz beim allerersten Öffnen aber schon.
- **Die Verhaftungswand ist oben leer.** Ohne Merkmalschips sind die Karten
  flacher als in der Gegenüberstellung. Funktioniert, wirkt aber luftig.

## Runde 6 – Wechsel auf Gemini TTS, Besetzung nach Geschlecht

**Auftrag.** «Viel besser. Aber: Frauenfiguren sollten auch Frauenstimmen
haben. Ändere das, dann implementiere.»

Vorausgegangen war der Vergleichstest gegen Piper. Der Anlass für den Test war
mein eigener Einwand, Gemini könnte durch seine Nicht-Determiniertheit die
Zeugenaussagen verraten. Dieser Einwand hat den Test nicht überlebt – siehe
unten.

### Was der Vergleichstest ergab

| | Piper | Gemini 3.1 Flash TTS |
|---|---|---|
| Tonumfang Median | 3,64 Halbtöne | 7,12 |
| Hörprobe durchgefallen | 27 % | 8 % |
| Znüni, Rösti | nur per Lautschrift-Eingriff | auf Anhieb |
| Kosten je Vollausgabe | 0 | ~0,19 USD |

Der Determinismustest – dreimal exakt dieselbe Aussage – ergab 0,48 Halbtöne
Streuung bei 2,86 Halbtönen, die ich zwischen den Erzählerzeilen als hörbar
eingerichtet habe. Der Verdacht, das Modell könnte eine Lüge anders betonen,
weil es den Satz versteht, hielt der Kontrolle nicht stand: dieselben sechs
Sätze zeigen bei **Piper** dasselbe Muster, und Piper versteht kein Wort. Der
Effekt kommt vom Satzbau, nicht vom Inhalt.

### Der Fehler in der ersten Besetzung

Ich hatte Frau Hübscher mit **Puck** besetzt. Der Name klingt nach Kobold, die
Stimme ist ein Mann mit 120 Hz. Gelernt: die Stimmennamen sagen nichts über
das Geschlecht, und die Dokumentation schweigt dazu.

Konsequenz: alle 30 Stimmen eingemessen, denselben neutralen Satz durch jede.
Grundton allein reicht nicht – zwischen 150 und 175 Hz liegen hohe Männer- und
tiefe Frauenstimmen übereinander. Erst die **Formanten** trennen sauber, weil
sie die Länge des Ansatzrohrs zeigen und nicht von der Tonhöhe abhängen.
Ergebnis: 14 männlich, 15 weiblich, 1 Grenzfall (Pulcherrima).

Die Besetzung steht in `tools/voice.py`, die Messwerte im Kommentar darüber.
Gemini hat keine Kinderstimmen; Kevin und Luis bekommen eine helle Stimme plus
das Alter als Regieanweisung (`regie.FIGUR`) – beim Synchronisieren von
Kinderrollen das übliche Vorgehen.

### Umbau

* `tools/regie.py` – liefert statt sechs Zahlenwerten einen deutschen
  Regiesatz. Gemini versteht Sprache, also ist die Anweisung Sprache.
  Zeugenaussagen bekommen weiterhin **eine einzige, identische** Anweisung.
* `tools/voice.py` – auf die Gemini-REST-API umgestellt. Jede frische Aufnahme
  wird sofort abgehört; bei mitgesprochener Regie oder Nuscheln bis zu vier
  Anläufe, und **der beste** wird behalten, nicht der letzte.
* `tools/regietest.py` – neu. Prüft vor 135 Modellaufrufen, dass jede
  Schreibregel greift, kein Regiewort im Spieltext vorkommt, jeder Zeuge genau
  eine Anweisung hat und jede sprechende Rolle besetzt ist.
* `tools/aussprache.py` – bleibt liegen, wird nicht mehr gebraucht. Die
  Lautschrift-Ebene gibt es bei Gemini nicht; an ihre Stelle tritt
  `regie.LAUTSCHREIBUNG` mit genau einem gemessenen Eintrag
  («Zickzack-Sohle» → «Zick-Zack-Sohle», sonst «Tick-Tack-Sole»).

### Zwei Messfallen, in die ich gelaufen bin

1. **Die Hörprobe war zu streng.** Der Erkenner trennt Komposita auf:
   «Zickzack-Sohle» kommt als «Zick zack Sohle» zurück – wortweise ein
   Totalausfall, gesprochen tadellos. Vier Modellaufrufe verschwendet, bis ich
   buchstabenweise dazunahm.
2. **Und dann zu milde.** Buchstabenweise sind «Röstis» und «Rustys» 0,88 –
   der Hund heisst aber anders. Jetzt gilt: sauber ist, was wortweise ≥ 0,85
   **oder** buchstabenweise ≥ 0,97 erreicht.

`Luis` kommt beim Erkenner als `Louis` zurück – dieselbe Aussprache, die
gebräuchlichere Schreibweise. Das ist in `hoerprobe.ZAHL` normalisiert.
`Louise` bewusst nicht: das ist ein anderer Name.

### Ergebnis

| | Runde 5 (Piper) | Runde 6 (Gemini) |
|---|---|---|
| Tonumfang Erzähler | 3,64 | **6,53** Halbtöne |
| Tonumfang alle | 3,64 | **6,13** |
| Grundton zwischen den Zeilen | 2,86 | **5,04** Halbtöne |
| Lautheit zwischen den Zeilen | 2,41 | **3,29** dB |
| Tempo zwischen den Zeilen | 20 % | **25 %** |
| Hörprobe sauber | 99 von 135 | **132 von 135** |
| Länge gesamt | 386 s | 628 s |
| Grösse | 3,0 MB | 4,9 MB |

Die drei verbleibenden Auffälligkeiten sind samt und sonders Tokenisierung des
Erkenners («Mountain-Bike», «Leid getan»), keine Aussprachefehler.

**Nebenwirkung:** die Aufnahmen sind im Schnitt 63 % länger. Der Spieltest
lief deshalb zunächst in einen Timeout – er klickte mit fester Wartezeit in
eine noch laufende Lineup-Runde hinein. `tools/test.js` wartet jetzt auf den
Rundenzähler statt auf die Uhr. Ob das Spiel dadurch zäher wirkt, entscheidet
kein Messwert, sondern das Kind.

## Runde 7 – Merkmalstafeln statt Wortchips

**Auftrag.** «Beim Spurenabgleich im Labor sind die Symbole bei den Personen
immer noch klein und mit Text. Über den Personen hat es viel Platz. Nutze den
für grössere, eindeutige und ohne Text verständliche Symbole.»

### Was falsch war

Unter jedem Verdächtigen stand ein 15-Pixel-Feldsymbol mit dem Wert als Wort
daneben: ein winziger Fingerabdruck und «Wirbel», ein Schlüsselchen und «ja».
Zwei Fehler auf einmal:

1. **Zu klein, am falschen Ort.** Über den Köpfen lagen rund 340 Pixel leere
   Wand, unter der Reihe war kein Platz – die Chips brachen um, und weil sie
   bei jeder Person anders umbrachen, stand «Herr Ammann» auch noch höher als
   die anderen.
2. **Das Symbol sagte nur, worum es geht.** *Was* der Wert ist, stand als
   Wort daneben. Ein Achtjähriger vergleicht dann Wörter statt Bilder – genau
   das, was der Spurenabgleich eigentlich üben soll.

### Was jetzt da steht

`art.merkmal(feld, wert)` zeichnet jeden **Wert** als eigenes Bild, auf 64 × 64
mit kräftigen Formen: Sohlenprofile im Sohlenumriss, Fingerabdruckmuster,
Fahrzeugsilhouetten, Farbkleckse in der echten Farbe, Wollfasern, Schlüssel,
Guetzli, Dorf / Wald / Zug. Die Tafeln stehen über dem Kopf, 54 px bei drei
Merkmalen, 78 px bei zweien. Die Beweiskarte links zeigt **dasselbe Bild** –
sonst vergleicht das Kind zwei Zeichensprachen.

«Gibt es nicht» ist die Sache selbst, ausgegraut und rot durchgestrichen. Ein
leeres Feld wäre mehrdeutig: es könnte auch «noch nicht geprüft» heissen.

### Zwei Entwürfe, die durchgefallen sind

* **Mountainbike und Rennvelo waren beide «ein Velo».** Der Unterschied lag im
  Detail, und Detail trägt bei 54 Pixeln nicht. Jetzt trägt ihn die Silhouette:
  dicke Stollenreifen und gerader Lenker gegen hauchdünne Reifen und Rennbügel.
* **Der Schuhgrössen-Umriss las sich als Totenkopf.** Ein hochkantes Oval mit
  zwei Ziffern darin – im Screenshot sofort zu sehen, am Bildschirm nicht
  gedacht. Ersetzt durch einen Schuh in Seitenansicht.

Beides fiel nur auf, weil ich die Bildschirme abfotografiert und angeschaut
habe, statt den Code für richtig zu halten.

### Was ich **nicht** wegzeichnen konnte

**Schuhgrössen.** 36, 38 und 40 unterscheiden sich um wenige Prozent; als
Umriss gezeichnet wäre das Raten statt Vergleichen. Die Zahl bleibt eine Zahl,
gross in den Schuh gestempelt. Für Achtjährige ist eine zweistellige Zahl
keine Leseaufgabe – aber es ist die eine Stelle, an der die Vorgabe «ohne
Text» nicht eingehalten ist, und das soll nicht untergehen.

Nebenbei behoben: der RAUS-Stempel klebte nach dem Umbau auf den Tafeln statt
auf dem Gesicht, und lange Namen brachen um und verschoben die ganze Karte.

## Runde 8 – Sprachzeilen reihen sich an

**Auftrag.** «Wenn mehrere Audiofiles feuern (z.B. wenn die letzte Spur
gefunden wurde), übersteuert das letzte Audio das vorhergehende – letzteres
bricht ab.»

### Die Ursache stand in einer Zeile

`sprich()` begann mit `stopp()`. Wer zuletzt spricht, schneidet dem vorigen das
Wort ab. Die Stellen, an denen zwei Dinge gleichzeitig passieren:

| Stelle | Abstand | Länge der Zeile |
|---|---|---|
| letzte Spur gefunden → «Alle Spuren gefunden» | 900 ms | 3,7–4,8 s |
| Verfolgung: «Genau richtig» → nächster Schritt | 620 ms | 2,4 s |
| Labor: Ergebnis → nächste Aufgabe | 2200 ms | 4,5 s |
| Fallende: «Drei Sterne» → «Du wirst befördert» | 900 ms | 2,1 s |

Die Wartezeiten stammen aus der Piper-Zeit, als eine Zeile im Schnitt 2,86
Sekunden dauerte. Mit Gemini sind es 4,65. Der Fehler war immer da und ist nur
sichtbarer geworden – das gehört zur Ehrlichkeit dazu: er ist eine Nebenwirkung
von Runde 6, die mir dort nicht aufgefallen ist.

### Drei Arten von Zeilen

Eine reine Warteschlange wäre falsch gewesen. Nicht jede Unterbrechung ist ein
Fehler:

* **Inhalt** (Spurentexte, Fragen, Aussagen, Auflösungen) – reiht sich an.
* **Anleitung** («Such den Tatort ab») – sagt, was zu tun ist. Sobald das Kind
  es tut, ist sie überholt und weicht.
* **Rückmeldung** («Genau richtig», «Alle Spuren gefunden») – gehört zur
  Handlung, nicht zum Bild, und überlebt darum den Bildschirmwechsel.

Dazu `{ sofort: true }` für die drei Fälle, die wirklich unterbrechen müssen:
falsche Antwort, «nochmal vorlesen», Sprachausgabe abschalten. Unterbrochen
wird mit 120 ms Ausblendung – ein harter Schnitt knackt.

Der Hund bellt jetzt nicht mehr in eine laufende Zeile hinein.

### Der Test hat einen Fehler von mir gefunden

Der erste Entwurf der Schlange begrenzte sie auf drei wartende Zeilen und warf
die älteste weg. Im Messlauf lief die Anleitung «Such den Tatort ab» noch,
während das Kind schon drei Spuren fand – die Zeile zur **ersten** Spur fiel
hinten aus der Schlange und war weg. Das Kind tippt und hört nichts: schlimmer
als der Fehler, den ich reparieren wollte.

Behoben durch die Kategorie «Anleitung»: sie weicht und belegt keinen Platz.

### Und der Test hatte selbst einen

Der erste Anlauf meldete «✓ keine Zeile abgeschnitten» – bei null gemessenen
Zeilen. Er zählte nur Abbrüche über `pause()`, und ein natürliches Ende löst
kein `pause()` aus. Er hätte auch die kaputte Fassung durchgewinkt.

Jetzt schreibt er das `ended`-Ereignis mit und bricht ab, wenn weniger als fünf
Zeilen gespielt wurden. Gegengeprüft mit der alten `voice.js`: 5 von 8 Zeilen
abgeschnitten, Test fällt durch. Erst damit ist er etwas wert.

### Was es kostet

| | vorher | jetzt |
|---|---|---|
| Zeilen zu Ende gesprochen (Spieltest) | 22 | **51** |
| Fall 1 Durchlauf | 17,9 s | 27,7 s |
| Fall 4 Durchlauf | 38,0 s | 60,3 s |

Mehr als doppelt so viele Zeilen werden zu Ende gesprochen – und das Spiel
dauert länger, weil es vorher Text weggeworfen hat. Ein Kind spielt ohnehin
langsamer als der Testklick, aber an den Übergängen wartet es jetzt auf das
Satzende. Der «Weiter»-Knopf erscheint sofort und beendet die Schlange, wer
mag, klickt weiter. Ob das reicht, sagt kein Messwert.
