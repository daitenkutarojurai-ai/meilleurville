import { ImageResponse } from "next/og";
import { CITIES_SEED } from "@/data/cities-seed";

export const alt = "Espace presse — Données et classements des villes | MaVilleIdéale";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

const TOP3 = [...CITIES_SEED]
  .sort((a, b) => b.scores.global - a.scores.global)
  .slice(0, 3);

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0d1117 0%, #0a1628 100%)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "56px 60px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
            <span style={{ color: "#0D9488", fontSize: "20px", fontWeight: 700 }}>MaVilleIdéale</span>
          </div>
          <div
            style={{
              background: "#0a1628",
              border: "1px solid #1f3354",
              borderRadius: "8px",
              padding: "6px 14px",
              color: "#58a6ff",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Libre de reprise · CSV
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#58a6ff", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>
            Espace presse & collectivités
          </div>
          <div style={{ color: "#f0f6fc", fontSize: "64px", fontWeight: 900, lineHeight: 1 }}>
            {`${CITIES_SEED.length} villes classées, données ouvertes`}
          </div>
          <div style={{ color: "#8b949e", fontSize: "17px" }}>
            Sécurité, coût de la vie, écoles, transports — méthodologie publique, zéro classement payant
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          {TOP3.map((c, i) => (
            <div
              key={c.slug}
              style={{
                background: "#0a1628",
                border: "1px solid #1f3354",
                borderRadius: "12px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                flex: 1,
              }}
            >
              <span style={{ color: "#0D9488", fontSize: "28px", fontWeight: 900 }}>#{i + 1}</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ color: "#f0f6fc", fontSize: "18px", fontWeight: 700 }}>{c.name}</span>
                <span style={{ color: "#8b949e", fontSize: "13px" }}>{c.scores.global.toFixed(2)}/10 · {c.department}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
