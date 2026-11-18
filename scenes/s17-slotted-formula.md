# Scene 17 — Double the capacity

**Part 6 · Slotted Aloha** · **Audio:** 25.5 s · **Starts at:** 5:54 · **Composition:** `S17SlottedFormula` · **Audio file:** `build/narration/s17.wav`

## Narration

> Same formula, new window. The chance of success is now e to the minus G, so S equals G times e to the minus G. The peak moves to G equals one, where S equals one over e. About thirty-seven percent. Just by adding a clock, we doubled the capacity. And that thirty-seven percent? It's our bus stop number again. An average of one arrival in the window, and a thirty-seven percent chance of none.

## What the viewer must walk away with
**S = G·e^(−G)**, peak at **G = 1**, **S = 1/e ≈ 36.8%**, double pure Aloha. And it's literally the bus-stop number
from Scene 04.

## Real-life layer
The **37% callback**. A quick return to the **bus stop** at the moment from Scene 04: the Commuter, the 6-minute ring,
the 8 parallel-universe strips with about 3 empty, "≈ 37%" in `bus` yellow. Then a matching row of **8 slots** at
G = 1 appears beneath it, with about 3 slots holding exactly one packet (green), about 3 empty, and about 2 collided.
The two "37%" labels light up together.

## Theory layer
- **Formula pocket** flies out again: **e^(−λt)** with **λ → G**, **t → 1** → **P(success) = e^(−G)** →
  **S = G·e^(−G)**, boxed in `slotted` violet.
- On the **S–G plot** from Scene 15, add the slotted curve in violet next to the blue pure curve.
- Peak marker **(1, 0.368)**: **G = 1 · S = 1/e ≈ 36.8%**. A **×2** arrow from the blue peak (18.4%) to the violet peak.
- Optional slot-strip breakdown at G = 1: **37% empty · 37% success · 26% collision**.

## Bridge: real life → theory
The bus-stop strips (top) and the slot strips (bottom) have the **same layout, the same count and the same yellow "37%"**.
The visual rhyme *is* the explanation: an average of one arrival per window gives an e^(−1) chance of none.

## Beat sheet

| Narration cue | Visual |
|---|---|
| "Same formula, new window." | Formula pocket flies in over the slotted timeline. |
| "The chance of success is now e to the minus G," | t → 1 substitution → **P(success) = e^(−G)**. |
| "so S equals G times e to the minus G." | Boxed violet **S = G·e^(−G)**. |
| "The peak moves to G equals one, where S equals one over e." | Cut to the S–G plot. The violet curve draws. Peak marker at G = 1. |
| "About thirty-seven percent." | **≈ 36.8%** label. |
| "Just by adding a clock, we doubled the capacity." | **×2** arrow between the peaks. |
| "And that thirty-seven percent? It's our bus stop number again." | Bus-stop callback (Scene 04 freeze) slides in at the top, with yellow "37%". |
| "An average of one arrival in the window, and a thirty-seven percent chance of none." | Matching slot strip at the bottom. Both "37%" labels pulse together. |

## On-screen text (exact)
- **λ → G**, **t → 1**
- **S = G·e^(−G)** (labelled *slotted Aloha*)
- Peak: **G = 1 · S = 1/e ≈ 36.8%**
- **×2**
- Optional: **37% empty · 37% success · 26% collision**

## Handoff
- **Opens on:** the slotted timeline with a one-slot red window.
- **Closes on:** the S–G plot with **both curves** and both peak markers. Scene 18 places a ball on this plot.

## Notes / pitfalls
- Exact values at G = 1: idle e^(−1) = 0.368, success 1·e^(−1) = 0.368, collision 1 − 2/e = 0.264.
- The callback works because both are e^(−1). Don't claim the bus wait and the slot are the same *situation*, only the same math.
