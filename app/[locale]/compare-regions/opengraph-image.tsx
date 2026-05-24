import { ImageResponse } from "next/og";

export const alt = "Compare French regions side by side | BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const EXAMPLES = [
  ["Île-de-France", "Bretagne"],
  ["Provence", "Occitanie"],
  ["Auvergne-Rhône-Alpes", "Nouvelle-Aquitaine"],
];

const AXES = ["Quality of life", "Climate", "Cost", "Employment", "Nature", "Housing"];

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
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>78 region pairs</div>
          <div style={{ color: "#f0f6fc", fontSize: "58px", fontWeight: 900, lineHeight: 1 }}>Compare any two regions</div>
          <div style={{ color: "#8b949e", fontSize: "18px" }}>Climate · housing · top cities · employment — decision-ready in 30 seconds</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {EXAMPLES.map(([a, b]) => (
            <div key={a} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "6px 16px", color: "#f0f6fc", fontSize: "14px", fontWeight: 600 }}>{a}</div>
              <span style={{ color: "#8b949e", fontSize: "18px", fontWeight: 900 }}>vs</span>
              <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "6px 16px", color: "#f0f6fc", fontSize: "14px", fontWeight: 600 }}>{b}</div>
              <div style={{ display: "flex", gap: "6px", flex: 1 }}>
                {AXES.slice(0, 3).map((ax) => (
                  <div key={ax} style={{ background: "#0d9488", borderRadius: "4px", padding: "3px 8px", color: "white", fontSize: "11px" }}>{ax}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
