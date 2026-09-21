← [Cove overview](../README.md) · [equations and limits](MODEL.md)

# Cove S

Cove S is a concept for a **mobile, wave-powered charging station for small AUVs** (autonomous underwater vehicles with roughly 1.5–5 kWh battery packs). It harvests wave energy, uses part of that energy for propulsion so it can reposition itself over long distances, and charges visiting AUVs at a submerged dock.

This folder contains three things at different maturity levels:

| Part | What it is | Status |
|---|---|---|
| **Mission model** (`cove-s-model.mjs` + `cove-s-simulation.html`) | Reduced-order energy/mission simulation with an interactive page | Complete, tested, wired into the root build |
| **Detailed dashboard** (`detailed/`) | Four-view physics dashboard using a two-body frequency-response model and real NOAA buoy data | **Draft**, not yet integrated into the root build |
| **Concept CAD** (`cad/`) | Parametric CadQuery model, STEP/STL exports, renders | Packaging concept, not fabrication-ready |

> **Read this first:** everything here is a screening model or concept. Capture width, foil propulsion, power-takeoff efficiency and similar numbers are *assumed parameters*, not measured hardware performance. Passing tests means the model is internally consistent (for example, that energy balances), not that the machine would work.

## Architecture

### Physical system

```
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  sea surface
        ┌──────────────────────────┐
        │  Surface platform (~8 m) │  comms, controls, power electronics,
        │  floats + deckhouse/mast │  (small auxiliary battery)
        └────────────┬─────────────┘
                     │  compliant / telescoping connection
                     │  ── power takeoff (PTO) + generator ──
                     │  relative heave drives the PTO
                     │  (15–30 m of separation)
        ┌────────────┴─────────────┐
        │ Submerged reaction body  │  hinged foils  → wave-driven thrust
        │                          │  electric thruster (maneuvering)
        │   ┌──────────────────┐   │  main battery pods (latest layout)
        │   │  AUV dock/garage │   │  funnel + latches + charging puck
        │   └──────────────────┘   │
        └──────────────────────────┘
```

- The surface platform and the deep reaction body move differently in waves. Their **relative motion** drives the PTO, which generates electricity.
- **Foils** on the submerged body turn part of that motion directly into forward thrust (the wave-glider principle). The model allocates 18% of captured wave energy to propulsion by default.
- A small **electric thruster** is reserved for collision avoidance, final maneuvering and low-wave contingencies.
- The **dock** sits deep (15–30 m) where wave-induced motion is small. A visiting AUV is charged from the station battery.
- A rigid fixed-length beam would remove the relative motion the PTO needs, so the connection must be compliant or telescoping. The detailed dashboard includes a "rigid lock" case to show this.

### Software

```
 sea state (H, T) ──► coveSAtSea() ──► wave flux, WEC response, electrical W, wave speed
                           │
   scenario ──► seaStateAt()                  simulateCoveS() steps a battery at 0.1 h:
   (design/variable/                          ΔE = (Pwave − Photel − Pthruster − Pdock)·Δt
    calm/storm)                               + charge queue, service window, reserve rule
                                                   │
                                                   ▼
                          points[], events[], distance, energy totals, issues[]
```

```
 cove-s-model.mjs ──┐
                    ├─► ../build.mjs ─► cove-s-simulation.html   (single offline page)
 *.template.html ───┘
 ../run.mjs ─► ../RESULTS.md (numbers from the model)

 detailed/physics.mjs + ui.js + dashboard.template.html + data/observations.json
                    └─► detailed/build.mjs ─► whole.html, power.html, underwater.html, surface.html
```

Both models are plain ES modules with no dependencies and no clocks or randomness, so results are deterministic. Generated HTML files inline the model source; never edit them by hand.

## How the mission model works

Full equations, defaults and limits are in [MODEL.md](MODEL.md). In brief:

1. **Wave power** per metre of crest: `J = ρ g² H² T / (64π)`.
2. **Electrical output** = `min(rated, J × capture width × response(T) × η_PTO × (1 − propulsion share))`. `response` is a log-Gaussian around the tuned period. The converter cuts in at H = 0.15 m and feathers above the survival wave height (4.5 m default).
3. **Speed** rises with wave height and falls away from the tuned period. During the daily service window the platform slows to 0.2 kn so an AUV can approach the dock. Optional thruster assist follows a cubic power law.
4. **Battery and charging** are integrated in time. A charge session starts only if the battery can finish it and stay above the protected reserve (20% default). Curtailed energy and an energy-balance residual are reported.
5. **Scenarios** are deterministic screening histories, not site records: `design` (constant 1 m / 6 s), `variable` (offshore week), `calm` (repeating three-day calm), `storm` (periodic storm pulse forcing survival mode).

Default concept: 3 kWh AUV pack arriving at 20% SOC, 1 visit/day, 1.5 kW dock at 85%, 60 kWh platform battery, 2 kW generator, 0.35 m effective capture width, 1.5 kn max wave-powered speed. Parameters are bounds-checked and invalid input throws `RangeError`.

## Quick start

Requires Node 18+. No install step.

```bash
cd cove-s
node check-cove-s.mjs        # tests + summary numbers for the mission model
node detailed/check.mjs      # tests for the detailed physics model
open cove-s-simulation.html  # interactive mission page (works offline)
```

Rebuild pages after changing a model or template (mission page builds from the repo root):

```bash
node ../build.mjs            # regenerates cove-s-simulation.html (and the other root simulations)
node detailed/build.mjs      # regenerates the four detailed pages
node ../run.mjs              # refreshes ../RESULTS.md
```

Using the model from code:

```js
import {simulateCoveS} from './cove-s-model.mjs';
const r = simulateCoveS({scenario:'calm', days:14, batteryWh:20000});
console.log(r.completed, r.deferred, r.minBatteryWh, r.issues);
```

## Detailed dashboard (`detailed/`) — draft

Four linked, self-contained pages driven by one physical core (`physics.mjs`, SI units):

| Page | Focus |
|---|---|
| `whole.html` | Whole system: surface, connection, submerged dock, battery, propulsion |
| `power.html` | Wave power generation and the effect of connection length |
| `underwater.html` | Reaction plate, pods, dock, foils, thruster |
| `surface.html` | Hull motion, wind loading, generator and deck equipment |

The model is a two-body linear frequency response with a spectral wave realization, quadratic water and air drag, current, an energy ledger and survival-mode handling. Its hydrodynamic coefficients are assumed, not BEM/WEC-Sim results.

**Environmental data:** real observations from NOAA NDBC station 46005, 2024 ([source archive](https://www.ndbc.noaa.gov/data/historical/stdmet/46005h2024.txt.gz), stored in `data/`). `prepare-data.py` extracts the 15,523 rows with simultaneous valid wave height, dominant period and wind into `data/observations.json`. Stress-test presets (flat calm, extreme storm) are synthetic and labelled as such.

Optional browser smoke test (writes screenshots to `detailed/previews/`; needs `playwright` and Google Chrome at the macOS default path):

```bash
python detailed/browser-check.py
```

**Known status of this draft**
- Not in the root build or navigation.
- The template links to `detailed/MODEL.md`, which has not been written yet.
- The default case exceeds the assumed ±1.5 m PTO travel (~7.5 m peak-to-peak) and the 40 kN connection-force screening limit (~39 kN peak dynamic, before static preload and fatigue). The warnings are intentional findings; do not tune them away just to look feasible.
- The spec for finishing it is [`../COVE_S_SIMULATION_EXECUTION_PLAN.md`](../COVE_S_SIMULATION_EXECUTION_PLAN.md).

## Concept CAD (`cad/`)

Editable parametric model (`cove_s_cad.py`, CadQuery, millimetres), assembled/exploded STEP files, a printable STL, per-component STEP/STL, and renders. Details and regeneration command: [cad/README.md](cad/README.md). The CAD sets an envelope and component arrangement only; hull stability, foil hydrodynamics, PTO loads, dock capture and mass/buoyancy budgets all need separate engineering.

## Limits and known inconsistencies

- The mission model answers "can this stated wave history, generator and battery sustain travel and scheduled charging without violating the reserve?" It does **not** show that the hull, WEC, foils, tether or dock can achieve the assumed capture width or speed.
- Mission model results depend on prescribed propulsion performance and are optimistic compared with what the detailed model is meant to establish; don't treat the headline distance or charge counts as predictions.
- `MODEL.md` places the battery on the surface platform, while the later layout puts the main battery in submerged pressure pods with only a small auxiliary battery on the hull. `MODEL.md` and the mission model have not been updated for this.
- Next validation steps: hydrodynamic power matrix and propulsion map, wave-tank tests, annual hindcasts for customer regions, structural/stability analysis, a vehicle-specific dock prototype, biofouling and fatigue testing.
