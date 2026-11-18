// Small recurring symbols: ✓ / ✗ marks that draw themselves, and a die that rolls (Scenes 09, 10, 18).
import React from "react";
import { random } from "remotion";
import { COLORS } from "../theme";
import { clamp01, EASE_OUT } from "../motion";

/** A ✓ or ✗ that draws on with `progress`. Centre (x, y). */
export const Mark: React.FC<{
  x: number;
  y: number;
  kind?: "check" | "cross";
  size?: number;
  progress?: number;
  color?: string;
  disc?: boolean;
  opacity?: number;
}> = ({ x, y, kind = "check", size = 48, progress = 1, color, disc = true, opacity = 1 }) => {
  const c = color ?? (kind === "check" ? COLORS.success : COLORS.collision);
  const p = clamp01(progress);
  const s = size / 48;
  const L = 100;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (0.6 + 0.4 * EASE_OUT(clamp01(p * 2)))})`} opacity={opacity * clamp01(p * 3)}>
      {disc ? <circle r={24} fill={c} opacity={0.18} /> : null}
      {kind === "check" ? (
        <path
          d="M -12 0 L -3 9 L 13 -9"
          pathLength={L}
          strokeDasharray={L}
          strokeDashoffset={L * (1 - p)}
          stroke={c}
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M -10 -10 L 10 10 M 10 -10 L -10 10"
          pathLength={L}
          strokeDasharray={L}
          strokeDashoffset={L * (1 - p)}
          stroke={c}
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
        />
      )}
    </g>
  );
};

const PIPS: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[-1, -1], [1, 1]],
  3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
};

/**
 * A die. While `roll` < 1 it tumbles through random faces; at roll = 1 it settles on `value`.
 * (x, y) is the centre. Deterministic per `seed`.
 */
export const Die: React.FC<{
  x: number;
  y: number;
  value: 1 | 2 | 3 | 4 | 5 | 6;
  roll?: number;
  size?: number;
  color?: string;
  seed?: string | number;
  opacity?: number;
}> = ({ x, y, value, roll = 1, size = 56, color = COLORS.ink, seed = "die", opacity = 1 }) => {
  const r = clamp01(roll);
  const face = r >= 1 ? value : (Math.floor(random(`${seed}-${Math.floor(r * 10)}`) * 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
  const rot = (1 - EASE_OUT(r)) * 540;
  const hop = Math.sin(r * Math.PI) * size * 0.6;
  const h = size / 2;
  return (
    <g transform={`translate(${x} ${y - hop}) rotate(${rot})`} opacity={opacity}>
      <rect x={-h} y={-h} width={size} height={size} rx={size * 0.2} fill={color} />
      {PIPS[face].map(([px, py], i) => (
        <circle key={i} cx={px * size * 0.27} cy={py * size * 0.27} r={size * 0.085} fill={COLORS.bg} />
      ))}
    </g>
  );
};
