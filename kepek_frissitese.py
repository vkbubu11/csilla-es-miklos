"""
Képek frissítése a weboldalhoz.

Használat:
  1. Tedd a fotókat ide:
       img/galeria/            – a galéria képei
       img/utazasok/<mappa>/   – az utazások képei (a mappanév egyezzen a js/config.js "folder" mezőjével)
  2. Futtasd ebből a mappából:   python kepek_frissitese.py
     (Kell hozzá: pip install pillow)

A szkript a túl nagy képeket webes méretre kicsinyíti (a forrásfájlt felülírja,
de csak ha nagyobb 2000 px-nél), bélyegképeket készít a thumbs/ almappákba,
és újraírja a js/photos.js fájlt.
"""
import json, os, sys
from pathlib import Path
try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Hiányzik a Pillow:  pip install pillow")

ROOT = Path(__file__).resolve().parent
EXT = {".jpg", ".jpeg", ".png", ".webp"}
MAX, THUMB = 2000, 600


def process(folder: Path, rel: str):
    out = []
    if not folder.exists():
        return out
    tdir = folder / "thumbs"
    for f in sorted(folder.iterdir(), key=lambda p: p.name.lower()):
        if f.suffix.lower() not in EXT or not f.is_file():
            continue
        im = ImageOps.exif_transpose(Image.open(f)).convert("RGB")
        if max(im.size) > MAX:
            im.thumbnail((MAX, MAX), Image.LANCZOS)
            f = f.with_suffix(".jpg")
            im.save(f, quality=84, optimize=True, progressive=True)
        tdir.mkdir(exist_ok=True)
        t = im.copy(); t.thumbnail((THUMB, THUMB * 2), Image.LANCZOS)
        tf = tdir / (f.stem + ".jpg")
        t.save(tf, quality=80, optimize=True, progressive=True)
        out.append({"src": f"{rel}/{f.name}", "thumb": f"{rel}/thumbs/{tf.name}", "w": t.width, "h": t.height})
    return out


def main():
    data = {"gallery": process(ROOT / "img" / "galeria", "img/galeria"), "travels": {}}
    trav = ROOT / "img" / "utazasok"
    if trav.exists():
        for d in sorted(p for p in trav.iterdir() if p.is_dir()):
            data["travels"][d.name] = process(d, f"img/utazasok/{d.name}")
    js = "/* Automatikusan generált fájl – a kepek_frissitese.py írja. */\nwindow.PHOTOS = " + \
         json.dumps(data, ensure_ascii=False, indent=1) + ";\n"
    (ROOT / "js" / "photos.js").write_text(js, encoding="utf-8")
    print(f"Galéria: {len(data['gallery'])} kép")
    for k, v in data["travels"].items():
        print(f"  {k}: {len(v)} kép")


if __name__ == "__main__":
    main()
