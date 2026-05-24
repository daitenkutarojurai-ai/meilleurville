import { ImageResponse } from "next/og";
import { CITIES_COUNT, RANKINGS_COUNT } from "@/lib/site-stats";

export const alt = "FAQ — BestCitiesInFrance ranking methodology";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const QUESTIONS = [
  "How many cities do you cover?",
  "How are scores calculated?",
  "Is this independent?",
  "How often is data updated?",
  "Can I suggest a correction?",
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
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>{CITIES_COUNT} cities · {RANKINGS_COUNT} categories</div>
          <div style={{ color: "#f0f6fc", fontSize: "60px", fontWeight: 900, lineHeight: 1 }}>Frequently asked questions</div>
          <div style={{ color: "#8b949e", fontSize: "18px" }}>How scores work, data sources, and everything else</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {QUESTIONS.map((q) => (
            <div
              key={q}
              style={{
                background: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "8px",
                padding: "10px 18px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ color: "#0D9488", fontSize: "16px", fontWeight: 900 }}>Q</span>
              <span style={{ color: "#c9d1d9", fontSize: "15px" }}>{q}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
