import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SPORT_LEVEL_LABEL, SPORT_LEVEL_COLOR } from "@/lib/sport-leisure";
import { topSportFriendly, bottomSportFriendly } from "@/lib/sport-leisure-rankings";
import { MACRO_REGIONS } from "@/lib/macro-regions";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Villes sportives en France · palmarès 2026",
  description:
    "Classement national des villes françaises selon la pratique sportive quotidienne : équipements, cadre outdoor, vie associative, climat. Top 30 villes les plus sportives vs. top 20 les moins propices.",
  alternates: { canonical: "/sport" },
  openGraph: {
    title: "Villes sportives en France 2026",
    description:
      "Top 30 villes où la pratique sportive est facile vs. top 20 où elle reste contraignante. INJEP · RES · CREPS · DRAJES.",
  },
};

const MIN_POP = 15_000;

export default function SportHubPage() {
  const best = topSportFriendly(30, MIN_POP);
  const worst = bottomSportFriendly(20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Sport & loisirs", path: "/sport" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Quelles sont les villes les plus sportives de France ?",
      a: `Selon notre composite F70 (équipements, outdoor, clubs, climat), les villes ≥ 15 000 hab. les plus propices à la pratique sportive régulière sont : ${best
        .slice(0, 5)
        .map((c) => `${c.name} (${c.sport.composite}/10)`)
        .join(", ")}. Toutes cumulent maillage municipal dense, cadre naturel exploitable et tissu associatif vivant.`,
    },
    {
      q: "Quelles villes sont les moins propices au sport ?",
      a: `Les villes ≥ 15 000 hab. au composite le plus bas sont : ${worst
        .slice(0, 5)
        .map((c) => `${c.name} (${c.sport.composite}/10)`)
        .join(", ")}. Elles cumulent généralement maillage d'équipements limité, cadre naturel peu varié et climat contrasté.`,
    },
    {
      q: "Comment ce classement est-il calculé ?",
      a: "Composite agrégeant 4 dimensions : équipements (35 %, RES INJEP + bonus CREPS / INSEP), cadre outdoor (30 %, montagne / mer / forêt / lac), vie associative (20 %, densité clubs + identité régionale), climat (15 %, soleil + chaleur estivale + froid hivernal). Score 0-10, 10 = excellent. Sources : INJEP, RES, sports.gouv.fr, CREPS, DRAJES, FFRandonnée.",
    },
    {
      q: "Où voir le RES officiel ?",
      a: "Le Recensement des Équipements Sportifs (equipements.sports.gouv.fr) publie la carte officielle des piscines, stades, salles couvertes et terrains de pratique commune par commune. data.gouv.fr met le jeu de données complet à disposition. Pour les pôles élite, voir le réseau CREPS et l'INSEP.",
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
          Villes sportives en France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Index composite agrégeant quatre dimensions clés de la pratique sportive
          régulière : équipements municipaux, cadre outdoor, vie associative et climat
          propice. Score 0-10, 10 = excellent. Filtre 15 000 habitants minimum pour
          pertinence des indicateurs.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Synthèse pédagogique</Badge>
          <Badge>4 dimensions · {CITIES_COUNT} villes</Badge>
          <Badge>Pondération équipements 35 % · outdoor 30 % · clubs 20 % · climat 15 %</Badge>
        </div>

        {/* Top sportive */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — villes les plus sportives
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes cumulant pôle d&apos;excellence (CREPS / INSEP), tissu associatif
          dense, cadre naturel exploitable et climat propice à l&apos;activité régulière.
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Équip.</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Outdoor</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Clubs</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Climat</th>
                </tr>
              </thead>
              <tbody>
                {best.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/sport`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${SPORT_LEVEL_COLOR[c.sport.level]}`}>
                        {c.sport.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {SPORT_LEVEL_LABEL[c.sport.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.sport.facilities.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.sport.outdoor.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.sport.clubs.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.sport.climate.score.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Lecture : 10 = idéal pour la pratique sportive régulière. Score &gt; 7 = ville
          profondément sportive (terrain de jeu complet).
        </p>

        {/* Worst */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — villes les moins propices au sport
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes ≥ 15 000 hab. cumulant équipements limités, cadre naturel monotone
          et tissu associatif fragile. La pratique reste possible mais nécessite
          déplacement ou installation privée.
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Équip.</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Outdoor</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Clubs</th>
                </tr>
              </thead>
              <tbody>
                {worst.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/sport`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {c.sport.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.sport.facilities.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.sport.outdoor.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.sport.clubs.score.toFixed(1)}</td>
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
              <strong className="text-[var(--text-primary)]">Équipements (35 %)</strong> —
              proxy dérivé du Recensement des Équipements Sportifs INJEP (piscines,
              stades, salles couvertes, terrains polyvalents) corrélé à la population et
              au statut métropolitain. Bonus pôle d&apos;excellence (CREPS Vichy / Talence
              / Strasbourg / Châtenay-Malabry / Nantes / Poitiers, INSEP Vincennes, ENVSN
              Saint-Pierre-Quiberon, stations élite Tignes / Val d&apos;Isère, etc.).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Cadre outdoor (30 %)</strong> —
              cumul des terrains de jeu naturels accessibles : montagne (Alpes, Pyrénées,
              Massif Central, Vosges, Jura, Corse), façade côtière (Manche, Atlantique,
              Méditerranée, DROM), massif forestier majeur, lac alpin ou fleuve navigable.
              Au moins deux atouts cumulés = score &gt; 8/10.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Vie associative (20 %)</strong> —
              densité du tissu sportif. Bonus départements à identité sportive marquée
              (Pays Basque, Auvergne-Rhône-Alpes, Bretagne, PACA, Sud-Ouest rugby).
              Malus rural ultra-isolé Centre/Est en déprise (Creuse, Cantal, Lozère…) et
              DROM les plus tendus (Mayotte, Guyane).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Climat (15 %)</strong> —
              ensoleillement annuel + température hivernale + température estivale. Bonus
              arc méditerranéen et façade atlantique sud (saison sportive quasi-annuelle).
              Malus canicule (juillet &gt; 27 °C en moyenne) et hivers très froids.
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Score à l&apos;échelle communale. L&apos;expérience dépend aussi du quartier
            (proximité d&apos;un complexe ou non) et de la discipline pratiquée. Pour
            l&apos;offre détaillée commune par commune, consulter la carte officielle
            sur{" "}
            <a href="https://equipements.sports.gouv.fr" target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline">
              equipements.sports.gouv.fr
            </a>
            .
          </p>
        </Card>

        {/* Macro-region breakdown */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Par macro-région
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          La praticabilité sportive varie fortement entre l&apos;arc alpin (cadre outdoor
          exceptionnel) et l&apos;Île-de-France élargie (équipements denses mais cadre
          naturel limité). Vue restreinte à chaque grande zone géographique.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link key={m.slug} href={`/sport/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Top sportives + moins propices</div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Cross-links */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Voir aussi
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/velo" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🚲</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Mobilité vélo</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Cyclabilité quotidienne</div>
            </Card>
          </Link>
          <Link href="/cadre-de-vie" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🌿</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Cadre de vie</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Méga-index env + santé + emploi</div>
            </Card>
          </Link>
          <Link href="/palmares" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Palmarès synthèse 8 axes</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Classement national universel</div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
