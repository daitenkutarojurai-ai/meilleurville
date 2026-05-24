import { ImageResponse } from "next/og";

export const alt = "Tools · Quiz, map, rankings, calculator | BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TOOLS = [
  { emoji: "🌸", title: "City Match", desc: "8 questions, your top 3 cities" },
  { emoji: "✨", title: "Future You", desc: "Simulate your life in numbers" },
  { emoji: "👥", title: "People Like You", desc: "Where profiles like yours move" },
  { emoji: "🗺️", title: "Interactive Map", desc: "Score-coloured France map" },
  { emoji: "⚖️", title: "City Comparator", desc: "Side-by-side 8-axis battle" },
  { emoji: "🏆", title: "Rankings", desc: "19 categories, real data" },
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
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>Decision tools</div>
          <div style={{ color: "#f0f6fc", fontSize: "60px", fontWeight: 900, lineHeight: 1 }}>Find your French city</div>
          <div style={{ color: "#8b949e", fontSize: "18px" }}>Quiz · Simulator · Map · Comparator · Rankings — all free</div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {TOOLS.map((tool) => (
            <div
              key={tool.title}
              style={{
                background: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "12px",
                padding: "12px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                flex: 1,
                minWidth: "160px",
              }}
            >
              <span style={{ fontSize: "22px" }}>{tool.emoji}</span>
              <span style={{ color: "#f0f6fc", fontSize: "14px", fontWeight: 700 }}>{tool.title}</span>
              <span style={{ color: "#8b949e", fontSize: "12px" }}>{tool.desc}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
