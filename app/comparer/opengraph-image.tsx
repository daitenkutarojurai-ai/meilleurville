import { ImageResponse } from "next/og";
import { CITIES_SEED } from "@/data/cities-seed";

export const alt = "Comparer des villes françaises — MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function scoreColor(score: number): string {
  if (score >= 7.5) return "#10B981";
  if (score >= 7.0) return "#16A34A";
  if (score >= 6.0) return "#84CC16";
  if (score >= 5.0) return "#F59E0B";
  if (score >= 4.0) return "#F97316";
  return "#EF4444";
}

const POPULAR_PAIRS = [
  ["annecy", "grenoble"],
  ["nantes", "rennes"],
  ["bordeaux", "toulouse"],
  ["lyon", "grenoble"],
  ["montpellier", "marseille"],
];

export default function Image() {
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
            <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
            <span style={{ color: "#0D9488", fontSize: "20px", fontWeight: 700 }}>
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
            {`${CITIES_SEED.length} villes comparables`}
          </div>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>
            Outil de comparaison
          </div>
          <div style={{ color: "#f0f6fc", fontSize: "60px", fontWeight: 900, lineHeight: 1 }}>
            Comparez vos villes
          </div>
          <div style={{ color: "#8b949e", fontSize: "17px" }}>
            9 critères · Données réelles · Côte à côte
          </div>
        </div>

        {/* Popular pairs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {POPULAR_PAIRS.map(([slugA, slugB]) => {
            const cityA = CITIES_SEED.find((c) => c.slug === slugA);
            const cityB = CITIES_SEED.find((c) => c.slug === slugB);
            if (!cityA || !cityB) return null;
            return (
              <div
                key={`${slugA}-${slugB}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: "#161b22",
                  border: "1px solid #30363d",
                  borderRadius: "10px",
                  padding: "10px 16px",
                }}
              >
                <span style={{ color: "#f0f6fc", fontSize: "14px", fontWeight: 700, width: "120px" }}>
                  {cityA.name}
                </span>
                <span style={{ color: scoreColor(cityA.scores.global), fontSize: "13px", fontWeight: 700, width: "40px" }}>
                  {cityA.scores.global.toFixed(1)}
                </span>
                <span style={{ color: "#8b949e", fontSize: "13px", fontWeight: 800 }}>VS</span>
                <span style={{ color: "#f0f6fc", fontSize: "14px", fontWeight: 700, width: "120px" }}>
                  {cityB.name}
                </span>
                <span style={{ color: scoreColor(cityB.scores.global), fontSize: "13px", fontWeight: 700 }}>
                  {cityB.scores.global.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    ),
    { ...size }
  );
}
