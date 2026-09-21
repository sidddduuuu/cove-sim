# CLAUDE.md — cove-s

Cove S: concept for a mobile, wave-powered charging station for small AUVs (1.5–5 kWh). This folder holds a reduced-order mission model, a draft detailed physics dashboard, and concept CAD. Part of the larger repo in `..` (root `README.md`, `MODEL.md`, `build.mjs`, `run.mjs`). See `README.md` here for architecture and background.

## File map
- `cove-s-model.mjs` — mission/energy model: `simulateCoveS`, `coveSAtSea`, `seaStateAt`, `waveFlux`, `coveSAt`, `coveSParameters`, `coveSDefaults`, `coveSBounds`. Pure, deterministic ESM.
- `check-cove-s.mjs` — assert tests for the above.
- `cove-s-simulation.template.html` → `cove-s-simulation.html` — **generated** by root `../build.mjs`.
- `MODEL.md` — equations, defaults, limits.
- `detailed/` — draft four-page dashboard: `physics.mjs` (two-body model, SI), `ui.js`, `dashboard.template.html`, `build.mjs` (emits `whole|power|underwater|surface.html`), `check.mjs`, `prepare-data.py` (NOAA 46005 → `data/observations.json`), `browser-check.py` (Playwright smoke test, writes `previews/`).
- `cad/` — `cove_s_cad.py` (CadQuery, mm, `Design` dataclass), `exports/`, `renders/`, `cad/README.md`.
- `../COVE_S_SIMULATION_EXECUTION_PLAN.md` — spec for finishing `detailed/`.

## Commands (Node 18+, no dependencies)
- `node check-cove-s.mjs` — mission model tests (from `cove-s/`; or `node cove-s/check-cove-s.mjs` from root)
- `node detailed/check.mjs` — detailed model tests
- `node ../build.mjs` — rebuild `cove-s-simulation.html` (and the other root pages)
- `node detailed/build.mjs` — rebuild the four detailed pages
- `node ../run.mjs` — regenerate `../RESULTS.md`
- `python detailed/prepare-data.py` — rebuild observation data
- `python detailed/browser-check.py` — needs `playwright` and Chrome at `/Applications/Google Chrome.app`
- CAD, from repo root: `uv run --with cadquery python cove-s/cad/cove_s_cad.py --export`

## Conventions
- Match the existing dense, compact JS style (short names, single-line statements, minimal comments). Model files use no clocks, randomness or I/O so results stay deterministic.
- Mission model units: Wh, W, hours, m, s, knots. Detailed model: SI. CAD: millimetres.
- Model files are inlined into HTML by the builders (`export ` is stripped in `detailed/build.mjs`), so keep them self-contained: no imports, no top-level side effects.
- Tests are plain `node:assert`; each script prints a `PASS:` line on success.
- Parameter changes go through `coveSDefaults`/`coveSBounds`; invalid input throws `RangeError`.

## Rules
- Never hand-edit generated HTML (`cove-s-simulation.html`, `detailed/{whole,power,underwater,surface}.html`). Edit the model/template/`ui.js` and rebuild.
- After changing a model or template, run the matching check script and rebuild.
- Keep the energy balance (`energyResidualWh`, detailed `residual`) closing and reserve protection intact.
- Be honest about evidence: keep measured data (NOAA), derived equations, and unvalidated assumptions distinct. Don't call a scripted animation a physical simulation, and don't tune parameters just to make warnings (stroke > ±1.5 m, connection force > 40 kN) disappear.
- A rigid beam removes the relative motion the heave PTO needs; keep the compliant/telescoping vs rigid-lock distinction.
- Known drift: `MODEL.md` puts the battery on the surface platform; the latest layout has the main battery in submerged pods plus a small auxiliary battery on the hull. Update docs when touching this.
- `detailed/` is a draft, not in the root build/nav, and its template links a not-yet-written `detailed/MODEL.md`.
- Don't commit, push or deploy unless asked. `cove-s/` is untracked and root files have separate uncommitted changes; don't sweep them into one commit.
