#!/usr/bin/env node
/**
 * Multi-platform social media poster for mavilleideale.fr / bestcitiesinfrance.com
 *
 * Usage:
 *   node scripts/social-post.mjs                    # post default test content
 *   node scripts/social-post.mjs --text "..."       # custom text
 *   node scripts/social-post.mjs --platform fb      # single platform
 *   node scripts/social-post.mjs --auth-urls        # print OAuth URLs to get fresh tokens
 *
 * Reads credentials from .env.local
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// ─── Load .env.local ──────────────────────────────────────────────────────────
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
  FB_APP_ID,
  FB_APP_SECRET,
  FB_ACCESS_TOKEN,
  FB_PAGE_ID,           // set this once you have a page token
  THREADS_USER_ID,
  THREADS_ACCESS_TOKEN, // set after OAuth flow
  LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET,
  LINKEDIN_ACCESS_TOKEN, // set after OAuth flow
  TWITTER_CLIENT_ID,
  TWITTER_CLIENT_SECRET,
  TWITTER_ACCESS_TOKEN,  // set after OAuth flow
} = env;

// ─── Post content ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const textIdx = args.indexOf("--text");
const platformIdx = args.indexOf("--platform");
const onlyPlatform = platformIdx !== -1 ? args[platformIdx + 1] : null;
const authUrlsMode = args.includes("--auth-urls");

const POST_TEXT = textIdx !== -1
  ? args[textIdx + 1]
  : `🏙️ Découvrez quelle ville française vous correspond vraiment.

540 villes, 19 classements, des données réelles — sans bullshit.

👉 mavilleideale.fr

#France #BienVivre #Immobilier #Relocation`;

const POST_TEXT_EN = `🏙️ Find your ideal city in France — 540 cities ranked on safety, cost, nature, transport and more.

Real data. No sponsored fluff.

👉 bestcitiesinfrance.com

#France #Expats #RelocationFrance #BestCities`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function post(url, body, headers = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}

async function get(url, headers = {}) {
  const res = await fetch(url, { headers });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}

function log(platform, status, msg) {
  const icon = status === "ok" ? "✅" : status === "warn" ? "⚠️" : "❌";
  console.log(`${icon} [${platform.padEnd(10)}] ${msg}`);
}

// ─── Platform: Facebook ───────────────────────────────────────────────────────
async function postFacebook() {
  if (!FB_ACCESS_TOKEN || !FB_PAGE_ID) {
    // Try with user token to discover pages first
    if (FB_ACCESS_TOKEN) {
      const r = await get(
        `https://graph.facebook.com/v21.0/me/accounts?access_token=${FB_ACCESS_TOKEN}`
      );
      if (r.ok && r.data.data?.length) {
        const pages = r.data.data;
        log("Facebook", "warn", `Token valid. ${pages.length} page(s) found:`);
        pages.forEach((p) => log("Facebook", "warn", `  → ${p.name} (ID: ${p.id})`));
        log("Facebook", "warn", "Set FB_PAGE_ID in .env.local and re-run.");
        return;
      }
    }
    log("Facebook", "skip", "FB_ACCESS_TOKEN or FB_PAGE_ID not set — see auth-urls mode");
    return;
  }

  // Get page token from user token
  const pagesRes = await get(
    `https://graph.facebook.com/v21.0/${FB_PAGE_ID}?fields=access_token&access_token=${FB_ACCESS_TOKEN}`
  );
  const pageToken = pagesRes.data?.access_token || FB_ACCESS_TOKEN;

  const r = await post(
    `https://graph.facebook.com/v21.0/${FB_PAGE_ID}/feed`,
    { message: POST_TEXT, access_token: pageToken }
  );
  if (r.ok) {
    log("Facebook", "ok", `Posted! Post ID: ${r.data.id}`);
  } else {
    log("Facebook", "fail", `Error: ${JSON.stringify(r.data.error || r.data)}`);
  }
}

// ─── Platform: Threads ────────────────────────────────────────────────────────
async function postThreads() {
  if (!THREADS_ACCESS_TOKEN) {
    log("Threads", "skip", "THREADS_ACCESS_TOKEN not set — see auth-urls mode");
    return;
  }
  // Step 1: create container
  const container = await post(
    `https://graph.threads.net/v1.0/${THREADS_USER_ID}/threads`,
    { media_type: "TEXT", text: POST_TEXT, access_token: THREADS_ACCESS_TOKEN }
  );
  if (!container.ok) {
    log("Threads", "fail", `Container error: ${JSON.stringify(container.data)}`);
    return;
  }
  const containerId = container.data.id;

  // Step 2: publish
  const pub = await post(
    `https://graph.threads.net/v1.0/${THREADS_USER_ID}/threads_publish`,
    { creation_id: containerId, access_token: THREADS_ACCESS_TOKEN }
  );
  if (pub.ok) {
    log("Threads", "ok", `Published! Thread ID: ${pub.data.id}`);
  } else {
    log("Threads", "fail", `Publish error: ${JSON.stringify(pub.data)}`);
  }
}

// ─── Platform: LinkedIn ───────────────────────────────────────────────────────
async function postLinkedIn() {
  if (!LINKEDIN_ACCESS_TOKEN) {
    log("LinkedIn", "skip", "LINKEDIN_ACCESS_TOKEN not set — see auth-urls mode");
    return;
  }
  // Get profile URN
  const me = await get("https://api.linkedin.com/v2/userinfo", {
    Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
  });
  if (!me.ok) {
    log("LinkedIn", "fail", `Token invalid: ${JSON.stringify(me.data)}`);
    return;
  }
  const urn = me.data.sub; // format: "urn:li:person:XXXX" or just the ID

  const r = await post(
    "https://api.linkedin.com/v2/ugcPosts",
    {
      author: `urn:li:person:${urn}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: POST_TEXT },
          shareMediaCategory: "NONE",
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    },
    {
      Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
      "X-Restli-Protocol-Version": "2.0.0",
    }
  );
  if (r.ok) {
    log("LinkedIn", "ok", `Posted! URN: ${r.data.id}`);
  } else {
    log("LinkedIn", "fail", `Error: ${JSON.stringify(r.data)}`);
  }
}

// ─── Platform: Twitter/X ─────────────────────────────────────────────────────
async function postTwitter() {
  if (!TWITTER_ACCESS_TOKEN) {
    log("Twitter", "skip", "TWITTER_ACCESS_TOKEN not set — see auth-urls mode");
    return;
  }
  const tweet = POST_TEXT.slice(0, 280); // Twitter 280 char limit
  const r = await post(
    "https://api.twitter.com/2/tweets",
    { text: tweet },
    { Authorization: `Bearer ${TWITTER_ACCESS_TOKEN}` }
  );
  if (r.ok) {
    log("Twitter", "ok", `Tweeted! ID: ${r.data.data?.id}`);
  } else {
    log("Twitter", "fail", `Error: ${JSON.stringify(r.data)}`);
  }
}

// ─── OAuth URLs ───────────────────────────────────────────────────────────────
function printAuthUrls() {
  console.log("\n📋 OAUTH FLOW — paste these URLs in your browser\n");

  console.log("── Facebook / Threads ─────────────────────────────────────────");
  console.log("1. Go to: https://developers.facebook.com/tools/explorer/");
  console.log("   Select app: mavilleideal (1508512297660714)");
  console.log("   Add permissions: pages_manage_posts, pages_read_engagement");
  console.log("   For Threads: add threads_basic, threads_content_publish");
  console.log("   Generate Token → paste as FB_ACCESS_TOKEN in .env.local");
  console.log("   Then check pages: GET /me/accounts → set FB_PAGE_ID");
  console.log("");
  console.log("   OR open this Threads OAuth URL in browser:");
  const threadsUrl = `https://threads.net/oauth/authorize?client_id=${FB_APP_ID}&redirect_uri=https://localhost&scope=threads_basic,threads_content_publish&response_type=code`;
  console.log("   " + threadsUrl);
  console.log("   → grab ?code=XXX → exchange for token:");
  console.log(`   curl -X POST "https://graph.threads.net/oauth/access_token" \\`);
  console.log(`     -d "client_id=${FB_APP_ID}" \\`);
  console.log(`     -d "client_secret=${FB_APP_SECRET}" \\`);
  console.log(`     -d "grant_type=authorization_code" \\`);
  console.log(`     -d "redirect_uri=https://localhost" \\`);
  console.log(`     -d "code=CODE_FROM_URL"`);
  console.log("   → Set THREADS_ACCESS_TOKEN in .env.local\n");

  console.log("── LinkedIn ───────────────────────────────────────────────────");
  const liUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=https://localhost&scope=openid%20profile%20w_member_social`;
  console.log("1. Open in browser:\n   " + liUrl);
  console.log("2. Authorize → grab ?code=XXX from the redirect URL");
  console.log("3. Exchange:");
  console.log(`   curl -X POST "https://www.linkedin.com/oauth/v2/accessToken" \\`);
  console.log(`     -d "grant_type=authorization_code" \\`);
  console.log(`     -d "code=CODE_FROM_URL" \\`);
  console.log(`     -d "client_id=${LINKEDIN_CLIENT_ID}" \\`);
  console.log(`     -d "client_secret=${LINKEDIN_CLIENT_SECRET}" \\`);
  console.log(`     -d "redirect_uri=https://localhost"`);
  console.log("4. Set LINKEDIN_ACCESS_TOKEN in .env.local\n");

  console.log("── Twitter/X ──────────────────────────────────────────────────");
  const { CODE_VERIFIER, CODE_CHALLENGE, STATE } = generatePKCE();
  console.log(`Code verifier (save this!): ${CODE_VERIFIER}`);
  const twUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${TWITTER_CLIENT_ID}&redirect_uri=https://localhost&scope=tweet.write%20users.read%20tweet.read%20offline.access&state=${STATE}&code_challenge=${CODE_CHALLENGE}&code_challenge_method=S256`;
  console.log("1. Open in browser:\n   " + twUrl);
  console.log("2. Authorize → grab ?code=XXX from redirect URL");
  console.log("3. Exchange (Basic auth = base64(clientId:clientSecret)):");
  const b64 = Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString("base64");
  console.log(`   curl -X POST "https://api.twitter.com/2/oauth2/token" \\`);
  console.log(`     -H "Authorization: Basic ${b64}" \\`);
  console.log(`     -H "Content-Type: application/x-www-form-urlencoded" \\`);
  console.log(`     -d "grant_type=authorization_code&code=CODE&redirect_uri=https://localhost&code_verifier=${CODE_VERIFIER}"`);
  console.log("4. Set TWITTER_ACCESS_TOKEN in .env.local\n");
}

function generatePKCE() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let CODE_VERIFIER = "";
  for (let i = 0; i < 43; i++) CODE_VERIFIER += chars[Math.floor(Math.random() * chars.length)];
  // Note: real SHA256 PKCE needs crypto — simplified here, run auth-urls via bash for correct challenge
  const STATE = Math.random().toString(36).slice(2);
  return { CODE_VERIFIER, CODE_CHALLENGE: "USE_BASH_SCRIPT_FOR_REAL_PKCE", STATE };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (authUrlsMode) {
    printAuthUrls();
    return;
  }

  console.log(`\n🚀 Posting to social media\n📝 "${POST_TEXT.slice(0, 60)}..."\n`);

  const platforms = {
    fb: postFacebook,
    threads: postThreads,
    linkedin: postLinkedIn,
    twitter: postTwitter,
  };

  if (onlyPlatform && platforms[onlyPlatform]) {
    await platforms[onlyPlatform]();
  } else {
    await Promise.all(Object.values(platforms).map((fn) => fn()));
  }

  console.log("\nDone.");
}

main().catch(console.error);
