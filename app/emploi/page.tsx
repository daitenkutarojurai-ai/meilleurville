import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  topMostFavorable,
  topMostDifficult,
  JOB_LEVEL_LABEL,
  JOB_LEVEL_COLOR,
} from "@/lib/employment-market";
import { MACRO_REGIONS } from "@/lib/macro-regions";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Marché du travail en France · meilleures villes pour trouver un emploi 2026",
  description:
    "Classement national des villes françaises selon le marché du travail : chômage INSEE, dynamisme SIRENE, mix sectoriel, salaire net médian. Top 30 villes favorables vs. top 20 marchés sinistrés.",
  alternates: { canonical: "/emploi" },
  openGraph: {
    title: "Marché du travail en France · meilleures villes 2026",
    description:
      "Top 30 villes au marché favorable vs. top 20 marchés sinistrés. INSEE / DARES / SIRENE / DADS.",
  },
};

const MIN_POP = 15_000;

export default function EmploymentHubPage() {
  const best = topMostFavorable(30, MIN_POP);
  const worst = topMostDifficult(20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Emploi & marché du travail", path: "/emploi" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Quelles villes françaises ont le marché du travail le plus favorable ?",
      a: `Selon notre composite F50 (chômage, dynamisme, mix sectoriel, salaire), les villes ≥ 15 000 hab. au marché le plus favorable sont : ${best
        .slice(0, 5)
        .map((c) => `${c.name} (${(10 - c.market.composite).toFixed(1)}/10)`)
        .join(", ")}. Score élevé = marché favorable.`,
    },
    {
      q: "Quelles villes ont le marché de l'emploi le plus difficile ?",
      a: `Les villes ≥ 15 000 hab. au composite le plus bas (donc le marché le plus difficile) sont : ${worst
        .slice(0, 5)
        .map((c) => `${c.name} (${(10 - c.market.composite).toFixed(1)}/10)`)
        .join(", ")}. Ces villes cumulent généralement chômage élevé, salaires bas et faible dynamisme entrepreneurial.`,
    },
    {
      q: "Comment ce classement est-il calculé ?",
      a: "Composite agrégeant 4 dimensions : taux de chômage INSEE T4 2024 par dept (35 %), salaire net médian INSEE DADS (25 %), dynamisme création SIRENE (20 %), mix sectoriel et résilience (20 %). Score 0-10, 10 = marché du travail dynamique.",
    },
    {
      q: "Où trouver les offres d'emploi en temps réel ?",
      a: "France Travail (francetravail.fr) couvre 60-70 % des offres déclarées. Apec (apec.fr) pour les cadres. Hellowork, Indeed et Welcome to the Jungle pour le privé. Chaque grande métropole a aussi une bourse emploi locale (CCI, agence dev économique).",
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
          Marché du travail en France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Index composite agrégeant quatre dimensions clés du marché du travail local :
          taux de chômage (INSEE), dynamisme entrepreneurial (SIRENE), mix sectoriel
          (résilience), salaire net médian (DADS). Score 0-10, 10 = marché du travail dynamique.
          Filtre 15 000 habitants minimum pour pertinence des indicateurs départementaux.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Synthèse pédagogique</Badge>
          <Badge>4 dimensions · {CITIES_COUNT} villes</Badge>
          <Badge>Pondération chômage 35 % · salaire 25 % · dynamisme 20 % · mix 20 %</Badge>
        </div>

        {/* Top most favorable */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — villes au marché le plus favorable
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Grandes métropoles dynamiques, départements à faible chômage, salaires médians
          élevés. Score composite élevé = marché facile, opportunités larges.
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Chômage</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Salaire</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Dynam.</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Mix</th>
                </tr>
              </thead>
              <tbody>
                {best.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/emploi`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${JOB_LEVEL_COLOR[c.market.level]}`}>
                        {(10 - c.market.composite).toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {JOB_LEVEL_LABEL[c.market.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.market.unemployment.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.market.salary.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.market.dynamism.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.market.sectorMix.score).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Lecture des sous-scores : 10 = situation la plus favorable (chômage bas, salaire haut, fort dynamisme).
        </p>

        {/* Most difficult */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — villes au marché le plus difficile
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes ≥ 15 000 hab. cumulant chômage INSEE élevé, salaires bas et faible
          création nette d&apos;entreprises. Marché tendu, transition économique souvent
          en cours.
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Chômage</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Salaire</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Dynam.</th>
                </tr>
              </thead>
              <tbody>
                {worst.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/emploi`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {(10 - c.market.composite).toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.market.unemployment.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.market.salary.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.market.dynamism.score).toFixed(1)}</td>
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
              <strong className="text-[var(--text-primary)]">Chômage (35 %)</strong> —
              taux trimestriel INSEE par département (T4 2024 latest). Moyenne France
              métropolitaine ~7,3 %. DROM en tension chronique &gt; 15 %.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Salaire (25 %)</strong> —
              salaire net médian départemental INSEE DADS. Moyenne France ~2 100 €/mois.
              Paris &amp; petite couronne &gt; 2 400 €, DROM &amp; ruraux &lt; 1 850 €.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Dynamisme (20 %)</strong> —
              création nette d&apos;entreprises SIRENE par département, pondérée par taille
              de la commune. Métropoles et littoraux attractifs au-dessus, ruraux en déclin
              en-dessous.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Mix sectoriel (20 %)</strong> —
              diversification du tissu. Pénalité mono-tourisme (saisonnalité), ancien
              bassin mono-industriel en reconversion, valorise diversification métropole.
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Synthèse à l&apos;échelle départementale. Le marché local peut varier fortement
            au sein d&apos;un dept (préfecture vs. canton rural). Pour les offres en temps
            réel : France Travail, Apec, Hellowork.
          </p>
        </Card>

        {/* Macro-region breakdown */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Par macro-région
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Le marché de l&apos;emploi varie fortement entre les métropoles dynamiques et
          les anciens bassins industriels. Vue restreinte à chaque grande zone géographique.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link key={m.slug} href={`/emploi/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Marché favorable + difficile</div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Cross-links */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Voir aussi
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/sante" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🩺</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Accès aux soins</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Médecins, urgences, déserts</div>
            </Card>
          </Link>
          <Link href="/environnement" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🌿</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Environnement</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Air, bruit, eau, risques</div>
            </Card>
          </Link>
          <Link href="/salaire-equivalent" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">💶</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Salaire équivalent</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Convertir entre villes</div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
