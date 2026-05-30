import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  computeSportLeisure,
  SPORT_LEVEL_LABEL,
  SPORT_LEVEL_COLOR,
  SPORT_LEVEL_BG,
  type SportDimension,
} from "@/lib/sport-leisure";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";

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
  const s = computeSportLeisure(city);
  return {
    title: `Faire du sport à ${city.name} · équipements, outdoor, clubs`,
    description: `Synthèse de la pratique sportive à ${city.name} (${city.department}) : équipements ${SPORT_LEVEL_LABEL[s.facilities.level].toLowerCase()}, outdoor ${SPORT_LEVEL_LABEL[s.outdoor.level].toLowerCase()}, clubs ${SPORT_LEVEL_LABEL[s.clubs.level].toLowerCase()}, climat ${SPORT_LEVEL_LABEL[s.climate.level].toLowerCase()}. Score ${s.composite}/10.`,
    alternates: { canonical: `/villes/${slug}/sport` },
    openGraph: {
      title: `Faire du sport à ${city.name}`,
      description: `Équipements, cadre outdoor, vie associative et climat — synthèse pédagogique.`,
    },
  };
}

function SportBlock({ dim, label }: { dim: SportDimension; label: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${SPORT_LEVEL_BG[dim.level]}`}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
        <div className={`text-xs font-bold uppercase tracking-wide ${SPORT_LEVEL_COLOR[dim.level]}`}>
          {SPORT_LEVEL_LABEL[dim.level]}
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">
          {dim.score.toFixed(1)}
          <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
        </div>
      </div>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{dim.reason}</p>
    </div>
  );
}

export default async function SportPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const s = computeSportLeisure(city);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Sport & loisirs", path: `/villes/${city.slug}/sport` },
  ]);

  const faq = faqJsonLd([
    {
      q: `${city.name} est-elle adaptée à la pratique sportive ?`,
      a: `${city.name} obtient un score composite ${s.composite}/10 (${SPORT_LEVEL_LABEL[s.level].toLowerCase()}). Détail : équipements ${s.facilities.score}/10, cadre outdoor ${s.outdoor.score}/10, vie associative ${s.clubs.score}/10, climat ${s.climate.score}/10. ${s.signature}`,
    },
    {
      q: `Où trouver les équipements sportifs municipaux de ${city.name} ?`,
      a: `Le Recensement des Équipements Sportifs (data.gouv.fr / sports.gouv.fr) recense l'ensemble des piscines, stades, salles couvertes, terrains polyvalents par commune. Pour les pôles d'excellence, voir la carte des CREPS (Centres de Ressources, d'Expertise et de Performance Sportive) et de l'INSEP.`,
    },
    {
      q: `${city.name} a-t-elle un cadre naturel adapté à l'outdoor ?`,
      a: s.outdoor.reason,
    },
    {
      q: `Comment trouver un club sportif à ${city.name} ?`,
      a: `Les Maisons des Associations communales et les annuaires des fédérations agréées (FFRandonnée, FFCT, FFEscalade, FFR, FFF, FFN…) listent les clubs locaux. La DRAJES (Direction Régionale Académique à la Jeunesse, à l'Engagement et aux Sports) référence les structures agréées Jeunesse & Sport.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link> ·{" "}
          <Link href="/villes" className="hover:underline">Villes</Link> ·{" "}
          <Link href={`/villes/${city.slug}`} className="hover:underline">{city.name}</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Faire du sport à {city.name}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Synthèse pédagogique des quatre dimensions qui déterminent la praticabilité du
          sport au quotidien : équipements, cadre outdoor, vie associative et climat.
          Sources :{" "}
          <a
            href="https://www.data.gouv.fr/fr/datasets/recensement-des-equipements-sportifs-espaces-et-sites-de-pratiques/"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            RES INJEP
          </a>{" "}
          ·{" "}
          <a
            href="https://www.sports.gouv.fr"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            sports.gouv.fr
          </a>{" "}
          · CREPS · DRAJES · FFRandonnée.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Synthèse pédagogique</Badge>
          <Badge>INJEP · RES · CREPS · DRAJES</Badge>
        </div>

        {/* Composite hero */}
        <Card className={`mt-6 border-l-4 ${SPORT_LEVEL_BG[s.level].replace('bg-', 'border-l-').replace('-50', '-500').split(' ')[0]}`}>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">Score composite</h2>
            <span className={`text-xs font-bold uppercase ${SPORT_LEVEL_COLOR[s.level]}`}>
              Terrain {SPORT_LEVEL_LABEL[s.level].toLowerCase()}
            </span>
          </div>
          <div className="text-4xl font-bold tabular-nums text-[var(--text-primary)] mb-3">
            {s.composite.toFixed(1)}
            <span className="text-lg font-normal text-[var(--text-tertiary)] ml-1">/10</span>
          </div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{s.signature}</p>
        </Card>

        {/* 4 dimensions */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Les quatre dimensions</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SportBlock dim={s.facilities} label="Équipements sportifs" />
          <SportBlock dim={s.outdoor} label="Cadre outdoor" />
          <SportBlock dim={s.clubs} label="Vie associative" />
          <SportBlock dim={s.climate} label="Climat propice" />
        </div>

        {/* Methodology */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Méthodologie</h2>
        <Card className="mt-3">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Équipements (35 %) :</strong>{" "}
              proxy dérivé du Recensement des Équipements Sportifs INJEP (piscines,
              stades, salles couvertes, terrains polyvalents) corrélé à la population et
              au statut métropolitain. Bonus pôle d&apos;excellence (CREPS, INSEP, bases
              nautiques nationales, stations de sports d&apos;hiver élite).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Cadre outdoor (30 %) :</strong>{" "}
              cumul des terrains de jeu naturels accessibles — montagne (Alpes, Pyrénées,
              Massif Central, Vosges, Jura, Corse), façade côtière (Manche, Atlantique,
              Méditerranée, DROM), massif forestier majeur (Landes, Vosges, Sologne,
              Fontainebleau, Morvan), lac ou fleuve navigable.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Vie associative (20 %) :</strong>{" "}
              densité du tissu associatif sportif. Bonus départements à identité sportive
              forte (Pays Basque, AURA, Bretagne, PACA, Sud-Ouest rugby) + bonus bassin
              étudiant. Malus rural ultra-isolé Centre/Est en déprise démographique et
              DROM les plus tendus (Mayotte, Guyane).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Climat (15 %) :</strong>{" "}
              ensoleillement annuel, température hivernale, température estivale. Bonus
              arc méditerranéen et façade atlantique sud (saison sportive quasi-annuelle).
              Malus canicule estivale (juillet &gt; 27 °C de moyenne) et hivers très froids
              (verglas, neige).
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Score à l&apos;échelle communale. L&apos;expérience dépend aussi du
            quartier (proximité d&apos;un complexe ou non) et de la discipline pratiquée.
            Pour l&apos;offre détaillée commune par commune, consulter le RES sur{" "}
            <a href="https://equipements.sports.gouv.fr" target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline">
              equipements.sports.gouv.fr
            </a>{" "}
            (carte officielle des équipements sportifs).
          </p>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Aller plus loin</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/villes/${city.slug}/velo`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🚲</span><span>Vivre à vélo</span></div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Réseau, relief, sécurité, climat</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/a-faire`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🎯</span><span>Que faire ici ?</span></div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Activités, sorties, bons plans</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/climat`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🌤️</span><span>Climat détaillé</span></div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Normales mensuelles + saisons</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/synthese`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🧬</span><span>Synthèse 8 axes</span></div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Lecture consolidée du profil</div>
            </Card>
          </Link>
        </div>

        <div className="mt-8 text-sm">
          <Link href="/sport" className="text-[var(--accent)] hover:underline">
            → Voir le classement national des villes sportives
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
