import Link from "@/components/AppLink";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn, formatNumber, formatScore, scoreHex, scoreColor, scoreLabel } from "@/lib/utils";
import type { City } from "@/lib/types";
import { HOUSING } from "@/data/housing";
import { cardPhoto } from "@/lib/city-cards";
import { FavoriteButton } from "@/components/effects/FavoriteButton";

interface CityCardProps {
  city: City;
  rank?: number;
  className?: string;
  locale?: "fr" | "en";
}

const TIER_EN: Record<string, string> = {
  exceptionnel: "exceptional", excellent: "excellent", bon: "good",
  moyen: "average", "en dessous": "below average", mauvais: "poor",
};

export function CityCard({ city, rank, className, locale = "fr" }: CityCardProps) {
  const score = city.scores.global;
  // One flat tier colour. The old stripe blended two tiers (green→lime,
  // lime→amber), so a 7.0 card read as half "Bon".
  const tierHex = scoreHex(score);
  const photo = cardPhoto(city.slug);
  const frTier = scoreLabel(score);
  const tier = locale === "en" ? TIER_EN[frTier] ?? frTier : frTier;
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);

  return (
    <div
      className={cn(
        "group relative h-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] transition-all duration-200 hover:border-[var(--accent)]/40 hover:shadow-xl hover:shadow-[var(--accent)]/10 hover:-translate-y-0.5 cursor-pointer",
        className
      )}
    >
      <Link
        href={locale === "en" ? `/cities/${city.slug}` : `/villes/${city.slug}`}
        aria-label={`${city.name} — score ${formatScore(score)} ${L("sur", "out of")} 10 (${tier})`}
        className="absolute inset-0 z-[1]"
      />
        {/* Photo cover — falls back to a topo sheet so a city without a
            Commons photo keeps the same card height in the grid. */}
        {photo ? (
          <div className="relative h-32 overflow-hidden">
            <img
              src={photo.src}
              width={photo.width}
              height={photo.height}
              alt=""
              loading="lazy"
              decoding="async"
              style={{ backgroundColor: photo.color }}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            {/* No links here: the whole card is already an <a>. The linked
                attribution lives on the city page the card points to. */}
            <span className="absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-black/60 to-transparent px-2.5 pb-1 pt-5 text-right text-[9px] leading-tight text-white/70">
              {photo.author ?? "Wikimedia Commons"} · {photo.license}
            </span>
          </div>
        ) : (
          /* No photo: a survey-map sheet with the name on an enamel plaque —
             a place name, never the score (the stripe below carries that). */
          <div className="topo-bg relative flex h-32 items-center justify-center bg-[var(--bg-canvas)]">
            <span className="plaque max-w-[85%] truncate text-sm">{city.name}</span>
          </div>
        )}

        {/* Score stripe — the tier colour, flat. */}
        <div className="h-1.5" style={{ background: tierHex }} aria-hidden="true" />

        <div className="p-5">
          <div className="absolute top-2 right-2 z-[2] flex items-center gap-1.5">
            <FavoriteButton slug={city.slug} size={14} className="!px-2 !py-1.5" />
            {rank && (
              <div className="flex h-7 min-w-7 items-center justify-center rounded-md border border-[var(--accent)]/30 bg-[var(--bg-surface)] px-1.5 shadow-sm">
                <span className="text-xs font-bold font-mono-data text-[var(--accent)]">
                  <span className="text-[9px] font-semibold opacity-70">{L("n°", "#")}</span>{rank}
                </span>
              </div>
            )}
          </div>

          <div className="mb-3">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--accent)]" />
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {city.name}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {city.region} · {city.population ? formatNumber(city.population) + L(" hab.", " pop.") : "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-3">
            <div className={cn("text-3xl font-bold font-mono-data", scoreColor(score))} title={`Score ${tier}`}>
              {formatScore(score)}
              <span className="sr-only"> {L("sur", "out of")} 10 — {tier}</span>
            </div>
            {/* No "{n} avis" — that count was synthesized from the score. */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-canvas)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">
              <span className="h-2 w-2 rounded-full" style={{ background: tierHex }} aria-hidden="true" />
              {tier}
            </span>
          </div>

          {/* Mini score grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: L("Nature", "Nature"), val: city.scores.nature },
              { label: L("Transport", "Transport"), val: city.scores.transport },
              { label: L("Coût", "Cost"), val: city.scores.cost },
            ].map(({ label, val }) => (
              <div
                key={label}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-canvas)] p-2 text-center group-hover:border-[var(--accent)]/25 transition-colors"
              >
                <div className="text-xs font-mono-data font-semibold text-[var(--text-primary)]">
                  {formatScore(val)}
                </div>
                <div className="mt-1 h-1 rounded-full bg-[var(--border)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${(val / 10) * 100}%`, background: scoreHex(val) }}
                  />
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {city.characterTags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="subtle" className="capitalize text-[10px]">
                {tag}
              </Badge>
            ))}
            {HOUSING[city.slug] && (
              <span className="ml-auto text-[10px] text-[var(--text-tertiary)] font-mono-data">
                T2 ~{HOUSING[city.slug].avgRentT2}€
              </span>
            )}
          </div>
        </div>
    </div>
  );
}
