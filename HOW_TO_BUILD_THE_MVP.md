# How to build the Cove MVP: 14-day home prototype sprint

**Deadline:** end of day 14. **Team:** three people. **Assumed effort:** 15–20 hours per person per week (90–120 team hours total). **Resources:** a small FDM 3D printer, hand tools, a dry work area and water for a supervised test. **Budget:** approximately **$500–1,500 USD** for the sprint, excluding existing tools, labor, an AUV and any pool rental. This is a planning allowance, not a supplier quote.

## What will exist on day 14

A table-sized physical demonstrator with two visible subsystems:

1. **Wave-power rig:** a 0.4–0.6 m surface float, an adjustable submerged reaction plate, a line-driven spool and spring-return power takeoff (PTO), a small DC motor used as generator, and a dry electrical load. It produces logged voltage, current, power, stroke and (if the sensor is ready) line force during repeated motion.
2. **Docking mockup:** a modular 3D-printed funnel on the submerged body and a 0.2–0.3 m passive vehicle shape. The team guides the vehicle into the dock and logs successes and jams. No motorized AUV or wet charging interface is required for this sprint.

The demo claim is **“measured wave-to-electric output plus guided dock capture.”** Charging a real AUV, continuous operation, autonomous navigation, wave propulsion, and the concept's 2 kW output are later milestones. A resistor or LED demonstration does not establish that the platform can charge an AUV. Keep the measured output in watts and watt-hours, however small.

## The fastest physical design

```
   small sealed float (plastic container + foam)      dry electronics on shore
             │                                         V/I logger → resistor
    spring → spool → brushed DC motor ───────────────────────────┘
             │       3D-printed guide + hard stops
             │ adjustable braided line (about 0.3–0.7 m)
      ┌──────┴────────┐
      │ reaction plate │— segmented 3D-printed funnel
      └───────────────┘      ← guided passive vehicle
```

Use a **brushed permanent-magnet DC motor**, which is simple to characterize as a generator. The spring keeps tension on the line for the return stroke. A bridge rectifier makes electrical polarity consistent in both directions if the spool reverses. Begin with a resistor load; add storage only after the generator's real voltage/current range is measured. The float and lower plate are replaceable so the team can test geometry changes. This small arrangement is **not a scale copy** of the [8 m concept CAD](ARCHITECTURE_AND_SCALING.md#concept-cad-and-its-limits).

The printer is most valuable for the motor bracket, spool, fairlead/line guide, travel-stop housings, segmented dock funnel, sensor mounts and passive vehicle shell. Print these as small PETG modules, with bolt holes and spare copies of loaded parts. Use a bought sealed container/foam for buoyancy and a dry box or rated enclosure for electronics. Printed shells may admit water through layer bonds, as [Blue Robotics notes](https://bluerobotics.com/learn/making-an-m200-powered-brush/); do not rely on a print as a battery or pressure housing. Keep the load path backed by metal fasteners and a tether, and inspect printed parts after every run.

**Print queue:** first print a shaft-fit test piece, a small spool (about 40–60 mm outside diameter), line guide and motor mount. After measuring the passive vehicle, print a 200–300 mm long mock body (roughly 40–60 mm diameter) and a funnel with an entry roughly twice its diameter. Split every long part into sections that fit the printer and bolt them to a simple backing plate. These are starting dimensions for an adjustable mockup; fit them to the actual motor shaft, available water depth and printer volume before printing. Aim for 4–5 walls and about 0.2 mm layers in PETG; [Blue Robotics documents similar settings for marine prototype parts](https://bluerobotics.com/learn/making-an-m200-powered-brush/). Make a spare spool and guide while the printer is free.

## Shopping list: buy or borrow on day 1

Prices below are **budget allowances** for local or quickly delivered parts. Inventory and exact motor characteristics must be checked before purchase. Buy two generator candidates or a spare because the schedule has no room for a week-long replacement. A small printer can make the custom parts; do not wait for the full CAD to be converted to printable files.

| Item | Quantity / choice | Allowance |
|---|---|---:|
| Float and submerged plate | One sealed 15–30 L plastic container or foam float; one HDPE cutting board or similar plate; ballast and stainless/nylon fasteners | $60–150 |
| PTO | Two candidate brushed DC motors (roughly 12–24 V nominal), small shaft coupler or pulley, two bearings, spool, return spring, line, hard stops and guard | $90–250 |
| 3D printing | About 1 kg PETG (or existing stock), spare nozzle, bolts/inserts; split large funnel into printable segments | $25–80 |
| Electrical | Bridge rectifier, 2–3 resistor loads with power ratings above measured dissipation, fuse, wire, terminal blocks, dry box and switch | $60–160 |
| Measurement | Multimeter, microcontroller/logger or USB meter, voltage/current sensor, ruler or video scale; optional load cell and amplifier | $90–250 |
| Dock and retrieval | Passive vehicle ballast/foam, soft bumper, guide line, retrieval tether, clamps and spare fasteners | $45–110 |
| Test setup | Tub/basin or pool access, manual wave paddle, towels, cleanup materials, transport | $35–150 |
| **Subtotal** |  | **$405–1,150** |
| **25% contingency** |  | **$101–288** |
| **Sprint total** | Rounded | **$500–1,500** |

No LiFePO4 battery is needed for the minimum demonstration. If time and measured voltage permit a charging experiment, use a matched commercial charger and protected small battery **in a dry enclosure**. Do not infer a charger's suitability from a motor's nominal voltage. A [12 V 20 Ah protected battery currently lists at $89.99](https://www.renogy.com/collections/20-70ah-batteries/products/12v-20ah-trolling-motor-lithium-iron-phosphate-battery), but it and a proper charging circuit are outside the base budget. A small [rated watertight enclosure starts at $61](https://bluerobotics.com/store/watertight-enclosures/wte-vp/) if submerged electronics become necessary; the base rig keeps electrics dry and above water.

## Daily schedule and owners

Assign one **mechanical lead (M)**, one **electrical lead (E)** and one **measurement/test lead (T)**. Everyone joins the water tests and end-of-day review. Parallel tasks in a row can happen on the same day.

| Day | M: make/assemble | E: power and sensors | T: evidence and tests | End-of-day deliverable |
|---:|---|---|---|---|
| 1 | Choose float, plate, line path and printer envelope | Select two motors, load and meter; order/buy locally | Confirm test-water access and video/log format | Parts in hand or firm pickup plan; test site booked |
| 2 | Model and print spool, motor mount and guide | Wire motor to meter and first resistor | Define stroke/speed/load settings; measure baseline meter noise | First spun-by-hand voltage/current reading |
| 3 | Assemble spring return and hard stops | Add rectifier and 2–3 loads | Record bench strokes on video with ruler in frame | PTO moves freely through safe travel |
| 4 | Strengthen mounts and add guard | Add voltage/current logger | Calibrate readings against multimeter | Logged bench power trace |
| 5 | Build float and adjustable plate | Protect connections in dry box | Weigh parts; check estimated displacement/trim | Complete dry-assembled rig |
| 6 | Bench cycle at several strokes; repair jams | Verify fuses and load temperatures | Plot energy per cycle and note uncertainty | **Gate A:** repeatable measured output; choose motor/load |
| 7 | Float and plate trim in still water | Keep generator disconnected for first immersion | Film relative motion and inspect for leaks | Stable, retrievable rig |
| 8 | Tune depth and spring tension | Connect protected dry-side load | Run first controlled-motion water test | Raw water-test power, stroke and video |
| 9 | Change one geometry variable if needed | Verify instrumentation and wiring after water exposure | Repeat still water and 2–3 motion conditions | **Gate B:** motion-to-electric result with baseline |
| 10 | Print segmented dock funnel and passive vehicle | Add optional simple dock contact indicator (no power transfer) | Plan repeatable entry paths | Dock fits and vehicle clears in air |
| 11 | Mount funnel and guides | Secure dry-side instrumentation | Ten guided entries in still water | Capture and jam log |
| 12 | Adjust funnel/ballast | Verify electrical data is still repeatable | Ten guided entries with controlled motion | **Gate C:** capture rate and failure video |
| 13 | Repair one failure; freeze configuration | Re-run electrical checks | Repeat best and worst conditions; organize raw files | Final dataset and 90-second continuous demo video |
| 14 | Inspect wear and disassemble/repack | Record final bill of materials | Write one-page results and next decision | Physical prototype, data, video, cost and revision list |

**Day-6 fallback:** if the chosen motor/PTO does not produce repeatable measured output, use the spare motor and a simpler hand-driven test linkage. Keep the day-14 deliverable as a measured generator bench rig plus the waterborne two-body/dock mockup. Label any hand-driven result as hand-driven. Do not present it as harvested wave energy.

**Water access fallback:** a bathtub can prove buoyancy, relative motion and dock clearance; its short waves and shallow depth cannot establish offshore power performance. For a wave-to-electric test, seek an outdoor pool, sheltered basin or other approved space with enough length and depth for repeatable motion. Keep large water tanks on ground-supported surfaces; water is heavy. If no such site is available by day 1, make day 14 a bench-plus-bathtub demonstrator and state that limitation on the results sheet.

## How to measure success

For every run save: date, revision, water depth, wave/imposed-motion method, plate depth, line length, float/plate mass, spring and load setting, voltage/current time series (target at least 20 samples/second), video, and any jam/leak. Electrical energy delivered to the resistor is the sum of `V × I × Δt`; report the integration interval. If claiming PTO efficiency, also measure force and relative velocity and state instrument error. A battery-powered LED or logger can be an output indicator, but its energy must be accounted for separately.

| Gate | Pass for this sprint | Decision if missed |
|---|---|---|
| A: bench PTO | Two or more repeat runs at each of three imposed stroke speeds give positive electrical energy above meter noise, with no jam or overtravel | Simplify linkage, change gearing/load or use backup motor |
| B: water power | Rig is retrievable and dry; controlled motion gives electrical energy above still-water baseline and measurement uncertainty; log stroke and peak line load if instrumented | Change plate depth, float/plate area or PTO resistance; record result even if no surplus |
| C: dock geometry | At least 8 of 10 **guided** still-water entries succeed without damage; repeat 10 in motion and report actual count | Widen entry, change vehicle buoyancy/guide path; do not claim autonomous docking |
| D: handoff | One-page data summary, raw logs, continuous video, bill of materials and open issues exist on day 14 | Record which subsystem needs the next prototype cycle |

These gates establish a demonstrator, not power output at scale or offshore reliability. The full-size model currently contains unvalidated motion and load assumptions; see the [architecture and scaling guide](ARCHITECTURE_AND_SCALING.md#validation-roadmap). The [IEC early-stage wave-converter guidance](https://tethys-engineering.pnnl.gov/publications/iec-technical-specification-62600-1032024-part-103-guidelines-early-stage-development) calls for measured PTO, motion, load, power and sea-trial evidence as development advances.

## Test-day boundaries

Use low-voltage, fused circuitry and keep mains equipment, batteries and electrical connections dry and accessible. Guard the spring, spool and pinch points; establish a retrieval line before releasing the rig. Never energize exposed underwater charging contacts. Inspect printed load-path parts, lines and stops before each run. Get permission for the water site and keep the prototype supervised. These choices preserve the 14-day schedule by avoiding failures that would consume the entire sprint.
