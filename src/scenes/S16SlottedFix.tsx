// Scene 16 — The fix: add a clock
// Brief: scenes/s16-slotted-fix.md  ·  Shared brief: scenes/README.md  ·  Kit: src/shared/README.md
//
// Flow: the S–G plot dims → a ticking clock (L. Roberts, 1972) → slot ticks draw on the packet timeline and
// floating packets snap to the next slot start → a meeting-room calendar, first "any minute", then snapping to
// "by the hour" (same easing as the packet snap) → the calendar's hour rows rotate 90° into the slot grid, its
// bookings becoming packets → the vulnerable window shrinks from [−1, +1] to [0, 1].
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  SceneFrame,
  Stage,
  SGPlot,
  Timeline,
  SlotGrid,
  PacketBar,
  Interval,
  Bracket,
  Mark,
  Label,
  timeScale,
  cue,
  prog,
  fade,
  pop,
  lerp,
  clamp01,
  classifyPackets,
  COLORS,
  FONT,
  EASE,
  EASE_OUT,
  type PacketState,
} from "../shared";

/** Extra seconds of picture after the narration tail. The scene length updates automatically. */
export const meta = { extraTail: 0.8 };

// ---- cues ----
const C = {
  roberts: cue("s16", "A year later"),
  clock: cue("s16", "Add a clock"),
  split: cue("s16", "Split time into slots"),
  start: cue("s16", "and let packets start only"),
  room: cue("s16", "It's like a meeting room"),
  byHour: cue("s16", "book by the hour"),
  either: cue("s16", "Either two people pick the same hour"),
  never: cue("s16", "or they never clash at all"),
  half: cue("s16", "No more half overlaps"),
  shrinks: cue("s16", "The vulnerable window shrinks"),
  justOne: cue("s16", "to just one"),
};

/** One snap motion for packets and bookings alike (same easing, same duration). */
const SNAP_DUR = 24;
const snap = (frame: number, start: number) => prog(frame, start, SNAP_DUR, EASE);

// ---- the packet timeline (same geometry before and after the calendar) ----
const TL = timeScale(-3, 5, 140, 1140); // 8 slots, 125 px per frame time
const LANE = [352, 308];
const AXIS_Y = 400;
const SLOT_Y1 = 284;
const SLOT_Y2 = 376;

// Floating packets (any start time) → each waits for the next slot boundary.
const FLOATING = [
  { id: "a", t: -2.6, lane: 0 },
  { id: "c", t: -1.15, lane: 0 },
  { id: "d", t: 1.6, lane: 0 },
  { id: "b", t: -1.5, lane: 1 },
  { id: "m", t: -0.35, lane: 1 },
  { id: "e", t: 2.2, lane: 1 },
];
const SNAPPED = FLOATING.map((p) => ({ ...p, slot: Math.ceil(p.t - 1e-9) }));
const OK = new Map(
  classifyPackets(SNAPPED.map((p, i) => ({ start: p.t, source: i })), 1, "slotted").map((r) => [r.source, r.ok]),
);

// ---- the meeting-room calendar (day view, 9:00 → 17:00) ----
const CAL = { top: 190, hourH: 56, hours: 8, colX0: 470, colW: 360, labelX: 452, card: { x: 380, y: 140, w: 480, h: 512 } };
const CAL_CX = CAL.colX0 + CAL.colW / 2; // 650
const CAL_CY = CAL.top + (CAL.hours * CAL.hourH) / 2; // 414
const HALF_W = (CAL.colW - 24) / 2; // 168
const FULL_W = CAL.colW - 16; // 344
type Col = 0 | 1 | "full";
const colX = (c: Col) => (c === 1 ? CAL.colX0 + 16 + HALF_W : CAL.colX0 + 8);
const colW = (c: Col) => (c === "full" ? FULL_W : HALF_W);

// minutes after 9:00. Any-minute mode → snapped to the nearest hour.
const BOOKINGS: { min: number; col: Col; to: number; toCol: Col }[] = [
  { min: 10, col: 0, to: 0, toCol: 0 },
  { min: 25, col: 1, to: 0, toCol: 1 }, // same hour as the one above → double-booked
  { min: 80, col: 0, to: 60, toCol: "full" },
  { min: 110, col: 1, to: 120, toCol: "full" },
  { min: 255, col: 0, to: 240, toCol: "full" },
  { min: 285, col: 1, to: 300, toCol: "full" },
  { min: 400, col: "full", to: 420, toCol: "full" },
];
const overlaps = (a: number, b: number) => Math.abs(a - b) < 60;
const clashBefore = BOOKINGS.map((b, i) => BOOKINGS.some((o, j) => j !== i && overlaps(b.min, o.min)));
const clashAfter = BOOKINGS.map((b, i) => BOOKINGS.some((o, j) => j !== i && o.to === b.to));

// The rotation that turns the calendar into the timeline: hour rows → slot boundaries.
//   time (calendar y) → timeline x;   column (calendar x) → a thin band around the packet lanes.
const ROT = { px: TL(1) - TL(0) /* 125 */, sy: (TL(1) - TL(0)) / CAL.hourH, sx: 0.25, Px: 640, Py: 330 };

/** A little alarm-style clock that ticks once per "slot". */
const Clock: React.FC<{ x: number; y: number; scale: number; frame: number; ring: number; opacity: number }> = ({
  x,
  y,
  scale,
  frame,
  ring,
  opacity,
}) => {
  const step = Math.floor(frame / 15);
  const angle = 30 * (step + prog(frame % 15, 0, 4, EASE_OUT));
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      {ring > 0 && ring < 1 ? (
        <circle r={74 + 50 * EASE_OUT(ring)} fill="none" stroke={COLORS.slotted} strokeWidth={5} opacity={1 - ring} />
      ) : null}
      <rect x={-8} y={-92} width={16} height={18} rx={4} fill={COLORS.muted} />
      <circle r={72} fill={COLORS.panel} stroke={COLORS.ink} strokeWidth={7} />
      {Array.from({ length: 12 }, (_, i) => (
        <line
          key={i}
          x1={0}
          y1={-58}
          x2={0}
          y2={i % 3 === 0 ? -44 : -50}
          stroke={COLORS.slotted}
          strokeWidth={i % 3 === 0 ? 5 : 3}
          strokeLinecap="round"
          transform={`rotate(${i * 30})`}
        />
      ))}
      <line x1={0} y1={0} x2={0} y2={-30} stroke={COLORS.muted} strokeWidth={6} strokeLinecap="round" transform="rotate(300)" />
      <line x1={0} y1={8} x2={0} y2={-50} stroke={COLORS.ink} strokeWidth={4} strokeLinecap="round" transform={`rotate(${angle})`} />
      <circle r={7} fill={COLORS.slotted} />
    </g>
  );
};

export const S16SlottedFix: React.FC = () => {
  const frame = useCurrentFrame();

  // ---- phase timings ----
  const plotOut = 1 - prog(frame, 0, 24);
  const clockIn = pop(frame, C.roberts + 24);
  const toCorner = prog(frame, C.split - 4, 30);
  const tick = clamp01((frame - C.clock) / 26);

  const aIn = fade(frame, C.split, 12) * (1 - prog(frame, C.room - 10, 14));
  const axisDraw = prog(frame, C.split, 26);
  const slotsDraw = prog(frame, C.split + 14, 40);
  const pSnap = snap(frame, C.start);
  const pColor = prog(frame, C.start + SNAP_DUR + 2, 14);

  const calIn = fade(frame, C.room, 14);
  const cSnap = snap(frame, C.byHour);
  const rot = prog(frame, C.half, 38, EASE);
  const rotEnd = C.half + 38;
  const calOut = 1 - prog(frame, rotEnd - 4, 10);
  const cIn = prog(frame, rotEnd - 8, 10);

  const focus = prog(frame, C.shrinks, 16);
  const winIn = prog(frame, C.shrinks + 8, 18);
  const shrink = prog(frame, C.justOne - 26, 30);
  const winLabel = fade(frame, C.shrinks + 22, 12);

  // ---- clock + caption positions ----
  const clockX = lerp(640, 74, toCorner);
  const clockY = lerp(232, 78, toCorner);
  const clockS = lerp(1.15, 0.5, toCorner) * (0.85 + 0.15 * clockIn) * (1 + 0.08 * Math.sin(Math.PI * clamp01(tick * 2)));

  return (
    <SceneFrame id="s16">
      <AbsoluteFill>
        {/* Scene 15's plot, dimming away */}
        {plotOut > 0 ? (
          <Stage opacity={plotOut}>
            <SGPlot x={170} y={200} w={640} h={400} pure={1} purePeak={1} />
          </Stage>
        ) : null}

        {/* the clock */}
        <Stage>
          <Clock x={clockX} y={clockY} scale={clockS} frame={frame} ring={tick} opacity={Math.min(1, clockIn * 1.4)} />
        </Stage>
        <div
          style={{
            position: "absolute",
            left: lerp(640, 122, toCorner),
            top: lerp(368, 78, toCorner),
            transform: `translate(${lerp(-50, 0, toCorner)}%, -50%)`,
            fontFamily: FONT.sans,
            fontStyle: "italic",
            fontSize: lerp(36, 26, toCorner),
            color: COLORS.ink,
            whiteSpace: "nowrap",
            opacity: fade(frame, C.roberts + 6, 14),
          }}
        >
          <span style={{ color: COLORS.slotted, fontWeight: 700 }}>Slotted Aloha</span> · L. Roberts, 1972
        </div>

        {/* ===== Phase A: slots appear, floating packets snap to slot starts ===== */}
        {aIn > 0 ? (
          <Stage opacity={aIn}>
            <SlotGrid scale={TL} y1={SLOT_Y1} y2={SLOT_Y2} progress={slotsDraw} />
            <Timeline scale={TL} y={AXIS_Y} tickEvery={1} progress={axisDraw} label="time →" tickLabel={(t) => `${t}`} />
            {SNAPPED.map((p, i) => {
              const appear = pop(frame, C.split + 22 + i * 5);
              if (frame < C.split + 22 + i * 5) return null;
              const bob = (1 - pSnap) * Math.sin(frame * 0.12 + i * 1.7) * 5;
              const ok = OK.get(i);
              return (
                <PacketBar
                  key={p.id}
                  scale={TL}
                  start={lerp(p.t, p.slot, pSnap)}
                  y={LANE[p.lane] - 10 * (1 - pSnap) + bob}
                  h={38}
                  state="attempt"
                  toState={ok ? "success" : "collision"}
                  mix={pColor}
                  opacity={clamp01(appear)}
                />
              );
            })}
            {/* same slot still collides */}
            <g opacity={prog(frame, C.start + SNAP_DUR + 10, 12)}>
              <text x={TL(-0.5)} y={SLOT_Y1 - 14} fill={COLORS.collision} fontFamily={FONT.sans} fontSize={22} fontWeight={700} textAnchor="middle">
                same slot
              </text>
            </g>
          </Stage>
        ) : null}

        {/* ===== Phase B: the meeting room calendar ===== */}
        {calIn * calOut > 0 ? (
          <Stage opacity={calIn * calOut}>
            <g
              transform={
                `translate(${lerp(CAL_CX, ROT.Px, rot)} ${lerp(CAL_CY, ROT.Py, rot)}) ` +
                `rotate(${-90 * rot}) scale(${lerp(1, ROT.sx, rot)} ${lerp(1, ROT.sy, rot)}) ` +
                `translate(${-CAL_CX} ${-CAL_CY})`
              }
            >
              {/* card + room column (fade as it turns) */}
              <g opacity={1 - clamp01(rot * 2.2)}>
                <rect x={CAL.card.x} y={CAL.card.y} width={CAL.card.w} height={CAL.card.h} rx={20} fill={COLORS.panel} />
                <rect x={CAL.colX0} y={CAL.top} width={CAL.colW} height={CAL.hours * CAL.hourH} rx={8} fill={COLORS.bg} opacity={0.55} />
                {Array.from({ length: CAL.hours + 1 }, (_, h) => (
                  <text
                    key={h}
                    x={CAL.labelX}
                    y={CAL.top + h * CAL.hourH + 7}
                    fill={COLORS.muted}
                    fontFamily={FONT.sans}
                    fontSize={18}
                    textAnchor="end"
                  >
                    {9 + h}:00
                  </text>
                ))}
              </g>
              {/* hour rows: grey in any-minute mode, violet once bookings snap to them */}
              {Array.from({ length: CAL.hours + 1 }, (_, h) => (
                <line
                  key={h}
                  x1={CAL.colX0}
                  y1={CAL.top + h * CAL.hourH}
                  x2={CAL.colX0 + CAL.colW}
                  y2={CAL.top + h * CAL.hourH}
                  stroke={cSnap > 0.5 ? COLORS.slotted : COLORS.faint}
                  strokeWidth={cSnap > 0.5 ? 2.5 / lerp(1, ROT.px / CAL.hourH, rot) : 1.5}
                  opacity={cSnap > 0.5 ? 0.85 : 0.9}
                />
              ))}
              {/* bookings */}
              {BOOKINGS.map((b, i) => {
                const appear = fade(frame, C.room + 10 + i * 3, 10);
                const min = lerp(b.min, b.to, cSnap);
                // during the rotation every booking narrows to its packet lane
                const endCol: Col = b.toCol === "full" ? 0 : b.toCol;
                const x = lerp(lerp(colX(b.col), colX(b.toCol), cSnap), colX(endCol), rot);
                const w = lerp(lerp(colW(b.col), colW(b.toCol), cSnap), colW(endCol), rot);
                const y = CAL.top + (min / 60) * CAL.hourH;
                const color = bookingColor(frame, i);
                return (
                  <g key={i} opacity={appear}>
                    <rect x={x} y={y + 1.5} width={w} height={CAL.hourH - 3} rx={8} fill={color} opacity={0.92} />
                  </g>
                );
              })}
            </g>
            {/* chaos marks on half-overlapping meetings, then on the double-booked hour */}
            {rot === 0
              ? BOOKINGS.map((b, i) => {
                  const before = clashBefore[i] ? prog(frame, C.room + 32, 12) * (1 - prog(frame, C.byHour, 10)) : 0;
                  const after = clashAfter[i] ? prog(frame, C.either + 10, 12) : 0;
                  const k = Math.max(before, after);
                  if (k <= 0) return null;
                  const min = lerp(b.min, b.to, cSnap);
                  const col = cSnap > 0.5 ? b.toCol : b.col;
                  return (
                    <Mark key={i} kind="cross" x={colX(col) + colW(col) - 22} y={CAL.top + (min / 60) * CAL.hourH + CAL.hourH / 2} size={30} progress={k} color={COLORS.ink} />
                  );
                })
              : null}
          </Stage>
        ) : null}
        {/* calendar mode header */}
        <Label x={620} y={166} size={28} weight={700} color={COLORS.ink} opacity={calIn * (1 - cSnap) * (1 - rot)}>
          book any minute
        </Label>
        <Label x={620} y={166} size={28} weight={700} color={COLORS.slotted} opacity={calIn * cSnap * (1 - clamp01(rot * 3))}>
          book by the hour
        </Label>

        {/* ===== Phase C: back on the slotted timeline ===== */}
        {cIn > 0 ? (
          <>
            <Stage opacity={cIn}>
              <Interval scale={TL} from={lerp(-1, 0, shrink)} to={1} y={330} h={112} progress={winIn} />
              <SlotGrid scale={TL} y1={SLOT_Y1} y2={SLOT_Y2} />
              <Timeline scale={TL} y={AXIS_Y} tickEvery={1} label="time →" tickLabel={(t) => `${t}`} />
              {BOOKINGS.map((b, i) => (
                <PacketBar
                  key={i}
                  scale={TL}
                  start={-3 + b.to / 60}
                  y={LANE[b.toCol === 1 ? 1 : 0]}
                  h={40}
                  state={clashAfter[i] ? "collision" : "success"}
                  opacity={1 - 0.7 * focus}
                />
              ))}
              {/* my packet, alone in its slot */}
              <PacketBar scale={TL} start={0} y={LANE[0]} h={40} state="success" label="my packet" opacity={prog(frame, C.shrinks, 12)} />
              <Bracket
                x1={TL(lerp(-1, 0, shrink))}
                x2={TL(1)}
                y={262}
                label={shrink < 0.5 ? "2 frame times" : "1 frame time"}
                color={COLORS.collision}
                progress={winIn}
                opacity={winIn > 0.02 ? 1 : 0}
              />
            </Stage>
            <WindowLabel opacity={winLabel} shrink={shrink} />
          </>
        ) : null}

        {/* "no half overlaps": Scene 13's partial overlap, crossed out */}
        <HalfOverlapInset frame={frame} start={C.half + 8} end={C.shrinks + 4} />
      </AbsoluteFill>
    </SceneFrame>
  );
};

/** Booking colour through the beats: blue attempt → (any-minute) red clash / green → blue while snapping →
 *  red double-booking on "same hour" → green for everyone else on "never clash". */
function bookingColor(frame: number, i: number): string {
  const states: [number, PacketState][] = [[0, "attempt"]];
  states.push([C.room + 26, clashBefore[i] ? "collision" : "success"]);
  states.push([C.byHour, "attempt"]);
  if (clashAfter[i]) states.push([C.either + 6, "collision"]);
  else states.push([C.never, "success"]);
  let cur: PacketState = "attempt";
  let prev: PacketState = "attempt";
  let at = 0;
  for (const [t, s] of states) {
    if (frame >= t) {
      prev = cur;
      cur = s;
      at = t;
    }
  }
  const k = prog(frame, at, 10);
  return mixColor(PACKET_HEX[prev], PACKET_HEX[cur], k);
}

const PACKET_HEX: Record<PacketState, string> = {
  attempt: COLORS.event,
  retry: COLORS.retry,
  success: COLORS.success,
  collision: COLORS.collision,
  ghost: COLORS.muted,
};
function mixColor(a: string, b: string, k: number): string {
  const pa = [1, 3, 5].map((o) => parseInt(a.slice(o, o + 2), 16));
  const pb = [1, 3, 5].map((o) => parseInt(b.slice(o, o + 2), 16));
  return `rgb(${pa.map((v, j) => Math.round(lerp(v, pb[j], k))).join(",")})`;
}

const WindowLabel: React.FC<{ opacity: number; shrink: number }> = ({ opacity, shrink }) => (
  <div
    style={{
      position: "absolute",
      left: 640,
      top: 520,
      transform: "translate(-50%, -50%)",
      opacity,
      fontFamily: FONT.sans,
      fontSize: 36,
      fontWeight: 700,
      color: COLORS.ink,
      whiteSpace: "nowrap",
    }}
  >
    vulnerable window:{" "}
    <span style={{ color: shrink > 0.5 ? COLORS.muted : COLORS.collision, textDecoration: shrink > 0.5 ? "line-through" : "none" }}>2</span>
    <span
      style={{
        display: "inline-block",
        overflow: "hidden",
        verticalAlign: "bottom",
        width: `${EASE_OUT(shrink) * 2.1}em`,
        opacity: shrink,
        color: COLORS.collision,
      }}
    >
      &nbsp;→ 1
    </span>{" "}
    frame time
    <span style={{ display: "inline-block", width: `${(1 - shrink) * 0.45}em`, overflow: "hidden", verticalAlign: "bottom", opacity: 1 - shrink }}>s</span>
  </div>
);

/** Two packets overlapping by half a frame time (only possible in pure Aloha), crossed out. */
const HalfOverlapInset: React.FC<{ frame: number; start: number; end: number }> = ({ frame, start, end }) => {
  const a = fade(frame, start, 12, end, 14);
  if (a <= 0) return null;
  const sc = timeScale(0, 2.5, 930, 1190);
  const cross = prog(frame, start + 14, 14);
  return (
    <>
      <Stage opacity={a}>
        <rect x={900} y={132} width={320} height={120} rx={16} fill={COLORS.panel} />
        <PacketBar scale={sc} start={0.3} y={170} h={30} state="collision" />
        <PacketBar scale={sc} start={0.8} y={210} h={30} state="collision" />
        <line x1={922} y1={150} x2={1198} y2={232} stroke={COLORS.ink} strokeWidth={6} strokeLinecap="round" opacity={cross} strokeDasharray={300} strokeDashoffset={300 * (1 - cross)} />
      </Stage>
      <Label x={1060} y={280} size={28} weight={700} color={COLORS.ink} opacity={a * prog(frame, start + 10, 10)}>
        no half overlaps
      </Label>
    </>
  );
};
