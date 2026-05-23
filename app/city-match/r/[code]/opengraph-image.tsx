import { ImageResponse } from "next/og";
import { decodeAnswers, topMatchesWithSurprise, CITY_MATCH_QUESTIONS } from "@/lib/city-match";

export const alt = "City Match — votre ville française à X %";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ code: string }> };

function scoreHex(score: number): string {
  if (score >= 7.5) return "#A855F7";
  if (score >= 7.0) return "#16A34A";
  if (score >= 6.0) return "#84CC16";
  if (score >= 5.0) return "#F59E0B";
  if (score >= 4.0) return "#F97316";
  return "#EF4444";
}

export default async function Image({ params }: Props) {
  const { code } = await params;
  const answers = decodeAnswers(code);
  const { top } = topMatchesWithSurprise(answers, 3);
  const t1 = top[0];
  const t2 = top[1];
  const t3 = top[2];

  if (!t1) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 48 }}>
          City Match · MaVilleIdeal
        </div>
      ),
      { ...size },
    );
  }

  const headlineColor = scoreHex(t1.city.scores.global);
  const priorityChips = answers
    .map((a) => {
      const q = CITY_MATCH_QUESTIONS.find((q) => q.id === a.id);
      return q?.options.find((o) => o.value === a.value)?.label;
    })
    .filter((s): s is string => Boolean(s))
    .slice(0, 4);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0B1E14 0%, #15301F 60%, #1F3A2A 100%)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: 64,
          color: "#E5E7EB",
          position: "relative",
        }}
      >
        {/* Aurora blob */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: `${headlineColor}55`,
            filter: "blur(120px)",
          }}
        />

        {/* Branding */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#84CC16", letterSpacing: 3, textTransform: "uppercase" }}>
            City Match · MaVilleIdeal
          </div>
          <div style={{ fontSize: 18, color: "#A8C4A8" }}>mavilleideale.fr</div>
        </div>

        {/* Main */}
        <div style={{ marginTop: 48, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, color: "#A8C4A8", marginBottom: 12, letterSpacing: 1 }}>
            Mon match parmi 540 villes françaises
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
            <div style={{ fontSize: 96, fontWeight: 900, color: "#FFFFFF", letterSpacing: -2, lineHeight: 1 }}>
              {t1.city.name}
            </div>
            <div style={{ fontSize: 72, fontWeight: 900, color: headlineColor, letterSpacing: -2 }}>
              {t1.percent}%
            </div>
          </div>
          <div style={{ fontSize: 22, color: "#C4D5C0", marginTop: 8 }}>
            {t1.city.region}
          </div>
        </div>

        {/* Top reasons */}
        {t1.topReasons.length > 0 && (
          <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 1000 }}>
            {t1.topReasons.map((reason, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  background: "rgba(132, 204, 22, 0.16)",
                  color: "#BEF264",
                  padding: "8px 16px",
                  borderRadius: 999,
                  fontSize: 18,
                  fontWeight: 600,
                  border: "1px solid rgba(132, 204, 22, 0.3)",
                }}
              >
                {reason}
              </div>
            ))}
          </div>
        )}

        {/* Runner-ups */}
        <div style={{ marginTop: "auto", display: "flex", gap: 20 }}>
          {[t2, t3].filter(Boolean).map((t) => (
            <div
              key={t!.city.slug}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: 16,
                background: "rgba(255,255,255,0.06)",
                borderRadius: 16,
                minWidth: 240,
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div style={{ fontSize: 16, color: "#A8C4A8", letterSpacing: 2, textTransform: "uppercase" }}>
                Suivante
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#FFFFFF" }}>{t!.city.name}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: scoreHex(t!.city.scores.global) }}>
                  {t!.percent}%
                </div>
              </div>
              <div style={{ fontSize: 14, color: "#8FA88A" }}>{t!.city.region}</div>
            </div>
          ))}

          {/* Priorities ribbon */}
          {priorityChips.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginLeft: "auto",
                alignItems: "flex-end",
                maxWidth: 440,
              }}
            >
              <div style={{ fontSize: 14, color: "#A8C4A8", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
                Priorités déclarées
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "flex-end" }}>
                {priorityChips.map((label, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      background: "rgba(255,255,255,0.08)",
                      color: "#E5E7EB",
                      padding: "4px 10px",
                      borderRadius: 999,
                      fontSize: 13,
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
