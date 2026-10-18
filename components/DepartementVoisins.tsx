import Link from "@/components/AppLink";
import { CITIES_SEED } from "@/data/cities-seed";
import { deptNumber, deptToSlug } from "@/lib/dept-slug";
import { neighborDepartments } from "@/lib/dept-neighbors";
import { scoreHex } from "@/lib/utils";

// Départements limitrophes d'un département : maillage croisé entre pages
// département. Rendu serveur, sans JS. Les scores viennent de CITIES_SEED
// (calibrés et normalisés), jamais du littéral du seed.
export function DepartementVoisins({
  department,
  locale = "fr",
}: {
  department: string;
  locale?: "fr" | "en";
}) {
  const en = locale === "en";
  const deptBase = en ? "/departments" : "/departements";
  const compareBase = en ? "/compare-departments" : "/comparer-departements";
  const cityPath = en ? "/cities/" : "/villes/";
  const neighbors = neighborDepartments(department);
  if (neighbors.length === 0) return null;

  const home = CITIES_SEED.find((c) => c.department === department);
  const rows = neighbors
    .map((name) => {
      const cities = CITIES_SEED.filter((c) => c.department === name);
      if (cities.length === 0) return null;
      const best = [...cities].sort((a, b) => b.scores.global - a.scores.global)[0];
      const avg = cities.reduce((s, c) => s + c.scores.global, 0) / cities.length;
      return {
        name,
        slug: deptToSlug(name),
        num: deptNumber(name, cities[0].inseeCode),
        count: cities.length,
        avg,
        best,
        sameRegion: !!home && cities[0].region === home.region,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
  if (rows.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
        {en ? `Departments bordering ${department}` : `Départements limitrophes de ${department}`}
      </h2>
      <p className="text-xs text-[var(--text-tertiary)] mb-4">
        {en
          ? `Those sharing a land border with ${department}. Average score of each department's analysed cities, out of 10.`
          : `Ceux qui partagent une frontière terrestre avec ${department}. Score moyen des villes analysées de chaque département, sur 10.`}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => {
          const [x, y] = [department, r.name].sort((a, b) => a.localeCompare(b, "fr"));
          return (
            <div
              key={r.name}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4"
            >
              <div className="flex items-baseline justify-between gap-2">
                <Link
                  href={`${deptBase}/${r.slug}`}
                  className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                >
                  {r.name} <span className="font-mono-data text-xs text-[var(--text-tertiary)]">({r.num})</span>
                </Link>
                <span
                  className="font-mono-data text-sm font-bold"
                  style={{ color: scoreHex(r.avg) }}
                >
                  {r.avg.toFixed(1)}
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                {en
                  ? `${r.count} cit${r.count > 1 ? "ies" : "y"} · top-rated: `
                  : `${r.count} ville${r.count > 1 ? "s" : ""} · mieux notée : `}
                <Link href={`${cityPath}${r.best.slug}`} className="text-[var(--accent)] hover:underline">
                  {r.best.name}
                </Link>
              </p>
              {r.sameRegion && (
                <Link
                  href={`${compareBase}/${deptToSlug(x)}-vs-${deptToSlug(y)}`}
                  className="mt-2 inline-block text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
                >
                  {en ? "Compare the two →" : "Comparer les deux →"}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
