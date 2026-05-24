import { ImageResponse } from "next/og";
import { CITIES_SEED } from "@/data/cities-seed";

export const alt = "Red Flag Radar — city risks 2026 | BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FLAGS = [
  { emoji: "🛡️", label: "Safety" },
  { emoji: "🌊", label: "Flooding" },
  { emoji: "🌡️", label: "Heat waves" },
  { emoji: "💨", label: "Pollution" },
  { emoji: "🏚️", label: "Housing stress" },
  { emoji: "🔇", label: "Noise" },
  { emoji: "🌋", label: "Seismic risk" },
  { emoji: "💸", label: "Cost trap" },
];

export default function Image() {
  const highRisk = CITIES_SEED.filter((c) => c.scores.safety < 4.5 || c.scores.cost < 4.5).length;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0d1117 0%, #1a0a0a 100%)",
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
          <div style={{ background: "#2d0a0a", border: "1px solid #ef444430", borderRadius: "8px", padding: "6px 14px", color: "#ef4444", fontSize: "14px", fontWeight: 600 }}>
            ⚠ {highRisk} cities flagged
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#ef4444", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>What listings never tell you</div>
          <div style={{ color: "#f0f6fc", fontSize: "58px", fontWeight: 900, lineHeight: 1 }}>Red Flag Radar</div>
          <div style={{ color: "#8b949e", fontSize: "18px" }}>Safety · flooding · heat · pollution · seismic risk · cost traps — open data, all cities</div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {FLAGS.map((f) => (
            <div
              key={f.label}
              style={{
                background: "#1a0a0a",
                border: "1px solid #ef444422",
                borderRadius: "10px",
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span style={{ fontSize: "16px" }}>{f.emoji}</span>
              <span style={{ color: "#fca5a5", fontSize: "13px", fontWeight: 600 }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
