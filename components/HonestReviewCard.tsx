import Link from "next/link";
import { ThumbsUp, ThumbsDown, CheckCircle2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { HonestReviewLite } from "@/lib/city-profile-data";

// review/citiesCount come from the server caller — buildHonestReview and
// site-stats both drag the full seed (and guides) into the client bundle.
interface Props {
  cityName: string;
  citySlug: string;
  review: HonestReviewLite;
  citiesCount: number;
  /** Compact = no "Avis honnête" full page link. Used when this card itself
      lives on /villes/[slug]/avis-honnete. */
  compact?: boolean;
  locale?: "fr" | "en";
}

/** FR profile slug → EN /for-who/ slug. Falls back to the FR slug when unknown. */
const PROFILE_EN_SLUG: Record<string, string> = {
  "familles-avec-enfants": "families",
  "jeunes-actifs": "young-professionals",
  retraites: "retirees",
  freelances: "freelancers",
  teletravailleurs: "remote-workers",
  etudiants: "students",
  "sans-voiture": "car-free",
  premium: "premium",
  "solo-femme": "women-solo",
  "couple-sans-enfant": "couples",
  "expat-retour": "returning-expats",
  "primo-accedants": "first-time-buyers",
  "familles-monoparentales": "single-parents",
  "familles-nombreuses": "large-families",
  "amateurs-de-plein-air": "outdoor-lovers",
};

function ratingBadge(score: number): { label: string; tone: string } {
  if (score >= 7.5) return { label: score.toFixed(1), tone: "bg-purple-500/15 text-purple-700 border-purple-400/30" };
  if (score >= 6.0) return { label: score.toFixed(1), tone: "bg-lime-500/15 text-lime-700 border-lime-400/30" };
  if (score >= 4.5) return { label: score.toFixed(1), tone: "bg-amber-500/15 text-amber-700 border-amber-400/30" };
  return { label: score.toFixed(1), tone: "bg-red-500/15 text-red-700 border-red-400/30" };
}

export function HonestReviewCard({ cityName, citySlug, review, citiesCount, compact = false, locale = "fr" }: Props) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-[var(--accent)]" />
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          {L(`Avis honnête sur ${cityName}`, `Honest take on ${cityName}`)}
        </h2>
        <span className="ml-auto inline-flex items-center rounded-full border border-blue-400/30 bg-blue-500/10 text-blue-700 px-1.5 py-0.5 text-[10px] uppercase tracking-wider">
          {L("Synthèse", "Summary")}
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
              {L("Ce qui est vraiment bon", "What's genuinely good")}
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
              {L(
                "Pas de score ≥ 7,0 — ville profil correct mais sans excellence marquée.",
                "No score ≥ 7.0 — a solid all-rounder, but nothing it really stands out at.",
              )}
            </p>
          )}
        </div>

        {/* Points de vigilance */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <ThumbsDown className="h-3.5 w-3.5 text-red-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700">
              {L("À regarder de près", "Worth a closer look")}
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
              {L(
                "Aucun score ≤ 4,8 — pas de faiblesse rédhibitoire identifiée.",
                "No score ≤ 4.8 — no dealbreaker weakness to flag.",
              )}
            </p>
          )}
        </div>
      </div>

      {/* Profile fit */}
      <div className="pt-4 border-t border-[var(--border)]/60">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              {L("Convient à", "Good fit for")}
            </span>
          </div>
          {review.perfectFor.length > 0 ? (
            <>
              {review.perfectFor.some((f) => f.soft) && (
                <p className="text-[11px] text-[var(--text-tertiary)] mb-2 italic">
                  {locale === "en" ? (
                    <>
                      Not in the top 30 for any specific profile, but here are the two {cityName} is still <em>a reasonable fit</em> for:
                    </>
                  ) : (
                    <>
                      Pas dans le top 30 d&apos;un profil spécifique, mais voici les deux pour lesquels {cityName} reste <em>plutôt adaptée</em> :
                    </>
                  )}
                </p>
              )}
              <ul className="space-y-1.5">
                {review.perfectFor.map((f) => (
                  <li key={f.profile.slug} className="text-sm">
                    <Link
                      href={
                        locale === "en"
                          ? `/for-who/${PROFILE_EN_SLUG[f.profile.slug] ?? f.profile.slug}`
                          : `/pour-qui/${f.profile.slug}`
                      }
                      className="inline-flex items-center gap-1 text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                    >
                      <span aria-hidden>{f.profile.emoji}</span>
                      {f.profile.label}
                      <span className="text-[11px] text-[var(--text-tertiary)] ml-1">
                        {L(`(#${f.rank} sur ${citiesCount})`, `(#${f.rank} of ${citiesCount})`)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-xs text-[var(--text-tertiary)]">
              {L(
                "Aucun profil ne ressort sur cette ville. Vous pouvez la considérer comme un choix généraliste sans signature forte.",
                "No profile stands out for this city. Treat it as a generalist pick with no strong signature.",
              )}
            </p>
          )}
        </div>
      </div>

      {!compact && (
        <div className="mt-5 pt-3 border-t border-[var(--border)]/60 flex items-center justify-between gap-3 text-xs text-[var(--text-tertiary)]">
          <span>
            {locale === "en" ? (
              <>
                Algorithmic summary — 8 seed axes + 10 owner scores + ranking across the 10 profiles.
                See <Link href="/methodology" className="underline">methodology</Link>.
              </>
            ) : (
              <>
                Synthèse algorithmique — 8 axes seed + 10 owner scores + classement parmi les 10 profils.
                Voir <Link href="/methode" className="underline">méthodologie</Link>.
              </>
            )}
          </span>
          <Link
            href={locale === "en" ? `/cities/${citySlug}/honest-review` : `/villes/${citySlug}/avis-honnete`}
            className="text-[var(--accent)] font-semibold whitespace-nowrap hover:underline"
          >
            {L("Page dédiée →", "Full page →")}
          </Link>
        </div>
      )}
    </Card>
  );
}
