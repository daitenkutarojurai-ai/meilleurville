import { ImageResponse } from "next/og";

export const alt = "Moving from one French city to another — honest comparisons 2026 | BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAIRS = [
  { from: "Paris", to: "Lyon", delta: "−42% rent" },
  { from: "Marseille", to: "Bordeaux", delta: "Quality ↑" },
  { from: "Lille", to: "Rennes", delta: "Same cost" },
  { from: "Lyon", to: "Annecy", delta: "Nature ↑" },
  { from: "Bordeaux", to: "Nantes", delta: "Budget ≈" },
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

        <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>Origin → destination</div>
            <div style={{ color: "#f0f6fc", fontSize: "50px", fontWeight: 900, lineHeight: 1 }}>Moving from city to city</div>
            <div style={{ color: "#8b949e", fontSize: "17px" }}>Costs, quality-of-life delta, and an honest verdict on who the move makes sense for</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "260px" }}>
            {PAIRS.map((p) => (
              <div key={p.from + p.to} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "8px 12px" }}>
                <span style={{ color: "#8b949e", fontSize: "13px", fontWeight: 600 }}>{p.from}</span>
                <span style={{ color: "#30363d", fontSize: "12px" }}>→</span>
                <span style={{ color: "#f0f6fc", fontSize: "13px", fontWeight: 600, flex: 1 }}>{p.to}</span>
                <span style={{ color: "#0D9488", fontSize: "12px", fontWeight: 700 }}>{p.delta}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "0px" }} />
      </div>
    ),
    { ...size }
  );
}
