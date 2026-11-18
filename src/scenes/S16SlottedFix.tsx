// Scene 16 — The fix: add a clock
// Brief: scenes/s16-slotted-fix.md  ·  Shared brief: scenes/README.md  ·  Kit: src/shared/README.md
//
// This file is yours: replace <Placeholder> with the scene. Keep the export names (the registry imports them).
import React from "react";
import { SceneFrame } from "../shared";
import { Placeholder } from "./Placeholder";

/** Extra seconds of picture after the narration tail. The scene length updates automatically. */
export const meta = { extraTail: 0 };

export const S16SlottedFix: React.FC = () => (
  <SceneFrame id="s16">
    <Placeholder id="s16" />
  </SceneFrame>
);
