import { ImageResponse } from "next/og";
import { CITIES_COUNT } from "@/lib/site-stats";

export const alt = "Buy vs rent calculator for every French city | BestCitiesInFrance";
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
          <span style={{ color: "#0D9488", fontSize: "20px", fontWeight: 700 }}>BestCitiesInFrance</span>
        </div>

        <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>Price-to-rent ratio</div>
            <div style={{ color: "#f0f6fc", fontSize: "56px", fontWeight: 900, lineHeight: 1 }}>Buy or rent?</div>
            <div style={{ color: "#8b949e", fontSize: "18px" }}>Honest calculation for all {CITIES_COUNT} French cities — years to break even, per city</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "280px" }}>
            {[
              { city: "Dijon", ratio: "< 14 yrs", verdict: "Buy", color: "#16A34A" },
              { city: "Nantes", ratio: "19-22 yrs", verdict: "Neutral", color: "#F59E0B" },
              { city: "Paris", ratio: "> 30 yrs", verdict: "Rent", color: "#EF4444" },
              { city: "Annecy", ratio: "23-26 yrs", verdict: "Rent", color: "#F97316" },
            ].map((item) => (
              <div key={item.city} style={{ display: "flex", alignItems: "center", gap: "10px", background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "10px 14px" }}>
                <span style={{ color: "#f0f6fc", fontSize: "14px", fontWeight: 700, flex: 1 }}>{item.city}</span>
                <span style={{ color: "#8b949e", fontSize: "13px" }}>{item.ratio}</span>
                <span style={{ color: item.color, fontSize: "12px", fontWeight: 700 }}>{item.verdict}</span>
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
