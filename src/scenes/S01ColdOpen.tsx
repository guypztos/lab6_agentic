// Scene 01 — Cold open
// Brief: scenes/s01-cold-open.md  ·  Shared brief: scenes/README.md  ·  Kit: src/shared/README.md
//
// The bus-stop street sits in a card at the top; three ticker timelines (📱 🚌 💧) run underneath.
// Phone buzz, bus arrival and raindrop each launch a blue dot that falls onto its own line. Then time
// speeds up and dots keep arriving with true exponential gaps. On "yet they all follow one pattern" the
// street dims and slides away and the three timelines rise into a centred stack.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  Bus,
  BusStopStreet,
  COLORS,
  Commuter,
  EASE_IN,
  FONT,
  STREET,
  SceneFrame,
  Stage,
  clamp01,
  cue,
  lerp,
  narrationEndFrame,
  poissonArrivals,
  prog,
  sceneDurationInFrames,
  useSvgId,
} from "../shared";

/** Extra seconds of picture after the narration tail. The scene length updates automatically. */
export const meta = { extraTail: 0.8 };

const ID = "s01" as const;

// ── geometry ──────────────────────────────────────────────────────────────────────────────────
/** Street card on screen (the real-life layer). */
const CARD = { x: 176, y: 16, w: 928, h: 522, r: 18 };
/** Street → screen scale at zero push-in (the whole street fits the card). */
const K0 = CARD.w / 1280;
/** Focus of the push-in, in street coordinates (the shelter), and where it sits on screen. */
const FOCUS = { x: 900, y: 480 };
const FOCUS_SCREEN = { x: CARD.x + K0 * FOCUS.x, y: CARD.y + K0 * FOCUS.y };

/** Timeline lanes: x range shared with Scene 02's opening timeline. */
const X0 = 140;
const X1 = 1180;
const LANE_Y_STREET = [592, 640, 688];
const LANE_Y_STACK = [270, 360, 450];
const ICONS = ["📱", "🚌", "💧"];

/** Pixels per second of "story time" on the tickers. */
const PX = 70;
/** Peak time-lapse speed once "You can't predict the next one" starts. */
const SPEED_MAX = 6;
/** Events per story-second per lane during the time-lapse. */
const RATE = 0.8;

// ── narration cues (scene frames) ────────────────────────────────────────────────────────────
const F_PHONE = cue(ID, "buzzes");
const F_BUS = cue(ID, "pulls up", "end");
const F_RAIN = cue(ID, "hits the window");
const F_RANDOM = cue(ID, "You cant predict the next one");
const F_PATTERN = cue(ID, "yet they all follow one pattern");
const F_END = narrationEndFrame(ID);

/** Ticker speed (story-seconds per real second) at scene frame f. */
function speed(f: number): number {
  const up = prog(f, F_RANDOM, 22);
  const down = prog(f, F_END - 30, 30);
  return lerp(1, SPEED_MAX, up) * (1 - down);
}

/** Story time τ(f): integral of the ticker speed. Precomputed per frame (pure function of the frame). */
const TAU: number[] = (() => {
  const out = [0];
  for (let f = 1; f < 600; f++) out.push(out[f - 1] + speed(f) / 30);
  return out;
})();
const tau = (f: number) => TAU[Math.max(0, Math.min(TAU.length - 1, Math.round(f)))];

/** Where "now" sits on the tickers: mid-right while the street is up, gliding to the right end for the time-lapse. */
const xNow = (f: number) => lerp(900, X1 - 10, prog(f, F_RANDOM, 36));

// ── the three keyed events: object position on the street, emission frame ───────────────────
const FLIGHT = 24; // frames from emission to landing on the lane
const KEYED = [
  { lane: 0, frame: F_PHONE, at: { x: 974, y: 536 } }, // the Commuter's phone
  { lane: 1, frame: F_BUS, at: { x: STREET.busStopX, y: STREET.busY - 100 } }, // the stopped bus
  { lane: 2, frame: F_RAIN, at: { x: STREET.glassDrop.x, y: STREET.glassDrop.y } }, // drop on the glass
];

/** Every dot on every lane, in story time. Keyed dots land at τ(emission + FLIGHT); then Poisson. */
const LANE_TIMES: number[][] = [0, 1, 2].map((lane) => {
  const k = KEYED[lane];
  const keyed = tau(k.frame + FLIGHT);
  const randomStart = tau(F_RANDOM) + 0.15 * lane;
  return [keyed, ...poissonArrivals(RATE, randomStart, tau(600), `s01-lane-${lane}`)];
});

/** x of every visible dot on `lane` at scene frame f (after landing). */
function laneDotXs(lane: number, f: number): number[] {
  const t = tau(f);
  const now = xNow(f);
  return LANE_TIMES[lane].filter((te) => te <= t).map((te) => now - (t - te) * PX).filter((x) => x >= X0 - 4);
}

/**
 * Handoff to Scene 02: the 🚌 lane exactly as it sits on the last frame of this scene
 * (y on screen, x range of the line, and the dot x positions). Scene 02 opens on it.
 */
export const S01_HANDOFF = {
  y: LANE_Y_STACK[1],
  x0: X0,
  x1: X1,
  dotsX: laneDotXs(1, sceneDurationInFrames(ID, meta.extraTail) - 1),
};

export const S01ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const clipId = useSvgId("s01card");

  // camera on the street: slow push-in, then dim + slide up out of frame
  const push = 1 + 0.1 * prog(frame, 0, F_PATTERN, (t) => t);
  const slide = prog(frame, F_PATTERN, 34);
  const K = K0 * push;
  const cardDy = -(CARD.y + CARD.h + 40) * slide;
  const toScreen = (p: { x: number; y: number }) => ({
    x: FOCUS_SCREEN.x + K * (p.x - FOCUS.x),
    y: FOCUS_SCREEN.y + K * (p.y - FOCUS.y) + cardDy,
  });

  // lanes rise into a centred stack
  const stack = prog(frame, F_PATTERN + 6, 34);
  const laneY = (i: number) => lerp(LANE_Y_STREET[i], LANE_Y_STACK[i], stack);
  const laneIn = prog(frame, 14, 20);

  // the street's events
  const buzz = frame >= F_PHONE - 2 && frame < F_PHONE + 22 ? 1 : 0;
  const phoneGlow = 0.35 + 0.65 * prog(frame, F_PHONE - 2, 6) * (1 - prog(frame, F_PHONE + 40, 30));
  const busIn = prog(frame, F_BUS - 42, 42, (t) => 1 - (1 - t) * (1 - t) * (1 - t));
  const busOut = prog(frame, F_BUS + 34, 46, EASE_IN);
  const busX = lerp(lerp(STREET.busEnterX, STREET.busStopX, busIn), STREET.busExitX, busOut);
  const door = prog(frame, F_BUS + 2, 8) * (1 - prog(frame, F_BUS + 22, 8));
  const glassDrop = frame < F_RAIN - 9 ? 0 : clamp01((frame - (F_RAIN - 9)) / 60);

  const now = xNow(frame);
  const t = tau(frame);
  const blackIn = 1 - prog(frame, 0, 22);

  return (
    <SceneFrame id={ID}>
      {/* ── real-life layer: the street card ── */}
      <Stage>
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <rect x={CARD.x} y={CARD.y + cardDy} width={CARD.w} height={CARD.h} rx={CARD.r} />
          </clipPath>
        </defs>
        <rect x={CARD.x} y={CARD.y + cardDy} width={CARD.w} height={CARD.h} rx={CARD.r} fill={COLORS.panel} />
        <g clipPath={`url(#${clipId})`}>
          <g transform={`translate(${FOCUS_SCREEN.x} ${FOCUS_SCREEN.y + cardDy}) scale(${K}) translate(${-FOCUS.x} ${-FOCUS.y})`}>
            <BusStopStreet
              rain={0.4}
              glassDrop={glassDrop}
              dim={0.55 * slide}
              road={busIn > 0 && busOut < 1 ? <Bus x={busX} y={STREET.busY} wheelRotation={busX * 1.4} doorOpen={door} /> : null}
            >
              <Commuter x={STREET.commuter.x} y={STREET.commuter.y} pose="phone" buzz={buzz} phoneGlow={phoneGlow} />
            </BusStopStreet>
          </g>
        </g>
        <rect
          x={CARD.x}
          y={CARD.y + cardDy}
          width={CARD.w}
          height={CARD.h}
          rx={CARD.r}
          fill="none"
          stroke={COLORS.faint}
          strokeWidth={2}
        />

        {/* emission pulses at the objects */}
        {KEYED.map((k) => {
          const age = frame - k.frame;
          if (age < 0 || age > 18) return null;
          const p = toScreen(k.at);
          const u = age / 18;
          return (
            <circle key={`pulse-${k.lane}`} cx={p.x} cy={p.y} r={10 + 34 * u} fill="none" stroke={COLORS.event} strokeWidth={3} opacity={1 - u} />
          );
        })}
      </Stage>

      {/* ── theory layer: the three ticker timelines ── */}
      <Stage>
        {[0, 1, 2].map((i) => {
          const y = laneY(i);
          return (
            <g key={`lane-${i}`} opacity={laneIn}>
              <line x1={X0} y1={y} x2={X1} y2={y} stroke={COLORS.muted} strokeWidth={2.5} strokeLinecap="round" />
              <path d={`M ${X1 + 2} ${y} l -12 -7 v 14 z`} fill={COLORS.muted} />
              <text x={X0 - 34} y={y + 9} fontSize={26} textAnchor="middle" fontFamily={FONT.sans}>
                {ICONS[i]}
              </text>
              {/* "now" head: quiet tick while the ticker runs */}
              <line x1={now} y1={y - 12} x2={now} y2={y + 12} stroke={COLORS.faint} strokeWidth={2} opacity={1 - stack} />
            </g>
          );
        })}

        {/* dots already on the lanes */}
        {LANE_TIMES.map((times, i) =>
          times.map((te, j) => {
            if (te > t) return null;
            const x = now - (t - te) * PX;
            if (x < X0 - 4) return null;
            const fresh = clamp01((now - x) / 26); // pop-in right at the "now" head
            const over = fresh < 1 ? 1 + 0.35 * Math.sin(fresh * Math.PI) : 1;
            const keyed = j === 0;
            // keyed dots appear by landing from their flight, so skip the pop for them
            const r = 8 * (keyed ? 1 : Math.min(1, fresh * 2) * over);
            const dy = keyed ? 0 : -16 * (1 - fresh);
            return <circle key={`d-${i}-${j}`} cx={x} cy={laneY(i) + dy} r={r} fill={COLORS.event} />;
          }),
        )}

        {/* keyed dots in flight: from the object down onto its lane */}
        {KEYED.map((k) => {
          const age = frame - k.frame;
          if (age < 0 || age >= FLIGHT) return null;
          const from = toScreen(k.at);
          const to = { x: now, y: laneY(k.lane) };
          const popIn = clamp01(age / 6);
          const fall = clamp01((age - 8) / (FLIGHT - 8));
          const x = lerp(from.x, to.x, fall);
          const y = lerp(from.y, to.y, EASE_IN(fall));
          const r = lerp(11, 8, fall) * (popIn < 1 ? popIn * (1 + 0.3 * Math.sin(popIn * Math.PI)) : 1);
          return (
            <g key={`fly-${k.lane}`}>
              <circle cx={x} cy={y} r={r + 5} fill={COLORS.event} opacity={0.25} />
              <circle cx={x} cy={y} r={r} fill={COLORS.event} />
            </g>
          );
        })}
      </Stage>

      {/* open from black */}
      {blackIn > 0 ? <AbsoluteFill style={{ backgroundColor: "#000", opacity: blackIn }} /> : null}
    </SceneFrame>
  );
};
