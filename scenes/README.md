# Scenes: shared brief for every scene agent

The video is split into **20 self-contained scenes**. Each `sNN-*.md` file holds everything one agent needs:
narration, what the scene must teach, the real-life picture, the theory diagram, how one turns into the other,
a beat sheet, exact on-screen text, and the frames it hands off to its neighbours.

**Read this file first, then only your scene file.** The full read-through is in [`../SCRIPT.md`](../SCRIPT.md).
Scene files are canonical. If narration changes, change the scene file and mirror it in `SCRIPT.md`.

## The idea that ties it together

Every abstract idea is introduced through **something the viewer has lived through**, and then that real-life
picture **morphs into the diagram**. The anchor is one **bus stop on a city street**, with one recurring character,
**the Commuter**. We meet them waiting for a bus (Poisson). Their phone sends a text (networks). That phone, it
turns out, has been doing Aloha all along (Scene 19). The bus finally arrives at the very end (Scene 20).

## Scene index

Durations are measured from Kokoro `af_heart` narration, generated in chunks of whole sentences. The scene's length should follow its
generated audio plus the padding below.

Total runtime ≈ 8:10.

| # | File | Part | Real-life anchor | Theory payload | Audio |
|---|---|---|---|---|---|
| 01 | [s01-cold-open](s01-cold-open.md) | 1 Poisson | Street with bus stop: phone, bus, raindrop | Random events on timelines | 11.3 s |
| 02 | [s02-three-rules](s02-three-rules.md) | 1 Poisson | Commuter waiting, checking watch | Rate λ, independence (no memory), one at a time | 18.3 s |
| 03 | [s03-why-everywhere](s03-why-everywhere.md) | 1 Poisson | Neighbourhood → people heading to the stop; train timetable | Many rare independent events → Poisson | 14.0 s |
| 04 | [s04-one-formula](s04-one-formula.md) | 1 Poisson | "Will I wait over 6 minutes?" | P(none in t) = e^(−λt) → 37% | 14.2 s |
| 05 | [s05-what-is-a-network](s05-what-is-a-network.md) | 2 Networks | Commuter texts "bus is late" | Devices, packets, bits as signals | 30.9 s |
| 06 | [s06-collisions](s06-collisions.md) | 2 Networks | Two people on walkie-talkies | Shared channel, collision kills both | 25.0 s |
| 07 | [s07-the-question](s07-the-question.md) | 2 Networks | Crowded stop, everyone on a phone | The problem statement | 9.5 s |
| 08 | [s08-hawaii-1971](s08-hawaii-1971.md) | 3 Aloha | Hawaiian islands, 1971 radio terminals | Many terminals → one hub | 24.5 s |
| 09 | [s09-the-rules](s09-the-rules.md) | 3 Aloha | Walkie-talkie "Copy that" | Send now, ACK, random retry | 28.2 s |
| 10 | [s10-why-random](s10-why-random.md) | 3 Aloha | The hallway dance | Fixed delay = endless collisions | 19.8 s |
| 11 | [s11-the-model](s11-the-model.md) | 4 Model | Phones at the bus stop | Frame time, attempts = Poisson | 32.0 s |
| 12 | [s12-g-and-s](s12-g-and-s.md) | 4 Model | Tower scoreboard: tries vs delivered | G (offered load), S (throughput) | 28.0 s |
| 13 | [s13-vulnerable-window](s13-vulnerable-window.md) | 5 Pure | 10-second walkie-talkie message | Vulnerable window = 2 frame times | 24.2 s |
| 14 | [s14-pure-formula](s14-pure-formula.md) | 5 Pure | Bus stop timeline → packet timeline | S = G·e^(−2G) | 27.4 s |
| 15 | [s15-the-curve](s15-the-curve.md) | 5 Pure | Highway from empty to jammed | Curve, peak 1/(2e) ≈ 18.4% | 29.5 s |
| 16 | [s16-slotted-fix](s16-slotted-fix.md) | 6 Slotted | Meeting room booked by the hour | Slots, window shrinks to 1 | 24.4 s |
| 17 | [s17-slotted-formula](s17-slotted-formula.md) | 6 Slotted | Bus stop "37%" callback | S = G·e^(−G), peak 1/e ≈ 36.8% | 27.4 s |
| 18 | [s18-collapse-and-backoff](s18-collapse-and-backoff.md) | 7 Breaks | New Year's Eve midnight texts | Instability, exponential backoff | 31.7 s |
| 19 | [s19-legacy](s19-legacy.md) | 8 Legacy | Commuter's phone → cell tower | Ethernet, Wi-Fi, cellular, RFID | 22.1 s |
| 20 | [s20-recap](s20-recap.md) | 8 Legacy | Bus finally arrives | Recap card | 32.5 s |

## Technical conventions

- **Canvas:** 1280 × 720, 30 fps (matches `src/Root.tsx`). One Remotion composition per scene.
  Suggested id: `S01ColdOpen`, `S02ThreeRules`, … (PascalCase of the file name).
- **Scene length:** narration audio + **0.3 s lead-in** + **0.5 s tail**. Don't cut the audio to fit the visuals;
  stretch the visuals instead. Kokoro already leaves a little silence at each end.
- **Narration text:** the lines starting with `> ` under `## Narration`. They're written to be spoken exactly as is.
- **TTS rules (Kokoro `af_heart`):**
  1. Replace `Poisson` → `Pouasson` before generating, or it says "poison". Keep "Poisson" on screen.
  2. **Split into chunks of whole sentences, at most ~250 characters each, then concatenate.** Kokoro silently
     truncates long inputs: a full scene in one `generate()` call loses its ending. One call per *single* sentence
     works but adds pauses around short sentences.
  3. Don't put symbols in narration. Formulas are spelled out ("e to the minus two G"), and so are years and percentages.
- **Suggested audio path:** `build/narration/sNN.wav`.
- **Cues:** the beat sheets key visuals to *phrases* in the narration. Align them to the real audio, for example
  by looking at sentence boundaries in the generated file.

## Style guide

### Palette (dark theme, extends the existing `Clip.tsx` colours)

| Token | Hex | Use |
|---|---|---|
| `bg` | `#0f172a` | Background everywhere |
| `panel` | `#1e293b` | Cards, plot area, illustration ground |
| `ink` | `#e2e8f0` | Main text, axes |
| `muted` | `#94a3b8` | Labels, gridlines, captions |
| `event` | `#38bdf8` | Poisson events, new packets, pure-Aloha curve |
| `retry` | `#f59e0b` | Retransmitted packets |
| `success` | `#22c55e` | Delivered packet, ACK, "safe" |
| `collision` | `#ef4444` | Collisions, the vulnerable window (fill at 20% opacity) |
| `slotted` | `#a78bfa` | Slots, slotted-Aloha curve |
| `bus` | `#facc15` | The bus, the "37%" callback highlight |

Colour always carries meaning. Blue is an attempt, green is a success, red is a collision, amber is a retry,
and violet is slotted. Never use those colours decoratively.

### Typography and math
- UI text: Helvetica / Arial, bold for titles, regular for captions. Captions are at least 28 px, titles at least 56 px.
- Formulas: one consistent math style across all scenes (KaTeX, or Unicode in a serif italic). Variables in italic:
  *λ, t, G, S*.
- On-screen text is a **subset** of the narration or a label, never a second paragraph to read.

### Real-life illustration style
- Flat vector, rounded shapes, two or three tones per object, soft shadows. No photorealism and no detailed faces.
  People have a simple head and body with a jacket colour as identity.
- Real-life scenes sit on `panel`-coloured ground inside the dark `bg`, so they cut cleanly to diagrams.

### Motion
- One new idea on screen at a time. At most two things moving at once.
- Ease in and out (Remotion `spring` with damping around 12–15, or `interpolate` with an easing function). Avoid linear
  slides except for time flowing along a timeline.
- **The morph is the point.** When a real-life picture becomes a diagram, animate the transformation: a bus becomes
  a dot, a phone's radio wave becomes a packet bar. Don't hard-cut between them.

## Recurring cast and props (keep them identical across scenes)

| Element | Description | Appears in |
|---|---|---|
| **The Commuter** | Adult, teal jacket, grey backpack, phone in hand. Neutral expressions: patient, checks watch, mildly annoyed, relieved. | 01, 02, 04, 05, 07, 11, 14, 17, 19, 20 |
| **Bus stop + street** | Shelter with a glass panel (for raindrops), a sign with a route number "10", a road, a coffee-shop front across the street, and a cell tower on a rooftop in the background. | 01–05, 07, 11, 14, 17, 19, 20 |
| **The bus** | Yellow (`bus`) city bus, route "10". | 01, 02, 04, 14, 17, 20 |
| **Walkie-talkie pair** | Talker A (teal) and Talker B (orange), each holding a chunky walkie-talkie. Speech shows as a waveform ribbon. | 06, 09, 13 |
| **Hub and terminals** | One hub (antenna mast) with terminals around it, each sending arcs to it. Introduced on the Hawaii map, then reused abstractly. | 08, 09, 11, 12 |

## Recurring diagrams (build once, share across scenes)

- **Timeline:** horizontal axis, `muted` ticks, time flows left to right. Events are `event`-coloured dots.
- **Packet bar:** rounded rectangle whose width is exactly **1 frame time** on the current timeline. Fill shows state
  (blue attempt, amber retry, green delivered, red collided).
- **Formula pocket:** after Scene 04, a small card with **e^(−λt)** sits in the top-right corner. It's pulled out and
  reused in Scenes 14 and 17, so it must look identical.
- **S–G plot:** x is **G (offered load)** from 0 to 3, y is **S (throughput)** from 0 to 0.4. Pure curve in `event`,
  slotted curve in `slotted`. Used in 15, 17, 18, 20.

> **Recommendation before fanning out:** have one agent build the palette, Timeline, PacketBar, FormulaPocket,
> SGPlot and the Commuter as shared components first. Then the 20 scene agents can work in parallel without drifting apart.

## Continuity map (callbacks that must match)

- **Bus stop "37%"**: introduced in 04, called back in 14 (same question, different window) and 17 (same number).
- **Formula pocket e^(−λt)**: created in 04, used in 14 and 17, shown in 20.
- **The neighbourhood merge** (many people → one Poisson stream): created in 03, reused in 11 with phones instead of people.
- **Walkie-talkies**: introduced in 06, "copy that" in 09, 10-second message in 13.
- **The Commuter's text message**: sent in 05, its packets are the ones on the channel in 11, and it's revealed as slotted Aloha in 19.
- **S–G plot**: drawn in 15, slotted curve added in 17, ball rolls on it in 18, final frame in 20.
