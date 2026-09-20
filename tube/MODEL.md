← [Cove overview](../README.md) · [all model docs](../MODEL.md)

# PVC pipe linear generator (magnet sliding through coils)

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
friction + extraction + stored) and verified by `check-tube.mjs`.

Screens: magnet closes within 5 mm of an end magnet; coil current density above 5 A/mm²; L/R not small against
the motion; stroke running outside a single coil's flux region; response not repeating; and the suspension
screen — a vertical spring soft enough to resonate at the wave period sags m·g/k = g/ω² under the magnet's own
weight, 8.95 m at 6 s **whatever the magnet weighs**, which is checked against the travel the pipe actually has.
That last one is the result: it is a geometric statement, not a tuning difficulty, and it is the same length as a
pendulum of that period — which is why the pendulum node ([../node/MODEL.md](../node/MODEL.md)) reaches wave
frequency inside a 12 m hull while a straight pipe cannot.

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
[../RESULTS.md](../RESULTS.md) §6. That is the same overall length as the pendulum node for a similar duty, and
the distinction is what the moving mass is made of: the node's 10 t can be steel or concrete, this magnet cannot.

Not modeled: irregular seas and directional spread, mooring, eddy-current and hysteresis loss in any steel,
bearing wear and the seal over an 8 m stroke, stick-slip below ~10 mm/s, rectification and
storage electronics, demagnetisation, seawater ingress, biofouling, end-magnet fatigue, and the buoyancy and
stability of the pipe itself. The Gaussian flux-linkage shape is a screening convenience fitted to no particular
magnet; replace it with a measured λ(x) before trusting any absolute number.

## Reproduce and verify

Run from this folder (or `node tube/check-tube.mjs` from the repo root):

    node check-tube.mjs
