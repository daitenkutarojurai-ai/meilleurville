import { ImageResponse } from "next/og";

export const alt = "Nous contacter — MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CONTACT_ITEMS = [
  { emoji: "💬", label: "Question sur les données" },
  { emoji: "🏙️", label: "Suggérer une ville" },
  { emoji: "📖", label: "Proposer un guide" },
  { emoji: "🤝", label: "Partenariat" },
  { emoji: "🐛", label: "Signaler une erreur" },
  { emoji: "✨", label: "Demande fonctionnalité" },
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
            Contactez-nous
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>
            Une question ?
          </div>
          <div style={{ color: "#f0f6fc", fontSize: "64px", fontWeight: 900, lineHeight: 1 }}>
            On vous répond
          </div>
          <div style={{ color: "#8b949e", fontSize: "17px" }}>
            Données, suggestions, partenariats, erreurs — votre retour nous aide à améliorer MeilleurVille
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {CONTACT_ITEMS.map(({ emoji, label }) => (
            <div
              key={label}
              style={{
                background: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "20px",
                padding: "10px 18px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "18px" }}>{emoji}</span>
              <span style={{ color: "#f0f6fc", fontSize: "14px", fontWeight: 600 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
