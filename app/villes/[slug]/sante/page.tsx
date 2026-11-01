import type { Metadata } from "next";
import { MapsQuickSearch } from "@/components/MapsQuickSearch";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  computeHealthcareAccess,
  HEALTH_LEVEL_LABEL,
  HEALTH_LEVEL_COLOR,
  HEALTH_LEVEL_BG,
  type HealthDimension,
  CHU_SITE_COUNT,
} from "@/lib/healthcare-access";
import {
  APL_NATIONAL,
  APL_SOURCE_URL,
  APL_UNDERSERVED,
  APL_YEAR,
  BPE_SOURCE_URL,
  BPE_YEAR,
  residentsPerPharmacy,
} from "@/lib/city-healthcare";
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
      description: h.measured
        ? `Généralistes (APL DREES), urgences et pharmacies (Insee BPE) relevés ; spécialistes estimés.`
        : `Médecins, spécialistes, urgences, pharmacies — estimation communale, pas un relevé de cabinets.`,
    },
  };
}

const fr2 = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const frInt = (n: number) => n.toLocaleString("fr-FR");

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
  const m = h.measured;
  const perPharmacy = m ? residentsPerPharmacy(m) : null;

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

      {/* Hero */}
      <section className="relative overflow-hidden bg-aurora pt-12 pb-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link> ·{" "}
          <Link href="/villes" className="hover:underline">Villes</Link> ·{" "}
          <Link href={`/villes/${city.slug}`} className="hover:underline">{city.name}</Link>
        </nav>

        <div className="flex items-center gap-3">
          <span aria-hidden className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl grad-head-0 text-xl shadow-[0_10px_24px_-12px_rgba(79,70,229,0.7)]">🩺</span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            Accès aux soins à {city.name}
          </h1>
        </div>
        {m ? (
          <p className="mt-3 text-base text-[var(--text-secondary)]">
            Quatre dimensions de l&apos;accès aux soins : médecins généralistes (porte
            d&apos;entrée du système), spécialistes, urgences et pharmacies. Trois sont{" "}
            <strong>mesurées</strong> pour {city.name} : l&apos;accès aux généralistes par
            l&apos;indicateur APL de la DREES, les services d&apos;urgences et les pharmacies
            par la base des équipements de l&apos;Insee. Les spécialistes restent{" "}
            <strong>estimés</strong>, à partir de la distance au CHU et de la taille de la
            ville. Aucun de ces chiffres ne dit quels médecins acceptent de nouveaux patients ;
            pour cela, consultez{" "}
            <a
              href="https://annuairesante.ameli.fr/"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              l&apos;annuaire santé de l&apos;Assurance maladie
            </a>.
          </p>
        ) : (
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Profil <strong>structurel</strong> des quatre dimensions clés de l&apos;accès aux
          soins : médecins généralistes (porte d&apos;entrée du système), spécialistes,
          urgences/SAU, et maillage pharmacies. {city.name} n&apos;est pas couverte par
          l&apos;indicateur APL de la DREES : les niveaux ci-dessous sont{" "}
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
        )}

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {m ? (
            <>
              <Badge>Mesuré : DREES APL {APL_YEAR} · Insee BPE {BPE_YEAR}</Badge>
              <Badge>Spécialistes : estimation</Badge>
            </>
          ) : (
            <>
              <Badge>Estimation structurelle</Badge>
              <Badge>Cadres de référence : DREES · CNOM · ARS</Badge>
            </>
          )}
        </div>
        </div>
      </section>

      {/* Score composite + quatre dimensions — bande indigo */}
      <section className="band band-indigo py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
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
          <p className="text-xs text-[var(--text-tertiary)] mb-2">
            {m
              ? "10 = excellent accès aux soins · 0 = désert médical — généralistes, urgences et pharmacies relevés (DREES, Insee), spécialistes estimés d'après la distance au CHU et la taille de la ville."
              : "10 = excellent accès aux soins · 0 = désert médical avéré — seule la distance au site de CHU le plus proche est mesurée, le reste est une estimation communale calée sur les repères DREES / CNOM / ARS, pas un relevé de cabinets."}
          </p>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{h.signature}</p>
        </div>

        {m && (
          <>
            <h2 className="mt-10 text-xl font-bold text-[var(--text-primary)]">Les relevés</h2>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {m.apl !== undefined && (
                <div className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
                  <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">{fr2(m.apl)}</div>
                  <div className="mt-1 text-xs text-[var(--text-secondary)]">
                    consultations de généraliste accessibles par an et par habitant (France : {fr2(APL_NATIONAL)} ; zone sous-dense sous {fr2(APL_UNDERSERVED)})
                  </div>
                </div>
              )}
              <div className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
                <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">{frInt(m.gp)}</div>
                <div className="mt-1 text-xs text-[var(--text-secondary)]">médecins généralistes libéraux installés dans la commune</div>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
                <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">{frInt(m.pharmacies)}</div>
                <div className="mt-1 text-xs text-[var(--text-secondary)]">
                  pharmacies{perPharmacy ? `, une pour ${frInt(perPharmacy)} habitants` : ""}
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
                <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">{frInt(m.emergency)}</div>
                <div className="mt-1 text-xs text-[var(--text-secondary)]">service{m.emergency > 1 ? "s" : ""} d&apos;urgences dans la commune</div>
              </div>
            </div>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">
              Sources :{" "}
              <a href={APL_SOURCE_URL} target="_blank" rel="noreferrer" className="underline">
                DREES, accessibilité potentielle localisée aux médecins généralistes, {APL_YEAR}
              </a>{" "}
              ·{" "}
              <a href={BPE_SOURCE_URL} target="_blank" rel="noreferrer" className="underline">
                Insee, base permanente des équipements au 1er janvier {BPE_YEAR}
              </a>
              . Population municipale 2022 : {frInt(m.pop)} habitants.
            </p>
          </>
        )}

        {/* 4 dimensions */}
        <h2 className="mt-10 text-xl font-bold text-[var(--text-primary)]">Les quatre dimensions</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <HealthBlock dim={h.generalistes} label="Médecins généralistes" />
          <HealthBlock dim={h.specialistes} label="Spécialistes (cardio, ophtalmo…)" />
          <HealthBlock dim={h.urgences} label="Urgences / SAU" />
          <HealthBlock dim={h.pharmacies} label="Pharmacies" />
        </div>
        </div>
      </section>

      {/* Méthodologie — bande ciel */}
      <section className="band band-sky py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-xl font-bold"><span className="gradient-text">Méthodologie</span></h2>
        <div className="mt-3 rounded-2xl bg-white p-5 sm:p-6 shadow-[0_10px_28px_-18px_rgba(8,145,178,0.5)]">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            {m?.apl !== undefined ? (
              <li>
                <strong className="text-[var(--text-primary)]">Médecins généralistes (35 %) :</strong>{" "}
                <strong className="text-[var(--text-primary)]">mesuré</strong> par l&apos;APL de la
                DREES : le nombre de consultations de médecine générale accessibles par an et par
                habitant, médecins des communes voisines compris (pondérés par la distance et par leur
                activité), rapporté à une population standardisée par âge. Barème continu : sous 1,5,
                accès très faible, niveau « désert » ; sous 2,5, zone sous-dense, niveau
                « tendu » ; au-delà de 4, niveau « facile ».
              </li>
            ) : (
              <li>
                <strong className="text-[var(--text-primary)]">Médecins généralistes (35 %) :</strong>{" "}
                {city.name} est hors du champ de l&apos;APL : le département est rangé dans l&apos;un
                de quatre paliers — désert / sous-doté / correct / bien doté — définis d&apos;après les
                repères DREES. Le palier est attribué au département, aucune densité n&apos;est relevée
                pour la commune.
              </li>
            )}
            <li>
              <strong className="text-[var(--text-primary)]">Spécialistes (25 %) :</strong>{" "}
              distance au site de CHU le plus proche ({CHU_SITE_COUNT} communes
              d&apos;implantation recensées), puis, au-delà de 30 km, la taille de
              l&apos;agglomération. La distance est <strong className="text-[var(--text-primary)]">mesurée</strong>{" "}
              entre centroïdes de communes, au grain du centroïde et pas du porche de
              l&apos;hôpital ; les délais de rendez-vous, eux, ne sont pas relevés.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Urgences/SAU (25 %) :</strong>{" "}
              {m
                ? "présence d'un service d'urgences dans la commune, relevée par l'Insee ; sans service sur place, distance à vol d'oiseau jusqu'à la commune la plus proche qui en compte un, avec une pénalité en montagne, où la route est plus longue que la ligne droite. Un site de CHU à portée ne peut qu'améliorer la note. Ni le temps de trajet ni l'attente ne sont relevés."
                : "la même distance au CHU, sinon la présence estimée d'un SAU selon la taille de la commune. Pénalité pour zone de montagne (enneigement) et zone insulaire (liaisons). La proximité d'un CHU ne peut qu'améliorer ces deux notes, jamais les dégrader."}
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Pharmacies (15 %) :</strong>{" "}
              {m
                ? "pharmacies recensées dans la commune par l'Insee, rapportées à la population. La moyenne française tourne autour d'une pharmacie pour 3 300 habitants ; les gardes de nuit ne sont pas relevées."
                : "maillage estimé selon la population et le statut urbain. France moyenne : environ une pharmacie pour 3 300 habitants."}
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            {m
              ? "Aucun délai de rendez-vous n'est relevé, et l'APL ne dit pas quels médecins prennent de nouveaux patients. Le zonage opposable (ZIP/ZAC) et les aides à l'installation sont publiés par l'ARS, par territoire de vie-santé et non par commune ; la situation évolue vite avec les départs en retraite."
              : "Ces quatre scores sont des estimations à l'échelle communale, pas des relevés : aucune densité médicale, aucun délai de rendez-vous et aucun zonage parcellaire ne sont ingérés pour cette commune. Le zonage précis (ZIP/ZAC) et les aides à l'installation sont publiés par l'ARS, et la situation évolue vite avec les départs en retraite."}
          </p>
        </div>
        </div>
      </section>

      {/* Renvois + discussion — bande blanche */}
      <section className="band band-white py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Aller plus loin</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/villes/${city.slug}/air`} className="block">
            <div className="h-full rounded-2xl bg-[var(--band-indigo)] px-5 py-4 transition-colors hover:bg-[#DCD7FF]">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🌬️</span><span>Qualité de l&apos;air</span></div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">NO2, particules, ozone, pollens</div>
            </div>
          </Link>
          <Link href={`/villes/${city.slug}/bruit`} className="block">
            <div className="h-full rounded-2xl bg-[var(--band-indigo)] px-5 py-4 transition-colors hover:bg-[#DCD7FF]">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🔊</span><span>Bruit</span></div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Routier, aérien, ferré, nocturne</div>
            </div>
          </Link>
          <Link href={`/villes/${city.slug}/ecoles`} className="block">
            <div className="h-full rounded-2xl bg-[var(--band-indigo)] px-5 py-4 transition-colors hover:bg-[#DCD7FF]">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🎓</span><span>Écoles</span></div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Maternelles, primaires, collèges, lycées</div>
            </div>
          </Link>
          <Link href={`/villes/${city.slug}/quartiers`} className="block">
            <div className="h-full rounded-2xl bg-[var(--band-indigo)] px-5 py-4 transition-colors hover:bg-[#DCD7FF]">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🏘️</span><span>Quartiers</span></div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Sécurité, ambiance, loyers</div>
            </div>
          </Link>
        </div>

        <div className="mt-8 space-y-2 text-sm">
          <p>
            <Link href="/sante" className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#3730A3] shadow-sm ring-1 ring-[var(--band-indigo)] transition-colors hover:bg-[var(--band-indigo)]">
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
          <p>
            <Link
              href="/pour-qui/professionnels-de-sante"
              className="text-[var(--accent)] hover:underline"
            >
              → Pour un médecin ou un paramédical qui hésite à s&apos;installer : les
              villes où la pénurie d&apos;offre de soins est la plus marquée
            </Link>
          </p>
        </div>

        <div className="mt-10">
          <MapsQuickSearch topic="sante" cityName={city.name} department={city.department} locale="fr" className="mb-8" />
          <DiscussionCTA citySlug={city.slug} cityName={city.name} />
        </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
