import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AirRankingList } from "@/components/AirRankingList";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript, SITE_URL } from "@/lib/jsonld";
import { pathAlternates } from "@/lib/i18n";
import { CITIES_COUNT } from "@/lib/site-stats";
import { AIR_MEASURE_YEAR, AIR_REFERENCES, type AirPollutant } from "@/lib/city-air";
import {
  RANK_MAX_KM,
  RANKED_AIR_POLLUTANTS,
  airNationalStats,
  airRankEntries,
  airRankingHead,
  rankAir,
} from "@/lib/air-measured-ranking";

export const revalidate = false;

const LIMIT = 20;

const LABEL: Record<AirPollutant, string> = {
  no2: "Dioxyde d'azote (NO₂)",
  pm25: "Particules fines PM2.5",
  pm10: "Particules PM10",
  o3: "Ozone (O₃)",
};

const ABOUT: Record<AirPollutant, string> = {
  no2: "Émis surtout par le trafic routier, en particulier les moteurs diesel. C'est le marqueur le plus net de la pollution urbaine : il chute vite dès qu'on s'éloigne des grands axes.",
  pm25: "Particules de moins de 2,5 micromètres, issues du chauffage au bois, du trafic, de l'industrie et de l'agriculture. Ce sont celles qui pénètrent le plus profondément dans les poumons.",
  pm10: "Particules de moins de 10 micromètres : les mêmes sources que les PM2.5, plus l'usure des routes et les chantiers.",
  o3: "Polluant secondaire formé au soleil à partir d'autres polluants. Il culmine l'été, souvent loin des villes qui l'ont produit : les communes périurbaines et rurales du Sud y sont les plus exposées.",
};

const no2 = airNationalStats("no2");
// Derived, never written by hand: these sentences must stay true when the
// pipeline is rerun on a new year.
const no2Over2030 = airRankEntries("no2").filter((e) => e.measure.value > (AIR_REFERENCES.no2.eu2030 ?? Infinity));
const no2Over2030Idf = no2Over2030.filter((e) => e.region === "Île-de-France").length;
const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

export const metadata: Metadata = {
  title: `Qualité de l'air dans les villes de France — mesures ${AIR_MEASURE_YEAR}`,
  description: `Pollution de l'air mesurée en ${AIR_MEASURE_YEAR} par les stations officielles : les villes où l'air est le plus pur et le plus pollué (NO₂, particules fines, ozone), ${no2.pool} villes classées.`,
  alternates: pathAlternates("/qualite-de-l-air", "/air-quality"),
  openGraph: {
    images: ["/opengraph-image"],
    title: `Qualité de l'air dans les villes de France — mesures ${AIR_MEASURE_YEAR}`,
    description: "Classement des villes françaises selon la pollution de l'air mesurée en station : dioxyde d'azote, particules fines et ozone.",
  },
};

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
}

export default function QualiteAirPage() {
  const sections = RANKED_AIR_POLLUTANTS.map((p) => ({
    p,
    stats: airNationalStats(p),
    cleanest: rankAir(p, LIMIT, "cleanest"),
    worst: rankAir(p, LIMIT, "worst"),
  }));
  const head = airRankingHead(rankAir("no2", 10, "cleanest"));

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Qualité de l'air", path: "/qualite-de-l-air" },
  ]);
  const faq = faqJsonLd([
    {
      q: "D'où viennent ces chiffres ?",
      a: `Ce sont des mesures, pas des estimations : les moyennes annuelles ${AIR_MEASURE_YEAR} des stations des réseaux régionaux de surveillance (AASQA), compilées par le LCSQA et diffusées par l'Agence européenne pour l'environnement. Seules les données validées sont retenues, et une station doit couvrir au moins 75 % de l'année.`,
    },
    {
      q: "Pourquoi certaines villes ne sont-elles pas classées ?",
      a: `Une ville n'entre au classement que si la station de fond la plus proche est urbaine ou périurbaine et à moins de ${RANK_MAX_KM} km. Une station rurale lointaine mesure la campagne, pas la ville, et la ferait paraître plus propre qu'elle n'est. Ces villes gardent leur mesure, avec la distance, sur leur page « qualité de l'air ».`,
    },
    {
      q: "Pourquoi plusieurs villes ont-elles exactement la même valeur ?",
      a: "Le plus souvent parce qu'elles partagent la même station, ce qui arrive souvent en petite couronne ; parfois parce que deux stations différentes affichent la même moyenne au dixième près. Elles sont classées à égalité, par ordre alphabétique, chaque station est nommée, et une égalité n'est jamais coupée en fin de liste.",
    },
    {
      q: "Quels seuils faut-il regarder ?",
      a: "Pour le dioxyde d'azote, l'OMS recommande 10 µg/m³ en moyenne annuelle ; la limite européenne en vigueur est de 40, et passera à 20 en 2030. Pour les PM2.5, l'OMS recommande 5, l'Europe impose 25 aujourd'hui et 10 en 2030.",
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Villes françaises où le dioxyde d'azote mesuré est le plus bas (${AIR_MEASURE_YEAR})`,
          itemListOrder: head.ordered ? "https://schema.org/ItemListOrderAscending" : "https://schema.org/ItemListUnordered",
          numberOfItems: head.entries.length,
          itemListElement: head.entries.map((e, i) => ({
            "@type": "ListItem",
            ...(head.ordered ? { position: i + 1 } : {}),
            name: e.name,
            url: `${SITE_URL}/villes/${e.slug}/air`,
          })),
        })}
      />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link>
        </nav>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Qualité de l&apos;air dans les villes de France
        </h1>
        <p className="mt-3 max-w-3xl text-base text-[var(--text-secondary)] leading-relaxed">
          Ce que les stations officielles ont réellement mesuré en {AIR_MEASURE_YEAR}, ville par ville. Chaque
          valeur est la moyenne annuelle de la station « de fond » la plus proche, celle qui mesure l&apos;air des
          quartiers d&apos;habitation et non le bord des grands axes.{" "}
          {`${no2.pool} villes sont classées sur le dioxyde d'azote, à partir de ${no2.stations} stations.`}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Mesures validées {AIR_MEASURE_YEAR}</Badge>
          <Badge>Sources : AASQA · LCSQA · Agence européenne pour l&apos;environnement</Badge>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">{fmt(no2.median)}</div>
            <div className="text-xs text-[var(--text-secondary)]">µg/m³ de NO₂, médiane des villes classées</div>
          </Card>
          <Card>
            <div className="text-2xl font-bold tabular-nums text-amber-600">{no2.overWho}</div>
            <div className="text-xs text-[var(--text-secondary)]">villes au-dessus de la recommandation OMS (10)</div>
          </Card>
          <Card>
            <div className="text-2xl font-bold tabular-nums text-orange-600">{no2.overEu2030}</div>
            <div className="text-xs text-[var(--text-secondary)]">au-dessus de la future limite européenne de 2030 (20)</div>
          </Card>
          <Card>
            <div className="text-2xl font-bold tabular-nums text-emerald-600">{no2.overEu}</div>
            <div className="text-xs text-[var(--text-secondary)]">au-dessus de la limite européenne actuelle (40)</div>
          </Card>
        </div>
        <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-3xl">
          {no2.overEu === 0
            ? "Aucune station de fond ne dépasse aujourd'hui la limite européenne en vigueur. "
            : `${no2.overEu} villes dépassent la limite européenne en vigueur. `}
          {`${pct(no2.overWho ?? 0, no2.pool)} % des villes classées restent au-dessus de la recommandation de l'OMS, et la limite de 2030, deux fois plus stricte que l'actuelle, est déjà dépassée dans ${no2.overEu2030} villes${
            no2Over2030.length === 0 ? "" : no2Over2030Idf === no2Over2030.length ? ", toutes en Île-de-France" : `, dont ${no2Over2030Idf} en Île-de-France`
          }.`}
        </p>

        {sections.map(({ p, stats, cleanest, worst }) => (
          <div key={p} className="mt-12">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">{LABEL[p]}</h2>
            <p className="mt-2 max-w-3xl text-sm text-[var(--text-secondary)]">
              {ABOUT[p]}{" "}
              {p === "o3"
                ? `Mesure : nombre de jours où la moyenne sur 8 heures a dépassé 120 µg/m³ (valeur cible européenne : 25 jours par an au plus). Médiane : ${fmt(stats.median)} jours.`
                : `Recommandation OMS : ${AIR_REFERENCES[p].who} µg/m³ · limite européenne : ${AIR_REFERENCES[p].eu} (${AIR_REFERENCES[p].eu2030} en 2030). Médiane des ${stats.pool} villes classées : ${fmt(stats.median)} µg/m³.`}
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <AirRankingList ranking={cleanest} pollutant={p} title={p === "o3" ? "Le moins de jours de pic" : "L'air le moins chargé"} />
              <AirRankingList ranking={worst} pollutant={p} title={p === "o3" ? "Le plus de jours de pic" : "L'air le plus chargé"} />
            </div>
          </div>
        ))}

        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">Méthode</h2>
        <Card className="mt-3">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] list-disc pl-5">
            <li>
              Mesures horaires validées ({AIR_MEASURE_YEAR}) des stations des AASQA, compilées par le LCSQA (Licence
              Ouverte) et diffusées par l&apos;Agence européenne pour l&apos;environnement (CC BY 4.0). Position et type des
              stations : rapportage officiel de la France à l&apos;Union européenne.
            </li>
            <li>Une station doit couvrir au moins 75 % de l&apos;année avec des données valides.</li>
            <li>
              Pour chaque ville, la station de fond la plus proche. Classement réservé aux stations urbaines ou
              périurbaines à moins de {RANK_MAX_KM} km ; les autres villes affichent leur mesure, avec la distance, sur
              leur propre page.
            </li>
            <li>
              Une station mesure un point, pas toute une commune : le long d&apos;un boulevard, la pollution est
              nettement plus forte. Ce classement compare l&apos;air de fond, celui qu&apos;on respire chez soi.
            </li>
            <li>
              Distinct du{" "}
              <Link href="/classements/qualite-air" className="text-[var(--accent)] hover:underline">
                classement « qualité de l&apos;air » du site
              </Link>
              {`, qui est une estimation couvrant les ${CITIES_COUNT} villes, y compris celles sans station.`}
            </li>
          </ul>
        </Card>
      </section>

      <Footer />
    </main>
  );
}
