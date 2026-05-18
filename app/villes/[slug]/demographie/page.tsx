import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  computeDemography,
  DEMO_LEVEL_LABEL,
  DEMO_LEVEL_COLOR,
  DEMO_LEVEL_BG,
  type DemoDimension,
} from "@/lib/demography";
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
  const d = computeDemography(city);
  return {
    title: `Démographie de ${city.name} — vieillissement, jeunes actifs, trajectoire`,
    description: `Profil démographique de ${city.name} (${city.department}) : vieillissement ${DEMO_LEVEL_LABEL[d.ageing.level].toLowerCase()}, jeunes actifs ${DEMO_LEVEL_LABEL[d.youngActives.level].toLowerCase()}, trajectoire ${DEMO_LEVEL_LABEL[d.trajectory.level].toLowerCase()}. Score ${(10 - d.composite).toFixed(1)}/10 (10 = démographie dynamique).`,
    alternates: { canonical: `/villes/${slug}/demographie` },
    openGraph: {
      title: `Démographie de ${city.name}`,
      description: `Vieillissement, jeunes actifs, trajectoire, renouvellement — synthèse INSEE.`,
    },
  };
}

function DemoBlock({ dim, label }: { dim: DemoDimension; label: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${DEMO_LEVEL_BG[dim.level]}`}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
        <div className={`text-xs font-bold uppercase tracking-wide ${DEMO_LEVEL_COLOR[dim.level]}`}>
          {DEMO_LEVEL_LABEL[dim.level]}
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">
          {(10 - dim.score).toFixed(1)}
          <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
        </div>
      </div>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{dim.reason}</p>
    </div>
  );
}

export default async function DemographiePage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const d = computeDemography(city);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Démographie", path: `/villes/${city.slug}/demographie` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quel est le profil démographique de ${city.name} ?`,
      a: `${city.name} (${city.department}) affiche un composite démographique ${(10 - d.composite).toFixed(1)}/10 (10 = démographie dynamique). Détail : vieillissement ${(10 - d.ageing.score).toFixed(1)}/10, jeunes actifs ${(10 - d.youngActives.score).toFixed(1)}/10, trajectoire ${(10 - d.trajectory.score).toFixed(1)}/10, renouvellement ${(10 - d.renewal.score).toFixed(1)}/10. ${d.signature}`,
    },
    {
      q: `Où voir les chiffres INSEE pour ${city.name} ?`,
      a: `L'INSEE publie chaque année le recensement de population (RP) avec structure par âge par commune et département. Les projections OMPHALE 2070 sont disponibles par zone d'emploi. Le Bilan démographique annuel (insee.fr) détaille solde naturel + solde migratoire.`,
    },
    {
      q: `Que signifie le score de vieillissement ?`,
      a: d.ageing.reason,
    },
    {
      q: `${city.name} est-elle en croissance ou en décroissance ?`,
      a: d.trajectory.reason + ` Pour la projection à 2050, OMPHALE (INSEE) offre la meilleure source par zone d'emploi.`,
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
          Démographie de {city.name}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Synthèse pédagogique des quatre dimensions de la démographie locale :
          vieillissement, attractivité des jeunes actifs, trajectoire population et
          renouvellement naturel. Sources :{" "}
          <a
            href="https://www.insee.fr/fr/statistiques/serie/001893337"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            INSEE RP
          </a>{" "}
          · Bilan démographique · projection OMPHALE.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Synthèse pédagogique</Badge>
          <Badge>INSEE · OMPHALE · CNAV</Badge>
        </div>

        {/* Composite hero */}
        <Card className={`mt-6 border-l-4 ${DEMO_LEVEL_BG[d.level].replace('bg-', 'border-l-').replace('-50', '-500').split(' ')[0]}`}>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">Score composite</h2>
            <span className={`text-xs font-bold uppercase ${DEMO_LEVEL_COLOR[d.level]}`}>
              Démographie {DEMO_LEVEL_LABEL[d.level].toLowerCase()}
            </span>
          </div>
          <div className="text-4xl font-bold tabular-nums text-[var(--text-primary)] mb-3">
            {(10 - d.composite).toFixed(1)}
            <span className="text-lg font-normal text-[var(--text-tertiary)] ml-1">/10</span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mb-2">10 = démographie dynamique · 0 = décroissance critique.</p>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{d.signature}</p>
        </Card>

        {/* 4 dimensions */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Les quatre dimensions</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DemoBlock dim={d.ageing} label="Vieillissement" />
          <DemoBlock dim={d.youngActives} label="Jeunes actifs 25-35" />
          <DemoBlock dim={d.trajectory} label="Trajectoire population" />
          <DemoBlock dim={d.renewal} label="Renouvellement (natalité)" />
        </div>

        {/* Methodology */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Méthodologie</h2>
        <Card className="mt-3">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Vieillissement (30 %) :</strong>{" "}
              part des 60 ans et plus dans la population totale (INSEE RP). Médiane
              nationale 2024 ~28 %. Très âgé : Creuse, Lot, Cantal, Limousin entier ;
              très jeune : DROM hors Antilles.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Jeunes actifs 25-35 (25 %) :</strong>{" "}
              part des 25-35 ans dans la population. Métropoles étudiantes et IDF dense
              en tête (&gt; 18 %), bourgs ruraux en queue. Indicateur d&apos;attractivité
              économique long-terme.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Trajectoire (30 %) :</strong>{" "}
              solde démographique annuel = solde naturel (naissances − décès) + solde
              migratoire (entrées − sorties). Façade atlantique + Sud + métropoles
              positives ; Centre/Est rural + bassins industriels en décroissance structurelle.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Renouvellement (15 %) :</strong>{" "}
              taux brut de natalité (‰). France 2024 ~10,5 ‰. DROM &gt; 14 ‰, rural âgé
              &lt; 8 ‰. Proxy de la part de jeunes adultes en âge de procréer.
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Score à l&apos;échelle communale via proxy département. Pour la projection
            précise à 2050 et l&apos;analyse fine d&apos;une zone d&apos;emploi,
            consulter OMPHALE (INSEE) qui modélise les évolutions par EPCI.
          </p>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Aller plus loin</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/villes/${city.slug}/sante`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Accès aux soins</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Médecins, urgences, déserts</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/emploi`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Marché du travail</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Chômage, salaires, dynamisme</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/climat-2040`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Climat 2040</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Projection ARPEGE</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/ecoles`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Écoles</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Université, CPGE</div>
            </Card>
          </Link>
        </div>

        <div className="mt-8 text-sm">
          <Link href="/demographie" className="text-[var(--accent)] hover:underline">
            → Classement national démographique
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
