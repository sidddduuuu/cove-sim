# Model documentation

Equations, assumptions and limits for each simulation live in that simulation's own folder:

| Model | Docs |
|---|---|
| Piezo strip (one cell, pulsed jet) | [strip/MODEL.md](strip/MODEL.md) |
| Piezo sheet (cell size × cell count, shared or independent jets) | [sheet/MODEL.md](sheet/MODEL.md) |
| Full piezo product (float → water column → jet → leaf) | [product/MODEL.md](product/MODEL.md) |
| PVC pipe linear generator (magnet sliding through coils) | [tube/MODEL.md](tube/MODEL.md) |
| Proposed node (sealed pendulum → generator → battery → dock → AUV) | [node/MODEL.md](node/MODEL.md) |

The sheet and full-product models both build on the strip model's single-cell equations; the tube and node docs cross-reference each other on why a straight pipe can't reach wave frequency the way the pendulum hull does.

Rebuild the four generated browser pages (sheet, product, node, tube) from the repo root with `node build.mjs` — the strip page (`strip/simulation.html`) is hand-authored and not templated. Regenerate the parameter sweeps in `RESULTS.md` with `node run.mjs`.
