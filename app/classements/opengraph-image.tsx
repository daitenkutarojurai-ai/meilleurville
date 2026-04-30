import { ImageResponse } from "next/og";
import { RANKING_META } from "@/lib/rankings";

export const alt = "Classements villes françaises 2025 — MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const rankings = Object.values(RANKING_META);

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
            {rankings.length} classements · 2025
          </div>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>
            Villes françaises
          </div>
          <div style={{ color: "#f0f6fc", fontSize: "64px", fontWeight: 900, lineHeight: 1 }}>
            Classements 2025
          </div>
          <div style={{ color: "#8b949e", fontSize: "17px" }}>
            Par style de vie · Données officielles · {rankings.length} thématiques
          </div>
        </div>

        {/* Ranking chips */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {rankings.map((r) => (
            <div
              key={r.slug}
              style={{
                background: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "20px",
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "18px" }}>{r.emoji}</span>
              <span style={{ color: "#f0f6fc", fontSize: "14px", fontWeight: 600 }}>
                {r.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
