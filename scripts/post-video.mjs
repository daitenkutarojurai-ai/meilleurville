#!/usr/bin/env node
/**
 * Multi-platform video poster for mavilleideale.fr
 *
 * Usage:
 *   node scripts/post-video.mjs --file /path/to/video.mp4
 *   node scripts/post-video.mjs --file /path/to/video.mp4 --platform fb
 *   node scripts/post-video.mjs --file /path/to/video.mp4 --platform ig
 *   node scripts/post-video.mjs --file /path/to/video.mp4 --platform linkedin
 *
 * Reads credentials from .env.local
 */

import { readFileSync, statSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envRaw = readFileSync(join(root, ".env.local"), "utf-8");
const env = Object.fromEntries(
  envRaw
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const {
  FB_PAGE_ID,
  FB_PAGE_TOKEN,
  LINKEDIN_ACCESS_TOKEN,
  LINKEDIN_URN,
} = env;

// IG_USER_ID is hard-coded from the linked business account
const IG_USER_ID = "17841440878172009";

// ─── Platform-specific captions ───────────────────────────────────────────────
const CAPTIONS = {
  fb: `Cette ville bat Paris sur le coût de la vie — et personne n'en parle.

On a comparé 540 villes françaises sur 8 critères réels : loyer, transports, nature, sécurité, emploi, culture, télétravail, écoles.

Paris : 6,8/10 · La vraie surprise : 8,1/10 pour 40 % moins cher.

Comparez toutes les villes sur mavilleideale.fr

#QualitéDeVie #VieEnFrance #QuitterParis #Relocation #ImmobilierFrance #BienVivre #OùVivre`,

  ig: `Cette ville bat Paris. Sans filtre. 👇

🏠 Loyer : −40 % vs Paris
🌿 Nature : score 9+/10
🛡️ Sécurité : top France
💶 Coût de vie : nettement inférieur

540 villes comparées. Données réelles (INSEE, SSMSI, observatoires des loyers).

Lien en bio → mavilleideale.fr

#France #QualitéDeVie #QuitterParis #Relocation #VillesFrançaises #BienVivre #ImmobilierFrance #VieEnProvince #OùVivre #FrenchLife #Déménagement #LibertéFinancière`,

  linkedin: `Données : cette ville française surclasse Paris sur 5 des 8 critères de qualité de vie.

J'ai construit MaVilleIdéale.fr pour analyser 540 villes françaises avec des données réelles (INSEE, SSMSI, observatoires des loyers) — pas des avis subjectifs.

Résultat : les métropoles secondaires offrent un meilleur rapport qualité/coût de vie que Paris dans la majorité des cas. Paris reste N°1 pour l'emploi et les réseaux professionnels, mais perd sur presque tous les autres critères.

Si vous réfléchissez à une relocation ou à un projet à distance, les chiffres valent le détour.

→ mavilleideale.fr

#Relocation #QualitéDeVie #France #ImmobilierFrance #Télétravail #PropTech #DonnéesOuvertes`,
};

// ─── Args ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const fileIdx = args.indexOf("--file");
const platformIdx = args.indexOf("--platform");
const videoPath = fileIdx !== -1 ? args[fileIdx + 1] : null;
const onlyPlatform = platformIdx !== -1 ? args[platformIdx + 1] : null;

if (!videoPath) {
  console.error("❌ --file <path> is required");
  console.error("\nUsage:");
  console.error("  node scripts/post-video.mjs --file /path/to/video.mp4");
  console.error("  node scripts/post-video.mjs --file /path/to/video.mp4 --platform fb|ig|linkedin");
  process.exit(1);
}

let videoSize;
try {
  videoSize = statSync(videoPath).size;
} catch {
  console.error(`❌ File not found: ${videoPath}`);
  process.exit(1);
}

function log(platform, status, msg) {
  const icon = status === "ok" ? "✅" : status === "warn" ? "⚠️" : "❌";
  console.log(`${icon} [${platform.padEnd(10)}] ${msg}`);
}

// ─── Facebook video upload ─────────────────────────────────────────────────────
// Uses the resumable video upload API (works for any file size)
async function postFacebook() {
  if (!FB_PAGE_TOKEN || !FB_PAGE_ID) {
    log("Facebook", "fail", "FB_PAGE_TOKEN or FB_PAGE_ID not set");
    return;
  }

  log("Facebook", "warn", `Uploading video (${(videoSize / 1024 / 1024).toFixed(1)} MB)...`);

  // Step 1: Start upload session
  const startRes = await fetch(
    `https://graph.facebook.com/v21.0/${FB_PAGE_ID}/videos`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        upload_phase: "start",
        file_size: videoSize,
        access_token: FB_PAGE_TOKEN,
      }),
    }
  );
  const startData = await startRes.json();
  if (!startRes.ok) {
    log("Facebook", "fail", `Start phase: ${JSON.stringify(startData.error || startData)}`);
    return;
  }

  const { upload_session_id, start_offset, end_offset, video_id } = startData;

  // Step 2: Transfer phase (upload the binary)
  const buf = readFileSync(videoPath);
  let currentStart = parseInt(start_offset);
  let currentEnd = parseInt(end_offset);

  while (currentStart < videoSize) {
    const chunk = buf.subarray(currentStart, currentEnd);
    const form = new FormData();
    form.append("upload_phase", "transfer");
    form.append("upload_session_id", upload_session_id);
    form.append("start_offset", String(currentStart));
    form.append("access_token", FB_PAGE_TOKEN);
    form.append("video_file_chunk", new Blob([chunk], { type: "video/mp4" }), "chunk");

    const transferRes = await fetch(
      `https://graph.facebook.com/v21.0/${FB_PAGE_ID}/videos`,
      { method: "POST", body: form }
    );
    const transferData = await transferRes.json();
    if (!transferRes.ok) {
      log("Facebook", "fail", `Transfer phase: ${JSON.stringify(transferData.error || transferData)}`);
      return;
    }
    currentStart = parseInt(transferData.start_offset);
    currentEnd = parseInt(transferData.end_offset);
    process.stdout.write(`\r  Uploading... ${Math.round((currentStart / videoSize) * 100)}%`);
  }
  process.stdout.write("\n");

  // Step 3: Finish phase (publish with caption)
  const finishRes = await fetch(
    `https://graph.facebook.com/v21.0/${FB_PAGE_ID}/videos`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        upload_phase: "finish",
        upload_session_id,
        description: CAPTIONS.fb,
        access_token: FB_PAGE_TOKEN,
      }),
    }
  );
  const finishData = await finishRes.json();
  if (finishRes.ok && finishData.success) {
    log("Facebook", "ok", `Video posted! ID: ${video_id}`);
  } else {
    log("Facebook", "fail", `Finish phase: ${JSON.stringify(finishData.error || finishData)}`);
  }
}

// ─── Instagram Reel upload (resumable) ────────────────────────────────────────
async function postInstagram() {
  if (!FB_PAGE_TOKEN) {
    log("Instagram", "fail", "FB_PAGE_TOKEN not set");
    return;
  }

  log("Instagram", "warn", `Uploading Reel (${(videoSize / 1024 / 1024).toFixed(1)} MB)...`);

  // Step 1: Create media container (resumable upload)
  const containerRes = await fetch(
    `https://graph.facebook.com/v21.0/${IG_USER_ID}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_type: "REELS",
        upload_type: "resumable",
        caption: CAPTIONS.ig,
        share_to_feed: true,
        access_token: FB_PAGE_TOKEN,
      }),
    }
  );
  const containerData = await containerRes.json();
  if (!containerRes.ok) {
    log("Instagram", "fail", `Container: ${JSON.stringify(containerData.error || containerData)}`);
    return;
  }

  const containerId = containerData.id;
  const uploadUri = containerData.uri;

  // Step 2: Upload video binary to the upload URI
  const buf = readFileSync(videoPath);
  const uploadRes = await fetch(uploadUri, {
    method: "POST",
    headers: {
      "Authorization": `OAuth ${FB_PAGE_TOKEN}`,
      "offset": "0",
      "file_size": String(videoSize),
      "Content-Type": "video/mp4",
    },
    body: buf,
  });
  if (!uploadRes.ok) {
    const uploadData = await uploadRes.text();
    log("Instagram", "fail", `Upload: ${uploadData}`);
    return;
  }
  log("Instagram", "warn", "Video uploaded, waiting for processing...");

  // Step 3: Poll until container is ready
  let attempts = 0;
  while (attempts < 20) {
    await new Promise((r) => setTimeout(r, 5000));
    const statusRes = await fetch(
      `https://graph.facebook.com/v21.0/${containerId}?fields=status_code,status&access_token=${FB_PAGE_TOKEN}`
    );
    const statusData = await statusRes.json();
    if (statusData.status_code === "FINISHED") break;
    if (statusData.status_code === "ERROR") {
      log("Instagram", "fail", `Processing error: ${JSON.stringify(statusData)}`);
      return;
    }
    process.stdout.write(`\r  Processing... (${statusData.status_code || "IN_PROGRESS"}) attempt ${attempts + 1}/20`);
    attempts++;
  }
  process.stdout.write("\n");

  // Step 4: Publish
  const publishRes = await fetch(
    `https://graph.facebook.com/v21.0/${IG_USER_ID}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: FB_PAGE_TOKEN,
      }),
    }
  );
  const publishData = await publishRes.json();
  if (publishRes.ok && publishData.id) {
    log("Instagram", "ok", `Reel published! ID: ${publishData.id}`);
  } else {
    log("Instagram", "fail", `Publish: ${JSON.stringify(publishData.error || publishData)}`);
  }
}

// ─── LinkedIn video upload ─────────────────────────────────────────────────────
async function postLinkedIn() {
  if (!LINKEDIN_ACCESS_TOKEN || !LINKEDIN_URN) {
    log("LinkedIn", "fail", "LINKEDIN_ACCESS_TOKEN or LINKEDIN_URN not set");
    return;
  }

  log("LinkedIn", "warn", `Uploading video (${(videoSize / 1024 / 1024).toFixed(1)} MB)...`);

  const liHeaders = {
    Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    "X-Restli-Protocol-Version": "2.0.0",
  };

  // Step 1: Initialize upload
  const initRes = await fetch(
    "https://api.linkedin.com/v2/videos?action=initializeUpload",
    {
      method: "POST",
      headers: liHeaders,
      body: JSON.stringify({
        initializeUploadRequest: {
          owner: `urn:li:person:${LINKEDIN_URN}`,
          fileSizeBytes: videoSize,
          uploadCaptions: false,
          uploadThumbnail: false,
        },
      }),
    }
  );
  const initData = await initRes.json();
  if (!initRes.ok) {
    log("LinkedIn", "fail", `Init: ${JSON.stringify(initData)}`);
    return;
  }

  const { video: videoUrn, uploadInstructions, uploadToken } = initData.value;
  const uploadedPartIds = [];

  // Step 2: Upload each chunk
  const buf = readFileSync(videoPath);
  for (let i = 0; i < uploadInstructions.length; i++) {
    const { uploadUrl, firstByte, lastByte } = uploadInstructions[i];
    const chunk = buf.subarray(firstByte, lastByte + 1);
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/octet-stream" },
      body: chunk,
    });
    if (!putRes.ok) {
      log("LinkedIn", "fail", `Chunk ${i + 1} upload failed (status ${putRes.status})`);
      return;
    }
    const etag = putRes.headers.get("etag") || putRes.headers.get("ETag") || `part-${i}`;
    uploadedPartIds.push(etag);
    process.stdout.write(`\r  Uploading chunk ${i + 1}/${uploadInstructions.length}...`);
  }
  process.stdout.write("\n");

  // Step 3: Finalize upload
  const finalizeRes = await fetch(
    "https://api.linkedin.com/v2/videos?action=finalizeUpload",
    {
      method: "POST",
      headers: liHeaders,
      body: JSON.stringify({
        finalizeUploadRequest: {
          video: videoUrn,
          uploadToken,
          uploadedPartIds,
        },
      }),
    }
  );
  if (!finalizeRes.ok) {
    const finalizeData = await finalizeRes.text();
    log("LinkedIn", "fail", `Finalize: ${finalizeData}`);
    return;
  }

  log("LinkedIn", "warn", "Waiting for LinkedIn to process video...");
  await new Promise((r) => setTimeout(r, 8000));

  // Step 4: Create the post with the video
  const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: liHeaders,
    body: JSON.stringify({
      author: `urn:li:person:${LINKEDIN_URN}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: CAPTIONS.linkedin },
          shareMediaCategory: "VIDEO",
          media: [
            {
              status: "READY",
              media: videoUrn,
              title: { attributes: [], text: "MaVilleIdéale — 540 villes comparées" },
            },
          ],
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    }),
  });
  const postData = await postRes.json();
  if (postRes.ok) {
    log("LinkedIn", "ok", `Video post created! URN: ${postData.id}`);
  } else {
    log("LinkedIn", "fail", `Post: ${JSON.stringify(postData)}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🎬 Posting video: ${videoPath}`);
  console.log(`📦 Size: ${(videoSize / 1024 / 1024).toFixed(1)} MB\n`);

  const platforms = { fb: postFacebook, ig: postInstagram, linkedin: postLinkedIn };

  if (onlyPlatform && platforms[onlyPlatform]) {
    await platforms[onlyPlatform]();
  } else {
    for (const fn of Object.values(platforms)) {
      await fn();
    }
  }

  console.log("\nDone.");
}

main().catch(console.error);
