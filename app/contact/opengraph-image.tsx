import { ImageResponse } from "next/og";

export const alt = "Nous contacter — MaVilleIdeal";
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
            <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
            <span style={{ color: "#0D9488", fontSize: "20px", fontWeight: 700 }}>MaVilleIdeal</span>
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
            Données, suggestions, partenariats, erreurs — votre retour nous aide à améliorer MaVilleIdeal
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
