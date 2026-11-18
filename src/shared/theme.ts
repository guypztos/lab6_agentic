// Design tokens for every scene. See scenes/README.md → "Style guide".
// Semantic colours carry meaning; never use them decoratively.

export const W = 1280;
export const H = 720;
export const FPS = 30;

/** Seconds of silence before the narration starts / after it ends, in every scene. */
export const LEAD_IN = 0.3;
export const TAIL = 0.5;

export const COLORS = {
  bg: "#0f172a", // background everywhere
  panel: "#1e293b", // cards, plot area, illustration ground
  panelHi: "#273449", // slightly raised panel / hover
  ink: "#e2e8f0", // main text, axes
  muted: "#94a3b8", // labels, gridlines, captions
  faint: "#475569", // very quiet lines (grid, inactive)
  event: "#38bdf8", // Poisson events, new packets, pure-Aloha curve
  retry: "#f59e0b", // retransmitted packets
  success: "#22c55e", // delivered packet, ACK, "safe"
  collision: "#ef4444", // collisions, vulnerable window (fill at 20%)
  slotted: "#a78bfa", // slots, slotted-Aloha curve
  bus: "#facc15", // the bus, the "37%" callback highlight
} as const;

/** Non-semantic illustration tones for the real-life layer (people, set dressing). */
export const ILLUS = {
  commuterJacket: "#0d9488", // the Commuter: teal jacket
  talkerA: "#14b8a6", // walkie-talkie Talker A: teal
  talkerB: "#ea580c", // walkie-talkie Talker B: orange
  supervisor: "#64748b", // the listener: grey
  backpack: "#6b7280",
  pants: "#334155",
  shoes: "#0b1220",
  skin: ["#f1c7a5", "#d9a27e", "#a86f4c", "#7a4b30"] as const,
  hair: ["#1f2937", "#4b3621", "#7c2d12", "#d6d3d1"] as const,
  sky: "#16213a",
  skyLow: "#2a2f55",
  building: "#1b2740",
  buildingHi: "#22314f",
  windowLit: "#fde68a",
  windowDark: "#24324d",
  road: "#1a2234",
  roadLine: "#64748b",
  sidewalk: "#2b3648",
  glass: "rgba(148, 197, 255, 0.18)",
  metal: "#94a3b8",
  wood: "#a16207",
  ocean: "#0b3a53",
  sand: "#d6c08f",
  land: "#3f6b4f",
} as const;

export const FONT = {
  sans: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  math: '"STIX Two Text", "Times New Roman", Georgia, serif',
} as const;

/** Minimum sizes from the style guide. */
export const SIZE = {
  title: 56,
  caption: 28,
  label: 22,
  small: 18,
} as const;

export type PacketState = "attempt" | "retry" | "success" | "collision" | "ghost";

export const PACKET_COLORS: Record<PacketState, string> = {
  attempt: COLORS.event,
  retry: COLORS.retry,
  success: COLORS.success,
  collision: COLORS.collision,
  ghost: COLORS.muted,
};
