import Link from "next/link";
import { ThumbsUp, ThumbsDown, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { buildHonestReview } from "@/lib/honest-reviews";
import { CITIES_COUNT } from "@/lib/site-stats";
import type { CitySeed } from "@/data/cities-seed";

interface Props {
  city: CitySeed;
  /** Compact = no "Avis honnête" full page link. Used when this card itself
      lives on /villes/[slug]/avis-honnete. */
  compact?: boolean;
}

function ratingBadge(score: number): { label: string; tone: string } {
  if (score >= 7.5) return { label: score.toFixed(1), tone: "bg-emerald-500/15 text-emerald-700 border-emerald-400/30" };
  if (score >= 6.0) return { label: score.toFixed(1), tone: "bg-lime-500/15 text-lime-700 border-lime-400/30" };
  if (score >= 4.5) return { label: score.toFixed(1), tone: "bg-amber-500/15 text-amber-700 border-amber-400/30" };
  return { label: score.toFixed(1), tone: "bg-red-500/15 text-red-700 border-red-400/30" };
}

export function HonestReviewCard({ city, compact = false }: Props) {
  const review = buildHonestReview(city);

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-[var(--accent)]" />
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          Avis honnête sur {city.name}
        </h2>
        <span className="ml-auto inline-flex items-center rounded-full border border-blue-400/30 bg-blue-500/10 text-blue-700 px-1.5 py-0.5 text-[10px] uppercase tracking-wider">
          Synthèse
        </span>
      </div>

      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5 italic">
        « {review.oneLine} »
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Coups de cœur */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Ce qui est vraiment bon
            </span>
          </div>
          {review.strengths.length > 0 ? (
            <ul className="space-y-2">
              {review.strengths.map((b, i) => {
                const badge = ratingBadge(b.score);
                return (
                  <li key={i} className="flex items-start justify-between gap-2 text-sm">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-[var(--text-primary)]">{b.label}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{b.detail}</div>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-mono-data font-semibold shrink-0 ${badge.tone}`}
                    >
                      {badge.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-xs text-[var(--text-tertiary)]">
              Pas de score ≥ 7,0 — ville profil correct mais sans excellence marquée.
            </p>
          )}
        </div>

        {/* Points de vigilance */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <ThumbsDown className="h-3.5 w-3.5 text-red-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700">
              À regarder de près
            </span>
          </div>
          {review.weaknesses.length > 0 ? (
            <ul className="space-y-2">
              {review.weaknesses.map((b, i) => {
                const badge = ratingBadge(b.score);
                return (
                  <li key={i} className="flex items-start justify-between gap-2 text-sm">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-[var(--text-primary)]">{b.label}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{b.detail}</div>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-mono-data font-semibold shrink-0 ${badge.tone}`}
                    >
                      {badge.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-xs text-[var(--text-tertiary)]">
              Aucun score ≤ 4,8 — pas de faiblesse rédhibitoire identifiée.
            </p>
          )}
        </div>
      </div>

      {/* Profile fit */}
      <div className="pt-4 border-t border-[var(--border)]/60 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Convient à
            </span>
          </div>
          {review.perfectFor.length > 0 ? (
            <>
              {review.perfectFor.some((f) => f.soft) && (
                <p className="text-[11px] text-[var(--text-tertiary)] mb-2 italic">
                  Pas dans le top 30 d&apos;un profil spécifique, mais voici les deux pour lesquels {city.name} reste <em>plutôt adaptée</em> :
                </p>
              )}
              <ul className="space-y-1.5">
                {review.perfectFor.map((f) => (
                  <li key={f.profile.slug} className="text-sm">
                    <Link
                      href={`/pour-qui/${f.profile.slug}`}
                      className="inline-flex items-center gap-1 text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                    >
                      <span aria-hidden>{f.profile.emoji}</span>
                      {f.profile.label}
                      <span className="text-[11px] text-[var(--text-tertiary)] ml-1">
                        (#{f.rank} sur {CITIES_COUNT})
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-xs text-[var(--text-tertiary)]">
              Aucun profil ne ressort sur cette ville. Vous pouvez la considérer comme un choix généraliste sans signature forte.
            </p>
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <XCircle className="h-3.5 w-3.5 text-red-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700">
              À éviter si
            </span>
          </div>
          {review.avoidIf.length > 0 ? (
            <>
              {review.avoidIf.some((f) => f.soft) && (
                <p className="text-[11px] text-[var(--text-tertiary)] mb-2 italic">
                  Aucun profil rédhibitoire — voici simplement les deux pour lesquels {city.name} est <em>moins forte</em> :
                </p>
              )}
              <ul className="space-y-1.5">
                {review.avoidIf.map((f) => (
                  <li key={f.profile.slug} className="text-sm">
                    <span className="inline-flex items-center gap-1 text-[var(--text-primary)]">
                      <span aria-hidden>{f.profile.emoji}</span>
                      {f.soft ? (
                        <>Moins adaptée si vous êtes <strong className="font-semibold">{f.profile.label.toLowerCase()}</strong></>
                      ) : (
                        <>Vous êtes <strong className="font-semibold">{f.profile.label.toLowerCase()}</strong></>
                      )}
                    </span>
                    <span className="text-[11px] text-[var(--text-tertiary)] block ml-5">
                      #{f.rank} sur {CITIES_COUNT} — {f.soft ? "d'autres villes collent mieux à ce profil" : "d'autres villes sont mieux placées"}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-xs text-[var(--text-tertiary)]">
              Aucun profil pour lequel cette ville est nettement disqualifiée.
            </p>
          )}
        </div>
      </div>

      {!compact && (
        <div className="mt-5 pt-3 border-t border-[var(--border)]/60 flex items-center justify-between gap-3 text-xs text-[var(--text-tertiary)]">
          <span>
            Synthèse algorithmique — 8 axes seed + 10 owner scores + classement parmi les 10 profils.
            Voir <Link href="/methode" className="underline">méthodologie</Link>.
          </span>
          <Link
            href={`/villes/${city.slug}/avis-honnete`}
            className="text-[var(--accent)] font-semibold whitespace-nowrap hover:underline"
          >
            Page dédiée →
          </Link>
        </div>
      )}
    </Card>
  );
}
