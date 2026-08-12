// Croisement mois × profil : « où partir en avril en famille monoparentale ».
//
// Le moteur (`topCitiesForMonth` + `profile`) savait déjà répondre depuis F61 ;
// ce module ne porte que l'adressage de la surface.
//
// ⚠️ **Pourquoi un slug plat et sans accent, et pas `/vacances/mois/[mois]/[profil]`.**
// La route imbriquée a été écrite, testée sur les 84 combinaisons, puis retirée.
// Deux comportements observés sous Next 16.2.9 (`next dev`, Turbopack) :
//   ① **à froid, elle n'existait pas.** Un démarrage propre du serveur de dev
//      répondait 404 sur `/vacances/mois/avril/monoparental` — slug pourtant
//      sans accent — sans jamais compiler la route ; il fallait un `touch` du
//      fichier pour qu'elle soit enfin découverte. Le défaut est propre à
//      l'imbriqué : la route plate se compile dès la première requête.
//   ② **les slugs accentués répondent par intermittence** : `d%C3%A9cembre`,
//      `ao%C3%BBt`, `f%C3%A9vrier` alternent 200 et 500 avec « Page … is
//      missing param … which is required with "output: export" config ».
// ⚠️ Le point ② n'est **pas** imputable à l'imbrication : la route parente
// `/vacances/mois/[mois]`, inchangée et en ligne depuis des mois, échoue
// exactement pareil en dev sur ces trois mois (l'erreur tombe en 10 ms, avant
// même `generateStaticParams`). C'est donc un défaut de `next dev`, et la
// production sert bien ces URL. Ne pas partir « corriger » les slugs accentués
// de la route mois sur la foi d'un 500 en local.
// Reste ① — plus un fait têtu : un `npm run build` complet ne tient pas dans
// une session cloud (cf. CLAUDE.md), donc **aucune vérification d'export
// n'était possible**, et un export qui casse, c'est tout le site qui cesse
// d'être publiable. D'où un seul segment, en ASCII, sur le modèle éprouvé de
// `/comparer/[a]-vs-[b]`. Ne pas « simplifier » en revenant à l'imbriqué sans
// avoir vérifié un `npm run build` en local.

import {
  MONTHS,
  type MonthIndex,
  type MonthSlug,
} from "@/lib/vacation-seasons";
import { VACATION_PROFILES, type VacationProfile } from "@/lib/vacation-fit";

/** Slug ASCII du mois, index 1-12 → `MONTH_ASCII[index - 1]`. */
export const MONTH_ASCII = [
  "janvier", "fevrier", "mars", "avril", "mai", "juin",
  "juillet", "aout", "septembre", "octobre", "novembre", "decembre",
] as const;

export interface Crossing {
  /** `avril-monoparental` */
  slug: string;
  month: MonthIndex;
  /** Slug accentué de la route mois, pour les liens croisés. */
  monthSlug: MonthSlug;
  profile: VacationProfile;
}

// Ni un slug de mois ni un slug de profil ne contient de tiret : la
// concaténation reste lisible et sans ambiguïté.
export const CROSSINGS: Crossing[] = MONTH_ASCII.flatMap((ascii, i) =>
  VACATION_PROFILES.map((profile) => ({
    slug: `${ascii}-${profile}`,
    month: (i + 1) as MonthIndex,
    monthSlug: MONTHS[i],
    profile,
  })),
);

const BY_SLUG = new Map(CROSSINGS.map((c) => [c.slug, c]));

export function getCrossing(slug: string): Crossing | null {
  return BY_SLUG.get(slug) ?? null;
}

export function crossingSlug(month: MonthIndex, profile: VacationProfile): string {
  return `${MONTH_ASCII[month - 1]}-${profile}`;
}
