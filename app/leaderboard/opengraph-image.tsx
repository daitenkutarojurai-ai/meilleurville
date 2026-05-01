import { ImageResponse } from "next/og";
import { CITIES_SEED } from "@/data/cities-seed";

export const alt = "Leaderboard villes françaises — MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function scoreColor(score: number): string {
  if (score >= 8) return "#10b981";
  if (score >= 6) return "#f59e0b";
  return "#ef4444";
}

export default function Image() {
  const top10 = [...CITIES_SEED]
    .sort((a, b) => b.scores.global - a.scores.global)
    .slice(0, 10);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0d1117",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "56px 60px",
          justifyContent: "space-between",
        }}
      >
        {/* Top row: branding */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "#7c6af0",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "18px",
                fontWeight: 900,
              }}
            >
              M
            </div>
            <span style={{ color: "#7c6af0", fontSize: "20px", fontWeight: 700 }}>
              MeilleurVille
            </span>
          </div>
          <div
            style={{
              background: "#161b22",
              border: "1px solid #30363d",
              borderRadius: "8px",
              padding: "6px 14px",
              color: "#8b949e",
              fontSize: "14px",
            }}
          >
            Classement 2025
          </div>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>
            Qualité de vie · France
          </div>
          <div style={{ color: "#f0f6fc", fontSize: "60px", fontWeight: 900, lineHeight: 1 }}>
            {`Top ${top10.length} villes`}
          </div>
          <div style={{ color: "#8b949e", fontSize: "17px" }}>
            {`Score agrégé sur 9 critères · ${CITIES_SEED.length} villes analysées`}
          </div>
        </div>

        {/* Rankings grid */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {top10.map((city, i) => {
            const color = scoreColor(city.scores.global);
            const medals = ["🥇", "🥈", "🥉"];
            return (
              <div
                key={city.slug}
                style={{
                  background: "#161b22",
                  border: `1px solid ${i < 3 ? color + "44" : "#30363d"}`,
                  borderRadius: "10px",
                  padding: "8px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: "170px",
                }}
              >
                <span style={{ fontSize: "14px" }}>{i < 3 ? medals[i] : `#${i + 1}`}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                  <span style={{ color: "#f0f6fc", fontSize: "14px", fontWeight: 700 }}>
                    {city.name}
                  </span>
                  <span style={{ color: color, fontSize: "13px", fontWeight: 700 }}>
                    {`${city.scores.global.toFixed(1)}/10`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ),
    { ...size }
  );
}
