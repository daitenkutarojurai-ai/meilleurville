import { ImageResponse } from "next/og";
import { CITIES_SEED } from "@/data/cities-seed";

export const alt = "Interactive France map — quality of life by city | BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SCORE_TIERS = [
  { label: "Exceptional", color: "#A855F7", min: 7.5 },
  { label: "Excellent", color: "#16A34A", min: 7.0 },
  { label: "Good", color: "#84CC16", min: 6.0 },
  { label: "Average", color: "#F59E0B", min: 5.0 },
  { label: "Below avg", color: "#F97316", min: 4.0 },
  { label: "Poor", color: "#EF4444", min: 0 },
];

export default function Image() {
  const total = CITIES_SEED.length;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0d1117 0%, #0f1923 100%)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "56px 64px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
          <span style={{ color: "#0D9488", fontSize: "20px", fontWeight: 700 }}>BestCitiesInFrance</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>Score-coloured</div>
          <div style={{ color: "#f0f6fc", fontSize: "60px", fontWeight: 900, lineHeight: 1 }}>France — interactive map</div>
          <div style={{ color: "#8b949e", fontSize: "18px" }}>{total} cities plotted · click any dot for quality-of-life profile</div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {SCORE_TIERS.map((tier) => (
            <div
              key={tier.label}
              style={{
                background: "#161b22",
                border: `1px solid ${tier.color}44`,
                borderRadius: "10px",
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: tier.color }} />
              <span style={{ color: "#c9d1d9", fontSize: "13px", fontWeight: 600 }}>{tier.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
