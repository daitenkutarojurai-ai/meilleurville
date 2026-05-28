import { ImageResponse } from "next/og";
import { CITIES_SEED } from "@/data/cities-seed";

export const alt = "Carte interactive des villes françaises par qualité de vie | MaVilleIdeal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

const TOP_CITIES = [...CITIES_SEED]
  .sort((a, b) => b.scores.global - a.scores.global)
  .slice(0, 8);

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0d1117 0%, #0a1f14 100%)",
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
            <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
            <span style={{ color: "#0D9488", fontSize: "20px", fontWeight: 700 }}>MaVilleIdeal</span>
          </div>
          <div
            style={{
              background: "#0a2a18",
              border: "1px solid #1e5e30",
              borderRadius: "20px",
              padding: "6px 16px",
              color: "#56d364",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            🗺️ Carte interactive
          </div>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#56d364", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>
            Visualisation qualité de vie
          </div>
          <div style={{ color: "#f0f6fc", fontSize: "68px", fontWeight: 900, lineHeight: 1 }}>
            {`${CITIES_SEED.length} villes sur la carte`}
          </div>
          <div style={{ color: "#8b949e", fontSize: "17px" }}>
            Filtrez par nature, transport, coût, sécurité, culture, télétravail
          </div>
        </div>

        {/* Top cities chips */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {TOP_CITIES.map((city) => (
            <div
              key={city.slug}
              style={{
                background: "#0d2a1a",
                border: "1px solid #1e5e30",
                borderRadius: "10px",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ color: "#f0f6fc", fontSize: "14px", fontWeight: 600 }}>{city.name}</span>
              <span
                style={{
                  background: "#56d364",
                  borderRadius: "6px",
                  padding: "2px 7px",
                  color: "#0d1117",
                  fontSize: "12px",
                  fontWeight: 800,
                }}
              >
                {city.scores.global.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
