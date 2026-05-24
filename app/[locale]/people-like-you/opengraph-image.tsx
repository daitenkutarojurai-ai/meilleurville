import { ImageResponse } from "next/og";

export const alt = "People like you — where profiles like yours are moving | BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PERSONAS = [
  { emoji: "💻", label: "Remote developer" },
  { emoji: "👨‍👩‍👧", label: "Young family" },
  { emoji: "🎨", label: "Creative freelance" },
  { emoji: "🏖️", label: "Early retiree" },
  { emoji: "🎓", label: "Student" },
  { emoji: "🌿", label: "Eco-minimalist" },
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
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>Social proof · real patterns</div>
          <div style={{ color: "#f0f6fc", fontSize: "56px", fontWeight: 900, lineHeight: 1.05 }}>Where people like you are moving</div>
          <div style={{ color: "#8b949e", fontSize: "18px" }}>11 personas × 50 cities — ranked by who gains the most from relocating</div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {PERSONAS.map((p) => (
            <div
              key={p.label}
              style={{
                background: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "10px",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flex: 1,
              }}
            >
              <span style={{ fontSize: "18px" }}>{p.emoji}</span>
              <span style={{ color: "#c9d1d9", fontSize: "12px", fontWeight: 600 }}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
