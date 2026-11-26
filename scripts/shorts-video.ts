/**
 * Vidéos courtes verticales (TikTok, YouTube Shorts, Reels) générées depuis les données du site.
 *   npx tsx --tsconfig tsconfig.json scripts/shorts-video.ts [--week N] [--out dir]
 *   npx tsx --tsconfig tsconfig.json scripts/shorts-video.ts --duel nantes,rennes --ville ile-de-re --top5 region:bretagne
 *
 * Trois formats, 1080×1920, 30 i/s, 15 à 19 s, piste audio muette (on ajoute un son dans l'appli) :
 *   - duel   : A ou B ? six critères en barres, verdict sur la note globale, lien /comparer ;
 *   - ville  : une ville en cinq chiffres, appel à la note des habitants (/villes/[slug]#note-habitants) ;
 *   - top5   : le top 5 d'une région (ou de la France) sur la note globale, lien vers la page qui le montre.
 * Sans argument de format, la semaine ISO choisit un duel, une ville et un top 5 (rotation stable).
 *
 * Chaque chiffre est une valeur rendue (CITIES_SEED, getHousing), donc celle de la page liée ; un top 5
 * dont la 5e et la 6e ville sont ex æquo à l'affichage est sauté (convention « on ne coupe pas une égalité »).
 * Photos : public/photos/villes/*-1024 (Wikimedia Commons), auteur et licence écrits sur la photo et dans la
 * légende. Images : sharp (SVG → JPEG) ; encodage : ffmpeg (doit être dans le PATH).
 * Sortie : <out>/<AAAA-Sww>-<format>-<slug>.mp4 + .txt (légendes TikTok / Shorts / Reels) + manifest.json.
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import { spawn } from "child_process";
import sharp from "sharp";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { comparePairSlug } from "@/lib/comparer-pairs";
import CARDS from "@/data/city-cards.json";

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
// Villes avec traction (cibles.md § 5) : celles où une vidéo a le plus de chances d'être vue localement.
const VILLES = [
  "ile-de-re", "nantes", "rennes", "amboise", "narbonne", "marseille", "dinard", "saint-malo", "dinan",
  "cannes", "concarneau", "laon", "granville", "carcassonne", "bordeaux", "saint-flour", "limoges",
  "angers", "senlis", "agde", "strasbourg", "montpellier", "alencon", "albi",
];
const TOP5_REGIONS = [
  "Bretagne", "Nouvelle-Aquitaine", "Occitanie", "Pays de la Loire", "Normandie", "Auvergne-Rhône-Alpes",
  "Provence-Alpes-Côte d'Azur", "Grand Est", "Hauts-de-France", "Centre-Val de Loire", "Bourgogne-Franche-Comté",
  "Île-de-France", "France",
];

const fmt = (n: number) => n.toFixed(1).replace(".", ",");
const euros = (n: number) => `${n.toLocaleString("fr-FR").replace(/[  ]/g, " ")} €`;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const hashtag = (s: string) => "#" + s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]/g, "");
const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const de = (name: string) => (/^[AEIOUYÉÈÊÎÔÂ]/i.test(name) ? `d'${name}` : `de ${name}`);
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

async function renderFrame(fr: Frame): Promise<Buffer> {
  if (!bgRaw) bgRaw = await sharp(BG).removeAlpha().raw().toBuffer();
  const layers: Overlay[] = [];
  for (const p of fr.photos) {
    if (p.rect.x >= W || p.rect.y >= H || p.rect.x + p.rect.w <= 0 || p.rect.y + p.rect.h <= 0) continue;
    const clipped = clipRect(p.rect);
    if (!clipped) continue;
    layers.push(await drawPhoto({ ...p, rect: clipped }));
  }
  layers.push({ input: Buffer.from(fr.svg), left: 0, top: 0 });
  return sharp(bgRaw, { raw: { width: W, height: H, channels: 3 } }).composite(layers).jpeg({ quality: 88 }).toBuffer();
}

// sharp refuse un calque qui déborde du cadre : on rogne le rectangle (le pan reste cohérent à l'œil).
function clipRect(r: Rect): Rect | null {
  const x = Math.max(0, r.x);
  const y = Math.max(0, r.y);
  const w = Math.min(W, r.x + r.w) - x;
  const h = Math.min(H, r.y + r.h) - y;
  return w >= 2 && h >= 2 ? { x, y, w, h } : null;
}

async function encode(file: string, seconds: number, frameAt: (t: number) => Frame | Promise<Frame>) {
  const ff = spawn(
    "ffmpeg",
    [
      "-y", "-loglevel", "error",
      "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
      "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
      "-shortest", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", file,
    ],
    { stdio: ["pipe", "inherit", "inherit"] },
  );
  const done = new Promise<void>((res, rej) => {
    ff.on("error", rej);
    ff.on("close", (code) => (code === 0 ? res() : rej(new Error(`ffmpeg a quitté avec le code ${code}`))));
  });
  const n = Math.round(seconds * FPS);
  for (let i = 0; i < n; i++) {
    const jpg = await renderFrame(await frameAt(i / FPS));
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
const fitFont = (text: string, maxW: number, max: number, k = 0.56) => Math.min(max, Math.floor(maxW / (text.length * k)));
const text = (x: number, y: number, s: string, o: { size: number; fill?: string; weight?: number; anchor?: string; family?: string; opacity?: number }) =>
  `<text x="${x}" y="${y}" font-family="${o.family ?? SANS}" font-size="${o.size}" font-weight="${o.weight ?? 700}" fill="${o.fill ?? "#FFFFFF"}"${o.anchor ? ` text-anchor="${o.anchor}"` : ""}${o.opacity !== undefined ? ` fill-opacity="${o.opacity.toFixed(3)}"` : ""}>${esc(s)}</text>`;
const pill = (x: number, y: number, label: string, fill = "url(#brand)") => {
  const w = Math.round(label.length * 15.5 + 56);
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

// ─── Format 1 : duel ──────────────────────────────────────────────────────────
interface Video { file: string; seconds: number; frame: (t: number) => Frame; caption: string; link: string; title: string }

function duelVideo(a: Facts, b: Facts, stamp: string): Video {
  const pair = comparePairSlug(a.c.slug, b.c.slug);
  const link = `${SITE}/comparer/${pair}`;
  const shortLink = link.replace("https://www.", "");
  type Row = { label: string; va: number; vb: number; da: string; db: string; lowerWins?: boolean };
  const rows: Row[] = [];
  if (a.rent && b.rent) rows.push({ label: "Loyer T2 (le moins cher gagne)", va: a.rent, vb: b.rent, da: euros(a.rent), db: euros(b.rent), lowerWins: true });
  const picks: AxisKey[] = ["safety", "transport", "nature", "culture", "schools", "remoteWork"];
  for (const k of picks.slice(0, 6 - rows.length)) rows.push({ label: AXIS_FR[k], va: a.c.scores[k], vb: b.c.scores[k], da: fmt(a.c.scores[k]), db: fmt(b.c.scores[k]) });
  const winner = (r: Row) => {
    if (r.va === r.vb || r.da === r.db) return 0;
    return (r.lowerWins ? r.va < r.vb : r.va > r.vb) ? 1 : 2;
  };
  const ga = a.c.scores.global;
  const gb = b.c.scores.global;
  const verdict =
    fmt(ga) === fmt(gb)
      ? "Égalité parfaite sur la note globale"
      : `${ga > gb ? a.c.name : b.c.name} l'emporte${Math.abs(ga - gb) < 0.35 ? ", de peu" : ""}`;
  const plusOf = (x: Facts, y: Facts) =>
    AXES.filter((k) => x.c.scores[k] - y.c.scores[k] >= 0.5).sort((k1, k2) => (x.c.scores[k2] - y.c.scores[k2]) - (x.c.scores[k1] - y.c.scores[k1])).slice(0, 2).map((k) => AXIS_FR[k].toLowerCase());
  const plusA = plusOf(a, b);
  const plusB = plusOf(b, a);
  const title = `${a.c.name} ou ${b.c.name} ?`;
  const introA: Rect = { x: 40, y: 380, w: 1000, h: 520 };
  const introB: Rect = { x: 40, y: 1020, w: 1000, h: 520 };
  const headA: Rect = { x: 40, y: 210, w: 490, h: 300 };
  const headB: Rect = { x: 550, y: 210, w: 490, h: 300 };
  const T_SHRINK = 3.2, T_ROWS = 4.0, ROW_DT = 1.4, T_VERDICT = T_ROWS + rows.length * ROW_DT + 0.5, T_END = T_VERDICT + 3.6;
  const seconds = T_END + 2.6;

  const frame = (t: number): Frame => {
    const s = prog(t, T_SHRINK, T_SHRINK + 0.7);
    const slideA = prog(t, 0, 0.6);
    const slideB = prog(t, 0.15, 0.75);
    const ra: Rect = s > 0
      ? { x: lerp(introA.x, headA.x, s), y: lerp(introA.y, headA.y, s), w: lerp(introA.w, headA.w, s), h: lerp(introA.h, headA.h, s) }
      : { ...introA, x: lerp(-W, introA.x, slideA) };
    const rb: Rect = s > 0
      ? { x: lerp(introB.x, headB.x, s), y: lerp(introB.y, headB.y, s), w: lerp(introB.w, headB.w, s), h: lerp(introB.h, headB.h, s) }
      : { ...introB, x: lerp(W, introB.x, slideB) };
    const pan = t / seconds;
    let svg = svgOpen + brandBar(shortLink);
    if (t < T_SHRINK + 0.7) {
      const o = 1 - s;
      svg += `<g opacity="${o.toFixed(3)}">` + pill(60, 196, "DUEL DE VILLES · 8 CRITÈRES") +
        text(60, 330, title, { size: fitFont(title, 960, 88), weight: 800 }) + `</g>`;
      svg += photoOverlay(ra, s < 0.5 ? a.c.name : null, s < 0.2 ? a.credit : null, 1);
      svg += photoOverlay(rb, s < 0.5 ? b.c.name : null, s < 0.2 ? b.credit : null, 1);
      const vs = prog(t, 0.6, 1.0) * (1 - s);
      svg += `<g opacity="${vs.toFixed(3)}"><circle cx="540" cy="960" r="${Math.round(64 + 6 * Math.sin(t * 6))}" fill="url(#brand)" stroke="#FFFFFF" stroke-width="6"/>` +
        text(540, 984, "VS", { size: 58, weight: 900, anchor: "middle", family: HEAVY }) + `</g>`;
    } else {
      svg += photoOverlay(ra, null, null) + photoOverlay(rb, null, null);
      svg += text(285, 575, a.c.name, { size: fitFont(a.c.name, 470, 48), weight: 800, anchor: "middle", fill: PINK });
      svg += text(795, 575, b.c.name, { size: fitFont(b.c.name, 470, 48), weight: 800, anchor: "middle", fill: CYAN });
      const dim = t > T_VERDICT ? 1 - 0.75 * prog(t, T_VERDICT, T_VERDICT + 0.5) : 1;
      let tallyA = 0, tallyB = 0;
      svg += `<g opacity="${dim.toFixed(3)}">`;
      rows.forEach((r, i) => {
        const t0 = T_ROWS + i * ROW_DT;
        const appear = prog(t, t0, t0 + 0.35);
        if (appear <= 0) return;
        const grow = prog(t, t0 + 0.2, t0 + 1.0);
        const y = 690 + i * 146;
        const max = Math.max(r.va, r.vb);
        const la = (r.va / max) * 300 * grow;
        const lb = (r.vb / max) * 300 * grow;
        const w = grow >= 0.999 ? winner(r) : 0;
        if (w === 1) tallyA++;
        if (w === 2) tallyB++;
        svg += `<g opacity="${appear.toFixed(3)}">` +
          text(540, y, r.label, { size: 34, weight: 700, anchor: "middle", fill: INK }) +
          `<rect x="${(520 - la).toFixed(1)}" y="${y + 22}" width="${la.toFixed(1)}" height="44" rx="12" fill="${PINK}" fill-opacity="${w === 2 ? 0.45 : 1}"/>` +
          `<rect x="560" y="${y + 22}" width="${lb.toFixed(1)}" height="44" rx="12" fill="${CYAN}" fill-opacity="${w === 1 ? 0.45 : 1}"/>` +
          text(60, y + 58, r.da + (w === 1 ? "  ✓" : ""), { size: 40, weight: 800, fill: w === 1 ? "#FFFFFF" : "#CBD5E1" }) +
          text(1020, y + 58, (w === 2 ? "✓  " : "") + r.db, { size: 40, weight: 800, anchor: "end", fill: w === 2 ? "#FFFFFF" : "#CBD5E1" }) +
          `</g>`;
      });
      svg += `</g>`;
      if (t >= T_ROWS && t < T_VERDICT) {
        svg += text(540, 1565, `${a.c.name} ${tallyA}  ·  ${tallyB} ${b.c.name}`, { size: 44, weight: 800, anchor: "middle" });
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
          svg += `<g opacity="${endP.toFixed(3)}"><rect x="60" y="720" width="960" height="600" rx="40" fill="#141B2D" fill-opacity="0.94" stroke="url(#brand)" stroke-width="4"/>` +
            text(540, 850, "Le comparatif complet,", { size: 48, weight: 800, anchor: "middle" }) +
            text(540, 912, "8 critères, loyers et quartiers :", { size: 40, weight: 600, anchor: "middle", fill: INK }) +
            text(540, 1010, shortLink, { size: fitFont(shortLink, 900, 40), weight: 800, anchor: "middle", fill: CYAN }) +
            text(540, 1150, "Et vous, vous choisissez laquelle ?", { size: 42, weight: 800, anchor: "middle", fill: PINK }) +
            text(540, 1210, "Dites-le en commentaire", { size: 34, weight: 600, anchor: "middle", fill: INK }) +
            `</g>`;
        }
      }
      svg += text(540, 1625, "Notes MaVilleIdéale sur 10 (10 = le plus favorable) · loyers estimés", { size: 22, weight: 500, anchor: "middle", fill: "#94A3B8" });
      svg += text(540, 1655, `${a.credit ?? ""}${a.credit && b.credit ? "  |  " : ""}${b.credit ?? ""}`.slice(0, 110), { size: 18, weight: 500, anchor: "middle", fill: "#94A3B8" });
    }
    return { photos: [{ src: a, rect: ra, pan }, { src: b, rect: rb, pan: 1 - pan }], svg: svg + "</svg>" };
  };

  const lines = rows.map((r) => `${r.label.replace(" (le moins cher gagne)", "")} : ${a.c.name} ${r.da} · ${b.c.name} ${r.db}`);
  const caption = captionBlock({
    title: `${title} Le duel en chiffres`,
    hook: `${title} On a comparé les deux villes sur nos 8 critères.`,
    body: [...lines, `Note globale : ${a.c.name} ${fmt(ga)}/10 · ${b.c.name} ${fmt(gb)}/10 → ${verdict}.`],
    link,
    tags: [hashtag(a.c.name), hashtag(b.c.name), "#ouvivre", "#demenagement", "#qualitedevie", "#villesdefrance"],
    credits: [a.credit, b.credit],
  });
  return { file: `${stamp}-duel-${pair}`, seconds, frame, caption, link, title };
}

// ─── Format 2 : une ville en cinq chiffres ────────────────────────────────────
function villeVideo(f: Facts, stamp: string): Video {
  const link = `${SITE}/villes/${f.c.slug}`;
  const shortLink = link.replace("https://www.", "");
  const stats: { label: string; value: string; color: string }[] = [
    { label: "Note globale", value: `${fmt(f.c.scores.global)}/10`, color: "#FFFFFF" },
    ...(f.rent ? [{ label: "Loyer d'un T2", value: `≈ ${euros(f.rent)}/mois`, color: CYAN }] : []),
    { label: `Point fort : ${AXIS_FR[f.best.k].toLowerCase()}`, value: `${fmt(f.best.v)}/10`, color: "#86EFAC" },
    { label: `Point faible : ${AXIS_FR[f.worst.k].toLowerCase()}`, value: `${fmt(f.worst.v)}/10`, color: "#FDA4AF" },
    { label: "Habitants", value: `≈ ${f.c.population.toLocaleString("fr-FR").replace(/[  ]/g, " ")}`, color: PINK },
  ];
  const title = `Vivre à ${f.c.name}`;
  const hero: Rect = { x: 40, y: 360, w: 1000, h: 640 };
  const top: Rect = { x: 40, y: 210, w: 1000, h: 400 };
  const T_SHRINK = 2.6, T_STATS = 3.3, DT = 1.5, T_CTA = T_STATS + stats.length * DT + 0.6;
  const seconds = T_CTA + 3.4;
  const frame = (t: number): Frame => {
    const s = prog(t, T_SHRINK, T_SHRINK + 0.6);
    const inP = prog(t, 0, 0.7);
    const r: Rect = s > 0
      ? { x: lerp(hero.x, top.x, s), y: lerp(hero.y, top.y, s), w: lerp(hero.w, top.w, s), h: lerp(hero.h, top.h, s) }
      : { ...hero, y: lerp(H, hero.y, inP) };
    let svg = svgOpen + brandBar(shortLink) + photoOverlay(r, s > 0.5 ? null : null, f.credit, 1);
    const titleY = lerp(1120, 680, s);
    svg += text(60, titleY, title, { size: fitFont(title, 960, 84), weight: 800 });
    svg += `<g opacity="${(1 - s).toFixed(3)}">` + text(60, titleY + 70, `${f.c.region} · en 5 chiffres`, { size: 40, weight: 600, fill: INK }) + `</g>`;
    const ctaP = prog(t, T_CTA, T_CTA + 0.5);
    stats.forEach((st, i) => {
      const a = prog(t, T_STATS + i * DT, T_STATS + i * DT + 0.45) * (1 - 0.7 * ctaP);
      if (a <= 0) return;
      const y = 760 + i * 150;
      const dx = (1 - prog(t, T_STATS + i * DT, T_STATS + i * DT + 0.45)) * 80;
      svg += `<g opacity="${a.toFixed(3)}" transform="translate(${dx.toFixed(1)},0)"><rect x="60" y="${y}" width="960" height="124" rx="28" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.18"/>` +
        text(100, y + 76, st.label, { size: fitFont(st.label, 520, 38), weight: 600, fill: INK }) +
        text(990, y + 82, st.value, { size: fitFont(st.value, 380, 58), weight: 900, anchor: "end", family: HEAVY, fill: st.color }) + `</g>`;
    });
    if (t >= T_CTA) {
      svg += `<g opacity="${ctaP.toFixed(3)}"><rect x="60" y="820" width="960" height="560" rx="40" fill="#141B2D" fill-opacity="0.94" stroke="url(#brand)" stroke-width="4"/>` +
        text(540, 950, `Vous habitez ${f.c.name} ?`, { size: fitFont(`Vous habitez ${f.c.name} ?`, 900, 54), weight: 800, anchor: "middle" }) +
        text(540, 1025, "Donnez votre note en 10 secondes,", { size: 40, weight: 600, anchor: "middle", fill: INK }) +
        text(540, 1078, "sans inscription :", { size: 40, weight: 600, anchor: "middle", fill: INK }) +
        text(540, 1180, shortLink, { size: fitFont(shortLink, 900, 44), weight: 800, anchor: "middle", fill: CYAN }) +
        text(540, 1290, "La note des habitants s'affiche sur la fiche", { size: 30, weight: 600, anchor: "middle", fill: PINK }) + `</g>`;
    }
    svg += text(540, 1600, "Notes MaVilleIdéale sur 10 (10 = le plus favorable) · loyer estimé", { size: 22, weight: 500, anchor: "middle", fill: "#94A3B8" });
    return { photos: [{ src: f, rect: r, pan: t / seconds }], svg: svg + "</svg>" };
  };
  const caption = captionBlock({
    title: `Vivre à ${f.c.name} : la ville en 5 chiffres`,
    hook: `Vivre à ${f.c.name}, ça donne quoi en chiffres ?`,
    body: [
      `Note globale : ${fmt(f.c.scores.global)}/10`,
      ...(f.rent ? [`Loyer d'un T2 : environ ${euros(f.rent)} par mois`] : []),
      `Point fort : ${AXIS_FR[f.best.k].toLowerCase()} (${fmt(f.best.v)}/10)`,
      `Point faible : ${AXIS_FR[f.worst.k].toLowerCase()} (${fmt(f.worst.v)}/10)`,
      `Vous y habitez ? Donnez votre note en 10 secondes sur la fiche de la ville.`,
    ],
    link: `${link}#note-habitants`,
    tags: [hashtag(f.c.name), hashtag(f.c.region), "#vivrea" + slugify(f.c.name).replace(/-/g, ""), "#ouvivre", "#demenagement", "#qualitedevie"],
    credits: [f.credit],
  });
  return { file: `${stamp}-ville-${f.c.slug}`, seconds, frame, caption, link, title };
}

// ─── Format 3 : top 5 ─────────────────────────────────────────────────────────
interface Ranked { f: Facts; rank: number; tied: boolean }
function top5List(region: string): Ranked[] | null {
  const pool = CITIES_SEED.filter((c) => region === "France" || c.region === region).sort(
    (x, y) => Number(fmt(y.scores.global).replace(",", ".")) - Number(fmt(x.scores.global).replace(",", ".")) || x.name.localeCompare(y.name, "fr"),
  );
  if (pool.length < 6) return null;
  // Une égalité à la coupure (5e et 6e identiques à l'affichage) fabriquerait un rang : on saute ce top.
  if (fmt(pool[4].scores.global) === fmt(pool[5].scores.global)) return null;
  // Le compte à rebours finit sur un seul n° 1 : un premier rang partagé saute aussi ce top.
  if (fmt(pool[0].scores.global) === fmt(pool[1].scores.global)) return null;
  // Rang « olympique » sur la note affichée : des ex æquo partagent le rang (ordre alphabétique, annoncé).
  const top = pool.slice(0, 5);
  return top.map((c, i) => {
    const v = fmt(c.scores.global);
    const first = top.findIndex((x) => fmt(x.scores.global) === v);
    const tied = top.filter((x) => fmt(x.scores.global) === v).length > 1;
    return { f: facts(c.slug), rank: first + 1, tied };
  });
}

function top5Video(region: string, ranked: Ranked[], stamp: string, regionSlug: string | null): Video {
  const list = ranked.map((r) => r.f);
  const anyTie = ranked.some((r) => r.tied);
  const rankLabel = (i: number) => `#${ranked[i].rank}${ranked[i].tied ? " ex æquo" : ""}`;
  const link = regionSlug ? `${SITE}/regions/${regionSlug}` : `${SITE}/leaderboard`;
  const shortLink = link.replace("https://www.", "");
  const title = `Où vivre ${inRegion(region)} ?`;
  const card: Rect = { x: 40, y: 430, w: 1000, h: 580 };
  const T0 = 2.4, DT = 2.5, T_END = T0 + 5 * DT;
  const seconds = T_END + 3.2;
  const order = [...list].reverse(); // 5 → 1
  const orderIdx = (i: number) => list.length - 1 - i; // index dans list / ranked
  const frame = (t: number): Frame => {
    let svg = svgOpen + brandBar(shortLink);
    svg += text(60, 290, title, { size: fitFont(title, 960, 80), weight: 800 });
    svg += text(60, 356, "Le top 5 de nos notes (8 critères)", { size: 38, weight: 600, fill: INK });
    const photos: PhotoDraw[] = [];
    const idx = Math.min(4, Math.floor((t - T0) / DT));
    if (t >= T0 && t < T_END) {
      const f = order[idx];
      const local = t - T0 - idx * DT;
      const inP = prog(local, 0, 0.45);
      const r: Rect = { ...card, x: lerp(W, card.x, inP) };
      photos.push({ src: f, rect: r, pan: local / DT });
      const k = orderIdx(idx);
      svg += photoOverlay(r, null, f.credit);
      svg += `<g opacity="${inP.toFixed(3)}"><circle cx="150" cy="530" r="78" fill="url(#brand)" stroke="#FFFFFF" stroke-width="6"/>` +
        text(150, 556, `#${ranked[k].rank}`, { size: 72, weight: 900, anchor: "middle", family: HEAVY }) +
        (ranked[k].tied ? text(150, 650, "ex æquo", { size: 30, weight: 800, anchor: "middle" }) : "") +
        text(60, 1100, f.c.name, { size: fitFont(f.c.name, 700, 72), weight: 800 }) +
        text(1020, 1104, `${fmt(f.c.scores.global)}/10`, { size: 76, weight: 900, anchor: "end", family: HEAVY, fill: CYAN }) +
        text(60, 1160, `${f.c.department}${f.rent ? ` · T2 ≈ ${euros(f.rent)}` : ""}`, { size: 34, weight: 600, fill: INK }) + `</g>`;
    }
    // Liste qui se remplit en bas.
    const shown = t >= T_END ? 5 : Math.max(0, idx + (t >= T0 ? 1 : 0));
    for (let i = 0; i < shown; i++) {
      const f = order[i];
      const k = orderIdx(i);
      const y = 1240 + k * 62;
      const lead = ranked[k].rank === 1 && t >= T_END;
      svg += text(80, y, `${rankLabel(k)}  ${f.c.name}`, { size: 34, weight: lead ? 900 : 700, fill: lead ? PINK : "#FFFFFF" }) +
        text(1000, y, fmt(f.c.scores.global), { size: 34, weight: 800, anchor: "end", fill: CYAN });
    }
    if (t >= T_END) {
      const p = prog(t, T_END, T_END + 0.5);
      const first = list[0];
      photos.push({ src: first, rect: card, pan: (t - T_END) / 3.2, opacity: p });
      svg += `<g opacity="${p.toFixed(3)}">` + photoOverlay(card, `n° 1 : ${first.c.name}`, first.credit) +
        text(540, 1110, "Le classement complet et les avis :", { size: 38, weight: 700, anchor: "middle", fill: INK }) +
        text(540, 1170, shortLink, { size: fitFont(shortLink, 900, 42), weight: 800, anchor: "middle", fill: CYAN }) + `</g>`;
    }
    svg += text(540, 1600, `Note globale MaVilleIdéale sur 10 · loyers estimés${anyTie ? " · ex æquo : ordre alphabétique" : ""}`, { size: 22, weight: 500, anchor: "middle", fill: "#94A3B8" });
    return { photos, svg: svg + "</svg>" };
  };
  const caption = captionBlock({
    title: `${title} Le top 5 des villes en 2027`,
    hook: `${title} Notre top 5, sur 8 critères (qualité de vie, loyers, sécurité, transports…).`,
    body: [
      ...ranked.map((r, i) => `${rankLabel(i).replace("#", "")}. ${r.f.c.name} (${r.f.c.department}) : ${fmt(r.f.c.scores.global)}/10${r.f.rent ? `, T2 ≈ ${euros(r.f.rent)}` : ""}`),
      ...(anyTie ? ["(Ex æquo à la décimale près : ordre alphabétique.)"] : []),
    ],
    link,
    tags: [hashtag(region), "#ouvivre", "#meilleuresvilles", "#demenagement", "#qualitedevie", "#villesdefrance"],
    credits: list.map((f) => f.credit),
  });
  return { file: `${stamp}-top5-${regionSlug ?? "france"}`, seconds, frame, caption, link, title };
}

// ─── Légendes ─────────────────────────────────────────────────────────────────
function captionBlock(o: { title: string; hook: string; body: string[]; link: string; tags: string[]; credits: (string | null)[] }) {
  const short = o.link.replace("https://www.", "");
  const credits = [...new Set(o.credits.filter(Boolean))].map((c) => `${c} (Wikimedia Commons)`).join(" ; ");
  const tags = [...new Set(o.tags)].join(" ");
  return [
    "=== YouTube Shorts ===",
    `Titre : ${o.title.slice(0, 92)} #shorts`,
    `Description :\n${o.hook}\n\n${o.body.join("\n")}\n\nTous les chiffres : ${o.link}\n\n${credits}\n${tags} #shorts`,
    "",
    "=== TikTok ===",
    `${o.hook}\n${o.body.slice(0, 7).join("\n")}\nLe détail sur ${short} (lien en bio)\n${tags} #pourtoi #france`,
    "",
    "=== Instagram Reels / Facebook ===",
    `${o.hook}\n\n${o.body.join("\n")}\n\n👉 ${short} (lien en bio)\n\n${credits}\n\n${tags} #reels`,
    "",
    "Conseil : ajouter un son tendance dans l'appli (la vidéo a une piste muette). Publier entre 12 h et 13 h ou 18 h et 21 h.",
  ].join("\n");
}

// ─── Programme ────────────────────────────────────────────────────────────────
function isoWeek(d: Date): { year: number; week: number } {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return { year: t.getUTCFullYear(), week: Math.ceil(((t.getTime() - y0.getTime()) / 86400000 + 1) / 7) };
}

async function urlOk(url: string): Promise<boolean> {
  try {
    return (await fetch(url, { method: "HEAD", redirect: "follow" })).ok;
  } catch {
    return false;
  }
}

async function main() {
  const iw = isoWeek(new Date());
  const week = arg("week") ? Number(arg("week")) : iw.week;
  const stamp = `${iw.year}-S${String(week).padStart(2, "0")}`;
  const videos: Video[] = [];
  const duelArg = arg("duel");
  const villeArg = arg("ville");
  const topArg = arg("top5");
  const explicit = Boolean(duelArg || villeArg || topArg);

  if (duelArg || !explicit) {
    const [x, y] = duelArg ? (duelArg.split(",") as [string, string]) : DUELS[week % DUELS.length];
    videos.push(duelVideo(facts(x), facts(y), stamp));
  }
  if (villeArg || !explicit) videos.push(villeVideo(facts(villeArg ?? VILLES[week % VILLES.length]), stamp));
  if (topArg || !explicit) {
    const wanted = topArg ? topArg.replace(/^region:/, "") : null;
    const regionsBySlug = new Map(CITIES_SEED.map((c) => [slugify(c.region), c.region]));
    const candidates = wanted
      ? [wanted === "france" ? "France" : regionsBySlug.get(wanted) ?? wanted]
      : [...TOP5_REGIONS.slice(week % TOP5_REGIONS.length), ...TOP5_REGIONS];
    for (const region of candidates) {
      const list = top5List(region);
      if (!list) {
        console.warn(`top 5 ${region} sauté (égalité à la coupure ou trop peu de villes)`);
        continue;
      }
      videos.push(top5Video(region, list, stamp, region === "France" ? null : slugify(region)));
      break;
    }
  }

  mkdirSync(OUT, { recursive: true });
  const manifest: { file: string; link: string; seconds: number; title: string; linkOk: boolean }[] = [];
  for (const v of videos) {
    const linkOk = await urlOk(v.link);
    if (!linkOk) console.warn(`⚠ lien non vérifié (${v.link}) : la vidéo est générée, à relire avant publication`);
    if (args.includes("--stills")) {
      // Contrôle visuel sans encodage : quelques images clés en JPEG.
      for (const tt of [0.4, 1.6, 3.5, 6.5, 9.5, 12.5, v.seconds - 4.2, v.seconds - 1]) {
        writeFileSync(join(OUT, `${v.file}-t${tt.toFixed(1)}.jpg`), await renderFrame(v.frame(Math.max(0, tt))));
      }
      continue;
    }
    const t0 = Date.now();
    await encode(join(OUT, `${v.file}.mp4`), v.seconds, v.frame);
    writeFileSync(join(OUT, `${v.file}.txt`), v.caption + "\n");
    manifest.push({ file: `${v.file}.mp4`, link: v.link, seconds: Math.round(v.seconds * 10) / 10, title: v.title, linkOk });
    console.log(`✓ ${v.file}.mp4 (${v.seconds.toFixed(1)} s, ${((Date.now() - t0) / 1000).toFixed(0)} s de rendu)`);
  }
  writeFileSync(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
