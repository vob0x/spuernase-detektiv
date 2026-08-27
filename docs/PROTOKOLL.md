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
- **Die Stimmen sind synthetisch**, hörbar besser als eine Gerätestimme, aber
  keine Schauspieler. Wer den nächsten Schritt will, spricht die 135 Zeilen
  selbst ein: die Kennungen stehen in `js/voice-liste.js`, das Format ist
  MP3 mono; sonst ändert sich nichts am Programm.
- **2,2 MB Sprache** sind die grösste Einzelposition der App. Sie werden nach
  der Installation im Hintergrund nachgeladen — der erste Start wartet nicht
  darauf, ein Fall ohne Netz beim allerersten Öffnen aber schon.
- **Die Verhaftungswand ist oben leer.** Ohne Merkmalschips sind die Karten
  flacher als in der Gegenüberstellung. Funktioniert, wirkt aber luftig.
