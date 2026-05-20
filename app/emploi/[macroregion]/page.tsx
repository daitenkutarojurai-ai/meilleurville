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
  computeEmploymentMarket,
  JOB_LEVEL_LABEL,
  JOB_LEVEL_COLOR,
} from "@/lib/employment-market";
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
    title: `Marché de l'emploi · ${macro.label} 2026`,
    description: `Classement composite marché du travail (chômage, salaire, dynamisme, mix) restreint aux villes de la macro-région ${macro.label}. Marché favorable vs. sinistré.`,
    alternates: { canonical: `/emploi/${macro.slug}` },
    openGraph: {
      title: `Marché de l'emploi · ${macro.label}`,
      description: `Index composite F50 par ville de la macro-région ${macro.label}.`,
    },
  };
}

const MIN_POP = 10_000;

export default async function MacroRegionEmploymentPage({ params }: Props) {
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
      market: computeEmploymentMarket(c),
    }));

  // Score faible = marché favorable (composite 0-10, 10 = sinistré).
  const best = [...cities].sort((a, b) => a.market.composite - b.market.composite).slice(0, 15);
  const worst = [...cities].sort((a, b) => b.market.composite - a.market.composite).slice(0, 10);

  const n = cities.length || 1;
  const avgComposite = Math.round((cities.reduce((s, c) => s + c.market.composite, 0) / n) * 10) / 10;
  const avgUnemp = Math.round((cities.reduce((s, c) => s + c.market.unemployment.score, 0) / n) * 10) / 10;
  const avgSalary = Math.round((cities.reduce((s, c) => s + c.market.salary.score, 0) / n) * 10) / 10;
  const avgDyn = Math.round((cities.reduce((s, c) => s + c.market.dynamism.score, 0) / n) * 10) / 10;
  const avgMix = Math.round((cities.reduce((s, c) => s + c.market.sectorMix.score, 0) / n) * 10) / 10;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Emploi & marché du travail", path: "/emploi" },
    { name: macro.label, path: `/emploi/${macro.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quelles villes ont le marché du travail le plus favorable en ${macro.label} ?`,
      a:
        best.length > 0
          ? `Top 3 selon le composite F50 (10 = marché du travail dynamique) : ${best
              .slice(0, 3)
              .map((c) => `${c.name} (${(10 - c.market.composite).toFixed(1)}/10)`)
              .join(", ")}. Score élevé = marché favorable.`
          : `Aucune ville de plus de 10 000 habitants n'est référencée pour cette macro-région.`,
    },
    {
      q: `Quel est le profil emploi moyen sur ${macro.label} ?`,
      a: `Composite moyen ${(10 - avgComposite).toFixed(1)}/10 (10 = marché du travail dynamique). Détail par dimension (10 = situation la plus favorable) : chômage ${(10 - avgUnemp).toFixed(1)}/10, salaire ${(10 - avgSalary).toFixed(1)}/10, dynamisme ${(10 - avgDyn).toFixed(1)}/10, mix sectoriel ${(10 - avgMix).toFixed(1)}/10.`,
    },
    {
      q: `Comment ce classement est-il calculé ?`,
      a: `Composite pondéré sur 4 dimensions : chômage INSEE T4 2024 par dept (35 %), salaire net médian DADS (25 %), dynamisme création SIRENE (20 %), mix sectoriel et résilience (20 %). Sources : INSEE, DARES, SIRENE, DADS.`,
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
          <Link href="/emploi" className="hover:underline">Emploi</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {macro.emoji} Marché de l&apos;emploi — {macro.label}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Index composite F50 restreint aux {cities.length} villes de la macro-région
          {" "}{macro.label} référencées de plus de 10 000 habitants. Quatre dimensions :
          chômage, salaire médian, dynamisme entrepreneurial, mix sectoriel.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{cities.length} villes analysées</Badge>
          <Badge>Composite moyen : {(10 - avgComposite).toFixed(1)}/10</Badge>
        </div>

        {/* Macro-region aggregate */}
        <Card className="mt-6">
          <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-3">
            Profil emploi moyen de la macro-région
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { k: "Chômage", v: avgUnemp, hint: "INSEE T4 2024 par dept" },
              { k: "Salaire", v: avgSalary, hint: "DADS net médian dept" },
              { k: "Dynamisme", v: avgDyn, hint: "Création SIRENE + attractivité" },
              { k: "Mix sectoriel", v: avgMix, hint: "Diversification & résilience" },
            ].map((d) => (
              <div key={d.k} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
                <div className="text-xs text-[var(--text-tertiary)]">{d.k}</div>
                <div className="text-xl font-bold tabular-nums text-[var(--text-primary)] mt-1">
                  {(10 - d.v).toFixed(1)}
                  <span className="text-xs font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)] mt-1 leading-tight">{d.hint}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-3">
            Sous-scores : 10 = situation la plus favorable (chômage bas, salaire haut, fort dynamisme, mix diversifié).
          </p>
        </Card>

        {/* Top most favorable */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 15 — villes au marché le plus favorable en {macro.label}
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Chômage</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Salaire</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Dynam.</th>
                </tr>
              </thead>
              <tbody>
                {best.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/emploi`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${JOB_LEVEL_COLOR[c.market.level]}`}>
                        {(10 - c.market.composite).toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {JOB_LEVEL_LABEL[c.market.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.market.unemployment.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.market.salary.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.market.dynamism.score).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Worst */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 10 — villes au marché le plus difficile en {macro.label}
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Chômage</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Salaire</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Dynam.</th>
                </tr>
              </thead>
              <tbody>
                {worst.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/emploi`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {(10 - c.market.composite).toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.market.unemployment.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.market.salary.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.market.dynamism.score).toFixed(1)}</td>
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
            <Link key={m.slug} href={`/emploi/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Marché de l&apos;emploi</div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-sm">
          <Link href="/emploi" className="text-[var(--accent)] hover:underline">
            → Voir le classement national emploi complet
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
