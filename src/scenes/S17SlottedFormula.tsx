// Scene 17 — Double the capacity
// Brief: scenes/s17-slotted-formula.md  ·  Shared brief: scenes/README.md  ·  Kit: src/shared/README.md
//
// Flow: Scene 16's slotted timeline → the formula pocket flies out, λ → G, t → 1 → boxed violet S = G·e^(−G)
// → the slotted curve joins the pure one on Scene 15's plot, peak 1/e, ×2 → the 37% callback: eight bus-stop
// "universes" (λt = 1, three with no bus) above eight slots (G = 1, three empty) → back to the two-curve plot.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  SceneFrame,
  Stage,
  SGPlot,
  sgCoords,
  Timeline,
  SlotGrid,
  PacketBar,
  Interval,
  Bracket,
  FormulaPocket,
  Formula,
  Label,
  BusStopStreet,
  Commuter,
  STREET,
  timeScale,
  cue,
  prog,
  fade,
  pop,
  lerp,
  clamp01,
  rand,
  PEAKS,
  COLORS,
  FONT,
  EASE_OUT,
} from "../shared";

/** Extra seconds of picture after the narration tail. The scene length updates automatically. */
export const meta = { extraTail: 1.5 };

const C = {
  same: cue("s17", "Same formula, new window"),
  now: cue("s17", "now e to the minus G"),
  soS: cue("s17", "so S equals G times"),
  peak: cue("s17", "The peak moves to G equals one"),
  oneOverE: cue("s17", "where S equals one over e"),
  thirty: cue("s17", "About thirty-seven percent"),
  clock: cue("s17", "Just by adding a clock"),
  doubled: cue("s17", "we doubled the capacity"),
  that37: cue("s17", "And that thirty-seven percent"),
  busStop: cue("s17", "It's our bus stop number again"),
  average: cue("s17", "An average of one arrival"),
  none: cue("s17", "thirty-seven percent chance of none"),
  end: cue("s17", "chance of none", "end"),
};

// ---- Scene 16's closing timeline (same geometry and packets) ----
const TL = timeScale(-3, 5, 140, 1140);
const LANE = [352, 308];
const S16_PACKETS = [
  { start: -3, lane: 0, ok: false },
  { start: -3, lane: 1, ok: false },
  { start: -2, lane: 0, ok: true },
  { start: -1, lane: 0, ok: true },
  { start: 1, lane: 0, ok: true },
  { start: 2, lane: 0, ok: true },
  { start: 4, lane: 0, ok: true },
];

// ---- Scene 15's plot box ----
const PLOT = { x: 170, y: 200, w: 640, h: 400, gMax: 3, sMax: 0.4 };
// Scene 18 opens on the kit's default (full-size) plot box, so the closing return grows into it.
const PLOT_FULL = { x: 200, y: 110, w: 880, h: 460, gMax: 3, sMax: 0.4 };
const lerpPlot = (k: number) => ({
  ...PLOT,
  x: lerp(PLOT.x, PLOT_FULL.x, k),
  y: lerp(PLOT.y, PLOT_FULL.y, k),
  w: lerp(PLOT.w, PLOT_FULL.w, k),
  h: lerp(PLOT.h, PLOT_FULL.h, k),
});
const { gx, sy } = sgCoords(PLOT);
const PURE_PT = { x: gx(PEAKS.pure.G), y: sy(PEAKS.pure.S) };
const SLOT_PT = { x: gx(PEAKS.slotted.G), y: sy(PEAKS.slotted.S) };

// ---- the 37% rhyme: 8 bus-stop windows (λt = 1) over 8 slots (G = 1); empties at the same places ----
const ROW = { x0: 160, pitch: 120, n: 8 };
const TOP_Y = 330;
const BOT_Y = 500;
const BUSES = [2, 0, 1, 0, 1, 3, 0, 1];
const PACKETS = [1, 0, 2, 0, 1, 2, 0, 1];
const cellX = (i: number) => ROW.x0 + i * ROW.pitch;
const SLOTS = timeScale(0, ROW.n, ROW.x0, ROW.x0 + ROW.n * ROW.pitch);

/** A boxed formula card ("pure Aloha / S = G·e^(−2G)"), centred at (x, y). */
const FormulaCard: React.FC<{
  label: string;
  tex: string;
  color: string;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  labelK?: number;
}> = ({ label, tex, color, x, y, scale, opacity, labelK = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `translate(-50%, -50%) scale(${scale})`,
      opacity,
      background: COLORS.panel,
      border: `3px solid ${color}`,
      borderRadius: 18,
      padding: "14px 34px 18px",
      textAlign: "center",
      boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
      whiteSpace: "nowrap",
    }}
  >
    <div style={{ fontFamily: FONT.sans, fontSize: 30, color, opacity: labelK, height: 38 * labelK, overflow: "hidden" }}>{label}</div>
    <Formula tex={tex} size={76} />
  </div>
);

/** The prefix crossfades "P(no events in t) =" → "P(success) =" as the substitution happens. */
const Prefix: React.FC<{ k: number }> = ({ k }) => (
  <span style={{ position: "relative", display: "inline-block", width: lerp(350, 262, k), height: "1.2em", verticalAlign: "middle" }}>
    <span style={{ position: "absolute", right: 0, top: 0, whiteSpace: "nowrap", opacity: 1 - k }}>P(no events in t) =</span>
    <span style={{ position: "absolute", right: 0, top: 0, whiteSpace: "nowrap", opacity: k, color: COLORS.ink }}>P(success) =</span>
  </span>
);

export const S17SlottedFormula: React.FC = () => {
  const frame = useCurrentFrame();

  // ---- phase 1: pocket + substitution over the slotted timeline ----
  const tlA = 1 - prog(frame, C.soS - 14, 16);
  const winLabelA = 1 - prog(frame, C.same, 14);
  const pocketOut = prog(frame, C.same, 30); // 0 docked → 1 centred
  const sub = prog(frame, C.now - 6, 28) * (1 - prog(frame, C.soS + 30, 14)); // back to e^(−λt) once docked
  const redock = prog(frame, C.soS + 4, 30);
  const dock = 1 - pocketOut + redock;
  const subLabels = fade(frame, C.now + 4, 12) * (1 - prog(frame, C.soS, 14));

  // ---- phase 2: the plot ----
  const leave = prog(frame, C.busStop - 6, 18);
  const back = prog(frame, C.end + 14, 22);
  const plotIn = prog(frame, C.peak - 6, 18);
  const plotA = plotIn * (1 - leave) + back;
  const slottedDraw = prog(frame, C.peak, 60);
  const slottedPeak = prog(frame, C.oneOverE - 4, 16);
  const ring = clamp01((frame - C.thirty) / 30);
  const ring37 = clamp01((frame - C.that37) / 36);
  const arrow = prog(frame, C.clock + 10, 26) * (1 - prog(frame, C.busStop - 6, 12));
  const boxMove = prog(frame, C.peak - 6, 26);
  const cardsA = plotIn * (1 - leave); // side cards don't come back: the closing plot matches Scene 18's opening
  const boxA = frame < C.peak ? fade(frame, C.soS + 6, 12) : cardsA;
  const grow = prog(frame, C.end + 8, 30);

  // ---- phase 3: the 37% callback ----
  const cbA = prog(frame, C.busStop, 18) * (1 - prog(frame, C.end + 8, 18));
  const topIn = prog(frame, C.busStop, 22);
  const botIn = prog(frame, C.average, 20);
  const emptyTop = prog(frame, C.busStop + 28, 14);
  const emptyBot = prog(frame, C.average + 48, 14);
  const glow = 0.5 + 0.5 * Math.sin(clamp01((frame - C.none) / 24) * Math.PI);
  const together = frame >= C.none ? glow : 0;
  const pulse = 1 + 0.18 * Math.sin(clamp01((frame - C.none) / 18) * Math.PI);

  return (
    <SceneFrame id="s17">
      <AbsoluteFill>
        {/* ===== phase 1: Scene 16's slotted timeline ===== */}
        {tlA > 0 ? (
          <>
            <Stage opacity={tlA}>
              <Interval scale={TL} from={0} to={1} y={330} h={112} />
              <SlotGrid scale={TL} y1={284} y2={376} />
              <Timeline scale={TL} y={400} tickEvery={1} label="time →" tickLabel={(t) => `${t}`} />
              {S16_PACKETS.map((p, i) => (
                <PacketBar key={i} scale={TL} start={p.start} y={LANE[p.lane]} h={40} state={p.ok ? "success" : "collision"} opacity={0.3} />
              ))}
              <PacketBar scale={TL} start={0} y={LANE[0]} h={40} state="success" label="my packet" />
              <Bracket x1={TL(0)} x2={TL(1)} y={262} label="1 frame time" color={COLORS.collision} opacity={winLabelA} />
            </Stage>
            <Label x={640} y={520} size={36} weight={700} opacity={tlA * winLabelA}>
              vulnerable window: <span style={{ color: COLORS.muted, textDecoration: "line-through" }}>2</span>{" "}
              <span style={{ color: COLORS.collision }}>→ 1</span> frame time
            </Label>
          </>
        ) : null}

        {/* substitution labels */}
        <Label x={950} y={112} anchor="left" opacity={subLabels}>
          <Formula tex="λ → G" size={40} color={COLORS.slotted} />
        </Label>
        <Label x={950} y={168} anchor="left" opacity={subLabels}>
          <Formula tex="t → 1" size={40} color={COLORS.slotted} />
        </Label>

        {/* ===== phase 2: both curves on Scene 15's plot ===== */}
        <AbsoluteFill style={{ opacity: Math.min(1, plotA), transform: `translateY(${(1 - Math.min(1, plotA)) * 24}px)` }}>
          <Stage>
            <SGPlot {...lerpPlot(grow)} pure={1} purePeak={1} slotted={slottedDraw} slottedPeak={slottedPeak} />
            {ring > 0 && ring < 1 ? (
              <circle cx={SLOT_PT.x} cy={SLOT_PT.y} r={12 + 40 * EASE_OUT(ring)} fill="none" stroke={COLORS.slotted} strokeWidth={4} opacity={1 - ring} />
            ) : null}
            {[0, 0.5].map((d) => {
              const r = clamp01(ring37 * 1.5 - d);
              return r > 0 && r < 1 ? (
                <circle key={d} cx={SLOT_PT.x} cy={SLOT_PT.y} r={12 + 46 * EASE_OUT(r)} fill="none" stroke={COLORS.bus} strokeWidth={5} opacity={1 - r} />
              ) : null;
            })}
            <DoubleArrow p={arrow} />
          </Stage>
          <FormulaCard label="pure Aloha" tex="S = G·e^{−2G}" color={COLORS.event} x={1045} y={262} scale={0.5} opacity={cardsA} />
        </AbsoluteFill>

        {/* the slotted formula: boxed in the centre, then filed next to the pure one */}
        <FormulaCard
          label="slotted Aloha"
          tex="S = G·e^{−G}"
          color={COLORS.slotted}
          x={lerp(640, 1045, boxMove)}
          y={lerp(330, 362 + (1 - Math.min(1, cardsA)) * 24 * (frame > C.peak ? 1 : 0), boxMove)}
          scale={lerp(1, 0.5, boxMove) * (frame < C.peak ? 0.9 + 0.1 * pop(frame, C.soS + 6) : 1)}
          opacity={Math.min(1, boxA)}
        />

        {/* the pocket: out, substitute, back in */}
        <FormulaPocket
          dock={dock}
          prefix={<Prefix k={sub} />}
          rate="G"
          time="1"
          sub={sub}
          subColor={COLORS.slotted}
          glow={pocketOut * (1 - redock)}
          center={{ x: 640, y: 140 }}
          opacity={prog(frame, C.same - 6, 10) * (1 - prog(frame, C.soS + 46, 14))}
        />

        {/* ===== phase 3: the 37% callback ===== */}
        {cbA > 0 ? (
          <AbsoluteFill style={{ opacity: cbA }}>
            {/* bus stop, frozen at Scene 04's moment */}
            <Stage style={{ transform: `translateY(${(1 - topIn) * -260}px)` }}>
              <g transform="translate(40 22) scale(0.34)">
                <clipPath id="s17-thumb">
                  <rect x={0} y={0} width={1280} height={720} rx={40} />
                </clipPath>
                <g clipPath="url(#s17-thumb)">
                  <BusStopStreet>
                    <Commuter x={STREET.commuter.x} y={STREET.commuter.y} pose="watch" expression="sigh" />
                  </BusStopStreet>
                </g>
                <rect x={0} y={0} width={1280} height={720} rx={40} fill="none" stroke={COLORS.faint} strokeWidth={8} />
              </g>
              {/* the 6-minute ring */}
              <circle cx={560} cy={146} r={58} fill={COLORS.panel} stroke={COLORS.faint} strokeWidth={10} />
              <circle
                cx={560}
                cy={146}
                r={58}
                fill="none"
                stroke={COLORS.ink}
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 58}
                strokeDashoffset={2 * Math.PI * 58 * (1 - prog(frame, C.busStop + 6, 24))}
                transform="rotate(-90 560 146)"
              />
              <text x={560} y={140} fill={COLORS.ink} fontFamily={FONT.sans} fontWeight={800} fontSize={34} textAnchor="middle">
                6
              </text>
              <text x={560} y={170} fill={COLORS.muted} fontFamily={FONT.sans} fontSize={20} textAnchor="middle">
                min
              </text>
              {/* eight "universes": the same 6 minutes, played eight times */}
              {BUSES.map((n, i) => {
                const a = fade(frame, C.busStop + 4 + i * 3, 10);
                const x = cellX(i);
                const empty = n === 0;
                return (
                  <g key={i} opacity={a}>
                    <rect
                      x={x + 6}
                      y={TOP_Y - 32}
                      width={ROW.pitch - 12}
                      height={64}
                      rx={12}
                      fill={empty ? COLORS.bus : COLORS.panel}
                      fillOpacity={empty ? 0.12 * emptyTop + 0.2 * together : 1}
                      stroke={empty ? COLORS.bus : COLORS.faint}
                      strokeOpacity={empty ? 0.35 + 0.65 * emptyTop : 1}
                      strokeWidth={empty ? 3 + 2 * together : 2}
                    />
                    <line x1={x + 18} y1={TOP_Y + 14} x2={x + ROW.pitch - 18} y2={TOP_Y + 14} stroke={COLORS.muted} strokeWidth={2} opacity={0.6} />
                    {Array.from({ length: n }, (_, k) => {
                      const t = rand(`s17-bus-${i}-${k}`, 0.15, 0.85);
                      const s = pop(frame, C.busStop + 14 + i * 3 + k * 4);
                      return <circle key={k} cx={x + 18 + t * (ROW.pitch - 36)} cy={TOP_Y + 14 - 14 * s} r={8 * clamp01(s)} fill={COLORS.event} />;
                    })}
                  </g>
                );
              })}
            </Stage>
            <Label x={140} y={TOP_Y} anchor="right" opacity={topIn}>
              <Formula tex="λt = 1" size={32} color={COLORS.muted} />
            </Label>
            <Label x={1140} y={TOP_Y} anchor="left" size={40} weight={800} color={COLORS.bus} opacity={emptyTop} style={{ scale: `${pulse}` }}>
              ≈ 37%
            </Label>

            {/* eight slots at G = 1 */}
            <Stage style={{ transform: `translateY(${(1 - botIn) * 240}px)` }} opacity={botIn}>
              {PACKETS.map((n, i) =>
                n === 0 ? (
                  <rect
                    key={i}
                    x={cellX(i) + 6}
                    y={BOT_Y - 32}
                    width={ROW.pitch - 12}
                    height={64}
                    rx={12}
                    fill={COLORS.bus}
                    fillOpacity={0.12 * emptyBot + 0.2 * together}
                    stroke={COLORS.bus}
                    strokeOpacity={emptyBot}
                    strokeWidth={3 + 2 * together}
                  />
                ) : null,
              )}
              <SlotGrid scale={SLOTS} y1={BOT_Y - 40} y2={BOT_Y + 40} shade={false} />
              <Timeline scale={SLOTS} y={BOT_Y + 40} arrow={false} strokeWidth={2} />
              {PACKETS.map((n, i) =>
                Array.from({ length: n }, (_, k) => {
                  const s = pop(frame, C.average + 10 + i * 4 + k * 3);
                  if (frame < C.average + 10 + i * 4 + k * 3) return null;
                  const y = n === 1 ? BOT_Y : BOT_Y + (k === 0 ? -17 : 17);
                  return (
                    <PacketBar
                      key={`${i}-${k}`}
                      scale={SLOTS}
                      start={i}
                      y={y - (1 - clamp01(s)) * 30}
                      h={n === 1 ? 34 : 28}
                      state={n === 1 ? "success" : "collision"}
                      opacity={clamp01(s)}
                    />
                  );
                }),
              )}
            </Stage>
            <Label x={140} y={BOT_Y} anchor="right" opacity={botIn}>
              <Formula tex="G = 1" size={32} color={COLORS.muted} />
            </Label>
            <Label x={1140} y={BOT_Y} anchor="left" size={40} weight={800} color={COLORS.bus} opacity={emptyBot} style={{ scale: `${pulse}` }}>
              ≈ 37%
            </Label>
            <Label x={640} y={596} size={28} opacity={fade(frame, C.average + 56, 14)}>
              <span style={{ color: COLORS.bus }}>37% empty</span>
              <span style={{ color: COLORS.muted }}> · </span>
              <span style={{ color: COLORS.success }}>37% success</span>
              <span style={{ color: COLORS.muted }}> · </span>
              <span style={{ color: COLORS.collision }}>26% collision</span>
            </Label>
          </AbsoluteFill>
        ) : null}
      </AbsoluteFill>
    </SceneFrame>
  );
};

/** "×2": an arrow up the S axis, from the pure peak's level to the slotted peak's level (their dashed guides). */
const DoubleArrow: React.FC<{ p: number }> = ({ p }) => {
  if (p <= 0) return null;
  const x = PLOT.x + 22;
  const y0 = PURE_PT.y - 8;
  const y1 = SLOT_PT.y + 8;
  const y = lerp(y0, y1, p);
  return (
    <g>
      <line x1={x} y1={y0} x2={x} y2={y} stroke={COLORS.ink} strokeWidth={4} strokeLinecap="round" />
      <path d={`M ${x - 10} ${y + 12} L ${x} ${y} L ${x + 10} ${y + 12}`} stroke={COLORS.ink} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x={x + 14} y={(y0 + y1) / 2 + 14} fill={COLORS.ink} fontFamily={FONT.sans} fontWeight={800} fontSize={40} opacity={clamp01(p * 2 - 0.6)}>
        ×2
      </text>
    </g>
  );
};
