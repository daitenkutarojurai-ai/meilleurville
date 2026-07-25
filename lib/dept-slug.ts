import { CITIES_SEED } from "@/data/cities-seed";

// Department slug helpers — kebab-case, accents stripped.
// Single source of truth so /departements/[dept]/page.tsx and
// /departements/[dept]/fiscalite/page.tsx don't drift.

export function deptToSlug(dept: string): string {
  return dept
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function slugToDept(slug: string): string | undefined {
  const depts = [...new Set(CITIES_SEED.map((c) => c.department))];
  return depts.find((d) => deptToSlug(d) === slug);
}

export function getAllDepartments(): string[] {
  return [...new Set(CITIES_SEED.map((c) => c.department))];
}

// Le Rhône (69) porte DEUX collectivités depuis 2015 : la Métropole de Lyon et
// le département du Rhône. Le seed les distingue déjà, mais leurs codes Insee
// commune commencent tous par "69" — les deux affichaient donc « 69 », soit
// deux pastilles identiques sur la carte. L'Insee code justement ces deux
// territoires 69M et 69D ; c'est ce qu'on affiche.
const DEPT_NUM_OVERRIDES: Record<string, string> = {
  "Métropole de Lyon": "69M",
  Rhône: "69D",
};

/**
 * Numéro affiché d'un département, dérivé du code Insee d'une de ses communes :
 * 3 chiffres en outre-mer (971-976), 2 caractères ailleurs (2A/2B pour la Corse).
 */
export function deptNumber(department: string, inseeCode: string): string {
  const override = DEPT_NUM_OVERRIDES[department];
  if (override) return override;
  return inseeCode.startsWith("97") ? inseeCode.slice(0, 3) : inseeCode.slice(0, 2);
}
