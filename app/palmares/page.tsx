import type { Metadata } from "next";
import { CITIES_LIGHT } from "@/lib/cities-light";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  topSynthesisGlobal,
  bottomSynthesisGlobal,
  SYNTHESIS_LEVEL_LABEL,
  SYNTHESIS_LEVEL_COLOR,
} from "@/lib/city-synthesis";
import { MACRO_REGIONS } from "@/lib/macro-regions";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Palmarès national 2026 · Meilleur cadre de vie en France",
  description: `Classement national unifié des ${CITIES_COUNT} villes françaises sur les 8 dimensions data du site (environnement, santé, emploi, cadre de vie, vélo, sécurité, démographie, services publics). Top 30 profils les plus favorables vs. top 20 plus tendus.`,
  alternates: { canonical: "/palmares" },
  openGraph: {
    title: "Palmarès national · meilleur cadre de vie 2026",
    description:
      "Classement universel agrégeant les 8 clusters data du site. Top 30 profils favorables vs. top 20 tendus.",
  },
};

const MIN_POP = 15_000;

export default function PalmaresHubPage() {
  const top = topSynthesisGlobal(CITIES_LIGHT, 30, MIN_POP);
  const bottom = bottomSynthesisGlobal(CITIES_LIGHT, 20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Palmarès", path: "/palmares" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Quelles villes françaises ont le meilleur profil global toutes dimensions ?",
      a: `Selon la synthèse F61 (moyenne arithmétique des 8 composites normalisés vers « 10 = excellent »), les villes ≥ 15 000 hab. au profil le plus favorable sont : ${top
        .slice(0, 5)
        .map((c) => `${c.name} (${c.synthesis.global}/10)`)
        .join(", ")}.`,
    },
    {
      q: "Quelles villes sont en tension globale toutes dimensions ?",
      a: `Les villes ≥ 15 000 hab. au global le plus bas sont : ${bottom
        .slice(0, 5)
        .map((c) => `${c.name} (${c.synthesis.global}/10)`)
        .join(", ")}. Elles cumulent généralement tensions sur plusieurs axes (santé, emploi, services publics, démographie).`,
    },
    {
      q: "Comment ce classement est-il calculé ?",
      a: "Moyenne arithmétique des 8 composites des clusters data du site (F44 environnement, F47 santé, F50 emploi, F52 cadre de vie, F57 vélo, F58 sécurité, F59 démographie, F60 services publics). Tous les axes sont normalisés vers une convention « 10 = excellent ». Calcul déterministe et reproductible.",
    },
    {
      q: "Qu'est-ce que la cohérence (écart-type) ?",
      a: "L'écart-type entre les 8 axes mesure si le profil est uniforme (≤ 1,2 = cohérent) ou contrasté (≥ 2 = forces et tensions très marquées). Une ville moyenne partout est différente d'une ville excellente sur 4 dimensions et tendue sur 4 autres — la moyenne ne dit pas tout.",
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
          Palmarès national — meilleur cadre de vie toutes dimensions
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Classement universel agrégeant les 8 composites data du site
          (environnement, santé, emploi, cadre de vie, vélo, sécurité, démographie,
          services publics) en un score unifié 0-10, 10 = excellent. Filtre 15 000
          habitants minimum.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>8 axes unifiés</Badge>
          <Badge>{CITIES_COUNT} villes synthétisées</Badge>
          <Badge>Moyenne arithmétique normalisée</Badge>
        </div>

        {/* F64 — Quiz personnalisé cross-link */}
        <Link
          href="/palmares/personnaliser"
          className="mt-6 block rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 hover:border-[var(--accent)] hover:shadow-md transition-all p-5 group"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                ✨ Personnalise ton palmarès — pondère les 8 axes
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                8 sliders 1-5 · recompute en direct · top 10 perso · lien partageable
              </div>
            </div>
            <span className="shrink-0 text-[var(--accent)] text-sm font-semibold">→</span>
          </div>
        </Link>

        {/* Top 30 */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — profils globaux les plus favorables
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Villes ≥ 15 000 hab. au global synthèse le plus élevé. Le score traduit
          la moyenne sur 8 dimensions ; la colonne « cohérence » indique si le
          profil est uniforme ou contrasté (écart-type entre axes).
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Région</th>
                  <th className="px-3 py-2 text-right">Global</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Cohérence</th>
                  <th className="px-3 py-2 text-left hidden md:table-cell">Force #1</th>
                  <th className="px-3 py-2 text-left hidden md:table-cell">Tension #1</th>
                </tr>
              </thead>
              <tbody>
                {top.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/synthese`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${SYNTHESIS_LEVEL_COLOR[c.synthesis.level]}`}>
                        {c.synthesis.global.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {SYNTHESIS_LEVEL_LABEL[c.synthesis.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                      ±{c.synthesis.spread.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] hidden md:table-cell text-xs">
                      {c.synthesis.strengths[0]?.label} {c.synthesis.strengths[0]?.score.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] hidden md:table-cell text-xs">
                      {c.synthesis.tensions[0]?.label} {c.synthesis.tensions[0]?.score.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Lecture : score global = moyenne arithmétique des 8 axes (convention 10 = excellent).
          Cohérence = écart-type entre les 8 axes. Score ≥ 7 + cohérence ≤ 1,2 = profil très favorable
          et homogène.
        </p>

        {/* Bottom 20 */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — profils globaux les plus tendus
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Villes ≥ 15 000 hab. au global le plus bas. Cumulent généralement tensions
          sur plusieurs axes — souvent santé + emploi + services publics + démographie
          (« quadruple peine » de la ruralité ou des bassins industriels en reconversion).
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Région</th>
                  <th className="px-3 py-2 text-right">Global</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Cohérence</th>
                  <th className="px-3 py-2 text-left hidden md:table-cell">Tension #1</th>
                </tr>
              </thead>
              <tbody>
                {bottom.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/synthese`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {c.synthesis.global.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                      ±{c.synthesis.spread.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] hidden md:table-cell text-xs">
                      {c.synthesis.tensions[0]?.label} {c.synthesis.tensions[0]?.score.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Methodology */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">Méthodologie</h2>
        <Card className="mt-3">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
            Le palmarès agrège les 8 composites des clusters data du site sur une
            convention unifiée <strong className="text-[var(--text-primary)]">10 = excellent</strong>.
            Les clusters d&apos;origine « 10 = pire » (santé, emploi, sécurité,
            démographie, services publics) sont inversés via <code className="px-1 mx-0.5 rounded bg-[var(--bg-elevated)] text-xs">10 − composite</code>.
            Environnement (F44) utilise directement <code className="px-1 mx-0.5 rounded bg-[var(--bg-elevated)] text-xs">healthScore</code>
            (déjà orienté positif). Vélo (F57) et Cadre de vie (F52) sont natifs positifs.
          </p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
            <strong className="text-[var(--text-primary)]">Score global :</strong> moyenne
            arithmétique des 8 axes (chacun ayant déjà sa propre pondération interne
            documentée sur sa sous-page). Pas de pondération supplémentaire entre clusters —
            choix éditorial neutre. Pour pondérer par préférence, voir le quiz F55
            « personnalise ton Cadre de Vie ».
          </p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)]">Cohérence (écart-type) :</strong>{" "}
            mesure l&apos;homogénéité du profil. ≤ 1,2 = profil très cohérent ; ≥ 2 = profil
            très contrasté (force majeure et tension marquée simultanément). Utile pour
            distinguer « moyen partout » de « excellent sur 4 et tendu sur 4 ».
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Calcul déterministe, reproductible. Sources de chaque cluster documentées
            sur la sous-page dédiée. Aucun chiffre inventé.
          </p>
        </Card>

        {/* Macro-region breakdown */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Par macro-région
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Le palmarès oppose la côte atlantique attractive et l&apos;arc méditerranéen
          ensoleillé aux bassins industriels du Nord et au Centre rural en décroissance.
          Vue restreinte à chaque zone.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link key={m.slug} href={`/palmares/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Top favorables + tendus</div>
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
          <Link href="/cadre-de-vie/personnaliser" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">✨</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Pondère toi-même</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Quiz cadre de vie personnalisé</div>
            </Card>
          </Link>
          <Link href="/red-flags/villes-embouteillages-quotidiens" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🚥</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Villes bloquées aux heures de pointe</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Le prix caché du palmarès : 300 h/an au volant</div>
            </Card>
          </Link>
          <Link href="/red-flags/villes-erosion-cotiere" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🌊</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Villes en péril côtier</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Recul du trait de côte et submersion — ce que la vue mer cache</div>
            </Card>
          </Link>
          <Link href="/red-flags/villes-manque-de-verdure" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🌵</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Villes où la verdure manque</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Bassins urbains ≥ 30 000 hab. sans parc à pied ni ceinture verte accessible</div>
            </Card>
          </Link>
          <Link href="/red-flags/villes-parking-cauchemar" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🅿️</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Villes où se garer épuise</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Centre historique + littoral + tourisme = 25 min de tournée pour rentrer chez soi</div>
            </Card>
          </Link>
          <Link href="/red-flags" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">⚠️</div>
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
