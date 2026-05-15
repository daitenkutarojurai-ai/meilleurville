import { ImageResponse } from "next/og";
import { getAllTagsWithCounts } from "@/lib/guide-tags";
import { GUIDES_COUNT, TAGS_COUNT } from "@/lib/site-stats";

export const alt = "Tous les tags — MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const top = getAllTagsWithCounts().slice(0, 14);

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
            <div style={{ width: "32px", height: "32px", background: "#7c6af0", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "18px", fontWeight: 900 }}>M</div>
            <span style={{ color: "#7c6af0", fontSize: "20px", fontWeight: 700 }}>MeilleurVille</span>
          </div>
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "6px 14px", color: "#8b949e", fontSize: "14px" }}>meilleurville.fr/tags</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#8b949e", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>Index</div>
          <div style={{ color: "#f0f6fc", fontSize: "72px", fontWeight: 900, lineHeight: 1 }}>{`${TAGS_COUNT} tags`}</div>
          <div style={{ color: "#8b949e", fontSize: "17px" }}>{`Parcourez les ${GUIDES_COUNT} guides par thème`}</div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {top.map((t) => (
            <div key={t.slug} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "10px 16px", color: "#e6edf3", fontSize: "13px", fontWeight: 500 }}>
              {t.label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
