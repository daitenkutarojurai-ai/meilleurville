import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  cityPopulation,
  populationTrend,
  INSEE_POP_BASE_YEAR,
  INSEE_POP_CREDIT,
  INSEE_POP_SOURCE_URL,
  INSEE_POP_YEAR,
} from "@/lib/city-population";
import { CITIES_LIGHT } from "@/lib/cities-light";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript, SITE_URL } from "@/lib/jsonld";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Villes qui grandissent (et qui perdent) en France · Insee 2016-2022",
  description:
    "Classement Insee des villes françaises qui gagnent le plus d'habitants entre 2016 et 2022, et de celles qui en perdent le plus. Chiffres réels du recensement, filtre 15 000 habitants.",
  alternates: { canonical: "/villes-qui-grandissent" },
  openGraph: {
    // Sans `images`, un openGraph de page remplace celui hérité de la racine
    // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
    images: ["/opengraph-image"],
    title: "Villes qui grandissent en France · palmarès Insee 2016-2022",
    description:
      "Top 30 des communes qui gagnent le plus d'habitants (recensement Insee 2022) et top 20 de celles qui en perdent le plus.",
  },
};

const MIN_POP = 15_000;
// L'Insee recommande de ne pas interpréter une variation annuelle inférieure
// à 0,15 %/an : sous ce seuil, le recensement ne distingue pas un vrai
// mouvement d'un aléa de mesure.
const STABLE_THRESHOLD = 0.15;

type Row = {
  slug: string;
  name: string;
  region: string | null;
  pop2016: number;
  pop2022: number;
  changePct: number;
  annualPct: number;
  gained: number;
};

function fmt(n: number): string {
  return n.toLocaleString("fr-FR");
}

function signed(n: number, digits = 1): string {
  const s = n.toFixed(digits);
  return n > 0 ? `+${s}` : s;
}

function buildRows(): Row[] {
  const rows: Row[] = [];
  for (const city of CITIES_LIGHT) {
    const pop = cityPopulation(city.slug);
    const trend = populationTrend(city.slug);
    if (!pop || !trend || pop.pop2016 == null) continue;
    if (pop.pop2022 < MIN_POP) continue;
    rows.push({
      slug: city.slug,
      name: city.name,
      region: city.region,
      pop2016: pop.pop2016,
      pop2022: pop.pop2022,
      changePct: trend.changePct,
      annualPct: trend.annualPct,
      gained: trend.gained,
    });
  }
  return rows;
}

export default function CityGrowthHubPage() {
  const all = buildRows();
  const growing = [...all]
    .filter((r) => r.annualPct > STABLE_THRESHOLD)
    .sort((a, b) => b.annualPct - a.annualPct)
    .slice(0, 30);
  const shrinking = [...all]
    .filter((r) => r.annualPct < -STABLE_THRESHOLD)
    .sort((a, b) => a.annualPct - b.annualPct)
    .slice(0, 20);
  const stable = [...all]
    .filter((r) => Math.abs(r.annualPct) <= STABLE_THRESHOLD)
    .sort((a, b) => b.pop2022 - a.pop2022)
    .slice(0, 10);

  const growingCount = all.filter((r) => r.annualPct > STABLE_THRESHOLD).length;
  const shrinkingCount = all.filter((r) => r.annualPct < -STABLE_THRESHOLD).length;
  const stableCount = all.length - growingCount - shrinkingCount;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Démographie", path: "/demographie" },
    { name: "Villes qui grandissent", path: "/villes-qui-grandissent" },
  ]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Villes françaises qui gagnent le plus d'habitants (Insee 2016-2022)",
    numberOfItems: growing.length,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: growing.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: r.name,
      url: `${SITE_URL}/villes/${r.slug}/demographie`,
    })),
  };

  const faq = faqJsonLd([
    {
      q: "Quelles villes françaises gagnent le plus d'habitants ?",
      a: `Sur les communes de plus de 15 000 habitants, les cinq plus fortes croissances annuelles entre 2016 et 2022 (recensement Insee) sont : ${growing
        .slice(0, 5)
        .map((r) => `${r.name} (${signed(r.annualPct, 2)} %/an)`)
        .join(", ")}. Ces chiffres agrègent solde naturel et solde migratoire.`,
    },
    {
      q: "Quelles villes françaises perdent le plus d'habitants ?",
      a: `Sur les communes de plus de 15 000 habitants, les cinq plus fortes décroissances annuelles entre 2016 et 2022 sont : ${shrinking
        .slice(0, 5)
        .map((r) => `${r.name} (${signed(r.annualPct, 2)} %/an)`)
        .join(", ")}. Beaucoup sont d'anciens bassins industriels ou des sous-préfectures rurales de l'Est et du Centre.`,
    },
    {
      q: "D'où viennent ces chiffres ?",
      a: `Insee, recensement de la population, base « Évolution et structure de la population en 2022 » — millésimes 2016 et 2022 comparés à périmètre communal constant. Les évolutions sont calculées à la commune sur six ans (${INSEE_POP_BASE_YEAR}→${INSEE_POP_YEAR}), et la variation annuelle est le taux d'accroissement moyen géométrique sur la période.`,
    },
    {
      q: "Pourquoi un filtre à 15 000 habitants ?",
      a: `Sous 15 000 habitants, une variation annuelle d'un ou deux points s'explique souvent par l'arrivée ou le départ d'un lotissement ou par une correction méthodologique du recensement. Le filtre garde le classement lisible ; les fiches par ville couvrent toutes les communes du référentiel.`,
    },
    {
      q: "Que veut dire « stable » ici ?",
      a: `L'Insee recommande de ne pas interpréter une variation annuelle inférieure à 0,15 %/an : sous ce seuil, le recensement ne distingue pas un vrai mouvement d'un aléa de mesure. Sur les ${all.length} communes de plus de 15 000 habitants, ${stableCount} entrent dans cet intervalle et sont regroupées à part.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(itemList)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link>
          <span className="mx-1">›</span>
          <Link href="/demographie" className="hover:underline">Démographie</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Villes qui grandissent (et villes qui perdent des habitants)
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Ce qu&apos;a réellement mesuré le recensement de la population entre {INSEE_POP_BASE_YEAR} et
          {" "}
          {INSEE_POP_YEAR}, à la commune. Pas d&apos;estimation, pas de projection : les deux
          millésimes du même fichier Insee, comparés à périmètre constant, sur les
          {" "}
          {all.length} communes de plus de {fmt(MIN_POP)} habitants du référentiel.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Source Insee · recensement {INSEE_POP_YEAR}</Badge>
          <Badge>
            {growingCount} en hausse · {stableCount} stables · {shrinkingCount} en baisse
          </Badge>
          <Badge>Filtre ≥ {fmt(MIN_POP)} habitants</Badge>
        </div>

        {/* Growing */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — villes qui grandissent le plus vite
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes de plus de {fmt(MIN_POP)} habitants classées par variation annuelle moyenne
          entre {INSEE_POP_BASE_YEAR} et {INSEE_POP_YEAR}. On retrouve la couronne des grandes
          métropoles (Toulouse, Bordeaux, Île-de-France), la façade atlantique et quelques
          communes ultramarines à démographie jeune.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left hidden sm:table-cell">Région</th>
                  <th className="px-3 py-2 text-right">Pop. {INSEE_POP_YEAR}</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Pop. {INSEE_POP_BASE_YEAR}</th>
                  <th className="px-3 py-2 text-right">Variation</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Par an</th>
                </tr>
              </thead>
              <tbody>
                {growing.map((r, i) => (
                  <tr key={r.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${r.slug}/demographie`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {r.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)] hidden sm:table-cell">{r.region ?? "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)]">{fmt(r.pop2022)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-tertiary)] hidden sm:table-cell">{fmt(r.pop2016)}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold text-emerald-600">
                      {signed(r.changePct, 1)} %
                      <span className="text-[10px] block text-[var(--text-tertiary)] font-normal">+{fmt(r.gained)}</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-emerald-600 hidden md:table-cell">
                      {signed(r.annualPct, 2)} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Lecture : une variation annuelle de +2 %/an double une commune tous les 35 ans environ.
          En pratique, elle traduit surtout un solde migratoire soutenu (arrivée d&apos;actifs et
          de familles) — le solde naturel dépasse rarement +0,5 %/an dans les communes
          métropolitaines.
        </p>

        {/* Shrinking */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — villes qui perdent le plus d&apos;habitants
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes qui décrochent structurellement depuis six ans. Le classement mélange
          anciens bassins industriels du Nord-Est (Calais, Saint-Dizier, Belfort), sous-préfectures
          du Massif central, et communes antillaises où le solde migratoire vers la métropole
          reste fortement négatif.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left hidden sm:table-cell">Région</th>
                  <th className="px-3 py-2 text-right">Pop. {INSEE_POP_YEAR}</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Pop. {INSEE_POP_BASE_YEAR}</th>
                  <th className="px-3 py-2 text-right">Variation</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Par an</th>
                </tr>
              </thead>
              <tbody>
                {shrinking.map((r, i) => (
                  <tr key={r.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${r.slug}/demographie`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {r.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)] hidden sm:table-cell">{r.region ?? "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)]">{fmt(r.pop2022)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-tertiary)] hidden sm:table-cell">{fmt(r.pop2016)}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold text-red-600">
                      {signed(r.changePct, 1)} %
                      <span className="text-[10px] block text-[var(--text-tertiary)] font-normal">{fmt(r.gained)}</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-red-600 hidden md:table-cell">
                      {signed(r.annualPct, 2)} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Stable */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Les grandes villes stables
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Les dix communes les plus peuplées dont la variation annuelle reste sous le seuil
          d&apos;interprétation Insee (± 0,15 %/an). Une population qui ne bouge pas est
          rarement un accident : c&apos;est le signe d&apos;un marché du logement saturé qui
          renvoie les nouveaux arrivants en périphérie, exactement autant qu&apos;il n&apos;en
          perd vers l&apos;extérieur.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left hidden sm:table-cell">Région</th>
                  <th className="px-3 py-2 text-right">Pop. {INSEE_POP_YEAR}</th>
                  <th className="px-3 py-2 text-right">Variation</th>
                </tr>
              </thead>
              <tbody>
                {stable.map((r) => (
                  <tr key={r.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${r.slug}/demographie`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {r.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)] hidden sm:table-cell">{r.region ?? "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)]">{fmt(r.pop2022)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-tertiary)]">
                      {signed(r.changePct, 1)} %
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
              <strong className="text-[var(--text-primary)]">Source</strong> — {INSEE_POP_CREDIT},
              base « Évolution et structure de la population en 2022 » publiée en juin 2025. Les
              millésimes {INSEE_POP_BASE_YEAR} et {INSEE_POP_YEAR} figurent dans le même fichier,
              à périmètre communal constant ; les évolutions sont directement comparables.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Périmètre</strong> — 538 des 540
              villes du site couvertes. Mamoudzou (Mayotte) n&apos;est pas dans le fichier
              « France hors Mayotte » et Pierrefitte-sur-Seine a fusionné dans Saint-Denis
              au 1ᵉʳ janvier 2025, donc absente en géographie 2025.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Calcul</strong> — la variation
              totale est (pop {INSEE_POP_YEAR} − pop {INSEE_POP_BASE_YEAR}) / pop
              {" "}
              {INSEE_POP_BASE_YEAR} ; la variation annuelle est le taux d&apos;accroissement
              moyen géométrique sur six ans, plus honnête qu&apos;une division par le nombre
              d&apos;années. Une commune à +12,7 % sur six ans progresse en réalité de +2,0 %/an.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Filtre 15 000 habitants</strong> — en
              dessous, une variation d&apos;un point s&apos;explique souvent par un lotissement
              livré ou une correction méthodologique du recensement, pas par un mouvement
              démographique. Les fiches par ville affichent malgré tout le chiffre réel des
              autres communes.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Seuil de stabilité</strong> — l&apos;Insee
              recommande de ne pas interpréter une variation annuelle inférieure à
              0,15 %/an. Les communes qui restent dans cet intervalle sont regroupées à part,
              plutôt que présentées comme « en hausse » ou « en baisse ».
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Fichier consultable et téléchargeable sur{" "}
            <a
              href={INSEE_POP_SOURCE_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="underline hover:text-[var(--accent)]"
            >
              insee.fr
            </a>
            . Attribution Insee + Licence Ouverte Etalab affichée avec les chiffres.
          </p>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">Voir aussi</h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/demographie" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">👥</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Démographie composite</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Vieillissement, jeunes actifs, renouvellement — la vue à 4 dimensions
              </div>
            </Card>
          </Link>
          <Link href="/palmares" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Palmarès 8 axes</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Le score global 0-10 sur l&apos;ensemble du référentiel
              </div>
            </Card>
          </Link>
          <Link href="/tension-locative" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🔑</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Tension locative</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Croissance rapide + parc figé = marché tendu
              </div>
            </Card>
          </Link>
          <Link href="/red-flags/villes-fuite-jeunes-actifs" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🚩</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Fuite des jeunes actifs</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Le pendant éditorial : les communes que quittent en priorité les 25-35 ans
              </div>
            </Card>
          </Link>
          <Link href="/carte" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🗺️</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Carte de France</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Voir la répartition sur le territoire</div>
            </Card>
          </Link>
          <Link href="/regions" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🇫🇷</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Par région</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Zoomer sur une région administrative</div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
