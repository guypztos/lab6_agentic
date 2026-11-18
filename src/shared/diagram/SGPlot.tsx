// The S–G plot (Scenes 15, 17, 18, 20). x = G (offered load) 0..3, y = S (throughput) 0..0.4.
// Pure curve in event blue, slotted in violet. Curves draw on from left to right via `pure` / `slotted`.
import React from "react";
import { COLORS, FONT, SIZE } from "../theme";
import { clamp01 } from "../motion";
import { PEAKS, pureS, slottedS } from "../poisson";

export type SGPlotProps = {
  /** Plot-area box in canvas px (axes are drawn on its left/bottom edges). */
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  gMax?: number;
  sMax?: number;
  /** Axes draw-on, 0..1. */
  axes?: number;
  /** Curve draw-on progress, 0..1 (fraction of the G range). */
  pure?: number;
  slotted?: number;
  /** Peak markers' opacity, 0..1. */
  purePeak?: number;
  slottedPeak?: number;
  /** A vertical cursor at this G (Scene 15's sweep). */
  cursorG?: number;
  /** A ball sitting on a curve at G (Scene 18). */
  ball?: { G: number; curve: "pure" | "slotted"; opacity?: number };
  /** Curve labels next to the curves ("pure Aloha", "slotted Aloha"). */
  curveLabels?: boolean;
  opacity?: number;
};

export function sgCoords(p: Required<Pick<SGPlotProps, "x" | "y" | "w" | "h" | "gMax" | "sMax">>) {
  return {
    gx: (G: number) => p.x + (G / p.gMax) * p.w,
    sy: (S: number) => p.y + p.h - (S / p.sMax) * p.h,
  };
}

const DEFAULTS = { x: 200, y: 110, w: 880, h: 460, gMax: 3, sMax: 0.4 };

export const SGPlot: React.FC<SGPlotProps> = (props) => {
  const { x, y, w, h, gMax, sMax } = { ...DEFAULTS, ...props };
  const {
    axes = 1,
    pure = 0,
    slotted = 0,
    purePeak = 0,
    slottedPeak = 0,
    cursorG,
    ball,
    curveLabels = true,
    opacity = 1,
  } = props;
  const { gx, sy } = sgCoords({ x, y, w, h, gMax, sMax });
  const a = clamp01(axes);

  const curve = (f: (G: number) => number, p: number) => {
    const n = 240;
    const end = Math.max(1, Math.round(n * clamp01(p)));
    let d = "";
    for (let i = 0; i <= end; i++) {
      const G = (gMax * i) / n;
      d += `${i === 0 ? "M" : "L"} ${gx(G).toFixed(1)} ${sy(f(G)).toFixed(1)} `;
    }
    return d;
  };

  const peak = (G: number, S: number, color: string, o: number, lines: string[], dx: number) =>
    o > 0 ? (
      <g opacity={o}>
        <line x1={gx(G)} y1={sy(S)} x2={gx(G)} y2={sy(0)} stroke={color} strokeWidth={2} strokeDasharray="6 6" />
        <line x1={gx(0)} y1={sy(S)} x2={gx(G)} y2={sy(S)} stroke={color} strokeWidth={2} strokeDasharray="6 6" />
        <circle cx={gx(G)} cy={sy(S)} r={10} fill={color} stroke={COLORS.bg} strokeWidth={3} />
        {lines.map((l, i) => (
          <text
            key={i}
            x={gx(G) + dx}
            y={sy(S) - 22 + i * 28}
            fill={color}
            fontFamily={FONT.sans}
            fontWeight={i === 0 ? 700 : 500}
            fontSize={SIZE.label}
            textAnchor={dx < 0 ? "end" : "start"}
          >
            {l}
          </text>
        ))}
      </g>
    ) : null;

  const gTicks = [0, 0.5, 1, 1.5, 2, 2.5, 3].filter((g) => g <= gMax + 1e-9);
  const sTicks = [0, 0.1, 0.2, 0.3, 0.4].filter((s) => s <= sMax + 1e-9);
  const ballS = ball ? (ball.curve === "pure" ? pureS(ball.G) : slottedS(ball.G)) : 0;

  return (
    <g opacity={opacity}>
      {/* grid + axes */}
      <g opacity={a}>
        {sTicks.slice(1).map((s) => (
          <line key={s} x1={x} y1={sy(s)} x2={x + w * a} y2={sy(s)} stroke={COLORS.faint} strokeWidth={1} opacity={0.6} />
        ))}
        <line x1={x} y1={y + h} x2={x + w * a} y2={y + h} stroke={COLORS.ink} strokeWidth={3} strokeLinecap="round" />
        <line x1={x} y1={y + h} x2={x} y2={y + h - h * a} stroke={COLORS.ink} strokeWidth={3} strokeLinecap="round" />
        {gTicks.map((g) => (
          <text key={g} x={gx(g)} y={y + h + 34} fill={COLORS.muted} fontFamily={FONT.sans} fontSize={SIZE.small} textAnchor="middle">
            {g === 0.5 ? "½" : g}
          </text>
        ))}
        {sTicks.map((s) => (
          <text key={s} x={x - 16} y={sy(s) + 6} fill={COLORS.muted} fontFamily={FONT.sans} fontSize={SIZE.small} textAnchor="end">
            {s}
          </text>
        ))}
        <text x={x + w} y={y + h + 70} fill={COLORS.ink} fontFamily={FONT.sans} fontSize={SIZE.label} textAnchor="end">
          G (offered load) →
        </text>
        <text
          x={x - 70}
          y={y + h / 2}
          fill={COLORS.ink}
          fontFamily={FONT.sans}
          fontSize={SIZE.label}
          textAnchor="middle"
          transform={`rotate(-90 ${x - 70} ${y + h / 2})`}
        >
          S (throughput) →
        </text>
      </g>

      {/* cursor */}
      {cursorG !== undefined ? (
        <line x1={gx(cursorG)} y1={y} x2={gx(cursorG)} y2={y + h} stroke={COLORS.muted} strokeWidth={2} opacity={0.7} />
      ) : null}

      {/* curves */}
      {slotted > 0 ? <path d={curve(slottedS, slotted)} stroke={COLORS.slotted} strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
      {pure > 0 ? <path d={curve(pureS, pure)} stroke={COLORS.event} strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
      {curveLabels && pure > 0.95 ? (
        <text x={gx(1.55)} y={sy(pureS(1.55)) - 16} fill={COLORS.event} fontFamily={FONT.sans} fontSize={SIZE.label} opacity={clamp01((pure - 0.95) * 20)}>
          pure Aloha
        </text>
      ) : null}
      {curveLabels && slotted > 0.95 ? (
        <text x={gx(1.9)} y={sy(slottedS(1.9)) - 16} fill={COLORS.slotted} fontFamily={FONT.sans} fontSize={SIZE.label} opacity={clamp01((slotted - 0.95) * 20)}>
          slotted Aloha
        </text>
      ) : null}

      {/* peaks */}
      {peak(PEAKS.pure.G, PEAKS.pure.S, COLORS.event, purePeak, ["G = ½", "S = 1/(2e) ≈ 18.4%"], 22)}
      {peak(PEAKS.slotted.G, PEAKS.slotted.S, COLORS.slotted, slottedPeak, ["G = 1", "S = 1/e ≈ 36.8%"], 22)}

      {/* ball */}
      {ball ? (
        <g opacity={ball.opacity ?? 1}>
          <ellipse cx={gx(ball.G) + 4} cy={sy(ballS) - 8} rx={16} ry={6} fill="#000" opacity={0.25} />
          <circle cx={gx(ball.G)} cy={sy(ballS) - 16} r={16} fill={COLORS.ink} stroke={COLORS.bg} strokeWidth={3} />
        </g>
      ) : null}
    </g>
  );
};
