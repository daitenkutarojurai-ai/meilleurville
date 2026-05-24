import { ImageResponse } from "next/og";
import { CITIES_COUNT } from "@/lib/site-stats";

export const alt = "City Vibe — live atmosphere by French city | BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const VIBE_SIGNALS = [
  { emoji: "🌤️", label: "Live weather" },
  { emoji: "💨", label: "Air quality now" },
  { emoji: "🎉", label: "Events today" },
  { emoji: "🚦", label: "Traffic load" },
  { emoji: "🔇", label: "Noise level" },
  { emoji: "🏖️", label: "Crowding" },
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
          padding: "56px 64px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
            <span style={{ color: "#0D9488", fontSize: "20px", fontWeight: 700 }}>BestCitiesInFrance</span>
          </div>
          <div style={{ background: "#161b22", border: "1px solid #a855f730", borderRadius: "8px", padding: "6px 14px", color: "#c4b5fd", fontSize: "14px" }}>
            Live · {CITIES_COUNT} cities
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#c4b5fd", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>Real-time signals</div>
          <div style={{ color: "#f0f6fc", fontSize: "60px", fontWeight: 900, lineHeight: 1 }}>City Vibe Map</div>
          <div style={{ color: "#8b949e", fontSize: "18px" }}>Weather + air quality + events + traffic — what each city feels like right now</div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {VIBE_SIGNALS.map((s) => (
            <div
              key={s.label}
              style={{
                background: "#161b22",
                border: "1px solid #a855f722",
                borderRadius: "10px",
                padding: "10px 14px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                flex: 1,
              }}
            >
              <span style={{ fontSize: "20px" }}>{s.emoji}</span>
              <span style={{ color: "#c4b5fd", fontSize: "12px", fontWeight: 600 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
