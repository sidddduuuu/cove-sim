# Cove — wave-node simulations

Screening models for a wave-powered charging station for ocean robots, and the piezoelectric and moving-magnet designs modelled first and rejected on the numbers.

| Model | Source | Page | Checks |
|---|---|---|---|
| Piezo strip (one cell, pulsed jet) | `model.mjs` | `simulation.html` | `node check.mjs` |
| Piezo sheet (cell size × cell count, shared or independent jets) | `sheet.mjs` | `sheet-simulation.html` | `node check-sheet.mjs` |
| Full piezo product (float → water column → jet → leaf) | `full-model.mjs` | `product-simulation.html` | `node check-full.mjs` |
| PVC pipe linear generator (magnet sliding through coils) | `tube-model.mjs` | `tube-simulation.html` | `node check-tube.mjs` |
| Proposed node (sealed pendulum → generator → battery → dock → AUV) | `node-model.mjs` | `node-simulation.html` | `node check-node.mjs` |

The pages are self-contained and work offline (d3 is inlined). Rebuild them from the sources with `node build.mjs`; regenerate the parameter sweeps in `RESULTS.md` with `node run.mjs`. Equations, assumptions and limits are in `MODEL.md`.

Headline result (`RESULTS.md`): every piezo configuration lands in the microwatt range against a 4.5 kWh survey-AUV pack. A magnet sliding through coils in a PVC pipe is an efficient transducer but lands in the nanowatt range upright, for a different reason — end magnets strong enough to hold the magnet up give a 0.25 s natural period against a 6 s wave, and softening that suspension to wave frequency needs a spring that sags 8.95 m under its own weight. Laid flat it becomes tunable and trades that for friction: it only moves if the bearing keeps μ under a·ω²/g (0.056 in 1 m / 6 s seas), and one AUV charge per day then needs a 12 m pipe of 600 mm bore holding an 814 kg neodymium magnet. A 12 m × 2.8 m sealed hull with a 10 t spring-tuned pendulum makes ~1 kW in 1 m / 6 s seas, enough to charge that AUV in 3 h and refill about twice a day. These are energy-balanced screening models, not validated designs.

Requires Node 18+. No dependencies.
