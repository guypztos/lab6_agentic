// Deterministic random event times. Remotion renders frames in parallel, so never use Math.random():
// everything here is seeded via remotion's `random(seed)`.
import { random } from "remotion";

/**
 * Arrival times of a Poisson process with `rate` events per unit time on [t0, t1).
 * Gaps are exponential (−ln U / rate), which is what makes it *look* right: clumps and gaps.
 */
export function poissonArrivals(rate: number, t0: number, t1: number, seed: string | number): number[] {
  const out: number[] = [];
  if (rate <= 0) return out;
  let t = t0;
  for (let i = 0; i < 100000; i++) {
    const u = random(`${seed}-gap-${i}`);
    t += -Math.log(1 - u) / rate;
    if (t >= t1) break;
    out.push(t);
  }
  return out;
}

/** Evenly spaced times: the "schedule" non-example (train timetable). */
export function scheduledArrivals(every: number, t0: number, t1: number, offset = 0): number[] {
  const out: number[] = [];
  for (let t = t0 + offset; t < t1; t += every) out.push(t);
  return out;
}

/**
 * Many independent sources, each a *rare* Poisson process. Their union is again Poisson
 * with rate n·ratePerSource (Scenes 03 and 11).
 */
export function sparseSources(
  n: number,
  ratePerSource: number,
  t0: number,
  t1: number,
  seed: string | number,
): number[][] {
  return Array.from({ length: n }, (_, i) => poissonArrivals(ratePerSource, t0, t1, `${seed}-src-${i}`));
}

/** Merge several sorted event lists into one sorted list. */
export function mergeTimes(lists: number[][]): number[] {
  return lists.flat().sort((a, b) => a - b);
}

/** A uniform random number in [a, b), seeded. */
export function rand(seed: string | number, a = 0, b = 1): number {
  return a + (b - a) * random(seed);
}

export type AlohaPacket = { start: number; source: number; ok: boolean };

/**
 * Classify packets of length `len` as success/collision.
 * Pure Aloha: a packet fails if any other packet starts within (start − len, start + len).
 * Slotted (slot = len): starts are snapped to slot boundaries first; collide iff same slot.
 */
export function classifyPackets(
  starts: { start: number; source?: number }[],
  len = 1,
  mode: "pure" | "slotted" = "pure",
): AlohaPacket[] {
  const s = starts
    .map((p, i) => ({
      start: mode === "slotted" ? Math.ceil(p.start / len - 1e-9) * len : p.start,
      source: p.source ?? i,
    }))
    .sort((a, b) => a.start - b.start);
  return s.map((p, i) => {
    const clash = s.some(
      (q, j) => j !== i && (mode === "slotted" ? q.start === p.start : Math.abs(q.start - p.start) < len),
    );
    return { ...p, ok: !clash };
  });
}

/** Throughput formulas used throughout Parts 5–8. */
export const pureS = (G: number) => G * Math.exp(-2 * G);
export const slottedS = (G: number) => G * Math.exp(-G);
export const PEAKS = {
  pure: { G: 0.5, S: 1 / (2 * Math.E) }, // ≈ 0.184
  slotted: { G: 1, S: 1 / Math.E }, // ≈ 0.368
} as const;
