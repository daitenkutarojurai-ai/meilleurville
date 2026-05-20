import { ImageResponse } from "next/og";
import { CITIES_SEED } from "@/data/cities-seed";

export const alt = "Où partir en vacances en France — guide mois par mois · MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MONTHS_QUICK = [
  { label: "Jan", tag: "ski" },
  { label: "Mar", tag: "citytrip" },
  { label: "Mai", tag: "vignobles" },
  { label: "Juil", tag: "plage" },
  { label: "Sep", tag: "best" },
  { label: "Déc", tag: "marchés" },
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(ellipse 80% 70% at 25% 30%, #cffafe 0%, transparent 60%), radial-gradient(ellipse 70% 60% at 80% 70%, #fef3c7 0%, transparent 55%), #ffffff",
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
            <svg width="36" height="36" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
            <span style={{ color: "#0F172A", fontSize: "22px", fontWeight: 700 }}>
              Meilleur<span style={{ color: "#0D9488" }}>Ville</span>
            </span>
          </div>
          <div
            style={{
              background: "rgba(13,148,136,0.10)",
              border: "1px solid rgba(13,148,136,0.30)",
              borderRadius: "999px",
              padding: "8px 18px",
              color: "#0D9488",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            🌴 Vacances en France
          </div>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ color: "#0D9488", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700 }}>
            Le bon mois · La bonne destination
          </div>
          <div style={{ color: "#0F172A", fontSize: "72px", fontWeight: 900, lineHeight: 1.0 }}>
            Où partir en France ?
          </div>
          <div style={{ color: "#475569", fontSize: "20px", marginTop: "6px" }}>
            {`${CITIES_SEED.length} villes classées · climat · activité · affluence · budget`}
          </div>
        </div>

        {/* Month chips */}
        <div style={{ display: "flex", gap: "10px" }}>
          {MONTHS_QUICK.map((m) => (
            <div
              key={m.label}
              style={{
                background: "#ffffff",
                border: "1px solid rgba(15,23,42,0.12)",
                borderRadius: "14px",
                padding: "12px 18px",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                flex: 1,
              }}
            >
              <span style={{ color: "#0F172A", fontSize: "15px", fontWeight: 700 }}>{m.label}</span>
              <span style={{ color: "#64748B", fontSize: "12px" }}>{m.tag}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
