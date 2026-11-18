# Shared kit

Everything that appears in more than one scene lives here, so 20 scene agents build one consistent video.
**Use these components; don't re-draw the Commuter, the bus, a packet or the plot yourself.**
To see every piece animate, open **`KitPreview`** in Remotion Studio (`npm run studio`). Its source,
[`src/KitPreview.tsx`](../KitPreview.tsx), is the usage reference.

```ts
import { SceneFrame, Stage, Timeline, PacketBar, Commuter, BusStopStreet, STREET, cue, prog, COLORS } from "../shared";
```

## How to build your scene

1. Read `scenes/README.md`, then your brief `scenes/sNN-*.md`.
2. Edit **only** `src/scenes/SNN<Name>.tsx`. Replace `<Placeholder>` with your scene and keep both exports
   (`meta` and the component). It's already registered as a composition and placed in `FullVideo`.
3. Wrap everything in `<SceneFrame id="sNN">`. It sets the background and plays your narration at `LEAD_IN`.
   Add `debug` while working to see the current sentence and frame.
4. Key visuals to the narration with `cue()`:
   ```tsx
   const frame = useCurrentFrame();
   const t = cue("s02", "Say, ten buses an hour");          // scene frame where the phrase starts
   const p = prog(frame, t, 20);                             // 0→1 over 20 frames from there
   ```
   Phrases come straight from your beat sheet (drop the "…"). A phrase that doesn't match throws an error
   listing the real sentences.
5. Need more picture after the last word? Set `meta.extraTail` (seconds) in your file. The scene length,
   the Studio composition and `FullVideo` all update.
6. Check stills: `npx remotion still src/index.ts S02ThreeRules out/s02.png --frame=120`.

**Layering:** SVG components go inside a `<Stage>` (a full-frame 1280×720 SVG in canvas pixels). HTML text
components (`Label`, `Title`, `Card`, `FormulaPocket`…) go outside it, as siblings. Use several Stages when text must sit
*between* SVG layers.

**Determinism:** never call `Math.random()`. Use `poissonArrivals(…, seed)`, `rand(seed)` or remotion's `random(seed)`.

## Catalogue

### Tokens and helpers: `theme.ts`, `motion.ts`
| Export | What |
|---|---|
| `COLORS` | Semantic palette: `event` blue (attempts / Poisson events / pure curve), `retry` amber, `success` green, `collision` red, `slotted` violet, `bus` yellow, plus `bg`, `panel`, `ink`, `muted`, `faint`. |
| `ILLUS` | Non-semantic illustration tones (jackets, skin, sky, buildings…). |
| `FONT`, `SIZE` | Sans and math fonts; minimum sizes (title 56, caption 28, label 22). |
| `W`, `H`, `FPS`, `LEAD_IN`, `TAIL` | 1280×720 @ 30 fps; 0.3 s before and 0.5 s after the narration. |
| `prog(frame, start, dur)` | Eased 0→1 progress. Most animation is just this. |
| `fade`, `pop`, `lerp`, `remap`, `clamp01`, `sec`, `EASE*` | Fade in/out, spring pop (damping 13), interpolation. |

### Narration sync: `cues.ts` (data: `src/scenes/narration.ts`, generated)
| Export | What |
|---|---|
| `cue(id, phrase, "start" \| "end")` | Scene frame where a phrase starts or ends being spoken. |
| `sentenceFrame(id, i)`, `sentenceAt(id, frame)` | By sentence index. |
| `narrationEndFrame(id)`, `sceneDurationInFrames(id, extra)` | Where the tail starts; the total length. |

### Poisson and Aloha math: `poisson.ts`
| Export | What |
|---|---|
| `poissonArrivals(rate, t0, t1, seed)` | Event times with true exponential gaps (uniform-random looks wrong). |
| `scheduledArrivals(every, t0, t1)` | Evenly spaced: the train timetable. |
| `sparseSources(n, rate, t0, t1, seed)`, `mergeTimes(rows)` | Many rare sources and their merged stream (Scenes 03, 11). |
| `classifyPackets(starts, len, "pure" \| "slotted")` | Marks each packet ok or collided by the real Aloha rule. |
| `pureS`, `slottedS`, `PEAKS` | S = G·e^(−2G), S = G·e^(−G), and both peaks. |

### Text (HTML): `text/`
| Component | Used for |
|---|---|
| `Title`, `Label`, `Caption` | Positioned text; `Caption` is bottom-centre ≥ 28 px. Pass `start` to animate in. |
| `RuleChip` | "1 · steady rate λ" chips (Scenes 02, 09). |
| `Stamp` | COLLISION, ALOHAnet · 1971, back off… |
| `Card` | A panel for grouping text or formulas. |
| `Formula` | `<Formula tex="S = G·e^{−2G}" />`, with `^{}` / `_{}` and auto-italic variables. |
| **`FormulaPocket`** | The e^(−λt) card from Scene 04: `dock` 0 = centre → 1 = top-right; `rate` / `time` / `sub` animate λ→G, t→2 or t→1. **Scenes 04, 14, 17, 20 must use it.** |
| `PartSting` | "PART 2 · Networks from zero" card, in its own `<Sequence>`. |

### Diagrams (SVG, inside `<Stage>`): `diagram/`
| Component | Used for |
|---|---|
| `timeScale(t0, t1, x0, x1)` | Time → x. Pass the same scale to everything on one timeline. |
| `Timeline` | Axis with optional ticks, labels and draw-on. |
| `EventDots` | Poisson dots. `until` = time cursor; dots pop and drop in as it passes them. |
| `PacketBar` | **Exactly 1 frame time wide.** `state` / `toState` + `mix`, `fill` (transmitting), `shatter` (collision), `edge`, `label`. |
| `Interval` | Shaded window: the vulnerable window (red), an empty-window highlight (green), a slot. |
| `Bracket` | "1 frame time", "2 frame times" dimension brackets. |
| `SlotGrid` | Violet slot boundaries (Scenes 16, 17). |
| `StreamMerge` | Rows of sparse events folding into one timeline (Scenes 03 and 11 must share this). |
| `SGPlot` | The S–G plot: `pure` / `slotted` draw-on, `purePeak` / `slottedPeak`, `cursorG`, `ball` (Scenes 15, 17, 18, 20). |
| `HubAndTerminals` | Hub + terminals ring. `from` + `morph` (from Hawaii-map markers), `traffic` packets and ACKs (Scenes 08, 09, 11, 12). |
| `ChannelBand`, `Waveform` | The shared channel strip; clean speech vs `noise={1}` static (Scenes 05, 06, 13). |
| `Mark`, `Die` | ✓ / ✗ that draw on; a die that tumbles and settles (Scenes 09, 10, 18). |

### Real life (SVG, inside `<Stage>`): `illustration/`
| Component | Used for |
|---|---|
| **`Commuter`** | The recurring character. `pose`: stand, phone, watch, walk (`walkPhase`), shrug, phoneUp; `expression`; `buzz`; `phoneGlow`; `facing`. |
| `Talker who="A" \| "B" \| "supervisor"` | Walkie-talkie cast. `talk` animates the mouth. A and B are also the hallway walkers. |
| `Person` + `crowdLook(i)` | Background people with deterministic variety. |
| **`BusStopStreet`** + **`STREET`** | The home set. Put the bus in the `road` slot and people in `children`. Props: `rain`, `glassDrop`, `towerRipples`, `dim`. `STREET` holds every position (bus stop, Commuter spot, glass, tower top…). |
| `Bus` | Route-10 bus. `wheelRotation`, `doorOpen`, `facing`. Drive it with `lerp(STREET.busEnterX, STREET.busStopX, p)`. |
| `CellTower`, `Phone` | The rooftop tower (also inside the street) and the close-up phone (`message`, `typed`, `sent`). |

## Regenerating narration

When a scene's narration text changes in `scenes/sNN-*.md`:

```sh
npm run narrate:scenes -- s05     # one scene (or no args for all; about 3 minutes)
```

This rewrites `public/narration/s05.mp3`, `public/narration/cues.json` and `src/scenes/narration.ts`. Your
`cue()` calls follow automatically, as long as the phrases still exist.
