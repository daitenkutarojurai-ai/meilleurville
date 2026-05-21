import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ThumbsUp, ThumbsDown, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { CITIES_SEED } from "@/data/cities-seed";
import { computeOwnerScores } from "@/lib/owner-scores";
import { buildHonestReview } from "@/lib/honest-reviews";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { CITIES_COUNT } from "@/lib/site-stats";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };
type Seed = (typeof CITIES_SEED)[number];

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  return {
    title: `Honest review of ${city.name} 2026 — strengths, weaknesses, who it suits`,
    description: `What actually works about ${city.name}, what doesn't, and which profiles fit. Derived from 8 seed axes + 10 owner scores + rankings across ${CITIES_COUNT} French cities.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/honest-review` },
  };
}

const AXIS_EN: Record<string, { label: string; pro: string; con: string }> = {
  life: { label: "Quality of life", pro: "Outstanding everyday quality of life", con: "Everyday life lacks distinction" },
  transport: { label: "Transport", pro: "Dense network — no car needed", con: "Car almost mandatory" },
  nature: { label: "Nature access", pro: "Direct access to nature, water or mountains", con: "Very few accessible green spaces" },
  cost: { label: "Cost of living", pro: "Affordable rents and prices", con: "Purchasing power under pressure" },
  safety: { label: "Safety", pro: "High sense of personal safety", con: "Significant perceived insecurity" },
  culture: { label: "Culture", pro: "Rich cultural scene and festivals", con: "Thin cultural offering" },
  remoteWork: { label: "Remote work", pro: "Fibre + coworking + great setting", con: "Below-average remote-work conditions" },
  schools: { label: "Schools", pro: "Top-tier schooling options", con: "Below-average school choice" },
};

const OWNER_LABEL_EN: Record<string, string> = {
  score_canicule: "Heat resilience",
  score_solitude: "Social connection",
  score_bruit: "Noise level",
  score_securite_nocturne: "Night safety",
  score_sans_voiture: "Car-free living",
  score_teletravail: "Remote connectivity",
  score_qualite_air: "Air quality",
  score_securite_femme_seule: "Safety for women",
  score_jeune_actif: "Young professional scene",
  score_famille: "Family-friendliness",
};

const OWNER_EN_PRO: Record<string, string> = {
  score_canicule: "Stays cool in summer",
  score_solitude: "Strong social fabric — low isolation risk",
  score_bruit: "Quieter than average",
  score_securite_nocturne: "Safe to go out at night",
  score_sans_voiture: "Fully liveable without a car",
  score_teletravail: "Great connectivity for remote work",
  score_qualite_air: "Excellent air quality",
  score_securite_femme_seule: "Safe for women living alone",
  score_jeune_actif: "Active 25-35 community",
  score_famille: "Great for raising children",
};

const OWNER_EN_CON: Record<string, string> = {
  score_canicule: "Summers increasingly uncomfortable",
  score_solitude: "High social isolation risk",
  score_bruit: "Significant noise issues",
  score_securite_nocturne: "Stay vigilant at night in some areas",
  score_sans_voiture: "Very difficult without a car",
  score_teletravail: "Limited fibre coverage and coworking",
  score_qualite_air: "Degraded air quality",
  score_securite_femme_seule: "Below-average safety for women alone",
  score_jeune_actif: "Young demographic under-represented",
  score_famille: "Not the best choice for families",
};

const PROFILE_LABEL_EN: Record<string, string> = {
  "familles-avec-enfants": "Families with children",
  "jeunes-actifs": "Young professionals",
  retraites: "Retirees",
  freelances: "Freelancers",
  teletravailleurs: "Remote workers",
  etudiants: "Students",
  "sans-voiture": "Car-free living",
  premium: "Premium lifestyle",
  "solo-femme": "Women living solo",
  "couple-sans-enfant": "Couples without children",
  "expat-retour": "Returning expats",
};

interface Bullet { label: string; detail: string; score: number }

function ratingBadge(score: number): string {
  if (score >= 7.5) return "bg-purple-500/15 text-purple-700 border-purple-400/30";
  if (score >= 6.0) return "bg-lime-500/15 text-lime-700 border-lime-400/30";
  if (score >= 4.5) return "bg-amber-500/15 text-amber-700 border-amber-400/30";
  return "bg-red-500/15 text-red-700 border-red-400/30";
}

function dedupe(bullets: Bullet[]): Bullet[] {
  const seen = new Set<string>();
  return bullets.filter((b) => { const k = b.label.toLowerCase(); return seen.has(k) ? false : (seen.add(k), true); });
}

function buildBullets(city: Seed) {
  const axisKeys = (Object.keys(city.scores) as Array<keyof typeof city.scores>).filter((k) => k !== "global");
  const owner = computeOwnerScores(city);

  const strengthCandidates: Bullet[] = [
    ...axisKeys.filter((k) => city.scores[k] >= 7.0).map((k) => ({
      label: AXIS_EN[k]?.label ?? k,
      detail: AXIS_EN[k]?.pro ?? "",
      score: city.scores[k],
    })),
    ...owner.filter((s) => s.value >= 7.0).map((s) => ({
      label: OWNER_LABEL_EN[s.key] ?? s.key,
      detail: OWNER_EN_PRO[s.key] ?? s.key,
      score: s.value,
    })),
  ];
  strengthCandidates.sort((a, b) => b.score - a.score);
  const strengths = dedupe(strengthCandidates).slice(0, 4);

  const weaknessCandidates: Bullet[] = [
    ...axisKeys.filter((k) => city.scores[k] <= 4.8).map((k) => ({
      label: AXIS_EN[k]?.label ?? k,
      detail: AXIS_EN[k]?.con ?? "",
      score: city.scores[k],
    })),
    ...owner.filter((s) => s.value <= 4.8).map((s) => ({
      label: OWNER_LABEL_EN[s.key] ?? s.key,
      detail: OWNER_EN_CON[s.key] ?? s.key,
      score: s.value,
    })),
  ];
  weaknessCandidates.sort((a, b) => a.score - b.score);
  const weaknesses = dedupe(weaknessCandidates).slice(0, 3);

  return { strengths, weaknesses };
}

function buildOneLine(city: Seed, strengths: Bullet[], weaknesses: Bullet[]): string {
  const top = strengths[0];
  const worst = weaknesses[0];
  const namedStrength = top ? top.detail.toLowerCase() : `a global score of ${city.scores.global.toFixed(1)}/10`;
  if (worst && worst.score < 4.0) {
    return `${city.name} stands out for ${namedStrength}, but ${worst.detail.toLowerCase()}.`;
  }
  if (worst && worst.score < 5.0) {
    return `${city.name} scores well on ${namedStrength}; keep an eye on ${worst.label.toLowerCase()}.`;
  }
  return `${city.name}: a solid profile with ${namedStrength} and no major drawback.`;
}

export default async function EnHonestReviewPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const { strengths, weaknesses } = buildBullets(city);
  const oneLine = buildOneLine(city, strengths, weaknesses);

  // Profile fits — reuse the lib's cached rankings; map labels to EN
  const review = buildHonestReview(city);

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <nav className="mb-3 text-sm text-[var(--text-secondary)]">
            <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
            {" · "}
            <Link href="/cities" className="hover:text-[var(--accent)]">Cities</Link>
            {" · "}
            <Link href={`/cities/${slug}`} className="hover:text-[var(--accent)]">{city.name}</Link>
            {" · "}
            <span>Honest review</span>
          </nav>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-[var(--accent)]" />
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
              Honest review of {city.name}
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            What actually works, what doesn&apos;t, and which lifestyle profiles fit best.
            Derived from 8 seed axes + 10 owner scores + rankings across{" "}
            {CITIES_COUNT} French cities. No invented numbers.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-8">

        {/* One-liner verdict */}
        <div className="rounded-2xl border-l-4 border-l-[var(--accent)] border border-[var(--border)] bg-[var(--bg-surface)] p-5">
          <p className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2">The short version</p>
          <p className="text-base text-[var(--text-secondary)] italic leading-relaxed">
            &ldquo;{oneLine}&rdquo;
          </p>
        </div>

        {/* Strengths + Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <ThumbsUp className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                What&apos;s genuinely good
              </span>
            </div>
            {strengths.length > 0 ? (
              <ul className="space-y-2">
                {strengths.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-start justify-between gap-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-[var(--text-primary)]">{b.label}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{b.detail}</div>
                    </div>
                    <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-mono-data font-semibold shrink-0 ${ratingBadge(b.score)}`}>
                      {b.score.toFixed(1)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[var(--text-tertiary)] rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
                No score ≥ 7.0 — a well-rounded city, but without a standout axis.
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <ThumbsDown className="h-4 w-4 text-red-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-red-700">
                Worth watching
              </span>
            </div>
            {weaknesses.length > 0 ? (
              <ul className="space-y-2">
                {weaknesses.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-start justify-between gap-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-[var(--text-primary)]">{b.label}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{b.detail}</div>
                    </div>
                    <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-mono-data font-semibold shrink-0 ${ratingBadge(b.score)}`}>
                      {b.score.toFixed(1)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[var(--text-tertiary)] rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
                No score ≤ 4.8 — no major weakness identified.
              </p>
            )}
          </div>
        </div>

        {/* Profile fit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <div className="flex items-center gap-1.5 mb-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Suits</span>
            </div>
            {review.perfectFor.length > 0 ? (
              <>
                {review.perfectFor.some((f) => f.soft) && (
                  <p className="text-[11px] text-[var(--text-tertiary)] mb-2 italic">
                    Not in the top 30 for any specific profile — these two are the closest match:
                  </p>
                )}
                <ul className="space-y-2">
                  {review.perfectFor.map((f) => (
                    <li key={f.profile.slug} className="text-sm">
                      <span className="inline-flex items-center gap-1 text-[var(--text-primary)] font-medium">
                        <span aria-hidden>{f.profile.emoji}</span>
                        {PROFILE_LABEL_EN[f.profile.slug] ?? f.profile.label}
                      </span>
                      <span className="text-[11px] text-[var(--text-tertiary)] block ml-5">
                        #{f.rank} of {CITIES_COUNT}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-xs text-[var(--text-tertiary)]">
                No profile stands out. A generalist city without a strong signature.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <div className="flex items-center gap-1.5 mb-3">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-red-700">Avoid if you are</span>
            </div>
            {review.avoidIf.length > 0 ? (
              <>
                {review.avoidIf.some((f) => f.soft) && (
                  <p className="text-[11px] text-[var(--text-tertiary)] mb-2 italic">
                    No truly disqualifying profile — these two are simply a weaker match:
                  </p>
                )}
                <ul className="space-y-2">
                  {review.avoidIf.map((f) => (
                    <li key={f.profile.slug} className="text-sm text-[var(--text-primary)]">
                      <span className="inline-flex items-center gap-1">
                        <span aria-hidden>{f.profile.emoji}</span>
                        {f.soft ? (
                          <>Less suited for <strong>{(PROFILE_LABEL_EN[f.profile.slug] ?? f.profile.label).toLowerCase()}</strong></>
                        ) : (
                          <>You are <strong>{(PROFILE_LABEL_EN[f.profile.slug] ?? f.profile.label).toLowerCase()}</strong></>
                        )}
                      </span>
                      <span className="text-[11px] text-[var(--text-tertiary)] block ml-5">
                        #{f.rank} of {CITIES_COUNT} — {f.soft ? "other cities fit this profile better" : "other cities rank much higher here"}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-xs text-[var(--text-tertiary)]">
                No profile where this city is clearly disqualified.
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-[var(--text-tertiary)]">
          Algorithmic synthesis — 8 seed axes + 10 owner scores + rankings across {CITIES_COUNT} cities for 11 lifestyle profiles.
          See the{" "}
          <Link href="/methodology" className="underline">methodology</Link>.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/cities/${slug}`}
            className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-white font-semibold hover:opacity-90"
          >
            Back to {city.name}
          </Link>
          <Link
            href={`/cities/${slug}/cost-of-living`}
            className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
          >
            Cost of living
          </Link>
          <Link
            href={`/cities/${slug}/remote-work`}
            className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
          >
            Remote work
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
