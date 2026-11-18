// Scene 19 — Aloha is everywhere
// Brief: scenes/s19-legacy.md  ·  Shared brief: scenes/README.md  ·  Kit: src/shared/README.md
//
// Beats: Hawaii zooms out to a globe → Metcalfe's desk (ALOHA paper, coax plugged in) + Wi-Fi router tiles →
// back at the bus stop, the Commuter's phone sends its first "hello" burst, which lands in a violet slot by
// the tower → RFID / satellite / IoT tiles → the Commuter looks down the road for the bus (Scene 20).
// Every real-life tile carries a corner badge: a random-arrival dot stream or a slot grid ("same idea").
import React from "react";
import { random, useCurrentFrame } from "remotion";
import {
  BusStopStreet,
  clamp01,
  COLORS,
  Commuter,
  cue,
  EASE,
  fade,
  FONT,
  ILLUS,
  Label,
  lerp,
  Mark,
  narrationEndFrame,
  PacketBar,
  pop,
  prog,
  SceneFrame,
  SlotGrid,
  Stage,
  STREET,
  timeScale,
  useSvgId,
} from "../shared";

/** Extra seconds of picture after the narration tail. The scene length updates automatically. */
export const meta = { extraTail: 1.0 }; // the Commuter turns to look down the road

const ID = "s19" as const;

const T = {
  hawaii: cue(ID, "And Aloha didn't stay in Hawaii"),
  metcalfe: cue(ID, "Bob Metcalfe"),
  ethernet: cue(ID, "create Ethernet"),
  wifi: cue(ID, "Its ideas live on in Wi-Fi"),
  remember: cue(ID, "And remember the phone"),
  reaches: cue(ID, "When it first reaches out"),
  reachesOut: cue(ID, "reaches out", "end"),
  slotted: cue(ID, "a form of slotted Aloha"),
  rfid: cue(ID, "R F I D tags"),
  satellite: cue(ID, "satellite links"),
  sensors: cue(ID, "tiny smart sensors"),
  end: narrationEndFrame(ID),
};

// ── corner badges: the theory icon on every real-life tile ──────────────────────────────────────────
const BADGE = { w: 104, h: 44 };

const DotStreamBadge: React.FC<{ x: number; y: number; frame: number; seed: string }> = ({ x, y, frame, seed }) => {
  // random arrivals drifting left along a line
  const dots = [0, 1, 2, 3, 4].map((i) => random(`${seed}-${i}`));
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={BADGE.w} height={BADGE.h} rx={10} fill={COLORS.bg} stroke={COLORS.faint} strokeWidth={2} />
      <line x1={10} y1={28} x2={BADGE.w - 10} y2={28} stroke={COLORS.muted} strokeWidth={2} />
      {dots.map((d, i) => {
        const u = (d + frame / 140) % 1;
        return <circle key={i} cx={BADGE.w - 12 - u * (BADGE.w - 24)} cy={20} r={4.5} fill={COLORS.event} />;
      })}
    </g>
  );
};

const SlotBadge: React.FC<{ x: number; y: number; frame: number; seed: string }> = ({ x, y, frame, seed }) => {
  const n = 5;
  const sw = (BADGE.w - 20) / n;
  const hit = Math.floor(((frame / 24 + random(seed) * n) % n));
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={BADGE.w} height={BADGE.h} rx={10} fill={COLORS.bg} stroke={COLORS.faint} strokeWidth={2} />
      {Array.from({ length: n + 1 }, (_, i) => (
        <line key={i} x1={10 + i * sw} y1={9} x2={10 + i * sw} y2={BADGE.h - 9} stroke={COLORS.slotted} strokeWidth={2} />
      ))}
      <rect x={10 + hit * sw + 2.5} y={15} width={sw - 5} height={BADGE.h - 30} rx={3} fill={COLORS.event} />
    </g>
  );
};

/** A rounded real-life tile with clipped contents (local coords 0..w × 0..h) and a corner badge. */
const Tile: React.FC<{
  cx: number;
  cy: number;
  w: number;
  h: number;
  start: number;
  frame: number;
  out?: number;
  badge: "dots" | "slots";
  ground?: string;
  children: React.ReactNode;
}> = ({ cx, cy, w, h, start, frame, out, badge, ground = COLORS.panel, children }) => {
  const clip = useSvgId("tile");
  const s = Math.min(1.04, pop(frame, start));
  const o = fade(frame, start, 8, out, 12);
  if (o <= 0) return null;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${0.85 + 0.15 * s}) translate(${-w / 2} ${-h / 2})`} opacity={o}>
      <defs>
        <clipPath id={clip}>
          <rect width={w} height={h} rx={22} />
        </clipPath>
      </defs>
      <rect x={6} y={10} width={w} height={h} rx={22} fill="#000" opacity={0.3} />
      <g clipPath={`url(#${clip})`}>
        <rect width={w} height={h} fill={ground} />
        {children}
      </g>
      <rect width={w} height={h} rx={22} fill="none" stroke={COLORS.faint} strokeWidth={3} />
      {badge === "dots" ? (
        <DotStreamBadge x={w - BADGE.w - 14} y={14} frame={frame} seed={`${clip}-b`} />
      ) : (
        <SlotBadge x={w - BADGE.w - 14} y={14} frame={frame} seed={`${clip}-b`} />
      )}
    </g>
  );
};

// ── 1 · Hawaii → globe ───────────────────────────────────────────────────────────────────────────────
const GLOBE = { x: 640, y: 350, r: 230 };
const HAWAII = { x: 560, y: 330 }; // where the islands sit on the globe
const CALIFORNIA = { x: 742, y: 262 };
// main islands, west → east (globe px, relative to HAWAII): Kauai, Oahu, Molokai, Maui, Big Island
const ISLANDS = [
  { dx: -14, dy: -6, rx: 2.0, ry: 1.7, rot: 0 },
  { dx: -7.5, dy: -3.6, rx: 2.0, ry: 1.4, rot: -30 },
  { dx: -2.6, dy: -2.2, rx: 2.2, ry: 0.7, rot: -8 },
  { dx: 1.6, dy: -0.4, rx: 2.0, ry: 1.4, rot: 20 },
  { dx: 7, dy: 5.6, rx: 3.8, ry: 3.6, rot: 10 },
];

const Globe: React.FC<{ frame: number }> = ({ frame }) => {
  const clip = useSvgId("globe");
  const zoom = lerp(16, 1, prog(frame, 6, 46, EASE));
  const grid = prog(frame, 30, 20);
  const arc = prog(frame, T.hawaii + 34, 30);
  const leave = prog(frame, T.metcalfe - 6, 16);
  // keep Hawaii at screen centre while zoomed in, the globe at centre when zoomed out
  const focus = { x: lerp(GLOBE.x, HAWAII.x, (zoom - 1) / 15), y: lerp(GLOBE.y, HAWAII.y, (zoom - 1) / 15) };
  const ctrl = { x: (HAWAII.x + CALIFORNIA.x) / 2, y: Math.min(HAWAII.y, CALIFORNIA.y) - 90 };
  const q = (t: number) => ({
    x: (1 - t) * (1 - t) * HAWAII.x + 2 * (1 - t) * t * ctrl.x + t * t * CALIFORNIA.x,
    y: (1 - t) * (1 - t) * HAWAII.y + 2 * (1 - t) * t * ctrl.y + t * t * CALIFORNIA.y,
  });
  const dot = q(EASE(arc));
  return (
    <g opacity={1 - leave} transform={`translate(640 360) scale(${zoom * (1 - 0.3 * leave)}) translate(${-focus.x} ${-focus.y})`}>
      <defs>
        <clipPath id={clip}>
          <circle cx={GLOBE.x} cy={GLOBE.y} r={GLOBE.r} />
        </clipPath>
      </defs>
      <circle cx={GLOBE.x} cy={GLOBE.y} r={GLOBE.r} fill={ILLUS.ocean} />
      <g clipPath={`url(#${clip})`}>
        {/* rough continents around the Pacific: Asia/Australia left, the Americas right */}
        <path d="M 410 140 C 470 150, 480 210, 455 250 C 440 280, 445 330, 420 360 L 390 360 L 380 140 Z" fill={ILLUS.land} />
        <path d="M 430 470 C 470 455, 500 480, 490 520 C 470 545, 430 540, 420 510 Z" fill={ILLUS.land} />
        <path d="M 700 130 C 760 120, 830 150, 860 200 L 880 360 C 840 360, 790 330, 770 300 C 750 280, 745 240, 735 220 C 720 190, 690 160, 700 130 Z" fill={ILLUS.land} />
        <path d="M 790 380 C 820 390, 850 420, 840 480 C 830 530, 810 560, 800 580 L 880 580 L 880 380 Z" fill={ILLUS.land} />
        {/* latitude / longitude lines fade in as it becomes a globe */}
        <g opacity={0.35 * grid} stroke={COLORS.muted} strokeWidth={1.2 / zoom + 0.4} fill="none">
          {[-0.6, -0.3, 0, 0.3, 0.6].map((k) => (
            <ellipse key={`m${k}`} cx={GLOBE.x} cy={GLOBE.y} rx={Math.abs(k) * GLOBE.r + 0.5} ry={GLOBE.r} />
          ))}
          {[-0.66, -0.33, 0, 0.33, 0.66].map((k) => (
            <line key={`p${k}`} x1={GLOBE.x - GLOBE.r} y1={GLOBE.y + k * GLOBE.r} x2={GLOBE.x + GLOBE.r} y2={GLOBE.y + k * GLOBE.r} />
          ))}
        </g>
        {ISLANDS.map((s, i) => (
          <g key={i} transform={`translate(${HAWAII.x + s.dx} ${HAWAII.y + s.dy}) rotate(${s.rot})`}>
            <ellipse rx={s.rx + 0.5} ry={s.ry + 0.5} fill={ILLUS.sand} />
            <ellipse rx={s.rx} ry={s.ry} fill={ILLUS.land} />
          </g>
        ))}
      </g>
      <circle cx={GLOBE.x} cy={GLOBE.y} r={GLOBE.r} fill="none" stroke={COLORS.faint} strokeWidth={3 / zoom} />
      {/* the idea travels to California */}
      {arc > 0 ? (
        <g>
          <path
            d={`M ${HAWAII.x} ${HAWAII.y} Q ${ctrl.x} ${ctrl.y} ${CALIFORNIA.x} ${CALIFORNIA.y}`}
            pathLength={100}
            strokeDasharray={`${100 * EASE(arc)} 100`}
            stroke={COLORS.ink}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            opacity={0.8}
          />
          <circle cx={dot.x} cy={dot.y} r={6} fill={COLORS.event} />
          <circle cx={CALIFORNIA.x} cy={CALIFORNIA.y} r={5} fill={COLORS.ink} opacity={clamp01((arc - 0.9) * 10)} />
        </g>
      ) : null}
    </g>
  );
};

// ── 2 · Metcalfe's desk and the Wi-Fi router ─────────────────────────────────────────────────────────
const TILE2 = { w: 540, h: 380 };

const MetcalfeDesk: React.FC<{ frame: number }> = ({ frame }) => {
  const plug = prog(frame, T.ethernet - 26, 22, EASE);
  const jack = { x: 330, y: 266 }; // socket on the back of the terminal
  const conn = { x: lerp(jack.x + 70, jack.x + 18, plug), y: jack.y };
  const flow = Math.max(0, frame - (T.ethernet - 2));
  return (
    <g>
      {/* 1970s office: wall panelling, corkboard with the ALOHA paper */}
      <rect width={TILE2.w} height={TILE2.h} fill="#3a3346" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={i * 46} y={0} width={2} height={270} fill="#000" opacity={0.15} />
      ))}
      <rect x={34} y={42} width={170} height={190} rx={6} fill="#7c5a3a" />
      <g transform="translate(58 58) rotate(-3)">
        <rect width={124} height={158} rx={3} fill="#f5f5f4" />
        <text x={62} y={34} fill="#0b1220" fontFamily={FONT.sans} fontWeight={900} fontSize={24} textAnchor="middle" letterSpacing="0.06em">
          ALOHA
        </text>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={14} y={50 + i * 12} width={i === 4 ? 60 : 96} height={4} rx={2} fill="#a8a29e" />
        ))}
        {/* a tiny hub-and-terminals sketch */}
        <g transform="translate(62 128)" stroke="#57534e" strokeWidth={1.6} fill="none">
          <circle r={5} fill="#57534e" />
          {[-150, -100, -30, 20].map((a) => (
            <line key={a} x1={0} y1={0} x2={Math.cos((a * Math.PI) / 180) * 30} y2={Math.sin((a * Math.PI) / 180) * 18} />
          ))}
        </g>
        <circle cx={62} cy={4} r={5} fill={COLORS.collision} />
      </g>
      {/* desk */}
      <rect x={0} y={292} width={TILE2.w} height={20} fill={ILLUS.wood} />
      <rect x={0} y={312} width={TILE2.w} height={80} fill="#5b3a12" />
      {/* terminal */}
      <rect x={250} y={112} width={210} height={180} rx={18} fill="#d6c08f" />
      <rect x={270} y={130} width={170} height={120} rx={14} fill="#0b1220" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={286} y={148 + i * 22} width={i === 3 ? 60 : 120} height={8} rx={3} fill={COLORS.success} opacity={0.55} />
      ))}
      <rect x={300} y={262} width={110} height={18} rx={4} fill="#b9a374" />
      <rect x={230} y={292} width={250} height={0} />
      {/* socket */}
      <rect x={jack.x - 4} y={jack.y - 12} width={24} height={24} rx={4} fill="#57534e" />
      {/* coax cable + BNC plug */}
      <path
        d={`M ${TILE2.w + 10} ${TILE2.h - 40} C ${TILE2.w - 80} ${TILE2.h - 30}, ${conn.x + 120} ${conn.y + 40}, ${conn.x + 26} ${conn.y}`}
        stroke="#111827"
        strokeWidth={11}
        fill="none"
        strokeLinecap="round"
      />
      <rect x={conn.x} y={conn.y - 10} width={30} height={20} rx={4} fill={ILLUS.metal} />
      <rect x={conn.x - 6} y={conn.y - 6} width={8} height={12} rx={2} fill="#cbd5e1" />
      {/* data starts flowing once it's plugged in */}
      {flow > 0
        ? [0, 1, 2].map((k) => {
            const u = ((flow / 30 + k / 3) % 1);
            const t = 1 - u;
            const p0 = { x: TILE2.w + 10, y: TILE2.h - 40 };
            const p1 = { x: TILE2.w - 80, y: TILE2.h - 30 };
            const p2 = { x: conn.x + 120, y: conn.y + 40 };
            const p3 = { x: conn.x + 26, y: conn.y };
            const b = (a: number, b1: number, c: number, d: number) =>
              (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b1 + 3 * (1 - t) * t * t * c + t ** 3 * d;
            return <circle key={k} cx={b(p0.x, p1.x, p2.x, p3.x)} cy={b(p0.y, p1.y, p2.y, p3.y)} r={5} fill={COLORS.event} opacity={clamp01(flow / 8)} />;
          })
        : null}
    </g>
  );
};

const RouterRoom: React.FC<{ frame: number }> = ({ frame }) => {
  const r = { x: 270, y: 250 };
  return (
    <g>
      <rect width={TILE2.w} height={TILE2.h} fill="#1b2740" />
      <rect x={0} y={290} width={TILE2.w} height={90} fill="#334155" />
      <rect x={0} y={290} width={TILE2.w} height={6} fill="#475569" />
      {/* Wi-Fi arcs */}
      {[0, 1, 2].map((k) => {
        const u = (frame / 40 + k / 3) % 1;
        const rad = 40 + u * 120;
        return (
          <path
            key={k}
            d={`M ${r.x - rad * 0.8} ${r.y - 30 - rad * 0.55} A ${rad} ${rad} 0 0 1 ${r.x + rad * 0.8} ${r.y - 30 - rad * 0.55}`}
            stroke={COLORS.event}
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
            opacity={(1 - u) * 0.8}
          />
        );
      })}
      {/* router */}
      <rect x={r.x - 14 - 70} y={r.y - 90} width={8} height={62} rx={4} fill="#0b1220" transform={`rotate(-12 ${r.x - 80} ${r.y - 30})`} />
      <rect x={r.x + 76} y={r.y - 90} width={8} height={62} rx={4} fill="#0b1220" transform={`rotate(12 ${r.x + 80} ${r.y - 30})`} />
      <rect x={r.x - 95} y={r.y - 32} width={190} height={50} rx={12} fill="#0b1220" />
      <rect x={r.x - 95} y={r.y - 32} width={190} height={10} rx={5} fill="#1f2937" />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={r.x - 60 + i * 22} cy={r.y + 2} r={4} fill={COLORS.ink} opacity={0.4 + 0.6 * ((Math.floor(frame / 6) + i) % 3 === 0 ? 1 : 0)} />
      ))}
      {/* laptop */}
      <g transform="translate(70 290)">
        <path d="M 0 0 L 110 0 L 120 8 L -10 8 Z" fill="#64748b" />
        <rect x={6} y={-74} width={98} height={72} rx={6} fill="#475569" />
        <rect x={13} y={-67} width={84} height={58} rx={3} fill="#0f172a" />
        <rect x={22} y={-56} width={50} height={6} rx={3} fill={COLORS.muted} opacity={0.6} />
      </g>
      {/* phones */}
      {[400, 460].map((x, i) => (
        <g key={x} transform={`translate(${x} ${290 - 2}) rotate(${i ? 8 : -6})`}>
          <rect x={-16} y={-58} width={32} height={58} rx={6} fill="#0b1220" />
          <rect x={-12} y={-53} width={24} height={46} rx={3} fill={COLORS.event} opacity={0.35} />
        </g>
      ))}
    </g>
  );
};

// ── 4 · RFID, satellite, IoT sensors ────────────────────────────────────────────────────────────────
const TILE3 = { w: 360, h: 300 };

const RfidGate: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <rect width={TILE3.w} height={TILE3.h} fill="#1b2740" />
    <rect x={0} y={240} width={TILE3.w} height={60} fill="#334155" />
    {/* the gate pillars */}
    {[70, 290].map((x) => (
      <g key={x}>
        <rect x={x - 14} y={70} width={28} height={180} rx={12} fill="#cbd5e1" opacity={0.85} />
        <rect x={x - 6} y={86} width={12} height={150} rx={6} fill="#64748b" />
      </g>
    ))}
    {/* tagged items in a basket between the pillars: every tag answers the gate at once */}
    <path d="M 120 196 L 240 196 L 228 246 L 132 246 Z" fill="#475569" />
    {[
      { x: 138, y: 150, r: -10 },
      { x: 180, y: 136, r: 6 },
      { x: 222, y: 152, r: 14 },
      { x: 160, y: 176, r: -4 },
      { x: 204, y: 180, r: 8 },
    ].map((t, i) => {
      const u = (frame / 26 + i * 0.37) % 1;
      return (
        <g key={i} transform={`translate(${t.x} ${t.y}) rotate(${t.r})`}>
          <rect x={-20} y={-13} width={40} height={26} rx={4} fill="#f5f5f4" />
          <rect x={-14} y={-8} width={28} height={16} rx={3} fill="none" stroke="#a16207" strokeWidth={2} />
          <rect x={-4} y={-4} width={8} height={8} fill="#0b1220" />
          <circle r={14 + u * 30} fill="none" stroke={COLORS.event} strokeWidth={2.5} opacity={(1 - u) * 0.8} />
        </g>
      );
    })}
  </g>
);

const SatelliteLink: React.FC<{ frame: number }> = ({ frame }) => {
  const sat = { x: 230, y: 92 };
  const dish = { x: 92, y: 226 };
  const u = (frame / 32) % 1;
  return (
    <g>
      <rect width={TILE3.w} height={TILE3.h} fill="#0b1226" />
      {Array.from({ length: 22 }, (_, i) => (
        <circle key={i} cx={random(`s19-st-x${i}`) * TILE3.w} cy={random(`s19-st-y${i}`) * 200} r={1.2 + random(`s19-st-r${i}`) * 1.4} fill="#e2e8f0" opacity={0.6} />
      ))}
      <rect x={0} y={250} width={TILE3.w} height={50} fill={ILLUS.land} />
      {/* beam */}
      <line x1={dish.x + 18} y1={dish.y - 30} x2={sat.x} y2={sat.y} stroke={COLORS.muted} strokeWidth={2} strokeDasharray="6 8" />
      <circle cx={lerp(dish.x + 18, sat.x, u)} cy={lerp(dish.y - 30, sat.y, u)} r={6} fill={COLORS.event} />
      {/* satellite */}
      <g transform={`translate(${sat.x} ${sat.y}) rotate(-20)`}>
        <rect x={-74} y={-14} width={50} height={28} fill="#1e3a8a" stroke="#cbd5e1" strokeWidth={2} />
        <rect x={24} y={-14} width={50} height={28} fill="#1e3a8a" stroke="#cbd5e1" strokeWidth={2} />
        <line x1={-24} y1={0} x2={24} y2={0} stroke="#cbd5e1" strokeWidth={3} />
        <rect x={-16} y={-20} width={32} height={40} rx={6} fill="#cbd5e1" />
        <rect x={-10} y={-12} width={20} height={10} rx={2} fill="#64748b" />
      </g>
      {/* dish */}
      <g transform={`translate(${dish.x} ${dish.y})`}>
        <rect x={-6} y={0} width={12} height={28} fill="#94a3b8" />
        <path d="M -34 -14 Q 0 30 46 -36 Z" fill="#e2e8f0" transform="rotate(-8)" />
        <line x1={6} y1={-10} x2={20} y2={-32} stroke="#94a3b8" strokeWidth={3} />
        <circle cx={20} cy={-32} r={4} fill="#64748b" />
      </g>
    </g>
  );
};

const FenceSensor: React.FC<{ frame: number }> = ({ frame }) => {
  const box = { x: 196, y: 128 };
  const u = (frame / 34) % 1;
  return (
    <g>
      <rect width={TILE3.w} height={TILE3.h} fill="#16213a" />
      <circle cx={70} cy={70} r={22} fill="#fde68a" opacity={0.85} />
      <rect x={0} y={214} width={TILE3.w} height={86} fill={ILLUS.land} />
      {/* fence */}
      {[40, 196, 340].map((x) => (
        <rect key={x} x={x - 8} y={118} width={16} height={130} rx={3} fill={ILLUS.wood} />
      ))}
      {[150, 190].map((y) => (
        <rect key={y} x={0} y={y} width={TILE3.w} height={12} rx={3} fill="#854d0e" />
      ))}
      {/* the sensor box with its little antenna */}
      <rect x={box.x - 24} y={box.y - 10} width={48} height={40} rx={7} fill="#e2e8f0" />
      <line x1={box.x + 14} y1={box.y - 10} x2={box.x + 14} y2={box.y - 36} stroke="#0b1220" strokeWidth={3} strokeLinecap="round" />
      <circle cx={box.x - 10} cy={box.y + 4} r={4} fill={COLORS.success} opacity={Math.floor(frame / 10) % 2 ? 1 : 0.35} />
      {/* an occasional tiny reading, sent whenever */}
      <path
        d={`M ${box.x + 14 - 10 - u * 40} ${box.y - 44 - u * 20} Q ${box.x + 14} ${box.y - 60 - u * 40} ${box.x + 14 + 10 + u * 40} ${box.y - 44 - u * 20}`}
        stroke={COLORS.event}
        strokeWidth={3}
        fill="none"
        opacity={(1 - u) * 0.9}
      />
    </g>
  );
};

// ── 3 · the bus stop: the phone's first "hello" lands in a slot ─────────────────────────────────────
const MINI = { x0: 830, x1: 1070, y: 132, h: 54 };
const miniScale = timeScale(0, 5, MINI.x0, MINI.x1);
const LAND_SLOT = 3;
const PHONE_AT = { x: STREET.commuter.x + 44, y: STREET.commuter.y - 152 };

const HelloBurst: React.FC<{ frame: number }> = ({ frame }) => {
  const gridIn = prog(frame, T.reaches + 6, 22);
  const fly = prog(frame, T.reachesOut, 28, EASE);
  const landedAt = T.reachesOut + 28;
  const landed = frame >= landedAt;
  const deliver = prog(frame, T.slotted + 18, 12);
  const panelOp = fade(frame, T.reaches + 2, 10, T.rfid - 10, 10);
  const target = { x: miniScale(LAND_SLOT + 0.5), y: MINI.y };
  const ctrl = { x: (PHONE_AT.x + target.x) / 2 - 60, y: Math.min(PHONE_AT.y, target.y) - 120 };
  const t = fly;
  const pos = {
    x: (1 - t) ** 2 * PHONE_AT.x + 2 * (1 - t) * t * ctrl.x + t * t * target.x,
    y: (1 - t) ** 2 * PHONE_AT.y + 2 * (1 - t) * t * ctrl.y + t * t * target.y,
  };
  if (panelOp <= 0) return null;
  return (
    <g opacity={panelOp}>
      <rect x={MINI.x0 - 18} y={MINI.y - MINI.h / 2 - 16} width={MINI.x1 - MINI.x0 + 36} height={MINI.h + 32} rx={14} fill={COLORS.panel} stroke={COLORS.faint} strokeWidth={2} />
      <line x1={MINI.x0} y1={MINI.y + MINI.h / 2} x2={MINI.x1} y2={MINI.y + MINI.h / 2} stroke={COLORS.muted} strokeWidth={2} opacity={gridIn} />
      <SlotGrid scale={miniScale} y1={MINI.y - MINI.h / 2} y2={MINI.y + MINI.h / 2} progress={gridIn} />
      {/* the burst: a little radio pulse that becomes a packet exactly one slot wide */}
      {fly > 0 && !landed ? (
        <g>
          <circle cx={pos.x} cy={pos.y} r={9} fill={COLORS.event} />
          <circle cx={pos.x} cy={pos.y} r={9 + ((frame % 10) / 10) * 14} fill="none" stroke={COLORS.event} strokeWidth={2} opacity={1 - (frame % 10) / 10} />
        </g>
      ) : null}
      {landed ? (
        <PacketBar
          scale={miniScale}
          start={LAND_SLOT}
          y={MINI.y}
          h={32}
          state="attempt"
          toState="success"
          mix={deliver}
          opacity={Math.min(1, pop(frame, landedAt))}
        />
      ) : null}
      {deliver > 0 ? <Mark x={MINI.x1 + 52} y={MINI.y} kind="check" size={34} progress={deliver} /> : null}
    </g>
  );
};

// ── the scene ────────────────────────────────────────────────────────────────────────────────────────
export const S19Legacy: React.FC = () => {
  const frame = useCurrentFrame();

  // fades in from the background left by Scene 18's Part 8 sting
  const globeOp = prog(frame, 0, 12) * (1 - prog(frame, T.metcalfe + 8, 10));
  const tilesOut = T.remember - 14;
  const streetOp = prog(frame, T.remember - 12, 14);
  const montageOut = T.end - 6;
  const dim = 0.62 * prog(frame, T.rfid - 8, 12) * (1 - prog(frame, montageOut, 14));
  const wake = prog(frame, T.reaches, 10);
  const lookDownRoad = frame >= montageOut + 8;

  return (
    <SceneFrame id={ID}>
      {/* 1 · Hawaii → globe */}
      {globeOp > 0 ? (
        <Stage opacity={globeOp}>
          <Globe frame={frame} />
        </Stage>
      ) : null}

      {/* 2 · Ethernet and Wi-Fi */}
      <Stage>
        <Tile cx={340} cy={320} {...TILE2} start={T.metcalfe} frame={frame} out={tilesOut} badge="dots">
          <MetcalfeDesk frame={frame} />
        </Tile>
        <Tile cx={940} cy={320} {...TILE2} start={T.wifi} frame={frame} out={tilesOut} badge="dots">
          <RouterRoom frame={frame} />
        </Tile>
      </Stage>
      <Label x={340} y={556} size={28} italic color={COLORS.ink} start={T.metcalfe + 10} opacity={1 - prog(frame, tilesOut, 12)}>
        Bob Metcalfe · Ethernet, 1973
      </Label>
      <Label x={940} y={556} size={34} weight={800} color={COLORS.ink} start={T.wifi + 4} opacity={1 - prog(frame, tilesOut, 12)}>
        Wi-Fi
      </Label>

      {/* 3 · back at the bus stop */}
      {streetOp > 0 ? (
        <Stage opacity={streetOp}>
          <BusStopStreet towerRipples={prog(frame, T.slotted + 22, 10) * (1 - prog(frame, T.rfid, 10))} dim={dim}>
            <Commuter
              x={STREET.commuter.x}
              y={STREET.commuter.y}
              pose={lookDownRoad ? "stand" : "phone"}
              facing={lookDownRoad ? -1 : 1}
              phoneGlow={lerp(0.35, 1, wake)}
              buzz={wake * (1 - prog(frame, T.reaches + 16, 8))}
            />
          </BusStopStreet>
          <HelloBurst frame={frame} />
        </Stage>
      ) : null}
      <Label
        x={(MINI.x0 + MINI.x1) / 2}
        y={MINI.y + 70}
        size={26}
        italic
        weight={600}
        color={COLORS.slotted}
        start={T.slotted}
        opacity={1 - prog(frame, T.rfid - 10, 10)}
        style={{ textShadow: `0 2px 8px ${COLORS.bg}` }}
      >
        random access: slotted Aloha
      </Label>

      {/* 4 · the montage */}
      <Stage>
        <Tile cx={230} cy={320} {...TILE3} start={T.rfid} frame={frame} out={montageOut} badge="slots">
          <RfidGate frame={frame} />
        </Tile>
        <Tile cx={640} cy={320} {...TILE3} start={T.satellite} frame={frame} out={montageOut} badge="dots">
          <SatelliteLink frame={frame} />
        </Tile>
        <Tile cx={1050} cy={320} {...TILE3} start={T.sensors} frame={frame} out={montageOut} badge="dots">
          <FenceSensor frame={frame} />
        </Tile>
      </Stage>
      {[
        { x: 230, text: "RFID", t: T.rfid },
        { x: 640, text: "satellite", t: T.satellite },
        { x: 1050, text: "IoT sensors", t: T.sensors },
      ].map((l) => (
        <Label key={l.text} x={l.x} y={508} size={32} weight={800} start={l.t + 4} opacity={1 - prog(frame, montageOut, 12)}>
          {l.text}
        </Label>
      ))}
    </SceneFrame>
  );
};
