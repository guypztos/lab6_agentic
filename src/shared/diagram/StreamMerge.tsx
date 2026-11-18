// "The merge": many sparse rows of events fold down into one busy timeline.
// Built once, used in Scene 03 (houses → people at the stop) and Scene 11 (phones → attempts on the channel),
// so the viewer *sees* it is the same thing.
import React from "react";
import { COLORS } from "../theme";
import { clamp01, EASE, lerp } from "../motion";
import type { Scale } from "./Stage";

export type StreamMergeProps = {
  scale: Scale;
  /** Event times per source row (e.g. from sparseSources()). */
  rows: number[][];
  /** y of the first row and spacing between rows, px. */
  rowTop: number;
  rowGap: number;
  /** y of the merged timeline. */
  mergedY: number;
  /** 0 = rows apart · 1 = every dot sits on the merged line. Rows fold in with a slight stagger. */
  progress: number;
  /** Optional time cursor: only events with t ≤ until are visible. */
  until?: number;
  /** Dot colour per event (default event blue). Return e.g. COLORS.retry for retries in Scene 11. */
  colorOf?: (row: number, t: number, i: number) => string;
  r?: number;
  /** Rendered at the left end of each row (icon or label), in SVG. Fades with the row. */
  rowLabel?: (row: number, y: number) => React.ReactNode;
  opacity?: number;
};

export const StreamMerge: React.FC<StreamMergeProps> = ({
  scale,
  rows,
  rowTop,
  rowGap,
  mergedY,
  progress,
  until,
  colorOf,
  r = 7,
  rowLabel,
  opacity = 1,
}) => {
  const n = rows.length;
  const rowP = (i: number) => EASE(clamp01((progress - (i / Math.max(1, n)) * 0.35) / 0.65));
  const lineFade = 1 - clamp01(progress * 1.4);
  const mergedIn = clamp01(progress * 1.6 - 0.4);
  return (
    <g opacity={opacity}>
      {rows.map((_, i) => {
        const y = rowTop + i * rowGap;
        return (
          <g key={`row-${i}`} opacity={lineFade}>
            <line x1={scale.x0} y1={y} x2={scale.x1} y2={y} stroke={COLORS.faint} strokeWidth={2} />
            {rowLabel?.(i, y)}
          </g>
        );
      })}
      <line
        x1={scale.x0}
        y1={mergedY}
        x2={scale.x1}
        y2={mergedY}
        stroke={COLORS.muted}
        strokeWidth={3}
        strokeLinecap="round"
        opacity={mergedIn}
      />
      {rows.map((times, i) => {
        const p = rowP(i);
        const y = lerp(rowTop + i * rowGap, mergedY, p);
        return times.map((t, j) =>
          until !== undefined && t > until ? null : t < scale.t0 || t > scale.t1 ? null : (
            <circle key={`${i}-${j}`} cx={scale(t)} cy={y} r={r * lerp(0.85, 1.15, p)} fill={colorOf?.(i, t, j) ?? COLORS.event} />
          ),
        );
      })}
    </g>
  );
};
