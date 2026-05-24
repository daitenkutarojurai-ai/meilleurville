import { ImageResponse } from "next/og";
import { CITIES_COUNT } from "@/lib/site-stats";

export const alt = "Climate 2040 Timelapse — France warming 2026→2040 | BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MACRO_REGIONS = [
  "Mediterranean South", "Atlantic Coast", "Île-de-France",
  "Massif Central", "Brittany", "Alsace / Grand Est",
  "Pyrenees", "Rhône Valley", "Normandy",
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0d1117 0%, #1a0a00 100%)",
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
          <div style={{ background: "#1a0a00", border: "1px solid #f97316", borderRadius: "8px", padding: "6px 14px", color: "#f97316", fontSize: "14px", fontWeight: 600 }}>
            2026 → 2040
          </div>
        </div>

        <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            <div style={{ color: "#f97316", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>ARPEGE · IPCC projection</div>
            <div style={{ color: "#f0f6fc", fontSize: "54px", fontWeight: 900, lineHeight: 1 }}>Climate 2040 Timelapse</div>
            <div style={{ color: "#8b949e", fontSize: "18px" }}>Watch France warm year by year — {CITIES_COUNT} cities across 15 macro-regions</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "260px" }}>
            {MACRO_REGIONS.slice(0, 6).map((r) => (
              <div key={r} style={{ background: "#1a0a00", border: "1px solid #f9731622", borderRadius: "8px", padding: "7px 12px", color: "#fdba74", fontSize: "13px" }}>{r}</div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          {["+1.2°C by 2030", "+2.4°C by 2040", "15 macro-regions"].map((tag) => (
            <div key={tag} style={{ background: "#f9731611", border: "1px solid #f9731633", borderRadius: "20px", padding: "8px 16px", color: "#fdba74", fontSize: "14px", fontWeight: 600 }}>{tag}</div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
