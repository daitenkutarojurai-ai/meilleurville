import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  computeEmploymentMarket,
  JOB_LEVEL_LABEL,
  JOB_LEVEL_COLOR,
  JOB_LEVEL_BG,
  type JobDimension,
} from "@/lib/employment-market";
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
  const e = computeEmploymentMarket(city);
  return {
    title: `Emploi & chômage à ${city.name} — marché du travail 2026`,
    description: `Synthèse du marché du travail à ${city.name} (${city.department}) : chômage ${JOB_LEVEL_LABEL[e.unemployment.level].toLowerCase()}, dynamisme ${JOB_LEVEL_LABEL[e.dynamism.level].toLowerCase()}, mix sectoriel ${JOB_LEVEL_LABEL[e.sectorMix.level].toLowerCase()}, salaires ${JOB_LEVEL_LABEL[e.salary.level].toLowerCase()}. Score ${e.composite}/10.`,
    alternates: { canonical: `/villes/${slug}/emploi` },
    openGraph: {
      title: `Emploi à ${city.name}`,
      description: `Taux de chômage, dynamisme entrepreneurial, mix sectoriel, salaire médian. Sources INSEE / DARES / SIRENE.`,
    },
  };
}

function JobBlock({ dim, label }: { dim: JobDimension; label: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${JOB_LEVEL_BG[dim.level]}`}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
        <div className={`text-xs font-bold uppercase tracking-wide ${JOB_LEVEL_COLOR[dim.level]}`}>
          {JOB_LEVEL_LABEL[dim.level]}
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

export default async function EmploiPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const e = computeEmploymentMarket(city);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Emploi", path: `/villes/${city.slug}/emploi` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quel est le taux de chômage à ${city.name} ?`,
      a: e.unemployment.reason + ` Données INSEE trimestrielles consultables sur insee.fr/fr/statistiques.`,
    },
    {
      q: `Est-il facile de trouver un emploi à ${city.name} ?`,
      a: `${city.name} (${city.department}) présente un composite marché du travail ${JOB_LEVEL_LABEL[e.level].toLowerCase()} (${e.composite}/10). Détail : chômage ${e.unemployment.score}/10, dynamisme ${e.dynamism.score}/10, mix sectoriel ${e.sectorMix.score}/10, salaires ${e.salary.score}/10.`,
    },
    {
      q: `Quels secteurs recrutent à ${city.name} ?`,
      a: e.sectorMix.reason + ` Pour les offres en temps réel, France Travail (francetravail.fr) et les annonces Apec / Hellowork couvrent l'essentiel des recrutements actifs.`,
    },
    {
      q: `Le salaire médian est-il suffisant pour vivre à ${city.name} ?`,
      a: e.salary.reason + ` À croiser avec notre simulateur de coût réel et le ratio loyer/salaire local.`,
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
          Emploi & marché du travail à {city.name}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Synthèse pédagogique des quatre dimensions clés du marché du travail local :
          taux de chômage, dynamisme entrepreneurial (création SIRENE), mix sectoriel
          (résilience), salaire net médian. Sources : INSEE trimestriel T4 2024, DARES,
          SIRENE, INSEE DADS.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Synthèse pédagogique</Badge>
          <Badge>INSEE · DARES · SIRENE</Badge>
        </div>

        {/* Composite hero */}
        <Card className={`mt-6 border-l-4 ${JOB_LEVEL_BG[e.level].replace('bg-', 'border-l-').replace('-50', '-500').split(' ')[0]}`}>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">Score composite</h2>
            <span className={`text-xs font-bold uppercase ${JOB_LEVEL_COLOR[e.level]}`}>
              Marché {JOB_LEVEL_LABEL[e.level].toLowerCase()}
            </span>
          </div>
          <div className="text-4xl font-bold tabular-nums text-[var(--text-primary)] mb-3">
            {e.composite.toFixed(1)}
            <span className="text-lg font-normal text-[var(--text-tertiary)] ml-1">/10</span>
          </div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{e.signature}</p>
        </Card>

        {/* 4 dimensions */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Les quatre dimensions</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <JobBlock dim={e.unemployment} label="Taux de chômage (INSEE)" />
          <JobBlock dim={e.dynamism} label="Dynamisme création (SIRENE)" />
          <JobBlock dim={e.sectorMix} label="Mix sectoriel / résilience" />
          <JobBlock dim={e.salary} label="Salaire net médian (DADS)" />
        </div>

        {/* Methodology */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Méthodologie</h2>
        <Card className="mt-3">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Chômage (35 %) :</strong> taux
              trimestriel INSEE par département (T4 2024 latest). Moyenne France
              métropolitaine ~7,3 %. DROM en tension chronique &gt; 15 %.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Dynamisme (20 %) :</strong>{" "}
              création nette d&apos;entreprises SIRENE par département, pondérée par taille
              de la commune. Grandes métropoles et littoraux attractifs au-dessus, communes
              rurales en déclin en-dessous.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Mix sectoriel (20 %) :</strong>{" "}
              diversification du tissu économique. Pénalise mono-tourisme (saisonnalité),
              ancien bassin mono-industriel en reconversion, valorise les grandes métropoles
              et les économies équilibrées.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Salaire (25 %) :</strong> salaire
              net médian départemental INSEE DADS. Moyenne France ~2 100 €/mois. Paris &amp;
              petite couronne &gt; 2 400 €, DROM et dépts ruraux &lt; 1 850 €.
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Ces scores synthétisent à l&apos;échelle départementale. Le marché local peut
            varier fortement au sein d&apos;un dept (préfecture vs. canton rural). Pour les
            offres en temps réel, consultez France Travail, Apec et Hellowork.
          </p>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Aller plus loin</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/villes/${city.slug}/sante`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Accès aux soins</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">MG, spécialistes, urgences</div>
            </Card>
          </Link>
          <Link href={`/calculateur-cout-reel/${city.slug}`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Coût réel mensuel</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Loyer, mobilité, taxes, reste-à-vivre</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/teletravail`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Télétravail</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Score remote, FTTH, coworking</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/louer-ou-acheter`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Louer ou acheter ?</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Ratio prix/loyer, payback</div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
