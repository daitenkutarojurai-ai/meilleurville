import { ImageResponse } from "next/og";
import { ACTIVITIES, ACTIVITY_DEFS, type ActivitySlug } from "@/lib/vacation-activities";

export const alt = "Vacances par activité en France · MaVilleIdeal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateImageMetadata() {
  return ACTIVITIES.map((slug) => ({
    id: slug,
    alt: `Vacances ${ACTIVITY_DEFS[slug].label.toLowerCase()} en France · MaVilleIdeal`,
    size,
    contentType,
  }));
}

const ACTIVITY_HUE: Record<ActivitySlug, string> = {
  plage:       "#bae6fd",
  montagne:    "#bbf7d0",
  ski:         "#e0e7ff",
  citytrip:    "#fae8ff",
  vignobles:   "#fecaca",
  surf:        "#a5f3fc",
  thermal:     "#fed7aa",
  "road-trip": "#fef3c7",
  gastro:      "#fde68a",
  famille:     "#fbcfe8",
};

type Props = { params: Promise<{ activite: string }> };

export default async function Image({ params }: Props) {
  const { activite } = await params;
  const slug = activite as ActivitySlug;
  const def = ACTIVITY_DEFS[slug];
  const hue = ACTIVITY_HUE[slug] ?? "#e0f2fe";

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
            <svg width="36" height="36" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
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
            🌴 Vacances · {def.label}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ color: "#0D9488", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700 }}>
            Vacances en France
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "20px" }}>
            <span style={{ fontSize: "100px" }}>{def.emoji}</span>
            <div style={{ color: "#0F172A", fontSize: "84px", fontWeight: 900, lineHeight: 0.95 }}>
              {def.label}
            </div>
          </div>
          <div style={{ color: "#475569", fontSize: "20px", marginTop: "12px", maxWidth: "900px" }}>
            {def.intro.slice(0, 140)}{def.intro.length > 140 ? "…" : ""}
          </div>
        </div>

        <div style={{ color: "#64748B", fontSize: "15px" }}>
          Top 15 destinations classées · meilleurs mois · budget · Booking
        </div>
      </div>
    ),
    { ...size }
  );
}
