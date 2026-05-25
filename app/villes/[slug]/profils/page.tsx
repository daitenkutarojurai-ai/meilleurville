import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CITIES_SEED } from "@/data/cities-seed";
import { computeNicheScores, TERRAIN_LABELS } from "@/lib/niche-scores";
import { cityPortraits } from "@/lib/city-portraits";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { formatScore, scoreColor } from "@/lib/utils";
import { Users, Laptop, PawPrint, Heart, GraduationCap, MapPin, ChevronRight } from "lucide-react";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ slug: c.slug }));
}

const PROFILE_META = [
  {
    key: "expat" as const,
    label: "Expatriés / internationaux",
    icon: MapPin,
    desc: "Accessibilité internationale, transports, culture, taille de ville.",
    pitch: (name: string) => `${name} est-elle une ville ouverte aux profils internationaux ?`,
  },
  {
    key: "remote" as const,
    label: "Télétravailleurs",
    icon: Laptop,
    desc: "Connexion, cadre de vie, coût, diversité culturelle.",
    pitch: (name: string) => `Est-ce confortable de travailler à distance depuis ${name} ?`,
  },
  {
    key: "petFriendly" as const,
    label: "Propriétaires d'animaux",
    icon: PawPrint,
    desc: "Nature, espaces verts, densité, sécurité.",
    pitch: (name: string) => `${name} est-elle accueillante pour les animaux de compagnie ?`,
  },
  {
    key: "retirement" as const,
    label: "Retraités",
    icon: Heart,
    desc: "Sécurité, coût de la vie, nature, calme, climat doux.",
    pitch: (name: string) => `${name} est-elle un bon choix pour la retraite ?`,
  },
  {
    key: "studentLife" as const,
    label: "Étudiants",
    icon: GraduationCap,
    desc: "Culture, transports, budget, vie nocturne et associative.",
    pitch: (name: string) => `La vie étudiante est-elle épanouissante à ${name} ?`,
  },
] as const;

type ProfileKey = (typeof PROFILE_META)[number]["key"];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const niche = computeNicheScores(city);
  const best = [...PROFILE_META].sort((a, b) => niche[b.key] - niche[a.key]);
  const top2 = best.slice(0, 2).map((p) => p.label.toLowerCase()).join(" et ");
  return {
    title: `${city.name} pour quel profil ? Compatibilité par style de vie | MaVilleIdéale`,
    description: `${city.name} convient particulièrement aux ${top2}. Scores de compatibilité pour 5 profils : expats, télétravailleurs, animaux, retraités, étudiants.`,
    alternates: { canonical: `/villes/${slug}/profils` },
    openGraph: {
      title: `${city.name} — pour quel profil de vie ?`,
      description: `Compatibilité par style de vie : télétravailleurs, retraités, étudiants, expats, animaux de compagnie.`,
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

export default async function ProfilsPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const niche = computeNicheScores(city);
  const sorted = [...PROFILE_META].sort((a, b) => niche[b.key] - niche[a.key]);
  const top3 = sorted.slice(0, 3);
  const bottom2 = sorted.slice(-2).reverse();
  const portraits = cityPortraits(city, 3);

  // Similar-profile neighbours: Euclidean distance on the 5 niche scores
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
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${slug}` },
    { name: "Profils", path: `/villes/${slug}/profils` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Pour quel profil ${city.name} est-elle la plus adaptée ?`,
      a: `${city.name} convient particulièrement aux ${top3.map((p) => p.label.toLowerCase()).join(", ")}, avec des scores de compatibilité respectifs de ${top3.map((p) => formatScore(niche[p.key])).join(", ")}/10.`,
    },
    {
      q: `${city.name} est-elle une bonne ville pour la retraite ?`,
      a: `Le score retraite de ${city.name} est de ${formatScore(niche.retirement)}/10. ${niche.retirement >= 7 ? "C'est un excellent choix pour les retraités cherchant calme, sécurité et coût de vie raisonnable." : niche.retirement >= 5 ? "C'est un choix correct, avec quelques compromis à anticiper selon les priorités." : "La ville présente des contraintes (coût, densité ou climat) qui la rendent moins recommandée pour la retraite."}`,
    },
    {
      q: `Le télétravail est-il confortable depuis ${city.name} ?`,
      a: `Le score télétravail de ${city.name} est de ${formatScore(niche.remote)}/10. ${niche.remote >= 7 ? "La combinaison connectivité, cadre de vie et coût en fait une base idéale pour travailler à distance." : niche.remote >= 5 ? "Le télétravail y est viable avec quelques réserves." : "Certains critères (connexion, coût ou infrastructure) limitent le confort pour les télétravailleurs."}`,
    },
    {
      q: `${city.name} est-elle accueillante pour les étudiants ?`,
      a: `Le score vie étudiante de ${city.name} est de ${formatScore(niche.studentLife)}/10. ${niche.studentLife >= 7 ? "Forte offre culturelle et associative, transports efficaces et coût de vie raisonnable en font une ville étudiante de qualité." : niche.studentLife >= 5 ? "L'ambiance étudiante existe mais reste modeste comparée aux grandes métropoles." : "La vie étudiante y est plus limitée, avec une offre culturelle et une communauté étudiante réduite."}`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />

      <section className="border-b border-[var(--border)] bg-[var(--bg-surface)] py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Villes", href: "/villes" },
              { label: city.name, href: `/villes/${slug}` },
              { label: "Profils" },
            ]}
          />
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-2 mt-4">
            <Users className="h-3.5 w-3.5" />
            Compatibilité par profil
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            {city.name} — pour quel profil de vie ?
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            Scores de compatibilité calculés depuis les 8 axes de qualité de vie, la
            géographie et la taille de la ville. Aucun chiffre inventé.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">

        {/* Best fits */}
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            Meilleurs profils pour {city.name}
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
              Tous les scores de compatibilité
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
            <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3">Type de territoire</h2>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{TERRAIN_LABELS[niche.terrain].split(" ")[0]}</span>
              <div>
                <div className="text-base font-semibold text-[var(--text-primary)]">
                  {TERRAIN_LABELS[niche.terrain].split(" ").slice(1).join(" ")}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  {niche.terrain === "mer" && "Accès à la mer, littoral, cadre balnéaire ou côtier."}
                  {niche.terrain === "montagne" && "Altitude significative, cadre alpin ou pyrénéen, ski possible."}
                  {niche.terrain === "vallee" && "Vallée fluviale, vignobles ou plaines alluviales, douceur climatique."}
                  {niche.terrain === "plaine" && "Territoire plat ou légèrement vallonné, cadre urbain ou rural ouvert."}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3">Moins adapté pour</h2>
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

        {/* Fictional portraits */}
        <div>
          <div className="flex items-baseline gap-3 mb-1">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Portraits-types</h2>
            <span className="text-[10px] uppercase tracking-wide font-semibold text-amber-700 bg-amber-100/70 rounded-full px-2 py-0.5">Personnages fictifs</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            3 archétypes inventés qui pourraient s&apos;épanouir à {city.name}, dérivés des scores de la ville.
            Pas de témoignage réel — juste de quoi se projeter.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {portraits.map((p) => (
              <div
                key={p.archetype}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xl mb-1">{p.emoji}</div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      {p.name}, {p.age}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] capitalize">{p.profession}</div>
                  </div>
                  <span className={`font-mono-data text-xs font-bold ${scoreColor(p.fitScore)}`}>
                    {formatScore(p.fitScore)}/10
                  </span>
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">
                  <span className="font-semibold text-[var(--text-primary)]">Pourquoi {city.name}.</span>{" "}
                  {p.motivation}.
                </div>
                <div className="text-xs text-[var(--text-tertiary)]">
                  <span className="font-semibold">Ce qui inquiète :</span> {p.worry}.
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Similar profile cities */}
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
            Villes au profil similaire
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Les 3 villes dont le mix expat / télétravail / retraite / étudiants ressemble le plus à {city.name}.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {neighbours.map(({ city: n }) => {
              const nn = computeNicheScores(n);
              const topProfile = [...PROFILE_META].sort((a, b) => nn[b.key] - nn[a.key])[0];
              const TopIcon = topProfile.icon;
              return (
                <Link
                  key={n.slug}
                  href={`/villes/${n.slug}/profils`}
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
          <strong className="text-[var(--text-secondary)]">Méthode :</strong> Les scores de
          compatibilité sont des combinaisons linéaires pondérées des 8 axes de qualité de vie
          (vie, transport, nature, coût, sécurité, culture, télétravail, écoles), ajustées par la
          taille de la ville, la géographie (côte, montagne, vallée, plaine) et les tags
          caractéristiques. Même source, mêmes règles pour les 352 villes — pas de coefficient
          adapté ville par ville.
        </div>

        <div className="text-center">
          <Link
            href={`/villes/${slug}`}
            className="inline-flex items-center gap-1 text-sm text-[var(--accent)] underline hover:opacity-80"
          >
            ← Retour à {city.name}
          </Link>
        </div>

        <DiscussionCTA citySlug={slug} cityName={city.name} />
      </div>

      <Footer />
    </main>
  );
}
