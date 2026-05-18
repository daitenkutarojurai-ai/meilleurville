import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  computeSafetyDeep,
  SAFETY_LEVEL_LABEL,
  SAFETY_LEVEL_COLOR,
  SAFETY_LEVEL_BG,
  type SafetyDimension,
} from "@/lib/safety-deep";
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
  const s = computeSafetyDeep(city);
  return {
    title: `Sécurité à ${city.name} · détail SSMSI 2026`,
    description: `Synthèse SSMSI de la sécurité à ${city.name} (${city.department}) : atteintes biens ${SAFETY_LEVEL_LABEL[s.property.level].toLowerCase()}, personnes ${SAFETY_LEVEL_LABEL[s.persons.level].toLowerCase()}, nuit ${SAFETY_LEVEL_LABEL[s.nocturnal.level].toLowerCase()}, VFFS ${SAFETY_LEVEL_LABEL[s.vffs.level].toLowerCase()}. Score ${s.composite}/10.`,
    alternates: { canonical: `/villes/${slug}/securite` },
    openGraph: {
      title: `Sécurité à ${city.name} · détail SSMSI`,
      description: `Biens, personnes, nuit, VFFS — décomposition pédagogique.`,
    },
  };
}

function SafetyBlock({ dim, label }: { dim: SafetyDimension; label: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${SAFETY_LEVEL_BG[dim.level]}`}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
        <div className={`text-xs font-bold uppercase tracking-wide ${SAFETY_LEVEL_COLOR[dim.level]}`}>
          {SAFETY_LEVEL_LABEL[dim.level]}
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

export default async function SecuritePage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const s = computeSafetyDeep(city);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Sécurité", path: `/villes/${city.slug}/securite` },
  ]);

  const faq = faqJsonLd([
    {
      q: `${city.name} est-elle une ville sûre ?`,
      a: `${city.name} (${city.department}) affiche un composite sécurité SSMSI ${s.composite}/10 (10 = pire). Détail : atteintes biens ${s.property.score}/10, personnes ${s.persons.score}/10, nuit ${s.nocturnal.score}/10, VFFS ${s.vffs.score}/10. ${s.signature}`,
    },
    {
      q: `Où voir les chiffres SSMSI officiels pour ${city.name} ?`,
      a: `Le SSMSI (interstats.fr) publie chaque mois les indicateurs de délinquance par département et par commune ≥ 10 000 hab. Les données ouvertes data.gouv.fr proposent le détail par taux pour 1 000 hab. L'enquête « Cadre de Vie et Sécurité » (Insee, 14 000 ménages/an) complète avec la victimation ressentie.`,
    },
    {
      q: `Comment lire les 4 sous-axes ?`,
      a: `Atteintes biens = cambriolages + vols véhicules + vols sans violence (concentré sur métropoles touristiques et IDF dense). Atteintes personnes = coups & blessures volontaires hors VFFS (concentré sur métropoles + bassins industriels en tension). Sécurité nocturne = rixes, agressions, dégradations nocturnes (concentré sur centres festifs/étudiants). VFFS = signalements de violences faites aux femmes au SSMSI.`,
    },
    {
      q: `Que faire si je trouve la ville plus tendue qu'attendu ?`,
      a: `Consulter la fiche détaillée préfecture (état 4001) + la cartographie data.gouv.fr par commune (geo.api.gouv.fr/sites/datasecu). Pour un projet d'achat, prendre rendez-vous avec la mairie (service tranquillité publique) pour connaître les zones « politique de la ville » et les programmes locaux de prévention.`,
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
          Sécurité à {city.name} — détail SSMSI
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Décomposition du score sécurité en 4 sous-axes calibrés SSMSI : atteintes aux
          biens, atteintes aux personnes, sécurité nocturne, violences faites aux femmes.
          Sources :{" "}
          <a
            href="https://www.interstats.interieur.gouv.fr/"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            SSMSI
          </a>{" "}
          · Insee CVS · data.gouv.fr.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Synthèse pédagogique</Badge>
          <Badge>SSMSI · Insee CVS · data.gouv.fr</Badge>
        </div>

        {/* Composite hero */}
        <Card className={`mt-6 border-l-4 ${SAFETY_LEVEL_BG[s.level].replace('bg-', 'border-l-').replace('-50', '-500').split(' ')[0]}`}>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">Score composite</h2>
            <span className={`text-xs font-bold uppercase ${SAFETY_LEVEL_COLOR[s.level]}`}>
              Sécurité {SAFETY_LEVEL_LABEL[s.level].toLowerCase()}
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
          <SafetyBlock dim={s.property} label="Atteintes aux biens" />
          <SafetyBlock dim={s.persons} label="Atteintes aux personnes" />
          <SafetyBlock dim={s.nocturnal} label="Sécurité nocturne" />
          <SafetyBlock dim={s.vffs} label="Violences sexistes (VFFS)" />
        </div>

        {/* Methodology */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Méthodologie</h2>
        <Card className="mt-3">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Atteintes aux biens (35 %) :</strong>{" "}
              cambriolages, vols véhicules, vols sans violence. Proxy population × statut
              métropolitain × tags tourisme. Moyenne SSMSI vols sans violence ~16,5 ‰.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Atteintes aux personnes (30 %) :</strong>{" "}
              coups & blessures volontaires (hors VFFS) — moyenne SSMSI ~4,3 ‰. Surcote
              dans les anciens bassins industriels en reconversion et les métropoles tendues.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Sécurité nocturne (20 %) :</strong>{" "}
              rixes, agressions et dégradations nocturnes. Concentré sur centres festifs,
              villes étudiantes, métropoles avec vie nocturne dense.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">VFFS (15 %) :</strong>{" "}
              signalements de violences faites aux femmes (SSMSI). À interpréter avec
              prudence : un taux plus élevé peut refléter un meilleur dispositif de
              signalement plutôt qu&apos;une occurrence pure.
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Score à l&apos;échelle communale, dérivé du score safety du seed + ajustements
            département et tags. À l&apos;adresse, l&apos;expérience varie fortement selon
            le quartier (politique de la ville vs. zones résidentielles apaisées). Pour
            l&apos;analyse fine, consulter l&apos;état 4001 de la préfecture.
          </p>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Aller plus loin</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/villes/${city.slug}/quartiers`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Quartiers</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Détail par zone & ambiance</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/avis-honnete`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Avis honnête</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Coups de cœur + vigilances</div>
            </Card>
          </Link>
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
        </div>

        <div className="mt-8 text-sm">
          <Link href="/securite" className="text-[var(--accent)] hover:underline">
            → Classement national sécurité SSMSI
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
