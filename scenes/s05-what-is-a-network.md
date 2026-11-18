# Scene 05 — What a network is

**Part 2 · Networks from zero** · **Audio:** 28.8 s · **Starts at:** 0:57 · **Composition:** `S05WhatIsANetwork` · **Audio file:** `build/narration/s05.wav`

## Narration

> Now let's use this to solve a real problem, starting from zero. A network is just a group of devices sending messages to each other. Like a phone at that bus stop, texting a friend that the bus is late. Computers don't send a message in one piece. They chop it into small chunks, called packets, like a long letter mailed as numbered postcards. Each packet is a burst of ones and zeros, sent as a signal. Pulses of electricity in a wire, or radio waves through the air.

## What the viewer must walk away with
Three words with pictures: **network** (devices exchanging messages), **packet** (a message chunk), and **signal**
(bits carried as electricity or radio).

## Real-life layer
The **Commuter at the stop** types a text: "Bus is late again 🙄". Their phone, the cell tower on the rooftop, and far
away the friend's phone in an apartment, all joined by soft connection lines.
- **Postcards analogy:** a long handwritten letter is cut into **numbered postcards (1/4, 2/4, 3/4, 4/4)** that fly off separately.
- **Signal:** zoom into one postcard. Its writing turns into `0110 1001 …`, which becomes a **square wave** along
  a copper wire on one side of a split screen and **radio ripples** from the phone's antenna on the other.

## Theory layer
Abstract icons: phone, laptop and server nodes connected by lines → label **network**.
The text message becomes a row of numbered **packet bars**, the first appearance of the shared PacketBar component,
in `event` blue → label **packets**.

## Bridge: real life → theory
The postcards **morph into packet bars**: same numbers, same order, cards flattening into rounded bars. From here on,
packets are always these bars.

## Beat sheet

| Narration cue | Visual |
|---|---|
| "Now let's use this to solve a real problem, starting from zero." | Optional Part 2 sting, then back at the bus stop. The formula pocket stays in its corner. |
| "A network is just a group of devices sending messages…" | Phone, tower, friend's phone, laptop and server light up, joined by lines. Label **network**. |
| "Like a phone at that bus stop, texting a friend…" | Close-up on the Commuter's screen typing "Bus is late again 🙄". |
| "They chop it into small chunks, called packets," | Message splits into 4 chunks. Label **packets**. |
| "like a long letter mailed as numbered postcards." | Chunks shown as postcards 1/4…4/4 flying off, then morph into packet bars. |
| "Each packet is a burst of ones and zeros, sent as a signal." | Zoom into packet 2: `0110 1001…` → square wave. |
| "Pulses of electricity in a wire, or radio waves through the air." | Split: copper wire with pulses / phone antenna with radio ripples. |

## On-screen text (exact)
- **network** · **packets** · **signal**
- Text bubble: "Bus is late again 🙄" (emoji on screen only, it isn't spoken)

## Handoff
- **Opens on:** the bus stop (callback to Part 1).
- **Closes on:** the **radio ripples** spreading through the air. Scene 06 opens with ripples becoming walkie-talkie audio waves.

## Notes / pitfalls
- Keep the tower visible. It plays the role of the "hub" later (Scenes 08, 19).
