// Scene 09 — The rules
// Brief: scenes/s09-the-rules.md  ·  Shared brief: scenes/README.md  ·  Kit: src/shared/README.md
//
// Layout: the hub ring from Scene 08 opens centred, then eases to the right. The walkie-talkie pair sits in a
// real-life panel at the top left, and the three rule chips build up below it. The two halves run in sync:
// "Copy that" lands with the ✓ ACK, static on the left lands with the red collision on the right.
import React from "react";
import { useCurrentFrame } from "remotion";
import {
  COLORS,
  Die,
  FONT,
  HubAndTerminals,
  type HubTraffic,
  ILLUS,
  Mark,
  RuleChip,
  SceneFrame,
  Stage,
  Talker,
  Title,
  Waveform,
  clamp01,
  cue,
  fade,
  lerp,
  pop,
  prog,
} from "../shared";

/** Extra seconds of picture after the narration tail. The scene length updates automatically. */
export const meta = { extraTail: 1.5 };

// ── narration cues ────────────────────────────────────────────────────────────
const C = {
  intro: cue("s09", "Their solution"),
  r1: cue("s09", "Rule one"),
  send1: cue("s09", "send it. Right away"),
  mayI: cue("s09", "Don't ask permission"),
  checkFirst: cue("s09", "don't check first"),
  r2: cue("s09", "Rule two"),
  recv: cue("s09", "receives a packet cleanly"),
  ackWord: cue("s09", "called an acknowledgment"),
  copy: cue("s09", "copy that"),
  r3: cue("s09", "Rule three"),
  noAck: cue("s09", "If no acknowledgment comes back"),
  assume: cue("s09", "assume your packet collided"),
  wait: cue("s09", "Wait a random amount of time"),
  again: cue("s09", "send it again"),
};

// ── key frames derived from the cues ──────────────────────────────────────────
const MOVE = { start: C.intro + 66, dur: 40 }; // ring slides right after the opening line
const LEFT_IN = MOVE.start + 24; // walkie-talkie panel appears
// Rule 1: send immediately
const P1 = { start: C.send1, dur: 30 };
// Rule 2: clean packet → ACK → "copy that"
const P2 = { start: C.recv - 32, dur: 30 };
const ACK2 = { start: C.ackWord + 4, fly: C.copy - 30, end: C.copy + 10 }; // ACK forms at the hub, then flies
// Rule 3: collision → timer → die → retry → ACK
const P3 = { start: C.noAck - 22, dur: 26 };
const HIT = P3.start + P3.dur; // packets meet at the hub
const TIMER = { start: HIT + 14, end: C.assume + 16 };
const DIE = { start: C.wait + 4, dur: 40 };
const RETRY = { start: DIE.start + DIE.dur + 6, dur: 28 };
const ACK3 = { start: RETRY.start + RETRY.dur + 4, dur: 30 };
const DONE3 = ACK3.start + ACK3.dur;

// ── geometry ──────────────────────────────────────────────────────────────────
const RING0 = { cx: 640, cy: 380, r: 240 }; // exactly Scene 08's last frame
const RING1 = { cx: 990, cy: 392, r: 205 };
const N = 7;
const ME = 5; // our terminal (left side of the ring, nearest the split)
const OTHER = 1; // the terminal it collides with in Rule 3

const ringPt = (i: number, cx: number, cy: number, r: number) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / N;
  return { x: cx + r * Math.cos(a), y: cy + r * 0.78 * Math.sin(a) };
};
const ME1 = ringPt(ME, RING1.cx, RING1.cy, RING1.r);
const BADGE = { x: ME1.x, y: ME1.y - 82 }; // where ✓ / timer / die sit above our terminal

// Same curve HubAndTerminals uses for ACKs, so the "ACK" tag can ride along with the dot.
const ackPoint = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const c = { x: mx - (dy / len) * 40, y: my + (dx / len) * 40 };
  const u = 1 - t;
  return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y };
};

// Walkie-talkie panel (real-life layer)
const PANEL = { x: 24, y: 104, w: 690, h: 272 };
const GROUND = 362;
const A = { x: 150 };
const SUP = { x: 580 };
const PSCALE = 0.8;
const MOUTH_Y = GROUND - 0.8 * 196;
const HEAD_TOP = GROUND - 0.8 * 248;
const WAVE = { x: 205, w: 320, y: MOUTH_Y + 4 };

const CHIP_X = 40;
const CHIP_Y = [420, 490, 560];

// ── small local pieces ────────────────────────────────────────────────────────
const Bubble: React.FC<{
  x: number;
  y: number;
  text: string;
  start: number;
  end?: number;
  border?: string;
  /** Tail offset from centre, px (negative = left). */
  tail?: number;
  strike?: number;
  italic?: boolean;
}> = ({ x, y, text, start, end, border = COLORS.faint, tail = 0, strike = 0, italic }) => {
  const frame = useCurrentFrame();
  const a = fade(frame, start, 8, end, 10);
  if (a <= 0) return null;
  const s = 0.7 + 0.3 * Math.min(1.05, pop(frame, start));
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${s})`,
        transformOrigin: `calc(50% + ${tail}px) 100%`,
        opacity: a,
        background: COLORS.panelHi,
        border: `2.5px solid ${border}`,
        borderRadius: 16,
        padding: "6px 16px",
        fontFamily: FONT.sans,
        fontSize: 26,
        fontWeight: 600,
        fontStyle: italic ? "italic" : undefined,
        color: COLORS.ink,
        whiteSpace: "nowrap",
      }}
    >
      {text}
      <div
        style={{
          position: "absolute",
          left: `calc(50% + ${tail}px - 9px)`,
          bottom: -10,
          width: 16,
          height: 16,
          background: COLORS.panelHi,
          borderRight: `2.5px solid ${border}`,
          borderBottom: `2.5px solid ${border}`,
          transform: "rotate(45deg)",
        }}
      />
      {strike > 0 ? (
        <div
          style={{
            position: "absolute",
            left: "6%",
            top: "50%",
            width: `${88 * clamp01(strike)}%`,
            height: 4,
            borderRadius: 2,
            background: COLORS.ink,
            transform: "rotate(-8deg)",
            transformOrigin: "left center",
          }}
        />
      ) : null}
    </div>
  );
};

/** Four-point sparkle for the "cheeky" title. */
const Sparkle: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => {
  if (k <= 0) return null;
  const s = Math.sin(clamp01(k) * Math.PI);
  return (
    <g transform={`translate(${x} ${y}) rotate(${k * 90}) scale(${s})`} opacity={s}>
      <path d="M 0 -18 Q 3 -3 18 0 Q 3 3 0 18 Q -3 3 -18 0 Q -3 -3 0 -18 Z" fill={COLORS.ink} />
    </g>
  );
};

/** A countdown ring that drains from full to empty. */
const Timer: React.FC<{ x: number; y: number; k: number; opacity: number }> = ({ x, y, k, opacity }) => {
  const r = 20;
  const L = 2 * Math.PI * r;
  return (
    <g opacity={opacity}>
      <circle cx={x} cy={y} r={r} fill={COLORS.panel} stroke={COLORS.faint} strokeWidth={5} />
      <circle
        cx={x}
        cy={y}
        r={r}
        fill="none"
        stroke={COLORS.ink}
        strokeWidth={5}
        strokeDasharray={`${L * (1 - clamp01(k))} ${L}`}
        transform={`rotate(-90 ${x} ${y})`}
        strokeLinecap="round"
      />
    </g>
  );
};

/** An expanding ring at the hub: green = received cleanly, red = collision. */
const Pulse: React.FC<{ x: number; y: number; k: number; color: string; big?: boolean }> = ({ x, y, k, color, big }) => {
  if (k <= 0 || k >= 1) return null;
  return (
    <circle
      cx={x}
      cy={y}
      r={(big ? 40 : 50) + (big ? 90 : 55) * k}
      fill={big ? color : "none"}
      fillOpacity={big ? 0.18 * (1 - k) : 0}
      stroke={color}
      strokeWidth={big ? 8 : 5}
      opacity={1 - k}
    />
  );
};

// ── the scene ─────────────────────────────────────────────────────────────────
export const S09TheRules: React.FC = () => {
  const frame = useCurrentFrame();

  // Ring: open on Scene 08's ring, then ease right to make room.
  const mv = prog(frame, MOVE.start, MOVE.dur);
  const cx = lerp(RING0.cx, RING1.cx, mv);
  const cy = lerp(RING0.cy, RING1.cy, mv);
  const r = lerp(RING0.r, RING1.r, mv);
  const hub = { x: cx, y: cy };
  const me = ringPt(ME, cx, cy, r);

  // ── traffic ──
  const traffic: HubTraffic[] = [];
  const packet = (i: number, start: number, dur: number, color: string, stopAt = 0.9, hold = 0) => {
    if (frame < start || frame > start + dur + hold) return;
    traffic.push({ i, p: prog(frame, start, dur) * stopAt, color });
  };
  packet(ME, P1.start, P1.dur, COLORS.event);
  packet(ME, P2.start, P2.dur, COLORS.event);
  // Rule 3: two new packets meet at the hub and turn red.
  const red = prog(frame, HIT - 8, 10);
  const hitColor = red > 0.5 ? COLORS.collision : COLORS.event;
  packet(ME, P3.start, P3.dur, hitColor, 0.72, 12);
  packet(OTHER, P3.start + 2, P3.dur - 2, hitColor, 0.72, 12);
  packet(ME, RETRY.start, RETRY.dur, COLORS.retry);

  // The ACK pops out just beside the hub on "acknowledgment", waits, then flies to land with "copy that".
  const ack2 = frame < ACK2.fly ? 0.3 * prog(frame, ACK2.start, 12) : lerp(0.3, 1, prog(frame, ACK2.fly, ACK2.end - ACK2.fly));
  const ack3 = prog(frame, ACK3.start, ACK3.dur);
  if (frame >= ACK2.start && frame < ACK2.end) traffic.push({ i: ME, p: ack2, kind: "ack" });
  if (frame >= ACK3.start && frame < DONE3) traffic.push({ i: ME, p: ack3, kind: "ack" });
  const ackTag =
    frame >= ACK2.start && frame < ACK2.end
      ? { t: ack2, a: fade(frame, ACK2.start, 6, ACK2.end - 8, 8) }
      : frame >= ACK3.start && frame < DONE3
        ? { t: ack3, a: fade(frame, ACK3.start, 6, DONE3 - 8, 8) }
        : null;

  // ── left layer: who's talking ──
  const talking = (s: number, e: number) => (frame >= s && frame < e ? Math.abs(Math.sin(frame / 2.6)) : 0);
  const aTalk = Math.max(
    talking(P1.start, P1.start + P1.dur),
    talking(P2.start, P2.start + P2.dur),
    talking(P3.start, HIT + 6),
    talking(RETRY.start, RETRY.start + RETRY.dur),
  );
  const supTalk = Math.max(talking(C.copy - 4, C.copy + 14), talking(ACK3.start + 12, DONE3 + 4));

  // A's outgoing waveform (teal = new, amber = retry), supervisor's reply (green = ACK).
  const waveA = (start: number, dur: number) => ({
    on: frame >= start && frame < start + dur + 14,
    progress: prog(frame, start, dur * 0.7),
    opacity: fade(frame, start, 4, start + dur, 12),
  });
  const w1 = waveA(P1.start, P1.dur);
  const w2 = waveA(P2.start, P2.dur);
  const w3 = { on: frame >= P3.start && frame < HIT + 40, progress: prog(frame, P3.start, 18), opacity: fade(frame, P3.start, 4, HIT + 22, 16) };
  const noise = prog(frame, HIT - 14, 14);
  const wR = waveA(RETRY.start, RETRY.dur);
  const reply = (start: number, dur: number) => ({
    on: frame >= start && frame < start + dur + 14,
    progress: prog(frame, start, dur),
    opacity: fade(frame, start, 4, start + dur, 12),
  });
  const rp2 = reply(C.copy - 4, 16);
  const rp3 = reply(ACK3.start + 12, ACK3.dur - 12);

  const leftIn = fade(frame, LEFT_IN, 18);
  const aExpr = frame >= TIMER.start && frame < DIE.start + DIE.dur ? "sigh" : frame >= DONE3 || (frame >= ACK2.end && frame < C.r3) ? "happy" : "neutral";

  // ── badges over our terminal and over Talker A ──
  const ok2 = prog(frame, ACK2.end - 2, 14);
  const ok2Out = 1 - prog(frame, C.r3 - 16, 14);
  const ok3 = prog(frame, DONE3 - 2, 14);
  const timerK = prog(frame, TIMER.start, TIMER.end - TIMER.start, (t) => t);
  const timerA = fade(frame, TIMER.start, 8, DIE.start - 6, 8);
  const cross = prog(frame, TIMER.end, 12);
  const crossA = 1 - prog(frame, DIE.start - 6, 8);
  const dieA = fade(frame, DIE.start, 6, ACK3.start + 6, 10);
  const dieRoll = prog(frame, DIE.start, DIE.dur, (t) => t);

  // ── chips: the current rule is bright, earlier ones dim, all bright at the end ──
  const chipOp = (k: number) => {
    const startOf = [C.r1, C.r2, C.r3][k];
    const next = [C.r2, C.r3, null][k];
    const dim = next === null ? 0 : prog(frame, next, 12);
    const back = prog(frame, DONE3, 16);
    return frame < startOf ? 1 : 1 - 0.5 * dim * (1 - back);
  };

  return (
    <SceneFrame id="s09">
      {/* left: real-life panel */}
      <Stage opacity={leftIn}>
        <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx={18} fill={COLORS.panel} />
        <rect x={PANEL.x} y={GROUND} width={PANEL.w} height={PANEL.y + PANEL.h - GROUND} fill={ILLUS.sidewalk} opacity={0.6} />
        {/* outgoing speech from A */}
        {w1.on ? <Waveform x={WAVE.x} y={WAVE.y} width={WAVE.w} amp={18} color={ILLUS.talkerA} progress={w1.progress} opacity={w1.opacity} phase={frame / 8} /> : null}
        {w2.on ? <Waveform x={WAVE.x} y={WAVE.y} width={WAVE.w} amp={18} color={ILLUS.talkerA} progress={w2.progress} opacity={w2.opacity} phase={frame / 8} /> : null}
        {w3.on ? (
          <>
            <Waveform x={WAVE.x} y={WAVE.y} width={WAVE.w} amp={18} color={ILLUS.talkerA} progress={w3.progress} opacity={w3.opacity * (1 - noise)} phase={frame / 8} />
            <Waveform x={WAVE.x} y={WAVE.y} width={WAVE.w} amp={24} color={COLORS.collision} noise={1} progress={w3.progress} opacity={w3.opacity * noise} phase={frame / 8} seed="s09-static" />
          </>
        ) : null}
        {wR.on ? <Waveform x={WAVE.x} y={WAVE.y} width={WAVE.w} amp={18} color={COLORS.retry} progress={wR.progress} opacity={wR.opacity} phase={frame / 8} /> : null}
        {/* the supervisor's "copy that" flows back (mirrored) */}
        <g transform={`translate(${2 * WAVE.x + WAVE.w} 0) scale(-1 1)`}>
          {rp2.on ? <Waveform x={WAVE.x} y={WAVE.y} width={WAVE.w} amp={14} color={COLORS.success} progress={rp2.progress} opacity={rp2.opacity} phase={frame / 8} /> : null}
          {rp3.on ? <Waveform x={WAVE.x} y={WAVE.y} width={WAVE.w} amp={14} color={COLORS.success} progress={rp3.progress} opacity={rp3.opacity} phase={frame / 8} /> : null}
        </g>
        <Talker who="A" x={A.x} y={GROUND} scale={PSCALE} talk={aTalk} expression={aExpr} />
        <Talker who="supervisor" x={SUP.x} y={GROUND} scale={PSCALE} facing={-1} talk={supTalk} />
        {/* ✓ over Talker A, in sync with the ACK landing on the right */}
        {frame >= ACK2.end - 2 && frame < C.r3 ? <Mark x={A.x} y={HEAD_TOP - 34} progress={ok2} opacity={ok2Out} size={44} /> : null}
        {frame >= DONE3 - 2 ? <Mark x={A.x} y={HEAD_TOP - 34} progress={ok3} size={44} /> : null}
        {/* A rolls a die too: the pause before the resend */}
        {dieA > 0 ? <Die x={A.x + 92} y={GROUND - 36} value={4} roll={dieRoll} size={40} seed="s09-die" opacity={dieA} /> : null}
      </Stage>

      {/* right: the hub ring */}
      <Stage>
        <HubAndTerminals
          cx={cx}
          cy={cy}
          radius={r}
          n={N}
          terminal="terminal"
          hubLabel="hub"
          traffic={traffic}
          highlight={frame >= C.r1 ? [ME] : []}
        />
        <Pulse x={hub.x} y={hub.y} k={prog(frame, P2.start + P2.dur, 22)} color={COLORS.success} />
        <Pulse x={hub.x} y={hub.y} k={prog(frame, RETRY.start + RETRY.dur, 22)} color={COLORS.success} />
        <Pulse x={hub.x} y={hub.y - 10} k={prog(frame, HIT, 26)} color={COLORS.collision} big />
        {ackTag ? (() => {
          const q = ackPoint(hub, me, ackTag.t);
          return (
            <text x={q.x} y={q.y - 24} fill={COLORS.success} fontFamily={FONT.sans} fontSize={22} fontWeight={800} textAnchor="middle" opacity={ackTag.a}>
              ACK
            </text>
          );
        })() : null}
        {/* badges above our terminal */}
        {frame >= ACK2.end - 2 && frame < C.r3 ? <Mark x={BADGE.x} y={BADGE.y} progress={ok2} opacity={ok2Out} size={44} /> : null}
        {timerA > 0 ? <Timer x={BADGE.x} y={BADGE.y} k={timerK} opacity={timerA * (1 - cross)} /> : null}
        {frame >= TIMER.end ? <Mark x={BADGE.x} y={BADGE.y} kind="cross" progress={cross} opacity={crossA} size={44} /> : null}
        {dieA > 0 ? <Die x={BADGE.x} y={BADGE.y} value={4} roll={dieRoll} size={40} seed="s09-die" opacity={dieA} /> : null}
        {frame >= DONE3 - 2 ? <Mark x={BADGE.x} y={BADGE.y} progress={ok3} size={44} /> : null}
        {/* title sparkle */}
        <Sparkle x={468} y={40} k={prog(frame, C.intro + 22, 36)} />
      </Stage>

      {/* "no ACK" label next to the timer */}
      {timerA > 0 ? (
        <div
          style={{
            position: "absolute",
            left: BADGE.x - 34,
            top: BADGE.y,
            transform: "translate(-100%, -50%)",
            opacity: timerA,
            fontFamily: FONT.sans,
            fontSize: 22,
            fontWeight: 600,
            color: COLORS.muted,
          }}
        >
          no ACK…
        </div>
      ) : null}

      <Title x={40} y={52} anchor="left" start={C.intro + 4}>
        The Aloha rules
      </Title>

      {/* speech bubbles (left panel) */}
      <div style={{ position: "absolute", inset: 0, opacity: leftIn }}>
        <Bubble x={A.x + 70} y={HEAD_TOP - 30} text="May I?" start={C.mayI} end={C.r2 - 10} tail={-60} strike={prog(frame, C.checkFirst - 4, 12)} italic />
        <Bubble x={A.x + 110} y={HEAD_TOP - 30} text="Truck's here, over." start={P2.start} end={C.ackWord - 6} border={ILLUS.talkerA} tail={-100} />
        <Bubble x={SUP.x - 60} y={HEAD_TOP - 30} text="Copy that." start={C.copy - 2} end={C.r3 - 14} border={COLORS.success} tail={50} />
        <Bubble x={SUP.x - 10} y={HEAD_TOP - 30} text="…" start={TIMER.start} end={DIE.start} tail={0} />
        <Bubble x={A.x + 110} y={HEAD_TOP - 30} text="Truck's here, over." start={RETRY.start} end={ACK3.start + 10} border={COLORS.retry} tail={-100} />
        <Bubble x={SUP.x - 60} y={HEAD_TOP - 30} text="Copy that." start={ACK3.start + 12} border={COLORS.success} tail={50} />
      </div>

      {/* rule chips */}
      <RuleChip n={1} x={CHIP_X} y={CHIP_Y[0]} start={C.r1} color={COLORS.event} opacity={chipOp(0)}>
        Send immediately
      </RuleChip>
      <RuleChip n={2} x={CHIP_X} y={CHIP_Y[1]} start={C.r2} color={COLORS.success} opacity={chipOp(1)}>
        Hub replies with an ACK <span style={{ color: COLORS.muted, fontSize: 22 }}>(acknowledgment)</span>
      </RuleChip>
      <RuleChip n={3} x={CHIP_X} y={CHIP_Y[2]} start={C.r3} color={COLORS.retry} opacity={chipOp(2)}>
        No ACK? → wait a random time → resend
      </RuleChip>
    </SceneFrame>
  );
};
