/**
 * Publie les vidéos rendues par scripts/shorts-video.ts en Reels sur la page Facebook et le compte Instagram
 * (mêmes secrets que social-weekly : FB_ACCESS_TOKEN = jeton de page, FB_PAGE_ID, IG_USER_ID).
 *
 *   npx tsx --tsconfig tsconfig.json scripts/shorts-publish.ts --dir shorts-out [--dry-run] [--only fb|ig]
 *   npx tsx --tsconfig tsconfig.json scripts/shorts-publish.ts --check      # droits du jeton, rien n'est publié
 *
 * Envoi direct du fichier (upload « resumable » de l'API Graph) : aucune URL publique à héberger.
 * Légende : section « Instagram Reels / Facebook » du .txt de chaque vidéo. Une vidéo dont le lien n'a pas
 * répondu 200 au rendu (manifest.linkOk = false) n'est pas publiée.
 */
import { appendFileSync, readFileSync, statSync } from "fs";
import { join, resolve } from "path";

const GRAPH = "https://graph.facebook.com/v21.0";
const args = process.argv.slice(2);
const arg = (n: string) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const DRY = args.includes("--dry-run");
const ONLY = arg("only");
const token = process.env.FB_ACCESS_TOKEN ?? "";
const page = process.env.FB_PAGE_ID ?? "";
const ig = process.env.IG_USER_ID ?? "";

async function graph(path: string, params: Record<string, string>, method = "POST") {
  const body = new URLSearchParams({ ...params, access_token: token });
  const res = method === "GET" ? await fetch(`${GRAPH}/${path}?${body}`) : await fetch(`${GRAPH}/${path}`, { method, body });
  const j = await res.json();
  if (!res.ok || j.error) throw new Error(`Graph ${path} : ${JSON.stringify(j.error ?? j).slice(0, 400)}`);
  return j;
}

async function upload(url: string, file: string) {
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `OAuth ${token}`, offset: "0", file_size: String(statSync(file).size) },
    body: readFileSync(file),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || (j as { error?: unknown }).error) throw new Error(`upload ${res.status} : ${JSON.stringify(j).slice(0, 300)}`);
}

let lastFbVideo: string | null = arg("fb-video") ?? null;

async function facebookReel(file: string, caption: string): Promise<string> {
  const start = await graph(`${page}/video_reels`, { upload_phase: "start" });
  await upload(start.upload_url ?? `https://rupload.facebook.com/video-upload/v21.0/${start.video_id}`, file);
  await graph(`${page}/video_reels`, { upload_phase: "finish", video_id: start.video_id, video_state: "PUBLISHED", description: caption });
  lastFbVideo = start.video_id;
  return `https://www.facebook.com/reel/${start.video_id}`;
}

// URL publique de la vidéo hébergée par Facebook (même méthode que social-weekly pour les images).
async function fbVideoSource(id: string): Promise<string> {
  for (let i = 0; i < 60; i++) {
    const v = await graph(id, { fields: "source,status" }, "GET").catch(() => ({}) as { source?: string });
    if ((v as { source?: string }).source) return (v as { source: string }).source;
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error(`source de la vidéo Facebook ${id} indisponible`);
}

async function igWait(id: string) {
  for (let i = 0; i < 72; i++) {
    const s = await graph(id, { fields: "status_code,status" }, "GET");
    if (s.status_code === "FINISHED") return;
    if (s.status_code === "ERROR" || s.status_code === "EXPIRED") throw new Error(`Instagram a refusé la vidéo : ${s.status}`);
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error("Instagram : traitement trop long");
}

async function instagramReel(file: string, caption: string): Promise<string> {
  let id: string;
  try {
    const c = await graph(`${ig}/media`, { media_type: "REELS", upload_type: "resumable", caption, share_to_feed: "true", thumb_offset: "1500" });
    await upload(c.uri ?? `https://rupload.facebook.com/ig-api-upload/v21.0/${c.id}`, file);
    await igWait(c.id);
    id = c.id;
  } catch (e) {
    // Le 2026-11-26, l'envoi direct a répondu 400 ProcessingFailedError : repli sur l'URL de la vidéo Facebook.
    if (!lastFbVideo) throw e;
    console.warn(`Instagram, envoi direct refusé (${String(e).slice(0, 120)}) : repli sur la vidéo Facebook ${lastFbVideo}`);
    const c = await graph(`${ig}/media`, { media_type: "REELS", video_url: await fbVideoSource(lastFbVideo), caption, share_to_feed: "true", thumb_offset: "1500" });
    await igWait(c.id);
    id = c.id;
  }
  const m = await graph(`${ig}/media_publish`, { creation_id: id });
  const info = await graph(m.id, { fields: "permalink" }, "GET");
  return info.permalink as string;
}

function caption(txt: string): string {
  const m = txt.split("=== Instagram Reels / Facebook ===")[1];
  return (m ?? txt).trim().slice(0, 2150);
}

const summary = (s: string) => {
  console.log(s);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, s + "\n");
};

async function main() {
  if (!token || !page || !ig) throw new Error("FB_ACCESS_TOKEN, FB_PAGE_ID et IG_USER_ID sont requis");
  if (args.includes("--check")) {
    const p = await graph(page, { fields: "name,id" }, "GET");
    const a = await graph(ig, { fields: "username,id" }, "GET");
    summary(`Jeton OK : page « ${p.name} » (${p.id}), Instagram @${a.username} (${a.id})`);
    return;
  }
  const dir = resolve(arg("dir") ?? "shorts-out");
  const manifest = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8")) as { file: string; link: string; linkOk: boolean; title: string }[];
  let failures = 0;
  for (const v of manifest) {
    const file = join(dir, v.file);
    const cap = caption(readFileSync(file.replace(/\.mp4$/, ".txt"), "utf8"));
    if (!v.linkOk) {
      summary(`⏭ ${v.file} : lien ${v.link} non vérifié au rendu, non publié`);
      continue;
    }
    if (DRY) {
      summary(`dry-run ${v.file} (${(statSync(file).size / 1e6).toFixed(1)} Mo)\n\n${cap}\n`);
      continue;
    }
    summary(`## ${v.title}`);
    for (const [name, fn] of [["Facebook", facebookReel], ["Instagram", instagramReel]] as const) {
      if (ONLY && !name.toLowerCase().startsWith(ONLY)) continue;
      try {
        summary(`- ${name} : ${await fn(file, cap)}`);
      } catch (e) {
        failures++;
        summary(`- ${name} : ÉCHEC ${String(e).slice(0, 400)}`);
      }
    }
  }
  if (failures) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
