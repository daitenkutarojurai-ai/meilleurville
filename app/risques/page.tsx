import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  topMostAtRisk,
  topLeastAtRisk,
  RISK_LEVEL_LABEL,
  RISK_LEVEL_COLOR,
} from "@/lib/natural-risks";
import { CITIES_LIGHT } from "@/lib/cities-light";
import { MACRO_REGIONS } from "@/lib/macro-regions";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Risques naturels en France · palmarès par ville 2026",
  description:
    "Quelles villes cumulent le plus de risques naturels (inondation, sismicité, argile, feux) vs lesquelles sont les plus tranquilles. Synthèse 4 aléas, BCSF + BRGM + ONF.",
  alternates: { canonical: "/risques" },
  openGraph: {
    title: "Risques naturels en France · palmarès par ville 2026",
    description:
      "Top 30 villes les plus exposées vs top 20 les plus tranquilles. Inondation, sismicité, argile, feux de forêt.",
  },
};

const MIN_POP = 15_000;

export default function RisquesHubPage() {
  const most = topMostAtRisk(CITIES_LIGHT, 30, MIN_POP);
  const least = topLeastAtRisk(CITIES_LIGHT, 20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Risques naturels", path: "/risques" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Quelles sont les villes françaises les plus exposées aux risques naturels ?",
      a: `Les villes ≥ 15 000 hab. au score composite de risque le plus élevé sont : ${most
        .slice(0, 5)
        .map((e) => `${e.city.name} (${e.composite.toFixed(1)}/10)`)
        .join(
          ", ",
        )}. Score 0-10 dérivé des 4 grands aléas (inondation 35 %, argile 25 %, feu de forêt 20 %, sismicité 20 %). 10 = exposition maximale.`,
    },
    {
      q: "Quelles villes cumulent le moins de risques naturels ?",
      a: `Les villes ≥ 15 000 hab. au profil le plus tranquille sont : ${least
        .slice(0, 5)
        .map((e) => `${e.city.name} (${e.composite.toFixed(1)}/10)`)
        .join(
          ", ",
        )}. Ces communes n'ont ni grand fleuve, ni façade littorale basse, ni massif forestier inflammable proche, et se situent en zone sismique 1.`,
    },
    {
      q: "Comment ce score composite est-il calculé ?",
      a: "Composite 0-10 (10 = exposition maximale) pondéré sur 4 dimensions : risque inondation (35 %, dérivé du tag fleuve majeur + altitude + littoral), retrait-gonflement argile (25 %, aléa BRGM par département), feu de forêt (20 %, classification ONF + ECASC) et sismicité (20 %, zonage réglementaire 2011). La pondération privilégie l'inondation car c'est l'aléa qui se matérialise le plus souvent en sinistre habitation.",
    },
    {
      q: "Pourquoi un filtre de 15 000 habitants ?",
      a: `Sous 15 000 habitants, l'exposition aux risques varie fortement à l'échelle micro-locale (rive basse vs hauteur, hameau vs centre bourg). Le palmarès national est donc restreint aux communes significatives ; les fiches par ville couvrent les ${CITIES_COUNT} communes du référentiel. Pour un diagnostic à l'adresse, le portail Géorisques reste la référence.`,
    },
    {
      q: "Ces scores remplacent-ils un PPRI officiel ?",
      a: "Non. Ce sont des synthèses pédagogiques à l'échelle communale, utiles pour comparer plusieurs villes avant projet. Pour un Plan de Prévention des Risques Inondation (PPRI), un Plan de Prévention des Risques Technologiques (PPRT) ou un État des Risques et Pollutions (ERP, obligatoire à la vente), consultez Géorisques en saisissant l'adresse précise.",
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
          Risques naturels en France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Où s&apos;additionnent inondation, sismicité, retrait-gonflement
          argile et feu de forêt — et où l&apos;on dort tranquille. Score 0-10
          (10 = exposition maximale) calculé à partir du zonage sismique
          réglementaire (BCSF), de l&apos;aléa argile BRGM, de la classification
          feux ONF / ECASC et d&apos;un proxy inondation dérivé du fleuve et de
          l&apos;altitude. Filtre 15 000 habitants minimum pour la fiabilité du
          palmarès.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Sources : BCSF · BRGM · ONF</Badge>
          <Badge>{CITIES_COUNT} villes référencées</Badge>
          <Badge>Synthèse pédagogique · pas un PPRI</Badge>
        </div>

        {/* Most exposed */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — villes les plus exposées
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes ≥ 15 000 hab. au score composite le plus élevé. Sans
          surprise : les villes de bord de fleuve à faible altitude (Garonne,
          Rhône, Adour, Var), les communes littorales basses de Méditerranée et
          d&apos;Atlantique, les agglomérations en zone sismique 3 ou 4 (arc
          alpin, arc pyrénéen, Antilles), et celles qui cumulent argile fort +
          massif forestier inflammable proche.
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">
                    Niveau
                  </th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">
                    Aléa #1
                  </th>
                </tr>
              </thead>
              <tbody>
                {most.map((e, i) => {
                  const top = [
                    { k: "Inondation", v: e.flood },
                    { k: "Sismicité", v: e.seismic },
                    { k: "Argile", v: e.clay },
                    { k: "Feu de forêt", v: e.wildfire },
                  ].sort((a, b) => b.v - a.v)[0];
                  return (
                    <tr
                      key={e.city.slug}
                      className="border-t border-[var(--border)]"
                    >
                      <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">
                        {i + 1}
                      </td>
                      <td className="px-3 py-2">
                        <Link
                          href={`/villes/${e.city.slug}/risques`}
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
                          {e.composite.toFixed(1)}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                          /10
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right hidden sm:table-cell">
                        <span
                          className={`text-xs font-semibold ${RISK_LEVEL_COLOR[e.level]}`}
                        >
                          {RISK_LEVEL_LABEL[e.level]}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right hidden md:table-cell text-xs text-[var(--text-tertiary)]">
                        {top.k} ({top.v.toFixed(0)})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Least exposed */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — villes les plus tranquilles
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes ≥ 15 000 hab. au profil de risque le plus bas. Souvent : des
          villes intérieures sur plateau ou colline, en zone sismique 1, sans
          fleuve majeur traversant, hors massif forestier inflammable. Les
          assureurs habitation y appliquent rarement des surprimes catastrophe
          naturelle.
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">
                    Niveau
                  </th>
                </tr>
              </thead>
              <tbody>
                {least.map((e, i) => (
                  <tr
                    key={e.city.slug}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${e.city.slug}/risques`}
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
                        {e.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        /10
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span
                        className={`text-xs font-semibold ${RISK_LEVEL_COLOR[e.level]}`}
                      >
                        {RISK_LEVEL_LABEL[e.level]}
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
                Inondation (35 %)
              </strong>{" "}
              — proxy combinant la présence d&apos;un grand fleuve traversant la
              commune (Seine, Rhône, Loire, Garonne, Marne, Saône, Adour,
              Charente, Dordogne, Var, Aude…), l&apos;altitude (basse &lt;
              30 m, très basse &lt; 10 m) et la position littorale. C&apos;est
              l&apos;aléa qui se matérialise le plus souvent en sinistre
              habitation, d&apos;où la pondération la plus élevée.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Argile (25 %)
              </strong>{" "}
              — aléa retrait-gonflement BRGM (faible / moyen / fort) par
              département. Les sécheresses successives 2003-2023 ont rendu ce
              risque très visible : fissures de maisons, frais de reprise en
              sous-œuvre. Concentration sur le Bassin parisien, le Sud-Ouest et
              le Bassin aquitain.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Feu de forêt (20 %)
              </strong>{" "}
              — classification ONF + ECASC des départements à massifs
              méditerranéens (PACA, Corse, Languedoc), forêts résineuses
              landaises et garrigue de Provence intérieure. Saison à risque
              juin-septembre.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Sismicité (20 %)
              </strong>{" "}
              — zonage réglementaire 2011 (décret 2010-1255), zones 1 à 5.
              Stable par département. Zone 5 = Antilles uniquement, zone 4 =
              Alpes-Maritimes + sud Pyrénées, zone 3 = arc alpin + arc
              pyrénéen + Alsace + Var. Le bassin parisien et la Bretagne sont
              en zone 1.
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Ces scores synthétisent des aléas à l&apos;échelle communale. Au
            sein d&apos;une même commune, l&apos;exposition peut varier
            fortement (bord de rivière vs hauteur, zone forestière vs centre
            urbain). Pour un diagnostic à l&apos;adresse, le portail Géorisques
            reste la référence.
          </p>
        </Card>

        {/* Macro-region breakdown */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Par macro-région
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          La géographie des risques naturels n&apos;est pas uniforme : la côte
          atlantique cumule submersion et inondation, l&apos;arc méditerranéen
          ajoute feu de forêt et argile, l&apos;arc alpin concentre la
          sismicité, le sud-ouest gascon cumule argile fort et inondation
          fluviale.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link
              key={m.slug}
              href={`/risques/${m.slug}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {m.label}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">
                  Risques naturels
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
          <Link href="/environnement" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🌳</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Cadre environnemental
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Air, bruit, eau, risques agrégés
              </div>
            </Card>
          </Link>
          <Link href="/climat-2040-timelapse" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🌡️</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Climat 2040
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Canicule, nuits tropicales
              </div>
            </Card>
          </Link>
          <Link
            href="https://www.georisques.gouv.fr/mes-risques/connaitre-les-risques-pres-de-chez-moi"
            target="_blank"
            rel="noopener"
            className="block"
          >
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🗺️</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Diagnostic à l&apos;adresse
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Outil officiel Géorisques
              </div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
