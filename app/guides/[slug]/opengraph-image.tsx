import { ImageResponse } from "next/og";
import { GUIDES, GUIDE_CATEGORIES } from "@/data/guides";

export const alt = "Guide — MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) return new Response("Not found", { status: 404 });

  const cat = GUIDE_CATEGORIES.find((c) => c.id === guide.category);

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
            {guide.readMinutes} min de lecture
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1, justifyContent: "center" }}>
          <div style={{ fontSize: "72px", lineHeight: 1 }}>{guide.emoji}</div>
          {cat && (
            <div
              style={{
                background: "#7c6af033",
                border: "1px solid #7c6af044",
                borderRadius: "20px",
                padding: "5px 14px",
                color: "#a78bfa",
                fontSize: "13px",
                fontWeight: 600,
                width: "fit-content",
              }}
            >
              {cat.emoji} {cat.label}
            </div>
          )}
          <div
            style={{
              color: "#f0f6fc",
              fontSize: guide.title.length > 60 ? "38px" : "46px",
              fontWeight: 900,
              lineHeight: 1.2,
              maxWidth: "900px",
            }}
          >
            {guide.title}
          </div>
        </div>

        {/* Footer: tags */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {guide.tags.slice(0, 5).map((tag) => (
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
    ),
    { ...size }
  );
}

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}
