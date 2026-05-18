import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BookingCTA } from "@/components/BookingCTA";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  METRO_REGIONS,
  REGION_EMOJIS,
  REGION_TAGLINES,
  regionToSlug,
  slugToRegion,
} from "@/lib/regions";
import {
  formatMonthLabel,
} from "@/lib/vacation-seasons";
import {
  ACTIVITIES,
  ACTIVITY_DEFS,
  activityFitness,
  type ActivitySlug,
} from "@/lib/vacation-activities";
import {
  vacationFit,
  bestMonthsFor,
} from "@/lib/vacation-fit";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { MapPin, ChevronRight } from "lucide-react";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ region: string }> };

// Inclut DROM (5) + métro (13) — sauf si on veut limiter, mais le hub vacances
// gagne à couvrir l'Outre-mer pour les requêtes "vacances Réunion", etc.
const ALL_REGIONS: string[] = [
  ...METRO_REGIONS,
  "La Réunion",
  "Martinique",
  "Guadeloupe",
  "Guyane",
  "Mayotte",
];

export function generateStaticParams() {
  return ALL_REGIONS.map((r) => ({ region: regionToSlug(r) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region } = await params;
  const r = slugToRegion(region, ALL_REGIONS);
  if (!r) return {};
  return {
    title: `Vacances en ${r} 2026 — top destinations`,
    description: `Où partir en vacances en ${r} : top destinations classées, meilleurs mois, activités phares. ${REGION_TAGLINES[r] ?? ""}`,
    alternates: { canonical: `/vacances/region/${region}` },
    openGraph: {
      title: `Vacances en ${r}`,
      description: REGION_TAGLINES[r] ?? `Top destinations en ${r}.`,
    },
  };
}

export default async function RegionVacancesPage({ params }: Props) {
  const { region } = await params;
  const r = slugToRegion(region, ALL_REGIONS);
  if (!r) notFound();

  const cities = CITIES_SEED.filter((c) => c.region === r);
  if (cities.length === 0) notFound();

  // Top 15 villes de la région par score général vacance
  const ranked = cities
    .map((c) => ({ city: c, fit: vacationFit(c) }))
    .sort((a, b) => b.fit.score - a.fit.score)
    .slice(0, 15);

  // Activités phares de la région (somme des fitness > 6 sur les villes top)
  const activityScores = ACTIVITIES.map((slug) => {
    const top = cities
      .map((c) => activityFitness(c, slug))
      .filter((f) => f >= 5)
      .sort((a, b) => b - a)
      .slice(0, 5);
    const avg = top.length > 0 ? top.reduce((s, x) => s + x, 0) / top.length : 0;
    return { slug: slug as ActivitySlug, avg, count: top.length };
  })
    .filter((a) => a.count >= 2 && a.avg >= 5.5)
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Vacances", path: "/vacances" },
    { name: r, path: `/vacances/region/${region}` },
  ]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Meilleures destinations vacances en ${r}`,
    itemListElement: ranked.slice(0, 10).map(({ city }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://mavilleideale.fr/villes/${city.slug}`,
      name: city.name,
    })),
  };

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(itemList)} />
      <Navbar />

      <section className="relative overflow-hidden pt-12 pb-8">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-aurora opacity-30" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-tertiary)] mb-3" aria-label="Fil d'Ariane">
            <Link href="/" className="hover:underline">Accueil</Link>
            <span className="mx-1">·</span>
            <Link href="/vacances" className="hover:underline">Vacances</Link>
            <span className="mx-1">·</span>
            <span className="text-[var(--text-secondary)]">{r}</span>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-3 flex items-center gap-3 flex-wrap">
            <span aria-hidden>{REGION_EMOJIS[r] ?? "🗺️"}</span>
            <span>Vacances en <span className="font-display italic gradient-text-anim">{r}</span></span>
          </h1>
          {REGION_TAGLINES[r] && (
            <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              {REGION_TAGLINES[r]}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <Badge>{cities.length} villes dans la région</Badge>
            <Badge>Top {ranked.length} classées vacances</Badge>
          </div>
        </div>
      </section>

      {/* Top destinations */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          Top destinations en {r}
        </h2>
        <div className="space-y-3">
          {ranked.slice(0, 10).map(({ city, fit }, i) => {
            const best = bestMonthsFor(city);
            return (
              <Card key={city.slug}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:gap-1 shrink-0">
                    <span className="text-2xl font-bold font-mono-data text-[var(--text-tertiary)]">
                      #{i + 1}
                    </span>
                    <span className="text-xl font-bold font-mono-data text-[var(--accent)]">
                      {fit.score.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
                      <Link
                        href={`/vacances/${city.slug}`}
                        className="text-lg font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                      >
                        {city.name}
                      </Link>
                      <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {city.department}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-snug mb-2">
                      {fit.whyOneLine}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)]">
                        Meilleurs mois : {best.map((m) => formatMonthLabel(m).slice(0, 3)).join(", ")}
                      </span>
                    </div>
                    <div className="mt-3">
                      <BookingCTA cityName={city.name} variant="compact" />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Et aussi */}
      {ranked.length > 10 && (
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            Et aussi
          </h2>
          <div className="flex flex-wrap gap-2">
            {ranked.slice(10).map(({ city, fit }, i) => (
              <Link
                key={city.slug}
                href={`/vacances/${city.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
              >
                <span className="font-mono-data text-[var(--text-tertiary)]">#{11 + i}</span>
                <span>{city.name}</span>
                <span className="font-mono-data font-bold text-[var(--accent)]">{fit.score.toFixed(1)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Activités phares */}
      {activityScores.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
            Activités phares en {r}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activityScores.map(({ slug, avg, count }) => {
              const def = ACTIVITY_DEFS[slug];
              return (
                <Link
                  key={slug}
                  href={`/vacances/activite/${slug}`}
                  className="group flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
                >
                  <span aria-hidden className="text-2xl">{def.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {def.label}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                      {count} destinations notées · note moyenne {avg.toFixed(1)}/10
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] shrink-0" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Cross-links autres régions */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
          Autres régions
        </h2>
        <div className="flex flex-wrap gap-2">
          {ALL_REGIONS.filter((x) => x !== r).map((x) => (
            <Link
              key={x}
              href={`/vacances/region/${regionToSlug(x)}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
            >
              <span aria-hidden>{REGION_EMOJIS[x] ?? "🗺️"}</span>
              {x}
            </Link>
          ))}
          <Link
            href="/vacances"
            className="rounded-full bg-[var(--accent)] text-white px-3 py-1 text-xs font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            ← Hub Vacances
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
