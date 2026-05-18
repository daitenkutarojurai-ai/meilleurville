import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { deptToSlug, slugToDept, getAllDepartments } from "@/lib/dept-slug";
import {
  computeCitySynthesis,
  SYNTHESIS_LEVEL_LABEL,
  SYNTHESIS_LEVEL_COLOR,
} from "@/lib/city-synthesis";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ dept: string }> };

export function generateStaticParams() {
  return getAllDepartments().map((d) => ({ dept: deptToSlug(d) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dept: deptSlug } = await params;
  const dept = slugToDept(deptSlug);
  if (!dept) return {};
  const count = CITIES_SEED.filter((c) => c.department === dept).length;
  return {
    title: `Synthèse 8 axes · ${dept} | palmarès des villes du département`,
    description: `Classement synthèse F61 des ${count} villes du département ${dept} sur les 8 dimensions data (environnement, santé, emploi, cadre de vie, vélo, sécurité, démographie, services publics). Convention 10 = excellent.`,
    alternates: { canonical: `/departements/${deptSlug}/synthese` },
    openGraph: {
      title: `Synthèse · ${dept}`,
      description: `Les villes du département ${dept} classées sur les 8 axes data du site.`,
    },
  };
}

export default async function DeptSynthesePage({ params }: Props) {
  const { dept: deptSlug } = await params;
  const dept = slugToDept(deptSlug);
  if (!dept) notFound();

  const cities = CITIES_SEED.filter((c) => c.department === dept).map((c) => ({
    slug: c.slug,
    name: c.name,
    region: c.region,
    population: c.population ?? 0,
    synthesis: computeCitySynthesis(c),
  }));

  if (cities.length === 0) notFound();

  const sorted = [...cities].sort((a, b) => b.synthesis.global - a.synthesis.global);
  const top = sorted.slice(0, Math.min(15, sorted.length));
  // Bottom only shown when we have enough villes — pas besoin si ≤ 5.
  const bottom =
    sorted.length > 8 ? [...cities].sort((a, b) => a.synthesis.global - b.synthesis.global).slice(0, Math.min(10, sorted.length - top.length)) : [];

  const n = cities.length;
  const avgGlobal = Math.round((cities.reduce((s, c) => s + c.synthesis.global, 0) / n) * 10) / 10;
  const avgSpread = Math.round((cities.reduce((s, c) => s + c.synthesis.spread, 0) / n) * 10) / 10;

  // Profile moyen sur les 8 axes (réutilise le tri ordre canonique de
  // synthesis.axes[*] qui n'est PAS l'ordre clé fixe — donc on regroupe par key).
  const axisKeys = ["cadre-de-vie", "environnement", "sante", "emploi", "velo", "securite", "demographie", "services-publics"] as const;
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
    const sum = cities.reduce((acc, c) => {
      const ax = c.synthesis.axes.find((a) => a.key === key);
      return acc + (ax?.score ?? 0);
    }, 0);
    avgByAxis[key] = Math.round((sum / n) * 10) / 10;
  }

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Départements", path: "/departements" },
    { name: dept, path: `/departements/${deptSlug}` },
    { name: "Synthèse", path: `/departements/${deptSlug}/synthese` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quelles sont les villes du département ${dept} au meilleur profil global ?`,
      a:
        top.length > 0
          ? `Top 3 selon la synthèse F61 (moyenne des 8 axes normalisés, 10 = excellent) : ${top
              .slice(0, 3)
              .map((c) => `${c.name} (${c.synthesis.global}/10)`)
              .join(", ")}.`
          : `Aucune ville référencée pour ce département.`,
    },
    {
      q: `Quel est le profil moyen des villes du département ${dept} ?`,
      a: `Sur les ${n} ville${n > 1 ? "s" : ""} référencée${n > 1 ? "s" : ""}, le score global moyen est de ${avgGlobal}/10. Cohérence moyenne (écart-type entre axes) : ${avgSpread}/10.`,
    },
    {
      q: `Sur quel axe le département ${dept} se distingue-t-il ?`,
      a: (() => {
        const ranked = axisKeys
          .map((k) => ({ k, label: axisLabels[k].label, v: avgByAxis[k] }))
          .sort((a, b) => b.v - a.v);
        return `Axe le plus fort : ${ranked[0].label} (${ranked[0].v}/10). Axe le plus tendu : ${ranked[ranked.length - 1].label} (${ranked[ranked.length - 1].v}/10).`;
      })(),
    },
    {
      q: `Comment ce classement est-il calculé ?`,
      a: `Synthèse F61 : moyenne arithmétique des 8 composites des clusters data (env, santé, emploi, cadre de vie, vélo, sécurité, démographie, services publics) normalisés vers une convention « 10 = excellent ». Restreint au département ${dept}.`,
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
          <Link href="/departements" className="hover:underline">Départements</Link> ·{" "}
          <Link href={`/departements/${deptSlug}`} className="hover:underline">{dept}</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Synthèse — villes du département {dept}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Classement synthèse F61 restreint aux {n} ville{n > 1 ? "s" : ""}
          {" "}du département {dept} référencée{n > 1 ? "s" : ""} dans le seed. Les 8
          dimensions data agrégées en un score unifié 0-10, 10 = excellent.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{n} ville{n > 1 ? "s" : ""}</Badge>
          <Badge>Global moyen : {avgGlobal}/10</Badge>
          <Badge>Cohérence : ±{avgSpread}/10</Badge>
        </div>

        {/* Profil moyen du département */}
        <Card className="mt-6">
          <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-3">
            Profil moyen du département (8 axes)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {axisKeys.map((k) => (
              <div key={k} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
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
            Convention : 10 = excellent. Moyenne arithmétique sur les villes du département.
          </p>
        </Card>

        {/* Top */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          {top.length === sorted.length
            ? "Toutes les villes du département"
            : `Top ${top.length} — profils les plus favorables`}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
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
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${SYNTHESIS_LEVEL_COLOR[c.synthesis.level]}`}>
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

        {/* Bottom (only if enough villes) */}
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
                        <td className="px-3 py-2 text-right">
                          <span className="font-bold tabular-nums text-red-600">
                            {c.synthesis.global.toFixed(1)}
                          </span>
                          <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
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

        {/* Cross-links */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">Aller plus loin</h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href={`/departements/${deptSlug}`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">← Département {dept}</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Vue d&apos;ensemble + guides</div>
            </Card>
          </Link>
          <Link href={`/departements/${deptSlug}/fiscalite`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Fiscalité {dept}</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Taxe foncière, THRS, DMTO</div>
            </Card>
          </Link>
          <Link href="/palmares" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Palmarès national</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Classement universel 8 axes</div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
