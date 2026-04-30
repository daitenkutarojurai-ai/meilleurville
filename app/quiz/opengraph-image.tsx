import { ImageResponse } from "next/og";
import { CITIES_SEED } from "@/data/cities-seed";

export const alt = "Quiz de matching — Trouvez votre ville idéale | MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const top3 = [...CITIES_SEED]
    .sort((a, b) => b.scores.global - a.scores.global)
    .slice(0, 3);

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
          padding: "60px",
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
              background: "#7c6af022",
              border: "1px solid #7c6af044",
              borderRadius: "20px",
              padding: "6px 16px",
              color: "#a78bfa",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            ✨ Quiz IA · 3 minutes
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "56px", lineHeight: 1 }}>🏆</div>
          <div style={{ color: "#f0f6fc", fontSize: "60px", fontWeight: 900, lineHeight: 1.1 }}>
            Quelle ville vous ressemble ?
          </div>
          <div style={{ color: "#8b949e", fontSize: "18px", maxWidth: "600px" }}>
            6 questions · {CITIES_SEED.length} villes analysées · Résultat personnalisé
          </div>
        </div>

        {/* Profile chips */}
        <div style={{ display: "flex", gap: "12px" }}>
          {[
            { label: "👨‍👩‍👧 Famille", desc: "Écoles & sécurité" },
            { label: "💻 Remote", desc: "Fibre & coworking" },
            { label: "☀️ Soleil", desc: "Méditerranée" },
            { label: "💰 Budget", desc: "Loyers abordables" },
          ].map(({ label, desc }) => (
            <div
              key={label}
              style={{
                background: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "12px",
                padding: "12px 18px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                flex: 1,
              }}
            >
              <span style={{ color: "#f0f6fc", fontSize: "15px", fontWeight: 700 }}>{label}</span>
              <span style={{ color: "#8b949e", fontSize: "12px" }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
