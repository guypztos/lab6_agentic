// One hub, many terminals around it, all sending on one shared frequency (Scenes 08, 09, 11, 12).
// Packets travel terminal → hub along the spokes; ACKs travel hub → terminal on a separate, curved green path
// (ALOHAnet's hub replied on a second frequency).
import React from "react";
import { COLORS, FONT, SIZE } from "../theme";
import { clamp01, lerp } from "../motion";

export type Pt = { x: number; y: number };

export type HubTraffic = {
  /** Terminal index. */
  i: number;
  /** 0..1 along the path (packet: terminal → hub; ack: hub → terminal). */
  p: number;
  kind?: "packet" | "ack";
  /** Packet colour (default event blue; retry amber; collision red). */
  color?: string;
};

export type HubAndTerminalsProps = {
  cx?: number;
  cy?: number;
  radius?: number;
  n?: number;
  /** Explicit terminal positions (overrides the ring). */
  positions?: Pt[];
  /** Morph from other positions (e.g. Hawaii-map markers) into the ring: 0 = at `from`, 1 = at ring/positions. */
  from?: Pt[];
  morph?: number;
  /** Pop-in of the whole diagram, 0..1. */
  appear?: number;
  /** Spokes' visibility, 0..1 (the shared frequency). */
  spokes?: number;
  spokeColor?: string;
  traffic?: HubTraffic[];
  terminal?: "terminal" | "phone" | "dot";
  hubLabel?: string;
  /** Terminal indices to highlight (bright ring). */
  highlight?: number[];
  opacity?: number;
};

const TerminalIcon: React.FC<{ kind: "terminal" | "phone" | "dot"; hi: boolean }> = ({ kind, hi }) => {
  const stroke = hi ? COLORS.ink : COLORS.muted;
  if (kind === "dot") return <circle r={12} fill={COLORS.panelHi} stroke={stroke} strokeWidth={3} />;
  if (kind === "phone")
    return (
      <g>
        <rect x={-13} y={-22} width={26} height={44} rx={6} fill={COLORS.panelHi} stroke={stroke} strokeWidth={3} />
        <rect x={-8} y={-15} width={16} height={26} rx={2} fill={COLORS.event} opacity={0.35} />
      </g>
    );
  // 1970s terminal: boxy screen on a keyboard base, little antenna
  return (
    <g>
      <line x1={14} y1={-26} x2={22} y2={-42} stroke={stroke} strokeWidth={3} strokeLinecap="round" />
      <circle cx={22} cy={-43} r={3} fill={stroke} />
      <rect x={-24} y={-26} width={48} height={34} rx={6} fill={COLORS.panelHi} stroke={stroke} strokeWidth={3} />
      <rect x={-17} y={-20} width={34} height={22} rx={3} fill={COLORS.success} opacity={0.28} />
      <rect x={-28} y={10} width={56} height={12} rx={4} fill={COLORS.panelHi} stroke={stroke} strokeWidth={3} />
    </g>
  );
};

const Hub: React.FC = () => (
  <g>
    {/* antenna mast */}
    <path d="M -22 30 L 0 -70 L 22 30" stroke={COLORS.ink} strokeWidth={4} fill="none" strokeLinejoin="round" />
    <path d="M -15 0 H 15 M -9 -30 H 9" stroke={COLORS.ink} strokeWidth={3} />
    <circle cx={0} cy={-74} r={6} fill={COLORS.collision} />
    <rect x={-46} y={26} width={92} height={40} rx={8} fill={COLORS.panelHi} stroke={COLORS.ink} strokeWidth={3} />
    <circle cx={-26} cy={46} r={8} fill="none" stroke={COLORS.muted} strokeWidth={3} />
    <circle cx={-2} cy={46} r={8} fill="none" stroke={COLORS.muted} strokeWidth={3} />
    <rect x={14} y={38} width={22} height={16} rx={3} fill={COLORS.success} opacity={0.35} />
  </g>
);

export const HubAndTerminals: React.FC<HubAndTerminalsProps> = ({
  cx = 640,
  cy = 360,
  radius = 230,
  n = 8,
  positions,
  from,
  morph = 1,
  appear = 1,
  spokes = 1,
  spokeColor = COLORS.event,
  traffic = [],
  terminal = "terminal",
  hubLabel,
  highlight = [],
  opacity = 1,
}) => {
  const ring: Pt[] =
    positions ??
    Array.from({ length: n }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return { x: cx + radius * Math.cos(a), y: cy + radius * 0.78 * Math.sin(a) };
    });
  const pts = ring.map((p, i) => (from?.[i] ? { x: lerp(from[i].x, p.x, morph), y: lerp(from[i].y, p.y, morph) } : p));
  const hub = { x: cx, y: cy };
  const s = clamp01(appear);

  // ACK path: a gentle curve offset to one side of the spoke.
  const ackPoint = (a: Pt, b: Pt, t: number): Pt => {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const c = { x: mx - (dy / len) * 40, y: my + (dx / len) * 40 };
    const u = 1 - t;
    return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y };
  };

  return (
    <g opacity={opacity}>
      {pts.map((p, i) => (
        <line
          key={`s${i}`}
          x1={p.x}
          y1={p.y}
          x2={hub.x}
          y2={hub.y}
          stroke={spokeColor}
          strokeWidth={3}
          strokeDasharray="2 10"
          strokeLinecap="round"
          opacity={0.55 * clamp01(spokes) * s}
        />
      ))}
      {traffic.map((tr, k) => {
        const p = pts[tr.i];
        if (!p) return null;
        const t = clamp01(tr.p);
        if (tr.kind === "ack") {
          const q = ackPoint(hub, p, t);
          return (
            <g key={`t${k}`} transform={`translate(${q.x} ${q.y})`}>
              <circle r={14} fill={COLORS.success} />
              <path d="M -6 0 L -1 5 L 7 -5" stroke={COLORS.bg} strokeWidth={3.5} fill="none" strokeLinecap="round" />
            </g>
          );
        }
        const x = lerp(p.x, hub.x, t);
        const y = lerp(p.y, hub.y, t);
        const ang = (Math.atan2(hub.y - p.y, hub.x - p.x) * 180) / Math.PI;
        return (
          <rect
            key={`t${k}`}
            x={-22}
            y={-10}
            width={44}
            height={20}
            rx={6}
            fill={tr.color ?? COLORS.event}
            transform={`translate(${x} ${y}) rotate(${ang})`}
          />
        );
      })}
      <g transform={`translate(${hub.x} ${hub.y}) scale(${s})`}>
        <Hub />
        {hubLabel ? (
          <text y={100} fill={COLORS.ink} fontFamily={FONT.sans} fontSize={SIZE.label} textAnchor="middle" fontWeight={600}>
            {hubLabel}
          </text>
        ) : null}
      </g>
      {pts.map((p, i) => (
        <g key={`n${i}`} transform={`translate(${p.x} ${p.y}) scale(${s})`}>
          {highlight.includes(i) ? <circle r={40} fill={COLORS.event} opacity={0.18} /> : null}
          <TerminalIcon kind={terminal} hi={highlight.includes(i)} />
        </g>
      ))}
    </g>
  );
};
