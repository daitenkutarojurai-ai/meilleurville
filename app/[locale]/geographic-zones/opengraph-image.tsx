import { ImageResponse } from "next/og";

export const alt = "France geographic zones — Mediterranean, Atlantic, Alpine, Northern | BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ZONES = [
  { emoji: "🌊", label: "Mediterranean", note: "Hot summers, 2700+ sun hours" },
  { emoji: "🌧️", label: "Atlantic", note: "Mild, oceanic, surf culture" },
  { emoji: "⛰️", label: "Alpine", note: "Ski, trail, fresh air" },
  { emoji: "🌾", label: "Northern plains", note: "Flat, connected, industrial" },
  { emoji: "🌲", label: "Massif Central", note: "Volcanic, rural, affordable" },
  { emoji: "🍷", label: "Southwest", note: "Wine, Pyrenees, Atlantic" },
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
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>Climate · landscape · lifestyle</div>
          <div style={{ color: "#f0f6fc", fontSize: "56px", fontWeight: 900, lineHeight: 1 }}>Geographic zones</div>
          <div style={{ color: "#8b949e", fontSize: "18px" }}>France by climate zone — cities grouped by landscape and lifestyle</div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {ZONES.map((z) => (
            <div key={z.label} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "10px", padding: "10px 16px", display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: "170px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "16px" }}>{z.emoji}</span>
                <span style={{ color: "#f0f6fc", fontSize: "14px", fontWeight: 700 }}>{z.label}</span>
              </div>
              <span style={{ color: "#8b949e", fontSize: "12px" }}>{z.note}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
