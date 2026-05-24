import { ImageResponse } from "next/og";

export const alt = "Methodology — how we rank French cities | BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const AXES = [
  { label: "Quality of life", weight: "25%" },
  { label: "Safety", weight: "18%" },
  { label: "Cost of living", weight: "15%" },
  { label: "Transport", weight: "12%" },
  { label: "Nature", weight: "10%" },
  { label: "Culture", weight: "8%" },
  { label: "Schools", weight: "7%" },
  { label: "Remote work", weight: "5%" },
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
            <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>Full transparency</div>
            <div style={{ color: "#f0f6fc", fontSize: "52px", fontWeight: 900, lineHeight: 1 }}>How we rank cities</div>
            <div style={{ color: "#8b949e", fontSize: "16px", marginTop: "8px" }}>8 axes · z-score normalisation · worst-axis penalty · open-data sources only</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "280px" }}>
            {AXES.map((ax) => (
              <div key={ax.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "#c9d1d9", fontSize: "13px", flex: 1 }}>{ax.label}</span>
                <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "4px", padding: "2px 8px", color: "#0D9488", fontSize: "12px", fontWeight: 700 }}>{ax.weight}</div>
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
