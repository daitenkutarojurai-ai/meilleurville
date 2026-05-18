import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  computeWaterStress,
  WATER_LEVEL_LABEL,
  WATER_LEVEL_COLOR,
  WATER_LEVEL_BG,
  type WaterDimension,
} from "@/lib/water-stress";
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
  const s = computeWaterStress(city);
  return {
    title: `Stress hydrique à ${city.name} · sécheresse, restrictions, nappes`,
    description: `Synthèse du stress hydrique à ${city.name} (${city.department}) : restrictions sécheresse ${WATER_LEVEL_LABEL[s.restrictions.level].toLowerCase()}, nappes ${WATER_LEVEL_LABEL[s.aquifer.level].toLowerCase()}, climat ${WATER_LEVEL_LABEL[s.climate.level].toLowerCase()}, eau potable ${WATER_LEVEL_LABEL[s.supply.level].toLowerCase()}. Score ${s.composite}/10.`,
    alternates: { canonical: `/villes/${slug}/eau` },
    openGraph: {
      title: `Stress hydrique à ${city.name}`,
      description: `Restrictions sécheresse, état des nappes, climat estival, alimentation eau potable.`,
    },
  };
}

function WaterBlock({ dim, label }: { dim: WaterDimension; label: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${WATER_LEVEL_BG[dim.level]}`}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
        <div className={`text-xs font-bold uppercase tracking-wide ${WATER_LEVEL_COLOR[dim.level]}`}>
          {WATER_LEVEL_LABEL[dim.level]}
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

export default async function EauPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const s = computeWaterStress(city);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Stress hydrique", path: `/villes/${city.slug}/eau` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Y a-t-il des restrictions d'eau à ${city.name} ?`,
      a: s.restrictions.reason,
    },
    {
      q: `Comment vérifier en temps réel les restrictions sécheresse à ${city.name} ?`,
      a: `Le site officiel Propluvia (propluvia.developpement-durable.gouv.fr) publie les arrêtés sécheresse en vigueur, mis à jour quotidiennement par les préfectures. Sélectionnez ${city.department} et la commune pour voir le niveau actuel (vigilance, alerte, alerte renforcée, crise).`,
    },
    {
      q: `Quel est l'état des nappes phréatiques à ${city.name} ?`,
      a: s.aquifer.reason + ` Le bulletin BRGM (eaufrance.fr/bulletin-de-situation-des-nappes) publie un état mensuel.`,
    },
    {
      q: `Le climat de ${city.name} aggrave-t-il le stress hydrique ?`,
      a: s.climate.reason,
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
          Stress hydrique à {city.name}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Synthèse pédagogique des quatre facteurs qui déterminent l&apos;exposition d&apos;une
          commune à la sécheresse et aux restrictions d&apos;eau. Sources : arrêtés Propluvia
          2022-2024, bulletin nappes BRGM, climat Météo-France et indicateurs de tension sur
          l&apos;eau potable. Pour les restrictions en vigueur aujourd&apos;hui, consultez{" "}
          <a
            href="https://propluvia.developpement-durable.gouv.fr/"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            Propluvia
          </a>.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Synthèse pédagogique</Badge>
          <Badge>Propluvia · BRGM · Météo-France</Badge>
        </div>

        {/* Composite hero */}
        <Card className={`mt-6 border-l-4 ${WATER_LEVEL_BG[s.level].replace('bg-', 'border-l-').replace('-50', '-500').split(' ')[0]}`}>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">Score composite</h2>
            <span className={`text-xs font-bold uppercase ${WATER_LEVEL_COLOR[s.level]}`}>
              Stress {WATER_LEVEL_LABEL[s.level].toLowerCase()}
            </span>
          </div>
          <div className="text-4xl font-bold tabular-nums text-[var(--text-primary)] mb-3">
            {s.composite.toFixed(1)}
            <span className="text-lg font-normal text-[var(--text-tertiary)] ml-1">/10</span>
          </div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{s.signature}</p>
        </Card>

        {/* 4 dimensions */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Les quatre facteurs</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <WaterBlock dim={s.restrictions} label="Restrictions sécheresse" />
          <WaterBlock dim={s.aquifer} label="État des nappes" />
          <WaterBlock dim={s.climate} label="Sécheresse climatique" />
          <WaterBlock dim={s.supply} label="Alimentation eau potable" />
        </div>

        {/* Methodology */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Méthodologie</h2>
        <Card className="mt-3">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Restrictions sécheresse :</strong>{" "}
              fréquence cumulée des arrêtés alerte renforcée et crise par département sur
              2022-2024 (source Propluvia).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">État des nappes :</strong> moyenne
              du bulletin BRGM 2022-2025 par grande nappe — basse, normale ou haute. Les
              nappes du sud et du sud-ouest accusent un déficit cumulé visible.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Sécheresse climatique :</strong>{" "}
              combinaison température moyenne de juillet × ensoleillement annuel. Proxy du
              déficit d&apos;évapotranspiration estival.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Alimentation eau potable :</strong>{" "}
              cumule fragilité réseau (DROM), saisonnalité touristique (littoral, île) et
              capacité de stockage des sols (sols karstiques calcaires défavorables).
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Ces scores synthétisent une exposition à l&apos;échelle départementale. Au sein
            d&apos;une même commune, des microzones peuvent être plus ou moins concernées
            (proximité d&apos;une rivière, captage prioritaire, réseau récent ou ancien). Pour
            l&apos;état des restrictions du jour, Propluvia reste la référence.
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
          <Link href={`/villes/${city.slug}/climat-2040`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Climat 2040</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Canicule, nuits tropicales</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/climat`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Climat actuel</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Températures, ensoleillement</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/saisons`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Saisons</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">4 saisons, affluence touristique</div>
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
