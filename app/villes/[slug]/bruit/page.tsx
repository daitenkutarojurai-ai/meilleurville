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
  computeNoiseExposure,
  NOISE_LEVEL_LABEL,
  NOISE_LEVEL_COLOR,
  NOISE_LEVEL_BG,
  type NoiseDimension,
} from "@/lib/noise-exposure";
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
  const n = computeNoiseExposure(city);
  return {
    title: `Bruit à ${city.name} · routier, aérien, ferroviaire, nocturne`,
    description: `Synthèse du bruit à ${city.name} (${city.department}) : routier ${NOISE_LEVEL_LABEL[n.road.level].toLowerCase()}, aérien ${NOISE_LEVEL_LABEL[n.aircraft.level].toLowerCase()}, ferroviaire ${NOISE_LEVEL_LABEL[n.rail.level].toLowerCase()}, nocturne ${NOISE_LEVEL_LABEL[n.urbanNight.level].toLowerCase()}. Score composite ${n.composite}/10.`,
    alternates: { canonical: `/villes/${slug}/bruit` },
    openGraph: {
      title: `Bruit à ${city.name}`,
      description: `Routier, aérien, ferroviaire, nocturne — synthèse acoustique CBS / OMS.`,
    },
  };
}

function NoiseBlock({ dim, label }: { dim: NoiseDimension; label: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${NOISE_LEVEL_BG[dim.level]}`}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
        <div className={`text-xs font-bold uppercase tracking-wide ${NOISE_LEVEL_COLOR[dim.level]}`}>
          {NOISE_LEVEL_LABEL[dim.level]}
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

export default async function BruitPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const n = computeNoiseExposure(city);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Bruit", path: `/villes/${city.slug}/bruit` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Le bruit est-il un problème à ${city.name} ?`,
      a: `${city.name} (${city.department}) présente une exposition composite ${NOISE_LEVEL_LABEL[n.level].toLowerCase()} (${n.composite}/10). Détail : routier ${n.road.score}/10, aérien ${n.aircraft.score}/10, ferroviaire ${n.rail.score}/10, vie nocturne ${n.urbanNight.score}/10.`,
    },
    {
      q: `Où trouver la carte de bruit officielle de ${city.name} ?`,
      a: `Les communes de plus de 100 000 habitants publient une Carte de Bruit Stratégique (CBS) tous les 5 ans (directive 2002/49/CE). Elle est généralement accessible sur le site de la métropole ou de la préfecture. Pour l'Île-de-France, Bruitparif (bruitparif.fr) propose des cartes interactives Lden et Lnight à l'adresse.`,
    },
    {
      q: `Y a-t-il un aéroport gênant à ${city.name} ?`,
      a: n.aircraft.reason,
    },
    {
      q: `Le centre-ville de ${city.name} est-il bruyant la nuit ?`,
      a: n.urbanNight.reason,
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
          Bruit à {city.name}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Synthèse pédagogique des quatre sources de bruit majeures suivies par les Cartes de
          Bruit Stratégiques (directive européenne 2002/49/CE). Sources : CBS communales,
          plans d&apos;exposition au bruit (PEB) DGAC, observatoire Bruitparif (IDF). Pour la
          carte précise à l&apos;adresse, consultez la CBS de votre métropole ou{" "}
          <a
            href="https://www.bruitparif.fr/"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            Bruitparif
          </a>{" "}
          en Île-de-France.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Synthèse pédagogique</Badge>
          <Badge>CBS · PEB · Bruitparif</Badge>
        </div>

        {/* Composite hero */}
        <Card className={`mt-6 border-l-4 ${NOISE_LEVEL_BG[n.level].replace('bg-', 'border-l-').replace('-50', '-500').split(' ')[0]}`}>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">Score composite</h2>
            <span className={`text-xs font-bold uppercase ${NOISE_LEVEL_COLOR[n.level]}`}>
              Exposition {NOISE_LEVEL_LABEL[n.level].toLowerCase()}
            </span>
          </div>
          <div className="text-4xl font-bold tabular-nums text-[var(--text-primary)] mb-3">
            {n.composite.toFixed(1)}
            <span className="text-lg font-normal text-[var(--text-tertiary)] ml-1">/10</span>
          </div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{n.signature}</p>
        </Card>

        {/* 4 dimensions */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Les quatre sources suivies</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NoiseBlock dim={n.road} label="Routier — autoroute, périphérique, axes" />
          <NoiseBlock dim={n.aircraft} label="Aérien — couloir d'aéroport (PEB)" />
          <NoiseBlock dim={n.rail} label="Ferroviaire — LGV, ligne classique" />
          <NoiseBlock dim={n.urbanNight} label="Nocturne — vie de centre-ville" />
        </div>

        {/* Methodology */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Méthodologie</h2>
        <Card className="mt-3">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Routier :</strong> identification
              des communes traversées par un périphérique ou rocade saturée (&gt; 100 000
              véh/jour) + couloirs autoroutiers majeurs au département. Seuil OMS jour :
              Lden 53 dB(A).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Aérien :</strong> classement
              par zone PEB (A à D) autour des 10 plus grands aéroports français. Les zones
              A et B sont incompatibles avec l&apos;habitat neuf.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Ferroviaire :</strong> présence
              d&apos;une LGV ou ligne classique &gt; 100 trains/jour dans le département.
              Bandeau Lden &gt; 65 dB(A) sur 100-200 m de part et d&apos;autre des voies.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Nocturne :</strong> cumul des
              tags étudiant / festif / touristique / métropole. Approche du Lnight en
              centre-ville. Seuil OMS nuit : 45 dB(A).
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Le bruit s&apos;atténue très vite avec la distance (-3 dB(A) pour un doublement).
            Un même score peut recouvrir des situations très différentes selon l&apos;adresse
            (étage élevé sur cour vs RDC sur boulevard). La CBS communale reste la référence.
          </p>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Aller plus loin</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/villes/${city.slug}/air`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🌬️</span><span>Qualité de l&apos;air</span></div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">NO2, particules, ozone, pollens</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/risques`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>⚠️</span><span>Risques naturels</span></div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Inondation, argile, feux, sismicité</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/eau`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>💧</span><span>Stress hydrique</span></div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Sécheresse, nappes, restrictions</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/transports`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🚊</span><span>Transports</span></div>
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

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
        <DiscussionCTA citySlug={city.slug} cityName={city.name} />
      </section>

      <Footer />
    </main>
  );
}
