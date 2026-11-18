# Scene 15 — The curve

**Part 5 · Pure Aloha** · **Audio:** 29.5 s · **Starts at:** 5:18 · **Composition:** `S15TheCurve` · **Audio file:** `build/narration/s15.wav`

## Narration

> Let's plot it. It behaves a lot like a highway. With light traffic, every packet gets through, but the channel sits mostly empty. Add traffic, and throughput rises. But push too hard, and collisions take over, like a traffic jam, and throughput sinks back toward zero. The peak is at G equals one half, where S equals one over two e. About eighteen percent. Even at its best, more than eighty percent of the channel goes to silence and collisions.

## What the viewer must walk away with
The **shape**: too little traffic wastes the channel and too much destroys it. **Peak at G = ½, S = 1/(2e) ≈ 18.4%.**

## Real-life layer
A **highway strip** runs across the top of the screen, seen from above. Its car density is tied to the G value on the plot.
- Low G: a few cars, all moving fast, lots of empty asphalt.
- Mid G: a busy, healthy flow, the most cars getting through per minute.
- High G: bumper-to-bumper, stop-and-go, almost no flow. Brake lights glow red.
A small "cars per minute through" counter on the highway rises, peaks and falls along with S.

## Theory layer
The **S–G plot** (shared component): x = **G (offered load)** from 0 to 3, y = **S (throughput)** from 0 to 0.4.
- Draw **S = G·e^(−2G)** left to right in `event` blue as a cursor sweeps G from 0 to 3.
- Under the cursor, a tiny packet-timeline strip shows the regime: sparse bars (mostly empty) → mostly green → mostly red.
- Peak marker at **(0.5, 0.184)**: dashed guides to both axes. Label **G = ½ · S = 1/(2e) ≈ 18.4%**.
- A channel-usage bar: **18% useful** in green, the rest split into "idle" (grey) and "collisions" (red).
- Optional corner note for calculus viewers: dS/dG = e^(−2G)(1 − 2G) = 0 → G = ½.

## Bridge: real life → theory
The highway and the plot are **driven by the same G value**. One cursor moves both, so the viewer sees "empty road =
left of peak" and "jam = right of peak" at the same time.

## Beat sheet

| Narration cue | Visual |
|---|---|
| "Let's plot it." | Boxed formula from Scene 14 moves to the top-left. Axes draw in. |
| "It behaves a lot like a highway." | Highway strip slides in at the top. |
| "With light traffic, every packet gets through, but the channel sits mostly empty." | Cursor at G ≈ 0.1. Few cars. Curve starts low. Mini strip mostly empty. |
| "Add traffic, and throughput rises." | Cursor sweeps toward 0.5. Cars increase. Curve rises. |
| "But push too hard, and collisions take over, like a traffic jam," | Cursor past 1 → 3. Jam, brake lights. Mini strip mostly red. |
| "and throughput sinks back toward zero." | Curve falls toward 0 at G = 3. |
| "The peak is at G equals one half, where S equals one over two e." | Cursor returns to 0.5. Peak marker and guides. |
| "About eighteen percent." | **≈ 18.4%** label pops. |
| "Even at its best, more than eighty percent…silence and collisions." | Channel-usage bar: 18% green, the rest grey and red. |

## On-screen text (exact)
- Axes: **G (offered load)**, **S (throughput)**
- Curve label: **pure Aloha · S = G·e^(−2G)**
- Peak: **G = ½ · S = 1/(2e) ≈ 18.4%**
- Usage bar: **useful 18%** · **idle** · **collisions**
- Optional: **dS/dG = e^(−2G)(1 − 2G) = 0 → G = ½**

## Handoff
- **Opens on:** boxed S = G·e^(−2G).
- **Closes on:** the S–G plot with the pure curve and the peak marker. Scene 17 adds the slotted curve onto this same
  plot, so leave room above the curve (the y axis goes to 0.4).

## Notes / pitfalls
- Exact values: at G = 0.5, S = 0.5·e^(−1) = 0.1839. At G = 3, S = 3·e^(−6) ≈ 0.0074.
- Exact time split at G = ½, for the usage bar:
  - **useful** = S ≈ **18.4%**
  - **idle** = e^(−G) ≈ **60.7%** (nobody started in the last frame time)
  - **collisions** = the rest ≈ **20.9%**

  So at the peak, most of the waste is *silence*, not collisions. That's a nice detail if there's room.
- Optional on-screen example: ALOHAnet ran at 9,600 bit/s, so at most ≈ 1,770 bit/s of it was useful.
