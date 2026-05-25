import { ImageResponse } from "next/og";
import { CITIES_SEED } from "@/data/cities-seed";

export const alt =
  "Projection 5 ans — où devrais-je vivre dans 5 ans ? · MaVilleIdéale";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TRAJECTORY_CHIPS = [
  { emoji: "👨‍👩‍👧", label: "Famille" },
  { emoji: "🏠", label: "Télétravail" },
  { emoji: "🌅", label: "Retraite" },
  { emoji: "💻", label: "Freelance" },
  { emoji: "🏡", label: "Achat immo" },
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(ellipse 75% 65% at 20% 25%, #fef3c7 0%, transparent 55%), radial-gradient(ellipse 65% 55% at 85% 75%, #ffe4e6 0%, transparent 50%), #ffffff",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "60px 64px",
          justifyContent: "space-between",
        }}
      >
        {/* Branding */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="36" height="36" viewBox="0 0 32 32">
              <rect width="32" height="32" rx="7" fill="#0D9488" />
              <path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" />
              <circle cx="16" cy="13" r="3.5" fill="#0D9488" />
            </svg>
            <span style={{ color: "#0F172A", fontSize: "22px", fontWeight: 700 }}>
              Meilleur<span style={{ color: "#0D9488" }}>Ville</span>
            </span>
          </div>
          <div
            style={{
              background: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.35)",
              borderRadius: "999px",
              padding: "8px 18px",
              color: "#B45309",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            🔭 Projection 5 ans
          </div>
        </div>

        {/* Title block */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              color: "#B45309",
              fontSize: "15px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Trajectoire · Famille · Carrière · Climat 2040
          </div>
          <div
            style={{
              color: "#0F172A",
              fontSize: "64px",
              fontWeight: 900,
              lineHeight: 1.05,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Votre vie idéale</span>
            <span>dans 5 ans</span>
          </div>
          <div style={{ color: "#475569", fontSize: "20px", marginTop: "4px" }}>
            {`${CITIES_SEED.length} villes · risque climatique 2040 · famille · budget · télétravail`}
          </div>
        </div>

        {/* Trajectory chips */}
        <div style={{ display: "flex", gap: "10px" }}>
          {TRAJECTORY_CHIPS.map((chip) => (
            <div
              key={chip.label}
              style={{
                background: "#ffffff",
                border: "1px solid rgba(15,23,42,0.12)",
                borderRadius: "16px",
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flex: 1,
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "20px" }}>{chip.emoji}</span>
              <span style={{ color: "#0F172A", fontSize: "14px", fontWeight: 600 }}>
                {chip.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
