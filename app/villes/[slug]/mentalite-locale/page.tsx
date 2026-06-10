import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { CITIES_SEED } from "@/data/cities-seed";
import { cityMindset } from "@/lib/city-mindset";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { Sparkles, ArrowLeft, Users, Coffee, Mountain, Heart, Globe2 } from "lucide-react";
import Link from "next/link";

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
    title: `Mentalité locale à ${city.name} 2026 — vibe, sociabilité, tempo`,
    description: `Comment vit-on socialement à ${city.name} ? Tempo, ouverture, culture café, vie associative, archetype régional. Synthèse 2026 dérivée du seed + tags.`,
    alternates: { canonical: `/villes/${slug}/mentalite-locale` },
    openGraph: {
      title: `Mentalité locale ${city.name} — comment vit-on socialement`,
      description: `6 dimensions sociales synthétisées pour ${city.name}.`,
    },
  };
}

export default async function MentalitePage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const m = cityMindset(city);
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Mentalité locale", path: `/villes/${city.slug}/mentalite-locale` },
  ]);

  const cards = [
    { icon: Users, title: "Tempo de vie", value: m.tempo.level, body: m.tempo.rationaleFr },
    { icon: Globe2, title: "Ouverture sociale", value: m.openness.level, body: m.openness.rationaleFr },
    { icon: Coffee, title: "Culture café", value: m.cafeCulture.level, body: m.cafeCulture.rationaleFr },
    {
      icon: Mountain,
      title: "Orientation outdoor",
      value: `${m.outdoorOrientation.labelFr} (${m.outdoorOrientation.score}/10)`,
      body: "Composite : score nature + ensoleillement + proximité mer/montagne + culture vélo.",
    },
    {
      icon: Heart,
      title: "Vie associative",
      value: `${m.associativeLife.labelFr} (${m.associativeLife.score}/10)`,
      body: "Composite : score culture + sécurité, pondéré par la population (les très petites communes sont structurellement moins riches en associations).",
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <main id="main-content" className="min-h-screen bg-[var(--bg-canvas)]">
        <Navbar />
        <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Breadcrumbs
              items={[
                { label: "Villes", href: "/villes" },
                { label: city.name, href: `/villes/${city.slug}` },
                { label: "Mentalité locale" },
              ]}
            />
            <div className="mt-6 flex items-center gap-3">
              <div className="rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] p-2.5">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                  Mentalité locale — {city.name}
                </h1>
                <p className="text-sm text-[var(--text-tertiary)] mt-1">
                  Synthèse 2026 dérivée du seed + tags + archetype régional. Indicatif — toute personne ressent une ville différemment.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="mb-8 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)] mb-2">
                <Globe2 className="h-4 w-4" />
                Archetype régional — {city.region}
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {m.regionalArchetype.fr}
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {cards.map((card, i) => (
                <li
                  key={i}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-tertiary)] mb-2">
                    <card.icon className="h-4 w-4" />
                    {card.title}
                  </div>
                  <div className="text-lg font-semibold text-[var(--text-primary)] capitalize">
                    {card.value}
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                    {card.body}
                  </p>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-xs text-[var(--text-tertiary)] leading-relaxed">
              Méthode : chaque dimension est dérivée par règles transparentes des 8 axes du seed (population, transport, culture, sécurité, nature, télétravail), du climat (ensoleillement, températures), des character-tags éditoriaux et de l'archetype régional. Aucune donnée d'enquête sociologique n'est mobilisée — c'est une synthèse honnête de signaux quantitatifs, pas un portrait psychologique.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/villes/${city.slug}/profils`}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)]/40"
              >
                Profils-types →
              </Link>
              <Link
                href={`/villes/${city.slug}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:underline"
              >
                <ArrowLeft className="h-4 w-4" /> Retour à la fiche {city.name}
              </Link>
            </div>

            <DiscussionCTA citySlug={city.slug} cityName={city.name} />
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
