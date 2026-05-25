import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { computeNicheScores } from "@/lib/niche-scores";
import { scoreColor } from "@/lib/utils";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ArrowRight, ChevronRight } from "lucide-react";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return [{ locale: "en" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Community profiles — who's moving to French cities and why · 2026",
    description:
      "6 fictional profiles illustrating the main relocation patterns inside France: remote workers, retirees, students, families, expats, nature lovers. Real compatibility scores per city.",
    alternates: { canonical: `${EN_BASE}/community-profiles` },
  };
}

function cityNiche(slug: string) {
  const city = CITIES_SEED.find((c) => c.slug === slug)!;
  return { city, niche: computeNicheScores(city) };
}

const PROFILES = [
  {
    id: "camille",
    emoji: "💻",
    name: "Camille",
    age: 31,
    job: "Freelance front-end developer",
    origin: "Paris (11th)",
    destinationSlug: "rennes",
    nicheKey: "remote" as const,
    quote:
      "I was paying €2,200/month for a cramped Paris flat. In Rennes I pay €750, have 1 Gbit/s fibre, and two parks within 10 minutes' walk. The last TGV back to Paris leaves at 22:38.",
    archetypeLabel: "Remote worker",
  },
  {
    id: "jf-sylvie",
    emoji: "🌿",
    name: "Jean-François & Sylvie",
    age: 63,
    job: "Retired — former automotive industry",
    origin: "Mulhouse",
    destinationSlug: "bayonne",
    nicheKey: "retirement" as const,
    quote:
      "We wanted sunshine, the sea, and a TGV to visit the grandchildren. We found all three in Bayonne — plus the Basque Country as a bonus. Haven't looked back.",
    archetypeLabel: "Retiree",
  },
  {
    id: "theo",
    emoji: "🎓",
    name: "Théo",
    age: 22,
    job: "Master's in Economics student",
    origin: "Rouen",
    destinationSlug: "bordeaux",
    nicheKey: "studentLife" as const,
    quote:
      "Bordeaux isn't cheap, but the Victoire and Saint-Michel neighbourhoods are still reachable on a student budget. The cultural scene and nightlife more than make up for it. The tram goes everywhere.",
    archetypeLabel: "Student",
  },
  {
    id: "nadia",
    emoji: "🌍",
    name: "Nadia",
    age: 38,
    job: "Healthcare consultant, formerly based in Brussels",
    origin: "Brussels",
    destinationSlug: "lyon",
    nicheKey: "expat" as const,
    quote:
      "Lyon surprised me — more international than I expected, with a booming food and tech scene. Less stressful than Paris, and better connected than most people think.",
    archetypeLabel: "International profile",
  },
  {
    id: "clement-laura",
    emoji: "👨‍👩‍👧",
    name: "Clément & Laura",
    age: 34,
    job: "Engineer & physio, 2 kids",
    origin: "Seine-et-Marne",
    destinationSlug: "nantes",
    nicheKey: "remote" as const,
    quote:
      "We wanted a city where the kids could grow up with space and decent schools. Nantes ticked every box at a price we could still afford. We gained 40 minutes a day in commute time.",
    archetypeLabel: "Family with children",
  },
  {
    id: "mathieu",
    emoji: "🐕",
    name: "Mathieu",
    age: 27,
    job: "Startup CTO & trail runner",
    origin: "Montpellier",
    destinationSlug: "grenoble",
    nicheKey: "petFriendly" as const,
    quote:
      "Laptop in my bag in the morning, the Belledonne mountains 45 minutes away on weekends. Grenoble is the best of both worlds if you love peaks as much as screens. My dog agrees.",
    archetypeLabel: "Nature & remote",
  },
] as const;

const POUR_QUI_EN = [
  { slug: "remote-workers", label: "Remote workers", emoji: "💻" },
  { slug: "retirees", label: "Retirees", emoji: "🌿" },
  { slug: "students", label: "Students", emoji: "🎓" },
  { slug: "freelancers", label: "Freelancers", emoji: "⚡" },
  { slug: "families", label: "Families", emoji: "👨‍👩‍👧" },
  { slug: "young-professionals", label: "Young professionals", emoji: "🚀" },
  { slug: "car-free", label: "Car-free living", emoji: "🚲" },
  { slug: "expats", label: "Expats", emoji: "🌍" },
];

export default async function EnCommunityProfiles() {
  const profileData = PROFILES.map((p) => {
    const { city, niche } = cityNiche(p.destinationSlug);
    return { ...p, city, niche };
  });

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Community profiles", path: "/community-profiles" },
  ]);

  return (
    <main id="main-content" className="min-h-screen relative bg-[var(--bg-canvas)]">
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />

      {/* Hero */}
      <section className="relative pt-20 pb-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full border border-amber-200 bg-amber-50/80 text-amber-700 text-xs font-semibold mb-4">
            Fictional profiles · Illustrative only
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.08]">
            They made the move —{" "}
            <span className="font-display gradient-text-anim italic">here's what they found</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed">
            6 fictional archetypes illustrating the main internal relocation patterns in France.
            The people are invented; the city scores are calculated from real data.
          </p>
        </div>
      </section>

      {/* Portrait cards */}
      <section className="relative pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {profileData.map((p) => {
              const nicheScore = p.niche[p.nicheKey];
              const color = scoreColor(nicheScore);
              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 flex flex-col gap-4 hover:shadow-lg transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{p.emoji}</span>
                      <div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">
                          {p.name}, {p.age}
                        </div>
                        <div className="text-xs text-[var(--text-tertiary)] leading-snug">{p.job}</div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-wide font-semibold text-amber-700 bg-amber-100/70 rounded-full px-2 py-0.5 shrink-0 mt-0.5">
                      Fictional
                    </span>
                  </div>

                  {/* Move arrow */}
                  <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                    <span className="rounded-md bg-[var(--bg-canvas)] border border-[var(--border)] px-2 py-1 font-medium">
                      {p.origin}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    <Link
                      href={`/cities/${p.destinationSlug}`}
                      className="rounded-md bg-[var(--accent)]/10 border border-[var(--accent)]/30 px-2 py-1 font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors"
                    >
                      {p.city.name}
                    </Link>
                  </div>

                  {/* Score badge */}
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-xs text-[var(--text-tertiary)] mb-0.5">{p.archetypeLabel}</div>
                      <div className="text-2xl font-black font-mono-data" style={{ color }}>
                        {nicheScore.toFixed(1)}
                        <span className="text-sm font-normal text-[var(--text-tertiary)]">/10</span>
                      </div>
                    </div>
                    <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(nicheScore / 10) * 100}%`, background: color }}
                      />
                    </div>
                  </div>

                  {/* Quote */}
                  <blockquote className="text-sm text-[var(--text-secondary)] leading-relaxed border-l-2 border-[var(--accent)]/40 pl-3 italic">
                    "{p.quote}"
                  </blockquote>

                  {/* CTA */}
                  <Link
                    href={`/cities/${p.destinationSlug}`}
                    className="mt-auto flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] transition-all px-4 py-2.5 group"
                  >
                    <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      See {p.city.name} full profile
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
                  </Link>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-[var(--text-tertiary)] text-center mt-6 max-w-xl mx-auto">
            Names, ages, personal situations, and quotes are entirely fictional and invented for illustrative purposes.
            Compatibility scores are calculated from real city data (MaVilleIdéale 2024–2026 seed).
          </p>
        </div>
      </section>

      {/* CTA block */}
      <section className="relative pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              Which profile fits you?
            </h2>
            <p className="text-[var(--text-secondary)] mb-6 max-w-2xl">
              Each profile below gives you a top-20 city ranking calibrated on the axes that actually matter for that
              lifestyle — not a generic global score.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              {POUR_QUI_EN.map((p) => (
                <Link
                  key={p.slug}
                  href={`/for-who/${p.slug}`}
                  className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] transition-all px-3 py-2.5 group"
                >
                  <span className="text-lg">{p.emoji}</span>
                  <span className="text-xs font-semibold text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors">
                    {p.label}
                  </span>
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/quiz"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                ✨ Quiz — find my city
              </Link>
              <Link
                href="/for-who"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] px-5 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                All lifestyle profiles →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
