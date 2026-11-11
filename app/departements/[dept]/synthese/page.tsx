import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import { CITIES_SEED } from "@/data/cities-seed";
import { deptToSlug, slugToDept, getAllDepartments } from "@/lib/dept-slug";
import { clampMeta, fitTitle } from "@/lib/brand";
import {
  computeCitySynthesis,
  SYNTHESIS_LEVEL_LABEL,
  SYNTHESIS_LEVEL_COLOR,
} from "@/lib/city-synthesis";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { pathAlternates } from "@/lib/i18n";

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
    title: fitTitle(`Synthèse 8 axes · ${dept} | palmarès des villes du département`),
    // clampMeta : la description brute atteint 217 caractères (énumération des
    // 8 axes) et était servie telle quelle. Même repli que la jumelle EN
    // `/departments/[dept]/synthesis`, qui la coupe sur une frontière de
    // proposition à ≤ 158.
    description: clampMeta(
      `Classement synthèse des ${count} villes du département ${dept} sur les 8 dimensions data (environnement, santé, emploi, cadre de vie, vélo, sécurité, démographie, services publics). Convention 10 = excellent.`,
    ),
    // Tête ET queue traduites (`departements/…/synthese` ↔ `departments/…/synthesis`),
    // donc `hreflangLanguages` ne suffit pas : elle ne traduit que la tête.
    alternates: pathAlternates(`/departements/${deptSlug}/synthese`, `/departments/${deptSlug}/synthesis`),
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
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
    "cadre-de-vie": { label: "Cadre de vie", hint: "Méga-index" },
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
          ? `Top 3 selon la synthèse (moyenne des 8 axes normalisés, 10 = excellent) : ${top
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
      a: `Synthèse : moyenne arithmétique des 8 composites des clusters data (env, santé, emploi, cadre de vie, vélo, sécurité, démographie, services publics) normalisés vers une convention « 10 = excellent ». Restreint au département ${dept}.`,
    },
  ]);

  const tableShell = "rounded-2xl bg-white overflow-hidden";
  const theadCls = "bg-[#EEF2FF] text-xs uppercase tracking-wide text-[#4338CA]";

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="relative overflow-hidden bg-aurora pt-20 pb-12 sm:pb-14">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-secondary)]">
            <Link href="/" className="hover:text-[var(--accent)] hover:underline">Accueil</Link> ·{" "}
            <Link href="/departements" className="hover:text-[var(--accent)] hover:underline">Départements</Link> ·{" "}
            <Link href={`/departements/${deptSlug}`} className="hover:text-[var(--accent)] hover:underline">{dept}</Link>
          </nav>
          <div className="mt-5 flex items-center gap-3">
            <EmojiBadge emoji="🧭" tone={toneFor(deptSlug)} />
            <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              Synthèse
            </span>
          </div>
          <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            Synthèse — villes du département{" "}
            <span className="font-display gradient-text-anim italic">{dept}</span>
          </h1>
          <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
            Classement synthèse restreint aux {n} ville{n > 1 ? "s" : ""}
            {" "}du département {dept} référencée{n > 1 ? "s" : ""} dans le seed. Les 8
            dimensions data agrégées en un score unifié 0-10, 10 = excellent.
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            {[
              `${n} ville${n > 1 ? "s" : ""}`,
              `Global moyen : ${avgGlobal}/10`,
              `Cohérence : ±${avgSpread}/10`,
            ].map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-full bg-white/90 ring-1 ring-[#C7D2FE] px-3 py-1 font-semibold text-[#4338CA] tabular-nums"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Profil moyen du département */}
      <section className="band band-indigo py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl font-bold gradient-text mb-4">
            Profil moyen du département (8 axes)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {axisKeys.map((k) => (
              <div
                key={k}
                className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-[#4338CA]">{axisLabels[k].label}</div>
                <div className="text-2xl font-bold tabular-nums text-[#312E81] mt-1">
                  {avgByAxis[k].toFixed(1)}
                  <span className="text-xs font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-1 leading-tight">
                  {axisLabels[k].hint}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] mt-3">
            Convention : 10 = excellent. Moyenne arithmétique sur les villes du département.
          </p>
        </div>
      </section>

      {/* Top */}
      <section className="band band-sky py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold gradient-text">
            {top.length === sorted.length
              ? "Toutes les villes du département"
              : `Top ${top.length} — profils les plus favorables`}
          </h2>
          <div className={`mt-4 ${tableShell} shadow-[0_12px_32px_-20px_rgba(8,145,178,0.6)]`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={theadCls}>
                  <tr>
                    <th className="px-3 py-2.5 text-left">#</th>
                    <th className="px-3 py-2.5 text-left">Ville</th>
                    <th className="px-3 py-2.5 text-right">Global</th>
                    <th className="px-3 py-2.5 text-right hidden sm:table-cell">Cohérence</th>
                    <th className="px-3 py-2.5 text-left hidden md:table-cell">Force #1</th>
                    <th className="px-3 py-2.5 text-left hidden md:table-cell">Tension #1</th>
                  </tr>
                </thead>
                <tbody>
                  {top.map((c, i) => (
                    <tr key={c.slug} className="border-t border-[#E0E7FF] hover:bg-[#F5F7FF] transition-colors">
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums ${
                            i < 3 ? `grad-head-${i}` : "bg-[#EEF2FF] text-[#4338CA]"
                          }`}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <Link
                          href={`/villes/${c.slug}/synthese`}
                          className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                        >
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        <span className={`font-bold tabular-nums ${SYNTHESIS_LEVEL_COLOR[c.synthesis.level]}`}>
                          {c.synthesis.global.toFixed(1)}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                          {SYNTHESIS_LEVEL_LABEL[c.synthesis.level]}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                        ±{c.synthesis.spread.toFixed(1)}
                      </td>
                      <td className="px-3 py-2.5 text-[var(--text-secondary)] hidden md:table-cell text-xs">
                        {c.synthesis.strengths[0]?.label} {c.synthesis.strengths[0]?.score.toFixed(1)}
                      </td>
                      <td className="px-3 py-2.5 text-[var(--text-secondary)] hidden md:table-cell text-xs">
                        {c.synthesis.tensions[0]?.label} {c.synthesis.tensions[0]?.score.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom (only if enough villes) */}
      {bottom.length > 0 && (
        <section className="band band-pink py-10 sm:py-12">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold gradient-text">
              Top {bottom.length} — profils les plus tendus
            </h2>
            <div className={`mt-4 ${tableShell} shadow-[0_12px_32px_-20px_rgba(219,39,119,0.5)]`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#FDF2F8] text-xs uppercase tracking-wide text-[#BE185D]">
                    <tr>
                      <th className="px-3 py-2.5 text-left">#</th>
                      <th className="px-3 py-2.5 text-left">Ville</th>
                      <th className="px-3 py-2.5 text-right">Global</th>
                      <th className="px-3 py-2.5 text-left hidden md:table-cell">Tension #1</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bottom.map((c, i) => (
                      <tr key={c.slug} className="border-t border-[#FCE7F3] hover:bg-[#FDF2F8] transition-colors">
                        <td className="px-3 py-2.5">
                          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#FCE7F3] px-1.5 text-[11px] font-bold tabular-nums text-[#BE185D]">
                            {i + 1}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <Link
                            href={`/villes/${c.slug}/synthese`}
                            className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                          >
                            {c.name}
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          <span className="font-bold tabular-nums text-red-600">
                            {c.synthesis.global.toFixed(1)}
                          </span>
                          <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                        </td>
                        <td className="px-3 py-2.5 text-[var(--text-secondary)] hidden md:table-cell text-xs">
                          {c.synthesis.tensions[0]?.label} {c.synthesis.tensions[0]?.score.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Cross-links */}
      <section className="band band-lilac py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl font-bold gradient-text">Aller plus loin</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { href: `/departements/${deptSlug}`, emoji: "📍", title: `← Département ${dept}`, sub: "Vue d'ensemble + guides" },
              { href: `/departements/${deptSlug}/fiscalite`, emoji: "💰", title: `Fiscalité ${dept}`, sub: "Taxe foncière, THRS, DMTO" },
              { href: "/palmares", emoji: "🏆", title: "Palmarès national", sub: "Classement universel 8 axes" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-transparent hover:ring-[#C4B5FD] shadow-[0_10px_26px_-18px_rgba(124,58,237,0.5)] hover:-translate-y-0.5 transition-all"
              >
                <EmojiBadge emoji={l.emoji} tone={toneFor(l.href)} size="sm" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{l.title}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">{l.sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="band band-white py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FeedbackWidget />
        </div>
      </section>

      <Footer />
    </main>
  );
}
