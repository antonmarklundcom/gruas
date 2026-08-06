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

Nio genereringar finns i Higgsfield-historiken (2026-08-06). **Åtta av dem är
wire:ade i HTML:en** — `operador-coordinando-servicio` är specad i
BUILD-SPEC-v2.md men används inte på någon sida ännu, så den är valfri.

Fullständig tabell med prompts och jobb-id: se `IMAGE-PROMPTS.md` i repo-roten.
