# Cove at Good Bull Pitch — October 12, 2026

**Format:** 8-minute pitch, then 4 minutes of questions (team-provided timing).

**Purpose:** present a testable business and engineering plan, not a validated offshore product.

## The focus

Lead with one proposed customer job: **repeat inspection of offshore infrastructure, starting with a pipeline corridor**. The buyer would pay for timely inspection data. Cove's proposed wave-powered charging station is the means to keep a compatible AUV operating near that job with fewer recovery trips. A paid data/inspection service is the first business-model hypothesis; charging AUVs owned by other operators is a later hypothesis that requires a proven interface and enough spare energy.

This customer, job, and willingness to pay are **not yet validated**. Do not claim a signed customer, measured vessel savings, or a price without evidence. If interviews identify a stronger first use case, change the pitch accordingly.

## Eight-minute run of show

| Time | Slide / prop | Main point |
|---|---|---|
| 0:00–0:50 | Problem | Repeated AUV recovery and redeployment can interrupt offshore inspection work. Establish this as the customer problem to investigate. |
| 0:50–1:40 | First buyer and mission | Name the proposed pipeline-inspection operator, recurring mission, and value of more frequent data. Avoid a broad claim about all AUVs. |
| 1:40–3:00 | Cove system | Show a surface energy harvester, storage, submerged dock, and one compatible AUV. Describe the mission loop: inspect, dock, recharge, upload, relaunch. |
| 3:00–4:00 | Physical display | Show the scale mockup and explain exactly what it demonstrates. Refer to the [display-model guide](display-model/README.md). |
| 4:00–5:00 | Business model | First, sell a recurring inspection/data service with Cove-operated AUVs; later, consider third-party docking once charging compatibility and capacity are measured. |
| 5:00–6:20 | Evidence and unknowns | Distinguish existing screening calculations and CAD from measured generation, autonomous docking, and offshore reliability. State the next tests. |
| 6:20–7:20 | Milestones and ask | Explain how prize funds would support an instrumented power-takeoff test, guided docking test, and customer interviews. Use an actual budget when available. |
| 7:20–8:00 | Buffer and close | Repeat the intended customer outcome and the immediate validation milestone. |

## Numeric claim discipline

The current Cove-S model is a **screening scenario**. For its assumed 3 kWh AUV arriving at 20% charge, 85% dock efficiency, and 60 W station hotel load, one visit per day needs about **2.82 kWh/day from the station for charging** plus **1.44 kWh/day for hotel loads**: about **178 W sustained average generation** before propulsion and other losses. This is a *requirement derived from assumptions*, not measured Cove output. The model's 2 kW generator ceiling is a target/rating cap, not 2 kW continuous generation.

Do not promise hundreds of missions per day, universal AUV compatibility, or a specific reduction in vessel cost. Count a "mission" only after defining its duration, battery energy, and recharge need. Energy, dock throughput, and maintenance all constrain daily mission count.

## Four-minute Q&A preparation

| Question | Short answer |
|---|---|
| How much power have you generated? | Current numbers are assumption-based models. The next test will log voltage, current, load, motion, and watt-hours over repeatable runs. |
| Why would an operator pay? | The hypothesis is that more frequent inspection data and fewer recovery operations have value. Operator interviews and a mission-specific pilot must establish the economics. |
| Can any AUV dock? | No. The first pilot needs one chosen vehicle, charging protocol, homing method, and mechanical interface. |
| Why waves instead of solar or a larger battery? | Compare a site-specific power mix. Wave energy is a candidate; actual sea-state history and net energy measurements must justify it. |
| Is this working hardware? | The pitch prop is a display mockup. It demonstrates layout or relative motion only; it does not prove wave-to-wire power, autonomous docking, or offshore survival. |

## By pitch day

1. Freeze a seven-slide deck and label every number **measured**, **derived from assumptions**, or **target**.
2. Assemble and photograph the physical display. Use one wide view, one mechanism close-up, and one scale view with a person.
3. If any electrical test succeeds, report the raw load, measurement interval, watts, and watt-hours. If it does not, show the motion/layout only.
4. Rehearse to 7:20, leaving 40 seconds of margin, then practice the five Q&A answers above.

The existing Cove-S model and concept CAD are in [`cove-s/`](../cove-s/). The display-model package below is an **earlier internal-mass illustration** and does **not** implement the current two-body Cove-S power-takeoff architecture. If the deck shows the current architecture, use the repository's Cove-S CAD renders as the primary system visual and introduce this prop only as an early motion concept.
