// The shared kit. Import everything from here:  import { COLORS, Timeline, Commuter, cue } from "../shared";
// Catalogue + usage: src/shared/README.md. Live demo: the "KitPreview" composition in Remotion Studio.

export * from "./theme";
export * from "./motion";
export * from "./poisson";
export * from "./cues";
export { SceneFrame } from "./SceneFrame";

// text (HTML)
export { Formula } from "./text/Formula";
export { FormulaPocket, type FormulaPocketProps } from "./text/FormulaPocket";
export { Label, Title, Caption, RuleChip, Stamp, Card, PartSting, useEnter } from "./text/Text";

// diagrams (SVG — put inside <Stage>)
export { Stage, timeScale, useSvgId, type Scale } from "./diagram/Stage";
export { Timeline, EventDots, Interval, Bracket, SlotGrid } from "./diagram/Timeline";
export { PacketBar, type PacketBarProps } from "./diagram/PacketBar";
export { SGPlot, sgCoords, type SGPlotProps } from "./diagram/SGPlot";
export { StreamMerge } from "./diagram/StreamMerge";
export { HubAndTerminals, type HubTraffic, type Pt } from "./diagram/HubAndTerminals";
export { ChannelBand, Waveform } from "./diagram/Signals";
export { Mark, Die } from "./diagram/Marks";

// real-life illustrations (SVG — put inside <Stage>)
export { Person, crowdLook, CROWD_JACKETS, type Pose, type Expression, type PersonProps } from "./illustration/Person";
export { Commuter, Talker } from "./illustration/Characters";
export { Bus, CellTower, Phone } from "./illustration/Props";
export { BusStopStreet, STREET } from "./illustration/BusStopStreet";
