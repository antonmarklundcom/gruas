# Handoff-prompt — bygg PR 3, 4, 5 för gruas.com.py

Klistra in allt nedanför linjen i ett nytt fönster.

---

Repo: `antonmarklundcom/gruas`. Bygg PR 3, 4 och 5 enligt `BUILD-SPEC-v2.md`.

**Läs först, innan du skriver en rad kod:**
- `BUILD-SPEC-v2.md` i repo-roten — hela specen, den styr allt
- `IMAGE-PROMPTS.md` — bildslotarnas bindande filnamn
- Ladda skills: `paraguay-local-site`, `web-design-system`, `higgsfield-web-imagery`

**Tre saker du måste veta som inte står i specen:**

1. `assets/css/site.css` och `assets/js/site.js` finns i repot men är **inte
   länkade från `index.html`**. Sidan har i dag ett eget inline
   `<style>`-block (rad 116–516) och laddar aldrig de externa filerna. Hela
   designfundamentet från PR 1 är därmed dött på den levererade sidan. Fixa
   detta i PR 3: flytta in det inline-blocket i `site.css`, länka `site.css`
   och `site.js` från alla sidor, och lämna inget dubbelt regelverk kvar.

2. Bildfilerna finns **ännu inte** i repot. Wire:a varje slot mot exakt de
   filnamn som står i `IMAGE-PROMPTS.md`, med `<picture>`, AVIF + WebP,
   explicit `width`/`height`, `loading="lazy"` under fold och
   `fetchpriority="high"` på heron. Sidan ska fungera med tomma slots tills
   filerna landar — men ingen slot får sakna markup.

3. GitHub-PR-numren ligger ett steg före specens. Specens PR 3 blir GitHub-PR
   nummer 5. Gå efter specens numrering i grennamn och beskrivningar.

**Grenar, en PR i taget, merga innan nästa öppnas:**

| Specens PR | Gren | Innehåll |
|---|---|---|
| 3 | `claude/gruas-site-rebuild-gbsfoo-03-home` | `index.html` ombyggd enligt spec §2–§4, plus 404/gracias/privacidad restylade, plus gamla `BUILD-SPEC.md` raderad |
| 4 | `claude/gruas-site-rebuild-gbsfoo-04-core15` | de 14 undersidorna + sitemap, robots, schema, breadcrumbs, intern länkning |
| 5 | `claude/gruas-site-rebuild-gbsfoo-05-qa` | `qa-preflight.md` körd på riktigt, Lighthouse, viktbudget, 5 brytpunkter |

**Hårda krav genom hela bygget:**
- Statisk HTML. Ingen byggkedja, inget ramverk, inga externa CDN-anrop.
- All copy på spanska, paraguayansk voseo, precis som i specen. Översätt aldrig
  om befintlig copy — den är godkänd.
- Telefon `+595 995 628 862` och RUC `9327811-0` är bekräftade. Hitta aldrig på
  öppettider, år i branschen, omdömen eller certifikat — se spec §8.
- Sidvikt ≤ 500 KB, hero ≤ 120 KB.
- `prefers-reduced-motion` respekteras överallt.
- Kör specens QA-checklista (§ sista) innan varje PR öppnas, inte bara i PR 5.

Fråga inte om lov mellan PR:erna — bygg, committa, pusha och öppna PR:en, och
fortsätt till nästa.
