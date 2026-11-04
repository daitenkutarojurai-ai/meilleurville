import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import { ENV_LEVEL_LABEL, ENV_LEVEL_COLOR } from "@/lib/environment-index";
import { topHealthiest, topMostStressed } from "@/lib/environment-index-rankings";
import { MACRO_REGIONS } from "@/lib/macro-regions";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";
import { pathAlternates } from "@/lib/i18n";
import { AIR_MEASURED_MAX_KM, AIR_MEASURED_YEAR } from "@/lib/air-quality";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Villes les plus saines de France · index environnemental 2026",
  description:
    "Classement national des villes françaises selon leur santé environnementale : qualité de l'air, bruit, stress hydrique, risques naturels. Top 30 villes les plus saines + top 20 villes les plus exposées. Méthodologie publique.",
  alternates: pathAlternates("/environnement", "/environment"),
  openGraph: {
    // Sans `images`, un openGraph de page remplace celui hérité de la racine
    // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
    images: ["/opengraph-image"],
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
      a: `L'index agrège quatre dimensions : qualité de l'air (30 %), bruit (25 %), stress hydrique (25 %), risques naturels (20 %). Dans l'air, le dioxyde d'azote, les particules fines et l'ozone sont mesurés (moyennes ${AIR_MEASURED_YEAR} des réseaux de surveillance) quand une station de fond urbaine ou périurbaine est à moins de ${AIR_MEASURED_MAX_KM} km ; les pollens, et ces trois polluants ailleurs, sont estimés. Bruit, stress hydrique et risques naturels sont des modèles estimés à l'échelle communale depuis les caractéristiques de la commune (taille, département, relief, climat, littoral), calés sur les cadres de référence publics — CBS, PEB et Bruitparif pour le bruit, Propluvia et BRGM pour l'eau, BCSF, BRGM et ONF pour les risques — sans reprendre leurs relevés. Le score « santé environnementale » 0-10 est l'inverse du composite de stress.`,
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

      {/* Hero */}
      <section className="relative overflow-hidden bg-aurora pt-12 pb-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link>
        </nav>

        <div className="flex items-center gap-3">
          <EmojiBadge emoji="🌿" tone="aqua" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            Villes les plus <span className="gradient-text">saines</span> de France
          </h1>
        </div>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Index composite agrégeant quatre dimensions environnementales : qualité de l&apos;air,
          bruit, stress hydrique et risques naturels. L&apos;air est <strong>mesuré</strong> en
          station (NO2, particules fines, ozone) quand une station de fond est à moins
          de {AIR_MEASURED_MAX_KM} km ; pollens, bruit, eau et risques sont <strong>estimés</strong> par
          un modèle communal calé sur les cadres de référence publics (CBS / Bruitparif, Propluvia /
          BRGM, BCSF / BRGM / ONF) — des estimations, pas des relevés.
          Score 0-10, 10 = environnement le plus sain.
          Filtre : 15 000 habitants minimum pour pertinence des indicateurs urbains.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="grad-head-0 rounded-full px-3 py-1 font-semibold">Estimation structurelle</span>
          <span className="rounded-full bg-white/85 px-3 py-1 font-medium text-[#4338CA] ring-1 ring-[#C7D2FE]">4 dimensions · {CITIES_COUNT} villes</span>
          <span className="rounded-full bg-white/85 px-3 py-1 font-medium text-[#4338CA] ring-1 ring-[#C7D2FE]">Pondération air 30 % · bruit 25 % · eau 25 % · risques 20 %</span>
        </div>

        </div>
      </section>

      {/* Top villes saines — bande indigo */}
      <section className="band band-indigo py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold">
          <span className="gradient-text">Top 30 — villes les plus saines</span>
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes de plus de 15 000 habitants au score « santé environnementale » le plus
          élevé. Pour la plupart : moyenne montagne ou littoral atlantique tempéré, faible
          densité industrielle, peu d&apos;axes routiers majeurs.
        </p>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--band-indigo)] text-xs uppercase tracking-wide text-[#4338CA]">
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
                  <tr key={c.slug} className="border-t border-[var(--border)] transition-colors hover:bg-[#F5F3FF]">
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
        </div>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Lecture des sous-scores : 10 = exposition maximale (donc pire), 0 = absent.
        </p>

        </div>
      </section>

      {/* Top villes exposées — bande rose */}
      <section className="band band-pink py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold">
          <span className="gradient-text">Top 20 — villes les plus exposées</span>
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes cumulant l&apos;exposition environnementale la plus élevée sur les
          4 dimensions. Souvent : grandes métropoles à fort trafic, vallées encaissées
          sujettes à l&apos;inversion thermique, agglomérations sous couloir aérien, ou
          départements méditerranéens cumulant chaleur, sécheresse et feux.
        </p>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_-18px_rgba(219,39,119,0.45)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--band-pink)] text-xs uppercase tracking-wide text-[#9D174D]">
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
                  <tr key={c.slug} className="border-t border-[var(--border)] transition-colors hover:bg-[#F5F3FF]">
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
        </div>

        </div>
      </section>

      {/* Méthodologie — bande ciel */}
      <section className="band band-sky py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-xl font-bold">
          <span className="gradient-text">Méthodologie</span>
        </h2>
        <div className="mt-3 rounded-2xl bg-white p-5 sm:p-6 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Air (30 %)</strong> — agrégat
              NO2, PM2.5, ozone, pollens. Voir{" "}
              <Link href={`/villes/${healthiest[0].slug}/air`} className="text-[var(--accent)] hover:underline">
                la sous-page air d&apos;une ville
              </Link>{" "}
              pour le détail. Cadres de référence : ATMO, CITEPA, RNSA.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Bruit (25 %)</strong> —
              routier, aérien, ferroviaire, nocturne. Cadres de référence : Cartes de Bruit
              Stratégiques (CBS), plans d&apos;exposition au bruit (PEB) DGAC, Bruitparif IDF.
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
        </div>

        </div>
      </section>

      {/* Macro-régions — bande lilas */}
      <section className="band band-lilac py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-xl font-bold">
          <span className="gradient-text">Par macro-région</span>
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Le profil environnemental varie fortement entre la côte atlantique tempérée et
          l&apos;arc méditerranéen chaud. Vue restreinte à chaque grande zone géographique.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m, i) => (
            <Link key={m.slug} href={`/environnement/${m.slug}`} className="block">
              <div className="h-full rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)] transition-transform hover:-translate-y-0.5">
                <EmojiBadge emoji={m.emoji} tone={toneFor(i)} size="sm" className="mb-2" />
                <div className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Top villes saines + plus exposées</div>
              </div>
            </Link>
          ))}
        </div>

        </div>
      </section>

      {/* Profils sensibles — bande blanche */}
      <section className="band band-white py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-xl font-bold">
          <span className="gradient-text">Vous êtes particulièrement exposé ?</span>
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-3xl">
          L&apos;index environnemental agrège quatre dimensions à parts égales, mais tout le monde
          n&apos;y est pas exposé de la même manière. Pour un télétravail enchaîné en visios ou un
          nourrisson à endormir, la sonorité ambiante compte plus que la sécheresse d&apos;été ;
          pour un asthmatique, l&apos;air ATMO passe devant tout le reste. Nous publions des
          classements dédiés qui rebalancent les pondérations selon la sensibilité — voir le{" "}
          <Link href="/pour-qui/sensibles-au-bruit" className="text-[var(--accent)] hover:underline">
            top 20 villes pour les sensibles au bruit
          </Link>{" "}
          (pondération bruit ×3, nature ×2) ou le{" "}
          <Link href="/pour-qui/asthmatiques-allergiques" className="text-[var(--accent)] hover:underline">
            top 20 asthmatiques et allergiques
          </Link>{" "}
          (qualité de l&apos;air ×3, potentiel anti-canicule ×2). Le même
          raisonnement vaut pour la géographie : si le « littoral atlantique
          tempéré » revient dans les communes les moins tendues ci-dessus, c&apos;est
          un résultat de l&apos;index et non un critère ; le{" "}
          <Link href="/pour-qui/amateurs-de-littoral" className="text-[var(--accent)] hover:underline">
            top 20 des villes où vivre au bord de la mer
          </Link>{" "}
          en fait un critère à part entière, en partant de la distance à la côte
          avant de repondérer l&apos;air et la canicule.
        </p>

        </div>
      </section>

      {/* Quartet environnement — bande aqua */}
      <section className="band band-aqua py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-xl font-bold">
          <span className="gradient-text">Le quartet environnement par ville</span>
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["air", "bruit", "eau", "risques"] as const).map((sub, i) => (
            <Link key={sub} href={`/villes/${healthiest[0].slug}/${sub}`} className="block">
              <div className="h-full rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)] transition-transform hover:-translate-y-0.5 text-center">
                <EmojiBadge
                  emoji={sub === "air" ? "🌬️" : sub === "bruit" ? "🔊" : sub === "eau" ? "💧" : "⚠️"}
                  tone={toneFor(i + 2)}
                  size="sm"
                  className="mb-2"
                />
                <div className="text-sm font-semibold text-[var(--text-primary)] capitalize">
                  {sub === "risques" ? "Risques naturels" : sub === "eau" ? "Stress hydrique" : sub === "air" ? "Qualité de l'air" : "Bruit"}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">
                  Ex : {healthiest[0].name}
                </div>
              </div>
            </Link>
          ))}
        </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
