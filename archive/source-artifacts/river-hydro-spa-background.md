---
title: River-hydro spa retreat — background analysis
date: 2026-07-19
tags: [energy, hydro, concept, finland]
summary: Source material for a future note on a river-hydro spa retreat in Finland — acquired mill site, Roman/onsen/Finnish bathing stack, spa sized to the dam's annual production. Monthly energy-balance model, Järvisydän-calibrated financials, sources, and the model code. Not publishable as-is.
---

# River-hydro spa retreat — background analysis

Working material, not a publishable note. The genre is "win the lottery, spend
10% on the dream": indicative figures, real constraints, no capital, no site,
no intention to execute soon. The candidate thesis and title for the eventual
note is **"Size the spa to the river"** — the plant's annual production is the
budget, and the bathhouse is sized until its annual consumption matches.

## Premise

- New dams are effectively unbuildable in Finland (EU Water Framework
  Directive, national stream-restoration policy, active state funding for dam
  removal). The viable path is acquisition: ~150 operating small hydro plants
  plus hundreds of dormant mill sites with existing dams and — the actual
  asset — existing water permits.
- Site filter: existing permit with generation rights, 3–8 m head, mean flow
  supporting 100–500 kW, road access, buildable land above the flood line, no
  pending kalatalousvelvoite dispute or Natura 2000 entanglement. Old mill
  estates in Häme, Kymenlaakso, southern Savo surface periodically.
- Bathing concept stacks three traditions that compose because all three are
  sequences, not pools: Roman graded path (frigidarium → tepidarium →
  caldarium, hypocaust as hydronic floors fed by the actual heating loop),
  onsen ritual (kakeyu wash stations, silence norms, two outdoor rotenburo at
  41–42 °C above the tailrace), and the Finnish layer (savusauna on the bank,
  avanto in the tailrace — downstream, controlled entry, a genuine safety
  design item).

## Energy architecture

The bridge between hydro (electricity) and spa (heat) is water-source heat
pumps drawing from the tailrace. Self-consumed electricity avoids transfer
fees and taxes, roughly doubling its effective value versus export; the spa is
a near-ideal baseload heat sink. Near-zero winter river water is the
load-bearing technical risk: generous heat-exchanger surface, glycol loop,
anti-icing design.

Archetype site: 5 m head, ~6 m³/s design flow, 250 kW nameplate after
refurbishment. Turbine: refurbish whatever Kaplan variant fits the flume, or
an Archimedes screw if replacing (fish-tolerant, debris-tolerant, and a
visible slow-turning object guests can stand next to).

### Monthly balance model (kW averages)

Model: 250 kW nameplate, monthly capacity-factor profile for a
southern-Finland rain/snowmelt river (CF 61% annual); heat demand from
envelope UA 3 kW/K on a 27 °C pool hall, 45 kW steady indoor-pool losses,
18 kW DHW, rotenburo losses scaled with (41 − T_air) and cut 45% by automated
covers; COP linear in river temperature from 2.5 at 0.5 °C to 3.8 at 19 °C;
direct electric loads for ventilation/lighting/pumps, a 25 kW sauna heater at
seasonal duty, kitchen, and eight cabins.

| Month | Hydro | Heat demand | COP | HP load | Total electric | Import | Export |
| ----- | ----- | ----------- | --- | ------- | -------------- | ------ | ------ |
| Jan   | 138   | 177         | 2.5 | 71      | 170            | 32     | –      |
| Feb   | 112   | 181         | 2.5 | 72      | 171            | 59     | –      |
| Mar   | 125   | 167         | 2.5 | 66      | 158            | 33     | –      |
| Apr   | 225   | 147         | 2.8 | 54      | 135            | –      | 90     |
| May   | 212   | 124         | 3.2 | 39      | 110            | –      | 102    |
| Jun   | 138   | 107         | 3.6 | 30      | 96             | –      | 42     |
| Jul   | 112   | 97          | 3.8 | 26      | 92             | –      | 21     |
| Aug   | 112   | 104         | 3.7 | 28      | 96             | –      | 17     |
| Sep   | 138   | 121         | 3.4 | 36      | 110            | –      | 28     |
| Oct   | 175   | 141         | 3.0 | 48      | 132            | –      | 43     |
| Nov   | 188   | 157         | 2.7 | 59      | 151            | –      | 37     |
| Dec   | 162   | 171         | 2.5 | 67      | 166            | 4      | –      |

Annual results:

- Production 1,342 MWh (CF 61%), site electric load 1,156 MWh, heat delivered
  1,235 MWh via heat pumps.
- Self-consumed 1,065 MWh — **92% of load covered by own hydro**; import
  91 MWh (Feb–Mar concentrated); export 278 MWh (spring).
- Avoided purchases ~€122k/yr (at 11.5 c/kWh delivered), export ~€12k/yr (at
  4.5 c/kWh), import cost ~€10k/yr. Energy system contribution ~€135k/yr —
  the real financial story is avoided purchase, not export.
- The late-winter import hole matches the Finnish wind production peak, so a
  certified wind-PPA slice patches it cleanly. Backup boiler: wood chips —
  the site burns nothing but water and wood.

Caveats to carry into the note:

- Monthly averaging flatters hourly mismatch. Hour-by-hour, night hydro
  exports while daytime peaks import; both flows are somewhat larger than the
  table shows. The 92% self-sufficiency story survives; the "net exporter"
  framing softens.
- The rotenburo is the sneaky number: 41 °C outdoor water at −20 °C loses
  more than 1 kW/m², evaporation-dominated; 30 m² ≈ 35–40 kW on design
  nights. Automated covers outside opening hours are non-negotiable and worth
  more than the turbine's February output.
- Calibration: a mid-size Finnish public swimming hall runs 2,000–2,500
  MWh/yr (Motiva/KETS); this smaller site delivers ~1.9 GWh of useful energy
  on ~1.16 GWh of electricity because the river is used twice — turbine, then
  tailrace heat exchangers. "The river heats the bath" is literally true
  through two conversions.

## Capex (~€12M, the 10%-of-Eurojackpot allocation)

| Item                                                | €M      |
| --------------------------------------------------- | ------- |
| Mill estate with water permit                       | 0.8–1.2 |
| Hydro refurbishment, automation, grid connection    | 1.0–1.5 |
| Fishway (assume required; give it a viewing window) | 0.4–0.7 |
| Bathhouse, 1,200 m² spa-grade (€4,000–4,500/m²)     | 5.0–5.5 |
| Rotenburo, riverbank works, avanto access           | 0.4     |
| Sauna outbuildings incl. savusauna                  | 0.3     |
| Heat pump plant, tailrace exchangers, hydronics     | 0.5     |
| 8 cabins (€180–220k each)                           | 1.6     |
| Restaurant fit-out                                  | 0.6     |
| Design, permits, contingency ~12%                   | 1.3     |

Bathhouse is half the money; the entire energy identity costs under €3M. The
permit is most of the acquisition value.

## Financials — Järvisydän calibration

Public 2024 figures (Asiakastieto/Proff):

- Järvisydän Oy (operating company, Rantasalmi): revenue €19.2M (+2.2%), EBIT
  €1.5M (7.3%), 47 staff, equity ratio 23%. Revenue per employee ~€409k.
- Lomakylä Järvisydän Oy (property entity): revenue €2.4M, EBIT margin ~80%.
  The opco/propco split is instructive if the concept ever grew past
  dream-scale.

Scaled to this footprint (~5× smaller than Järvisydän):

- Revenue: 40,000 spa visits × €48 = €1.92M; 8 cabins × 60% occupancy × €260
  = €0.46M; restaurant €1.1M; savusauna hire/treatments €0.35M; export €0.01M
  → **€3.84M**.
- Opex: ~21 staff × €52k = €1.09M; net energy ~€0.03M (import + wood chips);
  other opex at 42% of revenue = €1.61M → EBITDA €1.11M (29%) at the
  optimistic end. Järvisydän's actual 7.3% EBIT margin argues for
  conservatism: quote **EBITDA €0.7–1.1M, yield 6–9% on €12M** — a poor
  investment and a perfectly serviceable dream.
- Sensitivities: visits ±25% → EBITDA €0.73M / €1.48M (yield 6.1% / 12.4%).
  Dry year (−15% water) costs only ~€23k because lost self-consumption is
  bought back at retail, not lost at spot.
- Note the productivity gap: €183k revenue/employee here vs Järvisydän's
  €409k — either staffing is generous or revenue conservative; both defensible
  in this genre.

## Regulatory stack, in order of pain

Water permit continuity (tailrace heat-exchange intake likely fits existing
rights — confirm) → kalatalousvelvoite (assume a fishway; budget it; make it a
feature with a viewing window) → building permits with flood elevation →
allasvesiasetus 315/2002 pool-water compliance (onsen mineral-water ambitions
collide with chlorinated-recirculation assumptions; small natural-water
exemption paths exist; engage Valvira and the municipal health inspector
early) → hospitality licensing. Timeline 2–4 years from acquisition to
opening, permits dominating.

## Phasing

0. Site hunt + due diligence: permit audit, dam condition survey,
   sediment/contamination history (old mill sites can carry industrial past).
1. Hydro refurbishment and grid connection; fishway negotiated here. The
   plant must run first — measured generation and tailrace temperature drive
   heat pump sizing.
2. Bathhouse, built around the energy system.
3. Cabins, restaurant, retreat programming.

## Sources

- Järvisydän Oy financials: asiakastieto.fi (y-tunnus 2507488-2), proff.fi
- Lomakylä Järvisydän Oy: asiakastieto.fi (y-tunnus 0585973-8)
- Swimming-hall energy benchmarks: motiva.fi uimahallien energiatehokkuus;
  KETS report (energiatehokkuussopimukset2017-2025.fi)
- Small hydro in Finland (~150 plants, 1–10 MW class): energia.fi;
  vesivoimanluonto.org; ELY-keskus renewable-energy permit guidance
- Precedent for plant purchase/decommission dynamics: Kuusamo Myllykoski sale
  (Kaleva, 2023)
- Prices: Nord Pool FI day-ahead (spot ~5 c/kWh 2025 average assumption;
  July 2026 running ~2 c/kWh); delivered ~11.5 c/kWh incl. transfer and tax

## Note-writing intents

- Thesis/title: "Size the spa to the river, not the river to the spa."
- The monthly energy-balance table is the load-bearing artifact; it should
  survive editing intact.
- Hero image brief: winter rotenburo, steam, snow on railings, dam and
  millhouse behind; one consistent duotone style; caption as generated
  concept art.

## Appendix — model code

```python
"""Hydro-spa retreat — monthly energy balance and indicative financials."""

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

NAMEPLATE_KW = 250.0
CF = [0.55, 0.45, 0.50, 0.90, 0.85, 0.55,
      0.45, 0.45, 0.55, 0.70, 0.75, 0.65]

T_AIR = [-6, -7, -3, 3, 10, 15, 18, 16, 11, 5, 0, -4]
T_RIVER = [0.5, 0.5, 1.0, 4.0, 10.0, 16.0, 19.0, 18.0, 13.0, 7.0, 3.0, 1.0]

T_INDOOR = 27.0
UA_BUILDING = 3.0        # kW/K net of heat recovery
POOL_BASE_KW = 45.0
DHW_KW = 18.0

ROTENBURO_M2 = 30.0
ROTEN_LOSS_KW_PER_M2_AT_MINUS20 = 1.2
COVER_FACTOR = 0.55

def cop(t_river):
    return 2.5 + (t_river - 0.5) * (3.8 - 2.5) / (19.0 - 0.5)

VENT_LIGHT_PUMPS = [45, 45, 43, 40, 36, 34, 34, 34, 36, 40, 43, 45]
SAUNA_KW = [16, 16, 15, 13, 11, 10, 10, 11, 12, 14, 15, 16]
KITCHEN_KW = 16.0
CABINS_KW = [22, 22, 18, 12, 8, 6, 6, 7, 10, 14, 18, 22]

IMPORT_PRICE = 0.115
EXPORT_PRICE = 0.045

tot = dict(hydro=0, load=0, selfc=0, imp=0, exp=0, heat=0)
for i, m in enumerate(MONTHS):
    hrs = DAYS[i] * 24
    hydro_kw = NAMEPLATE_KW * CF[i]
    dT = max(T_INDOOR - T_AIR[i], 0)
    roten_kw = (ROTENBURO_M2 * ROTEN_LOSS_KW_PER_M2_AT_MINUS20
                * (41 - T_AIR[i]) / (41 + 20) * COVER_FACTOR)
    heat_kw = UA_BUILDING * dT + POOL_BASE_KW + DHW_KW + roten_kw
    hp_kw = heat_kw / cop(T_RIVER[i])
    elec_kw = (hp_kw + VENT_LIGHT_PUMPS[i] + SAUNA_KW[i]
               + KITCHEN_KW + CABINS_KW[i])
    selfc_kw = min(hydro_kw, elec_kw)
    tot["hydro"] += hydro_kw * hrs
    tot["load"] += elec_kw * hrs
    tot["selfc"] += selfc_kw * hrs
    tot["imp"] += (elec_kw - selfc_kw) * hrs
    tot["exp"] += (hydro_kw - selfc_kw) * hrs
    tot["heat"] += heat_kw * hrs

# Financials: revenue 40k visits x 48 EUR + lodging + restaurant + extras;
# opex = 21 staff x 52k + net energy + 42% of revenue. See body for results.
```
