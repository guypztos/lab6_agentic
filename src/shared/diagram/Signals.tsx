// The shared channel band, and speech / signal waveforms (clean or noisy).
import React from "react";
import { random } from "remotion";
import { COLORS, FONT, SIZE } from "../theme";
import { clamp01 } from "../motion";
import { useSvgId } from "./Stage";

/** A glowing strip: "the channel" everyone shares (Scenes 06, 07). */
export const ChannelBand: React.FC<{
  x?: number;
  y: number;
  width?: number;
  h?: number;
  color?: string;
  glow?: number;
  label?: string;
  progress?: number;
  opacity?: number;
}> = ({ x = 120, y, width = 1040, h = 44, color = COLORS.event, glow = 1, label, progress = 1, opacity = 1 }) => {
  const id = useSvgId("band");
  const w = width * clamp01(progress);
  return (
    <g opacity={opacity}>
      <defs>
        <filter id={id} x="-10%" y="-200%" width="120%" height="500%">
          <feGaussianBlur stdDeviation={10} />
        </filter>
      </defs>
      <rect x={x} y={y - h / 2} width={w} height={h} rx={h / 2} fill={color} opacity={0.35 * glow} filter={`url(#${id})`} />
      <rect x={x} y={y - h / 2} width={w} height={h} rx={h / 2} fill={COLORS.panel} stroke={color} strokeWidth={2} strokeOpacity={0.7} />
      {label ? (
        <text x={x} y={y - h / 2 - 16} fill={COLORS.muted} fontFamily={FONT.sans} fontSize={SIZE.label}>
          {label}
        </text>
      ) : null}
    </g>
  );
};

/**
 * A speech/signal ribbon. `noise` 0 = clean speech-like wave; 1 = jagged static (two talkers at once).
 * Animate `phase` with the frame to make it flow.
 */
export const Waveform: React.FC<{
  x: number;
  y: number;
  width: number;
  amp?: number;
  color?: string;
  noise?: number;
  progress?: number;
  phase?: number;
  strokeWidth?: number;
  seed?: string | number;
  opacity?: number;
}> = ({ x, y, width, amp = 26, color = COLORS.ink, noise = 0, progress = 1, phase = 0, strokeWidth = 4, seed = "wave", opacity = 1 }) => {
  const n = 160;
  const end = Math.max(2, Math.round(n * clamp01(progress)));
  let d = "";
  for (let i = 0; i <= end; i++) {
    const u = i / n;
    const px = x + u * width;
    // syllable-like envelope × carrier
    const env = Math.abs(Math.sin(u * 9 + phase * 0.7)) * 0.75 + 0.25;
    const clean = Math.sin(u * 70 + phase * 3) * env;
    const jag = (random(`${seed}-${i}-${Math.floor(phase * 6)}`) * 2 - 1) * 1.3;
    const v = clean * (1 - noise) + jag * noise;
    const taper = Math.min(1, u * 12, (1 - u) * 12);
    d += `${i === 0 ? "M" : "L"} ${px.toFixed(1)} ${(y - v * amp * taper).toFixed(1)} `;
  }
  return <path d={d} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinejoin="round" strokeLinecap="round" opacity={opacity} />;
};
