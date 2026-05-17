import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  computeHealthcareAccess,
  HEALTH_LEVEL_LABEL,
  HEALTH_LEVEL_COLOR,
  HEALTH_LEVEL_BG,
  type HealthDimension,
} from "@/lib/healthcare-access";
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
  const h = computeHealthcareAccess(city);
  return {
    title: `Désert médical à ${city.name} ? — accès aux soins 2026`,
    description: `Synthèse de l'accès aux soins à ${city.name} (${city.department}) : médecins ${HEALTH_LEVEL_LABEL[h.generalistes.level].toLowerCase()}, spécialistes ${HEALTH_LEVEL_LABEL[h.specialistes.level].toLowerCase()}, urgences ${HEALTH_LEVEL_LABEL[h.urgences.level].toLowerCase()}, pharmacies ${HEALTH_LEVEL_LABEL[h.pharmacies.level].toLowerCase()}. Score composite ${h.composite}/10.`,
    alternates: { canonical: `/villes/${slug}/sante` },
    openGraph: {
      title: `Accès aux soins à ${city.name}`,
      description: `Médecins, spécialistes, urgences, pharmacies — synthèse pédagogique DREES / ARS.`,
    },
  };
}

function HealthBlock({ dim, label }: { dim: HealthDimension; label: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${HEALTH_LEVEL_BG[dim.level]}`}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
        <div className={`text-xs font-bold uppercase tracking-wide ${HEALTH_LEVEL_COLOR[dim.level]}`}>
          {HEALTH_LEVEL_LABEL[dim.level]}
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

export default async function SantePage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const h = computeHealthcareAccess(city);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Accès aux soins", path: `/villes/${city.slug}/sante` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Est-ce que ${city.name} est un désert médical ?`,
      a: `${city.name} (${city.department}) présente un score d'accès aux soins composite ${HEALTH_LEVEL_LABEL[h.level].toLowerCase()} (${h.composite}/10). Détail : médecins généralistes ${h.generalistes.score}/10, spécialistes ${h.specialistes.score}/10, urgences ${h.urgences.score}/10, pharmacies ${h.pharmacies.score}/10.`,
    },
    {
      q: `Comment trouver un médecin traitant à ${city.name} ?`,
      a: `Le site Ameli (ameli.fr) propose un annuaire des professionnels avec disponibilité. Doctolib (doctolib.fr) affiche les nouveaux patients acceptés. En cas de difficulté, l'ARS de ${city.department} et la CPAM peuvent orienter vers les médecins encore disponibles.`,
    },
    {
      q: `Où sont les urgences les plus proches de ${city.name} ?`,
      a: h.urgences.reason + ` La carte interactive du Ministère Santé (sante.gouv.fr/cartographie-des-urgences) liste tous les Services d'Accueil des Urgences (SAU) actifs.`,
    },
    {
      q: `Quels sont les délais pour voir un spécialiste à ${city.name} ?`,
      a: h.specialistes.reason,
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
          Accès aux soins à {city.name}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Synthèse pédagogique des quatre dimensions clés de l&apos;accès aux soins :
          médecins généralistes (porte d&apos;entrée du système), spécialistes,
          urgences/SAU, et maillage pharmacies. Sources : DREES (densité médicale par
          département), CNOM (atlas démographique), zonage ZIP/ZAC de l&apos;ARS.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Synthèse pédagogique</Badge>
          <Badge>DREES · CNOM · ARS</Badge>
        </div>

        {/* Composite hero */}
        <Card className={`mt-6 border-l-4 ${HEALTH_LEVEL_BG[h.level].replace('bg-', 'border-l-').replace('-50', '-500').split(' ')[0]}`}>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">Score composite</h2>
            <span className={`text-xs font-bold uppercase ${HEALTH_LEVEL_COLOR[h.level]}`}>
              Accès {HEALTH_LEVEL_LABEL[h.level].toLowerCase()}
            </span>
          </div>
          <div className="text-4xl font-bold tabular-nums text-[var(--text-primary)] mb-3">
            {h.composite.toFixed(1)}
            <span className="text-lg font-normal text-[var(--text-tertiary)] ml-1">/10</span>
          </div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{h.signature}</p>
        </Card>

        {/* 4 dimensions */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Les quatre dimensions</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <HealthBlock dim={h.generalistes} label="Médecins généralistes" />
          <HealthBlock dim={h.specialistes} label="Spécialistes (cardio, ophtalmo…)" />
          <HealthBlock dim={h.urgences} label="Urgences / SAU" />
          <HealthBlock dim={h.pharmacies} label="Pharmacies" />
        </div>

        {/* Methodology */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Méthodologie</h2>
        <Card className="mt-3">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Médecins généralistes (35 %) :</strong>{" "}
              densité départementale DREES 2023-2024. Catégorisation désert (&lt;
              80/100k hab. + &gt; 50 % MG &gt; 60 ans) / sous-doté (&lt; 100/100k) /
              correct / bien doté.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Spécialistes (25 %) :</strong>{" "}
              présence d&apos;un CHU dans la commune (accès direct) puis dégradé selon
              taille agglomération. Source : Conférence des Doyens + Atlas CNOM.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Urgences/SAU (25 %) :</strong>{" "}
              présence d&apos;un SAU dans la commune ou délai d&apos;accès. Pénalité pour
              zone de montagne (enneigement) et zone insulaire (liaisons).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Pharmacies (15 %) :</strong>{" "}
              maillage population × statut urbain. France moyenne : 1 pharmacie / 3 000 hab.
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Ces scores synthétisent l&apos;accès à l&apos;échelle communale. L&apos;ARS
            publie le zonage précis (ZIP/ZAC) et les aides à l&apos;installation pour les
            médecins. La situation peut évoluer rapidement avec les départs en retraite.
          </p>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Aller plus loin</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/villes/${city.slug}/air`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Qualité de l&apos;air</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">NO2, particules, ozone, pollens</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/bruit`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Bruit</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Routier, aérien, ferré, nocturne</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/ecoles`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Écoles</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Maternelles, primaires, collèges, lycées</div>
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
          <Link href="/sante" className="text-[var(--accent)] hover:underline">
            → Classement national de l&apos;accès aux soins
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
