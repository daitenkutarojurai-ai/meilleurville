import { ImageResponse } from "next/og";

export const alt = "Red flag themes — city archetypes to avoid in France 2026 | BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const THEMES = [
  { icon: "🏭", label: "Shrinking industrial towns" },
  { icon: "🌊", label: "Coastal tourist traps" },
  { icon: "🚗", label: "Car-dependent suburbs" },
  { icon: "💸", label: "Overpriced for what they offer" },
  { icon: "🏚️", label: "Hidden renovation costs" },
  { icon: "📉", label: "Population decline zones" },
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0d1117 0%, #1a0808 100%)",
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
          <div style={{ color: "#f87171", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>City archetypes to avoid</div>
          <div style={{ color: "#f0f6fc", fontSize: "56px", fontWeight: 900, lineHeight: 1 }}>Red flag themes</div>
          <div style={{ color: "#8b949e", fontSize: "18px" }}>City patterns that look good on paper but disappoint in practice</div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {THEMES.map((t) => (
            <div key={t.label} style={{ background: "#1a0808", border: "1px solid #ef444422", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px" }}>{t.icon}</span>
              <span style={{ color: "#fca5a5", fontSize: "13px", fontWeight: 600 }}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
