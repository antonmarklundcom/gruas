# Prompt for Opus 5.5 (high) — implement the gruas.com.py improvements

Copy everything below the line into a new Claude Code session on repo `antonmarklundcom/gruas`, model Opus 5.5, effort high. Delete any numbered item you do not want done; the numbering matches `docs/IMPROVEMENT-REPORT.md`.

---

Repo: `antonmarklundcom/gruas`, branch from `main`. This is the static HTML + PHP site for gruas.com.py (tow trucks, Asunción, Paraguay). There is no build step: the HTML is deployed as-is to Hostinger `public_html` via Git. Playwright exists only for the QA harness in `qa/`.

You are the orchestrator. You do the foundation work yourself (Phase 1), then fan out the independent phases to **Sonnet 5.5 subagents** running in parallel, each in its own git worktree and owning its own files. You review every subagent diff before it is pushed. Never use a Fable or Mythos model for any subagent or spawned session.

**Read first (you, not a subagent):** `docs/IMPROVEMENT-REPORT.md` (rationale for every item), `qa/README.md`, `.htaccess`, `package.json`, `lead-forward.php`, `lead-event.php`, `lib/vendercrm-config.php`, `tests/vendercrm-config.cjs`, `assets/js/site.js`, and the `<head>` plus header/footer of `index.html`.

## Rules (also paste these into every subagent prompt)

- Site copy is Spanish (es-PY, voseo: "mandanos", "escribinos"). Do not change tone or claims. The site never publishes prices or response-time promises beyond what the home page already says.
- No build step that the HTML depends on. Scripts in `tools/` may generate or verify files, but the committed HTML must stay deployable as-is.
- No GitHub Actions workflows. Everything runs locally via `npm` scripts.
- Keep the `.htaccess` protections for `*.jsonl`, `*.md`, `qa/`, `lib/`, `tests/`, `docs/` intact.
- Never commit secrets. The CRM key lives outside the web root (see `lib/vendercrm-config.php`).
- Do not modify or regenerate the AVIF/WebP images or the raw PNGs' content.
- Language convention: Spanish for site-facing code and comments (HTML, CSS, `site.js`, the two PHP endpoints), English for tooling and docs (`tools/`, `qa/*.js`, `tests/`, `docs/`, README).
- Before every push: `npm run check` (defined in Phase 1) must pass and its output goes in the PR body. Do not merge. I review and merge.
- One PR per phase, branch `claude/gruas-<phase>-<short-name>`, English title, body lists the item numbers covered.

## Phase 1 — foundation (you, Opus, sequential). Items 1, 2, 3, 4, 5, 7, 16, 17, 23

This phase touches shared files (`.htaccess`, `package.json`, `site.css`, all 24 HTML heads, the cache string), so it goes first and alone. Open it as PR A and wait for my merge before starting Phase 2, because the other phases rebase on it.

1. **Raw PNGs out of the deploy path.** Add `assets/img/raw/*.png` to `.gitignore`, `git rm --cached` the 17 PNGs, update `assets/img/raw/README.md` to say the originals live off-repo (leave `TODO: link` for me). Add `RedirectMatch 404 ^/assets/img/raw/` to `.htaccess`.
2. **Header/footer drift check.** `tools/check-partials.js`: extract `<header …>…</header>` and `<footer …>…</footer>` from every `.html` (24 pages, exclude nothing), normalise by stripping `aria-current="page"`, and fail if any page differs from `index.html`. Print a unified diff for the first offender. Wire as `npm run check:partials`. If it finds existing drift, fix the drifted pages so they match `index.html` (keep each page's own `aria-current`).
3. **Contact number single source of truth.** `tools/check-contact.js`: read `WA_NUMBER` from `assets/js/site.js`; fail if any `.html` has a `wa.me/` or `tel:` with a different number, or a JSON-LD `telephone` that differs. `tools/set-number.js <digits>`: rewrites all occurrences (HTML `wa.me`, `tel:`, visible `+595 995 628 862` text, JSON-LD, `site.js` constant and the fallback text in `site.js` section 6). Wire as `npm run check:contact`.
4. **Clean the root.** Move `BUILD-SPEC-v2.md` and `IMAGE-PROMPTS.md` to `docs/`. Delete `HANDOFF-PR3-5.md` (merged work). Delete `qa-preflight.md` and remove it from `.gitignore`. Fix references in `qa/README.md`, `tools/build-images.py`, `qa/qa.js`.
5. **README.md and CLAUDE.md.** `README.md` (English, about 40 lines): what the site is, no build step, local run (`python3 -m http.server 8899`), `npm install`, `npm test`, `npm run qa`, `npm run check`, images via `tools/build-images.py`, deploy = push to `main` (Hostinger pulls), where CRM config and lead files live. `CLAUDE.md`: point to README, repeat the Rules above, and the language convention.
7. **npm scripts.** Add to `package.json`: `"test": "node tests/vendercrm-config.cjs"`, `"lint:php": "php -l lead-forward.php && php -l lead-event.php && php -l lib/vendercrm-config.php"`, `"check:partials"`, `"check:contact"`, `"check": "npm run lint:php && npm test && npm run check:partials && npm run check:contact && npm run qa"`.
16. **Security headers + CSP.** In `.htaccess` under `mod_headers` add `Strict-Transport-Security "max-age=31536000; includeSubDomains"`, `X-Frame-Options "DENY"`, `Permissions-Policy "camera=(), microphone=(), geolocation=()"`, and `Content-Security-Policy "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self'; font-src 'self'; connect-src 'self'; form-action 'self' https://wa.me; base-uri 'self'; frame-ancestors 'none'"`. For `script-src 'self'` to hold, move the inline `<script>` in `gracias.html` (around line 49) into `site.js` as a section that runs only when `[data-gracias]` exists on the page. JSON-LD blocks are not executed and are unaffected. Extend `qa/render.js` to fail on `securitypolicyviolation` events and on console errors mentioning CSP, then run it.
17. **Single-hop redirect.** Replace the two rewrite rules with one that sends any `http://` or `www.` request to `https://gruas.com.py/$1` in a single 301.
23. **Inline styles into site.css.** Move the `<style>` blocks from `404.html`, `gracias.html`, `politica-de-privacidad.html` into `assets/css/site.css` (scoped by a page class on `<body>`), so `style-src 'self'` holds. Bump the `?v=` cache string on all 24 pages with a script, then verify all 24 match.

Run `npm run check`, open PR A, stop and tell me. Continue to Phase 2 only after PR A is merged.

## Phase 2 — parallel Sonnet 5.5 subagents (after PR A merges)

Spawn three Sonnet 5.5 subagents at once, each with `isolation: "worktree"`, each branching from the merged `main`. Give each one: the Rules block, its item list below verbatim, the report file path, and the instruction to run `npm run check` before reporting back. They do not push. When each returns, you review its diff adversarially (CSP still holds? no-JS form path still works? Spanish copy untouched?), run `npm run check` yourself in that worktree, fix anything small, then push and open the PR.

### Subagent B — lead endpoints (items 10, 11, 12, 13, 14, 15). Owns: `lead-forward.php`, `lead-event.php`, `lib/*.php` (new helper only), `tests/*.cjs`, `tools/lead-report.php`, the form error text in `assets/js/site.js` section 6, `docs/VENDERCRM-CONFIGURATION.md`.

10. **Abuse protection on `lead-forward.php`.** (a) 403 when `Origin` or `Referer` is present and its host is not `gruas.com.py` / `www.gruas.com.py`; allow when both are absent. (b) Per-IP throttle: key `sha256(ip . date('YmdHi'))` under `sys_get_temp_dir() . '/gruas-rl/'`, max 5 per minute, respond 429. (c) Hidden field `t` set by `site.js` to `Date.now()` on load; respond 204 silently when submitted under 3 seconds; a missing `t` passes (no-JS path).
11. **Validate phone and email.** Phone: keep digits and a leading `+`; convert `09xxxxxxxx` to `+5959xxxxxxxx`; require 8 to 15 digits else 400 with `{"ok":false,"error":"phone"}`. Email: `FILTER_VALIDATE_EMAIL`, set to `null` when invalid. `site.js` shows a Spanish message for `error: "phone"`.
12. **JSONL out of the web root.** New `lib/leads-dir.php` with `gruas_leads_dir()`: returns `dirname(__DIR__) . '/private/leads'` when it exists and is writable, else the public root. Use it in both endpoints. Document in `docs/VENDERCRM-CONFIGURATION.md`.
13. **Harden `lead-event.php`.** Same origin check, per-IP throttle at 30 per minute, write to `lead-events-YYYY-MM.jsonl` in `gruas_leads_dir()`.
14. **Lead report.** `tools/lead-report.php` (CLI): reads `leads.jsonl` and all `lead-events-*.jsonl`, prints a monthly table per event type, then breakdowns by `zona`, `page`, `utm_campaign`. Flag `--month=2026-10`. Add `"report": "php tools/lead-report.php"` to `package.json`.
15. **Tests.** New `tests/lead-handlers.cjs` using the same PHP `-n` stub approach as the existing test: honeypot 204, empty phone 400, invalid phone 400, `09` normalisation, foreign Origin 403, 6th request 429, non-AJAX redirect to `/gracias.html`, `lead-event.php` whitelist and monthly file name. Add it to `npm test`.

### Subagent C — SEO plumbing (items 18, 21, 22, 24). Owns: `sitemap.xml`, `tools/build-sitemap.js`, `site.webmanifest`, `assets/img/icon-*.png`, image attributes in all `.html`, the consent banner markup in all `.html` and `site.js` section 5, the lazy/fetchpriority check in `qa/render.js`.

18. **Generated sitemap.** `tools/build-sitemap.js` walks every `index.html` plus `politica-de-privacidad.html` (exclude `404.html`, `gracias.html`), emits `<loc>` and `<lastmod>` from `git log -1 --format=%cI -- <file>`, keeps priorities by folder (home 1.0, servicios and cotizador 0.9, zonas and nosotros 0.8, contacto 0.7, FAQ 0.6, guias 0.5, privacidad 0.2). Regenerate `sitemap.xml`. Add `"sitemap"` script and a staleness check to `npm run check`.
21. **Image attributes.** First `<img>` on each page: `fetchpriority="high"`, no `loading`. Every other `<img>`: `loading="lazy" decoding="async"`. Add a check to `qa/render.js`.
22. **Consent banner.** Remove the banner markup from all pages and section 5 of `site.js` (nothing third-party is loaded). Leave a comment in `site.js` explaining how to re-add it as gated analytics loading when GA4/GTM arrives. Update `politica-de-privacidad.html` only where it names the banner.
24. **Manifest.** `theme_color` and `background_color` to `#FBFAF8`. Generate `assets/img/icon-192.png` and `icon-512.png` from `favicon.svg` with Pillow (see `tools/build-og.py` for conventions) and list them in `site.webmanifest`.

### Subagent D — QA harness and comments (items 6, 8, 9). Owns: `qa/qa.js`, `qa/README.md`, comments in `tools/build-images.py` and `assets/js/site.js` (comments only, no logic), the `qa:spec` script in `package.json`.

6. Remove hardcoded `/home/user/gruas` and `8899` from `qa/qa.js`: `path.resolve(__dirname, '..')` and `process.env.BASE || 'http://localhost:8899'`. Make `qa.js` start its own static server the way `render.js` does, sharing the server code. Add `"qa:spec": "node qa/qa.js"`.
8. Standardise on the `playwright` package already in `devDependencies`; drop the `playwright-core` instructions from `qa/README.md`.
9. Rewrite `qa/README.md` in Spanish only. Translate Swedish comments in `tools/build-images.py` to English (tooling) and in `assets/js/site.js` to Spanish (site-facing). Comments only, no behavioural change; `git diff --stat` on `site.js` must show comment lines only.

Open PRs B, C, D. Tell me, then wait for my merges before Phase 3 (Phase 3 edits the same HTML files as C).

## Phase 3 — content (items 19, 20). Sonnet 5.5 for copy, you review. Stop for my approval on the first zone.

19. **Images on image-less pages.** Zone pages: a `<picture>` with `gran-asuncion-grua-circulando` (existing AVIF + WebP, existing dimensions, `loading="lazy"`) below the hero copy with a zone-specific Spanish `alt`. `servicios/ambulancias-privadas/`: the existing `ambulancia-privada-traslado` asset. `nosotros/`: reuse `grua-plataforma-cargando-auto-asuncion`. Leave `contacto/`, `cotizador/`, `preguntas-frecuentes/` without images. Run `npm run qa` for CLS and overflow.
20. **Zone page depth.** For each of the seven `zonas/*` pages: one paragraph naming two or three real roads or landmarks of that zone (verify each with a web search; Ruta 2 and Mercado 4 for San Lorenzo, Silvio Pettirossi airport and Ruta Transchaco for Luque, Acceso Sur for Lambaré, and so on), a three-question zone FAQ with `FAQPage` JSON-LD, and a "Zonas vecinas" block linking two neighbouring zones. Target 900 to 1100 words. es-PY voseo, no prices, no response-time promises. **Do San Lorenzo first, show me the copy in chat, and wait for my approval before the subagent does the other six.** Then one PR E.

## Delivery

After each phase: list PR links, the `npm run check` output, and anything you deliberately did not do and why. Do not merge anything yourself.
