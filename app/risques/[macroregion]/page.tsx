import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import {
  MACRO_REGIONS,
  MACRO_REGION_SLUGS,
  getMacroRegion,
} from "@/lib/macro-regions";
import { citiesInMacroRegion } from "@/lib/macro-regions-rankings";
import {
  computeNaturalRisks,
  RISK_LEVEL_LABEL,
  RISK_LEVEL_COLOR,
} from "@/lib/natural-risks";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { pathAlternates } from "@/lib/i18n";
import { fitTitle } from "@/lib/brand";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ macroregion: string }> };

export function generateStaticParams() {
  return MACRO_REGION_SLUGS.map((slug) => ({ macroregion: slug }));
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { macroregion } = await params;
  const macro = getMacroRegion(macroregion);
  if (!macro) return {};
  return {
    title: fitTitle(`Risques naturels · ${macro.label} 2026`),
    description: `Inondation, sismicité, argile, feux de forêt dans les villes de ${macro.label}. Top 15 les plus exposées vs top 10 les plus tranquilles.`,
    alternates: pathAlternates(`/risques/${macro.slug}`, `/natural-risks/${macro.slug}`),
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
      title: `Risques naturels · ${macro.label}`,
      description: `Classement risques naturels par ville de la macro-région ${macro.label}.`,
    },
  };
}

const MIN_POP = 10_000;

export default async function MacroRegionRisksPage({ params }: Props) {
  const { macroregion } = await params;
  const macro = getMacroRegion(macroregion);
  if (!macro) notFound();

  const cities = citiesInMacroRegion(macro)
    .filter((c) => (c.population ?? 0) >= MIN_POP)
    .map((c) => {
      const r = computeNaturalRisks(c);
      return {
        slug: c.slug,
        name: c.name,
        region: c.region,
        department: c.department,
        composite: r.composite,
        level: r.level,
        flood: r.flood.score,
        seismic: r.seismic.score,
        clay: r.clay.score,
        wildfire: r.wildfire.score,
      };
    });

  // Composite : 10 = exposition maximale → tri descendant pour les plus exposées.
  const most = [...cities].sort((a, b) => b.composite - a.composite).slice(0, 15);
  const least = [...cities].sort((a, b) => a.composite - b.composite).slice(0, 10);

  const n = cities.length || 1;
  const avgComposite =
    Math.round((cities.reduce((s, c) => s + c.composite, 0) / n) * 10) / 10;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Risques naturels", path: "/risques" },
    { name: macro.label, path: `/risques/${macro.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quelles sont les villes les plus exposées aux risques naturels en ${macro.label} ?`,
      a:
        most.length > 0
          ? `Top 3 des villes au composite de risque le plus élevé en ${macro.label} (10 = exposition maximale) : ${most
              .slice(0, 3)
              .map((c) => `${c.name} (${c.composite.toFixed(1)}/10)`)
              .join(", ")}.`
          : `Aucune ville de plus de 10 000 habitants n'est référencée pour cette macro-région.`,
    },
    {
      q: `Quel est le score moyen de risque naturel en ${macro.label} ?`,
      a: `Composite moyen ${avgComposite}/10 (10 = exposition maximale) sur ${cities.length} villes référencées de plus de 10 000 habitants.`,
    },
    {
      q: `Quels aléas dominent en ${macro.label} ?`,
      a: `Estimation communale sur 4 dimensions : inondation (35 %, proxy fleuve majeur + altitude + littoral), retrait-gonflement argile (25 %, aléa BRGM départemental), feu de forêt (20 %, classification ONF), sismicité (20 %, zonage réglementaire 2011 pris au département). Ce n'est pas le zonage parcellaire : les cadres de référence servent de calage, leurs relevés ne sont pas repris. Cliquez sur chaque ville pour le détail aléa par aléa.`,
    },
    {
      q: "Ces scores remplacent-ils un PPRI ?",
      a: "Non. Ce sont des synthèses pédagogiques à l'échelle communale. Pour un Plan de Prévention Risques Inondation (PPRI), un PPRT ou un État Risques et Pollutions (ERP, obligatoire à la vente), consultez Géorisques en saisissant l'adresse précise.",
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumb)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faq)}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-aurora pt-12 pb-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">
            Accueil
          </Link>{" "}
          ·{" "}
          <Link href="/risques" className="hover:underline">
            Risques naturels
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <EmojiBadge emoji={macro.emoji} tone="pink" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            <span className="gradient-text">Risques naturels</span> — {macro.label}
          </h1>
        </div>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Exposition aux 4 grands aléas (inondation, sismicité, argile, feu de
          forêt) des {cities.length} villes de la macro-région {macro.label}{" "}
          référencées de plus de 10 000 habitants. Composite 0-10, 10 =
          exposition maximale.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="grad-head-0 rounded-full px-3 py-1 font-semibold">{cities.length} villes analysées</span>
          <span className="rounded-full bg-white/85 px-3 py-1 font-medium text-[#4338CA] ring-1 ring-[#C7D2FE]">Composite moyen : {avgComposite}/10</span>
          <span className="rounded-full bg-white/85 px-3 py-1 font-medium text-[#4338CA] ring-1 ring-[#C7D2FE]">Cadres de référence : BCSF · BRGM · ONF</span>
        </div>

        </div>
      </section>

      {/* Top 15 exposées — bande rose */}
      <section className="band band-pink py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold">
          <span className="gradient-text">Top 15 — villes les plus exposées en {macro.label}</span>
        </h2>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_-18px_rgba(219,39,119,0.45)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--band-pink)] text-xs uppercase tracking-wide text-[#9D174D]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Département</th>
                  <th className="px-3 py-2 text-right">Composite</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">
                    Niveau
                  </th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">
                    Aléa #1
                  </th>
                </tr>
              </thead>
              <tbody>
                {most.map((c, i) => {
                  const top = [
                    { k: "Inondation", v: c.flood },
                    { k: "Sismicité", v: c.seismic },
                    { k: "Argile", v: c.clay },
                    { k: "Feu", v: c.wildfire },
                  ].sort((a, b) => b.v - a.v)[0];
                  return (
                    <tr
                      key={c.slug}
                      className="border-t border-[var(--border)] transition-colors hover:bg-[#F5F3FF]"
                    >
                      <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">
                        {i + 1}
                      </td>
                      <td className="px-3 py-2">
                        <Link
                          href={`/villes/${c.slug}/risques`}
                          className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                        >
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-[var(--text-tertiary)]">
                        {c.department}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="font-bold tabular-nums text-red-600">
                          {c.composite.toFixed(1)}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                          /10
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right hidden sm:table-cell">
                        <span
                          className={`text-xs font-semibold ${RISK_LEVEL_COLOR[c.level]}`}
                        >
                          {RISK_LEVEL_LABEL[c.level]}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right hidden md:table-cell text-xs text-[var(--text-tertiary)]">
                        {top.k} ({top.v.toFixed(0)})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        </div>
      </section>

      {/* Top 10 tranquilles — bande indigo */}
      <section className="band band-indigo py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold">
          <span className="gradient-text">Top 10 — villes les plus tranquilles en {macro.label}</span>
        </h2>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--band-indigo)] text-xs uppercase tracking-wide text-[#4338CA]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Département</th>
                  <th className="px-3 py-2 text-right">Composite</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">
                    Niveau
                  </th>
                </tr>
              </thead>
              <tbody>
                {least.map((c, i) => (
                  <tr
                    key={c.slug}
                    className="border-t border-[var(--border)] transition-colors hover:bg-[#F5F3FF]"
                  >
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/risques`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">
                      {c.department}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-emerald-600">
                        {c.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        /10
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span
                        className={`text-xs font-semibold ${RISK_LEVEL_COLOR[c.level]}`}
                      >
                        {RISK_LEVEL_LABEL[c.level]}
                      </span>
                    </td>
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
              href={`/risques/${m.slug}`}
              className="flex h-full items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_10px_24px_-18px_rgba(124,58,237,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-16px_rgba(124,58,237,0.6)]"
            >
              <EmojiBadge emoji={m.emoji} tone={toneFor(i)} size="sm" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {m.label}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  Risques naturels
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/risques"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-[#4F46E5] to-[#DB2777] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-14px_rgba(79,70,229,0.7)] transition hover:opacity-95"
          >
            → Voir le palmarès national complet des risques naturels
          </Link>
        </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
