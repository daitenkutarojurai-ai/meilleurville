import { Metadata } from "next";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import Link from "@/components/AppLink";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import { CityCard } from "@/components/CityCard";
import { DepartementFiche } from "@/components/DepartementFiche";
import { DepartementVoisins } from "@/components/DepartementVoisins";
import { CITIES_SEED } from "@/data/cities-seed";
import { GUIDES, GUIDE_CATEGORIES } from "@/data/guides";
import type { City } from "@/lib/types";

import { deptToSlug, slugToDept, getAllDepartments } from "@/lib/dept-slug";
import { hreflangLanguages } from "@/lib/i18n";
import { clampMeta, fitTitle } from "@/lib/brand";

// ISR Reads optimization: pure SSG (no Vercel Data Cache layer).
// revalidate=false → page built once at deploy, served from static edge cache.
export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ dept: string }> };

export function generateStaticParams() {
  return getAllDepartments().map((d) => ({ dept: deptToSlug(d) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dept: deptSlug } = await params;
  const dept = slugToDept(deptSlug);
  if (!dept) return {};
  const cities = CITIES_SEED.filter((c) => c.department === dept);
  const topCity = [...cities].sort((a, b) => b.scores.global - a.scores.global)[0];
  return {
    // Mayotte est à la fois région et département : même titre que /regions/mayotte sans ce cas.
    title: fitTitle(
      topCity?.region === dept
        ? `Villes du département ${dept} 2026 · Qualité de vie & Classements`
        : `Meilleures villes ${dept} 2026 · Qualité de vie & Classements`,
    ),
    description: clampMeta(`Découvrez les ${cities.length} meilleures villes du département ${dept} : scores qualité de vie, comparaisons, avis d'habitants. N°1 : ${topCity?.name} (${topCity?.scores.global}/10).`),
    alternates: { canonical: `/departements/${deptSlug}`, languages: hreflangLanguages(`/departements/${deptSlug}`) },
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
      title: `Villes de ${dept} · MaVilleIdéale`,
      description: `${cities.length} villes analysées · Top : ${topCity?.name} ${topCity?.scores.global}/10`,
    },
  };
}

function seedToCity(s: (typeof CITIES_SEED)[number]): City {
  return {
    id: s.slug,
    slug: s.slug,
    name: s.name,
    region: s.region,
    department: s.department,
    population: s.population,
    latitude: s.latitude,
    longitude: s.longitude,
    scores: s.scores,
    characterTags: s.characterTags,
    reviewCount: 150 + Math.floor(s.scores.global * 25),
    sunshinedays: s.sunshinedays,
    avgTempJuly: s.avgTempJuly,
    avgTempJanuary: s.avgTempJanuary,
  };
}

function regionToSlug(region: string): string {
  return region
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function DeptPage({ params }: Props) {
  const { dept: deptSlug } = await params;
  const deptName = slugToDept(deptSlug);
  if (!deptName) notFound();

  const cities = CITIES_SEED.filter((c) => c.department === deptName)
    .sort((a, b) => b.scores.global - a.scores.global);

  if (cities.length === 0) notFound();

  const region = cities[0].region;
  const top3 = cities.slice(0, 3);
  const rest = cities.slice(3);
  const avgScore = cities.reduce((s, c) => s + c.scores.global, 0) / cities.length;

  const deptCitySlugs = new Set(cities.map((c) => c.slug));
  const deptGuides = GUIDES.filter((g) =>
    g.relatedCities.some((s) => deptCitySlugs.has(s))
  )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const avgCriteria = {
    nature: cities.reduce((s, c) => s + c.scores.nature, 0) / cities.length,
    cost: cities.reduce((s, c) => s + c.scores.cost, 0) / cities.length,
    safety: cities.reduce((s, c) => s + c.scores.safety, 0) / cities.length,
    transport: cities.reduce((s, c) => s + c.scores.transport, 0) / cities.length,
    culture: cities.reduce((s, c) => s + c.scores.culture, 0) / cities.length,
  };

  const AXIS_CHIP_LABEL: Record<string, string> = {
    nature: "Nature",
    cost: "Coût",
    safety: "Sécurité",
    transport: "Transports",
    culture: "Culture",
  };

  const topCity = cities[0];
  const bestCriteria = Object.entries(avgCriteria).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k);
  const criteriaLabels: Record<string, string> = {
    nature: "la qualité de la nature",
    cost: "l'accessibilité des prix",
    safety: "la sécurité",
    transport: "les transports",
    culture: "la vie culturelle",
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", position: 1, name: "Accueil", item: baseUrl },
          { "@type": "ListItem", position: 2, name: "Départements", item: `${baseUrl}/departements` },
          { "@type": "ListItem", position: 3, name: deptName, item: `${baseUrl}/departements/${deptSlug}` },
        ],
      },
      {
        "@type": "AdministrativeArea",
        "name": deptName,
        "url": `${baseUrl}/departements/${deptSlug}`,
        "containedInPlace": { "@type": "AdministrativeArea", name: region },
        // Pas d'`aggregateRating` ici, et c'est délibéré (retiré le 2026-09-04).
        // La balise a un sens précis : la moyenne de notes laissées par des
        // personnes. Ce qui était publié dessous n'en était pas une —
        // `ratingValue` portait la moyenne de **nos** scores éditoriaux et
        // `ratingCount` le **nombre de villes** du département, si bien que
        // /departements/paris annonçait « 5,10/10 sur la base de 1 avis » et
        // Mayotte « 3,00/10 sur la base de 1 avis ». Trois raisons de ne pas la
        // remettre : ① un décompte de villes n'est pas un décompte d'avis, et
        // aucune page du site ne prétend le contraire à l'écran ; ② la jumelle
        // EN /departments/[dept] n'a jamais rien déclaré de tel, donc deux
        // pages en relation hreflang décrivaient la même donnée
        // différemment — c'est le défaut corrigé le 28/08 sur les 139 pages EN
        // qui annonçaient leur `itemListOrder` à l'envers ; ③ la valeur elle-même
        // sortait à deux décimales quand tout le reste du site publie une seule.
        // La moyenne reste affichée sur la page, comme score éditorial, ce
        // qu'elle est. Les vrais avis d'habitants vivent dans l'onglet
        // discussion (D1), et leur compte n'est pas ce nombre-là.
      },
      {
        "@type": "ItemList",
        "name": `Meilleures villes du département ${deptName}`,
        "numberOfItems": cities.length,
        "itemListElement": cities.map((c, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": c.name,
          "url": `${baseUrl}/villes/${c.slug}`,
        })),
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `Quelle est la meilleure ville du département ${deptName} ?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `D'après notre algorithme, la meilleure ville de ${deptName} est ${topCity.name} avec un score de ${topCity.scores.global}/10. Elle est reconnue pour ${topCity.characterTags.slice(0, 2).join(" et ")}.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="relative overflow-hidden bg-aurora pt-20 pb-12 sm:pb-14">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-5">
            <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/departements" className="hover:text-[var(--text-secondary)] transition-colors">Départements</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">{deptName}</span>
          </nav>
          <div className="flex items-center gap-3 mb-3">
            <EmojiBadge emoji="📍" tone={toneFor(deptSlug)} />
            <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              Département
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="font-display gradient-text-anim italic">{deptName}</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Région {region} ·{" "}
            <Link href={`/regions/${regionToSlug(region)}`} className="font-semibold text-[#4338CA] hover:underline">
              voir la région →
            </Link>
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center rounded-full bg-white/85 px-3 py-1 font-semibold text-[#4338CA] ring-1 ring-[#C7D2FE]">{cities.length} ville{cities.length > 1 ? "s" : ""} analysée{cities.length > 1 ? "s" : ""}</span>
            <span className="inline-flex items-center rounded-full bg-white/85 px-3 py-1 font-semibold text-[#4338CA] ring-1 ring-[#C7D2FE]">Score moyen {avgScore.toFixed(1)}/10</span>
            <span className="inline-flex items-center rounded-full bg-white/85 px-3 py-1 font-semibold text-[#4338CA] ring-1 ring-[#C7D2FE]">Données 2026</span>
          </div>
          <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] max-w-3xl leading-relaxed">
            Le département {deptName}, situé en {region}, se distingue particulièrement pour {bestCriteria.map((k) => criteriaLabels[k]).join(" et ")}
            {topCity ? ` — la ville la mieux notée est ${topCity.name} avec ${topCity.scores.global.toFixed(1)}/10` : ""}.
            {cities.length > 1
              ? ` Les ${cities.length} villes analysées offrent un éventail de choix pour tous les profils.`
              : " C'est la principale ville analysée dans ce département."}
          </p>
        </div>
      </section>

      {/* Profil moyen + teasers + fiche */}
      <section className="band band-indigo py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-10">
          <div>
            <h2 className="text-xl font-bold gradient-text">Profil moyen du département</h2>
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-3">
              {Object.entries(avgCriteria).map(([key, val]) => (
                <div key={key} className="rounded-2xl bg-white px-2 py-3 text-center sm:px-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
                  <div className="text-xl font-bold font-mono-data text-[#4338CA]">{val.toFixed(1)}</div>
                  <div className="text-xs text-[var(--text-secondary)]">{AXIS_CHIP_LABEL[key]}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {/* Fiscalité teaser — surfaces the new /departements/[slug]/fiscalite hub */}
              <Link
                href={`/departements/${deptSlug}/fiscalite`}
                className="group flex flex-wrap items-center gap-3 rounded-2xl bg-white ring-1 ring-transparent hover:ring-[#C7D2FE] shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)] hover:-translate-y-0.5 transition-all px-5 py-4"
              >
                <EmojiBadge emoji="💰" tone="sky" size="sm" className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    Fiscalité du département {deptName}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Taxe foncière, THRS, droits de mutation — estimation départementale 2026 + fiche par commune.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold shrink-0">Voir →</span>
              </Link>

              {/* F65 — Synthèse département teaser */}
              <Link
                href={`/departements/${deptSlug}/synthese`}
                className="group flex flex-wrap items-center gap-3 rounded-2xl bg-white ring-1 ring-transparent hover:ring-[#C7D2FE] shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)] hover:-translate-y-0.5 transition-all px-5 py-4"
              >
                <EmojiBadge emoji="✨" tone="lilac" size="sm" className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    Synthèse 8 axes — villes du {deptName}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Palmarès local sur env / santé / emploi / cadre / vélo / sécurité / démo / services
                    publics + profil moyen du département.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold shrink-0">Voir →</span>
              </Link>
            </div>
          </div>

          <DepartementFiche department={deptName} />
        </div>
      </section>

      {/* Top 3 */}
      <section className="band band-pink py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold gradient-text mb-4">
            Top {Math.min(3, cities.length)} en {deptName}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {top3.map((city, i) => (
              <CityCard key={city.slug} city={seedToCity(city)} rank={i + 1} />
            ))}
          </div>
        </div>
      </section>

      {rest.length > 0 && (
        <section className="band band-sky py-10 sm:py-12">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold gradient-text mb-4">
              {rest.length === 1 ? "L'autre ville analysée" : `Les ${rest.length} autres villes`}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((city, i) => (
                <CityCard key={city.slug} city={seedToCity(city)} rank={i + 4} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Guides + voisins + comparaisons + renvois */}
      <section className="band band-lilac py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-12">
          {deptGuides.length > 0 && (
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                <h2 className="text-xl font-bold gradient-text">
                  Guides liés au département
                </h2>
                <Link href="/guides" className="text-xs font-semibold text-[#4338CA] hover:underline">
                  Tous les guides →
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {deptGuides.map((g) => {
                  const cat = GUIDE_CATEGORIES.find((c) => c.id === g.category);
                  return (
                    <Link key={g.slug} href={`/guides/${g.slug}`} className="group block">
                      <div className="h-full rounded-2xl bg-white p-4 ring-1 ring-transparent shadow-[0_10px_28px_-18px_rgba(124,58,237,0.45)] transition-all group-hover:-translate-y-0.5 group-hover:ring-[#D8B4FE]">
                        <div className="flex items-center gap-2 mb-2">
                          <EmojiBadge emoji={g.emoji} tone={toneFor(g.slug)} size="sm" />
                          {cat && (
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#4338CA]">
                              {cat.label}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug group-hover:text-[var(--accent)] transition-colors line-clamp-3">
                          {g.title}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)] mt-2">{g.readMinutes} min</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <DepartementVoisins department={deptName} />

            {(() => {
              const siblings = [...new Set(
                CITIES_SEED.filter((c) => c.region === region && c.department !== deptName).map((c) => c.department)
              )].sort((a, b) => a.localeCompare(b, "fr"));
              if (siblings.length === 0) return null;
              return (
                <div>
                  <h2 className="text-xl font-bold gradient-text mb-3">
                    Comparer {deptName} avec les départements de sa région
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {siblings.map((s) => {
                      const [x, y] = [deptName, s].sort((a, b) => a.localeCompare(b, "fr"));
                      return (
                        <Link
                          key={s}
                          href={`/comparer-departements/${deptToSlug(x)}-vs-${deptToSlug(y)}`}
                          className="rounded-full bg-white ring-1 ring-[#E9D5FF] hover:ring-[#C084FC] shadow-[0_8px_20px_-16px_rgba(124,58,237,0.5)] px-3 py-1.5 text-xs font-medium text-[#6D28D9] transition-all"
                        >
                          vs {s}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

          <div className="flex flex-wrap gap-3">
            <Link href="/departements" className="rounded-full bg-white ring-1 ring-[#C7D2FE] px-4 py-2.5 text-sm font-medium text-[#4338CA] hover:ring-[#818CF8] transition-all">
              ← Tous les départements
            </Link>
            <Link href={`/regions/${regionToSlug(region)}`} className="rounded-full bg-white ring-1 ring-[#C7D2FE] px-4 py-2.5 text-sm font-medium text-[#4338CA] hover:ring-[#818CF8] transition-all">
              Région {region} →
            </Link>
            <Link href="/classements" className="rounded-full bg-white ring-1 ring-[#C7D2FE] px-4 py-2.5 text-sm font-medium text-[#4338CA] hover:ring-[#818CF8] transition-all">
              Classements thématiques →
            </Link>
            <Link href="/city-match" className="rounded-full grad-head-0 px-4 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5">
              ✨ Quiz : trouver ma ville →
            </Link>
          </div>
        </div>
      </section>

      <section className="band band-white py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FeedbackWidget />
        </div>
      </section>

      <Footer />
    </main>
  );
}
