// The "formula pocket": the e^(−λt) card created in Scene 04, docked top-right, and pulled out
// again in Scenes 14 and 17 (with λ→G, t→2 or t→1). It must look identical every time, so always use this.
import React from "react";
import { COLORS, FONT } from "../theme";
import { lerp } from "../motion";
import { SUP } from "./Formula";

export type FormulaPocketProps = {
  /** 0 = big, centred on screen · 1 = small, docked in the top-right corner. Animate between them. */
  dock: number;
  /** Optional text before the formula, e.g. "P(no events in time t) =". Fades out as the card docks. */
  prefix?: React.ReactNode;
  /** Substitution for λ (e.g. "G") and for t (e.g. "2" or "1"). Shown as `sub` goes 0→1. */
  rate?: string;
  time?: string;
  sub?: number;
  /** Colour of the substituted symbols (event blue for pure, slotted violet for Scene 17). */
  subColor?: string;
  /** Extra glow, 0..1 (e.g. when it's "pulled out" of the pocket). */
  glow?: number;
  opacity?: number;
  /** Override the centred position (canvas px). */
  center?: { x: number; y: number };
};

const DOCK = { x: 1280 - 24, y: 24, scale: 0.4 };

/** A symbol that slides out (up) while its replacement slides in (from below). */
const Swap: React.FC<{ from: string; to?: string; p: number; color: string; italicTo?: boolean }> = ({
  from,
  to,
  p,
  color,
  italicTo = true,
}) => {
  if (!to) return <i style={{ fontStyle: "italic" }}>{from}</i>;
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <i style={{ fontStyle: "italic", opacity: 1 - p, display: "inline-block", transform: `translateY(${-p * 0.5}em)` }}>
        {from}
      </i>
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          color,
          fontStyle: italicTo ? "italic" : "normal",
          opacity: p,
          transform: `translateY(${(1 - p) * 0.5}em)`,
        }}
      >
        {to}
      </span>
    </span>
  );
};

/** A coefficient that grows in front of the exponent (e.g. the "2" in e^{−2G}). */
const Grow: React.FC<{ text: string; p: number; color: string }> = ({ text, p, color }) => (
  // No overflow clipping: inside a superscript (line-height 0) it would clip the glyph entirely.
  <span style={{ display: "inline-block", width: `${p * 0.55}em`, opacity: p, color, whiteSpace: "nowrap" }}>{text}</span>
);

/** A symbol that shrinks away (the t once it has moved to the front or become 1). */
const Shrink: React.FC<{ text: string; p: number }> = ({ text, p }) => (
  <i style={{ fontStyle: "italic", display: "inline-block", width: `${(1 - p) * 0.4}em`, opacity: 1 - p, whiteSpace: "nowrap" }}>
    {text}
  </i>
);

export const FormulaPocket: React.FC<FormulaPocketProps> = ({
  dock,
  prefix,
  rate,
  time,
  sub = 0,
  subColor = COLORS.event,
  glow = 0,
  opacity = 1,
  center = { x: 640, y: 330 },
}) => {
  const x = lerp(center.x, DOCK.x, dock);
  const y = lerp(center.y, DOCK.y, dock);
  const scale = lerp(1, DOCK.scale, dock);
  // When docked, the card's top-right corner sits at (DOCK.x, DOCK.y); when centred, its centre is at `center`.
  const tx = lerp(-50, -100, dock);
  const ty = lerp(-50, 0, dock);
  const showPrefix = prefix ? 1 - Math.min(1, dock * 2.5) : 0;

  // t → number: the number moves in front as a coefficient ("2G"), or disappears if it's 1.
  const timeIsNumber = time !== undefined && /^[0-9.]+$/.test(time);
  const coeff = timeIsNumber && time !== "1" ? time : undefined;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(${tx}%, ${ty}%) scale(${scale})`,
        // Top-right origin keeps the docked corner pinned; at dock = 0 the scale is 1 so the origin doesn't matter.
        transformOrigin: "top right",
        opacity,
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "22px 40px",
        background: COLORS.panel,
        border: `3px solid ${COLORS.bus}`,
        borderRadius: 22,
        boxShadow: `0 12px 40px rgba(0,0,0,0.4), 0 0 ${20 + glow * 40}px rgba(250, 204, 21, ${0.12 + glow * 0.35})`,
        whiteSpace: "nowrap",
      }}
    >
      {prefix && showPrefix > 0 ? (
        <span
          style={{
            fontFamily: FONT.sans,
            fontSize: 40,
            color: COLORS.muted,
            opacity: showPrefix,
            maxWidth: `${showPrefix * 640}px`,
            overflow: "hidden",
          }}
        >
          {prefix}
        </span>
      ) : null}
      <span style={{ fontFamily: FONT.math, fontSize: 96, color: COLORS.ink, lineHeight: 1.1 }}>
        e
        <span style={SUP}>
          −{coeff ? <Grow text={coeff} p={sub} color={subColor} /> : null}
          <Swap from="λ" to={rate} p={sub} color={subColor} />
          {timeIsNumber ? <Shrink text="t" p={sub} /> : <Swap from="t" to={time} p={sub} color={subColor} />}
        </span>
      </span>
    </div>
  );
};
