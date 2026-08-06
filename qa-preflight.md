# QA-preflight — gruas.com.py

**Körd:** 2026-08-06 · **Spår:** INDUSTRIAL · **Omfattning:** `/`, `/404.html`,
`/gracias.html`, `/politica-de-privacidad.html`

Checklistan kommer ur `BUILD-SPEC-v2.md` §9. Den är **körd, inte påstådd**: 89
kontroller automatiserade i Chromium via Playwright (`qa/qa.js`), plus Lighthouse
mobil. Varje rad nedan har ett mätvärde bakom sig. Fel tystas inte.

**Resultat: 88 av 89 godkända.** Ett kvarstående fel, plus en avvikelse som
kräver ett beslut som inte är mitt att ta. Båda står nedan.

---

## Kvarstående fel

### 1. Fjorton döda interna länkar — väntar på PR 4

Startsidan länkar till alla femton sidor enligt spec §2. Fjorton av dem finns
ännu inte:

```
/servicios/remolque-de-vehiculos/   /zonas/san-lorenzo/     /cotizador/
/servicios/auxilio-mecanico/        /zonas/luque/           /contacto/
/servicios/cerrajeria-de-urgencia/  /zonas/lambare/         /preguntas-frecuentes/
/servicios/siniestros/              /zonas/interior/        /guias/auto-parado-en-la-ruta/
/servicios/ambulancias-privadas/                            /guias/despues-de-un-choque/
```

Det här är **PR 4:s uppdrag**, inte ett fel i PR 3. Länkarna är avsiktligt
lagda i förväg så att den interna länkstrukturen är klar när sidorna landar.
Raden förblir röd tills PR 4 mergas — det är meningen.

---

## Avvikelse som kräver ditt beslut

### Kontrast mot den låsta accentfärgen

Lighthouse ger tillgänglighet **97/100**. Det enda underkända kriteriet är
`color-contrast`, och det går inte att laga utan att röra den låsta paletten:

| Kombination | Var | Uppmätt | WCAG AA kräver |
|---|---|---|---|
| `#FFFFFF` på `#E8562A` | varje `.btn--primary` | **3,62:1** | 4,5:1 |
| `#E8562A` på `#F5F3F0` | `.eyebrow` och `<legend>` i `.inverse`-sektionen | **3,27:1** | 4,5:1 |

Två spec-regler krockar här:

- §1 låser paletten: *"Den filen är sanningen. Skriv inga egna värden, härled
  ingenting, tolka ingenting."*
- §9 kräver 4,5:1 för dämpad text.

Bokstavligt läst är §9 uppfylld — **dämpad** brödtext klarar kravet med god
marginal (87 element mätta mot sin faktiska bakgrund, alla godkända). Det som
faller är accentfärgen buren som text- respektive knappfärg, och den är låst.

Jag har därför **inte** ändrat `--accent` på eget bevåg. En varumärkesfärg är
ditt beslut, inte en QA-fix. Två vägar:

1. **Mörka accenten till `#C4431F`.** Ger **5,04:1** mot vitt och **4,55:1**
   mot `#F5F3F0` — båda över AA-kravet, uppmätt inte uppskattat. Nyansen
   flyttar sig knappt synbart.
2. **Behåll `#E8562A` och acceptera AA-avvikelsen** på knappar och eyebrows.
   Fullt försvarbart som varumärkesval — men då ska det stå att det är valt,
   inte missat.

Säg vilken, så genomför jag den.

---

## Prestanda — läs siffran med förbehåll

Lighthouse mobil, körd lokalt:

| Kategori | Poäng |
|---|---|
| Prestanda | 89 |
| Tillgänglighet | 97 |
| Best practices | 96 |
| SEO | 100 |

**Prestandasiffran 89 är inte representativ, och jag rapporterar den ändå.**
Nyckeltalen motsäger varandra:

```
First Contentful Paint     1,5 s   ✅
Largest Contentful Paint   1,5 s   ✅
Total Blocking Time         70 ms  ✅
Cumulative Layout Shift        0   ✅
Speed Index               19,6 s   ❌  ← ensam orsak till 89
```

Speed Index på 19,6 s med FCP och LCP på 1,5 s är inte ett verkligt beteende.
Det är två artefakter i den här miljön: alla nio bildfiler saknas ännu och ger
404, och Google Fonts är blockerat av proxyn. Sidan "sätter sig" därför aldrig
visuellt för mätaren. Samma sak driver `errors-in-console` i best practices.

**Siffran måste köras om när bilderna ligger på plats och mot en riktig
värd.** Först då går den att ställa mot spec-kravet ≥90. Jag varken påstår att
kravet är uppfyllt eller att det är brutet — mätningen är inte giltig än.

Viktbudgeten är däremot mätbar redan nu: **71 KB** utan bilder mot taket
500 KB. Det lämnar ~430 KB åt bildsetet.

---

## Avbockad checklista

Varje rad motsvarar en automatiserad kontroll. `qa/qa.js` i denna commit kör om
hela svepet.

### Innehåll
- [x] Noll synlig platshållartext — `[COMPLETAR]`, lorem, TODO, FIXME: inga träffar på någon sida
- [x] Noll tomma listrader eller halvfyllda tabeller
- [x] Noll uppfunna reseñas, betyg, år eller certifieringar — §8 Compromiso säger uttryckligen att recensioner saknas
- [x] Varje bildslot har markup och står som pending i §8 — nio slots wire:ade, filerna ännu inte levererade

### Layout
- [x] Inget överlapp eller överflöd @360 / 768 / 1280 / 1920 — `scrollWidth === clientWidth` på alla fyra
- [x] Max 2 sektioner i rad delar mönster
- [x] ≥1 full-bleed (P8 franja, P6 banda) · ≥1 avsiktligt överlapp (`.p6__panel`) · exakt 1 oversized statement
- [x] ≥3 kortvarianter, ingen över 4 ggr — hair 4, accent 3, raised 3, ink 1
- [x] Ingen sektion >70 % tomrum utan bild eller textur — `.grain` på varje mörk sektion

### Typ och färg
- [x] Exakt ett display-snitt + ett text-snitt, preloadade, `display=swap`
- [x] Body 17 px, line-height 1,65, measure 65ch
- [x] Dämpad text ≥4.5:1 mot faktisk bakgrund — 87 element mätta
- [ ] Exakt en accentfärg — **uppfyllt**, men se avvikelsen ovan om kontrast
- [x] `#25D366` endast inuti WhatsApp-glyfen — noll element utanför `<svg>`

### Rörelse
- [x] `prefers-reduced-motion: reduce` stänger av allt — testat i separat kontext, noll dolda element
- [x] ≤15 % av elementen animerar — **2,6 %** (12 av 461)
- [x] Ingen entré-animation på hero-text ovanför fold — noll `data-reveal` i `.p1--hero`
- [x] Ingen parallax under 1024px — ingen parallax alls

### Prestanda
- [x] Hero `fetchpriority="high"`, ej lazy, AVIF med WebP-fallback
- [x] Alla bilder under fold `loading="lazy"` + explicit `width`/`height`
- [x] Sidvikt 71 KB utan bilder mot taket 500 KB
- [ ] Lighthouse mobil ≥90 — **mätningen är inte giltig än**, se förbehållet ovan

### Teknik
- [x] En `<h1>` per sida — rättat i `gracias.html`, som hade två
- [x] Semantiska landmärken, beskrivande spanska alt-texter på samtliga bilder
- [x] Rubriknivåer i ordning — rättat, `<h4>` följde `<h2>` i P5-stegen och i Formas de pago
- [x] Canonical, og-taggar, viewport, favicon på alla sidor
- [x] `LocalBusiness` + `FAQPage` JSON-LD parsar
- [x] Formuläret postar till `lead-forward.php` — kontraktet intakt: `name`, `phone`, `message`, `page_url`, `website`
- [x] Ingen `mailto:`, ingen tredjepartsendpoint, ingen API-nyckel i klientkällkod
- [x] `whatsapp_click` och `call_click` avfyras med `page_path` — verifierat mot `window.dataLayer`
- [x] Ingen `noindex` på `/` eller `/politica-de-privacidad.html`
- [x] `/` och `/politica-de-privacidad.html` svarar 200
- [ ] Inga döda interna länkar — 14 st, väntar på PR 4

### Paraguay-specifikt
- [x] Voseo i alla CTA, noll "tú"-former, noll engelska i UI
- [x] `wa.me/595995628862` utan plus eller mellanslag, förifylld text unik per plats
- [x] Telefonnumret klickbart **och** synligt som text — rättat i `404.html`, som saknade det
- [x] IVA deklarerat, inga belopp publicerade
- [x] Consent-banner finns, inget förikryssat

---

## Vad som rättades under körningen

Fyra verkliga fel hittades och åtgärdades i denna PR:

1. `gracias.html` hade **två `<h1>`** — fel- och ok-läget var två separata
   block. Nu en rubrik vars text skrivs om vid fel.
2. `404.html` visade telefonnumret **bara som länktext i en knapp**, aldrig som
   läsbar text. Paraguay-regeln kräver båda.
3. `.card--hair` användes **fem gånger** på startsidan mot taket fyra.
   Kontaktkortet flyttat till `.card--raised`.
4. **Rubriknivåer hoppade** — `<h4>` direkt efter `<h2>` i P5-stegen och i
   Formas de pago. Nu `<h3>`, med `site.css`-selektorn breddad så att
   positioneringen följer med.

Ett fel i själva kontrollskriptet rättades också: `TODO`-mönstret matchade
spanska **"todo"** och flaggade sju legitima textrader. Nu skiftlägeskänsligt
med ordgräns.
