← [Cove overview](../README.md) · [all model docs](../MODEL.md)

# Pulsed water → piezoelectric strip

This is a reproducible, first-order **screening model**, not a validated device design, CFD simulation, or model of Panthalassa's generator. Open `simulation.html` in a browser; it works offline. Press **Play cycle**, or scrub through a cycle. All controls recalculate the periodic solution.

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

**Do not multiply strip output by an arbitrary count to predict a whole node.** Each strip would need its own allocated hydraulic power; strips sharing a pulse change its flow and pressure. Array spacing and total capture cannot be inferred from this model. See [../sheet/MODEL.md](../sheet/MODEL.md) for the multi-cell sheet model, which handles this properly.

## What to measure next

1. Identify the actual piezo part, dimensions, capacitance and bonding arrangement. Replace the continuous-layer assumption if using patches.
2. Apply known tip forces and measure displacement to establish stiffness. Measure ring-down to fit added mass and damping.
3. Measure water speed or flow rate, tip force, displacement, voltage and load current together under repeated pulses. Compare electrical energy per pulse with this model.
4. Test a real rectifier/storage circuit and measure the increase in stored energy, subtracting leakage and electronics consumption.
5. Use those measurements to couple a water-column/pump model to the strip model before making wave-capture area or AUV-scale claims.

## Reproduce and verify

Run from this folder (or `node strip/check.mjs` from the repo root):

    node check.mjs

The checks exercise zero input, the differential equations, mechanical/electrical energy balance, independent time-sample averaging, force/power scaling, invalid inputs, out-of-range sizing suppression, and a period/load sweep. They verify implementation and internal consistency, not real-world accuracy. `model.mjs` is the editable calculation source; the browser deliverable embeds a copy so it works offline.

JavaScript syntax and embedded-source consistency were also checked. Browser visual verification was unavailable because local-file navigation was blocked by the browser URL policy; responsive layout and live controls have not been visually verified.

## Sources

- [Piezo Systems PZT-5A/5H typical material datasheet](https://info.piezo.com/hubfs/Data-Sheets/piezo-PZT-5A_PZT-5H-material-properties.pdf): material constants; not a device performance guarantee.
- [Piezo Systems material and substrate properties](https://support.piezo.com/article/62-material-properties): steel constants and laminate context.
- [Erturk, Electromechanical Modeling of Piezoelectric Energy Harvesters, 2009](https://vtechworks.lib.vt.edu/items/11c4677d-91e2-4903-a03d-86fcf7d48fb7): coupled beam/circuit modeling framework. The geometry and prescribed-jet assumptions here are our own.
- [Panthalassa CEO interview, May 28, 2026](https://www.latitudemedia.com/news/catalyst-building-inference-data-centers-on-the-high-seas/): hydraulic pumping inspiration, not the numerical source for the pulse used here.
