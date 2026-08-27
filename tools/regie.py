#!/usr/bin/env python3
"""Regieanweisungen für die Vertonung.

Eine Stimme klingt nicht monoton, weil ihr innerhalb eines Satzes die Melodie
fehlt. Sie klingt monoton, weil **jede Zeile gleich gelesen wird**. Gemessen an
den 108 Erzählerzeilen der ersten Fassung: 1,15 Halbtöne Grundton-Unterschied
zwischen den Zeilen, 1,5 dB Lautheit. Alles im selben Tonfall, vom Fallbeginn
bis zur Verhaftung.

Hier bekommt jede Zeile eine Anweisung, wie man sie einer Sprecherin im Studio
gäbe. Gemini ist ein Sprachmodell: es versteht deutsche Sätze, also ist die
Anweisung ein deutscher Satz und keine Zahlenreihe. «Fall gelöst» wird
triumphierend, «Es ist dunkel» fast geflüstert, der Hinweisruf drängend.

**Zwei Regeln sind nicht verhandelbar:**

1. Zeugenaussagen bekommen alle exakt dieselbe Anweisung. Würde die Lüge
   anders klingen als die Wahrheit, wäre das Rätsel verraten. Gemessen: der
   Unterschied zwischen Lüge und Wahrheit ist damit nicht grösser als bei
   einem Modell ohne Textverständnis — er kommt vom Satzbau, nicht vom Inhalt.
2. Die Anweisung darf nie mitgesprochen werden. Gemini tut das gelegentlich
   («Neugierig fragend? Wer hat andere Schuhe?»). Die Hörprobe in voice.py
   erkennt das und wiederholt die Zeile.
"""
import re

# Kennung -> Situation. Erste Übereinstimmung gewinnt.
MUSTER = [
    (r'^g-dunkel$',                     'heimlich'),
    (r'^g-hinweis-',                    'draengend'),
    (r'^g-(verhaftet|drei|befoerdert)$', 'triumph'),
    (r'^g-(alle|richtig|erwischt)$',    'jubel'),
    (r'^g-(falsch|fastfalsch)$',        'sanft'),
    (r'^g-willkommen$',                 'pointe'),
    (r'^g-(zeuge|verhaften|lineup|tatort|quer|weiter)$', 'anleitung'),
    (r'-intro$',                        'ernst'),
    (r'-wusst$',                        'erzaehlen'),
    (r'-s\d+$',                         'fund'),
    (r'-lab\d+-f$',                     'frage'),
    (r'-lab\d+-e$',                     'bestaetigt'),
    (r'-lin\d+-f$',                     'frage'),
    (r'-lin\d+-w$',                     'erklaerung'),
    (r'-verf-f$',                       'frage'),
    (r'-verf-z$',                       'fund'),
    (r'-zeit-f$',                       'frage'),
    (r'-zeit-w$',                       'erklaerung'),
    (r'-z\d+-a\d+$',                    'aussage'),     # Zeugenaussage
    (r'-z\d+-w$',                       'bestaetigt'),
    (r'-auf2$',                         'pointe'),
    (r'-auf\d+$',                       'erzaehlen'),
]

# Der Rahmen steht vor jeder Erzähleranweisung, damit die Stimme über alle
# 108 Zeilen dieselbe Figur bleibt und nur die Stimmung wechselt.
RAHMEN = ('Du erzählst achtjährigen Kindern einen Kriminalfall im Detektivbüro '
          'Bärenmoos. Sprich Hochdeutsch, klar und nicht zu schnell. ')

ANWEISUNG = {
    'ernst':      'Ernst und ruhig, so beginnt ein neuer Fall',
    'anleitung':  'Freundlich und auffordernd, du erklärst, was jetzt zu tun ist',
    'frage':      'Neugierig fragend, mit Spannung in der Stimme',
    'fund':       'Aufgeregt und entdeckerfroh, du hast gerade eine Spur gefunden',
    'bestaetigt': 'Zufrieden bestätigend, das passt zusammen',
    'erklaerung': 'Ruhig erklärend, du löst gerade auf',
    'erzaehlen':  'Erzählend und gemütlich, wie beim Vorlesen',
    'pointe':     'Warm und mit einem Augenzwinkern',
    'triumph':    'Triumphierend und stolz, der Fall ist gelöst',
    'jubel':      'Fröhlich und lobend, kurz und schwungvoll',
    'draengend':  'Drängend und schnell, du willst sofort in die richtige '
                  'Richtung zeigen',
    'sanft':      'Sanft und aufmunternd, das war knapp daneben',
    'heimlich':   'Leise und geheimnisvoll, fast geflüstert',
}

# Die eine Anweisung für alle Zeugenaussagen. Bewusst knapp und ohne jede
# Färbung: was hier steht, gilt für Lüge und Wahrheit gleichermassen.
AUSSAGE = 'Sprich neutral und sachlich, ohne besondere Betonung'

# Wer nach Stimmlage nicht zur Figur passt, bekommt die Figur als Anweisung
# mitgegeben. Gemini hat keine Kinderstimmen — «du bist zehn» ist die einzige
# Handhabe, und sie wirkt messbar (Achird 118 -> 141 Hz).
FIGUR = {
    'kevin': 'Du bist ein zehnjähriger Junge und sagst als Zeuge aus. ',
    'luis':  'Du bist ein elfjähriger Junge und sagst als Zeuge aus. ',
}


def situation(vid: str) -> str:
    for muster, name in MUSTER:
        if re.search(muster, vid):
            return name
    return 'anleitung'


def anweisung(vid: str, rolle: str) -> str:
    """Der Regiesatz, der dem Text vorangestellt wird."""
    lage = situation(vid)
    if lage == 'aussage' or rolle != 'erzaehler':
        return FIGUR.get(rolle, '') + AUSSAGE
    return RAHMEN + ANWEISUNG[lage]


# Schreibweisen, die Gemini zuverlässiger liest. Betrifft **nur** den Text,
# der ans Modell geht – auf dem Bildschirm steht weiterhin das Original.
#
# Bei Piper lief das über die Lautschrift, hier bleibt nur die Orthografie.
# Jeder Eintrag ist gemessen, nicht geraten: «Zickzack-Sohle» kam wiederholt
# als «Tick-Tack-Sole» zurück, «Zick-Zack-Sohle» sitzt.
LAUTSCHREIBUNG = {
    'Zickzack-Sohle': 'Zick-Zack-Sohle',
}


# Zeichensetzung, die dem Modell die Sprechmelodie verrät.
NACHDRUCK = {'triumph', 'jubel', 'draengend', 'fund'}


def text_faerben(vid: str, text: str) -> str:
    """Setzt bei Zeilen, die Nachdruck brauchen, den Schlusspunkt auf ein
    Ausrufezeichen."""
    for falsch, richtig in LAUTSCHREIBUNG.items():
        text = text.replace(falsch, richtig)
    if situation(vid) in NACHDRUCK and text.rstrip().endswith('.'):
        return text.rstrip()[:-1] + '!'
    return text


# Wörter, die nur in einer Regieanweisung vorkommen. Taucht eines davon in der
# Hörprobe auf, hat das Modell die Anweisung mitgesprochen.
REGIEWORTE = {
    'neugierig','fragend','sachlich','betonung','erzählend','gemütlich',
    'triumphierend','stolz','drängend','geheimnisvoll','aufmunternd',
    'entdeckerfroh','bestätigend','erklärend','auffordernd','augenzwinkern',
    'schwungvoll','lobend','achtjährigen','hochdeutsch',
    'zehnjähriger','elfjähriger','sprich','spannung','kriminalfall',
    # «Detektivbüro» und «Zeuge» stehen bewusst nicht hier: beide kommen im
    # echten Spieltext vor und würden Fehlalarme auslösen.
}
