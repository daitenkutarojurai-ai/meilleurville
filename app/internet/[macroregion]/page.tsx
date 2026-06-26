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
import { internetScore, internetLabel } from "@/lib/internet-score";
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
    title: `Couverture internet · ${macro.label} 2026`,
    description: `Couverture fibre des villes de ${macro.label} : où le FTTH est généralisé vs où la connexion reste précaire. Estimation régionale ARCEP T4 2024.`,
    alternates: { canonical: `/internet/${macro.slug}` },
    openGraph: {
      title: `Couverture internet · ${macro.label}`,
      description: `Classement fibre / débit par ville de la macro-région ${macro.label}.`,
    },
  };
}

const MIN_POP = 10_000;

export default async function MacroRegionInternetPage({ params }: Props) {
  const { macroregion } = await params;
  const macro = getMacroRegion(macroregion);
  if (!macro) notFound();

  const cities = citiesInMacroRegion(macro)
    .filter((c) => (c.population ?? 0) >= MIN_POP)
    .map((c) => {
      const score = internetScore(c);
      return {
        slug: c.slug,
        name: c.name,
        region: c.region,
        department: c.department,
        score,
        info: internetLabel(score),
      };
    });

  // 10 = très bien connecté → tri descendant pour les mieux fibrées.
  const best = [...cities].sort((a, b) => b.score - a.score).slice(0, 15);
  const worst = [...cities].sort((a, b) => a.score - b.score).slice(0, 10);

  const n = cities.length || 1;
  const avgScore =
    Math.round((cities.reduce((s, c) => s + c.score, 0) / n) * 10) / 10;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Couverture internet", path: "/internet" },
    { name: macro.label, path: `/internet/${macro.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Où la fibre est-elle la plus déployée en ${macro.label} ?`,
      a:
        best.length > 0
          ? `Top 3 des villes les mieux connectées en ${macro.label} (10 = couverture FTTH généralisée) : ${best
              .slice(0, 3)
              .map((c) => `${c.name} (${c.score.toFixed(1)}/10)`)
              .join(", ")}.`
          : `Aucune ville de plus de 10 000 habitants n'est référencée pour cette macro-région.`,
    },
    {
      q: `Quel est le score moyen de couverture internet en ${macro.label} ?`,
      a: `Score moyen ${avgScore}/10 (10 = excellente couverture fibre) sur ${cities.length} villes référencées de plus de 10 000 habitants.`,
    },
    {
      q: `Comment ce score est-il calculé ?`,
      a: `Score 0-10 qui combine le sous-score télétravail du seed (60 %), un bonus régional aligné sur les taux de raccordables FTTH ARCEP T4 2024 et un correctif densité urbaine / département peu dense.`,
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
          <Link href="/internet" className="hover:underline">
            Couverture internet
          </Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {macro.emoji} Couverture internet — {macro.label}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Qualité de la connexion internet dans les {cities.length} villes de la
          macro-région {macro.label} référencées de plus de 10 000 habitants.
          Score 0-10, 10 = couverture FTTH généralisée.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{cities.length} villes analysées</Badge>
          <Badge>Score moyen : {avgScore}/10</Badge>
          <Badge>Source : ARCEP T4 2024</Badge>
        </div>

        {/* Best */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 15 — villes les mieux fibrées en {macro.label}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Département</th>
                  <th className="px-3 py-2 text-right">Score</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">
                    Niveau
                  </th>
                </tr>
              </thead>
              <tbody>
                {best.map((c, i) => (
                  <tr
                    key={c.slug}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/connexion-internet`}
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
                        {c.score.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        /10
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span className={`text-xs font-semibold ${c.info.color}`}>
                        {c.info.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Worst */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 10 — villes les moins bien connectées en {macro.label}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Département</th>
                  <th className="px-3 py-2 text-right">Score</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">
                    Niveau
                  </th>
                </tr>
              </thead>
              <tbody>
                {worst.map((c, i) => (
                  <tr
                    key={c.slug}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/connexion-internet`}
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
                        {c.score.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        /10
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span className={`text-xs font-semibold ${c.info.color}`}>
                        {c.info.label}
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
            <Link key={m.slug} href={`/internet/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {m.label}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">
                  Couverture internet
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-sm">
          <Link
            href="/internet"
            className="text-[var(--accent)] hover:underline"
          >
            → Voir le palmarès national complet de la couverture internet
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
