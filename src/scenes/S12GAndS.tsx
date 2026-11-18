// Scene 12 — Two numbers: G and S
// Brief: scenes/s12-g-and-s.md  ·  Shared brief: scenes/README.md  ·  Kit: src/shared/README.md
//
// Layout: the merged channel timeline from Scene 11 sits in the middle (10 frame times, 8 attempts, two of them
// amber retries). Two definition cards (G left, S right) live above it; the capacity meter and the equation build
// below it. The real-life layer (rooftop cell tower + stadium scoreboard, phones puffing below) dissolves in for
// sentences 2–4, and its two numbers fly down into the cards' value slots on the way back.
//
// Every packet on the timeline is also a puff in the real-life layer: same order, same collisions (classifyPackets).
import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import {
  Bracket,
  COLORS,
  CellTower,
  FONT,
  Formula,
  ILLUS,
  Label,
  PacketBar,
  Person,
  SceneFrame,
  Stage,
  Timeline,
  Card,
  classifyPackets,
  clamp01,
  crowdLook,
  cue,
  EASE_OUT,
  fade,
  lerp,
  poissonArrivals,
  pop,
  prog,
  rand,
  remap,
  SIZE,
  sparseSources,
  timeScale,
  type PacketState,
} from "../shared";

/** Extra seconds of picture after the narration tail. The scene length updates automatically. */
export const meta = { extraTail: 1.5 };

// ── narration cues ────────────────────────────────────────────────────────────
const C = {
  rateG: cue("s12", "rate G"),
  average: cue("s12", "the average number of attempts"),
  perFrame: cue("s12", "attempts per frame time"),
  offered: cue("s12", "is the offered load"),
  pushing: cue("s12", "It's how hard everyone"),
  care: cue("s12", "What we actually care about"),
  throughput: cue("s12", "S, the throughput"),
  howMany: cue("s12", "That's how many packets"),
  getThrough: cue("s12", "actually get through"),
  carry: cue("s12", "The channel can carry"),
  atMost: cue("s12", "at most one packet per frame time"),
  fraction: cue("s12", "so S is also the fraction"),
  useful: cue("s12", "doing useful work"),
  simply: cue("s12", "And S is simply"),
  timesG: cue("s12", "G, times the chance"),
  chance: cue("s12", "the chance that an attempt succeeds"),
  succeeds: cue("s12", "an attempt succeeds", "end"),
};

// ── the channel: 8 attempts in 10 frame times (G = 0.8), 3 clean (S = 0.3) ─────
const SPAN = 10;
const STARTS = poissonArrivals(0.8, 0, SPAN, "s12-ch-2635"); // seed chosen: 8 attempts, 3 successes, ≤ 2 lanes
const RETRY = new Set([2]); // amber: a retransmission counts as an attempt too (one, like Scene 11)
const PACKETS = classifyPackets(STARTS.map((start, i) => ({ start, source: i })), 1, "pure").map((p, i) => ({
  ...p,
  i,
  kind: (RETRY.has(i) ? "retry" : "attempt") as PacketState,
}));
// lanes: stack overlapping bars so every one stays visible
const LANES: number[] = (() => {
  const ends: number[] = [];
  return PACKETS.map((p) => {
    let l = ends.findIndex((e) => e <= p.start);
    if (l < 0) {
      l = ends.length;
      ends.push(0);
    }
    ends[l] = p.start + 1;
    return l;
  });
})();
const OK = PACKETS.filter((p) => p.ok);
const okRank = (i: number) => OK.findIndex((p) => p.i === i);

// ── Scene 11's closing frame, recomputed here (same seeds and constants as S11TheModel.tsx) ──────
// It ends on: timeScale(0, 12, 200, 1180), axis at y=380, 9 bars (34 px) resting on the axis, one amber retry,
// overlapping bars outlined in bg. Scene 12 opens on exactly that, then morphs it into its own channel.
const S11 = (() => {
  const SPAN11 = 12;
  const COMMUTER_ROW = 6;
  const raw = sparseSources(8, 0.085, 0.2, SPAN11 - 1.1, "s11-phones");
  const rows = raw.map((times, i) => {
    let src = times;
    if (i === COMMUTER_ROW) src = [0.6, ...times.filter((t) => t > 2)];
    if (src.length === 0) src = [rand(`s11-fill-${i}`, 1, SPAN11 - 2)];
    const out: number[] = [];
    for (const t of src) if (!out.length || t - out[out.length - 1] >= 1.4) out.push(t);
    return out;
  });
  const attempts = rows.flatMap((times, row) =>
    times.map((t, j) => ({ t, retry: row !== COMMUTER_ROW || j > 0 ? random(`s11-retry-${row}-${j}`) < 0.3 : false })),
  );
  const overlaps = new Set(attempts.flatMap((a, i) => (attempts.some((b, j) => j !== i && Math.abs(a.t - b.t) < 1) ? [i] : [])));
  // pair old bars with new ones in time order, dropping the one old bar that makes the moves shortest
  const order = attempts.map((_, i) => i).sort((a, b) => attempts[a].t - attempts[b].t);
  let best = { drop: -1, cost: Infinity };
  for (let d = 0; d < order.length; d++) {
    const kept = order.filter((_, k) => k !== d);
    if (kept.length !== PACKETS.length) continue;
    const cost = kept.reduce(
      (c, oi, j) => c + Math.abs(attempts[oi].t - PACKETS[j].start) + (attempts[oi].retry !== (PACKETS[j].kind === "retry") ? 100 : 0),
      0,
    );
    if (cost < best.cost) best = { drop: d, cost };
  }
  const target = new Map<number, number>();
  order.filter((_, k) => k !== best.drop).forEach((oi, j) => target.set(oi, j));
  return {
    sc: timeScale(0, SPAN11, 200, 1180),
    axisY: 380,
    barH: 34,
    attempts: attempts.map((a, i) => ({ ...a, edge: overlaps.has(i), to: target.get(i) ?? -1 })),
  };
})();

// ── diagram geometry ──────────────────────────────────────────────────────────
const SC = timeScale(-0.3, 10.6, 120, 1210); // 100 px per frame time; t=0 → x=150, t=10 → x=1150
const AXIS_Y = 400;
const laneY = (l: number) => 362 - l * 44;
const BAR_H = 36;
const BRACKET_Y = 252;
const TALLY_Y = 488;
const METER_Y = 530;
const CARD_Y = 120;
const G_CARD = { x: 330, slot: 530 };
const S_CARD = { x: 950, slot: 1150 };
const EQ_Y = 657;

// ── key frames ────────────────────────────────────────────────────────────────
const MORPH = { start: 4, dur: 32 }; // Scene 11's timeline → this scene's channel, done as the G card arrives
/** The axis mapping part-way through the morph (affine, so old and new bars stay exactly 1 frame time wide). */
const morphScale = (m: number, t0: number, t1: number) =>
  m >= 1 && t0 === SC.t0 && t1 === SC.t1
    ? SC
    : timeScale(t0, t1, lerp(S11.sc(t0), SC(t0), m), lerp(S11.sc(t1), SC(t1), m));
const SWEEP1 = { start: C.average, dur: 54 };
const tally1 = SWEEP1.start + SWEEP1.dur + 2;
const G_VALUE_FLY = { start: C.offered - 4, dur: 18 }; // tally "0.8" → G card slot
const TO_STREET = { start: C.pushing - 12, dur: 24 };
const FT = 8; // video frames per frame time in the real-life layer
const LAUNCH0 = TO_STREET.start + 18;
const FLIGHT = 20;
const BACK = { start: C.howMany - 8, dur: 24 };
const NUM_FLY = { start: BACK.start + 4, dur: 30 };
const SWEEP2 = { start: Math.max(NUM_FLY.start + NUM_FLY.dur + 4, C.getThrough - 30), dur: 48 };
const tally2 = SWEEP2.start + SWEEP2.dur + 2;
const DROP = { start: C.fraction + 6, each: 14, dur: 22 };
/** Handoff to Scene 13: everything but the equation fades, then P(success) + ? become its "P(success) = ?". */
const HAND = { fade: C.succeeds + 4, move: C.succeeds + 14, dur: 30 };
const EQ_RX = 855; // right edge of the P(success) box inside the equation card

const sweepT = (frame: number, s: { start: number; dur: number }) =>
  lerp(-0.25, SPAN + 0.35, clamp01((frame - s.start) / s.dur)); // linear: time flowing along the timeline
const passFrame = (t: number, s: { start: number; dur: number }) => s.start + ((t + 0.25) / (SPAN + 0.6)) * s.dur;

// ── real-life geometry ────────────────────────────────────────────────────────
const TOWER = { x: 400, y: 300, scale: 1.3 };
const RX = { x: 400, y: 112 }; // where puffs are received (antenna)
const BOARD = { x: 190, y: 326, w: 420, h: 228 };
const ROW_TRIES = 383;
const ROW_DELIV = 493;
const DIGIT_X = 532; // centre of the scoreboard digits
const PEOPLE = [770, 875, 980, 1085, 1190].map((x, k) => ({ x, y: 706, k }));
const PERSON_S = 0.72;
const phoneAt = (k: number) => ({ x: PEOPLE[k].x - 40 * PERSON_S, y: PEOPLE[k].y - 142 * PERSON_S });
const SOURCE = [1, 3, 0, 4, 2, 1, 3, 0]; // which person sends packet i

const launchF = (i: number) => LAUNCH0 + PACKETS[i].start * FT;
const arriveF = (i: number) => launchF(i) + FLIGHT;
const resolveF = (i: number) => arriveF(i) + FT; // a packet takes one frame time to receive
const INBOX = (r: number) => ({ x: 480 + r * 48, y: 198 });
const deliverF = (r: number) => Math.max(resolveF(OK[r].i) + 6, C.care + 10 + r * 18);
const DELIVER_DUR = 16;

const fmt = (n: number) => (Math.round(n * 10) / 10).toFixed(1);

export const S12GAndS: React.FC = () => {
  const frame = useCurrentFrame();
  const toStreet = prog(frame, TO_STREET.start, TO_STREET.dur);
  const back = prog(frame, BACK.start, BACK.dur);
  const streetA = toStreet * (1 - back);
  const diagramA = frame < BACK.start ? 1 - toStreet : back;
  const diagramScale = frame < BACK.start ? lerp(1, 0.96, toStreet) : lerp(0.96, 1, back);
  const streetScale = frame < BACK.start ? lerp(1.05, 1, toStreet) : lerp(1, 1.03, back);

  // scoreboard values
  const launched = PACKETS.filter((_, i) => frame >= launchF(i)).length;
  const delivered = OK.filter((_, r) => frame >= deliverF(r) + DELIVER_DUR).length;
  const delivRowOn = prog(frame, C.care - 4, 14);

  // the two flying numbers (scoreboard → cards)
  const fly = prog(frame, NUM_FLY.start, NUM_FLY.dur);
  const flying = frame >= NUM_FLY.start && fly < 1;
  const landed = frame >= NUM_FLY.start + NUM_FLY.dur;

  return (
    <SceneFrame id="s12">
      {/* ─────────────── theory layer: the channel timeline ─────────────── */}
      <AbsoluteFill style={{ opacity: diagramA * (1 - prog(frame, HAND.fade, 16)), transform: `scale(${diagramScale})` }}>
        <DiagramSvg frame={frame} />
        <DiagramText frame={frame} landed={landed} />
      </AbsoluteFill>
      {/* the equation, and the handoff into Scene 13's opening */}
      <Equation frame={frame} />

      {/* ─────────────── real-life layer: tower + scoreboard ─────────────── */}
      {streetA > 0.001 ? (
        <AbsoluteFill style={{ opacity: streetA, transform: `scale(${streetScale})` }}>
          <Street frame={frame} />
          <Scoreboard
            frame={frame}
            tries={launched / 10}
            delivered={delivered / 10}
            delivOn={delivRowOn}
            hideDigits={frame >= NUM_FLY.start}
          />
        </AbsoluteFill>
      ) : null}

      {/* ─────────────── bridge: the numbers fly down into G and S ─────────────── */}
      {flying ? (
        <>
          <FlyingNumber
            p={fly}
            from={{ x: DIGIT_X, y: ROW_TRIES }}
            to={{ x: G_CARD.slot, y: CARD_Y }}
            text="0.8"
            color={COLORS.event}
          />
          <FlyingNumber
            p={prog(frame, NUM_FLY.start + 6, NUM_FLY.dur - 6)}
            from={{ x: DIGIT_X, y: ROW_DELIV }}
            to={{ x: S_CARD.slot, y: CARD_Y }}
            text="0.3"
            color={COLORS.success}
          />
        </>
      ) : null}
    </SceneFrame>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Theory layer
// ═══════════════════════════════════════════════════════════════════════════════

const DiagramSvg: React.FC<{ frame: number }> = ({ frame }) => {
  const t1 = sweepT(frame, SWEEP1);
  const t2 = sweepT(frame, SWEEP2);
  const cursor1 = fade(frame, SWEEP1.start - 6, 6, SWEEP1.start + SWEEP1.dur, 8);
  const cursor2 = fade(frame, SWEEP2.start - 6, 6, SWEEP2.start + SWEEP2.dur, 8);
  const tags1 = 1 - prog(frame, TO_STREET.start - 6, 10); // attempt tallies (gone by the street)
  const dimRed = prog(frame, C.fraction - 6, 16);

  // meter
  const ghostP = prog(frame, C.carry, 30);
  const ceiling = prog(frame, C.atMost + 4, 18);

  // opening morph: Scene 11's axis (0–12, y=380) → ours (0–10, y=400); its 9 bars slide into our 8
  const m = prog(frame, MORPH.start, MORPH.dur);
  const scNew = morphScale(m, SC.t0, SC.t1);
  const axisY = lerp(S11.axisY, AXIS_Y, m);

  return (
    <Stage>
      {m < 1 ? (
        // Scene 11 also draws StreamMerge's merged line under its axis; repeat it so frame 0 matches exactly
        <line
          x1={morphScale(m, 0, 12).x0}
          x2={morphScale(m, 0, 12).x1}
          y1={axisY}
          y2={axisY}
          stroke={COLORS.muted}
          strokeWidth={3}
          strokeLinecap="round"
          opacity={1 - m}
        />
      ) : null}
      {m < 1 ? (
        <Timeline
          scale={morphScale(m, S11.sc.t0, S11.sc.t1)}
          y={axisY}
          tickEvery={1}
          tickLabel={(t) => (t % 2 === 0 ? `${t}` : null)}
          opacity={1 - m}
        />
      ) : null}
      {m > 0 ? (
        <Timeline
          scale={scNew}
          y={axisY}
          tickEvery={1}
          tickLabel={(t) => (t <= SPAN ? `${t}` : null)}
          label={m >= 1 ? "frame times →" : undefined}
          opacity={m}
        />
      ) : null}
      {m < 1 ? (
        // one axis label that slides with the axis end (same style as Timeline's own label)
        <text
          x={lerp(S11.sc.x1, SC.x1, m)}
          y={axisY + 62}
          fill={COLORS.muted}
          fontFamily={FONT.sans}
          fontSize={SIZE.small}
          textAnchor="end"
        >
          frame times →
        </text>
      ) : null}
      {m < 1
        ? S11.attempts.map((a, k) => {
            const y0 = S11.axisY - 18; // Scene 11 lifts each merged bar by 18 px
            const state: PacketState = a.retry ? "retry" : "attempt";
            if (a.to < 0) {
              // the one bar with no partner just fades away where it is
              return (
                <PacketBar
                  key={k}
                  scale={scNew}
                  start={a.t}
                  y={y0}
                  h={S11.barH}
                  state={state}
                  edge={a.edge ? COLORS.bg : undefined}
                  opacity={1 - clamp01(m * 2.5)}
                />
              );
            }
            const p = PACKETS[a.to];
            const t = lerp(a.t, p.start, m);
            const y = lerp(y0, laneY(LANES[a.to]), m);
            const h = lerp(S11.barH, BAR_H, m);
            return (
              <g key={k}>
                <PacketBar scale={scNew} start={t} y={y} h={h} state={state} toState={p.kind} mix={m} />
                {a.edge ? (
                  <rect x={scNew(t)} y={y - h / 2} width={scNew.px} height={h} rx={10} fill="none" stroke={COLORS.bg} strokeWidth={4} opacity={1 - m} />
                ) : null}
              </g>
            );
          })
        : null}
      <Bracket
        opacity={frame >= C.rateG - 1 ? 1 : 0}
        x1={SC(0)}
        x2={SC(SPAN)}
        y={BRACKET_Y}
        label="10 frame times"
        color={COLORS.muted}
        progress={prog(frame, C.rateG - 2, 22)}
      />

      {/* sweep cursors (time flowing: linear) */}
      {cursor1 > 0 ? <Cursor x={SC(t1)} opacity={cursor1} /> : null}
      {cursor2 > 0 ? <Cursor x={SC(t2)} opacity={cursor2} /> : null}

      {/* the packets */}
      {m >= 1 && PACKETS.map((p, i) => {
        const y = laneY(LANES[i]);
        const pass1 = passFrame(p.start, SWEEP1);
        const pulse1 = frame >= pass1 ? Math.exp(-(frame - pass1) / 6) * (frame < pass1 + 30 ? 1 : 0) : 0;
        const pass2 = passFrame(p.start, SWEEP2);
        const mix = prog(frame, pass2, 10);
        const to: PacketState = p.ok ? "success" : "collision";
        const pulse2 = p.ok && frame >= pass2 ? Math.exp(-(frame - pass2) / 7) * (frame < pass2 + 30 ? 1 : 0) : 0;
        const pulse = pulse1 + pulse2;
        return (
          <g key={i} opacity={p.ok ? 1 : lerp(1, 0.4, dimRed)}>
            <PacketBar scale={SC} start={p.start} y={y} h={BAR_H} state={p.kind} toState={to} mix={mix} />
            {pulse > 0.02 ? (
              <rect
                x={SC(p.start) - 3}
                y={y - BAR_H / 2 - 3}
                width={SC.px + 6}
                height={BAR_H + 6}
                rx={12}
                fill="none"
                stroke={COLORS.ink}
                strokeWidth={3}
                opacity={pulse}
              />
            ) : null}
            {/* attempt tally tag (beat 1) */}
            {frame >= pass1 && tags1 > 0 ? (
              <Tag x={SC(p.start + 0.5)} y={y - BAR_H / 2 - 16} n={i + 1} color={COLORS.ink} k={prog(frame, pass1, 8, EASE_OUT) * tags1} />
            ) : null}
            {/* success tally tag (beat 4) */}
            {p.ok && frame >= pass2 ? (
              <Tag x={SC(p.start + 0.5)} y={y - BAR_H / 2 - 16} n={okRank(i) + 1} color={COLORS.success} k={prog(frame, pass2, 8, EASE_OUT)} />
            ) : null}
          </g>
        );
      })}

      {/* capacity meter: 10 frame-time cells; full = one packet every frame time */}
      {ghostP > 0 ? (
        <g>
          {Array.from({ length: SPAN }, (_, k) => {
            const a = clamp01(ghostP * SPAN - k);
            return a > 0 ? <PacketBar key={k} scale={SC} start={k} y={METER_Y} h={BAR_H} state="ghost" opacity={a} /> : null;
          })}
        </g>
      ) : null}
      {ceiling > 0 ? (
        <g opacity={ceiling}>
          <line
            x1={SC(SPAN)}
            x2={SC(SPAN)}
            y1={lerp(METER_Y, METER_Y - 30, ceiling)}
            y2={lerp(METER_Y, METER_Y + 30, ceiling)}
            stroke={COLORS.ink}
            strokeWidth={4}
            strokeDasharray="8 6"
          />
        </g>
      ) : null}

      {/* green copies drop into the meter, packed back to back */}
      {OK.map((p, r) => {
        const s = DROP.start + r * DROP.each;
        const k = prog(frame, s, DROP.dur);
        if (frame < s) return null;
        return (
          <PacketBar
            key={`drop-${r}`}
            scale={SC}
            start={lerp(p.start, r, k)}
            y={lerp(laneY(LANES[p.i]), METER_Y, k)}
            h={BAR_H}
            state="success"
            opacity={clamp01(k * 4)}
          />
        );
      })}
    </Stage>
  );
};

const Cursor: React.FC<{ x: number; opacity: number }> = ({ x, opacity }) => (
  <g opacity={opacity}>
    <line x1={x} x2={x} y1={278} y2={AXIS_Y + 10} stroke={COLORS.ink} strokeWidth={2.5} strokeOpacity={0.75} />
    <circle cx={x} cy={AXIS_Y} r={6} fill={COLORS.ink} />
  </g>
);

const Tag: React.FC<{ x: number; y: number; n: number; color: string; k: number }> = ({ x, y, n, color, k }) =>
  k > 0.01 ? (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={clamp01(k * 1.5)}>
      <circle r={14} fill={COLORS.bg} stroke={color} strokeWidth={2.5} />
      <text y={6.5} fill={color} fontFamily={FONT.sans} fontWeight={700} fontSize={18} textAnchor="middle">
        {n}
      </text>
    </g>
  ) : null;

const DiagramText: React.FC<{ frame: number; landed: boolean }> = ({ frame, landed }) => {
  // tally 1: "8 attempts ÷ 10 frame times = 0.8"
  const passed1 = PACKETS.filter((p) => frame >= passFrame(p.start, SWEEP1)).length;
  const tally1A = fade(frame, SWEEP1.start, 8, TO_STREET.start - 8, 10);
  const tail1 = prog(frame, tally1, 10);
  const gFly = prog(frame, G_VALUE_FLY.start, G_VALUE_FLY.dur);
  const gValueInSlot = frame < BACK.start ? gFly >= 1 : landed;

  // tally 2: "3 successes ÷ 10 frame times = 0.3"
  const passed2 = OK.filter((p) => frame >= passFrame(p.start, SWEEP2)).length;
  const tally2A = fade(frame, SWEEP2.start, 8, C.fraction, 12);
  const tail2 = prog(frame, tally2, 10);

  const sLand = landed ? pop(frame, NUM_FLY.start + NUM_FLY.dur) : 0;
  const gLand = landed ? pop(frame, NUM_FLY.start + NUM_FLY.dur - 6) : 0;
  const sConfirm = Math.exp(-Math.max(0, frame - tally2) / 10) * (frame >= tally2 ? 1 : 0);

  return (
    <>
      {/* G card */}
      <DefCard
        x={G_CARD.x}
        start={C.rateG}
        letter="G"
        color={COLORS.event}
        line1="= offered load"
        line1A={prog(frame, C.offered + 6, 12)}
        line2="(attempts per frame time)"
        line2A={prog(frame, C.perFrame, 12)}
      />
      {gValueInSlot ? (
        <SlotValue x={G_CARD.slot} text="0.8" color={COLORS.event} bump={frame < BACK.start ? pop(frame, G_VALUE_FLY.start + G_VALUE_FLY.dur) : gLand} />
      ) : null}

      {/* S card: appears with the bridge back from the scoreboard */}
      {frame >= BACK.start ? (
        <DefCard
          x={S_CARD.x}
          start={BACK.start + 2}
          letter="S"
          color={COLORS.success}
          line1="= throughput"
          line1A={1}
          line2="(successes per frame time)"
          line2A={1}
        />
      ) : null}
      {landed ? <SlotValue x={S_CARD.slot} text="0.3" color={COLORS.success} bump={sLand} glow={sConfirm} /> : null}

      {/* tallies under the axis */}
      {tally1A > 0 && frame < BACK.start ? (
        <>
          <Label x={705} y={TALLY_Y} anchor="right" size={28} opacity={tally1A}>
            <span style={{ color: COLORS.event, fontWeight: 700 }}>{passed1}</span> attempts
            <span style={{ opacity: tail1 }}> ÷ 10 frame times =</span>
          </Label>
          {/* the value: sits in the tally, then flies up into the G card */}
          {gFly < 1 ? (
            <Label
              x={lerp(742, G_CARD.slot, gFly)}
              y={lerp(TALLY_Y, CARD_Y, gFly)}
              size={lerp(34, 56, gFly)}
              weight={700}
              color={COLORS.event}
              opacity={tail1}
            >
              0.8
            </Label>
          ) : null}
        </>
      ) : null}
      {tally2A > 0 ? (
        <>
          <Label x={705} y={TALLY_Y} anchor="right" size={28} opacity={tally2A}>
            <span style={{ color: COLORS.success, fontWeight: 700 }}>{passed2}</span> successes
            <span style={{ opacity: tail2 }}> ÷ 10 frame times =</span>
          </Label>
          <Label x={742} y={TALLY_Y} size={34} weight={700} color={COLORS.success} opacity={tail2 * tally2A}>
            0.3
          </Label>
        </>
      ) : null}

      {/* meter labels */}
      <Label x={SC(SPAN) + 16} y={METER_Y} anchor="left" size={28} color={COLORS.ink} weight={700} opacity={prog(frame, C.atMost + 10, 12)}>
        1
      </Label>
      <Label x={SC(0) - 14} y={METER_Y} anchor="right" size={28} color={COLORS.ink} weight={700} opacity={prog(frame, C.atMost + 10, 12)}>
        0
      </Label>
      <Label
        x={SC(SPAN) - 14}
        y={METER_Y + 50}
        anchor="right"
        opacity={prog(frame, C.atMost + 22, 14)}
        style={{ lineHeight: 1 }}
      >
        <MathRow parts={[["0 ≤ ", COLORS.ink], ["S", COLORS.success], [" ≤ 1", COLORS.ink]]} size={32} />
      </Label>
      <Label x={SC(0)} y={METER_Y + 46} anchor="left" size={28} opacity={prog(frame, C.useful, 14)}>
        <span style={{ color: COLORS.success, fontWeight: 800, fontSize: 34 }}>
          {Math.round(remap(frame, C.useful, C.useful + 20, 0, 30))}%
        </span>{" "}
        of the channel doing useful work
      </Label>

    </>
  );
};

const DefCard: React.FC<{
  x: number;
  start: number;
  letter: string;
  color: string;
  line1: string;
  line1A: number;
  line2: string;
  line2A: number;
}> = ({ x, start, letter, color, line1, line1A, line2, line2A }) => (
  <Card
    x={x}
    y={CARD_Y}
    start={start}
    padding="0 28px"
    style={{ width: 540, height: 130, boxSizing: "border-box", display: "flex", alignItems: "center" }}
  >
    <Formula tex={letter} size={92} color={color} style={{ display: "inline-block", width: 70, textAlign: "center" }} />
    <div style={{ marginLeft: 18 }}>
      <div style={{ fontSize: 32, fontWeight: 700, opacity: line1A }}>{line1}</div>
      <div style={{ fontSize: 22, color: COLORS.muted, marginTop: 4, opacity: line2A }}>{line2}</div>
    </div>
    <div style={{ position: "absolute", left: 412, top: 22, bottom: 22, width: 2, background: COLORS.faint }} />
  </Card>
);

const SlotValue: React.FC<{ x: number; text: string; color: string; bump: number; glow?: number }> = ({
  x,
  text,
  color,
  bump,
  glow = 0,
}) => (
  <Label
    x={x}
    y={CARD_Y}
    size={56}
    weight={700}
    color={color}
    style={{
      transform: `translate(-50%, -50%) scale(${1 + 0.18 * (1 - clamp01(bump)) + 0.12 * glow})`,
      textShadow: glow > 0.02 ? `0 0 ${18 * glow}px ${color}` : undefined,
      fontVariantNumeric: "tabular-nums",
    }}
  >
    {text}
  </Label>
);

const MathRow: React.FC<{ parts: [string, string][]; size: number }> = ({ parts, size }) => (
  <span>
    {parts.map(([t, c], k) => (
      <Formula key={k} tex={t} size={size} color={c} />
    ))}
  </span>
);

const Equation: React.FC<{ frame: number }> = ({ frame }) => {
  const a = prog(frame, C.simply - 4, 12);
  if (a <= 0) return null;
  const pS = prog(frame, C.simply + 4, 12);
  const pG = prog(frame, C.timesG, 12);
  const pP = prog(frame, C.chance + 4, 14);
  const qStart = C.chance + 20;
  const q = prog(frame, qStart, 10);
  const pulse = frame >= qStart ? 0.5 + 0.5 * Math.sin(((frame - qStart) / 30) * Math.PI * 2 - Math.PI / 2) : 0;

  // handoff to Scene 13: card + "S = G ×" + dashed box fade; P(success) glides/grows into "P(success) =",
  // and the "?" badge loses its disc and travels to where Scene 13's "?" sits.
  const out = prog(frame, HAND.fade, 16);
  const mv = prog(frame, HAND.move, HAND.dur);
  const done = frame >= HAND.move + HAND.dur;
  const badge = q * (1 - prog(frame, HAND.move - 2, 8));
  const qGlyph = prog(frame, HAND.move - 2, 8); // the plain "?" taking over from the badge

  // Scene 13's opening: Label x=712 y=300 anchor right, Formula "P(success) =" 72 px; "?" = SVG text at x=742.
  const size = lerp(50, 72, mv);
  const rx = lerp(EQ_RX, 712, mv);
  const ry = lerp(EQ_Y, 300, mv);
  const qSize = lerp(28, 84, mv);
  const qX = lerp(EQ_RX + 6, 742, mv);
  const qY = lerp(EQ_Y - 30, 300, mv);

  const piece = (p: number): React.CSSProperties => ({
    display: "inline-block",
    opacity: p,
    transform: `translateY(${(1 - p) * 12}px)`,
    marginRight: "0.3em",
  });
  const boxA = q > 0 ? (0.35 + 0.5 * pulse * q) * (1 - out) : 0;

  return (
    <>
      {out < 1 ? (
        <Card
          x={640}
          y={EQ_Y}
          start={C.simply - 4}
          padding={0}
          opacity={1 - out}
          style={{ width: 500, height: 84, boxSizing: "border-box" }}
        >
          {null}
        </Card>
      ) : null}
      {done ? (
        <Label x={712} y={300} anchor="right">
          <Formula tex="P(success) =" size={72} />
        </Label>
      ) : (
        <Label x={rx} y={ry} anchor="right" opacity={a}>
          <span style={{ opacity: 1 - out }}>
            <span style={piece(pS)}>
              <Formula tex="S" size={size} color={COLORS.success} />
              <Formula tex=" =" size={size} />
            </span>
            <span style={piece(pG)}>
              <Formula tex="G" size={size} color={COLORS.event} />
              <Formula tex=" ×" size={size} />
            </span>
          </span>
          <span
            style={{
              ...piece(pP),
              marginRight: 0,
              position: "relative",
              padding: `0 ${12 * (1 - mv)}px`,
              borderRadius: 12,
              border: `${2.5 * (1 - mv)}px dashed rgba(226,232,240,${boxA})`,
            }}
          >
            <Formula tex="P(success)" size={size} />
            {badge > 0 ? (
              <span
                style={{
                  position: "absolute",
                  right: -26,
                  top: -22,
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  background: COLORS.ink,
                  color: COLORS.bg,
                  fontFamily: FONT.sans,
                  fontWeight: 900,
                  fontSize: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: badge,
                  transform: `scale(${q * (1 + 0.22 * pulse)})`,
                  boxShadow: `0 0 ${10 + 14 * pulse}px rgba(226,232,240,${0.5 * pulse})`,
                }}
              >
                ?
              </span>
            ) : null}
          </span>
          {mv > 0 ? (
            <span
              style={{
                display: "inline-block",
                verticalAlign: "top",
                overflow: "hidden",
                whiteSpace: "pre",
                maxWidth: 130 * mv,
                opacity: mv,
              }}
            >
              <Formula tex=" =" size={size} />
            </span>
          ) : null}
        </Label>
      )}
      {qGlyph > 0 ? (
        <Stage>
          <text
            x={qX}
            y={qY + qSize * 0.35}
            fill={COLORS.ink}
            fontFamily={FONT.math}
            fontSize={qSize}
            fontWeight={700}
            textAnchor="middle"
            opacity={qGlyph}
          >
            ?
          </text>
        </Stage>
      ) : null}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Real-life layer
// ═══════════════════════════════════════════════════════════════════════════════

const BACK_WINDOWS = Array.from({ length: 6 }, (_, c) =>
  Array.from({ length: 4 }, (_, r) => ({ c, r, lit: random(`s12-win-${c}-${r}`) > 0.68 })),
).flat();

const Street: React.FC<{ frame: number }> = ({ frame }) => (
  <Stage>
    {/* sky */}
    <rect x={0} y={0} width={1280} height={600} fill={ILLUS.sky} />
    {/* far building behind the people */}
    <rect x={690} y={360} width={600} height={240} fill={ILLUS.building} />
    {BACK_WINDOWS.map(({ c, r, lit }) => (
      <rect
        key={`${c}-${r}`}
        x={720 + c * 92}
        y={384 + r * 46}
        width={30}
        height={24}
        rx={3}
        fill={lit ? ILLUS.windowLit : ILLUS.windowDark}
        opacity={lit ? 0.6 : 1}
      />
    ))}
    {/* the tower's building */}
    <rect x={150} y={TOWER.y} width={500} height={300} fill={ILLUS.buildingHi} />
    <rect x={140} y={TOWER.y - 8} width={520} height={12} rx={4} fill="#3b4a66" />
    <CellTower x={TOWER.x} y={TOWER.y} scale={TOWER.scale} emit={(frame / 45) % 1} ripples={0} />
    {/* ground */}
    <rect x={0} y={600} width={1280} height={120} fill={COLORS.panel} />
    <rect x={0} y={600} width={1280} height={6} fill="#334155" />

    {/* scoreboard frame (digits are HTML, drawn on top) */}
    <g>
      <rect x={BOARD.x + 30} y={TOWER.y + 4} width={12} height={BOARD.y - TOWER.y} fill={ILLUS.metal} />
      <rect x={BOARD.x + BOARD.w - 42} y={TOWER.y + 4} width={12} height={BOARD.y - TOWER.y} fill={ILLUS.metal} />
      <rect x={BOARD.x} y={BOARD.y} width={BOARD.w} height={BOARD.h} rx={14} fill="#0b1220" stroke="#475569" strokeWidth={5} />
      <line x1={BOARD.x + 20} x2={BOARD.x + BOARD.w - 20} y1={BOARD.y + BOARD.h / 2} y2={BOARD.y + BOARD.h / 2} stroke="#334155" strokeWidth={3} />
      {[
        [BOARD.x + 14, BOARD.y + 14],
        [BOARD.x + BOARD.w - 14, BOARD.y + 14],
        [BOARD.x + 14, BOARD.y + BOARD.h - 14],
        [BOARD.x + BOARD.w - 14, BOARD.y + BOARD.h - 14],
      ].map(([bx, by], k) => (
        <circle key={k} cx={bx} cy={by} r={5} fill="#64748b" />
      ))}
    </g>

    {/* people with phones */}
    {PEOPLE.map((p) => {
      const sends = PACKETS.filter((_, i) => SOURCE[i] === p.k).map((q) => launchF(q.i));
      const glow = Math.max(0, ...sends.map((s) => (frame >= s - 4 && frame < s + 14 ? 1 - Math.abs(frame - s) / 14 : 0)));
      return (
        <Person
          key={p.k}
          x={p.x}
          y={p.y}
          scale={PERSON_S}
          facing={-1}
          pose="phone"
          phoneGlow={0.35 + 0.65 * glow}
          {...crowdLook(p.k + 1)}
        />
      );
    })}

    {/* inbox of cleanly received packets, next to the antenna */}
    {OK.map((p, r) => {
      const res = resolveF(p.i);
      const df = deliverF(r);
      if (frame < res) return null;
      const pos = INBOX(r);
      const toInbox = prog(frame, res, 10);
      const toBoard = prog(frame, df, DELIVER_DUR);
      if (toBoard >= 1) return null;
      const x = lerp(lerp(RX.x, pos.x, toInbox), DIGIT_X, toBoard);
      const y = lerp(lerp(RX.y, pos.y, toInbox), ROW_DELIV, toBoard);
      return <Puff key={`in-${r}`} x={x} y={y} color={COLORS.success} scale={1 - 0.3 * toBoard} />;
    })}

    {/* puffs in flight, at the antenna, and collisions fizzling */}
    {PACKETS.map((p, i) => {
      const L = launchF(i);
      const A = arriveF(i);
      const R = resolveF(i);
      if (frame < L) return null;
      const color = p.kind === "retry" ? COLORS.retry : COLORS.event;
      if (frame < A) {
        const u = prog(frame, L, FLIGHT);
        const p0 = phoneAt(SOURCE[i]);
        const c1 = { x: Math.max(p0.x - 80, 640), y: 110 };
        const x = (1 - u) ** 2 * p0.x + 2 * (1 - u) * u * c1.x + u * u * RX.x;
        const y = (1 - u) ** 2 * p0.y + 2 * (1 - u) * u * c1.y + u * u * RX.y;
        return <Puff key={i} x={x} y={y} color={color} />;
      }
      if (frame < R) {
        // being received: sits on the antenna for one frame time
        const off = (i % 2 === 0 ? -1 : 1) * 10;
        return <Puff key={i} x={RX.x + off} y={RX.y - 4} color={color} />;
      }
      if (!p.ok) {
        const k = prog(frame, R, 16);
        if (k >= 1) return null;
        return <Fizzle key={i} x={RX.x} y={RX.y} k={k} seed={i} />;
      }
      return null;
    })}
  </Stage>
);

const Puff: React.FC<{ x: number; y: number; color: string; scale?: number }> = ({ x, y, color, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <circle r={20} fill={color} opacity={0.18} />
    <rect x={-17} y={-9} width={34} height={18} rx={7} fill={color} />
  </g>
);

const Fizzle: React.FC<{ x: number; y: number; k: number; seed: number }> = ({ x, y, k, seed }) => (
  <g opacity={1 - k}>
    <circle cx={x} cy={y} r={14 + 34 * k} fill="none" stroke={COLORS.collision} strokeWidth={3} />
    {Array.from({ length: 6 }, (_, j) => {
      const ang = (j / 6) * Math.PI * 2 + random(`s12-fz-${seed}-${j}`);
      const d = 10 + 40 * k;
      return <circle key={j} cx={x + Math.cos(ang) * d} cy={y + Math.sin(ang) * d} r={5 * (1 - k) + 2} fill={COLORS.collision} />;
    })}
  </g>
);

const Scoreboard: React.FC<{ frame: number; tries: number; delivered: number; delivOn: number; hideDigits: boolean }> = ({
  frame,
  tries,
  delivered,
  delivOn,
  hideDigits,
}) => {
  // a little flash each time a digit ticks
  const lastLaunch = Math.max(-999, ...PACKETS.map((p) => launchF(p.i)).filter((f) => f <= frame));
  const lastDeliver = Math.max(-999, ...OK.map((_, r) => deliverF(r) + DELIVER_DUR).filter((f) => f <= frame));
  const flashT = Math.exp(-(frame - lastLaunch) / 5);
  const flashD = Math.exp(-(frame - lastDeliver) / 5);
  const digit = (color: string, flash: number): React.CSSProperties => ({
    fontVariantNumeric: "tabular-nums",
    textShadow: `0 0 ${10 + 18 * flash}px ${color}`,
    transform: `translate(-50%, -50%) scale(${1 + 0.12 * flash})`,
  });
  const labelStyle: React.CSSProperties = { letterSpacing: "0.12em" };
  return (
    <>
      <Label x={BOARD.x + 30} y={ROW_TRIES - 16} anchor="left" size={24} weight={800} color={COLORS.ink} style={labelStyle}>
        TRIES
      </Label>
      <Label x={BOARD.x + 30} y={ROW_TRIES + 16} anchor="left" size={20} color={COLORS.muted}>
        per frame time
      </Label>
      {!hideDigits ? (
        <Label x={DIGIT_X} y={ROW_TRIES} size={64} weight={800} color={COLORS.event} style={digit(COLORS.event, flashT)}>
          {fmt(tries)}
        </Label>
      ) : null}

      <Label x={BOARD.x + 30} y={ROW_DELIV - 16} anchor="left" size={24} weight={800} color={COLORS.ink} opacity={0.35 + 0.65 * delivOn} style={labelStyle}>
        DELIVERED
      </Label>
      <Label x={BOARD.x + 30} y={ROW_DELIV + 16} anchor="left" size={20} color={COLORS.muted} opacity={0.35 + 0.65 * delivOn}>
        per frame time
      </Label>
      {!hideDigits ? (
        <Label
          x={DIGIT_X}
          y={ROW_DELIV}
          size={64}
          weight={800}
          color={COLORS.success}
          opacity={0.3 + 0.7 * delivOn}
          style={digit(COLORS.success, flashD)}
        >
          {fmt(delivered)}
        </Label>
      ) : null}
    </>
  );
};

const FlyingNumber: React.FC<{ p: number; from: { x: number; y: number }; to: { x: number; y: number }; text: string; color: string }> = ({
  p,
  from,
  to,
  text,
  color,
}) => {
  // a gentle arc rather than a straight slide
  const x = lerp(from.x, to.x, p);
  const y = lerp(from.y, to.y, p) - Math.sin(p * Math.PI) * 60;
  return (
    <Label
      x={x}
      y={y}
      size={lerp(64, 56, p)}
      weight={lerp(800, 700, p)}
      color={color}
      style={{ fontVariantNumeric: "tabular-nums", textShadow: `0 0 ${14 * (1 - p) + 6}px ${color}` }}
    >
      {text}
    </Label>
  );
};
