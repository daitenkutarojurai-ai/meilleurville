// F63 — one tie-aware ranking list (lib/air-measured-ranking). Server component.

import Link from "@/components/AppLink";
import type { AirRanking } from "@/lib/air-measured-ranking";
import type { AirPollutant } from "@/lib/city-air";

export function AirRankingList({
  ranking,
  pollutant,
  title,
  locale = "fr",
}: {
  ranking: AirRanking;
  pollutant: AirPollutant;
  title: string;
  locale?: "fr" | "en";
}) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const nf = (n: number) => n.toLocaleString(locale === "en" ? "en-GB" : "fr-FR", { maximumFractionDigits: 1, minimumFractionDigits: pollutant === "o3" ? 0 : 1 });
  const unit = pollutant === "o3" ? L("j", "d") : "µg/m³";
  const href = (slug: string) => (locale === "en" ? `/cities/${slug}/air-quality` : `/villes/${slug}/air`);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-3">{title}</h3>
      <ol className="space-y-1.5">
        {ranking.tiers.map((t) => (
          <li key={t.rank} className="flex gap-3 text-sm">
            <span className="w-8 shrink-0 text-right font-mono-data text-[var(--text-tertiary)]">
              {t.entries.length > 1 ? `${t.rank}=` : t.rank}
            </span>
            <span className="flex-1 min-w-0">
              {t.entries.map((e, i) => (
                <span key={e.slug}>
                  {i > 0 && ", "}
                  <Link href={href(e.slug)} className="text-[var(--text-primary)] hover:text-[var(--accent)] hover:underline">
                    {e.name}
                  </Link>
                </span>
              ))}
              <span className="block text-[11px] text-[var(--text-tertiary)]">
                {/* A tier groups equal VALUES, which may come from different
                    stations (Châteauroux and Saint-Paul both read 6.7): name
                    each station, and say "shared" only when it really is one. */}
                {(() => {
                  const stations = [...new Set(t.entries.map((e) => e.measure.station))];
                  if (stations.length === 1) {
                    return `${L("station", "station")} ${stations[0]}${t.entries.length > 1 ? L(" (station commune)", " (shared station)") : ""}`;
                  }
                  return `${L("stations", "stations")} ${stations.join(" · ")}`;
                })()}
              </span>
            </span>
            <span className="shrink-0 font-mono-data font-semibold tabular-nums text-[var(--text-primary)]">
              {nf(t.value)} <span className="text-[10px] font-normal text-[var(--text-tertiary)]">{unit}</span>
            </span>
          </li>
        ))}
      </ol>
      {ranking.nextTier && (
        <p className="mt-3 text-[11px] text-[var(--text-tertiary)]">
          {L(
            `Suivant : ${ranking.nextTier.count} ville${ranking.nextTier.count > 1 ? "s" : ""} à ${nf(ranking.nextTier.value)} ${unit}, non publiée${ranking.nextTier.count > 1 ? "s" : ""} pour ne pas couper une égalité.`,
            `Next: ${ranking.nextTier.count} cit${ranking.nextTier.count > 1 ? "ies" : "y"} at ${nf(ranking.nextTier.value)} ${unit}, left out rather than split a tie.`,
          )}
        </p>
      )}
    </div>
  );
}
