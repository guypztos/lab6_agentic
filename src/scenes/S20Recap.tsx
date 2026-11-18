// Scene 20 — Recap
// Brief: scenes/s20-recap.md  ·  Shared brief: scenes/README.md  ·  Kit: src/shared/README.md
//
// Beats: the Commuter at the stop cross-fades to the recap card (faint S–G plot behind it). Four lines build,
// each with its real-life icon: bus → Poisson (the formula pocket docks into it), walkie-talkie + die → Aloha,
// an arrow from line 1 down to lines 3–4, highway → pure, calendar → slotted. On the last line: back at the
// stop, the route-10 bus finally pulls in, the Commuter gets on, it drives off. Title: Nobody's in Charge.
import React from "react";
import { useCurrentFrame } from "remotion";
import {
  Bus,
  BusStopStreet,
  clamp01,
  COLORS,
  Commuter,
  cue,
  Die,
  EASE,
  EASE_IN,
  EASE_OUT,
  fade,
  FONT,
  Formula,
  FormulaPocket,
  ILLUS,
  Label,
  lerp,
  narrationEndFrame,
  pop,
  prog,
  SceneFrame,
  sceneDurationInFrames,
  SGPlot,
  Stage,
  STREET,
  Talker,
  Title,
} from "../shared";

/** Extra seconds of picture after the narration tail. The scene length updates automatically. */
export const meta = { extraTail: 2.5 }; // room for the closing bus gag (see brief)

const ID = "s20" as const;

const T = {
  recap: cue(ID, "Let's recap"),
  poisson: cue(ID, "A Poisson process"),
  formula: cue(ID, "e to the minus lambda t"),
  aloha: cue(ID, "Aloha says"),
  collide: cue(ID, "if you collide"),
  treat: cue(ID, "Treat all the attempts"),
  pure: cue(ID, "Pure Aloha peaks"),
  slotted: cue(ID, "Slotted Aloha, at about"),
  notBad: cue(ID, "Not bad"),
  end: narrationEndFrame(ID),
};
const SCENE_END = sceneDurationInFrames(ID, meta.extraTail);

// ── the card ─────────────────────────────────────────────────────────────────────────────────────────
const CARD = { x: 60, y: 96, w: 1160, h: 536 };
const ROW = [168, 290, 412, 534];
const ICON_X = 168;
const TEXT_X = 252;
/** Where the formula pocket lands in line 1 (its centre), and how big it is there. */
const POCKET_AT = { x: 482, y: ROW[0] + 24 };
const POCKET_SCALE = 0.42;

// ── the icons (SVG, canvas px) ───────────────────────────────────────────────────────────────────────
const IconPop: React.FC<{ x: number; y: number; start: number; frame: number; children: React.ReactNode }> = ({ x, y, start, frame, children }) => {
  const s = Math.min(1.08, pop(frame, start));
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`} opacity={clamp01((frame - start) / 6)}>
      {children}
    </g>
  );
};

const IconDisc: React.FC<{ x: number; y: number; color?: string }> = ({ x, y, color = COLORS.faint }) => (
  <circle cx={x} cy={y} r={50} fill={COLORS.bg} stroke={color} strokeWidth={2.5} opacity={0.9} />
);

const Highway: React.FC<{ x: number; y: number; frame: number }> = ({ x, y, frame }) => (
  <g>
    <path d={`M ${x - 46} ${y + 30} L ${x + 46} ${y + 30} L ${x + 12} ${y - 30} L ${x - 12} ${y - 30} Z`} fill={ILLUS.road} />
    {[0, 1, 2, 3].map((i) => {
      const u = ((frame / 30 + i / 4) % 1);
      const yy = y - 28 + u * 56;
      return <rect key={i} x={x - 1.5 - u} y={yy} width={3 + u * 2} height={4 + u * 6} fill={ILLUS.roadLine} />;
    })}
    {/* bunched-up traffic */}
    <rect x={x - 30} y={y + 6} width={18} height={12} rx={3} fill="#64748b" />
    <rect x={x + 10} y={y + 2} width={18} height={12} rx={3} fill="#57534e" />
    <rect x={x - 18} y={y - 12} width={13} height={9} rx={2} fill="#78350f" />
    <rect x={x + 4} y={y - 18} width={11} height={8} rx={2} fill="#334155" />
  </g>
);

const Calendar: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <rect x={x - 36} y={y - 30} width={72} height={64} rx={8} fill="#e2e8f0" />
    <rect x={x - 36} y={y - 30} width={72} height={16} rx={6} fill={COLORS.slotted} />
    <rect x={x - 22} y={y - 38} width={6} height={14} rx={3} fill="#475569" />
    <rect x={x + 16} y={y - 38} width={6} height={14} rx={3} fill="#475569" />
    {[0, 1, 2, 3].map((i) => (
      <line key={i} x1={x - 30} y1={y - 4 + i * 10} x2={x + 30} y2={y - 4 + i * 10} stroke="#94a3b8" strokeWidth={1.5} />
    ))}
    {/* one booked hour */}
    <rect x={x - 28} y={y + 7} width={56} height={9} rx={2} fill={COLORS.slotted} />
  </g>
);

const RecapIcons: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <IconPop x={ICON_X} y={ROW[0]} start={T.poisson} frame={frame}>
      <IconDisc x={ICON_X} y={ROW[0]} />
      <Bus x={ICON_X} y={ROW[0] + 17} scale={0.21} />
    </IconPop>
    <IconPop x={ICON_X} y={ROW[1]} start={T.aloha} frame={frame}>
      <IconDisc x={ICON_X} y={ROW[1]} />
      <Talker who="A" x={ICON_X - 16} y={ROW[1] + 38} scale={0.3} talk={frame < T.collide ? (Math.sin(frame * 0.6) + 1) / 2 : 0} />
      <Die x={ICON_X + 24} y={ROW[1] + 18} value={4} size={26} roll={prog(frame, T.collide + 20, 24)} seed="s20-die" />
    </IconPop>
    <IconPop x={ICON_X} y={ROW[2]} start={T.pure} frame={frame}>
      <IconDisc x={ICON_X} y={ROW[2]} color={COLORS.event} />
      <Highway x={ICON_X} y={ROW[2]} frame={frame} />
    </IconPop>
    <IconPop x={ICON_X} y={ROW[3]} start={T.slotted} frame={frame}>
      <IconDisc x={ICON_X} y={ROW[3]} color={COLORS.slotted} />
      <Calendar x={ICON_X} y={ROW[3] + 4} />
    </IconPop>
  </g>
);

/** "Treat all the attempts as a Poisson process": an arrow from line 1 down to lines 3 and 4. */
const PoissonArrow: React.FC<{ frame: number }> = ({ frame }) => {
  const p = prog(frame, T.treat, 30);
  if (p <= 0) return null;
  const x = 92;
  const heads = clamp01((p - 0.85) * 7);
  const head = (y: number) => `M ${x + 26} ${y} L ${x + 14} ${y - 8} L ${x + 14} ${y + 8} Z`;
  return (
    <g stroke={COLORS.event} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path
        d={`M ${ICON_X - 54} ${ROW[0]} H ${x} V ${ROW[3]} H ${x + 16}`}
        pathLength={100}
        strokeDasharray={100}
        strokeDashoffset={100 * (1 - p)}
      />
      <path d={`M ${x} ${ROW[2]} H ${x + 16}`} opacity={heads} />
      <path d={head(ROW[2])} fill={COLORS.event} stroke="none" opacity={heads} />
      <path d={head(ROW[3])} fill={COLORS.event} stroke="none" opacity={heads} />
    </g>
  );
};

// ── the closing gag: the bus finally arrives ─────────────────────────────────────────────────────────
const GAG = {
  arrive: T.notBad + 8,
  stop: T.notBad + 58,
  doorOpen: T.notBad + 60,
  walk: T.notBad + 70,
  board: T.notBad + 90,
  doorClose: T.notBad + 100,
  leave: T.notBad + 108,
  gone: T.notBad + 152,
};
const DOOR_X = STREET.busStopX + 122; // centre of the bus door when stopped

const BusArrives: React.FC<{ frame: number; dim: number }> = ({ frame, dim }) => {
  const inP = prog(frame, GAG.arrive, GAG.stop - GAG.arrive, EASE_OUT);
  const outP = prog(frame, GAG.leave, GAG.gone - GAG.leave, EASE_IN);
  const busX = frame < GAG.leave ? lerp(STREET.busEnterX, STREET.busStopX, inP) : lerp(STREET.busStopX, STREET.busExitX, outP);
  const door = prog(frame, GAG.doorOpen, 8) * (1 - prog(frame, GAG.doorClose, 8));
  const walk = prog(frame, GAG.walk, GAG.board - GAG.walk, EASE);
  const walking = frame >= GAG.walk && frame < GAG.board;
  const boarded = prog(frame, GAG.board - 4, 10);
  const cx = lerp(STREET.commuter.x, DOOR_X + 6, walk);
  const busArrived = frame >= GAG.stop - 10;
  return (
    <BusStopStreet
      dim={dim}
      road={<Bus x={busX} y={STREET.busY} wheelRotation={(busX - STREET.busEnterX) * 1.5} doorOpen={door} />}
    >
      {boarded < 1 ? (
        <Commuter
          x={cx}
          y={STREET.commuter.y - boarded * 18}
          facing={-1}
          pose={walking ? "walk" : busArrived ? "stand" : "phone"}
          walkPhase={frame * 0.4}
          expression={busArrived ? "happy" : "neutral"}
          opacity={1 - boarded}
        />
      ) : null}
    </BusStopStreet>
  );
};

// ── the scene ────────────────────────────────────────────────────────────────────────────────────────
export const S20Recap: React.FC = () => {
  const frame = useCurrentFrame();

  const openingStreet = 1 - prog(frame, 4, 18);
  const cardIn = prog(frame, T.recap, 18);
  const toStreet = prog(frame, T.notBad, 16);
  const cardOp = cardIn * (1 - toStreet);
  const plotIn = prog(frame, T.recap + 6, 40);

  // formula pocket: docked top-right, then it flies into line 1
  const dockOut = prog(frame, T.formula - 4, 32, EASE);
  const pocketScale = lerp(1, POCKET_SCALE, dockOut);

  const rowText = (start: number) => ({ start, opacity: 1 - toStreet });
  const lineB = 30;

  return (
    <SceneFrame id={ID}>
      {/* Scene 19's last picture: the Commuter at the stop, looking down the road */}
      {openingStreet > 0 ? (
        <Stage opacity={openingStreet}>
          <BusStopStreet>
            <Commuter x={STREET.commuter.x} y={STREET.commuter.y} pose="stand" facing={-1} />
          </BusStopStreet>
        </Stage>
      ) : null}

      {/* the card, with the S–G plot faintly behind it */}
      {cardOp > 0 ? (
        <Stage opacity={cardOp}>
          <SGPlot x={300} y={150} w={800} h={390} pure={plotIn} slotted={plotIn} curveLabels={false} opacity={0.35} />
          <g transform={`translate(640 ${CARD.y + CARD.h / 2}) scale(${lerp(0.94, 1, EASE(cardIn))}) translate(-640 ${-(CARD.y + CARD.h / 2)})`}>
            <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx={26} fill={COLORS.panel} opacity={0.86} />
            <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx={26} fill="none" stroke={COLORS.faint} strokeWidth={2} />
          </g>
          {[1, 2, 3].map((i) => (
            <line
              key={i}
              x1={CARD.x + 40}
              x2={CARD.x + CARD.w - 40}
              y1={(ROW[i - 1] + ROW[i]) / 2}
              y2={(ROW[i - 1] + ROW[i]) / 2}
              stroke={COLORS.faint}
              strokeWidth={1.5}
              opacity={0.5 * clamp01((frame - [T.aloha, T.pure, T.slotted][i - 1]) / 10)}
            />
          ))}
          <RecapIcons frame={frame} />
          <PoissonArrow frame={frame} />
        </Stage>
      ) : null}

      {/* line 1 · Poisson */}
      <Label x={TEXT_X} y={ROW[0] - 24} anchor="left" size={32} {...rowText(T.poisson + 4)}>
        <b>Poisson process:</b> independent arrivals at rate <span style={{ fontFamily: FONT.math, fontStyle: "italic", fontSize: 36 }}>λ</span>
      </Label>
      <Label x={TEXT_X} y={POCKET_AT.y} anchor="left" size={28} color={COLORS.muted} {...rowText(T.formula - 30)}>
        P(none in <span style={{ fontFamily: FONT.math, fontStyle: "italic", fontSize: 32 }}>t</span>) =
      </Label>

      {/* line 2 · Aloha */}
      <Label x={TEXT_X} y={ROW[1] - 18} anchor="left" size={32} {...rowText(T.aloha + 4)}>
        <b>Aloha:</b> send anytime
      </Label>
      <Label x={TEXT_X} y={ROW[1] + lineB - 4} anchor="left" size={28} color={COLORS.muted} {...rowText(T.collide)}>
        no ACK → <span style={{ color: COLORS.retry }}>random wait</span> → resend
      </Label>

      {/* line 3 · pure */}
      <Label x={TEXT_X} y={ROW[2] - 18} anchor="left" size={32} color={COLORS.event} {...rowText(T.pure + 4)}>
        <b>Pure:</b> <Formula tex="S = G·e^{−2G}" size={38} color={COLORS.event} />
      </Label>
      <Label x={TEXT_X} y={ROW[2] + lineB - 2} anchor="left" size={28} color={COLORS.muted} {...rowText(T.pure + 18)}>
        max <Formula tex="1/(2e) ≈ 18.4% at G = ½" size={30} color={COLORS.ink} />
      </Label>

      {/* line 4 · slotted */}
      <Label x={TEXT_X} y={ROW[3] - 18} anchor="left" size={32} color={COLORS.slotted} {...rowText(T.slotted + 4)}>
        <b>Slotted:</b> <Formula tex="S = G·e^{−G}" size={38} color={COLORS.slotted} />
      </Label>
      <Label x={TEXT_X} y={ROW[3] + lineB - 2} anchor="left" size={28} color={COLORS.muted} {...rowText(T.slotted + 18)}>
        max <Formula tex="1/e ≈ " size={30} color={COLORS.ink} />
        <Formula tex="36.8%" size={30} color={COLORS.bus} />
        <Formula tex=" at G = 1" size={30} color={COLORS.ink} />
      </Label>

      {/* the formula pocket from Scene 04 docks into line 1 */}
      {cardOp > 0 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `scale(${pocketScale})`,
            transformOrigin: `${POCKET_AT.x}px ${POCKET_AT.y}px`,
            opacity: fade(frame, T.recap, 12) * (1 - toStreet),
          }}
        >
          <FormulaPocket dock={1 - dockOut} center={POCKET_AT} glow={Math.sin(dockOut * Math.PI)} />
        </div>
      ) : null}

      {/* the bus finally arrives */}
      {toStreet > 0 ? (
        <Stage opacity={toStreet}>
          <BusArrives frame={frame} dim={0.45 * prog(frame, GAG.gone - 40, 20)} />
        </Stage>
      ) : null}
      <Title x={640} y={190} size={64} start={GAG.gone - 34} style={{ textShadow: `0 4px 18px ${COLORS.bg}` }}>
        Nobody's in Charge
      </Title>
      <Label x={640} y={252} size={28} italic color={COLORS.muted} start={GAG.gone - 22} style={{ textShadow: `0 2px 10px ${COLORS.bg}` }}>
        Aloha and the Poisson process
      </Label>

      {/* fade to black */}
      <div style={{ position: "absolute", inset: 0, background: "#000", opacity: prog(frame, SCENE_END - 18, 16) }} />
    </SceneFrame>
  );
};
