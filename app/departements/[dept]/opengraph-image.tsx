import { ImageResponse } from "next/og";
import { CITIES_SEED } from "@/data/cities-seed";

export const alt = "Villes du département — MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ dept: string }> };

function deptToSlug(dept: string): string {
  return dept
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function slugToDept(slug: string): string | undefined {
  const depts = [...new Set(CITIES_SEED.map((c) => c.department))];
  return depts.find((d) => deptToSlug(d) === slug);
}

function scoreColor(score: number): string {
  if (score >= 7.5) return "#A855F7";
  if (score >= 7.0) return "#16A34A";
  if (score >= 6.0) return "#84CC16";
  if (score >= 5.0) return "#F59E0B";
  if (score >= 4.0) return "#F97316";
  return "#EF4444";
}

export default async function Image({ params }: Props) {
  const { dept: deptSlug } = await params;
  const deptName = slugToDept(deptSlug);
  if (!deptName) return new Response("Not found", { status: 404 });

  const cities = [...CITIES_SEED.filter((c) => c.department === deptName)]
    .sort((a, b) => b.scores.global - a.scores.global);
  const top5 = cities.slice(0, 5);

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
            <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
            <span style={{ color: "#0D9488", fontSize: "20px", fontWeight: 700 }}>
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
            {`${cities.length} ville${cities.length > 1 ? "s" : ""} analysée${cities.length > 1 ? "s" : ""}`}
          </div>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>
            Département
          </div>
          <div
            style={{
              color: "#f0f6fc",
              fontSize: deptName.length > 20 ? "48px" : "58px",
              fontWeight: 900,
              lineHeight: 1.1,
            }}
          >
            {deptName}
          </div>
          {cities[0] && (
            <div style={{ color: "#8b949e", fontSize: "17px" }}>
              {`N°1 : ${cities[0].name} · ${cities[0].scores.global.toFixed(1)}/10`}
            </div>
          )}
        </div>

        {/* Top cities */}
        {top5.length > 0 && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {top5.map((city, i) => {
              const color = scoreColor(city.scores.global);
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div
                  key={city.slug}
                  style={{
                    background: "#161b22",
                    border: `1px solid ${i < 3 ? color + "44" : "#30363d"}`,
                    borderRadius: "10px",
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "14px" }}>{i < 3 ? medals[i] : `#${i + 1}`}</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ color: "#f0f6fc", fontSize: "14px", fontWeight: 700 }}>
                      {city.name}
                    </span>
                    <span style={{ color, fontSize: "13px", fontWeight: 700 }}>
                      {`${city.scores.global.toFixed(1)}/10`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}

export function generateStaticParams() {
  const depts = [...new Set(CITIES_SEED.map((c) => c.department))];
  return depts.map((d) => ({ dept: deptToSlug(d) }));
}
