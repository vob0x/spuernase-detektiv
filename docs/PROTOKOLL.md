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
| 13 | Deployment | Dateien über die GitHub-Weboberfläche hochgeladen, GitHub Pages aktiviert. |

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

## Offene Punkte

- Verdächtigen- und Zeugengesichter sind prozedurale SVG-Vektorgesichter.
  Sie sind konsistent und gut lesbar, wirken aber schlichter als die
  KI-Hintergründe. Bei Bedarf durch generierte Porträts ersetzbar.
- Der Text ist Standarddeutsch. Eine Mundart-Sprachausgabe wäre möglich,
  bräuchte aber Audiodateien und damit einen anderen Grössen-Kompromiss.
