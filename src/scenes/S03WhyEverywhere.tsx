// Scene 03 — Why it's everywhere
// Brief: scenes/s03-why-everywhere.md  ·  Shared brief: scenes/README.md  ·  Kit: src/shared/README.md
//
// Street → camera rises to a top-down neighbourhood. 60 houses, each a *rare* Poisson source; their people walk
// to the stop and the arrivals pile up on one busy timeline. Five houses get faint mini-timelines (nearly empty)
// that fold into the shared line (StreamMerge, reused in Scene 11). Then the contrast: a train leaving exactly on
// the hour → evenly spaced dots → ✗. Closes on the Poisson timeline (✓) above the schedule (✗).
import React from "react";
import { useCurrentFrame } from "remotion";
import {
  BusStopStreet,
  Caption,
  COLORS,
  Commuter,
  crowdLook,
  cue,
  EASE_IN,
  EventDots,
  fade,
  FONT,
  ILLUS,
  Label,
  lerp,
  Mark,
  mergeTimes,
  Person,
  poissonArrivals,
  prog,
  scheduledArrivals,
  SceneFrame,
  sparseSources,
  Stage,
  STREET,
  StreamMerge,
  Timeline,
  timeScale,
  clamp01,
} from "../shared";

/** Extra seconds of picture after the narration tail. The scene length updates automatically. */
export const meta = { extraTail: 0.8 };

const ID = "s03";
const C = {
  why: cue(ID, "Why is it everywhere"),
  lots: cue(ID, "lots of people each have a small"),
  like: cue(ID, "like heading to a bus stop"),
  train: cue(ID, "A train leaving exactly on the hour"),
  notP: cue(ID, "isnt Poisson"),
  sched: cue(ID, "Its a schedule"),
};

const linear = (t: number) => t;

// ── the neighbourhood map (top-down) ──────────────────────────────────────────────────────────────────────────
const MAP = { x: 40, y: 80, w: 600, h: 440 };
const SW = 20; // street width
const BW = (MAP.w - 6 * SW) / 5; // block width (5 blocks across, 2 houses each)
const BH = (MAP.h - 4 * SW) / 3; // block height (3 blocks down, 2 houses each)
const vStreet = (k: number) => MAP.x + k * (BW + SW) + SW / 2;
const hStreet = (k: number) => MAP.y + k * (BH + SW) + SW / 2;
const STOP = { x: MAP.x + SW + 2 * (BW + SW) + BW / 2, y: hStreet(3) };

type Pt = [number, number];
type House = { x: number; y: number; path: Pt[]; len: number; walk: number };

const SPEED = 25; // px per minute of scene time
const HOUSES: House[] = Array.from({ length: 60 }, (_, h) => {
  const col = h % 10;
  const row = Math.floor(h / 10);
  const bc = Math.floor(col / 2);
  const hc = col % 2;
  const br = Math.floor(row / 2);
  const hr = row % 2;
  const x = MAP.x + SW + bc * (BW + SW) + hc * (BW / 2) + BW / 4;
  const y = MAP.y + SW + br * (BH + SW) + hr * (BH / 2) + BH / 4;
  const ys = hr === 1 ? hStreet(br + 1) : hStreet(br);
  const vx = hc === 0 ? vStreet(bc) : vStreet(bc + 1);
  const yB = hStreet(3);
  const path: Pt[] = [[x, y], [x, ys], [vx, ys], [vx, yB], [STOP.x, yB]];
  let len = 0;
  for (let i = 1; i < path.length; i++) len += Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
  return { x, y, path, len, walk: len / SPEED };
});

function along(path: Pt[], s: number): Pt {
  let total = 0;
  const seg: number[] = [];
  for (let i = 1; i < path.length; i++) {
    const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
    seg.push(d);
    total += d;
  }
  let rem = clamp01(s) * total;
  for (let i = 0; i < seg.length; i++) {
    if (rem <= seg[i] || i === seg.length - 1) {
      const k = seg[i] ? Math.min(1, rem / seg[i]) : 1;
      return [lerp(path[i][0], path[i + 1][0], k), lerp(path[i][1], path[i + 1][1], k)];
    }
    rem -= seg[i];
  }
  return path[path.length - 1];
}

// Each house is a rare, independent Poisson source: ~0.4 arrivals per 30 minutes. Times = arrival at the stop.
const T_END = 30; // minutes shown on the stop's timeline
const RATE = 0.0145; // arrivals per house per minute
const SRC = sparseSources(60, RATE, -30, T_END, "s03-houses");
const ARRIVALS = mergeTimes(SRC.map((r) => r.filter((t) => t >= 0)));
/** Houses that get a faint mini-timeline: counts 1, 0, 1, 0, 1 — each nearly empty. */
const CHOSEN = [6, 14, 37, 40, 58];

const HouseGlyph: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = COLORS.muted }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -9 -1 L 0 -9 L 9 -1 V 8 H -9 Z" fill={ILLUS.buildingHi} stroke={color} strokeWidth={2} strokeLinejoin="round" />
  </g>
);

const StopGlyph: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-1.5} y={0} width={3} height={12} fill={ILLUS.metal} />
    <circle cx={0} cy={-2} r={8} fill={COLORS.bus} stroke="#0b1220" strokeWidth={2} />
  </g>
);

const TrainGlyph: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-12} y={-9} width={24} height={16} rx={5} fill="#cbd5e1" />
    <rect x={-8} y={-6} width={7} height={5} rx={1} fill="#334155" />
    <rect x={1} y={-6} width={7} height={5} rx={1} fill="#334155" />
    <circle cx={-6} cy={9} r={2.5} fill={COLORS.muted} />
    <circle cx={6} cy={9} r={2.5} fill={COLORS.muted} />
  </g>
);

const Neighbourhood: React.FC<{ u: number; highlight: number }> = ({ u, highlight }) => (
  <g>
    {/* ground + streets */}
    <rect x={MAP.x} y={MAP.y} width={MAP.w} height={MAP.h + 34} rx={18} fill={COLORS.panel} />
    {[0, 1, 2, 3].map((k) => (
      <rect key={`h${k}`} x={MAP.x} y={hStreet(k) - SW / 2} width={MAP.w} height={SW} fill={ILLUS.road} />
    ))}
    {[0, 1, 2, 3, 4, 5].map((k) => (
      <rect key={`v${k}`} x={vStreet(k) - SW / 2} y={MAP.y} width={SW} height={MAP.h - SW / 2} fill={ILLUS.road} />
    ))}
    {/* the bus stop on the bottom street */}
    <rect x={STOP.x - 26} y={STOP.y + 12} width={52} height={9} rx={3} fill="#475569" />
    <rect x={STOP.x - 24} y={STOP.y + 21} width={48} height={5} rx={2} fill={ILLUS.glass} />
    <StopGlyph x={STOP.x + 40} y={STOP.y + 18} s={0.9} />

    {/* houses: a window lights when someone leaves for the stop */}
    {HOUSES.map((hs, h) => {
      let lit = 0;
      for (const t of SRC[h]) {
        const d = u - (t - hs.walk);
        lit = Math.max(lit, clamp01((d + 0.8) / 0.8) * clamp01((4 - d) / 2));
      }
      const hi = CHOSEN.indexOf(h);
      return (
        <g key={h}>
          {lit > 0 ? <circle cx={hs.x} cy={hs.y} r={24} fill={ILLUS.windowLit} opacity={0.3 * lit} /> : null}
          <rect x={hs.x - 17} y={hs.y - 19} width={34} height={38} rx={4} fill={h % 3 === 0 ? ILLUS.buildingHi : ILLUS.building} />
          <line x1={hs.x - 17} y1={hs.y} x2={hs.x + 17} y2={hs.y} stroke="rgba(0,0,0,0.25)" strokeWidth={2} />
          <rect x={hs.x - 5} y={hs.y - 13} width={10} height={9} rx={1.5} fill={ILLUS.windowLit} opacity={0.12 + 0.88 * lit} />
          {hi >= 0 && highlight > 0 ? (
            <g opacity={highlight}>
              <rect x={hs.x - 22} y={hs.y - 24} width={44} height={48} rx={7} fill="none" stroke={COLORS.ink} strokeWidth={2} strokeDasharray="5 4" />
              <circle cx={hs.x + 20} cy={hs.y - 22} r={10} fill={COLORS.ink} />
              <text x={hs.x + 20} y={hs.y - 17.5} fill={COLORS.bg} fontFamily={FONT.sans} fontWeight={800} fontSize={13} textAnchor="middle">
                {hi + 1}
              </text>
            </g>
          ) : null}
        </g>
      );
    })}

    {/* walkers heading to the stop */}
    {HOUSES.map((hs, h) =>
      SRC[h].map((t, j) => {
        const s = (u - (t - hs.walk)) / hs.walk;
        if (s < 0 || s > 1) return null;
        const [x, y] = along(hs.path, s);
        const look = crowdLook(h * 3 + j);
        return (
          <g key={`${h}-${j}`} opacity={clamp01(s * 8) * clamp01((1 - s) * 10)}>
            <circle cx={x} cy={y} r={6} fill={look.jacket} stroke={COLORS.bg} strokeWidth={1.5} />
            <circle cx={x} cy={y} r={3} fill={look.hair} />
          </g>
        );
      }),
    )}

    {/* arrival ripples at the stop */}
    {ARRIVALS.map((t, i) => {
      const k = (u - t) / 1.6;
      if (k < 0 || k > 1) return null;
      return <circle key={i} cx={STOP.x} cy={STOP.y} r={8 + 22 * k} fill="none" stroke={COLORS.event} strokeWidth={3} opacity={1 - k} />;
    })}
  </g>
);

// ── the train platform (side view) ────────────────────────────────────────────────────────────────────────────
const Platform: React.FC<{ frame: number; depart: number }> = ({ frame, depart }) => {
  const go = EASE_IN(clamp01((frame - depart) / 40));
  const minute = lerp(-12, 0, prog(frame, depart - 18, 16)); // 07:58 → 08:00 exactly
  const P = { x: MAP.x, y: MAP.y, w: MAP.w, h: MAP.h + 34 };
  return (
    <g>
      <defs>
        <clipPath id="s03-platform-clip">
          <rect x={P.x} y={P.y} width={P.w} height={P.h} rx={18} />
        </clipPath>
      </defs>
      <g clipPath="url(#s03-platform-clip)">
        <rect x={P.x} y={P.y} width={P.w} height={P.h} fill={COLORS.panel} />
        <rect x={P.x} y={P.y} width={P.w} height={300} fill={ILLUS.building} />
        {/* departure board */}
        <rect x={80} y={112} width={270} height={168} rx={10} fill="#0b1220" stroke={COLORS.faint} strokeWidth={2} />
        <text x={100} y={142} fill={COLORS.muted} fontFamily={FONT.sans} fontWeight={700} fontSize={15} letterSpacing="0.2em">
          DEPARTURES
        </text>
        {["08:00", "09:00", "10:00"].map((tm, i) => (
          <g key={tm}>
            <text x={100} y={186 + i * 36} fill={COLORS.ink} fontFamily={FONT.sans} fontWeight={800} fontSize={28}>
              {tm}
            </text>
            <text x={330} y={186 + i * 36} fill={COLORS.muted} fontFamily={FONT.sans} fontWeight={600} fontSize={18} textAnchor="end">
              CITY
            </text>
          </g>
        ))}
        {/* station clock: the minute hand clicks onto the hour as the train leaves */}
        <g transform="translate(500 190)">
          <rect x={-3} y={-110} width={6} height={56} fill={ILLUS.metal} />
          <circle r={56} fill="#f8fafc" stroke="#475569" strokeWidth={6} />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={0} y1={-44} x2={0} y2={-36} stroke="#0b1220" strokeWidth={3} transform={`rotate(${i * 30})`} />
          ))}
          <line x1={0} y1={0} x2={0} y2={-26} stroke="#0b1220" strokeWidth={6} strokeLinecap="round" transform="rotate(240)" />
          <line x1={0} y1={0} x2={0} y2={-42} stroke="#0b1220" strokeWidth={4} strokeLinecap="round" transform={`rotate(${minute})`} />
          <circle r={4} fill="#0b1220" />
        </g>
        {/* track + platform edge */}
        <rect x={P.x} y={460} width={P.w} height={8} fill="#475569" />
        <rect x={P.x} y={472} width={P.w} height={6} fill="#334155" />
        {/* the train */}
        <g transform={`translate(${go * 760} 0)`}>
          <path d="M 60 330 H 600 Q 640 330 650 380 V 456 H 60 Z" fill="#cbd5e1" />
          <rect x={60} y={420} width={590} height={14} fill="#64748b" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={80 + i * 86} y={350} width={62} height={46} rx={7} fill="#1e293b" />
          ))}
          {[110, 230, 450, 570].map((cx) => (
            <circle key={cx} cx={cx} cy={458} r={12} fill="#0b1220" />
          ))}
        </g>
        <rect x={P.x} y={478} width={P.w} height={P.h} fill={ILLUS.sidewalk} />
      </g>
    </g>
  );
};

// ── tiles: other things that look like this (on screen only) ──────────────────────────────────────────────────
const TILES = [
  { text: "help-line calls", seed: "s03-tile-calls" },
  { text: "website clicks", seed: "s03-tile-clicks" },
  { text: "Geiger counter", seed: "s03-tile-geiger" },
];

export const S03WhyEverywhere: React.FC = () => {
  const frame = useCurrentFrame();

  // 1 · camera rises from the street to the map (log-zoom out onto the stop)
  const rise = prog(frame, C.why + 4, 46);
  const streetOut = prog(frame, C.why + 10, 26);
  const z = Math.pow(3.4, 1 - rise);
  const mapTx = lerp(940, STOP.x, rise) - z * STOP.x;
  const mapTy = lerp(560, STOP.y, rise) - z * STOP.y;

  // time cursor (minutes): flows linearly while the people walk
  const u = lerp(-8, T_END + 1.2, prog(frame, 20, C.like - 4 - 20, linear));

  // 2 · mini-timelines → merge
  const rowsIn = fade(frame, C.lots, 14);
  const merge = prog(frame, C.like, 36);
  const lineIn = prog(frame, C.why + 44, 22);
  const checkIn = C.like + 30;
  const TILES_OUT = checkIn + 10 + 16 + 46; // last tile holds ≥ 45 frames

  // 3 · the train
  const mapOut = prog(frame, C.train, 18);
  const platIn = prog(frame, C.train + 8, 18);
  const depart = C.train + 26;
  const perHour = 6; // frames per hour on the schedule timeline
  const uT = 0.5 + (frame - depart) / perHour;
  const trainLineIn = prog(frame, C.train + 6, 20);

  // 4 · final comparison: timelines widen, illustration leaves
  const w = prog(frame, C.sched + 2, 30);
  const x0 = lerp(740, 170, w);
  const x1 = lerp(1180, 1110, w);
  const pY = lerp(430, 300, w);
  const tY = lerp(590, 470, w);
  const pScale = timeScale(0, T_END + 1.2, x0, x1);
  const tScale = timeScale(0, 12, x0, x1);
  const TRAIN = scheduledArrivals(1, 0, 12, 0.5);

  return (
    <SceneFrame id={ID}>
      {/* left: neighbourhood map, then the train platform */}
      <Stage opacity={(1 - w)}>
        {mapOut < 1 ? (
          <g opacity={prog(frame, C.why + 2, 14) * (1 - mapOut)} transform={`translate(${mapTx} ${mapTy}) scale(${z})`}>
            <Neighbourhood u={u} highlight={rowsIn * (1 - merge)} />
          </g>
        ) : null}
        {platIn > 0 ? (
          <g opacity={platIn}>
            <Platform frame={frame} depart={depart} />
          </g>
        ) : null}
      </Stage>

      {/* the street, which the camera rises away from (drawn over the map: a true crossfade) */}
      {streetOut < 1 ? (
        <Stage opacity={1 - streetOut}>
          <g transform={`translate(940 560) scale(${1 + 0.6 * rise}) translate(-940 -560)`}>
            <BusStopStreet>
              <Commuter x={STREET.commuter.x} y={STREET.commuter.y} pose="phone" phoneGlow={0.6} />
              <Person x={1130} y={STREET.sidewalkY + 6} scale={0.95} facing={-1} pose="stand" {...crowdLook(3)} />
              <Person x={lerp(560, 720, prog(frame, 0, 40))} y={STREET.sidewalkY + 4} scale={0.95} pose="walk" walkPhase={frame * 0.25} {...crowdLook(5)} />
            </BusStopStreet>
          </g>
        </Stage>
      ) : null}

      {/* right: the timelines */}
      <Stage>
        {/* five nearly-empty mini-timelines that fold into the stop's timeline */}
        {merge < 1 ? (
          <StreamMerge
            scale={pScale}
            rows={CHOSEN.map((h) => SRC[h])}
            rowTop={120}
            rowGap={56}
            mergedY={pY}
            progress={merge}
            until={u}
            r={5.2}
            opacity={rowsIn}
            rowLabel={(i, y) => (
              <g>
                <text x={698} y={y + 6} fill={COLORS.ink} fontFamily={FONT.sans} fontWeight={800} fontSize={17} textAnchor="middle">
                  {i + 1}
                </text>
                <HouseGlyph x={720} y={y} />
              </g>
            )}
          />
        ) : null}

        {/* the shared timeline: every arrival at the stop */}
        <g opacity={lineIn}>
          <Timeline scale={pScale} y={pY} progress={lineIn} />
          <EventDots scale={pScale} y={pY} times={ARRIVALS} until={u} drop={26} popSpan={0.9} r={6} />
          <StopGlyph x={x0 - 26} y={pY - 4} s={1.1} />
        </g>

        {/* tiles: tiny random-dot strips */}
        {TILES.map((tl, i) => {
          const a = fade(frame, checkIn + 10 + i * 8, 10, TILES_OUT, 12);
          if (a <= 0) return null;
          const sc = timeScale(0, 1, 990, 1180);
          return (
            <g key={tl.seed} opacity={a}>
              <line x1={990} y1={140 + i * 64} x2={1180} y2={140 + i * 64} stroke={COLORS.faint} strokeWidth={2} />
              <EventDots scale={sc} y={140 + i * 64} times={poissonArrivals(11, 0, 1, tl.seed)} r={5} />
            </g>
          );
        })}

        {/* the schedule: a train exactly on the hour */}
        <g opacity={trainLineIn}>
          <Timeline scale={tScale} y={tY} progress={trainLineIn} />
          <EventDots scale={tScale} y={tY} times={TRAIN} until={uT} drop={26} popSpan={0.5} color={COLORS.ink} />
          <TrainGlyph x={x0 - 26} y={tY - 2} />
        </g>
        <Mark x={x1 + 40} y={pY} kind="check" size={48} progress={prog(frame, checkIn, 14)} />
        <Mark x={x1 + 40} y={tY} kind="cross" size={48} progress={prog(frame, C.notP, 14)} />
      </Stage>

      {/* text */}
      <Label x={x0} y={pY - 44} anchor="left" size={lerp(24, 30, w)} start={checkIn} weight={600}>
        <span style={{ color: COLORS.success, fontWeight: 800 }}>✓</span> people arriving at a stop
      </Label>
      {TILES.map((tl, i) => (
        <Label
          key={tl.text}
          x={740}
          y={140 + i * 64}
          anchor="left"
          size={22}
          start={checkIn + 10 + i * 8}
          opacity={1 - prog(frame, TILES_OUT, 12)}
        >
          <span style={{ color: COLORS.success, fontWeight: 800 }}>✓</span> {tl.text}
        </Label>
      ))}
      <Caption start={C.sched} y={640}>
        <span style={{ color: COLORS.collision, fontWeight: 800 }}>✗</span>{" "}
        <span style={{ fontWeight: 700 }}>schedule ≠ Poisson</span>
      </Caption>
    </SceneFrame>
  );
};
