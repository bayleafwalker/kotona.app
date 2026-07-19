# Image brief: Size the spa to the river

These images are concept art for `src/content/notes/size-the-spa-to-the-river.md`.
They should look like several views of one restrained Finnish mill-site retreat,
not unrelated luxury-spa renders.

## Shared visual language

Use this continuity block at the start of every prompt:

> Architectural editorial concept art with restrained Nordic documentary
> realism. The same small Finnish river mill estate in every image: a low
> five-metre weir, broad fast dark river, old red-ochre timber millhouse on a
> pale granite base, modest new bathhouse in dark charred timber, weathered oak,
> and pale Finnish granite, spruce and birch forest, tactile stone and wood,
> warm indirect light, quiet functional details, credible drainage and winter
> maintenance, no fantasy megastructure. Muted moss, soot, rust, snow, and amber
> palette. Human scale, 35 mm architectural photography, natural contrast,
> fine film grain, believable Finnish weather. No logos or written text.

Use this negative prompt where the image system supports one:

> No Alpine mountains, Japanese temple, torii gate, pagoda, Roman statues,
> replica columns, Vegas theming, tropical plants, giant waterfall, monumental
> concrete dam, infinity pool edge over dangerous water, geothermal spring,
> blue LED lighting, glossy marble hotel, empty showroom sterility, bathers in
> unsafe turbine areas, distorted railings, illegible signage, watermark, text.

People should be background scale figures only. Keep swimwear and towelling
non-sensational, and avoid identifiable faces. The river, weir, pool barriers,
and guest paths must read as separate safe zones.

## 1. Hero: winter rotenburo

Target file:
`public/images/notes/size-the-spa-to-the-river/hero-winter-rotenburo.webp`

Output: 1600 × 900, 16:9, WebP, target under 350 kB.

Prompt:

> [Shared visual language.] Blue-hour winter exterior viewed from a sheltered
> riverbank path. In the foreground, two small outdoor rotenburo-inspired hot
> baths are set into pale rough granite and dark timber decking, steam drifting
> sideways in light snow. Beyond them, the restored red-ochre millhouse and a
> low working weir cross part of the river; the bathhouse glows softly through
> timber screens. Four distant adult guests sit quietly in the water. Show safe
> bronze-toned guardrails, covered service edges, snow-cleared circulation, and
> the river below but no theatrical infinity edge. The mood is secluded and
> operational, not resort spectacle. Composition leaves calm dark space at the
> upper left for a possible social crop.

Alt text:

> Two steaming outdoor baths beside a low mill dam in a snowy Finnish forest at
> dusk.

Caption:

> Concept image generated from the design brief; not a surveyed or proposed
> site.

## 2. Interior: the thermal path

Target file:
`public/images/notes/size-the-spa-to-the-river/thermal-path-interior.webp`

Output: 1500 × 1000, 3:2, WebP, target under 400 kB.

Prompt:

> [Shared visual language.] Interior architectural view along a compact Roman
> thermal sequence interpreted through Finnish materials, not historical
> replicas. Foreground seated wash stations in soapstone and oak; beyond them a
> warm social tepidarium with shallow still water and heated pale-stone floor; a
> darker steam opening suggests the caldarium; at the far end a cold pool frames
> a view of the moving winter river. Low vaulted geometry is abstract and
> structural, with blackened timber roof members and soft daylight. Subtle
> channels in the floor make water management believable. A few quiet adult
> guests provide scale. Calm, warm, humid, no columns or statues.

Alt text:

> A stone and timber thermal bathing hall progressing from wash stations to
> warm rooms and a cold pool facing the river.

Caption:

> Concept image: Roman sequence, onsen-inspired washing, and Finnish materials
> share one compact path.

## 3. Mechanism: mill and heat room

Target file:
`public/images/notes/size-the-spa-to-the-river/mill-energy-room.webp`

Output: 1500 × 1000, 3:2, WebP, target under 400 kB.

Prompt:

> [Shared visual language.] Restored mill energy room where old and new
> machinery remain legible. A slow low-head turbine generator assembly sits
> behind a safe glazed service barrier; beside it are two compact industrial
> water-source heat pumps, large insulated pipes, a closed glycol heat-exchanger
> loop, filters, valves, and simple analog gauges. Old granite walls, repaired
> red timber, clean floor drains, realistic access clearances, warm task lights.
> Through one window the tailrace moves below; through another, the bathhouse is
> visible across a safe courtyard. One engineer in ordinary workwear provides
> scale. The image should make “the river heats the bath” mechanically credible
> without becoming a technical cutaway.

Alt text:

> A restored mill energy room containing hydro machinery, heat pumps, and large
> insulated pipes.

Caption:

> Concept image: hydroelectricity drives heat pumps connected to a closed
> tailrace heat-exchanger loop.

## 4. Site: one operational landscape

Target file:
`public/images/notes/size-the-spa-to-the-river/site-oblique.webp`

Output: 1600 × 1000, 8:5, WebP, target under 450 kB.

Prompt:

> [Shared visual language.] High oblique aerial architectural view in late
> autumn, clear enough to understand the whole small site without diagram
> labels. Show the low weir and mill race; restored mill and energy building;
> new bathhouse set safely above flood-prone ground; a naturalised bypass stream
> around the weir; two hot outdoor baths on a protected terrace; central sauna;
> separate small wood sauna and smoke sauna downstream; eight modest cabins
> scattered along an existing forest edge; a sixty-seat restaurant within the
> main building; discrete parking and service access away from the river path.
> Preserve riparian vegetation and a continuous public-looking river edge where
> safe. This is a 1,200-square-metre bathhouse, not a campus or hotel complex.

Alt text:

> An oblique view of a small mill-site retreat with a weir, bathhouse, fish
> bypass, saunas, restaurant, and eight forest cabins.

Caption:

> Concept image: guest circulation, river ecology, and dam operations remain
> distinct within one compact site.

## 5. Seasonal counter-image: summer river terrace

Target file:
`public/images/notes/size-the-spa-to-the-river/summer-river-terrace.webp`

Output: 1500 × 1000, 3:2, WebP, target under 400 kB.

Prompt:

> [Shared visual language.] Finnish midsummer evening from the restaurant
> terrace, looking past birch trunks toward the same low weir and red millhouse.
> The dark-timber bathhouse sits low in the landscape; one outdoor bath is open
> and the second is visibly closed under a fitted insulated timber cover. Herbs
> and simple local food on a few terrace tables, warm but restrained activity,
> cyclists arriving in the background, no luxury cars. Make the river plot feel
> worth visiting without snow, steam theatrics, or a grand hotel.

Alt text:

> A summer restaurant terrace overlooking the river, low weir, millhouse, and a
> covered outdoor bath.

Caption:

> Concept image: the retreat still has to work when winter is not doing the
> marketing.

## Placement

The note schema accepts an optional hero image. After the approved hero is in
place, add this block to the note frontmatter:

```yaml
hero:
  src: /images/notes/size-the-spa-to-the-river/hero-winter-rotenburo.webp
  alt: Two steaming outdoor baths beside a low mill dam in a snowy Finnish forest at dusk.
  caption: Concept image generated from the design brief; not a surveyed or proposed site.
  width: 1600
  height: 900
```

The hero will also become the note's Open Graph image. Add interior images only
when they carry a different part of the argument; two or three images are
stronger than using all five. Recommended sequence: hero, thermal path after
“The bathing story,” and energy room after “The river heats the baths,
indirectly.”

Example inline placement:

```html
<figure>
  <img
    src="/images/notes/size-the-spa-to-the-river/mill-energy-room.webp"
    alt="A restored mill energy room containing hydro machinery, heat pumps, and large insulated pipes."
    width="1500"
    height="1000"
    loading="lazy"
  />
  <figcaption>
    Concept image: hydroelectricity drives heat pumps connected to a closed
    tailrace heat-exchanger loop.
  </figcaption>
</figure>
```

Before committing an asset, inspect it for invented unsafe access, impossible
water levels, nonsensical machinery, text artifacts, and false specificity. The
caption should always identify it as a concept image.
