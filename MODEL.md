# Pulsed water → piezoelectric strip

This is a reproducible, first-order **screening model**, not a validated device design, CFD simulation, or model of Panthalassa's generator. Open `strip/simulation.html` in a browser; it works offline. Press **Play cycle**, or scrub through a cycle. All controls recalculate the periodic solution.

## What is being modeled

A vertical water pulse strikes the free end of a horizontal, clamped strip. A continuous piezoelectric layer is bonded to the strip. Increasing flow bends the strip; decreasing flow allows it to relax. The piezo feeds a resistive electrical load. Mechanical and electrical responses are coupled: electrical extraction resists motion.

The strip is assumed stationary at its clamp. The upstream wave-to-water-pulse mechanism is an **input boundary**, not a solved subsystem. Pulse speed and period must eventually come from measurements or a separate hydrodynamic model. These inputs cannot establish the size of a whole wave-energy node.

## Equations

All calculations use SI units. The water speed varies smoothly from zero to its specified peak and back:

    u(t) = U [1 − cos(ωt)] / 2,      ω = 2π/T
    A = π D²/4
    F(t) = ½ ρ A u(t)²
    Pjet(t) = ½ ρ A u(t)³

The force coefficient is assumed to be 1 in the dynamic-pressure convention. It is not a measured impact coefficient. The jet strikes at the tip and fits within the strip width. Interception, splash and deflection of the jet are not explicitly resolved.

The bending shape is the normalized static tip-load shape:

    w(x,t) = φ(x) q(t),      φ(x) = (x/L)² [3 − x/L] / 2

With q as tip displacement and V as voltage across a resistor:

    m q̈ + c q̇ + k q + θ V = F(t)
    C V̇ + V/R = θ q̇

Here k = 3 EI/L³, m = (33/140) × composite beam mass + effective added mass, and c = 2ζ√(km). EI is calculated about the modulus-weighted neutral axis of the steel/piezo laminate. The stiffness added by the piezo is included.

For a fully electroded, continuous piezo layer:

    θ = |d31| Ep b (zp − zneutral) × 3/(2L)
    C = (εT − d31² Ep) bL / tp

The capacitance expression uses a one-dimensional clamped-permittivity approximation. It is not a full anisotropic material model. Peak piezo strain is estimated from the outer piezo surface's distance to the neutral axis:

    εpeak = 3 (ts + tp − zneutral) max|q| / L²

The equations have an exact periodic solution within this linear model. F(t) contains a DC term and two harmonics:

    F(t) = Fmax [3/8 − cos(ωt)/2 + cos(2ωt)/8]

Each harmonic is solved using complex mechanical/electrical impedance. The display samples this solution; it is not an invented animation. Startup transients are excluded. No numerical time-step approximation is required for the solution.

## Energy accounting

    PAC = mean(V²/R)
    mean(F q̇) = mean(c q̇²) + PAC
    Pbattery,assumed = η PAC
    charging hours = energy replaced (Wh) / Pbattery,assumed (W)

The electrical feedback term makes the mechanical/electrical energy balance consistent. The actual effect of strip loading on upstream water flow is NOT solved. The model screens out states where mechanical uptake exceeds the mean kinetic power available in the prescribed jet, but passing that screen does not validate hydraulic coupling.

The battery calculation is an illustrative energy budget. The fixed η does not model rectifier thresholds, impedance matching, cold start, charge control, leakage, battery self-discharge, or station loads. At microwatt levels, a real charger may deliver **nothing**. The resistor dissipates the simulated electrical power; battery delivery is a separate assumption, not a circuit simulation.

## Default assumptions

| Parameter | Default | Basis |
|---|---:|---|
| Free strip length / width | 150 / 20 mm | Illustrative geometry |
| Steel / piezo thickness | 0.2 / 0.2 mm | Illustrative geometry |
| Jet diameter / peak speed | 15 mm / 1 m/s | Assumed forcing, not a Panthalassa measurement |
| Pulse period | 6 s | Assumed forcing |
| Electrical load | 5 MΩ | Adjustable resistor |
| Effective added mass | 5 g | Uncalibrated modal mass including water effects |
| Damping ratio | 0.08 | Uncalibrated combined mechanical damping |
| Strain screening threshold | 500 µε | User-adjustable screen, NOT a certified fatigue limit |
| AC-to-battery fraction | 0.60 | Assumed, not validated |
| Energy replaced per charge | 1,000 Wh | Example AUV requirement, not universal |
| Water density | 1,025 kg/m³ | Assumed seawater |
| PZT material | PZT-5A, 3195HD-like | Typical manufacturer constants |
| PZT Ep / density / d31 / εrT | 67 GPa / 7,800 kg/m³ / −190 pC/N / 1,900 | Manufacturer datasheet |
| Steel E / density | 193 GPa / 8,000 kg/m³ | Manufacturer support table |

## Default result and interpretation

The default case produces approximately **3.47 µW into the resistor**, with 8.71 mm peak tip displacement, 288 µε peak strain, and a 5.96 Hz short-circuit natural frequency. The pulse frequency is 0.167 Hz: the strip largely bends and relaxes slowly rather than operating at its natural frequency. The prescribed jet carries 28.3 mW average kinetic power, so this configuration converts about 0.0123% of that input into resistor power.

At an assumed 60% downstream delivery fraction, the arithmetic yields 2.08 µW and roughly 54,800 years to replace 1 kWh. This is **not a credible battery charging prediction**: it indicates a severe mismatch between this illustrative strip and that AUV energy requirement. It is not an upper bound on all piezoelectric hydraulic converters.

Increasing pulse speed increases forcing and output in the linear model, but also increases strain and deflection. A thinner or longer strip can bend more, but may leave the model's valid region. Electrical load affects both voltage and mechanical response; high voltage alone does not mean useful power.

## Limits and sizing restrictions

The UI suppresses the charge-time estimate if any of these screening checks fail:

- Tip displacement exceeds 10% of free length: small-deflection approximation is questionable.
- Piezo strain exceeds the user-selected threshold: no fatigue or fracture model supports that state.
- Peak strip speed exceeds 20% of peak water speed: ignoring relative motion in the jet-force approximation becomes questionable.
- Mean mechanical uptake exceeds the prescribed jet's kinetic power.

These are heuristic checks, not certification. Other omitted effects include distributed impact loads, fluid added-mass variation, impacts and higher bending modes, geometric nonlinearity, electrical breakdown, dielectric loss, base acceleration, gravity/preload, bonding and waterproofing stiffness, corrosion, fatigue, irregular seas, biofouling and survival loads. A continuous PZT laminate is not equivalent to loose crystals or isolated patches; the real part geometry matters.

**Do not multiply strip output by an arbitrary count to predict a whole node.** Each strip would need its own allocated hydraulic power; strips sharing a pulse change its flow and pressure. Array spacing and total capture cannot be inferred from this model.

## What to measure next

1. Identify the actual piezo part, dimensions, capacitance and bonding arrangement. Replace the continuous-layer assumption if using patches.
2. Apply known tip forces and measure displacement to establish stiffness. Measure ring-down to fit added mass and damping.
3. Measure water speed or flow rate, tip force, displacement, voltage and load current together under repeated pulses. Compare electrical energy per pulse with this model.
4. Test a real rectifier/storage circuit and measure the increase in stored energy, subtracting leakage and electronics consumption.
5. Use those measurements to couple a water-column/pump model to the strip model before making wave-capture area or AUV-scale claims.

## Reproduce and verify

Run from the repo root:

    node strip/check.mjs

The checks exercise zero input, the differential equations, mechanical/electrical energy balance, independent time-sample averaging, force/power scaling, invalid inputs, out-of-range sizing suppression, and a period/load sweep. They verify implementation and internal consistency, not real-world accuracy. `strip/model.mjs` is the editable calculation source; the browser deliverable embeds a copy so it works offline.

JavaScript syntax and embedded-source consistency were also checked. Browser visual verification was unavailable because local-file navigation was blocked by the browser URL policy; responsive layout and live controls have not been visually verified.

## Sources

- [Piezo Systems PZT-5A/5H typical material datasheet](https://info.piezo.com/hubfs/Data-Sheets/piezo-PZT-5A_PZT-5H-material-properties.pdf): material constants; not a device performance guarantee.
- [Piezo Systems material and substrate properties](https://support.piezo.com/article/62-material-properties): steel constants and laminate context.
- [Erturk, Electromechanical Modeling of Piezoelectric Energy Harvesters, 2009](https://vtechworks.lib.vt.edu/items/11c4677d-91e2-4903-a03d-86fcf7d48fb7): coupled beam/circuit modeling framework. The geometry and prescribed-jet assumptions here are our own.
- [Panthalassa CEO interview, May 28, 2026](https://www.latitudemedia.com/news/catalyst-building-inference-data-centers-on-the-high-seas/): hydraulic pumping inspiration, not the numerical source for the pulse used here.

## Sheet model (`sheet/sheet.mjs`, `sheet/sheet-simulation.html`)

`simulateSheet` runs the strip model for one cell and multiplies by the number of cells, N, under one of two source assumptions chosen by `sharing`:

- **shared** — one source of the given nozzle diameter D and speed U is divided evenly among the cells: per-cell jet area A/N (diameter D/√N), same speed. Total jet power is conserved. Per-cell force scales as 1/N, per-cell power as 1/N², so total sheet power scales as 1/N. This is the honest case for "one pump, many crystals."
- **independent** — every cell receives its own jet of diameter D at speed U. Total power and total jet input both scale linearly with N. This is an upper bound that assumes the upstream stage can supply N jets; nothing in this model checks that it can.

Cells feed separate resistive loads and totals are sums of per-cell AC power. Cell size is set by `length` and `width` (mm); the sheet area is N × length × width. The strip model's screening checks apply per cell and suppress the charge estimate for the whole sheet when any fails. `sheetSweep` evaluates both modes over 1…N for the sweep chart. Verify with `node sheet/check-sheet.mjs`.

## Full-product model (`product/full-model.mjs`, `product/product-simulation.html`)

`simulateSystem` couples a heaving float, a vertical water column in a tube beneath it, a nozzle jet, and the strip model as the leaf. Regular waves of height H and period T force the float through a coupling factor on the hydrostatic stiffness; the column oscillates in the tube and is pushed through the nozzle with ideal one-way routing; the jet's dynamic pressure loads the leaf tip. The equations are integrated with RK4 from rest, and the reported values are from the last three of 23 wave cycles once the response repeats. Energy is accounted end to end (`product/check-full.mjs` verifies the identity and step convergence). The water column's natural period 2π√(L/g) is reported next to the wave period because the jet is strongest near that resonance.

Everything not modeled for the strip is also not modeled here, plus: mooring, irregular seas, nozzle losses beyond the ideal one-way routing, float pitch and roll, pump valves, and survival loads. Treat the output as a bound on what this architecture can deliver to a leaf, not as a design.

Build both browser pages from the sources with `node build.mjs`; run all sweeps and regenerate `RESULTS.md` with `node run.mjs`.

## Proposed node model (`node/node-model.mjs`, `node/node-simulation.html`)

The third simulation replaces the piezo harvester with the architecture proposed for the product: a sealed horizontal cylinder with a heavy physical pendulum on a transverse shaft, a generator resisting the pendulum–hull relative rotation, a node battery, and a fixed-rate inductive dock that charges an AUV.

Equations (SI): hull pitch θ obeys I_h θ̈ + c_h θ̇ + K_h θ = M_w cos ωt + τ, with K_h = ρ g B L³/12 (waterplane stiffness), I_h from the hull mass with 25% added inertia, c_h from a damping ratio, and M_w the Froude–Krylov pitch moment of a regular wave on the waterplane. The pendulum (absolute angle ψ, inertia I_p = m r_g², COG offset l) obeys I_p ψ̈ = −m g l sin ψ − K_s ψ + base − τ − stop, where base = −m l (a_z sin ψ + a_x cos ψ) is the pseudo-force torque from the hull following the wave orbit (surge/heave amplitudes scaled by a length-averaging RAO sin(kL/2)/(kL/2)), K_s is a torsion spring chosen so the pendulum's natural period equals the wave period (negative when the gravity period is shorter; `springTuning` = 0 disables it), and stop is a stiff spring–damper beyond `stopAngle`. The shaft torque τ = (c_gen + c_friction)(ψ̇ − θ̇); electrical power = c_gen (ψ̇ − θ̇)² × drive efficiency. With `generatorDamping` = 0 the model searches c_gen for maximum mean power. Energy is accounted end to end (wave work + base work = losses + generator + stored) and verified by `node/check-node.mjs`; end-stop contact loosens the balance to ~1%.

Screens: pendulum hits the end-stops; hull pitch > 20°; capture width above the single-mode absorption limit λ/2π or above 2× hull length; non-repeating response. Charging is an energy budget: daily energy = electrical × 24 h × `availability` (fraction of time at this sea state, not a wave climate); the AUV session draws `dockPowerW` from the node battery for (pack × (1 − arrival SOC)) ÷ (dock power × dock efficiency) hours, and a 24 h state-of-charge timeline reports minimum, shortfall and recovery.

Not modeled: irregular seas and directional spread, mooring and station keeping, hull surge/heave dynamics beyond wave-following, generator torque and thermal limits, power electronics, storm submergence, biofouling, battery ageing, docking reliability. Defaults are sized so one small-survey AUV (4.5 kWh, arriving at 10%) is charged in 3 h at 1.5 kW and the waves refill the battery about twice a day in 1 m / 6 s seas; see RESULTS.md for the size-versus-sea-state sweep.

## PVC pipe generator model (`tube/tube-model.mjs`, `tube/tube-simulation.html`)

`simulateTube` models the moving-magnet architecture: a sealed pipe that heaves with the wave, an axially
magnetised magnet sliding in the bore, and one or more coils wound outside it.

Equations (SI). The pipe follows the surface, z(t) = (H/2)·`heaveRao`·cos ωt, so in the pipe frame the magnet
of mass m (from magnet volume × density) sees a pseudo-force m·a·ω²·cos ωt at displacement x from mid-travel:

    m ẍ = m a ω² cos ωt + P − m g + F_mag(x) − k_spring (x − x_eq) − c ẋ − K(x)² ẋ / (R_coil + R_load)

The end magnets repel as F = C/gap⁴ (coaxial dipole far field) from each end, with C fixed by requiring that
repulsion to hold the magnet's own weight at the gap `springGap` — so the suspension is not a free parameter.
With no added spring they *are* the suspension and the magnet levitates at x_eq = `springGap` − half-travel;
with a spring the magnet is preloaded to mid-travel (P = m g, gravity cancels) and the end magnets are bumpers.

Flux linkage of one coil against magnet offset u is taken as λ_pk·exp(−u²/2σ²) with σ = √(l_magnet² + l_coil²)/2
and λ_pk = turns × `fluxLinkage` × remanence × magnet area, so the transduction K = dλ/dx is **odd and zero with
the magnet centred in the coil**, peaking one σ away. That is why a single-coil generator produces its EMF at
twice the wave frequency and nothing at maximum speed. Coils are spaced 2σ apart and wound alternately so they
add. Coil inductance is computed but the current is taken as quasi-static, K(x)ẋ/(R_coil + R_load), because L/R
is milliseconds against a multi-second wave; a screen fires if that stops being true. Load power is the
extraction times R_load/(R_coil + R_load) — coil copper loss is subtracted, not ignored. `loadResistance` = 0
searches log-spaced for the load that maximises delivered power. Energy is accounted end to end (base work =
friction + extraction + stored) and verified by `tube/check-tube.mjs`.

Screens: magnet closes within 5 mm of an end magnet; coil current density above 5 A/mm²; L/R not small against
the motion; stroke running outside a single coil's flux region; response not repeating; and the suspension
screen — a vertical spring soft enough to resonate at the wave period sags m·g/k = g/ω² under the magnet's own
weight, 8.95 m at 6 s **whatever the magnet weighs**, which is checked against the travel the pipe actually has.
That last one is the result: it is a geometric statement, not a tuning difficulty, and it is the same length as a
pendulum of that period — which is why the pendulum node reaches wave frequency inside a 12 m hull while a
straight pipe cannot.

`tilt` rotates the pipe from vertical (0°) to horizontal (90°). Because the deep-water orbit is circular, the
axial component of the forcing has the same amplitude at any tilt — only its phase changes — so tilt does not
change the drive. What it changes is the two limits. Axial gravity falls as g·cos(tilt), which shrinks the static
sag to zero and makes the suspension tunable; and the magnet's weight transfers onto the bore, adding Coulomb
friction μ·m·g·sin(tilt), regularised as μN·tanh(ẋ/10 mm/s). Friction and forcing both scale with the magnet's
mass, so the breakaway condition

    mu * g * sin(tilt) / (a * omega^2)  <  1

is a property of the sea state and the bearing alone: **no magnet is heavy enough to break its own friction
loose.** In 1 m / 6 s seas that caps μ at 0.056, which excludes a magnet sliding on plastic and requires rollers
or a radial bearing. A pipe lying along the wave also spans several phases, so the forcing is averaged over its
horizontal extent with sin(kL/2)/(kL/2).

Sizing a horizontal pipe for one 4.5 kWh AUV per day (482 W of load power at 35% availability, 1 m / 6 s seas,
μ = 0.01) lands at a 600 mm bore, 12 m of travel and an 814 kg NdFeB magnet stroking 8.2 m for 581 W — see
RESULTS.md §6. That is the same overall length as the pendulum node for a similar duty, and the distinction is
what the moving mass is made of: the node's 10 t can be steel or concrete, this magnet cannot.

Not modeled: irregular seas and directional spread, mooring, eddy-current and hysteresis loss in any steel,
bearing wear and the seal over an 8 m stroke, stick-slip below ~10 mm/s, rectification and
storage electronics, demagnetisation, seawater ingress, biofouling, end-magnet fatigue, and the buoyancy and
stability of the pipe itself. The Gaussian flux-linkage shape is a screening convenience fitted to no particular
magnet; replace it with a measured λ(x) before trusting any absolute number.
