import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  computePublicServices,
  SERVICES_LEVEL_LABEL,
  SERVICES_LEVEL_COLOR,
  SERVICES_LEVEL_BG,
  type ServicesDimension,
} from "@/lib/public-services";
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
  const s = computePublicServices(city);
  return {
    title: `Services publics à ${city.name} — écoles, Poste, mairie, médiathèque`,
    description: `Accès aux services publics à ${city.name} (${city.department}) : écoles ${SERVICES_LEVEL_LABEL[s.schools.level].toLowerCase()}, La Poste ${SERVICES_LEVEL_LABEL[s.postOffice.level].toLowerCase()}, mairie ${SERVICES_LEVEL_LABEL[s.cityHall.level].toLowerCase()}, médiathèque ${SERVICES_LEVEL_LABEL[s.library.level].toLowerCase()}. Score ${(10 - s.composite).toFixed(1)}/10 (10 = maillage complet).`,
    alternates: { canonical: `/villes/${slug}/services-publics` },
    openGraph: {
      title: `Services publics à ${city.name}`,
      description: `Écoles, médiathèque, La Poste, mairie — synthèse DEPP / BNF / La Poste / France Services.`,
    },
  };
}

function ServicesBlock({ dim, label }: { dim: ServicesDimension; label: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${SERVICES_LEVEL_BG[dim.level]}`}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
        <div className={`text-xs font-bold uppercase tracking-wide ${SERVICES_LEVEL_COLOR[dim.level]}`}>
          {SERVICES_LEVEL_LABEL[dim.level]}
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

export default async function ServicesPubliquesPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const s = computePublicServices(city);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Services publics", path: `/villes/${city.slug}/services-publics` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quels services publics sont disponibles à ${city.name} ?`,
      a: `${city.name} (${city.department}) totalise un composite services publics ${(10 - s.composite).toFixed(1)}/10 (10 = maillage complet). Détail : écoles & petite enfance ${(10 - s.schools.score).toFixed(1)}/10, médiathèque ${(10 - s.library.score).toFixed(1)}/10, La Poste & France Services ${(10 - s.postOffice.score).toFixed(1)}/10, mairie & démarches ${(10 - s.cityHall.score).toFixed(1)}/10. ${s.signature}`,
    },
    {
      q: `Y a-t-il une Maison France Services à ${city.name} ?`,
      a: `Les Maisons France Services (~2 800 implantations en 2024) regroupent en présence les démarches CAF, CPAM, impôts, Pôle Emploi, ANTS et retraites. Carte officielle sur france-services.gouv.fr. Maillage prioritaire visant 1 implantation par canton.`,
    },
    {
      q: `Où sont les écoles et collèges de ${city.name} ?`,
      a: s.schools.reason + " L'annuaire DEPP du ministère de l'Éducation nationale liste l'ensemble des établissements par commune sur education.gouv.fr.",
    },
    {
      q: `${city.name} a-t-elle un bureau de Poste actif ?`,
      a: s.postOffice.reason + " La carte officielle laposte.fr/particulier liste tous les points (bureaux, APC, RPC) avec leurs horaires actualisés.",
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
          Services publics à {city.name}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Synthèse pédagogique des quatre piliers du quotidien administratif :
          écoles &amp; petite enfance, médiathèque, La Poste &amp; France Services,
          mairie &amp; démarches en présence. Sources :{" "}
          <a href="https://www.education.gouv.fr/annuaire" target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline">
            DEPP
          </a>{" "}
          ·{" "}
          <a href="https://www.france-services.gouv.fr/" target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline">
            France Services
          </a>{" "}
          · CAF · BNF · La Poste.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Synthèse pédagogique</Badge>
          <Badge>DEPP · CAF · BNF · France Services · La Poste</Badge>
        </div>

        {/* Composite hero */}
        <Card className={`mt-6 border-l-4 ${SERVICES_LEVEL_BG[s.level].replace('bg-', 'border-l-').replace('-50', '-500').split(' ')[0]}`}>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">Score composite</h2>
            <span className={`text-xs font-bold uppercase ${SERVICES_LEVEL_COLOR[s.level]}`}>
              Accès {SERVICES_LEVEL_LABEL[s.level].toLowerCase()}
            </span>
          </div>
          <div className="text-4xl font-bold tabular-nums text-[var(--text-primary)] mb-3">
            {(10 - s.composite).toFixed(1)}
            <span className="text-lg font-normal text-[var(--text-tertiary)] ml-1">/10</span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mb-2">10 = maillage de services complet · 0 = désert de services.</p>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{s.signature}</p>
        </Card>

        {/* 4 dimensions */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Les quatre dimensions</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ServicesBlock dim={s.schools} label="Écoles & petite enfance" />
          <ServicesBlock dim={s.library} label="Médiathèque" />
          <ServicesBlock dim={s.postOffice} label="La Poste & France Services" />
          <ServicesBlock dim={s.cityHall} label="Mairie & démarches" />
        </div>

        {/* Methodology */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Méthodologie</h2>
        <Card className="mt-3">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Écoles &amp; enfance (35 %) :</strong>{" "}
              écoles élémentaires + collèges + lycées + crèches. Maillage par
              palier de population (annuaire DEPP). Malus crèche pour les
              départements à forte tension d&apos;accueil (CAF). Métropoles
              étudiantes et villes ≥ 30 000 hab. : maillage complet.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Mairie &amp; démarches (25 %) :</strong>{" "}
              amplitude d&apos;ouverture mairie + présence d&apos;antennes / Maison
              France Services. Communes &gt; 30 000 hab. : 5 jours/7 + démarches
              CNI/passeport en présence. Bourgs &lt; 3 000 hab. : 2-4
              demi-journées hebdomadaires.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">La Poste &amp; France Services (25 %) :</strong>{" "}
              bureaux de Poste, Agences Postales Communales (APC), Relais Poste
              Commerçants (RPC), Maisons France Services (~2 800 en 2024).
              Malus pour les départements en recul du maillage La Poste (Creuse,
              Cantal, Lozère, Nièvre…) et les DROM tendus (Mayotte, Guyane).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Médiathèque (15 %) :</strong>{" "}
              référencement BNF / ministère de la Culture — ~16 000 lieux de
              lecture publique. Présence quasi-systématique &gt; 10 000 hab.
              Bonus pour villes culturelles &amp; étudiantes (horaires étendus,
              ressources numériques).
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Maillage proxyé par strate de population × département. Pour le
            détail point par point, consulter{" "}
            <a href="https://lannuaire.service-public.fr/" target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline">l&apos;annuaire de l&apos;administration</a>{" "}
            sur service-public.fr.
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
          <Link href={`/villes/${city.slug}/ecoles`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Écoles &amp; éducation</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Université, CPGE, post-bac</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/demographie`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Démographie</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Vieillissement, trajectoire</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/transports`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Transports</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Bus, train, mobilités douces</div>
            </Card>
          </Link>
        </div>

        <div className="mt-8 text-sm">
          <Link href="/services-publics" className="text-[var(--accent)] hover:underline">
            → Classement national accès services publics
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
