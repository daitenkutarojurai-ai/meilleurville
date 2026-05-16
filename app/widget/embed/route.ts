// F10 — Embeddable widget iframe.
//
// This is a raw HTML route (not a React page) so the iframe payload stays
// under 10 KB — zero Next.js bundle, just hand-written HTML/CSS.
//
// Query params:
//   city=<slug>            — required for badge / criteres formats
//   city2=<slug>           — required for compare format
//   format=badge|criteres|compare  — default: badge
//
// Mandatory backlink to MeilleurVille is rendered inside the iframe; the
// third-party site cannot suppress it (everything ships server-side).
//
// CSP / framing: the iframe must be embeddable from any origin, so we set
// X-Frame-Options to nothing and rely on a permissive CSP (frame-ancestors *).

import { NextRequest, NextResponse } from "next/server";
import { CITIES_SEED } from "@/data/cities-seed";
import { scoreHex } from "@/lib/utils";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";

type Format = "badge" | "criteres" | "compare";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const STYLE = `
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:14px;color:#1a2533;background:#fff;line-height:1.4}
  .w{display:flex;flex-direction:column;height:100%;border:1px solid #e5e7eb;border-radius:14px;padding:14px;overflow:hidden}
  .h{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
  .h .l{font-weight:700;font-size:13px}
  .h .r{font-size:11px;color:#6b7280}
  .score{font-family:ui-monospace,"SF Mono","Menlo",monospace;font-weight:700;font-size:38px;line-height:1}
  .tag{font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em}
  .bar{height:6px;background:#f1f5f9;border-radius:3px;overflow:hidden;margin-top:4px}
  .bar>span{display:block;height:100%}
  .crit{display:flex;justify-content:space-between;align-items:center;font-size:12px;margin-bottom:6px}
  .crit:last-child{margin-bottom:0}
  .crit .lbl{color:#374151}
  .crit .val{font-family:ui-monospace,"SF Mono","Menlo",monospace;font-weight:700;font-size:12px}
  .cmp{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center}
  .cmp .c{text-align:center}
  .cmp .c .n{font-weight:700;font-size:13px;margin-bottom:4px}
  .cmp .c .s{font-family:ui-monospace,"SF Mono","Menlo",monospace;font-weight:700;font-size:28px}
  .f{margin-top:auto;padding-top:10px;border-top:1px solid #f1f5f9;font-size:10px;color:#9ca3af;text-align:center}
  .f a{color:#16a34a;text-decoration:none;font-weight:600}
  .f a:hover{text-decoration:underline}
`;

function shell(inner: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>MeilleurVille — Widget</title>
<style>${STYLE}</style>
</head>
<body>${inner}</body>
</html>`;
}

function renderBadge(slug: string): string {
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return shell(`<div class="w"><p>Ville inconnue.</p></div>`);
  const color = scoreHex(city.scores.global);
  return shell(`<div class="w">
  <div class="h"><div class="l">${escapeHtml(city.name)}</div><div class="r">${escapeHtml(city.region ?? "")}</div></div>
  <div style="display:flex;align-items:baseline;gap:8px"><div class="score" style="color:${color}">${city.scores.global.toFixed(1)}</div><div class="tag">/10 · qualité de vie</div></div>
  <div class="bar" style="margin-top:10px"><span style="width:${city.scores.global * 10}%;background:${color}"></span></div>
  <div class="f">Source : <a href="${BASE_URL}/villes/${city.slug}" target="_blank" rel="noopener">MeilleurVille</a></div>
</div>`);
}

function renderCriteres(slug: string): string {
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return shell(`<div class="w"><p>Ville inconnue.</p></div>`);
  // Top 3 highest-scoring axes
  const axes: Array<{ key: keyof typeof city.scores; label: string }> = [
    { key: "life", label: "Qualité de vie" },
    { key: "transport", label: "Transport" },
    { key: "nature", label: "Nature" },
    { key: "cost", label: "Coût de vie" },
    { key: "safety", label: "Sécurité" },
    { key: "culture", label: "Culture" },
    { key: "remoteWork", label: "Télétravail" },
    { key: "schools", label: "Écoles" },
  ];
  const top3 = [...axes]
    .sort((a, b) => city.scores[b.key] - city.scores[a.key])
    .slice(0, 3);
  return shell(`<div class="w">
  <div class="h"><div class="l">${escapeHtml(city.name)}</div><div class="r">${city.scores.global.toFixed(1)}/10 global</div></div>
  ${top3
    .map((a) => {
      const v = city.scores[a.key];
      return `<div class="crit"><span class="lbl">${escapeHtml(a.label)}</span><span class="val" style="color:${scoreHex(v)}">${v.toFixed(1)}</span></div><div class="bar" style="margin-bottom:8px"><span style="width:${v * 10}%;background:${scoreHex(v)}"></span></div>`;
    })
    .join("")}
  <div class="f">Données : <a href="${BASE_URL}/villes/${city.slug}" target="_blank" rel="noopener">MeilleurVille</a></div>
</div>`);
}

function renderCompare(slugA: string, slugB: string): string {
  const a = CITIES_SEED.find((c) => c.slug === slugA);
  const b = CITIES_SEED.find((c) => c.slug === slugB);
  if (!a || !b) return shell(`<div class="w"><p>Une ville est inconnue.</p></div>`);
  const aColor = scoreHex(a.scores.global);
  const bColor = scoreHex(b.scores.global);
  const winner = a.scores.global > b.scores.global ? a : b.scores.global > a.scores.global ? b : null;
  return shell(`<div class="w">
  <div class="h"><div class="l">Comparaison</div><div class="r">${winner ? `${escapeHtml(winner.name)} l'emporte` : "Égalité"}</div></div>
  <div class="cmp">
    <div class="c"><div class="n">${escapeHtml(a.name)}</div><div class="s" style="color:${aColor}">${a.scores.global.toFixed(1)}</div><div class="tag">/10</div></div>
    <div class="c"><div class="n">${escapeHtml(b.name)}</div><div class="s" style="color:${bColor}">${b.scores.global.toFixed(1)}</div><div class="tag">/10</div></div>
  </div>
  <div class="f">Comparatif : <a href="${BASE_URL}/comparer/${a.slug}-vs-${b.slug}" target="_blank" rel="noopener">MeilleurVille</a></div>
</div>`);
}

export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const format = ((searchParams.get("format") ?? "badge") as Format);
  const city = searchParams.get("city") ?? "";
  const city2 = searchParams.get("city2") ?? "";

  let html: string;
  if (format === "compare") {
    html = renderCompare(city, city2);
  } else if (format === "criteres") {
    html = renderCriteres(city);
  } else {
    html = renderBadge(city);
  }

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Public, cached aggressively at the edge (city scores rebuild infrequently)
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      // Allow any origin to embed
      "Content-Security-Policy": "frame-ancestors *",
      // No X-Frame-Options (which would deny embedding)
    },
  });
}
