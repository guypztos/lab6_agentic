// Recurring props: the route-10 bus, the rooftop cell tower, and a close-up phone.
import React from "react";
import { COLORS, FONT } from "../theme";
import { clamp01 } from "../motion";

/** The yellow route-10 city bus. Origin = centre of the bus at road level. ~420 × 165 px at scale 1. */
export const Bus: React.FC<{
  x: number;
  y: number;
  scale?: number;
  facing?: 1 | -1;
  /** Wheel rotation in degrees (e.g. distance travelled × 1.5). */
  wheelRotation?: number;
  /** 0..1 */
  doorOpen?: number;
  opacity?: number;
}> = ({ x, y, scale = 1, facing = 1, wheelRotation = 0, doorOpen = 0, opacity = 1 }) => {
  const d = clamp01(doorOpen);
  const wheel = (cx: number) => (
    <g transform={`translate(${cx} -26)`}>
      <circle r={26} fill="#0b1220" />
      <circle r={13} fill="#64748b" />
      <g transform={`rotate(${wheelRotation})`}>
        <line x1={-11} y1={0} x2={11} y2={0} stroke="#0b1220" strokeWidth={3} />
        <line x1={0} y1={-11} x2={0} y2={11} stroke="#0b1220" strokeWidth={3} />
      </g>
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`} opacity={opacity}>
      <ellipse cx={0} cy={0} rx={220} ry={10} fill="#000" opacity={0.3} />
      <rect x={-210} y={-168} width={420} height={140} rx={20} fill={COLORS.bus} />
      <rect x={-210} y={-64} width={420} height={36} rx={10} fill="#eab308" />
      {/* side windows */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={-186 + i * 68} y={-146} width={56} height={52} rx={8} fill="#1e293b" />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <path key={`g${i}`} d={`M ${-180 + i * 68} -100 L ${-150 + i * 68} -142`} stroke="#ffffff" strokeOpacity={0.12} strokeWidth={8} />
      ))}
      {/* door */}
      <rect x={96} y={-146} width={52} height={116} rx={6} fill="#0f172a" />
      <rect x={98 - d * 22} y={-144} width={24} height={112} rx={4} fill="#334155" />
      <rect x={124 + d * 22} y={-144} width={22} height={112} rx={4} fill="#334155" />
      {/* windshield */}
      <path d="M 166 -150 H 200 Q 210 -150 210 -138 V -78 H 166 Z" fill="#1e293b" />
      {/* route sign (text counter-mirrored so it always reads "10") */}
      <rect x={-188} y={-164} width={150} height={14} rx={4} fill="#0b1220" />
      <g transform={`translate(-113 -153) scale(${facing} 1)`}>
        <text x={0} y={0} fill={COLORS.retry} fontFamily={FONT.sans} fontWeight={800} fontSize={13} textAnchor="middle">
          10 · CITY CENTRE
        </text>
      </g>
      <circle cx={204} cy={-48} r={8} fill="#fef9c3" />
      <rect x={-210} y={-56} width={8} height={16} rx={3} fill={COLORS.collision} />
      {wheel(-130)}
      {wheel(130)}
    </g>
  );
};

/** Rooftop cell tower. Origin = base centre. ~170 px tall at scale 1. `emit` ∈ [0,1) cycles radio ripples. */
export const CellTower: React.FC<{ x: number; y: number; scale?: number; emit?: number; ripples?: number; opacity?: number }> = ({
  x,
  y,
  scale = 1,
  emit = 0,
  ripples = 0,
  opacity = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    <path d="M -30 0 L -6 -150 M 30 0 L 6 -150" stroke="#94a3b8" strokeWidth={5} strokeLinecap="round" />
    {[0, 1, 2, 3].map((i) => {
      const yy = -20 - i * 34;
      const half = 28 - i * 5.5;
      return <path key={i} d={`M ${-half} ${yy} L ${half - 5} ${yy - 30} M ${half} ${yy} L ${-half + 5} ${yy - 30}`} stroke="#64748b" strokeWidth={3} />;
    })}
    <rect x={-22} y={-150} width={10} height={34} rx={3} fill="#cbd5e1" />
    <rect x={12} y={-150} width={10} height={34} rx={3} fill="#cbd5e1" />
    <rect x={-5} y={-158} width={10} height={40} rx={3} fill="#e2e8f0" />
    <circle cx={0} cy={-166} r={6} fill={COLORS.collision} />
    {ripples > 0
      ? [0, 1, 2].map((k) => {
          const u = (emit + k / 3) % 1;
          return (
            <path
              key={k}
              d={`M ${-20 - u * 70} ${-150 - u * 40} Q 0 ${-190 - u * 90} ${20 + u * 70} ${-150 - u * 40}`}
              stroke={COLORS.event}
              strokeWidth={3}
              fill="none"
              opacity={(1 - u) * ripples}
            />
          );
        })
      : null}
  </g>
);

/**
 * A close-up phone (Scene 05: typing "Bus is late again 🙄"). Origin = centre. 180 × 340 px at scale 1.
 * `typed` 0..1 reveals the message character by character; `sent` 0..1 moves it up into a sent bubble.
 */
export const Phone: React.FC<{
  x: number;
  y: number;
  scale?: number;
  message?: string;
  typed?: number;
  sent?: number;
  buzz?: number;
  frame?: number;
  opacity?: number;
}> = ({ x, y, scale = 1, message = "", typed = 1, sent = 0, buzz = 0, frame = 0, opacity = 1 }) => {
  const chars = Array.from(message);
  const shown = chars.slice(0, Math.round(chars.length * clamp01(typed))).join("");
  const s = clamp01(sent);
  const wiggle = buzz > 0 ? Math.sin(frame * 2.2) * 6 * clamp01(buzz) : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${wiggle})`} opacity={opacity}>
      <rect x={-90} y={-170} width={180} height={340} rx={28} fill="#0b1220" stroke="#334155" strokeWidth={4} />
      <rect x={-78} y={-150} width={156} height={300} rx={18} fill="#111c33" />
      <rect x={-24} y={-162} width={48} height={8} rx={4} fill="#1f2937" />
      {/* sent bubble */}
      {s > 0 ? (
        <g opacity={s} transform={`translate(0 ${(1 - s) * 90})`}>
          <rect x={-62} y={-60} width={132} height={44} rx={16} fill={COLORS.event} />
          <text x={4} y={-32} fill={COLORS.bg} fontFamily={FONT.sans} fontSize={15} fontWeight={600} textAnchor="middle">
            {message}
          </text>
        </g>
      ) : null}
      {/* input field */}
      <rect x={-68} y={100} width={136} height={34} rx={17} fill="#1e293b" stroke="#334155" strokeWidth={2} />
      <text x={-56} y={122} fill={COLORS.ink} fontFamily={FONT.sans} fontSize={14}>
        {s > 0.5 ? "" : shown}
        {s < 0.5 && typed < 1 && Math.floor(frame / 8) % 2 === 0 ? "|" : ""}
      </text>
    </g>
  );
};
