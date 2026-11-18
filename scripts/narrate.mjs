// Generates build/narration.wav with Kokoro-82M (via kokoro-js, runs locally on CPU).
import { mkdirSync } from "node:fs";
import { KokoroTTS } from "kokoro-js";

const TEXT = "Hello! This clip was made with Remotion and Kokoro.";
const VOICE = "af_heart";
const OUT = "build/narration.wav";
const MAX_SECONDS = 4.5; // clip is 5s and narration starts at 0.5s

mkdirSync("build", { recursive: true });
const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
  dtype: "q8",
  device: "cpu",
});
const audio = await tts.generate(TEXT, { voice: VOICE });
await audio.save(OUT);

const seconds = audio.audio.length / audio.sampling_rate;
console.log(`Narration: ${OUT} (${seconds.toFixed(2)}s, voice ${VOICE})`);
if (seconds > MAX_SECONDS) {
  console.warn(`Warning: narration is longer than ${MAX_SECONDS}s and will be cut off at 5s.`);
}
