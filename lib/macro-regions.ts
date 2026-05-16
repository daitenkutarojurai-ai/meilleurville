// F22 — Macro-régions thématiques (zones transrégionales).
//
// Les régions administratives FR ne capturent pas certaines réalités
// géographiques utiles à un projet de relocation : la côte atlantique
// (Bretagne + Pays-de-la-Loire + Nouvelle-Aquitaine), l'arc méditerranéen
// (Occitanie + PACA + Corse), etc.
//
// Chaque macro-région = sélection éditoriale de départements + déduction
// des villes qui en font partie.

import type { CitySeed } from "@/data/cities-seed";
import { CITIES_SEED } from "@/data/cities-seed";

export interface MacroRegionDef {
  slug: string;
  emoji: string;
  label: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  departments: string[]; // matching CitySeed.department
}

export const MACRO_REGIONS: MacroRegionDef[] = [
  {
    slug: "cote-atlantique",
    emoji: "🌊",
    label: "Côte atlantique",
    metaTitle: "Meilleures villes côte atlantique 2026 — Bretagne, Loire, Aquitaine",
    metaDescription: "Top villes de la côte atlantique française : de Brest à Biarritz, en passant par Nantes, La Rochelle, Bordeaux. Climat océanique, surf, vie maritime.",
    intro:
      "La côte atlantique française s'étire sur 2 700 km de Brest à la frontière espagnole. Climat océanique : hivers doux, étés tempérés (sauf pic local), vent ouest dominant. Cette macro-région réunit les villes côtières des trois régions atlantiques (Bretagne, Pays de la Loire, Nouvelle-Aquitaine). Ambiance commune : maritime, surf et voile accessibles, gastronomie de la mer, mais des prix qui ont grimpé fort depuis 2020.",
    departments: [
      "Finistère",
      "Côtes-d'Armor",
      "Morbihan",
      "Loire-Atlantique",
      "Vendée",
      "Charente-Maritime",
      "Gironde",
      "Landes",
      "Pyrénées-Atlantiques",
    ],
  },
  {
    slug: "arc-mediterraneen",
    emoji: "☀️",
    label: "Arc méditerranéen",
    metaTitle: "Meilleures villes arc méditerranéen 2026 — Occitanie, PACA, Corse",
    metaDescription: "Top villes de l'arc méditerranéen français : Perpignan, Montpellier, Marseille, Nice. Climat chaud, mer omniprésente, prix élevés sur la côte d'Azur.",
    intro:
      "L'arc méditerranéen, de Perpignan à Menton plus la Corse. 2 800+ h de soleil/an, étés franchement chauds (40 °C de plus en plus fréquents), mer Méditerranée à portée. Prix premium sur la côte d'Azur, plus accessibles côté Occitanie. Tourisme massif en juillet-août : à arbitrer dans le projet de vie.",
    departments: [
      "Pyrénées-Orientales",
      "Aude",
      "Hérault",
      "Gard",
      "Bouches-du-Rhône",
      "Var",
      "Alpes-Maritimes",
      "Corse-du-Sud",
      "Haute-Corse",
    ],
  },
  {
    slug: "arc-alpin",
    emoji: "⛰️",
    label: "Arc alpin",
    metaTitle: "Meilleures villes arc alpin 2026 — Savoie, Haute-Savoie, Isère",
    metaDescription: "Top villes de l'arc alpin français : Annecy, Chambéry, Grenoble, Thonon. Lacs, ski, randonnée, tech (Grenoble). Climat continental tempéré par la montagne.",
    intro:
      "L'arc alpin français : de Genève (frontière) à Nice (alpes-maritimes). Lacs (Annecy, Léman, Bourget), ski l'hiver, randonnée l'été, et un cluster tech à Grenoble. Climat continental adouci par la montagne. Prix premium sur les villes-vitrines (Annecy notamment), plus accessibles sur les vallées moins exposées.",
    departments: [
      "Haute-Savoie",
      "Savoie",
      "Isère",
      "Hautes-Alpes",
      "Alpes-de-Haute-Provence",
      "Drôme",
      "Ain",
    ],
  },
  {
    slug: "sud-ouest-gascon",
    emoji: "🍷",
    label: "Sud-Ouest gascon",
    metaTitle: "Meilleures villes sud-ouest gascon 2026 — Périgord, Dordogne, Pays Basque",
    metaDescription: "Top villes du sud-ouest gascon français : Périgueux, Bayonne, Pau, Sarlat. Gastronomie, rugby, climat doux atlantique. Ambiance régionale forte.",
    intro:
      "Le Sud-Ouest gascon : un territoire mental aussi bien que géographique. Pays Basque, Béarn, Dordogne, Lot — gastronomie de canard, rugby, surf et montagnes pyrénéennes accessibles. Climat doux atlantique tempéré. Identité régionale très forte. Prix accessibles dans l'arrière-pays, plus chers sur la côte basque (Biarritz, Bayonne).",
    departments: [
      "Pyrénées-Atlantiques",
      "Landes",
      "Hautes-Pyrénées",
      "Gers",
      "Dordogne",
      "Lot",
      "Lot-et-Garonne",
      "Tarn-et-Garonne",
      "Gironde",
    ],
  },
  {
    slug: "vallee-du-rhone",
    emoji: "🍇",
    label: "Vallée du Rhône",
    metaTitle: "Meilleures villes vallée du Rhône 2026 — Lyon, Valence, Avignon",
    metaDescription: "Top villes de la vallée du Rhône : Lyon, Vienne, Valence, Avignon. Axe TGV majeur, climat de plus en plus chaud, gastronomie, accès Méditerranée + Alpes.",
    intro:
      "La vallée du Rhône : l'axe TGV qui descend de Lyon à la Méditerranée. Climat continental qui se mediterranéise (étés caniculaires de plus en plus marqués). Gastronomie de classe mondiale (lyonnaise, drômoise, vauclusienne). Accessibilité top — Paris, Marseille, Genève, et les Alpes à moins de 2 h. Vins (côtes du Rhône) omniprésents.",
    departments: [
      "Métropole de Lyon",
      "Rhône",
      "Ain",
      "Isère",
      "Drôme",
      "Ardèche",
      "Vaucluse",
      "Gard",
      "Bouches-du-Rhône",
    ],
  },
  {
    slug: "ile-de-france-elargie",
    emoji: "🗼",
    label: "Île-de-France élargie",
    metaTitle: "Meilleures villes Île-de-France élargie 2026 — Banlieue + ville TGV",
    metaDescription: "Top villes de l'Île-de-France élargie : grande couronne + villes TGV à moins d'1h30 de Paris (Rouen, Reims, Orléans, Chartres, Lille).",
    intro:
      "Île-de-France élargie : la grande couronne francilienne PLUS les villes accessibles à Paris en moins d'1h30 par TGV. Pour qui veut garder un pied à Paris (travail, famille) sans en payer le prix : Rouen, Reims, Orléans, Lille, Chartres. Compromis fréquent post-COVID.",
    departments: [
      "Paris",
      "Seine-et-Marne",
      "Yvelines",
      "Essonne",
      "Hauts-de-Seine",
      "Seine-Saint-Denis",
      "Val-de-Marne",
      "Val-d'Oise",
      "Oise",
      "Eure",
      "Seine-Maritime",
      "Loiret",
      "Eure-et-Loir",
      "Marne",
      "Nord",
    ],
  },
];

export const MACRO_REGION_SLUGS = MACRO_REGIONS.map((m) => m.slug);

export function getMacroRegion(slug: string): MacroRegionDef | undefined {
  return MACRO_REGIONS.find((m) => m.slug === slug);
}

export function citiesInMacroRegion(macro: MacroRegionDef): CitySeed[] {
  const deptSet = new Set(macro.departments);
  return CITIES_SEED.filter((c) => c.department && deptSet.has(c.department));
}

export function rankInMacroRegion(macro: MacroRegionDef, limit = 30): CitySeed[] {
  return citiesInMacroRegion(macro)
    .sort((a, b) => b.scores.global - a.scores.global)
    .slice(0, limit);
}
