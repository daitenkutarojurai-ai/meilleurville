import { ImageResponse } from "next/og";

export const alt = "Living in France on X €/month — top cities by salary bracket | BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRACKETS = [
  { salary: "€1,500/mo", verdict: "Clermont, Pau", color: "#EF4444" },
  { salary: "€2,000/mo", verdict: "Caen, Rennes", color: "#F59E0B" },
  { salary: "€2,500/mo", verdict: "Nantes, Lyon", color: "#84CC16" },
  { salary: "€3,000/mo", verdict: "Bordeaux, Nice", color: "#16A34A" },
  { salary: "€5,000/mo", verdict: "Paris viable", color: "#A855F7" },
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
            <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>Disposable income simulator</div>
            <div style={{ color: "#f0f6fc", fontSize: "50px", fontWeight: 900, lineHeight: 1 }}>Living in France on X €/month</div>
            <div style={{ color: "#8b949e", fontSize: "17px" }}>Best cities for your salary — rent, taxes, mobility deducted</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "280px" }}>
            {BRACKETS.map((b) => (
              <div key={b.salary} style={{ display: "flex", alignItems: "center", gap: "10px", background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "9px 14px" }}>
                <span style={{ color: b.color, fontSize: "14px", fontWeight: 700, width: "90px" }}>{b.salary}</span>
                <span style={{ color: "#c9d1d9", fontSize: "13px" }}>{b.verdict}</span>
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
