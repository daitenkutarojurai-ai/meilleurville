import { ImageResponse } from "next/og";
import { CITIES_SEED } from "@/data/cities-seed";

export const alt = "Villes par région — MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const REGION_EMOJIS: Record<string, string> = {
  "Auvergne-Rhône-Alpes": "⛰️",
  "Pays de la Loire": "🌊",
  "Bretagne": "⚓",
  "Nouvelle-Aquitaine": "🍷",
  "Occitanie": "☀️",
  "Normandie": "🏰",
  "Bourgogne-Franche-Comté": "🍇",
  "Centre-Val de Loire": "🏯",
  "Hauts-de-France": "🌾",
  "Provence-Alpes-Côte d'Azur": "🌺",
  "Grand Est": "🥨",
  "Île-de-France": "🗼",
  "Corse": "🏝️",
};

export default function Image() {
  const regionMap = new Map<string, number>();
  CITIES_SEED.forEach((c) => {
    regionMap.set(c.region, (regionMap.get(c.region) ?? 0) + 1);
  });
  const regions = Array.from(regionMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

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
            {regionMap.size} régions · {CITIES_SEED.length} villes
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>
            Explorer par région
          </div>
          <div style={{ color: "#f0f6fc", fontSize: "64px", fontWeight: 900, lineHeight: 1 }}>
            Les régions françaises
          </div>
          <div style={{ color: "#8b949e", fontSize: "17px" }}>
            Comparez les villes et scores par territoire
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {regions.map(([region, count]) => (
            <div
              key={region}
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
              <span style={{ fontSize: "16px" }}>{REGION_EMOJIS[region] ?? "📍"}</span>
              <span style={{ color: "#f0f6fc", fontSize: "13px", fontWeight: 600 }}>{region.split("-")[0].trim()}</span>
              <span style={{ color: "#8b949e", fontSize: "12px" }}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
