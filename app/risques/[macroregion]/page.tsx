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
} from "@/lib/macro-regions";
import { citiesInMacroRegion } from "@/lib/macro-regions-rankings";
import {
  computeNaturalRisks,
  RISK_LEVEL_LABEL,
  RISK_LEVEL_COLOR,
} from "@/lib/natural-risks";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";

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
    title: `Risques naturels · ${macro.label} 2026`,
    description: `Inondation, sismicité, argile, feux de forêt dans les villes de ${macro.label}. Top 15 les plus exposées vs top 10 les plus tranquilles.`,
    alternates: { canonical: `/risques/${macro.slug}` },
    openGraph: {
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
      a: `Synthèse pédagogique sur 4 dimensions : inondation (35 %, fleuve majeur + altitude + littoral), retrait-gonflement argile (25 %, aléa BRGM départemental), feu de forêt (20 %, classification ONF), sismicité (20 %, zonage réglementaire 2011). Cliquez sur chaque ville pour le détail aléa par aléa.`,
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

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">
            Accueil
          </Link>{" "}
          ·{" "}
          <Link href="/risques" className="hover:underline">
            Risques naturels
          </Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {macro.emoji} Risques naturels — {macro.label}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Exposition aux 4 grands aléas (inondation, sismicité, argile, feu de
          forêt) des {cities.length} villes de la macro-région {macro.label}{" "}
          référencées de plus de 10 000 habitants. Composite 0-10, 10 =
          exposition maximale.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{cities.length} villes analysées</Badge>
          <Badge>Composite moyen : {avgComposite}/10</Badge>
          <Badge>Sources : BCSF · BRGM · ONF</Badge>
        </div>

        {/* Most exposed */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 15 — villes les plus exposées en {macro.label}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
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
                      className="border-t border-[var(--border)]"
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
        </Card>

        {/* Least exposed */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 10 — villes les plus tranquilles en {macro.label}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
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
                    className="border-t border-[var(--border)]"
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
        </Card>

        {/* Other macro-regions */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Autres macro-régions
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.filter((m) => m.slug !== macro.slug).map((m) => (
            <Link key={m.slug} href={`/risques/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {m.label}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">
                  Risques naturels
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-sm">
          <Link
            href="/risques"
            className="text-[var(--accent)] hover:underline"
          >
            → Voir le palmarès national complet des risques naturels
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
