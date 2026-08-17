#!/usr/bin/env python3
"""
Bygger assets/img/og-gruas-asuncion.jpg (1200x630) — kortet som visas när
någon delar gruas.com.py i WhatsApp, Facebook eller Telegram.

Foto i botten, mörk scrim till vänster så texten håller kontrast, och sedan
samma uppgifter som resten av sajten publicerar: ort, tjänster, domän och
telefonnumret. Inga påhittade siffror, inga betyg, inga priser.

Typsnitten är sajtens egna (assets/fonts/*.woff2), konverterade i minnet med
fontTools så kortet matchar rubrikerna på sajten.

    pip install pillow fonttools brotli
    python3 tools/build-og.py
"""

import io
import os

from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "assets", "img", "raw")
FONTS = os.path.join(ROOT, "assets", "fonts")
OUT = os.path.join(ROOT, "assets", "img", "og-gruas-asuncion.jpg")

W, H = 1200, 630

# Samma foto som servicios-thumben "remolque": dagsljus, grúa som lastar en
# bil, tydligt motiv även i WhatsApps lilla förhandsvisning.
SOURCE = "hf_20260817_105603_6a172819-5e21-4e69-b7e0-eee3609f8347.png"

INK = (20, 22, 26)
# Sajtens --accent (#C4330F) är gjord för vit botten och blir för mörk ovanpå
# ett nedtonat foto. Här används en ljusare variant av samma rött så kortet
# fortfarande läses i WhatsApps lilla förhandsvisning.
ACCENT = (247, 106, 62)
WHITE = (255, 255, 255)


def load_font(woff2, size, weight=None):
    """woff2 -> Pillow-font. Sätter vikt om det är en variabel font."""
    f = TTFont(os.path.join(FONTS, woff2))
    f.flavor = None
    buf = io.BytesIO()
    f.save(buf)
    buf.seek(0)
    font = ImageFont.truetype(buf, size)
    if weight is not None:
        try:
            font.set_variation_by_axes([weight])
        except OSError:
            pass
    return font


def cover(im, tw, th):
    sw, sh = im.size
    if sw / sh > tw / th:
        nw = round(sh * tw / th)
        box = ((sw - nw) // 2, 0, (sw - nw) // 2 + nw, sh)
    else:
        nh = round(sw * th / tw)
        box = (0, (sh - nh) // 2, sw, (sh - nh) // 2 + nh)
    return im.resize((tw, th), Image.LANCZOS, box=box)


def main():
    photo = Image.open(os.path.join(RAW, SOURCE)).convert("RGB")
    card = cover(photo, W, H)

    # Scrim: kraftig till vänster där texten ligger, tunnare till höger så
    # grúan fortfarande syns. Plus en generell mörkning för kontrast.
    scrim = Image.new("L", (W, H))
    px = scrim.load()
    for x in range(W):
        t = x / (W - 1)
        # 0.94 vid vänsterkanten -> 0.34 vid högerkanten, mjuk kurva
        horiz = 0.94 - 0.60 * (t ** 1.35)
        for y in range(H):
            # extra mörkning nedåt så numret och domänen håller kontrast
            v = y / (H - 1)
            a = horiz + (1.0 - horiz) * 0.45 * max(0.0, (v - 0.55) / 0.45) ** 1.6
            px[x, y] = int(min(1.0, a) * 255)
    card = Image.composite(Image.new("RGB", (W, H), INK), card, scrim)

    d = ImageDraw.Draw(card)

    f_kicker = load_font("archivo-latin.woff2", 23, 700)
    f_title = load_font("archivo-latin.woff2", 68, 800)
    f_sub = load_font("geist-latin.woff2", 27, 400)
    f_label = load_font("archivo-latin.woff2", 19, 700)
    f_num = load_font("archivo-latin.woff2", 37, 800)
    f_dom = load_font("archivo-latin.woff2", 33, 800)

    x = 68

    d.text((x, 60), "ASUNCIÓN · GRAN ASUNCIÓN · RUTA A CDE",
           font=f_kicker, fill=ACCENT)
    d.rectangle([x, 104, x + 78, 108], fill=ACCENT)

    d.text((x, 136), "Grúas y asistencia", font=f_title, fill=WHITE)
    d.text((x, 212), "vial en Asunción", font=f_title, fill=WHITE)

    d.text((x, 306), "Siniestros · Remolque · Cerrajería de urgencia",
           font=f_sub, fill=(226, 224, 220))
    d.text((x, 342), "Ambulancias privadas", font=f_sub, fill=(226, 224, 220))

    d.text((x, 470), "WHATSAPP · LLAMADAS", font=f_label, fill=(208, 206, 202))
    d.text((x, 498), "+595 995 628 862", font=f_num, fill=WHITE)

    d.text((x, 556), "gruas.com.py", font=f_dom, fill=ACCENT)

    card.save(OUT, "JPEG", quality=86, optimize=True, progressive=True)
    print(f"  ok {os.path.relpath(OUT, ROOT)}: {W}x{H}  "
          f"{os.path.getsize(OUT) // 1024} kB")


if __name__ == "__main__":
    main()
