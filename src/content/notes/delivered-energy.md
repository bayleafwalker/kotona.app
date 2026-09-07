---
title: Delivered energy
role: exploration
status: exploration
lifecycle: current
area: energy systems
published: 2026-06-11
lastRevised: 2026-09-07
projects:
  - household-operating-platform
tags:
  - batteries
  - off-grid
  - ev
summary:
  A business plan for battery-swap delivered energy, corrected after a tenfold
  amortization error. Seasonal swap alone prices like diesel, not like grid, and
  what survives matters most for EVs, home batteries, and off-grid design.
explorePrompt: >-
  Use this note as a worked analysis, not a business case to fund. The
  transferable question: when you model a service business seriously enough to
  price it, what does the model tell you once you remove the company from it --
  and does the model survive an audit of its own arithmetic? The worked case
  rebuilds the Finnish heating-oil delivery model on second-life battery packs
  -- a truck brings charged packs, takes empty ones away, the customer never
  thinks about energy logistics. A first version priced pack amortization at
  €0.06 per delivered kWh; the audit showed that €30/kWh of acquisition spread
  over the ~50 cycles a seasonal pack actually delivers is €0.60, a tenfold
  correction that repriced the service from grid-competitive to
  diesel-competitive. The findings that survive are not about the company. A
  cottage-owning household already drives a 75-100 kWh battery to the site every
  weekend, so the delivery fleet is out-competed by its own customers' vehicles;
  at second-life pack prices the rational rural new-build skips the grid
  connection; a wall pack captures the same arbitrage as the depot wherever a
  wire exists; and a swap pack that sits idle between deliveries cannot amortize
  -- the capital has to earn year-round or the service prices itself out.
  Delivery survives only where delivery is the product and the alternative is
  priced like diesel: no wire, no road to a wire, or no time to wait for one.
  Apply the question to a venture idea you have modelled or dismissed. Build the
  cost stack from lifetime delivered energy, not nameplate cycle life, then ask
  which findings hold once the vehicle is deleted. Say where your constraints
  diverge -- different grid economics, no incumbent infrastructure, a resource
  with no second-life supply. Produce the implications that outlive the
  business, and name the assumptions that would have to be quoted rather than
  modelled before any of it is bankable.
---

No capital, no time, no intention to execute. Published because the analysis is
the product.

**Correction, 2026-09-07.** The original unit-economics table allocated €0.06
per delivered kWh to pack amortization. That figure divides the pack's cost by
cycle life the pack never gets to use: at five swaps per winter over a ten-year
calendar life, the pack delivers about 50 cycles, and €30/kWh of acquisition
spread over 50 cycles is €0.60/kWh — ten times the published number. The table
and every claim priced from it are rebuilt below. The niche got smaller; the
implications at the end got stronger.

A business plan for reviving the Finnish heating-oil delivery model with
second-life batteries: a truck brings charged packs, takes empty ones away, and
the customer never thinks about energy logistics again. The corrected plan
concludes the seasonal-swap service prices like diesel rather than like grid,
survives only where the alternative is also priced like diesel, and that its
most interesting output is not a company but a set of implications for EVs, home
batteries, and off-grid design.

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
packs at €20–40/kWh as Europe's first major EV retirement wave lands ~2027–2030.
Direction: strongly favorable, but the second-life price is still an assumption
rather than a quoted supply contract.

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
boilers in district heating — is absorbing more of the spread. The arbitrage the
depot depends on is being competed away by stationary players with no trucks.
Direction: unfavorable; the model assigns a 40–50% probability that the spread
stays exploitable through 2030.

**Regulatory seams.** Every margin component — avoided fixed fees, avoided
winter transfer, sähkövero classification of a charged pack as goods rather than
network-delivered electricity, customs treatment at the SE1/FI border — is an
institutional artifact, not a physical one. Seams pay until a working group
convenes. Direction: each seam individually short-lived; the portfolio of seams
probably renews.

Net: the environment selects _for_ the boring version (off-grid
energy-as-a-service in places where the grid is expensive, provided the packs
earn year-round rather than idling between swaps) and _against_ the exciting
version (national tariff arbitrage on wheels).

## Unit economics

The model that matters is lifetime delivered energy, not nameplate capacity.
Every assumption is on the table so it can be replaced:

| Assumption                                    | Value                        |
| --------------------------------------------- | ---------------------------- |
| Pack, nominal                                 | 400 kWh second-life, €30/kWh |
| Pack acquisition                              | €12,000                      |
| Usable energy per swap (80% depth)            | 320 kWh                      |
| Seasonal cottage service                      | 5 swaps/winter               |
| Calendar life in service                      | 10 years → ~50 swaps         |
| Lifetime delivered energy                     | 50 × 320 = 16,000 kWh        |
| Retained value after service (stationary use) | €2,000                       |
| Net capital per delivered kWh                 | €10,000 / 16,000 = **€0.63** |

Cost stack per delivered kWh on those assumptions:

| Component                                                | €/kWh         |
| -------------------------------------------------------- | ------------- |
| Pack amortization (calendar-limited, ~50 lifetime swaps) | 0.63          |
| Depot charging (behind-the-meter PPA, curtailment hours) | 0.00–0.02     |
| Logistics (routed swap, ~8 stops/day)                    | 0.03–0.05     |
| Depot, handling, overhead                                | 0.02          |
| **Delivered cost**                                       | **0.68–0.72** |

That is before losses, finance, and everything not listed. Against effective
grid cost of €0.30–0.45/kWh at cottage consumption levels, the seasonal swap
loses outright — the spread the original table claimed does not exist. What the
service actually competes with is generation at a site with no wire at all: a
diesel generator's all-in cost of roughly €0.50–1.00/kWh, and the €15–45k
connection fee a low-consumption site never wants to pay. The service is priced
like diesel, and it survives only against alternatives priced like diesel.

The way back toward the original number is utilization, and it inverts the
company. A pack that does five cottage swaps a year and otherwise sits idle
carries the full €12,000 on 16,000 lifetime kWh. A pack that works at the depot
between swaps — spot arbitrage, reserve markets, the stationary business already
named as the fallback — can see hundreds of equivalent full cycles, and
amortization per kWh falls toward €0.06–0.12 only when that stationary revenue
carries the capital. Then delivery is a marginal side-use of an asset that
already pays for itself, which means the fallback is the business and the truck
is a feature.

The monthly full-house heating variant is worse than previously stated, not
marginal: twelve swaps a year gives ~120 lifetime cycles, so amortization is
roughly €0.26/kWh and delivered cost lands near €0.31–0.35 against €0.15–0.20
all-in grid. It loses by two to one, and home batteries squeeze it from below by
doing the same arbitrage through the existing wire.

## Market sizing, Finland

| Segment                                                | Size                                                              | Annual value/customer | Realistic SAM               |
| ------------------------------------------------------ | ----------------------------------------------------------------- | --------------------- | --------------------------- |
| Electrified cottages, low consumption, high fixed cost | 495k registered cottages; est. 50–100k in viable density clusters | €600–1,200            | €30–120M/yr                 |
| New rural builds avoiding connection                   | ~2–4k/yr in expensive-connection zones                            | €800–1,500            | €2–6M/yr                    |
| Remaining oil-heated houses (full replacement)         | shrinking; register data materially overstates active oil heating | n/a                   | excluded — heat pumps win   |
| Construction / events / grid-queue temporary power     | existing market, diesel-priced                                    | €0.30–0.60/kWh        | adjacent, already contested |

The corrected cost stack cuts this table down further. A 2,000 kWh winter at
€0.68–0.72 delivered cost is roughly €1,400 before margin, which is above the
€600–1,200 annual value the electrified-cottage segment was sized at — that
segment only exists for an operator whose packs earn at the depot year-round.
The segments that survive at seasonal-only utilization are the ones already
paying diesel prices: no wire, or a €15–45k connection for trivial consumption.

SOM for a pilot operator: hundreds of customers, low single-digit €M revenue,
one depot, one truck route geometry. This is a lifestyle-business ceiling unless
the model exports beyond Finland's cottage belt.

## Plan, 2026–2030

**Phase 0, 2026 — paper.** Vero advance ruling on sähkövero treatment of swapped
packs. ADR assessment: lithium packs are UN 3480 Class 9 dangerous goods; routed
multi-tonne residential delivery of used packs is a real compliance and
insurance problem, possibly the plan's hardest practical constraint. DSO
tariff-reform watch. One spreadsheet model with contact-tested logistics quotes.

**Phase 1, 2027 — pilot.** One depot behind the meter at a wind park with
curtailment history. 10–20 cottage customers in one route cluster. Second-life
packs from the first meaningful EU supply. Success metric: delivered cost under
diesel parity (~€0.50/kWh) with real trucks and real winters, zero thermal
events, and measured depot dwell revenue — the model only closes if the packs
earn between swaps.

**Phase 2, 2028 — product split.** Seasonal off-grid service plus the hybrid
product: fuse-size arbitrage for grid-connected customers, where a swapped pack
caps peak draw and the customer downsizes their main fuse against rising
tehomaksu. Reserve-market stacking (FCR-D) on depot dwell capacity.

**Phase 3, 2029–2030 — scale or fold.** Decision gates: second-life pack price
under €30/kWh at volume; charging spread surviving; depot dwell revenue actually
covering most of pack amortization; no Energiavirasto bypass-fee response. Any
gate fails, fold the operating business and keep the depot as a stationary
storage asset — the fallback is itself a viable business, which is the plan's
main risk hedge.

## Risk register

The fatal ones first. **ADR and fire liability:** transporting and residentially
siting used lithium packs at scale may simply be unpermittable at acceptable
insurance cost; this kills the plan before economics matter. **Spread erosion:**
the depot's charging advantage is being eaten by stationary flexibility; the
2024→2025 negative-hour decline is the market announcing it. **Regulatory
reflex:** the margin is a tariff-structure short position; the moat is measured
in legislative sessions. **Home battery cannibalization:** at $50/kWh packs,
every customer is one wall-box purchase from self-supply, except where there is
no wire at all — which is why the only defensible segment is the one without the
wire.

## The actual conclusions

The plan's real value is what falls out of it when you remove the company.

**The EV is the truck.** A cottage-owning household driving a 75–100 kWh EV to
the mökki every weekend already performs this exact logistics, for free, with
hardware they own. The price of joining depends on how much of the house the car
has to feed: a V2L adapter at €300–500 runs appliances and small loads directly
from the vehicle, while a complete V2H installation — bidirectional charger,
installation, grid paperwork — costs several thousand euros. Either undercuts a
delivery contract priced at €0.68/kWh and up. The family car is the delivery
fleet, the home wallbox charged on night spot prices is the depot, and the
delivered-energy company is out-competed by its customers' own vehicles — this
is the strongest single finding, and the corrected arithmetic only widens its
margin.

**Off-grid design point moved.** At second-life pack prices, the rational
new-build mökki skips the €25k connection: solar covers April–September, and a
20–40 kWh pack plus EV top-ups covers the rest. A commercial winter-swap service
can still fill that gap, but at the corrected cost it is priced like diesel — a
convenience purchase, not the cheap default the original table implied. The
connection-fee comparison still loses in a growing share of rural cases, because
the owned pack and the owned car do the work.

**Home batteries are the same trade through the wire.** Everything the depot
does — buy curtailment hours, sell against peak tariffs and fixed fees — a wall
pack does without trucks, wherever a wire exists. The delivered-energy model is
a proof that the arbitrage exists and a demonstration that stationary capture of
it dominates mobile capture.

**Delivered energy survives only where delivery is the product and the
alternative is priced like diesel.** No wire, no road to a wire, or no time to
wait for one: construction sites, events, grid-queue-delayed industry, and the
deepest end of the cottage belt. At €0.68–0.72 delivered, the service does not
compete with a grid at €0.30–0.45; it competes with a generator at €0.50–1.00.
Everywhere else, the 1960s oil-truck nostalgia loses to the boring fact that the
pipe was already built.

**Idle capital was the flaw hiding in the arithmetic.** The tenfold error was
not a typo; it was the model silently assuming the pack's whole cycle book was
available to the delivery business when the seasonal service only ever uses
fifty of them. Any swap business built on capital-intensive carriers has to
answer where the asset earns when it is not being delivered — and once the
depot's stationary revenue has to carry the pack, the stationary business is the
company.

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
supplier quote, regulatory ruling, or investment recommendation. The analysis is
useful only if those inputs remain visible enough to replace.

The idea survived a long attempt to kill it in one room of the house, then lost
a factor of ten to an arithmetic audit and kept only that room. It has no
electricity, which is the point.
