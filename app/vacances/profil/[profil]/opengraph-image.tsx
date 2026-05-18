import { ImageResponse } from "next/og";
import {
  VACATION_PROFILES,
  VACATION_PROFILE_DEFS,
  type VacationProfile,
} from "@/lib/vacation-fit";

export const alt = "Vacances par profil voyageur · MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateImageMetadata() {
  return VACATION_PROFILES.map((slug) => ({
    id: slug,
    alt: `Vacances ${VACATION_PROFILE_DEFS[slug].label.toLowerCase()} en France · MeilleurVille`,
    size,
    contentType,
  }));
}

const PROFILE_HUE: Record<VacationProfile, string> = {
  famille:  "#fbcfe8",
  couple:   "#fecaca",
  solo:     "#bae6fd",
  amis:     "#fed7aa",
  seniors:  "#bbf7d0",
};

type Props = { params: Promise<{ profil: string }> };

export default async function Image({ params }: Props) {
  const { profil } = await params;
  const slug = profil as VacationProfile;
  const def = VACATION_PROFILE_DEFS[slug];
  const hue = PROFILE_HUE[slug] ?? "#e0f2fe";

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
            🌴 Vacances · {def.label}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ color: "#0D9488", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700 }}>
            Vacances en France
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "20px" }}>
            <span style={{ fontSize: "100px" }}>{def.emoji}</span>
            <div style={{ color: "#0F172A", fontSize: "76px", fontWeight: 900, lineHeight: 0.95 }}>
              {def.label.toLowerCase()}
            </div>
          </div>
          <div style={{ color: "#475569", fontSize: "20px", marginTop: "12px", maxWidth: "900px" }}>
            {def.intro.slice(0, 140)}{def.intro.length > 140 ? "…" : ""}
          </div>
        </div>

        <div style={{ color: "#64748B", fontSize: "15px" }}>
          Top 20 destinations adaptées · sécurité · qualité de vie · budget
        </div>
      </div>
    ),
    { ...size }
  );
}
