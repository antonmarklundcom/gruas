# BUILD-SPEC v2 — gruas.com.py

**Läge:** 3 (regional vertikal, EMD-domän) + MODE 3.5 CORE 15.
**Skills:** `paraguay-local-site` §10 · `web-design-system` · `higgsfield-web-imagery`
**Ersätter:** `BUILD-SPEC.md` (PD-Urgencia, LÄGE 1). Den filen raderas i PR 3.

> **Exekveringsprompt:**
> *"Implementera BUILD-SPEC-v2.md exakt. Avvik inte. Fråga vid oklarhet istället för att gissa. Uppfinn inga fakta om verksamheten — allt som inte står i specen finns inte."*

---

## Varför en v2

Sajten som ligger uppe är **innehållsmässigt bra och designmässigt generisk**.
Copyn är ärlig, voseo genomgående, noll fabrikation — den behålls och byggs ut.
Det som byts ut är designspår, bildlager och sidarkitektur.

Vad v1 föll på, mätt mot `web-design-system/references/qa-preflight.md`:

| Fel i v1 | Regel |
|---|---|
| 0 `<img>` på hela sajten | bildslots måste ha assets eller listas som pending |
| Dekorativ 720×800-SVG som hero + 480×420 fejkkarta med flytande stadsprickar | *"Never generate decorative SVG diagrams… fake maps with floating city dots"* |
| Inter 400/600/800, inget display-snitt | *"System/Inter stack with no display face"* |
| Rött `#DC2626` + blått `#1D4ED8` + WhatsApp-grönt | *"Exactly one accent colour"* |
| Ljus PD-Urgencia-palett | grúas = **INDUSTRIAL**, dark-dominant |
| Ingen grain, platta ytor, solid 1px-kanter, en radie | Step 4: hairlines 10%, tre radier, tvålagerskuggor, grain på varje mörk sektion |
| Ingen oversized statement, inget gränsöverlapp | ≥1 full-bleed, ≥1 overlap, ≥1 oversized statement per sida |
| 0 förekomster av `data-ev` | Step 6.5, obligatoriskt på varje CTA |
| 1 sida, 2 URL:er i sitemap | MODE 3.5 CORE 15 |
| Ingen kalkylator | P10 är bibliotekets högsta konverteringsmönster och grúas bär den |

---

## 0. Intake — bekräftat vs antaget

Allt under **BEKRÄFTAT** är hämtat ur den publicerade sajten och är verkliga
uppgifter. Allt under **ANTAGET** är mitt beslut och kan ändras innan bygget.

```
BEKRÄFTAT (finns publicerat idag — får inte ändras utan besked)
  NEGOCIO:        gruas.com.py   (UI-namn: "Grúas Paraguay")
  OFICIO:         grúas / remolque / asistencia vial / ambulancias privadas
  WHATSAPP/TEL:   +595 995 628 862   → wa.me/595995628862
  RUC:            9327811-0
  FACTURA:        emitimos factura legal
  PAGOS:          efectivo · transferencia · tarjeta débito/crédito · Ueno · Mango
  IVA:            los montos incluyen IVA
  PRECIOS:        INGA publicerade. Sajten säger uttryckligen
                  "No publicamos una lista de precios" → den positionen behålls
  ZONAS:          Asunción · San Lorenzo · Luque · Lambaré · Fernando de la Mora ·
                  Capiatá · Mariano Roque Alonso · ruta Asunción–Ciudad del Este
  BARRIOS:        Villa Morra · Recoleta · Sajonia · Barrio Jara
  GUARANÍ:        "Rohechaukáta ndéve" (footer, en enda varm detalj)
  RESEÑAS:        INGA
  FOTOS:          INGA riktiga
  INDEXERING:     live, index,follow, canonical https://gruas.com.py utan www

ANTAGET ⚠️ (mitt beslut — säg till om något ska vara annorlunda)
  DISEÑO:      ⚠️ INDUSTRIAL-spåret rakt av
  ARKITEKTUR:  ⚠️ CORE 15 enligt §2
  PRECIOS:     ⚠️ fortsatt inga belopp → P10-cotizador istället för /precios
  ZONSIDOR:    ⚠️ San Lorenzo, Luque, Lambaré som de tre egna zonsidorna
  GUÍAS:       ⚠️ de två ämnen som anges i §2
  ÅR/GARANTI:  ⚠️ inget påstås — ingen "años de experiencia", ingen "24/7",
               ingen "seguro de traslado". Raderna finns inte förrän de bekräftas.
```

**Blockerande innan lansering:** inget. Sajten kan byggas och deployas komplett
på bekräftade fakta. Se §8 för det som skulle göra den starkare.

---

## 1. Designspår — INDUSTRIAL (låst)

Tokens är **redan resolvade** i `assets/css/site.css`. Den filen är sanningen.
Skriv inga egna värden, härled ingenting, tolka ingenting.

```
--font-display : 'Bricolage Grotesque'   (450, tracking -.03em, lh .95–1.05)
--font-text    : 'Geist'                 (400/500, body 17px/1.65, measure 65ch)
--base         : #0E0E0F
--ink          : #F5F3F0
--accent       : #E8562A     ← ENDA accenten. Ingen andra accentfärg finns.
--surface      : #17171A
--wa           : #25D366     ← ENDAST inuti WhatsApp-glyfen. Aldrig sektionsfyllning,
                               aldrig kant, aldrig hover, aldrig ikonfärg någon annanstans.
```

**Fontladdning**, exakt detta i `<head>` på varje sida, före `site.css`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style"
      href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..500&family=Geist:wght@400;500&display=swap">
<link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..500&family=Geist:wght@400;500&display=swap">
```

Ett display-snitt, ett text-snitt. Inga fler vikter än de listade.

**Material (Step 4), obligatoriskt:**
- `.grain` på **varje** mörk sektion. Den är billigaste upgraden som finns och
  den döljer mjukhet i 1024px-bilder.
- Kanter alltid `var(--hairline)` (ink 10%), aldrig solid.
- Tre radier i spel, tilldelade per klass: `--r-sm` inputs/chips, `--r-md` kort/bilder,
  `--r-lg` paneler.
- Text över bild sitter alltid på `.scrim`, aldrig råt.

**Rörelse (Step 5):** `assets/js/site.js` innehåller `motion.js` verbatim.
Max 15 % av elementen får `data-reveal`. Ingen entré-animation på hero-text
ovanför fold. Ingen parallax under 1024px. `prefers-reduced-motion` är redan
hanterat i filen — bygg inget vid sidan av den.

---

## 2. Sidarkitektur — CORE 15 + keyword-mappning

**En sida äger exakt ETT primärt sökord.** Två sidor på samma sökord konkurrerar
och ingen vinner.

| # | URL | Primärt sökord | H1 |
|---|---|---|---|
| 1 | `/` | grúas en Asunción | Grúas y asistencia vial en Asunción |
| 2 | `/servicios/remolque-de-vehiculos/` | remolque de vehículos Asunción | Remolque de vehículos en Asunción y Gran Asunción |
| 3 | `/servicios/auxilio-mecanico/` | auxilio mecánico Asunción | Auxilio mecánico en el lugar, en Asunción |
| 4 | `/servicios/cerrajeria-de-urgencia/` | cerrajería para autos Asunción | Cerrajería de urgencia para vehículos en Asunción |
| 5 | `/servicios/siniestros/` | grúa para accidentes Asunción | Grúa para siniestros y accidentes viales en Asunción |
| 6 | `/servicios/ambulancias-privadas/` | ambulancia privada Asunción | Ambulancias privadas para traslado de pacientes en Asunción |
| 7 | `/zonas/san-lorenzo/` | grúa en San Lorenzo | Grúas y remolque en San Lorenzo |
| 8 | `/zonas/luque/` | grúa en Luque | Grúas y remolque en Luque |
| 9 | `/zonas/lambare/` | grúa en Lambaré | Grúas y remolque en Lambaré |
| 10 | `/zonas/interior/` | grúa en ruta Paraguay | Grúas en ruta y en el interior del país |
| 11 | `/cotizador/` | cuánto sale una grúa en Asunción | Cuánto sale una grúa: armá tu pedido en 30 segundos |
| 12 | `/contacto/` | contacto grúas Asunción | Contacto |
| 13 | `/preguntas-frecuentes/` | preguntas frecuentes grúas | Preguntas frecuentes sobre grúas y remolque |
| 14 | `/guias/auto-parado-en-la-ruta/` | qué hacer si se te para el auto en la ruta | Se te paró el auto en la ruta: qué hacer antes de que llegue la grúa |
| 15 | `/guias/despues-de-un-choque/` | qué hacer después de un choque | Qué hacer después de un choque, paso a paso |

**Bakåtkompatibilitet — sajten är live och indexerad.** Dessa två URL:er måste
fortsätta svara 200:
- `/` (byggs om, samma URL)
- `/politica-de-privacidad.html` (rörs inte)

De gamla ankarlänkarna `#servicios`, `#zonas`, `#precios`, `#faq`, `#contacto`
finns kvar som sektions-`id` på startsidan, så inga externa länkar bryts.

**Intern länkning, obligatorisk:**
- `/` länkar till alla 5 servicios + cotizador + de 3 zonsidorna
- varje servicios-sida länkar till cotizador + minst 2 andra servicios + relevant guía
- varje zonsida länkar till `/`, till `/zonas/interior/` och till de 2 andra zonsidorna
- båda guías länkar till den servicios-sida de handlar om + cotizador
- footern länkar till alla 15 på varje sida

---

## 3. Startsidan `/` — sektion → mönster → copy

Kontroll mot `qa-preflight.md`: inga två i rad delar mönster ·
full-bleed = §5 · överlapp = §5-panelen · oversized statement = §9 ·
kortvarianter: `--hair`, `--ink`, `--raised`, `--accent` = 4 st, ingen över 4 ggr.

| # | Sektion | Mönster | Anteckning |
|---|---|---|---|
| 1 | Hero | **P1** 7/5 `.p1--hero` | `hero-bleed` i högerkolumnen, ingen entré-animation |
| 2 | Franja de confianza | **P8** full-bleed ribbon | `.grain`, 4 fält |
| 3 | Servicios | **P3** staggered-weight | 5 kort, remolque = `.p3__wide` + `.card--ink` |
| 4 | Cotizador | **P10** data panel | `.card--raised` på `.inverse`-fält |
| 5 | Banda de emergencia | **P6** bleed-image overlap | full-bleed + panelen korsar gränsen |
| 6 | Cómo trabajamos | **P5** numbered rail | 4 steg, oversized siffror |
| 7 | Zonas | **P4** editorial 2-col | text, INGA gråa chip-rader som ersätter zonsidor |
| 8 | Compromiso | **P7** sticky-side | 3 `.card--accent` |
| 9 | Statement CTA | **P9** oversized | sidans enda — aldrig två |
| 10 | Precios y formas de pago | **P1** mirror 5/7 | ingen prislista, förklaringen behålls |
| 11 | Preguntas frecuentes | **P4** | 6 frågor + länk till sida 13 |
| 12 | Contacto | **P1** mirror | WhatsApp-block + formulär |
| 13 | Footer | — | + FAB + sticky mobilbar |

### §1 Hero — P1

```
eyebrow:  ASUNCIÓN · GRAN ASUNCIÓN
H1:       Grúas y asistencia vial en Asunción
lead:     Quedaste en la calle, chocaste o el auto no arranca. Escribinos por
          WhatsApp con tu ubicación, te pasamos el precio cerrado antes de salir
          y mandamos la unidad más cercana disponible.
chips:    Siniestros · Remolque · Cerrajería de urgencia · Ambulancias
CTA 1:    Escribinos por WhatsApp        .btn--wa   data-ev="whatsapp_click" data-ev-loc="hero"
CTA 2:    Llamar ahora                   .btn--primary  data-ev="call_click" data-ev-loc="hero"
under:    Llamá o guardá este número
número:   +595 995 628 862               (synligt som text, klickbart)
nota:     Si no podés hablar, mandá un mensaje. Con la ubicación alcanza.
```

WhatsApp-text: `Hola, vengo de gruas.com.py — necesito una grúa. Te mando la ubicación.`

### §2 Franja de confianza — P8

```
RUC              → 9327811-0
FACTURA          → Emitimos factura legal
FORMAS DE PAGO   → Efectivo, transferencia, tarjeta, Ueno y Mango
COBERTURA        → Asunción y todo el Gran Asunción
```

### §3 Servicios — P3

```
eyebrow: SERVICIOS
H2:      Todo lo que resolvemos en la calle
lead:    Un solo número para siniestros, remolques, asistencia en el lugar y
         traslado de pacientes. Contanos qué pasó y te decimos de una si podemos
         y cuánto sale.
```

Kort 1 — `.p3__wide .card--ink`, bild `card-motif` remolque:
```
Remolque de vehículos
Averías en la vía, motor que no arranca, vehículo que no puede circular.
Lo levantamos y lo trasladamos al taller, domicilio o concesionaria que nos digas.
→ Ver remolque de vehículos        /servicios/remolque-de-vehiculos/
```

Kort 2–5, `.card--hair`, var och en med sin `card-motif`:
```
Auxilio mecánico en el lugar
Paso de corriente, batería, cambio o inflado de neumáticos y combustible de
emergencia. A veces no hace falta remolcar.
→ Ver auxilio mecánico             /servicios/auxilio-mecanico/

Cerrajería de urgencia
Apertura de vehículos sin daños. Llaves adentro, cerradura trabada o llave perdida.
→ Ver cerrajería de urgencia       /servicios/cerrajeria-de-urgencia/

Siniestros y rescates
Remolque y asistencia en accidentes viales. Retiramos el vehículo del lugar,
también si quedó empantanado, en zanja o fuera de la calzada.
→ Ver siniestros                   /servicios/siniestros/

Ambulancias privadas
Traslado de pacientes entre domicilios, sanatorios y centros de estudios.
→ Ver ambulancias privadas         /servicios/ambulancias-privadas/
```

### §4 Cotizador — P10

```
eyebrow: PRESUPUESTO SIN COSTO
H2:      Armá tu pedido en 30 segundos
lead:    No publicamos lista de precios porque el monto depende de dónde estás,
         a dónde va el vehículo y qué unidad hace falta. Respondé estas tres cosas
         y te armamos el mensaje listo para mandar — te pasamos el monto cerrado
         antes de que salga la grúa.
```

Fält, i denna ordning (markup-kontrakt mot `site.js`, ändra inga `name`-värden):

```
fieldset legend "¿Qué pasó?"          name="situacion"  radio, .opt-grid
  El auto no arranca
  Se quedó en la calle o en la ruta
  Choque o siniestro
  Llaves adentro / cerradura trabada
  Neumático
  Está empantanado o fuera de la calzada
  Traslado programado (no es urgencia)

fieldset legend "¿Qué vehículo es?"   name="vehiculo"   radio, .opt-grid.opt-grid--3
  Auto o sedán
  Camioneta o SUV
  Utilitario o furgón
  Moto
  Camión liviano

fieldset legend "¿Dónde estás?"       name="zona"       radio, .opt-grid
  Asunción
  San Lorenzo
  Luque
  Lambaré
  Fernando de la Mora
  Capiatá
  Mariano Roque Alonso
  En la ruta / interior

field "¿A dónde lo llevamos?"         name="destino"    text, opcional
  placeholder: Taller, domicilio, concesionaria… si ya sabés

submit: Armar mi pedido               data-ev="calc_open" data-ev-loc="cotizador"
```

Utfallspanel `[data-cotizador-out]`, dold tills submit:
```
H3:    Listo — esto es lo que le llega
<ul data-cotizador-resumen>  (fylls av JS)
nota:  Falta solo tu ubicación. Mandala por WhatsApp: es un toque y con eso
       ubicamos el punto exacto, aunque estés en la ruta.
CTA:   Mandar por WhatsApp   .btn--wa  data-ev="whatsapp_click" data-ev-loc="cotizador"
```

**Kalkylatorn räknar aldrig ut ett belopp och visar aldrig en siffra.** Den
bygger WhatsApp-meddelandet. Det är hela poängen: presupuesto cerrado i ett enda
utbyte i stället för fyra.

### §5 Banda de emergencia — P6 (full-bleed + överlapp)

Bild `section-break` ruta-nocturna, `.scrim`, 46vh.
Panel `.card--raised` korsar gränsen ner i §6:

```
eyebrow: AHORA MISMO
H2:      ¿Estás parado en la ruta?
text:    Poné las balizas, salí del vehículo por el lado del guardarraíl y
         esperá lejos del carril. Mandanos el kilómetro o compartí la ubicación
         de Google Maps — con eso ubicamos el punto exacto.
CTA:     Escribinos ahora        data-ev="whatsapp_click" data-ev-loc="banda-ruta"
link:    Qué hacer mientras llega la grúa →  /guias/auto-parado-en-la-ruta/
```

### §6 Cómo trabajamos — P5

```
eyebrow: CÓMO TRABAJAMOS
H2:      De tu mensaje a la grúa en camino
lead:    Sin formularios largos ni idas y vueltas. Cuatro pasos y listo.

01  Escribinos o llamanos
    Contanos qué pasó y mandanos la ubicación por WhatsApp. Si preferís hablar,
    llamá — es el mismo número.
02  Te pasamos el precio cerrado
    Con la ubicación, el destino y el tipo de vehículo te decimos cuánto sale,
    en guaraníes y con IVA incluido, antes de que salga la unidad.
03  Sale la unidad disponible más cercana
    Te confirmamos qué unidad va y te avisamos cuando está en camino.
04  Entregamos donde nos digas
    Taller, domicilio, concesionaria o depósito. Vos decidís el destino.
```

### §7 Zonas — P4

```
eyebrow: ZONAS
H2:      Dónde llegamos
body:    Trabajamos en Asunción y en todo el Gran Asunción, y hacemos traslados
         sobre la ruta Asunción–Ciudad del Este. Si tu zona no está en la lista,
         escribinos igual: muchas veces llegamos, y si no, te lo decimos en el
         momento en vez de hacerte esperar.
         Dentro de Asunción atendemos también Villa Morra, Recoleta, Sajonia y
         Barrio Jara, entre otros barrios.
```

Länklista (**riktiga länkar, inte gråa chips**):
```
Grúas en San Lorenzo →   /zonas/san-lorenzo/     data-ev="zone_click" data-ev-loc="zonas"
Grúas en Luque →         /zonas/luque/           data-ev="zone_click" data-ev-loc="zonas"
Grúas en Lambaré →       /zonas/lambare/         data-ev="zone_click" data-ev-loc="zonas"
En ruta y en el interior → /zonas/interior/       data-ev="zone_click" data-ev-loc="zonas"
```
Fernando de la Mora, Capiatá och Mariano Roque Alonso nämns **endast i löptext** —
de får ingen egen sida förrän de har eget innehåll (§10.4).

### §8 Compromiso — P7, 3 × `.card--accent`

```
eyebrow: NUESTRO COMPROMISO
H2:      Tres cosas que podés esperar siempre
lead:    Todavía no publicamos reseñas en esta página. Preferimos no poner
         opiniones que no podamos respaldar. Lo que sí podemos decirte es
         cómo trabajamos.

Precio cerrado antes de salir
El monto se acuerda por WhatsApp o por teléfono antes de que la unidad se mueva.
No se recalcula al llegar ni al descargar.

Te decimos que no cuando es no
Si en ese momento no tenemos unidad libre o tu zona queda fuera, te lo decimos
de una para que llames a otro. Perder un viaje es mejor que dejarte esperando.

El vehículo se entrega donde vos digas
No trabajamos con un taller fijo al que haya que llevar todo. El destino lo
elegís vos.
```

### §9 Statement CTA — P9 (sidans enda oversized)

```
.statement:  Guardá el número antes
             de necesitarlo
sub:         El momento en que hace falta una grúa nunca es un buen momento
             para buscar una.
número:      +595 995 628 862
CTA 1:       Escribinos por WhatsApp   data-ev="whatsapp_click" data-ev-loc="statement"
CTA 2:       Llamar ahora              data-ev="call_click" data-ev-loc="statement"
```

### §10 Precios y formas de pago — P1 mirror

```
eyebrow: PRECIOS
H2:      Cuánto sale y cómo se paga
body:    No publicamos una lista de precios porque el monto real depende de tres
         cosas: desde dónde te levantamos, hasta dónde llevamos el vehículo y qué
         tipo de unidad hace falta. Publicar un número suelto sería adivinar.

         Lo que sí hacemos es cerrarte el precio antes de salir. Mandanos la
         ubicación y el destino por WhatsApp y te pasamos el monto en guaraníes,
         con el IVA ya incluido. Ese es el monto que pagás.
CTA:     Armar mi pedido →  /cotizador/   data-ev="calc_open" data-ev-loc="precios"

Formas de pago  (`.card--hair`)
  Efectivo · Transferencia bancaria · Tarjeta de débito o crédito · Ueno · Mango
  Emitimos factura legal. Pedila al momento de coordinar el servicio.
  Los montos que te pasamos ya incluyen IVA.
```

### §11 FAQ — P4

Sex frågor på startsidan, ordagrant från den befintliga sajten (de är bra):
`¿Atienden urgencias fuera del horario de oficina?` ·
`¿Cuánto cuesta un remolque en Asunción?` ·
`¿En qué zonas trabajan?` ·
`¿Qué datos necesitan para mandar la grúa?` ·
`¿Puedo pedir el traslado a un taller que elija yo?` ·
`¿Emiten factura legal?`
Svaren kopieras oförändrade från nuvarande `index.html`.
Avslutas: `Ver todas las preguntas → /preguntas-frecuentes/`
`data-ev="faq_open"` på varje `<summary>`.

### §12 Contacto — P1 mirror

Vänster: WhatsApp-block + nummer + trygghetsstack (Precio cerrado antes de salir ·
Emitimos factura legal · Efectivo, transferencia, tarjeta, Ueno y Mango ·
Cobertura en Asunción y Gran Asunción).
Höger: formulär, oförändrat kontrakt mot `lead-forward.php`:
`name`, `phone` (obligatoriskt), `message`, `page_url` (hidden), `website` (honeypot `.hp`).
`data-ev="form_submit" data-ev-loc="contacto"`.

```
H2:   Escribinos ahora
lead: La forma más rápida es WhatsApp con la ubicación. Si preferís hablar,
      llamanos — es el mismo número.
form: ¿No es urgente? Dejanos tus datos
      Te contactamos nosotros. Para una emergencia, usá WhatsApp.
nota: Usamos tus datos solo para responderte esta consulta.
```

### §13 Footer

Oförändrat innehåll från v1 + länkar till alla 15 sidor, grupperade
Servicios / Zonas / Sitio. `Rohechaukáta ndéve — te acompañamos.` behålls.
RUC 9327811-0. Ingen gatuadress (§10.2). `Asunción, Paraguay`.

---

## 4. Undersidorna — mönster och copy

**Gemensam mall för alla 14:** header · breadcrumbs · hero **P1** · innehåll
enligt nedan · FAQ **P4** (3–4 frågor unika för sidan) · CTA-band **P9 eller P8** ·
footer · FAB · mobilbar. Ingen undersida får samma mönsterföljd som startsidan
rakt av — variera enligt tabellen per sida.

**WhatsApp-text per sida** (§10.5 — enda attributionen som finns):
`Hola, vengo de gruas.com.py ({slug}) — necesito `

### 4.1 `/servicios/remolque-de-vehiculos/`

Mönster: P1 hero → P8 franja → P5 process → P6 bleed+overlap → P4 zonas → P9 CTA → P4 FAQ

```
H1:   Remolque de vehículos en Asunción y Gran Asunción
lead: Si el vehículo no puede circular por sus propios medios, lo levantamos y
      lo llevamos a donde nos digas. Mandanos la ubicación por WhatsApp y te
      pasamos el monto cerrado antes de que salga la unidad.

H2: Cuándo hace falta un remolque
  — El motor no arranca y ya probaste con cables
  — El vehículo se apagó en marcha y no vuelve a encender
  — Falla de caja, embrague o dirección
  — Neumático destruido, sin auxilio utilizable
  — Quedó inmovilizado después de un choque
  — Retiro por multa o por depósito

H2: Qué tipo de unidad va
body: El tipo de unidad depende del vehículo y de dónde está. Un auto en una
      calle de Asunción no se levanta igual que una camioneta en el arcén de la
      ruta. Cuando nos contás qué vehículo es y dónde estás, te confirmamos qué
      unidad sale — y ese dato es parte del precio cerrado que te pasamos antes
      de movernos.

H2: A dónde llevamos el vehículo
body: Al taller, domicilio, concesionaria o depósito que nos indiques. No
      trabajamos con un taller fijo al que haya que llevar todo: el destino lo
      elegís vos, y si todavía no lo decidiste, coordinamos sobre la marcha.

FAQ:
  ¿Cuánto cuesta un remolque en Asunción?
    Depende de tres cosas: desde dónde te levantamos, hasta dónde llevamos el
    vehículo y qué tipo de unidad hace falta. Por eso no publicamos una lista.
    Mandanos la ubicación y el destino por WhatsApp y te pasamos el monto cerrado
    en guaraníes, con IVA incluido, antes de que salga la grúa.
  ¿Puedo ir en la grúa con el vehículo?
    Coordinalo al momento de pedir el servicio y te confirmamos según la unidad
    que salga y el lugar donde estés.
  ¿Remolcan motos?
    Sí. Decinos que es una moto al escribirnos, porque cambia la unidad que
    mandamos.
  ¿Hacen traslados que no son urgencia?
    Sí. Traslados entre talleres, mudanzas de vehículo y retiros programados se
    coordinan con día y hora. Escribinos y lo agendamos.
```

### 4.2 `/servicios/auxilio-mecanico/`

Mönster: P1 hero → P3 (4 kort) → P8 → P5 → P4 FAQ → P9 CTA

```
H1:   Auxilio mecánico en el lugar, en Asunción
lead: No todo termina en remolque. Muchas veces vamos, lo resolvemos ahí y
      seguís tu camino. Contanos qué pasó y te decimos de una si se arregla en
      el lugar o si hace falta levantar el vehículo.

P3, 4 kort:
  Paso de corriente y batería
  Arranque con cables cuando la batería quedó baja — luces encendidas, mucho
  tiempo parado o frío de la mañana. Si la batería ya no toma carga, te lo
  decimos ahí mismo en vez de hacerte volver a llamar mañana.

  Cambio e inflado de neumáticos
  Reemplazo con tu auxilio o inflado en el lugar. Si el auxilio también está
  bajo o no está, avisanos al escribirnos.

  Combustible de emergencia
  Te acercamos nafta o diésel hasta donde estés, lo suficiente para llegar a la
  estación más cercana.

  Fallas menores en el lugar
  Revisamos lo que se pueda resolver ahí. Si no se resuelve, el remolque sale
  desde el mismo pedido, sin volver a empezar.

H2: Cuándo conviene pedir auxilio y cuándo conviene el remolque
body: Si el vehículo puede volver a circular con una intervención corta —
      corriente, un neumático, combustible — el auxilio en el lugar es más
      rápido y más barato que remolcar. Si la falla es de motor, caja o
      dirección, o si el vehículo quedó en un punto peligroso de la ruta,
      levantar el vehículo es lo correcto. Contanos qué pasó y te decimos cuál
      de las dos corresponde, sin venderte la más cara.

FAQ:
  ¿Cuánto tardan en llegar?
    Depende de dónde estés y de qué unidad esté libre en ese momento. Cuando nos
    escribís te decimos la disponibilidad real de ese momento, no un promedio.
  ¿Y si el auxilio no alcanza y hay que remolcar igual?
    Se coordina en el mismo pedido. No hace falta volver a explicar todo desde cero.
  ¿Llevan batería nueva?
    Consultanos al momento por WhatsApp según el vehículo. Lo que sí hacemos
    siempre es el arranque con cables.
```

### 4.3 `/servicios/cerrajeria-de-urgencia/`

Mönster: P1 hero → P4 → P8 → P5 → P6 → P4 FAQ

```
H1:   Cerrajería de urgencia para vehículos en Asunción
lead: Llaves adentro, cerradura trabada o llave perdida. Abrimos el vehículo sin
      dañar la puerta ni la cerradura. Escribinos con la ubicación, la marca y el
      modelo y te pasamos el monto cerrado antes de salir.

H2: Qué resolvemos
  — Llaves quedaron adentro con el vehículo cerrado
  — Cerradura trabada que no responde a la llave
  — Llave perdida y no hay copia a mano
  — Puerta que no abre desde afuera

H2: Apertura sin daños
body: La apertura se hace con herramienta de cerrajería vehicular, no forzando
      la puerta ni rompiendo el vidrio. Decinos marca, modelo y año al escribirnos:
      con eso sabemos con qué vamos y no perdemos un viaje.

H2: Antes de escribirnos, revisá esto
  — Que no haya una segunda llave en casa o con otra persona más cerca que nosotros
  — Si el vehículo está en un estacionamiento cerrado, avisanos el horario hasta
    el que podés quedarte
  — Si hay un chico o una mascota adentro del vehículo, decilo en el primer
    mensaje: eso cambia la prioridad del pedido

FAQ:
  ¿Abren cualquier marca?
    Decinos marca, modelo y año al escribirnos y te confirmamos antes de salir.
    Preferimos decirte que no en el momento antes que hacerte esperar al pedo.
  ¿Rompen el vidrio?
    No. La apertura se hace sin dañar la puerta ni la cerradura.
  ¿Hacen copia de llave en el lugar?
    Consultanos por WhatsApp con la marca y el modelo. La apertura y la copia son
    dos cosas distintas y no siempre se resuelven en la misma visita.
  ¿Me piden algún documento?
    Te vamos a pedir que acredites que el vehículo es tuyo. Es lo normal en este
    servicio y te protege a vos también.
```

### 4.4 `/servicios/siniestros/`

Mönster: P1 hero → P6 bleed+overlap → P5 → P8 → P4 → P4 FAQ

```
H1:   Grúa para siniestros y accidentes viales en Asunción
lead: Después de un choque hay que sacar el vehículo del lugar, y hay que
      hacerlo bien. Retiramos el vehículo, coordinamos el destino y te decimos
      el monto cerrado antes de salir. Si hay heridos, la asistencia médica va
      primero: nosotros esperamos.

H2: Primero lo primero
body: Si hay personas heridas, la prioridad es la asistencia médica, no el
      vehículo. Llamá a emergencias antes que a nosotros. Cuando la parte médica
      esté encaminada, escribinos y coordinamos el retiro.

H2: Antes de mover el vehículo
  — Sacá fotos de los dos vehículos, de las chapas y del lugar, antes de mover nada
  — Anotá los datos del otro conductor y de su seguro
  — Si tenés seguro, avisá a tu compañía antes de definir el destino: a veces te
    indican a qué taller tiene que ir
  — Sacá del vehículo documentos, celular, cargador y todo objeto de valor

H2: Rescate y extracción
body: También sacamos vehículos empantanados, en zanja o fuera de la calzada.
      Decinos cómo quedó y mandanos una foto si podés: en estos casos la foto
      define qué unidad sale y evita un viaje perdido.

H2: A dónde va el vehículo
body: Al taller que te indique tu seguro, al que elijas vos, a tu domicilio o al
      depósito. Nosotros no imponemos el destino.

FAQ:
  ¿Trabajan con seguros?
    Coordinamos el traslado al taller que te indique tu compañía. La gestión con
    el seguro la hacés vos; nosotros llevamos el vehículo a donde corresponda y
    emitimos factura legal.
  ¿Retiran el vehículo si yo no puedo quedarme?
    Coordinalo por WhatsApp antes de que salga la unidad, porque hay que definir
    quién entrega y quién recibe el vehículo.
  ¿Sacan vehículos empantanados o fuera de la calzada?
    Sí. Mandanos una foto de cómo quedó: con eso definimos qué unidad va.
  ¿Emiten factura para presentar al seguro?
    Sí, emitimos factura legal a nombre de la persona o de la empresa. Decinos a
    nombre de quién va al momento de coordinar.
```

### 4.5 `/servicios/ambulancias-privadas/`

Mönster: P1 hero → P4 → P8 → P7 → P4 FAQ → P9 CTA

**Ton:** lugnare än resten av sajten. Ingen urgencia-retorik, ingen orange
skrikig CTA-stapling. Detta är den enda sidan där tonen medvetet sänks.

```
H1:   Ambulancias privadas para traslado de pacientes en Asunción
lead: Traslado de pacientes entre domicilios, sanatorios y centros de estudios.
      Se coordina con anticipación cuando se puede, y en el momento cuando no.
      Contanos el origen, el destino y la condición del paciente y lo organizamos.

H2: Qué traslados hacemos
  — De domicilio a sanatorio y de sanatorio a domicilio
  — Entre centros asistenciales
  — Hacia y desde centros de estudios y diagnóstico
  — Altas médicas y regresos a casa

H2: Qué necesitamos saber para coordinarlo
  — Desde dónde y hasta dónde
  — Día y horario, si es programado
  — Si el paciente se moviliza por sus propios medios, si necesita camilla o silla
  — Si va acompañado, y por cuántas personas
  — Si hay alguna indicación médica que debamos tener en cuenta

H2: Cómo se coordina
body: Escribinos por WhatsApp con esos datos. Te confirmamos disponibilidad y el
      monto cerrado antes de que la unidad salga, igual que en el resto de los
      servicios. Emitimos factura legal a nombre de la persona o de la empresa.

FAQ:
  ¿Es un servicio de emergencia médica?
    Es un servicio de traslado. Ante una emergencia médica, llamá primero al
    sistema de emergencias.
  ¿Se puede programar con anticipación?
    Sí, y es lo recomendable cuando la fecha ya está definida — un alta, un
    estudio, una internación programada.
  ¿Puede viajar un acompañante?
    Decinos cuántas personas acompañan al momento de coordinar y te confirmamos.
  ¿Emiten factura?
    Sí, factura legal a nombre de la persona o de la empresa.
```

⚠️ **Notering till §8:** om verksamheten har habilitación del Ministerio de Salud
för ambulanstransport bör den synas — det är vertikalens starkaste differential.
Den **hittas inte på**. Raden finns inte förrän numret bekräftas.

### 4.6–4.8 Zonsidor: `/zonas/san-lorenzo/`, `/zonas/luque/`, `/zonas/lambare/`

Mönster: P1 hero → P8 → P4 (barrios/puntos) → P3 (3 servicios) → P5 → P4 FAQ → P9

**Regeln som gör zonsidor värda att ha:** varje sida måste ha barrios/referenspunkter
som faktiskt tillhör orten, typiska jobb för just den orten och en
logistik-/restidsnotis. Är innehållet utbytbart mellan två orter är sidan tunn
och ska inte finnas.

**San Lorenzo** — universitetsstad, Ruta Mcal. Estigarribia, tung trafik, mycket
pendlartrafik in mot Asunción.
```
H1:   Grúas y remolque en San Lorenzo
lead: Trabajamos en San Lorenzo todos los días, y es una de las zonas donde más
      remolques hacemos: la Ruta Mcal. Estigarribia concentra mucho tránsito y
      un vehículo parado ahí no puede quedarse esperando.
puntos: Ruta Mcal. Estigarribia · zona de la UNA y del Campus · centro de San
        Lorenzo · Villa Elisa como paso hacia el sur · accesos hacia Capiatá
trabajos: averías en plena ruta en hora pico · vehículos de estudiantes que no
        arrancan en el campus · siniestros en los cruces de la Estigarribia ·
        traslados a talleres del centro
logística: Desde Asunción, San Lorenzo está a pocos minutos por la Estigarribia
        salvo en hora pico, que es justamente cuando más nos llaman. Si estás
        sobre la ruta, mandanos la ubicación de Google Maps: el kilómetro solo
        no siempre alcanza para ubicarte del lado correcto de la calzada.
```

**Luque** — flygplatsen, Ruta Luque–San Bernardino, motorcykeltät.
```
H1:   Grúas y remolque en Luque
lead: Cubrimos Luque completo, incluida la zona del aeropuerto y la salida hacia
      San Bernardino. Escribinos con la ubicación y te pasamos el monto cerrado
      antes de que salga la unidad.
puntos: zona del Aeropuerto Silvio Pettirossi · Ruta Luque–San Bernardino ·
        centro de Luque · Área 1 y accesos al Botánico · límite con Mariano
        Roque Alonso
trabajos: autos que no arrancan en playas de estacionamiento del aeropuerto ·
        vehículos parados en la salida hacia San Ber los fines de semana ·
        remolque de motos · traslados a talleres de Luque y Asunción
logística: Si el vehículo quedó en el aeropuerto y vos tenés que viajar,
        decilo en el primer mensaje: hay que definir quién entrega el vehículo y
        a dónde va antes de que salga la unidad.
```

**Lambaré** — Asunción-nära, Av. Cacique Lambaré, tät stadsväv, smala gator.
```
H1:   Grúas y remolque en Lambaré
lead: Lambaré está pegado a Asunción, así que solemos llegar rápido. Escribinos
      con la ubicación y el destino y te pasamos el monto cerrado antes de salir.
puntos: Av. Cacique Lambaré · Av. Cerro Corá · zona del Cerro Lambaré ·
        accesos por la Costanera · límite con Asunción y con Villa Elisa
trabajos: vehículos parados en avenidas de mucho tránsito · aperturas de puerta
        en zonas residenciales · remolques cortos hacia talleres de Asunción ·
        traslados desde garajes y calles angostas
logística: En calles angostas o garajes con poco espacio la unidad que va no es
        la misma que en avenida. Mandanos una foto de cómo está estacionado el
        vehículo si tenés dudas: nos ahorra un viaje a los dos.
```

Varje zonsida får samma FAQ-block, med ortnamnet inskrivet:
```
¿Llegan hasta {ORT}?
  Sí, {ORT} está dentro de nuestra cobertura habitual. Escribinos con la
  ubicación y te confirmamos la disponibilidad de ese momento.
¿Cobran más por venir hasta {ORT}?
  El monto depende de la distancia y del tipo de unidad, y te lo pasamos cerrado
  antes de salir. No hay un recargo sorpresa al llegar.
¿Pueden llevar el vehículo desde {ORT} hasta un taller en Asunción?
  Sí. El destino lo elegís vos: taller, domicilio, concesionaria o depósito.
```

### 4.9 `/zonas/interior/`

Mönster: P1 hero → P4 → P6 → P8 → P4 FAQ

```
H1:   Grúas en ruta y en el interior del país
lead: Nuestra base de operaciones es Asunción y el Gran Asunción. Sobre la ruta
      Asunción–Ciudad del Este hacemos traslados de forma habitual. Fuera de
      eso, coordinamos según el caso: escribinos y te confirmamos si podemos
      llegar, en el momento, sin hacerte esperar una respuesta.

H2: Lo que sí hacemos de forma habitual
  — Traslados sobre la ruta Asunción–Ciudad del Este
  — Retiro de vehículos parados en ruta dentro de esa traza
  — Traslados programados desde el interior hacia talleres del Gran Asunción

H2: Fuera de esa traza
body: No vamos a decirte que sí de entrada para después no aparecer. Si estás
      fuera del Gran Asunción y fuera de la ruta a Ciudad del Este, escribinos
      igual con la ubicación exacta: te decimos en el momento si podemos llegar
      y cuánto sale, o te decimos que no para que llames a otro. Un no rápido
      vale más que un sí que no se cumple.

H2: Si estás parado en la ruta, ahora
  — Balizas encendidas y, si tenés, triángulo a unos 30 metros atrás
  — Salí del vehículo por el lado del guardarraíl, nunca por el lado de la calzada
  — Esperá detrás del guardarraíl o lejos del carril, no adentro del auto
  — Compartí la ubicación de Google Maps: el kilómetro solo no dice de qué lado
    de la calzada estás
link: Guía completa → /guias/auto-parado-en-la-ruta/

FAQ:
  ¿Van hasta Ciudad del Este?
    Hacemos traslados sobre la ruta Asunción–Ciudad del Este de forma habitual.
    Escribinos con el punto exacto y el destino y te confirmamos.
  ¿Y si estoy en otro departamento?
    Escribinos igual. Te decimos en el momento si podemos llegar o si te conviene
    buscar una grúa más cerca.
  ¿Cómo les paso mi ubicación si estoy en la ruta?
    Compartí la ubicación de Google Maps por WhatsApp. Es lo más exacto y nos
    dice de qué lado de la calzada estás.
```

### 4.10 `/cotizador/`

Mönster: P1 hero (kort) → **P10** (samma markup-kontrakt som §4 på startsidan) →
P5 → P8 → P4 FAQ

```
H1:   Cuánto sale una grúa: armá tu pedido en 30 segundos
lead: No publicamos lista de precios porque el monto depende de dónde estás, a
      dónde va el vehículo y qué unidad hace falta. Respondé estas tres cosas,
      te armamos el mensaje listo para mandar, y te pasamos el monto cerrado en
      guaraníes con IVA incluido antes de que salga la unidad.

H2: Por qué no hay una lista de precios
body: Una lista fija tendría que asumir una distancia y un tipo de vehículo que
      probablemente no son los tuyos. O te cobra de más, o te muestra un número
      que después no se sostiene al llegar. Preferimos cerrarte el monto real
      antes de movernos, y que ese sea el monto que pagás.

FAQ:
  ¿El presupuesto tiene costo?
    No. Te pasamos el monto y decidís.
  ¿El precio puede cambiar cuando llegan?
    El monto se acuerda antes de que la unidad se mueva y no se recalcula al
    llegar ni al descargar. Si al llegar la situación es distinta a la que nos
    contaste — otro vehículo, otro lugar, otra condición — te lo decimos antes
    de empezar, no después.
  ¿Incluye IVA?
    Sí. Los montos que te pasamos ya incluyen IVA, y emitimos factura legal.
```

### 4.11 `/contacto/`

Mönster: P1 hero → P8 → P1 mirror (WhatsApp + formulär) → P4 FAQ

```
H1:   Contacto
lead: La forma más rápida es WhatsApp con la ubicación. Si preferís hablar,
      llamanos — es el mismo número.
número: +595 995 628 862
NAP:  Grúas Paraguay — gruas.com.py · Asunción, Paraguay · RUC 9327811-0
```
Ingen gatuadress, ingen karta med nål (§10.2). Formuläret identiskt med §12.

### 4.12 `/preguntas-frecuentes/`

Mönster: P1 hero → P4 FAQ (alla 8, grupperade) → P8 → P9 CTA

Alla åtta befintliga frågor, ordagrant, grupperade i tre block:
*Servicio y cobertura* · *Precios y pago* · *Cómo pedirlo*.
FAQPage-schema med **alla** åtta.

### 4.13 `/guias/auto-parado-en-la-ruta/`

Mönster: P1 hero → P5 (steg) → P6 → P4 → P8 → CTA

```
H1:   Se te paró el auto en la ruta: qué hacer antes de que llegue la grúa
lead: Esta guía sirve para cualquier grúa, no solo para nosotros. Guardala ahora
      que la podés leer tranquilo, porque cuando hace falta no hay tiempo de
      buscarla.

P5, 4 pasos:
01  Poné las balizas antes de cualquier otra cosa
    Es lo primero, incluso antes de bajar. Si tenés triángulo, colocalo a unos
    30 metros atrás del vehículo, del lado por donde vienen los autos.
02  Salí por el lado del guardarraíl
    Nunca por el lado de la calzada. Es el error que más caro sale y el que más
    se repite de noche y con lluvia.
03  Esperá lejos del carril, no adentro del auto
    Quedarse adentro del vehículo sobre el arcén es peligroso. Esperá detrás del
    guardarraíl o lo más lejos que puedas del tránsito.
04  Ubicate antes de pedir la grúa
    Compartí la ubicación de Google Maps. El kilómetro solo no dice de qué lado
    de la calzada estás, y de noche eso hace la diferencia entre encontrarte a
    la primera o pasar de largo.

H2: Qué conviene tener a mano en el vehículo
  — Balizas en condiciones y triángulo
  — Chaleco reflectivo, sobre todo si manejás de noche
  — Linterna o el celular con carga
  — Cable de arranque
  — El número de una grúa guardado antes de necesitarlo

H2: Qué contarnos cuando escribas
  — Tu ubicación (compartida por Google Maps)
  — Qué le pasó al vehículo
  — Marca y modelo
  — A dónde lo llevamos, si ya lo sabés
body: Con esas cuatro cosas te pasamos el monto cerrado sin ida y vuelta.

link: Ver remolque de vehículos → /servicios/remolque-de-vehiculos/
```

### 4.14 `/guias/despues-de-un-choque/`

Mönster: P1 hero → P4 → P5 → P6 → P8 → CTA

⚠️ **Faktakänslig sida.** Copyn nedan innehåller medvetet **inga** hänvisningar
till lagparagrafer, specifika myndighetsförfaranden eller tidsfrister. Lägg inte
till sådana. Om något sådant ska in måste det verifieras mot källa först — det
här är en sida där ett självsäkert fel faktiskt skadar någon.

```
H1:   Qué hacer después de un choque, paso a paso
lead: En el momento cuesta pensar con orden. Esta lista es para leer antes, y
      para abrir en el celular si ya pasó. Sirve para cualquier caso, no solo
      para los que terminan en grúa.

H2: Si hay personas heridas, eso va primero
body: Antes que las fotos, antes que el seguro y antes que el vehículo. Llamá a
      emergencias médicas y no muevas a una persona herida salvo que quedarse
      donde está sea más peligroso. El vehículo puede esperar; siempre puede.

P5, 5 pasos:
01  Asegurá el lugar
    Balizas encendidas y triángulo atrás si el vehículo quedó sobre la calzada.
    Si hay riesgo de que otro vehículo los choque, salí de la zona de tránsito.
02  Sacá fotos antes de mover nada
    Los dos vehículos, las chapas, la posición en la que quedaron y el estado
    general del lugar. Sacá de más: nunca sobran y no se pueden recuperar después.
03  Intercambiá datos
    Nombre, documento, teléfono, y los datos del seguro del otro conductor.
    Anotá también la chapa aunque la tengas en la foto.
04  Avisá a tu seguro
    Si tenés póliza, avisales antes de definir a qué taller va el vehículo:
    en muchos casos te indican dónde tiene que ir.
05  Recién ahí, el vehículo
    Si no puede circular, hay que retirarlo. Sacá primero documentos, celular,
    cargador y todo objeto de valor del interior.

H2: Qué no conviene hacer
  — Mover los vehículos antes de sacar las fotos, si no hay riesgo inmediato
  — Acordar de palabra un arreglo sin dejar nada registrado
  — Dejar objetos de valor en un vehículo que va a quedar en un depósito
  — Definir el taller antes de hablar con tu seguro, si tenés póliza

link: Ver grúa para siniestros → /servicios/siniestros/
```

---

## 5. Bildplan — vertikalt set "gruas", INDUSTRIAL

**Genereras en gång per vertikal, återanvänds över alla framtida grúas-sajter**
(`higgsfield-web-imagery` regel 2). Kör Style Element först, sedan resten med
`<<<element_id>>>`.

**Konstriktning, gemensam för hela setet:** nattlig/skymningsscen i Asunción,
varmt gatuljus och orange varningsljus mot kall asfalt, INDUSTRIAL-palett
(`#0E0E0F` skuggor, `#E8562A` som enda varmaccent), 35 mm, dokumentär, ingen
studioglättning, ingen text i bild, inga läsbara skyltar eller registreringsnummer,
inga logotyper.

| Slot | Fil | Ratio | px | Modell | Alt |
|---|---|---|---|---|---|
| `hero-bleed` | `grua-remolque-asuncion-noche.avif` | 21:9 | 2048 | `nano_banana_2` | Grúa de plataforma cargando un vehículo en una calle de Asunción de noche |
| `section-break` | `grua-en-ruta-balizas-noche.avif` | 21:9 | 1024 | `soul_cinematic` | Vehículo detenido en el arcén de una ruta con balizas encendidas y una grúa acercándose |
| `section-break` | `gran-asuncion-grua-circulando.avif` | 21:9 | 1024 | `nano_banana_flash` | Grúa circulando por una avenida del Gran Asunción |
| `card-motif` | `remolque-plataforma-vehiculo.avif` | 4:3 | 1024 | `nano_banana_flash` | Vehículo siendo cargado sobre la plataforma de una grúa |
| `card-motif` | `auxilio-mecanico-paso-de-corriente.avif` | 4:3 | 1024 | `nano_banana_flash` | Operario conectando cables de arranque a la batería de un vehículo |
| `card-motif` | `cerrajeria-apertura-de-vehiculo.avif` | 4:3 | 1024 | `nano_banana_flash` | Herramienta de cerrajería vehicular abriendo la puerta de un auto |
| `card-motif` | `siniestro-vial-retiro-de-vehiculo.avif` | 4:3 | 1024 | `nano_banana_flash` | Conos de señalización junto a un vehículo siniestrado antes de ser retirado |
| `card-motif` | `ambulancia-privada-traslado.avif` | 4:3 | 1024 | `nano_banana_flash` | Ambulancia privada estacionada en la entrada de un sanatorio |
| `card-motif` | `operador-coordinando-servicio.avif` | 4:3 | 1024 | `nano_banana_flash` | Operador coordinando un servicio de grúa por teléfono desde la cabina |

**Regler som inte får brytas** (`higgsfield-web-imagery` regel 1):
- Ingen bildtext påstår identitet. Inga "Nuestro equipo", inga namn, inga titlar.
- Inga ansikten som testimonial-avatarer.
- Inget före/efter som påstås vara egna utförda jobb.
- Ingen bild på ett specifikt namngivet fordon, lokal eller certifikat.
- `proof-photo`-slots fylls **aldrig** av AI. Sajten har inga — det står i §8.

**Teknik:** AVIF med WebP-fallback via `<picture>`. Hero `fetchpriority="high"`,
aldrig `loading="lazy"`, explicit `width`/`height` överallt. Hero ≤ 120 KB.
Total sidvikt ≤ 500 KB.

**Kostnad:** kör `get_cost: true` per modell innan första batchen och rapportera
siffrorna innan något genereras. `use_unlim` finns inte på kontot.

---

## 6. Teknik

**Filträd efter bygget:**

```
/
├── index.html
├── 404.html                     (behålls, restylas till INDUSTRIAL)
├── gracias.html                 (behålls, restylas)
├── politica-de-privacidad.html  (behålls, restylas — URL:en får INTE ändras)
├── lead-forward.php             (oförändrad — den är korrekt)
├── .htaccess                    (utökas: AVIF/WebP i mod_expires)
├── robots.txt                   (+ Sitemap-rad)
├── sitemap.xml                  (alla 15 + politica)
├── favicon.ico · favicon.svg · site.webmanifest
├── assets/
│   ├── css/site.css             ✅ klar
│   ├── js/site.js               ✅ klar
│   └── img/                     ← PR 2
├── servicios/{5 mappar}/index.html
├── zonas/{4 mappar}/index.html
├── guias/{2 mappar}/index.html
├── cotizador/index.html
├── contacto/index.html
└── preguntas-frecuentes/index.html
```

Katalog-URL:er med `index.html` ger rena slut-snedstreck utan rewrite-regler på
Hostinger. Kritisk CSS inline per sida, `site.css` med `media="print"
onload="this.media='all'"` för resten — eller helt enkelt en blockerande
`<link>`, filen är liten. Välj det senare: enklare och skillnaden är försumbar.

**Per sida obligatoriskt:** en `<h1>` · self-referencing absolut canonical ·
`<html lang="es-PY">` · og-taggar med riktig bild · viewport · semantiska
landmärken · breadcrumbs + `BreadcrumbList`-schema · spanska alt-texter.

**Schema:**
- Alla sidor: `LocalBusiness` enligt `paraguay-local-site` §10.3 — **ingen
  `streetAddress`**, ingen `aggregateRating`, ingen `openingHours`.
  `telephone: "+595995628862"`, `areaServed` med de 7 orterna + `Country: Paraguay`.
- Servicios-sidor: `Service` med `provider` → `LocalBusiness`, `areaServed`.
- Sidor med FAQ: `FAQPage` med sidans egna frågor.
- Guías: `Article`.

**Analytics:** `data-ev` på **varje** CTA. Endast de kanoniska namnen:
`whatsapp_click`, `call_click`, `form_submit`, `calc_open`, `calc_complete`,
`faq_open`, `zone_click`. Shimmen ligger i `site.js`. I `<head>`, fast position:
```html
<!-- ANALYTICS: paste GTM or GA4 here. Events already fire via data-ev shim. -->
<!-- SEARCH-CONSOLE: <meta name="google-site-verification" content=""> -->
```

**Lead:** `lead-forward.php` oförändrad. `{CRM_DOMAIN}` är fortfarande en
platshållare i den filen — se §8.

**Responsivt kontrakt:** brytpunkter endast 640 / 1024 / 1280. Alla splits
kollapsar till en kolumn < 1024px. Testas på 360 / 390 / 768 / 1024 / 1440.
`document.documentElement.scrollWidth === document.documentElement.clientWidth`
måste vara sant på alla fem.

---

## 7. Arbetsfördelning och PR-ordning

| PR | Gren | Modell | Innehåll |
|---|---|---|---|
| 1 | `…-01-foundation` | **Opus** | denna spec + `site.css` + `site.js` |
| 2 | `…-02-imagery` | **Opus** | cost preflight, Style Element, 9 bilder, manifest |
| 3 | `…-03-home` | Sonnet | `index.html` ombyggd + 404/gracias/privacidad restylade + gamla `BUILD-SPEC.md` raderad |
| 4 | `…-04-core15` | Sonnet | de 14 undersidorna + sitemap, robots, schema, breadcrumbs, intern länkning |
| 5 | `…-05-qa` | Opus | `qa-preflight.md` körd på riktigt, Lighthouse, viktbudget, 5 brytpunkter |

Varje PR mergas till `main` innan nästa öppnas. PR 2 före PR 3 så att ingen
bildslot någonsin shippas tom.

---

## 8. Platshållare och öppna punkter

Inget av detta blockerar bygget. Allt av det gör sajten starkare.

| # | Punkt | Effekt om den fylls |
|---|---|---|
| 1 | `{CRM_DOMAIN}` i `lead-forward.php` + `VENDERCRM_API_KEY` i hPanel | leads går till CRM i stället för att bara loggas i `leads.jsonl` |
| 2 | Riktiga foton på egna enheter | `proof-photo`-slots kan fyllas; idag finns de inte alls |
| 3 | Google-omdömen | §8 Compromiso kan bytas mot riktiga citat med förnamn + barrio |
| 4 | Habilitación för ambulanstransport | vertikalens starkaste differential, i dag osynlig |
| 5 | Verkliga öppettider | ingen `openingHours` i schemat i dag; "24/7" skrivs aldrig utan bekräftelse |
| 6 | Años de experiencia | trust-raden finns inte i dag |
| 7 | Facebook / Instagram | `sameAs` i schemat + footerlänkar; störst kanaler i PY |
| 8 | GBP-listning | off-site-överlämningen i `paraguay-local-site` §8 |

**Ingen av dessa fylls med en gissning.** Rad som saknar värde renderas inte.

---

## 9. QA-gate — körs innan något visas

Kopierad ur `web-design-system/references/qa-preflight.md`. Bygget shippar inte
förrän varje rad är avbockad, och ett fel rapporteras — det tystas aldrig.

**Innehåll**
- [ ] Noll synlig platshållartext. Ingen `[COMPLETAR]`, ingen lorem, ingen TODO
- [ ] Noll tomma listrader, hängande streck eller halvfyllda tabeller
- [ ] Noll uppfunna reseñas, betyg, antal, år, certifieringar eller garantier
- [ ] Varje bildslot har en asset eller står listad som pending i §8

**Layout**
- [ ] Inga oavsiktliga överlapp vid 360 / 768 / 1280 / 1920
- [ ] Max 2 sektioner i rad delar mönster
- [ ] ≥1 full-bleed, ≥1 avsiktligt överlapp, ≥1 oversized statement per sida
- [ ] ≥3 kortvarianter, ingen mer än 4 ggr
- [ ] Ingen sektion >70 % tomrum utan bild eller textur

**Typ och färg**
- [ ] Exakt ett display-snitt + ett text-snitt, båda preloadade, `font-display: swap`
- [ ] Body ≥17px, line-height ≥1.6, measure ≤65ch
- [ ] Dämpad text klarar 4.5:1 mot sin faktiska bakgrund
- [ ] Exakt en accentfärg. `#25D366` endast inuti WhatsApp-glyfen

**Rörelse**
- [ ] `prefers-reduced-motion: reduce` stänger av allt — testat
- [ ] ≤15 % av elementen animerar
- [ ] Ingen entré-animation på hero-text ovanför fold
- [ ] Ingen parallax under 1024px

**Prestanda**
- [ ] Hero ≤120 KB, AVIF med WebP-fallback, `fetchpriority="high"`, ej lazy
- [ ] Alla bilder under fold `loading="lazy"` + explicit `width`/`height`
- [ ] Sidvikt ≤500 KB. Lighthouse mobil ≥90

**Teknik**
- [ ] En H1. Semantiska landmärken. Beskrivande spanska alt-texter
- [ ] Canonical, og-taggar med riktig bild, viewport, favicon
- [ ] `LocalBusiness` JSON-LD validerar; `FAQPage` där FAQ finns; `Service`;
      `BreadcrumbList`
- [ ] Formuläret postar till `lead-forward.php`. Ingen `mailto:`, ingen
      tredjepartsendpoint, ingen API-nyckel i klientkällkod
- [ ] `whatsapp_click`, `call_click`, `form_submit` avfyras med `page_path`
- [ ] Sajten är live och ska indexeras → **ingen** `noindex` någonstans
- [ ] `/` och `/politica-de-privacidad.html` svarar fortfarande 200

**Paraguay-specifikt** (`paraguay-local-site` §9)
- [ ] Voseo i alla CTA. Noll "tú"-former, noll engelska i UI
- [ ] WhatsApp-länk testad, `5959…` utan plus eller mellanslag, förifylld text
      unik per sida
- [ ] Telefonnumret klickbart OCH synligt som text
- [ ] IVA deklarerat. Inga belopp publicerade
- [ ] Consent-banner finns, inget förikryssat
