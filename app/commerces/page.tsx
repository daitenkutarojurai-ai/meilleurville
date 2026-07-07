import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  topBestCommerce,
  topWorstCommerce,
  COMMERCE_LEVEL_LABEL,
  COMMERCE_LEVEL_COLOR,
} from "@/lib/commerce";
import { CITIES_LIGHT } from "@/lib/cities-light";
import { MACRO_REGIONS } from "@/lib/macro-regions";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Couverture commerciale · palmarès villes 2026",
  description:
    "Où l'offre commerciale est la plus dense et où la dévitalisation gagne. Top 30 villes les mieux couvertes vs top 20 en tension (INSEE BPE, Procos, Action Cœur de Ville).",
  alternates: { canonical: "/commerces" },
  openGraph: {
    title: "Couverture commerciale · palmarès villes 2026",
    description:
      "Top 30 villes les mieux fournies en commerces vs top 20 où l'offre reste limitée. Couverture, proximité, grandes surfaces, vitalité du centre-ville.",
  },
};

const MIN_POP = 15_000;

export default function CommercesHubPage() {
  const best = topBestCommerce(CITIES_LIGHT, 30, MIN_POP);
  const worst = topWorstCommerce(CITIES_LIGHT, 20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Couverture commerciale", path: "/commerces" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Quelles sont les villes les mieux couvertes en commerces en France ?",
      a: `Les villes ≥ 15 000 hab. au score de couverture commerciale le plus élevé sont : ${best
        .slice(0, 5)
        .map((e) => `${e.city.name} (${e.commerce.composite.toFixed(1)}/10)`)
        .join(
          ", ",
        )}. Score 0-10 dérivé de quatre dimensions (densité/diversité, marchés & proximité, grandes surfaces, vitalité du centre-ville). 10 = couverture excellente.`,
    },
    {
      q: "Où l'offre commerciale est-elle la plus limitée en France ?",
      a: `Les villes ≥ 15 000 hab. les plus fragiles côté commerces sont : ${worst
        .slice(0, 5)
        .map((e) => `${e.city.name} (${e.commerce.composite.toFixed(1)}/10)`)
        .join(
          ", ",
        )}. Souvent des villes moyennes (20-60 k hab.) sans atout patrimonial ou touristique — profil cible du programme Action Cœur de Ville (ANCT) pour lutter contre la vacance commerciale.`,
    },
    {
      q: "Comment ce score de couverture commerciale est-il calculé ?",
      a: "Score 0-10 (10 = couverture excellente) qui combine quatre dimensions : couverture globale (35 %, densité/diversité corrélée à la population), marchés & proximité (25 %, tissu d'indépendants et gastronomie), grandes surfaces (15 %, pôles de distribution périphériques), vitalité du centre-ville (25 %, proxy de la vacance commerciale). Dérivé du profil de la ville, pas d'un décompte terrain.",
    },
    {
      q: "Pourquoi un filtre de 15 000 habitants ?",
      a: `Sous 15 000 habitants, l'offre commerciale est structurellement limitée et dépend fortement du pôle voisin — la comparaison entre communes de tailles très différentes perd son sens. Le palmarès national est donc restreint aux communes significatives ; les fiches par ville couvrent les ${CITIES_COUNT} communes du référentiel.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumb)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faq)}
      />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">
            Accueil
          </Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Couverture commerciale en France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Où l&apos;offre commerciale est dense et diversifiée, et où la
          dévitalisation gagne. Score 0-10 (10 = couverture excellente) calculé à
          partir de quatre dimensions : densité & diversité, marchés & proximité,
          grandes surfaces périphériques, vitalité du centre-ville. Filtre 15 000
          habitants minimum pour la fiabilité du palmarès.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Sources : INSEE BPE, Procos, Action Cœur de Ville</Badge>
          <Badge>{CITIES_COUNT} villes référencées</Badge>
          <Badge>Proxy honnête · pas de décompte terrain</Badge>
        </div>

        {/* Best coverage */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — villes les mieux fournies en commerces
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes ≥ 15 000 hab. au score le plus élevé. Souvent : grandes
          métropoles, préfectures dynamiques, centres touristiques à fort
          patrimoine, villes moyennes à identité gastronomique ou marchande
          affirmée.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Région</th>
                  <th className="px-3 py-2 text-right">Score</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">
                    Niveau
                  </th>
                </tr>
              </thead>
              <tbody>
                {best.map((e, i) => (
                  <tr
                    key={e.city.slug}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${e.city.slug}/commerces`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {e.city.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">
                      {e.city.region}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-emerald-600">
                        {e.commerce.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        /10
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span
                        className={`text-xs font-semibold ${COMMERCE_LEVEL_COLOR[e.commerce.level]}`}
                      >
                        {COMMERCE_LEVEL_LABEL[e.commerce.level]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Worst coverage */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — villes où l&apos;offre commerciale est la plus limitée
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes ≥ 15 000 hab. au score le plus bas. Profil dominant : villes
          moyennes 20-60 k hab. sans atout patrimonial ni touristique,
          banlieues sans centre marchand propre, bassins industriels en
          reconversion, communes DROM. Cible fréquente du programme Action Cœur
          de Ville (ANCT) pour lutter contre la vacance commerciale.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Région</th>
                  <th className="px-3 py-2 text-right">Score</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">
                    Niveau
                  </th>
                </tr>
              </thead>
              <tbody>
                {worst.map((e, i) => (
                  <tr
                    key={e.city.slug}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${e.city.slug}/commerces`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {e.city.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">
                      {e.city.region}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-orange-600">
                        {e.commerce.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        /10
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span
                        className={`text-xs font-semibold ${COMMERCE_LEVEL_COLOR[e.commerce.level]}`}
                      >
                        {COMMERCE_LEVEL_LABEL[e.commerce.level]}
                      </span>
                    </td>
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
              <strong className="text-[var(--text-primary)]">
                Couverture &amp; diversité (35 %)
              </strong>{" "}
              — densité de l&apos;offre corrélée avant tout à la taille de
              l&apos;aire de chalandise (population), ajustée par le caractère
              de la ville (métropole, préfecture, dynamisme).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Marchés &amp; proximité (25 %)
              </strong>{" "}
              — tissu d&apos;indépendants et de commerces de bouche, marchés
              réguliers, gastronomie. Un centre patrimonial et touristique
              soutient fortement ce volet.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Grandes surfaces (15 %)
              </strong>{" "}
              — présence de pôles de grande distribution et de zones
              commerciales périphériques (hyper, retail parks, bricolage,
              ameublement).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Vitalité du centre-ville (25 %)
              </strong>{" "}
              — proxy de la vacance commerciale. Les villes moyennes (20-60 k
              hab.) sans atout patrimonial ou touristique sont les plus
              exposées à la dévitalisation (cible du programme Action Cœur de
              Ville).
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Score dérivé du profil de la ville (population, caractère, qualité
            de vie et offre culturelle), pas d&apos;un décompte terrain. Pour
            le nombre exact de commerces par commune, consulter la{" "}
            <a
              href="https://www.insee.fr/fr/metadonnees/source/serie/s1161"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              Base permanente des équipements (BPE) de l&apos;INSEE
            </a>{" "}
            ; pour la vacance des centres-villes, les publications Procos.
          </p>
        </Card>

        {/* Macro-region breakdown */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Par macro-région
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          L&apos;offre commerciale n&apos;a rien d&apos;uniforme : les métropoles
          régionales tirent leur macro-région vers le haut, quand les
          sous-préfectures rurales et bassins industriels en reconversion
          concentrent les tensions. À décomposer par territoire.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link
              key={m.slug}
              href={`/commerces/${m.slug}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {m.label}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">
                  Densité + centres-villes
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Cross-links */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Voir aussi
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/services-publics" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🏛️</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Services publics
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Accès Poste, mairie, école, médiathèque
              </div>
            </Card>
          </Link>
          <Link href="/cadre-de-vie" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🌿</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Cadre de vie
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Méga-hub environnement, santé, emploi
              </div>
            </Card>
          </Link>
          <Link
            href="https://agence-cohesion-territoires.gouv.fr/action-coeur-de-ville-42"
            target="_blank"
            rel="noopener"
            className="block"
          >
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🏬</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Action Cœur de Ville
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Programme ANCT · villes moyennes
              </div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
