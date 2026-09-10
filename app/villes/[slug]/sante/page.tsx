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
  computeHealthcareAccess,
  HEALTH_LEVEL_LABEL,
  HEALTH_LEVEL_COLOR,
  HEALTH_LEVEL_BG,
  type HealthDimension,
} from "@/lib/healthcare-access";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { clampMeta } from "@/lib/brand";
import { cityAlternates } from "@/lib/i18n";

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
    title: `Désert médical à ${city.name} ? · accès aux soins 2026`,
    description: clampMeta(`Synthèse de l'accès aux soins à ${city.name} (${city.department}) : médecins ${HEALTH_LEVEL_LABEL[h.generalistes.level].toLowerCase()}, spécialistes ${HEALTH_LEVEL_LABEL[h.specialistes.level].toLowerCase()}, urgences ${HEALTH_LEVEL_LABEL[h.urgences.level].toLowerCase()}, pharmacies ${HEALTH_LEVEL_LABEL[h.pharmacies.level].toLowerCase()}. Score composite ${(10 - h.composite).toFixed(1)}/10 (10 = excellent accès).`),
    alternates: cityAlternates("sante", slug),
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
      title: `Accès aux soins à ${city.name}`,
      description: `Médecins, spécialistes, urgences, pharmacies — estimation communale, pas un relevé de cabinets.`,
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
          {(10 - dim.score).toFixed(1)}
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
      a: `${city.name} (${city.department}) présente un score d'accès aux soins composite ${HEALTH_LEVEL_LABEL[h.level].toLowerCase()} (${(10 - h.composite).toFixed(1)}/10, 10 = excellent accès). Détail : médecins généralistes ${(10 - h.generalistes.score).toFixed(1)}/10, spécialistes ${(10 - h.specialistes.score).toFixed(1)}/10, urgences ${(10 - h.urgences.score).toFixed(1)}/10, pharmacies ${(10 - h.pharmacies.score).toFixed(1)}/10.`,
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
          Profil <strong>structurel</strong> des quatre dimensions clés de l&apos;accès aux
          soins : médecins généralistes (porte d&apos;entrée du système), spécialistes,
          urgences/SAU, et maillage pharmacies. Les niveaux ci-dessous sont{" "}
          <strong>estimés</strong> à partir du département, de la taille de la commune et de
          la présence d&apos;un établissement hospitalier — ils suivent les paliers de
          sous-équipement de la DREES, l&apos;atlas démographique du CNOM et la logique du
          zonage ZIP/ZAC de l&apos;ARS, <strong>sans reprendre leurs relevés</strong>. Ce
          n&apos;est donc pas un décompte des cabinets installés à {city.name}, ni le zonage
          ARS en vigueur. Pour l&apos;offre réellement ouverte aux nouveaux patients,
          consultez{" "}
          <a
            href="https://annuairesante.ameli.fr/"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            l&apos;annuaire santé de l&apos;Assurance maladie
          </a>.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Estimation structurelle</Badge>
          <Badge>Cadres de référence : DREES · CNOM · ARS</Badge>
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
            {(10 - h.composite).toFixed(1)}
            <span className="text-lg font-normal text-[var(--text-tertiary)] ml-1">/10</span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mb-2">10 = excellent accès aux soins · 0 = désert médical avéré — estimation communale calée sur les repères DREES / CNOM / ARS, pas un relevé de cabinets.</p>
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
              le département est rangé dans l&apos;un de quatre paliers — désert /
              sous-doté / correct / bien doté — définis d&apos;après les repères DREES
              (densité sous 80/100k hab. et plus de la moitié des praticiens au-delà de
              60 ans pour le premier, sous 100/100k pour le second). Le palier est attribué
              au département, aucune densité n&apos;est relevée pour la commune.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Spécialistes (25 %) :</strong>{" "}
              présence d&apos;un CHU dans la commune (accès direct) puis dégradé selon
              la taille de l&apos;agglomération. Cadres de référence : liste des CHU de la
              Conférence des doyens, atlas démographique du CNOM — les délais de
              rendez-vous ne sont pas mesurés.
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
            Ces quatre scores sont des <strong>estimations</strong> à l&apos;échelle
            communale, pas des relevés : aucune densité médicale, aucun délai de
            rendez-vous et aucun zonage parcellaire ne sont ingérés ici. Le zonage précis
            (ZIP/ZAC) et les aides à l&apos;installation sont publiés par l&apos;ARS, et la
            situation évolue vite avec les départs en retraite.
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
          <Link href={`/villes/${city.slug}/bruit`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🔊</span><span>Bruit</span></div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Routier, aérien, ferré, nocturne</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/ecoles`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🎓</span><span>Écoles</span></div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Maternelles, primaires, collèges, lycées</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/quartiers`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🏘️</span><span>Quartiers</span></div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Sécurité, ambiance, loyers</div>
            </Card>
          </Link>
        </div>

        <div className="mt-8 space-y-2 text-sm">
          <p>
            <Link href="/sante" className="text-[var(--accent)] hover:underline">
              → Classement national de l&apos;accès aux soins
            </Link>
          </p>
          <p>
            <Link
              href="/pour-qui/suivi-medical-regulier"
              className="text-[var(--accent)] hover:underline"
            >
              → Les villes où s&apos;installer quand une pathologie chronique impose
              des rendez-vous réguliers
            </Link>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
        <DiscussionCTA citySlug={city.slug} cityName={city.name} />
      </section>

      <Footer />
    </main>
  );
}
