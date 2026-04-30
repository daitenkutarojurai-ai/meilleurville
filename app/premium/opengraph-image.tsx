import { ImageResponse } from "next/og";

export const alt = "MeilleurVille Pro — Rapport IA personnalisé pour votre déménagement";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FEATURES = [
  { emoji: "📊", label: "Rapport PDF IA", desc: "Analyse sur mesure" },
  { emoji: "🚩", label: "Red Flag Radar", desc: "Alertes personnalisées" },
  { emoji: "🗺️", label: "Quartiers Pro", desc: "Profils détaillés" },
  { emoji: "📥", label: "Export CSV", desc: "Toutes vos données" },
  { emoji: "⚡", label: "Alertes", desc: "Nouvelles villes sauvées" },
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0d1117 0%, #1a0d30 100%)",
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
              background: "linear-gradient(90deg, #7c6af0, #a78bfa)",
              borderRadius: "20px",
              padding: "6px 20px",
              color: "white",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            ✦ PRO
          </div>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ color: "#a78bfa", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>
            Essai 7 jours gratuit
          </div>
          <div style={{ color: "#f0f6fc", fontSize: "64px", fontWeight: 900, lineHeight: 1.05 }}>
            Trouvez votre ville idéale — avec certitude
          </div>
          <div style={{ color: "#8b949e", fontSize: "17px" }}>
            Rapport IA complet · Red Flags · Comparaisons illimitées · Export données
          </div>
        </div>

        {/* Feature chips */}
        <div style={{ display: "flex", gap: "12px" }}>
          {FEATURES.map((f) => (
            <div
              key={f.label}
              style={{
                background: "#1a0d30",
                border: "1px solid #3d2d6e",
                borderRadius: "12px",
                padding: "14px 18px",
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                flex: 1,
              }}
            >
              <span style={{ fontSize: "22px" }}>{f.emoji}</span>
              <span style={{ color: "#f0f6fc", fontSize: "14px", fontWeight: 700 }}>{f.label}</span>
              <span style={{ color: "#a78bfa", fontSize: "12px" }}>{f.desc}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
