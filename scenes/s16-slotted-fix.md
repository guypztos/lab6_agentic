# Scene 16 — The fix: add a clock

**Part 6 · Slotted Aloha** · **Audio:** 24.4 s · **Starts at:** 5:48 · **Composition:** `S16SlottedFix` · **Audio file:** `build/narration/s16.wav`

## Narration

> A year later, Larry Roberts found a simple fix. Add a clock. Split time into slots, each one frame long, and let packets start only at the beginning of a slot. It's like a meeting room you can only book by the hour. Either two people pick the same hour, or they never clash at all. No more half overlaps. The vulnerable window shrinks from two frame times to just one.

## What the viewer must walk away with
**Slotted Aloha:** starts are aligned to slot boundaries, so overlaps are all-or-nothing and the **vulnerable window is 1 frame time**.

## Real-life layer
A **meeting-room booking calendar** (a day view, 9:00–17:00), first in "any minute" mode, then in "on the hour" mode:
- **Any-minute mode:** bookings at 10:20–11:20 and 10:50–11:50 partly overlap, so both meetings are ruined
  (two groups in one room, chaos icon). Bookings sit at odd offsets, and partial overlaps are everywhere.
- **On-the-hour mode:** the calendar snaps to hour rows. Two bookings either land in the **same hour** (double-booked,
  red) or in different hours (no clash at all). Half overlaps are impossible.

## Theory layer
The packet timeline from Scene 13:
- **Slot boundaries** appear as `slotted` violet vertical ticks every 1 frame time.
- Floating packet bars **snap** left to the nearest slot start.
- Re-run Scene 13's danger zone: the red shading **shrinks from [−1, +1] to just this one slot [0, 1]**.
- Label: **vulnerable window = 1 frame time** (was 2). Caption: *Slotted Aloha · L. Roberts, 1972*.

## Bridge: real life → theory
The calendar's hour rows **rotate 90° into the slot grid** of the packet timeline. The snapping of bookings to hours
and the snapping of packets to slots use the same easing and happen in the same beat.

## Beat sheet

| Narration cue | Visual |
|---|---|
| "A year later, Larry Roberts found a simple fix. Add a clock." | A ticking clock icon. Caption *L. Roberts, 1972*. |
| "Split time into slots, each one frame long," | Violet slot ticks draw across the packet timeline. |
| "and let packets start only at the beginning of a slot." | Floating packets snap to slot starts. |
| "It's like a meeting room you can only book by the hour." | Cut to the calendar in any-minute mode: messy partial overlaps. Then it snaps to hour mode. |
| "Either two people pick the same hour, or they never clash at all." | Same-hour double-booking turns red. Other bookings sit cleanly in separate rows. |
| "No more half overlaps." | Calendar rows rotate into the slot grid. The partial-overlap example from Scene 13 is crossed out. |
| "The vulnerable window shrinks from two frame times to just one." | Red zone animates from [−1, +1] down to [0, 1]. Label **2 → 1**. |

## On-screen text (exact)
- *Slotted Aloha · L. Roberts, 1972*
- Calendar modes: **book any minute** → **book by the hour**
- **no half overlaps**
- **vulnerable window: 2 → 1 frame time**

## Handoff
- **Opens on:** the S–G plot from Scene 15 dimming, then the packet timeline from Scene 13 returning.
- **Closes on:** the slotted timeline with a one-slot red window. Scene 17 pulls the formula pocket over it.

## Notes / pitfalls
- Packets in the **same** slot still collide completely. Show at least one same-slot collision so slotting doesn't look like magic.
