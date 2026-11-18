// Sync visuals to the narration. Every scene's audio starts at LEAD_IN; these helpers return *scene frames*.
//
//   const f = cue("s02", "Say, ten buses an hour");        // frame where that phrase starts being spoken
//   const g = cue("s02", "ten buses an hour", "end");       // frame where it finishes
//
// Phrases are matched case-insensitively, ignoring punctuation, so you can paste cues from the beat sheets
// (drop any "…"). Times inside a sentence are interpolated by character position (good to a few frames).
import { NARRATION, type SceneId } from "../scenes/narration";
import { FPS, LEAD_IN, TAIL } from "./theme";

export type { SceneId };

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

type Index = { text: string; map: { s: number; start: number; len: number }[] };
const cache = new Map<string, Index>();

function index(id: SceneId): Index {
  const hit = cache.get(id);
  if (hit) return hit;
  let text = "";
  const map: Index["map"] = [];
  NARRATION[id].sentences.forEach((sen, s) => {
    const n = norm(sen.text);
    if (text) text += " ";
    map.push({ s, start: text.length, len: n.length });
    text += n;
  });
  const idx = { text, map };
  cache.set(id, idx);
  return idx;
}

/** Narration time (seconds from the audio start) of a phrase's start or end. */
export function cueSeconds(id: SceneId, phrase: string, at: "start" | "end" = "start"): number {
  const { text, map } = index(id);
  const p = norm(phrase);
  const pos = text.indexOf(p);
  if (!p || pos < 0) {
    throw new Error(
      `cue("${id}", "${phrase}"): phrase not found in the narration. Sentences:\n` +
        NARRATION[id].sentences.map((s, i) => `  ${i}: ${s.text}`).join("\n"),
    );
  }
  const c = at === "start" ? pos : pos + p.length;
  const m = map.find((e) => c >= e.start && c <= e.start + e.len) ?? map[map.length - 1];
  const sen = NARRATION[id].sentences[m.s];
  const frac = m.len ? (c - m.start) / m.len : 0;
  return sen.start + frac * (sen.end - sen.start);
}

/** Scene frame at which `phrase` starts (or ends) being spoken. */
export function cue(id: SceneId, phrase: string, at: "start" | "end" = "start"): number {
  return Math.round((LEAD_IN + cueSeconds(id, phrase, at)) * FPS);
}

/** Scene frame of the start/end of sentence `i` (0-based). */
export function sentenceFrame(id: SceneId, i: number, at: "start" | "end" = "start"): number {
  const s = NARRATION[id].sentences[i];
  if (!s) throw new Error(`sentenceFrame("${id}", ${i}): scene has ${NARRATION[id].sentences.length} sentences`);
  return Math.round((LEAD_IN + (at === "start" ? s.start : s.end)) * FPS);
}

/** Index of the sentence being spoken at scene frame `frame` (-1 before the first / during gaps → previous). */
export function sentenceAt(id: SceneId, frame: number): number {
  const t = frame / FPS - LEAD_IN;
  const ss = NARRATION[id].sentences;
  let k = -1;
  for (let i = 0; i < ss.length; i++) if (t >= ss[i].start) k = i;
  return k;
}

/** Frame at which the narration ends (start of the tail). */
export function narrationEndFrame(id: SceneId): number {
  return Math.round((LEAD_IN + NARRATION[id].duration) * FPS);
}

/** Scene length: lead-in + narration + tail (+ optional extra seconds of picture). */
export function sceneDurationInFrames(id: SceneId, extraTail = 0): number {
  return Math.ceil((LEAD_IN + NARRATION[id].duration + TAIL + extraTail) * FPS);
}
