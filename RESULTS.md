# Simulation results

Generated 2026-09-13 by `node run.mjs`. Screening-model outputs, not measurements. Defaults from MODEL.md unless a column says otherwise.

## 1. Full product (float → water column → jet → leaf)

Defaults: tube 2 m × 35 mm, nozzle 15 mm, float 0.6 m, hull 40 kg, leaf 150 mm, load 5 MΩ. Net = AC × 0.6 × dock 0.9.

| H (m) | T (s) | AC µW | net µW | peak jet m/s | peak bend mm | strain µε | years per 1 kWh |
|---|---|---|---|---|---|---|---|
| 0.05 | 2 | 1.68 | 0.91 | 0.73 | 4.8 | 159 | 125,965 |
| 0.05 | 3 | 0.38 | 0.20 | 0.51 | 2.3 | 78 | 556,984 |
| 0.05 | 4 | 0.01 | 0.00 | 0.19 | 0.3 | 11 | 30,162,263 |
| 0.05 | 6 | 0.00 | 0.00 | 0.04 | 0.0 | 1 | 2,588,354,814 |
| 0.1 | 2 | 15.90 | 8.59 | 1.29 | 14.7 | 487 | 13,285 |
| 0.1 | 3 | 3.01 | 1.62 | 0.87 | 6.6 | 219 | 70,261 |
| 0.1 | 4 | 0.08 | 0.04 | 0.36 | 1.1 | 37 | 2,536,123 |
| 0.1 | 6 | 0.00 | 0.00 | 0.08 | 0.1 | 2 | 451,474,663 |
| 0.2 | 2 | 119.23 | 64.39 | 2.13 | 39.6 | 1313 | suppressed: Leaf bend exceeds the linear-model range. |
| 0.2 | 3 | 20.04 | 10.82 | 1.39 | 16.9 | 561 | suppressed: Leaf bend exceeds the linear-model range. |
| 0.2 | 4 | 0.94 | 0.51 | 0.66 | 3.8 | 125 | 225,749 |
| 0.2 | 6 | 0.00 | 0.00 | 0.15 | 0.2 | 8 | 57,703,824 |
| 0.3 | 2 | 350.16 | 189.09 | 2.78 | 67.0 | 2221 | suppressed: Leaf bend exceeds the linear-model range. |
| 0.3 | 3 | 56.49 | 30.50 | 1.80 | 28.2 | 933 | suppressed: Leaf bend exceeds the linear-model range. |
| 0.3 | 4 | 3.60 | 1.95 | 0.92 | 7.4 | 244 | 58,602 |
| 0.3 | 6 | 0.01 | 0.01 | 0.22 | 0.5 | 16 | 15,257,514 |

### Water-column tuning (H 0.1 m, T 3 s)

| tube length m | column natural period s | AC µW | peak jet m/s | screen |
|---|---|---|---|---|
| 1 | 2.01 | 0.14 | 0.39 | ok |
| 1.5 | 2.46 | 1.07 | 0.66 | ok |
| 2 | 2.84 | 3.01 | 0.87 | ok |
| 2.5 | 3.17 | 4.57 | 0.97 | ok |
| 3 | 3.47 | 5.04 | 0.99 | ok |
| 4 | 4.01 | 4.27 | 0.96 | ok |

## 2. Single strip (defaults)

AC power 3.47 µW · jet input 28.3 mW · conversion 0.0123% · peak bend 8.71 mm · strain 288 µε · natural 5.96 Hz · 54,824 years per 1 kWh.

## 3. Sheet (cell size × cell count)

Per-cell 150 × 20 mm strip, source jet 15 mm at 1 m/s, 6 s pulses.

| cells | shared AC µW | shared jet mW | shared yrs/kWh | indep. AC µW | indep. jet mW | indep. yrs/kWh | sheet cm² |
|---|---|---|---|---|---|---|---|
| 1 | 3.47 | 28.3 | 54,824 | 3.47 | 28.3 | 54,824 | 30 |
| 4 | 0.87 | 28.3 | 219,295 | 13.87 | 113.2 | 13,706 | 120 |
| 10 | 0.35 | 28.3 | 548,237 | 34.68 | 283.0 | 5,482 | 300 |
| 25 | 0.14 | 28.3 | 1,370,592 | 86.70 | 707.5 | 2,193 | 750 |
| 50 | 0.07 | 28.3 | 2,741,185 | 173.40 | 1415.1 | 1,096 | 1500 |
| 100 | 0.03 | 28.3 | 5,482,369 | 346.80 | 2830.2 | 548 | 3000 |
| 200 | 0.02 | 28.3 | 10,964,739 | 693.60 | 5660.4 | 274 | 6000 |

### Cell size sweep (10 cells, independent jets, load 5 MΩ)

| cell length mm | cell width mm | sheet AC µW | strain µε | natural Hz | screen |
|---|---|---|---|---|---|
| 80 | 15 | 5.93 | 208 | 14.69 | ok |
| 80 | 20 | 5.05 | 155 | 16.55 | ok |
| 80 | 40 | 2.58 | 77 | 21.43 | ok |
| 100 | 15 | 12.86 | 259 | 10.32 | ok |
| 100 | 20 | 10.43 | 194 | 11.57 | ok |
| 100 | 40 | 4.64 | 96 | 14.75 | ok |
| 150 | 15 | 47.53 | 387 | 5.38 | ok |
| 150 | 20 | 34.68 | 288 | 5.96 | ok |
| 150 | 40 | 12.26 | 143 | 7.37 | ok |
| 200 | 15 | 110.02 | 514 | 3.35 | suppressed |
| 200 | 20 | 74.49 | 383 | 3.69 | suppressed |
| 200 | 40 | 23.26 | 190 | 4.45 | ok |
| 300 | 15 | 320.98 | 771 | 1.70 | suppressed |
| 300 | 20 | 199.44 | 575 | 1.84 | suppressed |
| 300 | 40 | 55.46 | 286 | 2.15 | suppressed |

## 4. Proposed node (sealed pendulum → generator → battery → dock → AUV)

Defaults: hull 12 m × Ø2.8 m, pendulum 10000 kg on a 1.1 m arm, spring-tuned to the wave period, generator damping auto-matched, drive efficiency 0.8, availability 0.35, node battery 10 kWh, dock 1500 W at 0.9. AUV 4500 Wh arriving at 10%.

| configuration | electrical W | capture width / hull length | pendulum swing ° | kWh/day | session h | charges/day | screen |
|---|---|---|---|---|---|---|---|
| default 12 m / 10 t, H 1 m T 6 s | 994 | 0.028 | 38 | 8.35 | 3.0 | 1.86 | ok |
| default, H 0.5 m | 427 | 0.048 | 29 | 3.59 | 3.0 | 0.80 | ok |
| default, H 1.5 m T 5 s | 2804 | 0.042 | 50 | 23.55 | 3.0 | 5.23 | ok |
| default, H 2 m T 8 s | 628 | 0.003 | 37 | 5.27 | 3.0 | 1.17 | ok |
| default, H 1 m T 10 s | 161 | 0.003 | 27 | 1.35 | 3.0 | 0.30 | ok |
| 10 m / 6 t, H 1 m T 6 s | 487 | 0.017 | 37 | 4.09 | 3.0 | 0.91 | ok |
| 8 m / 3 t, H 1 m T 6 s | 191 | 0.008 | 38 | 1.60 | 3.0 | 0.36 | ok |
| 8 m / 3 t, H 1.5 m T 5 s | 580 | 0.013 | 51 | 4.87 | 3.0 | 1.08 | ok |
| 4.5 m / 0.4 t (earlier design doc), H 1 m T 6 s | 5 | 0.000 | 28 | 0.04 | 3.0 | 0.01 | ok |
| default, gravity pendulum only (no spring) | 136 | 0.004 | 5 | 1.14 | 3.0 | 0.25 | ok |

## Reading these numbers

Every configuration here lands in the microwatt range while the prescribed jets carry tens of milliwatts to watts; conversion is 10⁻⁴ to 10⁻² percent because a 0.17–0.5 Hz pulse bends a 6 Hz strip quasi-statically. Adding cells on a shared source reduces total power (per-cell force ∝ 1/N, power ∝ 1/N², N cells → 1/N). Independent jets scale linearly but the total jet input must come from the wave-to-water stage, which the full-product model shows delivers under a watt of jet power at a 0.1 m wave. Charging a 1 kWh vehicle is 10⁴–10⁶ years in every case.

The pendulum node closes the gap because it puts tonnes, not grams, in motion at wave frequency and takes the energy out with a generator at ~80% instead of a piezo at 0.01%. The size needed is set by the physics of an inertial absorber (power scales with pendulum mass × wave height² ÷ period³): roughly a 10–12 m hull with a 6–10 t spring-tuned pendulum gives one small-survey charge per day in 1 m / 6 s seas; an 8 m hull with 3 t does it at a short-period 1.5 m site. The 4.5 m / 400 kg unit in the earlier design document makes single-digit watts in the same seas and is a sensor-power node, not an AUV charger. The charge session itself (3 h at 1.5 kW) always comes from the node battery; the waves decide how many sessions per day the battery can be refilled for.
