import { ImageResponse } from "next/og";
import { CITIES_SEED } from "@/data/cities-seed";

export const alt = "Climat de la ville — MeilleurVille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return new Response("Not found", { status: 404 });

  const tj = city.avgTempJuly ?? null;
  const ta = city.avgTempJanuary ?? null;
  const sun = city.sunshinedays ?? null;
  const sunDays = sun != null ? Math.round(sun / 9.5) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0d1117 0%, #1c2731 60%, #0e2030 100%)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "60px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0D9488" /><path d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z" fill="white" /><circle cx="16" cy="13" r="3.5" fill="#0D9488" /></svg>
            <span style={{ color: "#0D9488", fontSize: 20, fontWeight: 700 }}>MeilleurVille</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #30363d", borderRadius: 8, padding: "6px 14px", color: "#9aaab8", fontSize: 14 }}>
            Climat
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ color: "#9aaab8", fontSize: 16, letterSpacing: 2, textTransform: "uppercase" }}>
            Climat à
          </div>
          <div
            style={{
              color: "#f0f6fc",
              fontSize: city.name.length > 12 ? 80 : 96,
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            {city.name}
          </div>
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          <Tile label="Juillet" value={tj != null ? `${tj} °C` : "—"} accent="#F59E0B" />
          <Tile label="Janvier" value={ta != null ? `${ta} °C` : "—"} accent="#0EA5E9" />
          <Tile label="Soleil / an" value={sunDays != null ? `${sunDays} j` : "—"} accent="#F97316" />
        </div>
      </div>
    ),
    { ...size }
  );
}

function Tile({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      style={{
        flex: 1,
        background: "rgba(255,255,255,0.04)",
        border: `2px solid ${accent}55`,
        borderRadius: 18,
        padding: "22px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <span style={{ color: "#9aaab8", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
      <span style={{ color: accent, fontSize: 56, fontWeight: 900, lineHeight: 1 }}>{value}</span>
    </div>
  );
}
