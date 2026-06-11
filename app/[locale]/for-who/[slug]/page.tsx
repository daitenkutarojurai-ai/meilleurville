import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { rankByProfile } from "@/lib/profile-pages";
import type { ProfileDef } from "@/lib/profile-pages";
import { scoreColor } from "@/lib/utils";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { CITIES_COUNT } from "@/lib/site-stats";
import { CITIES_LIGHT, type CityLight } from "@/lib/cities-light";

export const revalidate = false;
export const dynamicParams = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

type Props = { params: Promise<{ locale: string; slug: string }> };

interface EnProfile extends ProfileDef {
  enSlug: string;
}

const EN_PROFILES: EnProfile[] = [
  {
    enSlug: "families",
    slug: "familles-avec-enfants",
    emoji: "👨‍👩‍👧",
    label: "Families with children",
    metaTitle: "Best French cities for families 2026 — Top 20",
    metaDescription:
      "Top 20 French cities for families with children: schools, safety, green spaces, affordable cost of living. Score calibrated on national data.",
    intro:
      "For families, the combination that matters is schools + safety + green space + affordable living. Not the cultural-nightlife top-5 — families aren't ranking that. This list reflects the real trade-off.",
    weights: { schools: 2.5, safety: 2.0, famille: 2.0, nature: 1.5, cost: 1.0, life: 1.0 },
    reasonHint: (c: CityLight) =>
      `Schools ${c.scores.schools.toFixed(1)} · safety ${c.scores.safety.toFixed(1)} · nature ${c.scores.nature.toFixed(1)}`,
  },
  {
    enSlug: "young-professionals",
    slug: "jeunes-actifs",
    emoji: "🚀",
    label: "Young professionals",
    metaTitle: "Best French cities for young professionals 2026 — Top 20",
    metaDescription:
      "Top 20 French cities for young professionals (25-35): career opportunities, culture, remote work, affordable living. Calibrated on demographics and business data.",
    intro:
      "Young professionals need a specific cocktail: a job market with momentum, a cultural scene that doesn't shut down at 10pm, rents you can afford without an inheritance, and a network to actually make friends. These 20 cities deliver all of that.",
    weights: { jeuneActif: 2.5, culture: 2.0, remoteWork: 1.5, cost: 1.5, life: 1.0 },
    reasonHint: (c: CityLight) =>
      `Culture ${c.scores.culture.toFixed(1)} · remote work ${c.scores.remoteWork.toFixed(1)} · cost ${c.scores.cost.toFixed(1)}`,
  },
  {
    enSlug: "retirees",
    slug: "retraites",
    emoji: "🌅",
    label: "Retirees",
    metaTitle: "Best French cities for retirees 2026 — Top 20",
    metaDescription:
      "Top 20 French cities for retirees: healthcare access, safety, mild climate, quality of life, affordable cost. 2026 selection.",
    intro:
      "For retirees, the priority order is health access first, safety second, pleasant climate, quality of daily life. Cost matters but less than for working people — the pension is fixed, and property already acquired holds its value. These 20 cities maximise that combination.",
    weights: { safety: 2.5, life: 2.5, nature: 1.5, securiteNocturne: 1.5, qualiteAir: 1.5, canicule: 1.0 },
    reasonHint: (c: CityLight) =>
      `Quality of life ${c.scores.life.toFixed(1)} · safety ${c.scores.safety.toFixed(1)} · nature ${c.scores.nature.toFixed(1)}`,
  },
  {
    enSlug: "freelancers",
    slug: "freelances",
    emoji: "💼",
    label: "Freelancers",
    metaTitle: "Best French cities for freelancers 2026 — Top 20",
    metaDescription:
      "Top 20 French cities for freelancers and independents: fibre, coworking spaces, culture, optimised cost. 2026 calibration.",
    intro:
      "Freelancers need fibre, coworking spaces, a local community of independents, and quality of life so you don't burn out. These 20 cities have the right mix — not just big metros; several mid-sized cities punching above their weight make the cut.",
    weights: { remoteWork: 2.5, teletravail: 2.0, culture: 1.5, life: 1.5, cost: 1.0, jeuneActif: 1.0 },
    reasonHint: (c: CityLight) =>
      `Remote work ${c.scores.remoteWork.toFixed(1)} · culture ${c.scores.culture.toFixed(1)} · cost ${c.scores.cost.toFixed(1)}`,
  },
  {
    enSlug: "remote-workers",
    slug: "teletravailleurs",
    emoji: "💻",
    label: "Remote workers",
    metaTitle: "Best French cities for remote workers 2026 — Top 20",
    metaDescription:
      "Top 20 French cities for employed remote workers: fibre connectivity, quality of life, weekend access, reasonable cost. 2026.",
    intro:
      "Employed remote workers are different from freelancers. You keep your employer — often Paris-based — so the distance costs nothing career-wise but saves a lot on rent. These 20 cities optimise the quality-of-life / connectivity / Paris-access ratio.",
    weights: { remoteWork: 2.5, teletravail: 2.0, life: 2.0, transport: 1.5, nature: 1.5, cost: 1.0 },
    reasonHint: (c: CityLight) =>
      `Remote work ${c.scores.remoteWork.toFixed(1)} · quality of life ${c.scores.life.toFixed(1)} · transport ${c.scores.transport.toFixed(1)}`,
  },
  {
    enSlug: "students",
    slug: "etudiants",
    emoji: "🎓",
    label: "Students",
    metaTitle: "Best French student cities 2026 — Top 20",
    metaDescription:
      "Top 20 French cities for students: universities, culture, transport, affordable student housing. 2026 calibration.",
    intro:
      "Students need universities, nightlife, transport, and above all rents compatible with a student budget. These 20 cities have the mix — Toulouse, Montpellier, Rennes up front as expected, but also underrated smaller university towns worth considering.",
    weights: { culture: 2.0, transport: 2.0, cost: 2.0, schools: 1.5, jeuneActif: 1.5 },
    reasonHint: (c: CityLight) =>
      `Culture ${c.scores.culture.toFixed(1)} · transport ${c.scores.transport.toFixed(1)} · cost ${c.scores.cost.toFixed(1)}`,
  },
  {
    enSlug: "car-free",
    slug: "sans-voiture",
    emoji: "🚲",
    label: "Car-free living",
    metaTitle: "Best French cities to live without a car 2026 — Top 20",
    metaDescription:
      "Top 20 French cities where you can genuinely live without a car: tram, metro, bus, cycling network. Proprietary car-free score + transport axis.",
    intro:
      "If you want to ditch the car entirely — or just leave it in the garage — these 20 cities have the network for it. The score combines tram/metro/bus density, walkability, and cycling infrastructure.",
    weights: { sansVoiture: 3.0, transport: 2.0, life: 1.5, culture: 1.0 },
    reasonHint: (c: CityLight) =>
      `Transport ${c.scores.transport.toFixed(1)} · culture ${c.scores.culture.toFixed(1)}`,
  },
  {
    enSlug: "premium",
    slug: "premium",
    emoji: "✨",
    label: "Premium lifestyle",
    metaTitle: "Top French cities for a premium lifestyle 2026 — Top 20",
    metaDescription:
      "Top 20 premium French cities: high quality of life, safety, exceptional setting, top schools, rich culture. For budgets above €4,000/month.",
    intro:
      "Premium living isn't about prestige — it's about a rare combination: high safety, an exceptional setting, renowned schools, a rich cultural scene, and a price tag that reflects all of it. These 20 cities are for budgets of €4,000+/month.",
    weights: { life: 2.5, safety: 2.0, schools: 1.5, culture: 1.5, nature: 1.5 },
    reasonHint: (c: CityLight) =>
      `Quality of life ${c.scores.life.toFixed(1)} · safety ${c.scores.safety.toFixed(1)} · culture ${c.scores.culture.toFixed(1)}`,
  },
  {
    enSlug: "women-solo",
    slug: "solo-femme",
    emoji: "👤",
    label: "Women living solo",
    metaTitle: "Best French cities for women living solo 2026 — Top 20",
    metaDescription:
      "Top 20 French cities adapted for women living alone: night safety, late public transport, urban quality of life.",
    intro:
      "General safety scores aren't enough — you need night safety AND reliable late-night transport. These 20 cities maximise the feeling of safety getting home in the evening, without sacrificing urban quality of life or culture.",
    weights: { securiteFemmeSeule: 3.0, securiteNocturne: 2.0, transport: 1.5, culture: 1.0, life: 1.0 },
    reasonHint: (c: CityLight) =>
      `Safety ${c.scores.safety.toFixed(1)} · transport ${c.scores.transport.toFixed(1)}`,
  },
  {
    enSlug: "couples",
    slug: "couple-sans-enfant",
    emoji: "👫",
    label: "Couples without children",
    metaTitle: "Best French cities for couples without children 2026 — Top 20",
    metaDescription:
      "Top 20 French cities for DINK couples: culture, restaurants, nightlife, weekend nature access, transport. 2026.",
    intro:
      "Couples without children: schools don't factor in at all, and with two incomes housing cost becomes secondary. What actually matters is a lively cultural scene, restaurants and events that don't close at 10pm, nature within reach for weekends, and transport that keeps up. These 20 cities maximise exactly that mix.",
    weights: { culture: 2.5, life: 2.0, jeuneActif: 1.5, nature: 1.5, transport: 1.5, remoteWork: 1.0 },
    reasonHint: (c: CityLight) =>
      `Culture ${c.scores.culture.toFixed(1)} · quality of life ${c.scores.life.toFixed(1)} · nature ${c.scores.nature.toFixed(1)}`,
  },
  {
    enSlug: "returning-expats",
    slug: "expat-retour",
    emoji: "✈️",
    label: "Returning expats",
    metaTitle: "Best French cities for returning expats 2026 — Top 20",
    metaDescription:
      "Top 20 French cities for nationals returning from abroad: quality of life, international connectivity, border cities. Switzerland, Luxembourg, UK, Canada included.",
    intro:
      "Returning from abroad means transitioning from an international lifestyle — often high comfort — back to France. These 20 cities combine quality of life, international accessibility (airports, border proximity) and a setting that won't feel like a downgrade.",
    weights: { life: 2.5, culture: 1.5, transport: 2.0, remoteWork: 1.5, safety: 1.5, jeuneActif: 1.0 },
    reasonHint: (c: CityLight) =>
      `Quality of life ${c.scores.life.toFixed(1)} · culture ${c.scores.culture.toFixed(1)} · transport ${c.scores.transport.toFixed(1)}`,
  },
  {
    enSlug: "first-time-buyers",
    slug: "primo-accedants",
    emoji: "🔑",
    label: "First-time buyers",
    metaTitle: "Best French cities for first-time property buyers 2026 — Top 20",
    metaDescription:
      "Top 20 French cities for first-time buyers: affordable entry prices, low taxes, rental yield, growth potential. Cities where a starter home is still within reach.",
    intro:
      "Buying your first home in France means balancing what you can actually afford against where you'd want to live. These 20 cities score well on property affordability and tax burden without sacrificing quality of life — the realistic shortlist for first-time buyers.",
    weights: { cost: 3.0, safety: 1.5, transport: 1.5, schools: 1.5, life: 1.0, nature: 1.0 },
    reasonHint: (c: CityLight) =>
      `Cost ${c.scores.cost.toFixed(1)} · safety ${c.scores.safety.toFixed(1)} · transport ${c.scores.transport.toFixed(1)}`,
  },
  {
    enSlug: "single-parents",
    slug: "familles-monoparentales",
    emoji: "🧑‍👧",
    label: "Single parents",
    metaTitle: "Best French cities for single parents 2026 — Top 20",
    metaDescription:
      "Top 20 French cities for single-parent families: affordable housing, excellent schools, safety, walkability. Where a single income covers a decent family life.",
    intro:
      "Single-parent households face a tighter budget and a greater need for reliable services — good schools, safe streets, accessible public transport. These 20 cities combine affordable housing with strong public services and safety, making family life manageable on a single income.",
    weights: { cost: 2.5, schools: 2.5, safety: 2.5, transport: 2.0, sansVoiture: 1.5, life: 1.0 },
    reasonHint: (c: CityLight) =>
      `Schools ${c.scores.schools.toFixed(1)} · safety ${c.scores.safety.toFixed(1)} · cost ${c.scores.cost.toFixed(1)}`,
  },
];

function getEnProfile(slug: string): EnProfile | undefined {
  return EN_PROFILES.find((p) => p.enSlug === slug);
}

export function generateStaticParams() {
  return EN_PROFILES.map((p) => ({ locale: "en", slug: p.enSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = getEnProfile(slug);
  if (!profile) return {};
  return {
    title: profile.metaTitle,
    description: profile.metaDescription,
    alternates: {
      canonical: `${EN_BASE}/for-who/${slug}`,
    },
    openGraph: {
      title: profile.metaTitle,
      description: profile.metaDescription,
      url: `${EN_BASE}/for-who/${slug}`,
    },
  };
}

export default async function ForWhoPage({ params }: Props) {
  const { slug } = await params;
  const profile = getEnProfile(slug);
  if (!profile) notFound();

  const top = rankByProfile(profile, CITIES_LIGHT, 20);
  const others = EN_PROFILES.filter((p) => p.enSlug !== slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: profile.metaTitle,
    description: profile.metaDescription,
    itemListElement: top.slice(0, 10).map((row, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: row.city.name,
      url: `${EN_BASE}/cities/${row.city.slug}`,
    })),
  };

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-3 text-sm">
            <Link href="/for-who" className="text-[var(--text-secondary)] hover:text-[var(--accent)]">
              ← All profiles
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl" aria-hidden>{profile.emoji}</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              {profile.label}
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed">{profile.intro}</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Top 20 cities — {profile.label}
          </h2>
          <ol className="space-y-2">
            {top.map((row, i) => (
              <li key={row.city.slug}>
                <Link
                  href={`/cities/${row.city.slug}`}
                  className="flex items-baseline justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 hover:border-[var(--accent)]/40 transition-all"
                >
                  <span className="flex items-baseline gap-3 min-w-0">
                    <span className="font-mono-data text-sm text-[var(--text-tertiary)] w-8 flex-shrink-0">
                      #{i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="font-semibold text-[var(--text-primary)] block truncate">
                        {row.city.name}
                      </span>
                      <span className="text-xs text-[var(--text-tertiary)] truncate">
                        {row.city.region} · {row.reason}
                      </span>
                    </span>
                  </span>
                  <span className="flex-shrink-0">
                    <span className={`font-mono-data font-bold ${scoreColor(row.score)}`}>
                      {row.score.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-[var(--text-tertiary)]"> /10</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Scoring method</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
            Weighted average of the axes below, across {CITIES_COUNT} cities.
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {Object.entries(profile.weights).map(([key, w]) => (
              <li
                key={key}
                className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]"
              >
                {key} × {w}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">Other profiles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {others.map((p) => (
              <Link
                key={p.enSlug}
                href={`/for-who/${p.enSlug}`}
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm hover:border-[var(--accent)]/40 transition-colors"
              >
                <span className="text-xl" aria-hidden>{p.emoji}</span>
                <span className="text-[var(--text-primary)]">{p.label}</span>
              </Link>
            ))}
          </div>
        </section>

        <p className="text-xs text-[var(--text-tertiary)] text-center">
          For a personalised match combining all criteria, take the{" "}
          <Link href="/city-match" className="underline">
            compatibility quiz
          </Link>
          .
        </p>
      </div>

      <Footer />
    </main>
  );
}
