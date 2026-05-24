import { ImageResponse } from "next/og";
import { CITIES_SEED } from "@/data/cities-seed";

export const alt = "Compare French cities side by side | BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function scoreColor(score: number): string {
  if (score >= 7.5) return "#A855F7";
  if (score >= 7.0) return "#16A34A";
  if (score >= 6.0) return "#84CC16";
  if (score >= 5.0) return "#F59E0B";
  if (score >= 4.0) return "#F97316";
  return "#EF4444";
}

export default function Image() {
  const top5 = [...CITIES_SEED].sort((a, b) => b.scores.global - a.scores.global).slice(0, 5);
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
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>City comparator</div>
          <div style={{ color: "#f0f6fc", fontSize: "60px", fontWeight: 900, lineHeight: 1 }}>Compare any two cities</div>
          <div style={{ color: "#8b949e", fontSize: "18px" }}>8 axes · housing · climate · real data. Decision in 30 seconds.</div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          {top5.map((city) => {
            const color = scoreColor(city.scores.global);
            return (
              <div
                key={city.slug}
                style={{
                  background: "#161b22",
                  border: `1px solid ${color}44`,
                  borderRadius: "12px",
                  padding: "14px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  flex: 1,
                }}
              >
                <span style={{ color: "#f0f6fc", fontSize: "15px", fontWeight: 700 }}>{city.name}</span>
                <span style={{ color: color, fontSize: "20px", fontWeight: 900 }}>{city.scores.global.toFixed(1)}</span>
              </div>
            );
          })}
        </div>
      </div>
    ),
    { ...size }
  );
}
