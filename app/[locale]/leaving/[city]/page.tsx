import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED, type CitySeed } from "@/data/cities-seed";
import { migrationFor, commonOriginSlugs } from "@/lib/people-like-you";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { scoreColor } from "@/lib/utils";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { MapPin, Info, Sparkles, TrendingUp } from "lucide-react";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

// English copy is generated at the display site (see CLAUDE.md, EN routes
// convention 6): the shared lib `lib/profile-pages.ts` returns French labels
// and reasonHints, so we map profile slugs to English labels + an English
// reason builder here. The underlying ranking is identical to the FR page —
// only display strings differ.
type FeaturedProfile = {
  slug: string;
  emoji: string;
  label: string;
  reason: (c: CitySeed) => string;
};

const FEATURED_PROFILES: readonly FeaturedProfile[] = [
  {
    slug: "familles-avec-enfants",
    emoji: "👨‍👩‍👧",
    label: "Families with children",
    reason: (c) =>
      `Schools ${c.scores.schools.toFixed(1)} · safety ${c.scores.safety.toFixed(1)} · nature ${c.scores.nature.toFixed(1)}`,
  },
  {
    slug: "jeunes-actifs",
    emoji: "🚀",
    label: "Young professionals",
    reason: (c) =>
      `Culture ${c.scores.culture.toFixed(1)} · remote ${c.scores.remoteWork.toFixed(1)} · cost ${c.scores.cost.toFixed(1)}`,
  },
  {
    slug: "teletravailleurs",
    emoji: "💻",
    label: "Remote workers",
    reason: (c) =>
      `Remote ${c.scores.remoteWork.toFixed(1)} · quality of life ${c.scores.life.toFixed(1)} · transit ${c.scores.transport.toFixed(1)}`,
  },
  {
    slug: "retraites",
    emoji: "🌅",
    label: "Retirees",
    reason: (c) =>
      `Quality of life ${c.scores.life.toFixed(1)} · safety ${c.scores.safety.toFixed(1)} · nature ${c.scores.nature.toFixed(1)}`,
  },
  {
    slug: "etudiants",
    emoji: "🎓",
    label: "Students",
    reason: (c) =>
      `Culture ${c.scores.culture.toFixed(1)} · transit ${c.scores.transport.toFixed(1)} · cost ${c.scores.cost.toFixed(1)}`,
  },
  {
    slug: "primo-accedants",
    emoji: "🔑",
    label: "First-time buyers",
    reason: (c) =>
      `Cost ${c.scores.cost.toFixed(1)} · quality of life ${c.scores.life.toFixed(1)} · safety ${c.scores.safety.toFixed(1)}`,
  },
  {
    slug: "couple-sans-enfant",
    emoji: "👫",
    label: "Childless couples",
    reason: (c) =>
      `Culture ${c.scores.culture.toFixed(1)} · quality of life ${c.scores.life.toFixed(1)} · nature ${c.scores.nature.toFixed(1)}`,
  },
  {
    slug: "freelances",
    emoji: "💼",
    label: "Freelancers",
    reason: (c) =>
      `Remote ${c.scores.remoteWork.toFixed(1)} · culture ${c.scores.culture.toFixed(1)} · cost ${c.scores.cost.toFixed(1)}`,
  },
] as const;

const ORIGIN_SLUGS = commonOriginSlugs(24);

type Props = { params: Promise<{ locale: string; city: string }> };

export function generateStaticParams() {
  return ORIGIN_SLUGS.map((city) => ({ locale: "en", city }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const origin = CITIES_SEED.find((c) => c.slug === city);
  if (!origin) return {};
  return {
    title: `Leaving ${origin.name}: where do people like you move? · 2026`,
    description: `Thinking of leaving ${origin.name}? By profile — family, remote worker, retiree, student, first-time buyer — here are the French cities that score better. Transparent model from official data, no tracking.`,
    alternates: { canonical: `${EN_BASE}/leaving/${origin.slug}` },
    openGraph: {
      title: `Leaving ${origin.name}: where do people go, by profile?`,
      description: `French cities that beat ${origin.name} for each lifestyle profile.`,
    },
  };
}

export default async function LeavingCityPage({ params }: Props) {
  const { city } = await params;
  const origin = CITIES_SEED.find((c) => c.slug === city);
  if (!origin) notFound();

  const sections = FEATURED_PROFILES.map((fp) => {
    const result = migrationFor(origin.slug, fp.slug, 4);
    return result ? { profile: fp, result } : null;
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "People like you", path: "/people-like-you" },
    { name: `Leaving ${origin.name}`, path: `/leaving/${origin.slug}` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="relative overflow-hidden pt-12 pb-8">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-aurora opacity-30" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-tertiary)] mb-3" aria-label="Breadcrumb">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="mx-1">·</span>
            <Link href="/people-like-you" className="hover:underline">People like you</Link>
            <span className="mx-1">·</span>
            <span className="text-[var(--text-secondary)]">Leaving {origin.name}</span>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-3">
            Leaving <span className="font-display italic gradient-text-anim">{origin.name}</span>,
            where do you go?
          </h1>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            For each lifestyle profile, these are the French cities that score
            meaningfully better than {origin.name}. We rank each candidate on
            the axes that matter for that profile and keep the destinations
            that open a real gap.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="warning">
              <Info className="inline h-3 w-3 mr-1" />
              Estimative model — no tracking
            </Badge>
            <Link
              href="/people-like-you"
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] text-white font-semibold px-3 py-1 hover:bg-[var(--accent-hover)] transition-colors"
            >
              <Sparkles className="h-3 w-3" />
              Interactive tool (17 profiles)
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8 pb-10">
        {sections.map(({ profile, result }) => {
          const list = result.upgrades.length > 0 ? result.upgrades : result.laterals;
          const noUpgrade = result.upgrades.length === 0;
          return (
            <section key={profile.slug}>
              <div className="flex items-baseline gap-2 mb-1">
                <span aria-hidden className="text-xl">{profile.emoji}</span>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{profile.label}</h2>
                <span className="text-[11px] text-[var(--text-tertiary)] ml-auto">
                  {origin.name}: {result.origin.score.toFixed(1)}/100
                </span>
              </div>
              {noUpgrade ? (
                <p className="text-sm text-[var(--text-secondary)] mb-3 max-w-2xl leading-snug">
                  On this profile, {origin.name} is already hard to beat. Here are
                  similar cities if you want a change of scenery without losing ground.
                </p>
              ) : null}
              <ol className="grid gap-2.5 sm:grid-cols-2">
                {list.map((m, i) => (
                  <li key={m.city.slug}>
                    <Link
                      href={`/cities/${m.city.slug}`}
                      className="group flex h-full items-center gap-3 rounded-xl border border-[var(--border)] bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-elevated)]/40 ring-1 ring-black/[0.03] hover:border-[var(--accent)]/40 hover:shadow-lg hover:-translate-y-0.5 transition-all px-4 py-3"
                    >
                      <span className="text-xs font-bold font-mono-data text-[var(--text-tertiary)] w-4 shrink-0 text-right">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                            {m.city.name}
                          </span>
                          {!noUpgrade && (
                            <span className="text-[11px] font-bold font-mono-data text-emerald-600 shrink-0 inline-flex items-center gap-0.5">
                              <TrendingUp className="h-3 w-3" />+{m.delta.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] leading-snug truncate">
                          {profile.reason(m.city)}
                        </p>
                        <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {m.city.region}
                        </p>
                      </div>
                      <span className={`text-sm font-bold font-mono-data shrink-0 ${scoreColor(m.score / 10)}`}>
                        {m.score.toFixed(0)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>

      {/* Other origins */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-8">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Starting from another city</h2>
        <div className="flex flex-wrap gap-2">
          {ORIGIN_SLUGS.filter((s) => s !== origin.slug).map((slug) => {
            const c = CITIES_SEED.find((x) => x.slug === slug);
            if (!c) return null;
            return (
              <Link
                key={slug}
                href={`/leaving/${slug}`}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)] transition-all"
              >
                Leaving {c.name}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Methodology / honesty */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        <Card className="bg-[var(--bg-elevated)]/50">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-1.5">
            <Info className="h-4 w-4 text-[var(--accent)]" />
            How to read these numbers
          </h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            These are <strong>not</strong> real movement trajectories — we
            don&apos;t have the account volume yet. It&apos;s an{" "}
            <strong>estimative model</strong>: for each profile we score every
            city on the axes that actually matter (official Insee, SSMSI, DEPP
            data), then keep the ones that beat {origin.name} by at least half a
            point. The &quot;+X&quot; figure is that profile-score gain. To
            explore all 17 profiles and any departure city, use the{" "}
            <Link href="/people-like-you" className="underline">interactive tool</Link>. See
            also the <Link href="/community-profiles" className="underline">community profiles</Link>.
          </p>
        </Card>
      </section>

      <Footer />
    </main>
  );
}
