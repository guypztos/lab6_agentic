// Scene 07 — The question
// Brief: scenes/s07-the-question.md  ·  Shared brief: scenes/README.md  ·  Kit: src/shared/README.md
//
// Crowded bus stop, everyone on a phone, a "?" over every head → the people fade, their "?"s glide into a ring of
// device nodes around one (circular) shared channel → a dashed "controller" circle appears in the middle and
// dissolves: no one in charge → the "?"s pulse out of sync while the question builds. Then the Part 3 sting.
import React from "react";
import { random, Sequence, useCurrentFrame } from "remotion";
import {
  BusStopStreet,
  COLORS,
  Commuter,
  crowdLook,
  cue,
  EASE_OUT,
  fade,
  FONT,
  lerp,
  narrationEndFrame,
  PacketBar,
  PartSting,
  Person,
  SceneFrame,
  pop,
  prog,
  sceneDurationInFrames,
  Stage,
  STREET,
  timeScale,
  Title,
  useSvgId,
  type Pose,
} from "../shared";

/** Extra seconds of picture after the narration tail. The scene length updates automatically. */
export const meta = { extraTail: 2.2 };

// ── timing ────────────────────────────────────────────────────────────────────────────────────────────────
const T_OPEN = cue("s07", "So here's the question");
const T_SHARE = cue("s07", "How do you share one channel");
const T_NOBODY = cue("s07", "when nobody is in charge");
const T_KNOWS = cue("s07", "and nobody knows when anyone else wants to talk");
const T_END = narrationEndFrame("s07");
const SCENE_LEN = sceneDurationInFrames("s07", meta.extraTail);
const STING_AT = T_END + 33; // ≥ 1 s hold on the finished question after the last word
const STING_LEN = SCENE_LEN - STING_AT;

// ── the crowd (left → right). Commuter is index 6, under the shelter. ───────────────────────────────────────
type Member = { x: number; y: number; s: number; facing: 1 | -1; pose: Pose; look: number; commuter?: boolean };
const CROWD: Member[] = [
  { x: 110, y: 684, s: 0.86, facing: 1, pose: "phone", look: 0 },
  { x: 245, y: 672, s: 0.8, facing: -1, pose: "phone", look: 1 },
  { x: 380, y: 688, s: 0.9, facing: 1, pose: "phone", look: 2 },
  { x: 515, y: 674, s: 0.82, facing: 1, pose: "watch", look: 3 },
  { x: 650, y: 686, s: 0.88, facing: -1, pose: "phone", look: 4 },
  { x: 790, y: 672, s: 0.8, facing: 1, pose: "phone", look: 5 },
  { x: STREET.commuter.x, y: STREET.commuter.y, s: 0.92, facing: 1, pose: "phone", look: 0, commuter: true },
  { x: 1060, y: 674, s: 0.82, facing: -1, pose: "phone", look: 6 },
  { x: 1190, y: 686, s: 0.88, facing: -1, pose: "phone", look: 7 },
];
const N = CROWD.length;

/** Where the "?" bubble sits over a person's head. */
const headBubble = (m: Member) => ({ x: m.x + 6 * m.facing, y: m.y - 262 * m.s - 26 });

// ── the ring: one channel in the middle, device nodes around it ─────────────────────────────────────────────
const RC = { x: 640, y: 460 };
const BAND_R = 124; // centre radius of the circular channel band
const BAND_W = 34;
const CTRL_R = 82; // the dashed "controller" circle inside it
const RING = { rx: 380, ry: 196 };
const ringPts = Array.from({ length: N }, (_, i) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / N;
  return { x: RC.x + RING.rx * Math.cos(a), y: RC.y + RING.ry * Math.sin(a) };
});
// Assign people (sorted by x) to ring nodes (sorted by x) so the "?"s glide without crossing over each other.
const ringOrder = ringPts.map((p, i) => ({ p, i })).sort((a, b) => a.p.x - b.p.x);
const nodeOf = (k: number) => ringOrder[k].p;

// ── small pieces ──────────────────────────────────────────────────────────────────────────────────────────
const QBubble: React.FC<{ x: number; y: number; scale: number; opacity: number; tail: number }> = ({
  x,
  y,
  scale,
  opacity,
  tail,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    <path d="M -7 20 L 0 34 L 8 20 Z" fill={COLORS.panelHi} stroke={COLORS.ink} strokeWidth={2.5} opacity={tail} />
    <circle r={26} fill={COLORS.panelHi} stroke={COLORS.ink} strokeWidth={2.5} />
    <rect x={-8} y={16} width={16} height={8} fill={COLORS.panelHi} opacity={tail} />
    <text y={10} textAnchor="middle" fill={COLORS.ink} fontFamily={FONT.sans} fontWeight={800} fontSize={30}>
      ?
    </text>
  </g>
);

const PhoneNode: React.FC<{ x: number; y: number; opacity: number; glow: number }> = ({ x, y, opacity, glow }) => (
  <g transform={`translate(${x} ${y})`} opacity={opacity}>
    <rect x={-12} y={-20} width={24} height={40} rx={6} fill={COLORS.panelHi} stroke={COLORS.muted} strokeWidth={2.5} />
    <rect x={-7} y={-13} width={14} height={22} rx={2} fill={COLORS.event} opacity={0.2 + 0.35 * glow} />
  </g>
);

/** The Scene 06 band curved into a circle: same panel fill, blue glow and outline as ChannelBand. */
const ChannelRing: React.FC<{ progress: number; opacity: number }> = ({ progress, opacity }) => {
  const id = useSvgId("chring");
  const L = 2 * Math.PI * BAND_R;
  const dash = `${L * progress} ${L}`;
  const rot = `rotate(-90 ${RC.x} ${RC.y})`;
  return (
    <g opacity={opacity}>
      <defs>
        <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={10} />
        </filter>
      </defs>
      <circle cx={RC.x} cy={RC.y} r={BAND_R} fill="none" stroke={COLORS.event} strokeWidth={BAND_W} opacity={0.35} filter={`url(#${id})`} strokeDasharray={dash} transform={rot} />
      <circle cx={RC.x} cy={RC.y} r={BAND_R} fill="none" stroke={COLORS.event} strokeOpacity={0.7} strokeWidth={BAND_W + 4} strokeDasharray={dash} transform={rot} />
      <circle cx={RC.x} cy={RC.y} r={BAND_R} fill="none" stroke={COLORS.panel} strokeWidth={BAND_W} strokeDasharray={dash} transform={rot} />
    </g>
  );
};

// ── the scene ─────────────────────────────────────────────────────────────────────────────────────────────
export const S07TheQuestion: React.FC = () => {
  const frame = useCurrentFrame();

  // Opening: Scene 06's shattered bars finish fading out over the incoming street.
  const sc = timeScale(0, 10, 140, 1140);
  const shatterOut = 0.55 + 0.45 * prog(frame, 0, 16);
  const streetIn = fade(frame, Math.max(0, T_OPEN - 8), 18);

  // Street + people → ring.
  const peopleOut = prog(frame, T_SHARE + 4, 22);
  const streetOut = prog(frame, T_SHARE + 10, 28);
  const band = prog(frame, T_SHARE + 22, 32);
  const nodesIn = prog(frame, T_SHARE + 24, 20);

  // The controller that isn't there.
  const ctrlIn = prog(frame, T_NOBODY - 2, 14);
  const ctrlOut = prog(frame, T_NOBODY + 30, 26);
  const ctrlOpacity = ctrlIn * (1 - ctrlOut);
  const ctrlScale = 0.85 + 0.15 * EASE_OUT(ctrlIn) + 0.25 * ctrlOut;

  // Out-of-sync pulsing once "nobody knows when anyone else wants to talk".
  const pulseOn = prog(frame, T_KNOWS, 15);

  return (
    <SceneFrame id="s07">
      {/* Real-life layer: the crowded stop */}
      <Stage opacity={streetIn * (1 - streetOut)}>
        <BusStopStreet>
          {CROWD.map((m, k) =>
            m.commuter ? (
              <Commuter key={k} x={m.x} y={m.y} scale={m.s} pose="phone" phoneGlow={1} opacity={1 - peopleOut} />
            ) : (
              <Person
                key={k}
                x={m.x}
                y={m.y}
                scale={m.s}
                facing={m.facing}
                pose={m.pose}
                phoneGlow={0.8}
                opacity={1 - peopleOut}
                {...crowdLook(m.look)}
              />
            ),
          )}
        </BusStopStreet>
      </Stage>

      {/* Scene 06 handoff: the last fragments of the collided bars */}
      {frame < 18 ? (
        <Stage opacity={1 - prog(frame, 0, 16)}>
          <PacketBar scale={sc} start={4.2} y={300} state="collision" shatter={shatterOut} seed="s06a" />
          <PacketBar scale={sc} start={4.8} y={345} state="collision" shatter={shatterOut} seed="s06b" />
        </Stage>
      ) : null}

      {/* Theory layer: the shared channel, the device ring, the missing controller */}
      <Stage>
        <ChannelRing progress={band} opacity={band > 0 ? 1 : 0} />
        {CROWD.map((_, k) => {
          const p = nodeOf(k);
          // faint link from each device to the channel
          const ang = Math.atan2(p.y - RC.y, p.x - RC.x);
          const ex = RC.x + (BAND_R + BAND_W / 2 + 6) * Math.cos(ang);
          const ey = RC.y + (BAND_R + BAND_W / 2 + 6) * Math.sin(ang);
          return (
            <line
              key={`l${k}`}
              x1={p.x}
              y1={p.y}
              x2={ex}
              y2={ey}
              stroke={COLORS.faint}
              strokeWidth={2.5}
              strokeDasharray="2 9"
              strokeLinecap="round"
              opacity={nodesIn}
            />
          );
        })}
        {CROWD.map((_, k) => {
          const p = nodeOf(k);
          const glow = 0.5 + 0.5 * Math.sin(frame / (5 + random(`g${k}`) * 6) + k);
          return <PhoneNode key={`p${k}`} x={p.x} y={p.y} opacity={nodesIn} glow={glow} />;
        })}

        {/* dashed "controller" circle: appears, then dissolves to nothing */}
        {ctrlOpacity > 0.001 ? (
          <g opacity={ctrlOpacity} transform={`translate(${RC.x} ${RC.y}) scale(${ctrlScale})`}>
            <circle
              r={CTRL_R}
              fill="none"
              stroke={COLORS.muted}
              strokeWidth={3}
              strokeDasharray={`${10 * (1 - ctrlOut) + 2} ${10 + 18 * ctrlOut}`}
              strokeLinecap="round"
            />
          </g>
        ) : null}

        {/* the "?" bubbles: over heads first, then on top of each device node */}
        {CROWD.map((m, k) => {
          const head = headBubble(m);
          const node = nodeOf(k);
          const stagger = Math.abs(k - (N - 1) / 2) * 1.5;
          const move = prog(frame, T_SHARE + 6 + stagger, 30);
          const x = lerp(head.x, node.x, move);
          const y = lerp(head.y, node.y - 48, move);
          const enter = pop(frame, 12 + k * 3);
          const appear = fade(frame, 12 + k * 3, 8);
          // out-of-sync pulse: each bubble has its own rate and phase
          const rate = 0.16 + random(`rate-${k}`) * 0.14;
          const phase = random(`phase-${k}`) * Math.PI * 2;
          const beat = Math.max(0, Math.sin(frame * rate + phase)) ** 3;
          const s = (0.62 + 0.38 * enter) * (m.s + (1 - m.s) * move) * (1 + 0.22 * beat * pulseOn);
          return <QBubble key={`q${k}`} x={x} y={y} scale={s} opacity={appear} tail={1} />;
        })}
      </Stage>

      {/* "no one in charge" label inside the dashed circle */}
      {ctrlOpacity > 0.001 ? (
        <div
          style={{
            position: "absolute",
            left: RC.x,
            top: RC.y,
            transform: `translate(-50%, -50%) scale(${ctrlScale})`,
            opacity: ctrlOpacity,
            fontFamily: FONT.sans,
            fontSize: 22,
            lineHeight: 1.15,
            color: COLORS.muted,
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          no one
          <br />
          in charge
        </div>
      ) : null}

      {/* Labels for the diagram */}
      <div
        style={{
          position: "absolute",
          left: RC.x,
          top: RC.y,
          transform: "translate(-50%, -50%)",
          opacity: band * (1 - prog(frame, T_NOBODY - 10, 8) + prog(frame, T_NOBODY + 52, 16)),
          fontFamily: FONT.sans,
          fontSize: 22,
          color: COLORS.muted,
          whiteSpace: "nowrap",
        }}
      >
        one channel
      </div>

      {/* The question, built line by line */}
      <Title x={640} y={64} start={T_SHARE} opacity={1}>
        How do you share one channel…
      </Title>
      <Title x={640} y={136} start={T_NOBODY + 2}>
        …with no one in charge?
      </Title>

      {/* Bridge into Scene 08 */}
      <Sequence from={STING_AT} durationInFrames={STING_LEN} name="Part 3 sting">
        <PartSting part={3} title="Aloha: the idea" durationInFrames={STING_LEN} />
      </Sequence>
    </SceneFrame>
  );
};
