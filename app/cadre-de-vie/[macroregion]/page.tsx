import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  MACRO_REGIONS,
  MACRO_REGION_SLUGS,
  getMacroRegion,
  citiesInMacroRegion,
} from "@/lib/macro-regions";
import {
  computeQualityOfLife,
  QOL_LEVEL_LABEL,
  QOL_LEVEL_COLOR,
} from "@/lib/quality-of-life-index";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ macroregion: string }> };

export function generateStaticParams() {
  return MACRO_REGION_SLUGS.map((slug) => ({ macroregion: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { macroregion } = await params;
  const macro = getMacroRegion(macroregion);
  if (!macro) return {};
  return {
    title: `Meilleur cadre de vie · ${macro.label} 2026`,
    description: `Méga-index « Cadre de Vie » (environnement + santé + emploi) restreint aux villes de la macro-région ${macro.label}. Top villes pour vivre.`,
    alternates: { canonical: `/cadre-de-vie/${macro.slug}` },
    openGraph: {
      title: `Cadre de vie · ${macro.label}`,
      description: `Méga-index F52 par ville de la macro-région ${macro.label}.`,
    },
  };
}

const MIN_POP = 10_000;

export default async function MacroRegionQolPage({ params }: Props) {
  const { macroregion } = await params;
  const macro = getMacroRegion(macroregion);
  if (!macro) notFound();

  const cities = citiesInMacroRegion(macro)
    .filter((c) => (c.population ?? 0) >= MIN_POP)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      region: c.region,
      department: c.department,
      qol: computeQualityOfLife(c),
    }));

  const sortedBest = [...cities].sort((a, b) => b.qol.score - a.qol.score);
  const topBest = sortedBest.slice(0, 15);
  const worst = [...cities].sort((a, b) => a.qol.score - b.qol.score).slice(0, 10);

  // Profil moyen
  const n = cities.length || 1;
  const avgQol = Math.round((cities.reduce((s, c) => s + c.qol.score, 0) / n) * 10) / 10;
  const avgEnv = Math.round((cities.reduce((s, c) => s + c.qol.envScore, 0) / n) * 10) / 10;
  const avgHealth = Math.round((cities.reduce((s, c) => s + c.qol.healthScore, 0) / n) * 10) / 10;
  const avgJob = Math.round((cities.reduce((s, c) => s + c.qol.jobScore, 0) / n) * 10) / 10;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Cadre de vie", path: "/cadre-de-vie" },
    { name: macro.label, path: `/cadre-de-vie/${macro.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quelles sont les villes au meilleur cadre de vie en ${macro.label} ?`,
      a:
        topBest.length > 0
          ? `Top 3 selon l'Index Cadre de Vie composite : ${topBest
              .slice(0, 3)
              .map((c) => `${c.name} (${c.qol.score}/10)`)
              .join(", ")}.`
          : `Aucune ville de plus de 10 000 habitants n'est référencée pour cette macro-région.`,
    },
    {
      q: `Quel est le score moyen de cadre de vie sur ${macro.label} ?`,
      a: `Score moyen ${avgQol}/10. Détail : environnement ${avgEnv}/10, santé ${avgHealth}/10, emploi ${avgJob}/10 (10 = bon sur les 3 dimensions).`,
    },
    {
      q: `Comment est calculé l'Index Cadre de Vie ?`,
      a: `Composite agrégeant 3 sous-indices (F44 environnement, F47 santé, F50 emploi) pondérés env 35 % + santé 30 % + emploi 35 %. Score 0-10, 10 = cadre de vie exceptionnel.`,
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
          <Link href="/cadre-de-vie" className="hover:underline">Cadre de vie</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {macro.emoji} Cadre de vie — {macro.label}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Méga-index Cadre de Vie restreint aux {cities.length} villes de la macro-région
          {" "}{macro.label} référencées de plus de 10 000 habitants. Agrégat environnement +
          santé + emploi en un score unique 0-10.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{cities.length} villes analysées</Badge>
          <Badge>Score moyen : {avgQol}/10</Badge>
        </div>

        {/* Macro-region aggregate */}
        <Card className="mt-6">
          <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-3">
            Profil moyen de la macro-région
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { k: "Environnement", v: avgEnv, hint: "Air + bruit + eau + risques", href: `/environnement/${macro.slug}` },
              { k: "Santé", v: avgHealth, hint: "MG + spé + urgences + pharma", href: `/sante/${macro.slug}` },
              { k: "Emploi", v: avgJob, hint: "Chômage + salaire + dynamisme + mix", href: `/emploi/${macro.slug}` },
            ].map((d) => (
              <Link key={d.k} href={d.href} className="block">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all p-3">
                  <div className="text-xs text-[var(--text-tertiary)]">{d.k}</div>
                  <div className="text-xl font-bold tabular-nums text-[var(--text-primary)] mt-1">
                    {d.v.toFixed(1)}
                    <span className="text-xs font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-tertiary)] mt-1 leading-tight">{d.hint}</div>
                </div>
              </Link>
            ))}
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-3">
            Sous-scores : 10 = bon sur la dimension (déjà inversés depuis F44 / F47 / F50).
          </p>
        </Card>

        {/* Top best */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 15 — villes au meilleur cadre de vie en {macro.label}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Département</th>
                  <th className="px-3 py-2 text-right">Cadre de vie</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Env.</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Santé</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Emploi</th>
                </tr>
              </thead>
              <tbody>
                {topBest.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${QOL_LEVEL_COLOR[c.qol.level]}`}>
                        {c.qol.score.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {QOL_LEVEL_LABEL[c.qol.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.qol.envScore.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.qol.healthScore.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.qol.jobScore.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Worst */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 10 — villes au cadre de vie le plus tendu en {macro.label}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Département</th>
                  <th className="px-3 py-2 text-right">Cadre de vie</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Env.</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Santé</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Emploi</th>
                </tr>
              </thead>
              <tbody>
                {worst.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {c.qol.score.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.qol.envScore.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.qol.healthScore.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.qol.jobScore.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Other macro-regions */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Autres macro-régions
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.filter((m) => m.slug !== macro.slug).map((m) => (
            <Link key={m.slug} href={`/cadre-de-vie/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Cadre de vie</div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-sm">
          <Link href="/cadre-de-vie" className="text-[var(--accent)] hover:underline">
            → Voir le classement national Cadre de Vie complet
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
