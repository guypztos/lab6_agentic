// Scene 05 — What a network is
// Brief: scenes/s05-what-is-a-network.md  ·  Shared brief: scenes/README.md  ·  Kit: src/shared/README.md
//
// Beats: "Part 2" sting → bus stop (pocket docked) → devices light up as network nodes → zoom into the
// Commuter's phone, typing "Bus is late again 🙄" → the sent message becomes a long letter → chopped into 4
// chunks ("packets") → numbered postcards fly off and flatten into packet bars → packet 2 opens into bits →
// a square-wave signal → split: pulses along a copper wire / radio ripples from a phone.
import React from "react";
import { AbsoluteFill, interpolateColors, Sequence, useCurrentFrame } from "remotion";
import {
  BusStopStreet,
  clamp01,
  COLORS,
  Commuter,
  cue,
  EASE,
  fade,
  FONT,
  FormulaPocket,
  Label,
  lerp,
  PacketBar,
  PartSting,
  Phone,
  pop,
  prog,
  sceneDurationInFrames,
  SceneFrame,
  Stage,
  STREET,
  Timeline,
  timeScale,
  Title,
} from "../shared";
import { OpeningRipples } from "./S06Collisions";

/** Extra seconds of picture after the narration tail. The scene length updates automatically. */
export const meta = { extraTail: 0.9 };

const ID = "s05";
const STING = 54;
const MESSAGE = "Bus is late again 🙄";
const CHUNKS = ["Bus is", "late", "again", "🙄"];
const PAPER = "#f3eee4";
const PAPER_INK = "#1f2937";
const STAMP = "#9a3412";
const COPPER = "#c2773a";
// Top of the small phone on the right half (radio waves leave from here).
const RADIO_Y = 500 - 170 * 0.55;

// Where the Commuter's phone is on the street (pose "phone", facing right): the front hand.
const PHONE_AT = { x: STREET.commuter.x + 40, y: STREET.commuter.y - 146 };

// Network nodes on the street set (street coordinates).
const NODES = [
  { key: "phone", x: PHONE_AT.x, y: PHONE_AT.y, icon: "phone" as const },
  { key: "tower", x: STREET.towerTop.x, y: STREET.towerTop.y + 66, icon: "tower" as const },
  { key: "friend", x: 600, y: 236, icon: "phone" as const },
  { key: "laptop", x: 252, y: 386, icon: "laptop" as const },
  { key: "server", x: 78, y: 214, icon: "server" as const },
];
// Links: everything talks through the tower; the server also links to the laptop.
const LINKS: [number, number][] = [
  [0, 1],
  [2, 1],
  [3, 1],
  [4, 1],
  [4, 3],
];

// Packet-bar row: 1 frame time = 192 px.
const BAR_SCALE = timeScale(0, 5.2, 140, 1140);
const BAR_STARTS = [0.1, 1.35, 2.6, 3.85];
const BAR_Y = 480;
const BAR_H = 48;

// The letter (and its 4 chunks) before it is chopped.
const LETTER = { x: 200, y: 300, w: 880, h: 110 };
const CHUNK_W = LETTER.w / 4;
const TILT = [-7, 5, -4, 8];

// Bits of packet 2 ("late" in ASCII).
const BITS = "01101100011000010111010001100101";
const BIT_GROUPS = BITS.match(/.{8}/g)!.join(" ");

const Icon: React.FC<{ kind: "phone" | "laptop" | "server" | "tower" }> = ({ kind }) => {
  const s = { stroke: COLORS.ink, strokeWidth: 2.5, fill: "none", strokeLinejoin: "round" as const };
  if (kind === "phone")
    return (
      <g>
        <rect x={-8} y={-14} width={16} height={28} rx={3} {...s} />
        <line x1={-3} y1={9} x2={3} y2={9} {...s} />
      </g>
    );
  if (kind === "laptop")
    return (
      <g>
        <rect x={-13} y={-11} width={26} height={17} rx={2} {...s} />
        <path d="M -17 10 H 17 L 14 6 H -14 Z" {...s} />
      </g>
    );
  if (kind === "server")
    return (
      <g>
        {[-11, -2, 7].map((y) => (
          <g key={y}>
            <rect x={-13} y={y} width={26} height={7} rx={2} {...s} />
            <circle cx={8} cy={y + 3.5} r={1.4} fill={COLORS.ink} />
          </g>
        ))}
      </g>
    );
  return (
    <g>
      <path d="M -8 12 L 0 -12 L 8 12 M -5 4 H 5" {...s} />
      <path d="M -12 -10 Q -16 -4 -12 2 M 12 -10 Q 16 -4 12 2" {...s} />
    </g>
  );
};

/** Square-wave path for a bit string. */
function squarePath(bits: string, x0: number, bitW: number, yHi: number, yLo: number, repeat = 1): string {
  const all = bits.repeat(repeat);
  let d = "";
  let prev = "";
  for (let i = 0; i < all.length; i++) {
    const y = all[i] === "1" ? yHi : yLo;
    const x = x0 + i * bitW;
    if (i === 0) d += `M ${x} ${y} `;
    else if (all[i] !== prev) d += `L ${x} ${y} `;
    d += `L ${x + bitW} ${y} `;
    prev = all[i];
  }
  return d;
}

export const S05WhatIsANetwork: React.FC = () => {
  const frame = useCurrentFrame();

  // ── cues
  const cNetwork = cue(ID, "A network is just a group of devices");
  const cDevices = cue(ID, "devices");
  const cSending = cue(ID, "sending messages");
  const cLike = cue(ID, "Like a phone at that bus stop");
  const cTexting = cue(ID, "texting a friend");
  const cComputers = cue(ID, "Computers don't send a message in one piece");
  const cChop = cue(ID, "They chop it into small chunks");
  const cPackets = cue(ID, "called packets");
  const cPostcards = cue(ID, "like a long letter mailed as numbered postcards");
  const cNumbered = cue(ID, "numbered postcards");
  const cEach = cue(ID, "Each packet is a burst");
  const cOnes = cue(ID, "ones and zeros");
  const cSignal = cue(ID, "sent as a signal");
  const cPulses = cue(ID, "Pulses of electricity in a wire");
  const cRadio = cue(ID, "radio waves through the air");

  // ── street + network (sentences 0–1)
  const streetIn = fade(frame, STING - 12, 14);
  const dim = 0.55 * prog(frame, cNetwork, 16);
  const zoom = prog(frame, cLike, 26);
  const streetOut = 1 - prog(frame, cLike + 10, 16);
  // docked pocket from frame 0 (exactly as Scene 04 leaves it): the Part 2 sting fades in over it
  const pocket = 1 - prog(frame, cLike, 12);
  const netLabel = fade(frame, cNetwork + 6, 12, cLike, 10);

  // ── phone close-up (sentence 2–3)
  const phoneIn = prog(frame, cLike + 8, 20);
  const typed = prog(frame, cTexting - 8, cComputers - cTexting - 4, (t) => t);
  const sent = prog(frame, cComputers - 4, 14);
  const phoneOut = 1 - prog(frame, cComputers + 22, 16);
  const phoneX = lerp(640, 520, prog(frame, cComputers + 10, 20));

  // ── letter → chunks → postcards → packet bars (sentences 3–4)
  const letter = prog(frame, cComputers + 14, 20);
  const cut = prog(frame, cChop + 6, 14);
  const sep = prog(frame, cChop + 26, 18);
  const packetsLabel = pop(frame, cPackets + 8);
  const card = prog(frame, cPostcards - 2, 18);
  const flyStart = cNumbered;
  const flyT = (i: number) => prog(frame, flyStart + i * 5, 26);
  const barsDone = flyT(3) >= 1;

  // ── packet 2 opens into bits, then a signal (sentence 5)
  const open = prog(frame, cEach, 22);
  const bitsTyped = prog(frame, cOnes - 6, 28, (t) => t);
  const waveDraw = prog(frame, cSignal - 4, 30, (t) => t);
  const signalLabel = fade(frame, cSignal + 14, 12);

  // ── split: wire / radio (sentence 6)
  const split = prog(frame, cPulses - 4, 24);
  const radioIn = prog(frame, cRadio - 8, 18);

  // ── hand-off to Scene 06: wire, titles and phone fade; the radio glides to centre frame and its arcs become
  // Scene 06's full rings (drawn by Scene 06's own component, phase-continuous with its frame 0).
  const END = sceneDurationInFrames(ID, meta.extraTail);
  const outro = prog(frame, END - 26, 24);
  const glide = EASE(outro);
  const keep = 1 - outro;
  const scroll = Math.max(0, frame - (cPulses + 16)) * 4;

  // packet label position: above the chunks, then above the bars
  const labelY = lerp(206, 410, prog(frame, flyStart + 6, 24));

  // ── geometry helpers for the chunk/postcard/bar morph
  const chunkGeom = (i: number) => {
    const baseCx = LETTER.x + CHUNK_W * (i + 0.5) + (i - 1.5) * 34 * sep;
    const f = EASE(flyT(i));
    const barCx = BAR_SCALE(BAR_STARTS[i] + 0.5);
    const w0 = lerp(CHUNK_W, 200, card);
    const h0 = lerp(LETTER.h, 132, card);
    return {
      cx: lerp(baseCx, barCx, f),
      cy: lerp(LETTER.y, BAR_Y, f) - Math.sin(Math.PI * f) * (90 + 30 * i),
      w: lerp(w0, BAR_SCALE.px, f),
      h: lerp(h0, BAR_H, f),
      rot: lerp(TILT[i] * card, 0, f) + Math.sin(Math.PI * f) * (i % 2 ? -12 : 12),
      fill: interpolateColors(f, [0, 0.55, 1], [PAPER, PAPER, COLORS.event]),
      content: 1 - clamp01(f * 2.2),
      f,
    };
  };

  // packet-2 zoom geometry
  const p2 = (() => {
    const e = EASE(open);
    return {
      cx: lerp(BAR_SCALE(BAR_STARTS[1] + 0.5), 640, e),
      cy: lerp(BAR_Y, 250, e),
      w: lerp(BAR_SCALE.px, 860, e),
      h: lerp(BAR_H, 96, e),
    };
  })();
  const zoomOut = 1 - prog(frame, cPulses - 4, 16);

  // square wave: full width under the opened packet, then squeezed onto the wire on the left half
  const s = EASE(split);
  const waveX0 = lerp(160, 70, s);
  const waveX1 = lerp(1120, 590, s);
  const bitW = (waveX1 - waveX0) / BITS.length;
  const yHi = lerp(380, 400, s);
  const yLo = lerp(450, 450, s);
  const period = bitW * BITS.length;
  const shift = scroll % period;

  return (
    <SceneFrame id={ID}>
      {/* ── the street, devices as network nodes, zoom into the phone */}
      {streetOut > 0 && frame >= STING - 14 ? (
        <Stage opacity={streetIn * streetOut}>
          <g
            transform={`translate(${lerp(0, 640 - PHONE_AT.x * 3.2, EASE(zoom))} ${lerp(0, 380 - PHONE_AT.y * 3.2, EASE(zoom))}) scale(${lerp(1, 3.2, EASE(zoom))})`}
          >
            <BusStopStreet dim={dim}>
              <Commuter x={STREET.commuter.x} y={STREET.commuter.y} pose="phone" phoneGlow={0.6 + 0.4 * dim} />
            </BusStopStreet>
            {/* network: links, travelling messages, nodes (they fade as we zoom into the phone) */}
            <g opacity={1 - clamp01(zoom * 2.5)}>
            {LINKS.map(([a, b], li) => {
              const A = NODES[a];
              const B = NODES[b];
              const p = prog(frame, cDevices + li * 4, 18);
              return (
                <line
                  key={li}
                  x1={A.x}
                  y1={A.y}
                  x2={lerp(A.x, B.x, p)}
                  y2={lerp(A.y, B.y, p)}
                  stroke={COLORS.event}
                  strokeWidth={3}
                  strokeOpacity={0.7}
                  strokeDasharray="2 8"
                  strokeLinecap="round"
                />
              );
            })}
            {frame >= cSending
              ? LINKS.map(([a, b], li) => {
                  const A = NODES[a];
                  const B = NODES[b];
                  const u = (((frame - cSending) / 26 + li * 0.37) % 1 + 1) % 1;
                  const back = li % 2 === 1;
                  const t = back ? 1 - u : u;
                  return (
                    <circle
                      key={`m${li}`}
                      cx={lerp(A.x, B.x, t)}
                      cy={lerp(A.y, B.y, t)}
                      r={6}
                      fill={COLORS.event}
                      opacity={Math.sin(Math.PI * u) * prog(frame, cSending, 8)}
                    />
                  );
                })
              : null}
            {NODES.map((n, i) => {
              const p = pop(frame, cNetwork + 4 + i * 6);
              if (p <= 0.01) return null;
              return (
                <g key={n.key} transform={`translate(${n.x} ${n.y}) scale(${p})`}>
                  <circle r={34} fill={COLORS.event} opacity={0.18} />
                  <circle r={25} fill={COLORS.panel} stroke={COLORS.event} strokeWidth={3} />
                  <Icon kind={n.icon} />
                </g>
              );
            })}
            </g>
          </g>
        </Stage>
      ) : null}
      {netLabel > 0 ? (
        <Title x={640} y={110} opacity={netLabel} color={COLORS.ink}>
          network
        </Title>
      ) : null}
      {pocket > 0 ? <FormulaPocket dock={1} opacity={pocket} /> : null}

      {/* ── phone close-up */}
      {phoneIn > 0 && phoneOut > 0 ? (
        <Stage opacity={phoneIn * phoneOut}>
          <Phone
            x={phoneX}
            y={380}
            scale={lerp(0.7, 1.9, EASE(phoneIn))}
            message={MESSAGE}
            typed={typed}
            sent={sent}
            frame={frame}
          />
          {/* The kit Phone's sent bubble is 132 px wide, too narrow for this message: cover it with a wider one. */}
          {sent > 0 ? (
            <g transform={`translate(${phoneX} 380) scale(${lerp(0.7, 1.9, EASE(phoneIn))}) translate(0 ${(1 - sent) * 90})`} opacity={sent}>
              <rect x={-74} y={-61} width={148} height={46} rx={16} fill={COLORS.event} />
              <text x={0} y={-32} fill={COLORS.bg} fontFamily={FONT.sans} fontSize={14} fontWeight={600} textAnchor="middle">
                {MESSAGE}
              </text>
            </g>
          ) : null}
        </Stage>
      ) : null}

      {/* ── the letter, chopped into chunks, postcards, packet bars */}
      {letter > 0 && open < 1 ? (
        <>
          <Stage opacity={1 - open * 0.85}>
            {frame >= flyStart ? (
              <Timeline scale={BAR_SCALE} y={BAR_Y + 46} progress={prog(frame, flyStart, 24)} label="time →" opacity={0.8} />
            ) : null}
            {/* whole letter until it is chopped */}
            {sep <= 0 ? (
              <g
                transform={`translate(${LETTER.x + LETTER.w / 2} ${LETTER.y}) scale(${lerp(0.18, 1, EASE(letter))}) translate(${-LETTER.w / 2} ${-LETTER.h / 2})`}
                opacity={clamp01(letter * 3)}
              >
                <rect width={LETTER.w} height={LETTER.h} rx={10} fill={PAPER} />
                {[0, 1, 2].map((k) =>
                  cut > 0 ? (
                    <line
                      key={k}
                      x1={CHUNK_W * (k + 1)}
                      y1={-8}
                      x2={CHUNK_W * (k + 1)}
                      y2={lerp(-8, LETTER.h + 8, cut)}
                      stroke={COLORS.muted}
                      strokeWidth={3}
                      strokeDasharray="8 7"
                    />
                  ) : null,
                )}
                {CHUNKS.map((c, i) => (
                  <text key={i} x={CHUNK_W * (i + 0.5)} y={LETTER.h / 2 + 16} fill={PAPER_INK} fontFamily={FONT.sans} fontSize={46} fontWeight={600} textAnchor="middle">
                    {c}
                  </text>
                ))}
              </g>
            ) : (
              CHUNKS.map((c, i) => {
                const g = chunkGeom(i);
                if (i === 1 && barsDone) return null;
                if (g.f >= 1) return null;
                return (
                  <g key={i} transform={`translate(${g.cx} ${g.cy}) rotate(${g.rot})`}>
                    <rect x={-g.w / 2 + 4} y={-g.h / 2 + 8} width={g.w} height={g.h} rx={lerp(8, 10, g.f)} fill="#000" opacity={0.25 * (1 - g.f)} />
                    <rect x={-g.w / 2} y={-g.h / 2} width={g.w} height={g.h} rx={lerp(8, 10, g.f)} fill={g.fill} />
                    <g opacity={g.content}>
                      {card > 0 ? (
                        <g opacity={card}>
                          <rect x={g.w / 2 - 44} y={-g.h / 2 + 10} width={32} height={38} rx={3} fill="none" stroke={STAMP} strokeWidth={2.5} strokeDasharray="4 3" />
                          <rect x={g.w / 2 - 39} y={-g.h / 2 + 15} width={22} height={28} rx={2} fill={STAMP} opacity={0.75} />
                          <line x1={-g.w / 2 + 18} y1={g.h / 2 - 34} x2={g.w / 2 - 60} y2={g.h / 2 - 34} stroke={COLORS.muted} strokeWidth={1.5} />
                        </g>
                      ) : null}
                      <text y={card > 0 ? -2 : 16} fill={PAPER_INK} fontFamily={FONT.sans} fontSize={card > 0 ? 38 : 46} fontWeight={600} textAnchor="middle">
                        {c}
                      </text>
                    </g>
                    {card > 0 ? (
                      <text
                        x={lerp(-g.w / 2 + 18, 0, g.f)}
                        y={lerp(g.h / 2 - 12, 7, g.f)}
                        fill={interpolateColors(g.f, [0, 0.6, 1], [STAMP, STAMP, COLORS.bg])}
                        fontFamily={FONT.sans}
                        fontWeight={700}
                        fontSize={lerp(24, 20, g.f)}
                        textAnchor={g.f > 0.5 ? "middle" : "start"}
                        opacity={card}
                      >
                        {i + 1}/4
                      </text>
                    ) : null}
                  </g>
                );
              })
            )}
            {CHUNKS.map((_, i) =>
              chunkGeom(i).f >= 1 && !(i === 1 && open > 0) ? (
                <PacketBar key={i} scale={BAR_SCALE} start={BAR_STARTS[i]} y={BAR_Y} h={BAR_H} label={`${i + 1}/4`} />
              ) : null,
            )}
          </Stage>
          {packetsLabel > 0.01 ? (
            <Label x={640} y={labelY} size={44} weight={700} color={COLORS.event} opacity={Math.min(1, packetsLabel) * (1 - open)}>
              packets
            </Label>
          ) : null}
        </>
      ) : null}

      {/* ── packet 2 opens into bits */}
      {open > 0 && zoomOut > 0 ? (
        <AbsoluteFill style={{ opacity: zoomOut }}>
          <Stage>
            <rect x={p2.cx - p2.w / 2} y={p2.cy - p2.h / 2} width={p2.w} height={p2.h} rx={lerp(10, 18, open)} fill={COLORS.event} />
            <text x={p2.cx - p2.w / 2 + 18} y={p2.cy - p2.h / 2 + 26} fill={COLORS.bg} fontFamily={FONT.sans} fontWeight={700} fontSize={20} opacity={open}>
              2/4
            </text>
          </Stage>
          <Label x={640} y={262} size={33} color={COLORS.bg} weight={700} style={{ fontFamily: "Menlo, Monaco, monospace", letterSpacing: "0.04em" }} opacity={open}>
            {BIT_GROUPS.slice(0, Math.round(BIT_GROUPS.length * bitsTyped))}
            {bitsTyped < 1 && bitsTyped > 0 ? "▍" : ""}
          </Label>
        </AbsoluteFill>
      ) : null}

      {/* ── the signal: square wave → wire pulses; radio ripples */}
      {waveDraw > 0 ? (
        <Stage>
          <defs>
            <clipPath id="s05-wave-clip">
              <rect x={waveX0 - 6} y={300} width={waveX1 - waveX0 + 12} height={200} />
            </clipPath>
          </defs>
          {split > 0 ? (
            <g opacity={split * keep}>
              <line x1={640} y1={190} x2={640} y2={640} stroke={COLORS.faint} strokeWidth={2} />
              <line x1={60} y1={482} x2={600} y2={482} stroke={COPPER} strokeWidth={14} strokeLinecap="round" />
              <line x1={60} y1={478} x2={600} y2={478} stroke="#f0b27a" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
            </g>
          ) : null}
          <g clipPath="url(#s05-wave-clip)" opacity={keep}>
            <path
              d={squarePath(BITS, waveX0 + shift - period, bitW, yHi, yLo, split > 0 ? 3 : 1).replace(/^/, "")}
              pathLength={split > 0 ? undefined : 1}
              strokeDasharray={split > 0 ? undefined : 1}
              strokeDashoffset={split > 0 ? undefined : 1 - waveDraw}
              transform={split > 0 ? undefined : `translate(${period} 0)`}
              stroke={COLORS.event}
              strokeWidth={5}
              fill="none"
              strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 6px ${COLORS.event})` }}
            />
          </g>
          {radioIn > 0 ? (
            <g opacity={radioIn * keep} transform={`translate(${(640 - 960) * glide} ${(360 - RADIO_Y) * glide})`}>
              <Phone x={960} y={500} scale={0.55} message="" typed={0} frame={frame} />
              {[0, 1, 2, 3, 4].map((k) => {
                const u = ((frame - cRadio) / 40 + k / 5 + 10) % 1;
                const r = 30 + u * 300;
                return (
                  <path
                    key={k}
                    d={`M ${960 - r * 0.866} ${RADIO_Y - r * 0.5} A ${r} ${r} 0 0 1 ${960 + r * 0.866} ${RADIO_Y - r * 0.5}`}
                    stroke={COLORS.event}
                    strokeWidth={4}
                    fill="none"
                    strokeLinecap="round"
                    opacity={(1 - u) * clamp01(u * 6)}
                  />
                );
              })}
            </g>
          ) : null}
          {outro > 0 ? (
            <OpeningRipples
              frame={frame - END}
              cx={lerp(960, 640, glide)}
              cy={lerp(RADIO_Y, 360, glide)}
              opacity={outro}
            />
          ) : null}
        </Stage>
      ) : null}
      {signalLabel > 0 ? (
        <Title x={640} y={lerp(560, 120, EASE(split))} size={lerp(56, 48, split)} opacity={signalLabel * keep} color={COLORS.ink}>
          signal
        </Title>
      ) : null}
      {split > 0 ? (
        <>
          <Label x={330} y={560} size={28} color={COLORS.muted} opacity={fade(frame, cPulses + 10, 12) * keep}>
            pulses in a wire
          </Label>
          <Label x={960} y={680} size={28} color={COLORS.muted} opacity={fade(frame, cRadio + 4, 12) * keep}>
            radio waves
          </Label>
        </>
      ) : null}

      {/* ── Part 2 sting */}
      <Sequence durationInFrames={STING} name="Part 2 sting">
        <PartSting part={2} title="Networks from zero" durationInFrames={STING} />
      </Sequence>
    </SceneFrame>
  );
};
