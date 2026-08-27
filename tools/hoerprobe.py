#!/usr/bin/env python3
"""Hört jede erzeugte Aufnahme mit einem Spracherkenner ab und vergleicht sie
mit dem Text, der gesprochen werden sollte. Findet grobe Aussprachefehler –
etwa buchstabierte Wörter – die man sonst nur durch Zuhören bemerkt.

Aufruf:  python3 tools/hoerprobe.py [--modell small] [--nur PRAEFIX]
"""
import json, os, re, sys, difflib

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from voice import zeilen                     # dieselbe Textquelle wie die Vertonung

ZIEL = "assets/voice"

# Der Erkenner schreibt Zahlen als Ziffern und Einheiten abgekürzt.
# «24 cm» statt «vierundzwanzig Zentimeter» ist richtig gesprochen und darf
# nicht als Aussprachefehler zählen.
ZAHL = {'null':'0','eins':'1','ein':'1','zwei':'2','drei':'3','vier':'4','fünf':'5',
        'sechs':'6','sieben':'7','acht':'8','neun':'9','zehn':'10','elf':'11',
        'zwölf':'12','dreizehn':'13','vierzehn':'14','fünfzehn':'15','sechzehn':'16',
        'siebzehn':'17','achtzehn':'18','neunzehn':'19','zwanzig':'20',
        'dreissig':'30','vierzig':'40','fünfzig':'50',
        'vierundzwanzig':'24','achtunddreissig':'38','sechsunddreissig':'36',
        'zentimeter':'cm','meter':'m','uhr':'', 'grösse':'grosse'}

def worte(s):
    s = s.lower().replace('ß', 'ss')
    s = re.sub(r'[^a-zäöüà-ÿ0-9 ]', ' ', s)
    aus = []
    for w in s.split():
        w = ZAHL.get(w, w)
        if w:
            aus.append(w)
    return aus

def main():
    modell = "small"
    nur = None
    a = sys.argv[1:]
    if '--modell' in a: modell = a[a.index('--modell') + 1]
    if '--nur' in a:    nur = a[a.index('--nur') + 1]

    from faster_whisper import WhisperModel
    m = WhisperModel(modell, device="cpu", compute_type="int8")

    L = zeilen()
    if nur: L = [x for x in L if x[0].startswith(nur)]

    schlecht, gut, fehlt = [], 0, 0
    for vid, text, rolle in L:
        pfad = f"{ZIEL}/{vid}.mp3"
        if not os.path.exists(pfad):
            fehlt += 1
            continue
        segs, _ = m.transcribe(pfad, language="de", beam_size=5)
        gehoert = " ".join(s.text.strip() for s in segs)
        a1, a2 = worte(text), worte(gehoert)
        quote = difflib.SequenceMatcher(None, a1, a2).ratio()
        # Buchstabiertes Wort: einzelner Buchstabe als eigenes Wort im Gehoerten,
        # der im Ausgangstext nicht vorkommt.
        buchstabiert = [w for w in a2 if len(w) == 1 and w.isalpha() and w not in a1]
        if quote < 0.72 or buchstabiert:
            schlecht.append((vid, rolle, text, gehoert, quote, buchstabiert))
        else:
            gut += 1

    print(f"{gut} von {len(L) - fehlt} Aufnahmen sauber verstanden"
          + (f", {fehlt} fehlen" if fehlt else ""))
    if schlecht:
        print(f"\n{len(schlecht)} auffällige Aufnahmen:")
        for vid, rolle, text, gehoert, q, b in sorted(schlecht, key=lambda x: x[4]):
            print(f"\n  {vid}  ({rolle}, Übereinstimmung {q:.2f}"
                  + (f", buchstabiert: {' '.join(b)}" if b else "") + ")")
            print(f"    Text     : {text}")
            print(f"    Gehört   : {gehoert}")
    return 1 if schlecht else 0

if __name__ == '__main__':
    sys.exit(main())
