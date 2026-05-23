import { ImageResponse } from "next/og";
import { GUIDES, GUIDE_CATEGORIES } from "@/data/guides";

export const alt = "Guide — MaVilleIdeal";
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
            <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
            <span style={{ color: "#0D9488", fontSize: "20px", fontWeight: 700 }}>
              MaVilleIdeal
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
            {`${guide.readMinutes} min de lecture`}
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1, justifyContent: "center" }}>
          <div style={{ fontSize: "72px", lineHeight: 1 }}>{guide.emoji}</div>
          {cat && (
            <div
              style={{
                background: "#0D948833",
                border: "1px solid #0D948844",
                borderRadius: "20px",
                padding: "5px 14px",
                color: "#2DD4BF",
                fontSize: "13px",
                fontWeight: 600,
                width: "fit-content",
              }}
            >
              {`${cat.emoji} ${cat.label}`}
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
