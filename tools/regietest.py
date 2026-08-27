#!/usr/bin/env python3
"""Prüft die Regie, bevor 135 Aufrufe ans Modell gehen.

Drei Dinge können hier still kaputtgehen:

1. Ein Eintrag in LAUTSCHREIBUNG greift auf keiner Zeile mehr, weil der
   Spieltext sich geändert hat. Dann steht eine Regel im Code, die nichts tut.
2. Ein Regiewort kommt auch im echten Spieltext vor. Dann meldet die Hörprobe
   in voice.py einen Fehlalarm und wiederholt eine tadellose Zeile viermal.
3. Zwei Aussagen desselben Zeugen bekommen unterschiedliche Anweisungen. Dann
   verrät der Tonfall die Lüge – der einzige Fehler hier, der das Rätsel
   kaputtmacht statt nur den Klang.

Aufruf:  python3 tools/regietest.py
"""
import os, sys, collections

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from regie import LAUTSCHREIBUNG, REGIEWORTE, anweisung, text_faerben, situation
from hoerprobe import worte
from voice import zeilen, CAST


def main():
    L = zeilen()
    fehler = []

    # 1 – jeder Eintrag muss auf mindestens einer Zeile greifen
    for falsch, richtig in LAUTSCHREIBUNG.items():
        trifft = [v for v, t, r in L if falsch in t]
        if not trifft:
            fehler.append(f"LAUTSCHREIBUNG «{falsch}» greift auf keiner Zeile")
        else:
            print(f"✓ «{falsch}» → «{richtig}»  ({len(trifft)}×: {', '.join(trifft[:3])})")

    # 2 – kein Regiewort darf im Spieltext vorkommen
    im_text = set()
    for v, t, r in L:
        im_text |= set(worte(t))
    kollision = sorted(REGIEWORTE & im_text)
    if kollision:
        fehler.append(f"Regiewörter stehen auch im Spieltext: {', '.join(kollision)}")
    else:
        print(f"✓ {len(REGIEWORTE)} Regiewörter, keines im Spieltext")

    # 3 – alle Aussagen eines Zeugen brauchen dieselbe Anweisung
    proZeuge = collections.defaultdict(set)
    for v, t, r in L:
        if situation(v) == 'aussage':
            proZeuge[(v.rsplit('-a', 1)[0], r)].add(anweisung(v, r))
    for (zeuge, rolle), anw in sorted(proZeuge.items()):
        if len(anw) > 1:
            fehler.append(f"{zeuge}: {len(anw)} verschiedene Anweisungen – "
                          f"der Tonfall würde die Lüge verraten")
    print(f"✓ {len(proZeuge)} Zeugen, je eine einzige Anweisung für alle Aussagen")

    # 4 – jede sprechende Rolle braucht eine Stimme
    ohne = sorted({r for v, t, r in L} - set(CAST))
    if ohne:
        fehler.append(f"Rollen ohne Stimme: {', '.join(ohne)}")
    else:
        rollen = sorted({r for v, t, r in L})
        print(f"✓ {len(rollen)} sprechende Rollen, alle besetzt")
        for r in rollen:
            n = sum(1 for v, t, rr in L if rr == r)
            print(f"    {r:12s} {n:3d} Zeilen  →  {CAST[r]}")

    print()
    if fehler:
        for f in fehler:
            print("✗ " + f)
        return 1
    print("✓ Regie in Ordnung")
    return 0


if __name__ == '__main__':
    sys.exit(main())
