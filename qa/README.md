# QA-arnés

`qa.js` kör hela checklistan i `BUILD-SPEC-v2.md` §9 mot en lokalt serverad
kopia av sajten. 89 kontroller, allihop automatiserade — resultatet skrivs till
`qa-preflight.md` i repo-roten.

Mappen serveras inte publikt (`.htaccess` blockerar `qa/`).

## Köra

```bash
# 1. servera sajten från repo-roten
python3 -m http.server 8899

# 2. i en annan terminal, från en katalog med playwright-core installerat
npm i playwright-core
CHROME=/opt/pw-browsers/chromium node /sökväg/till/qa/qa.js
```

Skriptet förutsätter att sajten ligger på `http://localhost:8899` och att
`/home/user/gruas` är repo-roten. Byt `BASE` och sökvägen överst i filen om
något av det skiljer sig.

Tredjepartsanrop blockeras avsiktligt i körningen — Google Fonts och
bild-CDN ska inte påverka mätningen.

## Lighthouse

```bash
npm i lighthouse
CHROME_PATH=/opt/pw-browsers/chromium node_modules/.bin/lighthouse \
  http://localhost:8899/ --form-factor=mobile --screenEmulation.mobile \
  --chrome-flags="--headless --no-sandbox" --output=json --output-path=lh.json
```

**Prestandasiffran är inte giltig förrän bildfilerna finns.** Med nio saknade
bilder som ger 404 rapporterar Lighthouse Speed Index ~19 s trots FCP och LCP
på 1,5 s. Se förbehållet i `qa-preflight.md`.
