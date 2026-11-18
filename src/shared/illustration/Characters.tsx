// The recurring cast. Keep them identical across scenes. Always use these presets, never a hand-rolled Person.
import React from "react";
import { ILLUS } from "../theme";
import { Person, type PersonProps } from "./Person";

type Preset = Omit<PersonProps, "jacket" | "skin" | "hair" | "hairStyle" | "backpack">;

/** The Commuter: teal jacket, grey backpack, phone in hand. Appears in 10 scenes. */
export const Commuter: React.FC<Preset> = ({ pose = "phone", ...p }) => (
  <Person
    jacket={ILLUS.commuterJacket}
    skin={ILLUS.skin[1]}
    hair={ILLUS.hair[0]}
    hairStyle="short"
    backpack={ILLUS.backpack}
    pose={pose}
    {...p}
  />
);

const TALKERS = {
  A: { jacket: ILLUS.talkerA, skin: ILLUS.skin[2], hair: ILLUS.hair[1], hairStyle: "bun" as const },
  B: { jacket: ILLUS.talkerB, skin: ILLUS.skin[0], hair: ILLUS.hair[2], hairStyle: "short" as const },
  supervisor: { jacket: ILLUS.supervisor, skin: ILLUS.skin[3], hair: ILLUS.hair[3], hairStyle: "short" as const },
};

/**
 * Walkie-talkie cast (Scenes 06, 09, 13): Talker A (teal), Talker B (orange), the listening supervisor (grey).
 * Talker A and B double as the hallway walkers in Scene 10.
 */
export const Talker: React.FC<Preset & { who: "A" | "B" | "supervisor" }> = ({ who, pose = "walkie", ...p }) => (
  <Person {...TALKERS[who]} pose={pose} {...p} />
);
