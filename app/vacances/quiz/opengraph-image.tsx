import { ImageResponse } from "next/og";

export const alt = "Quiz vacances en France — 5 questions, 3 destinations · MaVilleIdeal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STEPS = ["Mois", "Activité", "Profil", "Budget", "Durée"];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(ellipse 70% 60% at 30% 25%, #ccfbf1 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 75% 80%, #fef9c3 0%, transparent 55%), #ffffff",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "60px 64px",
          justifyContent: "space-between",
        }}
      >
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
            ✨ Quiz vacances
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ color: "#0D9488", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700 }}>
            5 questions · 3 destinations
          </div>
          <div style={{ color: "#0F172A", fontSize: "80px", fontWeight: 900, lineHeight: 0.95 }}>
            Où partir cet été ?
          </div>
          <div style={{ color: "#475569", fontSize: "20px", marginTop: "8px" }}>
            Sélection data-driven en moins d&apos;une minute · Booking CTA après
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          {STEPS.map((s, i) => (
            <div
              key={s}
              style={{
                background: "#ffffff",
                border: i === 0 ? "2px solid #0D9488" : "1px solid rgba(15,23,42,0.12)",
                borderRadius: "14px",
                padding: "14px 18px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                flex: 1,
              }}
            >
              <span style={{ color: "#64748B", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", fontWeight: 700 }}>
                Étape {i + 1}
              </span>
              <span style={{ color: "#0F172A", fontSize: "17px", fontWeight: 700 }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
