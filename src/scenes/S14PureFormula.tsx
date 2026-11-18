// Scene 14 — Applying the formula
// Brief: scenes/s14-pure-formula.md  ·  Shared brief: scenes/README.md  ·  Kit: src/shared/README.md
//
// Split screen: the bus-stop timeline (Scene 04) on top, the packet timeline (Scene 13) below, built from the
// same Timeline with their windows aligned to the same pixels. The formula pocket e^(−λt) flies out of the
// top-right corner, λ→G and t→2 slide in, and it drops into S = G × P(success) → boxed S = G·e^(−2G).
import React from "react";
import { interpolateColors, useCurrentFrame } from "remotion";
import {
  Bracket,
  Bus,
  BusStopStreet,
  Card,
  CellTower,
  COLORS,
  Commuter,
  cue,
  EventDots,
  fade,
  Formula,
  FONT,
  FormulaPocket,
  Caption,
  SIZE,
  Interval,
  Label,
  lerp,
  PacketBar,
  poissonArrivals,
  prog,
  SceneFrame,
  Stage,
  STREET,
  Timeline,
  timeScale,
  useSvgId,
} from "../shared";

/** Extra seconds of picture after the narration tail. The scene length updates automatically. */
export const meta = { extraTail: 0.7 };

// ── Beats (scene frames) ───────────────────────────────────────────────────────────────────────────────────
const F = {
  q: cue("s14", "And this is the bus stop question again"),
  before: cue("s14", "Before, we asked"),
  sixMin: cue("s14", "no bus for six minutes"),
  now: cue("s14", "Now we want"),
  twoFT: cue("s14", "no other packet for two frame times"),
  same: cue("s14", "Same formula"),
  eLt: cue("s14", "e to the minus lambda t"),
  rate: cue("s14", "the rate is G"),
  time: cue("s14", "the time is two"),
  timeEnd: cue("s14", "the time is two", "end"),
  success: cue("s14", "So the chance of success"),
  e2G: cue("s14", "e to the minus two G"),
  mult: cue("s14", "Multiply by G"),
  thru: cue("s14", "throughput of pure Aloha"),
  final: cue("s14", "S equals G times"),
};

// ── Geometry ───────────────────────────────────────────────────────────────────────────────────────────────
// Both timelines span the same pixels, and the two windows sit on exactly the same x range:
// top: 6 minutes (0 … 6 min), bottom: 2 frame times (−1 … +1). Packet bars are 1 frame time on PKT.
const X0 = 330;
const X1 = 1220;
const PKT = timeScale(-2, 5, X0, X1); // frame times
const BUS = timeScale(-3, 18, X0, X1); // minutes; 6 min = 2 frame times in pixels
const WIN_X1 = PKT(-1);
const WIN_X2 = PKT(1);

const TOP = { y: 20, h: 180, line: 150 };
const BOT = { y: 216, h: 180, line: 346, pkt: 320, win: 318 };
const BAND_X = 24;
const BAND_W = 1232;
const VIG = { x: 36, w: 264, h: 156 };
const TITLE_X = 1130; // right edge for row titles (clear of the docked pocket)

// Bus arrivals: 10 an hour (1/6 per minute), none in the 6-minute window.
const BUS_TIMES = poissonArrivals(1 / 6, -3, 18, "s14-bus")
  .filter((t) => t < -0.4 || t > 6.4)
  .concat([-1.6]) // the bus that just left as the Commuter arrived
  .sort((a, b) => a - b);
// Other packets' start times: none in the vulnerable window.
const OTHER_STARTS = poissonArrivals(0.9, -2, 5, "s14-other").filter((t) => Math.abs(t) > 1.2);

const POCKET_Y = 535;
/** Rows are lowered by this much (centred on screen) until the pocket flies in. */
const ROWS_LOW = 150;
/**
 * Scene 13's last frame (copied from S13_FINAL in S13VulnerableWindow.tsx, screen px): frame 0 reproduces it,
 * then the opening morph rescales and glides it into the bottom row.
 */
const S13 = {
  scale: { t0: -1.5, t1: 2.0, x0: 250, x1: 1160 },
  axisY: 420,
  packetY: 380,
  win: { y: 355, h: 130 },
  bracketGap: 16,
  bracketSize: 26,
  captionY: 560,
};
/** The opening morph (scene frames). */
const MORPH = { start: 8, dur: 40 };
const SLOT_Y = 330;

/** 0 → 1 → 0 bump between start and start + dur. */
const bump = (frame: number, start: number, dur: number) => {
  const p = prog(frame, start, dur, (x) => x);
  return Math.sin(Math.PI * p);
};

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const clipTop = useSvgId("s14-vig-top");
  const clipBot = useSvgId("s14-vig-bot");

  // ── Row emphasis: one idea at a time, both rows bright on "Same formula", gone once the algebra takes over.
  const away = 1 - prog(frame, F.mult, 22);
  const topIn = prog(frame, 28, 28);
  const topA =
    topIn *
    away *
    lerp(1, 0.45, prog(frame, F.now, 15)) *
    lerp(1, 1 / 0.45, prog(frame, F.same, 15)) *
    lerp(1, 0.45, prog(frame, F.rate, 15));
  const botA =
    away *
    lerp(1, 0.45, prog(frame, F.before, 15)) *
    lerp(1, 1 / 0.45, prog(frame, F.now, 15));

  // The rows sit centred while they're the subject, then rise to make room for the formula.
  const groupDy = lerp(ROWS_LOW, 0, prog(frame, F.same - 6, 32));
  const botDy = 0;
  const botBand = prog(frame, 22, 24);

  // Opening: Scene 13's final frame. The caption fades, the bracket label shortens, and the axis rescales
  // and glides into the bottom row. Everything is in the rows' coordinates (lowered by ROWS_LOW here).
  const m = prog(frame, MORPH.start, MORPH.dur);
  const pkt = timeScale(lerp(S13.scale.t0, PKT.t0, m), lerp(S13.scale.t1, PKT.t1, m), lerp(S13.scale.x0, X0, m), lerp(S13.scale.x1, X1, m));
  const axisY = lerp(S13.axisY - ROWS_LOW, BOT.line, m);
  const pktY = lerp(S13.packetY - ROWS_LOW, BOT.pkt, m);
  const winY = lerp(S13.win.y - ROWS_LOW, BOT.win, m);
  const winH = lerp(S13.win.h, 80, m);
  const brY = winY - winH / 2 - lerp(S13.bracketGap, 12, m);
  const brSize = lerp(S13.bracketSize, 22, m);
  const captionA = 1 - prog(frame, 0, 12);
  const longLabelA = 1 - prog(frame, MORPH.start, 14);
  const shortLabelA = prog(frame, MORPH.start + 12, 14);
  const s13Marks = 1 - prog(frame, MORPH.start, 20); // −1 / 0 / +1 labels and the red edge ticks
  const pktWinX1 = pkt(-1);
  const pktWinX2 = pkt(1);
  const topDy = lerp(-24, 0, topIn);

  // Top row: the bus rides the timeline and leaves a dot wherever a bus came; the window grows on "six minutes".
  const busP = prog(frame, 54, F.sixMin - 62, (x) => x); // linear: time flowing
  const busT = lerp(BUS.t0 - 0.6, BUS.t1 + 1.2, busP);
  const busX = BUS(busT);
  const busA = fade(frame, 52, 8) * (1 - prog(frame, F.sixMin - 12, 10));
  const topWin = prog(frame, F.sixMin, 22);
  const ghost37 = prog(frame, F.sixMin + 30, 20);
  const bothGlow = bump(frame, F.same, 40);
  const topGlow = Math.max(0.35 * prog(frame, F.sixMin, 20) + 0.65 * bump(frame, F.sixMin, 40), bothGlow);

  // Bottom row: other starts drop in on "Now we want"; the empty window glows on "two frame times".
  const pktCursor = lerp(PKT.t0, PKT.t1, prog(frame, F.now + 4, 34, (x) => x));
  const botGlow = Math.max(0.35 * prog(frame, F.twoFT, 20) + 0.65 * bump(frame, F.twoFT, 40), bothGlow);
  const botTitle = prog(frame, F.twoFT, 18);

  // ── Formula pocket: docked → centre → substitution → P(success) → into S = G × P(success).
  const dock = 1 - prog(frame, F.same + 4, 34);
  const sub = prog(frame, F.rate, F.timeEnd - F.rate);
  const shiftRight = prog(frame, F.success, 24);
  const intoSlot = prog(frame, F.thru, 30);
  const sShift = 62 * intoSlot; // re-centre S = G × [card] as the card lands
  const pocketX = lerp(lerp(640, 858, shiftRight), 726 + sShift, intoSlot);
  const pocketY = lerp(POCKET_Y, SLOT_Y, intoSlot);
  const pocketGlow = Math.max(0.6 * bump(frame, F.same, 50), bump(frame, F.e2G, 30), 0.7 * bump(frame, F.thru + 20, 30));
  const pocketA = fade(frame, 0, 10) * (1 - prog(frame, F.final, 14));
  // Row titles dip while the pocket flies across them, then come back.
  const titleDip = Math.min(1, 1 - prog(frame, F.same - 8, 8) + prog(frame, F.same + 26, 12));

  // Chips under the pocket: the bus-stop meaning first, then the packet substitution.
  const chipsA = fade(frame, F.eLt + 6, 14) * (1 - prog(frame, F.success, 14));
  const rateX = prog(frame, F.rate, 18);
  const timeX = prog(frame, F.time, 18);

  // P(success) = …, then S = G × P(success).
  const pLabelA = fade(frame, F.success + 12, 14) * (1 - prog(frame, F.thru, 16));
  const sLineA = fade(frame, F.mult + 18, 16) * (1 - prog(frame, F.final, 14));
  const sSlotA = 1 - prog(frame, F.thru, 16);
  const finalA = fade(frame, F.final, 14);
  const pureTag = fade(frame, F.final + 16, 14);

  const rowTitleStyle = { fontWeight: 600 } as const;

  return (
    <>
      <Stage>
        <defs>
          <clipPath id={clipTop}>
            <rect x={VIG.x} y={TOP.y + 12} width={VIG.w} height={VIG.h} rx={12} />
          </clipPath>
          <clipPath id={clipBot}>
            <rect x={VIG.x} y={BOT.y + 12} width={VIG.w} height={VIG.h} rx={12} />
          </clipPath>
        </defs>

        <g transform={`translate(0 ${groupDy})`}>
        {/* ── TOP ROW · the bus stop ─────────────────────────────────────────────────────────── */}
        <g opacity={topA} transform={`translate(0 ${topDy})`}>
          <rect x={BAND_X} y={TOP.y} width={BAND_W} height={TOP.h} rx={18} fill={COLORS.panel} />
          {/* real-life vignette: a window onto the home street */}
          <g clipPath={`url(#${clipTop})`}>
            <g transform={`translate(${VIG.x - 700 * 0.5} ${TOP.y + 12 - 378 * 0.5}) scale(0.5)`}>
              <BusStopStreet>
                <Commuter
                  x={STREET.commuter.x}
                  y={STREET.commuter.y}
                  pose={frame >= F.before ? "watch" : "phone"}
                  expression={frame >= F.sixMin ? "sigh" : "neutral"}
                />
              </BusStopStreet>
            </g>
          </g>
          <Interval scale={BUS} from={0} to={6} y={TOP.line} h={70} color={COLORS.success} fillOpacity={0.2} progress={topWin} />
          <g style={{ filter: `drop-shadow(0 0 ${6 + 14 * topGlow}px ${COLORS.success})` }} opacity={topGlow * topWin}>
            <rect x={WIN_X1} y={TOP.line - 35} width={WIN_X2 - WIN_X1} height={70} rx={6} fill="none" stroke={COLORS.success} strokeWidth={3} />
          </g>
          <Timeline scale={BUS} y={TOP.line} tickEvery={3} label="minutes →" />
          <EventDots scale={BUS} y={TOP.line} times={BUS_TIMES} until={busT - 0.3} popSpan={0.8} drop={26} color={COLORS.bus} />
          <Bus x={busX} y={TOP.line - 12} scale={0.17} wheelRotation={busX * 3} opacity={busA} />
          <Bracket x1={WIN_X1} x2={WIN_X2} y={TOP.line - 46} label="6 min" progress={prog(frame, F.sixMin + 10, 18)} opacity={frame > F.sixMin + 10 ? 1 : 0} />
        </g>

        {/* ── BOTTOM ROW · the packet channel ────────────────────────────────────────────────── */}
        <g opacity={botA} transform={`translate(0 ${botDy})`}>
          <g opacity={botBand}>
            <rect x={BAND_X} y={BOT.y} width={BAND_W} height={BOT.h} rx={18} fill={COLORS.panel} />
            <g clipPath={`url(#${clipBot})`}>
              <rect x={VIG.x} y={BOT.y + 12} width={VIG.w} height={VIG.h} fill="#16213a" />
              <CellTower x={VIG.x + VIG.w / 2} y={BOT.y + 12 + VIG.h - 8} scale={0.78} emit={(frame / 45) % 1} ripples={1} />
            </g>
          </g>
          <Interval scale={pkt} from={-1} to={1} y={winY} h={winH} color={COLORS.collision} fillOpacity={0.2} />
          <g style={{ filter: `drop-shadow(0 0 ${6 + 14 * botGlow}px ${COLORS.success})` }} opacity={botGlow}>
            <rect x={pktWinX1} y={winY - winH / 2} width={pktWinX2 - pktWinX1} height={winH} rx={6} fill="none" stroke={COLORS.success} strokeWidth={3} />
          </g>
          <Timeline scale={pkt} y={axisY} tickEvery={1} />
          {/* Scene 13's tick labels and red window-edge ticks, fading out during the morph */}
          {s13Marks > 0 ? (
            <g opacity={s13Marks}>
              {[-1, 0, 1].map((t) => (
                <text key={t} x={pkt(t)} y={axisY + 34} fill={COLORS.muted} fontFamily={FONT.sans} fontSize={SIZE.small} textAnchor="middle">
                  {t === -1 ? "−1" : t === 0 ? "0" : "+1"}
                </text>
              ))}
              {[-1, 1].map((t) => (
                <line key={t} x1={pkt(t)} y1={axisY - 16} x2={pkt(t)} y2={axisY + 16} stroke={COLORS.collision} strokeWidth={4} strokeLinecap="round" />
              ))}
            </g>
          ) : null}
          <text x={pkt.x1} y={axisY + lerp(62, 36, m)} fill={COLORS.muted} fontFamily={FONT.sans} fontSize={SIZE.small} textAnchor="end">
            frame times →
          </text>
          <EventDots scale={pkt} y={axisY} times={OTHER_STARTS} until={pktCursor} popSpan={0.25} drop={26} color={COLORS.event} />
          <PacketBar scale={pkt} start={0} y={pktY} state="success" label="my packet" />
          <Bracket x1={pktWinX1} x2={pktWinX2} y={brY} />
          <g fill={COLORS.ink} fontFamily={FONT.sans} fontSize={brSize} textAnchor="middle">
            {longLabelA > 0 ? (
              <text x={(pktWinX1 + pktWinX2) / 2} y={brY - 14} opacity={longLabelA}>
                vulnerable window = 2 frame times
              </text>
            ) : null}
            <text x={(pktWinX1 + pktWinX2) / 2} y={brY - 14} opacity={shortLabelA}>
              2 frame times
            </text>
          </g>
        </g>
        </g>
      </Stage>

      {/* ── Row titles (HTML) ─────────────────────────────────────────────────────────────────── */}
      <Label x={TITLE_X} y={TOP.y + 34 + topDy + groupDy} anchor="right" size={28} opacity={topA * titleDip * prog(frame, F.sixMin, 18)} style={rowTitleStyle}>
        no bus for 6 min
      </Label>
      <Label x={TITLE_X} y={TOP.y + 74 + topDy + groupDy} anchor="right" size={30} weight={800} color={COLORS.bus} opacity={topA * titleDip * 0.55 * ghost37}>
        ≈ 37%
      </Label>
      <Label x={TITLE_X} y={BOT.y + 34 + botDy + groupDy} anchor="right" size={28} opacity={botA * titleDip * botTitle} style={rowTitleStyle}>
        no packet for 2 frame times
      </Label>

      {/* Scene 13's closing caption, fading as the split screen forms */}
      {captionA > 0 ? (
        <Caption y={S13.captionY} opacity={captionA}>
          success = no other start in the window
        </Caption>
      ) : null}

      {/* ── Chips: what λ and t mean, bus stop → packets ──────────────────────────────────────── */}
      <Chip x={620} anchor="right" y={662} opacity={chipsA} p={rateX} from={<>λ = 10 buses/hour</>} to={<Formula tex="λ → G" size={34} color={COLORS.event} />} />
      <Chip x={660} anchor="left" y={662} opacity={chipsA} p={timeX} from={<>t = 6 min</>} to={<Formula tex="t → 2" size={34} color={COLORS.event} />} />

      {/* ── P(success) = … ────────────────────────────────────────────────────────────────────── */}
      <Label x={690} y={POCKET_Y} anchor="right" opacity={pLabelA}>
        <Formula tex="P(success) =" size={72} />
      </Label>

      {/* ── S = G × P(success) ────────────────────────────────────────────────────────────────── */}
      <Label x={580 + sShift} y={SLOT_Y} anchor="right" opacity={sLineA}>
        <Formula tex="S = G ×" size={80} />
      </Label>
      <Label x={604 + sShift} y={SLOT_Y} anchor="left" opacity={sLineA * sSlotA}>
        <Formula tex="P(success)" size={80} color={COLORS.muted} />
      </Label>

      <FormulaPocket
        dock={dock}
        rate="G"
        time="2"
        sub={sub}
        glow={pocketGlow}
        opacity={pocketA}
        center={{ x: pocketX, y: pocketY }}
      />

      {/* ── The result, boxed ─────────────────────────────────────────────────────────────────── */}
      <Card
        x={640}
        y={SLOT_Y}
        start={F.final}
        opacity={finalA}
        padding="26px 56px"
        style={{ border: `4px solid ${COLORS.event}`, boxShadow: `0 12px 40px rgba(0,0,0,0.4), 0 0 40px rgba(56, 189, 248, 0.25)` }}
      >
        <Formula tex="S = G·e^{−2G}" size={100} />
      </Card>
      <Label x={640} y={SLOT_Y + 118} size={34} italic color={COLORS.event} opacity={pureTag}>
        pure Aloha
      </Label>
    </>
  );
};

/** A small panel chip whose text cross-fades from `from` (bus stop, yellow) to `to` (packets, blue). */
const Chip: React.FC<{
  x: number;
  y: number;
  anchor: "left" | "right";
  p: number;
  opacity: number;
  from: React.ReactNode;
  to: React.ReactNode;
}> = ({
  x,
  anchor,
  y,
  p,
  opacity,
  from,
  to,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `translate(${anchor === "right" ? "-100%" : "0%"}, -50%)`,
      opacity,
      padding: "8px 22px",
      borderRadius: 999,
      background: COLORS.panel,
      border: `2px solid ${interpolateColors(p, [0, 1], [COLORS.bus, COLORS.event])}`,
      display: "grid",
      placeItems: "center",
      minWidth: 120,
      height: 52,
      whiteSpace: "nowrap",
    }}
  >
    <span style={{ gridArea: "1 / 1", opacity: 1 - p, color: COLORS.bus, fontFamily: FONT.sans, fontSize: 28 }}>
      {from}
    </span>
    <span style={{ gridArea: "1 / 1", opacity: p }}>{to}</span>
  </div>
);

export const S14PureFormula: React.FC = () => (
  <SceneFrame id="s14">
    <Scene />
  </SceneFrame>
);
