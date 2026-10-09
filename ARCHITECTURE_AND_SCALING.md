# Cove architecture and scaling: MVP → Cove S → Cove M → Cove L

This is the technical entry point for a new reader. See also [Business analysis](BUSINESS_ANALYSIS.md), [How to build the MVP](HOW_TO_BUILD_THE_MVP.md), and the [Good Bull pitch plan](pitch/GOOD_BULL_2026.md).

## Read this first

**Cove is an ocean-robot service-platform concept.** Its first proposed product, **Cove S**, is a mobile, wave-powered station that stores energy and recharges small autonomous underwater vehicles (AUVs) at a submerged dock. Its wave-driven propulsion is intended to reposition the station between service areas. The intended small-AUV battery class is roughly **1.5–5 kWh**.

The repository contains energy-balanced *screening* simulations, a draft detailed dynamics dashboard, concept CAD, and an at-home MVP build plan. None of these proves that a full-scale station can harvest the assumed power, survive offshore conditions, propel itself at the assumed speed, or dock an AUV unattended. Treat numerical outputs as conditional on assumptions until hardware and site-specific wave data validate them.

**Design-status convention used below:** *observed* = an identified measurement; *derived* = an equation or calculation from stated inputs; *assumed* = an unvalidated model parameter; *target* = desired future performance. Do not turn a target into a performance claim.

## Product architecture

```text
                  SURFACE PLATFORM (~8 m Cove S concept)
        navigation + communications + control + small auxiliary battery
                       wave-excited floats / hull
                                │
             compliant or telescoping connection with PTO
             relative heave → generator → power electronics
                                │ power/data umbilical and load path
                                │ mean depth target: 15–30 m
                                ▼
                   SUBMERGED REACTION BODY
            heave reaction + wave-propulsion hinged foils
             main battery pods + maneuvering thruster
                                │
                    funnel/latch/charging dock
                                ▼
                         visiting AUV
```

The surface body and submerged reaction body move differently in waves. Their **relative heave** must pass through a power-takeoff (PTO) mechanism to generate electricity. A rigid fixed-length beam that prevents relative axial movement cannot simultaneously provide substantial power from this heave-PTO path. The connection architecture must allow travel, carry structural loads, protect the umbilical, and handle end stops and overloads. Taut fixed-length tethers in parallel with the PTO would bypass its travel; a physically coherent safety/load path still needs engineering.

The submerged body is intended to react against wave motion, carry the dock in lower-motion water, and support hinged foils that turn part of the wave-induced motion into forward thrust. An electric thruster is reserved for maneuvering and low-wave contingencies. The **latest packaging concept** places the main battery in submerged pressure pods and only a small auxiliary battery on the surface hull. Some older model text and calculations still assume a surface battery; mass, buoyancy, cable losses, and power routing have not been reconciled. Neither battery should ride on the moving PTO member.

The dock is a vehicle-specific system, not just a funnel: an operational version needs navigation/acoustic or other homing, capture, latch, charging interface, communication/data offload, safe abort/release, and a fault-handling procedure. The MVP deliberately tests only guided passive capture, not autonomous docking or wet charging.

## Energy and mission model

The reduced-order Cove S model lives in `cove-s/cove-s-model.mjs`. It estimates whether an **assumed** wave-power capture and wave-propulsion capability could support station travel, hotel loads, battery reserve, and scheduled AUV charging.

Deep-water wave flux per metre of crest is screened as:

```text
J = ρ g² H² T / (64π)
```

where `H` is significant wave height and `T` is energy period. Electrical output is bounded by generator rating and calculated from wave flux × effective capture width × period response × PTO efficiency × the share remaining after propulsion allocation. The battery ledger integrates:

```text
ΔE = (Pwave − Photel − Pthruster − Pdock) × Δt
```

A charge session starts only if the station battery can finish while protecting its reserve. These equations are useful for consistency and sensitivities, but they do **not** establish a real capture width or propulsion map.

| Cove S screening input | Current default | Evidence status |
|---|---:|---|
| AUV pack / arrival | 3 kWh / 20% charge | Scenario assumption |
| Visits | 1 per day | Scenario assumption |
| Dock | 1.5 kW at 85% efficiency | Design assumption |
| Main battery | 60 kWh, 20% protected reserve | Design assumption; packaging unverified |
| Hotel load | 60 W | Design assumption |
| Generator ceiling | 2 kW | Rated-output target, **not average output** |
| Effective capture width / PTO efficiency | 0.35 m / 68% | Unmeasured assumptions |
| Energy allocated to wave propulsion | 18% | Unmeasured assumption |
| Maximum wave-driven speed | 1.5 knots | Unmeasured target |
| Service window | 6 hours per day | Scenario assumption |

At these defaults, one daily visit needs about **2.82 kWh from the station** to deliver 2.4 kWh to the AUV. With 60 W hotel load, the station needs at least **~178 W average generation** before propulsion and other losses. The 2 kW ceiling says nothing about whether that average is achieved across calm periods or at a customer's site. The model's four deterministic scenarios—design, variable, calm, storm—are screening histories, not annual site records.

### Detailed dashboard status

`cove-s/detailed/physics.mjs` and the four generated views (`whole.html`, `power.html`, `underwater.html`, `surface.html`) form a **draft** two-body heave/load simulation. It uses 2024 NOAA NDBC station 46005 observations stored in `cove-s/detailed/data/observations.json`; the data preparation keeps rows with simultaneous valid wave-height, dominant-period, and wind values. Preset sea states select real observation rows, while some stress cases are synthetic. Current is assumed, not observed. The model uses assumed hydrodynamic coefficients—not measured response functions or a WEC-Sim/BEM solution.

Its current default case warns that estimated travel exceeds an **assumed ±1.5 m PTO limit**; a **40 kN dynamic-force screening threshold** is also a model warning, not a certified structural rating. Do not hide these warnings or interpret model power outside the assumed envelope as deliverable. The detailed dashboard is not integrated into the root build/navigation; its model explanation is consolidated here.

The most important unfinished engineering tasks are: choose and model a buildable connection/load path; establish static preload and buoyancy equilibrium; replace guessed heave and damping coefficients; couple drag and surge to actual motion; reconcile battery pods, masses, and power routing; model stroke stops and storm survival beyond linear extrapolation; use sufficiently long and varied sea records; and carry uncertainty/validity metadata through the UI. A rigid-lock comparison should tend toward zero relative heave and zero heave-PTO output.

## The physical MVP and the scale-up path

These are **development stages**, not four finalized product specifications. Only Cove S has a concept envelope. Cove M and L should be sized *after* customer missions and measured S performance, not by multiplying CAD dimensions.

| Stage | Purpose | Hardware scope | Evidence needed before advancing |
|---|---|---|---|
| **Home MVP** | Show motion-to-electric conversion and guided dock geometry in 14 days | 0.4–0.6 m float, adjustable submerged plate, small line-driven generator, dry-side resistor/logger, 3D-printed funnel and passive vehicle | Repeated measured watts/Wh above baseline, logged stroke, retrievable buoyant rig, and reported guided-capture rate. See [build guide](HOW_TO_BUILD_THE_MVP.md). |
| **Cove S prototype** | Serve one specified small powered AUV at a chosen coastal/offshore test site | Engineered two-body WEC, protected storage, vehicle-specific submerged dock, navigation/control, supervised operations | Measured net wave-to-battery power matrix, repeated real-vehicle docking/charging, survival and maintenance evidence, site-specific energy ledger, permitting path. |
| **Cove S product** | Repeat the same job for multiple customers or sites | Design-for-manufacture station with documented interface, deployment/recovery procedure, remote operations and spares | Reliable unattended service interval, economics versus vessel/fixed dock, repeatable builds, support and liability model. |
| **Cove M (provisional)** | Support more frequent visits, larger AUV energy demand, or multiple compatible vehicles | Potentially larger converter, storage, and/or multi-vehicle dock; architecture selected from requirements | A named customer mission that S cannot meet; measured power/sea-state scaling; new structural, stability, and mooring/propulsion validation. |
| **Cove L (provisional)** | Support high-duty or multi-vehicle campaigns across a larger operating area | May require a different hull, WEC, dock, energy source mix, or service model—not merely enlarged S parts | Contract-level demand and economics plus full naval-architecture, safety, environmental, certification, and fleet-operations evidence. |

**Scale the validated service, not just the structure.** At each step, specify target vehicle(s), daily energy delivered, peak dock power, operating region and wave climate, station-keeping/mobility needs, recharge frequency, acceptable downtime, deployment/retrieval method, and permitted modification of the AUV. Size the WEC and buffer from the **worst credible operating window**, then check fatigue, stability, sealing, loads, biofouling, collision risk, and maintenance access. More visits and larger AUVs may require a different architecture altogether.

### Validation roadmap

1. **MVP evidence:** Measure motor/generator characteristics, output to a known load, PTO stroke, and guided dock capture. Log raw data and uncertainty. Do not claim AUV charging.
2. **Mechanism validation:** Bench/dynamometer-test PTO force–velocity behavior and losses. Wave-tank or controlled-water tests must measure both electrical power and relative motion across multiple wave states.
3. **Site and system model:** Replace effective capture width and speed assumptions with measured power and propulsion maps. Replay annual wave histories for an actual customer region. Balance generation, hotel load, propulsion, charging, and reserve.
4. **Vehicle-specific dock:** Choose one AUV interface. Test approach, capture, latch, power transfer, data transfer, abort, and release repeatedly under increasing motion/current.
5. **Offshore prototype:** Assess structural and fatigue loads, watertightness, corrosion, biofouling, stability, navigation safety, communications, environmental effects, and recovery. Obtain location-specific approvals before deployment.
6. **Commercial S, then M/L:** Validate total customer economics and reliability. Move up-market only when a real mission requires it and the smaller system's measured limits are known.

For the detailed dynamics model, essential invariant tests are: zero waves yield zero wave-generated power; zero relative velocity or zero PTO damping yields zero damper power; rigid lock suppresses the heave-PTO path; energy ledgers close; drag direction reverses with relative flow; and invalid stroke/load cases are flagged rather than ranked as feasible. Check source timestamps/units and missing values when preparing observational data.

## Repository map and how to run it

| Area | Contents | Status |
|---|---|---|
| `cove-s/cove-s-model.mjs` + `check-cove-s.mjs` | Deterministic mission/energy model and tests | Screening model; wired into root build |
| `cove-s/cove-s-simulation.template.html` → `cove-s-simulation.html` | Offline interactive mission page | Generated from source |
| `cove-s/detailed/` | `physics.mjs`, `ui.js`, four-view dashboard template/build/tests, NOAA preparation and observations | Draft; separate build |
| `cove-s/cad/` | CadQuery master, STEP/STL exports, renders | Packaging concept only |
| `strip/`, `sheet/`, `product/` | Earlier piezoelectric screening concepts | Retained as rejected/learning models |
| `tube/` | Earlier moving-magnet pipe screening concept | Retained as rejected/learning model |
| `node/` | Earlier sealed-pendulum node concept | Retained as a separate exploration |
| `build.mjs` / `run.mjs` | Offline page builder / parameter sweeps | Outputs generated HTML / `RESULTS.txt` |

Earlier piezoelectric options produced only microwatt-scale outputs in the model against a multi-kWh AUV pack. The upright moving-magnet pipe was mistuned to a typical wave period; the horizontal version trades tuning for friction and becomes very large for one charge/day. These are **model outcomes**, not physical measurements. The full parameter sweeps are generated in `RESULTS.txt`; the old concepts remain in code so assumptions can be inspected or retested.

Run from the repository root with Node 18+; the simulation scripts have no package-install step:

```bash
node strip/check.mjs
node sheet/check-sheet.mjs
node product/check-full.mjs
node tube/check-tube.mjs
node node/check-node.mjs
node cove-s/check-cove-s.mjs
node cove-s/detailed/check.mjs
node build.mjs
node cove-s/detailed/build.mjs
node run.mjs                  # regenerate RESULTS.txt
```

`strip/simulation.html` is hand-authored; the other root simulation pages are built from `*.template.html` plus model source. Do not hand-edit generated HTML. Change the corresponding model/template and rebuild. The model modules are deterministic and self-contained because builders inline them; Cove S's energy-residual and reserve checks should keep passing after changes. The detailed model uses SI internally; the mission model reports W, Wh, hours, metres, seconds, and knots.

To regenerate the observational dataset, use `python3 cove-s/detailed/prepare-data.py`. An optional browser smoke test is `python cove-s/detailed/browser-check.py` with Playwright and a suitable Chrome installation; it does not replace physics validation.

### Concept CAD and its limits

The editable CAD master is `cove-s/cad/cove_s_cad.py` (CadQuery, millimetres). It includes an approximately 8 m surface hull, PTO/generator housing, reaction body, foil pairs, maneuvering thruster, submerged dock, battery/power-electronics packaging, and a representative 2.7 m AUV. Exports under `cove-s/cad/exports/` include compact, operating-depth, and exploded STEP assemblies; component STEP/STL files are under `exports/parts/`, with previews in `renders/`.

```bash
uv run --with cadquery python cove-s/cad/cove_s_cad.py --export
```

Change the `Design` data class in the source to revise the envelope. The CAD is **not fabrication-ready**: it does not establish hull stability, PTO/tether loads, fatigue life, foil hydrodynamics, docking capture, pressure-housing integrity, mass/buoyancy balance, or maintenance access. A small FDM printer is most useful for MVP brackets, spool, guides, and a modular docking funnel—not pressure housings or primary offshore structural parts.

## Team ownership for the three-person MVP

- **Mechatronics lead:** PTO, float/plate structure, fasteners, spring/stops, electrical protection, and physical repairs.
- **Oceanography lead:** test-water setup, wave/sea-state characterization, ballast and depth choices, site representativeness, and interpretation of motion.
- **CS lead:** calibrated time-series logging, energy calculations (`P = V × I`, integrated Wh), test metadata, capture-trial records, plots, and reproducibility. Later this role expands to vehicle homing, docking control, charge-state logic, faults, telemetry, and fleet operations.

All three own safety and interpretation. The fastest convincing day-14 result is a **measured, repeatable experiment with honest limits**, not a claim that the eventual offshore station is already feasible.
