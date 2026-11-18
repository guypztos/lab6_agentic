// HTML text components. All are absolutely positioned on the 1280×720 canvas.
// Pass `start` (frame) to make a component animate itself in; omit it for a static element.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, FONT, SIZE } from "../theme";
import { fade, pop, prog } from "../motion";

/** Opacity + rise for an element entering at `start`. Static (fully visible) if start is undefined. */
export function useEnter(start?: number, rise = 14) {
  const frame = useCurrentFrame();
  if (start === undefined) return { opacity: 1, transform: "none" };
  const p = pop(frame, start);
  return { opacity: Math.min(1, fade(frame, start, 10)), transform: `translateY(${(1 - p) * rise}px)` };
}

type Anchor = "center" | "left" | "right";
const anchorX = (a: Anchor) => (a === "center" ? "-50%" : a === "right" ? "-100%" : "0%");

export type LabelProps = {
  x: number;
  y: number;
  children: React.ReactNode;
  size?: number;
  color?: string;
  anchor?: Anchor;
  weight?: number;
  start?: number;
  opacity?: number;
  italic?: boolean;
  style?: React.CSSProperties;
};

/** A positioned piece of text; (x, y) is the anchor point at the text's vertical middle. */
export const Label: React.FC<LabelProps> = ({
  x,
  y,
  children,
  size = SIZE.label,
  color = COLORS.ink,
  anchor = "center",
  weight = 500,
  start,
  opacity = 1,
  italic,
  style,
}) => {
  const enter = useEnter(start);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(${anchorX(anchor)}, -50%) ${enter.transform === "none" ? "" : enter.transform}`,
        opacity: enter.opacity * opacity,
        fontFamily: FONT.sans,
        fontSize: size,
        fontWeight: weight,
        fontStyle: italic ? "italic" : undefined,
        color,
        whiteSpace: "nowrap",
        textAlign: anchor,
        lineHeight: 1.2,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Big bold title (≥ 56 px). */
export const Title: React.FC<Omit<LabelProps, "size" | "weight"> & { size?: number }> = ({ size = SIZE.title, ...p }) => (
  <Label size={size} weight={700} {...p} />
);

/** Bottom-centre caption, the style guide's ≥ 28 px. */
export const Caption: React.FC<{ children: React.ReactNode; start?: number; y?: number; color?: string; opacity?: number }> = ({
  children,
  start,
  y = 650,
  color = COLORS.ink,
  opacity,
}) => (
  <Label x={640} y={y} size={SIZE.caption} color={color} start={start} opacity={opacity} weight={500}>
    {children}
  </Label>
);

/** Numbered rule chip, e.g. "1 · steady rate λ". */
export const RuleChip: React.FC<{
  n: number | string;
  children: React.ReactNode;
  x: number;
  y: number;
  start?: number;
  color?: string;
  active?: boolean;
  opacity?: number;
}> = ({ n, children, x, y, start, color = COLORS.event, active = true, opacity = 1 }) => {
  const enter = useEnter(start);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translateY(-50%) ${enter.transform === "none" ? "" : enter.transform}`,
        opacity: enter.opacity * opacity * (active ? 1 : 0.45),
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "10px 20px 10px 10px",
        borderRadius: 999,
        background: COLORS.panel,
        border: `2px solid ${active ? color : COLORS.faint}`,
        fontFamily: FONT.sans,
        fontSize: SIZE.caption,
        color: COLORS.ink,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          background: active ? color : COLORS.faint,
          color: COLORS.bg,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
        }}
      >
        {n}
      </span>
      <span>{children}</span>
    </div>
  );
};

/** A rubber-stamp label: COLLISION, ALOHAnet, 1971, "back off"… */
export const Stamp: React.FC<{
  children: React.ReactNode;
  x: number;
  y: number;
  start?: number;
  color?: string;
  size?: number;
  rotate?: number;
  opacity?: number;
}> = ({ children, x, y, start, color = COLORS.collision, size = 44, rotate = -6, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const p = start === undefined ? 1 : pop(frame, start, undefined, 11);
  const a = start === undefined ? 1 : fade(frame, start, 6);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${1.6 - 0.6 * p})`,
        opacity: a * opacity,
        padding: "6px 18px",
        border: `5px solid ${color}`,
        borderRadius: 10,
        color,
        fontFamily: FONT.sans,
        fontWeight: 900,
        letterSpacing: "0.06em",
        fontSize: size,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

/** A panel card for grouping text or formulas. Position with x/y (top-left) or centre it with anchor. */
export const Card: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  anchor?: Anchor;
  start?: number;
  opacity?: number;
  border?: string;
  padding?: string | number;
  style?: React.CSSProperties;
}> = ({ x, y, children, anchor = "center", start, opacity = 1, border = COLORS.faint, padding = "18px 28px", style }) => {
  const enter = useEnter(start);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(${anchorX(anchor)}, -50%) ${enter.transform === "none" ? "" : enter.transform}`,
        opacity: enter.opacity * opacity,
        background: COLORS.panel,
        border: `2px solid ${border}`,
        borderRadius: 18,
        padding,
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        fontFamily: FONT.sans,
        color: COLORS.ink,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Full-frame "Part N · Title" card. Put it in its own <Sequence> (≈ 1.5–2 s);
 * it fades itself in and out over its own duration.
 */
export const PartSting: React.FC<{ part: number; title: string; durationInFrames: number }> = ({
  part,
  title,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const a = fade(frame, 0, 10, durationInFrames - 10, 10);
  const line = prog(frame, 4, 18);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, opacity: a, justifyContent: "center", alignItems: "center" }}>
      <div style={{ fontFamily: FONT.sans, color: COLORS.muted, fontSize: SIZE.caption, letterSpacing: "0.2em" }}>
        PART {part}
      </div>
      <div style={{ width: 360 * line, height: 3, background: COLORS.event, margin: "18px 0" }} />
      <div style={{ fontFamily: FONT.sans, color: COLORS.ink, fontSize: SIZE.title, fontWeight: 700 }}>{title}</div>
    </AbsoluteFill>
  );
};
