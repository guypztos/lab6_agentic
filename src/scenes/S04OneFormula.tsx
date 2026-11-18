// Scene 04 — The one formula
// Brief: scenes/s04-one-formula.md  ·  Shared brief: scenes/README.md  ·  Kit: src/shared/README.md
//
// Beats: blank formula card → sliding 6-minute window on a Poisson timeline (empty windows glow green) while
// P(no events in time t) = e^(−λt) writes on → the bus stop, a 6-minute ring, 8 "parallel universe" streets →
// they collapse into 8 timeline strips (3 empty) → worked example ≈ 37% → the card docks as the formula pocket.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  Bracket,
  Bus,
  BusStopStreet,
  Card,
  clamp01,
  COLORS,
  Commuter,
  cue,
  EASE,
  EASE_OUT,
  EventDots,
  fade,
  FONT,
  Formula,
  FormulaPocket,
  Interval,
  Label,
  lerp,
  poissonArrivals,
  pop,
  prog,
  SceneFrame,
  Stage,
  STREET,
  Timeline,
  timeScale,
  W,
  H,
} from "../shared";
import { S03Closing } from "./S03WhyEverywhere";

/** Extra seconds of picture after the narration tail. The scene length updates automatically. */
export const meta = { extraTail: 0.4 };

const ID = "s04";

// ── Sliding-window timeline: λ = 10/hour = 1/6 per minute, 20 consecutive 6-minute windows (2 hours).
const LAMBDA_PER_MIN = 1 / 6;
const WIN = 6;
const TILES = 20;
const WIN_SCALE = timeScale(0, WIN * TILES, 100, 1180);
const WIN_Y = 420;
// Seed picked so the honest simulation lands near e^(−1): 7 of 20 windows are empty (35%).
const ARRIVALS = poissonArrivals(LAMBDA_PER_MIN, 0, WIN * TILES, "s04-win-21");
const TILE_EMPTY = Array.from({ length: TILES }, (_, i) => !ARRIVALS.some((t) => t >= i * WIN && t < (i + 1) * WIN));

// ── Parallel universes: when the first bus comes (minutes) in each of 8 replays of the next 6 minutes.
// Exponential-looking draws with mean 6 min; 3 of 8 have no bus inside the window (≈ e^(−1) of 8).
const UNIVERSES: (number | null)[] = [1.4, null, 3.8, 0.7, null, 5.1, 2.6, null];
const CELL_W = 290;
const CELL_S = CELL_W / W;
const CELL_H = H * CELL_S;
const GAP = 16;
const GRID_X = (W - (4 * CELL_W + 3 * GAP)) / 2;
const GRID_Y = 212;
const cellPos = (i: number) => ({
  x: GRID_X + (i % 4) * (CELL_W + GAP),
  y: GRID_Y + Math.floor(i / 4) * (CELL_H + GAP),
});
// Strip rows after the collapse.
const STRIP_H = 46;
const STRIP_ROW_Y = [318, 388];

/** The 6-minute countdown ring, drawn in street coordinates. `p` = fraction of the 6 minutes elapsed. */
const Ring: React.FC<{ x: number; y: number; r: number; p: number; scale: number; done?: "bus" | "none" }> = ({
  x,
  y,
  r,
  p,
  scale,
  done,
}) => {
  const c = 2 * Math.PI * r;
  const stroke = done === "none" ? COLORS.success : done === "bus" ? COLORS.muted : COLORS.ink;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle r={r + 14} fill={COLORS.panel} opacity={0.92} />
      <circle r={r} fill="none" stroke={COLORS.faint} strokeWidth={10} />
      <circle
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * clamp01(p)}
        transform="rotate(-90)"
      />
      <text y={12} fill={COLORS.ink} fontFamily={FONT.sans} fontWeight={700} fontSize={32} textAnchor="middle">
        6 min
      </text>
    </g>
  );
};

/** One universe: the street, the Commuter, the ring and (maybe) the bus, in 1280×720 street coordinates. */
const Universe: React.FC<{ arrival: number | null; minutes: number; ring: number; playing: boolean }> = ({
  arrival,
  minutes,
  ring,
  playing,
}) => {
  const came = arrival !== null && minutes >= arrival;
  const ended = minutes >= WIN;
  let bus: React.ReactNode = null;
  if (playing && arrival !== null && minutes >= arrival - 1.2) {
    const d = EASE_OUT(clamp01((minutes - (arrival - 1.2)) / 1.2));
    const bx = lerp(STREET.busEnterX, STREET.busStopX, d);
    bus = <Bus x={bx} y={STREET.busY} wheelRotation={bx * 1.4} doorOpen={clamp01((minutes - arrival) / 0.5)} />;
  }
  const elapsed = came ? arrival! / WIN : minutes / WIN;
  return (
    <BusStopStreet road={bus}>
      <Commuter
        x={STREET.commuter.x}
        y={STREET.commuter.y}
        pose={came ? "stand" : "watch"}
        expression={came ? "happy" : ended && playing ? "sigh" : "neutral"}
        facing={-1}
      />
      {ring > 0 ? (
        <Ring
          x={1030}
          y={318}
          r={58}
          p={elapsed}
          scale={ring}
          done={playing ? (came ? "bus" : ended ? "none" : undefined) : undefined}
        />
      ) : null}
    </BusStopStreet>
  );
};

const PREFIX = (
  <>
    P(no events in time <i style={{ fontFamily: FONT.math }}>t</i>) =
  </>
);

export const S04OneFormula: React.FC = () => {
  const frame = useCurrentFrame();

  // ── cues
  const cKeep = cue(ID, "Here's the one formula to keep");
  const cChance = cue(ID, "The chance that nothing happens");
  const cFormula = cue(ID, "is e to the minus lambda t");
  const cTen = cue(ID, "With ten buses an hour");
  const cWait = cue(ID, "the chance you wait");
  const cSix = cue(ID, "six minutes");
  const cIsAbout = cue(ID, "minutes is about");
  const c37 = cue(ID, "thirty-seven percent");
  const cPercent = cue(ID, "percent");
  const cBuilds = cue(ID, "Everything builds on this");

  // ── formula card: blank card, then a left-to-right write-on (prefix during "the chance…", e^(−λt) on the cue)
  const cardIn = fade(frame, cKeep, 14);
  const wipePrefix = prog(frame, cChance + 6, cFormula - cChance - 10);
  const wipeExp = prog(frame, cFormula, 34);
  const wipeX = wipeExp > 0 ? lerp(770, 1040, wipeExp) : lerp(250, 770, wipePrefix);
  const revealDone = wipeExp >= 1;
  const dock = prog(frame, cBuilds, 32);
  const pocketGlow = 0.6 * prog(frame, cFormula + 20, 15) * (1 - dock);

  // ── sliding window (sentence 1)
  const winIn = fade(frame, cChance, 14, cTen - 8, 12);
  const axisDraw = prog(frame, cChance, 20);
  const dotsUntil = lerp(0, WIN * TILES, prog(frame, cChance + 4, 26, EASE));
  const slideStart = cChance + 26;
  const slideEnd = cTen - 6;
  // The window hops one tile per `per` frames: slide for the first half, dwell (and get judged) for the second.
  const per = (slideEnd - slideStart) / TILES;
  const raw = (frame - slideStart) / per;
  const tile = Math.max(0, Math.min(TILES - 1, Math.floor(raw)));
  const u = raw - Math.floor(raw);
  let pos = 0;
  let judged = 0;
  if (raw >= TILES) {
    pos = TILES - 1;
    judged = TILES;
  } else if (raw >= 0) {
    pos = tile === 0 ? 0 : tile - 1 + EASE(clamp01(u * 2));
    judged = tile === 0 || u >= 0.5 ? tile + 1 : tile;
  }
  const shownTile = Math.round(pos);
  const emptyCount = TILE_EMPTY.slice(0, judged).filter(Boolean).length;
  const winEmpty = TILE_EMPTY[shownTile];

  // ── street, ring, fan-out into 8 universes, play, collapse (sentence 2)
  const streetIn = fade(frame, cTen - 6, 14, cBuilds + 10, 18);
  const ringPop = pop(frame, cTen + 14);
  const fan = prog(frame, cWait, 22);
  const playStart = cWait + 24;
  const playEnd = c37 - 6;
  const minutes = WIN * clamp01((frame - playStart) / (playEnd - playStart));
  const playing = frame >= playStart;
  const collapse = prog(frame, c37, 18);
  const stripGlow = prog(frame, c37 + 14, 12);

  // ── worked example
  const exIn = fade(frame, cWait + 16, 12, cBuilds + 10, 18);
  const exLambda = fade(frame, cWait + 16, 10);
  const exT = fade(frame, cSix, 10);
  const exProd = fade(frame, cIsAbout + 4, 10);
  const exResult = pop(frame, cPercent - 6);

  return (
    <SceneFrame id={ID}>
      {/* hand-off: Scene 03's closing comparison fades out as the formula card arrives */}
      {frame < cKeep + 16 ? <S03Closing opacity={1 - prog(frame, 0, cKeep + 14)} /> : null}

      {/* sliding-window timeline */}
      {winIn > 0 ? (
        <>
          <Stage opacity={winIn}>
            {TILE_EMPTY.map((empty, i) =>
              empty && i < judged && i !== shownTile ? (
                <Interval key={i} scale={WIN_SCALE} from={i * WIN} to={(i + 1) * WIN} y={WIN_Y} h={64} color={COLORS.success} fillOpacity={0.22} edges={false} />
              ) : null,
            )}
            {frame >= slideStart ? (
              <>
                <Interval
                  scale={WIN_SCALE}
                  from={pos * WIN}
                  to={pos * WIN + WIN}
                  y={WIN_Y}
                  h={84}
                  color={winEmpty ? COLORS.success : COLORS.muted}
                  fillOpacity={winEmpty ? 0.35 : 0.16}
                />
                <Bracket x1={WIN_SCALE(pos * WIN)} x2={WIN_SCALE(pos * WIN + WIN)} y={WIN_Y - 58} label="t" size={28} />
              </>
            ) : null}
            <Timeline scale={WIN_SCALE} y={WIN_Y} tickEvery={WIN} progress={axisDraw} label="time →" />
            <EventDots scale={WIN_SCALE} y={WIN_Y} times={ARRIVALS} until={dotsUntil} popSpan={4} drop={24} r={8} />
          </Stage>
          <Label x={640} y={545} size={30} color={COLORS.muted} opacity={winIn * fade(frame, slideStart, 10)}>
            empty windows: <span style={{ color: COLORS.success, fontWeight: 700 }}>{emptyCount}</span> of {judged}
          </Label>
        </>
      ) : null}

      {/* the street → 8 parallel universes → 8 strips */}
      {streetIn > 0 ? (
        <Stage opacity={streetIn}>
          {[...UNIVERSES.keys()].reverse().map((i) => {
            const c = cellPos(i);
            const f = clamp01(fan * 1.15 - i * 0.02);
            const s = lerp(1, CELL_S, f);
            const tx = lerp(0, c.x, f);
            const ty = lerp(0, c.y, f);
            const arrival = UNIVERSES[i];
            // collapse: the cell's visible window squashes to a strip and moves to its strip row
            const cy0 = c.y + CELL_H / 2;
            const cy = lerp(cy0, STRIP_ROW_Y[Math.floor(i / 4)], collapse);
            const h = lerp(CELL_H, STRIP_H, collapse);
            const empty = arrival === null;
            const clipId = `s04-cell-${i}`;
            const lineX0 = c.x + 18;
            const lineX1 = c.x + CELL_W - 18;
            return (
              <g key={i} opacity={i === 0 ? 1 : fade(frame, cWait + i, 10)}>
                <defs>
                  <clipPath id={clipId}>
                    {collapse > 0 ? (
                      <rect x={c.x} y={cy - h / 2} width={CELL_W} height={h} rx={10} />
                    ) : (
                      <rect x={tx} y={ty} width={W * s} height={H * s} rx={lerp(0, 10, f)} />
                    )}
                  </clipPath>
                </defs>
                <g clipPath={`url(#${clipId})`}>
                  <g opacity={1 - collapse} transform={`translate(${tx} ${ty + (cy - cy0)}) scale(${s})`}>
                    <Universe arrival={arrival} minutes={minutes} ring={ringPop} playing={playing} />
                  </g>
                </g>
                {f > 0.6 && collapse < 1 ? (
                  <rect
                    x={c.x}
                    y={cy - h / 2}
                    width={CELL_W}
                    height={h}
                    rx={10}
                    fill="none"
                    stroke={COLORS.faint}
                    strokeWidth={2}
                    opacity={clamp01((f - 0.6) / 0.4) * (1 - collapse)}
                  />
                ) : null}
                {collapse > 0 ? (
                  <g opacity={collapse}>
                    <rect
                      x={c.x}
                      y={cy - STRIP_H / 2}
                      width={CELL_W}
                      height={STRIP_H}
                      rx={10}
                      fill={empty ? COLORS.success : COLORS.panel}
                      fillOpacity={empty ? 0.12 + 0.18 * stripGlow : 1}
                      stroke={empty ? COLORS.success : COLORS.faint}
                      strokeOpacity={empty ? 0.4 + 0.6 * stripGlow : 1}
                      strokeWidth={empty ? 3 : 2}
                      style={empty ? { filter: `drop-shadow(0 0 ${10 * stripGlow}px ${COLORS.success})` } : undefined}
                    />
                    <line x1={lineX0} y1={cy} x2={lineX1} y2={cy} stroke={COLORS.muted} strokeWidth={2.5} strokeLinecap="round" />
                    {arrival !== null ? (
                      <circle cx={lerp(lineX0, lineX1, arrival / WIN)} cy={cy} r={8} fill={COLORS.event} />
                    ) : null}
                  </g>
                ) : null}
              </g>
            );
          })}
        </Stage>
      ) : null}
      {collapse > 0 ? (
        <Label x={640} y={440} size={24} color={COLORS.muted} opacity={collapse * fade(frame, c37 + 8, 10, cBuilds + 10, 18)}>
          each strip = the next 6 minutes
        </Label>
      ) : null}

      {/* worked example */}
      {exIn > 0 ? (
        <Card x={640} y={lerp(640, 548, collapse)} anchor="center" opacity={exIn} padding="14px 34px">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontFamily: FONT.math, fontSize: 40, color: COLORS.ink, whiteSpace: "nowrap" }}>
              <span style={{ opacity: exLambda }}>
                <i>λ</i> = 10 / hour
              </span>
              <span style={{ opacity: exT }}>
                <span style={{ color: COLORS.muted }}> · </span>
                <i>t</i> = 6 min
              </span>
              <span style={{ opacity: exProd }}>
                <span style={{ color: COLORS.muted }}> → </span>
                <i>λt</i> = 1
              </span>
            </div>
            {exResult > 0.01 ? (
              <div
                style={{
                  transform: `scale(${0.7 + 0.3 * exResult})`,
                  opacity: Math.min(1, exResult),
                  display: "flex",
                  alignItems: "baseline",
                  gap: 16,
                }}
              >
                <Formula tex="e^{−1} ≈" size={56} />
                <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 64, color: COLORS.bus }}>37%</span>
              </div>
            ) : null}
          </div>
        </Card>
      ) : null}

      {/* the formula card: an identical blank copy underneath, the real one wiped on over it, then docked */}
      {cardIn > 0 ? (
        <>
          <style>{`.s04-blank * { color: transparent !important; }`}</style>
          {!revealDone ? (
            <AbsoluteFill className="s04-blank">
              <FormulaPocket dock={0} prefix={PREFIX} center={{ x: 640, y: 112 }} opacity={cardIn} />
            </AbsoluteFill>
          ) : null}
          <AbsoluteFill style={revealDone ? undefined : { clipPath: `inset(0px ${W - wipeX}px 0px 0px)` }}>
            <FormulaPocket dock={dock} prefix={PREFIX} center={{ x: 640, y: 112 }} opacity={cardIn} glow={pocketGlow} />
          </AbsoluteFill>
        </>
      ) : null}
    </SceneFrame>
  );
};
