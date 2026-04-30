import { ImageResponse } from "next/og";
import { CITIES_SEED } from "@/data/cities-seed";

export const alt = "Explorer les villes françaises — MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function scoreColor(score: number): string {
  if (score >= 8) return "#10b981";
  if (score >= 6) return "#f59e0b";
  return "#ef4444";
}

export default function Image() {
  const top12 = [...CITIES_SEED].sort((a, b) => b.scores.global - a.scores.global).slice(0, 12);

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
          padding: "52px 60px",
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
            <span style={{ color: "#7c6af0", fontSize: "20px", fontWeight: 700 }}>MeilleurVille</span>
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
            {CITIES_SEED.length}+ villes analysées
          </div>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>
            Toutes les villes françaises
          </div>
          <div style={{ color: "#f0f6fc", fontSize: "64px", fontWeight: 900, lineHeight: 1 }}>
            Trouvez la vôtre
          </div>
          <div style={{ color: "#8b949e", fontSize: "17px" }}>
            Scores · Avis d'habitants · Quartiers · Comparaisons
          </div>
        </div>

        {/* City grid */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {top12.map((city) => (
            <div
              key={city.slug}
              style={{
                background: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "12px",
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  color: scoreColor(city.scores.global),
                  fontSize: "15px",
                  fontWeight: 800,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {city.scores.global.toFixed(1)}
              </span>
              <span style={{ color: "#f0f6fc", fontSize: "14px", fontWeight: 600 }}>{city.name}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
