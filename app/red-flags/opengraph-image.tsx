import { ImageResponse } from "next/og";

export const alt = "Red Flag Radar — Alertes et signalements communautaires | MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FLAGS = [
  { emoji: "🔊", label: "Bruit", count: "2 847 signalements" },
  { emoji: "💧", label: "Inondation", count: "1 203 signalements" },
  { emoji: "🏭", label: "Pollution", count: "934 signalements" },
  { emoji: "⚡", label: "Coupures", count: "672 signalements" },
  { emoji: "🚧", label: "Travaux", count: "1 541 signalements" },
  { emoji: "🔥", label: "Insécurité", count: "789 signalements" },
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0d1117 0%, #2a0d0d 100%)",
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
            <span style={{ color: "#0D9488", fontSize: "20px", fontWeight: 700 }}>MeilleurVille</span>
          </div>
          <div
            style={{
              background: "#2a0d0d",
              border: "1px solid #6e2d2d",
              borderRadius: "8px",
              padding: "6px 14px",
              color: "#f85149",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            ⚠ Red Flag Radar
          </div>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#f85149", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>
            Ce que l&apos;annonce immobilière ne vous dit jamais
          </div>
          <div style={{ color: "#f0f6fc", fontSize: "66px", fontWeight: 900, lineHeight: 1.05 }}>
            Signalements communautaires
          </div>
          <div style={{ color: "#8b949e", fontSize: "17px" }}>
            Bruit · Inondation · Pollution · Insécurité · Travaux · Alertes par quartier
          </div>
        </div>

        {/* Flag chips */}
        <div style={{ display: "flex", gap: "12px" }}>
          {FLAGS.map((f) => (
            <div
              key={f.label}
              style={{
                background: "#1a0808",
                border: "1px solid #6e2d2d",
                borderRadius: "12px",
                padding: "12px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                flex: 1,
              }}
            >
              <span style={{ fontSize: "20px" }}>{f.emoji}</span>
              <span style={{ color: "#f0f6fc", fontSize: "13px", fontWeight: 700 }}>{f.label}</span>
              <span style={{ color: "#f85149", fontSize: "11px" }}>{f.count}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
