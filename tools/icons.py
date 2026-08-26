from PIL import Image, ImageDraw
import os

NAVY   = (13, 24, 38, 255)
NAVY_T = (30, 58, 94, 255)
NAVY2  = (23, 42, 66, 255)
GOLD   = (255, 181, 71, 255)
GOLD_D = (198, 128, 26, 255)
LIGHT  = (219, 234, 255, 255)

def bg_gradient(S):
    g = Image.new("RGBA", (1, S))
    d = ImageDraw.Draw(g)
    for y in range(S):
        t = y / (S - 1)
        c = tuple(int(NAVY_T[i] + (NAVY[i] - NAVY_T[i]) * (t ** 0.75)) for i in range(3))
        d.point((0, y), fill=c + (255,))
    return g.resize((S, S), Image.BILINEAR)

def draw_icon(size, pad_ratio=0.10, bleed=False, radius_ratio=0.22):
    S = size * 4
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    grad = bg_gradient(S)
    if bleed:
        img.alpha_composite(grad)
    else:
        mask = Image.new("L", (S, S), 0)
        ImageDraw.Draw(mask).rounded_rectangle(
            [0, 0, S - 1, S - 1], radius=int(S * radius_ratio), fill=255)
        img.paste(grad, (0, 0), mask)
    d = ImageDraw.Draw(img)

    pad = S * pad_ratio
    inner = S - 2 * pad
    cx, cy = pad + inner * 0.43, pad + inner * 0.41
    R = inner * 0.345
    ring = inner * 0.072

    hx, hy = cx + R * 0.72, cy + R * 0.72
    ex, ey = pad + inner * 0.93, pad + inner * 0.95
    d.line([hx, hy, ex, ey], fill=GOLD_D, width=int(ring * 2.2))
    d.line([hx - ring * .2, hy - ring * .2, ex - ring * .2, ey - ring * .2],
           fill=GOLD, width=int(ring * 1.35))

    d.ellipse([cx - R, cy - R, cx + R, cy + R], fill=NAVY2)

    # Fingerabdruck: Bogenmuster
    lw = max(2, int(R * 0.085))
    for i in range(5):
        rx = R * (0.20 + i * 0.145)
        ry = rx * 1.15
        yc = cy + R * 0.30
        d.arc([cx - rx, yc - ry, cx + rx, yc + ry], start=185, end=355, fill=LIGHT, width=lw)
    for i in range(2):
        y = cy + R * 0.50 + i * R * 0.20
        d.arc([cx - R * 0.78, y - R * 0.30, cx + R * 0.78, y + R * 0.30],
              start=200, end=340, fill=LIGHT, width=lw)

    d.ellipse([cx - R, cy - R, cx + R, cy + R], outline=GOLD, width=int(ring))
    return img.resize((size, size), Image.LANCZOS)

os.makedirs("assets/icons", exist_ok=True)
draw_icon(192).save("assets/icons/icon-192.png")
draw_icon(512).save("assets/icons/icon-512.png")
draw_icon(512, pad_ratio=0.21, bleed=True).save("assets/icons/maskable-512.png")
draw_icon(180, radius_ratio=0.0).save("assets/icons/apple-touch-icon.png")
print("ok")
