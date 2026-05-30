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
  computeSportLeisure,
  SPORT_LEVEL_LABEL,
  SPORT_LEVEL_COLOR,
} from "@/lib/sport-leisure";
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
    title: `Villes sportives · ${macro.label} 2026`,
    description: `Classement composite sport & loisirs (équipements, outdoor, clubs, climat) restreint aux villes de la macro-région ${macro.label}. Plus sportives vs. moins propices à la pratique.`,
    alternates: { canonical: `/sport/${macro.slug}` },
    openGraph: {
      title: `Villes sportives · ${macro.label}`,
      description: `Index composite par ville de la macro-région ${macro.label}.`,
    },
  };
}

const MIN_POP = 10_000;

export default async function MacroRegionSportPage({ params }: Props) {
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
      sport: computeSportLeisure(c),
    }));

  // Convention 10 = excellent → tri descendant pour le « meilleur ».
  const best = [...cities].sort((a, b) => b.sport.composite - a.sport.composite).slice(0, 15);
  const worst = [...cities].sort((a, b) => a.sport.composite - b.sport.composite).slice(0, 10);

  const n = cities.length || 1;
  const avgComposite = Math.round((cities.reduce((s, c) => s + c.sport.composite, 0) / n) * 10) / 10;
  const avgFacilities = Math.round((cities.reduce((s, c) => s + c.sport.facilities.score, 0) / n) * 10) / 10;
  const avgOutdoor = Math.round((cities.reduce((s, c) => s + c.sport.outdoor.score, 0) / n) * 10) / 10;
  const avgClubs = Math.round((cities.reduce((s, c) => s + c.sport.clubs.score, 0) / n) * 10) / 10;
  const avgClimate = Math.round((cities.reduce((s, c) => s + c.sport.climate.score, 0) / n) * 10) / 10;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Sport & loisirs", path: "/sport" },
    { name: macro.label, path: `/sport/${macro.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quelles sont les villes les plus sportives de ${macro.label} ?`,
      a:
        best.length > 0
          ? `Top 3 selon le composite (10 = excellent) : ${best
              .slice(0, 3)
              .map((c) => `${c.name} (${c.sport.composite}/10)`)
              .join(", ")}.`
          : `Aucune ville de plus de 10 000 habitants n'est référencée pour cette macro-région.`,
    },
    {
      q: `Quel est le profil sportif moyen sur ${macro.label} ?`,
      a: `Composite moyen ${avgComposite}/10 (10 = excellent). Détail par dimension (10 = bon) : équipements ${avgFacilities}/10, cadre outdoor ${avgOutdoor}/10, vie associative ${avgClubs}/10, climat ${avgClimate}/10.`,
    },
    {
      q: `Comment ce classement est-il calculé ?`,
      a: `Composite pondéré sur 4 dimensions : équipements (35 %, RES INJEP + bonus CREPS / INSEP), cadre outdoor (30 %), vie associative (20 %), climat (15 %). Sources : INJEP, sports.gouv.fr, CREPS, DRAJES, FFRandonnée.`,
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
          <Link href="/sport" className="hover:underline">Sport</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {macro.emoji} Villes sportives — {macro.label}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Index composite restreint aux {cities.length} villes de la macro-région
          {" "}{macro.label} référencées de plus de 10 000 habitants. Quatre dimensions :
          équipements, cadre outdoor, vie associative, climat propice à la pratique.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{cities.length} villes analysées</Badge>
          <Badge>Composite moyen : {avgComposite}/10</Badge>
        </div>

        {/* Macro-region aggregate */}
        <Card className="mt-6">
          <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-3">
            Profil sportif moyen de la macro-région
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { k: "Équipements", v: avgFacilities, hint: "Maillage + élite" },
              { k: "Outdoor", v: avgOutdoor, hint: "Montagne / mer / forêt / lac" },
              { k: "Clubs", v: avgClubs, hint: "Tissu associatif" },
              { k: "Climat", v: avgClimate, hint: "Soleil + chaleur + froid" },
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
            Sous-scores : 10 = excellent sur la dimension (convention sport, opposée à
            la convention env où 10 = pire).
          </p>
        </Card>

        {/* Top sportives */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 15 — villes les plus sportives en {macro.label}
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Équip.</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Outdoor</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Clubs</th>
                </tr>
              </thead>
              <tbody>
                {best.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/sport`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${SPORT_LEVEL_COLOR[c.sport.level]}`}>
                        {c.sport.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {SPORT_LEVEL_LABEL[c.sport.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.sport.facilities.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.sport.outdoor.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.sport.clubs.score.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Worst */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 10 — villes les moins propices au sport en {macro.label}
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Équip.</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Outdoor</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Clubs</th>
                </tr>
              </thead>
              <tbody>
                {worst.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/sport`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {c.sport.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.sport.facilities.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.sport.outdoor.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.sport.clubs.score.toFixed(1)}</td>
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
            <Link key={m.slug} href={`/sport/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Sport & loisirs</div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-sm">
          <Link href="/sport" className="text-[var(--accent)] hover:underline">
            → Voir le classement national sport complet
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
