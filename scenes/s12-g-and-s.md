# Scene 12 — Two numbers: G and S

**Part 4 · Building the model** · **Audio:** 25.7 s · **Starts at:** 3:44 · **Composition:** `S12GAndS` · **Audio file:** `build/narration/s12.wav`

## Narration

> We'll call its rate G, the average number of attempts per frame time. G is the offered load. It's how hard everyone is pushing on the channel. What we actually care about is S, the throughput. That's how many packets per frame time actually get through. The channel can carry at most one packet per frame time, so S is also the fraction of the channel doing useful work. And S is simply G, times the chance that an attempt succeeds.

## What the viewer must walk away with
**G = attempts per frame time (offered load).** **S = successes per frame time (throughput), 0 ≤ S ≤ 1.**
**S = G × P(success).**

## Real-life layer
The **rooftop cell tower** from the bus stop, with a stadium-style **scoreboard** bolted under it:
- **TRIES / frame time:** a number ticking (e.g. 0.8)
- **DELIVERED / frame time:** a smaller number ticking (e.g. 0.3)
Down below, phones keep puffing. Each puff that arrives cleanly adds to DELIVERED, and collided puffs fizzle red.

## Theory layer
The merged channel timeline from Scene 11:
- **G:** every bar on the timeline, counted per unit of time (a bracket over 1 frame time with "attempts" tallied).
- **S:** only the bars that turn **green** (no overlap) are counted again, as "successes".
- The channel capacity line: a dashed ceiling at **1 packet per frame time**, which gives **0 ≤ S ≤ 1**.
- Equation builds: **S = G × P(success)**, with **P(success)** highlighted by a pulsing "?". It's the cliffhanger for Scene 13.

## Bridge: real life → theory
The scoreboard's two numbers **fly down** and become the labels **G** and **S** on the timeline diagram.

## Beat sheet

| Narration cue | Visual |
|---|---|
| "We'll call its rate G, the average number of attempts per frame time." | Bracket over the timeline. All bars count up. Big **G**. |
| "G is the offered load. It's how hard everyone is pushing…" | Cut to the tower scoreboard. **TRIES** ticks up. |
| "What we actually care about is S, the throughput." | **DELIVERED** ticks up, smaller. |
| "That's how many packets per frame time actually get through." | Back to the timeline. Only non-overlapping bars turn green and count. Big **S**. |
| "The channel can carry at most one packet per frame time," | Dashed ceiling line at 1. |
| "so S is also the fraction of the channel doing useful work." | A bar meter fills to S, labelled as a percentage. |
| "And S is simply G, times the chance that an attempt succeeds." | Equation writes **S = G × P(success)**. "?" pulses on P(success). |

## On-screen text (exact)
- **G = offered load** (attempts per frame time)
- **S = throughput** (successes per frame time)
- **0 ≤ S ≤ 1**
- **S = G × P(success)**

## Handoff
- **Opens on:** the merged channel timeline.
- **Closes on:** the equation with the pulsing "?" on **P(success)**. A "Part 5 · Pure Aloha" sting may go here.

## Notes / pitfalls
- G can be bigger than 1 (more than one attempt per frame time on average). S never can.
  Don't draw a ceiling for G.
