import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { pathAlternates } from "@/lib/i18n";
import {
  PROTECTED_AREAS_CREDIT,
  PROTECTED_AREAS_URL,
  PROTECTED_RADIUS_KM,
} from "@/lib/biodiversity";
import {
  PROTECTION_ADHESION_ONLY,
  PROTECTION_CRAWLED_AT,
  PROTECTION_KIND_LABEL_FR,
  PROTECTION_MEDIAN_COVERAGE,
  PROTECTION_NO_PERIMETER,
  PROTECTION_RANKED_COUNT,
  PROTECTION_ZERO_COUNT,
  protectionRankingHead,
  rankByProtection,
  type ProtectionEntry,
} from "@/lib/protected-areas-ranking";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Villes entourées d'espaces naturels protégés — 2026",
  description:
    "Part du rayon de 15 km sous protection réglementaire autour des 540 villes du site : réserves, parcs nationaux et régionaux, Natura 2000, arrêtés de biotope.",
  alternates: pathAlternates("/espaces-proteges", "/protected-areas"),
  openGraph: {
    // Sans `images`, un openGraph de page remplace celui hérité de la racine
    // et la carte sociale disparaît entièrement.
    images: ["/opengraph-image"],
    title: "Villes françaises entourées d'espaces naturels protégés",
    description:
      "Classement 2026 des villes selon la part de leur rayon de 15 km couverte par une protection réglementaire. Périmètres MNHN via l'IGN BD TOPO®.",
  },
};

const NATIONAL_LIMIT = 40;
const BIG_CITY_LIMIT = 20;
const BIG_CITY_MIN_POP = 100_000;

function fmt(n: number): string {
  return n.toFixed(1).replace(".", ",");
}

/** Villes dont le seul polygone de parc national relevé est une aire d'adhésion :
 *  la colonne « protection la plus forte » le dit, plutôt que de laisser lire
 *  « parc national » là où il n'y a pas de cœur de parc. */
const ADHESION_ONLY_SLUGS = new Set(PROTECTION_ADHESION_ONLY.map((c) => c.slug));

function Row({ entry, rank, tied }: { entry: ProtectionEntry; rank: number; tied: boolean }) {
  return (
    <tr className="border-t border-[var(--border)]">
      <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums whitespace-nowrap">
        #{rank}
        {tied && <span className="ml-1 text-[10px] uppercase tracking-wide">ex æquo</span>}
      </td>
      <td className="px-3 py-2">
        <Link
          href={`/villes/${entry.city.slug}/biodiversite`}
          className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
        >
          {entry.city.name}
        </Link>
        <span className="block text-[11px] text-[var(--text-tertiary)]">
          {entry.city.region}
        </span>
      </td>
      <td className="px-3 py-2 text-right">
        <span className="font-bold tabular-nums text-emerald-700">
          {fmt(entry.coverage)}&nbsp;%
        </span>
      </td>
      <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
        {entry.areasTotal}
      </td>
      <td className="px-3 py-2 text-[var(--text-secondary)] hidden md:table-cell">
        {entry.strongest ? PROTECTION_KIND_LABEL_FR[entry.strongest] : "—"}
        {ADHESION_ONLY_SLUGS.has(entry.city.slug) && (
          <span className="block text-[10px] text-[var(--text-tertiary)]">aire d&apos;adhésion</span>
        )}
      </td>
      <td className="px-3 py-2 text-[11px] text-[var(--text-tertiary)] hidden lg:table-cell">
        {entry.topArea ?? "—"}
      </td>
    </tr>
  );
}

function Head() {
  return (
    <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
      <tr>
        <th className="px-3 py-2 text-left">#</th>
        <th className="px-3 py-2 text-left">Ville</th>
        <th className="px-3 py-2 text-right">Couverture</th>
        <th className="px-3 py-2 text-right hidden sm:table-cell">Périmètres</th>
        <th className="px-3 py-2 text-left hidden md:table-cell">Protection la plus forte</th>
        <th className="px-3 py-2 text-left hidden lg:table-cell">Plus grand périmètre</th>
      </tr>
    </thead>
  );
}

export default function EspacesProtegesPage() {
  const national = rankByProtection(NATIONAL_LIMIT);
  const big = rankByProtection(BIG_CITY_LIMIT, BIG_CITY_MIN_POP);
  const head = protectionRankingHead(national, 10);
  // Comptée, pas affirmée : « une seule grande ville figure au classement
  // national » vieillirait mal si la passe suivante bougeait.
  const bigInNational = national.tiers
    .flatMap((t) => t.entries)
    .filter((e) => e.city.population >= BIG_CITY_MIN_POP);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Espaces naturels protégés", path: "/espaces-proteges" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Quelles villes françaises sont les plus entourées d'espaces naturels protégés ?",
      a: `${head.entries
        .slice(0, 5)
        .map((e) => `${e.city.name} (${fmt(e.coverage)} % du rayon de ${PROTECTED_RADIUS_KM} km)`)
        .join(", ")}. La médiane des ${PROTECTION_RANKED_COUNT} villes mesurées est de ${fmt(
        PROTECTION_MEDIAN_COVERAGE,
      )} %.`,
    },
    {
      q: "Comment cette couverture est-elle calculée ?",
      a: `Un disque de ${PROTECTED_RADIUS_KM} km autour du centre de la commune est découpé en cellules de 250 m. Chaque cellule retient le niveau de protection le plus fort qui la couvre, ce qui évite de compter deux fois un sol protégé par plusieurs zonages superposés. La part obtenue est pondérée par le niveau : réserve naturelle et parc national 1, arrêté de biotope 0,8, Natura 2000 0,6, parc naturel régional 0,5.`,
    },
    {
      q: "Les ZNIEFF entrent-elles dans le calcul ?",
      a: "Non. Une ZNIEFF est un inventaire scientifique sans portée juridique : elle ne protège rien par elle-même. Seules les protections réglementaires comptent — réserves naturelles, parcs nationaux et régionaux, arrêtés de protection de biotope, sites Natura 2000.",
    },
    {
      q: "Une couverture élevée veut-elle dire que la nature est accessible ?",
      a: "Non, et c'est la limite principale de cet indicateur. Un périmètre réglementaire dit ce qu'on ne peut pas y faire, pas ce qu'on peut y voir : un site Natura 2000 recouvre souvent des terres agricoles ou privées, sans sentier ni accès public. Pour les parcs où l'on se promène, voir la sous-page « biodiversité » de chaque ville, qui liste aussi les espaces verts cartographiés.",
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Villes françaises entourées d'espaces naturels protégés",
            description:
              "Part du rayon de 15 km sous protection réglementaire autour de chaque ville.",
            // Un balisage ordonné là où la mesure ne départage pas serait un
            // classement fabriqué en données structurées.
            itemListOrder: head.ordered
              ? "https://schema.org/ItemListOrderDescending"
              : "https://schema.org/ItemListUnordered",
            numberOfItems: national.published,
            itemListElement: head.entries.map((entry, i) => ({
              "@type": "ListItem",
              ...(head.ordered ? { position: i + 1 } : {}),
              name: entry.city.name,
              url: `${BASE_URL}/villes/${entry.city.slug}/biodiversite`,
            })),
          }),
        }}
      />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">
            Accueil
          </Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Les villes les plus entourées d&apos;espaces naturels protégés
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl leading-relaxed">
          Combien de nature <em>réglementairement protégée</em> une ville a-t-elle autour
          d&apos;elle ? On découpe un disque de {PROTECTED_RADIUS_KM} km autour du centre de
          chaque commune en cellules de 250 m, on regarde ce que chaque cellule porte comme
          protection, et on publie la part du disque couverte. Médiane des{" "}
          {PROTECTION_RANKED_COUNT} villes mesurées : <strong>{fmt(PROTECTION_MEDIAN_COVERAGE)} %</strong>.
        </p>
        <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-3xl leading-relaxed">
          C&apos;est la seule des trois composantes de notre indicateur biodiversité qui se
          classe honnêtement d&apos;une ville à l&apos;autre, et c&apos;est désormais la seule
          qui porte encore une note : un arrêté de biotope existe qu&apos;un naturaliste passe
          par là ou non, alors que le nombre d&apos;espèces recensées mesure d&apos;abord la
          densité d&apos;observateurs — d&apos;où le retrait de notre rang de richesse le 10 août
          2026 — et que la surface d&apos;espaces verts, relevée sur OpenStreetMap, compte le
          polygone entier d&apos;un parc dans chacune des communes qu&apos;il touche, ce qui lui
          a coûté son rang le 31 août.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{PROTECTION_RANKED_COUNT} villes mesurées</Badge>
          <Badge>Rayon {PROTECTED_RADIUS_KM} km · grille 250 m</Badge>
          <Badge>Protections réglementaires seulement</Badge>
          {PROTECTION_CRAWLED_AT && <Badge>Périmètres arrêtés au {PROTECTION_CRAWLED_AT}</Badge>}
        </div>

        {/* Classement national */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Les {national.published} premières villes
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
          Sans filtre de population : le haut du tableau est donc dominé par des communes
          moyennes de montagne et de Méditerranée, dont le rayon de {PROTECTED_RADIUS_KM} km
          est presque entièrement rural. Les villes à égalité partagent le même rang — la
          couverture n&apos;a qu&apos;une décimale.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <Head />
              <tbody>
                {national.tiers.map((tier) =>
                  tier.entries.map((entry) => (
                    <Row
                      key={entry.city.slug}
                      entry={entry}
                      rank={tier.rank}
                      tied={tier.entries.length > 1}
                    />
                  )),
                )}
              </tbody>
            </table>
          </div>
        </Card>
        {national.nextTier && (
          <p className="mt-3 text-xs text-[var(--text-tertiary)] leading-relaxed">
            Le classement s&apos;arrête ici : {national.nextTier.count === 1 ? "la ville suivante est" : `les ${national.nextTier.count} villes suivantes sont`}{" "}
            à {fmt(national.nextTier.coverage)} % et publier une partie d&apos;un palier
            reviendrait à choisir au hasard.
          </p>
        )}

        {/* Grandes villes */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Et parmi les grandes villes ?
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
          Les {big.pool} communes de plus de 100 000 habitants du référentiel, entre elles.{" "}
          {bigInNational.length === 1
            ? `Une seule figure aussi au classement national ci-dessus, ${bigInNational[0].city.name} :`
            : `${bigInNational.length} d'entre elles figurent aussi au classement national ci-dessus :`}{" "}
          le disque d&apos;une métropole contient d&apos;abord la métropole, et la nature protégée
          commence au-delà.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <Head />
              <tbody>
                {big.tiers.map((tier) =>
                  tier.entries.map((entry) => (
                    <Row
                      key={entry.city.slug}
                      entry={entry}
                      rank={tier.rank}
                      tied={tier.entries.length > 1}
                    />
                  )),
                )}
              </tbody>
            </table>
          </div>
        </Card>
        {big.nextTier && (
          <p className="mt-3 text-xs text-[var(--text-tertiary)] leading-relaxed">
            {big.nextTier.count === 1 ? "La suivante est" : `Les ${big.nextTier.count} suivantes sont`}{" "}
            à {fmt(big.nextTier.coverage)} %.
          </p>
        )}

        {/* Bas de tableau */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Là où il n&apos;y a rien
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
          {PROTECTION_ZERO_COUNT} villes affichent une couverture qui s&apos;arrondit à
          0,0 % — un périmètre trop petit ou trop excentré pour peser sur le disque. Parmi
          elles, {PROTECTION_NO_PERIMETER.length} n&apos;ont <strong>aucun</strong> périmètre
          réglementaire à moins de {PROTECTED_RADIUS_KM} km :
        </p>
        <p className="mt-2 text-sm leading-relaxed">
          {PROTECTION_NO_PERIMETER.map((city, i) => (
            <span key={city.slug}>
              {i > 0 && <span className="text-[var(--text-tertiary)]"> · </span>}
              <Link
                href={`/villes/${city.slug}/biodiversite`}
                className="text-[var(--text-primary)] hover:text-[var(--accent)] hover:underline"
              >
                {city.name}
              </Link>
            </span>
          ))}
        </p>
        <p className="mt-2 text-xs text-[var(--text-tertiary)] leading-relaxed">
          Liste alphabétique, sans rang : elles sont toutes à la même valeur, et les
          ordonner reviendrait à publier l&apos;ordre de notre fichier de données. C&apos;est
          une mesure et non un trou de collecte — les cinq couches de la passe couvrent leur
          territoire, elles n&apos;y trouvent rien.
        </p>

        {/* Méthodologie */}
        <Card className="mt-12">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            Méthode, et ce que ce chiffre ne dit pas
          </h2>
          <div className="space-y-3 text-sm text-[var(--text-secondary)] leading-relaxed">
            <p>
              <strong>Une grille, pas une somme de surfaces.</strong> Les zonages français
              s&apos;emboîtent : un site Natura 2000 chevauche couramment une réserve et un
              parc régional. Additionner leurs surfaces compterait le même sol plusieurs fois
              et pourrait annoncer plus de 100 % du disque protégé. Chaque cellule de 250 m
              retient donc le niveau le plus fort qui la couvre, une seule fois.
            </p>
            <p>
              <strong>Pondérée par le niveau de protection.</strong> Réserve naturelle et
              parc national comptent 1, arrêté de protection de biotope 0,8, Natura 2000 0,6,
              parc naturel régional 0,5. Les deux niveaux de ZNIEFF sont hors calcul : c&apos;est
              un inventaire scientifique, sans portée juridique, et le compter reviendrait à
              dire qu&apos;un document protège autant qu&apos;un arrêté.
            </p>
            <p>
              <strong>Cœur de parc et aire d&apos;adhésion comptent pareil, faute de mieux.</strong>{" "}
              La source publie les deux comme des polygones de même type ; le cœur porte une
              réglementation propre, l&apos;aire d&apos;adhésion est une zone de charte sans
              interdiction générale. Sur {PROTECTION_ADHESION_ONLY.length} villes, le seul
              périmètre de parc national relevé est une aire d&apos;adhésion — {PROTECTION_ADHESION_ONLY
                .slice(0, 4)
                .map((c) => c.name)
                .join(", ")} en font partie. Leur couverture est donc un majorant.
            </p>
            <p>
              <strong>Protégé ne veut pas dire accessible.</strong> Un périmètre dit ce
              qu&apos;on ne peut pas y faire, pas ce qu&apos;on peut y voir : beaucoup de
              sites Natura 2000 recouvrent des terres agricoles ou privées, sans sentier. Pour
              les parcs où l&apos;on se promène vraiment, la sous-page biodiversité de chaque
              ville liste aussi les espaces verts cartographiés.
            </p>
            <p>
              <strong>Un disque, pas une commune.</strong> Le rayon de {PROTECTED_RADIUS_KM} km
              déborde largement les limites communales, volontairement : un massif protégé à
              12 km fait partie du cadre de vie, on y va le dimanche. En revanche il ne dit
              rien de ce qu&apos;on a au pied de son immeuble.
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              Périmètres :{" "}
              <a
                href={PROTECTED_AREAS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                {PROTECTED_AREAS_CREDIT}
              </a>
              {PROTECTION_CRAWLED_AT ? `, relevé arrêté au ${PROTECTION_CRAWLED_AT}` : ""}. Le
              chiffre affiché est celui de la passe, pas un état du jour : un classement de
              réserve postérieur n&apos;y figure pas encore.
            </p>
          </div>
        </Card>

        <p className="mt-8 text-xs text-[var(--text-tertiary)] text-center">
          Voir aussi la{" "}
          <Link href="/carte" className="underline">
            carte des villes
          </Link>
          , les{" "}
          <Link href="/classements" className="underline">
            classements par style de vie
          </Link>{" "}
          ou, ville par ville, la sous-page biodiversité accessible depuis chaque fiche.
        </p>
      </section>

      <Footer />
    </main>
  );
}
