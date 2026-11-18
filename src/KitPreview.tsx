// A live catalogue of the shared kit: one page per group, 4 s each. Open "KitPreview" in Remotion Studio.
// Also the best usage reference: every component here is used the way scenes should use it.
import React from "react";
import { AbsoluteFill, Series, useCurrentFrame } from "remotion";
import {
  Bracket,
  Bus,
  BusStopStreet,
  Caption,
  Card,
  ChannelBand,
  COLORS,
  Commuter,
  crowdLook,
  Die,
  EventDots,
  FONT,
  Formula,
  FormulaPocket,
  HubAndTerminals,
  ILLUS,
  Interval,
  Label,
  lerp,
  Mark,
  mergeTimes,
  PacketBar,
  PartSting,
  Person,
  Phone,
  poissonArrivals,
  prog,
  RuleChip,
  scheduledArrivals,
  SGPlot,
  SlotGrid,
  sparseSources,
  Stage,
  Stamp,
  STREET,
  StreamMerge,
  Talker,
  Timeline,
  timeScale,
  Title,
  Waveform,
} from "./shared";

export const KIT_PAGE = 120;

const PageTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Label x={40} y={34} anchor="left" size={20} color={COLORS.muted} weight={600} style={{ letterSpacing: "0.12em" }}>
    KIT · {children}
  </Label>
);

// 1 — palette + text
const PaletteAndText: React.FC = () => {
  const swatches = Object.entries(COLORS);
  return (
    <AbsoluteFill>
      <PageTitle>PALETTE & TEXT</PageTitle>
      {swatches.map(([k, v], i) => (
        <div key={k} style={{ position: "absolute", left: 40 + (i % 6) * 200, top: 70 + Math.floor(i / 6) * 86, display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 54, height: 54, borderRadius: 10, background: v, border: `1px solid ${COLORS.faint}` }} />
          <div style={{ fontFamily: FONT.sans, color: COLORS.ink, fontSize: 18 }}>
            {k}
            <div style={{ color: COLORS.muted, fontSize: 14 }}>{v}</div>
          </div>
        </div>
      ))}
      <Title x={40} y={300} anchor="left">Poisson process</Title>
      <RuleChip n={1} x={40} y={380} start={10}>steady rate λ</RuleChip>
      <RuleChip n={2} x={40} y={450} start={20}>independent: no memory</RuleChip>
      <RuleChip n={3} x={40} y={520} start={30} active={false}>one at a time</RuleChip>
      <Stamp x={1020} y={330} start={20}>COLLISION</Stamp>
      <Stamp x={1000} y={430} start={30} color={COLORS.bus} rotate={4}>ALOHAnet · 1971</Stamp>
      <Card x={760} y={540} anchor="center" start={40}>
        <Formula tex="S = G·e^{−2G}" size={52} />
        <div style={{ height: 6 }} />
        <Formula tex="P(k) = (λt)^{k} e^{−λt} / k!" size={34} color={COLORS.muted} />
      </Card>
      <Caption start={50}>Captions sit here, at least 28 px.</Caption>
    </AbsoluteFill>
  );
};

// 2 — timeline toolkit
const TimelineKit: React.FC = () => {
  const frame = useCurrentFrame();
  const sc = timeScale(-2, 4, 120, 1160);
  const times = poissonArrivals(1.4, -2, 4, "kit-dots");
  const until = lerp(-2, 4, prog(frame, 0, 90));
  const sh = prog(frame, 60, 40);
  return (
    <AbsoluteFill>
      <PageTitle>TIMELINE · EVENT DOTS · PACKETS · WINDOW · BRACKET · SLOTS</PageTitle>
      <Stage>
        <Timeline scale={sc} y={150} label="time →" />
        <EventDots scale={sc} y={150} times={times} until={until} drop={40} popSpan={0.25} />

        <Interval scale={sc} from={-1} to={1} y={340} h={120} progress={prog(frame, 10, 30)} />
        <Timeline scale={sc} y={390} tickEvery={1} tickLabel={(t) => `${t}`} label="frame times →" />
        <PacketBar scale={sc} start={0} y={340} label="my packet" state="attempt" toState="success" mix={prog(frame, 40, 15)} />
        <PacketBar scale={sc} start={-1.4} y={300} state="ghost" />
        <PacketBar scale={sc} start={0.6} y={300} state="collision" shatter={sh} seed="k1" />
        <PacketBar scale={sc} start={2.2} y={340} state="retry" fill={prog(frame, 20, 60)} label="retry" />
        <Bracket x1={sc(-1)} x2={sc(1)} y={262} label="vulnerable window = 2 frame times" progress={prog(frame, 30, 20)} />

        <SlotGrid scale={sc} y1={480} y2={620} progress={prog(frame, 0, 40)} />
        <Timeline scale={sc} y={600} tickEvery={1} />
        <PacketBar scale={sc} start={0} y={560} state="collision" />
        <PacketBar scale={sc} start={0} y={515} state="collision" />
        <PacketBar scale={sc} start={2} y={560} state="success" />
      </Stage>
      <Label x={120} y={660} anchor="left" color={COLORS.muted} size={18}>
        Packets are exactly 1 frame time wide on any timeScale(). The slot grid snaps to the same units.
      </Label>
    </AbsoluteFill>
  );
};

// 3 — the merge (Scenes 03 & 11) + schedule contrast
const MergeKit: React.FC = () => {
  const frame = useCurrentFrame();
  const sc = timeScale(0, 10, 180, 1180);
  const rows = sparseSources(8, 0.22, 0, 10, "kit-merge");
  const merged = mergeTimes(rows);
  return (
    <AbsoluteFill>
      <PageTitle>STREAM MERGE · many rare sources → one Poisson stream</PageTitle>
      <Stage>
        <StreamMerge
          scale={sc}
          rows={rows}
          rowTop={110}
          rowGap={44}
          mergedY={520}
          progress={prog(frame, 20, 60)}
          rowLabel={(i, y) => (
            <text x={150} y={y + 6} fill={COLORS.muted} fontFamily={FONT.sans} fontSize={16} textAnchor="end">
              #{i + 1}
            </text>
          )}
        />
        <Timeline scale={sc} y={620} opacity={0.9} />
        <EventDots scale={sc} y={620} times={scheduledArrivals(1.25, 0, 10, 0.4)} color={COLORS.muted} />
        <Mark x={1220} y={520} progress={prog(frame, 80, 15)} />
        <Mark x={1220} y={620} kind="cross" progress={prog(frame, 90, 15)} />
      </Stage>
      <Label x={180} y={560} anchor="left" color={COLORS.event} size={18} opacity={prog(frame, 70, 10)}>
        merged: {merged.length} events, rate = 8 × 0.22
      </Label>
      <Label x={180} y={660} anchor="left" color={COLORS.muted} size={18}>
        schedule ≠ Poisson
      </Label>
    </AbsoluteFill>
  );
};

// 4 — S–G plot
const PlotKit: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <PageTitle>S–G PLOT · pure + slotted · peaks · cursor · ball</PageTitle>
      <Stage>
        <SGPlot
          pure={prog(frame, 0, 45)}
          slotted={prog(frame, 40, 45)}
          purePeak={prog(frame, 45, 12)}
          slottedPeak={prog(frame, 85, 12)}
          cursorG={lerp(0, 3, prog(frame, 0, 45))}
          ball={{ G: lerp(1.2, 2.6, prog(frame, 95, 25)), curve: "slotted" }}
        />
      </Stage>
    </AbsoluteFill>
  );
};

// 5 — formula pocket
const PocketKit: React.FC = () => {
  const frame = useCurrentFrame();
  const sub = prog(frame, 20, 25);
  const dock = prog(frame, 70, 30);
  return (
    <AbsoluteFill>
      <PageTitle>FORMULA POCKET · e^(−λt), substitution, docking</PageTitle>
      <FormulaPocket dock={dock} prefix="P(no events in t) =" rate="G" time="2" sub={sub} glow={1 - dock} />
      <FormulaPocket dock={0} center={{ x: 640, y: 560 }} rate="G" time="1" sub={sub} subColor={COLORS.slotted} />
      <Label x={640} y={660} color={COLORS.muted} size={18}>
        top: λ→G, t→2 (Scene 14), then docks · bottom: λ→G, t→1 (Scene 17)
      </Label>
    </AbsoluteFill>
  );
};

// 6 — hub, channel, waves, marks, die
const NetworkKit: React.FC = () => {
  const frame = useCurrentFrame();
  const p = (start: number) => prog(frame, start, 30);
  return (
    <AbsoluteFill>
      <PageTitle>HUB & TERMINALS · CHANNEL · WAVEFORMS · MARKS · DIE</PageTitle>
      <Stage>
        <HubAndTerminals
          cx={360}
          cy={370}
          radius={230}
          n={7}
          appear={prog(frame, 0, 20)}
          hubLabel="hub"
          highlight={[2]}
          traffic={[
            { i: 2, p: p(10) },
            { i: 5, p: p(25), color: COLORS.retry },
            { i: 2, p: p(60), kind: "ack" },
          ]}
        />
        <ChannelBand x={720} y={170} width={500} label="shared channel" progress={prog(frame, 0, 30)} />
        <Waveform x={740} y={300} width={460} color={ILLUS.talkerA} phase={frame / 10} />
        <Waveform x={740} y={400} width={460} color={COLORS.collision} noise={1} phase={frame / 10} seed="noisy" />
        <Mark x={780} y={520} progress={prog(frame, 20, 15)} />
        <Mark x={860} y={520} kind="cross" progress={prog(frame, 30, 15)} />
        <Die x={980} y={530} value={4} roll={prog(frame, 10, 40)} seed="d1" />
        <Die x={1080} y={530} value={2} roll={prog(frame, 20, 40)} seed="d2" color={COLORS.retry} />
      </Stage>
      <Label x={970} y={250} color={COLORS.muted} size={18}>clean speech</Label>
      <Label x={970} y={350} color={COLORS.muted} size={18}>two at once = noise</Label>
    </AbsoluteFill>
  );
};

// 7 — the bus-stop street
const StreetKit: React.FC = () => {
  const frame = useCurrentFrame();
  const busX = lerp(STREET.busEnterX, STREET.busStopX, prog(frame, 0, 70));
  return (
    <AbsoluteFill>
      <Stage>
        <BusStopStreet
          rain={0.8}
          glassDrop={prog(frame, 30, 80)}
          towerRipples={1}
          road={<Bus x={busX} y={STREET.busY} wheelRotation={busX * 1.4} doorOpen={prog(frame, 80, 15)} />}
        >
          <Commuter x={STREET.commuter.x} y={STREET.commuter.y} buzz={frame > 40 && frame < 70 ? 1 : 0} phoneGlow={1} />
          <Person x={1130} y={STREET.sidewalkY + 6} scale={0.95} facing={-1} pose="stand" {...crowdLook(3)} />
        </BusStopStreet>
      </Stage>
      <PageTitle>BUS-STOP STREET · Bus · Commuter · rain · glass drop · tower</PageTitle>
    </AbsoluteFill>
  );
};

// 8 — the cast
const CastKit: React.FC = () => {
  const frame = useCurrentFrame();
  const y = 330;
  const poses = ["stand", "phone", "watch", "walk", "shrug", "phoneUp"] as const;
  const exprs = ["neutral", "happy", "annoyed", "sigh", "surprised"] as const;
  return (
    <AbsoluteFill>
      <PageTitle>CAST · Commuter poses · Talkers A / B / supervisor · crowd</PageTitle>
      <Stage>
        {poses.map((pose, i) => (
          <Commuter key={pose} x={110 + i * 150} y={y} pose={pose} walkPhase={frame * 0.25} expression={exprs[i % exprs.length]} />
        ))}
        <Talker who="A" x={1000} y={y} talk={Math.abs(Math.sin(frame / 3))} />
        <Talker who="B" x={1150} y={y} facing={-1} />
        <Talker who="supervisor" x={1080} y={640} facing={-1} />
        {Array.from({ length: 8 }, (_, i) => (
          <Person key={i} x={90 + i * 110} y={640} scale={0.85} facing={i % 2 ? -1 : 1} pose={i % 3 === 0 ? "phone" : "stand"} {...crowdLook(i)} />
        ))}
      </Stage>
      {poses.map((pose, i) => (
        <Label key={pose} x={110 + i * 150} y={y + 30} size={16} color={COLORS.muted}>
          {pose}
        </Label>
      ))}
      <Label x={1075} y={y + 30} size={16} color={COLORS.muted}>Talker A · B</Label>
      <Label x={1080} y={668} size={16} color={COLORS.muted}>supervisor</Label>
    </AbsoluteFill>
  );
};

// 9 — phone close-up + part sting
const PhoneKit: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <PageTitle>PHONE CLOSE-UP · typing, sending</PageTitle>
      <Stage>
        <Phone x={360} y={380} scale={1.4} message="Bus is late again 🙄" typed={prog(frame, 5, 50)} sent={prog(frame, 70, 20)} frame={frame} />
      </Stage>
      <div style={{ position: "absolute", left: 700, top: 160, width: 520, height: 300, overflow: "hidden", borderRadius: 16, border: `1px solid ${COLORS.faint}` }}>
        <div style={{ transform: "scale(0.406)", transformOrigin: "top left", width: 1280, height: 720, position: "relative" }}>
          <PartSting part={2} title="Networks from zero" durationInFrames={KIT_PAGE} />
        </div>
      </div>
      <Label x={960} y={490} size={18} color={COLORS.muted}>PartSting (put in its own Sequence)</Label>
    </AbsoluteFill>
  );
};

const PAGES = [PaletteAndText, TimelineKit, MergeKit, PlotKit, PocketKit, NetworkKit, StreetKit, CastKit, PhoneKit];
export const KIT_FRAMES = PAGES.length * KIT_PAGE;

export const KitPreview: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
    <Series>
      {PAGES.map((P, i) => (
        <Series.Sequence key={i} durationInFrames={KIT_PAGE} name={P.name}>
          <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
            <P />
          </AbsoluteFill>
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);
