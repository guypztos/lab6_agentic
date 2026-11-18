# Scene 14 — Applying the formula

**Part 5 · Pure Aloha** · **Audio:** 25.5 s · **Starts at:** 4:34 · **Composition:** `S14PureFormula` · **Audio file:** `build/narration/s14.wav`

## Narration

> And this is the bus stop question again. Before, we asked for the chance of no bus for six minutes. Now we want the chance of no other packet for two frame times. Same formula, e to the minus lambda t. Here the rate is G, and the time is two. So the chance of success is e to the minus two G. Multiply by G, and we get the throughput of pure Aloha. S equals G times e to the minus two G.

## What the viewer must walk away with
The payoff of Part 1: **"no packet in the window" is the same question as "no bus for six minutes"**.
So P(success) = e^(−2G) and **S = G·e^(−2G)**.

## Real-life layer
A **split screen**, top and bottom:
- **Top:** the **bus stop** timeline from Scene 04. The Commuter with the 6-minute window, buses as yellow dots, the window empty.
- **Bottom:** the **packet timeline** from Scene 13 with the 2-frame-time window, other packets as blue dots, the window empty.
The two windows glow at the same moment.

## Theory layer
The **formula pocket** (top-right since Scene 04) **flies to centre**, the same card design: **e^(−λt)**.
Substitution animation, each symbol sliding out and its replacement sliding in:
- **λ → G** (rate: buses per hour → attempts per frame time)
- **t → 2** (window: 6 minutes → 2 frame times)
- **P(success) = e^(−2G)**
Then it drops into the Scene 12 equation: S = G × P(success) → **S = G·e^(−2G)**, boxed.

## Bridge: real life → theory
The top and bottom rows are deliberately built from the **same Timeline component**, with only colours and labels
changed (bus yellow vs event blue). As the narration says "Same formula", the two rows' labels cross-fade:
"buses/hour" ↔ "G", "6 min" ↔ "2 frame times".

## Beat sheet

| Narration cue | Visual |
|---|---|
| "And this is the bus stop question again." | Split screen. The top bus stop timeline returns (Scene 04 look). |
| "Before, we asked for the chance of no bus for six minutes." | Top: 6-minute window glows empty. "≈ 37%" ghost label. |
| "Now we want the chance of no other packet for two frame times." | Bottom: 2-frame-time window glows empty. |
| "Same formula, e to the minus lambda t." | Formula pocket flies to centre: **e^(−λt)**. |
| "Here the rate is G, and the time is two." | λ → G, t → 2 substitution. Labels cross-fade between the rows. |
| "So the chance of success is e to the minus two G." | **P(success) = e^(−2G)**. |
| "Multiply by G, and we get the throughput of pure Aloha." | Slides into S = G × P(success). |
| "S equals G times e to the minus two G." | Boxed **S = G·e^(−2G)**. Hold. |

## On-screen text (exact)
- Top row: **no bus for 6 min**. Bottom row: **no packet for 2 frame times**
- **e^(−λt)** → **λ → G**, **t → 2**
- **P(success) = e^(−2G)**
- **S = G·e^(−2G)** (boxed, labelled *pure Aloha*)

## Handoff
- **Opens on:** my green packet in its empty window (Scene 13).
- **Closes on:** boxed **S = G·e^(−2G)**. Scene 15 uses it to draw the curve.

## Notes / pitfalls
- The formula pocket must look identical to Scene 04's. If a shared component exists, use it.
