"""Re-encodes every photo in img/ to a phone-sized JPEG (max 640 px wide, quality 72). PNGs become JPGs. Safe to re-run."""
from PIL import Image, ImageOps
import os

ROOT = os.path.join(os.path.dirname(__file__), "..")
IMG = os.path.join(ROOT, "img")
MAX_W = 560
before = after = n = 0
for f in sorted(os.listdir(IMG)):
    p = os.path.join(IMG, f)
    if not f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
        continue
    size0 = os.path.getsize(p)
    try:
        im = Image.open(p)
        im = ImageOps.exif_transpose(im)
        if im.mode not in ("RGB",):
            im = im.convert("RGB")
        if im.width > MAX_W:
            im = im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)
        out = os.path.splitext(p)[0] + ".jpg"
        # skip files that are already small jpgs at the target width
        if out == p and size0 <= 60_000 and im.width <= MAX_W:
            continue
        im.save(out, "JPEG", quality=68, optimize=True, progressive=True)
        if out != p:
            os.remove(p)
        before += size0
        after += os.path.getsize(out)
        n += 1
    except Exception as e:
        print("skip", f, e)
print(f"shrink: {n} photos, {before/1048576:.1f} MB -> {after/1048576:.1f} MB")
