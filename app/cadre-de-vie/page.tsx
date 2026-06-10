import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { QOL_LEVEL_LABEL, QOL_LEVEL_COLOR } from "@/lib/quality-of-life-index";
import { topBestQol, topWorstQol } from "@/lib/quality-of-life-index-rankings";
import { MACRO_REGIONS } from "@/lib/macro-regions";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Meilleur cadre de vie en France · index complet 2026",
  description: `Index Cadre de Vie agrégeant environnement (air, bruit, eau, risques), santé (accès aux soins), emploi (chômage, salaires, dynamisme) pour les ${CITIES_COUNT} villes françaises. Top 30 villes au meilleur cadre de vie.`,
  alternates: { canonical: "/cadre-de-vie" },
  openGraph: {
    title: "Meilleur cadre de vie en France 2026",
    description:
      "Index composite unique : environnement 35 % + santé 30 % + emploi 35 %. Top 30 villes pour vivre en France.",
  },
};

const MIN_POP = 15_000;

export default function CadreDeViePage() {
  const best = topBestQol(30, MIN_POP);
  const worst = topWorstQol(20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Cadre de vie", path: "/cadre-de-vie" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Quelles sont les villes au meilleur cadre de vie en France ?",
      a: `Selon notre Index Cadre de Vie composite (environnement 35 % + santé 30 % + emploi 35 %), les villes ≥ 15 000 hab. au meilleur score sont : ${best
        .slice(0, 5)
        .map((c) => `${c.name} (${c.qol.score}/10)`)
        .join(", ")}. Ces villes cumulent qualité environnementale, accès aux soins facile et marché du travail dynamique.`,
    },
    {
      q: "Comment l'Index Cadre de Vie est-il calculé ?",
      a: "L'index combine trois sous-indices déterministes : (1) Environnement (35 %) — agrégat qualité air, bruit, stress hydrique, risques naturels (F40-F44) ; (2) Santé (30 %) — accès aux soins MG/spé/urgences/pharma (F47) ; (3) Emploi (35 %) — chômage INSEE, dynamisme SIRENE, mix sectoriel, salaire DADS (F50). Chaque sous-indice est ramené sur 10 (10 = bon) et pondéré.",
    },
    {
      q: "Pourquoi 15 000 habitants minimum ?",
      a: "Sous ce seuil, certains indicateurs (NO2, vie nocturne, dynamisme SIRENE) sont peu pertinents et le classement deviendrait trompeur. Toutes les fiches villes restent accessibles individuellement via /villes/[slug] quelle que soit la population.",
    },
    {
      q: "Cette pondération est-elle universelle ?",
      a: "Non — c'est une moyenne « tous publics ». Un retraité valorisera davantage la santé et l'environnement (moins l'emploi). Un jeune actif valorisera l'emploi et le dynamisme. Pour un classement personnalisé, utilisez notre quiz de compatibilité.",
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
          Cadre de vie en France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Méga-index qui combine en un score unique 0-10 (10 = exceptionnel) les trois
          dimensions structurantes d&apos;une relocation : environnement (air, bruit, eau,
          risques), santé (accès aux soins) et emploi (marché du travail). Filtre 15 000
          habitants minimum pour pertinence des indicateurs urbains.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Méga-index composite</Badge>
          <Badge>3 piliers × {CITIES_COUNT} villes</Badge>
          <Badge>Pondération env 35 % · santé 30 % · emploi 35 %</Badge>
        </div>

        {/* 3 hubs */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">
          Les 3 piliers
        </h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/environnement" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-3xl mb-2">🌿</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Environnement (35 %)</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Air, bruit, eau, risques naturels</div>
            </Card>
          </Link>
          <Link href="/sante" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-3xl mb-2">🩺</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Santé (30 %)</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Médecins, spécialistes, urgences</div>
            </Card>
          </Link>
          <Link href="/emploi" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-3xl mb-2">💼</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Emploi (35 %)</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Chômage, dynamisme, salaires</div>
            </Card>
          </Link>
        </div>

        {/* Top best */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — villes au meilleur cadre de vie
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes ≥ 15 000 hab. cumulant environnement sain, accès aux soins facile et
          marché du travail dynamique. Score 0-10, 10 = cadre exceptionnel.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Région</th>
                  <th className="px-3 py-2 text-right">Cadre de vie</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Env.</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Santé</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Emploi</th>
                </tr>
              </thead>
              <tbody>
                {best.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${QOL_LEVEL_COLOR[c.qol.level]}`}>
                        {c.qol.score.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {QOL_LEVEL_LABEL[c.qol.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.qol.envScore.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.qol.healthScore.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.qol.jobScore.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Lecture des sous-scores : 10 = bon (déjà inversés depuis F44 / F47 / F50).
        </p>

        {/* Top worst */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — villes au cadre de vie le plus tendu
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes ≥ 15 000 hab. cumulant tensions sur plusieurs piliers. Souvent : ancien
          bassin industriel en reconversion avec environnement dégradé et désert médical,
          ou métropole méditerranéenne à fort chômage et air pollué.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Région</th>
                  <th className="px-3 py-2 text-right">Cadre de vie</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Env.</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Santé</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Emploi</th>
                </tr>
              </thead>
              <tbody>
                {worst.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {c.qol.score.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.qol.envScore.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.qol.healthScore.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.qol.jobScore.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Macro-region breakdown */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Par macro-région
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Le profil cadre de vie varie fortement entre la côte atlantique tempérée
          (équilibre env/emploi) et l&apos;arc méditerranéen (chômage haut compense les
          atouts climatiques). Vue restreinte à chaque grande zone.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link key={m.slug} href={`/cadre-de-vie/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Cadre de vie régional</div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Cross-links */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Personnaliser le classement
        </h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/cadre-de-vie/personnaliser" className="block">
            <Card className="hover:shadow-md transition-shadow h-full border-[var(--accent)]/40">
              <div className="text-2xl mb-1">✨</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Pondère toi-même</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">3 sliders env/santé/emploi — top 10 en direct</div>
            </Card>
          </Link>
          <Link href="/quiz-compatibilite" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🎯</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Quiz compatibilité</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Top 5 villes selon ton profil</div>
            </Card>
          </Link>
          <Link href="/pour-qui" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">👥</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Pour qui ?</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">10 profils types</div>
            </Card>
          </Link>
          <Link href="/red-flags" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🚩</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Red Flags</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">15 angles « ne pas y aller »</div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
