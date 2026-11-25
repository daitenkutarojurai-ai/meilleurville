/**
 * Post hebdomadaire Facebook + Instagram (page « Ma ville ideal », @mavilleideal).
 * Lancé par .github/workflows/social-weekly.yml ; à la main :
 *   npx tsx --tsconfig tsconfig.json scripts/social-weekly.ts --dry-run [--week N]
 *
 * La semaine ISO choisit le format : paire = duel de /comparer, impaire = ville en chiffres.
 * Chaque chiffre sort de CITIES_SEED (valeur rendue, jamais le littéral du seed) et de
 * getHousing : exactement ce que la page liée affiche. Image : fond OpenAI sans aucun
 * texte (un modèle d'image écrit mal les chiffres) + chiffres posés en SVG par sharp,
 * mention « Illustration » puisque la scène n'est pas la vraie ville.
 *
 * Env : FB_ACCESS_TOKEN (jeton de page), FB_PAGE_ID, IG_USER_ID, OPENAI_API_KEY.
 * En local, .env.local est lu s'il existe.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from "fs";
import { join } from "path";
import sharp from "sharp";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { comparePairSlug } from "@/lib/comparer-pairs";
import { activityFitness } from "@/lib/vacation-activities";

const ROOT = process.cwd();
const SITE = "https://www.mavilleideale.fr";
const GRAPH = "https://graph.facebook.com/v21.0";
const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const weekArg = args.indexOf("--week");

if (existsSync(join(ROOT, ".env.local"))) {
  for (const line of readFileSync(join(ROOT, ".env.local"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

// Paires de /comparer et villes qui ont de la traction (docs/seo/cibles.md, export 2026-11-23).
const DUELS: [string, string][] = [
  ["nantes", "rennes"], ["bordeaux", "toulouse"], ["lyon", "grenoble"], ["montpellier", "marseille"],
  ["annecy", "grenoble"], ["tours", "orleans"], ["toulouse", "montpellier"], ["la-rochelle", "bordeaux"],
  ["pau", "biarritz"], ["caen", "rennes"], ["angers", "nantes"], ["nantes", "bordeaux"],
  ["lille", "strasbourg"], ["quimper", "brest"],
];
const VILLES = [
  "ile-de-re", "nantes", "rennes", "amboise", "narbonne", "dinard", "saint-malo", "dinan", "concarneau",
  "granville", "carcassonne", "albi", "bayeux", "sete", "collioure", "senlis", "dax", "limoges",
  "angers", "annecy", "la-rochelle", "colmar", "vannes", "biarritz",
];

type AxisKey = "life" | "transport" | "nature" | "cost" | "safety" | "culture" | "remoteWork" | "schools";
const AXES: AxisKey[] = ["life", "transport", "nature", "cost", "safety", "culture", "remoteWork", "schools"];
const AXIS_FR: Record<AxisKey, string> = {
  life: "qualité de vie", transport: "transports", nature: "nature", cost: "coût de la vie",
  safety: "sécurité", culture: "culture", remoteWork: "télétravail", schools: "écoles",
};

const de = (name: string) => (/^[AEIOUYÉÈÊÎÔÂ]/i.test(name) ? `d'${name}` : `de ${name}`);
const fmt = (n: number) => n.toFixed(1).replace(".", ",");
const euros = (n: number) => `${n.toLocaleString("fr-FR").replace(/ | /g, " ")} €`;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const tag = (name: string) => "#" + name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]/g, "");

function isoWeek(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - y0.getTime()) / 86400000 + 1) / 7);
}

function city(slug: string) {
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) return null;
  const ranked = AXES.map((k) => ({ k, v: c.scores[k] })).sort((a, b) => b.v - a.v);
  return { c, rent: getHousing(slug)?.avgRentT2 ?? null, best: ranked[0], second: ranked[1], worst: ranked[ranked.length - 1] };
}
type CityFacts = NonNullable<ReturnType<typeof city>>;

// La scène suit la géographie réelle (littoral, montagne) pour ne pas peindre une île en ville fluviale.
function scene(f: CityFacts): string {
  const c = f.c;
  if (/^(ile|iles)-/.test(c.slug)) return `a small island village on the French Atlantic coast in ${c.region}, low whitewashed houses, harbour, beaches`;
  if (activityFitness(c, "plage") > 0) return `a French seaside town on the coast of ${c.region}, harbour, beach and waterfront houses`;
  if (activityFitness(c, "montagne") > 0) return `a French mountain town in ${c.region}, surrounded by peaks, typical mountain architecture`;
  return `a French town in ${c.region}, typical regional architecture`;
}

async function urlOk(url: string): Promise<boolean> {
  try { return (await fetch(url, { method: "HEAD", redirect: "follow" })).ok; } catch { return false; }
}

interface Post { kind: string; caption: string; prompt: string; svg: (w: number, h: number, panel: number) => string; link: string; }

const SANS = "DejaVu Sans, Segoe UI, Arial, sans-serif";
const PANEL_BASE = (W: number, H: number, P: number, badge: string) => `
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141B2D" stop-opacity="0"/><stop offset="1" stop-color="#141B2D"/></linearGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4F46E5"/><stop offset="0.5" stop-color="#7C3AED"/><stop offset="1" stop-color="#DB2777"/></linearGradient>
  </defs>
  <rect x="0" y="${H - P - 160}" width="${W}" height="160" fill="url(#fade)"/>
  <rect x="0" y="${H - P}" width="${W}" height="${P}" fill="#141B2D"/>
  <rect x="0" y="${H - 14}" width="${W}" height="14" fill="url(#brand)"/>
  <rect x="64" y="64" rx="26" width="${badge.length * 17 + 56}" height="58" fill="#FFFFFF" fill-opacity="0.92"/>
  <text x="90" y="103" font-family="${SANS}" font-size="28" font-weight="700" fill="#4F46E5">${esc(badge)}</text>
  <text x="${W - 40}" y="${H - P - 24}" text-anchor="end" font-family="${SANS}" font-size="20" fill="#FFFFFF" fill-opacity="0.75">Illustration</text>
  <text x="64" y="${H - 52}" font-family="${SANS}" font-size="38" font-weight="800" fill="#FFFFFF">mavilleideale.fr</text>`;

function duelPost(a: CityFacts, b: CityFacts, slug: string): Post {
  const link = `${SITE}/comparer/${slug}`;
  const rentLine = a.rent && b.rent ? `Loyer T2 estimé : ${a.c.name} ${euros(a.rent)} · ${b.c.name} ${euros(b.rent)}\n` : "";
  const caption = `${a.c.name} ou ${b.c.name} ?

Note globale : ${a.c.name} ${fmt(a.c.scores.global)}/10 · ${b.c.name} ${fmt(b.c.scores.global)}/10
${rentLine}Point fort ${de(a.c.name)} : ${AXIS_FR[a.best.k]} (${fmt(a.best.v)}/10)
Point fort ${de(b.c.name)} : ${AXIS_FR[b.best.k]} (${fmt(b.best.v)}/10)
Point faible ${de(a.c.name)} : ${AXIS_FR[a.worst.k]} (${fmt(a.worst.v)}/10)
Point faible ${de(b.c.name)} : ${AXIS_FR[b.worst.k]} (${fmt(b.worst.v)}/10)

Le comparatif complet sur 8 critères : ${link.replace("https://www.", "")}

Notes MaVilleIdéale sur 10 (10 = le plus favorable), loyers estimés d'après les observatoires locaux.

${tag(a.c.name)} ${tag(b.c.name)} #ouvivre #déménagement #qualitédevie #villesdefrance #immobilier`;
  const col = (f: CityFacts, x: number, H: number, P: number, color: string) => `
    <text x="${x}" y="${H - P + 190}" font-family="${SANS}" font-size="40" font-weight="700" fill="#FFFFFF">${esc(f.c.name)}</text>
    <text x="${x}" y="${H - P + 290}" font-family="${SANS}" font-size="96" font-weight="800" fill="${color}">${fmt(f.c.scores.global)}<tspan font-size="40" fill="#CBD5E1">/10</tspan></text>
    ${f.rent ? `<text x="${x}" y="${H - P + 345}" font-family="${SANS}" font-size="32" fill="#E2E8F0">T2 : ${esc(euros(f.rent))}</text>` : ""}
    <text x="${x}" y="${H - P + 392}" font-family="${SANS}" font-size="28" fill="#A5B4FC">+ ${esc(AXIS_FR[f.best.k])} ${fmt(f.best.v)}</text>`;
  return {
    kind: "duel",
    caption,
    link,
    prompt: `Vibrant modern editorial illustration, split composition with two contrasting French city scenes side by side, left: ${scene(a)}; right: ${scene(b)}, golden hour light. Flat clean vector-like style with soft gradients, palette of indigo, violet, pink and cyan accents on warm stone tones. Absolutely no text, no letters, no numbers, no signs, no logos, no people in the foreground.`,
    svg: (W, H, P) => `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${PANEL_BASE(W, H, P, "Duel de villes · 8 critères")}
      <text x="64" y="${H - P + 92}" font-family="${SANS}" font-size="56" font-weight="800" fill="#FFFFFF">${esc(`${a.c.name} ou ${b.c.name} ?`)}</text>
      ${col(a, 64, H, P, "#FFFFFF")}${col(b, 580, H, P, "#F9A8D4")}
      <text x="64" y="${H - P + 440}" font-family="${SANS}" font-size="24" fill="#94A3B8">Note globale sur 10 · loyers estimés d'après les observatoires locaux</text></svg>`,
  };
}

function cityPost(f: CityFacts): Post {
  const link = `${SITE}/villes/${f.c.slug}`;
  const caption = `${f.c.name} en chiffres

Note globale : ${fmt(f.c.scores.global)}/10
${f.rent ? `Loyer T2 estimé : ${euros(f.rent)} par mois\n` : ""}Points forts : ${AXIS_FR[f.best.k]} (${fmt(f.best.v)}/10), ${AXIS_FR[f.second.k]} (${fmt(f.second.v)}/10)
Point faible : ${AXIS_FR[f.worst.k]} (${fmt(f.worst.v)}/10)

La fiche complète (quartiers, climat, avis d'habitants) : ${link.replace("https://www.", "")}

Notes MaVilleIdéale sur 10 (10 = le plus favorable), loyers estimés d'après les observatoires locaux.

${tag(f.c.name)} #ouvivre #déménagement #qualitédevie #villesdefrance #${tag(f.c.region).slice(1).toLowerCase()}`;
  return {
    kind: "ville",
    caption,
    link,
    prompt: `Vibrant modern editorial illustration of ${scene(f)}, seen from a slightly elevated viewpoint at golden hour. Flat clean vector-like style with soft gradients, palette of indigo, violet, pink and cyan accents on warm stone tones. Absolutely no text, no letters, no numbers, no signs, no logos, no people in the foreground.`,
    svg: (W, H, P) => `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${PANEL_BASE(W, H, P, "Ville en chiffres")}
      <text x="64" y="${H - P + 96}" font-family="${SANS}" font-size="64" font-weight="800" fill="#FFFFFF">${esc(f.c.name)}</text>
      <text x="64" y="${H - P + 210}" font-family="${SANS}" font-size="112" font-weight="800" fill="#F9A8D4">${fmt(f.c.scores.global)}<tspan font-size="44" fill="#CBD5E1">/10</tspan></text>
      ${f.rent ? `<text x="560" y="${H - P + 172}" font-family="${SANS}" font-size="36" fill="#CBD5E1">Loyer T2</text><text x="560" y="${H - P + 222}" font-family="${SANS}" font-size="52" font-weight="800" fill="#FFFFFF">${esc(euros(f.rent))}</text>` : ""}
      <text x="64" y="${H - P + 300}" font-family="${SANS}" font-size="34" fill="#A5B4FC">+ ${esc(AXIS_FR[f.best.k])} ${fmt(f.best.v)} · ${esc(AXIS_FR[f.second.k])} ${fmt(f.second.v)}</text>
      <text x="64" y="${H - P + 350}" font-family="${SANS}" font-size="34" fill="#FDA4AF">− ${esc(AXIS_FR[f.worst.k])} ${fmt(f.worst.v)}</text>
      <text x="64" y="${H - P + 420}" font-family="${SANS}" font-size="24" fill="#94A3B8">Notes sur 10 (10 = le plus favorable) · loyer estimé</text></svg>`,
  };
}

async function pickPost(week: number): Promise<Post> {
  if (week % 2 === 0) {
    for (let i = 0; i < DUELS.length; i++) {
      const [x, y] = DUELS[(week / 2 + i) % DUELS.length];
      const slug = comparePairSlug(x, y);
      const a = city(x), b = city(y);
      if (slug && a && b && (await urlOk(`${SITE}/comparer/${slug}`))) return duelPost(a, b, slug);
    }
  }
  for (let i = 0; i < VILLES.length; i++) {
    const f = city(VILLES[(Math.floor(week / 2) + i) % VILLES.length]);
    if (f && (await urlOk(`${SITE}/villes/${f.c.slug}`))) return cityPost(f);
  }
  throw new Error("aucune ville ni paire valide");
}

async function makeImage(post: Post, outDir: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-image-2", prompt: post.prompt, size: "1024x1536", quality: "high", n: 1 }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(`OpenAI : ${JSON.stringify(j.error ?? j)}`);
  const W = 1080, H = 1350, P = 560;
  const bg = await sharp(Buffer.from(j.data[0].b64_json, "base64")).resize(W, H - P + 120, { fit: "cover", position: "top" }).toBuffer();
  const file = join(outDir, `${post.kind}.jpg`);
  await sharp({ create: { width: W, height: H, channels: 3, background: "#141B2D" } })
    .composite([{ input: bg, top: 0, left: 0 }, { input: Buffer.from(post.svg(W, H, P)), top: 0, left: 0 }])
    .jpeg({ quality: 90 })
    .toFile(file);
  return file;
}

async function graph(path: string, body: FormData | URLSearchParams) {
  const res = await fetch(`${GRAPH}/${path}`, { method: "POST", body });
  const j = await res.json();
  if (!res.ok || j.error) throw new Error(`Graph ${path} : ${JSON.stringify(j.error ?? j)}`);
  return j;
}

async function publish(post: Post, file: string) {
  const token = process.env.FB_ACCESS_TOKEN!, page = process.env.FB_PAGE_ID!, ig = process.env.IG_USER_ID!;
  const fd = new FormData();
  fd.append("source", new Blob([readFileSync(file)], { type: "image/jpeg" }), "post.jpg");
  fd.append("message", post.caption);
  fd.append("access_token", token);
  const photo = await graph(`${page}/photos`, fd);
  const info = await (await fetch(`${GRAPH}/${photo.id}?fields=images&access_token=${token}`)).json();
  const imageUrl = info.images.sort((a: { width: number }, b: { width: number }) => b.width - a.width)[0].source;

  const container = await graph(`${ig}/media`, new URLSearchParams({ image_url: imageUrl, caption: post.caption, access_token: token }));
  for (let i = 0; i < 30; i++) {
    const s = await (await fetch(`${GRAPH}/${container.id}?fields=status_code&access_token=${token}`)).json();
    if (s.status_code === "FINISHED") break;
    if (s.status_code === "ERROR") throw new Error("Instagram a refusé l'image");
    await new Promise((r) => setTimeout(r, 3000));
  }
  const media = await graph(`${ig}/media_publish`, new URLSearchParams({ creation_id: container.id, access_token: token }));
  const igInfo = await (await fetch(`${GRAPH}/${media.id}?fields=permalink&access_token=${token}`)).json();
  return { facebook: `https://www.facebook.com/${photo.post_id?.replace("_", "/posts/") ?? photo.id}`, instagram: igInfo.permalink as string };
}

async function main() {
  const week = weekArg !== -1 ? Number(args[weekArg + 1]) : isoWeek(new Date());
  const post = await pickPost(week);
  const outDir = join(ROOT, "social-out");
  mkdirSync(outDir, { recursive: true });
  const file = await makeImage(post, outDir);
  writeFileSync(join(outDir, `${post.kind}.txt`), post.caption);
  console.log(`semaine ${week} · ${post.kind} · ${post.link}\n\n${post.caption}\n`);
  let result = "dry-run : rien publié";
  if (!DRY) {
    const r = await publish(post, file);
    result = `Facebook : ${r.facebook}\nInstagram : ${r.instagram}`;
  }
  console.log(result);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Post de la semaine ${week} (${post.kind})\n\n${result.replace(/\n/g, "  \n")}\n\n\`\`\`\n${post.caption}\n\`\`\`\n`);
  }
}

main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
