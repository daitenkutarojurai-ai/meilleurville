// Sondages du 1er tour de la présidentielle 2027 — base de la projection par
// ville (`lib/presidential-2027.ts`). Petit fichier, sûr côté client.
//
// Mise à jour : remplacer `POLLS_2027` par les 6 dernières enquêtes publiées
// (hypothèse avec la candidate RN réellement testée par tous les instituts),
// recopier les scores tels que publiés, mettre à jour `POLLS_2027_AS_OF`.
// Source de la liste : la page Wikipédia « Liste de sondages sur l'élection
// présidentielle française de 2027 », qui renvoie vers chaque notice d'institut.
// Une enquête peut ne pas sommer à 100 (candidats non listés, hypothèses
// partielles) : chaque sondage est ramené à 100 avant la moyenne.

import type { Bloc } from "@/lib/political-lean-meta";

export type Candidate2027 =
  | "arthaud" | "melenchon" | "roussel" | "tondelier" | "glucksmann"
  | "attal" | "philippe" | "retailleau"
  | "dupont-aignan" | "lepen" | "zemmour";

/** Même découpage que les familles 2022 de `lib/political-lean-meta.ts`. */
export const BLOC_2027: Record<Candidate2027, Bloc> = {
  arthaud: "extreme_gauche", melenchon: "gauche", roussel: "gauche", tondelier: "gauche", glucksmann: "gauche",
  attal: "centre", philippe: "centre",
  retailleau: "droite", "dupont-aignan": "droite",
  lepen: "extreme_droite", zemmour: "extreme_droite",
};

export const CANDIDATE_2027_NAME: Record<Candidate2027, string> = {
  arthaud: "Arthaud", melenchon: "Mélenchon", roussel: "Roussel", tondelier: "Tondelier",
  glucksmann: "Glucksmann", attal: "Attal", philippe: "Philippe", retailleau: "Retailleau",
  "dupont-aignan": "Dupont-Aignan", lepen: "Le Pen", zemmour: "Zemmour",
};

export interface Poll2027 {
  institute: string;
  fieldwork: string; // tel que publié
  sample: number;
  scores: Partial<Record<Candidate2027, number>>;
}

export const POLLS_2027_AS_OF = "2026-10-16";

export const POLLS_2027: Poll2027[] = [
  { institute: "OpinionWay", fieldwork: "13-14 oct. 2026", sample: 1043,
    scores: { arthaud: 1, melenchon: 15, roussel: 1, tondelier: 2, glucksmann: 13, attal: 5, philippe: 12, retailleau: 6, "dupont-aignan": 1, lepen: 35, zemmour: 5 } },
  { institute: "Ifop", fieldwork: "12-14 oct. 2026", sample: 1390,
    scores: { arthaud: 0, melenchon: 16, roussel: 2, tondelier: 2, glucksmann: 11.5, attal: 5, philippe: 13, retailleau: 5, "dupont-aignan": 1, lepen: 32, zemmour: 3 } },
  { institute: "Harris Interactive", fieldwork: "5-8 oct. 2026", sample: 2004,
    scores: { arthaud: 1, melenchon: 19, roussel: 2, tondelier: 5, glucksmann: 7, attal: 12, retailleau: 10, "dupont-aignan": 2, lepen: 37, zemmour: 5 } },
  { institute: "Odoxa", fieldwork: "24 sept.-7 oct. 2026", sample: 12005,
    scores: { arthaud: 0.5, melenchon: 18, roussel: 2, tondelier: 3, glucksmann: 9.5, philippe: 17, retailleau: 6.5, "dupont-aignan": 2, lepen: 37, zemmour: 4.5 } },
  { institute: "Ifop", fieldwork: "25-29 sept. 2026", sample: 1527,
    scores: { arthaud: 0.5, melenchon: 15, roussel: 2.5, tondelier: 3, glucksmann: 11, attal: 8, philippe: 16, retailleau: 7, "dupont-aignan": 1, lepen: 32, zemmour: 4 } },
  { institute: "Harris Interactive", fieldwork: "22-24 sept. 2026", sample: 1974,
    scores: { arthaud: 1, melenchon: 17, roussel: 3, tondelier: 5, glucksmann: 8, attal: 13, retailleau: 10, "dupont-aignan": 2, lepen: 36, zemmour: 5 } },
];

/** Résultat national officiel du 1er tour 2022 (Conseil constitutionnel),
 *  regroupé avec les mêmes familles que les résultats communaux. */
export const NATIONAL_2022_BLOCS: Record<Bloc, number> = {
  // Arthaud 0,56 + Poutou 0,77
  extreme_gauche: 1.33,
  // Roussel 2,28 + Mélenchon 21,95 + Hidalgo 1,75 + Jadot 4,63
  gauche: 30.61,
  // Macron
  centre: 27.85,
  // Pécresse 4,78 + Lassalle 3,13 + Dupont-Aignan 2,06 (droite souverainiste, DSV)
  droite: 9.97,
  // Le Pen 23,15 + Zemmour 7,07
  extreme_droite: 30.22,
};
