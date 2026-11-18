// Scene 19 — Aloha is everywhere
// Brief: scenes/s19-legacy.md  ·  Shared brief: scenes/README.md  ·  Kit: src/shared/README.md
//
// This file is yours: replace <Placeholder> with the scene. Keep the export names (the registry imports them).
import React from "react";
import { SceneFrame } from "../shared";
import { Placeholder } from "./Placeholder";

/** Extra seconds of picture after the narration tail. The scene length updates automatically. */
export const meta = { extraTail: 0 };

export const S19Legacy: React.FC = () => (
  <SceneFrame id="s19">
    <Placeholder id="s19" />
  </SceneFrame>
);
