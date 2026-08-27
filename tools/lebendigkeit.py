#!/usr/bin/env python3
"""Misst, wie lebendig die Aufnahmen klingen.

Verständlichkeit und Lebendigkeit sind zwei verschiedene Dinge. Die Hörprobe
(tools/hoerprobe.py) misst nur das erste – und wer allein darauf optimiert,
landet zwangsläufig bei einer flachen, gleichförmigen Stimme, weil genau die
am leichtesten zu erkennen ist.

Dieses Werkzeug misst das zweite, an drei Grössen:

* **Tonumfang** – wie weit die Sprechmelodie in Halbtönen schwankt. Nüchternes
  Vorlesen liegt bei 2 bis 3 Halbtönen, lebendiges Erzählen bei 4 bis 7.
  Unter 2 klingt es monoton.
* **Tonspanne** – Abstand zwischen dem oberen und unteren Zehntel der
  Melodie. Zeigt, ob es echte Höhen und Tiefen gibt oder nur Zittern.
* **Rhythmus** – Schwankung der Silbenlänge. Immer gleich lange Silben
  klingen wie ein Metronom.
* **Abwechslung** – und das ist die entscheidende Grösse: wie stark sich die
  Zeilen *untereinander* unterscheiden. Eine Stimme kann in jedem Satz eine
  schöne Melodie haben und trotzdem langweilen, wenn alle 108 Sätze im selben
  Tonfall, gleich schnell und gleich laut gelesen werden. Genau das war der
  Fehler der ersten Fassung: 1,15 Halbtöne Unterschied zwischen den Zeilen.

Aufruf:  python3 tools/lebendigkeit.py [--nur PRAEFIX] [--datei PFAD]
"""
import os, sys, statistics

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

ZIEL = "assets/voice"


def masse(pfad):
    """Tonumfang, Tonspanne und Rhythmusschwankung einer Aufnahme."""
    import numpy as np
    import parselmouth

    ton = parselmouth.Sound(pfad)
    hoehe = ton.to_pitch(time_step=0.01, pitch_floor=70, pitch_ceiling=500)
    f = hoehe.selected_array['frequency']
    f = f[f > 0]
    if len(f) < 12:
        return None

    halbton = 12 * np.log2(f / np.median(f))
    umfang = float(np.std(halbton))
    spanne = float(np.percentile(halbton, 90) - np.percentile(halbton, 10))

    # Rhythmus über die Lautstärkehülle: Abstände zwischen den Silbengipfeln
    hull = ton.to_intensity(minimum_pitch=70, time_step=0.01)
    p = np.asarray(hull.values).ravel()
    p = p[np.isfinite(p)]
    gipfel = []
    for i in range(2, len(p) - 2):
        if p[i] > p[i-1] and p[i] >= p[i+1] and p[i] > np.mean(p):
            if not gipfel or i - gipfel[-1] > 7:      # mind. 70 ms auseinander
                gipfel.append(i)
    if len(gipfel) > 3:
        ab = np.diff(gipfel)
        rhythmus = float(np.std(ab) / np.mean(ab))
    else:
        rhythmus = 0.0
    laut = float(np.mean([v for v in np.asarray(hull.values).ravel()
                          if np.isfinite(v)]))
    return {'umfang': umfang, 'spanne': spanne, 'rhythmus': rhythmus,
            'dauer': ton.get_total_duration(),
            'ton': float(np.median(f)), 'laut': laut}


def bewerten(werte):
    """Kurzurteil in Worten, damit die Zahlen einordbar bleiben."""
    u = werte['umfang']
    if u < 1.6:  return 'monoton'
    if u < 2.6:  return 'nüchtern'
    if u < 4.0:  return 'lebendig'
    return 'sehr lebendig'


def main():
    a = sys.argv[1:]
    if '--datei' in a:
        w = masse(a[a.index('--datei') + 1])
        print(w, bewerten(w) if w else '')
        return 0

    from voice import zeilen
    nur = a[a.index('--nur') + 1] if '--nur' in a else None
    L = zeilen()
    if nur:
        L = [x for x in L if x[0].startswith(nur)]

    proRolle = {}
    alle = []
    for vid, text, rolle in L:
        p = f"{ZIEL}/{vid}.mp3"
        if not os.path.exists(p):
            continue
        w = masse(p)
        if not w:
            continue
        w['vid'] = vid
        w['rolle'] = rolle
        w['tempo'] = len(text.split()) / max(0.2, w['dauer'])
        alle.append(w)
        proRolle.setdefault(rolle, []).append(w)

    if not alle:
        print("Keine Aufnahmen gefunden.")
        return 1

    def mit(xs, k):
        return statistics.median(x[k] for x in xs)

    print(f"{'Rolle':14s} {'Zeilen':>7} {'Tonumfang':>10} {'Tonspanne':>10} "
          f"{'Rhythmus':>9}  Urteil")
    for rolle, xs in sorted(proRolle.items(), key=lambda r: -len(r[1])):
        m = {'umfang': mit(xs, 'umfang'), 'spanne': mit(xs, 'spanne'),
             'rhythmus': mit(xs, 'rhythmus')}
        print(f"{rolle:14s} {len(xs):7d} {m['umfang']:9.2f}  {m['spanne']:9.2f}  "
              f"{m['rhythmus']:8.2f}  {bewerten(m)}")

    g = {'umfang': mit(alle, 'umfang'), 'spanne': mit(alle, 'spanne'),
         'rhythmus': mit(alle, 'rhythmus')}
    print(f"\n{'ALLE':14s} {len(alle):7d} {g['umfang']:9.2f}  {g['spanne']:9.2f}  "
          f"{g['rhythmus']:8.2f}  {bewerten(g)}")

    # Abwechslung zwischen den Zeilen – nur für den Erzähler sinnvoll,
    # er trägt vier Fünftel des Textes.
    import numpy as np
    erz = [x for x in alle if x['rolle'] == 'erzaehler']
    if len(erz) > 5:
        ton = 12 * np.log2(np.array([x['ton'] for x in erz]) /
                           np.median([x['ton'] for x in erz]))
        tempo = np.array([x['tempo'] for x in erz])
        laut = np.array([x['laut'] for x in erz])
        ab = {'ton': float(np.std(ton)),
              'tempo': float(np.std(tempo) / np.mean(tempo) * 100),
              'laut': float(np.std(laut))}
        print(f"\nAbwechslung zwischen den {len(erz)} Erzählerzeilen:")
        print(f"  Grundton   {ab['ton']:5.2f} Halbtöne")
        print(f"  Tempo      {ab['tempo']:5.0f} %")
        print(f"  Lautheit   {ab['laut']:5.2f} dB")
    else:
        ab = None

    flach = sorted(alle, key=lambda x: x['umfang'])[:8]
    print("\nFlachste Zeilen:")
    for x in flach:
        print(f"  {x['umfang']:5.2f}  {x['vid']}")

    # Vorgaben: im Mittel lebendig, keine Rolle monoton, und vor allem
    # hörbare Abwechslung zwischen den Zeilen.
    fehler = []
    if g['umfang'] < 2.6:
        fehler.append(f"Gesamt-Tonumfang {g['umfang']:.2f} – zu flach")
    for rolle, xs in proRolle.items():
        u = mit(xs, 'umfang')
        if u < 2.0:
            fehler.append(f"{rolle}: Tonumfang {u:.2f}")
    if ab:
        if ab['ton'] < 1.8:
            fehler.append(f"Grundton-Abwechslung {ab['ton']:.2f} Halbtöne – "
                          f"alle Zeilen klingen gleich hoch")
        if ab['laut'] < 1.8:
            fehler.append(f"Lautheits-Abwechslung {ab['laut']:.2f} dB – "
                          f"alle Zeilen gleich laut")
        if ab['tempo'] < 15:
            fehler.append(f"Tempo-Abwechslung {ab['tempo']:.0f} % – "
                          f"alle Zeilen gleich schnell")
    print()
    if fehler:
        print("✗ " + "; ".join(fehler))
        return 1
    print("✓ Sprechmelodie im lebendigen Bereich")
    return 0


if __name__ == '__main__':
    sys.exit(main())
