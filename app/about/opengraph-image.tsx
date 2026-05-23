import { ImageResponse } from "next/og";

export const alt = "À propos — MaVilleIdeal, le Glassdoor des villes françaises";
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
            <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
            <span style={{ color: "#0D9488", fontSize: "20px", fontWeight: 700 }}>MaVilleIdeal</span>
          </div>
          <div
            style={{
              background: "#1a1a3e",
              border: "1px solid #0D9488",
              borderRadius: "8px",
              padding: "6px 14px",
              color: "#2DD4BF",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Notre mission
          </div>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ color: "#2DD4BF", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>
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
