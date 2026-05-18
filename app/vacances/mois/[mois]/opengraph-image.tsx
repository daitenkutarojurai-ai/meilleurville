import { ImageResponse } from "next/og";
import {
  MONTHS,
  monthSlugToIndex,
  formatMonthLabel,
} from "@/lib/vacation-seasons";

export const alt = "Où partir en France ce mois-ci · MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Pre-render all 12 month variants.
export function generateImageMetadata() {
  return MONTHS.map((slug) => ({
    id: slug,
    alt: `Où partir en France en ${slug} · MeilleurVille`,
    size,
    contentType,
  }));
}

const MONTH_VIBES: Record<string, { hue: string; tagline: string; emoji: string }> = {
  janvier:   { hue: "#cffafe", tagline: "Ski, citytrip, prix bas",            emoji: "❄️" },
  février:   { hue: "#cffafe", tagline: "Ski, carnavals, prix encore bas",    emoji: "❄️" },
  mars:      { hue: "#dbeafe", tagline: "Mimosas, citytrips au calme",        emoji: "🌱" },
  avril:     { hue: "#dcfce7", tagline: "Printemps doux, vignobles éveillés", emoji: "🌷" },
  mai:       { hue: "#dcfce7", tagline: "Le mois sweet-spot",                 emoji: "🌼" },
  juin:      { hue: "#fef9c3", tagline: "Plages encore peu fréquentées",      emoji: "🌊" },
  juillet:   { hue: "#fed7aa", tagline: "Haute saison, météo garantie",       emoji: "☀️" },
  août:      { hue: "#fed7aa", tagline: "Pleine saison, foule dense",         emoji: "🔥" },
  septembre: { hue: "#fef9c3", tagline: "Le meilleur mois de l'année",        emoji: "🍇" },
  octobre:   { hue: "#fde68a", tagline: "Automne photogénique",               emoji: "🍂" },
  novembre:  { hue: "#e7e5e4", tagline: "Grand silence touristique",          emoji: "🍁" },
  décembre:  { hue: "#e0e7ff", tagline: "Marchés de Noël, stations ouvertes", emoji: "🎄" },
};

type Props = { params: Promise<{ mois: string }> };

export default async function Image({ params }: Props) {
  const { mois } = await params;
  const idx = monthSlugToIndex(mois);
  const label = idx ? formatMonthLabel(idx) : "Vacances";
  const vibe = MONTH_VIBES[mois] ?? { hue: "#e0f2fe", tagline: "Vacances en France", emoji: "🌴" };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: `radial-gradient(ellipse 80% 70% at 25% 30%, ${vibe.hue} 0%, transparent 60%), #ffffff`,
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
            🌴 Vacances · {label}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#0D9488", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700 }}>
            Où partir en France
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "18px" }}>
            <span style={{ fontSize: "80px" }}>{vibe.emoji}</span>
            <div style={{ color: "#0F172A", fontSize: "92px", fontWeight: 900, lineHeight: 0.95 }}>
              en {label.toLowerCase()}
            </div>
          </div>
          <div style={{ color: "#475569", fontSize: "22px", marginTop: "10px" }}>
            {vibe.tagline}
          </div>
        </div>

        <div style={{ color: "#64748B", fontSize: "15px" }}>
          Top 10 destinations · climat · affluence · top 3 par activité de saison
        </div>
      </div>
    ),
    { ...size }
  );
}
