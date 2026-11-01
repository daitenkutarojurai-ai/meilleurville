import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { HEALTH_LEVEL_LABEL, HEALTH_LEVEL_COLOR, CHU_SITE_COUNT } from "@/lib/healthcare-access";
import { topBestAccess, topDeserts } from "@/lib/healthcare-access-rankings";
import { MACRO_REGIONS } from "@/lib/macro-regions";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";
import { pathAlternates } from "@/lib/i18n";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Accès aux soins en France · meilleurs hôpitaux vs. déserts médicaux 2026",
  description:
    "Classement national des villes françaises selon l'accès aux soins : médecins généralistes, spécialistes, urgences, pharmacies. Top 30 meilleur accès vs. top 20 accès difficile. Généralistes mesurés (APL DREES), spécialistes estimés.",
  alternates: pathAlternates("/sante", "/healthcare"),
  openGraph: {
    // Sans `images`, un openGraph de page remplace celui hérité de la racine
    // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
    images: ["/opengraph-image"],
    title: "Accès aux soins en France · meilleurs vs. désert médical",
    description:
      "Top 30 villes meilleur accès médecins + spécialistes + urgences vs. top 20 désert médical avéré.",
  },
};

const MIN_POP = 10_000;

export default function HealthcareHubPage() {
  const best = topBestAccess(30, MIN_POP);
  const deserts = topDeserts(20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Santé & accès aux soins", path: "/sante" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Quelles sont les villes françaises avec le meilleur accès aux soins ?",
      a: `Selon notre composite F47 (médecins généralistes, spécialistes, urgences, pharmacies), les villes ≥ 10 000 hab. au meilleur accès sont : ${best
        .slice(0, 5)
        .map((c) => `${c.name} (${(10 - c.access.composite).toFixed(1)}/10)`)
        .join(", ")}. Score élevé = bon accès.`,
    },
    {
      q: "Quelles sont les villes en désert médical avéré ?",
      a: `Les villes ≥ 10 000 hab. au composite accès soins le plus bas (donc le plus difficile) sont : ${deserts
        .slice(0, 5)
        .map((c) => `${c.name} (${(10 - c.access.composite).toFixed(1)}/10)`)
        .join(", ")}. Elles cumulent un accès aux généralistes sous le seuil de zone sous-dense ou proche, pas de service d'urgences dans la commune et des spécialistes éloignés. Le classement des villes sous le seuil de zone sous-dense est sur /red-flags/villes-desert-medical.`,
    },
    {
      q: "Comment ce classement est-il calculé ?",
      a: "Composite agrégeant 4 dimensions : médecins généralistes (35 %, mesuré par l'accessibilité potentielle localisée de la DREES, 2024), spécialistes (25 %, estimé : distance mesurée au site de CHU le plus proche, puis grande agglo > moyenne > rural), urgences (25 %, service d'urgences recensé dans la commune par l'Insee, sinon distance mesurée à la commune la plus proche qui en compte un, + malus montagne), pharmacies (15 %, pharmacies recensées par l'Insee rapportées à la population). Score 0-10, 10 = excellent accès aux soins. Trois dimensions sont mesurées pour 591 des 593 villes ; Mamoudzou et Pierrefitte-sur-Seine, hors champ, gardent une estimation. Aucun chiffre ne dit quels médecins prennent de nouveaux patients, et ce n'est pas le zonage ZIP/ZAC en vigueur.",
    },
    {
      q: "Que faire si je ne trouve pas de médecin traitant ?",
      a: "L'ARS de chaque département tient une liste des médecins acceptant de nouveaux patients. Ameli (ameli.fr) propose un annuaire avec disponibilité. Doctolib filtre par « nouveaux patients acceptés ». La CPAM peut aussi désigner un médecin traitant via le téléservice « médecin traitant ».",
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Accès aux soins en France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Index composite agrégeant quatre dimensions clés de l&apos;accès aux soins :
          médecins généralistes, spécialistes, urgences/SAU et pharmacies. Score 0-10,
          10 = excellent accès aux soins. Les généralistes, les urgences et les pharmacies
          sont mesurés (DREES, Insee) ; les spécialistes sont estimés. Filtre 10 000
          habitants minimum.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Mesuré : DREES APL 2024 · Insee BPE 2025</Badge>
          <Badge>Spécialistes : estimation</Badge>
          <Badge>4 dimensions · {CITIES_COUNT} villes</Badge>
          <Badge>Pondération MG 35 % · spé 25 % · urgences 25 % · pharma 15 %</Badge>
        </div>

        {/* Top best access */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — villes au meilleur accès aux soins
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Villes proches d&apos;un site de CHU, avec un accès aux généralistes au-dessus de la
          moyenne nationale et des urgences sur place. Score composite élevé = accès facile.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Région</th>
                  <th className="px-3 py-2 text-right">Composite</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">MG</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Spé.</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Urg.</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Pharma.</th>
                </tr>
              </thead>
              <tbody>
                {best.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/sante`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${HEALTH_LEVEL_COLOR[c.access.level]}`}>
                        {(10 - c.access.composite).toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {HEALTH_LEVEL_LABEL[c.access.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.access.generalistes.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.access.specialistes.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.access.urgences.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.access.pharmacies.score).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Lecture des sous-scores : 10 = accès aux soins excellent, 0 = désert médical.
        </p>

        {/* Desert médical */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — villes à l&apos;accès aux soins le plus difficile
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes ≥ 10 000 hab. qui cumulent un accès aux généralistes faible, pas de service
          d&apos;urgences sur place et des spécialistes éloignés. Score composite faible = accès
          difficile. Les villes sous le seuil officiel de zone sous-dense sont classées sur{" "}
          <Link href="/red-flags/villes-desert-medical" className="text-[var(--accent)] hover:underline">
            la page désert médical
          </Link>
          .
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Région</th>
                  <th className="px-3 py-2 text-right">Composite</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">MG</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Spé.</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Urg.</th>
                </tr>
              </thead>
              <tbody>
                {deserts.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/sante`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {(10 - c.access.composite).toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.access.generalistes.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.access.specialistes.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.access.urgences.score).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Methodology */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">Méthodologie</h2>
        <Card className="mt-3">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Médecins généralistes (35 %)</strong> —
              <strong className="text-[var(--text-primary)]">mesuré</strong> par l&apos;accessibilité
              potentielle localisée (APL) de la DREES, 2024 : consultations de médecine générale
              accessibles par an et par habitant, médecins des communes voisines compris. Sous 1,5,
              accès très faible ; sous 2,5, zone sous-dense ; moyenne nationale 3,72.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Spécialistes (25 %)</strong> —
              distance au site de CHU le plus proche, sur les {CHU_SITE_COUNT} communes
              d&apos;implantation recensées : plein accès sous 10 km, accès dégradé jusqu&apos;à
              30 km, puis grande agglo &gt; ville moyenne &gt; rural. La distance est mesurée
              entre centroïdes de communes ; les délais de rendez-vous ne le sont pas.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Urgences/SAU (25 %)</strong> —
              présence d&apos;un service d&apos;urgences dans la commune, relevée par l&apos;Insee
              (base permanente des équipements, 2025) ; sans service sur place, distance mesurée à
              vol d&apos;oiseau jusqu&apos;à la commune la plus proche qui en compte un, avec un malus
              en montagne, où la route est plus longue que la ligne droite. La proximité d&apos;un CHU
              ne peut qu&apos;améliorer la note, jamais la dégrader.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Pharmacies (15 %)</strong> —
              pharmacies recensées dans la commune par l&apos;Insee, rapportées à la population.
              Moyenne française : environ une pour 3 300 habitants.
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Les spécialistes restent une <strong>estimation</strong>, et aucun délai de
            rendez-vous n&apos;est relevé. Mamoudzou et Pierrefitte-sur-Seine, hors du champ
            de l&apos;APL, gardent l&apos;estimation sur les quatre dimensions. Le zonage précis (ZIP / ZAC) et les aides à
            l&apos;installation sont publiés par l&apos;ARS, et la situation évolue vite avec
            les départs en retraite — vérifier la disponibilité d&apos;un médecin traitant sur
            Ameli avant un déménagement définitif.
          </p>
        </Card>

        {/* Macro-region breakdown */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Par macro-région
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          L&apos;accès aux soins varie fortement d&apos;une zone à l&apos;autre, et pas
          toujours là où on l&apos;attend : la grande couronne parisienne compte plus de villes
          sous le seuil de zone sous-dense que les départements ruraux. Vue restreinte à chaque
          grande zone.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link key={m.slug} href={`/sante/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Meilleur accès + déserts médicaux</div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Cross-links */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Voir aussi
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/environnement" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🌿</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Environnement</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Air, bruit, eau, risques</div>
            </Card>
          </Link>
          <Link href="/red-flags/villes-desert-medical" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🚨</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Red Flag désert médical</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Vue critique « ne pas y aller »</div>
            </Card>
          </Link>
          <Link href="/classements" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Tous les classements</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Vie, transport, sécurité…</div>
            </Card>
          </Link>
          <Link href="/pour-qui/suivi-medical-regulier" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🩺</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Vivre avec un suivi médical régulier</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">L&apos;accès aux soins repondéré avec le coût, les trajets et la canicule</div>
            </Card>
          </Link>
          <Link href="/pour-qui/professionnels-de-sante" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🧑‍⚕️</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">S&apos;installer comme soignant là où l&apos;on manque de bras</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Le même indicateur lu à l&apos;envers, du côté du cabinet</div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
