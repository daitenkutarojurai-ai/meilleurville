import { ImageResponse } from "next/og";
import { CITIES_SEED } from "@/data/cities-seed";

export const alt = "City quality of life — BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

// Required for static export: one OG image per city, EN locale only.
export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

type Props = { params: Promise<{ locale: string; slug: string }> };

function scoreColor(score: number): string {
  if (score >= 7.5) return "#A855F7";
  if (score >= 7.0) return "#16A34A";
  if (score >= 6.0) return "#84CC16";
  if (score >= 5.0) return "#F59E0B";
  if (score >= 4.0) return "#F97316";
  return "#EF4444";
}

const SCORE_LABELS: Array<{ key: keyof (typeof CITIES_SEED)[number]["scores"]; label: string }> = [
  { key: "nature", label: "Nature" },
  { key: "transport", label: "Transport" },
  { key: "cost", label: "Cost" },
  { key: "safety", label: "Safety" },
  { key: "culture", label: "Culture" },
];

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return new Response("Not found", { status: 404 });

  const globalScore = city.scores.global;
  const globalColor = scoreColor(globalScore);

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
          padding: "60px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
            <span style={{ color: "#0D9488", fontSize: "20px", fontWeight: 700 }}>
              BestCitiesInFrance
            </span>
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
            bestcitiesinfrance.com
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>
            {`${city.region ?? ""}${city.department ? ` · ${city.department}` : ""}`}
          </div>
          <div
            style={{
              color: "#f0f6fc",
              fontSize: city.name.length > 12 ? "72px" : "88px",
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            {city.name}
          </div>
          <div style={{ color: "#8b949e", fontSize: "18px", marginTop: "4px" }}>
            Quality of life, cost, transport, safety — scored on official data
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div
            style={{
              background: "#161b22",
              border: `2px solid ${globalColor}33`,
              borderRadius: "16px",
              padding: "20px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <div style={{ color: globalColor, fontSize: "64px", fontWeight: 900, lineHeight: 1 }}>
              {globalScore.toFixed(1)}
            </div>
            <div style={{ color: "#8b949e", fontSize: "14px" }}>Overall score · /10</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "380px" }}>
            {SCORE_LABELS.map(({ key, label }) => {
              const score = city.scores[key];
              const color = scoreColor(score);
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ color: "#8b949e", fontSize: "13px", width: "80px", textAlign: "right" }}>
                    {label}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: "8px",
                      background: "#21262d",
                      borderRadius: "4px",
                      overflow: "hidden",
                      display: "flex",
                    }}
                  >
                    <div style={{ width: `${score * 10}%`, height: "100%", background: color, borderRadius: "4px" }} />
                  </div>
                  <div style={{ color, fontSize: "13px", fontWeight: 700, width: "32px" }}>
                    {score.toFixed(1)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
