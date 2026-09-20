← [Cove overview](../README.md) · [all model docs](../MODEL.md)

# Proposed node (sealed pendulum → generator → battery → dock → AUV)

This simulation replaces the piezo harvester with the architecture proposed for the product: a sealed horizontal cylinder with a heavy physical pendulum on a transverse shaft, a generator resisting the pendulum–hull relative rotation, a node battery, and a fixed-rate inductive dock that charges an AUV.

Equations (SI): hull pitch θ obeys I_h θ̈ + c_h θ̇ + K_h θ = M_w cos ωt + τ, with K_h = ρ g B L³/12 (waterplane stiffness), I_h from the hull mass with 25% added inertia, c_h from a damping ratio, and M_w the Froude–Krylov pitch moment of a regular wave on the waterplane. The pendulum (absolute angle ψ, inertia I_p = m r_g², COG offset l) obeys I_p ψ̈ = −m g l sin ψ − K_s ψ + base − τ − stop, where base = −m l (a_z sin ψ + a_x cos ψ) is the pseudo-force torque from the hull following the wave orbit (surge/heave amplitudes scaled by a length-averaging RAO sin(kL/2)/(kL/2)), K_s is a torsion spring chosen so the pendulum's natural period equals the wave period (negative when the gravity period is shorter; `springTuning` = 0 disables it), and stop is a stiff spring–damper beyond `stopAngle`. The shaft torque τ = (c_gen + c_friction)(ψ̇ − θ̇); electrical power = c_gen (ψ̇ − θ̇)² × drive efficiency. With `generatorDamping` = 0 the model searches c_gen for maximum mean power. Energy is accounted end to end (wave work + base work = losses + generator + stored) and verified by `check-node.mjs`; end-stop contact loosens the balance to ~1%.

Screens: pendulum hits the end-stops; hull pitch > 20°; capture width above the single-mode absorption limit λ/2π or above 2× hull length; non-repeating response. Charging is an energy budget: daily energy = electrical × 24 h × `availability` (fraction of time at this sea state, not a wave climate); the AUV session draws `dockPowerW` from the node battery for (pack × (1 − arrival SOC)) ÷ (dock power × dock efficiency) hours, and a 24 h state-of-charge timeline reports minimum, shortfall and recovery.

Not modeled: irregular seas and directional spread, mooring and station keeping, hull surge/heave dynamics beyond wave-following, generator torque and thermal limits, power electronics, storm submergence, biofouling, battery ageing, docking reliability. Defaults are sized so one small-survey AUV (4.5 kWh, arriving at 10%) is charged in 3 h at 1.5 kW and the waves refill the battery about twice a day in 1 m / 6 s seas; see [../RESULTS.md](../RESULTS.md) for the size-versus-sea-state sweep.

## Reproduce and verify

Run from this folder (or `node node/check-node.mjs` from the repo root):

    node check-node.mjs
