import { cityVibe, VIBE_META, type VibeTone } from "@/lib/vibe";
import type { CitySeed } from "@/data/cities-seed";

const VIBE_META_EN: Record<VibeTone, { label: string; desc: string }> = {
  calme: { label: "Calm", desc: "Quiet, a good place to slow down" },
  animé: { label: "Lively", desc: "Good energy, shops busy" },
  festif: { label: "Festive", desc: "Events, nightlife, café terraces" },
  chargé: { label: "Hectic", desc: "Dense, stressful, always on the move" },
  ressourcant: { label: "Restorative", desc: "Nature within reach, fresh air" },
};

// breakdown sentences come from lib/vibe.ts (French); translate at the display site.
function translateBreakdown(b: string): string {
  const numMatch = b.match(/\(([\d.]+)\/10\)/);
  const score = numMatch ? ` (${numMatch[1]}/10)` : "";
  if (b.startsWith("Score nature élevé")) return `High nature score${score}`;
  if (b === "Coût de la vie modéré") return "Moderate cost of living";
  if (b.startsWith("Score culture élevé")) return `High culture score${score}`;
  if (b === "Qualité de vie supérieure") return "Above-average quality of life";
  if (b.startsWith("Score global fort")) return `Strong overall score${score}`;
  if (b === "Bonne qualité de vie") return "Good quality of life";
  if (b.startsWith("Sécurité perfectible")) return `Safety could be better${score}`;
  if (b === "Réseau de transport limité") return "Limited transport network";
  if (b === "Coût de la vie élevé") return "High cost of living";
  if (b === "Cadre naturel présent") return "Some greenery around";
  if (b === "Environnement sécurisé") return "Safe environment";
  if (b === "Transports corrects") return "Decent transport";
  if (b.startsWith("Qualité de vie")) return `Quality of life${score}`;
  return b;
}

export function VibeWidget({
  city,
  locale = "fr",
}: {
  city: CitySeed;
  locale?: "fr" | "en";
}) {
  const t = (fr: string, en: string) => (locale === "en" ? en : fr);
  const { tone, breakdown } = cityVibe(city);
  const meta = VIBE_META[tone];
  const metaEn = VIBE_META_EN[tone];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
          {t("Ambiance", "Vibe")}
        </span>
        <span
          className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700"
          title={t(
            "Estimation éditoriale — non issue de données en temps réel",
            "Editorial estimate — not based on real-time data",
          )}
        >
          {t("ESTIMÉ", "ESTIMATE")}
        </span>
      </div>
      <div className={`flex items-center gap-2 text-sm font-bold ${meta.color}`}>
        <span aria-hidden>{meta.emoji}</span>
        <span>{t(meta.label, metaEn.label)}</span>
      </div>
      <p className="mt-1 text-xs text-[var(--text-tertiary)] leading-snug">{t(meta.desc, metaEn.desc)}</p>
      {breakdown.length > 0 && (
        <ul className="mt-2 space-y-0.5">
          {breakdown.map((b) => (
            <li key={b} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
              <span className="mt-1 inline-block h-1 w-1 rounded-full bg-[var(--text-tertiary)] shrink-0" />
              {t(b, translateBreakdown(b))}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
