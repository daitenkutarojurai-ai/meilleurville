import { ImageResponse } from "next/og";

export const alt = "Recherche globale — MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
            <div style={{ width: "32px", height: "32px", background: "#7c6af0", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "18px", fontWeight: 900 }}>M</div>
            <span style={{ color: "#7c6af0", fontSize: "20px", fontWeight: 700 }}>MeilleurVille</span>
          </div>
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "6px 14px", color: "#8b949e", fontSize: "14px" }}>meilleurville.fr/recherche</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>Recherche</div>
          <div style={{ color: "#f0f6fc", fontSize: "84px", fontWeight: 900, lineHeight: 1 }}>Tout chercher</div>
          <div style={{ color: "#8b949e", fontSize: "17px" }}>Villes, guides, tags, glossaire — une seule barre</div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "12px",
            padding: "16px 22px",
            color: "#8b949e",
            fontSize: "20px",
          }}
        >
          <span style={{ fontSize: "24px" }}>🔍</span>
          <span>Ville, guide, thème, terme...</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
