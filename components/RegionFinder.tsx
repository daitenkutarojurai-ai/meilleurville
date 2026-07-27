"use client";
import { AreaFinder, type AreaEntry } from "./AreaFinder";

// Région flavour of AreaFinder. 18 régions (13 métro + 5 DROM), pas de numéro
// administratif — donc pas de tri « N° ». Le vrai gain d'ergonomie est la
// recherche par ville : le visiteur connaît sa commune, rarement le nom exact
// de sa région.

export interface RegionEntry {
  region: string;
  slug: string;
  count: number;
  avg: number;
  /** Emoji facultatif — servi tel quel côté FR pour rester cohérent avec les
   *  cards régions. AreaFinder n'affiche pas de badge séparé, on préfixe le
   *  label. */
  emoji?: string;
}

export function RegionFinder({
  regions,
  cityIndex,
  locale = "fr",
}: {
  regions: RegionEntry[];
  /** [nom de ville, slug de la région] — permet de trouver sa région en tapant sa ville. */
  cityIndex: Array<[string, string]>;
  locale?: "fr" | "en";
}) {
  const areas: AreaEntry[] = regions.map((r) => ({
    slug: r.slug,
    label: r.emoji ? `${r.emoji} ${r.region}` : r.region,
    count: r.count,
    avg: r.avg,
  }));

  const en = locale === "en";

  return (
    <AreaFinder
      areas={areas}
      cityIndex={cityIndex}
      hrefPrefix={en ? "/regions" : "/regions"}
      sorts={["az", "score"]}
      initialSort="az"
      copy={
        en
          ? {
              placeholder: "Brittany, or your city…",
              searchAria: "Search a region by name or by city",
              singular: "region",
              plural: "regions",
              emptyHint:
                "No region for « {q} ». Try a name (Brittany) or a city (Rennes).",
            }
          : {
              placeholder: "Bretagne, ou votre ville…",
              searchAria: "Chercher une région par nom ou par ville",
              singular: "région",
              plural: "régions",
              emptyHint:
                "Aucune région pour « {q} ». Essayez un nom (Bretagne) ou une ville (Rennes).",
            }
      }
    />
  );
}
