// Scene registry: every scene in order. Root.tsx registers each one, and FullVideo plays them back to back.
// Scene agents don't need to edit this file. Change `meta.extraTail` in your own scene file instead.
import type React from "react";
import { sceneDurationInFrames, type SceneId } from "../shared/cues";
import * as s01 from "./S01ColdOpen";
import * as s02 from "./S02ThreeRules";
import * as s03 from "./S03WhyEverywhere";
import * as s04 from "./S04OneFormula";
import * as s05 from "./S05WhatIsANetwork";
import * as s06 from "./S06Collisions";
import * as s07 from "./S07TheQuestion";
import * as s08 from "./S08Hawaii1971";
import * as s09 from "./S09TheRules";
import * as s10 from "./S10WhyRandom";
import * as s11 from "./S11TheModel";
import * as s12 from "./S12GAndS";
import * as s13 from "./S13VulnerableWindow";
import * as s14 from "./S14PureFormula";
import * as s15 from "./S15TheCurve";
import * as s16 from "./S16SlottedFix";
import * as s17 from "./S17SlottedFormula";
import * as s18 from "./S18CollapseAndBackoff";
import * as s19 from "./S19Legacy";
import * as s20 from "./S20Recap";

export type SceneEntry = { id: SceneId; compId: string; component: React.FC; extraTail: number; durationInFrames: number };

export const SCENES: SceneEntry[] = [
  { id: "s01", compId: "S01ColdOpen", component: s01.S01ColdOpen, extraTail: s01.meta.extraTail },
  { id: "s02", compId: "S02ThreeRules", component: s02.S02ThreeRules, extraTail: s02.meta.extraTail },
  { id: "s03", compId: "S03WhyEverywhere", component: s03.S03WhyEverywhere, extraTail: s03.meta.extraTail },
  { id: "s04", compId: "S04OneFormula", component: s04.S04OneFormula, extraTail: s04.meta.extraTail },
  { id: "s05", compId: "S05WhatIsANetwork", component: s05.S05WhatIsANetwork, extraTail: s05.meta.extraTail },
  { id: "s06", compId: "S06Collisions", component: s06.S06Collisions, extraTail: s06.meta.extraTail },
  { id: "s07", compId: "S07TheQuestion", component: s07.S07TheQuestion, extraTail: s07.meta.extraTail },
  { id: "s08", compId: "S08Hawaii1971", component: s08.S08Hawaii1971, extraTail: s08.meta.extraTail },
  { id: "s09", compId: "S09TheRules", component: s09.S09TheRules, extraTail: s09.meta.extraTail },
  { id: "s10", compId: "S10WhyRandom", component: s10.S10WhyRandom, extraTail: s10.meta.extraTail },
  { id: "s11", compId: "S11TheModel", component: s11.S11TheModel, extraTail: s11.meta.extraTail },
  { id: "s12", compId: "S12GAndS", component: s12.S12GAndS, extraTail: s12.meta.extraTail },
  { id: "s13", compId: "S13VulnerableWindow", component: s13.S13VulnerableWindow, extraTail: s13.meta.extraTail },
  { id: "s14", compId: "S14PureFormula", component: s14.S14PureFormula, extraTail: s14.meta.extraTail },
  { id: "s15", compId: "S15TheCurve", component: s15.S15TheCurve, extraTail: s15.meta.extraTail },
  { id: "s16", compId: "S16SlottedFix", component: s16.S16SlottedFix, extraTail: s16.meta.extraTail },
  { id: "s17", compId: "S17SlottedFormula", component: s17.S17SlottedFormula, extraTail: s17.meta.extraTail },
  { id: "s18", compId: "S18CollapseAndBackoff", component: s18.S18CollapseAndBackoff, extraTail: s18.meta.extraTail },
  { id: "s19", compId: "S19Legacy", component: s19.S19Legacy, extraTail: s19.meta.extraTail },
  { id: "s20", compId: "S20Recap", component: s20.S20Recap, extraTail: s20.meta.extraTail },
].map((s) => ({ ...s, id: s.id as SceneId, durationInFrames: sceneDurationInFrames(s.id as SceneId, s.extraTail) }));
