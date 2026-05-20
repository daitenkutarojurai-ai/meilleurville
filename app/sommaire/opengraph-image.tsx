import { ImageResponse } from "next/og";
import { CITIES_COUNT, GUIDES_COUNT, TAGS_COUNT, RANKINGS_COUNT, REGIONS_COUNT } from "@/lib/site-stats";

export const alt = "Sommaire — Index complet MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STATS = [
  `${CITIES_COUNT} villes`,
  `${GUIDES_COUNT} guides`,
  `${TAGS_COUNT} tags`,
  `${RANKINGS_COUNT} classements`,
  `${REGIONS_COUNT} régions`,
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0d1117 0%, #1a1040 100%)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "56px 60px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
            <span style={{ color: "#0D9488", fontSize: "20px", fontWeight: 700 }}>MeilleurVille</span>
          </div>
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "6px 14px", color: "#8b949e", fontSize: "14px" }}>mavilleideale.fr/sommaire</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>Sommaire</div>
          <div style={{ color: "#f0f6fc", fontSize: "72px", fontWeight: 900, lineHeight: 1 }}>Index complet</div>
          <div style={{ color: "#8b949e", fontSize: "17px" }}>Toutes les villes, guides et classements en une page</div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {STATS.map((s) => (
            <div key={s} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "10px 16px", color: "#e6edf3", fontSize: "14px", fontWeight: 600 }}>
              {s}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
