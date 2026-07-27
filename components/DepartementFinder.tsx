"use client";
import { AreaFinder, type AreaEntry } from "./AreaFinder";

// Département flavour of AreaFinder. Kept as a thin wrapper so existing callers
// (/departements) don't move, and so the FR rendering stays byte-identical while
// /regions gets to reuse the same pattern.

export interface DeptEntry {
  dept: string;
  slug: string;
  num: string;
  count: number;
  avg: number;
}

export function DepartementFinder({
  depts,
  cityIndex,
}: {
  depts: DeptEntry[];
  /** [nom de ville, n° de département] — permet de trouver son département en tapant sa ville. */
  cityIndex: Array<[string, string]>;
}) {
  // Historical callers key the city index by dept NUMBER; AreaFinder keys by
  // slug (so régions can share it), so we translate here.
  const numToSlug = new Map(depts.map((d) => [d.num, d.slug]));
  const slugCityIndex = cityIndex
    .map(([name, num]) => [name, numToSlug.get(num) ?? ""] as [string, string])
    .filter(([, slug]) => slug);

  const areas: AreaEntry[] = depts.map((d) => ({
    slug: d.slug,
    label: d.dept,
    num: d.num,
    count: d.count,
    avg: d.avg,
  }));

  return (
    <AreaFinder
      areas={areas}
      cityIndex={slugCityIndex}
      hrefPrefix="/departements"
      sorts={["num", "az", "score"]}
      initialSort="num"
      copy={{
        placeholder: "33, Gironde, ou votre ville…",
        searchAria: "Chercher un département par numéro, par nom ou par ville",
        singular: "département",
        plural: "départements",
        emptyHint:
          "Aucun département pour « {q} ». Essayez un numéro (33), un nom (Gironde) ou une ville (Bordeaux).",
      }}
    />
  );
}
