import { ImageResponse } from "next/og";
import {
  METRO_REGIONS,
  REGION_EMOJIS,
  REGION_TAGLINES,
  regionToSlug,
  slugToRegion,
} from "@/lib/regions";

export const alt = "Vacances par région française · MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ALL_REGIONS: string[] = [
  ...METRO_REGIONS,
  "La Réunion",
  "Martinique",
  "Guadeloupe",
  "Guyane",
  "Mayotte",
];

export function generateImageMetadata() {
  return ALL_REGIONS.map((r) => ({
    id: regionToSlug(r),
    alt: `Vacances en ${r} · MeilleurVille`,
    size,
    contentType,
  }));
}

// Subtle palette per region — coastal blues, mountain greens, Med oranges, etc.
const REGION_HUE: Record<string, string> = {
  "auvergne-rhone-alpes":      "#bbf7d0",
  "bourgogne-franche-comte":   "#fecaca",
  "bretagne":                  "#bae6fd",
  "centre-val-de-loire":       "#fef3c7",
  "corse":                     "#fed7aa",
  "grand-est":                 "#e0e7ff",
  "hauts-de-france":           "#fef9c3",
  "ile-de-france":             "#fae8ff",
  "normandie":                 "#cffafe",
  "nouvelle-aquitaine":        "#fecaca",
  "occitanie":                 "#fed7aa",
  "pays-de-la-loire":          "#bae6fd",
  "provence-alpes-cote-d-azur": "#fed7aa",
  "la-reunion":                "#bbf7d0",
  "martinique":                "#fbcfe8",
  "guadeloupe":                "#a5f3fc",
  "guyane":                    "#bbf7d0",
  "mayotte":                   "#fef3c7",
};

type Props = { params: Promise<{ region: string }> };

export default async function Image({ params }: Props) {
  const { region } = await params;
  const r = slugToRegion(region, ALL_REGIONS) ?? "Vacances";
  const hue = REGION_HUE[region] ?? "#e0f2fe";
  const emoji = REGION_EMOJIS[r] ?? "🗺️";
  const tagline = REGION_TAGLINES[r] ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: `radial-gradient(ellipse 80% 70% at 25% 30%, ${hue} 0%, transparent 60%), #ffffff`,
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "60px 64px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                background: "#0D9488",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "20px",
                fontWeight: 900,
              }}
            >
              M
            </div>
            <span style={{ color: "#0F172A", fontSize: "22px", fontWeight: 700 }}>
              Meilleur<span style={{ color: "#0D9488" }}>Ville</span>
            </span>
          </div>
          <div
            style={{
              background: "rgba(13,148,136,0.10)",
              border: "1px solid rgba(13,148,136,0.30)",
              borderRadius: "999px",
              padding: "8px 18px",
              color: "#0D9488",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            🌴 Vacances · {r}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ color: "#0D9488", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700 }}>
            Vacances en
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "20px" }}>
            <span style={{ fontSize: "100px" }}>{emoji}</span>
            <div style={{ color: "#0F172A", fontSize: "70px", fontWeight: 900, lineHeight: 0.95 }}>
              {r}
            </div>
          </div>
          {tagline && (
            <div style={{ color: "#475569", fontSize: "20px", marginTop: "12px", maxWidth: "900px" }}>
              {tagline}
            </div>
          )}
        </div>

        <div style={{ color: "#64748B", fontSize: "15px" }}>
          Top destinations classées · activités phares · meilleurs mois · Booking
        </div>
      </div>
    ),
    { ...size }
  );
}
