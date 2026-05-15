import { ImageResponse } from "next/og";
import { getTagLabel, getGuidesForTag } from "@/lib/guide-tags";

export const alt = "Tag MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const label = getTagLabel(slug);
  if (!label) return new Response("Not found", { status: 404 });
  const count = getGuidesForTag(slug).length;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0d1117 0%, #1a1040 100%)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "56px 60px",
          justifyContent: "space-between",
        }}
      >
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
            <span style={{ color: "#7c6af0", fontSize: "20px", fontWeight: 700 }}>MeilleurVille</span>
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
            mavilleideale.fr/tags/{slug}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div
            style={{
              color: "#8b949e",
              fontSize: "16px",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            Tag
          </div>
          <div style={{ color: "#f0f6fc", fontSize: "84px", fontWeight: 900, lineHeight: 1 }}>
            {label}
          </div>
          <div style={{ color: "#8b949e", fontSize: "20px" }}>
            {count} guide{count > 1 ? "s" : ""} sur ce thème
          </div>
        </div>

        <div style={{ display: "flex", color: "#7c6af0", fontSize: "14px", fontWeight: 600 }}>
          <span>Choisissez votre ville sans bullshit, données réelles.</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
