# Scene 04 — The one formula

**Part 1 · The Poisson process** · **Audio:** 14.2 s · **Starts at:** 0:46 · **Composition:** `S04OneFormula` · **Audio file:** `build/narration/s04.wav`

## Narration

> Here's the one formula to keep. The chance that nothing happens for a time t is e to the minus lambda t. With ten buses an hour, the chance you wait over six minutes is about thirty-seven percent. Everything builds on this.

## What the viewer must walk away with
**P(nothing happens in time t) = e^(−λt)**, made concrete: with 10 buses/hour, P(wait > 6 min) ≈ 37%.
This scene ends the "first minute". The viewer now knows what a Poisson process is and has one usable number.

## Real-life layer
The **Commuter at the stop** looks down the road. A **6-minute countdown** ring appears next to them: "Will a bus come
in the next 6 minutes?" We play the next 6 minutes several times as quick "parallel universes" (ghosted copies of
the street, about 8 of them in a grid). In roughly 3 of the 8, no bus comes and the Commuter sighs. In the rest, a bus arrives.

## Theory layer
A **sliding window** of width *t* moves along a Poisson timeline. It glows `success` green when it contains no
dots and `muted` when it contains dots. A tally of "empty windows" converges to about 37%.
Then the formula, large and centred:

**P(no events in time t) = e^(−λt)**

The worked example builds underneath:
λ = 10 / hour, t = 6 min = 0.1 hour → λt = 1 → e^(−1) ≈ **0.37**

## Bridge: real life → theory
The 8 "parallel universe" streets **collapse into 8 short timeline strips**, each the 6-minute window. The empty ones
light up. Then the strips stack into the single sliding-window animation.

## Beat sheet

| Narration cue | Visual |
|---|---|
| "Here's the one formula to keep." | Background clears to `bg`. A blank formula card fades in. |
| "The chance that nothing happens for a time t…" | Sliding window of width *t* on a dot timeline. Empty windows glow green. |
| "…is e to the minus lambda t." | Formula writes on: **P(no events in t) = e^(−λt)**. |
| "With ten buses an hour," | Cut back to the Commuter. The 6-minute ring appears. The grid of 8 ghost-universes plays. |
| "…wait over six minutes is about thirty-seven percent." | Universes collapse to strips, ~3 of 8 empty, glowing. The worked example resolves to **≈ 37%** in `bus` yellow. |
| "Everything builds on this." | The formula card shrinks into the top-right corner: the **formula pocket**. |

## On-screen text (exact)
- **P(no events in time t) = e^(−λt)**
- **λ = 10 / hour · t = 6 min → λt = 1**
- **e^(−1) ≈ 37%**

## Handoff
- **Opens on:** `bg` with the stacked timelines from Scene 03 fading out.
- **Closes on:** the **formula pocket** in the top-right corner. It must be the exact card design reused in Scenes 14 and 17.
  This is the end of Part 1. A short title sting, "**Part 2 · Networks from zero**", may go between 04 and 05.

## Notes / pitfalls
- 37% = e^(−1) = 0.3679. Write "≈ 37%" on screen, not "37%".
- The **37% / bus** pairing is a callback anchor for Scenes 14 and 17. Use the `bus` yellow highlight so it's recognisable later.
