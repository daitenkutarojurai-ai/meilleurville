import { ImageResponse } from "next/og";
import { CITIES_SEED } from "@/data/cities-seed";
import { GUIDES } from "@/data/guides";

export const alt = "MeilleurVille — Trouvez la ville qui vous ressemble";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function scoreColor(score: number): string {
  if (score >= 8) return "#10b981";
  if (score >= 6) return "#f59e0b";
  return "#ef4444";
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
            <div
              style={{
                width: "44px",
                height: "44px",
                background: "#7c6af0",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "24px",
                fontWeight: 900,
              }}
            >
              M
            </div>
            <span style={{ color: "#f0f6fc", fontSize: "26px", fontWeight: 800 }}>
              MeilleurVille
            </span>
          </div>
          <div
            style={{
              background: "#7c6af022",
              border: "1px solid #7c6af044",
              borderRadius: "20px",
              padding: "6px 16px",
              color: "#a78bfa",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {CITIES_SEED.length} villes · {GUIDES.length} guides
          </div>
        </div>

        {/* Center: tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ color: "#8b949e", fontSize: "18px", letterSpacing: "1px" }}>
            La référence pour choisir où vivre en France
          </div>
          <div style={{ color: "#f0f6fc", fontSize: "68px", fontWeight: 900, lineHeight: 1.05 }}>
            Trouvez la ville
          </div>
          <div
            style={{
              color: "#7c6af0",
              fontSize: "68px",
              fontWeight: 900,
              lineHeight: 1.05,
            }}
          >
            qui vous ressemble
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
              background: "#7c6af011",
              border: "1px solid #7c6af033",
              borderRadius: "12px",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#7c6af0", fontSize: "22px", fontWeight: 900 }}>✨</span>
            <span style={{ color: "#a78bfa", fontSize: "12px", fontWeight: 600, textAlign: "center" }}>
              Quiz de
            </span>
            <span style={{ color: "#a78bfa", fontSize: "12px", fontWeight: 600, textAlign: "center" }}>
              matching
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
