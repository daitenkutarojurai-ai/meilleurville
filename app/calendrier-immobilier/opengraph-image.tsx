import { ImageResponse } from "next/og";

export const alt = "Calendrier immobilier 2026 — MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MONTHS = [
  { m: "Jan", e: "❄️" },
  { m: "Fév", e: "🌨️" },
  { m: "Mar", e: "🌷" },
  { m: "Avr", e: "🌸" },
  { m: "Mai", e: "🌼" },
  { m: "Juin", e: "☀️" },
  { m: "Juil", e: "🌞" },
  { m: "Août", e: "🏖️" },
  { m: "Sep", e: "🍂" },
  { m: "Oct", e: "🍁" },
  { m: "Nov", e: "🌧️" },
  { m: "Déc", e: "🎄" },
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
            meilleurville.fr/calendrier-immobilier
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>
            Calendrier 2026
          </div>
          <div style={{ display: "flex", flexDirection: "column", color: "#f0f6fc", fontSize: "64px", fontWeight: 900, lineHeight: 1.05 }}>
            <span>Quand acheter, vendre,</span>
            <span>louer, déménager ?</span>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {MONTHS.map((mo) => (
            <div
              key={mo.m}
              style={{
                background: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "8px",
                padding: "8px 14px",
                color: "#e6edf3",
                fontSize: "14px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>{mo.e}</span>
              <span>{mo.m}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
