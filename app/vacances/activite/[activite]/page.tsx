import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BookingCTA } from "@/components/BookingCTA";
import { CITIES_COUNT } from "@/lib/site-stats";
import {
  formatMonthLabel,
  type MonthIndex,
} from "@/lib/vacation-seasons";
import {
  ACTIVITIES,
  ACTIVITY_DEFS,
  type ActivitySlug,
} from "@/lib/vacation-activities";
import {
  topCitiesForActivity,
  BUDGET_TIER_LABEL,
} from "@/lib/vacation-fit";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { MapPin, Calendar } from "lucide-react";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ activite: string }> };

export function generateStaticParams() {
  return ACTIVITIES.map((slug) => ({ activite: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { activite } = await params;
  if (!ACTIVITIES.includes(activite as ActivitySlug)) return {};
  const def = ACTIVITY_DEFS[activite as ActivitySlug];
  return {
    title: `Vacances ${def.label.toLowerCase()} en France 2026 · top destinations`,
    description: def.metaDesc,
    alternates: { canonical: `/vacances/activite/${activite}` },
    openGraph: {
      title: `Vacances ${def.label.toLowerCase()} en France`,
      description: def.intro,
    },
  };
}

export default async function ActivitePage({ params }: Props) {
  const { activite } = await params;
  if (!ACTIVITIES.includes(activite as ActivitySlug)) notFound();
  const slug = activite as ActivitySlug;
  const def = ACTIVITY_DEFS[slug];

  const top30 = topCitiesForActivity(slug, { limit: 30 });

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Vacances", path: "/vacances" },
    { name: def.label, path: `/vacances/activite/${slug}` },
  ]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Meilleures destinations ${def.label.toLowerCase()} en France`,
    itemListElement: top30.slice(0, 10).map(({ city }, i) => ({
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

      <section className="relative overflow-hidden pt-12 pb-10 sm:pt-14">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-aurora opacity-30" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-tertiary)] mb-3" aria-label="Fil d'Ariane">
            <Link href="/" className="hover:underline">Accueil</Link>
            <span className="mx-1">·</span>
            <Link href="/vacances" className="hover:underline">Vacances</Link>
            <span className="mx-1">·</span>
            <span className="text-[var(--text-secondary)]">{def.label}</span>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-3 flex items-center gap-3 flex-wrap">
            <span aria-hidden>{def.emoji}</span>
            <span>Vacances <span className="font-display italic gradient-text-anim">{def.label.toLowerCase()}</span> en France</span>
          </h1>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            {def.intro}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <Badge>
              <Calendar className="inline h-3 w-3 mr-1" />
              Meilleurs mois : {def.bestMonths.map((m) => formatMonthLabel(m as MonthIndex).slice(0, 3)).join(" · ")}
            </Badge>
            <Badge>{top30.length} destinations classées</Badge>
          </div>
        </div>
      </section>

      {/* Top 15 destinations */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          Top 15 destinations {def.label.toLowerCase()}
        </h2>
        <div className="space-y-3">
          {top30.slice(0, 15).map(({ city, fit }, i) => (
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
                      href={`/villes/${city.slug}`}
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
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)] font-mono-data">
                      Note activité : {fit.activityScore.toFixed(1)}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)] font-mono-data">
                      {BUDGET_TIER_LABEL[fit.budgetTier]}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)]">
                      Mois forts : {fit.bestMonths.map((m) => formatMonthLabel(m).slice(0, 3)).join(", ")}
                    </span>
                  </div>
                  <div className="mt-3">
                    <BookingCTA cityName={city.name} variant="compact" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Suite du top */}
      {top30.length > 15 && (
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            Et aussi
          </h2>
          <div className="flex flex-wrap gap-2">
            {top30.slice(15).map(({ city, fit }, i) => (
              <Link
                key={city.slug}
                href={`/villes/${city.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
              >
                <span className="font-mono-data text-[var(--text-tertiary)]">#{16 + i}</span>
                <span>{city.name}</span>
                <span className="font-mono-data font-bold text-[var(--accent)]">{fit.score.toFixed(1)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Cross-links autres activités */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
          Autres envies
        </h2>
        <div className="flex flex-wrap gap-2">
          {ACTIVITIES.filter((a) => a !== slug).map((a) => {
            const otherDef = ACTIVITY_DEFS[a];
            return (
              <Link
                key={a}
                href={`/vacances/activite/${a}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
              >
                <span aria-hidden>{otherDef.emoji}</span>
                {otherDef.label}
              </Link>
            );
          })}
          <Link
            href="/vacances"
            className="rounded-full bg-[var(--accent)] text-white px-3 py-1 text-xs font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            ← Hub Vacances
          </Link>
        </div>
      </section>

      {/* Méthodo */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-14">
        <Card className="bg-[var(--bg-elevated)]/40">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Comment ce classement est construit
          </h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Pour {def.label.toLowerCase()}, on score chaque ville sur son adéquation à
            l&apos;activité (détection par caractéristiques géographiques + tags +
            scores), puis on pondère par la qualité globale de la ville et son
            profil voyageur. Les destinations qui ne sont pas adaptées à
            l&apos;activité sont exclues, pas mises en bas du classement avec un score
            faible — ça n&apos;a aucun sens de classer Châteauroux pour la plage.
            <br /><br />
            <strong>Couverture :</strong> {CITIES_COUNT} villes évaluées, {top30.length} pertinentes
            pour {def.label.toLowerCase()}.
          </p>
        </Card>
      </section>

      <Footer />
    </main>
  );
}
