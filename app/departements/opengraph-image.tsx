import { ImageResponse } from "next/og";
import { CITIES_SEED } from "@/data/cities-seed";

export const alt = "Villes par département — MaVilleIdeal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const deptMap = new Map<string, number>();
  CITIES_SEED.forEach((c) => {
    deptMap.set(c.department, (deptMap.get(c.department) ?? 0) + 1);
  });
  const topDepts = Array.from(deptMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16);

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
          padding: "52px 60px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
            <span style={{ color: "#0D9488", fontSize: "20px", fontWeight: 700 }}>MaVilleIdeal</span>
          </div>
          <div
            style={{
              background: "#161b22",
              border: "1px solid #30363d",
              borderRadius: "8px",
              padding: "6px 14px",
              color: "#8b949e",
              fontSize: "14px",
            }}
          >
            {`${deptMap.size} départements · ${CITIES_SEED.length} villes`}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>
            Explorer par département
          </div>
          <div style={{ color: "#f0f6fc", fontSize: "60px", fontWeight: 900, lineHeight: 1 }}>
            Les départements français
          </div>
          <div style={{ color: "#8b949e", fontSize: "17px" }}>
            Qualité de vie, scores et données par territoire
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {topDepts.map(([dept, count]) => (
            <div
              key={dept}
              style={{
                background: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "20px",
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span style={{ color: "#f0f6fc", fontSize: "13px", fontWeight: 600 }}>
                {dept.length > 20 ? dept.slice(0, 18) + "…" : dept}
              </span>
              <span style={{ color: "#0D9488", fontSize: "12px", fontWeight: 700 }}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
