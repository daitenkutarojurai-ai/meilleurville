import Link from "@/components/AppLink";
import { CITIES_SEED } from "@/data/cities-seed";
import { cityPopulation } from "@/lib/city-population";
import { deptNumber } from "@/lib/dept-slug";
import { scoreHex } from "@/lib/utils";

// Fiche chiffrée d'un département — composant serveur, aucun JS client.
// Tout est calculé depuis CITIES_SEED (scores calibrés + normalisés, jamais le
// littéral du seed) et data/city-population.json (Insee 2022).

const AXES = [
  ["life", "Qualité de vie"],
  ["transport", "Transports"],
  ["nature", "Nature"],
  ["cost", "Coût de la vie"],
  ["safety", "Sécurité"],
  ["culture", "Culture"],
  ["remoteWork", "Télétravail"],
  ["schools", "Écoles"],
] as const;

type Axis = (typeof AXES)[number][0];

const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

const NATIONAL: Record<Axis, number> = Object.fromEntries(
  AXES.map(([k]) => [k, mean(CITIES_SEED.map((c) => c.scores[k]))]),
) as Record<Axis, number>;

const fmt = (n: number) => n.toFixed(1).replace(".", ",");
const fmtInt = (n: number) => n.toLocaleString("fr-FR");

export function DepartementFiche({ department }: { department: string }) {
  const cities = CITIES_SEED.filter((c) => c.department === department);
  if (cities.length === 0) return null;

  const num = deptNumber(department, cities[0].inseeCode);
  const measured = cities.flatMap((c) => {
    const p = cityPopulation(c.slug);
    return p ? [p.pop2022] : [];
  });
  const pop = measured.reduce((s, x) => s + x, 0);
  const popComplete = measured.length === cities.length;

  const rows = AXES.map(([key, label]) => {
    const avg = mean(cities.map((c) => c.scores[key]));
    // Tri stable : à note égale, la ville la mieux classée au global passe devant.
    const best = [...cities].sort((a, b) => b.scores[key] - a.scores[key])[0];
    return { key, label, avg, delta: avg - NATIONAL[key], best };
  });

  return (
    <section aria-labelledby="fiche-dept">
      <h2 id="fiche-dept" className="text-lg font-bold text-[var(--text-primary)] mb-4">
        Fiche du département
      </h2>
      <div className="flex flex-wrap gap-3 mb-5 text-sm">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2">
          <div className="text-[10px] text-[var(--text-tertiary)]">Numéro</div>
          <div className="font-bold font-mono-data text-[var(--text-primary)]">{num}</div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2">
          <div className="text-[10px] text-[var(--text-tertiary)]">
            Population des villes analysées{popComplete ? "" : " (hors villes sans donnée)"}
          </div>
          <div className="font-bold font-mono-data text-[var(--text-primary)]">
            {pop > 0 ? fmtInt(pop) : "n.d."}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] text-[var(--text-tertiary)]">
              <th className="px-4 py-2 font-medium">Axe</th>
              <th className="px-4 py-2 font-medium">Moyenne</th>
              <th className="px-4 py-2 font-medium">Écart national</th>
              <th className="px-4 py-2 font-medium">Meilleure ville</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-t border-[var(--border)]">
                <td className="px-4 py-2 text-[var(--text-secondary)]">{r.label}</td>
                <td className="px-4 py-2 font-mono-data font-bold" style={{ color: scoreHex(r.avg) }}>
                  {fmt(r.avg)}
                </td>
                <td className="px-4 py-2 font-mono-data text-[var(--text-secondary)]">
                  {r.delta >= 0 ? "+" : "−"}
                  {fmt(Math.abs(r.delta))}
                </td>
                <td className="px-4 py-2">
                  <Link href={`/villes/${r.best.slug}`} className="text-[var(--accent)] hover:underline">
                    {r.best.name}
                  </Link>{" "}
                  <span className="font-mono-data text-[var(--text-tertiary)]">{fmt(r.best.scores[r.key])}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-[var(--text-tertiary)]">
        Moyennes sur les villes de notre corpus, pas sur tout le département. L&apos;écart se lit contre la
        moyenne des {CITIES_SEED.length} villes ; 10 = meilleur sur chaque axe. Population : Insee,
        recensement 2022.
      </p>
    </section>
  );
}
