// The bus-stop street at dusk: the video's home set (Scenes 01–05, 07, 11, 14, 17, 19, 20).
// Layers, back to front: sky + buildings + rooftop tower + coffee shop + road → `road` slot (the Bus) →
// near sidewalk + shelter + sign → `children` (people) → rain → dim overlay.
//
// Place things with the STREET constants so every scene uses the same geography.
import React from "react";
import { random, useCurrentFrame } from "remotion";
import { COLORS, FONT, H, ILLUS, W } from "../theme";
import { clamp01 } from "../motion";
import { CellTower } from "./Props";
import { useSvgId } from "../diagram/Stage";

export const STREET = {
  horizonY: 430,
  roadTop: 452,
  roadBottom: 578,
  /** Bus `y` (road level) and the bus centre when it is stopped at the shelter. */
  busY: 566,
  busStopX: 760,
  /** Off-screen bus positions for driving in/out (facing right). */
  busEnterX: -260,
  busExitX: 1540,
  /** Feet line for people on the near sidewalk. */
  sidewalkY: 688,
  /** The Commuter's spot under the shelter. */
  commuter: { x: 930, y: 688 },
  shelter: { x1: 790, x2: 1090, roofY: 418 },
  /** The shelter's glass panel and where the Scene 01 raindrop hits it. */
  glass: { x: 820, y: 446, w: 240, h: 196 },
  glassDrop: { x: 1030, y: 470 },
  /** Rooftop cell tower: base position, and its top (for radio waves from/to phones). */
  tower: { x: 1180, y: 196, scale: 0.8 },
  towerTop: { x: 1180, y: 60 },
  coffeeDoor: { x: 300, y: 430 },
  sign: { x: 1150, y: 404 },
} as const;

const BUILDINGS = Array.from({ length: 12 }, (_, i) => {
  const w = 90 + random(`bw-${i}`) * 80;
  return { w, h: 140 + random(`bh-${i}`) * 170 };
}).reduce<{ x: number; w: number; h: number }[]>((acc, b) => {
  const x = acc.length ? acc[acc.length - 1].x + acc[acc.length - 1].w + 4 : -20;
  acc.push({ x, ...b });
  return acc;
}, []);

export type BusStopStreetProps = {
  /** Rain intensity 0..1. */
  rain?: number;
  /** The Scene 01 raindrop on the shelter glass: 0..1 (impact at ~0.15, then runs down). */
  glassDrop?: number;
  /** Radio ripples from the rooftop tower: intensity 0..1 (animated automatically). */
  towerRipples?: number;
  /** Darken everything (e.g. while the street slides away): 0..1. */
  dim?: number;
  /** The bus (or anything driving on the road), drawn behind the shelter. */
  road?: React.ReactNode;
  /** People and foreground props, drawn in front of the shelter. */
  children?: React.ReactNode;
  opacity?: number;
};

export const BusStopStreet: React.FC<BusStopStreetProps> = ({
  rain = 0,
  glassDrop,
  towerRipples = 0,
  dim = 0,
  road,
  children,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const skyId = useSvgId("sky");
  const S = STREET;
  return (
    <g opacity={opacity}>
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1226" />
          <stop offset="1" stopColor={ILLUS.skyLow} />
        </linearGradient>
      </defs>
      {/* sky + skyline */}
      <rect x={0} y={0} width={W} height={S.horizonY} fill={`url(#${skyId})`} />
      {BUILDINGS.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={S.horizonY - b.h} width={b.w} height={b.h} fill={i % 2 ? ILLUS.building : ILLUS.buildingHi} />
          {Array.from({ length: Math.floor(b.h / 34) }, (_, r) =>
            Array.from({ length: Math.floor(b.w / 30) }, (_, c) => (
              <rect
                key={`${r}-${c}`}
                x={b.x + 12 + c * 30}
                y={S.horizonY - b.h + 14 + r * 34}
                width={14}
                height={18}
                rx={2}
                fill={random(`win-${i}-${r}-${c}`) > 0.72 ? ILLUS.windowLit : ILLUS.windowDark}
                opacity={random(`win-${i}-${r}-${c}`) > 0.72 ? 0.75 : 1}
              />
            )),
          )}
        </g>
      ))}
      {/* the building that carries the cell tower */}
      <rect x={1090} y={S.tower.y} width={190} height={S.horizonY - S.tower.y} fill={ILLUS.buildingHi} />
      <CellTower x={S.tower.x} y={S.tower.y} scale={S.tower.scale} emit={(frame / 45) % 1} ripples={towerRipples} />

      {/* coffee shop across the street */}
      <g>
        <rect x={150} y={296} width={300} height={134} fill="#2b2433" />
        <path
          d={`M 140 300 H 460 L 444 336 H 156 Z`}
          fill="#7c2d12"
        />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <path key={i} d={`M ${156 + i * 36} 336 L ${160 + i * 36} 300 H ${178 + i * 36} L ${174 + i * 36} 336 Z`} fill="#e7e5e4" opacity={0.85} />
        ))}
        <rect x={172} y={350} width={160} height={70} rx={4} fill={ILLUS.windowLit} opacity={0.55} />
        <rect x={350} y={350} width={64} height={80} rx={3} fill="#1b1520" />
        <circle cx={360} cy={392} r={3} fill={COLORS.bus} />
        <text x={300} y={290} fill="#fde68a" fontFamily={FONT.sans} fontWeight={800} fontSize={22} textAnchor="middle" letterSpacing="0.2em">
          COFFEE
        </text>
      </g>

      {/* far sidewalk + road */}
      <rect x={0} y={S.horizonY} width={W} height={S.roadTop - S.horizonY} fill={ILLUS.sidewalk} />
      <rect x={0} y={S.roadTop} width={W} height={S.roadBottom - S.roadTop} fill={ILLUS.road} />
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={i * 100 + 10} y={(S.roadTop + S.roadBottom) / 2 - 3} width={56} height={6} rx={3} fill={ILLUS.roadLine} opacity={0.6} />
      ))}

      {road}

      {/* near curb + sidewalk */}
      <rect x={0} y={S.roadBottom} width={W} height={10} fill="#3b475c" />
      <rect x={0} y={S.roadBottom + 10} width={W} height={H - S.roadBottom - 10} fill={ILLUS.sidewalk} />

      {/* shelter */}
      <g>
        <rect x={S.glass.x} y={S.glass.y} width={S.glass.w} height={S.glass.h} rx={6} fill={ILLUS.glass} stroke="#cbd5e1" strokeOpacity={0.35} strokeWidth={3} />
        <path d={`M ${S.glass.x + 30} ${S.glass.y + 150} L ${S.glass.x + 110} ${S.glass.y + 20}`} stroke="#ffffff" strokeOpacity={0.12} strokeWidth={14} />
        <rect x={S.shelter.x1} y={S.shelter.roofY} width={S.shelter.x2 - S.shelter.x1} height={22} rx={8} fill="#475569" />
        <rect x={S.shelter.x1 + 10} y={S.shelter.roofY + 22} width={10} height={S.sidewalkY - S.shelter.roofY - 22} fill={ILLUS.metal} />
        <rect x={S.shelter.x2 - 20} y={S.shelter.roofY + 22} width={10} height={S.sidewalkY - S.shelter.roofY - 22} fill={ILLUS.metal} />
        <rect x={860} y={606} width={170} height={12} rx={4} fill={ILLUS.wood} />
        <rect x={872} y={618} width={8} height={S.sidewalkY - 618} fill="#64748b" />
        <rect x={1010} y={618} width={8} height={S.sidewalkY - 618} fill="#64748b" />
      </g>
      {/* route sign */}
      <g>
        <rect x={S.sign.x - 4} y={S.sign.y} width={8} height={S.sidewalkY - S.sign.y} fill={ILLUS.metal} />
        <circle cx={S.sign.x} cy={S.sign.y} r={32} fill={COLORS.bus} stroke="#0b1220" strokeWidth={4} />
        <text x={S.sign.x} y={S.sign.y + 12} fill="#0b1220" fontFamily={FONT.sans} fontWeight={900} fontSize={32} textAnchor="middle">
          10
        </text>
        <rect x={S.sign.x - 26} y={S.sign.y + 40} width={52} height={20} rx={4} fill="#0b1220" />
        <text x={S.sign.x} y={S.sign.y + 56} fill={COLORS.ink} fontFamily={FONT.sans} fontWeight={700} fontSize={13} textAnchor="middle">
          BUS
        </text>
      </g>

      {children}

      {/* the Scene 01 raindrop: impact ring, then a trail running down the glass */}
      {glassDrop !== undefined && glassDrop > 0 ? (() => {
        const p = clamp01(glassDrop);
        const fall = clamp01(p / 0.15);
        const run = clamp01((p - 0.15) / 0.85);
        const gx = S.glassDrop.x;
        const gy = S.glassDrop.y;
        return (
          <g>
            {fall < 1 ? <line x1={gx} y1={gy - 80 + fall * 80 - 18} x2={gx} y2={gy - 80 + fall * 80} stroke="#bfdbfe" strokeWidth={3} strokeLinecap="round" /> : null}
            {fall >= 1 ? <circle cx={gx} cy={gy} r={6 + run * 22} fill="none" stroke="#bfdbfe" strokeWidth={2} opacity={1 - clamp01(run * 3)} /> : null}
            {fall >= 1 ? (
              <>
                <path d={`M ${gx} ${gy} Q ${gx - 6} ${gy + run * 60} ${gx - 2} ${gy + run * 130}`} stroke="#bfdbfe" strokeOpacity={0.55} strokeWidth={4} fill="none" strokeLinecap="round" />
                <circle cx={gx - 2} cy={gy + run * 130} r={5} fill="#dbeafe" />
              </>
            ) : null}
          </g>
        );
      })() : null}

      {/* rain */}
      {rain > 0
        ? Array.from({ length: 110 }, (_, i) => {
            const x0 = random(`rx-${i}`) * (W + 200) - 100;
            const speed = 18 + random(`rs-${i}`) * 10;
            const yy = ((frame * speed + random(`ry-${i}`) * 800) % 800) - 60;
            return (
              <line
                key={i}
                x1={x0 + yy * 0.12}
                y1={yy}
                x2={x0 + yy * 0.12 + 3}
                y2={yy + 20}
                stroke="#bfdbfe"
                strokeWidth={1.6}
                opacity={0.35 * clamp01(rain)}
              />
            );
          })
        : null}

      {dim > 0 ? <rect x={0} y={0} width={W} height={H} fill={COLORS.bg} opacity={clamp01(dim)} /> : null}
    </g>
  );
};
