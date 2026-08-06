// English labels for the fiscalité engine (`lib/fiscalite.ts`).
//
// The engine itself stays French-only: it is the FR site's source of truth and
// its `tierLabel` / `notes` are FR editorial copy. What is shared with the EN
// side are the **numbers** — `taxeFonciereT3`, `dmtoDroitsPercent`,
// `zoneTendue` — which must be identical on both locales, since a FR page and
// its EN twin are hreflang alternates.
//
// The ranges below are therefore not a second dataset: each one is the exact
// FR string from `TIER_DATA` / `PARTICULIER_*` re-typeset in English number
// format (€ prefix, comma thousands separator). If a range changes in
// `lib/fiscalite.ts`, change it here too — that is the only coupling.
//
// Lives in a lib rather than at the display site because two EN surfaces now
// need it (`/cities/[slug]/tax` and `/departments/[dept]/tax`) and a copy in
// each is a copy that drifts.

import { fiscalityForCity, type FiscaliteTier } from "@/lib/fiscalite";

// The `particulier` tier of the FR enum lumps together two cases that read very
// differently to a foreign buyer, so the EN side splits them back out.
export type FiscStateEn = Exclude<FiscaliteTier, "particulier"> | "paris" | "drom";

export const FISC_EN: Record<FiscStateEn, { label: string; taxeFonciere: string; notes: string }> = {
  faible: {
    label: "Low tax pressure",
    taxeFonciere: "€550-900/year",
    notes:
      "Relatively low tax pressure. The municipal property-tax rate is historically moderate and the cadastral rental base is typically low.",
  },
  moderee: {
    label: "Moderate tax pressure",
    taxeFonciere: "€900-1,300/year",
    notes:
      "A department around the national average. The municipal property tax varies by commune (roughly ±30% around the department average).",
  },
  elevee: {
    label: "High tax pressure",
    taxeFonciere: "€1,300-1,800/year",
    notes:
      "High tax pressure — housing costs and urban services push rates up. Always check the property tax on the seller's latest assessment notice.",
  },
  "tres-elevee": {
    label: "Very high tax pressure",
    taxeFonciere: "€1,700-2,400/year",
    notes:
      "Among the heaviest tax pressure in France. Always verify the property tax and any second-home surcharge before buying — it can add €100-200/month to a budget or eat into rental yield.",
  },
  paris: {
    label: "Special case — Paris",
    taxeFonciere: "€1,100-1,600/year",
    notes:
      "Paris has historically had one of the lowest municipal property-tax rates (~13.5% in 2024 after reform) but very high cadastral bases. The second-home tax surcharge can reach +60% since 2023 (Paris is a 'zone tendue').",
  },
  drom: {
    label: "Special case — overseas France",
    taxeFonciere: "€700-1,400/year",
    notes:
      "A specific overseas tax regime: reduced transfer duties (4.50% instead of 5.81% elsewhere), some partial exemptions, but highly variable municipal levies. Always confirm with a local notary.",
  },
};

export const DROM_REGIONS_EN = new Set(["Martinique", "Guadeloupe", "La Réunion", "Mayotte", "Guyane"]);

/** Which EN copy block applies, from the same (department, region) pair the FR engine reads. */
export function fiscStateEn(opts: { department: string; region: string }): FiscStateEn {
  if (DROM_REGIONS_EN.has(opts.region)) return "drom";
  if (opts.department === "Paris") return "paris";
  const f = fiscalityForCity(opts);
  return f.tier === "particulier" ? "moderee" : f.tier;
}
