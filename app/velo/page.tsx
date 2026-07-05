import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CYCLING_LEVEL_LABEL, CYCLING_LEVEL_COLOR } from "@/lib/cycling-mobility";
import { topCyclable, topNonCyclable } from "@/lib/cycling-mobility-rankings";
import { MACRO_REGIONS } from "@/lib/macro-regions";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Villes cyclables en France · palmarès 2026",
  description:
    "Classement national des villes françaises selon la cyclabilité quotidienne : réseau cyclable, topographie, sécurité, climat. Top 30 villes les plus cyclables vs. top 20 les plus difficiles à vélo.",
  alternates: { canonical: "/velo" },
  openGraph: {
    title: "Villes cyclables en France 2026",
    description:
      "Top 30 villes où le vélo est un plaisir vs. top 20 où il devient une épreuve. FUB · Vélo & Territoires · Géovélo.",
  },
};

const MIN_POP = 15_000;

export default function CyclingHubPage() {
  const best = topCyclable(30, MIN_POP);
  const worst = topNonCyclable(20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Mobilité vélo", path: "/velo" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Quelles sont les villes les plus cyclables de France ?",
      a: `Selon notre composite F57 (réseau, topographie, sécurité, climat), les villes ≥ 15 000 hab. les plus cyclables sont : ${best
        .slice(0, 5)
        .map((c) => `${c.name} (${c.cycling.composite}/10)`)
        .join(", ")}. Toutes cumulent un réseau dense, un relief favorable et une politique vélo affirmée.`,
    },
    {
      q: "Quelles villes sont difficiles à vivre à vélo ?",
      a: `Les villes ≥ 15 000 hab. au composite le plus bas sont : ${worst
        .slice(0, 5)
        .map((c) => `${c.name} (${c.cycling.composite}/10)`)
        .join(", ")}. Elles cumulent généralement relief marqué, faible aménagement et trafic dense.`,
    },
    {
      q: "Comment ce classement est-il calculé ?",
      a: "Composite agrégeant 4 dimensions : réseau cyclable (35 %, Baromètre FUB + Vélo & Territoires + présence EuroVelo), topographie (25 %, altitude + département vallonné/plat), sécurité (25 %, densité urbaine × aménagement), climat (15 %, soleil + vent + hiver). Score 0-10, 10 = excellent. Sources : FUB, Vélo & Territoires, Géovélo, INSEE.",
    },
    {
      q: "Où voir le Baromètre FUB officiel ?",
      a: "Le Baromètre des Villes Cyclables FUB (parlons-velo.fr) publie tous les 2 ans le classement officiel, basé sur l'enquête citoyenne. Vélo & Territoires (velo-territoires.org) cartographie le déploiement des Schémas Directeurs Vélo par EPCI. Géovélo (geovelo.fr) propose des itinéraires sécurisés en application.",
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
          Villes cyclables en France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Index composite agrégeant quatre dimensions clés de la cyclabilité quotidienne :
          réseau d&apos;aménagements, topographie, sécurité et climat. Score 0-10, 10 =
          excellent. Filtre 15 000 habitants minimum pour pertinence des indicateurs.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Synthèse pédagogique</Badge>
          <Badge>4 dimensions · {CITIES_COUNT} villes</Badge>
          <Badge>Pondération réseau 35 % · topo 25 % · sécurité 25 % · climat 15 %</Badge>
        </div>

        {/* Top cyclable */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — villes les plus cyclables
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes régulièrement primées Baromètre FUB / Vélo & Territoires, traversées par
          un itinéraire EuroVelo, ou bénéficiant d&apos;une plaine favorable.
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Réseau</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Relief</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Sécurité</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Climat</th>
                </tr>
              </thead>
              <tbody>
                {best.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/velo`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${CYCLING_LEVEL_COLOR[c.cycling.level]}`}>
                        {c.cycling.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {CYCLING_LEVEL_LABEL[c.cycling.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.cycling.network.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.cycling.topography.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.cycling.safety.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.cycling.climate.score.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Lecture : 10 = idéal pour le vélo quotidien. Score &gt; 7 = ville profondément cyclable.
        </p>

        {/* Worst */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — villes difficiles à vivre à vélo
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes ≥ 15 000 hab. cumulant relief marqué, faible aménagement et trafic dense.
          Vélo possible en VAE mais dissuasif au quotidien sans assistance.
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Réseau</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Relief</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Sécurité</th>
                </tr>
              </thead>
              <tbody>
                {worst.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/velo`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {c.cycling.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.cycling.network.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.cycling.topography.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.cycling.safety.score.toFixed(1)}</td>
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
              <strong className="text-[var(--text-primary)]">Réseau cyclable (35 %)</strong> —
              ville régulièrement primée Baromètre FUB / palmarès Vélo & Territoires
              (Strasbourg, Grenoble, Rennes, Nantes, Bordeaux, La Rochelle, Chambéry,
              Annecy, Caen, Lorient…) + statut métropolitain + présence sur EuroVelo
              structurante (EV1 Vélodyssée, EV3 Scandibérique, EV6 Loire, EV8 Méditerranée,
              EV17 ViaRhôna).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Topographie (25 %)</strong> —
              malus département vallonné (Massif Central, Alpes, Pyrénées, Vosges, Jura,
              Corse) et altitude &gt; 500 m. Bonus plaine (Beauce, Aquitaine, Loire,
              Picardie-Flandre). Au-delà de 4 % de pente moyenne, le vélo musculaire
              devient dissuasif au quotidien.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Sécurité (25 %)</strong> —
              combine densité urbaine (proxy trafic) et niveau d&apos;aménagement séparé.
              Les villes cyclables connues compensent la densité par des pistes séparées et
              des zones 30 généralisées ; les grandes métropoles non-cyclables cumulent
              trafic dense + discontinuités.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Climat (15 %)</strong> —
              ensoleillement annuel, température hivernale, et vent dominant. Bonus Sud
              ensoleillé hors couloir rhodanien venteux. Malus côte atlantique (vent
              dominant fort) et hivers froids (verglas).
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Score à l&apos;échelle communale. À l&apos;adresse, l&apos;expérience varie
            fortement selon le quartier (centre vs. périphérie péri-urbaine non aménagée).
            Pour l&apos;itinéraire réel, Géovélo et OpenStreetMap offrent les meilleures
            cartes vélo à jour.
          </p>
        </Card>

        {/* Macro-region breakdown */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Par macro-région
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          La cyclabilité varie fortement entre les plaines de la Loire (idéales) et l&apos;arc
          alpin (relief contraignant). Vue restreinte à chaque grande zone géographique.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link key={m.slug} href={`/velo/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Top cyclables + difficiles</div>
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
          <Link href="/environnement" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🌬️</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Qualité environnementale</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Air, bruit, eau, risques</div>
            </Card>
          </Link>
          <Link href="/red-flags/villes-embouteillages-quotidiens" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🚥</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Villes prises dans les bouchons</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">L&apos;autre versant : là où la voiture bloque tout</div>
            </Card>
          </Link>
          <Link href="/red-flags" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🚩</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Red Flags</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Pièges à éviter</div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
