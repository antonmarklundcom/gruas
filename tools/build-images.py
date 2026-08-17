#!/usr/bin/env python3
"""
Konverterar Higgsfield-PNG:erna till AVIF + WebP på de exakta sökvägar som
HTML:en är wire:ad mot.

Källfiler ligger i assets/img/raw/. Filnamnet spelar ingen roll så länge det
innehåller antingen slugen eller Higgsfield-jobb-id:t — dvs både
"remolque-plataforma-carga-de-auto.png" och namnet webbläsaren ger,
"hf_20260817_105603_6a172819-...png", funkar.

Målstorlekarna läses ur HTML:ens width/height-attribut, så filerna får exakt
den intrinsiska storlek sidorna deklarerar (noll CLS). Bilden center-croppas
till målets aspect ratio innan skalning, så inget sträcks ut. CROP_BIAS låter
en enskild slug flytta croppen från mitten när motivet inte sitter centrerat.

    pip install pillow pillow-avif-plugin
    python3 tools/build-images.py

Kör med --check för att bara rapportera vad som saknas.

VIKTIGT om cache: .htaccess cachar bilder ett år och <img> har ingen ?v=.
Byter du MOTIV på en slug måste du byta SLUG också, annars får återvändande
besökare kvar den gamla bilden. Därför är slugarna beskrivande — en ny bild
är en ny slug.
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

# slug -> Higgsfield job id. Se IMAGE-PROMPTS.md för prompts och urval.
JOB_IDS = {
    # 2026-08-17-omgången (dagsljus, människor i bild, textfria västar/dörrar)
    "grua-plataforma-cargando-auto-asuncion": "b22a19e4-352b-4862-96d0-34cec8d2b6f6",
    "remolque-plataforma-carga-de-auto": "6a172819-5e21-4e69-b7e0-eee3609f8347",
    "auxilio-mecanico-arranque-con-cables": "057e760d-b2ce-485e-a9f7-d77180561e92",
    "cerrajeria-apertura-de-puerta-de-auto": "0d329fcb-1be7-4748-ab11-06676eac38f5",
    "siniestro-vial-auto-danado-en-plataforma": "e068eb67-fe03-42e2-b1c9-c3ed51a7864c",
    "auto-parado-en-la-banquina-de-la-ruta": "87671de4-5b6f-4d4d-809f-22cd525a4d32",
    # 2026-08-06-omgången, de två slots den nya omgången inte täcker
    "gran-asuncion-grua-circulando": "36624198-025c-436f-86dd-dcf28048f176",
    "ambulancia-privada-traslado": "0e215751-0a94-4723-96a1-6c6cc9e29a0e",
}

# slug -> (x_bias, y_bias) i 0..1. 0.5 = centrerad crop (standard).
CROP_BIAS = {}

AVIF_QUALITY = 55
WEBP_QUALITY = 82


def declared_sizes():
    """slug -> (w, h) som HTML:en deklarerar. Störst yta vinner om en slug
    används i flera format."""
    found = defaultdict(set)
    for path in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True):
        if "node_modules" in path:
            continue
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


def cover_resize(im, tw, th, bias=(0.5, 0.5)):
    """Croppa till målets ratio (bias styr var), skala sedan till (tw, th)."""
    sw, sh = im.size
    bx, by = bias
    if sw / sh > tw / th:
        new_w = round(sh * tw / th)
        x = round((sw - new_w) * bx)
        box = (x, 0, x + new_w, sh)
    else:
        new_h = round(sw * th / tw)
        y = round((sh - new_h) * by)
        box = (0, y, sw, y + new_h)
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
            out = cover_resize(im, tw, th, CROP_BIAS.get(slug, (0.5, 0.5)))
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
