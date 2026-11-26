/**
 * Vidéos courtes verticales (TikTok, YouTube Shorts, Reels) générées depuis les données du site.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/shorts-video.ts                       # créneau du jour
 *   npx tsx --tsconfig tsconfig.json scripts/shorts-video.ts --slot 2026-12-02     # un créneau du calendrier
 *   npx tsx --tsconfig tsconfig.json scripts/shorts-video.ts --from 2026-11-26 --count 12
 *   npx tsx --tsconfig tsconfig.json scripts/shorts-video.ts --duel nantes,rennes --ville ile-de-re
 *        --top5 region:bretagne --classement securite          # sujets choisis à la main
 *   options : --out <dossier> (défaut shorts-out) · --stills (images clés, sans encodage) · --plan (liste seule)
 *
 * Quatre formats, 1080×1920, 30 i/s : duel A vs B (barres critère par critère, verdict), classement
 * (top 5 d'un des 19 classements, en barres), ville en 5 chiffres (appel à la note des habitants), top 5
 * d'une région. Voix off (OpenAI, si OPENAI_API_KEY) + fond musical synthétisé (scripts/shorts-audio.ts),
 * sous-titres incrustés et fichier .srt. Chaque scène dure le temps de sa phrase : image, voix et
 * sous-titres restent calés. Sans clé, la vidéo sort avec la musique seule et des durées estimées.
 *
 * Calendrier : un créneau le jour du lancement (2026-11-26) puis chaque lundi, mercredi, vendredi et
 * dimanche ; le format tourne (duel, classement, ville, duel, classement, top 5) et chaque format avance
 * dans sa liste. Publication : scripts/shorts-publish.ts (Facebook + Instagram), workflows shorts-*.
 *
 * Chaque chiffre est une valeur rendue (CITIES_SEED, getHousing, getRankedCities) : celle de la page liée.
 * Un top 5 dont la 5e et la 6e place, ou les deux premières, sont ex æquo à l'affichage est sauté ; les autres
 * ex æquo sont dits comme tels. Photos : public/photos/villes/*-1024 (Wikimedia Commons), auteur et licence
 * écrits sur la photo et dans la légende.
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import { spawn } from "child_process";
import sharp from "sharp";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { comparePairSlug } from "@/lib/comparer-pairs";
import { RANKING_META, getRankedCities, type RankingSlug } from "@/lib/rankings";
import CARDS from "@/data/city-cards.json";
import { tts, music, writeWav, SR, type Clip } from "./shorts-audio";

const ROOT = process.cwd();
const SITE = "https://www.mavilleideale.fr";
const W = 1080;
const H = 1920;
const FPS = 30;
const SANS = "Segoe UI, DejaVu Sans, Arial, sans-serif";
const HEAVY = "Arial Black, Segoe UI, DejaVu Sans, sans-serif";
const PINK = "#F472B6";
const CYAN = "#22D3EE";
const INK = "#E0E7FF";

const args = process.argv.slice(2);
const arg = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const OUT = resolve(ROOT, arg("out") ?? "shorts-out");

// ─── Données ────────────────────────────────────────────────────────────────
type AxisKey = "life" | "transport" | "nature" | "cost" | "safety" | "culture" | "remoteWork" | "schools";
const AXES: AxisKey[] = ["life", "transport", "nature", "cost", "safety", "culture", "remoteWork", "schools"];
const AXIS_FR: Record<AxisKey, string> = {
  life: "Qualité de vie", transport: "Transports", nature: "Nature", cost: "Coût de la vie",
  safety: "Sécurité", culture: "Culture", remoteWork: "Télétravail", schools: "Écoles",
};

// Paires demandées dans Google (docs/seo/cibles.md § 6) qui ont une page /comparer.
const DUELS: [string, string][] = [
  ["nantes", "rennes"], ["metz", "nancy"], ["bordeaux", "toulouse"], ["colmar", "strasbourg"],
  ["tours", "orleans"], ["angers", "tours"], ["annecy", "chambery"], ["lyon", "grenoble"],
  ["marseille", "montpellier"], ["nice", "marseille"], ["vannes", "lorient"], ["caen", "rouen"],
  ["dijon", "besancon"], ["narbonne", "perpignan"], ["pau", "tarbes"], ["nantes", "bordeaux"],
];
// Villes avec traction (cibles.md § 5).
const VILLES = [
  "ile-de-re", "amboise", "nantes", "narbonne", "rennes", "dinard", "marseille", "saint-malo", "dinan",
  "cannes", "concarneau", "laon", "granville", "carcassonne", "bordeaux", "saint-flour", "limoges",
  "angers", "senlis", "agde", "strasbourg", "montpellier", "alencon", "albi",
];
// Classements, du plus demandé (cibles.md § 4) au moins demandé.
const CLASSEMENTS: RankingSlug[] = [
  "budget", "securite", "bord-de-mer", "culture", "climat", "teletravail", "famille", "retraite", "soleil",
  "nature", "etudiant", "mobilite", "sante", "gastronomie", "jeunes-actifs", "logement", "investissement",
  "ecologie", "cyclistes",
] as RankingSlug[];
const TOP5_REGIONS = [
  "Normandie", "Bretagne", "Centre-Val de Loire", "Occitanie", "Hauts-de-France", "Provence-Alpes-Côte d'Azur",
  "Bourgogne-Franche-Comté", "Auvergne-Rhône-Alpes", "Nouvelle-Aquitaine", "Pays de la Loire", "Grand Est", "Île-de-France",
];

const fmt = (n: number) => n.toFixed(1).replace(".", ",");
const euros = (n: number) => `${n.toLocaleString("fr-FR").replace(/[  ]/g, " ")} €`;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const hashtag = (s: string) => "#" + s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]/g, "");
const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const REGION_PREFIX: Record<string, string> = {
  "Grand Est": "dans le ", "Hauts-de-France": "dans les ", "Pays de la Loire": "dans les ", France: "en ",
};
const inRegion = (r: string) => `${REGION_PREFIX[r] ?? "en "}${r}`;

const PHOTO_DIR = join(ROOT, "public", "photos", "villes");
const PHOTO_FILES = existsSync(PHOTO_DIR) ? readdirSync(PHOTO_DIR) : [];
const CARD_META = CARDS as unknown as Record<string, { a: string | null; l: string }>;

function facts(slug: string) {
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) throw new Error(`ville inconnue : ${slug}`);
  const ranked = AXES.map((k) => ({ k, v: c.scores[k] })).sort((a, b) => b.v - a.v);
  const file = PHOTO_FILES.find((f) => f.startsWith(`${slug}-1024.`));
  const meta = CARD_META[slug];
  const author = meta?.a ? (meta.a.length > 38 ? meta.a.slice(0, 37) + "…" : meta.a) : null;
  return {
    c,
    rent: getHousing(slug)?.avgRentT2 ?? null,
    best: ranked[0],
    worst: ranked[ranked.length - 1],
    photo: file ? join(PHOTO_DIR, file) : null,
    credit: meta ? `Photo : ${author ?? "Wikimedia Commons"} · ${meta.l}` : null,
  };
}
type Facts = ReturnType<typeof facts>;

// ─── Scènes, minutage, sous-titres ─────────────────────────────────────────────
/** Une scène = une phrase (texte affiché en sous-titre ; la voix lit sa version « parlée »). */
interface Scene { sub: string; min: number }
interface Timeline { start: number[]; end: number[]; voice: number[]; dur: number[]; total: number }

// Ce que la voix doit lire : pas d'URL épelée, pas de symbole.
function spoken(s: string): string {
  return s
    .replace(/mavilleideale\.fr(\/\S*)?/gi, "MaVilleIdéale point F R")
    .replace(/(\d)\s?€/g, "$1 euros")
    .replace(/(\d),(\d)/g, "$1 virgule $2")
    .replace(/\/10\b/g, " sur 10")
    .replace(/\bT2\b/g, "deux-pièces")
    .replace(/≈\s?/g, "environ ")
    .replace(/#(\d)/g, "numéro $1")
    .replace(/n° ?(\d)/g, "numéro $1");
}

const estimate = (s: string) => Math.max(1.2, spoken(s).length / 17);

function timeline(scenes: Scene[], dur: number[]): Timeline {
  const start: number[] = [];
  const end: number[] = [];
  const voice: number[] = [];
  let t = 0;
  scenes.forEach((s, i) => {
    const lead = i === 0 ? 0.35 : 0.15;
    start.push(t);
    voice.push(t + lead);
    t += Math.max(s.min, lead + dur[i] + 0.22);
    end.push(t);
  });
  return { start, end, voice, dur, total: t + 0.5 };
}

interface Chunk { from: number; to: number; lines: string[] }
function subtitleChunks(scenes: Scene[], tl: Timeline): Chunk[] {
  const chunks: Chunk[] = [];
  scenes.forEach((s, i) => {
    const words = s.sub.split(/\s+/).filter(Boolean);
    const groups: string[][] = [];
    let cur: string[] = [];
    for (const w of words) {
      if ([...cur, w].join(" ").length > 58 && cur.length) {
        groups.push(cur);
        cur = [];
      }
      cur.push(w);
    }
    if (cur.length) groups.push(cur);
    // Pas de mot orphelin : une fin trop courte rejoint le morceau précédent.
    if (groups.length > 1 && groups[groups.length - 1].join(" ").length < 18) groups[groups.length - 2].push(...groups.pop()!);
    const total = groups.reduce((n, g) => n + g.join(" ").length, 0) || 1;
    let t = tl.voice[i];
    for (const g of groups) {
      const d = (g.join(" ").length / total) * tl.dur[i];
      // Deux lignes équilibrées au plus.
      let best = [g.join(" ")];
      if (g.join(" ").length > 30) {
        let bestDiff = Infinity;
        for (let k = 1; k < g.length; k++) {
          const a = g.slice(0, k).join(" ");
          const b = g.slice(k).join(" ");
          const diff = Math.abs(a.length - b.length);
          if (diff < bestDiff) {
            bestDiff = diff;
            best = [a, b];
          }
        }
      }
      chunks.push({ from: t, to: t + d, lines: best });
      t += d;
    }
  });
  return chunks;
}

function subtitleSvg(chunks: Chunk[], t: number): string {
  const c = chunks.find((x) => t >= x.from && t < x.to + 0.12);
  if (!c) return "";
  const size = Math.min(44, ...c.lines.map((l) => fitFont(l, 940, 44, 0.53)));
  const width = Math.min(1000, Math.max(...c.lines.map((l) => l.length)) * size * 0.54 + 64);
  const lineH = size * 1.22;
  const top = 1440;
  const height = c.lines.length * lineH + 30;
  return `<rect x="${(540 - width / 2).toFixed(0)}" y="${top}" width="${width.toFixed(0)}" height="${height.toFixed(0)}" rx="22" fill="#000000" fill-opacity="0.62"/>` +
    c.lines.map((l, k) => text(540, Math.round(top + 15 + size + k * lineH - size * 0.18), l, { size, weight: 800, anchor: "middle" })).join("");
}

const srtTime = (s: number) => {
  const ms = Math.max(0, Math.round(s * 1000));
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
const toSrt = (chunks: Chunk[]) =>
  chunks.map((c, i) => `${i + 1}\n${srtTime(c.from)} --> ${srtTime(c.to)}\n${c.lines.join("\n")}\n`).join("\n");

// ─── Moteur d'images ──────────────────────────────────────────────────────────
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const prog = (t: number, a: number, b: number) => ease((t - a) / (b - a));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

type Overlay = Parameters<ReturnType<typeof sharp>["composite"]>[0][number];
interface Rect { x: number; y: number; w: number; h: number }
interface PhotoDraw { src: Facts; rect: Rect; pan: number; opacity?: number }
interface Frame { photos: PhotoDraw[]; svg: string }

const BG = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="#141B2D"/><stop offset="0.55" stop-color="#1E1B4B"/><stop offset="1" stop-color="#3B0764"/></linearGradient>
    <radialGradient id="p" cx="0.85" cy="0.12" r="0.55"><stop offset="0" stop-color="#DB2777" stop-opacity="0.35"/><stop offset="1" stop-color="#DB2777" stop-opacity="0"/></radialGradient>
    <radialGradient id="c" cx="0.1" cy="0.9" r="0.6"><stop offset="0" stop-color="#0891B2" stop-opacity="0.3"/><stop offset="1" stop-color="#0891B2" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" fill="url(#p)"/><rect width="${W}" height="${H}" fill="url(#c)"/>
</svg>`);
let bgRaw: Buffer | null = null;

// Photo pré-agrandie de 12 % une fois par taille : le pan est un simple extract, pas un redimensionnement.
const photoCache = new Map<string, { buf: Buffer; w: number; h: number }>();
async function photoAt(f: Facts, w: number, h: number) {
  const key = `${f.c.slug}:${w}x${h}`;
  const hit = photoCache.get(key);
  if (hit) return hit;
  const pw = Math.round(w * 1.12);
  const ph = Math.round(h * 1.12);
  const buf = f.photo
    ? await sharp(f.photo).resize(pw, ph, { fit: "cover", position: "attention" }).removeAlpha().raw().toBuffer()
    : await sharp({ create: { width: pw, height: ph, channels: 3, background: "#4F46E5" } }).raw().toBuffer();
  const v = { buf, w: pw, h: ph };
  if (photoCache.size > 60) photoCache.clear();
  photoCache.set(key, v);
  return v;
}

async function drawPhoto(d: PhotoDraw): Promise<Overlay> {
  const w = Math.max(2, Math.round(d.rect.w));
  const h = Math.max(2, Math.round(d.rect.h));
  const big = await photoAt(d.src, w, h);
  const left = Math.round(clamp01(d.pan) * (big.w - w));
  const top = Math.round(clamp01(d.pan) * (big.h - h) * 0.5);
  const radius = Math.round(Math.min(w, h) * 0.06);
  const mask = Buffer.from(
    `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${radius}" fill="#fff" fill-opacity="${d.opacity ?? 1}"/></svg>`,
  );
  const input = await sharp(big.buf, { raw: { width: big.w, height: big.h, channels: 3 } })
    .extract({ left, top, width: w, height: h })
    .ensureAlpha()
    .composite([{ input: mask, blend: "dest-in" }])
    .png({ compressionLevel: 0 })
    .toBuffer();
  return { input, left: Math.round(d.rect.x), top: Math.round(d.rect.y) };
}

// sharp refuse un calque qui déborde du cadre : on rogne le rectangle.
function clipRect(r: Rect): Rect | null {
  const x = Math.max(0, r.x);
  const y = Math.max(0, r.y);
  const w = Math.min(W, r.x + r.w) - x;
  const h = Math.min(H, r.y + r.h) - y;
  return w >= 2 && h >= 2 ? { x, y, w, h } : null;
}

async function renderFrame(fr: Frame): Promise<Buffer> {
  if (!bgRaw) bgRaw = await sharp(BG).removeAlpha().raw().toBuffer();
  const layers: Overlay[] = [];
  for (const p of fr.photos) {
    const clipped = clipRect(p.rect);
    if (!clipped) continue;
    layers.push(await drawPhoto({ ...p, rect: clipped }));
  }
  layers.push({ input: Buffer.from(fr.svg), left: 0, top: 0 });
  return sharp(bgRaw, { raw: { width: W, height: H, channels: 3 } }).composite(layers).jpeg({ quality: 88 }).toBuffer();
}

async function encode(file: string, seconds: number, frameAt: (t: number) => Frame, voiceWav: string, musicWav: string, hasVoice: boolean) {
  // La musique s'efface sous la voix (compresseur piloté par la voix), puis les deux sont mixées.
  const filter = hasVoice
    ? "[1:a]asplit=2[v1][v2];[2:a]volume=0.42[m];[m][v1]sidechaincompress=threshold=0.02:ratio=8:attack=15:release=350[mc];" +
      "[mc][v2]amix=inputs=2:normalize=0:duration=longest,loudnorm=I=-15:TP=-1.5:LRA=11,aresample=44100,aformat=channel_layouts=stereo[a]"
    : "[2:a]loudnorm=I=-18:TP=-1.5:LRA=11,aresample=44100,aformat=channel_layouts=stereo[a]";
  const ff = spawn(
    "ffmpeg",
    [
      "-y", "-loglevel", "error",
      "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
      "-i", voiceWav, "-i", musicWav,
      "-filter_complex", filter, "-map", "0:v", "-map", "[a]",
      "-t", seconds.toFixed(2), "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", file,
    ],
    { stdio: ["pipe", "inherit", "inherit"] },
  );
  const done = new Promise<void>((res, rej) => {
    ff.on("error", rej);
    ff.on("close", (code) => (code === 0 ? res() : rej(new Error(`ffmpeg a quitté avec le code ${code}`))));
  });
  const n = Math.round(seconds * FPS);
  for (let i = 0; i < n; i++) {
    const jpg = await renderFrame(frameAt(i / FPS));
    if (!ff.stdin.write(jpg)) await new Promise((r) => ff.stdin.once("drain", r));
  }
  ff.stdin.end();
  await done;
}

// ─── Éléments SVG communs ─────────────────────────────────────────────────────
const svgOpen = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><defs>
  <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4F46E5"/><stop offset="0.5" stop-color="#7C3AED"/><stop offset="1" stop-color="#DB2777"/></linearGradient>
  <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.7"/></linearGradient>
</defs>`;
const fitFont = (s: string, maxW: number, max: number, k = 0.56) => Math.min(max, Math.floor(maxW / (Math.max(1, s.length) * k)));
const text = (x: number, y: number, s: string, o: { size: number; fill?: string; weight?: number; anchor?: string; family?: string; opacity?: number }) =>
  `<text x="${x}" y="${y}" font-family="${o.family ?? SANS}" font-size="${o.size}" font-weight="${o.weight ?? 700}" fill="${o.fill ?? "#FFFFFF"}"${o.anchor ? ` text-anchor="${o.anchor}"` : ""}${o.opacity !== undefined ? ` fill-opacity="${o.opacity.toFixed(3)}"` : ""}>${esc(s)}</text>`;
const pill = (x: number, y: number, label: string, fill = "url(#brand)") => {
  const w = Math.round(label.length * 17.5 + 56); // large : DejaVu (CI) est plus large que Segoe UI
  return `<rect x="${x}" y="${y}" width="${w}" height="56" rx="28" fill="${fill}"/>${text(x + 28, y + 38, label, { size: 27, weight: 800 })}`;
};
const brandBar = (url: string) =>
  `<rect x="0" y="${H - 12}" width="${W}" height="12" fill="url(#brand)"/>` +
  text(60, 128, "MaVilleIdéale", { size: 34, weight: 800, fill: "#FFFFFF" }) +
  text(60, 162, url, { size: 22, weight: 600, fill: "#A5B4FC" });
const photoOverlay = (r: Rect, name: string | null, credit: string | null, opacity = 1) =>
  `<g opacity="${opacity.toFixed(3)}"><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="${Math.round(Math.min(r.w, r.h) * 0.06)}" fill="url(#shade)"/>` +
  (name ? text(r.x + 34, r.y + r.h - 40, name, { size: fitFont(name, r.w - 70, 64), weight: 800 }) : "") +
  (credit ? text(r.x + r.w - 20, r.y + 34, credit, { size: 18, weight: 500, anchor: "end", fill: "#FFFFFF", opacity: 0.85 }) : "") +
  `</g>`;
const legend = (s: string, y = 1650) => text(540, y, s, { size: 22, weight: 500, anchor: "middle", fill: "#94A3B8" });
const endCard = (lines: { s: string; size: number; fill?: string; weight?: number }[], link: string, opacity: number) => {
  let y = 840;
  let out = `<g opacity="${opacity.toFixed(3)}"><rect x="60" y="720" width="960" height="600" rx="40" fill="#141B2D" fill-opacity="0.94" stroke="url(#brand)" stroke-width="4"/>`;
  for (const l of lines) {
    out += text(540, y, l.s, { size: fitFont(l.s, 900, l.size), weight: l.weight ?? 800, anchor: "middle", fill: l.fill ?? "#FFFFFF" });
    y += l.size + 26;
  }
  out += text(540, 1230, link, { size: fitFont(link, 900, 42), weight: 800, anchor: "middle", fill: CYAN });
  return out + "</g>";
};

// ─── Vidéo : description commune ───────────────────────────────────────────────
interface Video {
  file: string;
  title: string;
  link: string;
  caption: string;
  scenes: Scene[];
  frame: (t: number, tl: Timeline) => Frame;
}

// ─── Format 1 : duel ──────────────────────────────────────────────────────────
function duelVideo(a: Facts, b: Facts, stamp: string): Video {
  const pair = comparePairSlug(a.c.slug, b.c.slug);
  const link = `${SITE}/comparer/${pair}`;
  const shortLink = link.replace("https://www.", "");
  type Row = { label: string; va: number; vb: number; da: string; db: string; lowerWins?: boolean };
  const rows: Row[] = [];
  if (a.rent && b.rent) rows.push({ label: "Loyer T2 (le moins cher gagne)", va: a.rent, vb: b.rent, da: euros(a.rent), db: euros(b.rent), lowerWins: true });
  const picks: AxisKey[] = ["safety", "transport", "nature", "culture", "schools", "remoteWork"];
  for (const k of picks.slice(0, 6 - rows.length)) rows.push({ label: AXIS_FR[k], va: a.c.scores[k], vb: b.c.scores[k], da: fmt(a.c.scores[k]), db: fmt(b.c.scores[k]) });
  const winner = (r: Row) => (r.da === r.db ? 0 : (r.lowerWins ? r.va < r.vb : r.va > r.vb) ? 1 : 2);
  const ga = a.c.scores.global;
  const gb = b.c.scores.global;
  const verdict = fmt(ga) === fmt(gb) ? "Égalité parfaite" : `${ga > gb ? a.c.name : b.c.name} l'emporte${Math.abs(ga - gb) < 0.35 ? ", de peu" : ""}`;
  const plusOf = (x: Facts, y: Facts) =>
    AXES.filter((k) => x.c.scores[k] - y.c.scores[k] >= 0.5)
      .sort((k1, k2) => (x.c.scores[k2] - y.c.scores[k2]) - (x.c.scores[k1] - y.c.scores[k1]))
      .slice(0, 2)
      .map((k) => AXIS_FR[k].toLowerCase());
  const plusA = plusOf(a, b);
  const plusB = plusOf(b, a);
  const title = `${a.c.name} ou ${b.c.name} ?`;

  const scenes: Scene[] = [
    { sub: `${a.c.name} ou ${b.c.name} : où vit-on le mieux ? Six critères, un verdict.`, min: 3.4 },
    ...rows.map((r) => ({
      sub: r.da === r.db
        ? `${r.label.replace(" (le moins cher gagne)", "")} : égalité, ${r.da} partout.`
        : r.lowerWins
          ? `Loyer d'un T2 : ${r.da} à ${a.c.name}, ${r.db} à ${b.c.name}.`
          : `${r.label} : ${r.da} pour ${a.c.name}, ${r.db} pour ${b.c.name}.`,
      min: 1.7,
    })),
    { sub: `Note globale : ${fmt(ga)}/10 pour ${a.c.name}, ${fmt(gb)}/10 pour ${b.c.name}. ${verdict}.`, min: 3.8 },
    { sub: `Le comparatif complet est sur mavilleideale.fr. Et vous, laquelle choisissez-vous ?`, min: 3.2 },
  ];
  const R = rows.length;
  const introA: Rect = { x: 40, y: 370, w: 1000, h: 470 };
  const introB: Rect = { x: 40, y: 970, w: 1000, h: 450 };
  const headA: Rect = { x: 40, y: 210, w: 490, h: 300 };
  const headB: Rect = { x: 550, y: 210, w: 490, h: 300 };

  const frame = (t: number, tl: Timeline): Frame => {
    const T_SHRINK = Math.max(2.4, tl.end[0] - 0.7);
    const T_VERDICT = tl.start[R + 1];
    const T_END = tl.start[R + 2];
    const s = prog(t, T_SHRINK, T_SHRINK + 0.7);
    const slideA = prog(t, 0, 0.6);
    const slideB = prog(t, 0.15, 0.75);
    const ra: Rect = s > 0
      ? { x: lerp(introA.x, headA.x, s), y: lerp(introA.y, headA.y, s), w: lerp(introA.w, headA.w, s), h: lerp(introA.h, headA.h, s) }
      : { ...introA, x: lerp(-W, introA.x, slideA) };
    const rb: Rect = s > 0
      ? { x: lerp(introB.x, headB.x, s), y: lerp(introB.y, headB.y, s), w: lerp(introB.w, headB.w, s), h: lerp(introB.h, headB.h, s) }
      : { ...introB, x: lerp(W, introB.x, slideB) };
    const pan = t / tl.total;
    let svg = svgOpen + brandBar(shortLink);
    if (t < T_SHRINK + 0.7) {
      svg += `<g opacity="${(1 - s).toFixed(3)}">` + pill(60, 196, "DUEL DE VILLES · 8 CRITÈRES") +
        text(60, 330, title, { size: fitFont(title, 960, 88), weight: 800 }) + `</g>`;
      svg += photoOverlay(ra, s < 0.5 ? a.c.name : null, s < 0.2 ? a.credit : null);
      svg += photoOverlay(rb, s < 0.5 ? b.c.name : null, s < 0.2 ? b.credit : null);
      const vs = prog(t, 0.6, 1.0) * (1 - s);
      svg += `<g opacity="${vs.toFixed(3)}"><circle cx="540" cy="905" r="${Math.round(64 + 6 * Math.sin(t * 6))}" fill="url(#brand)" stroke="#FFFFFF" stroke-width="6"/>` +
        text(540, 929, "VS", { size: 58, weight: 900, anchor: "middle", family: HEAVY }) + `</g>`;
    } else {
      svg += photoOverlay(ra, null, null) + photoOverlay(rb, null, null);
      svg += text(285, 572, a.c.name, { size: fitFont(a.c.name, 470, 46), weight: 800, anchor: "middle", fill: PINK });
      svg += text(795, 572, b.c.name, { size: fitFont(b.c.name, 470, 46), weight: 800, anchor: "middle", fill: CYAN });
      const dim = t > T_VERDICT ? 1 - 0.75 * prog(t, T_VERDICT, T_VERDICT + 0.5) : 1;
      let tallyA = 0;
      let tallyB = 0;
      svg += `<g opacity="${dim.toFixed(3)}">`;
      rows.forEach((r, i) => {
        const t0 = tl.start[1 + i];
        const appear = prog(t, t0, t0 + 0.35);
        if (appear <= 0) return;
        const grow = prog(t, t0 + 0.15, t0 + 0.95);
        const y = 662 + i * 128;
        const max = Math.max(r.va, r.vb);
        const la = (r.va / max) * 300 * grow;
        const lb = (r.vb / max) * 300 * grow;
        const w = grow >= 0.999 ? winner(r) : 0;
        if (w === 1) tallyA++;
        if (w === 2) tallyB++;
        svg += `<g opacity="${appear.toFixed(3)}">` +
          text(540, y, r.label, { size: 32, weight: 700, anchor: "middle", fill: INK }) +
          `<rect x="${(520 - la).toFixed(1)}" y="${y + 18}" width="${la.toFixed(1)}" height="42" rx="12" fill="${PINK}" fill-opacity="${w === 2 ? 0.45 : 1}"/>` +
          `<rect x="560" y="${y + 18}" width="${lb.toFixed(1)}" height="42" rx="12" fill="${CYAN}" fill-opacity="${w === 1 ? 0.45 : 1}"/>` +
          text(60, y + 52, r.da + (w === 1 ? "  ✓" : ""), { size: 40, weight: 800, fill: w === 1 ? "#FFFFFF" : "#CBD5E1" }) +
          text(1020, y + 52, (w === 2 ? "✓  " : "") + r.db, { size: 40, weight: 800, anchor: "end", fill: w === 2 ? "#FFFFFF" : "#CBD5E1" }) +
          `</g>`;
      });
      svg += `</g>`;
      // Tableau d'affichage entre les deux photos.
      if (t < T_VERDICT) {
        svg += `<circle cx="540" cy="360" r="62" fill="#141B2D" stroke="url(#brand)" stroke-width="5"/>` +
          text(540, 376, `${tallyA}–${tallyB}`, { size: 44, weight: 900, anchor: "middle", family: HEAVY });
      }
      if (t >= T_VERDICT) {
        const v = prog(t, T_VERDICT, T_VERDICT + 0.6);
        const count = prog(t, T_VERDICT + 0.2, T_VERDICT + 1.4);
        const endP = prog(t, T_END, T_END + 0.5);
        svg += `<g opacity="${(v * (1 - endP)).toFixed(3)}"><rect x="60" y="700" width="960" height="640" rx="40" fill="#141B2D" fill-opacity="0.92" stroke="url(#brand)" stroke-width="4"/>` +
          pill(390, 740, "VERDICT") +
          text(540, 880, "Note globale MaVilleIdéale", { size: 36, weight: 600, anchor: "middle", fill: INK }) +
          text(300, 1040, fmt(ga * count), { size: 150, weight: 900, anchor: "middle", family: HEAVY, fill: PINK }) +
          text(780, 1040, fmt(gb * count), { size: 150, weight: 900, anchor: "middle", family: HEAVY, fill: CYAN }) +
          text(540, 1010, "vs", { size: 44, weight: 700, anchor: "middle", fill: "#94A3B8" }) +
          text(540, 1150, verdict, { size: fitFont(verdict, 900, 48), weight: 800, anchor: "middle" }) +
          (plusA.length ? text(540, 1222, `${a.c.name} : + ${plusA.join(", ")}`, { size: 32, weight: 600, anchor: "middle", fill: PINK }) : "") +
          (plusB.length ? text(540, 1276, `${b.c.name} : + ${plusB.join(", ")}`, { size: 32, weight: 600, anchor: "middle", fill: CYAN }) : "") +
          `</g>`;
        if (t >= T_END) {
          svg += endCard(
            [
              { s: "Le comparatif complet,", size: 48 },
              { s: "8 critères, loyers et quartiers :", size: 38, weight: 600, fill: INK },
              { s: "Et vous, laquelle choisissez-vous ?", size: 40, fill: PINK },
            ],
            shortLink,
            endP,
          );
        }
      }
      svg += legend("Notes MaVilleIdéale sur 10 (10 = le plus favorable) · loyers estimés");
      svg += legend(`${a.credit ?? ""}${a.credit && b.credit ? "  |  " : ""}${b.credit ?? ""}`.slice(0, 110), 1680);
    }
    return { photos: [{ src: a, rect: ra, pan }, { src: b, rect: rb, pan: 1 - pan }], svg: svg + "</svg>" };
  };

  const lines = rows.map((r) => `${r.label.replace(" (le moins cher gagne)", "")} : ${a.c.name} ${r.da} · ${b.c.name} ${r.db}`);
  const caption = captionBlock({
    title: `${title} Le duel en chiffres`,
    hook: `${title} On a comparé les deux villes sur nos critères.`,
    body: [...lines, `Note globale : ${a.c.name} ${fmt(ga)}/10 · ${b.c.name} ${fmt(gb)}/10 → ${verdict}.`],
    link,
    tags: [hashtag(a.c.name), hashtag(b.c.name), "#ouvivre", "#demenagement", "#qualitedevie", "#villesdefrance"],
    credits: [a.credit, b.credit],
  });
  return { file: `${stamp}-duel-${pair}`, title, link, caption, scenes, frame };
}

// ─── Format 2 : classement (top 5 d'un des 19 classements, en barres) ─────────
interface Ranked { f: Facts; rank: number; tied: boolean; score: number }

/**
 * Top N sur la valeur affichée, N de 3 à 7 : on coupe là où le score départage (5 de préférence, puis 4, 6,
 * 3, 7), jamais au milieu d'une égalité. Rang « olympique » : des ex æquo partagent leur rang, ordre
 * alphabétique entre eux (annoncé à l'écran). null si aucune coupure propre n'existe.
 */
function rankTopN(items: { slug: string; score: number }[]): Ranked[] | null {
  const d = (x: { score: number }) => fmt(x.score);
  const n = [5, 4, 6, 3, 7].find((k) => items.length > k && d(items[k - 1]) !== d(items[k]));
  if (!n) return null;
  const top = items.slice(0, n);
  return top.map((it) => {
    const first = top.findIndex((x) => d(x) === d(it));
    return { f: facts(it.slug), rank: first + 1, tied: top.filter((x) => d(x) === d(it)).length > 1, score: it.score };
  });
}

const rankSay = (r: Ranked) => `n° ${r.rank}${r.tied ? " ex æquo" : ""}`;

function classementVideo(slug: RankingSlug, ranked: Ranked[], stamp: string): Video {
  const meta = RANKING_META[slug];
  const link = `${SITE}/classements/${slug}`;
  const shortLink = link.replace("https://www.", "");
  const N = ranked.length;
  const order = [...ranked].reverse(); // révélé du dernier au premier
  const scenes: Scene[] = [
    { sub: `${meta.headline} : notre top ${N}.`, min: 2.6 },
    ...order.map((r) => ({ sub: `${rankSay(r)} : ${r.f.c.name}, ${fmt(r.score)}/10.`, min: 2.0 })),
    { sub: `Le classement complet et la méthode sont sur mavilleideale.fr.`, min: 3.0 },
  ];
  const card: Rect = { x: 40, y: 370, w: 1000, h: 400 };
  const rowH = Math.min(104, 560 / N);
  const frame = (t: number, tl: Timeline): Frame => {
    let svg = svgOpen + brandBar(shortLink);
    svg += pill(60, 196, `TOP ${N} · ${meta.label.toUpperCase()}`);
    svg += text(60, 318, meta.headline, { size: fitFont(meta.headline, 960, 64), weight: 800 });
    const photos: PhotoDraw[] = [];
    const T_END = tl.start[N + 1];
    const idx = order.filter((_, i) => t >= tl.start[i + 1]).length - 1; // scène de révélation en cours
    if (idx >= 0) {
      const cur = order[idx];
      const local = t - tl.start[idx + 1];
      const inP = prog(local, 0, 0.45);
      const r: Rect = { ...card, x: lerp(W, card.x, inP) };
      photos.push({ src: cur.f, rect: r, pan: local / 3 });
      svg += photoOverlay(r, cur.f.c.name, cur.f.credit);
      svg += `<g opacity="${inP.toFixed(3)}"><circle cx="140" cy="460" r="64" fill="url(#brand)" stroke="#FFFFFF" stroke-width="5"/>` +
        text(140, 482, `#${cur.rank}`, { size: 58, weight: 900, anchor: "middle", family: HEAVY }) + `</g>`;
    } else {
      // Intro : le titre seul, puis les cinq emplacements vides.
      svg += `<rect x="40" y="370" width="1000" height="400" rx="24" fill="#FFFFFF" fill-opacity="0.06"/>` +
        text(540, 600, `Top ${N}`, { size: 120, weight: 900, anchor: "middle", family: HEAVY, fill: "url(#brand)" });
    }
    const nameSize = Math.round(Math.min(34, rowH * 0.36));
    const barH = Math.round(Math.min(30, rowH * 0.3));
    const badgeR = Math.round(Math.min(30, rowH * 0.3));
    for (let k = 0; k < N; k++) {
      const r = ranked[k];
      const revealAt = tl.start[N - k]; // le dernier (k = N-1) apparaît en scène 1
      const appear = prog(t, revealAt, revealAt + 0.35);
      const y = Math.round(850 + k * rowH);
      svg += `<g opacity="${(0.25 + 0.75 * appear).toFixed(3)}"><circle cx="88" cy="${y - 2}" r="${badgeR}" fill="${appear > 0 ? "url(#brand)" : "#334155"}"/>` +
        text(88, y + Math.round(badgeR * 0.33), `#${appear > 0 ? r.rank : k + 1}`, { size: Math.round(badgeR * 0.93), weight: 900, anchor: "middle" }) + `</g>`;
      if (appear <= 0) continue;
      const grow = prog(t, revealAt + 0.15, revealAt + 0.95);
      const current = idx >= 0 && order[idx] === r && t < T_END;
      const lead = t >= T_END && r.rank === 1;
      const label = r.f.c.name + (r.tied ? " (ex æquo)" : "");
      svg += `<g opacity="${appear.toFixed(3)}">` +
        text(136, y + 2, label, { size: Math.min(nameSize, fitFont(label, 680, nameSize)), weight: 800, fill: current || lead ? "#FFFFFF" : INK }) +
        `<rect x="136" y="${y + Math.round(barH * 0.55)}" width="${((r.score / 10) * 680 * grow).toFixed(1)}" height="${barH}" rx="10" fill="${current || lead ? PINK : CYAN}" fill-opacity="${current || lead ? 1 : 0.8}"/>` +
        text(1020, y + Math.round(barH * 1.35), fmt(r.score * grow), { size: Math.round(Math.min(42, rowH * 0.42)), weight: 900, anchor: "end", family: HEAVY, fill: current || lead ? PINK : CYAN }) +
        `</g>`;
    }
    if (t >= T_END) {
      const p = prog(t, T_END, T_END + 0.5);
      const firsts = ranked.filter((r) => r.rank === 1).map((r) => r.f.c.name);
      svg += endCard(
        [
          { s: firsts.length > 1 ? `n° 1 ex æquo : ${firsts.join(", ")}` : `n° 1 : ${firsts[0]}`, size: 52, fill: PINK },
          { s: "Le classement complet", size: 40 },
          { s: "et la méthode :", size: 38, weight: 600, fill: INK },
        ],
        shortLink,
        p,
      );
    }
    svg += legend(`Score composite MaVilleIdéale sur 10 (${meta.label.toLowerCase()})${ranked.some((r) => r.tied) ? " · ex æquo : ordre alphabétique" : ""}`);
    return { photos, svg: svg + "</svg>" };
  };
  const caption = captionBlock({
    title: `${meta.headline} : le top ${N} (2027)`,
    hook: `${meta.headline} : notre top ${N} sur 593 villes.`,
    body: [
      ...ranked.map((r) => `${r.rank}${r.tied ? " ex æquo" : ""}. ${r.f.c.name} (${r.f.c.department}) : ${fmt(r.score)}/10`),
      `Méthode : ${meta.methodology}`,
    ],
    link,
    tags: [hashtag(meta.label), "#classement", "#ouvivre", "#villesdefrance", "#qualitedevie", "#demenagement"],
    credits: ranked.map((r) => r.f.credit),
  });
  return { file: `${stamp}-classement-${slug}`, title: meta.headline, link, caption, scenes, frame };
}

// ─── Format 3 : une ville en cinq chiffres ────────────────────────────────────
function villeVideo(f: Facts, stamp: string): Video {
  const link = `${SITE}/villes/${f.c.slug}`;
  const shortLink = link.replace("https://www.", "");
  const pop = f.c.population.toLocaleString("fr-FR").replace(/[  ]/g, " ");
  const stats: { label: string; value: string; color: string; sub: string }[] = [
    { label: "Note globale", value: `${fmt(f.c.scores.global)}/10`, color: "#FFFFFF", sub: `Note globale : ${fmt(f.c.scores.global)}/10.` },
    ...(f.rent ? [{ label: "Loyer d'un T2", value: `≈ ${euros(f.rent)}/mois`, color: CYAN, sub: `Un T2 se loue environ ${euros(f.rent)} par mois.` }] : []),
    { label: `Point fort : ${AXIS_FR[f.best.k].toLowerCase()}`, value: `${fmt(f.best.v)}/10`, color: "#86EFAC", sub: `Point fort : ${AXIS_FR[f.best.k].toLowerCase()}, ${fmt(f.best.v)}/10.` },
    { label: `Point faible : ${AXIS_FR[f.worst.k].toLowerCase()}`, value: `${fmt(f.worst.v)}/10`, color: "#FDA4AF", sub: `Point faible : ${AXIS_FR[f.worst.k].toLowerCase()}, ${fmt(f.worst.v)}/10.` },
    { label: "Habitants", value: `≈ ${pop}`, color: PINK, sub: `Environ ${pop} habitants.` },
  ];
  const title = `Vivre à ${f.c.name}`;
  const scenes: Scene[] = [
    { sub: `Vivre à ${f.c.name}, en cinq chiffres.`, min: 2.8 },
    ...stats.map((s) => ({ sub: s.sub, min: 1.6 })),
    { sub: `Vous habitez ${f.c.name} ? Donnez votre note en dix secondes sur mavilleideale.fr.`, min: 3.4 },
  ];
  const S = stats.length;
  const hero: Rect = { x: 40, y: 360, w: 1000, h: 640 };
  const top: Rect = { x: 40, y: 210, w: 1000, h: 400 };
  const frame = (t: number, tl: Timeline): Frame => {
    const T_SHRINK = Math.max(2.0, tl.end[0] - 0.6);
    const T_CTA = tl.start[S + 1];
    const s = prog(t, T_SHRINK, T_SHRINK + 0.6);
    const inP = prog(t, 0, 0.7);
    const r: Rect = s > 0
      ? { x: lerp(hero.x, top.x, s), y: lerp(hero.y, top.y, s), w: lerp(hero.w, top.w, s), h: lerp(hero.h, top.h, s) }
      : { ...hero, y: lerp(H, hero.y, inP) };
    let svg = svgOpen + brandBar(shortLink) + photoOverlay(r, null, f.credit);
    const titleY = lerp(1120, 680, s);
    svg += text(60, titleY, title, { size: fitFont(title, 960, 84), weight: 800 });
    svg += `<g opacity="${(1 - s).toFixed(3)}">` + text(60, titleY + 70, `${f.c.region} · en 5 chiffres`, { size: 40, weight: 600, fill: INK }) + `</g>`;
    const ctaP = prog(t, T_CTA, T_CTA + 0.5);
    stats.forEach((st, i) => {
      const t0 = tl.start[1 + i];
      const a = prog(t, t0, t0 + 0.45) * (1 - 0.7 * ctaP);
      if (a <= 0) return;
      const y = 740 + i * 128;
      const dx = (1 - prog(t, t0, t0 + 0.45)) * 80;
      svg += `<g opacity="${a.toFixed(3)}" transform="translate(${dx.toFixed(1)},0)"><rect x="60" y="${y}" width="960" height="108" rx="26" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.18"/>` +
        text(100, y + 68, st.label, { size: fitFont(st.label, 520, 38), weight: 600, fill: INK }) +
        text(990, y + 74, st.value, { size: fitFont(st.value, 380, 56), weight: 900, anchor: "end", family: HEAVY, fill: st.color }) + `</g>`;
    });
    if (t >= T_CTA) {
      svg += endCard(
        [
          { s: `Vous habitez ${f.c.name} ?`, size: 52 },
          { s: "Donnez votre note en 10 secondes,", size: 38, weight: 600, fill: INK },
          { s: "sans inscription :", size: 38, weight: 600, fill: INK },
        ],
        shortLink,
        ctaP,
      );
    }
    svg += legend("Notes MaVilleIdéale sur 10 (10 = le plus favorable) · loyer estimé");
    return { photos: [{ src: f, rect: r, pan: t / tl.total }], svg: svg + "</svg>" };
  };
  const caption = captionBlock({
    title: `Vivre à ${f.c.name} : la ville en 5 chiffres`,
    hook: `Vivre à ${f.c.name}, ça donne quoi en chiffres ?`,
    body: [...stats.map((s) => s.sub), `Vous y habitez ? Donnez votre note en 10 secondes sur la fiche de la ville.`],
    link: `${link}#note-habitants`,
    tags: [hashtag(f.c.name), hashtag(f.c.region), "#vivrea" + slugify(f.c.name).replace(/-/g, ""), "#ouvivre", "#demenagement", "#qualitedevie"],
    credits: [f.credit],
  });
  return { file: `${stamp}-ville-${f.c.slug}`, title, link, caption, scenes, frame };
}

// ─── Format 4 : top 5 d'une région ────────────────────────────────────────────
function top5Video(region: string, ranked: Ranked[], stamp: string): Video {
  const regionSlug = slugify(region);
  const link = `${SITE}/regions/${regionSlug}`;
  const shortLink = link.replace("https://www.", "");
  const title = `Où vivre ${inRegion(region)} ?`;
  const anyTie = ranked.some((r) => r.tied);
  const N = ranked.length;
  const order = [...ranked].reverse(); // du dernier au premier
  const listH = Math.min(52, 290 / N);
  const scenes: Scene[] = [
    { sub: `Où vivre ${inRegion(region)} ? Voici notre top ${N}.`, min: 2.4 },
    ...order.map((r) => ({ sub: `${rankSay(r)} : ${r.f.c.name}, ${fmt(r.score)}/10.`, min: 2.3 })),
    { sub: `Le classement complet et les avis sont sur mavilleideale.fr.`, min: 3.0 },
  ];
  const card: Rect = { x: 40, y: 400, w: 1000, h: 540 };
  const frame = (t: number, tl: Timeline): Frame => {
    let svg = svgOpen + brandBar(shortLink);
    svg += text(60, 290, title, { size: fitFont(title, 960, 80), weight: 800 });
    svg += text(60, 352, `Le top ${N} de nos notes (8 critères)`, { size: 38, weight: 600, fill: INK });
    const photos: PhotoDraw[] = [];
    const T_END = tl.start[N + 1];
    const idx = order.filter((_, i) => t >= tl.start[i + 1]).length - 1;
    if (idx >= 0 && t < T_END) {
      const r0 = order[idx];
      const local = t - tl.start[idx + 1];
      const inP = prog(local, 0, 0.45);
      const r: Rect = { ...card, x: lerp(W, card.x, inP) };
      photos.push({ src: r0.f, rect: r, pan: local / 3 });
      svg += photoOverlay(r, null, r0.f.credit);
      svg += `<g opacity="${inP.toFixed(3)}"><circle cx="150" cy="500" r="78" fill="url(#brand)" stroke="#FFFFFF" stroke-width="6"/>` +
        text(150, 526, `#${r0.rank}`, { size: 72, weight: 900, anchor: "middle", family: HEAVY }) +
        (r0.tied ? text(150, 616, "ex æquo", { size: 30, weight: 800, anchor: "middle" }) : "") +
        text(60, 1030, r0.f.c.name, { size: fitFont(r0.f.c.name, 700, 70), weight: 800 }) +
        text(1020, 1034, `${fmt(r0.score)}/10`, { size: 74, weight: 900, anchor: "end", family: HEAVY, fill: CYAN }) +
        text(60, 1084, `${r0.f.c.department}${r0.f.rent ? ` · T2 ≈ ${euros(r0.f.rent)}` : ""}`, { size: 32, weight: 600, fill: INK }) + `</g>`;
    }
    const shown = idx + 1;
    for (let i = 0; i < shown; i++) {
      const r = order[i];
      const k = N - 1 - i;
      const y = Math.round(1150 + k * listH);
      const fs = Math.round(Math.min(30, listH * 0.6));
      const lead = r.rank === 1 && t >= T_END;
      svg += text(80, y, `#${r.rank}${r.tied ? " ex æquo" : ""}  ${r.f.c.name}`, { size: fs, weight: lead ? 900 : 700, fill: lead ? PINK : "#FFFFFF" }) +
        text(1000, y, fmt(r.score), { size: fs, weight: 800, anchor: "end", fill: CYAN });
    }
    if (t >= T_END) {
      const p = prog(t, T_END, T_END + 0.5);
      const first = ranked[0];
      const firsts = ranked.filter((r) => r.rank === 1).map((r) => r.f.c.name);
      photos.push({ src: first.f, rect: card, pan: (t - T_END) / 3.2, opacity: p });
      svg += `<g opacity="${p.toFixed(3)}">` + photoOverlay(card, firsts.length > 1 ? `n° 1 ex æquo : ${firsts.join(", ")}` : `n° 1 : ${first.f.c.name}`, first.f.credit) +
        text(540, 1030, "Le classement complet et les avis :", { size: 36, weight: 700, anchor: "middle", fill: INK }) +
        text(540, 1088, shortLink, { size: fitFont(shortLink, 900, 40), weight: 800, anchor: "middle", fill: CYAN }) + `</g>`;
    }
    svg += legend(`Note globale MaVilleIdéale sur 10 · loyers estimés${anyTie ? " · ex æquo : ordre alphabétique" : ""}`);
    return { photos, svg: svg + "</svg>" };
  };
  const caption = captionBlock({
    title: `${title} Le top ${N} des villes en 2027`,
    hook: `${title} Notre top ${N}, sur 8 critères (qualité de vie, loyers, sécurité, transports…).`,
    body: [
      ...ranked.map((r) => `${r.rank}${r.tied ? " ex æquo" : ""}. ${r.f.c.name} (${r.f.c.department}) : ${fmt(r.score)}/10${r.f.rent ? `, T2 ≈ ${euros(r.f.rent)}` : ""}`),
      ...(anyTie ? ["(Ex æquo à la décimale près : ordre alphabétique.)"] : []),
    ],
    link,
    tags: [hashtag(region), "#ouvivre", "#meilleuresvilles", "#demenagement", "#qualitedevie", "#villesdefrance"],
    credits: ranked.map((r) => r.f.credit),
  });
  return { file: `${stamp}-top-${regionSlug}`, title, link, caption, scenes, frame };
}

// ─── Légendes ─────────────────────────────────────────────────────────────────
function captionBlock(o: { title: string; hook: string; body: string[]; link: string; tags: string[]; credits: (string | null)[] }) {
  const short = o.link.replace("https://www.", "");
  const credits = [...new Set(o.credits.filter(Boolean))].map((c) => `${c} (Wikimedia Commons)`).join(" ; ");
  const tags = [...new Set(o.tags)].join(" ");
  return [
    "=== YouTube Shorts ===",
    `Titre : ${o.title.slice(0, 90)} #shorts`,
    `Description :\n${o.hook}\n\n${o.body.join("\n")}\n\nTous les chiffres : ${o.link}\n\nMusique : composition originale MaVilleIdéale. ${credits}\n${tags} #shorts`,
    "",
    "=== TikTok ===",
    `${o.hook}\n${o.body.slice(0, 7).join("\n")}\nLe détail sur ${short} (lien en bio)\n${tags} #pourtoi #france`,
    "",
    "=== Instagram Reels / Facebook ===",
    `${o.hook}\n\n${o.body.join("\n")}\n\n👉 ${short} (lien en bio)\n\n${credits}\n\n${tags} #reels`,
  ].join("\n");
}

// ─── Calendrier ─────────────────────────────────────────────────────────────────
const DAY = 86400000;
const LAUNCH = Date.UTC(2026, 10, 26); // créneau 0 : jour du lancement
const PUBLISH_WEEKDAYS = [1, 3, 5, 0]; // lundi, mercredi, vendredi, dimanche (UTC)
const CYCLE = ["duel", "classement", "ville", "duel", "classement", "top5"] as const;
type Format = (typeof CYCLE)[number];

const dayOf = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
const isoOf = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const isPublishDay = (ms: number) => ms === LAUNCH || (ms > LAUNCH && PUBLISH_WEEKDAYS.includes(new Date(ms).getUTCDay()));

/** Dernier jour de publication ≤ ms (un run en retard tombe sur le créneau du jour prévu). */
function slotDay(ms: number): number {
  let d = ms;
  while (d > LAUNCH && !isPublishDay(d)) d -= DAY;
  return Math.max(d, LAUNCH);
}
function slotIndex(ms: number): number {
  let n = 0;
  for (let d = LAUNCH + DAY; d <= ms; d += DAY) if (isPublishDay(d)) n++;
  return n;
}

function regionRanked(region: string): Ranked[] | null {
  const pool = CITIES_SEED.filter((c) => c.region === region)
    .map((c) => ({ slug: c.slug, score: c.scores.global, name: c.name }))
    .sort((x, y) => Number(fmt(y.score).replace(",", ".")) - Number(fmt(x.score).replace(",", ".")) || x.name.localeCompare(y.name, "fr"));
  return rankTopN(pool);
}
function classementRanked(slug: RankingSlug): Ranked[] | null {
  const list = getRankedCities(slug).map((e) => ({ slug: e.city.slug, score: e.score, name: e.city.name }));
  list.sort((x, y) => y.score - x.score || x.name.localeCompare(y.name, "fr"));
  return rankTopN(list);
}
// Sujets utilisables (une coupure propre existe), calculés une fois : la rotation ne repasse pas deux fois
// sur le même classement à cause d'un sujet sauté.
let validCl: RankingSlug[] | null = null;
let validRg: string[] | null = null;
const validClassements = () => (validCl ??= CLASSEMENTS.filter((s) => classementRanked(s)));
const validRegions = () => (validRg ??= TOP5_REGIONS.filter((r) => regionRanked(r)));

function videoForSlot(idx: number, stamp: string): Video {
  const format: Format = CYCLE[idx % CYCLE.length];
  let k = 0;
  for (let j = 0; j < idx; j++) if (CYCLE[j % CYCLE.length] === format) k++;
  if (format === "duel") {
    const [x, y] = DUELS[k % DUELS.length];
    return duelVideo(facts(x), facts(y), stamp);
  }
  if (format === "ville") return villeVideo(facts(VILLES[k % VILLES.length]), stamp);
  if (format === "classement" && validClassements().length) {
    const slug = validClassements()[k % validClassements().length];
    return classementVideo(slug, classementRanked(slug)!, stamp);
  }
  if (format === "top5" && validRegions().length) {
    const region = validRegions()[k % validRegions().length];
    return top5Video(region, regionRanked(region)!, stamp);
  }
  const [x, y] = DUELS[idx % DUELS.length];
  return duelVideo(facts(x), facts(y), stamp);
}

// ─── Rendu d'une vidéo ────────────────────────────────────────────────────────
async function urlOk(url: string): Promise<boolean> {
  try {
    return (await fetch(url, { method: "HEAD", redirect: "follow" })).ok;
  } catch {
    return false;
  }
}

async function render(v: Video, stills: boolean) {
  const clips: (Clip | null)[] = [];
  for (const s of v.scenes) clips.push(stills ? null : await tts(spoken(s.sub)));
  const hasVoice = clips.every(Boolean);
  if (!stills && !hasVoice) console.warn(`${v.file} : pas de voix (OPENAI_API_KEY absente ou TTS en échec) — musique seule`);
  const dur = v.scenes.map((s, i) => (hasVoice ? (clips[i] as Clip).seconds : estimate(s.sub)));
  const tl = timeline(v.scenes, dur);
  const chunks = subtitleChunks(v.scenes, tl);
  const frameAt = (t: number): Frame => {
    const fr = v.frame(t, tl);
    return { ...fr, svg: fr.svg.replace(/<\/svg>\s*$/, subtitleSvg(chunks, t) + "</svg>") };
  };
  if (stills) {
    const times = [0.6, ...tl.start.slice(1).map((s, i) => Math.min(tl.end[i + 1] - 0.05, s + 1.1)), tl.total - 0.6];
    for (const tt of times) writeFileSync(join(OUT, `${v.file}-t${tt.toFixed(1)}.jpg`), await renderFrame(frameAt(tt)));
    return { seconds: tl.total, hasVoice };
  }
  const voice = new Int16Array(Math.ceil(tl.total * SR));
  if (hasVoice) clips.forEach((c, i) => voice.set((c as Clip).pcm.subarray(0, Math.max(0, voice.length - Math.round(tl.voice[i] * SR))), Math.round(tl.voice[i] * SR)));
  const tmp = join(OUT, `.${v.file}`);
  writeWav(`${tmp}-voice.wav`, voice);
  writeWav(`${tmp}-music.wav`, music(tl.total, v.file.length * 31 + 7));
  await encode(join(OUT, `${v.file}.mp4`), tl.total, frameAt, `${tmp}-voice.wav`, `${tmp}-music.wav`, hasVoice);
  for (const ext of ["-voice.wav", "-music.wav"]) {
    try {
      (await import("fs")).unlinkSync(`${tmp}${ext}`);
    } catch {
      /* fichier déjà absent */
    }
  }
  writeFileSync(join(OUT, `${v.file}.srt`), toSrt(chunks));
  return { seconds: tl.total, hasVoice };
}

async function main() {
  const today = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate());
  const stills = args.includes("--stills");
  const jobs: { video: Video; slot: string | null }[] = [];
  const manual = ["duel", "ville", "top5", "classement"].some((k) => arg(k));
  if (manual) {
    const stamp = isoOf(today);
    if (arg("duel")) {
      const [x, y] = arg("duel")!.split(",");
      jobs.push({ video: duelVideo(facts(x), facts(y), stamp), slot: null });
    }
    if (arg("ville")) jobs.push({ video: villeVideo(facts(arg("ville")!), stamp), slot: null });
    if (arg("top5")) {
      const want = arg("top5")!.replace(/^region:/, "");
      const region = CITIES_SEED.find((c) => slugify(c.region) === want)?.region ?? want;
      const r = regionRanked(region);
      if (r) jobs.push({ video: top5Video(region, r, stamp), slot: null });
      else console.warn(`top 5 ${region} sauté (égalité à la coupure ou au premier rang)`);
    }
    if (arg("classement")) {
      const slug = arg("classement") as RankingSlug;
      const r = classementRanked(slug);
      if (r) jobs.push({ video: classementVideo(slug, r, stamp), slot: null });
      else console.warn(`classement ${slug} sauté (égalité à la coupure ou au premier rang)`);
    }
  } else {
    const from = arg("from") ? dayOf(arg("from")!) : arg("slot") ? dayOf(arg("slot")!) : today;
    const count = Number(arg("count") ?? 1);
    let d = arg("count") ? from : slotDay(from);
    while (jobs.length < count) {
      if (isPublishDay(d)) jobs.push({ video: videoForSlot(slotIndex(d), isoOf(d)), slot: isoOf(d) });
      d += DAY;
    }
  }

  if (args.includes("--plan")) {
    for (const j of jobs) console.log(`${j.slot ?? "manuel"} · ${j.video.file} · ${j.video.link}`);
    return;
  }
  mkdirSync(OUT, { recursive: true });
  const manifest: { file: string; slot: string | null; link: string; seconds: number; title: string; linkOk: boolean; voice: boolean }[] = [];
  for (const { video: v, slot } of jobs) {
    const linkOk = await urlOk(v.link);
    if (!linkOk) console.warn(`⚠ lien non vérifié (${v.link}) : à relire avant publication`);
    const t0 = Date.now();
    const r = await render(v, stills);
    if (stills) continue;
    writeFileSync(join(OUT, `${v.file}.txt`), v.caption + "\n");
    manifest.push({ file: `${v.file}.mp4`, slot, link: v.link, seconds: Math.round(r.seconds * 10) / 10, title: v.title, linkOk, voice: r.hasVoice });
    console.log(`✓ ${v.file}.mp4 (${r.seconds.toFixed(1)} s, voix : ${r.hasVoice ? "oui" : "non"}, ${((Date.now() - t0) / 1000).toFixed(0)} s de rendu)`);
  }
  if (!stills) writeFileSync(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
