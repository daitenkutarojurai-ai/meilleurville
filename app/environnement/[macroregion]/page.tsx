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
  computeEnvironmentIndex,
  ENV_LEVEL_LABEL,
  ENV_LEVEL_COLOR,
} from "@/lib/environment-index";
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
    title: `Villes les plus saines — ${macro.label} 2026`,
    description: `Classement environnemental composite (air, bruit, eau, risques) restreint aux villes de la macro-région ${macro.label}. Top villes saines vs. plus exposées.`,
    alternates: { canonical: `/environnement/${macro.slug}` },
    openGraph: {
      title: `Villes saines — ${macro.label}`,
      description: `Index environnemental composite F40-F43 par ville de la macro-région ${macro.label}.`,
    },
  };
}

const MIN_POP = 10_000;

export default async function MacroRegionEnvironmentPage({ params }: Props) {
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
      index: computeEnvironmentIndex(c),
    }));

  const sortedHealth = [...cities].sort((a, b) => b.index.healthScore - a.index.healthScore);
  const topHealthy = sortedHealth.slice(0, 15);
  const mostExposed = [...cities].sort((a, b) => b.index.stressComposite - a.index.stressComposite).slice(0, 10);

  // Stats agrégées
  const avgHealth =
    cities.length > 0
      ? Math.round((cities.reduce((s, c) => s + c.index.healthScore, 0) / cities.length) * 10) / 10
      : 0;
  const avgAir = cities.length > 0
    ? Math.round((cities.reduce((s, c) => s + c.index.air, 0) / cities.length) * 10) / 10
    : 0;
  const avgBruit = cities.length > 0
    ? Math.round((cities.reduce((s, c) => s + c.index.bruit, 0) / cities.length) * 10) / 10
    : 0;
  const avgEau = cities.length > 0
    ? Math.round((cities.reduce((s, c) => s + c.index.eau, 0) / cities.length) * 10) / 10
    : 0;
  const avgRisques = cities.length > 0
    ? Math.round((cities.reduce((s, c) => s + c.index.risques, 0) / cities.length) * 10) / 10
    : 0;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Environnement", path: "/environnement" },
    { name: macro.label, path: `/environnement/${macro.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quelles sont les villes les plus saines de ${macro.label} ?`,
      a:
        topHealthy.length > 0
          ? `Top 3 selon l'index environnemental composite : ${topHealthy
              .slice(0, 3)
              .map((c) => `${c.name} (${c.index.healthScore}/10)`)
              .join(", ")}.`
          : `Aucune ville de plus de 10 000 habitants n'est référencée pour cette macro-région.`,
    },
    {
      q: `Quel est le niveau moyen de stress environnemental sur ${macro.label} ?`,
      a: `Le score moyen de santé environnementale est de ${avgHealth}/10. Détail des sous-scores moyens (10 = pire exposition) : air ${avgAir}/10, bruit ${avgBruit}/10, eau ${avgEau}/10, risques ${avgRisques}/10.`,
    },
    {
      q: `Comment ce classement est-il calculé ?`,
      a: `L'index agrège qualité de l'air (ATMO/CITEPA/RNSA — 30 %), bruit (CBS/PEB/Bruitparif — 25 %), stress hydrique (Propluvia/BRGM — 25 %) et risques naturels (Géorisques/BRGM/BCSF — 20 %). Score 0-10, 10 = environnement le plus sain.`,
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
          <Link href="/environnement" className="hover:underline">Environnement</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {macro.emoji} Villes les plus saines — {macro.label}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Classement environnemental composite restreint aux {cities.length} villes de la
          macro-région {macro.label} référencées de plus de 10 000 habitants. Index agrégeant
          qualité de l&apos;air, bruit, stress hydrique et risques naturels.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{cities.length} villes analysées</Badge>
          <Badge>Score moyen santé environnementale : {avgHealth}/10</Badge>
        </div>

        {/* Macro-region aggregate */}
        <Card className="mt-6">
          <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-3">
            Profil environnemental moyen de la macro-région
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { k: "Air", v: avgAir, hint: "PM2.5 + NO2 + ozone + pollens" },
              { k: "Bruit", v: avgBruit, hint: "Routier + aérien + ferré + nocturne" },
              { k: "Eau", v: avgEau, hint: "Restrictions + nappes + climat sec" },
              { k: "Risques", v: avgRisques, hint: "Inondation + argile + feu + sismique" },
            ].map((d) => (
              <div key={d.k} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
                <div className="text-xs text-[var(--text-tertiary)]">{d.k}</div>
                <div className="text-xl font-bold tabular-nums text-[var(--text-primary)] mt-1">
                  {d.v.toFixed(1)}
                  <span className="text-xs font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)] mt-1 leading-tight">{d.hint}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-3">
            Sous-scores : 10 = exposition maximale (pire). Score « santé environnementale »
            inverse (10 = sain).
          </p>
        </Card>

        {/* Top healthiest */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 15 — villes les plus saines de {macro.label}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Département</th>
                  <th className="px-3 py-2 text-right">Santé env.</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Air</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Bruit</th>
                </tr>
              </thead>
              <tbody>
                {topHealthy.map((c, i) => (
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
                      <span className={`font-bold tabular-nums ${ENV_LEVEL_COLOR[c.index.level]}`}>
                        {c.index.healthScore.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {ENV_LEVEL_LABEL[c.index.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.index.air.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.index.bruit.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Most exposed */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 10 — villes les plus exposées de {macro.label}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Département</th>
                  <th className="px-3 py-2 text-right">Stress</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Eau</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Risques</th>
                </tr>
              </thead>
              <tbody>
                {mostExposed.map((c, i) => (
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
                        {c.index.stressComposite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.index.eau.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.index.risques.toFixed(1)}</td>
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
            <Link key={m.slug} href={`/environnement/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Index environnemental</div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-sm">
          <Link href="/environnement" className="text-[var(--accent)] hover:underline">
            → Voir le classement national complet
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
