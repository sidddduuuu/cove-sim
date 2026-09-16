# Swellport — wave-node simulations

Screening models for a wave-powered charging station for ocean robots, and the two piezoelectric designs modelled first and rejected on the numbers.

| Model | Source | Page | Checks |
|---|---|---|---|
| Piezo strip (one cell, pulsed jet) | `model.mjs` | `simulation.html` | `node check.mjs` |
| Piezo sheet (cell size × cell count, shared or independent jets) | `sheet.mjs` | `sheet-simulation.html` | `node check-sheet.mjs` |
| Full piezo product (float → water column → jet → leaf) | `full-model.mjs` | `product-simulation.html` | `node check-full.mjs` |
| Proposed node (sealed pendulum → generator → battery → dock → AUV) | `node-model.mjs` | `node-simulation.html` | `node check-node.mjs` |

The pages are self-contained and work offline (d3 is inlined). Rebuild them from the sources with `node build.mjs`; regenerate the parameter sweeps in `RESULTS.md` with `node run.mjs`. Equations, assumptions and limits are in `MODEL.md`.

Headline result (`RESULTS.md`): every piezo configuration lands in the microwatt range against a 4.5 kWh survey-AUV pack; a 12 m × 2.8 m sealed hull with a 10 t spring-tuned pendulum makes ~1 kW in 1 m / 6 s seas, enough to charge that AUV in 3 h and refill about twice a day. These are energy-balanced screening models, not validated designs.

Requires Node 18+. No dependencies.
