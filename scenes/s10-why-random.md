# Scene 10 — Why the wait must be random

**Part 3 · Aloha: the idea** · **Audio:** 19.5 s · **Starts at:** 2:53 · **Composition:** `S10WhyRandom` · **Audio file:** `build/narration/s10.wav`

## Narration

> Why random? You've probably done this in a hallway. You step left to let someone pass, and they step left too. You both step right. Again. Two terminals that wait exactly the same time after a collision would do that dance forever. But if each one picks a random delay, they'll almost certainly retry at different times.

## What the viewer must walk away with
A **fixed** retry delay makes collisions repeat forever. **Randomness breaks the symmetry.**

## Real-life layer
**The hallway dance.** An office corridor seen from above or from the side. Two people (teal and orange jackets,
same as the walkie-talkie pair) walk toward each other. Both step left. Both step right. Both step left again, with
an awkward shrug. Then one of them **pauses a beat** at random, the other steps past, and both carry on. Relief.

## Theory layer
Split screen of two packet timelines:
- **Left, "same delay":** packets A and B collide (red). Both wait exactly 1 unit and collide again, then again. It
  loops 3–4 times with a growing "∞" or "forever…" counter.
- **Right, "random delay":** they collide once. Each rolls a die, and the dice show different numbers. Their amber
  retry bars land at different times and both turn green ✓.

## Bridge: real life → theory
The dance and the timelines run **in parallel**. Each sidestep in the hallway lines up with a repeated collision on the
left timeline. When the walker pauses at random, the right timeline separates. The pause *is* the random delay.

## Beat sheet

| Narration cue | Visual |
|---|---|
| "Why random?" | "random" from rule card 3 enlarges. |
| "You've probably done this in a hallway." | Cut to the corridor. Two walkers approach. |
| "You step left…and they step left too. You both step right. Again." | The mirrored sidesteps, in rhythm. |
| "Two terminals that wait exactly the same time…that dance forever." | Left timeline: collide, fixed wait, collide, in a loop. "forever…" |
| "But if each one picks a random delay," | Hallway: one walker pauses. Right timeline: dice roll different values. |
| "they'll almost certainly retry at different times." | The walkers pass. Right timeline: two green ✓. |

## On-screen text (exact)
- Left label: **same delay**
- Right label: **random delay**
- **forever…** (left) · **✓ ✓** (right)

## Handoff
- **Opens on:** Rule 3 card from Scene 09.
- **Closes on:** the right-hand timeline with two green ✓ packets. A short sting, "**Part 4 · Building the model**",
  may go before Scene 11.

## Notes / pitfalls
- Keep the hallway light and funny. It's the most relatable moment in the video.
