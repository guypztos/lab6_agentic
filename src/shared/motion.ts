// Small, deterministic animation helpers. Everything is a pure function of the frame.
import { Easing, interpolate, spring } from "remotion";
import { FPS } from "./theme";

/** Seconds → frames (rounded). */
export const sec = (s: number, fps: number = FPS) => Math.round(s * fps);

/** The house ease: soft in, soft out. */
export const EASE = Easing.bezier(0.4, 0, 0.2, 1);
export const EASE_OUT = Easing.bezier(0, 0, 0.2, 1);
export const EASE_IN = Easing.bezier(0.4, 0, 1, 1);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 progress between `start` and `start + duration` (frames), eased and clamped. */
export function prog(
  frame: number,
  start: number,
  duration: number,
  easing: (t: number) => number = EASE,
): number {
  if (duration <= 0) return frame >= start ? 1 : 0;
  return interpolate(frame, [start, start + duration], [0, 1], { ...clamp, easing });
}

/** Fade in over `inDur` from `start`, and (optionally) fade out over `outDur` starting at `outStart`. */
export function fade(frame: number, start: number, inDur = 12, outStart?: number, outDur = 12): number {
  const a = prog(frame, start, inDur);
  if (outStart === undefined) return a;
  return a * (1 - prog(frame, outStart, outDur));
}

/** A springy pop-in (0→1, may overshoot slightly) starting at `start`. Damping ~12–15 per style guide. */
export function pop(frame: number, start: number, fps: number = FPS, damping = 13): number {
  return spring({ frame: frame - start, fps, config: { damping, mass: 0.6 } });
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Map v from [a,b] to [c,d], clamped. */
export const remap = (v: number, a: number, b: number, c: number, d: number) =>
  interpolate(v, [a, b], [c, d], clamp);

/** Clamp to [0,1]. */
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
