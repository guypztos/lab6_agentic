# Scene 18 — The collapse spiral, and backing off

**Part 7 · When it breaks** · **Audio:** 29.7 s · **Starts at:** 6:20 · **Composition:** `S18CollapseAndBackoff` · **Audio file:** `build/narration/s18.wav`

## Narration

> There's one more danger. Past the peak, things get worse on their own. Think of midnight on New Year's Eve, when everyone texts at once and messages keep failing. More collisions mean more retries. More retries mean more load, and even more collisions. The channel can spiral into a jam where almost nothing gets through. The cure is to back off. When you keep colliding, wait longer before trying again. Ethernet, for example, picks its random wait from a range that doubles after every collision.

## What the viewer must walk away with
Aloha is **unstable** past the peak: retries feed load, which feeds collisions. **Backoff**, waiting longer after
repeated collisions, pulls it back.

## Real-life layer
**New Year's Eve, midnight**: a city square full of people, fireworks overhead, a big clock hitting **00:00**.
Everyone lifts a phone. Message bubbles "Happy New Year! 🎉" fly up, and many of them get a red **"Not delivered ·
Retry"** label. Phones auto-retry and *more* bubbles fly up, then more red labels. A rising **"messages in the air"**
counter climbs while a **"delivered"** counter drops.
For backoff: one person's phone shows a "retrying in 1s… 2s… 4s… 8s" countdown, and the square calms down.

## Theory layer
- On the **S–G plot**, a **ball** sits just right of the slotted peak. A nudge sends it **rolling down the right
  slope** toward S ≈ 0.
- A **feedback-loop** diagram, three arrows in a circle: **collisions → retries → more load → collisions**.
- **Binary exponential backoff**: a horizontal "random wait range" bar that doubles after each collision:
  **1 → 2 → 4 → 8 slots**, with a die landing somewhere inside each range.
- The ball **rolls back up** toward the peak as backoff kicks in.

## Bridge: real life → theory
The square's two counters ("messages in the air" and "delivered") **are** G and S. They slide down to become the ball's
x and y coordinates on the plot. When backoff starts in the square, the ball reverses.

## Beat sheet

| Narration cue | Visual |
|---|---|
| "There's one more danger. Past the peak, things get worse on their own." | Plot with both curves. Ball just right of the peak, wobbling. |
| "Think of midnight on New Year's Eve…messages keep failing." | Cut to the square, 00:00, fireworks. Bubbles fly up and red "Not delivered" labels appear. |
| "More collisions mean more retries." | Loop diagram, arrow 1. Square: auto-retry bubbles. |
| "More retries mean more load, and even more collisions." | Arrows 2 and 3 complete the loop. Counters diverge. |
| "The channel can spiral into a jam where almost nothing gets through." | Ball rolls down the right slope to near zero. |
| "The cure is to back off." | Ball stops. A "back off" stamp. |
| "When you keep colliding, wait longer before trying again." | Phone countdown "retrying in 1s… 2s… 4s…". |
| "Ethernet…picks its random wait from a range that doubles after every collision." | Range bar 1 → 2 → 4 → 8 with a die in each. Ball rolls back toward the peak. |

## On-screen text (exact)
- **00:00** · "Happy New Year! 🎉" · **Not delivered · Retry**
- Loop: **collisions → retries → more load**
- **back off**
- **random wait range: 1 → 2 → 4 → 8**
- Caption: *Ethernet: binary exponential backoff*

## Handoff
- **Opens on:** the S–G plot with both curves (from Scene 17).
- **Closes on:** the ball resting near the peak. A short sting, "**Part 8 · Aloha today**", may go here.

## Notes / pitfalls
- The New Year's Eve scene is an *analogy* for overload ("Think of…"). Don't caption it as "this is Aloha".
- Ethernet's backoff picks a random wait from a range that doubles per collision. The wait itself is random, not
  simply doubled. Show the *range* growing, with a die inside it.
