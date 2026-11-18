// Temporary stand-in shown until a scene is built: title, brief path, and the sentence being spoken.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { NARRATION } from "./narration";
import { COLORS, FONT } from "../shared/theme";
import { sentenceAt, type SceneId } from "../shared/cues";

export const Placeholder: React.FC<{ id: SceneId }> = ({ id }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const n = NARRATION[id];
  const k = sentenceAt(id, frame);
  return (
    <div style={{ position: "absolute", inset: 0, padding: 80, fontFamily: FONT.sans, color: COLORS.ink }}>
      <div style={{ color: COLORS.muted, fontSize: 22, letterSpacing: "0.15em" }}>
        {id.toUpperCase()} · PLACEHOLDER · brief: scenes/{n.file}
      </div>
      <div style={{ fontSize: 56, fontWeight: 700, marginTop: 16 }}>{n.title}</div>
      <div style={{ fontSize: 34, lineHeight: 1.35, marginTop: 48, color: COLORS.ink, maxWidth: 1080 }}>
        {k >= 0 ? n.sentences[k].text : ""}
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 70, height: 6, background: COLORS.panel, borderRadius: 3 }}>
        <div style={{ width: `${(frame / durationInFrames) * 100}%`, height: 6, background: COLORS.event, borderRadius: 3 }} />
      </div>
    </div>
  );
};
