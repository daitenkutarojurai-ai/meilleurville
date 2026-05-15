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
