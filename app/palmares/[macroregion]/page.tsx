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
  computeCitySynthesis,
  SYNTHESIS_LEVEL_LABEL,
  SYNTHESIS_LEVEL_COLOR,
} from "@/lib/city-synthesis";
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
    title: `Palmarès — ${macro.label} 2026 | meilleur cadre de vie toutes dimensions`,
    description: `Classement universel synthèse 8 axes (env, santé, emploi, cadre, vélo, sécurité, démo, services) restreint aux villes de la macro-région ${macro.label}. Top profils favorables vs. tendus.`,
    alternates: { canonical: `/palmares/${macro.slug}` },
    openGraph: {
      title: `Palmarès — ${macro.label}`,
      description: `Classement synthèse 8 axes par ville de la macro-région ${macro.label}.`,
    },
  };
}

const MIN_POP = 10_000;

export default async function MacroRegionPalmaresPage({ params }: Props) {
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
      synthesis: computeCitySynthesis(c),
    }));

  const top = [...cities].sort((a, b) => b.synthesis.global - a.synthesis.global).slice(0, 15);
  const bottom = [...cities].sort((a, b) => a.synthesis.global - b.synthesis.global).slice(0, 10);

  const n = cities.length || 1;
  const avgGlobal = Math.round((cities.reduce((s, c) => s + c.synthesis.global, 0) / n) * 10) / 10;
  const avgSpread = Math.round((cities.reduce((s, c) => s + c.synthesis.spread, 0) / n) * 10) / 10;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Palmarès", path: "/palmares" },
    { name: macro.label, path: `/palmares/${macro.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quelles villes ont le meilleur profil global en ${macro.label} ?`,
      a:
        top.length > 0
          ? `Top 3 selon la synthèse F61 (moyenne des 8 axes normalisés, 10 = excellent) : ${top
              .slice(0, 3)
              .map((c) => `${c.name} (${c.synthesis.global}/10)`)
              .join(", ")}.`
          : `Aucune ville de plus de 10 000 habitants n'est référencée pour cette macro-région.`,
    },
    {
      q: `Quel est le profil global moyen sur ${macro.label} ?`,
      a: `Score global moyen ${avgGlobal}/10 sur les ${cities.length} villes ≥ 10 000 hab. de la macro-région. Cohérence moyenne (écart-type entre axes) : ${avgSpread}/10.`,
    },
    {
      q: `Comment ce classement est-il calculé ?`,
      a: `Synthèse F61 : moyenne arithmétique des 8 composites des clusters data (env, santé, emploi, cadre de vie, vélo, sécurité, démographie, services publics) normalisés vers une convention « 10 = excellent ». Restriction aux villes ≥ 10 000 hab. de la macro-région ${macro.label}.`,
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
          <Link href="/palmares" className="hover:underline">Palmarès</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {macro.emoji} Palmarès — {macro.label}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Classement synthèse F61 restreint aux {cities.length} villes de la macro-région
          {" "}{macro.label} référencées de plus de 10 000 habitants. Les 8 dimensions data
          du site agrégées en un score unifié 0-10, 10 = excellent.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{cities.length} villes analysées</Badge>
          <Badge>Score global moyen : {avgGlobal}/10</Badge>
          <Badge>Cohérence moyenne : ±{avgSpread}/10</Badge>
        </div>

        {/* Top 15 */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 15 — profils les plus favorables en {macro.label}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Département</th>
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
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
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

        {/* Bottom 10 */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 10 — profils les plus tendus en {macro.label}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Département</th>
                  <th className="px-3 py-2 text-right">Global</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Cohérence</th>
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
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {c.synthesis.global.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                      ±{c.synthesis.spread.toFixed(1)}
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

        {/* Other macro-regions */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Autres macro-régions
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.filter((m) => m.slug !== macro.slug).map((m) => (
            <Link key={m.slug} href={`/palmares/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Palmarès</div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-sm">
          <Link href="/palmares" className="text-[var(--accent)] hover:underline">
            → Voir le palmarès national complet
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
