import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { HonestReviewCard } from "@/components/HonestReviewCard";
import { CITIES_SEED } from "@/data/cities-seed";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { buildHonestReview } from "@/lib/honest-reviews";

// ISR Reads optimization: pure SSG (no Vercel Data Cache layer).
// revalidate=false → page built once at deploy, served from static edge cache.
export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  return {
    title: `Avis honnête sur ${city.name} 2026 · Points forts, faiblesses, profils adaptés`,
    description: `Synthèse honnête sur ${city.name} : ce qui marche vraiment, ce qui cloche, pour qui c'est fait. Dérivée des 8 axes seed + 10 owner scores + classement parmi 10 profils.`,
    alternates: { canonical: `/villes/${slug}/avis-honnete` },
    openGraph: {
      title: `Avis honnête sur ${city.name} · Points forts et faiblesses`,
      description: `Coups de cœur, points de vigilance, profils qui s'y plaisent (ou pas). Synthèse zéro chiffre inventé.`,
    },
  };
}

export default async function HonestReviewPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const review = buildHonestReview(city);
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Avis honnête", path: `/villes/${city.slug}/avis-honnete` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link> ·{" "}
          <Link href="/villes" className="hover:underline">Villes</Link> ·{" "}
          <Link href={`/villes/${city.slug}`} className="hover:underline">{city.name}</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Avis honnête sur {city.name}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Synthèse algorithmique des forces et faiblesses de {city.name}, et des profils pour
          qui cette ville est (ou n&apos;est pas) faite. Aucun chiffre inventé — tout dérive des
          données calibrées du site (8 axes seed + 10 owner scores + classement parmi les 10
          profils éditoriaux).
        </p>

        <div className="mt-8">
          <HonestReviewCard cityName={city.name} citySlug={city.slug} review={buildHonestReview(city)} citiesCount={CITIES_SEED.length} compact />
        </div>

        {/* Quote-style verdict */}
        <Card className="mt-6 border-l-4 border-l-[var(--accent)]">
          <p className="text-sm text-[var(--text-secondary)] italic">
            « {review.oneLine} »
          </p>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Aller plus loin</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/villes/${city.slug}`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-xs uppercase text-[var(--text-tertiary)]">Fiche complète</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{city.name} — Profil ville</div>
            </Card>
          </Link>
          <Link href={`/calculateur-cout-reel/${city.slug}`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-xs uppercase text-[var(--text-tertiary)]">Calculateur</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Coût réel mensuel</div>
            </Card>
          </Link>
          <Link href={`/cout-menage/${city.slug}`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-xs uppercase text-[var(--text-tertiary)]">Profil ménage</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Solo / couple / famille / retraité</div>
            </Card>
          </Link>
          <Link href="/quiz-compatibilite" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-xs uppercase text-[var(--text-tertiary)]">Quiz</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Trouver ma ville idéale</div>
            </Card>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
        <DiscussionCTA citySlug={city.slug} cityName={city.name} />
      </section>

      <Footer />
    </main>
  );
}
