import { ImageResponse } from "next/og";
import { getEnGuide, EN_GUIDE_CATEGORIES } from "@/data/guides-en";

export const alt = "Guide — BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const guide = getEnGuide(slug);
  if (!guide) return new Response("Not found", { status: 404 });

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

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "72px" }}>{guide.emoji}</div>
          <div style={{ color: "#0D9488", fontSize: "18px", letterSpacing: "1px", textTransform: "uppercase" }}>
            {`${EN_GUIDE_CATEGORIES[guide.category]} · Guide`}
          </div>
          <div style={{ color: "#f0f6fc", fontSize: guide.title.length > 44 ? "50px" : "60px", fontWeight: 900, lineHeight: 1.08 }}>
            {guide.title}
          </div>
        </div>

        <div style={{ color: "#8b949e", fontSize: "20px" }}>
          {`${guide.readMinutes} min read · honest, data-led, no fluff`}
        </div>
      </div>
    ),
    { ...size }
  );
}
