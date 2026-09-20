← [Cove overview](../README.md) · [all model docs](../MODEL.md)

# Piezo sheet (cell size × cell count, shared or independent jets)

`simulateSheet` runs the strip model (see [../strip/MODEL.md](../strip/MODEL.md) for its equations, assumptions and limits) for one cell and multiplies by the number of cells, N, under one of two source assumptions chosen by `sharing`:

- **shared** — one source of the given nozzle diameter D and speed U is divided evenly among the cells: per-cell jet area A/N (diameter D/√N), same speed. Total jet power is conserved. Per-cell force scales as 1/N, per-cell power as 1/N², so total sheet power scales as 1/N. This is the honest case for "one pump, many crystals."
- **independent** — every cell receives its own jet of diameter D at speed U. Total power and total jet input both scale linearly with N. This is an upper bound that assumes the upstream stage can supply N jets; nothing in this model checks that it can.

Cells feed separate resistive loads and totals are sums of per-cell AC power. Cell size is set by `length` and `width` (mm); the sheet area is N × length × width. The strip model's screening checks apply per cell and suppress the charge estimate for the whole sheet when any fails. `sheetSweep` evaluates both modes over 1…N for the sweep chart.

## Reproduce and verify

Run from this folder (or `node sheet/check-sheet.mjs` from the repo root):

    node check-sheet.mjs
