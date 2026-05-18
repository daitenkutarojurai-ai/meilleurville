// F66 — Synthèse par région administrative.
//
// Maillon manquant entre le département (F65, ×102) et la macro-région
// (F62 palmarès, ×6) : la région administrative française (×18 incluant
// DROM). Niveau géographique très recherché en SEO français
// (« vivre en Bretagne », « meilleures villes Occitanie »).
//
// Pattern strictement aligné sur F65 — profil moyen 8 axes + palmarès
// local. Réutilise `getSynthesisRankings()` (cache module-level) sans
// recompute des sous-scores.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { regionToSlug, slugToRegion } from "@/lib/regions";
import {
  getSynthesisRankings,
  SYNTHESIS_LEVEL_LABEL,
  SYNTHESIS_LEVEL_COLOR,
} from "@/lib/city-synthesis";
import { MACRO_REGIONS } from "@/lib/macro-regions";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ region: string }> };

const ALL_REGIONS = [...new Set(CITIES_SEED.map((c) => c.region))];

export function generateStaticParams() {
  return ALL_REGIONS.map((r) => ({ region: regionToSlug(r) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region: regionSlug } = await params;
  const region = slugToRegion(regionSlug, ALL_REGIONS);
  if (!region) return {};
  const count = CITIES_SEED.filter((c) => c.region === region).length;
  return {
    title: `Synthèse 8 axes — ${region} | palmarès régional`,
    description: `Classement synthèse F61 des ${count} villes de la région ${region} sur les 8 dimensions data (environnement, santé, emploi, cadre de vie, vélo, sécurité, démographie, services publics). Convention 10 = excellent.`,
    alternates: { canonical: `/regions/${regionSlug}/synthese` },
    openGraph: {
      title: `Synthèse — ${region}`,
      description: `Les villes de ${region} classées sur les 8 axes data du site.`,
    },
  };
}

export default async function RegionSynthesePage({ params }: Props) {
  const { region: regionSlug } = await params;
  const region = slugToRegion(regionSlug, ALL_REGIONS);
  if (!region) notFound();

  const rows = getSynthesisRankings().filter((r) => r.region === region);
  if (rows.length === 0) notFound();

  const sorted = [...rows].sort((a, b) => b.synthesis.global - a.synthesis.global);
  const top = sorted.slice(0, Math.min(20, sorted.length));
  const bottom =
    sorted.length > 10
      ? [...rows]
          .sort((a, b) => a.synthesis.global - b.synthesis.global)
          .slice(0, Math.min(10, sorted.length - top.length))
      : [];

  const n = rows.length;
  const avgGlobal = Math.round((rows.reduce((s, c) => s + c.synthesis.global, 0) / n) * 10) / 10;
  const avgSpread = Math.round((rows.reduce((s, c) => s + c.synthesis.spread, 0) / n) * 10) / 10;

  // Profile moyen sur les 8 axes (regroupement par key).
  const axisKeys = [
    "cadre-de-vie",
    "environnement",
    "sante",
    "emploi",
    "velo",
    "securite",
    "demographie",
    "services-publics",
  ] as const;
  const axisLabels: Record<(typeof axisKeys)[number], { label: string; hint: string }> = {
    "cadre-de-vie": { label: "Cadre de vie", hint: "Méga-index F52" },
    "environnement": { label: "Env.", hint: "Air · bruit · eau · risques" },
    "sante": { label: "Santé", hint: "MG · spé · urgences" },
    "emploi": { label: "Emploi", hint: "Chômage · salaires" },
    "velo": { label: "Vélo", hint: "Réseau · relief" },
    "securite": { label: "Sécurité", hint: "Biens · personnes · nuit" },
    "demographie": { label: "Démo", hint: "Vieillis. · trajectoire" },
    "services-publics": { label: "Services", hint: "Écoles · Poste · mairie" },
  };
  const avgByAxis: Record<string, number> = {};
  for (const key of axisKeys) {
    const sum = rows.reduce((acc, c) => {
      const ax = c.synthesis.axes.find((a) => a.key === key);
      return acc + (ax?.score ?? 0);
    }, 0);
    avgByAxis[key] = Math.round((sum / n) * 10) / 10;
  }

  // Cross-link macro-régions touchant cette région (via leurs départements).
  const regionDepts = new Set(rows.map((r) => r.department));
  const macros = MACRO_REGIONS.filter((m) => m.departments.some((d) => regionDepts.has(d)));

  // Top 5 départements de la région (par count) — utile quand la région est large.
  const deptCounts = new Map<string, number>();
  for (const r of rows) deptCounts.set(r.department, (deptCounts.get(r.department) ?? 0) + 1);
  const topDepts = [...deptCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Régions", path: "/regions" },
    { name: region, path: `/regions/${regionSlug}` },
    { name: "Synthèse", path: `/regions/${regionSlug}/synthese` },
  ]);

  const rankedAxes = axisKeys
    .map((k) => ({ k, label: axisLabels[k].label, v: avgByAxis[k] }))
    .sort((a, b) => b.v - a.v);

  const faq = faqJsonLd([
    {
      q: `Quelles villes de ${region} affichent le meilleur profil global ?`,
      a:
        top.length > 0
          ? `Top 3 selon la synthèse F61 (moyenne des 8 axes normalisés, 10 = excellent) : ${top
              .slice(0, 3)
              .map((c) => `${c.name} (${c.synthesis.global}/10)`)
              .join(", ")}.`
          : `Aucune ville référencée pour cette région.`,
    },
    {
      q: `Quel est le profil moyen des villes de ${region} ?`,
      a: `Sur les ${n} ville${n > 1 ? "s" : ""} référencée${n > 1 ? "s" : ""}, le score global moyen est de ${avgGlobal}/10. Cohérence moyenne (écart-type entre axes) : ±${avgSpread}/10.`,
    },
    {
      q: `Sur quel axe la région ${region} se distingue-t-elle ?`,
      a: `Axe le plus fort : ${rankedAxes[0].label} (${rankedAxes[0].v}/10). Axe le plus tendu : ${rankedAxes[rankedAxes.length - 1].label} (${rankedAxes[rankedAxes.length - 1].v}/10).`,
    },
    {
      q: `Comment ce classement est-il calculé ?`,
      a: `Synthèse F61 : moyenne arithmétique des 8 composites des clusters data (env, santé, emploi, cadre de vie, vélo, sécurité, démographie, services publics) normalisés vers une convention « 10 = excellent ». Restreint aux villes de la région ${region}.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link> ·{" "}
          <Link href="/regions" className="hover:underline">Régions</Link> ·{" "}
          <Link href={`/regions/${regionSlug}`} className="hover:underline">{region}</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Synthèse — villes de {region}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Classement synthèse F61 restreint aux {n} ville{n > 1 ? "s" : ""}
          {" "}de la région {region} référencée{n > 1 ? "s" : ""} dans le seed. Les 8
          dimensions data agrégées en un score unifié 0-10, 10 = excellent.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{n} ville{n > 1 ? "s" : ""}</Badge>
          <Badge>Global moyen : {avgGlobal}/10</Badge>
          <Badge>Cohérence : ±{avgSpread}/10</Badge>
          {deptCounts.size > 0 && (
            <Badge>{deptCounts.size} département{deptCounts.size > 1 ? "s" : ""}</Badge>
          )}
        </div>

        {/* Profil moyen de la région */}
        <Card className="mt-6">
          <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-3">
            Profil moyen de la région (8 axes)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {axisKeys.map((k) => (
              <div
                key={k}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3"
              >
                <div className="text-xs text-[var(--text-tertiary)]">{axisLabels[k].label}</div>
                <div className="text-xl font-bold tabular-nums text-[var(--text-primary)] mt-1">
                  {avgByAxis[k].toFixed(1)}
                  <span className="text-xs font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)] mt-1 leading-tight">
                  {axisLabels[k].hint}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-3">
            Convention : 10 = excellent. Moyenne arithmétique sur les villes de la région.
          </p>
        </Card>

        {/* Top */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          {top.length === sorted.length
            ? "Toutes les villes de la région"
            : `Top ${top.length} — profils les plus favorables`}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left hidden sm:table-cell">Dépt</th>
                  <th className="px-3 py-2 text-right">Global</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Cohérence</th>
                  <th className="px-3 py-2 text-left hidden md:table-cell">Force #1</th>
                  <th className="px-3 py-2 text-left hidden md:table-cell">Tension #1</th>
                </tr>
              </thead>
              <tbody>
                {top.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/synthese`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] hidden sm:table-cell text-xs">
                      {c.department}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`font-bold tabular-nums ${SYNTHESIS_LEVEL_COLOR[c.synthesis.level]}`}
                      >
                        {c.synthesis.global.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {SYNTHESIS_LEVEL_LABEL[c.synthesis.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                      ±{c.synthesis.spread.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] hidden md:table-cell text-xs">
                      {c.synthesis.strengths[0]?.label} {c.synthesis.strengths[0]?.score.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] hidden md:table-cell text-xs">
                      {c.synthesis.tensions[0]?.label} {c.synthesis.tensions[0]?.score.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Bottom */}
        {bottom.length > 0 && (
          <>
            <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
              Top {bottom.length} — profils les plus tendus
            </h2>
            <Card className="mt-4 overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                    <tr>
                      <th className="px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-left">Ville</th>
                      <th className="px-3 py-2 text-left hidden sm:table-cell">Dépt</th>
                      <th className="px-3 py-2 text-right">Global</th>
                      <th className="px-3 py-2 text-left hidden md:table-cell">Tension #1</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bottom.map((c, i) => (
                      <tr key={c.slug} className="border-t border-[var(--border)]">
                        <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                        <td className="px-3 py-2">
                          <Link
                            href={`/villes/${c.slug}/synthese`}
                            className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                          >
                            {c.name}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-[var(--text-secondary)] hidden sm:table-cell text-xs">
                          {c.department}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className="font-bold tabular-nums text-red-600">
                            {c.synthesis.global.toFixed(1)}
                          </span>
                          <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                            /10
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[var(--text-secondary)] hidden md:table-cell text-xs">
                          {c.synthesis.tensions[0]?.label} {c.synthesis.tensions[0]?.score.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {/* Top départements — utile pour zoom granulaire */}
        {topDepts.length > 1 && (
          <>
            <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">
              Zoom département
            </h2>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {topDepts.map(([dept, count]) => {
                const deptSlug = dept
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[̀-ͯ]/g, "")
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "");
                return (
                  <Link
                    key={dept}
                    href={`/departements/${deptSlug}/synthese`}
                    className="block"
                  >
                    <Card className="hover:shadow-md transition-shadow h-full">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">
                        {dept}
                      </div>
                      <div className="text-xs text-[var(--text-tertiary)] mt-1">
                        {count} ville{count > 1 ? "s" : ""} référencée{count > 1 ? "s" : ""}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* Cross-links */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">Aller plus loin</h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href={`/regions/${regionSlug}`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                ← Région {region}
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Vue d&apos;ensemble + classements
              </div>
            </Card>
          </Link>
          <Link href="/palmares" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Palmarès national
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Classement universel 8 axes
              </div>
            </Card>
          </Link>
          <Link href="/palmares/personnaliser" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Palmarès personnalisé
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Pondère les 8 axes selon tes priorités
              </div>
            </Card>
          </Link>
          {macros.slice(0, 3).map((m) => (
            <Link key={m.slug} href={`/palmares/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {m.emoji} {m.label}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">
                  Palmarès macro-région
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
