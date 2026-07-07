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
  computeCommerce,
  COMMERCE_LEVEL_LABEL,
  COMMERCE_LEVEL_COLOR,
} from "@/lib/commerce";
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
    title: `Couverture commerciale · ${macro.label} 2026`,
    description: `Offre commerciale des villes de ${macro.label} : densité, marchés & proximité, grandes surfaces, vitalité du centre-ville. Palmarès dérivé du profil INSEE / Procos.`,
    alternates: { canonical: `/commerces/${macro.slug}` },
    openGraph: {
      title: `Couverture commerciale · ${macro.label}`,
      description: `Classement des villes de la macro-région ${macro.label} par densité et vitalité commerciale.`,
    },
  };
}

const MIN_POP = 10_000;

export default async function MacroRegionCommercesPage({ params }: Props) {
  const { macroregion } = await params;
  const macro = getMacroRegion(macroregion);
  if (!macro) notFound();

  const cities = citiesInMacroRegion(macro)
    .filter((c) => (c.population ?? 0) >= MIN_POP)
    .map((c) => {
      const commerce = computeCommerce(c);
      return {
        slug: c.slug,
        name: c.name,
        region: c.region,
        department: c.department,
        commerce,
      };
    });

  // 10 = excellent → tri descendant pour les mieux fournies.
  const best = [...cities]
    .sort((a, b) => b.commerce.composite - a.commerce.composite)
    .slice(0, 15);
  const worst = [...cities]
    .sort((a, b) => a.commerce.composite - b.commerce.composite)
    .slice(0, 10);

  const n = cities.length || 1;
  const avgScore =
    Math.round(
      (cities.reduce((s, c) => s + c.commerce.composite, 0) / n) * 10,
    ) / 10;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Couverture commerciale", path: "/commerces" },
    { name: macro.label, path: `/commerces/${macro.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Où l'offre commerciale est-elle la plus dense en ${macro.label} ?`,
      a:
        best.length > 0
          ? `Top 3 des villes les mieux fournies en commerces en ${macro.label} (10 = couverture excellente) : ${best
              .slice(0, 3)
              .map((c) => `${c.name} (${c.commerce.composite.toFixed(1)}/10)`)
              .join(", ")}.`
          : `Aucune ville de plus de 10 000 habitants n'est référencée pour cette macro-région.`,
    },
    {
      q: `Quel est le score moyen de couverture commerciale en ${macro.label} ?`,
      a: `Score moyen ${avgScore}/10 (10 = couverture excellente) sur ${cities.length} villes référencées de plus de 10 000 habitants.`,
    },
    {
      q: `Comment ce score est-il calculé ?`,
      a: `Score 0-10 (10 = excellent) qui combine quatre dimensions : couverture globale (35 %), marchés & proximité (25 %), grandes surfaces (15 %), vitalité du centre-ville (25 %). Dérivé du profil INSEE / Procos, pas d'un décompte terrain.`,
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
          <Link href="/commerces" className="hover:underline">
            Couverture commerciale
          </Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {macro.emoji} Couverture commerciale — {macro.label}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Densité et vitalité de l&apos;offre commerciale dans les{" "}
          {cities.length} villes de la macro-région {macro.label} référencées
          de plus de 10 000 habitants. Score 0-10, 10 = couverture excellente
          (dense, diversifiée, centre-ville vivant).
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{cities.length} villes analysées</Badge>
          <Badge>Score moyen : {avgScore}/10</Badge>
          <Badge>Sources : INSEE BPE, Procos</Badge>
        </div>

        {/* Best */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 15 — villes les mieux fournies en {macro.label}
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
                        href={`/villes/${c.slug}/commerces`}
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
                        {c.commerce.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        /10
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span
                        className={`text-xs font-semibold ${COMMERCE_LEVEL_COLOR[c.commerce.level]}`}
                      >
                        {COMMERCE_LEVEL_LABEL[c.commerce.level]}
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
          Top 10 — villes en tension commerciale en {macro.label}
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
                        href={`/villes/${c.slug}/commerces`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">
                      {c.department}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-orange-600">
                        {c.commerce.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        /10
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span
                        className={`text-xs font-semibold ${COMMERCE_LEVEL_COLOR[c.commerce.level]}`}
                      >
                        {COMMERCE_LEVEL_LABEL[c.commerce.level]}
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
            <Link
              key={m.slug}
              href={`/commerces/${m.slug}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {m.label}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">
                  Couverture commerciale
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-sm">
          <Link
            href="/commerces"
            className="text-[var(--accent)] hover:underline"
          >
            → Voir le palmarès national complet de la couverture commerciale
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
