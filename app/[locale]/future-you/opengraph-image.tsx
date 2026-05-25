import { ImageResponse } from "next/og";

export const alt = "Future You — simulate your life in another French city | BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const OUTPUTS = [
  { icon: "💶", label: "Monthly leftover", value: "€ after rent + tax" },
  { icon: "⏰", label: "Free hours / week", value: "commute factored in" },
  { icon: "🧘", label: "Stress score", value: "safety + density + transit" },
  { icon: "🌤️", label: "Climate match", value: "vs your ideal weather" },
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0d1117 0%, #1a1229 100%)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "60px 72px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <svg width="36" height="36" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
          <span style={{ color: "#0D9488", fontSize: "22px", fontWeight: 700 }}>BestCitiesInFrance</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              background: "rgba(251, 191, 36, 0.15)",
              border: "1px solid rgba(251, 191, 36, 0.4)",
              borderRadius: "999px",
              padding: "8px 20px",
              color: "#fbbf24",
              fontSize: "16px",
              fontWeight: 600,
              width: "auto", alignSelf: "flex-start",
            }}
          >
            ✨ Life Simulator
          </div>
          <div style={{ color: "#f0f6fc", fontSize: "58px", fontWeight: 900, lineHeight: 1.05, maxWidth: "800px" }}>
            Your life in another city — in numbers
          </div>
          <div style={{ color: "#8b949e", fontSize: "22px", maxWidth: "640px" }}>
            Salary · household · lifestyle → honest projection for your top 3 cities
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          {OUTPUTS.map((o) => (
            <div
              key={o.label}
              style={{
                background: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "12px",
                padding: "14px 18px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                flex: 1,
              }}
            >
              <span style={{ fontSize: "22px" }}>{o.icon}</span>
              <span style={{ color: "#f0f6fc", fontSize: "14px", fontWeight: 700 }}>{o.label}</span>
              <span style={{ color: "#8b949e", fontSize: "12px" }}>{o.value}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
