import { ImageResponse } from "next/og";

export const alt = "Data & Sources — methodology and open data behind BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SOURCES = [
  { name: "INSEE", desc: "Population, census" },
  { name: "SSMSI", desc: "Crime statistics" },
  { name: "DVF / DGFiP", desc: "Property transactions" },
  { name: "CEREMA", desc: "Cycling infrastructure" },
  { name: "Météo-France", desc: "Climate normals" },
  { name: "OpenAQ", desc: "Air quality" },
  { name: "ARPEGE / IPCC", desc: "Climate projections" },
  { name: "data.gouv.fr", desc: "Open government data" },
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
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>100% open data, no fake figures</div>
          <div style={{ color: "#f0f6fc", fontSize: "58px", fontWeight: 900, lineHeight: 1 }}>Data & Sources</div>
          <div style={{ color: "#8b949e", fontSize: "18px" }}>Every number traced to its official source — transparent methodology</div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {SOURCES.map((s) => (
            <div key={s.name} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "10px 14px", display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ color: "#f0f6fc", fontSize: "13px", fontWeight: 700 }}>{s.name}</span>
              <span style={{ color: "#8b949e", fontSize: "12px" }}>{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
