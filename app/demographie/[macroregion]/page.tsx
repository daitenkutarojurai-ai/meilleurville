import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MACRO_REGIONS, MACRO_REGION_SLUGS, getMacroRegion } from "@/lib/macro-regions";
import { citiesInMacroRegion } from "@/lib/macro-regions-rankings";
import {
  computeDemography,
  DEMO_LEVEL_LABEL,
  DEMO_LEVEL_COLOR,
} from "@/lib/demography";
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
    title: `Démographie · ${macro.label} 2026`,
    description: `Classement composite démographie (vieillissement, jeunes actifs, trajectoire, renouvellement) restreint aux villes de la macro-région ${macro.label}. Dynamiques vs. vieillissantes.`,
    alternates: { canonical: `/demographie/${macro.slug}` },
    openGraph: {
      title: `Démographie · ${macro.label}`,
      description: `Index composite par ville de la macro-région ${macro.label}.`,
    },
  };
}

const MIN_POP = 10_000;

export default async function MacroRegionDemographyPage({ params }: Props) {
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
      demo: computeDemography(c),
    }));

  // 10 = pire → tri ascendant pour les plus dynamiques.
  const dynamic = [...cities].sort((a, b) => a.demo.composite - b.demo.composite).slice(0, 15);
  const ageing = [...cities].sort((a, b) => b.demo.composite - a.demo.composite).slice(0, 10);

  const n = cities.length || 1;
  const avgComposite = Math.round((cities.reduce((s, c) => s + c.demo.composite, 0) / n) * 10) / 10;
  const avgAgeing = Math.round((cities.reduce((s, c) => s + c.demo.ageing.score, 0) / n) * 10) / 10;
  const avgYoung = Math.round((cities.reduce((s, c) => s + c.demo.youngActives.score, 0) / n) * 10) / 10;
  const avgTraj = Math.round((cities.reduce((s, c) => s + c.demo.trajectory.score, 0) / n) * 10) / 10;
  const avgRenewal = Math.round((cities.reduce((s, c) => s + c.demo.renewal.score, 0) / n) * 10) / 10;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Démographie", path: "/demographie" },
    { name: macro.label, path: `/demographie/${macro.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quelles sont les villes au profil démographique le plus dynamique en ${macro.label} ?`,
      a:
        dynamic.length > 0
          ? `Top 3 selon le composite (10 = démographie dynamique) : ${dynamic
              .slice(0, 3)
              .map((c) => `${c.name} (${(10 - c.demo.composite).toFixed(1)}/10)`)
              .join(", ")}.`
          : `Aucune ville de plus de 10 000 habitants n'est référencée pour cette macro-région.`,
    },
    {
      q: `Quel est le profil démographique moyen sur ${macro.label} ?`,
      a: `Composite moyen ${(10 - avgComposite).toFixed(1)}/10. Détail par dimension (10 = démographie dynamique) : vieillissement ${(10 - avgAgeing).toFixed(1)}/10, jeunes actifs ${(10 - avgYoung).toFixed(1)}/10, trajectoire ${(10 - avgTraj).toFixed(1)}/10, renouvellement ${(10 - avgRenewal).toFixed(1)}/10.`,
    },
    {
      q: `Comment ce classement est-il calculé ?`,
      a: `Composite pondéré sur 4 dimensions INSEE : vieillissement (30 %), trajectoire (30 %), jeunes actifs (25 %), renouvellement (15 %). Sources : INSEE RP, Bilan démographique, projection OMPHALE.`,
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
          <Link href="/demographie" className="hover:underline">Démographie</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {macro.emoji} Démographie — {macro.label}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Index composite restreint aux {cities.length} villes de la macro-région
          {" "}{macro.label} référencées de plus de 10 000 habitants. Quatre dimensions :
          vieillissement, jeunes actifs, trajectoire, renouvellement.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{cities.length} villes analysées</Badge>
          <Badge>Composite moyen : {(10 - avgComposite).toFixed(1)}/10</Badge>
        </div>

        {/* Macro-region aggregate */}
        <Card className="mt-6">
          <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-3">
            Profil démographique moyen de la macro-région
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { k: "Vieillis.", v: avgAgeing, hint: "% seniors 60+ dept" },
              { k: "Jeunes", v: avgYoung, hint: "Déficit 25-35 ans" },
              { k: "Trajectoire", v: avgTraj, hint: "Solde naturel + migratoire" },
              { k: "Renouv.", v: avgRenewal, hint: "Taux natalité ‰" },
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
            Sous-scores : 10 = démographie dynamique.
          </p>
        </Card>

        {/* Top dynamic */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 15 — villes au profil le plus dynamique en {macro.label}
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Vieillis.</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Jeunes</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Trajectoire</th>
                </tr>
              </thead>
              <tbody>
                {dynamic.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/demographie`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${DEMO_LEVEL_COLOR[c.demo.level]}`}>
                        {(10 - c.demo.composite).toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {DEMO_LEVEL_LABEL[c.demo.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.demo.ageing.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.demo.youngActives.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.demo.trajectory.score).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Ageing */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 10 — villes en tension démographique en {macro.label}
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Vieillis.</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Jeunes</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Trajectoire</th>
                </tr>
              </thead>
              <tbody>
                {ageing.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/demographie`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {(10 - c.demo.composite).toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.demo.ageing.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.demo.youngActives.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.demo.trajectory.score).toFixed(1)}</td>
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
            <Link key={m.slug} href={`/demographie/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Démographie</div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-sm">
          <Link href="/demographie" className="text-[var(--accent)] hover:underline">
            → Voir le classement national démographique complet
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
