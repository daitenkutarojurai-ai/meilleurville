import { ImageResponse } from "next/og";

export const alt = "À propos — MeilleurVille, le Glassdoor des villes françaises";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const VALUES = [
  { emoji: "🔍", label: "Honnêteté radicale" },
  { emoji: "📐", label: "Transparence" },
  { emoji: "🌍", label: "Données réelles" },
  { emoji: "👥", label: "Community-first" },
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0d1117 0%, #1a1a2e 100%)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "56px 60px",
          justifyContent: "space-between",
        }}
      >
        {/* Branding */}
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
              background: "#1a1a3e",
              border: "1px solid #7c6af0",
              borderRadius: "8px",
              padding: "6px 14px",
              color: "#a78bfa",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Notre mission
          </div>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ color: "#a78bfa", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>
            À propos
          </div>
          <div style={{ color: "#f0f6fc", fontSize: "58px", fontWeight: 900, lineHeight: 1.1, maxWidth: "800px" }}>
            Vous aider à trouver la ville faite pour vous
          </div>
          <div style={{ color: "#8b949e", fontSize: "20px", maxWidth: "700px" }}>
            Le Glassdoor des villes françaises — données réelles, avis honnêtes, aucune langue de bois
          </div>
        </div>

        {/* Values */}
        <div style={{ display: "flex", gap: "12px" }}>
          {VALUES.map((v) => (
            <div
              key={v.label}
              style={{
                background: "#1a1a2e",
                border: "1px solid #2d2d5e",
                borderRadius: "12px",
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flex: 1,
              }}
            >
              <span style={{ fontSize: "22px" }}>{v.emoji}</span>
              <span style={{ color: "#e6edf3", fontSize: "14px", fontWeight: 700 }}>{v.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
