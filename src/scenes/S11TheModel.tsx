// Scene 11 — Turning it into math
// Brief: scenes/s11-the-model.md  ·  Shared brief: scenes/README.md  ·  Kit: src/shared/README.md
//
// Beats: hub ring dims onto a blueprint grid → assumption 1: one packet bar = 1 frame time, axis re-ticks to 0,1,2…
// → assumption 2: the bus-stop crowd's phones puff blue/amber at random → each person becomes its own sparse row
// → the rows fold onto one shared channel timeline (same StreamMerge move as Scene 03, shown in an inset)
// → "all attempts = Poisson process" → footnote. Closes on the merged channel timeline (Scene 12 labels it G).
import React from "react";
import { interpolate, random, useCurrentFrame } from "remotion";
import {
  Bracket,
  Bus,
  BusStopStreet,
  COLORS,
  Commuter,
  clamp01,
  crowdLook,
  cue,
  EASE,
  FONT,
  HubAndTerminals,
  ILLUS,
  Label,
  lerp,
  narrationEndFrame,
  PacketBar,
  Person,
  prog,
  rand,
  SceneFrame,
  SIZE,
  sparseSources,
  Stage,
  STREET,
  StreamMerge,
  Timeline,
  timeScale,
  useSvgId,
} from "../shared";

/** Extra seconds of picture after the narration tail. The scene length updates automatically. */
export const meta = { extraTail: 0.8 };

const ID = "s11" as const;

// ── narration cues ────────────────────────────────────────────────────────────
const C = {
  model: cue(ID, "Let's build a model"),
  first: cue(ID, "First, assume every packet"),
  sameTime: cue(ID, "takes the same time to send"),
  oneFrame: cue(ID, "one frame time"),
  unit: cue(ID, "use it as our unit of time"),
  second: cue(ID, "Second, count every attempt"),
  alike: cue(ID, "new packets and retries alike"),
  many: cue(ID, "With many terminals"),
  once: cue(ID, "each sending only once in a while"),
  look: cue(ID, "what do all those attempts look like"),
  recipe: cue(ID, "It's the recipe from the start"),
  rare: cue(ID, "Lots of rare, independent events"),
  poisson: cue(ID, "A Poisson process, just like the bus stop"),
  busStop: cue(ID, "just like the bus stop"),
  approx: cue(ID, "It's an approximation"),
  end: narrationEndFrame(ID),
};

// ── geometry ──────────────────────────────────────────────────────────────────
/** Assumption 1 timeline (wide zoom: one packet clearly visible). */
const SC1 = timeScale(-0.5, 6.5, 100, 1100);
const Y1 = 400;
const PKT1 = 3; // the bracketed packet spans [3, 4]

/** The per-phone rows and the merged channel timeline. Frame-time units. */
const T_SPAN = 12;
const SCR = timeScale(0, T_SPAN, 200, 1180);
const ROW_TOP = 190;
const ROW_GAP = 36;
const MERGED_Y = 540;
/** Where the merged channel timeline ends up in the last frames (handoff to Scene 12). */
const HANDOFF_Y = 380;
const ROW_LABEL_X = 156;
const N_ROWS = 8;

// ── the crowd at the stop (left → right = row 0 → 7) ──────────────────────────
type CrowdMember = { x: number; s: number; f: 1 | -1; look: number; commuter?: boolean };
const CROWD: CrowdMember[] = [
  { x: 92, s: 0.86, f: 1, look: 0 },
  { x: 212, s: 0.9, f: -1, look: 1 },
  { x: 340, s: 0.84, f: 1, look: 4 },
  { x: 466, s: 0.9, f: 1, look: 5 },
  { x: 594, s: 0.86, f: -1, look: 3 },
  { x: 724, s: 0.9, f: 1, look: 6 },
  { x: STREET.commuter.x, s: 1, f: 1, look: -1, commuter: true },
  { x: 1068, s: 0.88, f: -1, look: 2 },
];
const COMMUTER_ROW = 6;
const jacketOf = (m: CrowdMember) => (m.commuter ? ILLUS.commuterJacket : crowdLook(m.look).jacket!);
/** Where the phone is in a Person with pose "phone" (hand + phone offset, see Person.tsx). */
const phonePos = (m: CrowdMember) => ({ x: m.x + 44 * m.s * m.f, y: STREET.sidewalkY - 152 * m.s });

// ── the attempts: sparse, independent, seeded ────────────────────────────────
type Attempt = { row: number; t: number; retry: boolean };
const ROWS: number[][] = (() => {
  const raw = sparseSources(N_ROWS, 0.085, 0.2, T_SPAN - 1.1, "s11-phones");
  return raw.map((times, i) => {
    let src = times;
    // the Commuter's "Bus is late again" goes out first
    if (i === COMMUTER_ROW) src = [0.6, ...times.filter((t) => t > 2)];
    // every phone puffs at least once, so each person visibly becomes a row
    if (src.length === 0) src = [rand(`s11-fill-${i}`, 1, T_SPAN - 2)];
    // one phone can't overlap itself
    const out: number[] = [];
    for (const t of src) if (!out.length || t - out[out.length - 1] >= 1.4) out.push(t);
    return out;
  });
})();
const ATTEMPTS: Attempt[] = ROWS.flatMap((times, row) =>
  times.map((t, j) => ({ row, t, retry: row !== COMMUTER_ROW || j > 0 ? random(`s11-retry-${row}-${j}`) < 0.3 : false })),
);
/** Bars that overlap another on the merged line get a thin dark outline so each stays readable as 1 frame time. */
const OVERLAPS = new Set(ATTEMPTS.flatMap((a, i) => (ATTEMPTS.some((b, j) => j !== i && Math.abs(a.t - b.t) < 1) ? [i] : [])));
const colorOf = (a: Attempt) => (a.retry ? COLORS.retry : COLORS.event);

// The same stagger StreamMerge uses, so the bars ride exactly with its rows.
const rowFold = (F: number, i: number) => EASE(clamp01((F - (i / N_ROWS) * 0.35) / 0.65));

// ── small drawings ─────────────────────────────────────────────────────────────
const PhoneGlyph: React.FC<{ x: number; y: number; scale?: number; glow?: number }> = ({ x, y, scale = 1, glow = 0.5 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-8} y={-14} width={16} height={28} rx={3.5} fill="#0b1220" />
    <rect x={-6} y={-11} width={12} height={21} rx={2} fill={COLORS.event} opacity={0.25 + 0.75 * glow} />
  </g>
);

const House: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) scale(1.25)`}>
    <path d="M -9 -1 L 0 -9 L 9 -1 Z" fill="#7c2d12" />
    <rect x={-7} y={-1} width={14} height={9} fill={ILLUS.buildingHi} />
    <rect x={-2} y={1} width={4} height={4} fill={ILLUS.windowLit} />
  </g>
);

const BlueprintGrid: React.FC<{ opacity: number }> = ({ opacity }) => {
  const minor = useSvgId("bp-minor");
  const major = useSvgId("bp-major");
  if (opacity <= 0) return null;
  return (
    <g opacity={opacity}>
      <defs>
        <pattern id={minor} width={20} height={20} patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke={COLORS.faint} strokeWidth={0.6} opacity={0.35} />
        </pattern>
        <pattern id={major} width={100} height={100} patternUnits="userSpaceOnUse">
          <rect width={100} height={100} fill={`url(#${minor})`} />
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke={COLORS.faint} strokeWidth={1.2} opacity={0.55} />
        </pattern>
      </defs>
      <rect x={0} y={0} width={1280} height={720} fill={`url(#${major})`} />
    </g>
  );
};

/** Scene 03 callback: houses' mini-timelines folding into the bus stop's one timeline. */
const INSET = { x: 930, y: 22, w: 320, h: 150 };
const INSET_SC = timeScale(0, 10, INSET.x + 54, INSET.x + INSET.w - 18);
const INSET_ROWS = sparseSources(5, 0.26, 0.2, 9.8, "s11-inset-houses");
const MERGED_INSET_Y = INSET.y + INSET.h - 24;
const Inset: React.FC<{ F: number; opacity: number }> = ({ F, opacity }) => {
  if (opacity <= 0) return null;
  const stopIn = clamp01(F * 1.6 - 0.4);
  return (
    <g opacity={opacity}>
      <rect x={INSET.x} y={INSET.y} width={INSET.w} height={INSET.h} rx={14} fill={COLORS.panel} stroke={COLORS.faint} strokeWidth={2} />
      <StreamMerge
        scale={INSET_SC}
        rows={INSET_ROWS}
        rowTop={INSET.y + 22}
        rowGap={19}
        mergedY={MERGED_INSET_Y}
        progress={F}
        r={4}
        rowLabel={(_, y) => <House x={INSET.x + 30} y={y} />}
      />
      {/* the bus stop sign at the merged line's start */}
      <g opacity={stopIn} transform={`translate(${INSET.x + 30} ${MERGED_INSET_Y})`}>
        <rect x={-1.5} y={-4} width={3} height={14} fill={ILLUS.metal} />
        <circle cx={0} cy={-8} r={8} fill={COLORS.bus} stroke="#0b1220" strokeWidth={1.5} />
      </g>
    </g>
  );
};

/** A radio puff: a ring at the phone, then a small packet flying up to the rooftop tower. */
const Puff: React.FC<{ from: { x: number; y: number }; p: number; color: string }> = ({ from, p, color }) => {
  if (p <= 0 || p >= 1) return null;
  const to = STREET.towerTop;
  const ring = clamp01(p / 0.45);
  const fly = EASE(clamp01((p - 0.1) / 0.9));
  const x = lerp(from.x, to.x, fly);
  const y = lerp(from.y, to.y, fly);
  const ang = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
  return (
    <g>
      <circle cx={from.x} cy={from.y} r={10 + ring * 30} fill="none" stroke={color} strokeWidth={3} opacity={0.9 * (1 - ring)} />
      <rect x={-14} y={-6} width={28} height={12} rx={5} fill={color} opacity={1 - clamp01((fly - 0.85) / 0.15)} transform={`translate(${x} ${y}) rotate(${ang})`} />
    </g>
  );
};

const LegendChip: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
    <span style={{ width: 40, height: 18, borderRadius: 6, background: color, display: "inline-block" }} />
    <span>{children}</span>
  </span>
);

// ── the scene ─────────────────────────────────────────────────────────────────
export const S11TheModel: React.FC = () => {
  const frame = useCurrentFrame();
  const linear = (t: number) => t;

  // closing: everything but the merged channel timeline steps aside for Scene 12
  const extras = 1 - prog(frame, C.end + 6, 14);
  // … and the merged channel glides to the middle of the frame, where Scene 12 picks it up
  const lift = lerp(0, HANDOFF_Y - MERGED_Y, prog(frame, C.end + 8, 20));

  // beat 0: hub ring dims, blueprint grid fades in
  const hubOp = (1 - 0.72 * prog(frame, C.model, 20)) * (1 - prog(frame, C.first - 4, 16));
  const gridA = prog(frame, C.model, 25) * (1 - prog(frame, C.second - 10, 14));
  const gridB = prog(frame, C.many + 20, 25) * extras;
  const gridOp = 0.9 * Math.max(gridA, gridB);

  // beat 1: one packet, bracketed; axis re-ticks into frame times
  const a1Op = prog(frame, C.first, 10) * (1 - prog(frame, C.second - 10, 14));
  const axisDraw = prog(frame, C.first, 24);
  const pktFill = prog(frame, C.first + 22, 36, linear);
  const sameOp = prog(frame, C.sameTime + 12, 14);
  const brk = prog(frame, C.sameTime + 18, 18);
  const lbl = prog(frame, C.oneFrame, 12);
  const retick = prog(frame, C.unit, 16);

  // beat 2: the bus-stop crowd, phones puff
  const streetOp = prog(frame, C.second - 8, 14);
  const dim = prog(frame, C.many, 28);
  const personOp = 1 - prog(frame, C.many + 4, 20);
  const puffStart = C.second + 10;
  const puffEnd = C.many - 6;
  const puffFrame = (t: number) => lerp(puffStart, puffEnd, t / T_SPAN);
  const PUFF_DUR = 26;
  const legendOp = prog(frame, C.alike, 12) * extras;

  // beat 3: each person becomes its row
  const tokenOp = prog(frame, C.many + 2, 10);
  const tokenMove = (i: number) => prog(frame, C.many + 10 + i * 2, 34);
  const rowsOp = prog(frame, C.many + 26, 18);
  const cursor = interpolate(frame, [C.once + 14, C.look - 2], [0, T_SPAN], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // beat 4: anticipation, the rows hover
  const hoverAmt = prog(frame, C.look, 12) * (1 - prog(frame, C.recipe, 18));
  const bob = 5 * Math.sin((frame - C.look) / 9) * hoverAmt;
  const ghostLine = prog(frame, C.look + 12, 16);

  // beat 5: the fold (same StreamMerge as Scene 03), plus the Scene 03 inset
  const F = prog(frame, C.recipe + 10, C.poisson - C.recipe - 24, linear);
  const lineFade = 1 - clamp01(F * 1.4);
  const insetOp = prog(frame, C.recipe - 12, 14) * extras;
  const ticksOp = prog(frame, C.rare + 24, 20);

  // beat 6 + 7: caption with the flashing bus, footnote
  const capOp = prog(frame, C.poisson, 14) * extras;
  const busFlashT = clamp01((frame - C.busStop) / 54);
  const busOp =
    frame < C.busStop ? 0 : busFlashT < 1 ? 0.25 + 0.75 * (0.5 - 0.5 * Math.cos(busFlashT * Math.PI * 6)) : 1;
  const footOp = prog(frame, C.approx, 16) * extras;

  const showStreet = streetOp > 0 && dim < 1;
  const showRows = frame >= C.many;

  return (
    <SceneFrame id={ID}>
      {/* real life: the bus-stop crowd */}
      {showStreet ? (
        <Stage opacity={streetOp}>
          <BusStopStreet dim={dim * 0.92}>
            {CROWD.map((m, i) =>
              m.commuter ? (
                <Commuter key={i} x={m.x} y={STREET.sidewalkY} scale={m.s} facing={m.f} pose="phone" phoneGlow={1} opacity={personOp} />
              ) : (
                <Person
                  key={i}
                  x={m.x}
                  y={STREET.sidewalkY}
                  scale={m.s}
                  facing={m.f}
                  pose="phone"
                  {...crowdLook(m.look)}
                  opacity={personOp}
                />
              ),
            )}
            {ATTEMPTS.map((a, k) => (
              <Puff key={k} from={phonePos(CROWD[a.row])} p={(frame - puffFrame(a.t)) / PUFF_DUR} color={colorOf(a)} />
            ))}
          </BusStopStreet>
        </Stage>
      ) : null}

      {/* theory: blueprint grid, hub, timelines */}
      <Stage>
        <BlueprintGrid opacity={gridOp} />

        {hubOp > 0 ? (
          <HubAndTerminals
            cx={640}
            cy={360}
            radius={230}
            n={8}
            opacity={hubOp}
            highlight={[1]}
            traffic={[
              { i: 1, p: prog(frame, 0, 30) },
              { i: 1, p: prog(frame, 32, 30), kind: "ack" as const },
            ].filter((t) => t.p > 0 && t.p < 1)}
          />
        ) : null}

        {/* assumption 1 */}
        {a1Op > 0 ? (
          <g opacity={a1Op}>
            <Timeline scale={SC1} y={Y1} tickEvery={0.5} label="time →" progress={axisDraw} opacity={1 - retick} />
            <Timeline
              scale={SC1}
              y={Y1}
              tickEvery={1}
              tickLabel={(t) => `${t}`}
              label="frame times →"
              opacity={retick}
            />
            <PacketBar scale={SC1} start={0.55} y={Y1 - 36} h={44} opacity={0.5 * sameOp} />
            <PacketBar scale={SC1} start={5.05} y={Y1 - 36} h={44} opacity={0.5 * sameOp} />
            <PacketBar scale={SC1} start={PKT1} y={Y1 - 36} h={44} fill={pktFill} opacity={axisDraw} />
            <Bracket x1={SC1(PKT1)} x2={SC1(PKT1 + 1)} y={Y1 - 76} progress={brk} />
          </g>
        ) : null}

        {/* assumption 2: phones become rows */}
        {showRows ? (
          <g>
            <g transform={`translate(0 ${lift})`}>
              {/* dashed hint of the shared channel, before the fold */}
              <line
                x1={SCR.x0}
                y1={MERGED_Y}
                x2={SCR.x1}
                y2={MERGED_Y}
                stroke={COLORS.faint}
                strokeWidth={3}
                strokeDasharray="10 10"
                opacity={ghostLine * (1 - clamp01(F * 2.5))}
              />
              <Timeline
                scale={SCR}
                y={MERGED_Y}
                tickEvery={1}
                tickLabel={(t) => (t % 2 === 0 ? `${t}` : null)}
                label="frame times →"
                opacity={ticksOp}
              />
              <StreamMerge
                scale={SCR}
                rows={ROWS}
                rowTop={ROW_TOP + bob}
                rowGap={ROW_GAP}
                mergedY={MERGED_Y}
                progress={F}
                r={0}
                colorOf={() => "transparent"}
                opacity={rowsOp}
              />
              {ATTEMPTS.map((a, k) => {
                const visible = clamp01((cursor - a.t) * 4);
                if (visible <= 0) return null;
                const p = rowFold(F, a.row);
                const y = lerp(ROW_TOP + bob + a.row * ROW_GAP, MERGED_Y, p);
                return (
                  <PacketBar
                    key={k}
                    scale={SCR}
                    start={a.t}
                    y={y - lerp(0, 18, p)}
                    h={lerp(20, 34, p)}
                    state={a.retry ? "retry" : "attempt"}
                    fill={clamp01(cursor - a.t)}
                    edge={OVERLAPS.has(k) && p > 0.3 ? COLORS.bg : undefined}
                    opacity={visible}
                  />
                );
              })}
            </g>
            {/* each person's token: jacket colour + phone, flying from the street to its row */}
            {CROWD.map((m, i) => {
              const mv = tokenMove(i);
              const from = phonePos(m);
              const to = { x: ROW_LABEL_X, y: ROW_TOP + bob + i * ROW_GAP };
              const x = lerp(from.x, to.x, mv);
              const y = lerp(from.y, to.y, mv);
              const op = tokenOp * lineFade;
              if (op <= 0) return null;
              return (
                <g key={i} opacity={op}>
                  <circle cx={x} cy={y} r={lerp(22, 16, mv)} fill={jacketOf(m)} stroke={m.commuter ? COLORS.ink : "none"} strokeWidth={2} />
                  <PhoneGlyph x={x} y={y} scale={lerp(1, 0.8, mv)} glow={0.6} />
                </g>
              );
            })}
            <Inset F={F} opacity={insetOp} />
          </g>
        ) : null}
      </Stage>

      {/* HTML text */}
      <Label x={SC1(PKT1 + 0.5)} y={Y1 - 118} size={30} weight={700} opacity={lbl * a1Op}>
        1 frame time
      </Label>
      <Label x={48} y={52} anchor="left" size={SIZE.label} opacity={legendOp} style={{ display: "flex", gap: 28 }}>
        <LegendChip color={COLORS.event}>new</LegendChip>
        <LegendChip color={COLORS.retry}>retry</LegendChip>
      </Label>
      <Label x={640 + 28} y={640} size={SIZE.caption + 4} weight={600} opacity={capOp}>
        all attempts = <span style={{ color: COLORS.event, fontWeight: 800 }}>Poisson process</span>
      </Label>
      <Label x={640} y={692} size={SIZE.label} color={COLORS.muted} italic opacity={footOp} style={{ fontFamily: FONT.sans }}>
        assumption: many users, randomised retries
      </Label>

      {/* the tiny bus that flashes next to the caption */}
      <Stage>
        <Bus x={366} y={653} scale={0.14} opacity={busOp * capOp} />
      </Stage>
    </SceneFrame>
  );
};
