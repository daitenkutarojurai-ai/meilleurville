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
  if (score >= 8) return "#10b981";
  if (score >= 6) return "#f59e0b";
  return "#ef4444";
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
            {cities.length} ville{cities.length > 1 ? "s" : ""} analysée{cities.length > 1 ? "s" : ""}
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
              N°1 : {cities[0].name} · {cities[0].scores.global.toFixed(1)}/10
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
                      {city.scores.global.toFixed(1)}/10
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
