#!/usr/bin/env node
/**
 * Arnés de render para gruas.com.py.
 *
 * Por qué existe: la versión anterior del sitio se construyó y se dio por
 * verificada leyendo el código, nunca mirando la página. Así se publicaron
 * un hero con texto oscuro sobre fondo oscuro, un banner de consentimiento
 * tapando los botones de contacto en móvil y una hoja de estilos cacheada un
 * año pegada a un HTML nuevo. Ninguno de esos tres errores es visible leyendo
 * HTML: hay que renderizar.
 *
 * Requisitos:
 *   npm install playwright        (el navegador ya viene preinstalado en el
 *                                  entorno remoto: PLAYWRIGHT_BROWSERS_PATH)
 *
 * Uso:
 *   node qa/render.js check                    # todas las páginas del sitio
 *   node qa/render.js check / /contacto/       # sólo esas rutas
 *   node qa/render.js view / desk 4            # pantallazos sucesivos
 *   node qa/render.js el out.png / "#servicios"   # una sección aislada
 *   node qa/render.js measure /                # alto de cada sección en móvil
 *
 * `check` es el que importa: falla ruidosamente si alguna página pide un
 * recurso que no existe, tira un error de JS o desborda horizontalmente.
 */
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'qa', 'shots');
const PORT = 8099;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json',
  '.avif': 'image/avif', '.webp': 'image/webp', '.jpg': 'image/jpeg',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json',
};

const VIEWPORTS = { phone: [390, 844], desk: [1440, 900] };

/** Todas las rutas públicas del repo, derivadas de los archivos reales. */
function allPaths() {
  const out = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'qa') continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith('.html')) {
        let rel = '/' + path.relative(ROOT, full).split(path.sep).join('/');
        if (rel.endsWith('/index.html')) rel = rel.slice(0, -'index.html'.length);
        out.push(rel);
      }
    }
  })(ROOT);
  return out.sort();
}

function serve() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    let f = path.join(ROOT, p);
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(r => server.listen(PORT, () => r(server)));
}

async function launch() {
  // El entorno remoto trae Chromium preinstalado con una build distinta a la
  // que espera el paquete npm; probamos esa ruta antes de rendirnos.
  const candidates = (fs.existsSync('/opt/pw-browsers')
    ? fs.readdirSync('/opt/pw-browsers')
        .filter(d => d.startsWith('chromium-'))
        .map(d => `/opt/pw-browsers/${d}/chrome-linux/chrome`)
    : []).filter(fs.existsSync);
  for (const executablePath of candidates) {
    try { return await chromium.launch({ executablePath }); } catch (_) { /* siguiente */ }
  }
  return chromium.launch();
}

/** Deja que se disparen los reveal y que carguen las imágenes lazy. */
async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise(r => setTimeout(r, 600));
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 400));
  });
}

async function check(paths) {
  const server = await serve();
  const browser = await launch();
  fs.mkdirSync(OUT, { recursive: true });
  let failures = 0;

  for (const p of paths) {
    for (const [label, [width, height]] of Object.entries(VIEWPORTS)) {
      const ctx = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: label === 'phone' ? 2 : 1,
        isMobile: label === 'phone', hasTouch: label === 'phone',
      });
      const page = await ctx.newPage();
      const problems = [];
      page.on('requestfailed', r => problems.push('REQUEST FAILED ' + r.url()));
      page.on('response', r => { if (r.status() >= 400) problems.push(r.status() + ' ' + r.url()); });
      page.on('pageerror', e => problems.push('JS ERROR ' + e.message));

      await page.goto(`http://localhost:${PORT}${p}`, { waitUntil: 'networkidle' });
      await settle(page);

      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 0) problems.push(`HORIZONTAL OVERFLOW ${overflow}px`);

      const name = (p === '/' ? 'home' : p.replace(/\//g, '-').replace(/^-|-$/g, '')) + '-' + label;
      await page.screenshot({ path: path.join(OUT, name + '.png'), fullPage: true });

      if (problems.length) {
        failures += problems.length;
        console.log(`✗ ${name}\n    ${problems.join('\n    ')}`);
      } else {
        console.log(`✓ ${name}`);
      }
      await ctx.close();
    }
  }

  await browser.close(); server.close();
  console.log(`\n${paths.length} páginas · ${failures} problema(s)`);
  console.log(`pantallazos en qa/shots/`);
  process.exitCode = failures ? 1 : 0;
}

async function view(p, mode = 'desk', n = 4) {
  const server = await serve();
  const browser = await launch();
  const dir = path.join(OUT, 'view');
  fs.mkdirSync(dir, { recursive: true });
  const [width, height] = VIEWPORTS[mode];
  const ctx = await browser.newContext({ viewport: { width, height }, isMobile: mode === 'phone' });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${PORT}${p}`, { waitUntil: 'networkidle' });
  await settle(page);
  const total = await page.evaluate(() => document.body.scrollHeight);
  for (let i = 0; i < Number(n); i++) {
    const y = Math.min(i * height, total - height);
    await page.evaluate(v => window.scrollTo(0, v), y);
    await page.waitForTimeout(450);
    await page.screenshot({ path: path.join(dir, `${mode}-${String(i).padStart(2, '0')}.png`) });
  }
  console.log(`alto total ${total}px = ${(total / height).toFixed(1)} pantallas → qa/shots/view/`);
  await browser.close(); server.close();
}

async function el(out, p, selector, mode = 'desk') {
  const server = await serve();
  const browser = await launch();
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  const [width, height] = mode === 'phone' ? VIEWPORTS.phone : [1440, 1000];
  const ctx = await browser.newContext({ viewport: { width, height }, isMobile: mode === 'phone' });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${PORT}${p}`, { waitUntil: 'networkidle' });
  await settle(page);
  await page.locator(selector).first().screenshot({ path: out });
  console.log('escrito ' + out);
  await browser.close(); server.close();
}

async function measure(p) {
  const server = await serve();
  const browser = await launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${PORT}${p}`, { waitUntil: 'networkidle' });
  await settle(page);
  console.log(await page.evaluate(() =>
    [...document.querySelectorAll('main > section, footer')].map(e => {
      const h = Math.round(e.getBoundingClientRect().height);
      const t = (e.querySelector('h1,h2') || {}).textContent || e.className || e.tagName;
      return String(h).padStart(6) + 'px  ' + t.trim().slice(0, 52);
    }).join('\n')));
  await browser.close(); server.close();
}

const [cmd, ...rest] = process.argv.slice(2);
const run = {
  check: () => check(rest.length ? rest : allPaths()),
  view: () => view(rest[0] || '/', rest[1], rest[2]),
  el: () => el(rest[0], rest[1], rest[2], rest[3]),
  measure: () => measure(rest[0] || '/'),
}[cmd];

if (!run) {
  console.log('uso: node qa/render.js <check|view|el|measure> …  (ver cabecera del archivo)');
  process.exit(1);
}
run();
