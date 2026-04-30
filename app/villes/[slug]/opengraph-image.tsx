import { ImageResponse } from "next/og";
import { CITIES_SEED } from "@/data/cities-seed";

export const alt = "Qualité de vie — MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

function scoreColor(score: number): string {
  if (score >= 8) return "#10b981";
  if (score >= 6) return "#f59e0b";
  return "#ef4444";
}

const SCORE_LABELS: Array<{ key: keyof (typeof CITIES_SEED)[number]["scores"]; label: string }> = [
  { key: "nature", label: "Nature" },
  { key: "transport", label: "Transport" },
  { key: "cost", label: "Coût" },
  { key: "safety", label: "Sécurité" },
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
        {/* Top row: branding */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "#7c6af0",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "18px",
                fontWeight: 900,
              }}
            >
              M
            </div>
            <span style={{ color: "#7c6af0", fontSize: "20px", fontWeight: 700 }}>
              MeilleurVille
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
            meilleurville.fr
          </div>
        </div>

        {/* City name + meta */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>
            {city.region} · {city.department}
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
          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            {city.characterTags.slice(0, 4).map((tag) => (
              <div
                key={tag}
                style={{
                  background: "#161b22",
                  border: "1px solid #30363d",
                  borderRadius: "20px",
                  padding: "4px 12px",
                  color: "#8b949e",
                  fontSize: "13px",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row: global score + criteria */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          {/* Global score */}
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
            <div style={{ color: "#8b949e", fontSize: "14px" }}>Score global · /10</div>
          </div>

          {/* Criteria bars */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              minWidth: "380px",
            }}
          >
            {SCORE_LABELS.map(({ key, label }) => {
              const score = city.scores[key];
              const color = scoreColor(score);
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ color: "#8b949e", fontSize: "13px", width: "70px", textAlign: "right" }}>
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
                    <div
                      style={{
                        width: `${score * 10}%`,
                        height: "100%",
                        background: color,
                        borderRadius: "4px",
                      }}
                    />
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
