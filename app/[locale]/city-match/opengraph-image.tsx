import { ImageResponse } from "next/og";

export const alt = "City Match — find your perfect French city | BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0d1117 0%, #1a1f2e 100%)",
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
              background: "rgba(236, 72, 153, 0.15)",
              border: "1px solid rgba(236, 72, 153, 0.4)",
              borderRadius: "999px",
              padding: "8px 20px",
              color: "#f9a8d4",
              fontSize: "16px",
              fontWeight: 600,
              width: "auto", alignSelf: "flex-start",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            City Match
          </div>
          <div style={{ color: "#f0f6fc", fontSize: "62px", fontWeight: 900, lineHeight: 1.05, maxWidth: "820px" }}>
            Which French city fits your life?
          </div>
          <div style={{ color: "#8b949e", fontSize: "22px", maxWidth: "640px", lineHeight: 1.4 }}>
            8 questions · 90 seconds · live ranking as you answer · shareable result
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          {["Budget", "Climate", "Safety", "Remote work", "Family", "Nature", "Culture", "Mobility"].map((tag) => (
            <div
              key={tag}
              style={{
                background: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "8px",
                padding: "8px 16px",
                color: "#c9d1d9",
                fontSize: "15px",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
