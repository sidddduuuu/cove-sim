← [Cove overview](../README.md) · [all model docs](../MODEL.md)

# Full piezo product (float → water column → jet → leaf)

`simulateSystem` couples a heaving float, a vertical water column in a tube beneath it, a nozzle jet, and the strip model (see [../strip/MODEL.md](../strip/MODEL.md)) as the leaf. Regular waves of height H and period T force the float through a coupling factor on the hydrostatic stiffness; the column oscillates in the tube and is pushed through the nozzle with ideal one-way routing; the jet's dynamic pressure loads the leaf tip. The equations are integrated with RK4 from rest, and the reported values are from the last three of 23 wave cycles once the response repeats. Energy is accounted end to end (`check-full.mjs` verifies the identity and step convergence). The water column's natural period 2π√(L/g) is reported next to the wave period because the jet is strongest near that resonance.

Everything not modeled for the strip is also not modeled here (see [../strip/MODEL.md](../strip/MODEL.md)'s "Limits and sizing restrictions"), plus: mooring, irregular seas, nozzle losses beyond the ideal one-way routing, float pitch and roll, pump valves, and survival loads. Treat the output as a bound on what this architecture can deliver to a leaf, not as a design.

## Reproduce and verify

Run from this folder (or `node product/check-full.mjs` from the repo root):

    node check-full.mjs

Rebuild `product-simulation.html` from the repo root with `node build.mjs`; regenerate the parameter sweeps in `RESULTS.md` with `node run.mjs`.
