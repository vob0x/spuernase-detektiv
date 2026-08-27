#!/usr/bin/env python3
"""Regieanweisungen für die Vertonung.

Eine Stimme klingt nicht monoton, weil ihr innerhalb eines Satzes die Melodie
fehlt – die hat sie. Sie klingt monoton, weil **jede Zeile gleich gelesen wird**.
Gemessen an den 108 Erzählerzeilen der ersten Fassung: Grundton-Unterschied
zwischen den Zeilen 1,15 Halbtöne, Lautheitsunterschied 1,5 dB. Alles im selben
Tonfall, gleich schnell, gleich laut – vom Fallbeginn bis zur Verhaftung.

Hier bekommt jede Zeile eine Anweisung: in welcher Färbung, wie schnell, wie
laut, wie hoch. «Fall gelöst» wird laut und schnell, «Es ist dunkel» leise und
langsam, der Hund, der bellt, drängend.

**Eine Ausnahme ist wichtig:** Zeugenaussagen bekommen alle dieselbe Anweisung.
Würde die Lüge anders klingen als die Wahrheit, wäre das Rätsel verraten.

Die Werte sind eingemessen: zu kräftige Anweisungen kosten Verständlichkeit.
Bei Tonhöhen um +9 % und Tempo 0,88 fielen genau die kurzen, lauten Zeilen
(Hundebellen, Jubel) in der Hörprobe durch. Sie sind darum zurückgenommen.
"""
import hashlib
import re

# Färbungen des Modells thorsten_emotional
AMUSED, ANGRY, DISGUSTED, DRUNK, NEUTRAL, SLEEPY, SURPRISED, WHISPER = range(8)

# (Färbung, Tempo, Lautheit dB, Tonhöhe, Rhythmus, Ausdruck)
#   Tempo    > 1 = langsamer (length_scale)
#   Lautheit: Zielwert für loudnorm, lauter = näher an 0
#   Tonhöhe:  Faktor auf die Grundtonhöhe der Rolle
#   Rhythmus: noise_w_scale, höher = ungleichmässigere Silbenlängen
#   Ausdruck: noise_scale. Die Modellvorgabe ist 0,667. Höhere Werte geben mehr
#             Melodie, kosten aber Verständlichkeit – bei 0,8 bis 1,0 fiel die
#             Hörprobe von 102 auf 89 von 135 sauber verstandenen Aufnahmen.
#             Deshalb bleibt der Regler nahe der Vorgabe. Die Abwechslung
#             kommt aus Färbung, Tempo, Lautheit und Tonhöhe – die kosten nichts.
ANWEISUNG = {
    'ernst':      (NEUTRAL,   1.08, -17.5, 0.98, 1.00, 0.667),
    'anleitung':  (AMUSED,    1.00, -16.0, 1.00, 1.05, 0.70),
    'frage':      (SURPRISED, 0.99, -15.0, 1.03, 1.05, 0.70),
    'fund':       (AMUSED,    0.93, -14.5, 1.05, 1.10, 0.72),
    'bestaetigt': (AMUSED,    0.96, -14.5, 1.03, 1.05, 0.70),
    'erklaerung': (NEUTRAL,   1.05, -16.5, 0.99, 1.00, 0.667),
    'erzaehlen':  (AMUSED,    1.03, -16.5, 1.00, 1.00, 0.667),
    'pointe':     (AMUSED,    0.97, -14.5, 1.04, 1.10, 0.72),
    'triumph':    (SURPRISED, 0.93, -13.0, 1.05, 1.10, 0.72),
    'jubel':      (AMUSED,    0.93, -13.5, 1.05, 1.10, 0.72),
    'draengend':  (SURPRISED, 0.94, -14.0, 1.04, 1.05, 0.70),
    'sanft':      (SLEEPY,    1.06, -18.0, 0.97, 1.00, 0.667),
    'heimlich':   (SLEEPY,    1.14, -20.0, 0.95, 1.00, 0.667),
    'aussage':    (AMUSED,    1.00, -16.0, 1.00, 1.00, 0.667),
}

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
    (r'-wusst$',                        'ernst'),
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


def situation(vid: str) -> str:
    for muster, name in MUSTER:
        if re.search(muster, vid):
            return name
    return 'anleitung'


def _jitter(vid: str, weite: float) -> float:
    """Winziger, aber fester Versatz je Zeile – gegen den Eindruck, dass
    alle Zeilen derselben Art exakt gleich klingen. Aus der Kennung
    abgeleitet, damit dieselbe Zeile immer gleich vertont wird."""
    h = int(hashlib.sha1(vid.encode()).hexdigest()[:8], 16)
    return (h / 0xFFFFFFFF - 0.5) * 2 * weite


def anweisung(vid: str, rolle: str):
    """Liefert (Färbung, Tempo, Lautheit, Tonhöhenfaktor, Rhythmus, Ausdruck)."""
    lage = situation(vid)
    faerbung, tempo, laut, hoehe, rhythmus, ausdruck = ANWEISUNG[lage]

    # Zeugenaussagen: alle gleich. Sonst verrät der Tonfall die Lüge.
    if lage == 'aussage':
        return faerbung, tempo, laut, hoehe, rhythmus, ausdruck

    tempo += _jitter(vid, 0.06)
    laut  += _jitter(vid + 'l', 1.4)
    hoehe += _jitter(vid + 'h', 0.025)
    return (faerbung, round(tempo, 3), round(laut, 2), round(hoehe, 4),
            rhythmus, ausdruck)


# Zeichensetzung, die dem Modell die Sprechmelodie verrät.
# Ein Punkt endet fallend, ein Ausrufezeichen mit Nachdruck.
NACHDRUCK = {
    'triumph', 'jubel', 'draengend', 'fund',
}


def text_faerben(vid: str, text: str) -> str:
    """Setzt bei Zeilen, die Nachdruck brauchen, den Schlusspunkt auf ein
    Ausrufezeichen – espeak wählt danach eine andere Schlusskontur."""
    if situation(vid) in NACHDRUCK and text.rstrip().endswith('.'):
        return text.rstrip()[:-1] + '!'
    return text
