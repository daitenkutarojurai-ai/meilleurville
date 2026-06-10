import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { HEALTH_LEVEL_LABEL, HEALTH_LEVEL_COLOR } from "@/lib/healthcare-access";
import { topBestAccess, topDeserts } from "@/lib/healthcare-access-rankings";
import { MACRO_REGIONS } from "@/lib/macro-regions";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Accès aux soins en France · meilleurs hôpitaux vs. déserts médicaux 2026",
  description:
    "Classement national des villes françaises selon l'accès aux soins : médecins généralistes, spécialistes, urgences, pharmacies. Top 30 villes meilleur accès vs. top 20 désert médical. Sources DREES / CNOM / ARS.",
  alternates: { canonical: "/sante" },
  openGraph: {
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
        .join(", ")}. Ces villes cumulent généralement densité MG dégradée, urgences éloignées et spécialistes rares.`,
    },
    {
      q: "Comment ce classement est-il calculé ?",
      a: "Composite agrégeant 4 dimensions : médecins généralistes (35 %, densité DREES par dept + override CHU/métropole), spécialistes (25 %, présence CHU > grande agglo > moyenne > rural), urgences/SAU (25 %, présence dans la commune + malus montagne/île), pharmacies (15 %, maillage population × statut urbain). Score 0-10, 10 = excellent accès aux soins. Sources : DREES, CNOM, ARS.",
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
          10 = excellent accès aux soins. Filtre 10 000 habitants minimum
          pour pertinence des indicateurs départementaux.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Synthèse pédagogique</Badge>
          <Badge>4 dimensions · {CITIES_COUNT} villes</Badge>
          <Badge>Pondération MG 35 % · spé 25 % · urgences 25 % · pharma 15 %</Badge>
        </div>

        {/* Top best access */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — villes au meilleur accès aux soins
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes hébergeant un CHU, grandes agglomérations bien dotées en MG et spécialistes,
          maillage urbain dense. Score composite élevé = accès facile.
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
          Top 20 — villes en désert médical avéré
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes ≥ 10 000 hab. cumulant désert MG (DREES), spécialistes saturés et
          urgences éloignées. Score composite faible = accès difficile.
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
              densité DREES par département 2023-2024, catégorisée : désert (&lt; 80/100k +
              &gt; 50 % MG &gt; 60 ans) / sous-doté (&lt; 100/100k) / correct / bien doté
              (&gt; 145/100k ou métropole/CHU).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Spécialistes (25 %)</strong> —
              ville hébergeant un CHU (28 villes) &gt; grande agglo &gt; ville moyenne &gt; rural.
              Délais ophtalmo et dermato croissants à mesure qu&apos;on s&apos;éloigne du CHU.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Urgences/SAU (25 %)</strong> —
              présence d&apos;un Service d&apos;Accueil des Urgences dans la commune ou délai
              d&apos;accès. Malus zone de montagne (enneigement) et zone insulaire (liaisons).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Pharmacies (15 %)</strong> —
              maillage population × statut urbain. France moyenne : 1 pharmacie / 3 000 hab.
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Synthèse à l&apos;échelle communale. Le zonage précis (ZIP / ZAC) et les aides
            à l&apos;installation pour les médecins sont publiés par l&apos;ARS. La situation
            évolue rapidement avec les départs en retraite — vérifier la disponibilité MG
            sur Ameli avant un déménagement définitif.
          </p>
        </Card>

        {/* Macro-region breakdown */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Par macro-région
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          L&apos;accès aux soins varie fortement entre les métropoles bien dotées et les
          départements ruraux en désert médical. Vue restreinte à chaque grande zone.
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
        </div>
      </section>

      <Footer />
    </main>
  );
}
