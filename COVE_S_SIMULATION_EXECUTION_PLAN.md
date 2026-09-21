# Cove S: execution plan for four detailed simulations

## 1. Instructions to the executing LLM

Continue the existing project at `/Users/aaryabookseller/Desktop/cove`. Build and validate the four simulations specified below. Read this entire plan before editing. Inspect the current files rather than assuming their contents match this snapshot. Preserve unrelated work and existing simulations. Do not reset the repository, delete the current implementation, or overwrite user changes. Do not push, deploy publicly, or purchase anything unless the user separately requests it.

The user explicitly paused implementation to request this handoff. This document is the deliverable of that pause; its existence does not mean the simulations are complete. When asked to execute it, proceed through the phases, keep a short progress record, and deliver functioning local pages, reproducible models, sources, tests, and documentation. Make routine implementation choices autonomously. Ask only if an unresolved product requirement materially blocks progress. If engineering evidence is missing, label the assumption and continue with a bounded model rather than inventing a result.

The user wants understandable, detailed simulations with individually labelled visible components. Scientific honesty is essential: measured environmental inputs do not validate an unbuilt machine. Do not describe a scripted animation as a physical simulation, or numerical stability as proof of physical feasibility.

## 2. User requirements and project context

Build four separately accessible, linked simulations:

1. The complete Cove S system operating together.
2. Wave-energy generation, including variable length of the connection between the surface and submerged bodies.
3. The underwater assembly alone.
4. The above-water assembly alone.

Every view must show its components clearly, label them individually, and derive motion and relevant outputs from a shared physical model. Include water drag, aerodynamic drag, current, variable waves, calm conditions, normal operations, and storms. Use real environmental data with provenance. Clearly separate actual observations from synthetic extreme cases and hardware assumptions.

Cove S is a proposed mobile AUV charging station intended for long-distance repositioning, low maintenance, and customer-selected deployment regions. Wave power is the primary resource; do not make solar the default solution. Small AUVs with approximately 1.5–5 kWh batteries are the current concept target. The broader ambition is not evidence of worldwide capability.

Existing concept targets, all provisional:

- Surface platform approximately 8 m long.
- Submerged reaction body and dock approximately 15–30 m deep.
- 2 kW electrical generator ceiling.
- 60 kWh main station battery, currently proposed in lower pressure pods.
- Small surface auxiliary battery; earlier discussion suggested 1–3 kWh but this is not sized or validated.
- 1.5 kW AUV charge delivery; define charger input/output consistently.
- 20% main-battery protected reserve.
- Wave-driven fins plus electric maneuvering assistance.

Do not force the new model to reproduce the old claims of 548 km and 14 charges in two weeks. Those arose from an optimistic screening model with prescribed propulsion performance.

## 3. Existing work: inspect and reuse, do not mistake for finished engineering

### Repository files

- `README.md`, `MODEL.md`, `RESULTS.md`, `HANDOFF.md`: project-level context.
- `build.mjs`, `run.mjs`: current browser build and numerical reporting scripts.
- `cove-s/cove-s-model.mjs`: earlier mission/energy model.
- `cove-s/cove-s-simulation.template.html` and generated `.html`: earlier interactive page.
- `cove-s/check-cove-s.mjs`: earlier model tests.
- `cove-s/MODEL.md`: concept documentation; inspect for outdated battery placement.
- `cove-s/cad/cove_s_cad.py`: CadQuery concept geometry.
- `cove-s/cad/exports/`: assembled/exploded STEP files and component STEP/STL files.
- `cove-s/cad/renders/`: assembled, exploded, and module PNGs.

CAD is packaging geometry, not validated naval architecture. Some parts are illustrative, overlap, or are fused into larger solids. Check mounting, battery placement, dock clearance, foil travel, and PTO load paths before using it as a mechanical authority. Solid counts are not an engineering quality metric.

### New draft already present

`cove-s/detailed/` contains:

- `physics.mjs`: preliminary two-body frequency-response model and force/energy calculations.
- `ui.js`: canvas diagrams, charts, environmental controls, and JSON export.
- `dashboard.template.html`: common page shell.
- `build.mjs`: creates four self-contained pages.
- `whole.html`, `power.html`, `underwater.html`, `surface.html`: draft generated pages.
- `prepare-data.py`: extracts valid observations and percentile presets.
- `data/46005h2024.txt.gz`: downloaded original NOAA data.
- `data/observations.json`: metadata and selected actual observations.
- `check.mjs`: draft physics tests.
- `browser-check.py`: headless browser smoke tests.
- `previews/`: desktop and mobile screenshots generated by smoke tests.

These are useful scaffolding, not the completed requested product. At this handoff, they are not integrated into the root build or main navigation. The template links to a local `MODEL.md` that has not yet been created in this directory.

Observed test status at handoff:

- `node cove-s/detailed/check.mjs` passed its current tests.
- Four pages loaded without reported browser runtime errors in a headless Chrome smoke test.
- Tests exercised calm/storm presets, length adjustment, rigid lock, playback, component-key presence, and 390 px overflow.
- Screenshots were generated but not thoroughly visually reviewed.
- Default draft output: about 287 W mean electrical power, 7.50 m peak-to-peak relative travel, 39.2 kN peak dynamic connection force. This EXCEEDS the assumed ±1.5 m travel envelope. Preserve the finding; do not tune it away merely to make the concept look successful.
- Rigid lock produced approximately zero relative motion/power, as expected for this particular heave PTO.

The worktree contains pre-existing modified root files and an untracked `cove-s/` tree. Do not attribute all those changes to your execution or commit them indiscriminately.

### Earlier explanatory visuals

Conversation-only animations live under:

`/Users/aaryabookseller/.codex/visualizations/2026/09/18/01a0b6b3-d338-7700-8b86-971159a4f2e0/`

Their names include `cove-s-operating-system.html` and `cove-s-wave-energy-generator.html`. They use prescribed motion, simplified/illustrative power, and schematic connections. Do not reuse their output as validated data. Reload the full visualize skill before creating or updating a conversation visualization. The requested repository simulations should remain reproducible project artifacts regardless of any conversation preview.

## 4. Resolve the mechanism before polishing the interface

### 4.1 Connection architecture

The user called the connection a “beam” or “center pillar.” A rigid beam fixing the distance between the bodies removes the relative axial/heave motion used by the proposed generator. Distinguish these cases explicitly:

- **Compliant or telescoping PTO connection:** relative travel is allowed and passes through an identified mechanical conversion path.
- **Rigid-lock comparison:** suppresses relative axial motion; do not display substantial heave-PTO generation from it.
- **Optional later architecture:** articulated/rotational rigid link. It needs a separate rotational PTO model and must not be silently substituted for the heave model.

Choose and document a mechanically coherent baseline. Show the generator mount, moving member, guide bearings, preload/retraction path, travel allowance, end stops, and safety load path. Taut fixed-length tethers placed in parallel with the PTO would bypass its travel: do not draw or model that arrangement as if it permits independent extension. Safety tethers may need slack, compliance, or payout. Rope-only members cannot carry compression. A telescoping spar can have different compression and buckling constraints.

Separate mean deployed length L, instantaneous separation, PTO stroke, cable payout, submerged depth, and water depth. They are related but not interchangeable. Define reference points and signs. If the baseline approximates a vertical connection and takes depth ≈ L, disclose the approximation and flag large inclination.

### 4.2 Battery placement

Main batteries belong in sealed pressure housings fixed to the submerged assembly in the latest discussed layout; a smaller auxiliary battery may be fixed to the surface hull. Neither is mounted on the moving PTO element. Update conflicting docs and drawings consistently after confirming the baseline.

Include power/data routing, strain relief, a service loop or suitable reel/sliding interface, pressure feedthroughs, and independent mechanical load support. Battery weight and buoyancy must enter the mass/equilibrium budget. Do not claim the proposed capacity fits the current pods without a dimensional and mass estimate.

### 4.3 Evidence classification

For every meaningful input, classify it as measured, derived from a stated equation, manufacturer-specified, literature-based estimate, user assumption, or unvalidated design target. Document source, units, range, uncertainty, and effect on outputs. Put essential provenance in the UI and complete details in model docs.

## 5. Environmental data pipeline

### 5.1 Existing verified source

NOAA NDBC station 46005, standard meteorological observations for 2024:

https://www.ndbc.noaa.gov/data/historical/stdmet/46005h2024.txt.gz

Existing archive SHA-256:

`42deabc8d00f5ef8af9340e53007e8b7490f3bb3a955d7a2b9796bd9d2e8b5bc`

The current extraction finds 15,523 rows with simultaneous valid WVHT, DPD, and WSPD. It preserves the matching gust where valid. Revalidate the count and timestamp parsing against the archive.

Selected observed minimum/maximum Hs:

- 0.59 m, 2024-09-04T17:10:00Z; DPD 7.69 s; mean wind 2.5 m/s; gust 3.6 m/s.
- 9.31 m, 2024-01-09T14:40:00Z; DPD 13.79 s; mean wind 15.6 m/s; gust 22.7 m/s.

These are extrema in the filtered station-year sample, not the calmest or stormiest seas globally. Preset percentiles are observation-weighted and are not automatically time-weighted climatology when sampling/gaps vary.

### 5.2 Pipeline requirements

1. Keep raw source files and checksums. Record retrieval timestamp and extraction version.
2. Parse headers by name where practical. Handle missing-value sentinels by field; do not treat them as measurements.
3. Preserve UTC timestamps, station metadata, measurement heights/depths, units, and source URLs.
4. Keep simultaneous measurements together; do not independently combine maximum waves with maximum wind and label that an observed event.
5. Retain usable contiguous event windows as well as presets. Report missing intervals, do not silently bridge long gaps.
6. Support at least an observed quiet window, ordinary window, and storm window. Prefer a second contrasting station/region if data access allows; otherwise explicitly retain one-site coverage.
7. Display the active station and timestamp/window in every page. Editing a measured environmental field changes its status to “custom scenario.”
8. Current is not present in the existing standard meteorological archive. Obtain compatible current observations from an appropriate source if feasible; otherwise keep it explicitly assumed, independently adjustable, and absent from claims about measured forcing.
9. Distinguish mean wind, gust envelope, and time-resolved wind. Do not invent a measured gust time history.
10. Archive compact processed JSON for offline operation. Add a separate update script rather than making runtime network access necessary.

Useful primary references:

- NOAA definitions: https://www.ndbc.noaa.gov/faq/measdes.shtml
- NOAA archive guidance: https://www.ndbc.noaa.gov/historical_data.shtml
- Station metadata: https://www.ndbc.noaa.gov/station_page.php?station=46005
- NOAA sea/wave interpretation: https://ocean.weather.gov/product_description/keyterm.php
- WEC-Sim theory: https://wec-sim.github.io/WEC-Sim/dev/theory/theory.html
- NASA drag equation: https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/drag-equation/

Verify sources when using them. A citation to WEC-Sim does not mean this project runs WEC-Sim or inherits its validation.

### 5.3 Full condition range

Provide flat calm, low waves, moderate seas, rough seas, an observed severe event, and an extreme synthetic stress case. The draft includes Hs=0 and Hs=16 m / Tp=18 s / wind=45 m/s / gust=60 m/s as stress presets. These are user-exploration assumptions, not observations or certified design cases. There is no single global “stormiest” condition. Do not equate significant wave height with every individual wave's height or treat a 3-minute synthesized wave train as a return-period extreme analysis.

## 6. Physics requirements and draft audit

### 6.1 Model hierarchy

Deliver an explicit reduced-order model first, then improve coefficients or fidelity where evidence supports it. Do not imply CFD, full six-degree-of-freedom dynamics, structural FEA, or measured device performance unless actually executed and documented.

A valid minimum should couple surface and submerged heave, connection force, PTO loading, drag, energy conversion, and battery accounting. A more complete version adds surge and orientation; distinguish estimated forces at an imposed speed from solved vehicle speed.

Keep solver/model code separate from drawing code. All four pages use the same parameter schema, environment state, solver and result schema. No UI-only power or speed curves.

### 6.2 Wave realization

- Use measured spectra if available. Otherwise reconstruct an explicitly synthetic irregular spectrum from measured Hs and Tp; PM or JONSWAP must be identified and justified.
- Normalize spectral variance to m0=(Hs/4)^2. Use a reproducible seed and support seed changes for uncertainty exploration.
- DPD is a dominant/peak period, not an energy period. Do not substitute it into mean energy flux equations that require Te without disclosing the approximation.
- Compute wave elevation, orbital velocity and acceleration with consistent phases and coordinates.
- For deep water, k=ω²/g and orbit amplitude decays as exp(−kz). For finite-depth mode, solve ω²=gk tanh(kh) and use the appropriate transfer functions.
- Display depth/regime limits. No breaking-wave, slamming, green-water or nonlinear survival claims from linear waves.
- For long observed windows, vary sea-state statistics coherently over time; avoid discontinuous random phase resets that create artificial impulses.

### 6.3 Coupled heave and load path

A suitable baseline is:

`(M+A) q̈ + B q̇ + K q + Fvisc(q̇−u) + Fconnection(q,q̇) = Fwave(t)`

with q containing both bodies' heave coordinates. PTO forces must be equal and opposite. The connection relative coordinate, damping, stiffness, preload, stroke limits, and any slack/contact state must be explicit.

- Mass, added mass, radiation damping, restoring stiffness and excitation coefficients need stated provenance.
- Use BEM-derived coefficients if feasible, but do not turn arbitrary numbers into “real-world coefficients” by naming a solver.
- Increasing PTO damping must change relative motion; do not hold motion fixed while freely increasing extracted power.
- Model finite travel and appropriate operating mode transitions. If end stops are not solved, mark outputs beyond the stroke envelope invalid and suppress unqualified usable-power claims.
- Include equilibrium support/preload. Dynamic force alone is not total tether tension.
- An unsupported fully submerged body does not automatically have waterplane restoring stiffness. Audit the draft's arbitrary 2 kN/m lower-body restoring term and derive the chosen replacement from the architecture.
- Check resonance, singular responses and loss of validity. Provide timestep/frequency discretization convergence tests.

### 6.4 Variable connection length

Control L over a plausible exploratory range, initially 3–50 m. Length should affect:

1. Submerged-body wave forcing and orbital flow.
2. Wetted connection area and distributed drag.
3. Mass, buoyancy and stiffness where relevant.
4. Dynamic response and relative stroke.
5. Umbilical loss/voltage drop where conductor assumptions exist.
6. Pressure and potential seabed clearance.
7. Feasibility of tension, compression, inclination, bending or buckling depending on mechanism.

Do not treat an EA/L spring as a validated telescoping actuator unless physically justified. A purpose-designed PTO spring may not scale with deployed length. Offer distinct connection models or explain which component the effective stiffness represents.

Provide a length sweep with power, stroke, peak total/dynamic force, connection drag, and validity flags. Hold environment and random realization consistent between lengths. Do not recommend an optimum based only on power or only on a short realization. Longer is not automatically better.

### 6.5 Water and air drag

Use `Fdrag = 0.5 ρ Cd A |urel| urel` with the force direction defined explicitly. Relative velocity must include fluid motion and body motion in consistent coordinates.

Water loads:

- Surface hull, lower body/dock, pods, fins and connection segments.
- Current and wave orbital flow; depth-dependent velocity.
- Distributed connection drag via spatial integration.
- Separate excitation/added mass from viscous drag to avoid double counting.
- For structural members, use Morison-style drag/inertia only inside its applicability and with explicit coefficients.

Air loads:

- Hull/deckhouse exposed area, mast and antennas.
- Apparent wind relative to vessel velocity and direction.
- Separate mean and gust load outputs; correct measurement-height assumptions where needed.

Provide component force breakdowns and sensitivity to uncertain Cd/area. At minimum clearly state a one-axis restriction; preferably include wind/current/wave headings. Include moments only when geometry and rotational dynamics support them.

### 6.6 Generation, propulsion and electrical balance

- Mechanical PTO power must come from force × relative velocity with a clear sign convention.
- Model generator, rectifier/DC stage and battery charge efficiency separately or disclose a lumped efficiency.
- A rectifier alone does not produce regulated steady DC; name the DC-link/storage/converter stage correctly.
- Power caps, braking/dump loads, losses and curtailment need an explicit disposition in the energy ledger.
- Bidirectional stroke recovery requires an actual modeled return/preload/conversion arrangement. A loose rope cannot push a generator on the return stroke.
- Foil propulsion and generation compete for mechanical input. Do not allocate the same extracted power twice.
- The draft takes 18% of PTO-damper dissipation as a foil budget. This is only bookkeeping, not a physical foil model. Replace with a coupled/validated foil relation or label it strictly as an assumed budget, not predicted wave-glider performance.
- A force or power estimate at imposed ground speed does not predict range or actual speed. For mobility prediction solve force balance/dynamics, account for current, and report inability to achieve commands.
- Treat assistive environmental forces and braking needs as well as resisting forces. The draft only estimates a forward thrust deficit and does not fully maintain the imposed speed.
- Station-keeping against wind/current can dominate energy demand. Do not claim free station-keeping.

### 6.7 Battery and charging

Resolve generator inflow, conversion losses, propulsion/control/communications consumption, main battery charge/discharge losses and reserve, dock draw and AUV-delivered energy. Record unmet demand and curtailed generation.

Define whether 60 kWh is nominal or usable. Include actual cell/module mass estimates and a separate auxiliary pack if modeled. Keep temperature effects and pressure-housing thermal limitations either modeled with evidence or explicitly excluded.

Dock modes: approach, capture, latched, charging, release, abort. Do not make a time-scripted docking animation look like successful simulated autonomous docking. If the vehicle is prescribed rather than dynamically controlled, say so. Gate charging by physically meaningful docking state and energy availability. A single threshold on lower vertical speed is insufficient to certify docking.

### 6.8 Storm handling and limitations

Expose normal generation, derated operation, protective shutdown and recovery. Explain chosen thresholds and whether they are assumptions. Stopping generation does not eliminate wave or structural loads. A storm animation must not imply survival when the structural/impact model is absent.

Show stroke exceedance, excessive load, slack/over-tension, insufficient energy, and invalid hydrodynamic regime. Use “outside modeled/assumed operating envelope” rather than a fabricated pass/fail safety certification.

### 6.9 Specific draft issues to resolve

- Current heave coefficients are guessed, not derived from CAD/BEM/testing.
- Submerged restoring term lacks an established physical basis.
- Equivalent viscous damping is estimated from incident motion, not iteratively solved body-relative flow.
- Horizontal drag is a post-process at imposed speed, not coupled surge dynamics.
- Static preload and buoyancy equilibrium are absent.
- Main/auxiliary battery packaging and masses are not reconciled.
- Rigid comparison is a very large spring; examine conditioning and analytic limiting behaviour.
- Storm numbers are linear extrapolations; travel exceedance is currently only warned about.
- Component diagrams show generic symbolic load paths, not engineered connectors.
- Length sweeps currently plot raw mean power even for invalid stroke cases; distinguish invalid samples.
- The default 3-minute run and 60-second length sweep are too short to establish reliable performance statistics.
- Animation currently advances 0.2 simulation seconds per roughly 0.1 wall seconds; use explicit playback speed and correct timestamps.
- UI input/change recomputation, replay, pause and reduced-motion need stronger testing.
- Observation presets do not yet replay measured event windows, support multiple stations, or model directions.
- JSON export exists, but complete uncertainty/provenance/validity metadata needs strengthening.

## 7. Four view specifications

All diagrams must have visible labelled components, an always-visible legend/key, and click/select highlighting with the same component ID across views. Labels must remain readable without hover. Use exploded/cutaway views or opacity to reveal internals. Do not hide essential mechanisms behind an opaque hull. A numbered drawing plus adjacent full names is acceptable; direct callouts are preferable where space allows.

### A. Whole-system view

Visible: hull, deckhouse, mast, PTO, connection/guide, service loop, both lower battery pods, reaction plate, dock funnel, latches, charging interface, AUV, fins/pivots, trim thruster.

Show coupled motion; electricity path; mechanical path; body positions; environment directions; operating/docking mode. Display generation, demand, battery state, achieved or explicitly imposed speed, and major validity warnings. Include force breakdown, energy ledger, trajectory only if solved, and event log. Clicking a subsystem opens its dedicated view carrying the same parameters and environment.

### B. Power-generation view

Provide a close-up/cutaway of moving member, guide, drum or linear translator, spring/preload mechanism, generator, rectifier/converter, battery bus and reaction body. Animate component motion from solver state.

Primary controls: L, connection type, PTO damping/control, travel allowance and environmental selection. Output upper/lower heave, relative position/velocity, PTO force, total connection load, mechanical/electrical power, losses, stroke usage and pressure/depth. Include a phase plot or time series and the multi-metric length sweep with invalid regions.

Explicitly show how batteries remain attached to their respective bodies while the central element moves.

### C. Underwater view

Visible: reaction frame/plate, port/starboard pressure pods, internal battery modules in cutaway, electrical distribution, connection attachment, power/data strain relief, acoustic beacon, funnel, guides, latch, charger, AUV body/contact, front/rear fins, pivots/actuators, thruster duct/rotor/mount.

Output depth/absolute pressure, heave and velocity, local orbital/current flow, drag by component, attachment force, foil/actuator loads if modeled, docking relative motion, charge power and energy. Show low-motion and high-motion docking cases with abort/disabled states. Do not animate an AUV through an undersized funnel or solid geometry. Mark scripted approach clearly if no docking dynamics solver exists.

### D. Above-water view

Visible: hull/waterplane, deckhouse, navigation mast/GNSS/radio, exposed wind areas, PTO guide/drum/bearings, generator/coupling, converter, auxiliary battery, service hatches, umbilical routing and hull-water interface.

Output wind and gust force, hull water drag, heave and PTO reaction, electrical generation and auxiliary load. Show projected area/heading effects if modeled. Expose maintenance access through a cutaway. Pitch/roll should either be solved and labeled or explicitly omitted; decorative rocking is not a predicted response.

## 8. UI, graphics and architecture

- Keep four self-contained pages linked in one navigation system, or a clearly equivalent application with four independently addressable routes. Current standalone HTML build is a good starting point.
- Preserve state across views using a versioned URL parameter schema or another local mechanism. Provide explicit reset and clear invalid inputs.
- Separate model computation from animation. Run costly simulations/sweeps in a worker if necessary; cancel stale requests during slider changes.
- Draw using Canvas/SVG/Three.js as appropriate. Detailed 3D can improve inspection, but visual polish must not delay correction of the physical mechanism. Use CAD meshes only after geometry audit and simplify them for rendering.
- Always show units, signs, date/time, data classification and playback scale.
- Controls: pause/play/replay, scrub, real-time/slow/fast, camera/view reset, component selection, sensible environment controls. Respect reduced-motion preferences.
- Keep charts synchronized with the current simulation time. Label axes and units, include readable scales, legends and selected-time values. Distinguish model-estimated outputs from limits.
- Use responsive layouts that work at 390 and 1440 px; inspect at 320 px if supported. No microscopic embedded labels or inaccessible offscreen controls.
- Keyboard access and accessible text descriptions are required. Do not announce every animation frame to screen readers.
- Add run export with parameters, observations/source identifiers, seed, coefficient provenance, model version, warnings, summary and time series. JSON is required; CSV optional.
- Each page links to human-readable model docs and data-source details.

## 9. Implementation phases and checkpoints

### Phase 1 — audit and architecture decision

Read relevant repo docs and code; inspect current CAD previews and drafted pages. List contradictions. Select a coherent baseline connection and battery arrangement. Create `cove-s/detailed/MODEL.md` with architecture, coordinates, evidence table, assumptions and limitations. Create a progress log with completed/pending tasks. Do not rewrite unrelated simulations.

Checkpoint: a reviewer can explain how PTO travel happens without being bypassed by the support structure, and where the battery remains mounted.

### Phase 2 — reproducible environment data

Improve extraction; retain source archive, hashes and timestamped windows. Add station metadata and quality checks. Define actual observed presets and clearly separate synthetic calm/extreme cases. Record measurement gaps and current assumptions.

Checkpoint: every “observed” preset maps to a source row/window, and changing a field visibly removes that classification.

### Phase 3 — shared physical core

Correct the draft issues in section 6. Establish equilibria, connection law, coupled response, drag conventions, PTO conversion and energy accounting. Introduce finite travel or validity-based suppression. Add sufficient run duration and convergence/sensitivity tools. Replace optimistic speed claims with solved motion or clearly imposed-speed load estimates.

Checkpoint: limiting cases and energy checks pass before visual outputs are advertised.

### Phase 4 — four detailed diagrams

Implement the labelled component views and cutaways with shared IDs. Update geometry and descriptions consistently. Show all relevant paths and fixed/moving attachments. Synchronize animation to solver output.

Checkpoint: component visibility and motion are reviewed in each view at normal and narrow viewport sizes.

### Phase 5 — environmental range and mode logic

Add observed event replay, storm transition/recovery, docking gating/abort, length sweeps and coefficient sensitivity. Clearly show where modeling assumptions fail.

Checkpoint: calm has no wave power; rigid lock removes this PTO's relative heave; storms retain loads even when generation is disabled; invalid stroke is not shown as deployable power.

### Phase 6 — integration and delivery

Integrate the detailed build into root `build.mjs` or document a deliberate separate command. Add navigation from the existing Cove S page and README. Rebuild all generated pages from source. Run relevant regression tests. Open the new whole-system page for the user, provide all four links and source/model documentation, and summarize the most consequential limitations.

Do not commit/push unless requested. If requested later, inspect the worktree and stage only intended changes.

## 10. Verification and acceptance tests

### Numerical and physical tests

- Zero waves → zero wave-generated power and no wave-driven motion; current/wind loads may remain.
- Zero relative velocity → zero damper mechanical power.
- Zero PTO damping → zero power for the modeled damping generator path.
- Rigid lock → relative axial motion and associated power tend to zero.
- Drag sign reverses with relative velocity; magnitude follows v² for fixed coefficient/area.
- Identical co-moving water/body velocity → zero relative-flow drag for that component.
- Longer member in uniform current → proportional distributed drag when other parameters are fixed.
- Depth decay reduces high-frequency orbit amplitudes more strongly than low-frequency swell.
- Spectrum integrates to target variance; seed reproducibility and independent-realization variability are tested.
- Added PTO damping changes motion, not only post-processed power.
- Generator ceiling and losses obey mechanical/electrical energy balance.
- Battery ledger closes within a documented absolute/relative tolerance including losses, curtailed energy and unmet load.
- Charging honors latched state, energy reserve, and survival shutdown.
- Full/empty batteries, missing data, zero wind/current, maximum allowed length, extreme waves, and invalid inputs remain finite or produce explicit errors.
- Tension/slack, stroke/contact and overload handling follow the chosen architecture.
- Timestep/solver/spectral resolution convergence is demonstrated on calm, normal and storm-screening cases.
- If statistical averages are reported, compare multiple seeds and sufficient duration; present uncertainty rather than a single exact-looking claim.

### Data tests

- Verify source hash, parse metadata and units, reject field-specific missing sentinels.
- Confirm selected preset values and timestamps against archived rows.
- No mixed-time “observed” maxima, no invented current observations, no unreported large-gap interpolation.
- Reproducible processing yields the same dataset and quality summary.

### Browser tests

For all four pages:

- Load without runtime errors and with required components/labels visible.
- Environmental input changes propagate to diagram, charts, metrics and provenance.
- Connection length and rigid/compliant controls produce consistent results across views.
- Pause freezes time and accumulated energy; scrub uses the same timeline; replay does not reuse stale state.
- Selected state transfers between views.
- Calm, moderate, observed storm and synthetic extreme presets work and show correct validity status.
- Length-sweep invalid points are flagged and not silently ranked as optimal.
- Run export round-trips into an equivalent model run.
- Mobile and desktop screenshots show readable labels, no clipped plots, no overlapping controls, and no horizontal overflow.
- Reduced-motion and keyboard operation work.
- Default run's travel-limit exceedance is visible, not hidden behind an expandable panel.

### Existing regression checks

Read current check scripts and run the appropriate existing tests after integration. At minimum run the old Cove S checks and root build if touched; run all model checks if build changes affect their outputs. Do not rerun expensive unrelated parameter sweeps merely to update a date.

Current useful commands (verify runtime availability):

```sh
python3 cove-s/detailed/prepare-data.py
node cove-s/detailed/check.mjs
node cove-s/detailed/build.mjs
node cove-s/check-cove-s.mjs
node build.mjs
git diff --check
```

Current optional headless browser smoke test:

```sh
uv run --with playwright python cove-s/detailed/browser-check.py
```

It currently assumes Chrome at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. Make browser discovery configurable if executing elsewhere. It is a smoke test, not a substitute for numerical validation or visual review.

To regenerate existing CAD only if geometry changes are actually needed:

```sh
uv run --with cadquery python cove-s/cad/cove_s_cad.py --export
```

## 11. Deliverables and definition of done

Required final artifacts:

- Four working, individually addressable, clearly labelled simulations.
- Shared documented physical model and parameter schema.
- Reproducible environmental dataset pipeline and archived provenance.
- Model/evidence documentation, architecture/load-path diagram, and known-limitations table.
- Numerical/data/browser tests and a concise validation report.
- Reviewed desktop/mobile screenshots.
- Reproducible build instructions and links in the repository's main navigation/docs.
- Exportable simulation runs with provenance and validity flags.

The task is complete when all four views are usable, the connection and battery mechanics are coherent, observed versus assumed inputs are distinguishable, water/air drag materially enter relevant calculations, calm-to-storm modes work, and numerical limits are visible. It is acceptable for the results to show that the current design is infeasible or outside its modeled envelope. It is not acceptable to hide that finding, substitute an attractive animation, or claim an unvalidated design is ocean-ready.

The final user-facing response should link the four pages and the model/validation documentation, state what was built and tested, and name the strongest remaining uncertainty in plain language.
