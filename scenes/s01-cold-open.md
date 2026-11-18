# Scene 01 — Cold open

**Part 1 · The Poisson process** · **Audio:** 11.3 s · **Starts at:** 0:00 · **Composition:** `S01ColdOpen` · **Audio file:** `build/narration/s01.wav`

## Narration

> Random things are happening all around you. A phone buzzes. A bus pulls up. A raindrop hits the window. You can't predict the next one, yet they all follow one pattern.

## What the viewer must walk away with
Everyday events happen at unpredictable moments, but those moments share a recognisable *look*.

## Real-life layer
A wide shot of the **bus stop on a city street** at dusk with light rain. The **Commuter** stands under the shelter,
phone in hand. Across the street is a coffee-shop front, and a cell tower sits on a rooftop in the background.
Establish all of it here; later scenes reuse this set.

Three things happen, each exactly on its narration cue:
1. The Commuter's **phone buzzes**: a small vibration wiggle and a notification glow.
2. The yellow **route-10 bus pulls up** and then drives off.
3. A **raindrop hits the shelter glass** and runs down.

## Theory layer
Under the street, three thin **timelines** (one per event type, labelled with tiny icons 📱 🚌 💧) scroll left to
right like a ticker. Each time an event happens in the street, an `event`-blue dot drops from it onto its own timeline.
While the narration continues, more dots keep arriving on all three at irregular moments: clumps and gaps, never evenly spaced.

## Bridge: real life → theory
On "yet they all follow one pattern", the street **dims and slides up out of frame**. The three timelines slide
together into a stack and line up, which shows they look alike. This is the first time real life turns into dots,
so make the drop from object to dot clearly visible.

## Beat sheet

| Narration cue | Visual |
|---|---|
| "Random things are happening all around you." | Fade up on the street, slow push-in. Timelines are empty. |
| "A phone buzzes." | Phone buzz → dot drops onto the 📱 line. |
| "A bus pulls up." | Bus arrives → dot drops onto the 🚌 line. |
| "A raindrop hits the window." | Drop hits the glass → dot drops onto the 💧 line. |
| "You can't predict the next one," | Dots keep appearing at random on all three lines (simulate with exponential gaps). |
| "yet they all follow one pattern." | Street slides away. The three timelines stack and align. Hold. |

## On-screen text (exact)
- None besides the three lane icons. Let the picture breathe.

## Handoff
- **Opens on:** black → street.
- **Closes on:** three stacked timelines of irregular blue dots on `bg`. Scene 02 opens on one of these timelines.

## Notes / pitfalls
- Generate the dot times with real exponential gaps (`−ln(U)/λ`). Uniform-random looks wrong: too evenly spread.
- Keep the Commuter's design exactly as in the README. They return in ten scenes.
