/**
 * Son des vidéos courtes (scripts/shorts-video.ts) :
 *   - voix off française, premier fournisseur dont la clé existe : Google Cloud TTS fr-FR (GOOGLE_TTS_API_KEY),
 *     Azure fr-FR-DeniseNeural (AZURE_SPEECH_KEY + AZURE_SPEECH_REGION), puis OpenAI (OPENAI_API_KEY, dont le
 *     français est moyen). Secrets GitHub : la voix se fabrique dans le workflow. Le clip n'est jamais retouché
 *     (ni silences coupés, ni accéléré : c'est ce qui hachait la voix le 2026-11-26) ;
 *   - fond musical synthétisé ici, note par note : aucun morceau tiers, donc aucun droit à gérer.
 * Tout est en PCM 16 bits mono à 24 kHz (le format WAV que renvoie l'API), mixé ensuite par ffmpeg.
 */
import { writeFileSync } from "fs";

export const SR = 24000;
const VOICE_INSTRUCTIONS =
  "Locutrice française native, accent de France, prononciation française des noms de villes françaises. Ton naturel " +
  "et enjoué de vidéo courte : débit vif et rythmé sans précipitation, attaque directe dès le premier mot et même débit du début à la fin, pauses brèves, articulation nette, aucune emphase théâtrale.";

export interface Clip {
  pcm: Int16Array;
  seconds: number;
}

function parseWav(buf: Buffer): { samples: Float32Array; rate: number } {
  let off = 12;
  let rate = SR;
  let channels = 1;
  let bits = 16;
  let data: Buffer | null = null;
  while (off + 8 <= buf.length) {
    const id = buf.toString("ascii", off, off + 4);
    let size = buf.readUInt32LE(off + 4);
    if (id === "fmt ") {
      channels = buf.readUInt16LE(off + 10);
      rate = buf.readUInt32LE(off + 12);
      bits = buf.readUInt16LE(off + 22);
    }
    if (id === "data") {
      // Une réponse en flux annonce parfois une taille fictive (0xFFFFFFFF) : on prend la fin du fichier.
      if (size === 0xffffffff || off + 8 + size > buf.length) size = buf.length - off - 8;
      data = buf.subarray(off + 8, off + 8 + size);
      break;
    }
    off += 8 + size + (size % 2);
  }
  if (!data || bits !== 16) throw new Error(`WAV inattendu (${bits} bits)`);
  const frames = Math.floor(data.length / (2 * channels));
  const samples = new Float32Array(frames);
  for (let i = 0; i < frames; i++) {
    let s = 0;
    for (let c = 0; c < channels; c++) s += data.readInt16LE((i * channels + c) * 2);
    samples[i] = s / channels / 32768;
  }
  return { samples, rate };
}

function resample(x: Float32Array, from: number): Float32Array {
  if (from === SR) return x;
  const n = Math.floor((x.length * SR) / from);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const p = (i * from) / SR;
    const j = Math.floor(p);
    const f = p - j;
    out[i] = (x[j] ?? 0) * (1 - f) + (x[j + 1] ?? x[j] ?? 0) * f;
  }
  return out;
}

// Coupe les silences de tête et de queue : la scène dure le temps de la phrase, pas du blanc autour.
function trim(x: Float32Array): Float32Array {
  let peak = 0;
  for (const v of x) peak = Math.max(peak, Math.abs(v));
  const thr = Math.max(0.003, peak * 0.02);
  let a = 0;
  let b = x.length - 1;
  while (a < b && Math.abs(x[a]) < thr) a++;
  while (b > a && Math.abs(x[b]) < thr) b--;
  return x.subarray(Math.max(0, a - Math.round(SR * 0.12)), Math.min(x.length, b + Math.round(SR * 0.25)));
}

const toInt16 = (x: Float32Array) => Int16Array.from(x, (v) => Math.max(-32767, Math.min(32767, Math.round(v * 32767))));

const clip = (buf: Buffer): Clip => {
  const w = parseWav(buf);
  const pcm = toInt16(trim(resample(w.samples, w.rate)));
  return { pcm, seconds: pcm.length / SR };
};

/** Google Cloud Text-to-Speech, voix fr-FR neuronale (secret GOOGLE_TTS_API_KEY, voix GOOGLE_TTS_VOICE). */
async function googleTts(text: string): Promise<Clip | null> {
  const key = process.env.GOOGLE_TTS_API_KEY;
  if (!key) return null;
  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: "fr-FR", name: process.env.GOOGLE_TTS_VOICE || "fr-FR-Neural2-F" },
      audioConfig: { audioEncoding: "LINEAR16", sampleRateHertz: SR, speakingRate: 1.08 },
    }),
  });
  if (!res.ok) {
    console.warn(`TTS Google : ${res.status} ${(await res.text()).slice(0, 160)}`);
    return null;
  }
  return clip(Buffer.from((await res.json()).audioContent, "base64"));
}

/** Azure Speech, fr-FR-DeniseNeural (secrets AZURE_SPEECH_KEY + AZURE_SPEECH_REGION). */
async function azureTts(text: string): Promise<Clip | null> {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) return null;
  const xml = text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "riff-24khz-16bit-mono-pcm",
    },
    body: `<speak version="1.0" xml:lang="fr-FR"><voice name="${process.env.AZURE_SPEECH_VOICE || "fr-FR-DeniseNeural"}"><prosody rate="+8%">${xml}</prosody></voice></speak>`,
  });
  if (!res.ok) {
    console.warn(`TTS Azure : ${res.status} ${(await res.text()).slice(0, 160)}`);
    return null;
  }
  return clip(Buffer.from(await res.arrayBuffer()));
}

/** OpenAI, en dernier recours : son français est moyen (retour du propriétaire du 2026-11-26). */
async function openaiTts(text: string): Promise<Clip | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const tries: Record<string, unknown>[] = [
    { model: "gpt-4o-mini-tts", voice: "coral", instructions: VOICE_INSTRUCTIONS },
    { model: "tts-1-hd", voice: "nova", speed: 1.05 },
  ];
  for (const t of tries) {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ ...t, input: text, response_format: "wav" }),
    });
    if (res.ok) return clip(Buffer.from(await res.arrayBuffer()));
    console.warn(`TTS ${t.model} : ${res.status} ${(await res.text()).slice(0, 160)}`);
  }
  return null;
}

/**
 * Aucun retraitement du clip (ni suppression de silences ni accélération) : c'est ce qui hachait la voix.
 * Le rythme vient du réglage de débit du fournisseur et de phrases courtes.
 */
export async function tts(text: string): Promise<Clip | null> {
  for (const f of [googleTts, azureTts, openaiTts]) {
    try {
      const c = await f(text);
      if (c) return c;
    } catch (e) {
      console.warn(`TTS : ${String(e).slice(0, 160)}`);
    }
  }
  return null;
}

// ─── Fond musical ───────────────────────────────────────────────────────────
// 96 bpm, I–V–vi–IV en do majeur (une mesure par accord) : nappe douce, basse, arpège, kick léger.
const CHORDS = [
  { bass: 65.41, tones: [261.63, 329.63, 392.0] }, // do
  { bass: 98.0, tones: [246.94, 293.66, 392.0] }, // sol
  { bass: 110.0, tones: [220.0, 261.63, 329.63] }, // la mineur
  { bass: 87.31, tones: [220.0, 261.63, 349.23] }, // fa
];

export function music(seconds: number, seed = 7): Int16Array {
  const n = Math.ceil(seconds * SR);
  const out = new Float32Array(n);
  const beat = 60 / 96;
  const bar = beat * 4;
  let rnd = seed >>> 0;
  const noise = () => ((rnd = (rnd * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
  const TAU = Math.PI * 2;
  let prevNoise = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const bi = Math.floor(t / bar);
    const ch = CHORDS[bi % CHORDS.length];
    const tb = t - bi * bar;
    // Nappe : attaque douce et relâche avant la mesure suivante (pas de clic au changement d'accord).
    const padEnv = Math.min(1, tb / 0.35) * Math.min(1, (bar - tb) / 0.25) * 0.8;
    let pad = 0;
    for (const f of ch.tones) pad += Math.sin(TAU * f * t) + 0.6 * Math.sin(TAU * f * 1.004 * t) + 0.15 * Math.sin(TAU * 2 * f * t);
    let s = pad * padEnv * 0.05;
    // Basse pincée sur les temps 1 et 3.
    const tBeat = tb % (beat * 2);
    s += Math.sin(TAU * ch.bass * 2 * t) * Math.exp(-tBeat * 4) * 0.22;
    // Arpège en croches, une octave au-dessus.
    const eighth = beat / 2;
    const k = Math.floor(tb / eighth);
    const te = tb - k * eighth;
    const fa = ch.tones[[0, 1, 2, 1][k % 4]] * 2;
    s += (Math.sin(TAU * fa * t) + 0.3 * Math.sin(TAU * 2 * fa * t)) * Math.exp(-te * 9) * 0.07;
    // Kick sur 1 et 3, claquement léger sur 2 et 4, charleston sur les contretemps.
    const tk = tb % (beat * 2);
    if (tk < 0.2) s += Math.sin(TAU * (45 + 75 * Math.exp(-tk * 30)) * tk) * Math.exp(-tk * 22) * 0.35;
    const nz = noise();
    const hp = nz - prevNoise;
    prevNoise = nz;
    const tc = (tb + beat) % (beat * 2);
    if (tc < 0.15) s += hp * Math.exp(-tc * 35) * 0.05;
    if (te < 0.05 && k % 2 === 1) s += hp * Math.exp(-te * 120) * 0.035;
    out[i] = s;
  }
  let peak = 0;
  for (const v of out) peak = Math.max(peak, Math.abs(v));
  const g = peak > 0 ? 0.8 / peak : 1;
  const fadeIn = SR * 0.4;
  const fadeOut = SR * 1.4;
  for (let i = 0; i < n; i++) {
    const f = Math.min(1, i / fadeIn, (n - i) / fadeOut);
    out[i] *= g * Math.max(0, f);
  }
  return toInt16(out);
}

export function writeWav(file: string, pcm: Int16Array) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + pcm.length * 2, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(pcm.length * 2, 40);
  writeFileSync(file, Buffer.concat([h, Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength)]));
}
