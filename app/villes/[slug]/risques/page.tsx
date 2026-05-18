import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  computeNaturalRisks,
  RISK_LEVEL_LABEL,
  RISK_LEVEL_COLOR,
  RISK_LEVEL_BG,
  type RiskDimension,
} from "@/lib/natural-risks";
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
  const r = computeNaturalRisks(city);
  return {
    title: `Risques naturels à ${city.name} · inondation, sismicité, argile, feux`,
    description: `Synthèse des 4 risques naturels à ${city.name} (${city.department}) : inondation ${RISK_LEVEL_LABEL[r.flood.level].toLowerCase()}, sismicité ${RISK_LEVEL_LABEL[r.seismic.level].toLowerCase()}, argile ${RISK_LEVEL_LABEL[r.clay.level].toLowerCase()}, feu de forêt ${RISK_LEVEL_LABEL[r.wildfire.level].toLowerCase()}. Score composite ${r.composite}/10.`,
    alternates: { canonical: `/villes/${slug}/risques` },
    openGraph: {
      title: `Risques naturels à ${city.name}`,
      description: `Inondation, sismicité, argile, feux de forêt — synthèse pédagogique avant achat ou location.`,
    },
  };
}

function RiskBlock({ dim, label }: { dim: RiskDimension; label: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${RISK_LEVEL_BG[dim.level]}`}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
        <div className={`text-xs font-bold uppercase tracking-wide ${RISK_LEVEL_COLOR[dim.level]}`}>
          {RISK_LEVEL_LABEL[dim.level]}
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

export default async function RisquesPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const r = computeNaturalRisks(city);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Risques naturels", path: `/villes/${city.slug}/risques` },
  ]);

  const faq = faqJsonLd([
    {
      q:`Quels sont les risques naturels à ${city.name} ?`,
      a:`${city.name} (${city.department}) présente un risque composite ${RISK_LEVEL_LABEL[r.level].toLowerCase()} (${r.composite}/10). Détail : inondation ${r.flood.score}/10, sismicité ${r.seismic.score}/10, retrait-gonflement argile ${r.clay.score}/10, feu de forêt ${r.wildfire.score}/10.`,
    },
    {
      q:`Comment vérifier officiellement les risques avant d'acheter à ${city.name} ?`,
      a:`Pour un PPRI (Plan de Prévention Risques Inondation), PPRT ou ERP (État Risques et Pollutions) officiel, consultez Géorisques (georisques.gouv.fr) en saisissant l'adresse précise. Le diagnostic ERP est obligatoire à la vente.`,
    },
    {
      q:`Y a-t-il un risque sismique à ${city.name} ?`,
      a:r.seismic.reason,
    },
    {
      q:`Faut-il craindre les fissures sur les maisons à ${city.name} ?`,
      a:r.clay.reason,
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
          Risques naturels à {city.name}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Synthèse pédagogique des quatre aléas naturels qui pèsent le plus sur les habitations
          en France. Sources : zonage sismique réglementaire (BCSF), aléa argile BRGM, statistiques
          feux ONF, et proxy inondation depuis fleuve et altitude. Pour un diagnostic précis,
          consultez le PPRI et l&apos;ERP officiel sur{" "}
          <a href={`https://www.georisques.gouv.fr/mes-risques/connaitre-les-risques-pres-de-chez-moi/rapport?codeInsee=${encodeURIComponent(city.inseeCode ?? "")}`} target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline">
            Géorisques
          </a>.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Synthèse pédagogique</Badge>
          <Badge>4 dimensions BCSF / BRGM / ONF</Badge>
        </div>

        {/* Composite hero */}
        <Card className={`mt-6 border-l-4 ${RISK_LEVEL_BG[r.level].replace('bg-', 'border-l-').replace('-50', '-500').split(' ')[0]}`}>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">Score composite</h2>
            <span className={`text-xs font-bold uppercase ${RISK_LEVEL_COLOR[r.level]}`}>
              Risque {RISK_LEVEL_LABEL[r.level].toLowerCase()}
            </span>
          </div>
          <div className="text-4xl font-bold tabular-nums text-[var(--text-primary)] mb-3">
            {r.composite.toFixed(1)}
            <span className="text-lg font-normal text-[var(--text-tertiary)] ml-1">/10</span>
          </div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{r.signature}</p>
        </Card>

        {/* 4 dimensions */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Les quatre dimensions</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RiskBlock dim={r.flood} label="Inondation" />
          <RiskBlock dim={r.seismic} label="Sismicité" />
          <RiskBlock dim={r.clay} label="Retrait-gonflement argile" />
          <RiskBlock dim={r.wildfire} label="Feux de forêt" />
        </div>

        {/* Methodology */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Méthodologie</h2>
        <Card className="mt-3">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Sismicité :</strong> zonage
              réglementaire 2011 (décret 2010-1255), zones 1 à 5. Stable par département.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Retrait-gonflement argile :</strong>{" "}
              aléa BRGM (faible / moyen / fort) par département — référence la carte officielle
              <em> argiles.fr</em>.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Feux de forêt :</strong> classification
              ONF + ECASC des départements à massifs méditerranéens et forêts résineuses landaises.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Inondation :</strong> proxy à partir
              des tags fleuve dans la fiche de la ville et de l&apos;altitude. <strong>Toujours
              vérifier le PPRI précis</strong> sur Géorisques avant tout achat.
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Ces scores synthétisent des aléas à l&apos;échelle communale. Au sein d&apos;une même
            commune, l&apos;exposition peut varier fortement (bord de rivière vs hauteur,
            zone forestière vs centre urbain). Pour un diagnostic à l&apos;adresse, le
            portail Géorisques reste la référence.
          </p>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Aller plus loin</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/villes/${city.slug}/climat`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Climat actuel</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Températures, ensoleillement</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/climat-2040`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Climat 2040</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Canicule, nuits tropicales</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/fiscalite`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Fiscalité</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Taxe foncière, THRS</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/quartiers`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Quartiers</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Sécurité, ambiance, loyers</div>
            </Card>
          </Link>
        </div>

        <div className="mt-8 text-sm">
          <Link href="/environnement" className="text-[var(--accent)] hover:underline">
            → Classement national des villes les plus saines
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
