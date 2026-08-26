"""Schneidet 2x2-Portraetboegen in Einzelportraets.
Findet die weissen Trennlinien selbst, statt feste Koordinaten anzunehmen."""
import sys, os
from PIL import Image

def weiss_anteil(im, achse):
    px = im.load()
    w, h = im.size
    out = []
    if achse == 'x':
        for x in range(w):
            n = sum(1 for y in range(0, h, 4) if min(px[x, y]) > 238)
            out.append(n / len(range(0, h, 4)))
    else:
        for y in range(h):
            n = sum(1 for x in range(0, w, 4) if min(px[x, y]) > 238)
            out.append(n / len(range(0, w, 4)))
    return out

def laengster_lauf(vals, lo, hi, grenze=0.93):
    best = (0, 0, 0)
    i = lo
    while i < hi:
        if vals[i] >= grenze:
            j = i
            while j < hi and vals[j] >= grenze:
                j += 1
            if j - i > best[0]:
                best = (j - i, i, j)
            i = j
        else:
            i += 1
    return best

def rand_trimmen(vals, grenze=0.93):
    a = 0
    while a < len(vals) and vals[a] >= grenze:
        a += 1
    b = len(vals) - 1
    while b > a and vals[b] >= grenze:
        b -= 1
    return a, b + 1

def schneiden(pfad, namen, ziel_dir, groesse=320):
    im = Image.open(pfad).convert("RGB")
    xs, ys = weiss_anteil(im, 'x'), weiss_anteil(im, 'y')
    x0, x1 = rand_trimmen(xs)
    y0, y1 = rand_trimmen(ys)
    gw = laengster_lauf(xs, x0 + (x1 - x0) // 4, x1 - (x1 - x0) // 4)
    gh = laengster_lauf(ys, y0 + (y1 - y0) // 4, y1 - (y1 - y0) // 4)
    if gw[0] < 4 or gh[0] < 4:
        raise SystemExit(f"{os.path.basename(pfad)}: keine Trennlinien gefunden ({gw[0]}/{gh[0]})")
    mx1, mx2 = gw[1], gw[2]
    my1, my2 = gh[1], gh[2]
    felder = [(x0, y0, mx1, my1), (mx2, y0, x1, my1),
              (x0, my2, mx1, y1), (mx2, my2, x1, y1)]
    os.makedirs(ziel_dir, exist_ok=True)
    for (box, name) in zip(felder, namen):
        if not name:
            continue
        p = im.crop(box)
        w, h = p.size
        # auf Quadrat bringen: mittig in der Breite, oben in der Hoehe (Kopf sitzt oben)
        s = min(w, h)
        left = (w - s) // 2
        top = 0 if h > w else (h - s) // 2
        p = p.crop((left, top, left + s, top + s)).resize((groesse, groesse), Image.LANCZOS)
        out = os.path.join(ziel_dir, name + ".webp")
        p.save(out, "WEBP", quality=82, method=6)
        print(f"  {name:12s} {box}  {os.path.getsize(out)//1024} KB")

if __name__ == "__main__":
    pfad, ziel = sys.argv[1], sys.argv[2]
    namen = sys.argv[3].split(',')
    print(os.path.basename(pfad))
    schneiden(pfad, namen, ziel)
