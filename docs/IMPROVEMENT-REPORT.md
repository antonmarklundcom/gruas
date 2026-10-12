# gruas.com.py — Repo improvement report

Date: 2026-10-12. Scope: full read of the repo at `main` (commit 098e915). Static HTML + PHP site, 24 pages, two PHP endpoints, a Playwright QA harness, one Node test file.

**Overall state:** solid. Every page has exactly one `<h1>`, all images have `alt` and `width`/`height`, cache-busting strings are consistent across all 24 pages, the PHP lints clean and the 13 CRM config tests pass. The improvements below are about maintainability, SEO depth, security hardening and repo hygiene, not about broken functionality.

Priority key: **P1** do first (real risk or real SEO/conversion gain), **P2** worthwhile, **P3** polish.

---

## A. Repo hygiene & maintainability

### 1. 44 MB of raw PNGs committed to the repo (P1)
`assets/img/raw/` holds 17 Higgsfield PNGs (43.7 MB). The `.git` folder is already 45 MB. Every deploy via Git pulls them into `public_html`, and they are served publicly (the `.htaccess` only blocks `.md/.jsonl/.json/...`, not `.png`). Fix: move the raw PNGs out of the repo (Git LFS, a release asset, or a private Drive folder), keep `assets/img/raw/README.md` with the download link, add `assets/img/raw/*.png` to `.gitignore`. Alternatively, block `/assets/img/raw/` in `.htaccess` as a stopgap.

### 2. Header and footer are copy-pasted into 24 files (P1)
The footer is byte-identical across pages; the header differs only by `aria-current`. Adding one nav link or changing the phone number means editing 24 files. Options, cheapest first: (a) a tiny Node build script (`tools/build-pages.js`) that stamps shared partials into the pages and is run before commit, (b) a `tools/check-partials.js` that just **verifies** header/footer are in sync and fails `npm run qa` when they drift. Option (b) keeps "no build step" true and still catches drift.

### 3. WhatsApp number and phone hardcoded 225 times in HTML (P1)
`site.js` declares `WA_NUMBER` as "the ONE place the number lives", but the HTML has 94 `wa.me/595995628862` links and 131 `tel:+595995628862` links, plus the number in JSON-LD and the JS error message. The business sells leads to a tow operator; when the operator (and number) changes, this is a 24-file edit. Fix: a `tools/check-contact.js` that asserts every page uses the same number as `site.js`, plus a one-command replace script (`npm run set-number -- 5959XXXXXXX`).

### 4. Root is cluttered with planning docs (P2)
`BUILD-SPEC-v2.md` (1139 lines), `HANDOFF-PR3-5.md`, `IMAGE-PROMPTS.md`, `qa-preflight.md` sit in the root and get deployed to `public_html`. `HANDOFF-PR3-5.md` describes work that is already done (PR 3 to 5 landed). `qa-preflight.md` is a dated run report from 2026-08-06 that is also in `.gitignore` (so it is tracked but ignored, which is confusing). Fix: move spec and image prompts to `docs/`, delete the handoff, delete or regenerate the preflight report, and remove it from `.gitignore`.

### 5. No README.md and no CLAUDE.md (P2)
A new contributor (or a new Claude session) has to read `package.json`, `qa/README.md` and the top of `.htaccess` to learn: no build step, deploy = push to Hostinger, images via `tools/build-images.py`, tests via `node tests/vendercrm-config.cjs`. Fix: a 40-line `README.md` with run/test/deploy/images, and a short `CLAUDE.md` pointing to it and stating the rules (Spanish es-PY copy, no prices on the site, run `npm run qa` before design PRs).

### 6. `qa/qa.js` has hardcoded absolute paths and the two QA scripts overlap (P2)
`qa/qa.js` reads `/home/user/gruas/...` on lines 25 and 83, so it only runs in one specific sandbox. `qa/render.js` discovers pages itself and starts its own server. Fix: make `qa.js` use `path.resolve(__dirname, '..')`, accept `BASE` from an env var, and wire it as `npm run qa:spec` so both harnesses run from `package.json`. Also `qa/README.md` is half Swedish, half Spanish; pick one.

### 7. No `npm test` and no single "check everything" command (P2)
Tests exist (`tests/vendercrm-config.cjs`) but are not in `package.json` scripts. Fix: `"test": "node tests/vendercrm-config.cjs"`, `"lint:php": "php -l ..."`, `"check": "npm test && npm run lint:php && npm run qa"`. Keep it local, no GitHub Actions (per the budgeted-runner rule), or one minimal workflow that runs only `npm test` on PRs.

### 8. `package.json` scripts reference Playwright but `qa/README.md` says `playwright-core` (P3)
Inconsistent install instructions. Standardize on `playwright` (already in devDependencies) and the `PLAYWRIGHT_BROWSERS_PATH` / `CHROME` convention in one place.

### 9. Mixed languages in code comments and docs (P3)
Comments switch between Spanish, Swedish and English within the same file (`site.js`, `lead-forward.php`, `tools/build-images.py`, `qa/README.md`). Not a bug, but it slows every future reader. Pick Spanish for site-facing code and English for tooling, and state that in `CLAUDE.md`.

---

## B. Lead endpoints (PHP) — security and robustness

### 10. `lead-forward.php` has no rate limiting or origin check (P1)
Anyone can POST to it in a loop; each hit appends to `leads.jsonl` and fires a cURL call to the CRM with your API key. The honeypot stops dumb bots only. Fix: (a) reject requests whose `Origin`/`Referer` host is not `gruas.com.py`, (b) a cheap per-IP throttle (e.g. a hashed IP + minute bucket in a temp file, max 5/min), (c) a minimum submit-time check via a hidden timestamp field.

### 11. Phone and email are not validated, only truncated (P2)
`phone` accepts any 40-char string. Fix: strip to digits/`+`, require 8 to 15 digits, normalize `09xx` to `+5959xx`; validate email with `FILTER_VALIDATE_EMAIL` and drop it if invalid rather than forwarding junk to the CRM.

### 12. `leads.jsonl` and `lead-events.jsonl` live inside the web root (P2)
They are blocked by `.htaccess`, but that protection disappears if the host ever switches to LiteSpeed/nginx with different rules, or if `.htaccess` is not uploaded. `lib/vendercrm-config.php` already establishes the pattern `parent(public_root)/private/`. Fix: write both JSONL files to `dirname(__DIR__) . '/private/'` when that directory is writable, fall back to the current location otherwise.

### 13. `lead-event.php` can be filled by anyone and never rotates (P2)
Same whitelist-only protection; no size cap, no origin check, no IP throttle. A bored script can grow the file without limit. Fix: same origin check as item 10, and rotate the file monthly (`lead-events-YYYY-MM.jsonl`), which also makes "how many leads did the site generate this month" a one-liner for the operator.

### 14. No tool to read the lead logs (P2)
The whole point of `lead-event.php` is to prove lead volume to the tow operator, but there is no script to summarize `lead-events.jsonl` by month, zone, page and event. Fix: `tools/lead-report.php` (or `.js`) that prints a monthly table: WhatsApp clicks, call clicks, form submits, by zone and page, plus UTM campaign.

### 15. `lead-forward.php` has no tests of the validation path (P3)
The 13 tests cover CRM config/transport. Add cases for: empty phone (400), honeypot (204), non-AJAX redirect to `/gracias.html`, and the new validation and throttle once added.

---

## C. Security headers and server config

### 16. Missing HSTS, CSP, Permissions-Policy, X-Frame-Options (P1)
`.htaccess` sets only `X-Content-Type-Options` and `Referrer-Policy`. The site is self-hosted assets only (fonts local, no third-party JS), so a strict CSP is cheap: `default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'` (the three inline `<style>` blocks in `404.html`, `gracias.html`, `politica-de-privacidad.html` need `'unsafe-inline'` or should be moved into `site.css`, see item 20). Add `Strict-Transport-Security: max-age=31536000`, `X-Frame-Options: DENY`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`. Note the JSON-LD `<script type="application/ld+json">` blocks are not executed and are not affected by CSP; the inline `<script>` in `gracias.html` (line 49) is, so move it to `site.js`.

### 17. HTTPS and www redirects are two separate 301 hops (P3)
`http://www.gruas.com.py/x` goes http to https, then www to non-www. Combine into one rule so the redirect chain is a single hop (minor SEO and latency gain).

---

## D. SEO and content

### 18. Sitemap has no `lastmod` and uses a flat priority scheme (P2)
`sitemap.xml` has 22 URLs, no `<lastmod>`. Google ignores `priority`/`changefreq` but does use `lastmod`. Fix: a `tools/build-sitemap.js` that walks the `.html` files and writes `lastmod` from the file's last git commit date. This also removes the manual step when a page is added (the three zone pages were added by hand in a different format at the bottom of the file).

### 19. Fifteen of 24 pages have no image at all (P2)
All seven zone pages, `contacto`, `cotizador`, `nosotros`, `preguntas-frecuentes`, `ambulancias-privadas` have no `<picture>`. The zone pages are the local-SEO landing pages and they are text-only, 630 to 870 words. Fix: at minimum reuse `gran-asuncion-grua-circulando` on zone pages and `ambulancia-privada-traslado` on the ambulance page (the asset already exists but is unused there). Longer term, one locally-recognizable image per zone, generated through the existing `IMAGE-PROMPTS.md` pipeline.

### 20. Zone pages are thin and near-identical (P2)
The seven `zonas/*` pages are around 650 words with the same structure. For a local-SEO play they need zone-specific content: landmark roads (Ruta 2, Acceso Sur, Transchaco), typical trip destinations (the talleres and sanatorios people actually get towed to), a zone-specific FAQ with `FAQPage` schema, and an internal link to the two neighbouring zones. Also add the zone to the `LocalBusiness.areaServed` of each zone page's JSON-LD if not already.

### 21. No `loading="lazy"` on below-the-fold images, and `fetchpriority` appears once (P3)
Nine pages have `loading="lazy"`; `servicios/index.html` has five `<img>` and `fetchpriority="high"` appears only on the home hero. Audit: every non-hero image gets `loading="lazy" decoding="async"`, every hero gets `fetchpriority="high"`. Add a check in `qa/render.js`.

### 22. Consent banner exists but there is no tracker to consent to (P3)
The site loads no analytics, yet shows a Ley 6534/2020 consent banner on every page, which costs screen space on mobile and a click. Either (a) remove the banner until GA4/GTM is actually added, and have `site.js` load analytics only after consent when that day comes, or (b) if you want it for first-party `lead-event.php` logging, say so in the banner text. The current banner is a conversion cost with no legal payoff.

### 23. Inline `<style>` blocks on three utility pages (P3)
`404.html`, `gracias.html`, `politica-de-privacidad.html` carry their own `<style>`. Move those rules into `site.css` so there is one stylesheet, which also lets item 16 drop `'unsafe-inline'`.

### 24. Manifest colors disagree with the pages (P3)
`site.webmanifest` has `theme_color: #DC2626` and `background_color: #FFFFFF`; every page has `<meta name="theme-color" content="#FBFAF8">`. Also only an SVG icon is listed; add a 192 and 512 PNG so Android "add to home screen" works. Minor, but cheap.

---

## Suggested order

1. Items 1, 3, 10, 16 (one afternoon, highest risk reduction).
2. Items 2, 4, 5, 7, 12, 18 (repo becomes maintainable).
3. Items 11, 13, 14, 15 (lead pipeline hardened and reportable).
4. Items 19, 20 (SEO content work, the only items that need new copy).
5. Items 6, 8, 9, 17, 21, 22, 23, 24 (polish).

Items 19 and 20 require writing Spanish copy and possibly generating images; everything else is mechanical and testable with `npm run qa` plus the Node tests.
