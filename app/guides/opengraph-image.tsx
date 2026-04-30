import { ImageResponse } from "next/og";
import { GUIDES, GUIDE_CATEGORIES } from "@/data/guides";

export const alt = "Guides pour bien choisir sa ville — MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          padding: "56px 60px",
          justifyContent: "space-between",
        }}
      >
        {/* Top row: branding */}
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
            <span style={{ color: "#7c6af0", fontSize: "20px", fontWeight: 700 }}>
              MeilleurVille
            </span>
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
            meilleurville.fr/guides
          </div>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>
            Bien choisir sa ville en France
          </div>
          <div style={{ color: "#f0f6fc", fontSize: "72px", fontWeight: 900, lineHeight: 1 }}>
            {GUIDES.length} guides
          </div>
          <div style={{ color: "#8b949e", fontSize: "17px" }}>
            Analyses honnêtes · Données réelles · Sans langue de bois
          </div>
        </div>

        {/* Category chips */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {GUIDE_CATEGORIES.map((cat) => {
            const count = GUIDES.filter((g) => g.category === cat.id).length;
            return (
              <div
                key={cat.id}
                style={{
                  background: "#161b22",
                  border: "1px solid #30363d",
                  borderRadius: "12px",
                  padding: "12px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "22px" }}>{cat.emoji}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ color: "#f0f6fc", fontSize: "14px", fontWeight: 700 }}>
                    {cat.label}
                  </span>
                  <span style={{ color: "#8b949e", fontSize: "12px" }}>
                    {count} guide{count > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ),
    { ...size }
  );
}
