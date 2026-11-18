# Scene 06 — Sharing a channel, and collisions

**Part 2 · Networks from zero** · **Audio:** 25.0 s · **Starts at:** 1:32 · **Composition:** `S06Collisions` · **Audio file:** `build/narration/s06.wav`

## Narration

> Here's the catch. Many devices often share one channel. Think of a walkie-talkie. Everyone is on the same frequency. If one person talks, everybody hears them clearly. But if two people talk at the same moment, their signals pile on top of each other, and all you hear is noise. In networking, that's called a collision. And in a collision, both packets are lost. Not just one. Both.

## What the viewer must walk away with
A **shared channel** means one speaker at a time. Two at once is a **collision**, and **both** messages are destroyed.

## Real-life layer
**Talker A (teal)** and **Talker B (orange)** on a building site or at a park event, each with a chunky walkie-talkie.
A third listener, a supervisor in grey, holds a walkie-talkie too. A channel dial shows **"CH 1"** on every device.
- One talks: a clean waveform ribbon travels to the listener, and a speech bubble reads clearly ("Truck's here!").
- Both talk at once: two ribbons merge into a **jagged scribble**, and the listener's speech bubble shows `#&%@!` static.
  The listener winces.

## Theory layer
A single horizontal **channel** band, a glowing strip labelled **shared channel**.
- One packet bar travels along it and arrives green → ✓.
- Two packet bars enter at overlapping times → they overlap, flash `collision` red, and **both shatter**.
  Label **COLLISION**.

## Bridge: real life → theory
The two waveform ribbons **straighten into two packet bars** on the channel band, keeping their teal and orange edge
colours for one beat before turning blue. The collision happens again on the band, abstractly.

## Beat sheet

| Narration cue | Visual |
|---|---|
| "Here's the catch. Many devices often share one channel." | Radio ripples (from 05) settle into a channel band crossing the screen. |
| "Think of a walkie-talkie. Everyone is on the same frequency." | Cut to Talkers A, B and the listener. Each dial shows "CH 1". |
| "If one person talks, everybody hears them clearly." | A talks → clean ribbon → "Truck's here!" bubble. |
| "But if two people talk at the same moment…noise." | A and B talk → ribbons tangle → static bubble. |
| "In networking, that's called a collision." | Ribbons straighten into two overlapping packet bars on the channel band. Red flash, **COLLISION**. |
| "And in a collision, both packets are lost." | Both bars shatter. |
| "Not just one. Both." | Two broken bars side by side, held still. Beat. |

## On-screen text (exact)
- **CH 1** (on the devices)
- **shared channel**
- **COLLISION**

## Handoff
- **Opens on:** radio ripples from Scene 05.
- **Closes on:** two shattered packet bars on the channel band.

## Notes / pitfalls
- Make it explicit that *both* are lost. Beginners often assume the louder or first one wins.
