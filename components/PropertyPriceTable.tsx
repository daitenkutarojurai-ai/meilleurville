import {
  cityPropertyPrices,
  houseApartmentGap,
  priceRank,
  MEDIAN_APARTMENT_M2,
  MEDIAN_HOUSE_M2,
  PRICE_MIN_SALES,
  DVF_CREDIT,
  DVF_LICENCE,
  DVF_SOURCE_URL,
  type PropertyPriceStat,
} from "@/lib/property-prices";
import { Building2, Home as HomeIcon } from "lucide-react";

/**
 * Prix d'achat au m² mesurés, appartement et maison séparément.
 *
 * Server component : les pages logement / housing sont statiques et ce bloc
 * n'a aucune interactivité, donc il ne doit rien envoyer au bundle client —
 * `data/city-property-prices.json` fait plusieurs centaines de kilo-octets.
 *
 * Le bloc rend `null` quand la ville n'a aucun prix publiable *et* que DVF la
 * couvre : il n'y a alors rien à dire de plus que ce que la ligne « prix
 * d'achat moyen » du tableau des loyers dit déjà. En revanche, quand la commune
 * est **hors DVF** (livre foncier d'Alsace-Moselle, Mayotte) ou quand un type de
 * bien est sous le seuil d'effectif, le bloc s'affiche et dit pourquoi : un
 * blanc silencieux se lit comme un oubli.
 */

function fmt(n: number, locale: "fr" | "en") {
  return n.toLocaleString(locale === "en" ? "en-GB" : "fr-FR");
}

/** « 1ʳᵉ » et non « 1ᵉ » côté français ; côté anglais le suffixe dépend des
 *  deux derniers chiffres (21st, mais 11th). */
function ordinal(n: number, locale: "fr" | "en") {
  if (locale === "fr") return n === 1 ? "1ʳᵉ" : `${n}ᵉ`;
  const rest = n % 100;
  if (rest >= 11 && rest <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}

function Row({
  stat,
  label,
  icon,
  benchmark,
  rank,
  locale,
}: {
  stat: PropertyPriceStat | undefined;
  label: string;
  icon: React.ReactNode;
  benchmark: number;
  rank: { rank: number; total: number } | null;
  locale: "fr" | "en";
}) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  if (!stat) return null;

  if (!stat.medianM2) {
    return (
      <div className="px-5 py-4 border-b border-[var(--border)] last:border-b-0">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          {icon}
          {label}
        </div>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {L(
            `${fmt(stat.sales, locale)} vente${stat.sales > 1 ? "s" : ""} sur la période — sous le seuil de ${PRICE_MIN_SALES} qu'il faut pour qu'une médiane veuille dire quelque chose. L'effectif est exact ; le prix ne serait qu'un accident d'échantillon.`,
            `${stat.sales} sale${stat.sales > 1 ? "s" : ""} over the period — below the ${PRICE_MIN_SALES} needed for a median to mean anything. The count is exact; the price would just be a sampling accident.`,
          )}
        </p>
      </div>
    );
  }

  const vsBenchmark = Math.round(((stat.medianM2 - benchmark) / benchmark) * 100);

  return (
    <div className="px-5 py-4 border-b border-[var(--border)] last:border-b-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          {icon}
          {label}
        </div>
        <div className="text-lg font-bold text-[var(--text-primary)] tabular-nums">
          {fmt(stat.medianM2, locale)} €/m²
        </div>
      </div>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-tertiary)]">
        {stat.p25M2 && stat.p75M2 ? (
          <span>
            {L("Moitié des ventes entre", "Half of sales between")}{" "}
            <span className="tabular-nums">{fmt(stat.p25M2, locale)}</span>{" "}
            {L("et", "and")}{" "}
            <span className="tabular-nums">{fmt(stat.p75M2, locale)} €/m²</span>
          </span>
        ) : null}
        <span className="tabular-nums">
          {fmt(stat.sales, locale)} {L("ventes retenues", "sales included")}
        </span>
        {rank ? (
          <span>
            {L(
              `${ordinal(rank.rank, "fr")} ville la plus chère sur ${rank.total}`,
              `${ordinal(rank.rank, "en")} priciest of ${rank.total} cities`,
            )}
          </span>
        ) : null}
        <span>
          {vsBenchmark === 0
            ? L("au niveau de la médiane des villes", "level with the median city")
            : L(
                `${vsBenchmark > 0 ? "+" : ""}${vsBenchmark} % vs médiane des villes`,
                `${vsBenchmark > 0 ? "+" : ""}${vsBenchmark}% vs median city`,
              )}
        </span>
      </div>
    </div>
  );
}

export function PropertyPriceTable({
  slug,
  name,
  locale = "fr",
}: {
  slug: string;
  name: string;
  locale?: "fr" | "en";
}) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const data = cityPropertyPrices(slug);
  if (!data) return null;

  const heading = (
    <h2 className="text-lg font-bold text-[var(--text-primary)]">
      {L("Prix au m² : appartement ou maison", "Price per m²: flat or house")}
    </h2>
  );

  if (data.coverage !== "dvf") {
    return (
      <section>
        <div className="mb-4">{heading}</div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4 text-sm text-[var(--text-secondary)]">
          {data.coverage === "livre-foncier"
            ? L(
                `Aucun prix mesuré pour ${name} : le Bas-Rhin, le Haut-Rhin et la Moselle relèvent du livre foncier, un régime de publicité foncière distinct du reste de la France, et leurs ventes ne sont pas publiées dans la base DVF. Ce n'est pas un trou de collecte de notre côté — la donnée n'existe pas dans cette source, et n'y viendra pas.`,
                `No measured prices for ${name}: Bas-Rhin, Haut-Rhin and Moselle come under the livre foncier, a land-registration regime separate from the rest of France, and their sales are not published in the DVF database. This is not a gap in our collection — the data does not exist in that source, and will not appear there.`,
              )
            : L(
                `Aucun prix mesuré pour ${name} : la base DVF ne publie pas de transactions pour cette commune.`,
                `No measured prices for ${name}: the DVF database publishes no transactions for this commune.`,
              )}
        </div>
      </section>
    );
  }

  const gap = houseApartmentGap(slug);
  const hasAny = Boolean(data.apartment?.medianM2 || data.house?.medianM2);
  if (!hasAny && !data.apartment?.sales && !data.house?.sales) return null;

  const [from, to] = [data.years[0], data.years[data.years.length - 1]];

  return (
    <section>
      <div className="mb-4">{heading}</div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
        <Row
          stat={data.apartment}
          label={L("Appartement", "Flat")}
          icon={<Building2 className="h-4 w-4 text-[var(--accent)]" />}
          benchmark={MEDIAN_APARTMENT_M2}
          rank={priceRank(slug, "apartment")}
          locale={locale}
        />
        <Row
          stat={data.house}
          label={L("Maison", "House")}
          icon={<HomeIcon className="h-4 w-4 text-[var(--accent)]" />}
          benchmark={MEDIAN_HOUSE_M2}
          rank={priceRank(slug, "house")}
          locale={locale}
        />
      </div>

      {gap !== null ? (
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          {gap === 0
            ? L(
                `À ${name}, les deux marchés se tiennent : le m² d'une maison vaut à peu près celui d'un appartement.`,
                `In ${name}, the two markets sit level: a house square metre is worth roughly a flat one.`,
              )
            : gap > 0
              ? L(
                  `À ${name}, le m² d'une maison se paie ${gap} % de plus que celui d'un appartement — mais le prix d'une maison comprend son terrain, que le m² ne compte pas.`,
                  `In ${name}, a house square metre costs ${gap}% more than a flat one — though a house price includes its land, which the square metre does not count.`,
                )
              : L(
                  `À ${name}, le m² d'une maison se paie ${Math.abs(gap)} % de moins que celui d'un appartement : les maisons sont plus grandes et plus périphériques, l'appartement se paie sa centralité.`,
                  `In ${name}, a house square metre costs ${Math.abs(gap)}% less than a flat one: houses are bigger and further out, while flats are paying for the centre.`,
                )}
        </p>
      ) : null}

      <p className="mt-2 text-xs text-[var(--text-tertiary)]">
        {L(
          `Médiane des ventes réellement enregistrées à ${name} entre ${from} et ${to}, et non une estimation : chaque prix vient d'un acte. Seules les ventes portant un seul logement sont retenues — une vente d'immeuble rapporterait le prix entier à la surface d'un lot. Le prix d'une maison inclut le terrain, et les garages ou caves vendus avec un logement comptent dans le prix sans compter dans la surface : le €/m² maison et le €/m² appartement ne se comparent donc pas à l'euro près. La ligne « prix d'achat moyen » du tableau ci-dessus est un repère éditorial tous biens confondus, elle ne mesure pas la même chose.`,
          `Median of sales actually recorded in ${name} between ${from} and ${to}, not an estimate: every price comes from a deed. Only sales covering a single dwelling are kept — a whole-building sale would put the entire price against one unit's floor area. A house price includes its land, and garages or cellars sold with a dwelling count towards the price but not the floor area: house and flat €/m² are therefore not comparable to the euro. The "average purchase price" line in the table above is an editorial benchmark across all property types, and does not measure the same thing.`,
        )}
      </p>
      <p className="mt-1 text-xs text-[var(--text-tertiary)]">
        {L("Source", "Source")} :{" "}
        <a
          href={DVF_SOURCE_URL}
          rel="nofollow noopener noreferrer"
          target="_blank"
          className="underline hover:text-[var(--accent)]"
        >
          {DVF_CREDIT}
        </a>{" "}
        · {DVF_LICENCE}
      </p>
    </section>
  );
}
