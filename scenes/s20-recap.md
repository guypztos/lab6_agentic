# Scene 20 — Recap

**Part 8 · Aloha today** · **Audio:** 32.5 s · **Starts at:** 7:37 · **Composition:** `S20Recap` · **Audio file:** `build/narration/s20.wav`

## Narration

> Let's recap. A Poisson process is random, independent events at a steady rate, like buses in city traffic. The chance of nothing happening for a time t is e to the minus lambda t. Aloha says, send whenever you want, and if you collide, retry at a random time. Treat all the attempts as a Poisson process, and the throughput falls right out. Pure Aloha peaks at about eighteen percent. Slotted Aloha, at about thirty-seven. Not bad, for a system where nobody is in charge.

## What the viewer must walk away with
The whole video in one card, and a smile at the end.

## Real-life layer
The recap card builds line by line, and each line has its **real-life icon** from the video on the left:
- 🚌 bus stop: Poisson
- 📻 walkie-talkie: collision, send and retry
- 🎲 die and hallway walkers: random retry
- 🛣️ highway: the curve
- 🗓️ calendar by the hour: slotted
**Closing gag:** on the final line, cut back to the **bus stop**. The yellow route-10 bus finally pulls in. The
Commuter pockets the phone and gets on. The bus drives off. Title fades in: *Nobody's in Charge*.

## Theory layer
Recap card (left: icon, right: text):
- **Poisson process:** independent arrivals at rate λ · P(none in t) = e^(−λt)
- **Aloha:** send anytime · no ACK → random wait → resend
- **Pure:** S = G·e^(−2G) · max 1/(2e) ≈ 18.4% at G = ½
- **Slotted:** S = G·e^(−G) · max 1/e ≈ 36.8% at G = 1
Behind the card, faintly: the S–G plot with both curves.

## Bridge: real life → theory
Each icon was the real-life anchor for its concept. Seeing them side by side with the formulas closes every loop
opened in the video.

## Beat sheet

| Narration cue | Visual |
|---|---|
| "Let's recap." | Card frame appears. The S–G plot fades in faintly behind it. |
| "A Poisson process is random, independent events at a steady rate, like buses in city traffic." | Line 1 with 🚌. |
| "The chance of nothing happening for a time t is e to the minus lambda t." | Formula pocket docks into line 1. |
| "Aloha says, send whenever you want, and if you collide, retry at a random time." | Line 2 with 📻 and 🎲. |
| "Treat all the attempts as a Poisson process, and the throughput falls right out." | Arrow from line 1 to lines 3–4. |
| "Pure Aloha peaks at about eighteen percent." | Line 3 with 🛣️, blue. |
| "Slotted Aloha, at about thirty-seven." | Line 4 with 🗓️, violet. |
| "Not bad, for a system where nobody is in charge." | Cut to the bus stop: the bus arrives, the Commuter boards, the bus leaves. Title *Nobody's in Charge*. |

## On-screen text (exact)
- The four recap lines above
- End title: **Nobody's in Charge**
- Optional small subtitle: *Aloha and the Poisson process*

## Handoff
- **Opens on:** the Commuter at the stop (Scene 19), cross-fading to the recap card.
- **Closes on:** the end title over the empty bus stop. Fade to black.

## Notes / pitfalls
- Keep the bus gag short (about 3 s after the last word, using the tail padding). Don't let it upstage the recap.
