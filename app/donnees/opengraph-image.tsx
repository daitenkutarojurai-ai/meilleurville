import { ImageResponse } from "next/og";
import { CITIES_SEED } from "@/data/cities-seed";

export const alt = "Données & Sources — Transparence totale | MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SOURCES = [
  { name: "INSEE", desc: "Données démographiques & emploi", badge: "Officiel" },
  { name: "Open Data", desc: "Équipements, transports, infractions", badge: "Public" },
  { name: "Open-Meteo", desc: "Météo historique et prévisions", badge: "Live" },
  { name: "OpenStreetMap", desc: "Parcs, pistes cyclables, commerces", badge: "Communauté" },
];

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
              background: "#0a1628",
              border: "1px solid #1f3354",
              borderRadius: "8px",
              padding: "6px 14px",
              color: "#58a6ff",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            100% open data
          </div>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#58a6ff", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>
            Transparence totale
          </div>
          <div style={{ color: "#f0f6fc", fontSize: "68px", fontWeight: 900, lineHeight: 1 }}>
            {CITIES_SEED.length} villes · sources documentées
          </div>
          <div style={{ color: "#8b949e", fontSize: "17px" }}>
            Toutes nos sources sont publiques, vérifiables et téléchargeables en CSV
          </div>
        </div>

        {/* Source chips */}
        <div style={{ display: "flex", gap: "12px" }}>
          {SOURCES.map((s) => (
            <div
              key={s.name}
              style={{
                background: "#0a1628",
                border: "1px solid #1f3354",
                borderRadius: "12px",
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                flex: 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "#f0f6fc", fontSize: "15px", fontWeight: 700 }}>{s.name}</span>
                <span
                  style={{
                    background: "#1f3354",
                    borderRadius: "6px",
                    padding: "2px 8px",
                    color: "#58a6ff",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  {s.badge}
                </span>
              </div>
              <span style={{ color: "#8b949e", fontSize: "12px" }}>{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
