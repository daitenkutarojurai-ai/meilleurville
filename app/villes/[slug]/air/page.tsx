import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  computeAirQuality,
  AIR_LEVEL_LABEL,
  AIR_LEVEL_COLOR,
  AIR_LEVEL_BG,
  type AirDimension,
} from "@/lib/air-quality";
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
  const a = computeAirQuality(city);
  return {
    title: `Qualité de l'air à ${city.name} — NO2, particules, ozone, pollens`,
    description: `Synthèse de la qualité de l'air à ${city.name} (${city.department}) : NO2 ${AIR_LEVEL_LABEL[a.no2.level].toLowerCase()}, PM2.5 ${AIR_LEVEL_LABEL[a.pm25.level].toLowerCase()}, ozone ${AIR_LEVEL_LABEL[a.ozone.level].toLowerCase()}, pollens ${AIR_LEVEL_LABEL[a.pollen.level].toLowerCase()}. Score ${a.composite}/10.`,
    alternates: { canonical: `/villes/${slug}/air` },
    openGraph: {
      title: `Qualité de l'air à ${city.name}`,
      description: `NO2 trafic, particules fines, ozone estival, pollens — synthèse pédagogique.`,
    },
  };
}

function AirBlock({ dim, label }: { dim: AirDimension; label: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${AIR_LEVEL_BG[dim.level]}`}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
        <div className={`text-xs font-bold uppercase tracking-wide ${AIR_LEVEL_COLOR[dim.level]}`}>
          {AIR_LEVEL_LABEL[dim.level]}
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

export default async function AirPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const a = computeAirQuality(city);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Qualité de l'air", path: `/villes/${city.slug}/air` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quelle est la qualité de l'air à ${city.name} ?`,
      a: `${city.name} (${city.department}) présente une exposition composite ${AIR_LEVEL_LABEL[a.level].toLowerCase()} (${a.composite}/10). Détail : NO2 ${a.no2.score}/10, PM2.5 ${a.pm25.score}/10, ozone ${a.ozone.score}/10, pollens ${a.pollen.score}/10.`,
    },
    {
      q: `Où voir l'indice ATMO en temps réel à ${city.name} ?`,
      a: `Le site ATMO France (atmo-france.org) publie l'indice de qualité de l'air en temps réel (échelle 1-6, bon → extrêmement mauvais) avec carte interactive. L'association ATMO régionale couvre la commune et publie des bulletins prévisionnels à 3 jours.`,
    },
    {
      q: `Faut-il craindre les particules fines à ${city.name} ?`,
      a: a.pm25.reason,
    },
    {
      q: `Y a-t-il un risque allergo-pollinique à ${city.name} ?`,
      a: a.pollen.reason + ` Le RNSA (pollens.fr) publie chaque vendredi le bulletin allergo-pollinique national avec carte par bassin.`,
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
          Qualité de l&apos;air à {city.name}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Synthèse pédagogique des quatre polluants suivis quotidiennement par l&apos;indice
          ATMO. Sources : inventaire CITEPA (émissions par secteur), réseau ATMO régional
          (mesures), bulletin RNSA (pollens). Pour la mesure horaire à la station la plus
          proche, consultez{" "}
          <a
            href="https://www.atmo-france.org/article/lindice-atmo"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            ATMO France
          </a>.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Synthèse pédagogique</Badge>
          <Badge>ATMO · CITEPA · RNSA</Badge>
        </div>

        {/* Composite hero */}
        <Card className={`mt-6 border-l-4 ${AIR_LEVEL_BG[a.level].replace('bg-', 'border-l-').replace('-50', '-500').split(' ')[0]}`}>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">Score composite</h2>
            <span className={`text-xs font-bold uppercase ${AIR_LEVEL_COLOR[a.level]}`}>
              Exposition {AIR_LEVEL_LABEL[a.level].toLowerCase()}
            </span>
          </div>
          <div className="text-4xl font-bold tabular-nums text-[var(--text-primary)] mb-3">
            {a.composite.toFixed(1)}
            <span className="text-lg font-normal text-[var(--text-tertiary)] ml-1">/10</span>
          </div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{a.signature}</p>
        </Card>

        {/* 4 dimensions */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Les quatre polluants suivis</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AirBlock dim={a.no2} label="NO2 — trafic" />
          <AirBlock dim={a.pm25} label="PM2.5 — particules fines" />
          <AirBlock dim={a.ozone} label="Ozone — pic estival" />
          <AirBlock dim={a.pollen} label="Pollens" />
        </div>

        {/* Methodology */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Méthodologie</h2>
        <Card className="mt-3">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">NO2 (trafic) :</strong> proxy
              à partir de la population, du statut métropolitain et de la présence d&apos;un
              couloir autoroutier majeur dans le département. Le seuil annuel OMS est de
              10 µg/m³ depuis 2021.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">PM2.5 (particules fines) :</strong>{" "}
              cumule industrie lourde, chauffage bois domestique (1ʳᵉ source nationale
              selon CITEPA), et inversion thermique dans les vallées encaissées (Arve,
              vallée du Rhône, sillon alpin). Seuil annuel OMS : 5 µg/m³.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Ozone (O3) :</strong> formation
              photochimique COV + NOx sous chaleur et soleil — pics estivaux récurrents sur
              l&apos;arc méditerranéen et le couloir rhodanien.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Pollens :</strong> bassins
              allergisants identifiés par le RNSA — cyprès (Méditerranée), ambroisie
              (vallée du Rhône, en expansion), graminées (plaines agricoles ouvertes),
              bouleau (moitié nord).
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Les scores sont une synthèse à l&apos;échelle communale. Au sein d&apos;une même
            ville, l&apos;exposition varie fortement entre un appartement sur boulevard
            péri-urbain et une maison en lisière forestière. Pour la mesure à l&apos;adresse,
            consultez la station ATMO régionale la plus proche.
          </p>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Aller plus loin</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/villes/${city.slug}/risques`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Risques naturels</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Inondation, argile, feux, sismicité</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/eau`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Stress hydrique</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Sécheresse, nappes, restrictions</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/climat-2040`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Climat 2040</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Canicule, nuits tropicales</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/transports`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Transports</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Trafic, vélo, transports en commun</div>
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
