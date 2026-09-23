# Roof Estimator — `/calculator`

White-label demo kalkulatora za roofing firme. Skeylo header/footer su sakriveni
na ovoj ruti (middleware + root layout), tako da izgleda kao deo sajta klijenta.

## URL parametri (brendiranje u hodu)

| Param     | Primer                                                     | Default                       |
| --------- | ---------------------------------------------------------- | ----------------------------- |
| `company` | `Solutions+Contracting`                                    | Premier Roofing Services      |
| `city`    | `North+Richland+Hills`                                     | your area                     |
| `phone`   | `6824699519`                                               | (555) 019-2831                |
| `color`   | `%23c2410c` (hex, `#` = `%23`)                             | `#2563eb`                     |
| `logo`    | `https://.../logo.png`                                     | ikonica kuće u brand boji     |
| `embed`   | `1` (sakriva header, manji top)                            | —                             |
| `notify`  | `owner@firma.com`                                          | env `CALCULATOR_NOTIFY_EMAIL` |
| `sms`     | `6825550199` (mobilni vlasnika)                            | env `CALCULATOR_NOTIFY_SMS`   |
| `prices`  | `monthly` (krije ukupnu cenu, prikazuje samo "from $X/mo") | `range`                       |

Primeri za Loom / outreach:

```
/calculator?company=Solutions+Contracting&city=North+Richland+Hills&phone=6824699519&color=%23c2410c
/calculator?company=Austin+Pro+Roofing&city=Austin&phone=5125550199
```

## Embed snippet (kad klijent kaže "da")

```html
<iframe
  src="https://DEMO-DOMAIN/calculator?company=Austin+Pro+Roofing&city=Austin&phone=5125550199&color=%231d4ed8&embed=1"
  style="width:100%;min-height:900px;border:0;border-radius:16px"
  loading="lazy"
  title="Instant roof estimate"
></iframe>
```

## Gde se menjaju cene

`src/lib/roofing.ts` — `MATERIALS[].pricePerSquare`, `PITCH_WASTE_MULTIPLIER`,
tekstovi insight-a i "what moves the price". Formula:
`squares = homeSqFt × 1.25 / 100`, `estimate = squares × price/sq`.

## Flow i kvalifikatori

1. **Project** — cilj (storm / age / new) + "When are you looking to get this
   done?" (ASAP / this season / researching). Za storm i "Have you filed an
   insurance claim?" (filed / not yet / unsure). ASAP ili filed = 🔥 hot lead
   u subject-u i SMS-u vlasniku.
2. **Size** — sq ft kuće.
3. **Material** — shingles / metal / tile.
4. **Estimate (gate)** — ime, email, mobilni, **ZIP (obavezan)**, adresa
   (opciono), **TCPA checkbox** (obavezan; čuva se `meta.consent.at`).
5. **Result** — range ili "from $X/mo" (`?prices=monthly`), uvek i mesečna
   rata (10 god, 9.99% APR — `FINANCING` u `roofing.ts`), **booking
   termina** za besplatnu inspekciju (sledeća 3 radna dana, AM/PM).

## Leadovi

POST na `/api/calculator/estimate`, type `roof-estimator`, tabela `skeylo_leads`.
`data`: goal, timeline, claim, zip, address, homeSqFt, squares, material,
estimateLow/High, monthlyFrom, priceMode. `meta.consent` = TCPA saglasnost.
Vlasnik dobija mejl sa click-to-call dugmetom i Google Maps linkom na adresu.

POST na `/api/calculator/book` (`leadId`, `slot`) upisuje `data.inspectionSlot`,
postavlja `next_follow_up` na taj dan i šalje vlasniku mejl + SMS.

## SMS (Twilio, opciono)

Bez env-a se tiho preskače. Kad se doda, homeowner dobija estimate SMS-om,
vlasnik dobija lead alert i booking alert na `?sms=` broj.

```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM=+15551234567
CALCULATOR_NOTIFY_SMS=6825550199   # fallback kad nema ?sms=
```

---

## Slike (opciono, ali podižu demo)

Komponenta `SmartImage` odmah prikazuje gradijent + ikonu, a sliku fade-uje
preko toga tek kad se učita. Dakle: dok fajlovi ne postoje, ništa nije
slomljeno; čim ih ubaciš, pojave se bez promene koda.

**Putanja:** `public/calculator/<ime>.webp`
**Format:** kvadrat, 512×512 px, WebP **sa alfa kanalom**, ≤ 60 KB
(prikazuju se na 64×64, retina 128). Subjekt centriran, bez teksta, bez
ljudi, bez logotipa.

Sve slike su **izolovani "sticker" objekti sa providnom pozadinom**, jer se
renderuju preko gradijenta u boji brenda. Tako se boja klijenta vidi iza
objekta i sve kartice izgledaju kao jedan set bez obzira na `?color=`.

### Zajednički style prefix (isti za goal i material slike)

> Stylized 3D icon render of a single isolated object, floating, isometric
> three-quarter view from slightly above, chunky slightly rounded edges,
> soft clay-like matte materials with subtle physically based shading, soft
> studio key light from the upper left, gentle ambient occlusion, clean
> crisp silhouette, muted realistic colors, centered with generous margin,
> plain solid pure white background, no ground plane, no cast shadow on the
> background, no scene, no text, no watermark, no people, square 1:1.

Negativni prompt (Stable Diffusion / Leonardo / Ideogram "exclude"):

> background, scene, sky, house, ground, floor, shadow on ground, gradient
> background, text, watermark, logo, people, blurry, photo, realistic photo

Midjourney: dodaj `--ar 1:1 --style raw --no background,shadow,text`.

### Prvo pitanje — cilj (`goal-*.webp`)

Ista baza kao materijali: mali plutajući isečak krova pod istim uglom, da
kartice u prvom i trećem koraku izgledaju kao ista porodica.

#### `goal-storm.webp`

> [style prefix] A small floating rectangular chunk of a house roof cut
> cleanly at the edges, charcoal asphalt shingles with two shingle tabs
> peeled up and one tab lifting off into the air, several small white
> hailstones resting on the surface and one shallow dent, a tiny dark
> stylized storm cloud floating just above one corner of the roof with a
> single short yellow lightning bolt, a thin pale plywood deck edge visible
> on the cut sides.

#### `goal-age.webp`

> [style prefix] A small floating rectangular chunk of an old worn asphalt
> shingle roof cut cleanly at the edges, faded greyish-brown shingles
> curling up at the corners with patchy granule loss and uneven color, a
> few small spots of green moss in the seams, one small blue water droplet
> hanging from the bottom edge, a thin darkened plywood deck edge visible
> on the cut sides.

#### `goal-new.webp`

> [style prefix] A small floating rectangular chunk of a freshly framed
> roof cut cleanly at the edges, pale plywood decking over exposed light
> wood rafters with one corner of decking not yet placed so the rafters
> show, a neat small stack of two shingle bundles and a hammer resting on
> top of the deck, bright clean optimistic look.

### Treće pitanje — materijal (`material-*.webp`)

#### `material-shingles.webp`

> [style prefix] A small floating rectangular slab of roof cut cleanly at
> the edges, four overlapping rows of architectural asphalt shingles in a
> charcoal slate color, dimensional staggered tab pattern with a soft
> shadow line under each row, fine granule texture, one shingle tab at the
> top corner slightly lifted, a thin pale plywood deck edge visible on the
> cut sides.

#### `material-metal.webp`

> [style prefix] A small floating rectangular slab of standing seam metal
> roof cut cleanly at the edges, three tall vertical raised seams with
> crisp parallel lines, matte dark graphite panels with a soft brushed
> sheen, one seam catching a thin bright highlight, a folded metal lip
> visible on the cut sides.

#### `material-tile.webp`

> [style prefix] A small floating rectangular slab of terracotta barrel
> roof tiles cut cleanly at the edges, three overlapping rows of warm
> orange clay tiles with subtle weathering and slight color variation, a
> soft shadow nestled inside each curve, a hint of pale mortar under the
> top row, a thin pale deck edge visible on the cut sides.

### Kako sačuvati

1. Generiši svaki prompt, izaberi najčistiju varijantu. Proveri da objekat
   zauzima ~70–80% kadra i da su svi isečci iste veličine i pod istim
   uglom, inače kartice deluju neujednačeno.
2. Ukloni belu pozadinu (generatori retko daju pravi alfa kanal; beli
   background iz prompta je namerno, najlakše se seče):

```bash
# opcija A: rembg (pip install "rembg[cli]")
rembg i storm.png storm-cut.png

# opcija B: macOS Preview → Instant Alpha, ili remove.bg / Photoroom
```

3. Smanji na 512×512 WebP sa alfa kanalom. `cwebp` nije instaliran, ali
   `sharp` već postoji u `node_modules` (dolazi uz Next):

```bash
node -e '
const sharp=require("sharp");
for (const [src,out] of [
  ["storm-cut.png","goal-storm"],["age-cut.png","goal-age"],["new-cut.png","goal-new"],
  ["shingles-cut.png","material-shingles"],["metal-cut.png","material-metal"],["tile-cut.png","material-tile"],
]) sharp(src).resize(512,512,{fit:"contain",background:{r:0,g:0,b:0,alpha:0}})
   .webp({quality:82,alphaQuality:100}).toFile(`public/calculator/${out}.webp`);
'
```

Ako je slika već WebP sa alfom (npr. 2048px iz generatora), isti kod
radi i sa `.webp` kao ulazom. Bez node-a: https://squoosh.app → WebP,
quality ~80, resize 512, "lossless alpha".

4. Restart nije potreban; osveži `/calculator` i slike se fade-uju preko
   placeholder ikona.
