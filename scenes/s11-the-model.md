# Scene 11 — Turning it into math

**Part 4 · Building the model** · **Audio:** 32.0 s · **Starts at:** 3:23 · **Composition:** `S11TheModel` · **Audio file:** `build/narration/s11.wav`

## Narration

> So, how well does this actually work? Let's build a model. First, assume every packet takes the same time to send. We'll call that one frame time, and use it as our unit of time. Second, count every attempt to transmit, new packets and retries alike. With many terminals, each sending only once in a while, what do all those attempts look like? It's the recipe from the start. Lots of rare, independent events. A Poisson process, just like the bus stop. It's an approximation, but a good one.

## What the viewer must walk away with
The two modelling assumptions: (1) **fixed packet length = 1 frame time**, and (2) **all attempts together form a
Poisson process**, and *why*, linking back to Part 1.

## Real-life layer
**The bus stop crowd again** (from Scene 07). Everyone's phone sends a message now and then, including the
Commuter's "Bus is late again 🙄" from Scene 05. Each phone emits a little radio puff toward the rooftop tower at
random, rare moments. Some puffs are new messages (blue) and some are retries (amber).

## Theory layer
- **Assumption 1:** a single packet bar on a timeline, with its width bracketed and labelled **1 frame time**. The
  axis ticks re-label into frame-time units: 0, 1, 2, 3…
- **Assumption 2:** one thin row per phone (≈ 8 rows), each with sparse packet bars (blue new, amber retry). All rows
  **fold down** onto one shared channel timeline, which is now busy.
- Callback: the Scene 03 neighbourhood merge appears as a small inset picture-in-picture, with the same fold-down
  motion. Caption **Poisson process!**
- Footnote at the bottom: *assumption: many users, randomised retries*.

## Bridge: real life → theory
Each phone in the crowd **becomes its row** (person fades, row stays). The rows fold together exactly like the houses did
in Scene 03. Reuse that animation component so the viewer *sees* it's the same thing.

## Beat sheet

| Narration cue | Visual |
|---|---|
| "So, how well does this actually work? Let's build a model." | Hub ring dims. A "model" blueprint grid fades in behind it. |
| "First, assume every packet takes the same time to send." | One packet bar on a timeline. Its width is bracketed. |
| "We'll call that one frame time, and use it as our unit of time." | Label **1 frame time**. The axis re-ticks to 0, 1, 2, 3. |
| "Second, count every attempt…new packets and retries alike." | Cut to the bus stop crowd. Phones puff blue and amber at random. |
| "With many terminals, each sending only once in a while," | People fade to rows. Each row is sparse. |
| "what do all those attempts look like?" | A beat of anticipation. The rows hover. |
| "It's the recipe from the start. Lots of rare, independent events." | Rows fold onto one timeline. Scene 03 inset plays the same fold. |
| "A Poisson process, just like the bus stop." | Caption **Poisson process!**, with a tiny bus icon flashing in `bus` yellow. |
| "It's an approximation, but a good one." | Footnote fades in at the bottom. |

## On-screen text (exact)
- **1 frame time**
- Legend: **new** (blue) · **retry** (amber)
- **all attempts = Poisson process**
- Footnote: *assumption: many users, randomised retries*

## Handoff
- **Opens on:** the green ✓ timeline from Scene 10 or the Part 4 sting.
- **Closes on:** the **single merged channel timeline** of packet bars. Scene 12 labels it with G.

## Notes / pitfalls
- Packet bars must be **exactly 1 frame time wide** on whatever scale you draw. Scenes 13–17 depend on that geometry.
