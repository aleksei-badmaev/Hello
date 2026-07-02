// Generates a short, royalty-free synth/techno background track as a WAV file.
// Pure DSP, no external assets — avoids any copyright issues with real music.
import fs from "node:fs";
import path from "node:path";

const SAMPLE_RATE = 44100;
const DURATION_S = 19.5;
const BPM = 120;
const BEAT = 60 / BPM; // 0.5s

const numSamples = Math.floor(SAMPLE_RATE * DURATION_S);
const left = new Float32Array(numSamples);
const right = new Float32Array(numSamples);

const timeAt = (i) => i / SAMPLE_RATE;

// --- Kick drum: sine with fast pitch drop + exponential amplitude decay ---
function addKick(startS, amp = 0.9) {
  const startI = Math.floor(startS * SAMPLE_RATE);
  const lenS = 0.28;
  const lenI = Math.floor(lenS * SAMPLE_RATE);
  for (let i = 0; i < lenI; i++) {
    const idx = startI + i;
    if (idx >= numSamples) break;
    const t = i / SAMPLE_RATE;
    const freq = 150 * Math.exp(-t / 0.045) + 45;
    const env = Math.exp(-t / 0.16);
    const click = t < 0.004 ? (1 - t / 0.004) * 0.6 : 0;
    const sample = (Math.sin(2 * Math.PI * freq * t) * env + click) * amp;
    left[idx] += sample;
    right[idx] += sample;
  }
}

// --- Hi-hat: filtered-ish noise burst (high-passed via differencing) ---
function addHihat(startS, amp = 0.18, open = false) {
  const startI = Math.floor(startS * SAMPLE_RATE);
  const lenS = open ? 0.14 : 0.045;
  const lenI = Math.floor(lenS * SAMPLE_RATE);
  let prev = 0;
  for (let i = 0; i < lenI; i++) {
    const idx = startI + i;
    if (idx >= numSamples) break;
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t / (open ? 0.05 : 0.015));
    const noise = Math.random() * 2 - 1;
    const hp = noise - prev; // crude high-pass
    prev = noise;
    const sample = hp * env * amp;
    left[idx] += sample;
    right[idx] += sample * 0.95;
  }
}

// --- Pluck synth note: two detuned sines for a subtle "supersaw" feel ---
function addNote(startS, freq, lenS, amp = 0.16, pan = 0) {
  const startI = Math.floor(startS * SAMPLE_RATE);
  const lenI = Math.floor(lenS * SAMPLE_RATE);
  for (let i = 0; i < lenI; i++) {
    const idx = startI + i;
    if (idx >= numSamples) break;
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t / (lenS * 0.35));
    const osc =
      Math.sin(2 * Math.PI * freq * t) * 0.6 +
      Math.sin(2 * Math.PI * (freq * 1.006) * t) * 0.4;
    const sample = osc * env * amp;
    left[idx] += sample * (1 - Math.max(0, pan));
    right[idx] += sample * (1 - Math.max(0, -pan));
  }
}

// --- Sub bass: sine following the same arp root, an octave down, gentle ---
function addSub(startS, freq, lenS, amp = 0.2) {
  const startI = Math.floor(startS * SAMPLE_RATE);
  const lenI = Math.floor(lenS * SAMPLE_RATE);
  for (let i = 0; i < lenI; i++) {
    const idx = startI + i;
    if (idx >= numSamples) break;
    const t = i / SAMPLE_RATE;
    const env = Math.min(1, t / 0.02) * Math.exp(-t / (lenS * 0.6));
    const sample = Math.sin(2 * Math.PI * (freq / 2) * t) * env * amp;
    left[idx] += sample;
    right[idx] += sample;
  }
}

const totalBeats = Math.floor(DURATION_S / BEAT);

// Kick on every beat, hi-hats on 8th & 16th notes for drive.
for (let b = 0; b < totalBeats; b++) {
  const t = b * BEAT;
  addKick(t);
  addHihat(t + BEAT * 0.5, 0.16, false);
  addHihat(t + BEAT * 0.25, 0.09, false);
  addHihat(t + BEAT * 0.75, 0.09, false);
}
// Open hat every 2 bars for a lift.
for (let t = BEAT * 4 - BEAT * 0.25; t < DURATION_S; t += BEAT * 8) {
  addHihat(t, 0.15, true);
}

// A-minor tech-arp riff, 16th notes: A3 A3 E4 A3 C4 A3 E4 G4
const scale = [220.0, 220.0, 329.63, 220.0, 261.63, 220.0, 329.63, 392.0];
const sixteenth = BEAT / 2;
let step = 0;
for (let t = 0; t < DURATION_S - sixteenth; t += sixteenth) {
  const freq = scale[step % scale.length];
  addNote(t, freq, sixteenth * 1.9, 0.14, Math.sin(step * 0.3) * 0.3);
  step++;
}

// Sub bass on every bar root note for weight.
for (let t = 0; t < DURATION_S; t += BEAT * 2) {
  addSub(t, 220.0, BEAT * 2 * 0.95, 0.22);
}

// Master fade in/out + soft limiter.
const fadeIn = 0.25;
const fadeOut = 0.6;
for (let i = 0; i < numSamples; i++) {
  const t = timeAt(i);
  let g = 1;
  if (t < fadeIn) g = t / fadeIn;
  if (t > DURATION_S - fadeOut) g = Math.max(0, (DURATION_S - t) / fadeOut);
  left[i] *= g;
  right[i] *= g;
}

let peak = 0;
for (let i = 0; i < numSamples; i++) {
  peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
}
const targetPeak = 0.88;
const gain = peak > 0 ? targetPeak / peak : 1;

// Encode as 16-bit PCM stereo WAV.
const bytesPerSample = 2;
const numChannels = 2;
const dataSize = numSamples * numChannels * bytesPerSample;
const buffer = Buffer.alloc(44 + dataSize);

buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20); // PCM
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(SAMPLE_RATE, 24);
buffer.writeUInt32LE(SAMPLE_RATE * numChannels * bytesPerSample, 28);
buffer.writeUInt16LE(numChannels * bytesPerSample, 32);
buffer.writeUInt16LE(16, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(dataSize, 40);

let offset = 44;
const clamp = (v) => Math.max(-1, Math.min(1, v));
for (let i = 0; i < numSamples; i++) {
  const l = clamp(left[i] * gain);
  const r = clamp(right[i] * gain);
  buffer.writeInt16LE(Math.round(l * 32767), offset);
  buffer.writeInt16LE(Math.round(r * 32767), offset + 2);
  offset += 4;
}

const outPath = path.join(process.cwd(), "public/audio/bg-music.wav");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, buffer);
console.log("Wrote", outPath, `${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
