import sys, os
from PIL import Image, ImageChops

def autocrop_black(im, thresh=24):
    g = im.convert("L")
    bw = g.point(lambda p: 255 if p > thresh else 0)
    bbox = bw.getbbox()
    return im.crop(bbox) if bbox else im

def main(src, dst, width=900, quality=72, ratio=None):
    im = Image.open(src).convert("RGB")
    im = autocrop_black(im)
    if ratio:
        tw, th = ratio
        w, h = im.size
        want = tw / th
        have = w / h
        if have > want:            # zu breit -> seitlich beschneiden
            nw = int(h * want); im = im.crop(((w - nw) // 2, 0, (w + nw) // 2, h))
        elif have < want:          # zu hoch -> oben/unten beschneiden
            nh = int(w / want); im = im.crop((0, (h - nh) // 2, w, (h + nh) // 2))
    h = round(width * im.size[1] / im.size[0])
    im = im.resize((width, h), Image.LANCZOS)
    im.save(dst, "WEBP", quality=quality, method=6)
    print(f"{os.path.basename(dst)}  {im.size[0]}x{im.size[1]}  {os.path.getsize(dst)//1024} KB")

if __name__ == "__main__":
    src, dst = sys.argv[1], sys.argv[2]
    w = int(sys.argv[3]) if len(sys.argv) > 3 else 900
    r = tuple(map(int, sys.argv[4].split(':'))) if len(sys.argv) > 4 else None
    main(src, dst, w, 72, r)
