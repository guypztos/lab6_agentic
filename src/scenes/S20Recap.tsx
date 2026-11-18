// Scene 20 — Recap
// Brief: scenes/s20-recap.md  ·  Shared brief: scenes/README.md  ·  Kit: src/shared/README.md
//
// This file is yours: replace <Placeholder> with the scene. Keep the export names (the registry imports them).
import React from "react";
import { SceneFrame } from "../shared";
import { Placeholder } from "./Placeholder";

/** Extra seconds of picture after the narration tail. The scene length updates automatically. */
export const meta = { extraTail: 2.5 };  // room for the closing bus gag (see brief)

export const S20Recap: React.FC = () => (
  <SceneFrame id="s20">
    <Placeholder id="s20" />
  </SceneFrame>
);
