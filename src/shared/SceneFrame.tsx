// Wrap every scene in this: background, the scene's narration audio (starting at LEAD_IN), and an
// optional debug overlay showing which sentence is being spoken (handy in Remotion Studio).
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { NARRATION } from "../scenes/narration";
import { COLORS, FONT, FPS, LEAD_IN } from "./theme";
import { sentenceAt, type SceneId } from "./cues";

export const SceneFrame: React.FC<{
  id: SceneId;
  children?: React.ReactNode;
  /** Play the narration (default true). */
  audio?: boolean;
  /** Show the current sentence + frame in a corner (default false). */
  debug?: boolean;
  background?: string;
}> = ({ id, children, audio = true, debug = false, background = COLORS.bg }) => {
  const hasAudio = NARRATION[id].duration > 0;
  return (
    <AbsoluteFill style={{ backgroundColor: background, overflow: "hidden" }}>
      {children}
      {audio && hasAudio ? (
        <Sequence from={Math.round(LEAD_IN * FPS)} layout="none" name={`narration ${id}`}>
          <Audio src={staticFile(`narration/${id}.mp3`)} />
        </Sequence>
      ) : null}
      {debug ? <CueDebug id={id} /> : null}
    </AbsoluteFill>
  );
};

const CueDebug: React.FC<{ id: SceneId }> = ({ id }) => {
  const frame = useCurrentFrame();
  const k = sentenceAt(id, frame);
  const s = NARRATION[id].sentences[k];
  return (
    <div
      style={{
        position: "absolute",
        left: 12,
        bottom: 10,
        right: 12,
        fontFamily: FONT.sans,
        fontSize: 15,
        color: COLORS.bus,
        background: "rgba(0,0,0,0.55)",
        padding: "4px 8px",
        borderRadius: 6,
      }}
    >
      {id} · frame {frame} · {(frame / FPS).toFixed(2)}s · {k >= 0 ? `#${k}: ${s.text}` : "(lead-in)"}
    </div>
  );
};
