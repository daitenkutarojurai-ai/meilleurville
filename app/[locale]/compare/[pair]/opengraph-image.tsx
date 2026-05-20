import { ImageResponse } from "next/og";
import { CITIES_SEED } from "@/data/cities-seed";

export const alt = "City comparison — BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ locale: string; pair: string }> };

function scoreColor(score: number): string {
  if (score >= 7.5) return "#10B981";
  if (score >= 7.0) return "#16A34A";
  if (score >= 6.0) return "#84CC16";
  if (score >= 5.0) return "#F59E0B";
  if (score >= 4.0) return "#F97316";
  return "#EF4444";
}

export default async function Image({ params }: Props) {
  const { pair } = await params;
  const parts = pair.split("-vs-");
  const a = CITIES_SEED.find((c) => c.slug === parts[0]);
  const b = CITIES_SEED.find((c) => c.slug === parts[1]);
  if (!a || !b || parts.length !== 2) return new Response("Not found", { status: 404 });

  const cityCard = (city: typeof a) => (
    <div
      style={{
        flex: 1,
        background: "#161b22",
        border: `2px solid ${scoreColor(city.scores.global)}33`,
        borderRadius: "16px",
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <div style={{ color: "#8b949e", fontSize: "15px" }}>{city.region ?? ""}</div>
      <div style={{ color: "#f0f6fc", fontSize: "44px", fontWeight: 900, lineHeight: 1.05 }}>
        {city.name}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
        <span style={{ color: scoreColor(city.scores.global), fontSize: "52px", fontWeight: 900 }}>
          {city.scores.global.toFixed(1)}
        </span>
        <span style={{ color: "#8b949e", fontSize: "22px" }}>/10</span>
      </div>
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "60px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
          <span style={{ color: "#0D9488", fontSize: "20px", fontWeight: 700 }}>BestCitiesInFrance</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {cityCard(a)}
          <div style={{ color: "#8b949e", fontSize: "36px", fontWeight: 900 }}>vs</div>
          {cityCard(b)}
        </div>

        <div style={{ color: "#8b949e", fontSize: "20px" }}>
          Side-by-side: cost, transport, nature, safety, schools — and a verdict per profile.
        </div>
      </div>
    ),
    { ...size }
  );
}
