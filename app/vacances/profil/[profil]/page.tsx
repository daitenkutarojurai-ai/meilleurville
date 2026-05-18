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
  topCitiesForProfile,
  BUDGET_TIER_LABEL,
  VACATION_PROFILES,
  VACATION_PROFILE_DEFS,
  type VacationProfile,
} from "@/lib/vacation-fit";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { MapPin } from "lucide-react";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ profil: string }> };

export function generateStaticParams() {
  return VACATION_PROFILES.map((slug) => ({ profil: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { profil } = await params;
  if (!VACATION_PROFILES.includes(profil as VacationProfile)) return {};
  const def = VACATION_PROFILE_DEFS[profil as VacationProfile];
  return {
    title: `Vacances ${def.label.toLowerCase()} en France 2026 · destinations adaptées`,
    description: def.metaDesc,
    alternates: { canonical: `/vacances/profil/${profil}` },
    openGraph: {
      title: `Vacances ${def.label.toLowerCase()} en France`,
      description: def.intro,
    },
  };
}

export default async function ProfilPage({ params }: Props) {
  const { profil } = await params;
  if (!VACATION_PROFILES.includes(profil as VacationProfile)) notFound();
  const slug = profil as VacationProfile;
  const def = VACATION_PROFILE_DEFS[slug];

  const top20 = topCitiesForProfile(slug, { limit: 20 });

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Vacances", path: "/vacances" },
    { name: def.label, path: `/vacances/profil/${slug}` },
  ]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Meilleures destinations vacances ${def.label.toLowerCase()} en France`,
    itemListElement: top20.slice(0, 10).map(({ city }, i) => ({
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
            <Badge>{top20.length} destinations classées</Badge>
            <Badge>Sécurité · qualité de vie · adéquation profil</Badge>
          </div>
        </div>
      </section>

      {/* Top 10 */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          Top 10 destinations {def.label.toLowerCase()}
        </h2>
        <div className="space-y-3">
          {top20.slice(0, 10).map(({ city, fit }, i) => (
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
                    <span className="inline-flex items-center rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)] font-mono-data">
                      Profil {def.label} : {fit.profileScore.toFixed(1)}/10
                    </span>
                    <span className="inline-flex items-center rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)] font-mono-data">
                      {BUDGET_TIER_LABEL[fit.budgetTier]}
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

      {/* Suite */}
      {top20.length > 10 && (
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            Et aussi
          </h2>
          <div className="flex flex-wrap gap-2">
            {top20.slice(10).map(({ city, fit }, i) => (
              <Link
                key={city.slug}
                href={`/villes/${city.slug}`}
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

      {/* Cross-links profils */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
          Autres profils
        </h2>
        <div className="flex flex-wrap gap-2">
          {VACATION_PROFILES.filter((p) => p !== slug).map((p) => {
            const otherDef = VACATION_PROFILE_DEFS[p];
            return (
              <Link
                key={p}
                href={`/vacances/profil/${p}`}
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
            Le profil <strong>{def.label.toLowerCase()}</strong> agrège différemment les
            scores existants du site (sécurité, qualité de vie, culture,
            transport, coût, nature) selon ce qui pèse vraiment pour ce type de
            voyage. Filtre population ≥ 8 000 hab. — les destinations
            confidentielles arrivent dans la fiche par ville ou par activité.
            <br /><br />
            <strong>Couverture :</strong> {CITIES_COUNT} villes évaluées.
          </p>
        </Card>
      </section>

      <Footer />
    </main>
  );
}
