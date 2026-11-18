// All diagram and illustration components are SVG <g> elements in canvas pixels (1280×720).
// Put them inside one <Stage> per layer. HTML text components (Label, Card…) go outside the Stage.
import React, { useId } from "react";
import { H, W } from "../theme";

export const Stage: React.FC<{ children: React.ReactNode; opacity?: number; style?: React.CSSProperties }> = ({
  children,
  opacity = 1,
  style,
}) => (
  <svg
    viewBox={`0 0 ${W} ${H}`}
    width={W}
    height={H}
    style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity, ...style }}
  >
    {children}
  </svg>
);

/** A unique, url()-safe id for SVG gradients/filters. */
export function useSvgId(prefix: string): string {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

/** Linear map from time units to x pixels. Every timeline-based component takes one. */
export type Scale = ((t: number) => number) & {
  t0: number;
  t1: number;
  x0: number;
  x1: number;
  /** Pixels per time unit. */
  px: number;
  invert: (x: number) => number;
};

export function timeScale(t0: number, t1: number, x0: number, x1: number): Scale {
  const px = (x1 - x0) / (t1 - t0);
  const f = ((t: number) => x0 + (t - t0) * px) as Scale;
  f.t0 = t0;
  f.t1 = t1;
  f.x0 = x0;
  f.x1 = x1;
  f.px = px;
  f.invert = (x: number) => t0 + (x - x0) / px;
  return f;
}
