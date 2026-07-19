---
title: Delivered energy
status: exploration
lifecycle: current
area: energy systems
published: 2026-06-11
lastRevised: 2026-07-13
projects:
  - household-operating-platform
tags:
  - batteries
  - off-grid
  - ev
summary: A business plan for battery-swap delivered energy that works in one narrow niche and matters most for what it implies about EVs, home batteries, and off-grid design.
---

No capital, no time, no intention to execute. Published because the analysis is
the product.

A business plan for reviving the Finnish heating-oil delivery model with
second-life batteries: a truck brings charged packs, takes empty ones away, and
the customer never thinks about energy logistics again. The plan concludes the
business is viable in exactly one narrow niche, is being structurally selected
against everywhere else, and that its most interesting output is not a company
but a set of implications for EVs, home batteries, and off-grid design.

## The frame

Until the 2010s, a large share of Finnish detached houses heated with oil. The
product was not oil; it was _delivered energy_ — an annual truck visit, a full
tank, zero customer involvement in the supply chain. The model died because the
energy carrier died, not because the service model was wrong.

The proposal: rebuild the service model on batteries. Monthly or seasonal swap
of charged packs, fixed-fee contract, depot charging done where electricity is
cheapest — directly behind the meter at wind and solar plants, on curtailed and
negative-price hours, using second-life EV packs whose remaining calendar life
vastly exceeds their remaining cycle life.

## Why now (and why mostly not)

Five environmental curves matter. Three bend toward the idea, one bends away,
one cuts both ways.

**Pack prices.** Stationary-storage packs averaged $70/kWh in 2025, down 45% in
one year according to
[BloombergNEF's 2025 survey](https://about.bnef.com/insights/clean-transport/lithium-ion-battery-pack-prices-fall-to-108-per-kilowatt-hour-despite-rising-metal-prices-bloombergnef/).
The cheapest observed LFP packs hit $50/kWh. The model assumes second-life EV
packs at €20–40/kWh as Europe's first major EV retirement wave lands
~2027–2030. Direction: strongly favorable, but the second-life price is still an
assumption rather than a quoted supply contract.

**Second-life fit.** The core economic flaw of swap-based heating is cycle
waste: a pack swapped monthly cycles ~12 times a year, throwing away thousands
of cycles of paid-for cycle life. Second-life packs are the mirror image —
degraded cycle count, abundant calendar life, priced accordingly. A low-cycle
seasonal application is the structurally correct home for retired EV batteries.
This is the single strongest argument the concept has.

**Distribution tariff drift.** Finnish DSOs are shifting cost recovery toward
fixed and power-based (tehomaksu) charges under cabling-mandate capex pressure.
Every euro moved from variable to fixed strengthens the pitch to low-consumption
customers, for whom effective all-in distribution cost already reaches
€0.30–0.45/kWh. Rural connection fees of €15–45k keep rising. Direction:
favorable, and it strengthens before the regulatory countermeasure arrives.

**Cheap charging hours — the eroding enabler.** Finland logged 725
negative-price hours in 2024 and 465 in 2025, according to
[Finnish Energy's 2025 review](https://energia.fi/wp-content/uploads/2026/01/Electricity-Year-2025-1.pdf)
using ENTSO-E data. Flexible demand — including grid batteries and electric
boilers in district heating — is absorbing more of the spread. The arbitrage
the depot depends on is being competed away by stationary players with no
trucks. Direction: unfavorable; the model assigns a 40–50% probability that the
spread stays exploitable through 2030.

**Regulatory seams.** Every margin component — avoided fixed fees, avoided
winter transfer, sähkövero classification of a charged pack as goods rather than
network-delivered electricity, customs treatment at the SE1/FI border — is an
institutional artifact, not a physical one. Seams pay until a working group
convenes. Direction: each seam individually short-lived; the portfolio of seams
probably renews.

Net: the environment selects _for_ the boring version (off-grid
energy-as-a-service in places where the grid is expensive) and _against_ the
exciting version (national tariff arbitrage on wheels).

## Unit economics

Cost stack per delivered kWh, second-life pack at €30/kWh, seasonal cottage
service (5 swaps/winter of ~400 kWh):

| Component                                                    | €/kWh         |
| ------------------------------------------------------------ | ------------- |
| Pack amortization (10-yr calendar life, ~50 lifetime cycles) | 0.06          |
| Depot charging (behind-the-meter PPA, curtailment hours)     | 0.00–0.02     |
| Logistics (routed swap, ~8 stops/day)                        | 0.03–0.05     |
| Depot, handling, overhead                                    | 0.02          |
| **Delivered cost**                                           | **0.11–0.15** |

Against the alternatives the target customer actually faces: effective grid
cost €0.30–0.45/kWh at cottage consumption levels, or €15–45k connection capex
avoided entirely. The spread is real. It is also entirely composed of the other
side's fixed-cost structure.

The monthly full-house heating variant remains uncompetitive: 3.5 MWh/month
deliveries, ~€0.10–0.12 delivered cost against €0.15–0.20 all-in grid —
marginal, and squeezed from below by home batteries doing the same arbitrage
through the existing wire.

## Market sizing, Finland

| Segment                                                | Size                                                              | Annual value/customer | Realistic SAM               |
| ------------------------------------------------------ | ----------------------------------------------------------------- | --------------------- | --------------------------- |
| Electrified cottages, low consumption, high fixed cost | 495k registered cottages; est. 50–100k in viable density clusters | €600–1,200            | €30–120M/yr                 |
| New rural builds avoiding connection                   | ~2–4k/yr in expensive-connection zones                            | €800–1,500            | €2–6M/yr                    |
| Remaining oil-heated houses (full replacement)         | shrinking; register data materially overstates active oil heating | n/a                   | excluded — heat pumps win   |
| Construction / events / grid-queue temporary power     | existing market, diesel-priced                                    | €0.30–0.60/kWh        | adjacent, already contested |

SOM for a pilot operator: hundreds of customers, low single-digit €M revenue,
one depot, one truck route geometry. This is a lifestyle-business ceiling
unless the model exports beyond Finland's cottage belt.

## Plan, 2026–2030

**Phase 0, 2026 — paper.** Vero advance ruling on sähkövero treatment of
swapped packs. ADR assessment: lithium packs are UN 3480 Class 9 dangerous
goods; routed multi-tonne residential delivery of used packs is a real
compliance and insurance problem, possibly the plan's hardest practical
constraint. DSO tariff-reform watch. One spreadsheet model with contact-tested
logistics quotes.

**Phase 1, 2027 — pilot.** One depot behind the meter at a wind park with
curtailment history. 10–20 cottage customers in one route cluster. Second-life
packs from the first meaningful EU supply. Success metric: delivered cost under
€0.15/kWh with real trucks and real winters, zero thermal events.

**Phase 2, 2028 — product split.** Seasonal off-grid service plus the hybrid
product: fuse-size arbitrage for grid-connected customers, where a swapped pack
caps peak draw and the customer downsizes their main fuse against rising
tehomaksu. Reserve-market stacking (FCR-D) on depot dwell capacity.

**Phase 3, 2029–2030 — scale or fold.** Decision gates: second-life pack price
under €30/kWh at volume; charging spread surviving; no Energiavirasto
bypass-fee response. Any gate fails, fold the operating business and keep the
depot as a stationary storage asset — the fallback is itself a viable business,
which is the plan's main risk hedge.

## Risk register

The fatal ones first. **ADR and fire liability:** transporting and residentially
siting used lithium packs at scale may simply be unpermittable at acceptable
insurance cost; this kills the plan before economics matter. **Spread erosion:**
the depot's charging advantage is being eaten by stationary flexibility; the
2024→2025 negative-hour decline is the market announcing it. **Regulatory
reflex:** the margin is a tariff-structure short position; the moat is measured
in legislative sessions. **Home battery cannibalization:** at $50/kWh packs,
every customer is one wall-box purchase from self-supply, except where there is
no wire at all — which is why the only defensible segment is the one without
the wire.

## The actual conclusions

The plan's real value is what falls out of it when you remove the company.

**The EV is the truck.** A cottage-owning household driving a 75–100 kWh EV to
the mökki every weekend already performs this exact logistics, for free, with
hardware they own. V2L/V2H plus a small stationary buffer turns the family car
into the delivery fleet, the depot into the home wallbox charged on night spot
prices, and the business into a €500 adapter. The delivered-energy company is
out-competed by its customers' own vehicles — this is the strongest single
finding.

**Off-grid design point moved.** At second-life pack prices, the rational
new-build mökki skips the €25k connection: solar covers April–September, a
20–40 kWh pack plus either EV top-ups or a commercial winter-swap service
covers the rest. The connection-fee comparison now loses in a growing share of
rural cases.

**Home batteries are the same trade through the wire.** Everything the depot
does — buy curtailment hours, sell against peak tariffs and fixed fees — a wall
pack does without trucks, wherever a wire exists. The delivered-energy model is
a proof that the arbitrage exists and a demonstration that stationary capture of
it dominates mobile capture.

**Delivered energy survives only where delivery is the product.** No wire, no
road to a wire, or no time to wait for one: construction sites, events,
grid-queue-delayed industry, and the deep cottage belt. Everywhere else, the
1960s oil-truck nostalgia loses to the boring fact that the pipe was already
built.

## Sources and model boundary

The external anchors are deliberately few:

- [BloombergNEF's 2025 battery survey](https://about.bnef.com/insights/clean-transport/lithium-ion-battery-pack-prices-fall-to-108-per-kilowatt-hour-despite-rising-metal-prices-bloombergnef/)
  for new stationary-pack pricing
- [Finnish Energy's Electricity Year 2025](https://energia.fi/wp-content/uploads/2026/01/Electricity-Year-2025-1.pdf)
  for negative-price hours
- [Statistics Finland's 2025 overview](https://otos.stat.fi/server/api/core/bitstreams/f814d535-d394-411b-b813-daea6e78ead3/content)
  for 495,145 registered free-time residences in 2024
- [Statistics Finland's building-stock documentation](https://stat.fi/en/documentation/documentation-of-statistics/raku)
  for the warning that register data overstates active oil heating

Everything else in the cost stack and market sizing is an order-of-magnitude
model assumption: second-life pack price and life, route density, depot cost,
eligible-customer share, connection cost, and future tariff response. None is a
supplier quote, regulatory ruling, or investment recommendation. The analysis
is useful only if those inputs remain visible enough to replace.

The idea survived a long attempt to kill it in one room of the house. That room
has no electricity, which is the point.
