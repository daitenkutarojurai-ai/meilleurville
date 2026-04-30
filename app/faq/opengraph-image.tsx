import { ImageResponse } from "next/og";

export const alt = "FAQ — Questions fréquentes sur MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const QUESTIONS = [
  "Comment sont calculés les scores ?",
  "Puis-je contribuer des avis ?",
  "Comment fonctionne le quiz IA ?",
  "C'est quoi l'abonnement Pro ?",
  "Comment fonctionne le comparateur ?",
  "Comment fonctionne la carte interactive ?",
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
              background: "#161b22",
              border: "1px solid #30363d",
              borderRadius: "8px",
              padding: "6px 14px",
              color: "#8b949e",
              fontSize: "14px",
            }}
          >
            meilleurville.fr/faq
          </div>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>
            Aide & Documentation
          </div>
          <div style={{ color: "#f0f6fc", fontSize: "72px", fontWeight: 900, lineHeight: 1 }}>
            Questions fréquentes
          </div>
          <div style={{ color: "#8b949e", fontSize: "17px" }}>
            Tout ce qu&apos;il faut savoir sur MeilleurVille en un seul endroit
          </div>
        </div>

        {/* Question chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {QUESTIONS.map((q) => (
            <div
              key={q}
              style={{
                background: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "8px",
                padding: "10px 16px",
                color: "#e6edf3",
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              {q}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
