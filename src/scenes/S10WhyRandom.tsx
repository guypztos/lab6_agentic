// Scene 10 — Why the wait must be random
// Brief: scenes/s10-why-random.md  ·  Shared brief: scenes/README.md  ·  Kit: src/shared/README.md
//
// This file is yours: replace <Placeholder> with the scene. Keep the export names (the registry imports them).
import React from "react";
import { SceneFrame } from "../shared";
import { Placeholder } from "./Placeholder";

/** Extra seconds of picture after the narration tail. The scene length updates automatically. */
export const meta = { extraTail: 0 };

export const S10WhyRandom: React.FC = () => (
  <SceneFrame id="s10">
    <Placeholder id="s10" />
  </SceneFrame>
);
