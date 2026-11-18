// A flat-vector person (SVG). Origin = point between the feet, on the ground. ~235 px tall at scale 1.
// Simple head + body, jacket colour = identity (style guide: no detailed faces).
import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS, ILLUS } from "../theme";
import { clamp01 } from "../motion";

export type Pose =
  | "stand" // arms down
  | "phone" // looking down at a phone held at chest height
  | "watch" // checking a wristwatch
  | "walkie" // walkie-talkie held up to the mouth
  | "walk" // walking cycle (animate walkPhase)
  | "shrug" // both hands up, palms out (hallway dance)
  | "phoneUp"; // phone raised high (New Year's Eve)

export type Expression = "neutral" | "happy" | "annoyed" | "sigh" | "surprised";

export type PersonProps = {
  x: number;
  y: number;
  scale?: number;
  /** 1 = facing right, −1 = facing left. */
  facing?: 1 | -1;
  pose?: Pose;
  expression?: Expression;
  /** Walking cycle phase in radians (e.g. frame * 0.25). Used by pose "walk". */
  walkPhase?: number;
  /** Mouth open amount 0..1 (talking). */
  talk?: number;
  jacket?: string;
  pants?: string;
  skin?: string;
  hair?: string;
  hairStyle?: "short" | "long" | "bun";
  /** Backpack colour, or undefined for none. */
  backpack?: string;
  /** What the front hand holds. Defaults: phone for phone/phoneUp poses, walkie for walkie pose. */
  holding?: "phone" | "walkie" | "none";
  /** Phone screen glow 0..1, and buzz (vibration wiggle) 0..1. */
  phoneGlow?: number;
  buzz?: number;
  opacity?: number;
};

type P = [number, number];

const ARMS: Record<Pose, { front: [P, P]; back: [P, P] }> = {
  // [elbow, hand] relative to the shoulder-height body frame (facing right)
  stand: { front: [[28, -128], [30, -96]], back: [[-28, -128], [-28, -96]] },
  phone: { front: [[34, -118], [40, -142]], back: [[-28, -128], [-28, -96]] },
  watch: { front: [[38, -126], [6, -136]], back: [[-28, -128], [-26, -96]] },
  walkie: { front: [[38, -150], [26, -194]], back: [[-28, -128], [-28, -96]] },
  walk: { front: [[28, -128], [30, -96]], back: [[-28, -128], [-28, -96]] },
  shrug: { front: [[46, -150], [56, -178]], back: [[-46, -150], [-56, -178]] },
  phoneUp: { front: [[34, -200], [38, -238]], back: [[-28, -128], [-28, -96]] },
};

const Hair: React.FC<{ style: "short" | "long" | "bun"; color: string }> = ({ style, color }) => {
  if (style === "long")
    return <path d="M -27 -204 C -30 -240, 30 -246, 30 -214 L 26 -210 C 10 -226, -10 -224, -14 -206 L -18 -168 L -30 -170 Z" fill={color} />;
  if (style === "bun")
    return (
      <g fill={color}>
        <circle cx={-18} cy={-232} r={11} />
        <path d="M -27 -204 C -30 -240, 30 -246, 30 -214 L 26 -210 C 10 -226, -10 -224, -18 -200 Z" />
      </g>
    );
  return <path d="M -27 -206 C -30 -242, 32 -246, 30 -214 L 27 -212 C 12 -228, -8 -226, -18 -198 Z" fill={color} />;
};

export const Person: React.FC<PersonProps> = ({
  x,
  y,
  scale = 1,
  facing = 1,
  pose = "stand",
  expression = "neutral",
  walkPhase = 0,
  talk = 0,
  jacket = "#475569",
  pants = ILLUS.pants,
  skin = ILLUS.skin[0],
  hair = ILLUS.hair[0],
  hairStyle = "short",
  backpack,
  holding,
  phoneGlow = 0.6,
  buzz = 0,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const hold = holding ?? (pose === "phone" || pose === "phoneUp" ? "phone" : pose === "walkie" ? "walkie" : "none");
  const lookDown = pose === "phone" || pose === "watch";
  const lookUp = pose === "phoneUp";

  // legs
  const swing = pose === "walk" ? Math.sin(walkPhase) : 0;
  const footF: P = [8 + swing * 26, 0];
  const footB: P = [-8 - swing * 26, 0];
  const bob = pose === "walk" ? Math.abs(Math.cos(walkPhase)) * -4 : 0;

  // arms
  const arms = ARMS[pose];
  let front = arms.front;
  let back = arms.back;
  if (pose === "walk") {
    front = [[24 - swing * 10, -128], [26 - swing * 22, -98]];
    back = [[-24 + swing * 10, -128], [-26 + swing * 22, -98]];
  }
  const shF: P = [20, -164];
  const shB: P = [-20, -164];
  const armPath = (sh: P, [e, h]: [P, P]) => `M ${sh[0]} ${sh[1]} L ${e[0]} ${e[1]} L ${h[0]} ${h[1]}`;
  const hand = front[1];

  const wiggle = buzz > 0 ? Math.sin(frame * 2.2) * 9 * clamp01(buzz) : 0;
  const eyeY = -210 + (lookDown ? 4 : lookUp ? -3 : 0);
  const darker = "rgba(0,0,0,0.18)";

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`} opacity={opacity}>
      {/* shadow */}
      <ellipse cx={0} cy={2} rx={40} ry={7} fill="#000" opacity={0.25} />
      <g transform={`translate(0 ${bob})`}>
        {/* back arm (behind body) */}
        <path d={armPath(shB, back)} stroke={jacket} strokeWidth={15} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={armPath(shB, back)} stroke={darker} strokeWidth={15} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={back[1][0]} cy={back[1][1]} r={8} fill={skin} />
        {/* legs */}
        <path d={`M -8 -92 L ${footB[0]} ${footB[1] - 6}`} stroke={pants} strokeWidth={19} strokeLinecap="round" />
        <path d={`M 8 -92 L ${footF[0]} ${footF[1] - 6}`} stroke={pants} strokeWidth={19} strokeLinecap="round" />
        <ellipse cx={footB[0] + 6} cy={-4} rx={14} ry={7} fill={ILLUS.shoes} />
        <ellipse cx={footF[0] + 6} cy={-4} rx={14} ry={7} fill={ILLUS.shoes} />
        {/* backpack */}
        {backpack ? <rect x={-46} y={-168} width={26} height={70} rx={10} fill={backpack} /> : null}
        {/* torso */}
        <rect x={-30} y={-178} width={60} height={94} rx={22} fill={jacket} />
        <line x1={6} y1={-170} x2={6} y2={-90} stroke={darker} strokeWidth={3} />
        {backpack ? <path d="M -22 -174 Q -6 -150 -24 -118" stroke={darker} strokeWidth={6} fill="none" strokeLinecap="round" /> : null}
        {/* neck + head */}
        <rect x={-6} y={-190} width={14} height={16} fill={skin} />
        <circle cx={3} cy={-208} r={26} fill={skin} />
        <Hair style={hairStyle} color={hair} />
        {/* face */}
        <circle cx={10} cy={eyeY} r={3.2} fill="#0b1220" />
        <circle cx={22} cy={eyeY} r={3.2} fill="#0b1220" />
        {expression === "annoyed" ? (
          <path d={`M 5 ${eyeY - 9} L 14 ${eyeY - 6} M 18 ${eyeY - 6} L 27 ${eyeY - 9}`} stroke="#0b1220" strokeWidth={2.5} strokeLinecap="round" />
        ) : null}
        {talk > 0.02 ? (
          <ellipse cx={17} cy={-193} rx={5} ry={1 + 5 * clamp01(talk)} fill="#3b0d0d" />
        ) : expression === "happy" ? (
          <path d="M 10 -195 Q 17 -188 24 -195" stroke="#0b1220" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        ) : expression === "sigh" || expression === "surprised" ? (
          <ellipse cx={17} cy={-193} rx={3.5} ry={expression === "surprised" ? 5 : 3} fill="#3b0d0d" />
        ) : expression === "annoyed" ? (
          <path d="M 11 -192 L 23 -194" stroke="#0b1220" strokeWidth={2.5} strokeLinecap="round" />
        ) : (
          <path d="M 11 -193 L 22 -193" stroke="#0b1220" strokeWidth={2.5} strokeLinecap="round" />
        )}
        {/* front arm */}
        <path d={armPath(shF, front)} stroke={jacket} strokeWidth={15} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {pose === "watch" ? <rect x={hand[0] + 2} y={hand[1] - 6} width={8} height={12} rx={2} fill={COLORS.ink} /> : null}
        {/* held object */}
        {hold === "phone" ? (
          <g transform={`translate(${hand[0] + 4} ${hand[1] - 10}) rotate(${(pose === "phoneUp" ? 0 : -18) + wiggle})`}>
            <rect x={-8} y={-14} width={16} height={28} rx={3.5} fill="#0b1220" />
            <rect x={-6} y={-11} width={12} height={21} rx={2} fill={COLORS.event} opacity={0.25 + 0.75 * clamp01(phoneGlow)} />
          </g>
        ) : null}
        {hold === "walkie" ? (
          <g transform={`translate(${hand[0] + 6} ${hand[1] - 4}) rotate(10)`}>
            <line x1={4} y1={-22} x2={4} y2={-44} stroke="#0b1220" strokeWidth={4} strokeLinecap="round" />
            <rect x={-8} y={-24} width={20} height={40} rx={4} fill="#111827" />
            <rect x={-4} y={-18} width={12} height={8} rx={1.5} fill={COLORS.success} opacity={0.6} />
          </g>
        ) : null}
        <circle cx={hand[0]} cy={hand[1]} r={8} fill={skin} />
      </g>
    </g>
  );
};

/** Neutral, non-semantic jacket colours for background people (crowds, walkers). */
export const CROWD_JACKETS = ["#57534e", "#3f6212", "#1e3a8a", "#78350f", "#831843", "#334155", "#52525b", "#155e75"] as const;

/** Deterministic variety for crowd member `i`. Spread into <Person {...crowdLook(i)} />. */
export function crowdLook(i: number): Pick<PersonProps, "jacket" | "skin" | "hair" | "hairStyle"> {
  const styles = ["short", "long", "bun"] as const;
  return {
    jacket: CROWD_JACKETS[i % CROWD_JACKETS.length],
    skin: ILLUS.skin[(i * 3 + 1) % ILLUS.skin.length],
    hair: ILLUS.hair[(i * 5 + 2) % ILLUS.hair.length],
    hairStyle: styles[(i * 7) % 3],
  };
}
