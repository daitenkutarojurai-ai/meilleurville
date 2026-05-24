import { ImageResponse } from "next/og";
import { CITIES_COUNT } from "@/lib/site-stats";

export const alt = "Plan your French vacation — best cities by month & activity | BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ACTIVITIES = [
  { emoji: "🏖️", label: "Beach" },
  { emoji: "⛷️", label: "Ski" },
  { emoji: "🏙️", label: "City trip" },
  { emoji: "🏄", label: "Surf" },
  { emoji: "🍷", label: "Wine" },
  { emoji: "🥾", label: "Hiking" },
  { emoji: "👨‍👩‍👧", label: "Family" },
  { emoji: "🌿", label: "Nature" },
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0d1117 0%, #0a1a12 100%)",
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
          <div style={{ background: "#0a2a1a", border: "1px solid #16a34a30", borderRadius: "8px", padding: "6px 14px", color: "#16a34a", fontSize: "14px" }}>
            {CITIES_COUNT} destinations
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#16a34a", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>Vacation planner</div>
          <div style={{ color: "#f0f6fc", fontSize: "60px", fontWeight: 900, lineHeight: 1 }}>Holiday in France</div>
          <div style={{ color: "#8b949e", fontSize: "18px" }}>Best cities by month, activity, and profile — honest picks, no postcards</div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {ACTIVITIES.map((act) => (
            <div
              key={act.label}
              style={{
                background: "#0a1a0f",
                border: "1px solid #16a34a22",
                borderRadius: "10px",
                padding: "10px 14px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                flex: 1,
              }}
            >
              <span style={{ fontSize: "20px" }}>{act.emoji}</span>
              <span style={{ color: "#6ee7b7", fontSize: "12px", fontWeight: 600 }}>{act.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
