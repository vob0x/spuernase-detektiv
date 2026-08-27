#!/usr/bin/env python3
"""Prüft das Aussprachewörterbuch gegen die echten Spieltexte.

Drei Fragen:
  1. Greift jeder Eintrag überhaupt irgendwo? Tote Einträge sind Ballast.
  2. Ist die falsche Lautfolge danach wirklich verschwunden?
  3. Bleibt irgendwo ein buchstabierter Wortanfang übrig?
"""
import os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from aussprache import LAUTE, TEXT, text_vorbereiten, laute_korrigieren
from voice import zeilen
from piper.phonemize_espeak import EspeakPhonemizer

# Buchstabennamen, die am Wortanfang auftauchen, wenn espeak kapituliert
BUCHSTABEN = ['tsˈɛt', 'ˈɛs ', 'ˈɛf ', 'ˈɛm ', 'ˈɛn ', 'ˈɛl ', 'ˈhaː ',
              'kˈaː ', 'pˈeː ', 'tˈeː ', 'bˈeː ', 'dˈeː ', 'ˈuː ']


def main():
    ph = EspeakPhonemizer()
    L = zeilen()
    roh, neu = [], []
    for vid, text, rolle in L:
        r = ''.join(''.join(s) for s in ph.phonemize("de", text))
        n = ''.join(''.join(s) for s in ph.phonemize("de", text_vorbereiten(text)))
        roh.append((vid, text, r))
        neu.append((vid, text, laute_korrigieren(n)))

    alles_roh = ' '.join(x[2] for x in roh)
    alles_neu = ' '.join(x[2] for x in neu)

    fehler = []

    print(f"{len(L)} Zeilen eingelautet\n")
    print("Einträge im Wörterbuch:")
    tot = 0
    for falsch, richtig in LAUTE:
        traf = alles_roh.count(falsch)
        rest = alles_neu.count(falsch)
        # Manche Einträge greifen erst nach der Textstufe (Notrufnummern).
        if traf == 0:
            tot += 1
            print(f"  –  {falsch:22s} greift nirgends")
        else:
            zeichen = '✓' if rest == 0 else '✗'
            print(f"  {zeichen}  {falsch:22s} -> {richtig:20s} {traf}x ersetzt"
                  + (f", {rest}x ÜBRIG" if rest else ""))
            if rest:
                fehler.append(f"{falsch} steht noch {rest}x in der Lautschrift")
    if tot:
        print(f"  ({tot} Einträge greifen in den aktuellen Texten nicht – "
              f"kein Fehler, nur Vorrat)")

    print("\nTextregeln:")
    for muster, ersatz in TEXT:
        n = sum(1 for _, t, _ in roh if re.search(muster, t))
        print(f"  {'✓' if n else '–'}  {muster:34s} {n}x")

    print("\nBuchstabierte Wortanfänge:")
    # Wortweise prüfen: espeak buchstabiert, wenn es einen Wortanfang nicht
    # aussprechen kann. Erkennbar daran, dass die Laute eines mehrbuchstabigen
    # Wortes mit einem Buchstabennamen beginnen.
    NAMEN = {'tsˈɛt': 'z', 'ˈɛs': 's', 'ˈɛf': 'f', 'ˈɛm': 'm', 'ˈɛn': 'n',
             'ˈɛl': 'l', 'hˈaː': 'h', 'kˈaː': 'k', 'pˈeː': 'p', 'tˈeː': 't',
             'bˈeː': 'b', 'dˈeː': 'd'}

    def buchstabiert(wort, korrigieren):
        if len(wort) < 3:
            return None
        t = text_vorbereiten(wort) if korrigieren else wort
        p = ''.join(''.join(x) for x in ph.phonemize("de", t))
        if korrigieren:
            p = laute_korrigieren(p)
        for laut, b in NAMEN.items():
            # Buchstabenname am Anfang, obwohl das Wort weitergeht
            if p.startswith(laut) and len(p) > len(laut) + 2 \
               and wort[0].lower() == b and wort[1].lower() not in 'aeiouäöü':
                return b
        return None

    woerter = sorted({w for _, t, _ in roh
                      for w in re.findall(r"[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß\-']*", t)})
    vorher = [w for w in woerter if buchstabiert(w, False)]
    nachher = [w for w in woerter if buchstabiert(w, True)]
    print(f"  vorher {len(vorher)} Wörter betroffen"
          + (f" ({', '.join(vorher)})" if vorher else "")
          + f", jetzt {len(nachher)}"
          + (f" ({', '.join(nachher)})" if nachher else ""))
    for w in nachher:
        fehler.append(f"«{w}» wird immer noch buchstabiert")

    # Kennen alle benutzten Modelle jeden Laut, den wir erzeugen?
    # eva_k fehlte das Kombinationszeichen der Cedille – aus «ich» wurde «ick».
    print("\nLautbestand der Stimmen:")
    import json as _json
    from voice import CAST
    modelle = sorted({m for m, *_ in CAST.values()})
    for mod in modelle:
        hat = set(_json.load(open(mod + '.json'))['phoneme_id_map'])
        rollen = {r for r, (m, *_r) in CAST.items() if m == mod}
        fehlend = {}
        for vid, text, rolle in L:
            if rolle not in rollen:
                continue
            p2 = laute_korrigieren(''.join(''.join(x) for x in
                                   ph.phonemize("de", text_vorbereiten(text))))
            for ch in set(p2):
                if ch not in hat:
                    fehlend.setdefault(ch, []).append(vid)
        name = mod.split('/')[-1].replace('.onnx', '')
        if fehlend:
            for ch, wo in fehlend.items():
                print(f"  ✗ {name}: U+{ord(ch):04X} fehlt, {len(wo)} Zeilen betroffen")
                fehler.append(f"{name} kennt U+{ord(ch):04X} nicht ({len(wo)} Zeilen)")
        else:
            print(f"  ✓ {name}: alle Laute vorhanden")

    print()
    if fehler:
        print(f"✗ {len(fehler)} Probleme:")
        for f in fehler:
            print("   - " + f)
        return 1
    print("✓ Aussprachewörterbuch greift vollständig")
    return 0


if __name__ == '__main__':
    sys.exit(main())
