// Scene 06 — Sharing a channel, and collisions
// Brief: scenes/s06-collisions.md  ·  Shared brief: scenes/README.md  ·  Kit: src/shared/README.md
//
// Beats: radio ripples (from 05) flatten into one shared channel band that several devices hang off →
// walkie-talkies: Talker A, the supervisor, Talker B, all on CH 1 → A talks, a clean ribbon reaches everyone →
// A and B talk at once, the ribbons pile into static, the supervisor winces → the ribbons straighten into two
// overlapping packet bars on the channel band → red flash, COLLISION → both shatter → ✗ ✗.
import React from "react";
import { interpolateColors, useCurrentFrame } from "remotion";
import {
  ChannelBand,
  clamp01,
  COLORS,
  cue,
  EASE,
  fade,
  FONT,
  ILLUS,
  Label,
  lerp,
  Mark,
  PacketBar,
  pop,
  prog,
  SceneFrame,
  Stage,
  Stamp,
  Talker,
  timeScale,
  Waveform,
} from "../shared";

/** Extra seconds of picture after the narration tail. The scene length updates automatically. */
export const meta = { extraTail: 0.6 };

const ID = "s06";
const BAND_Y = 360;
const GROUND_Y = 640;
const PERSON_SCALE = 1.05;
const RIBBON_Y = 300;

// The cast: A (teal) on the left, the listening supervisor in the middle, B (orange) on the right.
const A_X = 210;
const SUP_X = 640;
const B_X = 1070;
// Walkie-talkie position (front hand of pose "walkie", relative [26, -194]) for each person.
const walkie = (x: number, facing: 1 | -1) => ({ x: x + 26 * PERSON_SCALE * facing, y: GROUND_Y - 194 * PERSON_SCALE });
const WA = walkie(A_X, 1);
const WB = walkie(B_X, -1);
const WS = walkie(SUP_X, 1);

/**
 * The opening radio ripples, centred on the channel band. `frame` is Scene 06's frame (negative values continue
 * the cycle backwards), so Scene 05's ending can draw the very same rings and hand off without a jump.
 */
/**
 * Scene 06's final picture, frozen: the red-flashed channel band with the two shattered packets, both ✗ marks,
 * the label and the COLLISION stamp. Scene 07 opens on this and fades it out (the hand-off).
 */
export const S06Closing: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <>
    <Stage opacity={opacity}>
      <ChannelBand y={BAND_Y} h={120} glow={1} color={COLORS.event} />
      <PacketBar scale={SC} start={BAR_A.start} y={BAR_A.y - 20} h={BAR_H} state="attempt" toState="collision" mix={1} shatter={0.2} seed="s06-shA" />
      <PacketBar scale={SC} start={BAR_B.start} y={BAR_B.y + 20} h={BAR_H} state="attempt" toState="collision" mix={1} shatter={0.2} seed="s06-shB" />
      <Mark x={SC(BAR_A.start + 0.5)} y={BAR_A.y - 20 - 70} kind="cross" size={56} progress={1} />
      <Mark x={SC(BAR_B.start + 0.5)} y={BAR_B.y + 20 + 70} kind="cross" size={56} progress={1} />
    </Stage>
    <Label x={120} y={BAND_Y - 84} anchor="left" size={28} color={COLORS.muted} opacity={opacity}>
      shared channel
    </Label>
    <Stamp x={640} y={170} size={56} opacity={opacity}>
      COLLISION
    </Stamp>
  </>
);

export const OpeningRipples: React.FC<{ frame: number; flatten?: number; cx?: number; cy?: number; opacity?: number }> = ({
  frame,
  flatten = 0,
  cx = 640,
  cy = BAND_Y,
  opacity = 1,
}) => (
  <g opacity={opacity}>
    {[0, 1, 2, 3, 4].map((k) => {
      const u = ((frame / 34 + k / 5) % 1 + 1) % 1;
      const r = 40 + u * 520;
      return (
        <ellipse
          key={k}
          cx={cx}
          cy={cy}
          rx={r}
          ry={r * lerp(1, 0.04, EASE(flatten))}
          fill="none"
          stroke={COLORS.event}
          strokeWidth={4}
          opacity={(1 - u) * clamp01(u * 6) * (1 - flatten)}
        />
      );
    })}
  </g>
);

// Devices hanging off the shared channel in the opening beat.
const DEVICES = [
  { x: 230, up: true },
  { x: 430, up: false },
  { x: 610, up: true },
  { x: 800, up: false },
  { x: 990, up: true },
  { x: 1120, up: false },
];

// The channel timeline for the collision: two overlapping 1-frame-time packets.
const SC = timeScale(0, 6, 140, 1140);
const BAR_A = { start: 2.0, y: BAND_Y - 26 };
const BAR_B = { start: 2.55, y: BAND_Y + 26 };
const BAR_H = 40;

const DeviceGlyph: React.FC<{ i: number }> = ({ i }) => {
  const s = { stroke: COLORS.ink, strokeWidth: 2.5, fill: "none", strokeLinejoin: "round" as const };
  return i % 2 === 0 ? (
    <g>
      <rect x={-8} y={-14} width={16} height={28} rx={3} {...s} />
      <line x1={-3} y1={9} x2={3} y2={9} {...s} />
    </g>
  ) : (
    <g>
      <rect x={-13} y={-11} width={26} height={17} rx={2} {...s} />
      <path d="M -17 10 H 17 L 14 6 H -14 Z" {...s} />
    </g>
  );
};

/** The little LCD on each walkie-talkie: "CH 1". */
const ChannelChip: React.FC<{ x: number; y: number; p: number }> = ({ x, y, p }) =>
  p > 0.01 ? (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${p})`,
        padding: "4px 12px",
        borderRadius: 8,
        background: "#0b1220",
        border: `2px solid ${COLORS.faint}`,
        fontFamily: "Menlo, Monaco, monospace",
        fontWeight: 700,
        fontSize: 22,
        color: COLORS.ink,
        letterSpacing: "0.08em",
        whiteSpace: "nowrap",
      }}
    >
      CH 1
    </div>
  ) : null;

/** A speech bubble with a tail pointing down at (x, y + h/2 + tail). */
const Bubble: React.FC<{ x: number; y: number; p: number; children: React.ReactNode; size?: number; color?: string }> = ({
  x,
  y,
  p,
  children,
  size = 32,
  color = COLORS.bg,
}) =>
  p > 0.01 ? (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${p})`,
        transformOrigin: "50% 100%",
        opacity: Math.min(1, p),
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "12px 24px",
          borderRadius: 22,
          background: COLORS.ink,
          color,
          fontFamily: FONT.sans,
          fontWeight: 700,
          fontSize: size,
          whiteSpace: "nowrap",
          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        }}
      >
        {children}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: -14,
            marginLeft: -12,
            width: 0,
            height: 0,
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderTop: `16px solid ${COLORS.ink}`,
          }}
        />
      </div>
    </div>
  ) : null;

/** A Waveform that grows from right to left (B's speech travels leftwards). */
const MirroredWave: React.FC<React.ComponentProps<typeof Waveform>> = (p) => (
  <g transform={`translate(${2 * (p.x + p.width / 2)} 0) scale(-1 1)`}>
    <Waveform {...p} />
  </g>
);

export const S06Collisions: React.FC = () => {
  const frame = useCurrentFrame();

  // ── cues
  const cMany = cue(ID, "Many devices often share one channel");
  const cShare = cue(ID, "share one channel");
  const cWalkie = cue(ID, "Think of a walkie-talkie");
  const cFreq = cue(ID, "Everyone is on the same frequency");
  const cOne = cue(ID, "If one person talks");
  const cHears = cue(ID, "everybody hears them clearly");
  const cTwo = cue(ID, "But if two people talk at the same moment");
  const cPile = cue(ID, "pile on top of each other");
  const cHear = cue(ID, "all you hear is noise");
  const cNetworking = cue(ID, "In networking, that's called a collision");
  const cCollision = cue(ID, "called a collision", "end");
  const cLost = cue(ID, "both packets are lost");
  const cNotJust = cue(ID, "Not just one");
  const cBoth = cue(ID, "Both.");

  // ── opening: ripples flatten into the shared channel, devices hang off it
  const flatten = prog(frame, cShare - 6, 26);
  const openOut = 1 - prog(frame, cWalkie - 4, 12);
  const bandOpen = prog(frame, cShare, 22);

  // ── walkie-talkie stage
  const castIn = fade(frame, cWalkie - 2, 14);
  const castOut = 1 - prog(frame, cNetworking, 18);
  const aTalks1 = frame >= cOne && frame < cHears + 40;
  const bothTalk = frame >= cTwo + 8 && frame < cNetworking + 4;
  const mouth = (on: boolean, k: number) => (on ? 0.5 + 0.5 * Math.sin(frame * 0.9 + k) : 0);
  const ribbon1 = prog(frame, cOne + 10, 28);
  const ribbon1Out = 1 - prog(frame, cTwo - 10, 12);
  const clearBubble = pop(frame, cHears + 6) * (1 - prog(frame, cTwo - 8, 10));
  const ribbon2 = prog(frame, cTwo + 12, 30);
  const noise = prog(frame, cPile, 26);
  const staticBubble = pop(frame, cHear - 14);
  const wince = frame >= cPile + 20;

  // ── bridge: ribbons straighten and become two packet bars on the band
  const straighten = prog(frame, cNetworking, 16);
  const morph = prog(frame, cNetworking + 14, 24);
  const bandBack = prog(frame, cNetworking + 4, 18);
  const edgeLife = 1 - prog(frame, cCollision - 16, 12);
  const red = prog(frame, cCollision - 6, 8);
  const flash = clamp01(1 - Math.abs(frame - (cCollision + 2)) / 8);
  const breakP = prog(frame, cLost + 30, 26);
  const shatter = 0.2 * breakP; // held part-way: two broken bars stay readable
  // As they break, the two bars drift apart vertically so each wreck reads on its own.
  const spread = 20 * EASE(breakP);
  const yA = BAR_A.y - spread;
  const yB = BAR_B.y + spread;

  // ribbon → bar geometry
  const barGeom = (line: { x0: number; x1: number }, bar: { start: number; y: number }) => {
    const m = EASE(morph);
    return {
      x: lerp(line.x0, SC(bar.start), m),
      w: lerp(line.x1 - line.x0, SC.px, m),
      y: lerp(RIBBON_Y, bar.y, m),
      h: lerp(5, BAR_H, m),
    };
  };
  const lineA = { x0: WA.x, x1: SUP_X - 10 };
  const lineB = { x0: SUP_X + 10, x1: WB.x };

  return (
    <SceneFrame id={ID}>
      {/* ── opening: ripples → channel band, devices on it */}
      {openOut > 0 ? (
        <Stage opacity={openOut}>
          <OpeningRipples frame={frame} flatten={flatten} />
          <ChannelBand y={BAND_Y} h={64} progress={1} opacity={bandOpen} glow={1} />
          {DEVICES.map((d, i) => {
            const p = pop(frame, cMany + 6 + i * 5);
            if (p <= 0.01) return null;
            const dy = d.up ? -150 : 150;
            const link = prog(frame, cShare + 4 + i * 3, 14);
            return (
              <g key={i}>
                <line
                  x1={d.x}
                  y1={BAND_Y + dy * 0.78}
                  x2={d.x}
                  y2={lerp(BAND_Y + dy * 0.78, BAND_Y + (d.up ? -32 : 32), link)}
                  stroke={COLORS.event}
                  strokeWidth={3}
                  strokeDasharray="2 8"
                  strokeLinecap="round"
                  opacity={0.8}
                />
                <g transform={`translate(${d.x} ${BAND_Y + dy}) scale(${p})`}>
                  <circle r={30} fill={COLORS.panel} stroke={COLORS.event} strokeWidth={3} />
                  <DeviceGlyph i={i} />
                </g>
              </g>
            );
          })}
        </Stage>
      ) : null}
      {openOut > 0 ? (
        <Label x={120} y={BAND_Y - 52} anchor="left" size={28} color={COLORS.muted} opacity={bandOpen * openOut}>
          shared channel
        </Label>
      ) : null}

      {/* ── walkie-talkies */}
      {castIn > 0 && castOut > 0 ? (
        <>
          <Stage opacity={castIn * castOut}>
            <rect x={0} y={GROUND_Y - 20} width={1280} height={720 - GROUND_Y + 20} fill={COLORS.panel} />
            <rect x={0} y={GROUND_Y - 20} width={1280} height={4} fill={COLORS.panelHi} />
            <Talker who="A" x={A_X} y={GROUND_Y} scale={PERSON_SCALE} facing={1} talk={mouth(aTalks1 || bothTalk, 0)} expression={aTalks1 ? "happy" : "neutral"} />
            <Talker
              who="supervisor"
              x={SUP_X}
              y={GROUND_Y}
              scale={PERSON_SCALE}
              facing={1}
              expression={wince ? "annoyed" : "neutral"}
            />
            <Talker who="B" x={B_X} y={GROUND_Y} scale={PERSON_SCALE} facing={-1} talk={mouth(bothTalk, 1.7)} />
          </Stage>
          <ChannelChip x={WA.x} y={WA.y - 52} p={pop(frame, cFreq + 6) * castOut} />
          <ChannelChip x={WS.x} y={WS.y - 52} p={pop(frame, cFreq + 12) * castOut} />
          <ChannelChip x={WB.x} y={WB.y - 52} p={pop(frame, cFreq + 18) * castOut} />
          <Bubble x={SUP_X} y={150} p={clearBubble * castOut}>
            Truck’s here!
          </Bubble>
          <Bubble x={B_X - 30} y={175} p={pop(frame, cHears + 14) * (1 - prog(frame, cTwo - 8, 10)) * castOut} size={24}>
            Truck’s here!
          </Bubble>
          <Bubble x={SUP_X} y={150} p={staticBubble * castOut} color={COLORS.collision} size={40}>
            #&amp;%@!
          </Bubble>
        </>
      ) : null}

      {/* ── speech ribbons (clean, then two at once → static), straightening into lines */}
      <Stage>
        {ribbon1 > 0 && ribbon1Out > 0 ? (
          <Waveform x={WA.x} y={RIBBON_Y} width={B_X - 40 - WA.x} progress={ribbon1} color={ILLUS.talkerA} phase={frame / 8} opacity={ribbon1Out} seed="s06-a1" />
        ) : null}
        {ribbon2 > 0 && morph < 1 ? (
          <g opacity={1 - clamp01(morph * 1.6)}>
            <Waveform
              x={lineA.x0}
              y={RIBBON_Y}
              width={lineA.x1 - lineA.x0}
              progress={ribbon2}
              color={ILLUS.talkerA}
              noise={noise * (1 - straighten)}
              amp={26 * (1 - straighten)}
              phase={frame / 8}
              seed="s06-a2"
            />
            <MirroredWave
              x={lineB.x0}
              y={RIBBON_Y}
              width={lineB.x1 - lineB.x0}
              progress={ribbon2}
              color={ILLUS.talkerB}
              noise={noise * (1 - straighten)}
              amp={26 * (1 - straighten)}
              phase={frame / 8 + 2}
              seed="s06-b2"
            />
            {noise > 0 ? (
              <Waveform
                x={SUP_X - 150}
                y={RIBBON_Y}
                width={300}
                color={COLORS.ink}
                noise={1}
                amp={40 * (1 - straighten)}
                phase={frame / 6}
                strokeWidth={3}
                opacity={noise * 0.85 * (1 - straighten)}
                seed="s06-mix"
              />
            ) : null}
          </g>
        ) : null}
      </Stage>

      {/* ── the channel band, the two packets, the collision */}
      {bandBack > 0 ? (
        <Stage>
          <ChannelBand y={BAND_Y} h={120} opacity={bandBack} glow={1 + flash} color={flash > 0 ? interpolateColors(flash, [0, 1], [COLORS.event, COLORS.collision]) : COLORS.event} />
          {([
            { bar: BAR_A, y: yA, line: lineA, edge: ILLUS.talkerA, seed: "s06-shA" },
            { bar: BAR_B, y: yB, line: lineB, edge: ILLUS.talkerB, seed: "s06-shB" },
          ] as const).map(({ bar, y, line, edge, seed }, i) => {
            if (morph <= 0) return null;
            if (morph < 1) {
              const g = barGeom(line, bar);
              const fill = interpolateColors(morph, [0, 0.6, 1], [edge, edge, COLORS.event]);
              return (
                <g key={i}>
                  <rect x={g.x} y={g.y - g.h / 2} width={g.w} height={g.h} rx={Math.min(10, g.h / 2)} fill={fill} />
                  <rect x={g.x} y={g.y - g.h / 2} width={g.w} height={g.h} rx={Math.min(10, g.h / 2)} fill="none" stroke={edge} strokeWidth={4} />
                </g>
              );
            }
            return (
              <PacketBar
                key={i}
                scale={SC}
                start={bar.start}
                y={y}
                h={BAR_H}
                state="attempt"
                toState="collision"
                mix={red}
                edge={edgeLife > 0.5 ? edge : undefined}
                shatter={shatter}
                seed={seed}
              />
            );
          })}
          {frame >= cNotJust ? <Mark x={SC(BAR_A.start + 0.5)} y={yA - 70} kind="cross" size={56} progress={prog(frame, cNotJust + 4, 14)} /> : null}
          {frame >= cBoth - 6 ? <Mark x={SC(BAR_B.start + 0.5)} y={yB + 70} kind="cross" size={56} progress={prog(frame, cBoth - 4, 14)} /> : null}
        </Stage>
      ) : null}
      {bandBack > 0 ? (
        <Label x={120} y={BAND_Y - 84} anchor="left" size={28} color={COLORS.muted} opacity={bandBack}>
          shared channel
        </Label>
      ) : null}
      {red > 0 ? <Stamp x={640} y={170} start={cCollision - 4} size={56}>COLLISION</Stamp> : null}
    </SceneFrame>
  );
};
