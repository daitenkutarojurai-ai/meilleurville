import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DEMO_LEVEL_LABEL, DEMO_LEVEL_COLOR } from "@/lib/demography";
import { topMostDynamic, topMostAgeing } from "@/lib/demography-rankings";
import { MACRO_REGIONS } from "@/lib/macro-regions";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Démographie en France · villes dynamiques vs. vieillissantes 2026",
  description:
    "Classement national INSEE des villes françaises selon le profil démographique : vieillissement, attractivité jeunes actifs, trajectoire pop, renouvellement. Top 30 dynamiques vs. top 20 critiques.",
  alternates: { canonical: "/demographie" },
  openGraph: {
    title: "Démographie en France · palmarès 2026",
    description:
      "Top 30 villes au profil démographique le plus dynamique vs. top 20 en tension critique.",
  },
};

const MIN_POP = 15_000;

export default function DemographyHubPage() {
  const dynamic = topMostDynamic(30, MIN_POP);
  const ageing = topMostAgeing(20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Démographie", path: "/demographie" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Quelles villes françaises ont le profil démographique le plus dynamique ?",
      a: `Selon notre composite F59 (vieillissement 30 % + trajectoire 30 % + jeunes actifs 25 % + renouvellement 15 %), les villes ≥ 15 000 hab. au profil le plus dynamique sont : ${dynamic
        .slice(0, 5)
        .map((c) => `${c.name} (${(10 - c.demo.composite).toFixed(1)}/10)`)
        .join(", ")}. Score élevé = équilibre démographique.`,
    },
    {
      q: "Quelles villes sont en tension démographique critique ?",
      a: `Les villes ≥ 15 000 hab. au composite le plus bas sont : ${ageing
        .slice(0, 5)
        .map((c) => `${c.name} (${(10 - c.demo.composite).toFixed(1)}/10)`)
        .join(", ")}. Elles cumulent généralement vieillissement marqué, départ des jeunes actifs et solde démographique négatif depuis plusieurs décennies.`,
    },
    {
      q: "Comment ce classement est-il calculé ?",
      a: "Composite agrégeant 4 dimensions INSEE : vieillissement (30 %, % seniors 60+ par dept), trajectoire population (30 %, solde naturel + migratoire), attractivité jeunes actifs 25-35 (25 %, % dans la pop totale), renouvellement (15 %, taux brut de natalité ‰). Score 0-10, 10 = démographie dynamique.",
    },
    {
      q: "Où voir les projections officielles à 2050 ?",
      a: "OMPHALE (INSEE) modélise les projections population par zone d'emploi à horizon 2050-2070. Le Bilan démographique annuel donne la photo l'année écoulée. La CNAV publie ses projections seniors 75+ par EPCI à horizon 2030 et 2040.",
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
          Démographie en France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Index composite agrégeant quatre dimensions clés de la démographie locale :
          vieillissement, attractivité jeunes actifs, trajectoire population, renouvellement
          naturel. Score 0-10, 10 = démographie dynamique. Filtre 15 000 habitants minimum.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Synthèse pédagogique</Badge>
          <Badge>4 dimensions · {CITIES_COUNT} villes</Badge>
          <Badge>Pondération vieillis. 30 % · traj. 30 % · jeunes 25 % · renouv. 15 %</Badge>
        </div>

        {/* Top dynamic */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — villes au profil démographique le plus dynamique
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Grandes métropoles attractives, IDF dense, façade atlantique en croissance. Score
          composite élevé = pyramide équilibrée + trajectoire positive.
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Vieillis.</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Jeunes</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Trajectoire</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Renouv.</th>
                </tr>
              </thead>
              <tbody>
                {dynamic.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/demographie`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${DEMO_LEVEL_COLOR[c.demo.level]}`}>
                        {(10 - c.demo.composite).toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {DEMO_LEVEL_LABEL[c.demo.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.demo.ageing.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.demo.youngActives.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.demo.trajectory.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.demo.renewal.score).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Lecture : 10 = démographie dynamique. Score &lt; 3 = tension démographique critique.
        </p>

        {/* Ageing */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — villes en tension démographique critique
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes ≥ 15 000 hab. cumulant vieillissement marqué, départ jeunes actifs et
          solde démographique négatif structurel. Centre/Est rural et bassins industriels
          en reconversion.
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Vieillis.</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Jeunes</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Trajectoire</th>
                </tr>
              </thead>
              <tbody>
                {ageing.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/demographie`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {(10 - c.demo.composite).toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.demo.ageing.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.demo.youngActives.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.demo.trajectory.score).toFixed(1)}</td>
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
              <strong className="text-[var(--text-primary)]">Vieillissement (30 %)</strong> —
              part des 60 ans et plus par dept (INSEE RP). Médiane nationale ~28 %.
              Très âgé : Limousin, Massif Central, Manche, Orne, Vosges (35-40 %).
              Très jeune : DROM hors Antilles (&lt; 20 %).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Trajectoire (30 %)</strong> —
              solde démographique annuel (naturel + migratoire). Façade atlantique + Sud +
              métropoles : positif soutenu. Centre/Est rural + bassins industriels :
              décroissance structurelle.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Jeunes actifs 25-35 (25 %)</strong> —
              part des 25-35 ans. Indicateur d&apos;attractivité long-terme. Métropoles
              étudiantes en tête (&gt; 18 %), bourgs ruraux en queue.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Renouvellement (15 %)</strong> —
              taux brut de natalité (‰). France 2024 ~10,5 ‰. DROM &gt; 14 ‰, rural
              âgé &lt; 8 ‰. Proxy de la part de jeunes adultes en âge de procréer.
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Synthèse à l&apos;échelle communale dérivée du proxy département. Pour la
            projection précise à 2050 par zone d&apos;emploi, OMPHALE (INSEE) reste la
            référence officielle.
          </p>
        </Card>

        {/* Macro-region breakdown */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Par macro-région
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Le profil démographique oppose nettement la côte atlantique en croissance et
          l&apos;arc alpin dynamique au Centre rural en décroissance. Vue restreinte à
          chaque zone.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link key={m.slug} href={`/demographie/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Top dynamiques + vieillissantes</div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Cross-links */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Voir aussi
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/cadre-de-vie" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🌿</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Cadre de vie</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Méga-index env + santé + emploi</div>
            </Card>
          </Link>
          <Link href="/sante" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🩺</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Accès aux soins</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Vieillissement → tension MG</div>
            </Card>
          </Link>
          <Link href="/emploi" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">💼</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Marché du travail</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Jeunes actifs → dynamisme</div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
