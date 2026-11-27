/**
 * Mail au propriétaire après chaque publication de vidéo courte (workflow shorts-publish) :
 *   - Facebook et Instagram : lien du Reel, ou l'erreur (lus dans <dir>/published.json, écrit par shorts-publish) ;
 *   - YouTube : la vidéo du créneau (scripts/shorts-youtube.json, programmée à l'avance depuis Studio) est-elle
 *     publique ? Vérifié par l'oEmbed public de YouTube (200 = en ligne, 403 = encore programmée) ;
 *   - stock YouTube : nombre de vidéos programmées après ce créneau ; à 5 ou moins, l'objet du mail le signale
 *     et le mail donne la commande du lot suivant (demande du propriétaire du 2026-11-27).
 *
 *   npx tsx --tsconfig tsconfig.json scripts/shorts-notify.ts --dir shorts-out [--slot AAAA-MM-JJ] [--test] [--print]
 *   --test : objet préfixé « [Essai] », YouTube vérifié une seule fois · --print : affiche le mail sans l'envoyer
 *
 * Envoi par l'API Brevo (secret BREVO_API_KEY) depuis bonjour@mavilleideale.fr vers NOTIFY_EMAIL (secret).
 */
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import YT from "./shorts-youtube.json";

const args = process.argv.slice(2);
const arg = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const TEST = args.includes("--test");
const PRINT = args.includes("--print");
const dir = resolve(arg("dir") ?? "shorts-out");
const SCHEDULE = YT as Record<string, { file: string; id: string }>;
const LOW_STOCK = 5;

type Result = { ok: boolean; url?: string; error?: string };
type Published = { file: string; title: string; slot: string | null; skipped?: string; results: Record<string, Result> };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const short = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const todayIso = () => new Date().toISOString().slice(0, 10);

// Même calendrier que scripts/shorts-video.ts : lundi, mercredi, vendredi, dimanche (UTC).
function nextSlot(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  do d.setUTCDate(d.getUTCDate() + 1);
  while (![1, 3, 5, 0].includes(d.getUTCDay()));
  return d.toISOString().slice(0, 10);
}

/** 200 = publique ; 403/401 = privée ou encore programmée. Réessaie quelques minutes : la vidéo passe en ligne à 18h. */
async function youtubeLive(id: string, tries: number): Promise<boolean> {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/shorts/${id}&format=json`);
      if (r.ok) return true;
    } catch {
      /* réseau : on réessaie */
    }
    if (i < tries - 1) await sleep(60_000);
  }
  return false;
}

async function main() {
  const pubFile = join(dir, "published.json");
  const pub: Published | null = existsSync(pubFile) ? (JSON.parse(readFileSync(pubFile, "utf8")) as Published[])[0] ?? null : null;
  const slot = arg("slot") ?? pub?.slot ?? todayIso();
  const run = process.env.GITHUB_RUN_ID ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : null;

  type Line = { name: string; ok: boolean; text: string; url?: string };
  const lines: Line[] = [];
  for (const [key, name] of [["fb", "Facebook"], ["ig", "Instagram"]] as const) {
    const r = pub?.results[key];
    if (r?.ok) lines.push({ name, ok: true, text: "publiée", url: r.url });
    else if (r) lines.push({ name, ok: false, text: `ÉCHEC : ${r.error ?? "erreur inconnue"}` });
    else lines.push({ name, ok: false, text: pub?.skipped ? `non publiée (${pub.skipped})` : "non publiée (rendu ou publication en échec, voir le run)" });
  }
  const yt = SCHEDULE[slot];
  if (!yt) lines.push({ name: "YouTube", ok: false, text: "aucune vidéo programmée pour ce créneau" });
  else {
    const url = `https://youtube.com/shorts/${yt.id}`;
    const live = await youtubeLive(yt.id, TEST ? 1 : 15);
    lines.push(live ? { name: "YouTube", ok: true, text: "en ligne", url } : { name: "YouTube", ok: false, text: "pas encore en ligne (programmée à 18h, à vérifier dans Studio)", url });
  }

  const future = Object.keys(SCHEDULE).filter((s) => s > slot).sort();
  const last = future.at(-1) ?? Object.keys(SCHEDULE).sort().at(-1) ?? slot;
  const low = future.length <= LOW_STOCK;
  const from = nextSlot(last > slot ? last : slot);
  const stock = future.length
    ? `${future.length} vidéo${future.length > 1 ? "s" : ""} YouTube programmée${future.length > 1 ? "s" : ""} après celle-ci, la dernière le ${short(last)}.`
    : "Plus aucune vidéo YouTube programmée après celle-ci.";
  const nextBatch =
    `Préparer le lot suivant (12 vidéos à partir du ${short(from)}) : demander à Claude « prépare et programme le lot YouTube suivant », ` +
    `ou lancer gh workflow run shorts-weekly.yml -f from=${from} -f count=12 puis tools/yt-upload.mjs.`;

  const title = pub?.title ?? "(vidéo non produite)";
  const failing = lines.filter((l) => !l.ok).map((l) => l.name);
  let subject = failing.length
    ? `⚠️ Vidéo du ${short(slot)} : ${failing.join(", ")} à vérifier`
    : `✅ Vidéo du ${short(slot)} en ligne sur Facebook, Instagram et YouTube`;
  if (low) subject += future.length ? ` · ⏳ plus que ${future.length} vidéo${future.length > 1 ? "s" : ""} YouTube programmée${future.length > 1 ? "s" : ""}` : " · ⏳ plus aucune vidéo YouTube programmée";
  if (TEST) subject = `[Essai] ${subject}`;

  const text = [
    `${title} (créneau du ${short(slot)})`,
    "",
    ...lines.map((l) => `${l.ok ? "✅" : "❌"} ${l.name} : ${l.text}${l.url ? ` ${l.url}` : ""}`),
    "",
    stock,
    ...(low ? ["", nextBatch] : []),
    ...(run ? ["", `Détail du run : ${run}`] : []),
  ].join("\n");
  const html =
    `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#141B2D">` +
    `<p style="font-size:17px"><strong>${esc(title)}</strong><br><span style="color:#64748B">Créneau du ${short(slot)}</span></p>` +
    `<ul style="padding-left:18px">` +
    lines.map((l) => `<li>${l.ok ? "✅" : "❌"} <strong>${l.name}</strong> : ${esc(l.text)}${l.url ? ` · <a href="${l.url}">${l.ok ? "voir" : "lien"}</a>` : ""}</li>`).join("") +
    `</ul>` +
    `<p>${esc(stock)}</p>` +
    (low ? `<p style="background:#FEF3C7;padding:10px 12px;border-radius:8px">⏳ ${esc(nextBatch)}</p>` : "") +
    (run ? `<p style="color:#64748B;font-size:13px"><a href="${run}">Détail du run GitHub</a></p>` : "") +
    `</div>`;

  if (PRINT) {
    console.log(`Objet : ${subject}\n\n${text}`);
    return;
  }
  const key = process.env.BREVO_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) {
    console.warn("BREVO_API_KEY ou NOTIFY_EMAIL absent : mail non envoyé.");
    console.log(`Objet : ${subject}\n\n${text}`);
    return;
  }
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { email: "bonjour@mavilleideale.fr", name: "MaVilleIdéale · vidéos" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });
  if (!res.ok) throw new Error(`Brevo : ${res.status} ${(await res.text()).slice(0, 200)}`);
  console.log(`Mail envoyé : ${subject}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
