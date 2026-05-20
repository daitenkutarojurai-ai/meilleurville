import { ImageResponse } from "next/og";
import { RANKING_META } from "@/lib/rankings";

export const alt = "French city ranking — BestCitiesInFrance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ locale: string; slug: string }> };

// Short EN labels per ranking slug — self-contained for the OG card
// (mirrors RANKING_EN in the page; OG images keep their own copy by
// convention so they have no cross-route import surface).
const EN_LABEL: Record<string, string> = {
  teletravail: "remote work",
  famille: "families",
  nature: "nature & sport",
  etudiant: "students",
  retraite: "retirement",
  budget: "a tight budget",
  soleil: "sunshine",
  securite: "safety",
  culture: "culture",
  mobilite: "car-free living",
  investissement: "property investment",
  sante: "healthcare access",
  climat: "a comfortable climate",
  logement: "affordable housing",
  "jeunes-actifs": "young professionals",
  gastronomie: "food & dining",
  ecologie: "ecology & air quality",
  cyclistes: "cyclists",
  "bord-de-mer": "seaside living",
};

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const meta = RANKING_META[slug as keyof typeof RANKING_META];
  if (!meta) return new Response("Not found", { status: 404 });
  const label = EN_LABEL[slug] ?? slug;

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
          <div style={{ fontSize: "80px" }}>{meta.emoji}</div>
          <div style={{ color: "#8b949e", fontSize: "18px", letterSpacing: "1px", textTransform: "uppercase" }}>
            French city ranking · 2026
          </div>
          <div style={{ color: "#f0f6fc", fontSize: "62px", fontWeight: 900, lineHeight: 1.05 }}>
            {`Best French cities for ${label}`}
          </div>
        </div>

        <div style={{ color: "#8b949e", fontSize: "20px" }}>
          Ranked on official data — Insee, SSMSI, observatoires des loyers, DREES.
        </div>
      </div>
    ),
    { ...size }
  );
}
