#!/usr/bin/env python3
"""
Konverterar Higgsfield-PNG:erna till AVIF + WebP på de exakta sökvägar som
HTML:en redan är wire:ad mot.

Källfiler läggs i assets/img/raw/ (git-ignorerade). Filnamnet spelar ingen roll
så länge det innehåller antingen slugen eller Higgsfield-jobb-id:t — dvs både
"grua-remolque-asuncion-noche.png" och det namn webbläsaren ger,
"hf_20260806_111528_3a9dbff3-6dc7-456f-bcac-11e419451bf6.png", funkar.

Målstorlekarna läses ur HTML:ens width/height-attribut, så filerna får exakt
den intrinsiska storlek sidorna deklarerar (noll CLS). Bilden center-croppas
till målets aspect ratio innan skalning, så inget sträcks ut.

    pip install pillow pillow-avif-plugin
    python3 tools/build-images.py

Kör med --check för att bara rapportera vad som saknas.
"""

import re
import sys
import glob
import os
from collections import defaultdict

from PIL import Image
import pillow_avif  # noqa: F401  (registrerar AVIF-pluginen i Pillow)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "assets", "img", "raw")
OUT = os.path.join(ROOT, "assets", "img")

# slug -> Higgsfield job id (samma tabell som IMAGE-PROMPTS.md)
JOB_IDS = {
    "grua-remolque-asuncion-noche": "3a9dbff3-6dc7-456f-bcac-11e419451bf6",
    "grua-en-ruta-balizas-noche": "47743f6c-b261-4aa6-a030-bd9c8caf84fe",
    "gran-asuncion-grua-circulando": "36624198-025c-436f-86dd-dcf28048f176",
    "remolque-plataforma-vehiculo": "3c01be81-0dd5-47cb-a4c0-d88d65926125",
    "auxilio-mecanico-paso-de-corriente": "69410f8b-829c-4169-8d64-a7e695a5a66d",
    "cerrajeria-apertura-de-vehiculo": "78548541-312b-47da-a7d1-94e3c3cd0dd1",
    "siniestro-vial-retiro-de-vehiculo": "3754da75-e567-49ad-bf1a-5eab2020dfee",
    "ambulancia-privada-traslado": "0e215751-0a94-4723-96a1-6c6cc9e29a0e",
    "operador-coordinando-servicio": "000d190b-c2fa-4fa8-b573-b5f627570a0a",
}

AVIF_QUALITY = 55
WEBP_QUALITY = 82


def declared_sizes():
    """slug -> (w, h) som HTML:en deklarerar. Störst yta vinner om en slug
    används i flera format."""
    found = defaultdict(set)
    for path in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True):
        src = open(path, encoding="utf8").read()
        for m in re.finditer(
            r'<img[^>]*?src="/assets/img/([a-z0-9-]+)\.webp"[^>]*?>', src, re.S
        ):
            tag, slug = m.group(0), m.group(1)
            w = re.search(r'width="(\d+)"', tag)
            h = re.search(r'height="(\d+)"', tag)
            if w and h:
                found[slug].add((int(w.group(1)), int(h.group(1))))
    return {s: max(v, key=lambda wh: wh[0] * wh[1]) for s, v in found.items()}


def find_source(slug):
    job = JOB_IDS[slug]
    for path in sorted(glob.glob(os.path.join(RAW, "*"))):
        name = os.path.basename(path).lower()
        if not name.endswith((".png", ".jpg", ".jpeg", ".webp")):
            continue
        if slug in name or job in name:
            return path
    return None


def cover_resize(im, tw, th):
    """Center-croppa till målets ratio, skala sedan till exakt (tw, th)."""
    sw, sh = im.size
    if sw / sh > tw / th:
        new_w = round(sh * tw / th)
        box = ((sw - new_w) // 2, 0, (sw - new_w) // 2 + new_w, sh)
    else:
        new_h = round(sw * th / tw)
        box = (0, (sh - new_h) // 2, sw, (sh - new_h) // 2 + new_h)
    return im.resize((tw, th), Image.LANCZOS, box=box)


def main():
    check_only = "--check" in sys.argv
    targets = declared_sizes()
    if not targets:
        sys.exit("Hittade inga <img>-referenser till /assets/img/ i HTML:en.")

    missing, done = [], []
    for slug, (tw, th) in sorted(targets.items()):
        if slug not in JOB_IDS:
            print(f"  ?  {slug}: refereras i HTML men saknas i JOB_IDS")
            continue
        src = find_source(slug)
        if not src:
            missing.append(slug)
            print(f"  -  {slug}: ingen källfil i assets/img/raw/")
            continue
        if check_only:
            print(f"  ok {slug}: {os.path.basename(src)} -> {tw}x{th}")
            done.append(slug)
            continue

        with Image.open(src) as im:
            im = im.convert("RGB")
            out = cover_resize(im, tw, th)
            avif = os.path.join(OUT, f"{slug}.avif")
            webp = os.path.join(OUT, f"{slug}.webp")
            out.save(avif, "AVIF", quality=AVIF_QUALITY)
            out.save(webp, "WEBP", quality=WEBP_QUALITY, method=6)
        ka = os.path.getsize(avif) // 1024
        kw = os.path.getsize(webp) // 1024
        print(f"  ok {slug}: {tw}x{th}  avif {ka} kB  webp {kw} kB")
        done.append(slug)

    print(f"\n{len(done)}/{len(targets)} bildslots klara.")
    if missing:
        print("Saknar källfiler för: " + ", ".join(missing))
        sys.exit(1)


if __name__ == "__main__":
    main()
