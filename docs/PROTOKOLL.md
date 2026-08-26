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

- Verdächtigen- und Zeugengesichter sind prozedurale SVG-Vektorgesichter.
  Sie sind konsistent und gut lesbar, wirken aber schlichter als die
  KI-Hintergründe. Bei Bedarf durch generierte Porträts ersetzbar.
- Der Text ist Standarddeutsch. Eine Mundart-Sprachausgabe wäre möglich,
  bräuchte aber Audiodateien und damit einen anderen Grössen-Kompromiss.
