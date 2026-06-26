import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { topBestInternet, topPoorInternet } from "@/lib/internet-score";
import { CITIES_LIGHT } from "@/lib/cities-light";
import { MACRO_REGIONS } from "@/lib/macro-regions";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Couverture fibre · palmarès internet par ville 2026",
  description:
    "Où la fibre est largement déployée et où elle manque encore en France. Top 30 villes les mieux connectées vs top 20 les moins bien fibrées, données ARCEP T4 2024.",
  alternates: { canonical: "/internet" },
  openGraph: {
    title: "Couverture fibre · palmarès internet par ville 2026",
    description:
      "Top 30 villes les mieux connectées en fibre vs top 20 où la connexion reste précaire. Estimation régionale ARCEP T4 2024.",
  },
};

const MIN_POP = 15_000;

export default function InternetHubPage() {
  const best = topBestInternet(CITIES_LIGHT, 30, MIN_POP);
  const worst = topPoorInternet(CITIES_LIGHT, 20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Couverture internet", path: "/internet" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Quelles sont les villes les mieux connectées en fibre en France ?",
      a: `Les villes ≥ 15 000 hab. au score de connexion internet le plus élevé sont : ${best
        .slice(0, 5)
        .map((e) => `${e.city.name} (${e.score.toFixed(1)}/10)`)
        .join(
          ", ",
        )}. Score 0-10 dérivé de la couverture fibre régionale ARCEP T4 2024 + densité urbaine + score télétravail. 10 = fibre FTTH généralisée.`,
    },
    {
      q: "Où la fibre manque encore en France ?",
      a: `Les villes ≥ 15 000 hab. les moins bien connectées sont : ${worst
        .slice(0, 5)
        .map((e) => `${e.city.name} (${e.score.toFixed(1)}/10)`)
        .join(
          ", ",
        )}. La couverture y reste mosaïque (FTTH partiel, FTTLA câble, VDSL2 voire ADSL selon l'adresse) — la qualité réelle dépend du déploiement immeuble par immeuble.`,
    },
    {
      q: "Comment ce score de couverture internet est-il calculé ?",
      a: "Score 0-10 (10 = très bonne couverture fibre) qui combine le sous-score télétravail du seed (60 %), un bonus régional aligné sur les taux de raccordables FTTH ARCEP T4 2024 par région, un bonus pour les 30 plus grandes villes (densité fibre systématique) et une pénalité quand le département figure dans la liste ARCEP des zones peu denses non rentables.",
    },
    {
      q: "Pourquoi un filtre de 15 000 habitants ?",
      a: `Sous 15 000 habitants, le score est moins fiable : la couverture fibre y dépend fortement du Réseau d'Initiative Publique (RIP) en cours de déploiement, immeuble par immeuble. Le palmarès national est donc restreint aux communes significatives ; les fiches par ville couvrent les ${CITIES_COUNT} communes du référentiel.`,
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
          Couverture internet en France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Où la fibre est largement déployée et où elle est encore à la traîne.
          Score 0-10 (10 = couverture FTTH généralisée) calculé à partir des taux
          de locaux raccordables ARCEP T4 2024 par région, ajusté par la densité
          urbaine et la situation départementale (zones « peu denses non
          rentables » ARCEP). Filtre 15 000 habitants minimum pour la fiabilité
          du palmarès.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Source : ARCEP T4 2024</Badge>
          <Badge>{CITIES_COUNT} villes référencées</Badge>
          <Badge>Proxy honnête · pas de débit inventé</Badge>
        </div>

        {/* Best connected */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — villes les mieux connectées
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes ≥ 15 000 hab. au score le plus élevé. Souvent : grandes
          métropoles, couronne francilienne dense, agglomérations PACA et
          Occitanie qui ont vu un déploiement fibre rapide depuis 2020.
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
                        href={`/villes/${e.city.slug}/connexion-internet`}
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
                        {e.score.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        /10
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span className={`text-xs font-semibold ${e.info.color}`}>
                        {e.info.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Worst connected */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — villes les moins bien fibrées
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes ≥ 15 000 hab. au score le plus bas : préfectures
          départementales rurales (Creuse, Cantal, Lozère, Ariège…),
          sous-préfectures de moyenne montagne, communes DROM dispersées.
          Vérifier impérativement la disponibilité à l&apos;adresse exacte avant
          de signer.
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
                        href={`/villes/${e.city.slug}/connexion-internet`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {e.city.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">
                      {e.city.region}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {e.score.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        /10
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span className={`text-xs font-semibold ${e.info.color}`}>
                        {e.info.label}
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
                Score télétravail (seed)
              </strong>{" "}
              — 60 % du score. Sous-score propriétaire calibré sur la part de
              cadres, la couverture déclarative et la pratique du télétravail
              constatée à l&apos;échelle de la ville.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Bonus régional ARCEP T4 2024
              </strong>{" "}
              — taux de locaux raccordables au FTTH par région.
              Île-de-France, PACA et Occitanie tirent le haut du classement ;
              Bourgogne-Franche-Comté, Centre-Val de Loire et Corse restent en
              retrait.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Bonus densité urbaine
              </strong>{" "}
              — +0,3 sur le score des 30 plus grandes communes où la
              concurrence entre opérateurs et le déploiement immeuble par
              immeuble sont quasi systématiques.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Pénalité zone peu dense
              </strong>{" "}
              — −1,0 quand le département figure sur la liste ARCEP des zones
              « peu denses non rentables » (Creuse, Corrèze, Ariège, Cantal,
              Lozère, Aveyron, Gers, Hautes-Alpes, Haute-Loire,
              Alpes-de-Haute-Provence, Haute-Marne, Meuse, Vosges).
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Estimation régionale : la couverture évolue trimestriellement et
            varie immeuble par immeuble — toujours tester l&apos;éligibilité
            précise à l&apos;adresse exacte sur telecom.gouv.fr avant de
            signer.
          </p>
        </Card>

        {/* Macro-region breakdown */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Par macro-région
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          La couverture fibre n&apos;a rien d&apos;uniforme : les façades
          atlantique et méditerranéenne ont accéléré depuis 2021, alors que les
          arrière-pays alpin et gascon dépendent encore largement des Réseaux
          d&apos;Initiative Publique en cours de déploiement.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link
              key={m.slug}
              href={`/internet/${m.slug}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {m.label}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">
                  Fibre + lents débits
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
          <Link
            href="/red-flags/villes-internet-precaire"
            className="block"
          >
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🚩</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Internet précaire
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                ADSL plafonné, 4G fixe saturée
              </div>
            </Card>
          </Link>
          <Link href="/classements/teletravail" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">💻</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Classement télétravail
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Score remoteWork du seed
              </div>
            </Card>
          </Link>
          <Link
            href="https://www.telecom.gouv.fr/accueil-telecom/deploiement-des-reseaux/la-couverture-du-territoire/la-couverture-fixe-et-mobile-en-france"
            target="_blank"
            rel="noopener"
            className="block"
          >
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🔌</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Tester mon adresse
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Outil officiel ARCEP / telecom.gouv.fr
              </div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
