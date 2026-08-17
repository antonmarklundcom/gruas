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

## render.js — arnés de render

`node qa/render.js check` levanta el sitio, lo abre en Chromium a 390px y
1440px y falla si alguna página pide un recurso inexistente, tira un error de
JS o desborda horizontalmente. Descubre las rutas solo, leyendo los .html.

    npm install        # una vez
    npm run qa         # las 24 páginas

Otros modos: `view` (pantallazos sucesivos), `el` (una sección aislada),
`measure` (alto de cada sección en móvil). Ver la cabecera de render.js.

**Por qué está esto acá.** La versión anterior del sitio se dio por verificada
leyendo el código. Así se publicaron un hero con texto oscuro sobre fondo
oscuro, un banner de consentimiento tapando los botones de contacto en móvil,
y una hoja de estilos cacheada un año pegada a un HTML nuevo. Ninguno de los
tres se ve leyendo HTML. Antes de dar por buena una tanda de cambios de
diseño, corré `npm run qa` y mirá los pantallazos.
