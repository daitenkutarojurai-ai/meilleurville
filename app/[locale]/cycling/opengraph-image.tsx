import { ImageResponse } from "next/og";
import { CITIES_COUNT } from "@/lib/site-stats";

export const alt = "Cycling infrastructure rankings by French city | BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const METRICS = [
  { emoji: "🛣️", label: "Bike path density" },
  { emoji: "🚲", label: "Bike-share system" },
  { emoji: "⛰️", label: "Terrain (flat?)" },
  { emoji: "📦", label: "Cargo bike use" },
  { emoji: "🚦", label: "Car-free zones" },
  { emoji: "🔒", label: "Parking security" },
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
          <span style={{ color: "#0D9488", fontSize: "20px", fontWeight: 700 }}>BestCitiesInFrance</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#6ee7b7", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>CEREMA · Baromètre vélo data</div>
          <div style={{ color: "#f0f6fc", fontSize: "58px", fontWeight: 900, lineHeight: 1 }}>Cycling rankings</div>
          <div style={{ color: "#8b949e", fontSize: "18px" }}>Best cities for car-free living — bike paths, terrain, and infrastructure</div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {METRICS.map((m) => (
            <div key={m.label} style={{ background: "#0a1a0f", border: "1px solid #16a34a22", borderRadius: "10px", padding: "8px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px" }}>{m.emoji}</span>
              <span style={{ color: "#6ee7b7", fontSize: "13px", fontWeight: 600 }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
