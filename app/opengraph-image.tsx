import { ImageResponse } from "next/og";
import { CITIES_SEED } from "@/data/cities-seed";
import { GUIDES } from "@/data/guides";

// Locale-aware: the EN Vercel project sets NEXT_PUBLIC_DEFAULT_LOCALE=en, so
// this single OG card renders in English on bestcitiesinfrance.com and in
// French on mavilleideale.fr. Every EN page inherits this card (there is no
// app/[locale]/opengraph-image.tsx).
const IS_EN = process.env.NEXT_PUBLIC_DEFAULT_LOCALE === "en";

const COPY = IS_EN
  ? {
      brand: "BestCitiesInFrance",
      eyebrow: "The reference for choosing where to live in France",
      line1: "Find the French city",
      line2: "that fits you",
      stats: (c: number, g: number) => `${c} cities · ${g} guides`,
      quizA: "Matching",
      quizB: "quiz",
    }
  : {
      brand: "MeilleurVille",
      eyebrow: "La référence pour choisir où vivre en France",
      line1: "Trouvez la ville",
      line2: "qui vous ressemble",
      stats: (c: number, g: number) => `${c} villes · ${g} guides`,
      quizA: "Quiz de",
      quizB: "matching",
    };

export const alt = `${COPY.brand} — ${COPY.line1} ${COPY.line2}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function scoreColor(score: number): string {
  if (score >= 7.5) return "#A855F7";
  if (score >= 7.0) return "#16A34A";
  if (score >= 6.0) return "#84CC16";
  if (score >= 5.0) return "#F59E0B";
  if (score >= 4.0) return "#F97316";
  return "#EF4444";
}

export default function Image() {
  const top5 = [...CITIES_SEED]
    .sort((a, b) => b.scores.global - a.scores.global)
    .slice(0, 5);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "60px",
          justifyContent: "space-between",
        }}
      >
        {/* Top: branding */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <svg width="44" height="44" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
            <span style={{ color: "#f0f6fc", fontSize: "26px", fontWeight: 800 }}>
              {COPY.brand}
            </span>
          </div>
          <div
            style={{
              background: "#0D948822",
              border: "1px solid #0D948844",
              borderRadius: "20px",
              padding: "6px 16px",
              color: "#2DD4BF",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {COPY.stats(CITIES_SEED.length, GUIDES.length)}
          </div>
        </div>

        {/* Center: tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ color: "#8b949e", fontSize: "18px", letterSpacing: "1px" }}>
            {COPY.eyebrow}
          </div>
          <div style={{ color: "#f0f6fc", fontSize: "68px", fontWeight: 900, lineHeight: 1.05 }}>
            {COPY.line1}
          </div>
          <div
            style={{
              color: "#0D9488",
              fontSize: "68px",
              fontWeight: 900,
              lineHeight: 1.05,
            }}
          >
            {COPY.line2}
          </div>
        </div>

        {/* Bottom: top 5 cities */}
        <div style={{ display: "flex", gap: "10px" }}>
          {top5.map((city, i) => {
            const color = scoreColor(city.scores.global);
            const medals = ["🥇", "🥈", "🥉", "#4", "#5"];
            return (
              <div
                key={city.slug}
                style={{
                  flex: 1,
                  background: "#0d1117",
                  border: `1px solid ${i < 3 ? color + "44" : "#30363d"}`,
                  borderRadius: "12px",
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <span style={{ fontSize: "16px" }}>{medals[i]}</span>
                <span style={{ color: "#f0f6fc", fontSize: "15px", fontWeight: 700, lineHeight: 1.2 }}>
                  {city.name}
                </span>
                <span style={{ color, fontSize: "14px", fontWeight: 700 }}>
                  {city.scores.global.toFixed(1)}/10
                </span>
              </div>
            );
          })}
          <div
            style={{
              flex: 1,
              background: "#0D948811",
              border: "1px solid #0D948833",
              borderRadius: "12px",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#0D9488", fontSize: "22px", fontWeight: 900 }}>✨</span>
            <span style={{ color: "#2DD4BF", fontSize: "12px", fontWeight: 600, textAlign: "center" }}>
              {COPY.quizA}
            </span>
            <span style={{ color: "#2DD4BF", fontSize: "12px", fontWeight: 600, textAlign: "center" }}>
              {COPY.quizB}
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
