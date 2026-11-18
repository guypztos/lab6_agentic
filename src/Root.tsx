import { Composition, Folder } from "remotion";
import { Clip } from "./Clip";
import { FullVideo, FULL_VIDEO_FRAMES } from "./FullVideo";
import { KitPreview, KIT_FRAMES } from "./KitPreview";
import { SCENES } from "./scenes";
import { FPS, H, W } from "./shared/theme";

export const RemotionRoot: React.FC = () => (
  <>
    {/* 150 frames at 30 fps = 5 seconds (the original pipeline test clip). */}
    <Composition id="Clip" component={Clip} durationInFrames={150} fps={30} width={1280} height={720} />

    {/* The whole video, scene after scene. */}
    <Composition id="FullVideo" component={FullVideo} durationInFrames={FULL_VIDEO_FRAMES} fps={FPS} width={W} height={H} />

    {/* One composition per scene (ids match the briefs in scenes/). */}
    <Folder name="Scenes">
      {SCENES.map((s) => (
        <Composition key={s.id} id={s.compId} component={s.component} durationInFrames={s.durationInFrames} fps={FPS} width={W} height={H} />
      ))}
    </Folder>

    {/* Live catalogue of the shared kit. */}
    <Composition id="KitPreview" component={KitPreview} durationInFrames={KIT_FRAMES} fps={FPS} width={W} height={H} />
  </>
);
