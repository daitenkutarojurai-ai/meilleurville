// Hub Synthèse 8 axes.
//
// Landing page qui surface l'ensemble de la pyramide synthèse (F61-F67)
// en un seul écran. Cinq niveaux géographiques + comparer + personnaliser
// + méthodologie. Évite que ces sous-pages restent enfouies dans les
// fiches villes / régions / dept.

import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { METRO_REGIONS, REGION_EMOJIS, regionToSlug } from "@/lib/regions";
import { MACRO_REGIONS } from "@/lib/macro-regions";
import {
  topSynthesisGlobal,
  computeRegionAverageSynthesis,
  SYNTHESIS_LEVEL_LABEL,
  SYNTHESIS_LEVEL_COLOR,
} from "@/lib/city-synthesis";
import { CITIES_COUNT, DEPARTMENTS_COUNT, REGIONS_COUNT } from "@/lib/site-stats";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Synthèse 8 axes · palmarès et comparatifs | MaVilleIdeal",
  description: `Système synthèse : 8 axes data (env / santé / emploi / cadre / vélo / sécurité / démo / services publics) unifiés sur ${CITIES_COUNT} villes, ${DEPARTMENTS_COUNT} départements, ${REGIONS_COUNT} régions, 6 macro-régions, palmarès national. Comparer 2 villes ou 2 régions, palmarès personnalisé.`,
  alternates: { canonical: "/synthese" },
  openGraph: {
    title: "Synthèse 8 axes · MaVilleIdeal",
    description: "Un système, 8 axes, 5 niveaux géographiques. Tout pour comparer une ville, un département, une région ou la France entière.",
  },
};

function getDeptCount(): number {
  return new Set(CITIES_SEED.map((c) => c.department)).size;
}

export default function SyntheseHubPage() {
  const top5Cities = topSynthesisGlobal(5, 15000);
  const top5Regions = METRO_REGIONS.map((r) => computeRegionAverageSynthesis(r))
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.global - a.global)
    .slice(0, 5);

  const deptCount = getDeptCount();

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Synthèse 8 axes", path: "/synthese" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Qu'est-ce que la synthèse 8 axes ?",
      a: `Système unifié qui agrège 8 composites des clusters data du site (environnement, santé, emploi, cadre de vie, vélo, sécurité, démographie, services publics) sur une convention unique « 10 = excellent ». Permet une lecture rapide et comparable de n'importe quelle ville, département, région, macro-région ou de la France entière.`,
    },
    {
      q: "Quels niveaux géographiques sont couverts ?",
      a: `Cinq niveaux : (1) ville (${CITIES_COUNT} fiches /villes/[slug]/synthese), (2) département (${deptCount} fiches /departements/[dept]/synthese), (3) région administrative (${METRO_REGIONS.length} fiches métropole + DROM /regions/[r]/synthese), (4) macro-région éditoriale (${MACRO_REGIONS.length} palmarès /palmares/[macro]), (5) national (/palmares).`,
    },
    {
      q: "Comment comparer deux villes ou deux régions ?",
      a: `Comparaison ville↔ville : /comparer/[a]-vs-[b]/synthese (614 paires curées). Comparaison région↔région : /comparer-regions/[a]-vs-[b]/synthese (78 paires). Verdict automatique axe par axe avec seuil ±0,3 pt.`,
    },
    {
      q: "Puis-je personnaliser la pondération des 8 axes ?",
      a: `Oui — /palmares/personnaliser : 8 sliders 1-5 pour pondérer chaque axe selon les priorités personnelles, recompute en direct du top 10 villes ≥ 15 000 hab. URL partageable qui restaure les poids exacts.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link>
        </nav>

        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
          Synthèse 8 axes
        </h1>
        <p className="mt-4 text-base text-[var(--text-secondary)] max-w-3xl">
          Un système unifié, huit dimensions data, cinq niveaux géographiques.
          Environnement, santé, emploi, cadre de vie, vélo, sécurité, démographie,
          services publics — tous normalisés sur la même échelle (10 = excellent)
          pour comparer une ville, un département, une région ou la France entière
          sans surprise.
        </p>

        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          <Badge>{CITIES_COUNT} villes</Badge>
          <Badge>{deptCount} départements</Badge>
          <Badge>{METRO_REGIONS.length} régions</Badge>
          <Badge>{MACRO_REGIONS.length} macro-régions</Badge>
          <Badge>8 axes data</Badge>
        </div>

        {/* La pyramide */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Cinq niveaux géographiques
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-3xl">
          Le même score, agrégé à différentes granularités. Plus on descend, plus
          c&apos;est précis ; plus on monte, plus c&apos;est comparatif.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link href="/villes" className="block">
            <Card className="hover:shadow-md transition-shadow h-full border-[var(--accent)]/30 bg-[var(--accent)]/5">
              <div className="text-xs uppercase tracking-wide text-[var(--accent)] font-semibold">
                Niveau 1 · Granularité maximale
              </div>
              <div className="text-base font-bold text-[var(--text-primary)] mt-1">
                Synthèse par ville
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                {CITIES_COUNT} fiches /villes/[slug]/synthese. Score global, cohérence ±,
                forces, tensions, signature narrative.
              </div>
            </Card>
          </Link>
          <Link href="/departements" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">
                Niveau 2 · INSEE
              </div>
              <div className="text-base font-bold text-[var(--text-primary)] mt-1">
                Synthèse par département
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                {deptCount} palmarès /departements/[dept]/synthese. Profil moyen + top villes
                + plus tendues.
              </div>
            </Card>
          </Link>
          <Link href="/regions" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">
                Niveau 3 · Administratif
              </div>
              <div className="text-base font-bold text-[var(--text-primary)] mt-1">
                Synthèse par région
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                18 palmarès /regions/[r]/synthese (métropole + DROM). Profil moyen, top 20,
                zoom département.
              </div>
            </Card>
          </Link>
          <Link href="/palmares" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">
                Niveau 4 · Éditorial
              </div>
              <div className="text-base font-bold text-[var(--text-primary)] mt-1">
                Macro-régions
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                {MACRO_REGIONS.length} zones transrégionales /palmares/[macro] (côte atlantique,
                arc méditerranéen, arc alpin, sud-ouest gascon, vallée du Rhône, IDF élargie).
              </div>
            </Card>
          </Link>
          <Link href="/palmares" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">
                Niveau 5 · National
              </div>
              <div className="text-base font-bold text-[var(--text-primary)] mt-1">
                Palmarès France
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                /palmares. Top 30 profils les plus favorables + top 20 les plus tendus,
                filtre 15 000 hab.
              </div>
            </Card>
          </Link>
          <Link href="/palmares/personnaliser" className="block">
            <Card className="hover:shadow-md transition-shadow h-full border-[var(--accent)]/30 bg-[var(--accent)]/5">
              <div className="text-xs uppercase tracking-wide text-[var(--accent)] font-semibold">
                Pondération · Toi
              </div>
              <div className="text-base font-bold text-[var(--text-primary)] mt-1">
                Palmarès personnalisé
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                8 sliders 1-5, recompute du top 10 en direct. URL partageable qui restaure
                les poids exacts.
              </div>
            </Card>
          </Link>
        </div>

        {/* Comparer */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Comparer côte à côte
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-3xl">
          Verdict automatique axe par axe, seuil d&apos;écart significatif fixé à
          ±0,3 pt. Aucun mélange entre les conventions des sous-scores : tout est
          déjà normalisé.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/comparer" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">
                614 paires curées
              </div>
              <div className="text-base font-bold text-[var(--text-primary)] mt-1">
                Comparer 2 villes en synthèse
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                /comparer/[a]-vs-[b]/synthese. Hero 2 cartes scores globaux, table axe par axe,
                cross-links vers les fiches détaillées.
              </div>
            </Card>
          </Link>
          <Link href="/comparer-regions" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">
                78 paires
              </div>
              <div className="text-base font-bold text-[var(--text-primary)] mt-1">
                Comparer 2 régions en synthèse
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                /comparer-regions/[a]-vs-[b]/synthese. Profils moyens régionaux confrontés,
                verdict par delta.
              </div>
            </Card>
          </Link>
        </div>

        {/* Live preview : top 5 villes + top 5 régions */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Aperçu — top 5
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-3xl">
          Calculé à la build sur la synthèse globale. Plein palmarès sur{" "}
          <Link href="/palmares" className="text-[var(--accent)] hover:underline">/palmares</Link>.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Top 5 villes */}
          <Card className="overflow-hidden p-0">
            <div className="px-4 py-3 bg-[var(--bg-elevated)] border-b border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Top 5 villes (≥ 15 000 hab.)
              </h3>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {top5Cities.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)] first:border-t-0">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums w-8">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/synthese`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                      <div className="text-[10px] text-[var(--text-tertiary)]">{c.region}</div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`font-bold tabular-nums ${SYNTHESIS_LEVEL_COLOR[c.synthesis.level]}`}
                      >
                        {c.synthesis.global.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {SYNTHESIS_LEVEL_LABEL[c.synthesis.level]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Top 5 régions */}
          <Card className="overflow-hidden p-0">
            <div className="px-4 py-3 bg-[var(--bg-elevated)] border-b border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Top 5 régions (profil moyen)
              </h3>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {top5Regions.map((r, i) => (
                  <tr key={r.region} className="border-t border-[var(--border)] first:border-t-0">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums w-8">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/regions/${regionToSlug(r.region)}/synthese`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        <span className="mr-1">{REGION_EMOJIS[r.region] ?? "📍"}</span>
                        {r.region}
                      </Link>
                      <div className="text-[10px] text-[var(--text-tertiary)]">
                        {r.cityCount} villes
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`font-bold tabular-nums ${SYNTHESIS_LEVEL_COLOR[r.level]}`}
                      >
                        {r.global.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        ±{r.spread.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Méthodologie */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">Méthodologie</h2>
        <Card className="mt-3">
          <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-disc pl-5">
            <li>
              <strong className="text-[var(--text-primary)]">Convention unifiée</strong> :
              tous les axes sont normalisés vers « 10 = excellent », même les clusters dont
              la convention native est inversée (santé, emploi, sécurité,
              démographie, services publics).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Score global</strong> :
              moyenne arithmétique simple des 8 axes par ville. À l&apos;échelle
              dept/région, on calcule la moyenne sur les villes du seed appartenant
              au territoire, puis on moyenne les 8 axes.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Cohérence ±</strong> :
              écart-type entre les 8 axes — proxy de l&apos;uniformité du profil.
              Score global 7/10 avec cohérence ±0,5 (profil régulier) ≠ 7/10 avec
              cohérence ±2,5 (forces et tensions marquées).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Verdict comparatif</strong> :
              écart significatif fixé à ±0,3 pt par axe. Sous ce seuil, l&apos;axe est
              considéré équivalent.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Sources</strong> :
              voir la page{" "}
              <Link href="/methode" className="text-[var(--accent)] hover:underline">
                méthodologie
              </Link>{" "}
              et{" "}
              <Link href="/donnees" className="text-[var(--accent)] hover:underline">
                données & sources
              </Link>{" "}
              pour le détail par cluster.
            </li>
          </ul>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">Aller plus loin</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/cadre-de-vie" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Méga-index Cadre de vie
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Synthèse à 3 piliers (env / santé / emploi)
              </div>
            </Card>
          </Link>
          <Link href="/classements" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Tous les classements
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Owner-scores, niches, sous-cotées
              </div>
            </Card>
          </Link>
          <Link href="/city-match" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Trouver ma ville (quiz)
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Match qualitatif sur ton profil
              </div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
