# Scene 13 — The vulnerable window

**Part 5 · Pure Aloha** · **Audio:** 23.0 s · **Starts at:** 4:11 · **Composition:** `S13VulnerableWindow` · **Audio file:** `build/narration/s13.wav`

## Narration

> So when does a packet succeed? Back to the walkie-talkie. Say you talk for ten seconds. Anyone who starts while you're talking cuts you off. And anyone who started in the ten seconds before you is still talking when you begin. That's twenty seconds of danger. Packets work the same way. My packet is vulnerable for two whole frame times, and it succeeds only if nobody else starts in that window.

## What the viewer must walk away with
In pure Aloha, a packet is destroyed by any other packet that **starts within one frame time before or after it**.
The **vulnerable window is 2 frame times**.

## Real-life layer
**Talker A** with the walkie-talkie and a big **10-second speech** shown as a teal ribbon on a stopwatch track
(0 s → 10 s). **Talker B** tries different start times:
- B starts at **+6 s** (during A's talk) → B's orange ribbon overlaps A's tail → static.
- B started at **−6 s** (before A) and is still talking at 0 → B's tail overlaps A's start → static.
- B started at **−12 s** and finished at −2 s → no overlap → "Copy that" ✓.
The danger zone on the stopwatch track, **−10 s to +10 s**, shades red: **20 s of danger**.

## Theory layer
The same picture as packets on the frame-time timeline:
- **My packet** (blue bar) from t = 0 to t = 1.
- Ghost packet starting at t = 0.6 → overlaps my tail → both red.
- Ghost packet starting at t = −0.6 → overlaps my head → both red.
- Ghost packet starting at t = −1.2 → ends at −0.2 → safe ✓.
- Shade **[−1, +1]** in `collision` red at 20% opacity. Label: **vulnerable window = 2 frame times**.
- Small tick marks show "≥ 1 frame time before" and "< 1 frame time after" as the edges.

## Bridge: real life → theory
Run the walkie-talkie track **directly above** the packet timeline, with the scales aligned so that 10 s = 1 frame time.
Each walkie-talkie case and its packet twin animate **at the same moment**, and the two red danger zones line up
vertically. Then the walkie-talkie row fades and the packet row stays.

## Beat sheet

| Narration cue | Visual |
|---|---|
| "So when does a packet succeed?" | The "?" from Scene 12 floats in, then becomes a timeline with **my packet** on it. |
| "Back to the walkie-talkie. Say you talk for ten seconds." | Talker A + 10 s ribbon above the packet timeline. |
| "Anyone who starts while you're talking cuts you off." | B at +6 s → static. Packet twin at +0.6 → red. |
| "…anyone who started in the ten seconds before you is still talking…" | B at −6 s → static. Packet twin at −0.6 → red. Then B at −12 s → ✓ and twin at −1.2 → ✓. |
| "That's twenty seconds of danger." | Red zone −10 s…+10 s shades on the walkie-talkie track. |
| "Packets work the same way." | Walkie-talkie track fades. The packet track's red zone [−1, +1] shades. |
| "My packet is vulnerable for two whole frame times," | Bracket **2 frame times** over the zone. |
| "and it succeeds only if nobody else starts in that window." | All ghosts vanish. The window is empty and my packet turns green. Caption **success = no other start in the window**. |

## On-screen text (exact)
- Stopwatch labels: **0 s**, **10 s**, **−10 s … +10 s**
- **20 s of danger**
- **vulnerable window = 2 frame times**
- **success = no other start in the window**

## Handoff
- **Opens on:** "?" on P(success).
- **Closes on:** my green packet with the empty red-shaded 2-frame-time window around it. Scene 14 pulls the formula pocket over it.

## Notes / pitfalls
- The window is **2 frame times**, not 1. This is the most common student mistake. Spend the time on it.
- The window counts **start times** of other packets.
