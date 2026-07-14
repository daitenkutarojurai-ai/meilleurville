import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MACRO_REGIONS, MACRO_REGION_SLUGS, getMacroRegion } from "@/lib/macro-regions";
import { citiesInMacroRegion } from "@/lib/macro-regions-rankings";
import { rentalTension, tensionInfo } from "@/lib/rental-tension";
import { HOUSING } from "@/data/housing";
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
    title: `Tension locative · ${macro.label} 2026`,
    description: `Marché locatif des villes de ${macro.label} : où se loger est tendu vs. où c'est accessible. Loyers T2 de référence et score de tension par ville.`,
    alternates: { canonical: `/tension-locative/${macro.slug}` },
    openGraph: {
      title: `Tension locative · ${macro.label}`,
      description: `Classement de la difficulté à se loger par ville de la macro-région ${macro.label}.`,
    },
  };
}

const MIN_POP = 10_000;

export default async function MacroRegionTensionPage({ params }: Props) {
  const { macroregion } = await params;
  const macro = getMacroRegion(macroregion);
  if (!macro) notFound();

  const cities = citiesInMacroRegion(macro)
    .filter((c) => (c.population ?? 0) >= MIN_POP)
    .map((c) => {
      const tension = rentalTension(c);
      return {
        slug: c.slug,
        name: c.name,
        region: c.region,
        department: c.department,
        tension,
        info: tensionInfo(tension),
        rentT2: HOUSING[c.slug]?.avgRentT2 ?? null,
      };
    });

  // 10 = très tendu → tri descendant pour les plus tendues.
  const tense = [...cities].sort((a, b) => b.tension - a.tension).slice(0, 15);
  const relaxed = [...cities].sort((a, b) => a.tension - b.tension).slice(0, 10);

  const n = cities.length || 1;
  const avgTension = Math.round((cities.reduce((s, c) => s + c.tension, 0) / n) * 10) / 10;
  const withRent = cities.filter((c) => c.rentT2 != null);
  const avgRentT2 = withRent.length
    ? Math.round(withRent.reduce((s, c) => s + (c.rentT2 as number), 0) / withRent.length)
    : null;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Tension locative", path: "/tension-locative" },
    { name: macro.label, path: `/tension-locative/${macro.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Où est-il le plus difficile de se loger en ${macro.label} ?`,
      a:
        tense.length > 0
          ? `Top 3 selon le score de tension (10 = très tendu) : ${tense
              .slice(0, 3)
              .map((c) => `${c.name} (${c.tension.toFixed(1)}/10)`)
              .join(", ")}.`
          : `Aucune ville de plus de 10 000 habitants n'est référencée pour cette macro-région.`,
    },
    {
      q: `Quel est le niveau de tension moyen en ${macro.label} ?`,
      a: `Score de tension moyen ${avgTension}/10 (10 = très tendu) sur ${cities.length} villes référencées${
        avgRentT2 != null ? `, pour un loyer T2 moyen d'environ ${avgRentT2} €/mois` : ""
      }.`,
    },
    {
      q: `Comment ce score est-il calculé ?`,
      a: `Score 0-10 dérivé du loyer T2 de la ville rapporté à la médiane nationale (~750 €/mois, Clameur 2024) et d'un correctif de tension de marché par commune (FNAIM, observatoires des loyers, zonage DGALN).`,
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
          <Link href="/tension-locative" className="hover:underline">Tension locative</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {macro.emoji} Tension locative — {macro.label}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Difficulté à trouver un logement en location dans les {cities.length} villes
          de la macro-région {macro.label} référencées de plus de 10 000 habitants.
          Score 0-10, 10 = très tendu.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{cities.length} villes analysées</Badge>
          <Badge>Tension moyenne : {avgTension}/10</Badge>
          {avgRentT2 != null && <Badge>Loyer T2 moyen : ~{avgRentT2} €/mois</Badge>}
        </div>

        {/* Most tense */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 15 — villes les plus tendues en {macro.label}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Département</th>
                  <th className="px-3 py-2 text-right">Tension</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Niveau</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Loyer T2</th>
                </tr>
              </thead>
              <tbody>
                {tense.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/tension-locative`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {c.tension.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span className={`text-xs font-semibold ${c.info.color}`}>{c.info.shortLabel}</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">
                      {c.rentT2 != null ? `${c.rentT2} €` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Most relaxed */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 10 — villes les plus détendues en {macro.label}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Département</th>
                  <th className="px-3 py-2 text-right">Tension</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Niveau</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Loyer T2</th>
                </tr>
              </thead>
              <tbody>
                {relaxed.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/tension-locative`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-emerald-600">
                        {c.tension.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span className={`text-xs font-semibold ${c.info.color}`}>{c.info.shortLabel}</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">
                      {c.rentT2 != null ? `${c.rentT2} €` : "—"}
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
            <Link key={m.slug} href={`/tension-locative/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Tension locative</div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-sm space-y-2">
          <div>
            <Link href="/tension-locative" className="text-[var(--accent)] hover:underline">
              → Voir le palmarès national complet de la tension locative
            </Link>
          </div>
          <div>
            <Link href="/red-flags/villes-logement-introuvable" className="text-[var(--accent)] hover:underline">
              → Red flag : top 12 des villes où le logement locatif est carrément introuvable
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
