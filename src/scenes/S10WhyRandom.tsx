// Scene 10 — Why the wait must be random
// Brief: scenes/s10-why-random.md  ·  Shared brief: scenes/README.md  ·  Kit: src/shared/README.md
//
// Beats: Rule 3's "random" pulls out → the hallway dance (Talkers A and B as walkers) → the corridor shrinks to the
// top half while two timelines run in sync below it: "same delay" collides forever, "random delay" separates.
import React from "react";
import { Sequence, useCurrentFrame } from "remotion";
import {
  Bracket,
  clamp01,
  COLORS,
  cue,
  Die,
  fade,
  FONT,
  ILLUS,
  Label,
  lerp,
  Mark,
  PacketBar,
  PartSting,
  pop,
  prog,
  RuleChip,
  sceneDurationInFrames,
  SceneFrame,
  SIZE,
  Stage,
  Talker,
  Timeline,
  timeScale,
  type PacketState,
  useSvgId,
} from "../shared";

/** Extra seconds of picture after the narration tail. The scene length updates automatically. */
export const meta = { extraTail: 2.0 };

const ID = "s10" as const;

// ── narration cues ────────────────────────────────────────────────────────────
const C = {
  why: cue(ID, "Why random"),
  hallway: cue(ID, "You've probably done this in a hallway"),
  stepLeft: cue(ID, "You step left"),
  theyLeft: cue(ID, "they step left too"),
  bothRight: cue(ID, "You both step right"),
  again: cue(ID, "Again"),
  terminals: cue(ID, "Two terminals that wait exactly"),
  forever: cue(ID, "dance forever"),
  randomDelay: cue(ID, "But if each one picks a random delay"),
  almost: cue(ID, "theyll almost certainly"),
  different: cue(ID, "retry at different times"),
};
const TOTAL = sceneDurationInFrames(ID, meta.extraTail);
const STING = 54;
const STING_AT = TOTAL - STING;

// The fixed-delay loop: each collision on the left timeline is one more mirrored sidestep in the hallway.
const LOOP_T = [0, 2, 4, 6]; // collision times on the "same delay" timeline (packet 1 + wait 1)
const LOOP_F = [C.terminals + 20, C.terminals + 55, C.terminals + 90, C.terminals + 125];

// The random-delay outcome: A rolls 1, B rolls 4 → A retries at t=2, B at t=5.
const R = {
  collide: C.randomDelay + 4,
  roll: C.randomDelay + 18,
  rollDur: 30,
  aRetry: C.randomDelay + 50, // A's retry starts transmitting
  bRetry: C.different - 4, // B's retry starts transmitting
};
const A_OK = R.aRetry + 18;
const B_OK = R.bRetry + 18;

// ── corridor choreography ─────────────────────────────────────────────────────
// lane −1 = far side of the corridor, 0 = middle, +1 = near side.
type Step = { at: number; to: number };
const STEP_DUR = 10;
const A_STEPS: Step[] = [
  { at: C.stepLeft + 4, to: -1 },
  { at: C.bothRight, to: 1 },
  { at: C.again, to: -1 },
  { at: LOOP_F[0], to: 1 },
  { at: LOOP_F[1], to: -1 },
  { at: LOOP_F[2], to: 1 },
  { at: LOOP_F[3], to: -1 },
  { at: R.aRetry - 12, to: 1 }, // A's short random wait is over: step aside and go
];
const B_STEPS: Step[] = [
  { at: C.theyLeft, to: -1 },
  { at: C.bothRight, to: 1 },
  { at: C.again, to: -1 },
  { at: LOOP_F[0], to: 1 },
  { at: LOOP_F[1], to: -1 },
  { at: LOOP_F[2], to: 1 },
  { at: LOOP_F[3], to: -1 },
  // B pauses here (its longer random delay), then walks on once A is past.
];

function laneAt(steps: Step[], frame: number): { lane: number; moving: number } {
  let lane = 0;
  let moving = 0;
  for (const s of steps) {
    const p = prog(frame, s.at, STEP_DUR);
    lane = lerp(lane, s.to, p);
    if (p > 0 && p < 1) moving = Math.sin(p * Math.PI);
  }
  return { lane, moving };
}

const laneY = (lane: number) => 565 + lane * 82;
const laneS = (lane: number) => 1 + lane * 0.09;

const Corridor: React.FC = () => (
  <g>
    {/* frame */}
    <rect x={20} y={20} width={1240} height={680} rx={28} fill={ILLUS.building} />
    {/* back wall */}
    <rect x={20} y={20} width={1240} height={400} rx={28} fill={ILLUS.building} />
    {/* ceiling lights */}
    {[220, 640, 1060].map((x) => (
      <g key={x}>
        <rect x={x - 90} y={40} width={180} height={12} rx={6} fill={ILLUS.windowLit} opacity={0.55} />
        <path d={`M ${x - 90} 52 L ${x - 160} 200 L ${x + 160} 200 L ${x + 90} 52 Z`} fill={ILLUS.windowLit} opacity={0.035} />
      </g>
    ))}
    {/* doors */}
    {[140, 920].map((x) => (
      <g key={x}>
        <rect x={x} y={170} width={120} height={250} rx={6} fill={ILLUS.buildingHi} />
        <rect x={x + 14} y={186} width={92} height={70} rx={4} fill={ILLUS.windowDark} />
        <circle cx={x + 100} cy={310} r={6} fill={ILLUS.metal} />
      </g>
    ))}
    {/* notice board + posters */}
    <rect x={420} y={150} width={200} height={130} rx={8} fill={ILLUS.buildingHi} />
    <rect x={440} y={168} width={70} height={90} rx={4} fill={ILLUS.windowDark} />
    <rect x={526} y={168} width={76} height={44} rx={4} fill={ILLUS.windowDark} />
    <rect x={526} y={222} width={76} height={36} rx={4} fill={ILLUS.windowDark} />
    <rect x={700} y={170} width={110} height={150} rx={8} fill={ILLUS.buildingHi} />
    <circle cx={755} cy={230} r={32} fill={ILLUS.windowDark} />
    <rect x={1120} y={200} width={80} height={110} rx={8} fill={ILLUS.buildingHi} />
    {/* floor */}
    <path d="M 20 420 H 1260 V 672 Q 1260 700 1232 700 H 48 Q 20 700 20 672 Z" fill={COLORS.panel} />
    <rect x={20} y={414} width={1240} height={10} fill={ILLUS.buildingHi} />
    {[470, 545, 625].map((y, i) => (
      <line key={y} x1={40} y1={y + 20} x2={1240} y2={y + 20} stroke={COLORS.faint} strokeWidth={1.5} opacity={0.18 + i * 0.05} />
    ))}
  </g>
);

/** A small red "bump" spark between the walkers when they block each other (the hallway's collision). */
const Bump: React.FC<{ x: number; y: number; p: number }> = ({ x, y, p }) => {
  if (p <= 0 || p >= 1) return null;
  const a = Math.sin(p * Math.PI);
  return (
    <g transform={`translate(${x} ${y})`} opacity={a}>
      {Array.from({ length: 6 }, (_, i) => {
        const ang = (i / 6) * Math.PI * 2;
        const r0 = 10 + 10 * p;
        const r1 = 22 + 18 * p;
        return (
          <line
            key={i}
            x1={Math.cos(ang) * r0}
            y1={Math.sin(ang) * r0}
            x2={Math.cos(ang) * r1}
            y2={Math.sin(ang) * r1}
            stroke={COLORS.collision}
            strokeWidth={5}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};

const Hallway: React.FC<{ frame: number }> = ({ frame }) => {
  // Approach.
  const enter = prog(frame, C.hallway, 56);
  const ax0 = lerp(-90, 540, enter);
  const bx0 = lerp(1370, 740, enter);
  // A goes past after its short random wait; B goes after its longer one.
  const aGo = prog(frame, R.aRetry - 2, 80, (t) => t);
  const bGo = prog(frame, R.bRetry + 6, 80, (t) => t);
  const ax = ax0 + aGo * 820;
  const bx = bx0 - bGo * 880;

  const A = laneAt(A_STEPS, frame);
  const B = laneAt(B_STEPS, frame);

  const walkingA = (enter > 0 && enter < 1) || (aGo > 0 && aGo < 1);
  const walkingB = (enter > 0 && enter < 1) || (bGo > 0 && bGo < 1);
  const stuck = frame >= C.again && frame < R.aRetry - 12;
  const shrug = (f: number) => (f >= C.again + 8 && f < C.terminals + 6) || (f >= LOOP_F[3] + 12 && f < C.randomDelay);
  const passed = frame >= R.aRetry + 20;

  const poseOf = (walking: boolean, moving: number, f: number) =>
    walking || moving > 0.05 ? ("walk" as const) : shrug(f) ? ("shrug" as const) : ("stand" as const);
  const exprOf = (who: "A" | "B") =>
    passed ? ("happy" as const) : stuck && !(who === "B" && frame >= C.randomDelay) ? ("annoyed" as const) : ("neutral" as const);

  const walkers = [
    {
      who: "A" as const,
      x: ax,
      lane: A.lane,
      facing: 1 as const,
      pose: poseOf(walkingA, A.moving, frame),
      phase: frame * 0.32,
    },
    {
      who: "B" as const,
      x: bx,
      lane: B.lane,
      facing: -1 as const,
      pose: poseOf(walkingB, B.moving, frame),
      phase: frame * 0.32 + 1.3,
    },
  ].sort((p, q) => p.lane - q.lane);

  // A bump spark at each mirrored sidestep in the fixed-delay loop, and on the first blocks.
  const bumps = [C.stepLeft + 40, C.theyLeft + 10, C.bothRight + 10, C.again + 10, ...LOOP_F.map((f) => f + 10)];
  const midX = (ax + bx) / 2;
  const midY = laneY((A.lane + B.lane) / 2) - 150;

  const clip = useSvgId("s10-corridor");
  return (
    <g>
      <defs>
        <clipPath id={clip}>
          <rect x={20} y={20} width={1240} height={680} rx={28} />
        </clipPath>
      </defs>
      <Corridor />
      <g clipPath={`url(#${clip})`}>
      {walkers.map((w) => (
        <Talker
          key={w.who}
          who={w.who}
          x={w.x}
          y={laneY(w.lane)}
          scale={laneS(w.lane)}
          facing={w.facing}
          pose={w.pose}
          walkPhase={w.phase}
          holding="none"
          expression={exprOf(w.who)}
        />
      ))}
      </g>
      {bumps.map((b, i) => (
        <Bump key={i} x={midX} y={midY} p={prog(frame, b, 16, (t) => t)} />
      ))}
      {/* B's pause: a little "…" while A goes */}
      <g opacity={fade(frame, R.aRetry - 10, 8, R.bRetry + 4, 8)}>
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx={bx - 18 + i * 18}
            cy={laneY(B.lane) - 290}
            r={6}
            fill={COLORS.ink}
            opacity={0.35 + 0.65 * clamp01(Math.sin(frame / 5 - i * 0.9) * 0.5 + 0.5)}
          />
        ))}
      </g>
    </g>
  );
};

// ── timelines ─────────────────────────────────────────────────────────────────
const ROW = { A: 478, B: 526 };
const AXIS_Y = 572;
const L = timeScale(0, 8, 70, 590);
const RT = timeScale(0, 7, 700, 1200);

const RowLabels: React.FC<{ x: number; opacity: number }> = ({ x, opacity }) => (
  <g opacity={opacity} fontFamily={FONT.sans} fontWeight={700} fontSize={SIZE.label} textAnchor="end">
    <text x={x} y={ROW.A + 8} fill={ILLUS.talkerA}>
      A
    </text>
    <text x={x} y={ROW.B + 8} fill={ILLUS.talkerB}>
      B
    </text>
  </g>
);

const SameDelay: React.FC<{ frame: number; show: number }> = ({ frame, show }) => (
  <g opacity={show}>
    <RowLabels x={L.x0 - 14} opacity={1} />
    <Timeline scale={L} y={AXIS_Y} tickEvery={1} progress={prog(frame, C.terminals, 20)} />
    {LOOP_T.map((t, k) => {
      const f = LOOP_F[k];
      if (frame < f - 10) return null;
      const st: PacketState = k === 0 ? "attempt" : "retry";
      const fill = prog(frame, f - 10, 10, (x) => x);
      const mix = prog(frame, f, 8);
      return (
        <g key={t}>
          <PacketBar scale={L} start={t} y={ROW.A} h={34} state={st} toState="collision" mix={mix} fill={fill} edge={ILLUS.talkerA} />
          <PacketBar scale={L} start={t} y={ROW.B} h={34} state={st} toState="collision" mix={mix} fill={fill} edge={ILLUS.talkerB} />
          {k > 0 ? (
            <Bracket
              x1={L(t - 1) + 3}
              x2={L(t) - 3}
              y={AXIS_Y + 20}
              side="below"
              label="wait 1"
              size={SIZE.small}
              color={COLORS.muted}
              progress={prog(frame, f - 16, 10)}
            />
          ) : null}
        </g>
      );
    })}
  </g>
);

const RandomDelay: React.FC<{ frame: number; show: number }> = ({ frame, show }) => {
  const colMix = prog(frame, R.collide, 8);
  const colFill = prog(frame, R.collide - 10, 10, (x) => x);
  const aMix = prog(frame, A_OK - 4, 8);
  const bMix = prog(frame, B_OK - 4, 8);
  return (
    <g opacity={show}>
      <RowLabels x={RT.x0 - 14} opacity={1} />
      <Timeline scale={RT} y={AXIS_Y} tickEvery={1} progress={prog(frame, C.randomDelay - 12, 18)} />
      <PacketBar scale={RT} start={0} y={ROW.A} h={34} state="attempt" toState="collision" mix={colMix} fill={colFill} edge={ILLUS.talkerA} />
      <PacketBar scale={RT} start={0} y={ROW.B} h={34} state="attempt" toState="collision" mix={colMix} fill={colFill} edge={ILLUS.talkerB} />
      {/* each rolls its own die */}
      <Die x={RT(1.5)} y={AXIS_Y + 56} size={40} value={1} roll={prog(frame, R.roll, R.rollDur, (x) => x)} seed="s10-a" color={ILLUS.talkerA} opacity={fade(frame, R.roll, 6)} />
      <Die x={RT(3.0)} y={AXIS_Y + 56} size={40} value={4} roll={prog(frame, R.roll + 4, R.rollDur, (x) => x)} seed="s10-b" color={ILLUS.talkerB} opacity={fade(frame, R.roll + 4, 6)} />
      {/* the waits the dice chose */}
      <g opacity={fade(frame, R.roll + R.rollDur, 10)}>
        <line x1={RT(1)} y1={ROW.A} x2={RT(2)} y2={ROW.A} stroke={COLORS.retry} strokeWidth={2.5} strokeDasharray="4 7" strokeLinecap="round" />
        <line x1={RT(1)} y1={ROW.B} x2={RT(5)} y2={ROW.B} stroke={COLORS.retry} strokeWidth={2.5} strokeDasharray="4 7" strokeLinecap="round" />
      </g>
      {frame >= R.aRetry ? (
        <PacketBar scale={RT} start={2} y={ROW.A} h={34} state="retry" toState="success" mix={aMix} fill={prog(frame, R.aRetry, 14, (x) => x)} edge={ILLUS.talkerA} />
      ) : null}
      {frame >= R.bRetry ? (
        <PacketBar scale={RT} start={5} y={ROW.B} h={34} state="retry" toState="success" mix={bMix} fill={prog(frame, R.bRetry, 14, (x) => x)} edge={ILLUS.talkerB} />
      ) : null}
      <Mark x={RT(3) + 30} y={ROW.A} size={40} progress={prog(frame, A_OK, 12)} />
      <Mark x={RT(6) + 30} y={ROW.B} size={40} progress={prog(frame, B_OK, 12)} />
    </g>
  );
};

// ── the scene ─────────────────────────────────────────────────────────────────
export const S10WhyRandom: React.FC = () => {
  const frame = useCurrentFrame();

  // Opening: Rule 3's chip from Scene 09; "random" lights up and pulls out to centre stage.
  const hi = prog(frame, C.why, 10);
  const chipOut = 1 - prog(frame, C.why + 26, 14);
  const bigIn = pop(frame, C.why + 4);
  const bigOut = 1 - prog(frame, C.hallway - 4, 12);
  const big = clamp01(bigIn) * bigOut;
  const bigY = lerp(560, 330, clamp01(bigIn));
  const bigX = lerp(330, 640, clamp01(bigIn));

  // The corridor fades in, then shrinks into the top half when the terminals' timelines arrive.
  const corridorIn = fade(frame, C.hallway - 6, 14);
  const shrink = prog(frame, C.terminals - 6, 26);
  const k = lerp(1, 0.52, shrink);
  const tx = lerp(0, 640 - 640 * 0.52, shrink);
  const ty = lerp(0, 6, shrink);

  const leftShow = fade(frame, C.terminals + 6, 14);
  const rightShow = fade(frame, C.randomDelay - 14, 14);
  const count = LOOP_F.filter((f) => frame >= f).length;
  const infinity = frame >= C.forever + 4;

  return (
    <SceneFrame id={ID}>
      {/* Once the Part 4 sting is fully opaque the scene underneath is retired, so the sting fades out to the
          plain background (not back onto the hallway) and Scene 11 fades in from there. */}
      {frame < STING_AT + 10 ? (
      <>
      {/* opening chip */}
      <RuleChip n={3} x={40} y={560} color={COLORS.retry} opacity={chipOut}>
        No ACK? → wait a{" "}
        <span
          style={{
            color: hi > 0 ? COLORS.retry : undefined,
            fontWeight: hi > 0.5 ? 800 : undefined,
            display: "inline-block",
            transform: `scale(${1 + 0.25 * Math.sin(hi * Math.PI)})`,
          }}
        >
          random
        </span>{" "}
        time → resend
      </RuleChip>
      {big > 0.001 ? (
        <Label x={bigX} y={bigY} size={lerp(28, 120, clamp01(bigIn))} weight={800} color={COLORS.retry} opacity={big}>
          random?
        </Label>
      ) : null}

      {/* hallway */}
      <Stage opacity={corridorIn}>
        <g transform={`translate(${tx} ${ty}) scale(${k})`}>
          <Hallway frame={frame} />
        </g>
        <line x1={640} y1={396} x2={640} y2={700} stroke={COLORS.faint} strokeWidth={2} opacity={leftShow} />
        <SameDelay frame={frame} show={leftShow} />
        <RandomDelay frame={frame} show={rightShow} />
      </Stage>

      {/* timeline labels */}
      <Label x={L.x0} y={420} anchor="left" size={SIZE.caption} weight={700} color={COLORS.ink} opacity={leftShow}>
        same delay
      </Label>
      <Label x={L.x1} y={420} anchor="right" size={SIZE.caption} weight={800} color={COLORS.collision} opacity={leftShow * (count > 0 ? 1 : 0)}>
        {infinity ? "× ∞" : `× ${count}`}
      </Label>
      <Label
        x={(L.x0 + L.x1) / 2}
        y={672}
        size={SIZE.caption}
        italic
        weight={600}
        color={COLORS.collision}
        start={C.forever + 4}
        opacity={leftShow}
      >
        forever…
      </Label>
      <Label x={RT.x0} y={420} anchor="left" size={SIZE.caption} weight={700} color={COLORS.ink} opacity={rightShow}>
        random delay
      </Label>
      <Label x={RT.x1} y={420} anchor="right" size={SIZE.caption} weight={800} color={COLORS.success} opacity={rightShow * fade(frame, B_OK + 6, 10)}>
        ✓ ✓
      </Label>
      </>
      ) : null}

      {/* hand-off to Part 4 */}
      <Sequence from={STING_AT} durationInFrames={STING} layout="none" name="Part 4 sting">
        <PartSting part={4} title="Building the model" durationInFrames={STING} />
      </Sequence>
    </SceneFrame>
  );
};
