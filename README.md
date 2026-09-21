# Cove — wave-node simulations

Screening models for a wave-powered charging station for ocean robots, and the piezoelectric and moving-magnet designs modelled first and rejected on the numbers.

| Model | Source | Page | Checks | Docs |
|---|---|---|---|---|
| Piezo strip (one cell, pulsed jet) | `strip/model.mjs` | `strip/simulation.html` | `node strip/check.mjs` | `strip/MODEL.md` |
| Piezo sheet (cell size × cell count, shared or independent jets) | `sheet/sheet.mjs` | `sheet/sheet-simulation.html` | `node sheet/check-sheet.mjs` | `sheet/MODEL.md` |
| Full piezo product (float → water column → jet → leaf) | `product/full-model.mjs` | `product/product-simulation.html` | `node product/check-full.mjs` | `product/MODEL.md` |
| PVC pipe linear generator (magnet sliding through coils) | `tube/tube-model.mjs` | `tube/tube-simulation.html` | `node tube/check-tube.mjs` | `tube/MODEL.md` |
| Proposed node (sealed pendulum → generator → battery → dock → AUV) | `node/node-model.mjs` | `node/node-simulation.html` | `node node/check-node.mjs` | `node/MODEL.md` |
| Cove S (mobile wave-powered small-AUV service station) | `cove-s/cove-s-model.mjs` | `cove-s/cove-s-simulation.html` | `node cove-s/check-cove-s.mjs` | `cove-s/MODEL.md` |

The pages are self-contained and work offline (d3 is inlined). Rebuild them from the sources with `node build.mjs`; regenerate the parameter sweeps in `RESULTS.md` with `node run.mjs`. Equations, assumptions and limits are in each model's own `MODEL.md`, indexed from the root [`MODEL.md`](MODEL.md).

Cove S also includes editable concept CAD in [`cove-s/cad`](cove-s/cad/), with STEP assemblies, individual STEP/STL components, and assembled and exploded previews.

Headline result (`RESULTS.md`): every piezo configuration lands in the microwatt range against a 4.5 kWh survey-AUV pack. A magnet sliding through coils in a PVC pipe is an efficient transducer but lands in the nanowatt range upright, for a different reason — end magnets strong enough to hold the magnet up give a 0.25 s natural period against a 6 s wave, and softening that suspension to wave frequency needs a spring that sags 8.95 m under its own weight. Laid flat it becomes tunable and trades that for friction: it only moves if the bearing keeps μ under a·ω²/g (0.056 in 1 m / 6 s seas), and one AUV charge per day then needs a 12 m pipe of 600 mm bore holding an 814 kg neodymium magnet. The original sealed-pendulum node explores inertial generation; Cove S is the current mobile concept, combining a two-body WEC, direct wave propulsion, buffered storage, and a submerged dock for 1.5–5 kWh AUVs. These are energy-balanced screening models, not validated designs.

The simulations require Node 18+ and have no package dependencies. Regenerating the optional CAD exports uses CadQuery through `uv`; instructions are in [`cove-s/cad/README.md`](cove-s/cad/README.md).
