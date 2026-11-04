import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import { MACRO_REGIONS, MACRO_REGION_SLUGS, getMacroRegion } from "@/lib/macro-regions";
import { citiesInMacroRegion } from "@/lib/macro-regions-rankings";
import {
  computeEnvironmentIndex,
  ENV_LEVEL_LABEL,
  ENV_LEVEL_COLOR,
} from "@/lib/environment-index";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { pathAlternates } from "@/lib/i18n";
import { fitTitle } from "@/lib/brand";
import { AIR_MEASURED_MAX_KM, AIR_MEASURED_YEAR } from "@/lib/air-quality";

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
    title: fitTitle(`Villes les plus saines · ${macro.label} 2026`),
    description: `Classement environnemental composite (air, bruit, eau, risques) restreint aux villes de la macro-région ${macro.label}. Top villes saines vs. plus exposées.`,
    alternates: pathAlternates(`/environnement/${macro.slug}`, `/environment/${macro.slug}`),
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
      title: `Villes saines · ${macro.label}`,
      description: `Index environnemental composite par ville de la macro-région ${macro.label}.`,
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
      a: `L'index agrège quatre dimensions : qualité de l'air (30 %), bruit (25 %), stress hydrique (25 %) et risques naturels (20 %). Dans l'air, NO2, particules fines et ozone sont mesurés (moyennes ${AIR_MEASURED_YEAR}) quand une station de fond urbaine ou périurbaine est à moins de ${AIR_MEASURED_MAX_KM} km ; les pollens et les trois autres dimensions relèvent d'une estimation communale, calée sur les cadres de référence publics (RNSA, CBS/PEB/Bruitparif, Propluvia/BRGM, BCSF/BRGM/ONF) sans reprendre leurs relevés. Score 0-10, 10 = environnement le plus sain.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-aurora pt-12 pb-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link> ·{" "}
          <Link href="/environnement" className="hover:underline">Environnement</Link>
        </nav>

        <div className="flex items-center gap-3">
          <EmojiBadge emoji={macro.emoji} tone="aqua" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            <span className="gradient-text">Villes les plus saines</span> — {macro.label}
          </h1>
        </div>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Classement environnemental composite restreint aux {cities.length} villes de la
          macro-région {macro.label} référencées de plus de 10 000 habitants. Index agrégeant
          qualité de l&apos;air, bruit, stress hydrique et risques naturels.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="grad-head-0 rounded-full px-3 py-1 font-semibold">{cities.length} villes analysées</span>
          <span className="rounded-full bg-white/85 px-3 py-1 font-medium text-[#4338CA] ring-1 ring-[#C7D2FE]">Score moyen santé environnementale : {avgHealth}/10</span>
        </div>
        </div>
      </section>

      {/* Profil moyen — bande ciel */}
      <section className="band band-sky py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-2xl bg-white p-5 shadow-[0_10px_28px_-18px_rgba(8,145,178,0.5)]">
          <h2 className="text-sm uppercase tracking-wide text-[#0E7490] font-semibold mb-3">
            Profil environnemental moyen de la macro-région
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { k: "Air", v: avgAir, hint: "NO2 + PM2.5 + ozone (mesurés) + pollens" },
              { k: "Bruit", v: avgBruit, hint: "Routier + aérien + ferré + nocturne" },
              { k: "Eau", v: avgEau, hint: "Restrictions + nappes + climat sec" },
              { k: "Risques", v: avgRisques, hint: "Inondation + argile + feu + sismique" },
            ].map((d) => (
              <div key={d.k} className="rounded-xl bg-[#ECFEFF] p-3 ring-1 ring-[#A5F3FC]">
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
        </div>

        </div>
      </section>

      {/* Top 15 — bande indigo */}
      <section className="band band-indigo py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold">
          <span className="gradient-text">Top 15 — villes les plus saines de {macro.label}</span>
        </h2>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--band-indigo)] text-xs uppercase tracking-wide text-[#4338CA]">
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
                  <tr key={c.slug} className="border-t border-[var(--border)] transition-colors hover:bg-[#F5F3FF]">
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
        </div>

        </div>
      </section>

      {/* Top 10 — bande rose */}
      <section className="band band-pink py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold">
          <span className="gradient-text">Top 10 — villes les plus exposées de {macro.label}</span>
        </h2>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_-18px_rgba(219,39,119,0.45)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--band-pink)] text-xs uppercase tracking-wide text-[#9D174D]">
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
                  <tr key={c.slug} className="border-t border-[var(--border)] transition-colors hover:bg-[#F5F3FF]">
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
        </div>

        </div>
      </section>

      {/* Autres macro-régions — bande lilas */}
      <section className="band band-lilac py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-xl font-bold">
          <span className="gradient-text">Autres macro-régions</span>
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.filter((m) => m.slug !== macro.slug).map((m, i) => (
            <Link
              key={m.slug}
              href={`/environnement/${m.slug}`}
              className="flex h-full items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_10px_24px_-18px_rgba(124,58,237,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-16px_rgba(124,58,237,0.6)]"
            >
              <EmojiBadge emoji={m.emoji} tone={toneFor(i)} size="sm" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">Index environnemental</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/environnement"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-[#4F46E5] to-[#DB2777] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-14px_rgba(79,70,229,0.7)] transition hover:opacity-95"
          >
            → Voir le classement national complet
          </Link>
        </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
