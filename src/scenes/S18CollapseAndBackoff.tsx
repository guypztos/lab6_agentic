// Scene 18 — The collapse spiral, and backing off
// Brief: scenes/s18-collapse-and-backoff.md  ·  Shared brief: scenes/README.md  ·  Kit: src/shared/README.md
//
// Beats: S–G plot, ball wobbling just past the slotted peak → New Year's Eve square (bubbles fail, counters
// diverge) + the feedback loop → the counters fly onto the plot as G and S and the ball rolls into the jam →
// "back off" → phone retry countdown → the random wait range doubles 1 → 2 → 4 → 8 while the ball climbs back.
import React from "react";
import { Easing, random, Sequence, useCurrentFrame } from "remotion";
import {
  Caption,
  clamp01,
  COLORS,
  crowdLook,
  cue,
  Die,
  EASE,
  EASE_OUT,
  fade,
  FONT,
  ILLUS,
  Label,
  lerp,
  Mark,
  narrationEndFrame,
  PartSting,
  sceneDurationInFrames,
  Person,
  Phone,
  pop,
  prog,
  SceneFrame,
  sgCoords,
  SGPlot,
  slottedS,
  Stage,
  Stamp,
  useSvgId,
} from "../shared";

/** Extra seconds of picture after the narration tail. The scene length updates automatically. */
export const meta = { extraTail: 1.7 }; // room for the "Part 8 · Aloha today" sting

const ID = "s18" as const;

// ── timing (scene frames) ────────────────────────────────────────────────────────────────────────────
const T = {
  danger: cue(ID, "There's one more danger"),
  peak: cue(ID, "Past the peak"),
  nye: cue(ID, "Think of midnight"),
  failing: cue(ID, "messages keep failing"),
  retries: cue(ID, "More collisions mean more retries"),
  load: cue(ID, "more load"),
  evenMore: cue(ID, "and even more collisions"),
  spiral: cue(ID, "The channel can spiral"),
  cure: cue(ID, "The cure is to back off"),
  backOff: cue(ID, "back off"),
  keep: cue(ID, "When you keep colliding"),
  longer: cue(ID, "wait longer"),
  ethernet: cue(ID, "Ethernet, for example"),
  doubles: cue(ID, "doubles after every collision"),
  end: narrationEndFrame(ID),
};
/** Backoff steps: range 1, 2, 4, 8 (one per collision). */
const STEP = [0, 1, 2, 3].map((k) => T.ethernet + 12 + k * 30);
const STING = T.end + 12; // the "Part 8" sting runs from here to the last frame
const SCENE_END = sceneDurationInFrames(ID, meta.extraTail);
const PICK = [0, 1, 3, 5]; // the slot each die roll lands on
const DIE_FACE = [2, 5, 3, 6] as const;

// ── the S–G plot ─────────────────────────────────────────────────────────────────────────────────────
const PLOT_FULL = { x: 200, y: 110, w: 880, h: 460 };
const PLOT_SMALL = { x: 790, y: 170, w: 420, h: 300 };
const G_START = 1.25; // just right of the slotted peak
const G_JAM = 2.92;
const G_REST = 1.06;
const BACK_START = STEP[1];

function ballG(frame: number) {
  const down = prog(frame, T.spiral + 32, T.cure - 4 - (T.spiral + 32), Easing.bezier(0.55, 0, 0.35, 1));
  const back = prog(frame, BACK_START, T.end - 4 - BACK_START, EASE);
  const wobble = 0.045 * Math.sin(frame * 0.42) * (1 - down);
  return lerp(lerp(G_START, G_JAM, down), G_REST, back) + wobble;
}

// ── the counters ("messages in the air" = G, "delivered" = S) ────────────────────────────────────────
const LOAD0 = 0.9;
const LOAD1 = 6;
const loadAt = (f: number) => {
  const u = clamp01((f - T.nye) / (T.spiral - T.nye));
  return LOAD0 * Math.pow(LOAD1 / LOAD0, u);
};
const inAirAt = (f: number) => Math.round(800 * loadAt(f));
const deliveredAt = (f: number) => {
  const g = loadAt(f);
  return Math.round(400 * g * Math.exp(-g));
};
const fmt = (n: number) => n.toLocaleString("en-US");

// ── the New Year's Eve square (drawn in full-frame coordinates, then scaled) ─────────────────────────
type Guest = { x: number; y: number; s: number; facing: 1 | -1; look: number };
const BACK_ROW: Guest[] = [0, 1, 2, 3, 4, 5].map((i) => ({ x: 225 + i * 170, y: 600, s: 0.5, facing: i % 2 ? -1 : 1, look: i + 7 }));
const FRONT_ROW: Guest[] = [0, 1, 2, 3, 4, 5, 6].map((i) => ({ x: 130 + i * 170, y: 700, s: 0.62, facing: i % 3 === 1 ? -1 : 1, look: i }));
const GUESTS = [...BACK_ROW, ...FRONT_ROW];
const phoneOf = (g: Guest) => ({ x: g.x + g.facing * 42 * g.s, y: g.y - 248 * g.s });

type Bubble = { t: number; guest: number; retry: boolean; ok: boolean; dx: number };
const BUBBLES: Bubble[] = (() => {
  const out: Bubble[] = [];
  let t = T.nye + 16;
  let i = 0;
  while (t < T.spiral + 6) {
    const retry = t >= T.retries;
    out.push({
      t,
      guest: Math.floor(random(`s18-bg-${i}`) * GUESTS.length),
      retry,
      ok: random(`s18-bok-${i}`) < (retry ? 0.05 : 0.22),
      dx: (random(`s18-bdx-${i}`) - 0.5) * 70,
    });
    const crowding = clamp01((t - T.retries) / (T.spiral - T.retries));
    const gap = retry ? lerp(5, 2.4, crowding) : 8;
    t += gap * (0.6 + 0.8 * random(`s18-bgap-${i}`));
    i++;
  }
  return out;
})();
const LIFE = 58;
const FAIL_AT = 24;

const BubbleView: React.FC<{ b: Bubble; frame: number }> = ({ b, frame }) => {
  const a = frame - b.t;
  if (a < 0 || a > LIFE) return null;
  const p = phoneOf(GUESTS[b.guest]);
  const rise = EASE_OUT(clamp01(a / 42));
  const x = p.x + b.dx * rise;
  const y = p.y - 34 - rise * 190;
  const s = Math.min(1, pop(frame, b.t));
  const o = fade(frame, b.t, 5, b.t + LIFE - 12, 12);
  const judged = a >= FAIL_AT;
  const fill = judged && b.ok ? COLORS.success : b.retry ? COLORS.retry : COLORS.event;
  const w = 178;
  const h = 34;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={17} fill={fill} stroke={judged && !b.ok ? COLORS.collision : "none"} strokeWidth={4} />
      <path d={`M -10 ${h / 2 - 2} L -2 ${h / 2 + 10} L 6 ${h / 2 - 2} Z`} fill={fill} />
      <text x={0} y={6} fill={COLORS.bg} fontFamily={FONT.sans} fontSize={17} fontWeight={700} textAnchor="middle">
        Happy New Year! 🎉
      </text>
      {judged && !b.ok ? (
        <g opacity={clamp01((a - FAIL_AT) / 4)}>
          <rect x={-95} y={h / 2 + 8} width={190} height={26} rx={7} fill={COLORS.collision} />
          <text x={0} y={h / 2 + 26} fill={COLORS.ink} fontFamily={FONT.sans} fontSize={15} fontWeight={700} textAnchor="middle">
            Not delivered · Retry
          </text>
        </g>
      ) : null}
    </g>
  );
};

const FIREWORKS = [
  { x: 200, y: 130, off: 0, c: "#f472b6" },
  { x: 1080, y: 120, off: 14, c: "#fde68a" },
  { x: 400, y: 80, off: 27, c: "#ffffff" },
  { x: 900, y: 230, off: 38, c: "#f472b6" },
  { x: 300, y: 260, off: 47, c: "#fde68a" },
  { x: 1160, y: 270, off: 20, c: "#ffffff" },
];

const Firework: React.FC<{ f: (typeof FIREWORKS)[number]; frame: number }> = ({ f, frame }) => {
  const local = frame - (T.nye + 6) - f.off;
  if (local < 0) return null;
  const a = local % 56;
  const r = 78 * EASE_OUT(clamp01(a / 26));
  const o = 1 - clamp01((a - 16) / 22);
  return (
    <g opacity={o}>
      {Array.from({ length: 14 }, (_, j) => {
        const ang = (j / 14) * Math.PI * 2 + f.off;
        return (
          <line
            key={j}
            x1={f.x + Math.cos(ang) * r * 0.45}
            y1={f.y + Math.sin(ang) * r * 0.45}
            x2={f.x + Math.cos(ang) * r}
            y2={f.y + Math.sin(ang) * r + a * 0.4}
            stroke={f.c}
            strokeWidth={3}
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={f.x} cy={f.y} r={5 * (1 - clamp01(a / 12))} fill={f.c} />
    </g>
  );
};

const SKYLINE = Array.from({ length: 11 }, (_, i) => ({
  x: -20 + i * 128,
  w: 110 + random(`s18-sw-${i}`) * 30,
  h: 120 + random(`s18-sh-${i}`) * 150,
}));

const NYESquare: React.FC<{ frame: number }> = ({ frame }) => {
  const sky = useSvgId("nye-sky");
  const clip = useSvgId("nye-clip");
  const midnight = frame >= T.nye + 10;
  const flash = midnight ? 1 - clamp01((frame - T.nye - 10) / 18) : 0;
  const annoyed = frame >= T.failing + 10;
  return (
    <g>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#070c1c" />
          <stop offset="1" stopColor={ILLUS.skyLow} />
        </linearGradient>
        <clipPath id={clip}>
          <rect x={0} y={0} width={1280} height={720} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
      <rect x={0} y={0} width={1280} height={480} fill={`url(#${sky})`} />
      {FIREWORKS.map((f, i) => (
        <Firework key={i} f={f} frame={frame} />
      ))}
      {SKYLINE.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={480 - b.h} width={b.w} height={b.h} fill={i % 2 ? ILLUS.building : ILLUS.buildingHi} />
          {Array.from({ length: Math.floor(b.h / 40) }, (_, r) =>
            [0, 1, 2].map((c) => (
              <rect
                key={`${r}-${c}`}
                x={b.x + 14 + c * 32}
                y={480 - b.h + 16 + r * 40}
                width={14}
                height={18}
                rx={2}
                fill={random(`s18-w-${i}-${r}-${c}`) > 0.6 ? ILLUS.windowLit : ILLUS.windowDark}
                opacity={0.7}
              />
            )),
          )}
        </g>
      ))}
      {/* clock tower */}
      <rect x={555} y={70} width={170} height={410} fill={ILLUS.buildingHi} />
      <path d="M 545 74 L 640 20 L 735 74 Z" fill={ILLUS.building} />
      <rect x={500} y={104} width={280} height={112} rx={14} fill="#0b1220" stroke="#334155" strokeWidth={4} />
      <rect x={500} y={104} width={280} height={112} rx={14} fill={ILLUS.windowLit} opacity={0.25 * flash} />
      <text
        x={640}
        y={186}
        fill={ILLUS.windowLit}
        fontFamily={FONT.sans}
        fontWeight={800}
        fontSize={80}
        textAnchor="middle"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {midnight ? "00:00" : "23:59"}
      </text>
      {/* plaza */}
      <rect x={0} y={480} width={1280} height={240} fill={COLORS.panel} />
      <rect x={0} y={480} width={1280} height={6} fill="#334155" />
      {BACK_ROW.map((g, i) => (
        <Person key={`b${i}`} x={g.x} y={g.y} scale={g.s} facing={g.facing} pose="phoneUp" {...crowdLook(g.look)} expression={annoyed ? "annoyed" : "happy"} opacity={0.85} />
      ))}
      {FRONT_ROW.map((g, i) => (
        <Person key={`f${i}`} x={g.x} y={g.y} scale={g.s} facing={g.facing} pose="phoneUp" {...crowdLook(g.look)} expression={annoyed ? "annoyed" : "happy"} />
      ))}
      {BUBBLES.map((b, i) => (
        <BubbleView key={i} b={b} frame={frame} />
      ))}
      </g>
    </g>
  );
};

// ── the feedback loop ────────────────────────────────────────────────────────────────────────────────
const LOOP = { cx: 1035, cy: 400, r: 138 };
const NODES = [
  { a: -90, text: "collisions", color: COLORS.collision },
  { a: 30, text: "retries", color: COLORS.retry },
  { a: 150, text: "more load", color: COLORS.event },
];
const rad = (d: number) => (d * Math.PI) / 180;
const onLoop = (d: number) => ({ x: LOOP.cx + LOOP.r * Math.cos(rad(d)), y: LOOP.cy + LOOP.r * Math.sin(rad(d)) });

const LoopArrow: React.FC<{ from: number; p: number }> = ({ from, p }) => {
  if (p <= 0) return null;
  const a1 = from + 30;
  const a2 = from + 120 - 30;
  const s = onLoop(a1);
  const e = onLoop(a2);
  const dir = { x: -Math.sin(rad(a2)), y: Math.cos(rad(a2)) };
  const nrm = { x: -dir.y, y: dir.x };
  const tip = { x: e.x + dir.x * 12, y: e.y + dir.y * 12 };
  const head = `M ${tip.x} ${tip.y} L ${e.x - dir.x * 4 + nrm.x * 10} ${e.y - dir.y * 4 + nrm.y * 10} L ${e.x - dir.x * 4 - nrm.x * 10} ${e.y - dir.y * 4 - nrm.y * 10} Z`;
  return (
    <g>
      <path
        d={`M ${s.x} ${s.y} A ${LOOP.r} ${LOOP.r} 0 0 1 ${e.x} ${e.y}`}
        pathLength={100}
        strokeDasharray={100}
        strokeDashoffset={100 * (1 - clamp01(p))}
        stroke={COLORS.ink}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
      <path d={head} fill={COLORS.ink} opacity={clamp01((p - 0.85) * 8)} />
    </g>
  );
};

const FeedbackLoop: React.FC<{ frame: number }> = ({ frame }) => {
  const arrows = [prog(frame, T.retries + 4, 22), prog(frame, T.load - 4, 20), prog(frame, T.evenMore, 20)];
  const nodeIn = [T.retries - 2, T.retries + 18, T.load - 6];
  // once the loop is closed, a spark races round it, faster and faster
  const t0 = T.evenMore + 24;
  const u = Math.max(0, frame - t0);
  const sparkA = -90 + 360 * Math.pow(u / 44, 1.4);
  const spark = onLoop(sparkA);
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <LoopArrow key={i} from={NODES[i].a} p={arrows[i]} />
      ))}
      {u > 0 ? <circle cx={spark.x} cy={spark.y} r={8} fill={COLORS.collision} opacity={clamp01(u / 6)} /> : null}
      {NODES.map((n, i) => {
        const c = onLoop(n.a);
        const s = Math.min(1.05, pop(frame, nodeIn[i]));
        const w = n.text.length * 14 + 44;
        return (
          <g key={i} transform={`translate(${c.x} ${c.y}) scale(${s})`} opacity={clamp01((frame - nodeIn[i]) / 6)}>
            <rect x={-w / 2} y={-24} width={w} height={48} rx={24} fill={COLORS.panel} stroke={n.color} strokeWidth={3} />
            <text x={0} y={9} fill={n.color} fontFamily={FONT.sans} fontSize={26} fontWeight={700} textAnchor="middle">
              {n.text}
            </text>
          </g>
        );
      })}
    </g>
  );
};

// ── counters that turn into G and S ──────────────────────────────────────────────────────────────────
type Box = { x: number; y: number; w: number; h: number };
const lerpBox = (a: Box, b: Box, t: number): Box => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });

const CounterCard: React.FC<{ card: Box; pill: Box; m: number; label: string; value: string; arrow: string; pillText: string; color: string; opacity: number }> = ({
  card,
  pill,
  m,
  label,
  value,
  arrow,
  pillText,
  color,
  opacity,
}) => {
  if (opacity <= 0) return null;
  const b = lerpBox(card, pill, EASE(m));
  const cardText = clamp01(1 - m * 2.5);
  const pillTxt = clamp01(m * 2.5 - 1.5);
  return (
    <g opacity={opacity}>
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={lerp(14, b.h / 2, m)} fill={COLORS.panel} stroke={lerp(0, 1, m) > 0.5 ? color : COLORS.faint} strokeWidth={lerp(2, 3, m)} />
      <g opacity={cardText}>
        <text x={b.x + 18} y={b.y + 28} fill={COLORS.muted} fontFamily={FONT.sans} fontSize={18}>
          {label}
        </text>
        <text x={b.x + 18} y={b.y + 64} fill={color} fontFamily={FONT.sans} fontSize={32} fontWeight={800} style={{ fontVariantNumeric: "tabular-nums" }}>
          {value}
        </text>
        <text x={b.x + b.w - 20} y={b.y + 62} fill={color} fontFamily={FONT.sans} fontSize={28} fontWeight={800} textAnchor="end">
          {arrow}
        </text>
      </g>
      <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 7} opacity={pillTxt} fill={color} fontFamily={FONT.math} fontSize={22} fontWeight={700} textAnchor="middle">
        {pillText}
      </text>
    </g>
  );
};

// ── the phone's retry countdown ──────────────────────────────────────────────────────────────────────
const COUNTDOWN = [1, 2, 4, 8].map((n, k) => ({ n, t: T.keep + 10 + k * 22 }));

const RetryPhone: React.FC<{ frame: number; opacity: number }> = ({ frame, opacity }) => {
  if (opacity <= 0) return null;
  const cx = 330;
  const cy = 380;
  let k = -1;
  COUNTDOWN.forEach((c, i) => {
    if (frame >= c.t) k = i;
  });
  const c = k >= 0 ? COUNTDOWN[k] : null;
  return (
    <g opacity={opacity}>
      <Phone x={cx} y={cy} scale={1.05} message="" typed={1} frame={frame} />
      <g>
        <rect x={cx - 74} y={cy - 104} width={148} height={32} rx={14} fill={COLORS.event} stroke={COLORS.collision} strokeWidth={3} />
        <text x={cx} y={cy - 82} fill={COLORS.bg} fontFamily={FONT.sans} fontSize={14} fontWeight={700} textAnchor="middle">
          Happy New Year! 🎉
        </text>
        <text x={cx} y={cy - 50} fill={COLORS.collision} fontFamily={FONT.sans} fontSize={14} fontWeight={700} textAnchor="middle">
          Not delivered
        </text>
      </g>
      {c ? (
        <g transform={`translate(${cx} ${cy + 6}) scale(${Math.min(1.1, pop(frame, c.t))})`}>
          <text x={0} y={0} fill={COLORS.retry} fontFamily={FONT.sans} fontSize={19} fontWeight={700} textAnchor="middle">
            retrying in {c.n}s…
          </text>
        </g>
      ) : null}
      {/* one dot per wait so far: each wait is longer than the last */}
      {COUNTDOWN.map((d, i) =>
        k >= i ? <rect key={i} x={cx - 62} y={cy + 30 + i * 14} width={8 * d.n * clamp01((frame - d.t) / 10) + 4} height={8} rx={4} fill={COLORS.retry} opacity={0.85} /> : null,
      )}
      {k > 0 && frame - c!.t < 14 ? <Mark x={cx + 68} y={cy - 88} kind="cross" size={30} progress={prog(frame, c!.t - 4, 8)} /> : null}
    </g>
  );
};

// ── the random wait range: 1 → 2 → 4 → 8 slots ───────────────────────────────────────────────────────
const BAR = { x: 90, y: 400, slot: 60, h: 58 };

const BackoffBar: React.FC<{ frame: number; opacity: number }> = ({ frame, opacity }) => {
  if (opacity <= 0) return null;
  let k = -1;
  STEP.forEach((s, i) => {
    if (frame >= s) k = i;
  });
  let range = 1;
  for (let i = 1; i < 4; i++) range = lerp(range, Math.pow(2, i), prog(frame, STEP[i] + 6, 14));
  const top = BAR.y - BAR.h / 2;
  const roll = k >= 0 ? prog(frame, STEP[k] + 8, 20) : 0;
  const pickX = k >= 0 ? BAR.x + (PICK[k] + 0.5) * BAR.slot : 0;
  return (
    <g opacity={opacity}>
      {/* room for eight slots, faintly */}
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={BAR.x + i * BAR.slot} y={top} width={BAR.slot} height={BAR.h} fill="none" stroke={COLORS.faint} strokeWidth={2} opacity={0.6} />
      ))}
      {/* the current range */}
      {k >= 0 ? (
        <rect x={BAR.x} y={top} width={range * BAR.slot} height={BAR.h} rx={6} fill={COLORS.retry} fillOpacity={0.18} stroke={COLORS.retry} strokeWidth={3} />
      ) : null}
      {/* the slot the die picked */}
      {k >= 0 && roll >= 1 ? (
        <rect x={pickX - BAR.slot / 2 + 6} y={top + 8} width={BAR.slot - 12} height={BAR.h - 16} rx={6} fill={COLORS.retry} opacity={clamp01((frame - STEP[k] - 28) / 4)} />
      ) : null}
      {Array.from({ length: 8 }, (_, i) => (
        <text key={i} x={BAR.x + (i + 0.5) * BAR.slot} y={top + BAR.h + 28} fill={COLORS.muted} fontFamily={FONT.sans} fontSize={18} textAnchor="middle" opacity={clamp01(range - i)}>
          {i}
        </text>
      ))}
      <text x={BAR.x + range * BAR.slot + 14} y={BAR.y + 8} fill={COLORS.muted} fontFamily={FONT.sans} fontSize={20} opacity={k >= 0 ? 1 : 0}>
        slots
      </text>
      {/* a collision before each doubling */}
      {[1, 2, 3].map((i) =>
        frame >= STEP[i] - 4 && frame < STEP[i] + 18 ? (
          <Mark key={i} x={BAR.x - 46} y={BAR.y} kind="cross" size={38} progress={prog(frame, STEP[i] - 4, 8)} opacity={1 - prog(frame, STEP[i] + 10, 8)} />
        ) : null,
      )}
      {k >= 0 ? <Die x={pickX} y={top - 40} value={DIE_FACE[k]} roll={roll} size={46} seed={`s18-die-${k}`} /> : null}
    </g>
  );
};

// ── the scene ────────────────────────────────────────────────────────────────────────────────────────
export const S18CollapseAndBackoff: React.FC = () => {
  const frame = useCurrentFrame();

  // layers
  const squareOp = prog(frame, T.nye - 4, 12) * (1 - prog(frame, T.spiral, 14));
  const plotOp = clamp01(1 - prog(frame, T.nye - 4, 12) + prog(frame, T.spiral, 14));
  const squeeze = prog(frame, T.retries - 6, 20);
  const loopOp = fade(frame, T.retries - 4, 10) * (1 - prog(frame, T.spiral, 14));

  // plot geometry and ball
  const shrink = prog(frame, T.keep, 22);
  const box = lerpBox(PLOT_FULL, PLOT_SMALL, shrink);
  const { gx, sy } = sgCoords({ ...box, gMax: 3, sMax: 0.4 });
  const G = ballG(frame);
  const S = slottedS(G);
  // hand-off from Scene 17: its peak markers fade out before the ball arrives
  const peaksOut = 1 - prog(frame, 0, 12);

  // counters → G / S pills
  const m = prog(frame, T.spiral + 2, 28);
  const countersOp = fade(frame, T.nye + 10, 10) * (1 - prog(frame, T.cure + 12, 12));
  const f = Math.min(frame, T.spiral);
  const axisY = box.y + box.h;
  const guides = clamp01((m - 0.7) * 3.3) * (1 - prog(frame, T.cure + 12, 12));

  const phoneOp = fade(frame, T.keep + 6, 12, T.ethernet - 4, 10);
  const barOp = fade(frame, T.ethernet + 2, 12) * (1 - prog(frame, STING + 8, 4));

  return (
    <SceneFrame id={ID}>
      {/* the plot (opens and closes the scene) */}
      <Stage opacity={plotOp * (1 - prog(frame, STING + 8, 4))}>
        {/* no peak label here: the ball lives right next to the peak and would sit on top of it */}
        <SGPlot
          {...box}
          pure={1}
          slotted={1}
          purePeak={peaksOut}
          slottedPeak={peaksOut}
          ball={{ G, curve: "slotted", opacity: prog(frame, 8, 12) }}
        />
        {guides > 0 ? (
          <g opacity={guides} stroke={COLORS.muted} strokeWidth={2} strokeDasharray="5 6">
            <line x1={gx(G)} y1={sy(S) - 16} x2={gx(G)} y2={axisY} />
            <line x1={box.x} y1={sy(S) - 16} x2={gx(G) - 16} y2={sy(S) - 16} />
          </g>
        ) : null}
      </Stage>

      {/* New Year's Eve square, which slides left to make room for the loop */}
      {squareOp > 0 ? (
        <Stage opacity={squareOp}>
          <g transform={`translate(${lerp(0, 24, squeeze)} ${lerp(0, 150, squeeze)}) scale(${lerp(1, 0.6, squeeze)})`}>
            <NYESquare frame={frame} />
            <rect x={0} y={0} width={1280} height={720} fill="none" stroke={COLORS.faint} strokeWidth={lerp(0, 4, squeeze)} rx={lerp(0, 20, squeeze)} />
          </g>
        </Stage>
      ) : null}
      {loopOp > 0 ? (
        <Stage opacity={loopOp}>
          <FeedbackLoop frame={frame} />
        </Stage>
      ) : null}

      {/* the two counters: they become the ball's G and S */}
      <Stage>
        <CounterCard
          card={{ x: 28, y: 24, w: 290, h: 84 }}
          pill={{ x: gx(G) - 62, y: axisY - 18, w: 124, h: 36 }}
          m={m}
          label="messages in the air"
          value={fmt(inAirAt(f))}
          arrow="▲"
          pillText={`G = ${G.toFixed(1)}`}
          color={COLORS.event}
          opacity={countersOp}
        />
        <CounterCard
          card={{ x: 962, y: 24, w: 290, h: 84 }}
          pill={{ x: box.x - 62, y: sy(S) - 34, w: 124, h: 36 }}
          m={m}
          label="delivered"
          value={fmt(deliveredAt(f))}
          arrow="▼"
          pillText={`S = ${S.toFixed(2)}`}
          color={COLORS.success}
          opacity={countersOp}
        />
      </Stage>

      {/* backing off */}
      <Stamp x={640} y={330} start={T.backOff} color={COLORS.retry} opacity={1 - prog(frame, T.keep, 10)}>
        back off
      </Stamp>
      <Stage>
        <RetryPhone frame={frame} opacity={phoneOp} />
        <BackoffBar frame={frame} opacity={barOp} />
      </Stage>
      {barOp > 0 ? (
        <Label x={BAR.x - 10} y={250} anchor="left" size={30} weight={600} opacity={barOp}>
          random wait range:{" "}
          {[1, 2, 4, 8].map((n, i) => (
            <span key={n} style={{ color: COLORS.retry, fontWeight: 800, opacity: clamp01((frame - STEP[i] - 6) / 8) }}>
              {i > 0 ? " → " : ""}
              {n}
            </span>
          ))}
        </Label>
      ) : null}
      {barOp > 0 ? (
        <Caption start={T.ethernet + 8} color={COLORS.muted} opacity={barOp}>
          <i>Ethernet: binary exponential backoff</i>
        </Caption>
      ) : null}

      {/* hand-off to Part 8: the sting covers the rest of the scene (it fades out on the last frames into Scene 19) */}
      <Sequence from={STING} durationInFrames={SCENE_END - STING} layout="none">
        <PartSting part={8} title="Aloha today" durationInFrames={SCENE_END - STING} />
      </Sequence>
    </SceneFrame>
  );
};
