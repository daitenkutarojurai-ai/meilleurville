import { ImageResponse } from "next/og";
import { CITIES_SEED } from "@/data/cities-seed";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ pair: string }> };

function scoreColor(score: number): string {
  if (score >= 8) return "#10b981";
  if (score >= 6) return "#f59e0b";
  return "#ef4444";
}

export default async function Image({ params }: Props) {
  const { pair } = await params;
  const [slugA, slugB] = pair.split("-vs-");
  const seedA = CITIES_SEED.find((c) => c.slug === slugA);
  const seedB = CITIES_SEED.find((c) => c.slug === slugB);
  if (!seedA || !seedB) return new Response("Not found", { status: 404 });

  const winsA = (["global", "life", "transport", "nature", "cost", "safety", "culture", "remoteWork", "schools"] as const)
    .filter((k) => seedA.scores[k] > seedB.scores[k]).length;
  const winsB = (["global", "life", "transport", "nature", "cost", "safety", "culture", "remoteWork", "schools"] as const)
    .filter((k) => seedB.scores[k] > seedA.scores[k]).length;
  const winner = winsA > winsB ? seedA : winsB > winsA ? seedB : null;

  const CRITERIA: Array<{ key: keyof typeof seedA.scores; label: string }> = [
    { key: "life", label: "Qualité de vie" },
    { key: "cost", label: "Coût de vie" },
    { key: "safety", label: "Sécurité" },
    { key: "transport", label: "Transport" },
    { key: "nature", label: "Nature" },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0d1117",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "50px 60px",
          justifyContent: "space-between",
        }}
      >
        {/* Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ color: "#7c6af0", fontSize: "18px", fontWeight: 700 }}>MeilleurVille</div>
          <div style={{ color: "#30363d", fontSize: "18px" }}>·</div>
          <div style={{ color: "#8b949e", fontSize: "14px" }}>Comparaison qualité de vie 2025</div>
        </div>

        {/* VS title */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flex: 1 }}>
            <div style={{ color: "#f0f6fc", fontSize: "56px", fontWeight: 900, lineHeight: 1 }}>
              {seedA.name}
            </div>
            <div style={{ color: "#8b949e", fontSize: "16px", marginTop: "4px" }}>{seedA.region}</div>
            <div
              style={{
                color: scoreColor(seedA.scores.global),
                fontSize: "40px",
                fontWeight: 900,
                marginTop: "10px",
              }}
            >
              {seedA.scores.global.toFixed(1)}
            </div>
          </div>
          <div
            style={{
              color: "#30363d",
              fontSize: "48px",
              fontWeight: 900,
              padding: "0 16px",
              borderLeft: "2px solid #21262d",
              borderRight: "2px solid #21262d",
            }}
          >
            vs
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", flex: 1 }}>
            <div style={{ color: "#f0f6fc", fontSize: "56px", fontWeight: 900, lineHeight: 1 }}>
              {seedB.name}
            </div>
            <div style={{ color: "#8b949e", fontSize: "16px", marginTop: "4px" }}>{seedB.region}</div>
            <div
              style={{
                color: scoreColor(seedB.scores.global),
                fontSize: "40px",
                fontWeight: 900,
                marginTop: "10px",
              }}
            >
              {seedB.scores.global.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Bottom: criteria comparison + winner */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            {CRITERIA.map(({ key, label }) => {
              const va = seedA.scores[key];
              const vb = seedB.scores[key];
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ color: va > vb ? "#10b981" : "#8b949e", fontSize: "12px", fontWeight: va > vb ? 700 : 400, width: "40px", textAlign: "right" }}>
                    {va.toFixed(1)}
                  </div>
                  <div style={{ color: "#30363d", fontSize: "11px", width: "120px", textAlign: "center" }}>{label}</div>
                  <div style={{ color: vb > va ? "#10b981" : "#8b949e", fontSize: "12px", fontWeight: vb > va ? 700 : 400, width: "40px" }}>
                    {vb.toFixed(1)}
                  </div>
                </div>
              );
            })}
          </div>
          {winner && (
            <div
              style={{
                background: "#0d2818",
                border: "1px solid #10b98130",
                borderRadius: "12px",
                padding: "14px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <div style={{ color: "#10b981", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Recommandé
              </div>
              <div style={{ color: "#10b981", fontSize: "22px", fontWeight: 900 }}>
                {winner.name}
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
