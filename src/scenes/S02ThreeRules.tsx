// Scene 02 — The three rules
// Brief: scenes/s02-three-rules.md  ·  Shared brief: scenes/README.md  ·  Kit: src/shared/README.md
//
// Structure (everything keyed to cue()):
//   opens on Scene 01's timeline → bus stop fades in above it → "Poisson process" title → header
//   Rule 1: time-lapse hour, buses shrink into dots on the timeline, λ label, counter lands on "10 / hour"
//   Rule 2: Commuter checks watch, "waited 5:00", a flat "next minute" meter, three replays of the next dot
//   Rule 3: two buses nose to tail, street leaves, a zoom panel shows the two dots stay two dots
import React from "react";
import { interpolateColors, useCurrentFrame } from "remotion";
import {
  Bus,
  BusStopStreet,
  Caption,
  clamp01,
  COLORS,
  Commuter,
  cue,
  EASE,
  EASE_OUT,
  EventDots,
  fade,
  FONT,
  Interval,
  Label,
  lerp,
  poissonArrivals,
  pop,
  prog,
  remap,
  RuleChip,
  SceneFrame,
  Stage,
  STREET,
  Timeline,
  timeScale,
  Title,
  useSvgId,
  W,
} from "../shared";
import { S01_HANDOFF, S01FinalLanes } from "./S01ColdOpen";

/** Extra seconds of picture after the narration tail. The scene length updates automatically. */
export const meta = { extraTail: 2.3 };

const ID = "s02";

// ---------------------------------------------------------------- data (minutes)
/** Ten buses in the hour, true exponential gaps (seed chosen so the hour holds exactly 10). */
const BUSES = poissonArrivals(10 / 60, 0, 60, "s02-bus-1823");
const LAST = BUSES[BUSES.length - 1];
/** "Now" when the Commuter checks their watch: five minutes after the last bus. */
const NOW0 = LAST + 5;
const NOW1 = NOW0 + 1; // the timer runs one more minute during Rule 2
/** Rule 3: two buses arriving close together, but one after the other. */
const PAIR = [NOW1 + 1.9, NOW1 + 2.7];
const NOW2 = NOW1 + 4.4;
const ALL = [...BUSES, ...PAIR];
/** Three "what if" next-bus positions for the no-memory replay (offsets after now, minutes). */
const GHOSTS = [1.6, 7.4, 3.3];

// ---------------------------------------------------------------- layout
const TL_Y = 625;
const SC = timeScale(0, 75, 140, 1180);
/** The street as a medium shot: native street coords → screen. */
const ST = { s: 1.06, tx: -106, ty: -194 };
const sx = (x: number) => x * ST.s + ST.tx;
const sy = (y: number) => y * ST.s + ST.ty;
const CARD = { x: 20, y: 16, w: W - 40, h: 532 };
/** Where a stopped bus "becomes" a dot. */
const BUS_CENTER = { x: sx(STREET.busStopX), y: sy(STREET.busY - 90) };

// ---------------------------------------------------------------- timing (scene frames)
const F = {
  streetIn: 18, // after Scene 01's lane has settled into place
  title: Math.max(34, cue(ID, "Poisson process")),
  header: cue(ID, "and it has three rules"),
  chip1: cue(ID, "First"),
  lapse0: cue(ID, "steady average rate") - 6,
  lambda: cue(ID, "called lambda"),
  ten: cue(ID, "ten buses an hour"),
  chip2: cue(ID, "Second, theyre independent"),
  waited: cue(ID, "Waited five minutes already"),
  likely: cue(ID, "The bus is no more likely"),
  noMemory: cue(ID, "no more likely"),
  chip3: cue(ID, "Third"),
  oneAtATime: cue(ID, "one at a time"),
};
const LAPSE1 = F.lapse0 + 108; // the hour plays in ~3.6 s
const TIMER0 = F.waited + 12;
const TIMER1 = F.chip3 - 6;
const PAIR0 = F.chip3 + 6;
const PAIR1 = PAIR0 + 36;
const STREET_OUT = PAIR1 - 2;
const RESTACK = STREET_OUT + 16;
const ZOOM0 = RESTACK + 26;
const ZOOM1 = ZOOM0 + 48;

/** Time cursor (minutes) as a function of the frame: piecewise linear (time flowing is the one linear motion). */
const KNOTS: [number, number][] = [
  [0, 0],
  [F.lapse0, 0],
  [LAPSE1, NOW0],
  [TIMER0, NOW0],
  [TIMER1, NOW1],
  [PAIR0, NOW1],
  [PAIR1, NOW2],
];
function cursorAt(f: number): number {
  if (f <= KNOTS[0][0]) return KNOTS[0][1];
  for (let i = 1; i < KNOTS.length; i++) {
    const [f0, c0] = KNOTS[i - 1];
    const [f1, c1] = KNOTS[i];
    if (f <= f1) return f1 === f0 ? c1 : lerp(c0, c1, (f - f0) / (f1 - f0));
  }
  return KNOTS[KNOTS.length - 1][1];
}
/** First frame at which the cursor reaches minute t. */
function frameAt(t: number): number {
  for (let i = 1; i < KNOTS.length; i++) {
    const [f0, c0] = KNOTS[i - 1];
    const [f1, c1] = KNOTS[i];
    if (t <= c1 && c1 > c0) return f0 + ((t - c0) / (c1 - c0)) * (f1 - f0);
  }
  return Infinity;
}

// ---------------------------------------------------------------- the bus motion (native street x)
const D = 2; // minutes to drive in / out during the time-lapse
const DWELL = 0.8;
function lapseBusX(c: number, t: number): number | null {
  if (c < t - D || c > t + DWELL + D) return null;
  if (c < t) return STREET.busStopX - 1100 * ((t - c) / D) ** 2;
  if (c < t + DWELL) return STREET.busStopX;
  return STREET.busStopX + 1100 * ((c - t - DWELL) / D) ** 2;
}
function pairBusX(c: number, t: number): number | null {
  const x = STREET.busStopX + (c - t) * 560;
  return x < -300 || x > 1900 ? null : x;
}

// ---------------------------------------------------------------- small inline props
const CAR_COLORS = ["#57534e", "#1e3a8a", "#831843", "#155e75", "#52525b"];
const Car: React.FC<{ x: number; y: number; color: string }> = ({ x, y, color }) => (
  <g transform={`translate(${x} ${y}) scale(-1 1)`}>
    <ellipse cx={0} cy={0} rx={70} ry={6} fill="#000" opacity={0.3} />
    <rect x={-68} y={-44} width={136} height={30} rx={12} fill={color} />
    <path d="M -38 -44 L -24 -68 H 26 L 42 -44 Z" fill={color} />
    <path d="M -30 -46 L -20 -63 H -2 V -46 Z M 4 -46 V -63 H 22 L 33 -46 Z" fill="#1e293b" />
    <circle cx={60} cy={-34} r={5} fill="#fef9c3" />
    <rect x={-68} y={-36} width={6} height={8} rx={2} fill="#7f1d1d" />
    <circle cx={-40} cy={-12} r={12} fill="#0b1220" />
    <circle cx={40} cy={-12} r={12} fill="#0b1220" />
    <circle cx={-40} cy={-12} r={5} fill="#64748b" />
    <circle cx={40} cy={-12} r={5} fill="#64748b" />
  </g>
);

/** The "buses this hour" counter, mounted under the shelter roof (native coords). */
const Counter: React.FC<{ n: number; flash: number }> = ({ n, flash }) => {
  const x = 966;
  const y = 444;
  return (
    <g>
      <rect x={x} y={y} width={112} height={40} rx={6} fill="#0b1220" stroke={flash > 0.01 ? COLORS.bus : "#334155"} strokeWidth={2 + 2 * flash} />
      <text x={x + 56} y={y + 28} fill="#fde68a" fontFamily={FONT.sans} fontWeight={800} fontSize={22} textAnchor="middle">
        {n} / hour
      </text>
    </g>
  );
};

// ---------------------------------------------------------------- scene
export const S02ThreeRules: React.FC = () => {
  const frame = useCurrentFrame();
  const clipId = useSvgId("s02-street");
  const c = cursorAt(frame);

  // street presence
  const streetA = fade(frame, F.streetIn, 26) * (1 - prog(frame, STREET_OUT, 20));
  const lapseOn = frame >= F.lapse0 && frame <= LAPSE1 + 20;

  // traffic: faster while the hour time-lapses, present only during Rule 1
  const carA = fade(frame, F.lapse0 - 20, 14, LAPSE1 + 4, 16);
  const carT = frame * 7 + c * 190;
  const cars = CAR_COLORS.map((col, i) => {
    const span = W + 700;
    const x = W + 250 - ((carT + i * 377 + (i % 2) * 140) % span);
    return <Car key={i} x={x} y={512} color={col} />;
  });

  const buses: React.ReactNode[] = [];
  BUSES.forEach((t, i) => {
    const x = lapseBusX(c, t);
    if (x !== null) buses.push(<Bus key={`b${i}`} x={x} y={STREET.busY} wheelRotation={x * 1.4} />);
  });
  PAIR.forEach((t, i) => {
    const x = pairBusX(c, t);
    if (x !== null && frame >= PAIR0 - 1) buses.push(<Bus key={`p${i}`} x={x} y={STREET.busY} wheelRotation={x * 1.4} />);
  });

  const count = BUSES.filter((t) => t <= c).length;
  const tenFrame = frameAt(LAST);
  const flash = frame >= tenFrame ? Math.max(0, 1 - (frame - tenFrame) / 25) : 0;

  // Commuter: phone → watch on "Waited five minutes already?"
  const watching = frame >= F.waited && frame < F.chip3;

  // ---- title → header
  const toHeader = prog(frame, F.header, 26);
  const titleA = fade(frame, F.title, 10);
  const titleX = lerp(640, 48, toHeader);
  const titleY = lerp(150, 54, toHeader);
  const titleSize = lerp(72, 40, toHeader);

  // ---- rule chips: on the sky during the street, then a centred stack on the left
  const restack = prog(frame, RESTACK, 30);
  const chipY = (i: number) => lerp(124 + i * 66, 250 + i * 86, restack);

  // ---- opening dots (Scene 01's lane), cleared as the header settles
  const openA = 1 - prog(frame, F.header + 6, 22);
  // exactly Scene 01's last-frame 🚌 lane, sliding from its stacked position down to the bottom third
  const OPEN = S01_HANDOFF.dotsX.map((x) => SC.invert(x));
  const tlY = lerp(S01_HANDOFF.y, TL_Y, prog(frame, 0, 24));
  const ticksA = fade(frame, 16, 14);

  // ---- dots: each bus shrinks into a dot that falls onto the timeline
  const DOT_FLY = 12;
  const dots = ALL.map((t, i) => {
    const f0 = frameAt(t);
    const k = clamp01((frame - f0) / DOT_FLY);
    if (frame < f0) return null;
    const e = EASE(k);
    const tx = SC(t);
    const x = lerp(BUS_CENTER.x, tx, e);
    const y = lerp(BUS_CENTER.y, TL_Y, e) - Math.sin(e * Math.PI) * 50;
    const col = interpolateColors(k, [0, 0.6], [COLORS.bus, COLORS.event]);
    if (k < 1) {
      const w = lerp(48, 18, EASE_OUT(clamp01(k * 1.6)));
      const h = lerp(22, 18, EASE_OUT(clamp01(k * 1.6)));
      return <rect key={i} x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2} fill={col} />;
    }
    return <circle key={i} cx={tx} cy={TL_Y} r={9} fill={COLORS.event} />;
  });

  // ---- Rule 2 overlays
  const r2A = fade(frame, F.waited, 12, F.chip3 - 4, 14);
  const gapA = fade(frame, F.waited, 14, STREET_OUT, 14);
  const waited = Math.max(0, c - LAST);
  const mm = Math.floor(waited + 1e-6);
  const ss = Math.floor((waited - mm) * 60 + 1e-6);
  const timerText = `${mm}:${String(ss).padStart(2, "0")}`;
  const meterA = fade(frame, F.waited + 22, 14) * r2A;
  const P_NEXT = 1 - Math.exp(-10 / 60); // ≈ 15%, whatever the wait
  const noMemA = fade(frame, F.noMemory, 12, F.chip3 - 4, 14);

  const GHOST_START = F.likely - 8;
  const GHOST_LEN = 26;
  const ghosts = GHOSTS.map((d, i) => {
    const g0 = GHOST_START + i * GHOST_LEN;
    const k = (frame - g0) / GHOST_LEN;
    if (k < 0 || k > 1) return null;
    const a = remap(k, 0, 0.15, 0, 1) * remap(k, 0.8, 1, 1, 0);
    const drop = EASE_OUT(clamp01(k / 0.3));
    const gx = SC(c + d);
    return (
      <g key={i} opacity={a}>
        <path d={`M ${SC(c)} ${TL_Y - 30} Q ${(SC(c) + gx) / 2} ${TL_Y - 62} ${gx} ${TL_Y - 22}`} stroke={COLORS.event} strokeWidth={2} strokeDasharray="5 6" fill="none" opacity={0.7} />
        <circle cx={gx} cy={TL_Y - 40 * (1 - drop)} r={9} fill={COLORS.event} opacity={0.55} />
        <circle cx={gx} cy={TL_Y - 40 * (1 - drop)} r={13} fill="none" stroke={COLORS.event} strokeWidth={2} strokeDasharray="4 4" />
      </g>
    );
  });

  // playhead ("now")
  const playA = fade(frame, F.lapse0, 10, STREET_OUT, 16);

  // ---- Rule 3 zoom panel
  const PANEL = { x: 540, y: 190, w: 690, h: 250 };
  const panelIn = prog(frame, RESTACK + 4, 26);
  const zoom = prog(frame, ZOOM0, ZOOM1 - ZOOM0);
  const mid = (PAIR[0] + PAIR[1]) / 2;
  const half = Math.exp(lerp(Math.log(12), Math.log(0.75), zoom));
  const zsc = timeScale(mid - half, mid + half, PANEL.x + 40, PANEL.x + PANEL.w - 40);
  const srcHalf = Math.max(half, 0.9);
  const src = { x1: Math.max(SC.x0, SC(mid - srcHalf)), x2: Math.min(SC.x1, SC(mid + srcHalf)), y1: TL_Y - 26, y2: TL_Y + 26 };
  const zoomTick = half > 6 ? 5 : half > 1.6 ? 1 : 0.25;
  const pairA = fade(frame, frameAt(PAIR[1]) + DOT_FLY, 10);

  return (
    <SceneFrame id={ID}>
      {/* hand-off: Scene 01's 📱 and 💧 lanes (and the 🚌 icon) fade out; the 🚌 lane itself carries on below */}
      {frame < 20 ? (
        <>
          <S01FinalLanes lanes={[0, 2]} opacity={1 - prog(frame, 0, 18)} />
          <S01FinalLanes lanes={[]} iconOnly={[1]} opacity={1 - prog(frame, 0, 8)} />
        </>
      ) : null}
      {/* ---------- real-life layer: the bus stop as a medium shot, cropped into a card */}
      <Stage opacity={streetA}>
        <defs>
          <clipPath id={clipId}>
            <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx={20} />
          </clipPath>
        </defs>
        <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx={20} fill={COLORS.panel} />
        <g clipPath={`url(#${clipId})`}>
          <g transform={`translate(${ST.tx} ${ST.ty}) scale(${ST.s})`}>
            <BusStopStreet
              rain={0.25}
              road={
                <>
                  <g opacity={carA}>{carA > 0 ? cars : null}</g>
                  {lapseOn || frame >= PAIR0 - 1 ? buses : null}
                </>
              }
            >
              <Counter n={count} flash={flash} />
              <Commuter
                x={STREET.commuter.x}
                y={STREET.commuter.y}
                pose={watching ? "watch" : "phone"}
                expression={frame >= F.likely && frame < F.chip3 ? "sigh" : "neutral"}
                phoneGlow={0.5}
              />
            </BusStopStreet>
          </g>
        </g>
        <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx={20} fill="none" stroke={COLORS.faint} strokeWidth={2} />
      </Stage>

      {/* ---------- Rule 2: timer above the Commuter's head, arrow, flat meter */}
      <div
        style={{
          position: "absolute",
          left: 752,
          top: 182,
          opacity: r2A,
          transform: `translateY(${(1 - pop(frame, F.waited)) * 12}px)`,
          padding: "8px 18px",
          borderRadius: 14,
          background: COLORS.panel,
          border: `2px solid ${COLORS.muted}`,
          fontFamily: FONT.sans,
          fontSize: 28,
          color: COLORS.ink,
          whiteSpace: "nowrap",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        <span style={{ color: COLORS.muted }}>waited </span>
        <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>{timerText}</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 968,
          top: 134,
          width: 260,
          opacity: meterA,
          padding: "10px 14px 8px",
          borderRadius: 14,
          background: COLORS.panel,
          border: `2px solid ${COLORS.faint}`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          fontFamily: FONT.sans,
          color: COLORS.ink,
        }}
      >
        <div style={{ fontSize: 22, color: COLORS.muted }}>next minute</div>
        <MeterTrace waited={waited} p={P_NEXT} />
      </div>
      <Stage opacity={meterA}>
        <path d="M 932 206 L 958 206" stroke={COLORS.muted} strokeWidth={3} strokeLinecap="round" />
        <path d="M 964 206 l -10 -7 v 14 z" fill={COLORS.muted} />
      </Stage>
      <Caption y={500} start={F.noMemory} opacity={noMemA} color={COLORS.ink}>
        <span style={{ background: "rgba(15,23,42,0.85)", padding: "4px 18px", borderRadius: 10, fontWeight: 700 }}>no memory</span>
      </Caption>

      {/* ---------- theory layer: the timeline */}
      <Stage>
        <Timeline scale={SC} y={tlY} />
        <Timeline scale={SC} y={tlY} tickEvery={5} label="time →" opacity={ticksA} />
        <EventDots scale={SC} y={tlY} times={OPEN} opacity={openA} />
        <Interval scale={SC} from={LAST} to={Math.max(LAST, c)} y={TL_Y} h={46} color={COLORS.ink} fillOpacity={0.1} opacity={gapA} />
        {playA > 0 ? (
          <g opacity={playA}>
            <line x1={SC(c)} y1={TL_Y - 30} x2={SC(c)} y2={TL_Y + 18} stroke={COLORS.ink} strokeWidth={3} strokeLinecap="round" />
            <circle cx={SC(c)} cy={TL_Y - 30} r={5} fill={COLORS.ink} />
          </g>
        ) : null}
        {ghosts}
        {/* zoom source box + connectors */}
        {panelIn > 0 ? (
          <g opacity={panelIn * pairA}>
            <rect x={src.x1} y={src.y1} width={src.x2 - src.x1} height={src.y2 - src.y1} rx={6} fill="none" stroke={COLORS.ink} strokeWidth={2} />
            <line x1={src.x1} y1={src.y1} x2={PANEL.x} y2={PANEL.y + PANEL.h} stroke={COLORS.faint} strokeWidth={2} />
            <line x1={src.x2} y1={src.y1} x2={PANEL.x + PANEL.w} y2={PANEL.y + PANEL.h} stroke={COLORS.faint} strokeWidth={2} />
          </g>
        ) : null}
      </Stage>
      {/* dots fly from the street, so they sit above everything */}
      <Stage>{dots}</Stage>

      {/* ---------- Rule 3 zoom panel */}
      {panelIn > 0 ? (
        <Stage opacity={panelIn}>
          <g transform={`translate(${PANEL.x + PANEL.w / 2} ${PANEL.y + PANEL.h}) scale(${lerp(0.2, 1, EASE(panelIn))}) translate(${-PANEL.w / 2} ${-PANEL.h})`}>
            <rect x={0} y={0} width={PANEL.w} height={PANEL.h} rx={18} fill={COLORS.panel} stroke={COLORS.faint} strokeWidth={2} />
          </g>
          <g opacity={clamp01(panelIn * 2 - 1)}>
            <ZoomedLine scale={zsc} y={PANEL.y + PANEL.h * 0.58} tickEvery={zoomTick} times={PAIR} panel={PANEL} />
          </g>
        </Stage>
      ) : null}

      {/* ---------- text: header + chips + λ */}
      <Title
        x={titleX}
        y={titleY}
        anchor="left"
        size={titleSize}
        opacity={titleA}
        style={{
          transform: `translate(${lerp(-50, 0, toHeader)}%, -50%)`,
          textShadow: `0 3px 14px rgba(0,0,0,${(0.7 * streetA).toFixed(3)})`,
        }}
      >
        Poisson process
      </Title>
      <RuleChip n={1} x={48} y={chipY(0)} start={F.chip1}>
        steady rate <i style={{ fontFamily: FONT.math }}>λ</i>
      </RuleChip>
      <RuleChip n={2} x={48} y={chipY(1)} start={F.chip2}>
        independent: no memory
      </RuleChip>
      <RuleChip n={3} x={48} y={chipY(2)} start={F.chip3}>
        one at a time
      </RuleChip>
      <LambdaLabel frame={frame} start={F.lambda} />
    </SceneFrame>
  );
};

/** λ = 10 per hour, with "lambda" under the symbol on first appearance. */
const LambdaLabel: React.FC<{ frame: number; start: number }> = ({ frame, start }) => {
  const a = fade(frame, start, 12);
  const rise = (1 - pop(frame, start)) * 10;
  return (
    <div style={{ position: "absolute", left: 140, top: 650, opacity: a, transform: `translateY(${rise}px)`, fontFamily: FONT.math, color: COLORS.ink }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, fontSize: 34 }}>
        <span style={{ position: "relative", fontStyle: "italic", color: COLORS.event }}>
          λ
          <span
            style={{
              position: "absolute",
              left: "50%",
              top: "100%",
              transform: "translate(-50%, -4px)",
              fontFamily: FONT.sans,
              fontStyle: "normal",
              fontSize: 18,
              color: COLORS.muted,
            }}
          >
            lambda
          </span>
        </span>
        <span style={{ fontFamily: FONT.sans, fontSize: 30 }}>= 10 per hour</span>
      </div>
    </div>
  );
};

/** The flat "next minute" trace: chance of a bus in the next minute vs. minutes waited. It never rises. */
const MeterTrace: React.FC<{ waited: number; p: number }> = ({ waited, p }) => {
  const w = 230;
  const h = 64;
  const xMax = 6;
  const x = (m: number) => 8 + (Math.min(m, xMax) / xMax) * (w - 60);
  const y = (q: number) => h - 8 - (q / 0.5) * (h - 16);
  return (
    <svg width={w} height={h} style={{ display: "block", marginTop: 4 }}>
      <line x1={8} y1={h - 8} x2={w - 52} y2={h - 8} stroke={COLORS.faint} strokeWidth={2} />
      <line x1={8} y1={6} x2={8} y2={h - 8} stroke={COLORS.faint} strokeWidth={2} />
      <line x1={x(0)} y1={y(p)} x2={x(waited)} y2={y(p)} stroke={COLORS.event} strokeWidth={4} strokeLinecap="round" />
      <circle cx={x(waited)} cy={y(p)} r={6} fill={COLORS.event} />
      <text x={w - 4} y={y(p) + 8} fill={COLORS.ink} fontFamily={FONT.sans} fontSize={22} fontWeight={700} textAnchor="end">
        15%
      </text>
    </svg>
  );
};

/** The deep-zoomed timeline inside the Rule 3 panel. Dots keep their size: they're points, not blobs. */
const ZoomedLine: React.FC<{
  scale: ReturnType<typeof timeScale>;
  y: number;
  tickEvery: number;
  times: number[];
  panel: { x: number; y: number; w: number; h: number };
}> = ({ scale, y, tickEvery, times, panel }) => {
  const ticks: number[] = [];
  const first = Math.ceil(scale.t0 / tickEvery) * tickEvery;
  for (let t = first; t <= scale.t1; t += tickEvery) ticks.push(t);
  return (
    <g>
      <line x1={panel.x + 24} y1={y} x2={panel.x + panel.w - 24} y2={y} stroke={COLORS.muted} strokeWidth={3} strokeLinecap="round" />
      {ticks.map((t) => (
        <line key={t.toFixed(3)} x1={scale(t)} y1={y - 8} x2={scale(t)} y2={y + 8} stroke={COLORS.muted} strokeWidth={2} />
      ))}
      {times.map((t, i) => (
        <g key={i}>
          <circle cx={scale(t)} cy={y} r={16} fill={COLORS.event} opacity={0.18} />
          <circle cx={scale(t)} cy={y} r={11} fill={COLORS.event} />
        </g>
      ))}
    </g>
  );
};

