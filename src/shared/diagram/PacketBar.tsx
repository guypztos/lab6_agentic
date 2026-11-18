// The packet bar: a rounded rectangle exactly `len` frame times wide on the given timeline scale.
// Colour = state (blue attempt, amber retry, green delivered, red collided, grey ghost).
import React from "react";
import { interpolateColors, random } from "remotion";
import { COLORS, FONT, PACKET_COLORS, type PacketState } from "../theme";
import { clamp01 } from "../motion";
import type { Scale } from "./Stage";

export type PacketBarProps = {
  scale: Scale;
  /** Start time (frame-time units). */
  start: number;
  /** Length in frame times. Always 1 in this video. */
  len?: number;
  /** Vertical centre, px. */
  y: number;
  h?: number;
  state?: PacketState;
  /** Optional second state to blend toward, with `mix` 0..1 (e.g. attempt → collision). */
  toState?: PacketState;
  mix?: number;
  /** Text inside the bar (e.g. "1/4", "my packet"). */
  label?: string;
  /** Transmission progress: fills from the left, 0..1. */
  fill?: number;
  /** Break apart into fragments, 0..1 (collisions: "both packets are lost"). */
  shatter?: number;
  /** Coloured edge for one beat (e.g. teal/orange talker identity in Scene 06). */
  edge?: string;
  opacity?: number;
  seed?: string | number;
};

export const PacketBar: React.FC<PacketBarProps> = ({
  scale,
  start,
  len = 1,
  y,
  h = 36,
  state = "attempt",
  toState,
  mix = 0,
  label,
  fill = 1,
  shatter = 0,
  edge,
  opacity = 1,
  seed = "pkt",
}) => {
  const x = scale(start);
  const w = scale(start + len) - x;
  const c0 = PACKET_COLORS[state];
  const color = toState ? interpolateColors(clamp01(mix), [0, 1], [c0, PACKET_COLORS[toState]]) : c0;
  const ghost = (toState ?? state) === "ghost" && (toState ? mix > 0.5 : true);
  const f = clamp01(fill);

  if (shatter > 0) {
    const n = 6;
    const s = clamp01(shatter);
    return (
      <g opacity={opacity * (1 - s ** 1.6)}>
        {Array.from({ length: n }, (_, i) => {
          const dx = (random(`${seed}-dx-${i}`) - 0.5) * 120 * s + (i - n / 2) * 10 * s;
          const dy = (random(`${seed}-dy-${i}`) - 0.3) * 110 * s;
          const rot = (random(`${seed}-r-${i}`) - 0.5) * 140 * s;
          const fx = x + (w / n) * i;
          return (
            <rect
              key={i}
              x={fx}
              y={y - h / 2}
              width={w / n - 2}
              height={h}
              rx={4}
              fill={color}
              transform={`translate(${dx} ${dy}) rotate(${rot} ${fx + w / n / 2} ${y})`}
            />
          );
        })}
      </g>
    );
  }

  return (
    <g opacity={opacity}>
      {ghost ? (
        <rect x={x} y={y - h / 2} width={w} height={h} rx={10} fill="none" stroke={COLORS.muted} strokeWidth={2.5} strokeDasharray="8 6" />
      ) : (
        <>
          {f < 1 ? <rect x={x} y={y - h / 2} width={w} height={h} rx={10} fill={color} opacity={0.15} /> : null}
          <rect x={x} y={y - h / 2} width={w * f} height={h} rx={10} fill={color} />
          {edge ? <rect x={x} y={y - h / 2} width={w * f} height={h} rx={10} fill="none" stroke={edge} strokeWidth={4} /> : null}
        </>
      )}
      {label ? (
        <text
          x={x + w / 2}
          y={y + 7}
          fill={ghost ? COLORS.muted : COLORS.bg}
          fontFamily={FONT.sans}
          fontWeight={700}
          fontSize={Math.min(20, h * 0.55)}
          textAnchor="middle"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
};
