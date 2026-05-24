import { ImageResponse } from "next/og";
import { topSynthesisGlobal } from "@/lib/city-synthesis";

export const alt = "Overall quality-of-life ranking 2026 | BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const AXES = ["Environment", "Healthcare", "Employment", "Quality of life", "Cycling", "Safety", "Demographics", "Public services"];

export default function Image() {
  const top5 = topSynthesisGlobal(5);
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
            <span style={{ color: "#0D9488", fontSize: "20px", fontWeight: 700 }}>BestCitiesInFrance</span>
          </div>
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "6px 14px", color: "#8b949e", fontSize: "14px" }}>
            8 dimensions · 2026
          </div>
        </div>

        <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>France 2026</div>
            <div style={{ color: "#f0f6fc", fontSize: "52px", fontWeight: 900, lineHeight: 1 }}>Overall ranking</div>
            <div style={{ color: "#8b949e", fontSize: "16px" }}>Cross-dimensional score — no city hides behind one strength</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
              {AXES.map((ax) => (
                <div key={ax} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "6px", padding: "4px 10px", color: "#8b949e", fontSize: "12px" }}>{ax}</div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "260px" }}>
            {top5.map((city, i) => (
              <div key={city.slug} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#161b22", border: "1px solid #30363d", borderRadius: "10px", padding: "10px 14px" }}>
                <span style={{ color: "#8b949e", fontSize: "16px", fontWeight: 700, width: "20px" }}>{i + 1}</span>
                <span style={{ color: "#f0f6fc", fontSize: "15px", fontWeight: 700, flex: 1 }}>{city.name}</span>
                <span style={{ color: "#A855F7", fontSize: "16px", fontWeight: 900 }}>{city.synthesis.global.toFixed(1)}</span>
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
