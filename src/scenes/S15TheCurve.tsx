// Scene 15 — The curve
// Brief: scenes/s15-the-curve.md  ·  Shared brief: scenes/README.md  ·  Kit: src/shared/README.md
//
// One G value drives everything: the cursor on the S–G plot, the curve draw-on, the highway's car density and
// speed, the "cars per minute through" counter and the mini packet strip. Left of the peak = empty road,
// right of the peak = jam.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  SceneFrame,
  Stage,
  SGPlot,
  sgCoords,
  PacketBar,
  Timeline,
  Label,
  Formula,
  timeScale,
  useSvgId,
  cue,
  prog,
  fade,
  lerp,
  clamp01,
  rand,
  poissonArrivals,
  classifyPackets,
  pureS,
  PEAKS,
  COLORS,
  ILLUS,
  FONT,
  EASE_OUT,
} from "../shared";

/** Extra seconds of picture after the narration tail. The scene length updates automatically. */
export const meta = { extraTail: 1.2 };

// Plot box (shared with Scene 17 so the slotted curve lands on the same plot).
const PLOT = { x: 170, y: 200, w: 640, h: 400, gMax: 3, sMax: 0.4 };
const { gx, sy } = sgCoords(PLOT);

// ---- narration cues ----
const C = {
  plot: cue("s15", "Let's plot it"),
  highway: cue("s15", "It behaves a lot like a highway"),
  light: cue("s15", "With light traffic"),
  add: cue("s15", "Add traffic"),
  push: cue("s15", "But push too hard"),
  sinks: cue("s15", "and throughput sinks back toward zero"),
  peak: cue("s15", "The peak is at G equals one half"),
  peakS: cue("s15", "where S equals one over two e"),
  eighteen: cue("s15", "About eighteen percent"),
  best: cue("s15", "Even at its best"),
  silence: cue("s15", "goes to silence and collisions"),
  end: cue("s15", "silence and collisions", "end"),
};

const G_LOW = 0.15;
const BACK_START = C.peak;
const BACK_DUR = 50;
const PUSH_START = C.push + 6;
const PUSH_END = C.sinks + 24;

/** The shared G value at a scene frame. */
function gAt(f: number): number {
  if (f < C.add) return G_LOW;
  if (f < PUSH_START) return lerp(G_LOW, PEAKS.pure.G, prog(f, C.add, 60));
  if (f < BACK_START) return lerp(PEAKS.pure.G, 3, prog(f, PUSH_START, PUSH_END - PUSH_START));
  return lerp(3, PEAKS.pure.G, prog(f, BACK_START, BACK_DUR));
}
/** Furthest G the cursor has reached (the curve stays drawn behind it). */
const gReached = (f: number) => (f < BACK_START ? gAt(f) : 3);

// ---- highway (top-down) ----
const ROAD = { x0: 12, x1: 1030, y0: 30, y1: 130 };
const LANES = [58, 102];
const SLOTS = 22; // car slots per lane; all filled = bumper to bumper
const LOOP = 1100;
const PITCH = LOOP / SLOTS;
const CAR_TONES = ["#cbd5e1", "#e7e5e4", "#64748b", "#78716c", "#9ca3af", "#475569"];
const jamOf = (G: number) => clamp01((G - 0.9) / 1.1);
const densityOf = (G: number) => 0.16 + 0.84 * clamp01(G / 2.6);
const speedOf = (G: number, f: number) => {
  const wobble = 1 + 0.9 * jamOf(G) * Math.sin(f * 0.18);
  return 10 * Math.exp(-2 * G) * Math.max(0, wobble);
};
/** Distance travelled by the traffic up to frame f (integrated, so cars never jump back). */
function travelled(f: number): number {
  let d = 0;
  for (let i = 0; i < f; i++) d += speedOf(gAt(i), i);
  return d;
}

const Car: React.FC<{ x: number; y: number; tone: string; brake: number; opacity: number }> = ({ x, y, tone, brake, opacity }) => (
  <g transform={`translate(${x} ${y})`} opacity={opacity}>
    <rect x={-21} y={-10} width={44} height={22} rx={7} fill="#000" opacity={0.25} />
    <rect x={-22} y={-12} width={44} height={22} rx={7} fill={tone} />
    <rect x={4} y={-9} width={10} height={16} rx={3} fill="#1e293b" />
    <rect x={-15} y={-9} width={8} height={16} rx={3} fill="#1e293b" opacity={0.8} />
    <rect x={19} y={-10} width={3} height={5} rx={1} fill="#fef9c3" opacity={0.8} />
    <rect x={19} y={3} width={3} height={5} rx={1} fill="#fef9c3" opacity={0.8} />
    {brake > 0 ? (
      <>
        <circle cx={-22} cy={-7} r={7} fill={COLORS.collision} opacity={0.35 * brake} />
        <circle cx={-22} cy={5} r={7} fill={COLORS.collision} opacity={0.35 * brake} />
        <rect x={-23} y={-10} width={3} height={6} rx={1} fill={COLORS.collision} opacity={brake} />
        <rect x={-23} y={2} width={3} height={6} rx={1} fill={COLORS.collision} opacity={brake} />
      </>
    ) : null}
  </g>
);

const Highway: React.FC<{ frame: number; G: number }> = ({ frame, G }) => {
  const clip = useSvgId("road");
  const d = travelled(frame);
  const dens = densityOf(G);
  const jam = jamOf(G);
  return (
    <g>
      <rect x={6} y={14} width={1268} height={132} rx={16} fill={COLORS.panel} />
      <defs>
        <clipPath id={clip}>
          <rect x={ROAD.x0} y={ROAD.y0} width={ROAD.x1 - ROAD.x0} height={ROAD.y1 - ROAD.y0} rx={6} />
        </clipPath>
      </defs>
      <rect x={ROAD.x0} y={ROAD.y0} width={ROAD.x1 - ROAD.x0} height={ROAD.y1 - ROAD.y0} rx={6} fill={ILLUS.road} />
      <line x1={ROAD.x0} y1={ROAD.y0 + 3} x2={ROAD.x1} y2={ROAD.y0 + 3} stroke={ILLUS.roadLine} strokeWidth={2} opacity={0.6} />
      <line x1={ROAD.x0} y1={ROAD.y1 - 3} x2={ROAD.x1} y2={ROAD.y1 - 3} stroke={ILLUS.roadLine} strokeWidth={2} opacity={0.6} />
      {Array.from({ length: 21 }, (_, i) => (
        <rect key={i} x={ROAD.x0 + i * 50 + 8} y={(ROAD.y0 + ROAD.y1) / 2 - 2} width={26} height={4} rx={2} fill={ILLUS.roadLine} opacity={0.55} />
      ))}
      <g clipPath={`url(#${clip})`}>
        {LANES.map((ly, lane) =>
          Array.from({ length: SLOTS }, (_, i) => {
            const u = rand(`s15-car-${lane}-${i}`);
            const vis = clamp01((dens - u) * 25);
            if (vis <= 0) return null;
            const off = lane * PITCH * 0.5 + rand(`s15-jit-${lane}-${i}`, -3, 3) * (1 - jam);
            const x = ((i * PITCH + off + d * (lane ? 0.94 : 1)) % LOOP) - 40;
            const tone = CAR_TONES[Math.floor(rand(`s15-tone-${lane}-${i}`) * CAR_TONES.length)];
            return <Car key={`${lane}-${i}`} x={x} y={ly} tone={tone} brake={jam} opacity={vis} />;
          }),
        )}
      </g>
    </g>
  );
};

// ---- mini packet strip: Poisson at rate G (thinned from one fixed rate-3 stream, so packets only ever add) ----
const STRIP = timeScale(0, 10, 880, 1240);
const STRIP_Y = 338;
const CANDIDATES = poissonArrivals(3, 0, 9, "s15-strip-d").map((t, i) => ({ t, u: rand(`s15-strip-d-u-${i}`) }));

const MiniStrip: React.FC<{ G: number }> = ({ G }) => {
  const live = CANDIDATES.filter((c) => c.u < G / 3);
  const cls = classifyPackets(live.map((c) => ({ start: c.t })), 1, "pure");
  // stack overlapping bars into lanes so overlaps read as overlaps
  const laneEnd: number[] = [];
  return (
    <g>
      <Timeline scale={STRIP} y={STRIP_Y + 18} arrow={false} strokeWidth={2} />
      {cls.map((p, i) => {
        let lane = laneEnd.findIndex((e) => e <= p.start);
        if (lane < 0) lane = laneEnd.length;
        laneEnd[lane] = p.start + 1;
        const c = CANDIDATES.find((k) => k.t === p.start)!;
        return (
          <PacketBar
            key={i}
            scale={STRIP}
            start={p.start}
            y={STRIP_Y - (lane % 5) * 16}
            h={13}
            state={p.ok ? "success" : "collision"}
            opacity={clamp01((G / 3 - c.u) * 120)}
          />
        );
      })}
    </g>
  );
};

// ---- channel-usage bar at the peak ----
const USAGE = { x: 880, w: 360, y: 500, h: 40 };
const USEFUL = PEAKS.pure.S; // ≈ 18.4%
const IDLE = Math.exp(-PEAKS.pure.G); // ≈ 60.7%: nobody started in the last frame time
const SHARES = { useful: USEFUL, idle: IDLE, collisions: 1 - USEFUL - IDLE }; // collisions ≈ 20.9%

export const S15TheCurve: React.FC = () => {
  const frame = useCurrentFrame();
  const G = gAt(frame);
  const out = 1 - prog(frame, C.end + 14, 28); // extras clear away in the tail, leaving just the plot

  // opening: boxed formula from Scene 14 shrinks into the plot's top-right corner
  const card = prog(frame, C.plot + 4, 30);
  const axes = prog(frame, C.plot + 8, 30);
  const highwayIn = prog(frame, C.highway, 30);
  const curve = frame < C.light ? 0 : gReached(frame) / 3;
  const cursorOn = frame >= C.light && frame < C.peakS + 20;
  const cursorA = fade(frame, C.light, 10);
  const peakA = prog(frame, C.peakS - 6, 16);
  const pulse = clamp01((frame - C.eighteen) / 30);
  const usage = prog(frame, C.eighteen, 20);
  const rest = prog(frame, C.best + 20, 40);
  const restLabels = fade(frame, C.silence - 10, 12);
  const note = fade(frame, C.peakS + 10, 14);
  const flow = Math.round(160 * pureS(G));

  const u = USAGE;
  const wUseful = u.w * SHARES.useful * usage;
  const wIdle = u.w * SHARES.idle * rest;
  const wColl = u.w * SHARES.collisions * rest;

  return (
    <SceneFrame id="s15">
      <AbsoluteFill>
        <Stage>
          <SGPlot {...PLOT} axes={axes} pure={curve} purePeak={peakA} cursorG={cursorOn ? G : undefined} />
          {/* the point under the cursor */}
          {cursorOn ? (
            <circle cx={gx(G)} cy={sy(pureS(G))} r={9} fill={COLORS.event} stroke={COLORS.ink} strokeWidth={3} opacity={cursorA} />
          ) : null}
          {/* "about eighteen percent": a ring pulses out of the peak */}
          {pulse > 0 && pulse < 1 ? (
            <circle
              cx={gx(PEAKS.pure.G)}
              cy={sy(PEAKS.pure.S)}
              r={12 + 40 * EASE_OUT(pulse)}
              fill="none"
              stroke={COLORS.event}
              strokeWidth={4}
              opacity={1 - pulse}
            />
          ) : null}
        </Stage>

        {/* cursor readout */}
        {cursorOn ? (
          <Label x={gx(G)} y={PLOT.y - 20} size={22} color={COLORS.ink} opacity={cursorA * (1 - prog(frame, C.peakS + 4, 12))}>
            <Formula tex={`G = ${G.toFixed(2)}`} size={26} />
          </Label>
        ) : null}

        {/* the formula, arriving from Scene 14's box */}
        <div
          style={{
            position: "absolute",
            left: lerp(640, gx(2.42), card),
            top: lerp(330, PLOT.y + 52, card), // starts where Scene 14's box ends
            transform: `translate(-50%, -50%) scale(${lerp(1, 0.38, card)})`,
            opacity: out,
            background: COLORS.panel,
            border: `3px solid ${COLORS.event}`,
            borderRadius: 18,
            padding: "18px 56px 22px",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            whiteSpace: "nowrap",
          }}
        >
          <div style={{ fontFamily: FONT.sans, fontSize: 40, color: COLORS.event, opacity: card, height: 50 * card, overflow: "hidden" }}>
            pure Aloha
          </div>
          <Formula tex="S = G·e^{−2G}" size={100} />
        </div>

        {/* Scene 14's tag under its box, handing over to the card's own label */}
        <Label x={640} y={448} size={34} italic color={COLORS.event} opacity={1 - Math.min(1, card * 3)}>
          pure Aloha
        </Label>

        {/* highway, sliding in from the top */}
        <Stage style={{ transform: `translateY(${(1 - highwayIn) * -170}px)` }} opacity={highwayIn * out}>
          <Highway frame={frame} G={G} />
        </Stage>
        <div
          style={{
            position: "absolute",
            left: 1152,
            top: 80,
            transform: `translate(-50%, -50%) translateY(${(1 - highwayIn) * -170}px)`,
            opacity: highwayIn * out,
            textAlign: "center",
            fontFamily: FONT.sans,
          }}
        >
          <div style={{ fontSize: 54, fontWeight: 800, color: COLORS.ink, lineHeight: 1 }}>{flow}</div>
          <div style={{ fontSize: 18, color: COLORS.muted, lineHeight: 1.25, marginTop: 6 }}>
            cars per minute
            <br />
            through
          </div>
        </div>

        {/* right panel: what the channel looks like at this G */}
        <Label x={880} y={248} anchor="left" size={22} color={COLORS.muted} opacity={fade(frame, C.light, 12) * out}>
          packets on the channel
        </Label>
        <Stage opacity={fade(frame, C.light, 12) * out}>
          <MiniStrip G={G} />
        </Stage>

        {/* channel-usage bar */}
        <Label x={u.x} y={u.y - 44} anchor="left" size={22} color={COLORS.muted} opacity={usage * out}>
          channel time at the peak
        </Label>
        <Stage opacity={out}>
          {usage > 0 ? (
            <g>
              <rect x={u.x} y={u.y} width={u.w} height={u.h} rx={10} fill={COLORS.panel} opacity={usage} />
              <rect x={u.x} y={u.y} width={wUseful} height={u.h} rx={8} fill={COLORS.success} />
              <rect x={u.x + wUseful + 2} y={u.y} width={Math.max(0, wIdle - 2)} height={u.h} rx={8} fill={COLORS.faint} />
              <rect x={u.x + wUseful + wIdle + 2} y={u.y} width={Math.max(0, wColl - 2)} height={u.h} rx={8} fill={COLORS.collision} />
            </g>
          ) : null}
        </Stage>
        <Label x={u.x} y={u.y + u.h + 26} anchor="left" size={24} weight={700} color={COLORS.success} opacity={usage * out}>
          useful 18%
        </Label>
        <Label x={u.x + u.w * SHARES.useful + (u.w * SHARES.idle) / 2 + 14} y={u.y + u.h + 26} size={24} color={COLORS.muted} opacity={restLabels * out}>
          idle
        </Label>
        <Label x={u.x + u.w * (1 - SHARES.collisions / 2)} y={u.y + u.h + 26} size={24} color={COLORS.collision} opacity={restLabels * out}>
          collisions
        </Label>

        {/* corner note for calculus viewers */}
        <Label x={880} y={632} anchor="left" opacity={note * out * 0.9}>
          <Formula tex="dS/dG = e^{−2G}(1 − 2G) = 0 → G = ½" size={23} color={COLORS.muted} />
        </Label>
      </AbsoluteFill>
    </SceneFrame>
  );
};
