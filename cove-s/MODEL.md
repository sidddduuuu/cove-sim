← [Cove overview](../README.md) · [all model docs](../MODEL.md)

# Cove S — mobile wave-powered AUV service platform

Cove S is a concept-level design for the small-AUV market: rechargeable vehicles with approximately 1.5–5 kWh battery packs. It combines a two-body wave-energy converter, direct wave-powered propulsion, a buffered electrical system, and a submerged service dock.

## Physical architecture

- An approximately 8 m low-profile surface platform carries the battery, communications, controls, and power electronics.
- Articulated surface floats move relative to a submerged reaction body. Their power takeoff generates electricity.
- Controllable foils on the submerged body convert part of the wave-induced relative motion directly into forward thrust, following the proven wave-glider principle.
- The reaction body also supports a retractable AUV garage 15–30 m below the surface, reducing dock motion.
- A small electric thruster is reserved for collision avoidance, final maneuvering, and low-wave contingencies.

This is an integration concept, not a detailed naval-architecture design. Foil loads, coupled six-degree-of-freedom motion, tether dynamics, mooring, stability, structural fatigue, and docking hydrodynamics require higher-fidelity modeling and physical testing.

## Wave power model

For significant wave height H and energy period T, deep-water wave power per metre of crest is

    J = ρ g² H² T / (64π)

Electrical power is screened with an effective capture width, a log-Gaussian response around the tuned period, power-takeoff efficiency, a propulsion allocation, and the generator rating:

    R(T) = exp[-½ (ln(T/Tuned)/bandwidth)²]
    Pelec = min(Prated, J × capture width × R × ηPTO × (1 − propulsion allocation))

The converter cuts in at H = 0.15 m and feathers above the survival-wave setting. Capture width is an effective reduced-order parameter that must eventually be replaced by a measured power matrix.

## Mobility and charging model

Wave-powered speed approaches the configured maximum as wave height rises and falls away from the tuned period. During a daily service window the platform slows to 0.2 knots so an AUV can approach the submerged garage. Optional thruster assistance follows a cubic power law in added speed.

The battery is integrated at a 0.1 h default step:

    ΔE = (Pwave − Photel − Pthruster − Pdock) Δt

New charging sessions start only when the battery contains enough energy to finish the session while retaining the protected reserve. AUV energy delivered is pack capacity × (1 − arrival SOC); station energy is divided by dock efficiency.

The four built-in sea histories are deterministic screening scenarios, not measured sites: a constant design sea, a variable offshore week, a repeating three-day calm spell, and a storm pulse that forces the WEC into survival mode.

## Default concept

| Quantity | Default |
|---|---:|
| Target AUV pack | 3 kWh |
| AUV arrival SOC | 20% |
| Visits | 1/day |
| Dock output | 1.5 kW at 85% |
| Platform battery | 60 kWh |
| Protected reserve | 20% |
| Hotel load | 60 W |
| WEC rating | 2 kW |
| Effective capture width | 0.35 m |
| PTO efficiency | 68% |
| Wave energy allocated to propulsion | 18% |
| Maximum wave-powered speed | 1.5 knots |
| Daily service window | 6 h |

## Interpretation and limits

The simulation answers whether a stated wave history, generator, and battery can support travel and scheduled charging without violating the energy reserve. It does not establish that the proposed hull, WEC, foil system, tether, or dock can achieve the assumed capture width or speed.

The next validation steps are a hydrodynamic model producing a power matrix and propulsion map, wave-tank testing, annual hindcast simulations for customer regions, structural and stability analysis, a vehicle-specific dock prototype, and biofouling/fatigue testing.

## Reproduce and verify

Run from this folder (or `node cove-s/check-cove-s.mjs` from the repo root):

    node check-cove-s.mjs

Rebuild `cove-s-simulation.html` from the repo root with `node build.mjs`.

## Concept CAD

The [`cad`](cad/) folder contains the editable parametric model, assembled and exploded STEP files, a printable STL, individual component files, and rendered previews. The CAD establishes a system envelope and component arrangement; it is not a fabrication drawing or validated hydrodynamic design.
