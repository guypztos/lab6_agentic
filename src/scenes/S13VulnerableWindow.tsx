// Scene 13 — The vulnerable window
// Brief: scenes/s13-vulnerable-window.md  ·  Shared brief: scenes/README.md  ·  Kit: src/shared/README.md
//
// Two tracks on ONE time scale (10 s of talk = 1 frame time):
//   top    — the walkie-talkie stopwatch track (Talker A's 10-second message, Talker B trying three start times)
//   bottom — the packet timeline (my packet, and a packet twin for each of B's tries)
// Each try leaves a dot at its START time (red = it collided, green = safe). The danger zones [−10 s, +10 s] and
// [−1, +1] line up vertically. Then the walkie track fades, the packet track rises to centre, the dots vanish and
// my packet turns green inside the empty 2-frame-time window (Scene 14 opens on this).
import React from "react";
import { useCurrentFrame } from "remotion";
import {
  Bracket,
  Caption,
  clamp01,
  COLORS,
  cue,
  FONT,
  Formula,
  ILLUS,
  Interval,
  Label,
  lerp,
  Mark,
  PacketBar,
  pop,
  prog,
  SceneFrame,
  SIZE,
  Stage,
  Talker,
  Timeline,
  timeScale,
  useSvgId,
  Waveform,
  type Scale,
} from "../shared";

/** Extra seconds of picture after the narration tail. The scene length updates automatically. */
export const meta = { extraTail: 0 };

// ── Geometry ────────────────────────────────────────────────────────────────────────────────────
/** Shared time scale for both tracks: 1 unit = 1 frame time = 10 s of talk, 260 px. */
const SC = timeScale(-1.5, 2.0, 250, 1160);

// walkie-talkie (stopwatch) track
const A_Y = 175; // Talker A's ribbon row
const B_Y = 240; // Talker B's ribbon row
const T_AXIS = 290;
const T_ZONE_Y = 212;
const T_ZONE_H = 150;
const RIBBON_H = 44;

// packet track (before it rises)
const P_AXIS = 560;
const MY_Y = 520; // my packet row
const OTH_Y = 470; // other packet row
const P_ZONE_Y = 495;
const P_ZONE_H = 130;
const RISE = 140; // how far the packet track rises once the walkie track has gone

/**
 * Final geometry Scene 14 can pick up (canvas px, after the rise):
 * time scale t∈[−1.5, 2] → x∈[250, 1160] (260 px per frame time); my packet t∈[0, 1] centred at y = 380;
 * window t∈[−1, 1] → x∈[380, 900], y∈[290, 420]; axis at y = 420.
 */
export const S13_FINAL = {
  scale: { t0: -1.5, t1: 2.0, x0: 250, x1: 1160 },
  axisY: P_AXIS - RISE,
  packetY: MY_Y - RISE,
  window: { from: -1, to: 1, y: P_ZONE_Y - RISE, h: P_ZONE_H },
};

// ── Timing (scene frames) ───────────────────────────────────────────────────────────────────────
const F = {
  qMove: 12, // "?" glides down onto the timeline
  axisP: 14,
  packetFill: 30,
  talkerA: cue("s13", "Back to the walkie"),
  ribbonA: cue("s13", "Say you talk") + 4,
  guides: cue("s13", "ten seconds"),
  talkerB: cue("s13", "Anyone who starts") - 5,
  zoneT: cue("s13", "twenty seconds of danger"),
  zoneP: cue("s13", "Packets work the same way") + 2,
  fadeT: cue("s13", "Packets work the same way") + 25,
  rise: cue("s13", "Packets work the same way") + 29,
  bracket: cue("s13", "two whole frame times"),
  vanish: cue("s13", "and it succeeds only if") + 4,
  green: cue("s13", "and it succeeds only if") + 16,
  caption: cue("s13", "nobody else starts"),
};

type Try = {
  /** B's start, in frame times (×10 = seconds). */
  start: number;
  /** Overlap with my packet / A's talk, or null if safe. */
  overlap: [number, number] | null;
  draw: [number, number]; // ribbon / twin transmission
  verdict: number; // static + red (or ✓)
  collapse: number; // bar fades into a start-dot
  seed: string;
};

const c1 = cue("s13", "Anyone who starts") + 7;
const c2 = cue("s13", "And anyone who started") + 5;
const TRIES: Try[] = [
  { start: 0.6, overlap: [0.6, 1.0], draw: [c1, c1 + 26], verdict: c1 + 12, collapse: cue("s13", "cuts you off") + 8, seed: "t1" },
  { start: -0.6, overlap: [0, 0.4], draw: [c2, c2 + 58], verdict: c2 + 44, collapse: c2 + 74, seed: "t2" },
  { start: -1.2, overlap: null, draw: [c2 + 84, c2 + 108], verdict: c2 + 110, collapse: c2 + 138, seed: "t3" },
];
const COLLAPSE = 14;

/** Linear (time-flow) progress for drawing ribbons and transmitting packets. */
const lin = (frame: number, a: number, b: number) => clamp01((frame - a) / (b - a));

// ── Pieces ──────────────────────────────────────────────────────────────────────────────────────

/** A speech ribbon on the stopwatch track: tinted bar + clean waveform; the overlap turns to red static. */
const Ribbon: React.FC<{
  sc: Scale;
  from: number;
  y: number;
  color: string;
  progress: number;
  overlap: [number, number] | null;
  staticAmt: number;
  frame: number;
  seed: string;
  opacity?: number;
}> = ({ sc, from, y, color, progress, overlap, staticAmt, frame, seed, opacity = 1 }) => {
  const outId = useSvgId("s13out");
  const inId = useSvgId("s13in");
  const x = sc(from);
  const fullW = sc(from + 1) - x;
  const w = fullW * clamp01(progress);
  if (w <= 0.5) return null;
  const top = y - RIBBON_H / 2;
  const ox1 = overlap ? sc(overlap[0]) : 0;
  const ox2 = overlap ? Math.max(ox1, Math.min(sc(overlap[1]), x + w)) : 0; // only the part drawn so far
  const wave = (clip?: string, op = 1) => (
    <g clipPath={clip ? `url(#${clip})` : undefined} opacity={op}>
      <Waveform x={x + 8} y={y} width={fullW - 16} amp={14} color={color} progress={progress} phase={2.3} strokeWidth={3.5} seed={seed} />
    </g>
  );
  const s = overlap && ox2 - ox1 > 1 ? clamp01(staticAmt) : 0;
  return (
    <g opacity={opacity}>
      <defs>
        <clipPath id={outId}>
          <rect x={0} y={0} width={ox1} height={720} />
          <rect x={ox2} y={0} width={1280 - ox2} height={720} />
        </clipPath>
        <clipPath id={inId}>
          <rect x={ox1} y={0} width={ox2 - ox1} height={720} />
        </clipPath>
      </defs>
      <rect x={x} y={top} width={w} height={RIBBON_H} rx={12} fill={color} fillOpacity={0.16} stroke={color} strokeWidth={2} />
      {s > 0 ? (
        <>
          {wave(outId)}
          {wave(inId, 1 - s)}
          <rect x={ox1} y={top} width={ox2 - ox1} height={RIBBON_H} fill={COLORS.collision} fillOpacity={0.28 * s} />
          <Waveform
            x={ox1}
            y={y}
            width={ox2 - ox1}
            amp={17}
            color={COLORS.collision}
            noise={1}
            phase={frame / 10}
            strokeWidth={3}
            seed={`${seed}-static`}
            opacity={s}
          />
        </>
      ) : (
        wave()
      )}
    </g>
  );
};

/** A small stopwatch at the end of the walkie track; its hand sweeps while A talks. */
const Stopwatch: React.FC<{ x: number; y: number; sweep: number; opacity: number }> = ({ x, y, sweep, opacity }) => {
  const a = (sweep * 360 - 90) * (Math.PI / 180);
  return (
    <g opacity={opacity}>
      <rect x={x - 5} y={y - 30} width={10} height={7} rx={2} fill={COLORS.muted} />
      <circle cx={x} cy={y} r={20} fill={COLORS.panel} stroke={COLORS.muted} strokeWidth={3} />
      <line x1={x} y1={y} x2={x + Math.cos(a) * 14} y2={y + Math.sin(a) * 14} stroke={COLORS.ink} strokeWidth={3} strokeLinecap="round" />
      <circle cx={x} cy={y} r={3} fill={COLORS.ink} />
    </g>
  );
};

/** A start-time dot that pops onto an axis. */
const StartDot: React.FC<{ x: number; y: number; color: string; k: number }> = ({ x, y, color, k }) =>
  k <= 0.001 ? null : <circle cx={x} cy={y} r={10 * k} fill={color} stroke={COLORS.bg} strokeWidth={3} />;

// ── Scene ───────────────────────────────────────────────────────────────────────────────────────

export const S13VulnerableWindow: React.FC = () => {
  const frame = useCurrentFrame();

  // Opening: "P(success) = ?" → the "?" glides onto the timeline and becomes my packet.
  const qP = prog(frame, F.qMove, 28);
  const eqOp = 1 - prog(frame, F.qMove, 16);
  const qOp = 1 - prog(frame, F.packetFill + 8, 14);
  const qX = lerp(742, SC(0.5), qP);
  const qY = lerp(300, MY_Y, qP);
  const qSize = lerp(84, 40, qP);
  const myFill = lin(frame, F.packetFill, F.packetFill + 26);
  const pAxis = prog(frame, F.axisP, 30);

  // Walkie-talkie layer.
  const walkieOp = 1 - prog(frame, F.fadeT, 18);
  const tAxis = prog(frame, F.talkerA + 4, 30);
  const aIn = prog(frame, F.talkerA, 16);
  const ribbonA = lin(frame, F.ribbonA, F.ribbonA + 40);
  const aTalking = frame >= F.ribbonA && frame <= F.ribbonA + 40;
  const bIn = prog(frame, F.talkerB, 14);
  const guides = prog(frame, F.guides, 18) * walkieOp;

  // Per-try state.
  const tries = TRIES.map((t) => {
    const draw = lin(frame, t.draw[0], t.draw[1]);
    const appear = frame >= t.draw[0] ? 1 : 0;
    const vk = prog(frame, t.verdict, 12);
    const gone = prog(frame, t.collapse, COLLAPSE);
    const dot = pop(frame, t.collapse + 4) * (1 - prog(frame, F.vanish, 14));
    // the overlap only exists for the part of B's transmission drawn so far
    const hit: [number, number] | null = t.overlap ? [t.overlap[0], Math.min(t.overlap[1], t.start + draw)] : null;
    return { ...t, draw, appear, vk, gone, dot, hit, live: appear * (1 - gone) };
  });
  const red = Math.max(0, ...tries.filter((t) => t.overlap).map((t) => t.vk * (1 - t.gone)));
  const bTalking = TRIES.some((t) => frame >= t.draw[0] && frame <= t.draw[1]);
  const happy = tries[2].vk * (1 - tries[2].gone) > 0.5;
  const exprA = red > 0.5 ? "annoyed" : happy ? "happy" : "neutral";
  const talkA = aTalking ? Math.abs(Math.sin(frame / 2.6)) : 0;
  const talkB = bTalking ? Math.abs(Math.sin(frame / 2.4 + 1)) : 0;

  // Danger zones and the finish.
  const zoneT = prog(frame, F.zoneT, 22);
  const zoneP = prog(frame, F.zoneP, 20);
  const rise = RISE * prog(frame, F.rise, 28);
  const bracket = prog(frame, F.bracket, 22);
  const green = prog(frame, F.green, 18);

  const zoneLabelOp = prog(frame, F.zoneT + 6, 14) * walkieOp;

  return (
    <SceneFrame id="s13">
      <Stage>
        {/* ── alignment guides: 0 s ↔ 0 and 10 s ↔ 1 frame time ── */}
        {[0, 1].map((t) => (
          <line
            key={t}
            x1={SC(t)}
            y1={A_Y - RIBBON_H / 2 - 6}
            x2={SC(t)}
            y2={P_AXIS}
            stroke={COLORS.muted}
            strokeWidth={1.5}
            strokeDasharray="4 8"
            opacity={0.55 * guides}
          />
        ))}

        {/* ── walkie-talkie stopwatch track ── */}
        <g opacity={walkieOp}>
          <Interval scale={SC} from={-1} to={1} y={T_ZONE_Y} h={T_ZONE_H} progress={zoneT} opacity={zoneT > 0 ? 1 : 0} />
          <Timeline
            scale={SC}
            y={T_AXIS}
            progress={tAxis}
            tickEvery={0.5}
            tickLabel={(t) => (t === 0 ? "0 s" : t === 1 ? "10 s" : null)}
            opacity={tAxis > 0 ? 1 : 0}
          />
          <Stopwatch x={1212} y={T_AXIS - 4} sweep={ribbonA} opacity={prog(frame, F.talkerA + 20, 14)} />

          <Ribbon
            sc={SC}
            from={0}
            y={A_Y}
            color={ILLUS.talkerA}
            progress={ribbonA}
            overlap={tries.find((t) => t.overlap && t.live > 0)?.hit ?? null}
            staticAmt={red}
            frame={frame}
            seed="a"
          />
          {tries.map((t) =>
            t.live > 0 ? (
              <Ribbon
                key={t.seed}
                sc={SC}
                from={t.start}
                y={B_Y}
                color={ILLUS.talkerB}
                progress={t.draw}
                overlap={t.hit}
                staticAmt={t.vk}
                frame={frame}
                seed={`b-${t.seed}`}
                opacity={1 - t.gone}
              />
            ) : null,
          )}
          {tries.map((t) => (
            <StartDot key={t.seed} x={SC(t.start)} y={T_AXIS} color={t.overlap ? COLORS.collision : COLORS.success} k={t.dot} />
          ))}
          {tries.map((t) =>
            t.vk > 0 && t.gone < 1 ? (
              <Mark
                key={t.seed}
                x={t.overlap ? SC((t.overlap[0] + t.overlap[1]) / 2) : SC(t.start + 0.5)}
                y={t.overlap ? 112 : B_Y - 62}
                kind={t.overlap ? "cross" : "check"}
                size={40}
                progress={prog(frame, t.verdict + 4, 12)}
                opacity={1 - t.gone}
              />
            ) : null,
          )}

          <g opacity={aIn}>
            <Talker who="A" x={110} y={232} scale={0.6} talk={talkA} expression={exprA} />
          </g>
          <g opacity={bIn}>
            <Talker who="B" x={195} y={312} scale={0.6} talk={talkB} />
          </g>
        </g>

        {/* ── packet track (rises to centre once the walkie track is gone) ── */}
        <g transform={`translate(0 ${-rise})`}>
          <Interval scale={SC} from={-1} to={1} y={P_ZONE_Y} h={P_ZONE_H} progress={zoneP} opacity={zoneP > 0 ? 1 : 0} />
          <Timeline
            scale={SC}
            y={P_AXIS}
            progress={pAxis}
            opacity={pAxis > 0.01 ? 1 : 0}
            tickEvery={1}
            tickLabel={(t) => (t === -1 ? "−1" : t === 0 ? "0" : t === 1 ? "+1" : null)}
            label={pAxis > 0.99 ? "frame times →" : undefined}
          />
          {/* window edges: taller red ticks at −1 and +1 */}
          {[-1, 1].map((t) => (
            <line key={t} x1={SC(t)} y1={P_AXIS - 16} x2={SC(t)} y2={P_AXIS + 16} stroke={COLORS.collision} strokeWidth={4} strokeLinecap="round" opacity={zoneP} />
          ))}

          {tries.map((t) =>
            t.live > 0 ? (
              <PacketBar
                key={t.seed}
                scale={SC}
                start={t.start}
                y={OTH_Y}
                state="attempt"
                toState={t.overlap ? "collision" : undefined}
                mix={t.vk}
                fill={t.draw}
                opacity={1 - t.gone}
              />
            ) : null,
          )}
          {tries.map((t) =>
            t.vk > 0 && t.gone < 1 ? (
              <Mark
                key={t.seed}
                x={t.overlap ? SC((t.overlap[0] + t.overlap[1]) / 2) : SC(t.start + 0.5)}
                y={OTH_Y - 52}
                kind={t.overlap ? "cross" : "check"}
                size={40}
                progress={prog(frame, t.verdict + 4, 12)}
                opacity={1 - t.gone}
              />
            ) : null,
          )}

          <PacketBar
            scale={SC}
            start={0}
            y={MY_Y}
            label="my packet"
            state="attempt"
            toState={green > 0 ? "success" : "collision"}
            mix={green > 0 ? green : red}
            fill={myFill}
            opacity={myFill > 0 ? 1 : 0}
          />

          {tries.map((t) => (
            <StartDot key={t.seed} x={SC(t.start)} y={P_AXIS} color={t.overlap ? COLORS.collision : COLORS.success} k={t.dot} />
          ))}

          <Bracket
            x1={SC(-1)}
            x2={SC(1)}
            y={P_ZONE_Y - P_ZONE_H / 2 - 16}
            label="vulnerable window = 2 frame times"
            size={26}
            progress={bracket}
            opacity={bracket > 0.01 ? 1 : 0}
          />
        </g>

        {/* the "?" from Scene 12, gliding onto the timeline */}
        {qOp > 0 ? (
          <text x={qX} y={qY + qSize * 0.35} fill={COLORS.ink} fontFamily={FONT.math} fontSize={qSize} fontWeight={700} textAnchor="middle" opacity={qOp}>
            ?
          </text>
        ) : null}
      </Stage>

      {/* opening handoff from Scene 12 */}
      {eqOp > 0 ? (
        <Label x={712} y={300} anchor="right" opacity={eqOp}>
          <Formula tex="P(success) =" size={72} />
        </Label>
      ) : null}

      {/* "20 s of danger" over the walkie-talkie zone */}
      <Label x={SC(0)} y={86} size={34} weight={700} color={COLORS.collision} opacity={zoneLabelOp}>
        20 s of danger
      </Label>
      <Label x={SC(0)} y={120} size={SIZE.small + 2} color={COLORS.muted} opacity={zoneLabelOp}>
        −10 s … +10 s
      </Label>

      <Caption y={560} start={F.caption}>
        success = no other start in the window
      </Caption>
    </SceneFrame>
  );
};
