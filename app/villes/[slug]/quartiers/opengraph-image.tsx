import { ImageResponse } from "next/og";
import { CITIES_SEED } from "@/data/cities-seed";

export const alt = "Quartiers de la ville — MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

function scoreColor(score: number): string {
  if (score >= 7.5) return "#10B981";
  if (score >= 7.0) return "#16A34A";
  if (score >= 6.0) return "#84CC16";
  if (score >= 5.0) return "#F59E0B";
  if (score >= 4.0) return "#F97316";
  return "#EF4444";
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return new Response("Not found", { status: 404 });

  const lScore = city.scores.life;
  const color = scoreColor(lScore);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0d1117 0%, #1f1c2e 60%, #2d1a3d 100%)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "60px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
            <span style={{ color: "#0D9488", fontSize: 20, fontWeight: 700 }}>MeilleurVille</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #30363d", borderRadius: 8, padding: "6px 14px", color: "#8b949e", fontSize: 14 }}>
            Quartiers
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ color: "#8b949e", fontSize: 16, letterSpacing: 2, textTransform: "uppercase" }}>
            Quartiers de
          </div>
          <div style={{ color: "#f0f6fc", fontSize: city.name.length > 12 ? 80 : 96, fontWeight: 900, lineHeight: 1 }}>
            {city.name}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            {city.characterTags.slice(0, 5).map((tag) => (
              <div
                key={tag}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid #30363d",
                  borderRadius: 20,
                  padding: "4px 14px",
                  color: "#cdd6e0",
                  fontSize: 14,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ background: "rgba(255,255,255,0.04)", border: `2px solid ${color}55`, borderRadius: 18, padding: "24px 36px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ color, fontSize: 80, fontWeight: 900, lineHeight: 1 }}>{lScore.toFixed(1)}</div>
            <div style={{ color: "#8b949e", fontSize: 14 }}>Qualité de vie · /10</div>
          </div>
          <div style={{ color: "#8b949e", fontSize: 18, maxWidth: 420, textAlign: "right", lineHeight: 1.3 }}>
            Quartiers, ambiances, micro-climats : ce que vous croisez en sortant de chez vous.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
