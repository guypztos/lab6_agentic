// Timeline primitives: axis, event dots, shaded windows, brackets, slot grid. SVG, canvas pixels.
import React from "react";
import { COLORS, FONT, SIZE } from "../theme";
import { clamp01, EASE_OUT } from "../motion";
import type { Scale } from "./Stage";

export type TimelineProps = {
  scale: Scale;
  y: number;
  /** Tick spacing in time units (e.g. 1 for frame times). Omit for no ticks. */
  tickEvery?: number;
  /** Tick label text; return null to skip a label. Default: no labels. */
  tickLabel?: (t: number) => string | null;
  /** Axis label at the right end, below the line (e.g. "time →"). */
  label?: string;
  color?: string;
  /** Draw-on progress from the left, 0..1. */
  progress?: number;
  opacity?: number;
  arrow?: boolean;
  strokeWidth?: number;
};

/** A horizontal time axis. Time flows left → right. */
export const Timeline: React.FC<TimelineProps> = ({
  scale,
  y,
  tickEvery,
  tickLabel,
  label,
  color = COLORS.muted,
  progress = 1,
  opacity = 1,
  arrow = true,
  strokeWidth = 3,
}) => {
  const xEnd = scale.x0 + (scale.x1 - scale.x0) * clamp01(progress);
  const ticks: number[] = [];
  if (tickEvery) {
    const first = Math.ceil(scale.t0 / tickEvery - 1e-9) * tickEvery;
    for (let t = first; t <= scale.t1 + 1e-9; t += tickEvery) ticks.push(Math.round(t * 1e6) / 1e6);
  }
  return (
    <g opacity={opacity}>
      <line x1={scale.x0} y1={y} x2={xEnd} y2={y} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      {arrow && progress >= 0.999 ? (
        <path d={`M ${xEnd + 2} ${y} l -14 -8 v 16 z`} fill={color} />
      ) : null}
      {ticks
        .filter((t) => scale(t) <= xEnd + 0.5)
        .map((t) => {
          const lbl = tickLabel?.(t);
          return (
            <g key={t}>
              <line x1={scale(t)} y1={y - 8} x2={scale(t)} y2={y + 8} stroke={color} strokeWidth={2} />
              {lbl ? (
                <text
                  x={scale(t)}
                  y={y + 34}
                  fill={COLORS.muted}
                  fontFamily={FONT.sans}
                  fontSize={SIZE.small}
                  textAnchor="middle"
                >
                  {lbl}
                </text>
              ) : null}
            </g>
          );
        })}
      {label ? (
        <text
          x={scale.x1}
          y={y + (tickLabel ? 62 : 36)}
          fill={COLORS.muted}
          fontFamily={FONT.sans}
          fontSize={SIZE.small}
          textAnchor="end"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
};

export type EventDotsProps = {
  scale: Scale;
  y: number;
  times: number[];
  color?: string;
  r?: number;
  /**
   * Time cursor: only events with t ≤ until are shown, and each one pops in (and drops from above if `drop` > 0)
   * just after the cursor passes it. Omit to show all.
   */
  until?: number;
  /** How long (in time units) the pop-in takes after the cursor passes. Default: 2% of the visible span. */
  popSpan?: number;
  /** Drop height in px for the pop-in (dots fall onto the line). */
  drop?: number;
  /** Per-dot colour override. */
  colorOf?: (t: number, i: number) => string | undefined;
  opacity?: number;
  /** Hide dots outside the scale's [t0, t1] (for scrolling tickers). Default true. */
  clip?: boolean;
};

/** Poisson events as dots on a timeline. */
export const EventDots: React.FC<EventDotsProps> = ({
  scale,
  y,
  times,
  color = COLORS.event,
  r = 9,
  until,
  popSpan,
  drop = 0,
  colorOf,
  opacity = 1,
  clip = true,
}) => {
  const span = popSpan ?? (scale.t1 - scale.t0) * 0.02;
  return (
    <g opacity={opacity}>
      {times.map((t, i) => {
        if (clip && (t < scale.t0 || t > scale.t1)) return null;
        let k = 1;
        if (until !== undefined) {
          if (t > until) return null;
          k = EASE_OUT(clamp01((until - t) / span));
        }
        const over = k < 1 ? 1 + 0.35 * Math.sin(k * Math.PI) : 1; // small overshoot
        return (
          <circle
            key={i}
            cx={scale(t)}
            cy={y - drop * (1 - k)}
            r={r * Math.min(1, k * 2) * over}
            fill={colorOf?.(t, i) ?? color}
          />
        );
      })}
    </g>
  );
};

export type IntervalProps = {
  scale: Scale;
  from: number;
  to: number;
  /** Vertical centre and height of the shaded band, px. */
  y: number;
  h?: number;
  color?: string;
  fillOpacity?: number;
  /** Grow from the middle outward, 0..1. */
  progress?: number;
  /** Dashed edge lines. */
  edges?: boolean;
  opacity?: number;
};

/** A shaded window on a timeline: the vulnerable window (red), a sliding "no bus?" window (green), a slot… */
export const Interval: React.FC<IntervalProps> = ({
  scale,
  from,
  to,
  y,
  h = 90,
  color = COLORS.collision,
  fillOpacity = 0.2,
  progress = 1,
  edges = true,
  opacity = 1,
}) => {
  const mid = (scale(from) + scale(to)) / 2;
  const half = ((scale(to) - scale(from)) / 2) * clamp01(progress);
  const x1 = mid - half;
  const x2 = mid + half;
  return (
    <g opacity={opacity}>
      <rect x={x1} y={y - h / 2} width={Math.max(0, x2 - x1)} height={h} fill={color} fillOpacity={fillOpacity} rx={6} />
      {edges && progress > 0.02 ? (
        <>
          <line x1={x1} y1={y - h / 2} x2={x1} y2={y + h / 2} stroke={color} strokeWidth={2} strokeDasharray="6 6" />
          <line x1={x2} y1={y - h / 2} x2={x2} y2={y + h / 2} stroke={color} strokeWidth={2} strokeDasharray="6 6" />
        </>
      ) : null}
    </g>
  );
};

/** A dimension bracket with a centred label, e.g. "1 frame time" or "2 frame times". Pixel coordinates. */
export const Bracket: React.FC<{
  x1: number;
  x2: number;
  y: number;
  label?: string;
  side?: "above" | "below";
  color?: string;
  size?: number;
  progress?: number;
  opacity?: number;
}> = ({ x1, x2, y, label, side = "above", color = COLORS.ink, size = SIZE.label, progress = 1, opacity = 1 }) => {
  const dir = side === "above" ? -1 : 1;
  const mid = (x1 + x2) / 2;
  const half = ((x2 - x1) / 2) * clamp01(progress);
  return (
    <g opacity={opacity}>
      <path
        d={`M ${mid - half} ${y - dir * 10} V ${y} H ${mid + half} V ${y - dir * 10}`}
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinejoin="round"
      />
      {label ? (
        <text
          x={mid}
          y={y + dir * (side === "above" ? 14 : 30)}
          fill={color}
          fontFamily={FONT.sans}
          fontSize={size}
          textAnchor="middle"
          opacity={clamp01(progress * 2 - 1)}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
};

/** Slot boundaries for slotted Aloha: violet ticks every `every` time units. */
export const SlotGrid: React.FC<{
  scale: Scale;
  y1: number;
  y2: number;
  every?: number;
  from?: number;
  to?: number;
  color?: string;
  /** Draw the boundaries one after another, left → right, 0..1. */
  progress?: number;
  /** Shade alternate slots very lightly. */
  shade?: boolean;
  opacity?: number;
}> = ({ scale, y1, y2, every = 1, from, to, color = COLORS.slotted, progress = 1, shade = true, opacity = 1 }) => {
  const a = Math.ceil((from ?? scale.t0) / every - 1e-9) * every;
  const b = to ?? scale.t1;
  const lines: number[] = [];
  for (let t = a; t <= b + 1e-9; t += every) lines.push(Math.round(t * 1e6) / 1e6);
  return (
    <g opacity={opacity}>
      {lines.map((t, i) => {
        const k = clamp01(progress * lines.length - i);
        if (k <= 0) return null;
        const yy = y1 + (y2 - y1) * k;
        return (
          <g key={t}>
            {shade && i % 2 === 0 && i < lines.length - 1 ? (
              <rect x={scale(t)} y={y1} width={scale(t + every) - scale(t)} height={(y2 - y1) * k} fill={color} opacity={0.06} />
            ) : null}
            <line x1={scale(t)} y1={y1} x2={scale(t)} y2={yy} stroke={color} strokeWidth={2.5} opacity={0.85} />
          </g>
        );
      })}
    </g>
  );
};
