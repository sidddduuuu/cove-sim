# Simulation results

Generated 2026-09-18 by `node run.mjs`. Screening-model outputs, not measurements. Defaults from MODEL.md unless a column says otherwise.

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

## 5. PVC pipe linear generator (magnet sliding through coils)

Defaults: 1000 mm travel in a 50 mm bore, 40×50 mm NdFeB magnet (0.47 kg), 1×1000 turns of 0.5 mm wire, load auto-matched. "Levitation" = no spring: the end magnets hold the magnet up and set the stiffness.

| H (m) | T (s) | load power | natural period s | stroke mm | peak EMF | years per 1 kWh |
|---|---|---|---|---|---|---|
| 0.5 | 4 | 2.45 nW | 0.25 | 1.97 | 590 µV | 46,527,109 |
| 0.5 | 6 | 0.04 nW | 0.25 | 0.85 | 74 µV | 2,743,814,789 |
| 0.5 | 8 | 2.3e-12 W | 0.25 | 0.48 | 17 µV | 48,980,697,307 |
| 1 | 4 | 41.32 nW | 0.25 | 4.12 | 3 mV | 2,760,817 |
| 1 | 6 | 0.67 nW | 0.25 | 1.74 | 306 µV | 169,757,168 |
| 1 | 8 | 0.04 nW | 0.25 | 0.96 | 70 µV | 3,051,526,419 |
| 2 | 4 | 810.66 nW | 0.25 | 9.07 | 13 mV | 140,722 |
| 2 | 6 | 11.20 nW | 0.25 | 3.62 | 1 mV | 10,189,643 |
| 2 | 8 | 0.61 nW | 0.25 | 1.97 | 293 µV | 188,301,503 |

### Suspension stiffness (H 1 m, T 6 s)

The end magnets must hold the magnet up, so with no spring the suspension is stiff and the magnet rides with the pipe. Softening it toward the 6 s wave means a spring that sags at least g/ω² = 8.95 m under any mass.

| suspension | spring N/m | load power | natural period s | stroke mm | peak EMF | static sag m | screen |
|---|---|---|---|---|---|---|---|
| levitation (magnets only) | — | 0.67 nW | 0.25 | 1.74 | 306 µV | 0.00 | ok |
| 500 N/m | 500.00 | 0.10 nW | 0.19 | 1.03 | 108 µV | 0.01 | ok |
| 50 N/m | 50.00 | 972.90 nW | 0.61 | 10.43 | 11 mV | 0.09 | ok |
| 5 N/m | 5.00 | 1.94 mW | 1.93 | 91.63 | 907 mV | 0.92 | suppressed: A vertical spring this soft sags 0.9 m under |
| tuned to the wave | 0.50 | 11.41 mW | 6.00 | 611.28 | 4.1 V | 9.30 | suppressed: A vertical spring this soft sags 9.3 m under |

### Scaling the pipe (tuned suspension, H 1 m, T 6 s)

The best case this architecture can reach, ignoring that the tuned suspension above is not buildable vertically.

| pipe | magnet kg | load power | natural period s | stroke mm | peak EMF |
|---|---|---|---|---|---|
| 50 mm bore, 1 m, 1 coil | 0.5 | 11.41 mW | 6.00 | 611.28 | 4.1 V |
| 50 mm bore, 1 m, 10 coils | 0.5 | 13.40 mW | 6.00 | 560.32 | 6.9 V |
| 110 mm bore, 2 m, 10 coils | 8.8 | 1.08 W | 6.00 | 1214.84 | 68.3 V |
| 160 mm bore, 4 m, 20 coils | 39.8 | 7.43 W | 6.00 | 2087.46 | 208.3 V |

### The tuning wall

A vertical spring-mass tuned to a wave period sags g/ω² under its own weight, whatever the mass. That is the same length as a pendulum of the same period — which is why the pendulum node reaches wave frequency in a 12 m hull and a straight pipe cannot.

| wave period s | required stiffness / mass 1/s² | static sag m |
|---|---|---|
| 4 | 2.467 | 3.98 |
| 6 | 1.097 | 8.95 |
| 8 | 0.617 | 15.90 |
| 10 | 0.395 | 24.85 |
| 12 | 0.274 | 35.78 |

## 6. Horizontal pipe: sizing for one AUV charge per day

Lying the pipe flat takes gravity off the axis, so the suspension no longer has to hold the magnet up and can be tuned to the wave. The magnet then rests on the bore instead, and sliding friction replaces the sag as the limit. Both the friction force and the wave forcing scale with the magnet mass, so their ratio mu·g/(a·ω²) is a property of the sea state and the bearing alone — no magnet is heavy enough to break loose if it exceeds 1.

| wave | breakaway limit on mu (a·ω²/g) |
|---|---|
| H 0.5 m, T 6 s | 0.028 |
| H 1 m, T 6 s | 0.056 |
| H 1 m, T 4 s | 0.126 |
| H 1.5 m, T 5 s | 0.121 |
| H 2 m, T 4 s | 0.252 |
| H 2 m, T 8 s | 0.063 |

### Friction is the whole design (12 m pipe, H 1 m, T 6 s)

| bore friction mu | friction / wave forcing | load power | friction loss | stroke m | screen |
|---|---|---|---|---|---|
| 0.003 | 0.06 | 671.14 W | 60.00 W | 7.08 | ok |
| 0.01 | 0.19 | 581.33 W | 223.08 W | 8.24 | ok |
| 0.02 | 0.39 | 385.15 W | 448.07 W | 8.34 | ok |
| 0.03 | 0.58 | 149.98 W | 517.42 W | 6.57 | ok |
| 0.05 | 0.97 | 130.88 mW | 2.82 W | 0.03 | suppressed: Sliding friction is 0.97× the wave forci |
| 0.1 | 1.93 | 17.61 mW | 1.07 W | 0.01 | suppressed: Sliding friction is 1.93× the wave forci |

### How big it has to get (horizontal, tuned, mu 0.01, H 1 m / T 6 s)

One 4.5 kWh AUV arriving at 10% needs 482 W of load power at 35% availability. Every dimension scales together; coils fill the pipe and the load is chosen for maximum power among the settings whose stroke still fits the travel.

| bore | pipe m | magnet kg | coils | load power | stroke m | W per kg | charges/day |
|---|---|---|---|---|---|---|---|
| 50 mm | 1.0 | 0 | 16 | 7.95 mW | 0.43 | 0.017 | 0.00 |
| 100 mm | 2.0 | 4 | 16 | 358.79 mW | 1.34 | 0.095 | 0.00 |
| 200 mm | 4.0 | 30 | 16 | 7.01 W | 2.81 | 0.233 | 0.01 |
| 400 mm | 8.0 | 241 | 16 | 118.35 W | 5.57 | 0.491 | 0.25 |
| 500 mm | 10.0 | 471 | 16 | 286.88 W | 6.90 | 0.609 | 0.60 |
| 550 mm | 11.0 | 627 | 16 | 414.14 W | 7.55 | 0.660 | 0.86 |
| 600 mm | 12.0 | 814 | 16 | 581.33 W | 8.24 | 0.714 | 1.21 |
| 650 mm | 13.0 | 1035 | 16 | 798.66 W | 8.92 | 0.771 | 1.66 |

### The sized unit

| quantity | value |
|---|---|
| bore | 600 mm |
| pipe travel length | 12.0 m |
| magnet | 480 × 600 mm NdFeB, 814 kg |
| winding | 16 × 1500 turns of 5 mm wire |
| tuning spring | 890 N/m → 6.00 s natural period |
| stroke | 8.24 m peak to peak in 11.4 m of travel |
| load / coil resistance | 1585 Ω / 44 Ω |
| load power | 581.33 W |
| copper loss | 16.02 W |
| friction loss | 223.08 W |
| peak EMF | 1938 V |
| charges per day | 1.21 |

### The same unit across sea states

| sea state | load power | stroke m | charges/day |
|---|---|---|---|
| 0.5 m / 6 s | 140.83 W | 6.35 | 0.29 |
| 1 m / 6 s | 581.33 W | 8.24 | 1.21 |
| 1.5 m / 5 s | 1564.25 W | 9.04 | 3.24 |
| 2 m / 4 s | 3751.28 W | 9.09 | 7.78 |
| 2 m / 8 s | 534.16 W | 8.49 | 1.11 |
| 1 m / 10 s | 52.04 W | 6.36 | 0.11 |

## Reading these numbers

Every configuration here lands in the microwatt range while the prescribed jets carry tens of milliwatts to watts; conversion is 10⁻⁴ to 10⁻² percent because a 0.17–0.5 Hz pulse bends a 6 Hz strip quasi-statically. Adding cells on a shared source reduces total power (per-cell force ∝ 1/N, power ∝ 1/N², N cells → 1/N). Independent jets scale linearly but the total jet input must come from the wave-to-water stage, which the full-product model shows delivers under a watt of jet power at a 0.1 m wave. Charging a 1 kWh vehicle is 10⁴–10⁶ years in every case.

The pendulum node closes the gap because it puts tonnes, not grams, in motion at wave frequency and takes the energy out with a generator at ~80% instead of a piezo at 0.01%. The size needed is set by the physics of an inertial absorber (power scales with pendulum mass × wave height² ÷ period³): roughly a 10–12 m hull with a 6–10 t spring-tuned pendulum gives one small-survey charge per day in 1 m / 6 s seas; an 8 m hull with 3 t does it at a short-period 1.5 m site. The 4.5 m / 400 kg unit in the earlier design document makes single-digit watts in the same seas and is a sensor-power node, not an AUV charger. The charge session itself (3 h at 1.5 kW) always comes from the node battery; the waves decide how many sessions per day the battery can be refilled for.

The PVC pipe generator removes the piezo conversion penalty — a coil and a magnet are an efficient transducer — and still lands in the nanowatt range as built, for a different reason: the suspension. Repelling end magnets strong enough to hold the magnet up are stiff (0.25 s natural period against a 6 s wave), so the magnet rides with the pipe instead of lagging it, and the relative stroke is under 2 mm. Softening the suspension to wave frequency is not a tuning choice but a geometry problem: a vertical spring-mass at 6 s sags 8.95 m under its own weight regardless of mass, more travel than the pipe has. Even granting the impossible spring, a 4 m pipe with a 40 kg magnet and 20 coils reaches single-digit watts. A pendulum escapes this because its restoring torque comes from gravity itself and a torsion spring adds stiffness without having to carry the weight, which is why the same 8.95 m appears as a hull dimension rather than a spring deflection.

Laid flat the pipe escapes the sag and buys a friction problem instead: the magnet rests on the bore, and it only breaks loose if the bearing keeps mu below a·ω²/g — 0.056 in 1 m / 6 s seas, which rules out a magnet sliding on plastic and demands rollers or a radial bearing. Granted mu = 0.01, one AUV charge per day needs a 12 m pipe of 600 mm bore holding an 814 kg NdFeB magnet that strokes 8.2 m, for 581 W. That is the same 12 m length as the pendulum node for a similar duty, but the node makes its moving mass out of whatever is heavy and cheap, while here the moving mass has to be the magnet itself — roughly fifty thousand dollars of neodymium, plus an 8 m sliding seal, against a 10 t block of steel or concrete on a shaft.
