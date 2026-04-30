import { ImageResponse } from "next/og";
import { RANKING_META, getRankedCities, type RankingSlug } from "@/lib/rankings";

export const alt = "Classement villes françaises — MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

function scoreColor(score: number): string {
  if (score >= 8) return "#10b981";
  if (score >= 6) return "#f59e0b";
  return "#ef4444";
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  if (!(slug in RANKING_META)) return new Response("Not found", { status: 404 });

  const meta = RANKING_META[slug as RankingSlug];
  const ranked = getRankedCities(slug as RankingSlug);
  const top5 = ranked.slice(0, 5);

  const accentColors: Record<string, string> = {
    teletravail: "#60a5fa",
    famille: "#34d399",
    nature: "#4ade80",
    etudiant: "#a78bfa",
    retraite: "#f59e0b",
    budget: "#34d399",
    soleil: "#fbbf24",
    securite: "#818cf8",
    culture: "#f472b6",
    mobilite: "#22d3ee",
  };
  const accent = accentColors[slug] ?? "#7c6af0";

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
          padding: "56px 60px",
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
              background: `${accent}22`,
              border: `1px solid ${accent}44`,
              borderRadius: "8px",
              padding: "6px 14px",
              color: accent,
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Classement 2025
          </div>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ fontSize: "48px", lineHeight: 1 }}>{meta.emoji}</div>
          <div
            style={{
              color: "#f0f6fc",
              fontSize: meta.headline.length > 50 ? "38px" : "46px",
              fontWeight: 900,
              lineHeight: 1.2,
              maxWidth: "800px",
            }}
          >
            {meta.headline}
          </div>
        </div>

        {/* Top 5 */}
        <div style={{ display: "flex", gap: "8px" }}>
          {top5.map((entry, i) => {
            const medals = ["🥇", "🥈", "🥉"];
            const color = scoreColor(entry.score);
            return (
              <div
                key={entry.city.slug}
                style={{
                  flex: 1,
                  background: "#161b22",
                  border: `1px solid ${i < 3 ? color + "44" : "#30363d"}`,
                  borderRadius: "12px",
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <span style={{ fontSize: "18px" }}>{i < 3 ? medals[i] : `#${i + 1}`}</span>
                <span style={{ color: "#f0f6fc", fontSize: "15px", fontWeight: 700, lineHeight: 1.2 }}>
                  {entry.city.name}
                </span>
                <span style={{ color, fontSize: "14px", fontWeight: 700 }}>
                  {entry.score.toFixed(1)}/10
                </span>
                <span style={{ color: "#8b949e", fontSize: "11px" }}>
                  {(entry.city.region ?? "").split("-")[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    ),
    { ...size }
  );
}

export function generateStaticParams() {
  return Object.keys(RANKING_META).map((slug) => ({ slug }));
}
