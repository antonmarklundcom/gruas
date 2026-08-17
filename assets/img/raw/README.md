# Källbilder (PNG från Higgsfield)

Ladda upp de genererade PNG:erna **här**, i den här mappen. Behåll gärna
webbläsarens filnamn (`hf_20260806_111528_3a9dbff3-...png`) — konverteraren
matchar på Higgsfield-jobb-id, så namnet behöver inte städas.

Sedan:

```bash
pip install pillow pillow-avif-plugin
python3 tools/build-images.py
```

Det skriver `assets/img/<slug>.avif` + `.webp` i exakt de storlekar HTML:en
deklarerar. Kör `python3 tools/build-images.py --check` för att bara se vad
som saknas.

## Varför manuellt

Higgsfields CDN (`d8j0ntlcm91z4.cloudfront.net`, `d2ol7oe51mr4n9.cloudfront.net`)
är blockerad av sandbox-proxyn — 403 org policy, inte en bugg. Claude kan alltså
inte hämta filerna själv; de måste laddas ner i en vanlig webbläsare och laddas
upp hit.

## Vilka bilder

Här ligger båda omgångarna: nio PNG från 2026-08-06 och åtta från 2026-08-17.
Åtta av dem fyller sajtens bildslots, sex från den nyare omgången och två från
den äldre. Resten ligger kvar som källmaterial.

Fullständig tabell med prompts, jobb-id och **vilka som refuserades och varför**:
se `IMAGE-PROMPTS.md` i repo-roten.

## Innan du wire:ar en ny bild

Titta på den i full upplösning först, inte bara som miniatyr. Zooma in på
**lastbilsdörrar, västar, skyltar och nummerplåtar**. Bildmodellerna målar dit
påhittad firmabranding och telefonnummerliknande sifferrader som inte syns
förrän man förstorar. Ett falskt telefonnummer på en bogseringssajt är aktivt
skadligt — beskär bort det eller släng bilden. Två genereringar från 2026-08-17
föll på just det.

## Byter du motiv — byt slug

`.htaccess` cachar bilder ett år och `<img>`-taggarna har ingen `?v=`. Skriver
du ett nytt motiv till en befintlig slug får återvändande besökare kvar den
gamla bilden i upp till ett år. Ny bild = nytt filnamn.
