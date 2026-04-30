import { ImageResponse } from "next/og";

export const alt = "Méthodologie — Comment MeilleurVille calcule ses scores";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CRITERIA = [
  { emoji: "🌿", label: "Nature", desc: "Parcs, forêts, altitude" },
  { emoji: "🚇", label: "Transport", desc: "TGV, métro, vélo" },
  { emoji: "💶", label: "Coût", desc: "Loyers, prix m²" },
  { emoji: "🔒", label: "Sécurité", desc: "Statistiques INSEE" },
  { emoji: "🎭", label: "Culture", desc: "Musées, festivals" },
  { emoji: "💻", label: "Télétravail", desc: "Fibre, coworking" },
  { emoji: "🎓", label: "Écoles", desc: "Résultats, offre" },
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0d1117 0%, #0d2a1a 100%)",
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
              background: "#0d2a1a",
              border: "1px solid #1e4d2b",
              borderRadius: "8px",
              padding: "6px 14px",
              color: "#56d364",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Transparence totale
          </div>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#56d364", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>
            Méthodologie publique
          </div>
          <div style={{ color: "#f0f6fc", fontSize: "68px", fontWeight: 900, lineHeight: 1 }}>
            Comment on calcule les scores
          </div>
          <div style={{ color: "#8b949e", fontSize: "17px" }}>
            Données INSEE · Open Data · Avis vérifiés d&apos;habitants · 7 critères pondérés
          </div>
        </div>

        {/* Criteria chips */}
        <div style={{ display: "flex", gap: "10px" }}>
          {CRITERIA.map((c) => (
            <div
              key={c.label}
              style={{
                background: "#0d1f14",
                border: "1px solid #1e4d2b",
                borderRadius: "12px",
                padding: "12px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                flex: 1,
              }}
            >
              <span style={{ fontSize: "20px" }}>{c.emoji}</span>
              <span style={{ color: "#f0f6fc", fontSize: "13px", fontWeight: 700 }}>{c.label}</span>
              <span style={{ color: "#56d364", fontSize: "11px" }}>{c.desc}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
