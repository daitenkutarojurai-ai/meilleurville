import { ImageResponse } from "next/og";
import { CITIES_SEED } from "@/data/cities-seed";

export const alt = "Quiz de matching — Trouvez votre ville idéale | MaVilleIdeal";
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
          padding: "60px",
          justifyContent: "space-between",
        }}
      >
        {/* Top row: branding */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
            <span style={{ color: "#0D9488", fontSize: "20px", fontWeight: 700 }}>
              MaVilleIdeal
            </span>
          </div>
          <div
            style={{
              background: "#0D948822",
              border: "1px solid #0D948844",
              borderRadius: "20px",
              padding: "6px 16px",
              color: "#2DD4BF",
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
            {`6 questions · ${CITIES_SEED.length} villes analysées · Résultat personnalisé`}
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
