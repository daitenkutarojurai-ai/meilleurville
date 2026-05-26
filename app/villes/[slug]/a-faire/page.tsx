import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CITIES_SEED } from "@/data/cities-seed";
import { GUIDES } from "@/data/guides";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ChevronRight, MapPin, TreePine, Utensils, Music, Bike, Camera, Coffee, Sunset } from "lucide-react";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ slug: c.slug }));
}

type CityRecord = (typeof CITIES_SEED)[number];

interface ActivityCategory {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
}

function buildActivityCategories(city: CityRecord): ActivityCategory[] {
  const { scores, characterTags } = city;
  const tags = new Set(characterTags);

  return [
    {
      icon: <TreePine className="h-5 w-5" />,
      label: "Nature & plein air",
      description: scores.nature >= 7
        ? `Score nature exceptionnel (${scores.nature.toFixed(1)}/10). Randonnée, parcs, espaces verts à portée immédiate.`
        : scores.nature >= 5.5
        ? `Accès correct aux espaces naturels (${scores.nature.toFixed(1)}/10). Parcs urbains et sorties de week-end possibles.`
        : `Nature limitée en proximité (${scores.nature.toFixed(1)}/10). Escapades à prévoir hors de la ville.`,
      enabled: scores.nature >= 5.0,
    },
    {
      icon: <Utensils className="h-5 w-5" />,
      label: "Gastronomie & marchés",
      description: tags.has("gastronomie") || scores.culture >= 6.5
        ? `Ville réputée pour sa gastronomie. Marchés, restaurants de qualité, produits locaux bien représentés.`
        : `Offre de restauration correcte avec quelques adresses locales à dénicher.`,
      enabled: true,
    },
    {
      icon: <Music className="h-5 w-5" />,
      label: "Culture & spectacles",
      description: scores.culture >= 7
        ? `Score culture élevé (${scores.culture.toFixed(1)}/10). Musées, théâtres, concerts, festivals — programme dense.`
        : scores.culture >= 5.5
        ? `Vie culturelle active (${scores.culture.toFixed(1)}/10). Quelques lieux emblématiques et événements réguliers.`
        : `Culture concentrée sur quelques équipements clés (${scores.culture.toFixed(1)}/10).`,
      enabled: scores.culture >= 5.0,
    },
    {
      icon: <Bike className="h-5 w-5" />,
      label: "Vélo & mobilité douce",
      description: scores.transport >= 7 || tags.has("vélo")
        ? `Ville bien équipée pour se déplacer à vélo. Pistes cyclables, voies vertes, topographie favorable.`
        : scores.transport >= 5.5
        ? `Réseau cyclable en développement. Certains itinéraires balisés accessibles.`
        : `Mobilité douce limitée — voiture encore nécessaire pour la plupart des trajets.`,
      enabled: scores.transport >= 5.5 || tags.has("vélo"),
    },
    {
      icon: <Camera className="h-5 w-5" />,
      label: "Patrimoine & architecture",
      description: tags.has("patrimoine") || tags.has("historique") || scores.culture >= 6.5
        ? `Patrimoine architectural remarquable. Monuments historiques, quartiers anciens, promenades culturelles.`
        : `Quelques témoins architecturaux à découvrir en centre-ville.`,
      enabled: tags.has("patrimoine") || tags.has("historique") || scores.culture >= 6.0,
    },
    {
      icon: <Coffee className="h-5 w-5" />,
      label: "Vie de quartier & terrasses",
      description: tags.has("étudiant") || tags.has("bobo") || tags.has("dynamique")
        ? `Vie de quartier animée. Terrasses, bars, cafés indépendants — le quotidien se vit dehors.`
        : `Quelques axes commerçants actifs avec terrasses ouvertes en saison.`,
      enabled: tags.has("étudiant") || tags.has("bobo") || tags.has("dynamique") || scores.culture >= 5.5,
    },
    {
      icon: <Sunset className="h-5 w-5" />,
      label: "Détente & bien-être",
      description: scores.life >= 7
        ? `Cadre de vie exceptionnel (${scores.life.toFixed(1)}/10). Rythme posé, offre bien-être développée.`
        : `Qualité de vie correcte pour les activités de détente (${scores.life.toFixed(1)}/10).`,
      enabled: scores.life >= 5.5,
    },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  return {
    title: `Que faire à ${city.name} 2026 — activités, sorties et bons plans`,
    description: `10 activités incontournables et bons plans locaux à ${city.name} : nature, gastronomie, culture, vie de quartier et sorties week-end 2026.`,
    alternates: { canonical: `/villes/${slug}/a-faire` },
  };
}

export default async function AFairePage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const guideSlug = `10-choses-a-faire-a-${slug}-2026`;
  const guide = GUIDES.find((g) => g.slug === guideSlug);
  const activities = buildActivityCategories(city);
  const enabledActivities = activities.filter((a) => a.enabled);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${slug}` },
    { name: `Que faire à ${city.name}`, path: `/villes/${slug}/a-faire` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />
      <AmbientBackground />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-16 pb-8">
        <nav className="mb-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--accent)]">Accueil</Link>
          {" · "}
          <Link href="/villes" className="hover:text-[var(--accent)]">Villes</Link>
          {" · "}
          <Link href={`/villes/${slug}`} className="hover:text-[var(--accent)]">{city.name}</Link>
          {" · "}
          <span className="text-[var(--text-primary)]">À faire</span>
        </nav>

        <div className="flex items-start gap-3 mb-6">
          <div className="mt-1">
            <MapPin className="h-7 w-7 text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] leading-tight">
              Que faire à {city.name} ?
            </h1>
            <p className="mt-2 text-[var(--text-secondary)] max-w-2xl">
              Activités, sorties et bons plans à {city.name} — nature, gastronomie, culture,
              vie de quartier. Tout ce qui vaut le déplacement en {new Date().getFullYear()}.
            </p>
          </div>
        </div>

        {/* Featured guide card if the 10-choses guide exists */}
        {guide && (
          <div className="mb-8 rounded-2xl border border-[var(--accent)]/30 bg-gradient-to-br from-[var(--bg-surface)] to-[var(--accent)]/5 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] mb-2">
                  Guide complet
                </div>
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                  {guide.title}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] line-clamp-3">
                  {guide.intro}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {guide.sections.slice(0, 5).map((s, i) => (
                    <span
                      key={i}
                      className="text-xs bg-[var(--bg-canvas)] border border-[var(--border)] rounded-full px-3 py-1 text-[var(--text-secondary)]"
                    >
                      {s.heading.replace(/^\d+\.\s*/, "")}
                    </span>
                  ))}
                  {guide.sections.length > 5 && (
                    <span className="text-xs bg-[var(--bg-canvas)] border border-[var(--border)] rounded-full px-3 py-1 text-[var(--accent)]">
                      +{guide.sections.length - 5} autres
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Link
              href={`/guides/${guide.slug}`}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Lire le guide complet
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Activity categories grid */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            Ce que {city.name} offre
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {enabledActivities.map((activity) => (
              <div
                key={activity.label}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[var(--accent)]">{activity.icon}</span>
                  <span className="font-semibold text-sm text-[var(--text-primary)]">{activity.label}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {activity.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Related guides from the tourisme category */}
        {(() => {
          const relatedTourisme = GUIDES.filter(
            (g) => g.category === "tourisme" && g.relatedCities.includes(slug) && g.slug !== guideSlug
          );
          if (relatedTourisme.length === 0) return null;
          return (
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Autres guides sur {city.name}</h2>
              <div className="space-y-3">
                {relatedTourisme.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/guides/${g.slug}`}
                    className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition-colors px-5 py-4 group"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                        {g.emoji} {g.title}
                      </div>
                      <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{g.readMinutes} min de lecture</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0 ml-3" />
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Score snapshot */}
        <div className="mb-10 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
          <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">
            Profil de {city.name} en un coup d'œil
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Culture & loisirs", value: city.scores.culture },
              { label: "Nature", value: city.scores.nature },
              { label: "Qualité de vie", value: city.scores.life },
              { label: "Transport", value: city.scores.transport },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-[var(--accent)]">{value.toFixed(1)}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-[var(--text-tertiary)]">
            Scores sur 10 · <Link href="/methode" className="underline hover:text-[var(--accent)]">Voir la méthodologie</Link>
          </p>
        </div>

        {/* Character tags */}
        {city.characterTags.length > 0 && (
          <div className="mb-10">
            <h2 className="text-base font-bold text-[var(--text-primary)] mb-3">
              {city.name} en quelques mots
            </h2>
            <div className="flex flex-wrap gap-2">
              {city.characterTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full text-sm border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Nav to the full guide if no guide exists yet */}
        {!guide && (
          <div className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 text-center">
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              Le guide complet des 10 choses à faire à {city.name} arrive prochainement.
            </p>
            <Link
              href="/guides"
              className="inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:underline"
            >
              Voir tous les guides pratiques
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Back to city + explore */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <Link
            href={`/villes/${slug}`}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition-colors px-5 py-3 text-sm font-medium text-[var(--text-primary)]"
          >
            ← Retour à {city.name}
          </Link>
          <Link
            href="/guides"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 hover:bg-[var(--accent)]/10 transition-colors px-5 py-3 text-sm font-medium text-[var(--accent)]"
          >
            Tous les guides pratiques →
          </Link>
        </div>

        <DiscussionCTA cityName={city.name} citySlug={slug} />
      </section>

      <Footer />
    </main>
  );
}
