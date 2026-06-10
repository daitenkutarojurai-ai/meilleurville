import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ENV_LEVEL_LABEL, ENV_LEVEL_COLOR } from "@/lib/environment-index";
import { topHealthiest, topMostStressed } from "@/lib/environment-index-rankings";
import { MACRO_REGIONS } from "@/lib/macro-regions";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Villes les plus saines de France · index environnemental 2026",
  description:
    "Classement national des villes françaises selon leur santé environnementale : qualité de l'air, bruit, stress hydrique, risques naturels. Top 30 villes les plus saines + top 20 villes les plus exposées. Méthodologie publique.",
  alternates: { canonical: "/environnement" },
  openGraph: {
    title: "Villes les plus saines de France · index environnemental",
    description:
      "Top 30 villes les plus saines vs. top 20 les plus exposées. 4 dimensions ATMO, OMS, BRGM, Géorisques.",
  },
};

const MIN_POP = 15_000;

export default function EnvironmentHubPage() {
  const healthiest = topHealthiest(30, MIN_POP);
  const mostStressed = topMostStressed(20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Environnement", path: "/environnement" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Quelles sont les villes les plus saines de France en 2026 ?",
      a: `Selon notre index environnemental composite (qualité de l'air, bruit, stress hydrique, risques naturels), les communes les plus saines parmi celles de plus de 15 000 habitants sont : ${healthiest
        .slice(0, 5)
        .map((c) => `${c.name} (${c.index.healthScore}/10)`)
        .join(", ")}.`,
    },
    {
      q: "Quelles villes cumulent le plus de tensions environnementales ?",
      a: `Les communes affichant l'exposition cumulée la plus marquée sont : ${mostStressed
        .slice(0, 5)
        .map((c) => `${c.name} (stress ${c.index.stressComposite}/10)`)
        .join(", ")}. Ces villes cumulent souvent forte pollution atmosphérique, exposition routière/aérienne et stress hydrique méditerranéen.`,
    },
    {
      q: "Comment l'index environnemental est-il calculé ?",
      a: "L'index agrège quatre dimensions déterministes : qualité de l'air (ATMO, CITEPA, RNSA — pondération 30 %), bruit (CBS, PEB, Bruitparif — 25 %), stress hydrique (Propluvia, BRGM — 25 %), risques naturels (Géorisques, BRGM, BCSF — 20 %). Le score « santé environnementale » 0-10 est l'inverse du composite de stress.",
    },
    {
      q: "Le seuil minimal de 15 000 habitants concerne-t-il toutes les villes ?",
      a: "Oui : sous ce seuil, certains indicateurs (NO2, vie nocturne) sont peu pertinents et le classement deviendrait trompeur. Toutes les fiches villes restent accessibles via leurs sous-pages /air, /bruit, /eau, /risques quelle que soit la population.",
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
          Villes les plus saines de France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Index composite agrégeant quatre dimensions environnementales déterministes : qualité
          de l&apos;air (ATMO), bruit (CBS / Bruitparif), stress hydrique (Propluvia / BRGM)
          et risques naturels (Géorisques). Score 0-10, 10 = environnement le plus sain.
          Filtre : 15 000 habitants minimum pour pertinence des indicateurs urbains.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Synthèse pédagogique</Badge>
          <Badge>4 dimensions · {CITIES_COUNT} villes</Badge>
          <Badge>Pondération air 30 % · bruit 25 % · eau 25 % · risques 20 %</Badge>
        </div>

        {/* Top healthiest */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — villes les plus saines
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes de plus de 15 000 habitants au score « santé environnementale » le plus
          élevé. Pour la plupart : moyenne montagne ou littoral atlantique tempéré, faible
          densité industrielle, peu d&apos;axes routiers majeurs.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Région</th>
                  <th className="px-3 py-2 text-right">Santé env.</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Air</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Bruit</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Eau</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Risques</th>
                </tr>
              </thead>
              <tbody>
                {healthiest.map((c, i) => (
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
                      <span className={`font-bold tabular-nums ${ENV_LEVEL_COLOR[c.index.level]}`}>
                        {c.index.healthScore.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {ENV_LEVEL_LABEL[c.index.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.index.air.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.index.bruit.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.index.eau.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.index.risques.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Lecture des sous-scores : 10 = exposition maximale (donc pire), 0 = absent.
        </p>

        {/* Most stressed */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — villes les plus exposées
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes cumulant l&apos;exposition environnementale la plus élevée sur les
          4 dimensions. Souvent : grandes métropoles à fort trafic, vallées encaissées
          sujettes à l&apos;inversion thermique, agglomérations sous couloir aérien, ou
          départements méditerranéens cumulant chaleur, sécheresse et feux.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Région</th>
                  <th className="px-3 py-2 text-right">Stress</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Air</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Bruit</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Eau</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Risques</th>
                </tr>
              </thead>
              <tbody>
                {mostStressed.map((c, i) => (
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
                        {c.index.stressComposite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.index.air.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.index.bruit.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.index.eau.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.index.risques.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Methodology */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Méthodologie
        </h2>
        <Card className="mt-3">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Air (30 %)</strong> — agrégat
              NO2, PM2.5, ozone, pollens. Voir{" "}
              <Link href={`/villes/${healthiest[0].slug}/air`} className="text-[var(--accent)] hover:underline">
                la sous-page air d&apos;une ville
              </Link>{" "}
              pour le détail. Sources : ATMO, CITEPA, RNSA.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Bruit (25 %)</strong> —
              routier, aérien, ferroviaire, nocturne. Sources : Cartes de Bruit Stratégiques
              (CBS), plans d&apos;exposition au bruit (PEB) DGAC, Bruitparif IDF.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Eau (25 %)</strong> — restrictions
              sécheresse (Propluvia 2022-2024), nappes phréatiques (BRGM 2022-2025),
              sécheresse climatique, alimentation eau potable.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Risques (20 %)</strong> —
              inondation, sismicité (zonage 2011), retrait-gonflement argile (BRGM), feux
              de forêt (ONF/ECASC). Toujours croiser avec Géorisques pour le PPRI précis.
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Ce score n&apos;a pas vocation à remplacer un diagnostic technique. Il
            synthétise des aléas à l&apos;échelle communale et oriente la lecture des
            sous-pages détaillées par ville. Pondération choisie pour refléter l&apos;impact
            sanitaire OMS (air et bruit en tête).
          </p>
        </Card>

        {/* Macro-region breakdown */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Par macro-région
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Le profil environnemental varie fortement entre la côte atlantique tempérée et
          l&apos;arc méditerranéen chaud. Vue restreinte à chaque grande zone géographique.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link key={m.slug} href={`/environnement/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Top villes saines + plus exposées</div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Cross-links */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Le quartet environnement par ville
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["air", "bruit", "eau", "risques"] as const).map((sub) => (
            <Link key={sub} href={`/villes/${healthiest[0].slug}/${sub}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full text-center">
                <div className="text-2xl mb-2">
                  {sub === "air" ? "🌬️" : sub === "bruit" ? "🔊" : sub === "eau" ? "💧" : "⚠️"}
                </div>
                <div className="text-sm font-semibold text-[var(--text-primary)] capitalize">
                  {sub === "risques" ? "Risques naturels" : sub === "eau" ? "Stress hydrique" : sub === "air" ? "Qualité de l'air" : "Bruit"}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">
                  Ex : {healthiest[0].name}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
