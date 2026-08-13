// Libellés anglais de la famille /vacations.
//
// Ils étaient recopiés dans chaque page EN de la famille (le hub, la page mois,
// la page profil), donc trois endroits où « Single-parent families » pouvait
// dériver sans que rien ne le signale. Une seule table ici, importée par les
// surfaces — les intros et meta descriptions, elles, restent propres à chaque
// page parce qu'elles sont éditoriales et pas interchangeables.
//
// Les libellés FR vivent dans `lib/vacation-fit.ts` (`VACATION_PROFILE_DEFS`) et
// `lib/vacation-seasons.ts` : ne pas les traduire ici, la lib FR n'a pas à
// connaître l'anglais.

import type { CityLight } from "@/lib/cities-light";
import type { VacationProfile } from "@/lib/vacation-fit";
import { monthSignal, type MonthIndex } from "@/lib/vacation-seasons";

export const EN_MONTH_SLUGS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
] as const;

export type EnMonthSlug = (typeof EN_MONTH_SLUGS)[number];

export const EN_MONTH_LABEL: Record<EnMonthSlug, string> = {
  january: "January", february: "February", march: "March",
  april: "April", may: "May", june: "June",
  july: "July", august: "August", september: "September",
  october: "October", november: "November", december: "December",
};

/** Index 1-12 → libellé anglais. */
export function enMonthLabel(month: MonthIndex): string {
  return EN_MONTH_LABEL[EN_MONTH_SLUGS[month - 1]];
}

export const EN_PROFILE_LABEL: Record<VacationProfile, string> = {
  famille: "Families",
  monoparental: "Single-parent families",
  couple: "Couples",
  solo: "Solo travellers",
  celibataire: "Single travellers",
  amis: "Groups of friends",
  seniors: "Seniors",
};

/**
 * Équivalent anglais de `VacationFit.whyOneLine`.
 *
 * La phrase de `lib/vacation-fit.ts` est rédigée en français et partait telle
 * quelle sur le domaine anglais — sur les cinq surfaces EN de la famille
 * /vacations. Sans mois ni activité elle se réduisait même à « … reste un choix
 * correct mais sans signal saisonnier marqué. » sur **chaque** carte (pages
 * profil et région). On la rebâtit ici, au site d'affichage, plutôt que
 * d'angliciser la lib : c'est la règle du projet pour une chaîne qui naît dans
 * une lib partagée.
 *
 * ⚠️ Les seuils (22 / 16 / 5 °C, 6 jours de pluie, affluence ≤ 2 et ≥ 4, score
 * d'activité ≥ 7,5) et les valeurs affichées sont **exactement** ceux de
 * `buildWhyLine`. Une page EN est l'alternate hreflang de sa jumelle FR : elles
 * doivent montrer le même nombre pour la même ville. Modifier un seuil ici sans
 * le modifier là-bas est un bug, pas une variante éditoriale.
 *
 * `activityLabel` se passe déjà traduit (les libellés d'activité vivent au site
 * d'affichage, cf. `EN_ACTIVITY_LABELS`), avec le `fit.activityScore` qui va
 * avec — sans lui le seuil ne peut pas être appliqué et la mention est omise.
 */
export function enWhyLine(
  city: CityLight,
  opts: { month?: MonthIndex; activityLabel?: string; activityScore?: number } = {},
): string {
  const bits: string[] = [];
  if (opts.month) {
    const signal = monthSignal(city, opts.month);
    if (signal.tempAvg >= 22) bits.push(`${signal.tempAvg} °C on average`);
    else if (signal.tempAvg >= 16) bits.push(`mild (${signal.tempAvg} °C)`);
    else if (signal.tempAvg <= 5) bits.push(`proper winter (${signal.tempAvg} °C)`);
    if (signal.rainDays <= 6) bits.push("little rain");
    if (signal.crowded <= 2) bits.push("no crowds");
    else if (signal.crowded >= 4) bits.push("very busy");
  }
  if (opts.activityLabel && (opts.activityScore ?? 0) >= 7.5) {
    bits.push(`a benchmark for ${opts.activityLabel.toLowerCase()}`);
  }
  if (bits.length === 0) {
    return `${city.name} is a sound choice, with no strong seasonal signal either way.`;
  }
  return `${city.name}: ${bits.slice(0, 3).join(", ")}.`;
}
