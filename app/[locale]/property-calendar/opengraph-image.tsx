import { ImageResponse } from "next/og";

export const alt = "French property purchase calendar — when to buy in France 2026 | BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STEPS = [
  { month: "Jan–Feb", label: "Slowest market — negotiate" },
  { month: "Mar–Apr", label: "Listings spike" },
  { month: "May–Jun", label: "Peak demand" },
  { month: "Jul–Aug", label: "Vendors motivated" },
  { month: "Sep–Oct", label: "Second peak" },
  { month: "Nov–Dec", label: "Best prices" },
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
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>Timing the French market</div>
          <div style={{ color: "#f0f6fc", fontSize: "54px", fontWeight: 900, lineHeight: 1 }}>Property purchase calendar</div>
          <div style={{ color: "#8b949e", fontSize: "18px" }}>When to search, offer, and sign — by season and by city type</div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {STEPS.map((s, i) => (
            <div key={s.month} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "10px", padding: "10px 14px", display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: "160px" }}>
              <span style={{ color: i === 0 || i === 5 ? "#16A34A" : "#8b949e", fontSize: "12px", fontWeight: 700, textTransform: "uppercase" }}>{s.month}</span>
              <span style={{ color: "#c9d1d9", fontSize: "13px" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
