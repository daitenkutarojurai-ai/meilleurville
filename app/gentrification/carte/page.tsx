import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { rankGentrification, TRAJECTORY_META } from "@/lib/gentrification";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Carte gentrification France 2026 — Heatmap par région",
  description:
    "Carte de la gentrification en France 2026 : score moyen par région, top villes en montée rapide, déjà en cours, ou potentiel à 5 ans. 352 villes analysées.",
  alternates: { canonical: "/gentrification/carte" },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Gentrification", path: "/gentrification" },
  { name: "Carte", path: "/gentrification/carte" },
]);

function bgForScore(score: number): string {
  if (score >= 75) return "bg-red-100 border-red-300";
  if (score >= 65) return "bg-orange-100 border-orange-300";
  if (score >= 55) return "bg-amber-100 border-amber-300";
  if (score >= 45) return "bg-lime-100 border-lime-300";
  return "bg-slate-100 border-slate-300";
}

export default function GentrificationCartePage() {
  const all = rankGentrification();

  // Group by region, compute average score, count by trajectory
  const byRegion = new Map<
    string,
    { rows: typeof all; avg: number; topCity: typeof all[number] }
  >();
  for (const row of all) {
    const r = row.city.region ?? "Autre";
    if (!byRegion.has(r)) byRegion.set(r, { rows: [], avg: 0, topCity: row });
    byRegion.get(r)!.rows.push(row);
  }
  for (const [, group] of byRegion) {
    group.avg = group.rows.reduce((s, x) => s + x.score, 0) / group.rows.length;
    group.topCity = group.rows.reduce((best, cur) => (cur.score > best.score ? cur : best), group.rows[0]);
  }
  const regionsSorted = Array.from(byRegion.entries()).sort((a, b) => b[1].avg - a[1].avg);

  // Trajectory tallies
  const traj = {
    "montee-rapide": all.filter((r) => r.trajectory === "montee-rapide").length,
    "deja-en-cours": all.filter((r) => r.trajectory === "deja-en-cours").length,
    potentiel: all.filter((r) => r.trajectory === "potentiel").length,
    stable: all.filter((r) => r.trajectory === "stable").length,
    baisse: all.filter((r) => r.trajectory === "baisse").length,
  };

  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <AmbientBackground />
      <Navbar />

      <section className="pt-20 pb-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <Badge variant="accent" className="mb-3">
            🗺️ Heatmap gentrification
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3 tracking-tight leading-[1.1]">
            Carte de la gentrification — 2026
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            Score moyen par région et top ville par région. Filtrage par trajectoire.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
        {/* National tallies */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(["montee-rapide", "deja-en-cours", "potentiel", "stable", "baisse"] as const).map((t) => {
            const meta = TRAJECTORY_META[t];
            return (
              <Card key={t}>
                <p className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.tone} mb-2`}>
                  {meta.label}
                </p>
                <p className="font-mono-data font-bold text-3xl text-[var(--text-primary)]">{traj[t]}</p>
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">villes</p>
              </Card>
            );
          })}
        </div>

        {/* Regional heatmap (sorted by avg score) */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Score moyen par région
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {regionsSorted.map(([region, group]) => {
              const top = group.topCity;
              const topTraj = TRAJECTORY_META[top.trajectory];
              return (
                <div
                  key={region}
                  className={`rounded-2xl border p-4 ${bgForScore(group.avg)}`}
                >
                  <p className="font-semibold text-[var(--text-primary)] mb-1">{region}</p>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-mono-data font-bold text-2xl text-[var(--text-primary)]">
                      {group.avg.toFixed(1)}
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)]">
                      moy. {group.rows.length} villes
                    </span>
                  </div>
                  <div className="border-t border-current/10 pt-2 mt-2">
                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                      Top ville
                    </p>
                    <Link href={`/gentrification/${top.city.slug}`} className="block">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-bold text-[var(--text-primary)] hover:underline">
                          {top.city.name}
                        </span>
                        <span className="font-mono-data font-bold text-sm text-[var(--accent)]">
                          {top.score.toFixed(0)}/100
                        </span>
                      </div>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${topTraj.tone} mt-1`}>
                        {topTraj.label}
                      </span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Top 5 per trajectory (excluding stable & baisse) */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Focus par trajectoire
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["montee-rapide", "deja-en-cours", "potentiel"] as const).map((t) => {
              const meta = TRAJECTORY_META[t];
              const top5 = all.filter((r) => r.trajectory === t).slice(0, 5);
              return (
                <Card key={t}>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.tone} mb-3`}>
                    {meta.label}
                  </span>
                  <ol className="space-y-1.5">
                    {top5.map((row, i) => (
                      <li key={row.city.slug}>
                        <Link
                          href={`/gentrification/${row.city.slug}`}
                          className="flex items-baseline justify-between text-sm hover:text-[var(--accent)]"
                        >
                          <span>
                            <span className="text-[var(--text-tertiary)] font-mono-data text-xs mr-1.5">
                              #{i + 1}
                            </span>
                            {row.city.name}
                          </span>
                          <span className="font-mono-data font-bold text-[var(--text-primary)]">
                            {row.score.toFixed(0)}
                          </span>
                        </Link>
                      </li>
                    ))}
                    {top5.length === 0 && (
                      <li className="text-xs text-[var(--text-tertiary)]">Aucune ville dans cette trajectoire.</li>
                    )}
                  </ol>
                </Card>
              );
            })}
          </div>
        </section>

        <p className="text-xs text-[var(--text-tertiary)] text-center">
          Carte v0 — agrégat par région. Une carte SVG avec cartouches communales sera ajoutée
          dans l&apos;itération suivante (DVF par commune + flux SIRENE).
        </p>
      </div>

      <Footer />
    </main>
  );
}
