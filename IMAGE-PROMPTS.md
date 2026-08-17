# Bildprompts — vertikalt set "gruas", DAYLIGHT / HUMAN

Kört på **Nano Banana Pro / Nano Banana 2** via Higgsfield. Två omgångar finns
i historiken: 2026-08-06 (nio bilder) och 2026-08-17 (åtta bilder). Det som
ligger live är en blandning — se tabellen direkt nedan.

**Filnamnen är bindande.** HTML:en wire:as mot exakt dessa strängar. Byt bara
när motivet byts, och byt då alltid slugen (se cachenoten nedan).

## Nedladdning

Higgsfields CDN-host (`d8j0ntlcm91z4.cloudfront.net`) är blockerad av
sandbox-proxyn för Claude — 403 org policy, ej en bugg, ej möjlig att runda.
Ladda ner PNG:erna i din egen webbläsare och ladda upp dem till
`assets/img/raw/` i repot. Konverteringen är skriptad:

```bash
pip install pillow pillow-avif-plugin
python3 tools/build-images.py          # --check listar bara vad som saknas
```

Skriptet matchar källfilerna på **jobb-id** lika väl som på slug, så
webbläsarens filnamn (`hf_20260806_111528_3a9dbff3-...png`) kan behållas som
det är. Målstorlekarna läses ur HTML:ens `width`/`height`, och bilden
center-croppas till rätt aspect ratio före skalning.

## Slugarna som ligger live nu (efter 2026-08-17-omgången)

Sex av åtta slots fylls av 2026-08-17-omgången. Två slots har ingen motsvarighet
där och behåller sin bild från 2026-08-06.

| Slug (utan ändelse) | Storlek | Higgsfield job id | Omgång |
|---|---|---|---|
| `grua-plataforma-cargando-auto-asuncion` | 1280×1600 (4:5) | `b22a19e4-352b-4862-96d0-34cec8d2b6f6` | 08-17 |
| `remolque-plataforma-carga-de-auto` | 1024×768 | `6a172819-5e21-4e69-b7e0-eee3609f8347` | 08-17 |
| `auxilio-mecanico-arranque-con-cables` | 1024×768 | `057e760d-b2ce-485e-a9f7-d77180561e92` | 08-17 |
| `cerrajeria-apertura-de-puerta-de-auto` | 1024×768 | `0d329fcb-1be7-4748-ab11-06676eac38f5` | 08-17 |
| `siniestro-vial-auto-danado-en-plataforma` | 1024×768 | `e068eb67-fe03-42e2-b1c9-c3ed51a7864c` | 08-17 |
| `auto-parado-en-la-banquina-de-la-ruta` | 1024×439 | `87671de4-5b6f-4d4d-809f-22cd525a4d32` | 08-17 |
| `gran-asuncion-grua-circulando` | 1024×439 | `36624198-025c-436f-86dd-dcf28048f176` | 08-06 |
| `ambulancia-privada-traslado` | 1024×768 | `0e215751-0a94-4723-96a1-6c6cc9e29a0e` | 08-06 |

Heron är **4:5** och `.hero__photo` är satt till `aspect-ratio:4/5` på desktop.
Under 1024px croppar CSS:en samma fil till 16:9 — den centrerade croppen tar
med lastbil, bil och operatör, så det behövs ingen separat mobilbild.

### Slugbyte = cachebrytning

`.htaccess` cachar bilder ett år och `<img>` har ingen `?v=`. **Byter du motiv
på en slot måste du byta slug**, annars sitter återvändande besökare kvar med
den gamla bilden. Därför är alla sex nya slots namngivna på nytt, och därför
är slugarna beskrivande snarare än generiska. De gamla `-noche`-namnen är också
borta: bilderna visade dagsljus.

### Refuserade 2026-08-17

Två av de åtta nya genereringarna används inte:

| Job id | Varför inte |
|---|---|
| `8b5b07ab-e71c-4614-ad90-d3fd815770e6` | Läsbar text i två lager: vägskylten stavar `BOTA PY02` (skulle vara RUTA PY02), och lastbilsdörren har ett textblock plus en sifferrad i telefonnummerform. Går inte att beskära bort — skylten sitter till höger, dörren mitt i bild. |
| `8fcdb245-5a49-43ef-83dd-bbcb38a94a03` | Påhittad firmatext tryckt på operatörens väst, mitt i bilden. Lastbilen till höger är ren, men en beskärning som tar bort västen räcker inte till 21:9-slotens proportioner. |

Regeln som fällde båda: **inget påhittat telefonnummer och ingen påhittad
firmabranding får ut på sajten.** Ett falskt nummer på en bogseringssajt är
aktivt skadligt — någon ringer det.

Kvarvarande text i det som *används*: `gran-asuncion-grua-circulando` har ett
oläsligt märke på flygeln och en suddig skylt i bakgrunden, och
`ambulancia-privada-traslado` har en lapp på dörren med oläsliga krumelurer.
Inget av det går att tyda som ord eller siffror.

---

## 2026-08-06-omgången

Prompterna nedan är från 2026-08-06. Bara nr 3 och nr 8 ligger kvar live
(se tabellen ovan); resten är ersatta. De står kvar som stilreferens inför
nästa omgång.

| # | Ursprunglig slug | Higgsfield job id | Status |
|---|---|---|---|
| 1 | `grua-remolque-asuncion-noche` | `3a9dbff3-6dc7-456f-bcac-11e419451bf6` | ersatt |
| 2 | `grua-en-ruta-balizas-noche` | `47743f6c-b261-4aa6-a030-bd9c8caf84fe` | ersatt |
| 3 | `gran-asuncion-grua-circulando` | `36624198-025c-436f-86dd-dcf28048f176` | **live** |
| 4 | `remolque-plataforma-vehiculo` | `3c01be81-0dd5-47cb-a4c0-d88d65926125` | ersatt |
| 5 | `auxilio-mecanico-paso-de-corriente` | `69410f8b-829c-4169-8d64-a7e695a5a66d` | ersatt |
| 6 | `cerrajeria-apertura-de-vehiculo` | `78548541-312b-47da-a7d1-94e3c3cd0dd1` | ersatt |
| 7 | `siniestro-vial-retiro-de-vehiculo` | `3754da75-e567-49ad-bf1a-5eab2020dfee` | ersatt |
| 8 | `ambulancia-privada-traslado` | `0e215751-0a94-4723-96a1-6c6cc9e29a0e` | **live** |
| 9 | `operador-coordinando-servicio` | `000d190b-c2fa-4fa8-b573-b5f627570a0a` | aldrig wire:ad |

---

## Gemensam stilriktning (gäller alla nio)

Dokumentärt 35mm, verkligt korn, äkta ljuskällor. **Dagsljus/middagssol**,
inte natt. Riktiga ansikten synliga, paraguayanska människor, kandid och
oposerad kroppshållning — inte studioglättat. Enda mättade färgen i varje
bild: brand-orange **#E8562A** (väst, skylt eller detalj) mot annars solblekta,
lätt avmättade dagsljustoner. Ingen text, ingen läsbar skyltning, inga
registreringsnummer, inga logotyper.

---

## 1 — `grua-remolque-asuncion-noche` · 21:9 · hero

```
Documentary 35mm photograph, bright midday daylight, Asunción, Paraguay. A
flatbed tow truck has just loaded a sedan and a Paraguayan tow operator (30s,
tan work shirt, friendly expression) is closing the safety strap while the
car's owner — a relieved-looking Paraguayan woman in her 40s — stands nearby
with a light smile, arms relaxed, phone still in hand. Ordinary Asunción
street: low buildings, palm tree, overhead power lines, parked cars. Clear
blue sky, strong warm sun, hard-edged shadows. The truck's accent trim and the
operator's safety vest are a single warm burnt-orange (#E8562A), the only
saturated color against otherwise muted, sun-bleached urban tones. Natural
skin tones, candid unposed body language, shot from a low three-quarter
angle. No text, no readable signage, no visible license plates, no logos, no
brand marks.
```

## 2 — `grua-en-ruta-balizas-noche` · 21:9 · section break

```
Documentary 35mm photograph, harsh midday sun, the gravel shoulder of a
two-lane highway outside Asunción, Paraguay. A Paraguayan man in his 30s
stands beside his stalled car with the hood up, one hand on his hip, the
other rubbing the back of his neck — visible stress and frustration, squinting
in the heat, shirt slightly untucked. Hazard lights on, a warning triangle set
out behind the car. Flat scrubby countryside and a heat-shimmer horizon behind
him. Bright overexposed sky, hard shadows straight down, dust in the air. A
single warm burnt-orange (#E8562A) accent from the hazard triangle against an
otherwise sun-bleached, dusty, muted palette. Natural, unposed, documentary —
a real bad moment, not staged drama. No text, no readable signage, no license
plates, no logos.
```

## 3 — `gran-asuncion-grua-circulando` · 21:9 · section break

```
Documentary 35mm photograph, bright daylight, a flatbed tow truck driving
along a wide avenue in Gran Asunción, Paraguay, seen from a low kerbside angle
as it passes. Through the open passenger window, a glimpse of the operator,
relaxed, one arm resting on the door — calm and unhurried, not urgent. Palms
and low commercial buildings line the avenue, overhead power lines, a bright
midday sky with a few clouds. Slight panning motion blur on the background,
the truck itself sharp. The truck's livery accent is warm burnt-orange
(#E8562A), the single saturated color against sun-washed, slightly
desaturated daylight tones. Natural grain, no studio polish. No text, no
readable signage, no license plates, no logos.
```

## 4 — `remolque-plataforma-vehiculo` · 4:3 · card

```
Documentary 35mm photograph, daylight, tight three-quarter view of a car being
winched onto the tilted steel bed of a tow truck on an Asunción street. A
Paraguayan tow operator (work gloves, burnt-orange #E8562A safety vest) guides
the cable with one hand, calm and competent. In the soft-focus background, the
car's owner watches with a relieved half-smile, tension visibly easing.
Scratched diamond-plate steel, real wear, midday sun with hard shadows.
Shallow depth of field, natural grain, warm skin tones. No text, no readable
signage, no license plates, no logos.
```

## 5 — `auxilio-mecanico-paso-de-corriente` · 4:3 · card

```
Documentary 35mm photograph, daylight, a Paraguayan roadside-assistance
operator leaning into an open car bonnet, clamping red and black jumper
cables onto a battery. Beside him, the car's owner — a Paraguayan man in his
50s — leans in too, watching closely, expression shifting from worry to
cautious relief. Midday sun, hard shadows across the engine bay, real dust
and grease texture. Operator wears a burnt-orange (#E8562A) vest, the only
saturated color in the frame. Shallow depth of field, natural grain, both
faces visible, candid and unposed. No text, no readable signage, no logos.
```

## 6 — `cerrajeria-apertura-de-vehiculo` · 4:3 · card

```
Documentary 35mm photograph, bright daylight, a Paraguayan locksmith
technician sliding a slim steel lockout tool into a car door frame,
concentrating. Behind him, the car's owner — a young Paraguayan woman —
stands with arms crossed, visibly impatient but starting to relax as the door
pops. Ordinary residential Asunción street behind them, midday sun, hard
shadows. A small burnt-orange (#E8562A) toolkit or vest detail is the only
saturated color against sun-bleached surroundings. Shallow depth of field,
natural grain, candid body language. No text, no readable signage, no license
plates, no logos.
```

## 7 — `siniestro-vial-retiro-de-vehiculo` · 4:3 · card

```
Documentary 35mm photograph, daylight, two reflective traffic cones on dry
asphalt in the foreground, a car with minor front-end damage behind them, a
Paraguayan driver standing beside it on the phone, stressed but composed —
one hand on his forehead, not panicked. A tow operator in a burnt-orange
(#E8562A) vest approaches from the middle distance, reassuring body language.
Ordinary Asunción street, midday sun, hard shadows, no other traffic damage
visible. Documentary, unstaged, natural grain. No text, no readable signage,
no license plates, no logos, no blood, no visible injury.
```

## 8 — `ambulancia-privada-traslado` · 4:3 · card

```
Documentary 35mm photograph, daylight, a plain white private ambulance van
parked under the entrance canopy of a small private clinic in Asunción, rear
doors open. Two Paraguayan staff members in plain (unbranded) light-colored
uniforms calmly wheel a stretcher toward the entrance; a family member walks
alongside, hand resting supportively on a relative's shoulder — calm, not
urgent. Bright midday light, soft canopy shade, warm and reassuring rather
than dramatic. No red cross, no medical insignia, no text, no readable
signage, no license plates, no logos, no faces in close-up distress.
```

## 9 — `operador-coordinando-servicio` · 4:3 · card

```
Documentary 35mm photograph, bright daylight, Asunción, Paraguay. View through
the open driver's window into the cab of a tow truck: a Paraguayan operator
(30s, tan work shirt) holds a phone to his ear, relaxed and professional, seen
from behind and to the side so his face is only partly visible. Worn vinyl
seat, dusty dashboard, real use, a burnt-orange (#E8562A) vest draped on the
passenger seat as the single saturated accent color. Midday sun through the
windscreen, natural highlights, ordinary Asunción street softly visible
outside. Shallow depth of field, natural grain, candid and unposed. No text,
no readable signage, no logos.
```
