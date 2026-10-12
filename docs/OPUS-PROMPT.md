# Prompt for Opus 5.5 — implement the gruas.com.py improvements

Copy everything below the line into a new Claude Code session on repo `antonmarklundcom/gruas`. Delete any numbered item you do not want done; the numbering matches `docs/IMPROVEMENT-REPORT.md`.

---

Repo: `antonmarklundcom/gruas`, branch from `main`. This is the static HTML + PHP site for gruas.com.py (tow trucks, Asunción, Paraguay). There is no build step: the HTML is deployed as-is to Hostinger `public_html` via Git. Playwright exists only for the QA harness in `qa/`.

**Read first:** `docs/IMPROVEMENT-REPORT.md` (the full rationale for every item below), `qa/README.md`, `.htaccess`, `lead-forward.php`, `lead-event.php`, `lib/vendercrm-config.php`, `tests/vendercrm-config.cjs`, `assets/js/site.js`.

**Rules:**
- Site copy is Spanish (es-PY, voseo: "mandanos", "escribinos"). Do not change tone or claims. The site never publishes prices.
- Do not add a build step that the HTML depends on. Scripts in `tools/` may generate or verify files, but the committed HTML must stay deployable as-is.
- No GitHub Actions workflows. Everything runs locally via `npm` scripts.
- Keep `.htaccess` protections for `*.jsonl`, `*.md`, `qa/`, `lib/`, `tests/`, `docs/` intact.
- Never commit secrets. The CRM key lives outside the web root (see `lib/vendercrm-config.php`).
- Work in small PRs grouped as below, one PR per group. Run `npm test` and `npm run qa` before each push and paste the output in the PR description. Do not merge; I will review.
- Do not touch `assets/img/raw/*.png` content and do not regenerate the AVIF/WebP images.

## PR A — hygiene and safety (items 1, 3, 4, 5, 7, 16, 17)

1. **Raw PNGs out of the deploy path.** Add `assets/img/raw/*.png` to `.gitignore`, `git rm --cached` the 17 PNGs, and update `assets/img/raw/README.md` to say where the originals live (leave a `TODO: link` for me to fill). Also add to `.htaccess` a `RedirectMatch 404 ^/assets/img/raw/` as belt and braces.
3. **Contact number as a single source of truth.** Create `tools/check-contact.js`: read `WA_NUMBER` from `assets/js/site.js`, then fail if any `.html` contains a `wa.me/` or `tel:` with a different number, or if the JSON-LD `telephone` differs. Create `tools/set-number.js <newNumber>` that rewrites all occurrences (HTML, JSON-LD, `site.js`, the fallback text in `site.js` section 6). Wire as `npm run check:contact`.
4. **Clean the root.** Move `BUILD-SPEC-v2.md` and `IMAGE-PROMPTS.md` to `docs/`. Delete `HANDOFF-PR3-5.md` (its work is merged). Delete `qa-preflight.md` and remove it from `.gitignore` (it is a stale run report). Fix any links to the moved files in `qa/README.md`, `tools/build-images.py`, `qa/qa.js`.
5. **README.md and CLAUDE.md.** `README.md` (English, about 40 lines): what the site is, no build step, how to run locally (`python3 -m http.server 8899`), `npm install`, `npm test`, `npm run qa`, images via `tools/build-images.py`, deploy = push to main (Hostinger pulls), where the CRM config lives, where leads are stored. `CLAUDE.md`: point to README, list the rules in this prompt's **Rules** section, and the language convention (Spanish for site-facing code and comments, English for tooling and docs).
7. **npm scripts.** In `package.json` add: `"test": "node tests/vendercrm-config.cjs"`, `"lint:php": "php -l lead-forward.php && php -l lead-event.php && php -l lib/vendercrm-config.php"`, `"check:contact"`, `"check": "npm run lint:php && npm test && npm run check:contact && npm run qa"`.
16. **Security headers.** In `.htaccess` under `mod_headers` add: `Strict-Transport-Security "max-age=31536000; includeSubDomains"`, `X-Frame-Options "DENY"`, `Permissions-Policy "camera=(), microphone=(), geolocation=()"`, and a CSP: `default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self'; font-src 'self'; connect-src 'self'; form-action 'self' https://wa.me; base-uri 'self'; frame-ancestors 'none'`. To make `script-src 'self'` and `style-src 'self'` hold, do item 23 (move the inline styles from `404.html`, `gracias.html`, `politica-de-privacidad.html` into `site.css`) and move the inline `<script>` in `gracias.html` into `site.js` as a section that runs only when `[data-gracias]` is present. Confirm with `npm run qa` that no page logs a CSP violation (extend `qa/render.js` to fail on `securitypolicyviolation` console messages). Bump the `?v=` cache string on all 24 pages (use a script, verify all 24 match).
17. **Single-hop redirect.** Replace the two rewrite rules with one that sends any `http://` or `www.` request straight to `https://gruas.com.py/$1` in one 301.

## PR B — lead endpoints (items 10, 11, 12, 13, 14, 15)

10. **Abuse protection on `lead-forward.php`.** (a) Reject with 403 when `Origin` or `Referer` is present and its host is not `gruas.com.py` or `www.gruas.com.py` (allow when both headers are absent so non-JS form posts from old browsers still work). (b) Per-IP throttle: `sha256(ip + date('YmdHi'))` as a key in `sys_get_temp_dir()/gruas-rl/`, max 5 submissions per minute per IP, respond 429. (c) Add a hidden `t` field set by `site.js` to `Date.now()` on load; reject with 204 when the form was submitted in under 3 seconds (bots). The no-JS path must still work: treat a missing `t` as pass.
11. **Validate phone and email.** Normalize phone: strip everything except digits and leading `+`; convert `09xxxxxxxx` to `+5959xxxxxxxx`; require 8 to 15 digits, else 400 with a JSON message the form can show. Email: `FILTER_VALIDATE_EMAIL`, drop to `null` if invalid. Update the `site.js` error text to show the server message when present.
12. **Move JSONL out of the web root.** Add a small helper (in `lib/`) `leads_dir()` that returns `dirname(__DIR__) . '/private/leads'` if it exists and is writable, else `__DIR__`. Use it in both PHP endpoints. Document in README and `docs/VENDERCRM-CONFIGURATION.md`.
13. **Harden `lead-event.php`.** Same origin check as item 10a, same per-IP throttle (max 30/min), and write to `lead-events-YYYY-MM.jsonl` (monthly rotation) in `leads_dir()`.
14. **Lead report tool.** `tools/lead-report.php` (CLI): reads all `lead-events-*.jsonl` and `leads.jsonl`, prints a monthly table per event type (whatsapp_click, call_click, calc_submit, form_submit), then breakdowns by `zona`, by `page`, and by `utm_campaign`. Accept `--month=2026-10`. Add `"report": "php tools/lead-report.php"` to `package.json`.
15. **Tests.** Extend `tests/vendercrm-config.cjs` or add `tests/lead-handlers.cjs` covering: honeypot (204), empty phone (400), invalid phone (400), `09` normalization, foreign Origin (403), throttle (6th request 429), non-AJAX redirect to `/gracias.html`, `lead-event.php` whitelist and monthly file name. Keep the existing PHP `-n` stub approach; no network.

## PR C — SEO plumbing (items 18, 21, 22, 24)

18. **Generated sitemap.** `tools/build-sitemap.js`: walk all `index.html` plus the three root `.html` pages (exclude `404.html`, `gracias.html`), emit `<loc>` and `<lastmod>` from `git log -1 --format=%cI -- <file>`. Keep current priorities by folder (home 1.0, servicios/cotizador 0.9, zonas/nosotros 0.8, contacto 0.7, FAQ 0.6, guias 0.5, privacidad 0.2). Replace `sitemap.xml` with its output and add `"sitemap": "node tools/build-sitemap.js"` to scripts. Add a check to `npm run check` that fails if the committed sitemap is stale.
21. **Image loading attributes.** Every `<img>` that is not the first image on the page gets `loading="lazy" decoding="async"`; the first image on each page gets `fetchpriority="high"` and no `loading="lazy"`. Add a check in `qa/render.js`.
22. **Consent banner.** Remove the banner markup from all pages and section 5 of `site.js`, since nothing third-party is loaded. Leave a comment block in `site.js` describing how to re-add it gated analytics loading when GA4/GTM is introduced. Update `politica-de-privacidad.html` only if it references the banner by name.
24. **Manifest.** Set `theme_color` to `#FBFAF8` and `background_color` to `#FBFAF8` to match the pages. Generate `assets/img/icon-192.png` and `assets/img/icon-512.png` from `favicon.svg` (use `tools/build-og.py` conventions or Pillow) and list them in `site.webmanifest`.

## PR D — QA harness (items 6, 8, 9)

6. Remove the hardcoded `/home/user/gruas` and `8899` from `qa/qa.js`: use `path.resolve(__dirname, '..')` and `process.env.BASE || 'http://localhost:8899'`. Make `qa.js` start its own static server like `render.js` does (reuse the server code). Add `"qa:spec": "node qa/qa.js"` to scripts.
8. Standardize on the `playwright` package already in `devDependencies`; update `qa/README.md` accordingly and remove the `playwright-core` instructions.
9. Rewrite `qa/README.md` in one language (Spanish, matching `render.js`). Translate Swedish comments in `tools/build-images.py` and `site.js` to Spanish; leave English where the file is tooling (`qa/*.js`, `tests/*.cjs`).

## PR E — content (items 19, 20) — do last, and stop to show me the copy before committing

19. **Images on the 15 image-less pages.** Zone pages: `<picture>` with `gran-asuncion-grua-circulando` (AVIF + WebP, existing dimensions) below the hero copy with a zone-specific `alt`. `servicios/ambulancias-privadas/`: use the existing `ambulancia-privada-traslado` asset. `nosotros/`: reuse `grua-plataforma-cargando-auto-asuncion`. `contacto/`, `cotizador/`, `preguntas-frecuentes/`: no image, keep them fast. Run `npm run qa` for CLS and overflow.
20. **Zone page depth.** For each of the seven `zonas/*` pages add: one paragraph naming two or three real roads or landmarks of that zone (Ruta 2 and Mercado 4 for San Lorenzo, the airport and Ruta Transchaco for Luque, Acceso Sur for Lambaré and so on; verify each one), a three-question zone FAQ with `FAQPage` JSON-LD, and a "Zonas vecinas" block linking two neighbouring zones. Target 900 to 1100 words per page. Write it in es-PY voseo, no prices, no response-time promises that the home page does not already make. Show me the copy for one zone first and wait for my approval before doing the other six.

## Delivery

For each PR: branch `claude/gruas-<letter>-<short-name>`, title in English, body with the item numbers covered and the `npm run check` output. Open PR A first; the others can be opened in parallel but rebased after A merges since A touches `.htaccess`, `package.json` and the cache string.
