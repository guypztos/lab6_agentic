// Scene 08 — Hawaii, 1971
// Brief: scenes/s08-hawaii-1971.md  ·  Shared brief: scenes/README.md  ·  Kit: src/shared/README.md
//
// A retro-print map of the islands: terminals pop up, the Honolulu hub lights up, a phone-pole line across the
// ocean gets a "$$$" tag and crackles out, radio arcs replace it (all one colour = one shared frequency), and the
// map melts into the reusable hub-and-terminals ring that Scene 09 opens on.
import React from "react";
import { random, useCurrentFrame } from "remotion";
import {
  clamp01,
  COLORS,
  cue,
  fade,
  FONT,
  HubAndTerminals,
  ILLUS,
  Label,
  lerp,
  pop,
  prog,
  SceneFrame,
  SIZE,
  Stage,
  Stamp,
  type Pt,
} from "../shared";

/** Extra seconds of picture after the narration tail. The scene length updates automatically. */
export const meta = { extraTail: 1.5 };

const ID = "s08" as const;

// ── the closing ring (must match Scene 09's opening exactly) ───────────────────────────────────────────────
const RING = { cx: 640, cy: 380, radius: 240, n: 7 };
const ringPt = (i: number): Pt => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / RING.n;
  return { x: RING.cx + RING.radius * Math.cos(a), y: RING.cy + RING.radius * 0.78 * Math.sin(a) };
};

// ── map geography (stylised, roughly true to the island chain) ────────────────────────────────────────────
const HONOLULU: Pt = { x: 632, y: 306 };
/** Terminal i on the map → ring slot i (chosen so the morph paths don't cross). */
const MAP_TERMINALS: Pt[] = [
  { x: 540, y: 222 }, // 0 Oʻahu, windward campus  → top
  { x: 780, y: 292 }, // 1 Molokaʻi                → upper right
  { x: 948, y: 366 }, // 2 Maui                    → right
  { x: 1112, y: 510 }, // 3 Hilo                   → lower right
  { x: 958, y: 590 }, // 4 Kona                    → lower left
  { x: 512, y: 322 }, // 5 Oʻahu, leeward campus   → left
  { x: 300, y: 214 }, // 6 Kauaʻi                  → upper left
];
/** Pop order: west → east, as the narration sweeps "across the islands". */
const POP_ORDER = [6, 5, 0, 1, 2, 4, 3];

type Island = { cx: number; cy: number; rx: number; ry: number; rot: number; seed: string; wob?: number; n?: number };
const ISLANDS: Island[] = [
  { cx: 178, cy: 252, rx: 24, ry: 13, rot: 30, seed: "niihau" },
  { cx: 300, cy: 226, rx: 66, ry: 56, rot: 0, seed: "kauai", wob: 0.12 },
  { cx: 592, cy: 296, rx: 112, ry: 72, rot: 30, seed: "oahu", wob: 0.14 },
  { cx: 790, cy: 312, rx: 82, ry: 22, rot: 4, seed: "molokai", wob: 0.14 },
  { cx: 806, cy: 362, rx: 24, ry: 18, rot: 0, seed: "lanai" },
  { cx: 905, cy: 368, rx: 42, ry: 34, rot: -10, seed: "mauiW" },
  { cx: 972, cy: 392, rx: 58, ry: 44, rot: 10, seed: "mauiE", wob: 0.12 },
  { cx: 885, cy: 430, rx: 22, ry: 11, rot: -15, seed: "kahoolawe" },
  { cx: 1030, cy: 552, rx: 128, ry: 112, rot: -20, seed: "hawaii", wob: 0.16, n: 9 },
];

/** A smooth closed blob (Catmull-Rom through wobbly points), deterministic per seed. */
function blobPath({ cx, cy, rx, ry, rot, seed, wob = 0.2, n = 10 }: Island, grow = 0): string {
  const r = (rot * Math.PI) / 180;
  const pts = Array.from({ length: n }, (_, k) => {
    const a = (k * 2 * Math.PI) / n;
    const m = 1 + (random(`${seed}-${k}`) - 0.5) * 2 * wob;
    const x = (rx + grow) * m * Math.cos(a);
    const y = (ry + grow) * m * Math.sin(a);
    return { x: cx + x * Math.cos(r) - y * Math.sin(r), y: cy + x * Math.sin(r) + y * Math.cos(r) };
  });
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)} `;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += `C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} `;
  }
  return d + "Z";
}

const LAND_HI = "#4f7f5f";
const MAP_INK = ILLUS.sand;

// ── the ocean map ───────────────────────────────────────────────────────────────────────────────────────
const MapBase: React.FC<{ frame: number; t0: number }> = ({ frame, t0 }) => {
  const box = { x: 24, y: 24, w: 1232, h: 672 };
  return (
    <g>
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={22} fill={ILLUS.ocean} />
      {/* old-map graticule */}
      {Array.from({ length: 7 }, (_, i) => (
        <line key={`v${i}`} x1={184 + i * 160} y1={box.y + 14} x2={184 + i * 160} y2={box.y + box.h - 14} stroke={MAP_INK} strokeOpacity={0.09} strokeWidth={1.5} strokeDasharray="3 7" />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <line key={`h${i}`} x1={box.x + 14} y1={130 + i * 120} x2={box.x + box.w - 14} y2={130 + i * 120} stroke={MAP_INK} strokeOpacity={0.09} strokeWidth={1.5} strokeDasharray="3 7" />
      ))}
      {/* double-rule print border */}
      <rect x={box.x + 10} y={box.y + 10} width={box.w - 20} height={box.h - 20} rx={14} fill="none" stroke={MAP_INK} strokeOpacity={0.35} strokeWidth={2} />
      <rect x={box.x + 16} y={box.y + 16} width={box.w - 32} height={box.h - 32} rx={10} fill="none" stroke={MAP_INK} strokeOpacity={0.18} strokeWidth={1} />
      {/* a few printed wave marks */}
      {[
        [150, 420],
        [230, 470],
        [700, 160],
        [860, 210],
        [1180, 300],
        [700, 470],
        [770, 620],
        [140, 140],
      ].map(([x, y], i) => (
        <path
          key={`w${i}`}
          d={`M ${x} ${y} q 8 -7 16 0 t 16 0 t 16 0`}
          stroke={MAP_INK}
          strokeOpacity={0.22}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
        />
      ))}
      {/* islands: shadow → beach → land → highlight, each layer for all islands so overlaps merge cleanly */}
      {(["shadow", "beach", "land", "hi"] as const).map((layer) => (
        <g key={layer}>
          {ISLANDS.map((isl, i) => {
            const p = pop(frame, t0 + 4 + i * 4);
            const k = clamp01(p);
            const tf = `translate(${isl.cx} ${isl.cy}) scale(${0.6 + 0.4 * p}) translate(${-isl.cx} ${-isl.cy})`;
            if (layer === "shadow")
              return <path key={i} d={blobPath(isl, 2)} fill="#000" opacity={0.28 * k} transform={`${tf} translate(5 7)`} />;
            if (layer === "beach")
              return <path key={i} d={blobPath(isl, 4)} fill={ILLUS.sand} opacity={k} transform={tf} />;
            if (layer === "land") return <path key={i} d={blobPath(isl, 0)} fill={ILLUS.land} opacity={k} transform={tf} />;
            return (
              <path
                key={i}
                d={blobPath({ ...isl, rx: isl.rx * 0.55, ry: isl.ry * 0.5, cx: isl.cx - isl.rx * 0.12, cy: isl.cy - isl.ry * 0.14 }, 0)}
                fill={LAND_HI}
                opacity={0.8 * k}
                transform={tf}
              />
            );
          })}
        </g>
      ))}
    </g>
  );
};

const IslandLabels: React.FC<{ opacity: number }> = ({ opacity }) => {
  const items: [string, number, number][] = [
    ["KAUAʻI", 300, 304],
    ["OʻAHU", 474, 392],
    ["MOLOKAʻI", 868, 266],
    ["MAUI", 1000, 452],
    ["HAWAIʻI", 1050, 640],
  ];
  return (
    <g opacity={opacity}>
      {items.map(([t, x, y]) => (
        <text
          key={t}
          x={x}
          y={y}
          fill={MAP_INK}
          fontFamily={FONT.sans}
          fontSize={20}
          fontWeight={700}
          letterSpacing="0.14em"
          textAnchor="middle"
          opacity={0.9}
        >
          {t}
        </text>
      ))}
    </g>
  );
};

// ── the phone-pole line across the ocean ─────────────────────────────────────────────────────────────────
const LINES: Pt[][] = [
  // Kauaʻi → Oʻahu across the channel
  [
    { x: 362, y: 238 },
    { x: 404, y: 246 },
    { x: 446, y: 254 },
    { x: 488, y: 262 },
  ],
  // Oʻahu → Hawaiʻi along the south of the chain
  [
    { x: 686, y: 344 },
    { x: 730, y: 380 },
    { x: 774, y: 412 },
    { x: 818, y: 444 },
    { x: 862, y: 470 },
    { x: 906, y: 494 },
  ],
];
const POLE_H = 30;

const PhoneLines: React.FC<{ frame: number; start: number; tagAt: number; crackleAt: number; fadeAt: number }> = ({
  frame,
  start,
  tagAt,
  crackleAt,
  fadeAt,
}) => {
  const alpha = fade(frame, start, 8, fadeAt, 20);
  if (alpha <= 0) return null;
  const crackling = frame >= crackleAt && frame < fadeAt + 20;
  const total = LINES.reduce((n, l) => n + l.length, 0);
  const draw = prog(frame, start, 30) * total;
  let idx = 0;
  return (
    <g opacity={alpha}>
      {LINES.map((line, li) => {
        const tops = line.map((p, k) => {
          const j = crackling ? (random(`jit-${li}-${k}-${frame}`) - 0.5) * 5 : 0;
          return { x: p.x, y: p.y - POLE_H + j };
        });
        const shown = line.map(() => clamp01(draw - idx++));
        const flicker = crackling && random(`flick-${li}-${Math.floor(frame / 2)}`) > 0.6 ? 0.35 : 1;
        return (
          <g key={li}>
            {/* wire */}
            {tops.slice(0, -1).map((a, k) => {
              const b = tops[k + 1];
              const v = Math.min(shown[k], shown[k + 1]);
              if (v <= 0) return null;
              const mx = (a.x + b.x) / 2;
              const my = (a.y + b.y) / 2 + 9;
              return (
                <path
                  key={k}
                  d={`M ${a.x} ${a.y + 2} Q ${mx} ${my} ${b.x} ${b.y + 2}`}
                  stroke={COLORS.ink}
                  strokeWidth={2}
                  fill="none"
                  opacity={v * flicker * 0.85}
                />
              );
            })}
            {/* poles standing in the sea */}
            {line.map((p, k) => {
              const v = shown[k];
              if (v <= 0) return null;
              return (
                <g key={k} transform={`translate(${p.x} ${p.y}) scale(1 ${v})`}>
                  <ellipse cx={0} cy={0} rx={9} ry={3} fill="none" stroke={MAP_INK} strokeOpacity={0.4} strokeWidth={1.5} />
                  <line x1={0} y1={0} x2={0} y2={-POLE_H} stroke={ILLUS.wood} strokeWidth={4} strokeLinecap="round" />
                  <line x1={-9} y1={-POLE_H + 5} x2={9} y2={-POLE_H + 5} stroke={ILLUS.wood} strokeWidth={3.5} strokeLinecap="round" />
                </g>
              );
            })}
            {/* sparks while crackling */}
            {crackling
              ? line.map((p, k) => {
                  if (random(`spark-${li}-${k}-${Math.floor(frame / 3)}`) < 0.55) return null;
                  const x = p.x + 10;
                  const y = p.y - POLE_H - 6;
                  return (
                    <path
                      key={`s${k}`}
                      d={`M ${x} ${y} l 7 -9 l -3 8 l 9 -6 l -4 9`}
                      stroke={COLORS.ink}
                      strokeWidth={2.5}
                      fill="none"
                      strokeLinejoin="round"
                    />
                  );
                })
              : null}
          </g>
        );
      })}
      {/* "$$$" price tags hanging off the wire */}
      {[
        { x: 425, y: 225, seed: 0 },
        { x: 796, y: 400, seed: 1 },
      ].map((t) => {
        const p = pop(frame, tagAt + t.seed * 5, undefined, 11);
        if (p <= 0.01) return null;
        const swing = Math.sin((frame - tagAt) / 5 + t.seed) * 8 * Math.exp(-(frame - tagAt) / 40) + (crackling ? Math.sin(frame) * 3 : 0);
        return (
          <g key={t.seed} transform={`translate(${t.x} ${t.y}) rotate(${swing}) scale(${clamp01(p) * (0.9 + 0.1 * p)})`}>
            <line x1={0} y1={0} x2={0} y2={16} stroke={COLORS.ink} strokeWidth={1.5} />
            <path d="M -30 22 L -18 14 H 34 V 50 H -18 Z" fill={MAP_INK} transform="rotate(-8)" />
            <circle cx={-20} cy={30} r={3} fill={ILLUS.ocean} transform="rotate(-8)" />
            <text x={10} y={42} fill={COLORS.bg} fontFamily={FONT.sans} fontWeight={900} fontSize={22} textAnchor="middle" transform="rotate(-8)">
              $$$
            </text>
          </g>
        );
      })}
    </g>
  );
};

// ── radio arcs: little wave fronts flowing terminal → hub, all in the one shared colour ─────────────────
const RadioArcs: React.FC<{ frame: number; pts: Pt[]; hub: Pt; start: number; boost: number; opacity: number }> = ({
  frame,
  pts,
  hub,
  start,
  boost,
  opacity,
}) => {
  if (opacity <= 0 || frame < start) return null;
  const PERIOD = 36;
  const WAVES = 4;
  const reveal = prog(frame, start, 15);
  return (
    <g opacity={opacity * reveal}>
      {pts.map((p, i) => {
        const dx = hub.x - p.x;
        const dy = hub.y - p.y;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        const th = Math.atan2(uy, ux);
        const startOff = 34;
        const travel = len - startOff - 60;
        const ring = ((frame - start) % 24) / 24;
        return (
          <g key={i}>
            {boost > 0.01 ? (
              <circle cx={p.x} cy={p.y} r={30 + 26 * ring} fill="none" stroke={COLORS.event} strokeWidth={3} opacity={boost * (1 - ring)} />
            ) : null}
            {Array.from({ length: WAVES }, (_, k) => {
              const u = ((((frame - start) / PERIOD + k / WAVES) % 1) + 1) % 1;
              const d = startOff + u * travel;
              const r = 14 + 6 * boost;
              const cxp = p.x + ux * (d - r);
              const cyp = p.y + uy * (d - r);
              const span = 0.75;
              const a1 = th - span;
              const a2 = th + span;
              const s = { x: cxp + r * Math.cos(a1), y: cyp + r * Math.sin(a1) };
              const e = { x: cxp + r * Math.cos(a2), y: cyp + r * Math.sin(a2) };
              return (
                <path
                  key={k}
                  d={`M ${s.x.toFixed(1)} ${s.y.toFixed(1)} A ${r} ${r} 0 0 1 ${e.x.toFixed(1)} ${e.y.toFixed(1)}`}
                  stroke={COLORS.event}
                  strokeWidth={4.5 + 2 * boost}
                  fill="none"
                  strokeLinecap="round"
                  opacity={Math.sin(u * Math.PI)}
                />
              );
            })}
          </g>
        );
      })}
    </g>
  );
};

// ── the scene ──────────────────────────────────────────────────────────────────────────────────────────
export const S08Hawaii1971: React.FC = () => {
  const frame = useCurrentFrame();

  const tYear = cue(ID, "In nineteen seventy-one");
  const tAbramson = cue(ID, "a team at the University of Hawaii");
  const tTerminals = cue(ID, "connect computer terminals");
  const tHub = cue(ID, "one central computer in Honolulu");
  const tPhone = cue(ID, "Phone lines were expensive");
  const tExpensive = cue(ID, "expensive");
  const tUnreliable = cue(ID, "unreliable");
  const tRadio = cue(ID, "so they used radio");
  const tFreq = cue(ID, "same frequency");
  const tAloha = cue(ID, "They called it Aloha-net");

  // map → ring
  const tMorph = tAloha + 8;
  const MORPH = 48;
  const m = prog(frame, tMorph, MORPH);
  const mapAlpha = fade(frame, 0, 18) * (1 - prog(frame, tMorph, 34));
  const morphDone = frame >= tMorph + MORPH;

  // the hub + terminals on the map
  const hub: Pt = { x: lerp(HONOLULU.x, RING.cx, m), y: lerp(HONOLULU.y, RING.cy, m) };
  const pts = MAP_TERMINALS.map((p, i) => {
    const r = ringPt(i);
    return { x: lerp(p.x, r.x, m), y: lerp(p.y, r.y, m) };
  });
  const termPop = (i: number) => clamp01(pop(frame, tTerminals + 4 + POP_ORDER.indexOf(i) * 6));
  const hubPop = clamp01(pop(frame, tHub));
  const combined = frame >= tPhone; // by then everything has popped: one HubAndTerminals from here on

  // hub highlight in Honolulu
  const hubGlow = fade(frame, tHub, 10, tPhone, 15);
  const pulse = 0.5 + 0.5 * Math.sin((frame - tHub) / 6);

  // radio
  const spokes = prog(frame, tRadio + 4, 20);
  const boost = fade(frame, tFreq - 4, 8, tAloha, 12) * (0.6 + 0.4 * Math.sin((frame - tFreq) / 3));
  const arcAlpha = 1 - prog(frame, tMorph + 10, 30);

  // text
  const capAlpha = fade(frame, tAbramson, 12, tPhone - 10, 15);
  const yearAlpha = 1 - prog(frame, tMorph, 20);
  const freqAlpha = fade(frame, tFreq, 10, tMorph, 18);
  const alohaAlpha = 1 - prog(frame, tMorph + MORPH + 6, 18);

  // own "hub" label during the morph; the real hubLabel takes over (same spot, same style) once the ring is set
  const hubLabelAlpha = prog(frame, tMorph + 16, 24);

  return (
    <SceneFrame id={ID}>
      {/* the map */}
      <Stage opacity={mapAlpha}>
        <MapBase frame={frame} t0={0} />
        <IslandLabels opacity={fade(frame, 30, 15)} />
        <PhoneLines frame={frame} start={tPhone} tagAt={tExpensive} crackleAt={tUnreliable} fadeAt={tRadio} />
        {/* Honolulu glow */}
        <circle cx={HONOLULU.x} cy={HONOLULU.y} r={78 + 8 * pulse} fill={MAP_INK} opacity={0.16 * hubGlow} />
        <circle
          cx={HONOLULU.x}
          cy={HONOLULU.y}
          r={86 + 10 * pulse}
          fill="none"
          stroke={MAP_INK}
          strokeWidth={3}
          opacity={0.6 * hubGlow}
        />
        <text
          x={HONOLULU.x + 6}
          y={HONOLULU.y + 106}
          fill={MAP_INK}
          fontFamily={FONT.sans}
          fontSize={SIZE.label}
          fontWeight={700}
          textAnchor="middle"
          opacity={hubPop * (1 - prog(frame, tMorph, 16))}
        >
          Honolulu
        </text>
      </Stage>

      {/* terminals, hub, radio */}
      <Stage>
        <RadioArcs frame={frame} pts={pts} hub={hub} start={tRadio + 6} boost={boost} opacity={arcAlpha} />
        {combined ? (
          <HubAndTerminals
            cx={morphDone ? RING.cx : hub.x}
            cy={morphDone ? RING.cy : hub.y}
            radius={RING.radius}
            n={RING.n}
            positions={morphDone ? undefined : pts}
            terminal="terminal"
            spokes={spokes}
            hubLabel={morphDone ? "hub" : undefined}
          />
        ) : (
          <>
            {/* separate pieces so each terminal and the hub can pop on its own cue (hub parked off-canvas) */}
            {pts.map((p, i) =>
              termPop(i) > 0 ? (
                <HubAndTerminals key={i} cx={-3000} cy={-3000} positions={[p]} spokes={0} appear={termPop(i)} terminal="terminal" />
              ) : null,
            )}
            {hubPop > 0 ? <HubAndTerminals cx={hub.x} cy={hub.y} positions={[]} appear={hubPop} /> : null}
          </>
        )}
        {!morphDone ? (
          <text
            x={hub.x}
            y={hub.y + 100}
            fill={COLORS.ink}
            fontFamily={FONT.sans}
            fontSize={SIZE.label}
            textAnchor="middle"
            fontWeight={600}
            opacity={hubLabelAlpha}
          >
            hub
          </text>
        ) : null}
      </Stage>

      {/* text */}
      <Stamp x={1090} y={130} start={tYear} color={MAP_INK} size={56} rotate={-5} opacity={yearAlpha}>
        1971
      </Stamp>
      <Label x={64} y={612} anchor="left" size={SIZE.caption} italic color={COLORS.ink} start={tAbramson} opacity={capAlpha}>
        Norman Abramson · University of Hawaiʻi
      </Label>
      <Label x={64} y={612} anchor="left" size={SIZE.caption} weight={700} color={COLORS.event} start={tFreq} opacity={freqAlpha}>
        one shared frequency
      </Label>
      <Stamp x={640} y={78} start={tAloha} color={MAP_INK} size={52} rotate={-4} opacity={alohaAlpha}>
        ALOHAnet
      </Stamp>
    </SceneFrame>
  );
};
