# BUILD-SPEC — gruas.com.py

**Läge:** 0 (spec, ingen kod). Exekveras separat.
**Skill:** `paraguay-local-site` — LÄGE 1 (one-pager), spår **PD — Urgencia**.
**Status:** väntar på godkännande + ifyllda platshållare (§9).

> **Exekveringsprompt (använd ordagrant i nästa session):**
> *"Implementera BUILD-SPEC.md exakt. Avvik inte. Fråga vid oklarhet istället för att gissa. Uppfinn inga fakta om verksamheten — allt som inte står i specen finns inte."*

---

## 0. Ifyllt intake-block

```
NEGOCIO:        gruas.com.py
                (visningsnamn i UI: "Grúas Paraguay" ⚠️ — se §9.1, byt vid behov)
OFICIO:         grúas / remolque / asistencia vial
CIUDAD:         Asunción (Capital) + Gran Asunción (Central)
BARRIOS:        Villa Morra, Recoleta, Sajonia, Barrio Jara ⚠️
                (används endast som naturlig text i cobertura/FAQ, inga barrio-sidor)
ZONAS:          Asunción · San Lorenzo · Luque · Lambaré · Fernando de la Mora ·
                Capiatá · Mariano Roque Alonso · ruta Asunción–Ciudad del Este
WHATSAPP:       {{WHATSAPP_E164}}  ⚠️ BLOCKERANDE — måste fyllas före deploy
TELÉFONO FIJO:  {{TELEFONO_FIJO}}  ⚠️ valfritt — utelämnas om tomt
SERVICIOS:      5 bekräftade + 6 föreslagna (§4) — grupperade i 4 kategorier (§5)
DIFERENCIAL:    "Una sola conversación de WhatsApp resuelve todo: mandás ubicación,
                te pasamos el precio cerrado, sale la unidad."
                (⚠️ processlöfte, inte prestandapåstående — säkert utan data)
CONFIANZA:      {{RUC}} · {{ANIOS_EXPERIENCIA}} · {{SEGURO_TRASLADO}} · factura legal
                ⚠️ ALLA gated — raden döljs helt om värdet saknas (§9.2)
RESEÑAS:        INGA → sektion 8 ersätts enligt §5-tabellen i skillen
FOTOS:          INGA → motivpaneler, CSS/SVG (§8)
CONVERSIÓN:     dubbel-primär — WhatsApp OCH llamada likvärdigt prominenta
                (PD tillåter llamada-first; här körs båda som primära, se §6.3)
DISEÑO:         PD — Urgencia
PRECIOS:        Inga belopp visas. "Precio cerrado por WhatsApp antes de salir."
PAGOS:          {{PAGOS}} ⚠️ gated — förslag: efectivo, transferencia,
                Tigo Money, Billetera Personal (renderas bara om bekräftat)
INDEXERING:     Egen domän, egen lead gen → sajten SKA indexeras.
                Men bygg med noindex tills §9 är ifylld. Se §12.
```

**Skillnad mot standardflödet:** detta är ingen kunddemo. Ingen `noindex` för evigt, ingen subdomän — sajten ska rankas. Därför är kraven på faktarenhet hårdare, inte mjukare: en påhittad uppgift på en sajt som faktiskt tar emot samtal är ett verkligt problem, inte en demobugg.

---

## 1. Designtokens — PD Urgencia (kopierade, tolka inte)

Skriv in exakt detta som `:root` i den inlinade CSS:en.

```css
:root{
  /* Palett */
  --bg:            #FFFFFF;
  --surface:       #F7F8FA;
  --text:          #0F1317;
  --muted:         #59626C;
  --accent:        #DC2626;   /* röd — urgencia, primär CTA "Llamar" */
  --accent-2:      #1D4ED8;   /* blå — sekundär accent, cobertura/info */
  --border:        #E4E7EB;
  --wa:            #25D366;   /* ENDAST WhatsApp. Aldrig som dekor. */
  --wa-dark:       #1EBE5A;   /* endast hover/active på WhatsApp-element */
  --ink-band:      #0F1317;   /* mörkt band, sektion 3 */

  /* Radie + skugga (gemensamt för alla spår) */
  --r:             14px;
  --r-sm:          12px;
  --shadow:        0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.06);
  --shadow-lift:   0 2px 4px rgba(0,0,0,.05), 0 14px 32px rgba(0,0,0,.10);

  /* Typografi */
  --font-head: 'Inter', system-ui, -apple-system, sans-serif;  /* 800 */
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;  /* 400/600 */

  --h1:    clamp(44px, 6vw, 76px);
  --h2:    clamp(32px, 4vw, 48px);
  --h3:    clamp(20px, 2.2vw, 26px);
  --phone: clamp(28px, 4vw, 44px);   /* numret som display-element */
  --lead:  clamp(18px, 1.6vw, 20px);
  --body:  17px;
  --small: 15px;
  --label: 13px;                      /* versaler, letter-spacing .08em */

  /* Rytm */
  --container: min(1280px, 100% - 48px);
  --pad-y:     clamp(64px, 8vw, 128px);

  --ease:      cubic-bezier(0.16, 1, 0.3, 1);
}
@media (max-width:640px){ :root{ --container: min(1280px, 100% - 32px); --body:16px; } }
```

**Typsnitt:** ett enda Google Font-anrop.
`<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">`
Föregås av `preconnect` mot `fonts.googleapis.com` och `fonts.gstatic.com` (crossorigin).

**Rörelse (PD = minimal):** fade-up 12px / 400ms / `--ease`, 80ms stagger, endast en gång per sektion via `IntersectionObserver`. Hover-lyft 4px på kort. **Ingen animation någonstans i heron ovanför fold** — inget får fördröja första klicket. Hela rörelsesystemet stängs av under `@media (prefers-reduced-motion: reduce)`.

**Färgdisciplin:** grön `#25D366` förekommer på exakt tre ställen — WhatsApp-knappar, WhatsApp-FAB, WhatsApp-halvan av sticky mobilbaren. Ingen grön ikon, ingen grön kant, ingen grön hover någon annanstans. Rött är sajtens accent.

---

## 2. Sektionsordning + layoutmönster

| # | Sektion | Mönster | Bryter container | Gränsöverlapp |
|---|---|---|---|---|
| 1 | Sticky header | — | nej | — |
| 2 | Hero | **(a)** split 55/45 | ja — visual bleeder till höger kant | ja → kort korsar ner i §3 |
| 3 | Franja de confianza | **(h)** kant-till-kant mörkt band | ja — full-bleed | tar emot heroöverlappet |
| 4 | Servicios | **(d)** bento 4 kategorikort | nej | — |
| 5 | Banda de cobertura | **(b)** full-bleed motivpanel + overlay | ja — full-bleed | ja → statistikkort korsar upp i §4 |
| 6 | Cómo trabajamos | **(e)** horisontell stepper | nej | — |
| 7 | Zonas de cobertura | **(c)** 2/3 + 1/3 | nej | ja → kartpanel korsar ner i §8 |
| 8 | Compromiso + qué hacer mientras esperás | **(g)** sticky-media-split | nej | tar emot §7-överlappet |
| 9 | Banda CTA con número | **(h)** kant-till-kant accentband | ja — full-bleed | — |
| 10 | Precios y formas de pago | **(a)** split | nej | — |
| 11 | Preguntas frecuentes | **(f)** centrerad smal kolumn (enda gången) | nej | — |
| 12 | Contacto | **(a)** split — WhatsApp-block + formulär | nej | — |
| 13 | Footer | — | full-bleed mörk | — |
| — | WhatsApp-FAB + sticky mobilbar | fixed | — | — |

**Kontroller mot DESIGN FLOOR:**
- Inga två intilliggande sektioner delar mönster: `a,h,d,b,e,c,g,h,a,f,a` ✔
- `(f)` används exakt en gång ✔
- Hero är split, aldrig centrerat textblock ✔
- 4 containerbrott (2,3,5,9 + footer) ≥ 2 ✔
- 3 gränsöverlapp ≥ 2 ✔
- Endast en rad med lika kort på hela sidan (§4 bento har medvetet ojämna celler) ✔

**Sektion 8 är reseñas-ersättningen** (§5 i skillen: inga reseñas → arbetsprinciper). Ingen tom sektion, ingen påhittad recension, ingen "★★★★★"-widget.

---

## 3. Bekräftade tjänster (dina fem — ordagrant, ändras inte)

| # | Namn | Beskrivning (din formulering, oförändrad) |
|---|---|---|
| S1 | Siniestros | remolque y asistencia en accidentes viales |
| S2 | Cerrajería de Urgencia | apertura de vehículos sin daños |
| S3 | Cambio de Neumáticos | reemplazo o inflado en el lugar |
| S4 | Ambulancias Privadas | traslado rápido y seguro de pacientes |
| S5 | Remolque de Vehículos | para averías, traslados o retiro por multas |

---

## 4. FÖRSLAG — ytterligare tjänster (kräver ditt OK)

Inget nedanför byggs in förrän du godkänner rad för rad. Kryssa i kolumnen och skicka tillbaka.

| ☐ | ID | Namn | Föreslagen beskrivning | Varför |
|---|---|---|---|---|
| ☐ | P1 | **Auxilio Mecánico y Paso de Corriente** | arranque con cables, batería y fallas menores en el lugar | Högst sökvolym av alla tillägg. Många bogseringssamtal är egentligen döda batterier — utan raden ringer de någon annan. Billigast jobbet, snabbast intäkten. |
| ☐ | P2 | **Combustible de Emergencia** | traslado de nafta o diésel hasta donde estés | Trivialt att leverera, mycket hög upplevd räddning. Passar naturligt i "asistencia en el lugar". |
| ☐ | P3 | **Rescate y Extracción** | vehículos empantanados, en zanja o fuera de la calzada | Distinkt jobbtyp och distinkt sökning ("sacar auto empantanado"), högre snittintäkt än vanlig bogsering. Relevant hela regnsäsongen. |
| ☐ | P4 | **Grúa Planchada (0km y alta gama)** | plataforma para vehículos que no pueden ser remolcados por las ruedas | Kräver att du faktiskt har planchada/plataforma. Godkänn bara då. Filtrerar in dyrare kunder: agencias, 0km, importerade fordon. |
| ☐ | P5 | **Remolque Interdepartamental** | traslados de larga distancia dentro del país | Motiverar rutan Asunción–Ciudad del Este som redan ligger i ZONAS. Utan raden är rutan bara ett påstående. |
| ☐ | P6 | **Traslado de Maquinaria y Equipos** | motos, cuatriciclos, maquinaria liviana y equipos | Kräver rätt utrustning. B2B-spår: verkstäder, byggföretag, uthyrare — återkommande kunder istället för engångsakuta. |

**Min rekommendation om du vill hålla nere omfånget:** godkänn **P1, P2, P3** (kräver ingen ny utrustning, bara att du säger ja när telefonen ringer) och lägg P4–P6 i LÄGE 2 när du vet vad du faktiskt kan leverera. Med 5 + 3 = 8 tjänster håller grupperingen i §5 utan omritning.

**Om du inte godkänner något:** sajten byggs med de fem bekräftade, och kategori "Asistencia en el lugar" innehåller då bara S2 och S3. Layouten fungerar ändå — bento-cellerna är dimensionerade efter kategori, inte efter antal rader.

---

## 5. Grupperingen i sektion 4 — beslut och motivering

**Beslut: 4 kategorier, bento (d), en cell per kategori, tjänsterna som underrader inuti cellen.**

| Cell | Kategori | Underrader (bekräftade) | Underrader (om godkända) |
|---|---|---|---|
| A (stor, 2 kol × 2 rad) | **Emergencias viales** | Siniestros · Remolque de Vehículos | Rescate y Extracción (P3) |
| B | **Asistencia en el lugar** | Cerrajería de Urgencia · Cambio de Neumáticos | Auxilio Mecánico y Paso de Corriente (P1) · Combustible de Emergencia (P2) |
| C | **Traslados programados** | Remolque de Vehículos *(traslados, retiro por multas)* | Grúa Planchada (P4) · Remolque Interdepartamental (P5) · Traslado de Maquinaria (P6) |
| D (accentkant, blå `--accent-2`) | **Ambulancias privadas** | Ambulancias Privadas | — |

*Remolque de Vehículos står i två celler med olika vinkel (akut haveri vs. planerad flytt). Det är avsiktligt: samma tjänst, två olika sökintentioner. Rubriken är identisk båda gångerna, brödtexten skiljer.*

**Varför 4 och inte 5 eller 10 platta kort:**

1. **Bento-mönstret bryter vid ~6 celler.** Med 10 tjänster som platta kort blir §4 tre rader med lika stora rutor — exakt det §3.7 i skillen bannlyser. Med 4 celler kan cellerna ha olika storlek, vilket är hela poängen med bento.
2. **Kategorierna följer besökarens fråga, inte företagets utrustningslista.** En människa vid vägkanten tänker "chocaron/no arranca/quiero mudar el auto/necesito ambulancia" — inte "jag behöver en grúa av typ planchada". Kategorinamnen speglar det som redan hänt personen.
3. **Ambulancias måste stå för sig.** Det är en helt annan köpare (anhörig, klinik, försäkringsbolag), en annan känsla och en annan efterlevnadsnivå. Bakad in bland däckbyten sänker den både trovärdighet och konvertering. Egen cell, egen accentfärg (blå, inte röd), egen WhatsApp-prefill.
4. **Skalbarhet utan omdesign.** P1–P6 landar i befintliga celler som nya `<li>`-rader. Sonnet behöver aldrig ändra grid-koden när du godkänner fler tjänster — bara lägga till rader.
5. **Kategorierna är redan LÄGE 2-arkitekturen.** De fyra blir `/servicios/emergencias-viales/`, `/asistencia-en-el-lugar/`, `/traslados/`, `/ambulancias-privadas/`. Grupperingsbeslutet fattas alltså en gång, inte två.

**Varför inte 5 kategorier:** en femte ("Cerrajería" eller "Neumáticos" som egen) ger celler med en enda rad — visuellt tomma, och de två hör ändå ihop under "vi kommer till dig och löser det på plats utan att bogsera". 4 celler mappar dessutom rent till 2×2 på tablet och 1 kolumn på mobil.

**Grid-spec:**
```
≥1024px:  grid-template-columns: repeat(4, 1fr);
          A: span 2 / row-span 2 · B: span 2 · C: span 2 · D: span 2 (bredvid B/C)
640–1023: 2 kolumner, A spänner båda
<640px:   1 kolumn, ordning A → B → C → D
```

---

## 6. FÄRDIG COPY — ordagrant, per sektion

> Regler för exekveringen: skriv texten exakt som den står. Ändra inte ordval, inte skiljetecken, inte versalisering. Voseo genomgående. Ingen text på engelska någonstans i UI. Guaraní förekommer på exakt ett ställe (footer-taglinen) — lägg inte till fler.

### 6.1 Sticky header

- Vänster (logotyp-text): **`gruas.com.py`** — `--font-head` 800, punkten i `.py` i `--accent`.
- Mitten (endast ≥1024px, ankarlänkar): `Servicios` · `Cómo trabajamos` · `Zonas` · `Precios` · `Contacto`
- Höger, telefonnummer som synlig text (klickbar `tel:`): **`{{TELEFONO_DISPLAY}}`**
- Höger, knapp (grön, WhatsApp): **`Escribinos ahora`**

Under 1024px döljs mittnavigationen. Under 640px döljs även telefontexten i headern (den finns i sticky mobilbaren istället) — kvar blir logotyp + grön WhatsApp-knapp.

### 6.2 Sektion 2 — HERO · mönster (a), split 55/45

**Vänsterkolumn (55%):**

- Eyebrow (versaler, `--label`, `--accent`):
  `ASISTENCIA VIAL · ASUNCIÓN Y GRAN ASUNCIÓN`

- **H1:**
  `Grúas y asistencia vial en Asunción`

- Ingress (`--lead`):
  `Quedaste en la calle, chocaste o el auto no arranca. Escribinos por WhatsApp con tu ubicación, te pasamos el precio cerrado antes de salir y mandamos la unidad más cercana disponible.`

- Tre snabbpunkter med liten röd markör (inline, wrappar på mobil):
  `Siniestros` · `Remolque` · `Cerrajería de urgencia` · `Ambulancias`

- **Primär CTA (grön, WhatsApp, minst 56px hög, full bredd under 640px):**
  `Escribinos por WhatsApp`
  Underrad inuti knappen, mindre: `Mandá tu ubicación y te respondemos`

- **Sekundär CTA (röd fylld, samma vikt visuellt — dubbel-primär, se §6.3):**
  `Llamar ahora`

- Numret som display-element under knapparna (`--phone`, 800, klickbart `tel:`):
  **`{{TELEFONO_DISPLAY}}`**
  Etikett ovanför (versaler, `--label`, `--muted`): `LLAMÁ O GUARDÁ ESTE NÚMERO`

- Mikrotext under numret (`--small`, `--muted`):
  `Si no podés hablar, mandá un mensaje. Con la ubicación alcanza.`

**Högerkolumn (45%, bleeder ut till högra fönsterkanten):**
Motivpanel `HERO-MAP` (§8.1) — stiliserad täckningskarta över Gran Asunción med radie. Ovanpå kartan ett vitt kort (`--shadow`, `--r`) som **korsar ner i sektion 3**:

- Kortrubrik: `Decinos esto y salimos más rápido`
- Numrerad lista:
  1. `Tu ubicación (mandala por WhatsApp, es un toque)`
  2. `Qué le pasó al vehículo`
  3. `Marca y modelo`
  4. `A dónde lo llevamos`

Höjd: 85–95vh desktop. Under 1024px kollapsar splitten till en kolumn med **kartan ÖVER texten** (skillens regel för hero), maxhöjd 240px, och "Decinos esto"-kortet flyttas under CTA-blocket.

### 6.3 Dubbel-primär konvertering — regel för hela sajten

PD tillåter llamada-first. Här körs **båda som primära** eftersom besökaren står vid vägkanten och den snabbaste kanalen varierar med situationen (i en krock ringer man, i en tunnel eller med barn i bilen skriver man).

Överallt där ett CTA-par förekommer gäller:
- **Samma höjd, samma padding, samma typvikt, samma radie.** WhatsApp grön, Llamar röd.
- **WhatsApp först i DOM-ordning** (den vinner på mobil och läses först av skärmläsare).
- Ingen av dem får renderas som textlänk eller ghost-knapp. Ingen "eller"-text emellan.
- På mobil staplas de, WhatsApp överst, båda full bredd, 12px mellanrum.

### 6.4 Sektion 3 — FRANJA DE CONFIANZA · mönster (h), mörkt band

Bakgrund `--ink-band`, vit text, full-bleed. Fyra celler avdelade av 1px `rgba(255,255,255,.12)`. **Varje cell renderas endast om värdet finns — annars tas cellen bort och de kvarvarande fördelas jämnt.**

| Cell | Etikett (versaler) | Värde | Gate |
|---|---|---|---|
| 1 | `RUC` | `{{RUC}}` | döljs om tomt |
| 2 | `EXPERIENCIA` | `{{ANIOS_EXPERIENCIA}} años en el rubro` | döljs om tomt |
| 3 | `TRASLADO ASEGURADO` | `{{SEGURO_TRASLADO}}` | döljs om tomt |
| 4 | `FACTURA` | `Emitimos factura legal` | döljs om {{RUC}} tomt |

**Om alla fyra saknas: hela sektion 3 tas bort ur DOM.** Heroöverlappet landar då direkt på sektion 4:s bakgrund — kortet får då `margin-bottom` istället för negativ offset. Bygg båda varianterna, styrda av en enda konstant högst upp i filen.

### 6.5 Sektion 4 — SERVICIOS · mönster (d), bento

- Eyebrow: `SERVICIOS`
- **H2:** `Todo lo que resolvemos en la calle`
- Ingress (max 2 rader, vänsterställd, bredd 60ch):
  `Un solo número para siniestros, remolques, asistencia en el lugar y traslado de pacientes. Contanos qué pasó y te decimos de una si podemos y cuánto sale.`

**Cell A — Emergencias viales** (stor cell, röd tonad ikoncontainer)
Rubrik: `Emergencias viales`
Ingress: `Cuando el vehículo ya no se mueve solo y hay que actuar ahora.`
Rader:
- **`Siniestros`** — `Remolque y asistencia en accidentes viales. Retiramos el vehículo del lugar y coordinamos a dónde lo llevamos.`
- **`Remolque de Vehículos`** — `Averías en la vía, motor que no arranca, vehículo que no puede circular. Lo levantamos y lo trasladamos.`
- *(om P3 godkänns)* **`Rescate y Extracción`** — `Vehículos empantanados, en zanja o fuera de la calzada.`
CTA i cellen (textlänk med pil, röd): `Escribinos por una emergencia`

**Cell B — Asistencia en el lugar**
Rubrik: `Asistencia en el lugar`
Ingress: `A veces no hace falta remolcar. Vamos, lo resolvemos ahí y seguís tu camino.`
Rader:
- **`Cerrajería de Urgencia`** — `Apertura de vehículos sin daños. Llaves adentro, cerradura trabada o llave perdida.`
- **`Cambio de Neumáticos`** — `Reemplazo o inflado en el lugar, con tu auxilio o con el nuestro.`
- *(om P1)* **`Auxilio Mecánico y Paso de Corriente`** — `Arranque con cables, batería y fallas menores en el lugar.`
- *(om P2)* **`Combustible de Emergencia`** — `Te acercamos nafta o diésel hasta donde estés.`
CTA: `Pedí asistencia en el lugar`

**Cell C — Traslados programados**
Rubrik: `Traslados programados`
Ingress: `No es urgencia, es logística. Coordinamos día, hora y destino.`
Rader:
- **`Remolque de Vehículos`** — `Traslados entre talleres, mudanzas de vehículo y retiro por multas.`
- *(om P4)* **`Grúa Planchada`** — `Plataforma para 0km y vehículos que no pueden ser remolcados por las ruedas.`
- *(om P5)* **`Remolque Interdepartamental`** — `Traslados de larga distancia dentro del país.`
- *(om P6)* **`Traslado de Maquinaria y Equipos`** — `Motos, cuatriciclos, maquinaria liviana y equipos.`
CTA: `Coordiná un traslado`

**Cell D — Ambulancias privadas** (blå `--accent-2` kant + blå tonad ikoncontainer)
Rubrik: `Ambulancias privadas`
Ingress: `Traslado de pacientes cuando el tiempo y el trato importan.`
Rader:
- **`Ambulancias Privadas`** — `Traslado rápido y seguro de pacientes entre domicilios, sanatorios y centros de estudios.`
CTA (blå): `Consultá por una ambulancia`

### 6.6 Sektion 5 — BANDA DE COBERTURA · mönster (b), full-bleed

Full-bleed motivpanel `BAND-ROUTE` (§8.2), 55vh desktop / 45vh mobil, mörk gradient ovanpå, vit text vänsterställd inom containern.

- Eyebrow: `COBERTURA`
- Mening (stor, `--h2`, max 20 ord):
  `Cubrimos Asunción, todo el Gran Asunción y la ruta hasta Ciudad del Este.`
- Underrad (`--lead`):
  `Si no estás seguro de que llegamos hasta donde estás, preguntá. Es un mensaje.`
- CTA-par (dubbel-primär): `Escribinos por WhatsApp` + `Llamar ahora`

**Gränsöverlapp:** ett vitt kort nere till vänster som korsar **upp** i sektion 4:
- Rubrik: `¿Estás en la ruta?`
- Text: `Mandanos el kilómetro o compartí la ubicación de Google Maps. Con eso ubicamos el punto exacto.`

*Ingen siffra i denna sektion. Inga "X ciudades", ingen radie i km, ingen svarstid.*

### 6.7 Sektion 6 — CÓMO TRABAJAMOS · mönster (e), stepper

- Eyebrow: `CÓMO TRABAJAMOS`
- **H2:** `De tu mensaje a la grúa en camino`
- Ingress: `Sin formularios largos ni idas y vueltas. Cuatro pasos y listo.`

Fyra steg, stora siffror i `--accent`, horisontellt ≥768px, vertikalt under:

| # | Rubrik | Text |
|---|---|---|
| 01 | `Escribinos o llamanos` | `Contanos qué pasó y mandanos la ubicación por WhatsApp. Si preferís hablar, llamá — es el mismo número.` |
| 02 | `Te pasamos el precio cerrado` | `Con la ubicación, el destino y el tipo de vehículo te decimos cuánto sale, en guaraníes, antes de que salga la unidad.` |
| 03 | `Sale la unidad disponible más cercana` | `Te confirmamos qué unidad va y te avisamos cuando está en camino.` |
| 04 | `Entregamos donde nos digas` | `Taller, domicilio, concesionaria o depósito. Vos decidís el destino.` |

*Steg 03 säger "disponible más cercana" — inte en tid. Ändra aldrig till minuter.*

### 6.8 Sektion 7 — ZONAS DE COBERTURA · mönster (c), 2/3 + 1/3

**Vänster (2/3):**
- Eyebrow: `ZONAS`
- **H2:** `Dónde llegamos`
- Brödtext:
  `Trabajamos en Asunción y en todo el Gran Asunción, y hacemos traslados sobre la ruta Asunción–Ciudad del Este. Si tu zona no está en la lista, escribinos igual: muchas veces llegamos, y si no, te lo decimos en el momento en vez de hacerte esperar.`
- Ortlista som text (chips, 48px träffyta, alla klickbara → WhatsApp med orten i prefill-texten):
  `Asunción` · `San Lorenzo` · `Luque` · `Lambaré` · `Fernando de la Mora` · `Capiatá` · `Mariano Roque Alonso` · `Ruta Asunción–Ciudad del Este`
- Underrad (`--small`, `--muted`):
  `Dentro de Asunción atendemos también Villa Morra, Recoleta, Sajonia y Barrio Jara, entre otros barrios.`

**Höger (1/3):** motivpanel `ZONE-MAP` (§8.3) i ett kort som **korsar ner i sektion 8**. Kortfot:
`¿No aparece tu zona? Preguntá antes de llamar a otro.` + grön WhatsApp-knapp `Consultar mi zona`

### 6.9 Sektion 8 — COMPROMISO · mönster (g), sticky-media-split

*(Detta är reseñas-ersättningen. Inga citat, inga betyg, inga siffror.)*

**Vänsterkolumn, sticky ≥1024px:**
- Eyebrow: `NUESTRO COMPROMISO`
- **H2:** `Tres cosas que podés esperar siempre`
- Brödtext:
  `Todavía no publicamos reseñas en esta página. Preferimos no poner opiniones que no podamos respaldar. Lo que sí podemos decirte es cómo trabajamos.`

Tre principer (staplade kort, röd tonad ikoncontainer):
1. **`Precio cerrado antes de salir`** — `El monto se acuerda por WhatsApp o por teléfono antes de que la unidad se mueva. No se recalcula al llegar ni al descargar.`
2. **`Te decimos que no cuando es no`** — `Si en ese momento no tenemos unidad libre o tu zona queda fuera, te lo decimos de una para que llames a otro. Perder un viaje es mejor que dejarte esperando.`
3. **`El vehículo se entrega donde vos digas`** — `No trabajamos con un taller fijo al que haya que llevar todo. El destino lo elegís vos.`

**Högerkolumn, scrollar:**
- Rubrik (`--h3`): `Qué hacer mientras llega la grúa`
- Numrerad checklista:
  1. `Poné las balizas y, si tenés, el triángulo a unos 30 metros atrás.`
  2. `Si estás en la ruta, salí del vehículo por el lado que da al guardarraíl, nunca por el lado de la calzada.`
  3. `Esperá detrás del guardarraíl o lejos del carril, no adentro del auto.`
  4. `Sacá del vehículo documentos, celular, cargador y todo objeto de valor.`
  5. `Si hubo choque con otro vehículo, sacá fotos de los dos autos, de las chapas y del lugar antes de mover nada.`
  6. `Si hay heridos, priorizá la asistencia médica. Nosotros esperamos.`
- Avslutande rad (`--small`, `--muted`):
  `Esta lista sirve para cualquier grúa, no solo para nosotros. Guardala.`

*Denna checklista är avsiktlig: den är sann, den är användbar, den ger sidan innehåll som förtjänar länkar, och den håller besökaren kvar utan att uppfinna social proof.*

### 6.10 Sektion 9 — BANDA CTA · mönster (h), accentband full-bleed

Bakgrund `--accent`, vit text, centrerat innehåll (enda centrerade blocket utöver §11 — det är ett band, inte en kolumnsektion).

- Rad 1 (`--h2`, 800): `Guardá el número antes de necesitarlo`
- Rad 2 (`--lead`): `El momento en que hace falta una grúa nunca es un buen momento para buscar una.`
- Numret som display (`--phone`, vit, klickbar `tel:`): **`{{TELEFONO_DISPLAY}}`**
- CTA-par: `Escribinos por WhatsApp` (grön) + `Llamar ahora` (vit knapp, röd text — röd på rött fungerar inte)

### 6.11 Sektion 10 — PRECIOS Y FORMAS DE PAGO · mönster (a), split

**Vänster:**
- Eyebrow: `PRECIOS`
- **H2:** `Cuánto sale y cómo se paga`
- Brödtext:
  `No publicamos una lista de precios porque el monto real depende de tres cosas: desde dónde te levantamos, hasta dónde llevamos el vehículo y qué tipo de unidad hace falta. Publicar un número suelto sería adivinar.`
  `Lo que sí hacemos es cerrarte el precio antes de salir. Mandanos la ubicación y el destino por WhatsApp y te pasamos el monto en guaraníes, con el IVA ya incluido. Ese es el monto que pagás.`
- CTA-par: `Pedí tu precio por WhatsApp` + `Llamar ahora`

**Höger:** kort `--surface` med `--border`:
- Rubrik: `Formas de pago`
- Lista (**gated på `{{PAGOS}}` — renderas bara med de metoder du bekräftar; om inget bekräftas tas hela kortet bort och vänsterkolumnen blir full bredd**):
  `Efectivo` · `Transferencia bancaria` · `Tigo Money` · `Billetera Personal` · `Zimple` · `Tarjeta de débito o crédito`
- Fotnot (renderas endast om `{{RUC}}` finns): `Emitimos factura legal. Pedila al momento de coordinar el servicio.`
- Fotnot (renderas alltid): `Los montos que te pasamos ya incluyen IVA.`

### 6.12 Sektion 11 — PREGUNTAS FRECUENTES · mönster (f), centrerad smal kolumn (max 760px)

- Eyebrow (centrerad): `PREGUNTAS FRECUENTES`
- **H2:** `Lo que más nos preguntan`

Accordion, `<details>/<summary>`, första öppen. **Kärnfrågorna renderas alltid. Gated-frågorna renderas endast om respektive platshållare är ifylld — och tas då också bort ur FAQPage-schemat.**

**F1 (kärna) — `¿Atienden urgencias fuera del horario de oficina?`**
`Escribinos en el momento en que lo necesitás y te respondemos con la disponibilidad real de ese momento. Si tenemos una unidad libre, te decimos cuál va y de dónde sale. Si en ese momento no tenemos, te lo decimos enseguida para que no pierdas tiempo esperando una respuesta.`

**F2 (kärna) — `¿Cuánto cuesta un remolque en Asunción?`**
`Depende de tres cosas: desde dónde te levantamos, hasta dónde llevamos el vehículo y qué tipo de unidad hace falta. Por eso no publicamos una lista. Mandanos la ubicación y el destino por WhatsApp y te pasamos el monto cerrado en guaraníes, con IVA incluido, antes de que salga la grúa.`

**F3 (kärna) — `¿En qué zonas trabajan?`**
`En Asunción y en todo el Gran Asunción: San Lorenzo, Luque, Lambaré, Fernando de la Mora, Capiatá y Mariano Roque Alonso. También hacemos traslados sobre la ruta Asunción–Ciudad del Este. Si tu zona no está en la lista, consultanos igual.`

**F4 (kärna) — `¿Qué datos necesitan para mandar la grúa?`**
`Cuatro cosas: tu ubicación, qué le pasó al vehículo, marca y modelo, y a dónde lo llevamos. Lo más rápido es compartir la ubicación de Google Maps por WhatsApp — con eso ubicamos el punto exacto aunque estés en la ruta.`

**F5 (kärna) — `¿Puedo pedir el traslado a un taller que elija yo?`**
`Sí. No trabajamos con un taller fijo. Llevamos el vehículo al taller, domicilio, concesionaria o depósito que nos indiques.`

**F6 (kärna) — `¿Hacen traslado de pacientes en ambulancia?`**
`Sí, contamos con servicio de ambulancias privadas para traslado de pacientes entre domicilios, sanatorios y centros de estudios. Consultanos por WhatsApp con el origen, el destino y la condición del paciente para coordinarlo.`

**F7 (GATED på `{{RUC}}`) — `¿Emiten factura legal?`**
`Sí. Emitimos factura legal a nombre de la persona o de la empresa. Avisanos al momento de coordinar el servicio y decinos a nombre de quién va.`

**F8 (GATED på `{{SEGURO_TRASLADO}}`) — `¿El vehículo va asegurado durante el traslado?`**
`{{SEGURO_TRASLADO_TEXTO}}`
*(Skriv inte denna text åt honom. Om han inte levererar texten renderas inte frågan.)*

**F9 (GATED på `{{PAGOS}}`) — `¿Cómo puedo pagar?`**
`Podés pagar con {{PAGOS_LISTA}}. Los montos que te pasamos ya incluyen IVA.`

### 6.13 Sektion 12 — CONTACTO · mönster (a), split

**Vänster (60%) — kontaktblocket, den viktigare halvan:**
- Eyebrow: `CONTACTO`
- **H2:** `Escribinos ahora`
- Brödtext: `La forma más rápida es WhatsApp con la ubicación. Si preferís hablar, llamanos — es el mismo número.`
- Stor grön WhatsApp-knapp: `Escribinos por WhatsApp`
- Röd knapp: `Llamar ahora`
- Numret som display (`--phone`): **`{{TELEFONO_DISPLAY}}`**
- Trygghetsstack (små rader med bock-ikon, gated var för sig):
  `Precio cerrado antes de salir` (alltid) · `Emitimos factura legal` (om RUC) · `{{SEGURO_TRASLADO}}` (om ifyllt) · `Cobertura en Asunción y Gran Asunción` (alltid)

**Höger (40%) — formuläret (sekundärt, visuellt lugnare, `--surface`):**
- Rubrik: `¿No es urgente? Dejanos tus datos`
- Underrad: `Te contactamos nosotros. Para una emergencia, usá WhatsApp.`
- Fält:
  - `Nombre` (text, name=`name`, valfritt)
  - `Teléfono` (tel, name=`phone`, **obligatoriskt**)
  - `¿Qué necesitás?` (textarea, name=`message`, 3 rader, placeholder: `Ej.: remolque desde Luque hasta un taller en Asunción`)
- Knapp (röd): `Enviar consulta`
- Under knappen (`--small`, `--muted`): `Usamos tus datos solo para responderte esta consulta.`
- Bekräftelsemeddelande (visas i formulärets plats efter submit): `Recibimos tu consulta. Te contactamos al número que nos dejaste. Si es urgente, escribinos por WhatsApp.`
- Felmeddelande: `No pudimos enviar la consulta. Escribinos por WhatsApp y lo resolvemos ahí.`

### 6.14 Sektion 13 — FOOTER

Mörk bakgrund `--ink-band`, vit text, 3 kolumner ≥1024px / 1 kolumn under.

- Kolumn 1: `gruas.com.py` + tagline
  **`Grúas y asistencia vial en Asunción y Gran Asunción.`**
  Guaraní-detalj (enda gången på sajten, `--small`, dämpad): **`Rohechaukáta ndéve — te acompañamos.`**
- Kolumn 2 — NAP, identiskt formaterat överallt på sajten:
  `gruas.com.py`
  `{{DIRECCION}}` *(gated — döljs helt om tomt)*
  `{{TELEFONO_DISPLAY}}` (klickbar)
  `{{EMAIL}}` *(gated)*
  `{{RUC}}` *(gated, prefix `RUC: `)*
  `{{HORARIOS_TEXTO}}` *(gated — skriv ALDRIG "24/7" eller "24 horas" utan bekräftelse)*
- Kolumn 3 — länkar: `Servicios` · `Cómo trabajamos` · `Zonas` · `Precios` · `Preguntas frecuentes` · `Contacto` · `Política de privacidad`
  Sociala: `Facebook` · `Instagram` *(gated på `{{FACEBOOK_URL}}` / `{{INSTAGRAM_URL}}`)*
- Bottenrad: `© {{ANIO_ACTUAL}} gruas.com.py — Asunción, Paraguay.`

### 6.15 Consent-banner (Ley 6534/2020)

Visas nertill, ovanför sticky-baren, förstas besök, `localStorage`-nyckel `gruas_consent`.
Text: `Usamos cookies para entender cómo se usa el sitio. Podés aceptarlas o seguir sin ellas.`
Knappar: `Aceptar` (röd) · `Seguir sin aceptar` (outline). **Ingen förikryssad ruta. Analytics-skript laddas först efter `Aceptar`.**
Länk: `Política de privacidad`.

### 6.16 Sticky mobilbar (<768px) + FAB

- Sticky bar nertill, höjd 72px, vit med `--border` top och `box-shadow` uppåt.
  Vänster 60%: grön WhatsApp-knapp `Escribinos` · Höger 40%: röd knapp `Llamar`
- WhatsApp-FAB: `position:fixed; right:16px; bottom:16px`, 56px, `--wa`, `aria-label="Escribinos por WhatsApp"`. Under 768px: `bottom: 88px`. `body { padding-bottom: 88px }` under 768px.
- FAB döljs medan heron är i viewport (heron har redan en stor grön knapp) och tonas in därefter — 200ms opacity, ingen rörelse.

### 6.17 Ord som är förbjudna i denna kod

Får inte förekomma någonstans i `index.html`: `24/7` · `24 horas` · `las 24 horas` · `llegamos en` + tidsangivelse · `minutos` i löftessammanhang · `+de` / `más de` + siffra · `años de experiencia` utan `{{ANIOS_EXPERIENCIA}}` · `vehículos rescatados` · `clientes satisfechos` · `★` / `estrellas` / `5/5` · `matrícula` med nummer · `garantía` med tidsangivelse · alla former av `tú` (`escríbenos`, `llámanos`, `tu ubicación` är däremot korrekt voseo-kompatibelt, men `escribe`, `llama`, `agenda` som imperativ är förbjudet).

---

## 7. Filträd

```
/ (public_html/ på Hostinger)
├── index.html                 ← hela sajten, inline CSS, inline JS
├── lead-forward.php           ← kopieras oförändrad från §10, ändra INGENTING utom slug
├── gracias.html               ← no-JS fallback-tack efter formulärpost
├── politica-de-privacidad.html
├── 404.html
├── robots.txt
├── sitemap.xml
├── favicon.svg
├── favicon.ico                ← 32×32 fallback
├── site.webmanifest
└── assets/
    └── img/
        ├── og-gruas-asuncion.jpg      ← 1200×630, genereras enligt §8.5
        └── (inga fotografier — motivpanelerna är CSS/SVG, inte filer)
```

**Ingen `assets/css/`, ingen `assets/js/` i LÄGE 1.** All CSS och JS inline i `index.html`. De extra HTML-sidorna (`gracias`, `politica`, `404`) återanvänder samma `:root`-block men bär bara den CSS de behöver — de ska vara små.

---

## 8. Bildplan — inga foton finns, alla visuella element genereras

**Grundregel: inga AI-genererade "arbetsfoton", inga stockbilder av bogserbilar, inga genererade ansikten.** En genererad bild på en grúa som inte är hans grúa är en påhittad uppgift i bildform. Allt nedan är CSS/SVG-motiv i spårets palett — de ser avsiktliga ut, inte som platshållare.

### 8.1 `HERO-MAP` — heroslot höger (45%, bleeder till kanten)
Inline SVG, `viewBox="0 0 720 800"`, `aria-hidden="true"`.
- Bakgrund `--surface`, ovanpå ett gatunät: 14–18 tunna linjer (`--border`, 1px) i ett oregelbundet rutnät med två diagonaler som antyder Mcal. López och Eusebio Ayala. Inte en verklig karta — en abstraktion.
- Två koncentriska cirklar centrerade lite vänster om mitten: `--accent` @ 8% fyllning, 1.5px stroke @ 30% opacitet.
- En röd punkt (12px) i centrum, en pulsring runt den — **enda animationen i heron, 2.4s, `opacity/scale`, avstängd vid `prefers-reduced-motion`**.
- 7 små blå (`--accent-2`) punkter med etiketter i `--label`: `Asunción`, `San Lorenzo`, `Luque`, `Lambaré`, `Fernando de la Mora`, `Capiatá`, `M. R. Alonso`.
- En tjockare blå linje som lämnar bilden åt höger, etikett vid kanten: `→ Ciudad del Este`.
- `aspect-ratio: 9/10` desktop, `16/9` mobil (skala ner etiketterna, dölj de tre minsta).

### 8.2 `BAND-ROUTE` — sektion 5, full-bleed
Ren CSS, inget bildanrop.
- Bas: `linear-gradient(115deg, #0F1317 0%, #1A2029 55%, #0F1317 100%)`
- Ovanpå: `repeating-linear-gradient` som ritar en vägmarkering — 3px vita streck @ 10% opacitet, 64px mellanrum, 8° lutning.
- Ovanpå det: en mjuk röd radiell glöd nere till vänster, `radial-gradient(ellipse at 20% 90%, rgba(220,38,38,.28), transparent 60%)`.
- Textkontrast måste mätas: vit text på den ljusaste punkten ≥ 4.5:1.

### 8.3 `ZONE-MAP` — sektion 7 höger (1/3)
Inline SVG, förenklad version av 8.1: samma gatunät i mindre skala, de sju orterna som märkta punkter, ingen puls, ingen radie. Röd rutt-linje mot höger kant med etikett `Ciudad del Este`.

### 8.4 Ikoner — 12 st, inline SVG, 24×24, `stroke-width:1.75`, `currentColor`
Alltid i tonad container 48×48, `--r-sm`, bakgrund `--accent` @ 8% (blå @ 8% för ambulanscellen). Aldrig naken ikon.
Motiv: kollision · bogserbil · nyckel · däck · ambulans · startkablar · bensindunk · vinsch · plattformsflak · karta med nål · WhatsApp (officiell glyf) · telefonlur.

### 8.5 `og-gruas-asuncion.jpg` — 1200×630
Enda bitmap-filen. Mörk bakgrund `#0F1317`, texten `Grúas y asistencia vial en Asunción` i vitt Inter 800, `gruas.com.py` i rött nertill, samma gatunätsmotiv som 8.1 svagt i bakgrunden. Under 120 KB. Om den inte kan produceras i exekveringen: rendera samma layout som SVG och exportera — hoppa **inte** över og-bilden, den syns i varje WhatsApp-delning av länken, och WhatsApp är hela kanalen.

### 8.6 Alt-texter (spanska, beskrivande)
- HERO-MAP: `decorative` (`aria-hidden`, ingen alt — informationen finns som text i sektion 7)
- ZONE-MAP: `Mapa de la zona de cobertura de grúas en Asunción y Gran Asunción`
- og-bild: `Grúas y asistencia vial en Asunción — gruas.com.py`
- Om riktiga foton tillkommer senare, mönster: `Grúa remolcando un vehículo en [zona], Asunción`

---

## 9. Platshållarlista — allt som måste bekräftas

### 9.1 Blockerande (sajten kan inte gå live utan)

| Token | Vad | Format |
|---|---|---|
| `{{WHATSAPP_E164}}` | WhatsApp-numret för `wa.me`-länkar | `5959XXXXXXX` — **inga plus, inga mellanslag, inga bindestreck** |
| `{{TELEFONO_DISPLAY}}` | Samma nummer för människor | `(0XXX) XXX XXX` eller `+595 9XX XXX XXX` |
| `{{TELEFONO_TEL}}` | Samma nummer för `tel:` | `+5959XXXXXXX` |
| Visningsnamn | ⚠️ Antaget "Grúas Paraguay". Vill du visa ett annat handelsnamn, eller köra rent `gruas.com.py`? | text |

**Regel:** bygg med tokens kvar i koden. De ersätts i ett svep före deploy. Sonnet ska **inte** hitta på ett testnummer — ett testnummer som slinker med till produktion skickar leads till en främling.

### 9.2 Gated — utelämnas helt om tomma (aldrig `[COMPLETAR]` i DOM)

| Token | Konsekvens om tomt |
|---|---|
| `{{RUC}}` | Trust-cell 1 + 4, footer-rad, FAQ F7, faktura-fotnot i §10 försvinner |
| `{{ANIOS_EXPERIENCIA}}` | Trust-cell 2 försvinner |
| `{{SEGURO_TRASLADO}}` + `{{SEGURO_TRASLADO_TEXTO}}` | Trust-cell 3, FAQ F8, trygghetsrad i §12 försvinner |
| `{{PAGOS}}` / `{{PAGOS_LISTA}}` | Betalkortet i §10 + FAQ F9 försvinner, §10 blir full bredd |
| `{{HORARIOS_TEXTO}}` | Footer-raden försvinner. **Skriv aldrig "24/7" här utan bekräftelse.** |
| `{{DIRECCION}}` | Footer-rad + `address` i JSON-LD försvinner (JSON-LD faller tillbaka på `areaServed` utan `address`) |
| `{{EMAIL}}` | Footer-rad försvinner |
| `{{FACEBOOK_URL}}` / `{{INSTAGRAM_URL}}` | Sociala länkar + `sameAs` försvinner |
| `{{VENDERCRM_API_KEY}}` | Formuläret faller tillbaka på `mailto:` — se §10.4 |

### 9.3 Beslut som väntar på dig

1. **Godkänn tjänsterna P1–P6** (§4). Utan svar byggs de fem bekräftade.
2. **Bekräfta grupperingen** i §5, eller ändra kategorinamn.
3. **Handelsnamn** — se 9.1.
4. **Ambulanser**: används de för akuta utryckningar eller endast för planerade patienttransporter? Copyn i §6.5 cell D är skriven för **planerade traslados** eftersom det är vad din tjänstebeskrivning säger. Säg till om det även är akut.
5. **Har du planchada/plataforma?** Avgör P4 och påverkar F4-svaret.

---

## 10. Lead-koppling — venderCRM

### 10.1 Fasta värden

| Sak | Värde |
|---|---|
| Site-slug | **`gruas-com-py`** |
| `source` i payload | **`site:gruas-com-py`** |
| CRM-endpoint | `https://{CRM_DOMAIN}/api/v1/leads` |
| Sajtens egen backend | `/lead-forward.php` (i sajtroten) |
| API-nyckel | `VENDERCRM_API_KEY` som **env-variabel** på Hostinger. Aldrig i repot, aldrig i HTML, aldrig i JS. |

**Site-posten i venderCRM skapas av dig FÖRE exekveringen** (§0.5 punkt 8 + integrationsfilens "Ordning i bygget" steg 1). Nyckeln visas en gång.

### 10.2 Den regel som inte får brytas

**CRM-endpointen anropas ALDRIG från klient-JS.** Ingen `fetch` mot `{CRM_DOMAIN}` i `index.html`. Ingen API-nyckel i markup. Formuläret postar till `lead-forward.php`, och bara PHP-filen känner nyckeln. Om exekveringen "förenklar" bort PHP-hoppet är bygget underkänt.

### 10.3 `lead-forward.php` — kopieras oförändrad

Enda tillåtna redigeringen är `{SITE_SLUG}` → `gruas-com-py` och `{CRM_DOMAIN}` → din CRM-domän. Rör ingenting annat.

```php
<?php
$ch = curl_init('https://{CRM_DOMAIN}/api/v1/leads');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'X-Api-Key: ' . getenv('VENDERCRM_API_KEY'),
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'phone'           => $_POST['phone'],
        'name'            => $_POST['name'] ?? null,
        'email'           => $_POST['email'] ?? null,
        'message'         => $_POST['message'] ?? null,
        'source'          => 'site:gruas-com-py',
        'page_url'        => $_POST['page_url'] ?? null,
        'idempotency_key' => bin2hex(random_bytes(16)),
    ]),
]);
$response = curl_exec($ch);
```

Efter `curl_exec`: honeypot-kontroll före allt annat, sedan redirect till `gracias.html` vid no-JS-post, annars `200`/`4xx` tillbaka till fetch-anropet mot **den egna** PHP-filen (det är tillåtet — det är samma origin).

### 10.4 Formulärets HTML-kontrakt

```
<form action="/lead-forward.php" method="POST">
  name          → name="name"       (valfritt)
  phone         → name="phone"      (required, type="tel", inputmode="tel")
  message       → name="message"    (valfritt, textarea)
  page_url      → <input type="hidden" name="page_url">  ← fylls av JS med location.href
  website       → <input type="text" name="website" tabindex="-1" autocomplete="off"
                  aria-hidden="true">  ← HONEYPOT, dold via CSS (inte display:none — off-screen)
</form>
```

- **Fungerar utan JS** (vanlig POST → `gracias.html`). JS är en progressiv förbättring som gör submit via `fetch` och byter ut formuläret mot bekräftelsetexten i §6.13.
- **`page_url` sätts alltid.** Det är enda attributionen på en statisk sajt.
- Om `{{VENDERCRM_API_KEY}}` ännu inte finns vid deploy: byt `action` till `mailto:{{EMAIL}}` **och** lägg en HTML-kommentar `<!-- CONECTAR: VENDERCRM_API_KEY no configurada -->`. WhatsApp-flödet fungerar oavsett — det är därför det är primärt.

### 10.5 WhatsApp-attribution — prefill per sektion

Format: `https://wa.me/{{WHATSAPP_E164}}?text=<URL-encodad text>`
Alla börjar med `Hola, vi su página web y ` så du ser i inkorgen att leadet kom från sajten.

| Plats | Text (före encoding) |
|---|---|
| Header | `Hola, vi su página web y quiero consultar por un servicio de grúa` |
| Hero (primär) | `Hola, vi su página web y necesito una grúa ahora` |
| §4 cell A | `Hola, vi su página web y tengo una emergencia vial` |
| §4 cell B | `Hola, vi su página web y necesito asistencia en el lugar` |
| §4 cell C | `Hola, vi su página web y quiero coordinar un traslado` |
| §4 cell D | `Hola, vi su página web y quiero consultar por una ambulancia privada` |
| §5 band | `Hola, vi su página web y quiero saber si llegan hasta mi zona` |
| §7 chip per ort | `Hola, vi su página web y necesito una grúa en {ORT}` (en variant per ort — det här är din enda zon-attribution innan LÄGE 2) |
| §7 kortfot | `Hola, vi su página web y quiero consultar si cubren mi zona` |
| §9 band | `Hola, vi su página web y quiero consultar por una grúa` |
| §10 | `Hola, vi su página web y quiero pedir un precio para un remolque` |
| §12 | `Hola, vi su página web y quiero contactarlos` |
| FAB | `Hola, vi su página web y necesito ayuda` |
| Sticky mobilbar | `Hola, vi su página web y necesito una grúa ahora` |

**URL-encoda i koden** (`á` → `%C3%A1`, mellanslag → `%20`). Skriv `wa.me`-URL:erna färdigencodade i HTML — bygg dem inte i JS, länken ska fungera innan JS kört.

---

## 11. Keyword-mappning

**Primärt sökord (ett, för hela one-pagern): `grúas en Asunción`**
Sekundär huvudterm som H1 också bär: `asistencia vial Asunción`.

| Element | Text | Sökmönster (keywords-py.md) |
|---|---|---|
| `<title>` | `Grúas en Asunción — Remolque y Asistencia Vial \| gruas.com.py` | 1 |
| `<meta description>` | `Grúas, remolque y asistencia vial en Asunción y Gran Asunción. Siniestros, cerrajería de urgencia, cambio de neumáticos y ambulancias privadas. Escribinos por WhatsApp con tu ubicación y te pasamos el precio cerrado antes de salir.` (≤ 160 tecken efter trimning — korta i så fall sista meningen, inte den första) | — |
| **H1** | `Grúas y asistencia vial en Asunción` | 1 (exakt match bevarad) |
| H2 §4 | `Todo lo que resolvemos en la calle` | subtema: tjänsteutbud |
| H3 §4 | `Emergencias viales` / `Asistencia en el lugar` / `Traslados programados` / `Ambulancias privadas` | subteman = framtida `/servicios/`-URL:er |
| H2 §6 | `De tu mensaje a la grúa en camino` | subtema: process |
| H2 §7 | `Dónde llegamos` + ortlista i brödtext | 3 (`grúa San Lorenzo`, `grúa Luque` …) |
| H2 §8 | `Tres cosas que podés esperar siempre` | trust |
| H2 §10 | `Cuánto sale y cómo se paga` | 5 (`cuánto cuesta un remolque`) |
| FAQ F1 | `¿Atienden urgencias fuera del horario de oficina?` | 4 |
| FAQ F2 | `¿Cuánto cuesta un remolque en Asunción?` | 5 |
| FAQ F3 | `¿En qué zonas trabajan?` | 3 |
| FAQ F7 | `¿Emiten factura legal?` | 5 |

**Sökordstermer som ska förekomma naturligt i brödtexten** (inte tvingas in, inte upprepas): grúa, remolque, remolcar, auxilio, asistencia vial, siniestro, cerrajería de urgencia, cambio de neumáticos, ambulancia privada, Asunción, Gran Asunción, San Lorenzo, Luque, Lambaré, Fernando de la Mora, Capiatá, Mariano Roque Alonso, Ciudad del Este. Alla finns redan i copyn i §6 — lägg inte till fler.

**Cerca de mí (mönster 2)** täcks av GBP, inte av sidtext. Skriv inte "grúas cerca de mí" på sidan — det läser som spam.

### 11.1 JSON-LD — två block, båda i `<head>`

**Block 1 — LocalBusiness.** Typvalet: schema.org saknar en bogseringstyp. Använd multi-typ `["AutomotiveBusiness","EmergencyService"]` — båda är giltiga `LocalBusiness`-subtyper och tillsammans beskriver de verksamheten exakt.

```
@type: ["AutomotiveBusiness", "EmergencyService"]
name, url: https://gruas.com.py/
telephone: +595...            ← {{TELEFONO_TEL}}
image / logo: og-bilden
address:  {{DIRECCION}} + addressLocality "Asunción" + addressCountry "PY"
          ⚠️ addressRegion utelämnas för Asunción — Asunción är eget distrikt,
             inte del av ett departamento. Sätt INTE "Central".
          Hela address-objektet utelämnas om {{DIRECCION}} saknas.
geo: {{LAT}}, {{LNG}}          ← utelämnas om okänt, gissa aldrig koordinater
areaServed: [Asunción, San Lorenzo, Luque, Lambaré, Fernando de la Mora,
             Capiatá, Mariano Roque Alonso, Ciudad del Este] som City-objekt
openingHoursSpecification: ⚠️ UTELÄMNAS HELT tills {{HORARIOS_TEXTO}} finns.
                           Ett påhittat 00:00–23:59 är ett 24/7-påstående i strukturerad
                           data och kan visas i Google. Skriv det inte.
priceRange: ⚠️ utelämnas (inga priser bekräftade)
sameAs: [{{FACEBOOK_URL}}, {{INSTAGRAM_URL}}]  ← utelämnas om tomma
hasOfferCatalog: OfferCatalog med de 4 kategorierna som itemListElement,
                 varje kategori med sina bekräftade tjänster som Service
```

**Block 2 — FAQPage.** Spegla exakt de FAQ-frågor som faktiskt renderas. En gated fråga som utelämnas i DOM men ligger kvar i schemat är en strukturerad-data-avvikelse och kan ge manuell åtgärd. Generera båda från samma datakälla i koden.

**Inget `AggregateRating`, inget `Review`.** Det finns inga recensioner. Ett rating-objekt utan reseñas är både påhittat och ett policybrott mot Googles riktlinjer.

---

## 12. Teknik och deploy

- **En fil**: `index.html`, inline CSS, inline vanilla JS. Ingen build, ingen npm, inget ramverk.
- **Sidvikt ≤ 500 KB** totalt (realistiskt mål här: ≤ 180 KB, eftersom inga foton finns). Lighthouse mobil ≥ 90 i alla fyra kategorier.
- `<html lang="es-PY">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`, canonical `https://gruas.com.py/`, og + twitter-taggar, favicon, `theme-color: #DC2626`.
- **Semantisk HTML**, exakt en `<h1>`, `<main>`, `<section aria-labelledby>`, `<nav>`, `<footer>`. Synlig fokusring (`outline: 2px solid var(--accent-2); outline-offset: 2px`) på allt interaktivt.
- Träffytor ≥ 48×48px överallt. FAB ≥ 56px.
- `loading="lazy"` på allt under fold, **aldrig** på hero-motivet. `aspect-ratio` på hero-visualen mot CLS.
- Inline kritisk CSS är hela CSS:en här — den ryms.

**Brytpunkter, exakt dessa tre:** `640px` · `1024px` · `1280px`. Basstil skriven för 360px.
- Splits (a, c, g) → en kolumn under 1024px. Visual **över** texten i heron, **under** texten i övriga.
- Bento (d) → 2 kol under 1024px → 1 kol under 640px. Stepper (e) → vertikal under 768px.
- Inga fasta pixelbredder på innehåll. All typografi i `clamp()`.
- Full-bleed: `width:100vw; margin-left:calc(50% - 50vw)` + `overflow-x:hidden` på `body`.
- **Testa 360 / 390 / 768 / 1024 / 1440px. Noll horisontell scroll på alla fem.**
  Snabbkontroll i konsolen: `document.documentElement.scrollWidth === document.documentElement.clientWidth`

**`robots.txt`**
```
User-agent: *
Allow: /
Sitemap: https://gruas.com.py/sitemap.xml
```

**`sitemap.xml`** — i LÄGE 1 endast `https://gruas.com.py/` + `politica-de-privacidad.html`.

**Indexering:** bygg med `<meta name="robots" content="noindex,nofollow">` **och en HTML-kommentar direkt ovanför:**
`<!-- QUITAR ESTA LÍNEA AL LANZAR: el sitio debe indexarse -->`
Detta är inte en demo — taggen bort så snart §9.1 är ifylld och sajten är live på gruas.com.py.

**Deploy (Hostinger, statiskt + PHP):** filerna i `public_html/`. Ingen Node-slot, ingen databas. PHP finns på Hostingers delade hosting, så `lead-forward.php` fungerar. `VENDERCRM_API_KEY` sätts i hPanel. Domänen `.com.py` går via NIC.py.

---

## 13. QA — kryssas av innan sajten går live

**Faktarenhet**
- [ ] Noll uppfunna reseñas, betyg, år, antal räddade fordon, garantier, matrículas, priser
- [ ] Ingen förekomst av `24/7`, `24 horas`, `llegamos en X minutos` — verifierat med `grep -inE "24/7|24 horas|llegamos en|minutos"` över alla filer
- [ ] `openingHoursSpecification` saknas i JSON-LD (eller innehåller bekräftade tider)
- [ ] Inget `AggregateRating` / `Review` i JSON-LD
- [ ] Inga synliga `[COMPLETAR]`, inga synliga `{{TOKEN}}` i renderad DOM
- [ ] Varje gated element antingen ifyllt eller **borttaget ur DOM** — inte tomt, inte dolt med CSS

**Språk**
- [ ] Voseo i samtliga CTA: `Escribinos`, `Llamanos`, `Contanos`, `Pedí`, `Consultá`, `Coordiná`, `Guardá`, `Mandá`
- [ ] Noll `tú`-imperativ (`escríbenos`, `llámanos`, `agenda`, `manda`, `pide`)
- [ ] Noll engelska i UI-text
- [ ] Guaraní på exakt ett ställe (footer-taglinen)
- [ ] `<html lang="es-PY">`

**Konvertering**
- [ ] Varje `wa.me`-länk testad i mobil-WhatsApp; nummerformat `5959…`, inga `+`, mellanslag eller bindestreck i URL:en
- [ ] Prefill-texten är korrekt och unik per sektion enligt §10.5
- [ ] `#25D366` förekommer ENDAST på WhatsApp-element (`grep -c "25D366"` = antal WhatsApp-element, inget mer)
- [ ] Telefonnumret är klickbart `tel:` OCH synligt som text på minst fyra ställen (header, hero, §9-band, footer)
- [ ] WhatsApp och Llamar har identisk visuell vikt överallt (§6.3)
- [ ] Sticky mobilbar + FAB krockar inte; `body` har `padding-bottom: 88px` under 768px

**Layout**
- [ ] Inga två intilliggande sektioner med samma mönster
- [ ] Hero är split, inte centrerat textblock; 85–95vh desktop
- [ ] Mönster (f) används exakt en gång
- [ ] ≥1 full-bleed band (har 3), ≥2 containerbrott (har 4), ≥2 gränsöverlapp (har 3)
- [ ] Ingen rad med 3–4 lika stora kort; inga synliga platshållarramar
- [ ] Noll horisontell scroll vid 360 / 390 / 768 / 1024 / 1440px

**Teknik**
- [ ] JSON-LD validerar i Rich Results Test, båda blocken
- [ ] FAQPage-schemat matchar exakt de frågor som renderas
- [ ] Exakt en `<h1>`; spanska alt-texter; dekorativa SVG:er `aria-hidden`
- [ ] Lighthouse mobil ≥ 90; sidvikt ≤ 500 KB; träffytor ≥ 48px
- [ ] Consent-banner finns, ingen förikryssad ruta, analytics laddas först efter `Aceptar`
- [ ] `prefers-reduced-motion` stänger av all rörelse inklusive heropulsen

**Lead-koppling**
- [ ] Ingen `fetch` mot CRM-domänen i klient-JS; ingen API-nyckel i markup — verifierat med `grep -i "api" index.html`
- [ ] `lead-forward.php` oförändrad utom slug + CRM-domän
- [ ] `source` = `site:gruas-com-py`
- [ ] `page_url` skickas med varje submit
- [ ] Honeypot-fältet finns och är off-screen (inte `display:none`)
- [ ] Formuläret fungerar med JS avstängt (POST → `gracias.html`)
- [ ] Testlead syns i venderCRM med rätt pipeline

**Lansering**
- [ ] `noindex` borttagen
- [ ] `robots.txt` + `sitemap.xml` live och nåbara
- [ ] `404.html` konfigurerad i hPanel
- [ ] `politica-de-privacidad.html` länkad från footer och consent-bannern

---

## 14. Efter LÄGE 1 — så här fortsätter bygget (LÄGE 2, inte nu)

Ingen kod nu. Detta står här så nästa session inte behöver fatta arkitekturbeslut om, och så att LÄGE 1:s H2:er redan är rätt.

```
/                                          ← one-pagern
/servicios/emergencias-viales/             ← "grúas para accidentes Asunción"
/servicios/remolque-de-vehiculos/          ← "remolque de vehículos Asunción"  ← störst volym
/servicios/cerrajeria-de-urgencia/         ← "abrir auto con llaves adentro Asunción"
/servicios/cambio-de-neumaticos/           ← "cambio de neumáticos a domicilio"
/servicios/ambulancias-privadas/           ← "ambulancia privada Asunción"
/zonas/san-lorenzo/  /zonas/luque/  /zonas/lambare/  /zonas/fernando-de-la-mora/
/contacto/
```

Regler som redan är låsta: max 6 zonsidor · designen ändras aldrig i LÄGE 2 · `Service`-schema på servicios-sidor · `BreadcrumbList` överallt · unik `?text=`-prefill per sida · delad `assets/css/site.css` från och med sida två · över ~10 sidor → Next.js statisk export enligt `nextjs-deploy-hostinger`.

**Off-site (§8 i skillen), gäller från dag ett eftersom detta är din egen sajt:** Perfil de Negocio de Google med primärkategori `Servicio de remolque` · WhatsApp-länk för recension efter varje avslutat jobb · Facebook + Instagram med identisk NAP · WhatsApp Business-profil med katalog och välkomstmeddelande. Djupare arbete → `gbp-optimizer`.

---

## 15. Beslutslogg — varför det ser ut så här

Kort, så att exekveringen inte "förbättrar" bort ett medvetet val.

1. **Inga priser någonstans.** Inga belopp är bekräftade, och ett intervall som inte stämmer skapar bråk vid vägkanten. §10 gör frånvaron till ett säljargument istället för en lucka.
2. **Inga reseñas, ingen ersättningswidget.** Sektion 8 säger rakt ut att det inte finns recensioner än, och ersätter dem med tre kontrollerbara löften. Det bygger mer förtroende än en tom stjärnrad.
3. **Checklistan "qué hacer mientras llega la grúa"** är sidans enda innehåll som inte handlar om att sälja. Den är sann, användbar och länkvärd, och den fyller utrymmet där reseñas normalt bär sektionen.
4. **Dubbel-primär CTA istället för PD:s llamada-first.** Situationen avgör kanalen; att pressa in någon i fel kanal kostar leadet.
5. **Ambulanser i egen cell med blå accent.** Annan köpare, annan känsla. Röd urgencia-estetik på patienttransport läser fel.
6. **Multi-typ JSON-LD.** Schema.org saknar bogseringstyp; `AutomotiveBusiness` ensamt missar akutkaraktären, `EmergencyService` ensamt missar fordonen.
7. **`addressRegion` utelämnas för Asunción.** Asunción är eget distrikt, inte del av Central. Ett felaktigt `addressRegion` motsäger GBP-posten.
8. **`openingHoursSpecification` utelämnas helt.** Att lägga 00:00–23:59 där är ett 24/7-påstående i strukturerad data — samma påhitt, bara på ett ställe där ingen granskar det.
9. **Motivpaneler i CSS/SVG, inga genererade fotografier.** En genererad bogserbil är en påhittad uppgift i bildform på en sajt som ska ta emot riktiga samtal.
10. **`noindex` byggs in men markeras för borttagning.** Detta är ingen demo — men en sajt med `{{WHATSAPP_E164}}` i DOM ska inte indexeras heller.
