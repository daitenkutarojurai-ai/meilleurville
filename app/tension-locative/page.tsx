import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { topMostTense, topMostRelaxed } from "@/lib/rental-tension";
import { CITIES_LIGHT } from "@/lib/cities-light";
import { MACRO_REGIONS } from "@/lib/macro-regions";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Tension locative en France · palmarès 2026 par ville",
  description:
    "Où est-il difficile ou facile de se loger en France ? Top 30 villes au marché locatif le plus tendu vs. top 20 détendues, avec loyers T2 de référence.",
  alternates: { canonical: "/tension-locative" },
  openGraph: {
    title: "Tension locative en France · palmarès 2026",
    description:
      "Top 30 villes où trouver un logement est le plus difficile vs. top 20 où le marché reste accessible.",
  },
};

const MIN_POP = 15_000;

export default function RentalTensionHubPage() {
  const tense = topMostTense(CITIES_LIGHT, 30, MIN_POP);
  const relaxed = topMostRelaxed(CITIES_LIGHT, 20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Tension locative", path: "/tension-locative" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Dans quelles villes est-il le plus difficile de se loger en France ?",
      a: `Les villes ≥ 15 000 hab. au marché locatif le plus tendu sont : ${tense
        .slice(0, 5)
        .map((e) => `${e.city.name} (${e.tension.toFixed(1)}/10)`)
        .join(", ")}. Un score élevé signale peu de biens, des candidatures nombreuses et des délais longs.`,
    },
    {
      q: "Où le marché locatif est-il le plus détendu ?",
      a: `Les villes ≥ 15 000 hab. au marché le plus accessible sont : ${relaxed
        .slice(0, 5)
        .map((e) => `${e.city.name} (${e.tension.toFixed(1)}/10)`)
        .join(", ")}. Offre suffisante, négociation possible, délais courts.`,
    },
    {
      q: "Comment ce score de tension est-il calculé ?",
      a: "Score 0-10 (10 = très tendu) dérivé du loyer T2 de la ville rapporté à la médiane nationale (~750 €/mois, panel Clameur 2024 hors Île-de-France), ajusté par un indicateur de tension de marché par commune (FNAIM, observatoires des loyers, zonage DGALN). Pour les villes sans fiche logement, repli sur le score de coût de la vie.",
    },
    {
      q: "Pourquoi un filtre de 15 000 habitants ?",
      a: "Les indicateurs de marché locatif sont plus fiables sur les communes de taille significative. Le palmarès national restreint donc le classement aux villes de plus de 15 000 habitants ; les fiches par ville couvrent les " + CITIES_COUNT + " communes du référentiel.",
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
          Tension locative en France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Où trouver un logement en location relève du parcours du combattant, et
          où le marché reste accessible. Score 0-10 (10 = très tendu) calculé à
          partir du loyer T2 rapporté à la médiane nationale et d&apos;un indicateur
          de tension de marché par commune. Filtre 15 000 habitants minimum pour la
          fiabilité des indicateurs.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Proxy honnête · pas de chiffre inventé</Badge>
          <Badge>{CITIES_COUNT} villes référencées</Badge>
          <Badge>Référence Clameur 2024 : T2 médian ~750 €/mois</Badge>
        </div>

        {/* Most tense */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — marchés les plus tendus
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes ≥ 15 000 hab. au score de tension le plus élevé. Souvent : Paris et
          sa petite couronne, métropoles attractives, littoral désirable (Côte d&apos;Azur,
          Pays basque, façade atlantique).
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Région</th>
                  <th className="px-3 py-2 text-right">Tension</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Niveau</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Loyer T2</th>
                </tr>
              </thead>
              <tbody>
                {tense.map((e, i) => (
                  <tr key={e.city.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${e.city.slug}/tension-locative`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {e.city.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{e.city.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {e.tension.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span className={`text-xs font-semibold ${e.info.color}`}>{e.info.shortLabel}</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">
                      {e.rentT2 != null ? `${e.rentT2} €` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Most relaxed */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — marchés les plus détendus
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes ≥ 15 000 hab. au score le plus bas : villes moyennes du centre et
          de l&apos;est, anciens bassins industriels, communes où l&apos;offre dépasse la
          demande. La recherche y est confortable et la négociation possible.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Région</th>
                  <th className="px-3 py-2 text-right">Tension</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Niveau</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Loyer T2</th>
                </tr>
              </thead>
              <tbody>
                {relaxed.map((e, i) => (
                  <tr key={e.city.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${e.city.slug}/tension-locative`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {e.city.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{e.city.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-emerald-600">
                        {e.tension.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span className={`text-xs font-semibold ${e.info.color}`}>{e.info.shortLabel}</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">
                      {e.rentT2 != null ? `${e.rentT2} €` : "—"}
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
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Loyer relatif</strong> —
              loyer T2 de la ville rapporté à la médiane nationale (~750 €/mois, panel
              Clameur 2024 hors Île-de-France). Un loyer élevé signale une demande forte
              et une offre rare.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Tension de marché</strong> —
              correctif par commune calé sur les indicateurs publiés (tension Clameur,
              taux de vacance FNAIM, zonage DGALN « zones tendues »). Paris et la petite
              couronne, la Côte d&apos;Azur et le Pays basque cumulent les signaux.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Repli</strong> —
              pour les villes sans fiche logement détaillée, le score est estimé à partir
              du score de coût de la vie (un marché bon marché est rarement tendu).
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Proxy documenté comme estimation : aucun observatoire ne publie un délai
            moyen au pas communal. Au sein d&apos;une même ville, la tension varie selon
            le quartier et la saison (la rentrée de septembre est le pic de demande).
          </p>
        </Card>

        {/* Macro-region breakdown */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Par macro-région
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          La tension locative oppose fortement les façades désirables (atlantique,
          méditerranéenne, alpine) aux territoires de l&apos;intérieur. Vue restreinte à
          chaque grande zone.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link key={m.slug} href={`/tension-locative/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Tendues + détendues</div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Cross-links */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Voir aussi
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/louer-ou-acheter" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🔑</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Louer ou acheter</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Le seuil de rentabilité par ville</div>
            </Card>
          </Link>
          <Link href="/red-flags/villes-couts-explosifs" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🚩</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Coûts explosifs</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Loyer / salaire médian local</div>
            </Card>
          </Link>
          <Link href="/red-flags/villes-logement-introuvable" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🔑</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Logement introuvable</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Top 12 marchés locatifs bloquants</div>
            </Card>
          </Link>
          <Link href="/calculateur-cout-reel" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🧮</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Coût réel</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Simuler son budget logement</div>
            </Card>
          </Link>
          <Link href="/red-flags/villes-embouteillages-quotidiens" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🚥</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Villes bloquées aux bouchons</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Loyer trop cher au centre = commute allongée en périphérie</div>
            </Card>
          </Link>
          <Link href="/red-flags/villes-parking-cauchemar" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🅿️</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Villes où se garer est un cauchemar</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Centre historique tendu + prix m² élevés : la place résidentielle à 250 €/an ne garantit rien</div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
