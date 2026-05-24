import { ImageResponse } from "next/og";
import { CITIES_COUNT } from "@/lib/site-stats";

export const alt = "Employment and job market rankings by French city | BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const METRICS = [
  { emoji: "📈", label: "Job market dynamism" },
  { emoji: "💻", label: "Remote-work fit" },
  { emoji: "🎓", label: "University cluster" },
  { emoji: "🏭", label: "Industrial base" },
  { emoji: "📉", label: "Unemployment rate" },
  { emoji: "💰", label: "Salary levels" },
];

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
          padding: "56px 64px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
          <span style={{ color: "#0D9488", fontSize: "20px", fontWeight: 700 }}>BestCitiesInFrance</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>INSEE · Pôle Emploi data</div>
          <div style={{ color: "#f0f6fc", fontSize: "56px", fontWeight: 900, lineHeight: 1 }}>Employment & job market</div>
          <div style={{ color: "#8b949e", fontSize: "18px" }}>Which {CITIES_COUNT} cities have the strongest job markets — and which are declining</div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {METRICS.map((m) => (
            <div
              key={m.label}
              style={{
                background: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "10px",
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "16px" }}>{m.emoji}</span>
              <span style={{ color: "#c9d1d9", fontSize: "13px", fontWeight: 600 }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
