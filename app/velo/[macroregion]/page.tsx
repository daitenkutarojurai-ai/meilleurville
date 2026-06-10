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
  computeCyclingMobility,
  CYCLING_LEVEL_LABEL,
  CYCLING_LEVEL_COLOR,
} from "@/lib/cycling-mobility";
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
    title: `Villes cyclables · ${macro.label} 2026`,
    description: `Classement composite cyclabilité (réseau, relief, sécurité, climat) restreint aux villes de la macro-région ${macro.label}. Plus cyclables vs. plus difficiles à vélo.`,
    alternates: { canonical: `/velo/${macro.slug}` },
    openGraph: {
      title: `Villes cyclables · ${macro.label}`,
      description: `Index composite par ville de la macro-région ${macro.label}.`,
    },
  };
}

const MIN_POP = 10_000;

export default async function MacroRegionCyclingPage({ params }: Props) {
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
      cycling: computeCyclingMobility(c),
    }));

  // Convention 10 = excellent → tri descendant pour le « meilleur ».
  const best = [...cities].sort((a, b) => b.cycling.composite - a.cycling.composite).slice(0, 15);
  const worst = [...cities].sort((a, b) => a.cycling.composite - b.cycling.composite).slice(0, 10);

  const n = cities.length || 1;
  const avgComposite = Math.round((cities.reduce((s, c) => s + c.cycling.composite, 0) / n) * 10) / 10;
  const avgNetwork = Math.round((cities.reduce((s, c) => s + c.cycling.network.score, 0) / n) * 10) / 10;
  const avgTopo = Math.round((cities.reduce((s, c) => s + c.cycling.topography.score, 0) / n) * 10) / 10;
  const avgSafety = Math.round((cities.reduce((s, c) => s + c.cycling.safety.score, 0) / n) * 10) / 10;
  const avgClimate = Math.round((cities.reduce((s, c) => s + c.cycling.climate.score, 0) / n) * 10) / 10;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Mobilité vélo", path: "/velo" },
    { name: macro.label, path: `/velo/${macro.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quelles sont les villes les plus cyclables de ${macro.label} ?`,
      a:
        best.length > 0
          ? `Top 3 selon le composite (10 = excellent) : ${best
              .slice(0, 3)
              .map((c) => `${c.name} (${c.cycling.composite}/10)`)
              .join(", ")}.`
          : `Aucune ville de plus de 10 000 habitants n'est référencée pour cette macro-région.`,
    },
    {
      q: `Quel est le profil cyclabilité moyen sur ${macro.label} ?`,
      a: `Composite moyen ${avgComposite}/10 (10 = excellent). Détail par dimension (10 = bon) : réseau ${avgNetwork}/10, topographie ${avgTopo}/10, sécurité ${avgSafety}/10, climat ${avgClimate}/10.`,
    },
    {
      q: `Comment ce classement est-il calculé ?`,
      a: `Composite pondéré sur 4 dimensions : réseau cyclable (35 %, Baromètre FUB + Vélo & Territoires + EuroVelo), topographie (25 %), sécurité (25 %), climat (15 %). Sources : FUB, Vélo & Territoires, Géovélo, INSEE.`,
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
          <Link href="/velo" className="hover:underline">Vélo</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {macro.emoji} Villes cyclables — {macro.label}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Index composite restreint aux {cities.length} villes de la macro-région
          {" "}{macro.label} référencées de plus de 10 000 habitants. Quatre dimensions :
          réseau cyclable, topographie, sécurité, climat.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{cities.length} villes analysées</Badge>
          <Badge>Composite moyen : {avgComposite}/10</Badge>
        </div>

        {/* Macro-region aggregate */}
        <Card className="mt-6">
          <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-3">
            Profil vélo moyen de la macro-région
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { k: "Réseau", v: avgNetwork, hint: "Aménagements + EuroVelo" },
              { k: "Relief", v: avgTopo, hint: "Pente + altitude" },
              { k: "Sécurité", v: avgSafety, hint: "Trafic × aménagement" },
              { k: "Climat", v: avgClimate, hint: "Soleil + vent + hiver" },
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
            Sous-scores : 10 = excellent sur la dimension (convention vélo, opposée à la
            convention env où 10 = pire).
          </p>
        </Card>

        {/* Top cyclable */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 15 — villes les plus cyclables en {macro.label}
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Réseau</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Relief</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Sécurité</th>
                </tr>
              </thead>
              <tbody>
                {best.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/velo`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${CYCLING_LEVEL_COLOR[c.cycling.level]}`}>
                        {c.cycling.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {CYCLING_LEVEL_LABEL[c.cycling.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.cycling.network.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.cycling.topography.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.cycling.safety.score.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Worst */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 10 — villes les plus difficiles à vélo en {macro.label}
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Réseau</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Relief</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Sécurité</th>
                </tr>
              </thead>
              <tbody>
                {worst.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/velo`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {c.cycling.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.cycling.network.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.cycling.topography.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.cycling.safety.score.toFixed(1)}</td>
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
            <Link key={m.slug} href={`/velo/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Cyclabilité</div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-sm">
          <Link href="/velo" className="text-[var(--accent)] hover:underline">
            → Voir le classement national vélo complet
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
