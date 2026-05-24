import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Users, Laptop, PawPrint, Heart, GraduationCap, MapPin, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { computeNicheScores } from "@/lib/niche-scores";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { formatScore, scoreColor } from "@/lib/utils";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export const revalidate = false;
export const dynamicParams = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

const PROFILE_META = [
  {
    key: "expat" as const,
    label: "Expats / internationals",
    icon: MapPin,
    desc: "International accessibility, transport, culture, city size.",
    pitch: (name: string) => `Is ${name} an open, internationally accessible city?`,
  },
  {
    key: "remote" as const,
    label: "Remote workers",
    icon: Laptop,
    desc: "Connectivity, lifestyle, cost, cultural diversity.",
    pitch: (name: string) => `Is working remotely from ${name} comfortable?`,
  },
  {
    key: "petFriendly" as const,
    label: "Pet owners",
    icon: PawPrint,
    desc: "Nature, green spaces, density, safety.",
    pitch: (name: string) => `Is ${name} welcoming for pet owners?`,
  },
  {
    key: "retirement" as const,
    label: "Retirees",
    icon: Heart,
    desc: "Safety, cost of living, nature, calm, mild climate.",
    pitch: (name: string) => `Is ${name} a good choice for retirement?`,
  },
  {
    key: "studentLife" as const,
    label: "Students",
    icon: GraduationCap,
    desc: "Culture, transport, budget, nightlife and associations.",
    pitch: (name: string) => `Is student life fulfilling in ${name}?`,
  },
] as const;

const EN_TERRAIN_LABELS: Record<string, string> = {
  mer: "🌊 Coastal",
  montagne: "⛰️ Mountain",
  plaine: "🌾 Flatland",
  vallee: "🍇 Valley",
};

const EN_TERRAIN_DESC: Record<string, string> = {
  mer: "Sea access, coastline, seaside or coastal setting.",
  montagne: "Significant altitude, Alpine or Pyrenean setting, skiing possible.",
  vallee: "River valley, vineyards or alluvial plains, mild climate.",
  plaine: "Flat or gently rolling terrain, urban or open rural setting.",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const niche = computeNicheScores(city);
  const best = [...PROFILE_META].sort((a, b) => niche[b.key] - niche[a.key]);
  const top2 = best.slice(0, 2).map((p) => p.label.toLowerCase()).join(" and ");
  return {
    title: `${city.name} — which lifestyle profile fits? Compatibility scores | BestCitiesInFrance`,
    description: `${city.name} suits ${top2} best. Compatibility scores for 5 profiles: expats, remote workers, pet owners, retirees, students.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/profiles` },
    openGraph: {
      title: `${city.name} — which lifestyle fits?`,
      description: `Compatibility by lifestyle: remote workers, retirees, students, expats, pet owners.`,
    },
  };
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round((score / 10) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-2 flex-1 rounded-full bg-[var(--bg-canvas)] overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: score >= 7 ? "var(--accent)" : score >= 5 ? "#EAB308" : "#EF4444",
          }}
        />
      </div>
      <span className={`font-mono-data text-sm font-bold w-8 text-right ${scoreColor(score)}`}>
        {formatScore(score)}
      </span>
    </div>
  );
}

export default async function CityProfilesENPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const niche = computeNicheScores(city);
  const sorted = [...PROFILE_META].sort((a, b) => niche[b.key] - niche[a.key]);
  const top3 = sorted.slice(0, 3);
  const bottom2 = sorted.slice(-2).reverse();

  const neighbours = CITIES_SEED.filter((c) => c.slug !== city.slug)
    .map((c) => {
      const cn = computeNicheScores(c);
      const d = PROFILE_META.reduce((acc, p) => {
        const diff = cn[p.key] - niche[p.key];
        return acc + diff * diff;
      }, 0);
      return { city: c, distance: d };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: city.name, path: `/cities/${slug}` },
    { name: "Profiles", path: `/cities/${slug}/profiles` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Which profile fits ${city.name} best?`,
      a: `${city.name} suits ${top3.map((p) => p.label.toLowerCase()).join(", ")} best, with compatibility scores of ${top3.map((p) => formatScore(niche[p.key])).join(", ")}/10 respectively.`,
    },
    {
      q: `Is ${city.name} a good city for retirement?`,
      a: `${city.name}'s retirement score is ${formatScore(niche.retirement)}/10. ${niche.retirement >= 7 ? "It is an excellent choice for retirees seeking calm, safety and a reasonable cost of living." : niche.retirement >= 5 ? "It is a reasonable choice, with some trade-offs to anticipate depending on priorities." : "The city presents constraints (cost, density or climate) that make it less suited for retirement."}`,
    },
    {
      q: `Is remote working comfortable from ${city.name}?`,
      a: `${city.name}'s remote-work score is ${formatScore(niche.remote)}/10. ${niche.remote >= 7 ? "The combination of connectivity, quality of life and cost makes it an ideal remote-work base." : niche.remote >= 5 ? "Remote working is viable there with some caveats." : "Certain criteria (connectivity, cost or infrastructure) limit comfort for remote workers."}`,
    },
    {
      q: `Is ${city.name} welcoming for students?`,
      a: `${city.name}'s student life score is ${formatScore(niche.studentLife)}/10. ${niche.studentLife >= 7 ? "Strong cultural and associative life, efficient transport and reasonable cost of living make it a quality student city." : niche.studentLife >= 5 ? "Student life exists but remains modest compared to large metropolises." : "Student life is more limited, with a smaller cultural offering and student community."}`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />

      <section className="border-b border-[var(--border)] bg-[var(--bg-surface)] py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-tertiary)] mb-4">
            <Link href="/" className="hover:underline">Home</Link>
            {" / "}
            <Link href="/cities" className="hover:underline">Cities</Link>
            {" / "}
            <Link href={`/cities/${slug}`} className="hover:underline">{city.name}</Link>
            {" / "}
            <span>Profiles</span>
          </nav>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-2">
            <Users className="h-3.5 w-3.5" />
            Compatibility by profile
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            {city.name} — which lifestyle fits?
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            Compatibility scores derived from the 8 quality-of-life axes, geography and city size.
            No invented figures.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">

        {/* Best fits */}
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            Best profiles for {city.name}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {top3.map((p, i) => {
              const Icon = p.icon;
              const score = niche[p.key];
              return (
                <div
                  key={p.key}
                  className="relative rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 flex flex-col gap-3"
                >
                  {i === 0 && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-full">
                      Top match
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-[var(--bg-canvas)] p-2">
                      <Icon className="h-4 w-4 text-[var(--accent)]" />
                    </div>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{p.label}</span>
                  </div>
                  <ScoreBar score={score} />
                  <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* All 5 profiles */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              All compatibility scores
            </h2>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {sorted.map((p) => {
              const Icon = p.icon;
              const score = niche[p.key];
              return (
                <div key={p.key} className="px-5 py-4 flex items-center gap-4">
                  <div className="rounded-lg bg-[var(--bg-canvas)] p-2 shrink-0">
                    <Icon className="h-4 w-4 text-[var(--text-secondary)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-[var(--text-primary)]">{p.label}</span>
                      <span className={`font-mono-data text-sm font-bold ${scoreColor(score)}`}>
                        {formatScore(score)}/10
                      </span>
                    </div>
                    <ScoreBar score={score} />
                    <p className="mt-1.5 text-xs text-[var(--text-tertiary)]">{p.pitch(city.name)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Terrain + less suited */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3">Territory type</h2>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{(EN_TERRAIN_LABELS[niche.terrain] ?? "").split(" ")[0]}</span>
              <div>
                <div className="text-base font-semibold text-[var(--text-primary)]">
                  {(EN_TERRAIN_LABELS[niche.terrain] ?? niche.terrain).split(" ").slice(1).join(" ")}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  {EN_TERRAIN_DESC[niche.terrain] ?? ""}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3">Less suited for</h2>
            <div className="space-y-3">
              {bottom2.map((p) => {
                const Icon = p.icon;
                const score = niche[p.key];
                return (
                  <div key={p.key} className="flex items-center gap-3">
                    <div className="rounded-lg bg-[var(--bg-canvas)] p-1.5 shrink-0">
                      <Icon className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[var(--text-secondary)]">{p.label}</span>
                        <span className={`font-mono-data text-xs font-bold ${scoreColor(score)}`}>
                          {formatScore(score)}/10
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Similar profile cities */}
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
            Cities with a similar profile mix
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            The 3 cities whose expat / remote / retirement / student mix is closest to {city.name}.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {neighbours.map(({ city: n }) => {
              const nn = computeNicheScores(n);
              const topProfile = [...PROFILE_META].sort((a, b) => nn[b.key] - nn[a.key])[0];
              const TopIcon = topProfile.icon;
              return (
                <Link
                  key={n.slug}
                  href={`/cities/${n.slug}/profiles`}
                  className="group flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] px-4 py-3 transition hover:border-[var(--accent)]/40 hover:shadow-md"
                >
                  <div className="rounded-lg bg-[var(--bg-surface)] p-2 shrink-0">
                    <TopIcon className="h-4 w-4 text-[var(--accent)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] truncate">
                      {n.name}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] truncate">
                      {topProfile.label} · {formatScore(nn[topProfile.key])}/10
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Methodology note */}
        <div className="rounded-xl border border-dashed border-[var(--border)] p-4 text-xs text-[var(--text-tertiary)] leading-relaxed">
          <strong className="text-[var(--text-secondary)]">Methodology:</strong> Compatibility
          scores are weighted linear combinations of the 8 quality-of-life axes (life, transport,
          nature, cost, safety, culture, remote work, schools), adjusted for city size, geography
          (coast, mountain, valley, plain) and characteristic tags. Same source, same rules for
          all 352 cities — no city-specific coefficient tuning.
        </div>

        <div className="text-center">
          <Link
            href={`/cities/${slug}`}
            className="inline-flex items-center gap-1 text-sm text-[var(--accent)] underline hover:opacity-80"
          >
            ← Back to {city.name}
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
