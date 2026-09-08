"""Generates the home-screen icons: indigo tile, lantern-orange dot, celadon ring. Run: python tools/make_icons.py"""
from PIL import Image, ImageDraw
import os

ROOT = os.path.join(os.path.dirname(__file__), "..")
INDIGO, LANTERN, CELADON, PAPER = (47, 79, 134), (228, 87, 46), (94, 143, 120), (238, 241, 236)

def make(size, path, rounded):
    s = 4  # supersample
    W = size * s
    im = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if rounded:
        d.rounded_rectangle([0, 0, W - 1, W - 1], radius=W * 0.22, fill=INDIGO)
    else:
        d.rectangle([0, 0, W - 1, W - 1], fill=INDIGO)
    # route line: three stops joined left to right
    y = W * 0.56
    d.line([(W * 0.18, y), (W * 0.82, y)], fill=PAPER, width=int(W * 0.035))
    for x, col in ((0.18, CELADON), (0.50, PAPER), (0.82, PAPER)):
        r = W * 0.055
        d.ellipse([W * x - r, y - r, W * x + r, y + r], fill=col)
    # the "now" lantern, above the middle stop
    r = W * 0.12
    cx, cy = W * 0.50, W * 0.34
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=LANTERN)
    im = im.resize((size, size), Image.LANCZOS)
    im.save(path)

os.makedirs(os.path.join(ROOT, "icons"), exist_ok=True)
make(512, os.path.join(ROOT, "icons", "icon-512.png"), True)
make(192, os.path.join(ROOT, "icons", "icon-192.png"), True)
make(180, os.path.join(ROOT, "icons", "apple-touch-icon.png"), False)  # iOS rounds corners itself
make(32, os.path.join(ROOT, "icons", "favicon.png"), True)
print("icons written")
