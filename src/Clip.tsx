import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";

// Pure (Poisson) ALOHA test visual: packets arrive as a Poisson process with offered
// load G, each lasting one packet-time T. Any two packets whose start times are less
// than T apart collide (the 2T vulnerable period), so both are lost.

const COLORS = {
  bg: "#0f172a",
  track: "#1e293b",
  text: "#e2e8f0",
  muted: "#94a3b8",
  sending: "#38bdf8",
  success: "#4ade80",
  collision: "#f87171",
};
const FONT = "Helvetica, Arial, sans-serif";

const G = 0.5; // offered load: packets per packet-time, all nodes combined
const NODES = 4;
const SPAN_T = 16; // timeline length, in packet-times
const LEFT = 170;
const RIGHT = 1220;
const PX_PER_T = (RIGHT - LEFT) / SPAN_T;
const SEED = "aloha";

const NODE_Y0 = 180;
const NODE_DY = 70;
const ROW_H = 44;
const CHANNEL_Y = NODE_Y0 + NODES * NODE_DY + 20;
const CHANNEL_H = 56;
const AXIS_Y = CHANNEL_Y + CHANNEL_H + 16;

type Packet = { node: number; start: number; collidesAt: number | null };

const makePackets = (): Packet[] => {
  const arrivals: { node: number; start: number }[] = [];
  const nodeFreeAt = new Array(NODES).fill(0);
  let t = 0;
  for (let k = 0; ; k++) {
    t += -Math.log(1 - random(`${SEED}-gap-${k}`)) / G; // exponential inter-arrival
    if (t > SPAN_T - 1) break;
    // Give the packet to a random idle node so one row never shows overlapping bars.
    const idle = [...Array(NODES).keys()].filter((n) => nodeFreeAt[n] <= t);
    const pool = idle.length ? idle : [...Array(NODES).keys()];
    const node = pool[Math.floor(random(`${SEED}-node-${k}`) * pool.length)];
    nodeFreeAt[node] = t + 1;
    arrivals.push({ node, start: t });
  }
  return arrivals.map((p) => {
    const hits = arrivals.filter((q) => q !== p && Math.abs(q.start - p.start) < 1);
    const collidesAt = hits.length
      ? Math.min(...hits.map((q) => Math.max(p.start, q.start)))
      : null;
    return { ...p, collidesAt };
  });
};

const PACKETS = makePackets();

const colorAt = (p: Packet, now: number) => {
  if (p.collidesAt !== null && now >= p.collidesAt) return COLORS.collision;
  if (now >= p.start + 1) return COLORS.success;
  return COLORS.sending;
};

const Label: React.FC<{ y: number; h: number; children: React.ReactNode }> = ({
  y,
  h,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      left: 40,
      top: y,
      height: h,
      display: "flex",
      alignItems: "center",
      color: COLORS.muted,
      fontSize: 24,
    }}
  >
    {children}
  </div>
);

const Track: React.FC<{ y: number; h: number }> = ({ y, h }) => (
  <div
    style={{
      position: "absolute",
      left: LEFT,
      top: y,
      width: RIGHT - LEFT,
      height: h,
      borderRadius: 8,
      backgroundColor: COLORS.track,
    }}
  />
);

const Bar: React.FC<{ p: Packet; now: number; y: number; h: number; opacity: number }> = ({
  p,
  now,
  y,
  h,
  opacity,
}) => {
  const progress = Math.min(Math.max(now - p.start, 0), 1);
  if (progress <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: LEFT + p.start * PX_PER_T,
        top: y + 4,
        width: progress * PX_PER_T,
        height: h - 8,
        borderRadius: 6,
        backgroundColor: colorAt(p, now),
        opacity,
      }}
    />
  );
};

export const Clip: React.FC = () => {
  const frame = useCurrentFrame();
  // Playhead sweeps the whole timeline from frame 15 to frame 135, then holds.
  const now = interpolate(frame, [15, 135], [0, SPAN_T], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const delivered = PACKETS.filter((p) => p.collidesAt === null && now >= p.start + 1).length;
  const lost = PACKETS.filter((p) => p.collidesAt !== null && now >= p.collidesAt).length;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: FONT, color: COLORS.text }}>
      <div style={{ position: "absolute", left: 40, top: 36 }}>
        <div style={{ fontSize: 56, fontWeight: 700 }}>Poisson ALOHA</div>
        <div style={{ fontSize: 26, color: COLORS.muted, marginTop: 6 }}>
          Random arrivals on one shared channel
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 60,
          top: 50,
          padding: "14px 24px",
          borderRadius: 14,
          backgroundColor: COLORS.track,
          fontSize: 30,
        }}
      >
        S = G·e<sup style={{ fontSize: 20 }}>−2G</sup>
        <span style={{ color: COLORS.muted, fontSize: 24, marginLeft: 16 }}>G = {G}</span>
      </div>

      {[...Array(NODES).keys()].map((n) => (
        <div key={n}>
          <Label y={NODE_Y0 + n * NODE_DY} h={ROW_H}>
            Node {n + 1}
          </Label>
          <Track y={NODE_Y0 + n * NODE_DY} h={ROW_H} />
        </div>
      ))}
      <Label y={CHANNEL_Y} h={CHANNEL_H}>
        <span style={{ color: COLORS.text, fontWeight: 700 }}>Channel</span>
      </Label>
      <Track y={CHANNEL_Y} h={CHANNEL_H} />

      {PACKETS.map((p, i) => (
        <div key={i}>
          <Bar p={p} now={now} y={NODE_Y0 + p.node * NODE_DY} h={ROW_H} opacity={1} />
          <Bar p={p} now={now} y={CHANNEL_Y} h={CHANNEL_H} opacity={0.6} />
        </div>
      ))}

      {[...Array(SPAN_T + 1).keys()].map((i) => (
        <div key={i}>
          <div
            style={{
              position: "absolute",
              left: LEFT + i * PX_PER_T - 1,
              top: AXIS_Y,
              width: 2,
              height: i % 4 === 0 ? 14 : 8,
              backgroundColor: COLORS.muted,
            }}
          />
          {i % 4 === 0 && (
            <div
              style={{
                position: "absolute",
                left: LEFT + i * PX_PER_T - 30,
                top: AXIS_Y + 18,
                width: 60,
                textAlign: "center",
                fontSize: 20,
                color: COLORS.muted,
              }}
            >
              {i === 0 ? "0" : `${i}T`}
            </div>
          )}
        </div>
      ))}

      <div
        style={{
          position: "absolute",
          left: LEFT + now * PX_PER_T - 1,
          top: NODE_Y0 - 14,
          width: 2,
          height: AXIS_Y - NODE_Y0 + 14,
          backgroundColor: COLORS.text,
          opacity: 0.7,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: LEFT,
          top: 650,
          display: "flex",
          gap: 48,
          fontSize: 28,
        }}
      >
        <span style={{ color: COLORS.success }}>Delivered: {delivered}</span>
        <span style={{ color: COLORS.collision }}>Lost to collision: {lost}</span>
        <span style={{ color: COLORS.muted }}>Sent: {PACKETS.filter((p) => now > p.start).length}</span>
      </div>
    </AbsoluteFill>
  );
};
