# Scene 03 — Why it's everywhere

**Part 1 · The Poisson process** · **Audio:** 13.1 s · **Starts at:** 0:28 · **Composition:** `S03WhyEverywhere` · **Audio file:** `build/narration/s03.wav`

## Narration

> Why is it everywhere? It's what you get when lots of people each have a small, independent chance of doing something, like heading to a bus stop. A train leaving exactly on the hour, though, isn't Poisson. It's a schedule.

## What the viewer must walk away with
**Where Poisson comes from:** many independent sources, each rarely doing something, add up to a Poisson process.
And what *isn't* Poisson: a schedule.

## Real-life layer
A top-down **neighbourhood map** around the bus stop, with about 60 houses on a grid of streets.
- Each house occasionally and randomly **lights a window**, and a tiny person walks out toward the stop.
  Each house alone is rare, roughly once in a long while.
- At the bus stop, people **arrive one by one** at irregular moments.
- Optional quick tiles (no narration; on screen only): **help-line calls**, **website clicks**, **Geiger counter**. Each one
  shows a tiny random-dot strip and a ✓. More real-life examples for the eye without adding narration time.
- Contrast: a **train platform** with a departure board "08:00 · 09:00 · 10:00" and a train leaving exactly on the hour.

## Theory layer
Under the map, **one shared timeline** for arrivals at the stop. Each person reaching the stop drops a dot. The
merged stream looks just like the Scene 01 timelines.
For the train: a timeline with **perfectly evenly spaced** dots, stamped with a red ✗.

## Bridge: real life → theory
This is the "**merge**" visual: many sparse individual streams (a faint per-house mini-timeline for a few houses)
**fold down into one busy timeline**. Scene 11 reuses this exact move with phones, so build it reusable.

## Beat sheet

| Narration cue | Visual |
|---|---|
| "Why is it everywhere?" | Camera rises from the bus stop to the top-down neighbourhood. |
| "lots of people each have a small, independent chance…" | Houses light up rarely and randomly. Show faint mini-timelines for 4–5 houses, each nearly empty. |
| "…like heading to a bus stop." | Walkers converge on the stop. The mini-timelines fold into one shared timeline, now busy. ✓ Optional tiles flash in a corner. |
| "A train leaving exactly on the hour, though," | Platform and departure board. Evenly spaced dots. |
| "isn't Poisson. It's a schedule." | Red ✗ over the even dots. Caption **schedule ≠ Poisson**. |

## On-screen text (exact)
- ✓ **people arriving at a stop**
- (optional tiles) ✓ **help-line calls** · ✓ **website clicks** · ✓ **Geiger counter**
- ✗ **schedule ≠ Poisson**

## Handoff
- **Opens on:** the bus stop from above (continuing the street set).
- **Closes on:** the Poisson timeline (✓) above the even train timeline (✗), side by side for comparison.

## Notes / pitfalls
- Each house must look rare on its own and the sum must look busy. That contrast is the whole lesson. Simulate it
  honestly: many sources, each with a tiny rate.
