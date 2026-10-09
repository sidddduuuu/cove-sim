# Cove business analysis

**Research snapshot:** September 29, 2026. **Geography:** United States and Europe. **Product in scope:** The mobile, wave-powered small-AUV charging station described in the [architecture and scaling guide](ARCHITECTURE_AND_SCALING.md).
**Evidence standard:** Public sources establish activities and stated capabilities, not purchasing intent. Vendor claims are identified as such. Inferences and unanswered questions are labeled.

## Executive assessment

Cove-S addresses a real operational constraint: battery-powered autonomous underwater vehicles (AUVs) may require a vessel to recover, recharge, and redeploy them. Offshore recharge could extend useful mission time and reduce some recovery effort. The [U.S. Department of Energy](https://www.energy.gov/sites/prod/files/2019/03/f61/73355.pdf) identifies AUV recharging as a potential marine-energy application, and [NOAA research](https://repository.library.noaa.gov/view/noaa/67166) identifies endurance and vessel-supported servicing as barriers to shipless survey.

The market is **not empty**. A [University of Washington field demonstration](https://www.nature.com/articles/s41598-026-55823-z) combined a wave-energy converter and submerged dock, reporting six successful docking attempts. Commercial vendors offer resident docks, and others are developing moving underwater docks and offshore charging platforms. Cove must therefore win on a particular customer mission, not on the novelty of wave-powered recharge alone.

**Working conclusion:** A focused paid pilot or integration business is plausible. Public evidence does not yet establish a large repeatable market for Cove-S. The major unknowns are customer economics, vehicle compatibility, actual net energy output, docking reliability, and the value of mobility.

## Customer job and product hypothesis

The customer would not buy wave energy for its own sake. The proposed job is to **keep a powered AUV collecting data or inspecting assets without bringing it back for every recharge**. Potential benefits include fewer recoveries, more continuous observations, and a charging location that can move between mission areas. These are hypotheses to test, not measured benefits.

The present [Cove-S architecture](ARCHITECTURE_AND_SCALING.md) proposes an approximately 8 m surface platform, wave-energy conversion, wave-driven propulsion, and a dock 15–30 m below the surface for AUVs with roughly 1.5–5 kWh battery packs. Its CAD and simulations are concept-stage screening tools, not proof of offshore performance.

### Energy-budget gate

The default [mission model](ARCHITECTURE_AND_SCALING.md) assumes one 3 kWh AUV visit per day, arrival at 20% state of charge, 85% dock efficiency, and a 60 W station hotel load:

| Quantity | Calculation | Result |
|---|---:|---:|
| Energy delivered to AUV | 3 kWh × 80% | 2.40 kWh/visit |
| Energy drawn from station | 2.40 kWh ÷ 85% | 2.82 kWh/day |
| Station hotel load | 60 W × 24 h | 1.44 kWh/day |
| **Minimum sustained generation** | (2.82 + 1.44) kWh ÷ 24 h | **~178 W average** |

That average excludes propulsion, communications peaks, storage losses, and calm-weather reserve recovery. The modeled **2 kW generator rating is a maximum, not evidence of 178 W sustained average generation**. Capture width, power-takeoff efficiency, and propulsion performance remain assumptions. For context, the published [UW TigerRAY demonstration](https://www.nature.com/articles/s41598-026-55823-z) was designed for 100 W in its target conditions; it is not an apples-to-apples performance comparison with Cove. Its testing illustrates the importance of measured wave-to-wire output and power-electronics losses.

The team should select a real customer vehicle and operating region before asserting a charge-per-day capability. Historical sea states can be screened with [NOAA NDBC archives](https://www.ndbc.noaa.gov/historical_data.shtml) in the United States and [Copernicus Marine wave reanalysis](https://data.marine.copernicus.eu/product/GLOBAL_MULTIYEAR_WAV_001_032/description?option=-&product_id=-&view=-) for European regions.

## Customer segments

| Segment | Potential reason to care | Main qualification question | Priority |
|---|---|---|---|
| Powered-AUV research teams | Longer sampling campaigns and fewer vehicle recoveries | Does recharge solve an actual mission bottleneck, or are payload, data, and vessel logistics more limiting? | First interviews and pilots |
| Commercial survey and offshore-inspection operators | Vessel time and continuous inspection coverage have economic value | Can Cove beat an existing vessel, resident dock, or uncrewed surface vessel on total operating cost and reliability? | Early economic validation |
| AUV makers and dock integrators | Possible power-and-docking platform partnership | Will they support a reusable charging interface rather than a one-off custom integration? | Partnership interviews |
| Defense and government operators | Persistent, potentially relocatable underwater operations | What mission and sponsor can be discussed and tested openly? | Later, unless a direct sponsor exists |

These are **prospect categories, not validated buyers**. [WHOI](https://www.whoi.edu/what-we-do/explore/underwater-vehicles/auvs/remus/) develops and operates REMUS AUVs, the [UK National Oceanography Centre](https://www.noc.ac.uk/our-work/marine-technology) operates an underwater-robot fleet, and [Oceaneering](https://www.oceaneering.com/rov-services/rov-systems/freedom-autonomous-underwater-vehicle/) markets a resident-capable AUV. None of those facts establishes demand for Cove.

**Likely initial fit — inference:** a powered AUV carrying energy-intensive sensors or repeating short missions. Extremely low-power gliders may be a weaker first segment because existing models can operate for long periods. [Teledyne](https://www.teledynemarine.com/products/product-line/autonomous-underwater-glider) describes long-endurance Slocum gliders; [NOC](https://www.noc.ac.uk/news/european-research-institute-acquire-noc-autonomous-underwater-vehicles) describes multi-week to multi-month Autosub Long Range missions.

## Competitive and substitute landscape

| Alternative | Evidence | What Cove must demonstrate |
|---|---|---|
| Recover and recharge from a vessel | [NOAA](https://repository.library.noaa.gov/view/noaa/67166) identifies endurance, recovery, and servicing as obstacles to shipless survey. | Sufficient avoided recovery work or added mission output to justify Cove's full cost. |
| More onboard energy or long-endurance vehicles | [NOC](https://www.noc.ac.uk/news/european-research-institute-acquire-noc-autonomous-underwater-vehicles) and [Teledyne](https://www.teledynemarine.com/products/product-line/autonomous-underwater-glider) show long-endurance alternatives. | A mission that remains energy-limited despite these options. |
| Fixed or resident subsea docks | [Saab Sabertooth](https://www.saab.com/products/sabertooth) and [Oceaneering Liberty](https://www.oceaneering.com/rov-services/rov-systems/liberty-resident-system/) offer subsea residence and recharge; Liberty has a large onboard battery. | A meaningful benefit from local generation and independent relocation. |
| Wave-powered underwater-dock research | [UW TigerRAY](https://www.nature.com/articles/s41598-026-55823-z) has field results; [DOE-funded Oregon State work](https://stage.energy.gov/cmei/water/funding-selections-marine-energy-university-foundational-rd) pursues related integration. | A distinct customer outcome, stronger performance, or better deployment economics. |
| Moving docks and offshore charging platforms | [Unplugged](https://www.unplugged.no/projects/underwater-refuelling-in-motion) reports a USV-towed submerged dock with 500 W inductive charging. [Ocean Power Technologies](https://investors.oceanpowertechnologies.com/node/17091) has announced progress on offshore charging and docking. | Why Cove's power source, mobility, dock depth, interface, or operating model wins in a named mission. |

Vendor pages establish what suppliers **claim or are developing**; they are not independent proof that all advertised capabilities work in every sea state.

### Potential differentiation to test

> A relocatable, independently powered charging point for small powered AUVs where a fixed dock or support vessel is impractical.

This is a **positioning hypothesis**, not a verified customer requirement. It depends on all three conditions below:

1. The customer needs the charging point to move during a campaign or between nearby missions.
2. Cove has sufficient *net* energy after propulsion, hotel loads, docking losses, and low-wave periods.
3. A compatible AUV can dock and charge reliably without an uneconomic redesign.

If the customer can leave the dock fixed, mobility may add complexity without adding value.

## SWOT analysis

| Strengths | Weaknesses |
|---|---|
| Cove integrates local generation, relocation, and submerged docking in one concept. A small-AUV focus narrows the initial interface problem. | No measured full-scale output, docking success rate, mobility, survivability, or service interval. Current CAD and models are not validated product performance. [Architecture and scaling guide](ARCHITECTURE_AND_SCALING.md) |
| The proposed customer outcome—less recovery and more useful mission time—is testable. | Energy, navigation, docking, and unattended reliability must all work together. Vehicle-specific integration may make early sales custom projects. |

| Opportunities | Threats |
|---|---|
| AUV users seek less vessel-dependent operations; relevant operators exist in research and inspection. [NOAA](https://repository.library.noaa.gov/view/noaa/67166), [Oceaneering](https://www.oceaneering.com/rov-services/rov-systems/freedom-autonomous-underwater-vehicle/) | Established vendors and funded researchers are already pursuing subsea docks, wave recharge, and moving docks. [UW](https://www.nature.com/articles/s41598-026-55823-z), [Unplugged](https://www.unplugged.no/projects/underwater-refuelling-in-motion) |
| A vehicle-maker or operator partnership could provide a real interface and pilot mission. Historical wave datasets support site screening. [NOAA NDBC](https://www.ndbc.noaa.gov/historical_data.shtml), [Copernicus Marine](https://data.marine.copernicus.eu/product/GLOBAL_MULTIYEAR_WAV_001_032/description?option=-&product_id=-&view=-) | Better batteries, low-power vehicles, and uncrewed surface-vessel support may be good-enough substitutes. Deployment approvals and liability may lengthen pilots. [Teledyne](https://www.teledynemarine.com/products/product-line/autonomous-underwater-glider), [Fugro](https://www.fugro.com/expertise/case-studies/ensuring-sustainable-offshore-wind-farm-maintenance-hollandse-kust-zuid-inspection), [U.S. agency overview](https://www.boem.gov/renewable-energy/agency-approval), [UK licensing](https://www.gov.uk/guidance/make-a-marine-licence-application) |

## Market size and economics

**No defensible numeric total addressable market was found.** A broad AUV-industry estimate would include many vehicles and buyers for whom Cove is irrelevant. The serviceable market should instead be counted from named fleets that meet all of these filters:

- A compatible powered AUV and repeated remote missions.
- A material endurance or recovery problem that recharge would solve.
- A viable wave climate and deployment location.
- A technically and commercially feasible dock interface.
- An identifiable buyer and procurement path.

Use a bottom-up model:

```text
Potential stations = qualifying operators × relevant missions/operator × stations/mission
Potential annual revenue = stations sold or deployed × price + service/integration revenue
```

For a customer, the break-even question is:

```text
avoided vessel/recovery cost + value of additional mission output
    > Cove purchase or rental + deployment/retrieval + integration
      + maintenance + insurance + operational risk
```

Reliable public figures for Cove-specific pricing, customer vessel-day costs, willingness to pay, and maintenance burden were **not found**. Those inputs require operator interviews and supplier quotes. **Inference:** early revenue is more likely to come from paid pilots and custom integration than standardized station sales; repeatability depends on a reusable vehicle interface and proven unattended operation.

## U.S. and European outreach map

These are **interview targets, not confirmed buyers**. The best initial contact is usually an AUV operations lead, fleet manager, or mission/program manager.

| Priority | Organization | Reason to contact | Main question |
|---|---|---|---|
| 1 | [WHOI Oceanographic Systems Lab, U.S.](https://www.whoi.edu/what-we-do/explore/underwater-vehicles/auvs/remus/) | Develops and operates REMUS AUVs. | Which powered-AUV missions are recovery-limited, and what interface could be piloted? |
| 1 | [NOAA Office of Coast Survey, U.S.](https://nauticalcharts.noaa.gov/learn/uncrewed-systems.html) | Uses AUVs for hydrographic survey. | Would recharge add survey time, or is another constraint dominant? |
| 1 | [National Oceanography Centre MARS, UK](https://www.noc.ac.uk/our-work/marine-technology) | Operates an advanced AUV fleet. | Which missions still need offshore recharge despite long-endurance vehicles? |
| 1 | [Fugro, Netherlands/UK operations](https://www.fugro.com/expertise/case-studies/ensuring-sustainable-offshore-wind-farm-maintenance-hollandse-kust-zuid-inspection) | Performs remote offshore inspection. | Could Cove beat its existing uncrewed-vessel approach on a specific job? |
| 2 | [MBARI LRAUV team, U.S.](https://www.mbari.org/team/lrauv/) | Extensive AUV and charging experience. | What worked or failed, and where is its [existing solar dock](https://www.mbari.org/news/mbari-research-expedition-provides-a-detailed-snapshot-of-life-in-monterey-bay/) insufficient? Treat as an expert interview, not a greenfield sale. |
| 2 | [ARDITI, Portugal](https://www.noc.ac.uk/news/european-research-institute-acquire-noc-autonomous-underwater-vehicles) | Acquiring two NOC AUVs for offshore science. | Is high-power payload operation constrained by recharge? |
| 2 | [GEOMAR, Germany](https://www.geomar.de/st/auv) | Operates research AUVs. | What are recovery frequency, sea-state limits, and vehicle-modification constraints? |
| 2 | [Ocean Infinity, UK](https://oceaninfinity.com/news/ocean-infinity-launches-needlefish-usv-in-kuwait/) | Operates uncrewed maritime systems. | Would an independent charging node fit its fleet architecture? |
| Expert/partner | [UW Applied Physics Laboratory, U.S.](https://www.nature.com/articles/s41598-026-55823-z) | Direct wave-converter/dock field experience. | What technical and operational lessons should Cove incorporate? |
| Expert/partner | [Unplugged, Norway](https://www.unplugged.no/projects/underwater-refuelling-in-motion) | Developing a closely related moving dock. | Are interface standards or partnership opportunities emerging? |

## Unknowns for customer discovery

Do **not** replace these with unsourced market estimates. Request evidence from recent missions, logs, budgets, quotes, and pilot requirements.

| Unknown | Question for the customer | Why it matters |
|---|---|---|
| Mission pain | In the last 12 months, how many missions ended or paused because of energy? | Establishes frequency and severity. |
| Recovery economics | What vessel, crew, and weather-window effort did a recent recharge/redeployment require? | Sets the value ceiling. |
| Vehicle fit | Which exact AUV, battery, charging protocol, geometry, and permitted modifications? | Determines integration feasibility. |
| Energy demand | How many kWh per visit, how often, and how quickly? | Sets generation, battery, and dock requirements. |
| Mobility | Does the dock need to move? How far and how frequently? | Tests Cove's central differentiator. |
| Reliability | What docking-success rate and unattended service interval would be acceptable? | Defines pilot success and risk. |
| Substitutes | Why not more batteries, a fixed dock, or an existing uncrewed surface platform? | Identifies true competition. |
| Buyer and timing | Who owns the budget, and what evidence is needed for a paid pilot? | Distinguishes interest from purchase intent. |
| Commercial model | Purchase, campaign rental, or service contract? At what budget level? | Enables pricing and market sizing. |
| Deployment | Who handles permits, marking, insurance, recovery, and maintenance? | Determines adoption time and total cost. |

For the first conversation, ask about the **last specific mission before presenting Cove**. A documented recovery event and its cost are stronger evidence than a positive reaction to a concept drawing.

## Proposed validation decision

After 15–20 interviews, proceed toward a customer-specific pilot only if the team has:

1. At least **two operators** with a named recurring mission where offshore recharge would measurably improve results.
2. At least **one vehicle/platform partner** willing to specify a real dock and charging interface.
3. A measured prototype energy budget plausibly sufficient for that mission across its site-specific sea-state history—not just a generator peak rating.

These are **proposed go/no-go criteria**, not sourced market statistics. The existence of an endurance problem is supported; demand for Cove-S's particular solution remains to be validated.

## Research limitations and update triggers

- Public product pages often describe vendor plans or self-reported capabilities, not independently verified deployments.
- An organization's AUV ownership is not proof of a current recharge need, budget, or purchasing authority.
- This report is a September 2026 snapshot. Recheck competitor status, permits, and target organizations before making an investment or deployment decision.
- Update this file with interview evidence, named vehicle specifications, supplier quotes, and measured prototype results. Keep observed facts separate from assumptions.
