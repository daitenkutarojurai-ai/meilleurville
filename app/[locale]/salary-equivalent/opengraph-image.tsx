import { ImageResponse } from "next/og";
import { CITIES_COUNT } from "@/lib/site-stats";

export const alt = "Salary equivalent between French cities 2026 | BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
            <span style={{ color: "#0D9488", fontSize: "20px", fontWeight: 700 }}>BestCitiesInFrance</span>
          </div>
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "6px 14px", color: "#8b949e", fontSize: "14px" }}>
            {CITIES_COUNT} cities
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>Purchasing power calculator</div>
          <div style={{ color: "#f0f6fc", fontSize: "54px", fontWeight: 900, lineHeight: 1 }}>Salary equivalent</div>
          <div style={{ color: "#8b949e", fontSize: "18px", maxWidth: "700px" }}>How much do you need to earn in Lyon, Rennes, or Bordeaux to match your Paris take-home? Rent, taxes, and mobility factored in.</div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          {[
            { from: "Paris €4,000", to: "≈ Lyon €2,950" },
            { from: "Paris €4,000", to: "≈ Rennes €2,700" },
            { from: "Paris €4,000", to: "≈ Bordeaux €2,850" },
          ].map((item) => (
            <div key={item.from + item.to} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "10px", padding: "14px 18px", display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
              <span style={{ color: "#8b949e", fontSize: "13px" }}>{item.from}</span>
              <span style={{ color: "#0D9488", fontSize: "16px", fontWeight: 700 }}>{item.to}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
