// All 20 scenes back to back, in order. Each scene's length comes from its narration (see scenes/index.ts).
import React from "react";
import { Series } from "remotion";
import { SCENES } from "./scenes";

export const FULL_VIDEO_FRAMES = SCENES.reduce((n, s) => n + s.durationInFrames, 0);

export const FullVideo: React.FC = () => (
  <Series>
    {SCENES.map((s) => (
      <Series.Sequence key={s.id} durationInFrames={s.durationInFrames} name={s.compId}>
        <s.component />
      </Series.Sequence>
    ))}
  </Series>
);
