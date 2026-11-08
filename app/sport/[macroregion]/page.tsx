import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { MACRO_REGIONS, MACRO_REGION_SLUGS, getMacroRegion } from "@/lib/macro-regions";
import { citiesInMacroRegion } from "@/lib/macro-regions-rankings";
import {
  computeSportLeisure,
  SPORT_LEVEL_LABEL,
  SPORT_LEVEL_COLOR,
} from "@/lib/sport-leisure";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { pathAlternates } from "@/lib/i18n";
import { fitTitle } from "@/lib/brand";

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
    title: fitTitle(`Villes sportives · ${macro.label} 2026`),
    description: `Classement composite sport & loisirs (équipements, outdoor, clubs, climat) restreint aux villes de la macro-région ${macro.label}. Plus sportives vs. moins propices à la pratique.`,
    alternates: pathAlternates(`/sport/${macro.slug}`, `/sport/${macro.slug}`),
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
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

      <section className="relative overflow-hidden bg-aurora pt-20 pb-12 sm:pb-14">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <nav className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-tertiary)] mb-5">
          <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">Accueil</Link>
          <span>/</span>
          <Link href="/sport" className="hover:text-[var(--text-secondary)] transition-colors">Sport &amp; loisirs</Link>
          <span>/</span>
          <span className="text-[var(--text-secondary)]">{macro.label}</span>
        </nav>

        <div className="flex items-center gap-3 mb-3">
          <EmojiBadge emoji={macro.emoji} tone={toneFor(macro.slug)} />
          <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            Sport &amp; loisirs
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Villes sportives — <span className="font-display gradient-text-anim italic">{macro.label}</span>
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Index composite restreint aux {cities.length} villes de la macro-région
          {" "}{macro.label} référencées de plus de 10 000 habitants. Quatre dimensions :
          équipements, cadre outdoor, vie associative, climat propice à la pratique.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center rounded-full bg-white/85 px-3 py-1 font-semibold text-[#4338CA] ring-1 ring-[#C7D2FE]">{cities.length} villes analysées</span>
          <span className="inline-flex items-center rounded-full bg-white/85 px-3 py-1 font-semibold text-[#4338CA] ring-1 ring-[#C7D2FE]">Composite moyen : {avgComposite}/10</span>
        </div>
        </div>
      </section>

      <section className="band band-indigo py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Macro-region aggregate */}
          <h2 className="text-2xl font-bold gradient-text mb-4">
            Profil sportif moyen de la macro-région
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { k: "Équipements", v: avgFacilities, hint: "Maillage + élite" },
              { k: "Outdoor", v: avgOutdoor, hint: "Montagne / mer / forêt / lac" },
              { k: "Clubs", v: avgClubs, hint: "Tissu associatif" },
              { k: "Climat", v: avgClimate, hint: "Soleil + chaleur + froid" },
            ].map((d) => (
              <div key={d.k} className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
                <div className="text-xs font-semibold uppercase tracking-wide text-[#4338CA]">{d.k}</div>
                <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)] mt-1">
                  {d.v.toFixed(1)}
                  <span className="text-xs font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)] mt-1 leading-tight">{d.hint}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-4">
            Sous-scores : 10 = excellent sur la dimension (convention sport, opposée à
            la convention env où 10 = pire).
          </p>
        </div>
      </section>

      <section className="band band-sky py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Top sportives */}
        <h2 className="text-2xl font-bold gradient-text">
          Top 15 — villes les plus sportives en {macro.label}
        </h2>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_-18px_rgba(8,145,178,0.5)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#CFFAFE] text-[#0E7490] text-xs uppercase tracking-wide">
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
                  <tr key={c.slug} className="border-t border-[#CFFAFE]">
                    <td className="px-3 py-2 font-bold tabular-nums text-[#0E7490]">{i + 1}</td>
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
        </div>
        </div>
      </section>

      <section className="band band-pink py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Worst */}
        <h2 className="text-2xl font-bold gradient-text">
          Top 10 — villes les moins propices au sport en {macro.label}
        </h2>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_-18px_rgba(219,39,119,0.45)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#FCE7F3] text-[#9D174D] text-xs uppercase tracking-wide">
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
                  <tr key={c.slug} className="border-t border-[#FCE7F3]">
                    <td className="px-3 py-2 font-bold tabular-nums text-[#9D174D]">{i + 1}</td>
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
        </div>
        </div>
      </section>

      <section className="band band-lilac py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Other macro-regions */}
        <h2 className="text-xl font-bold gradient-text">
          Autres macro-régions
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.filter((m) => m.slug !== macro.slug).map((m) => (
            <Link key={m.slug} href={`/sport/${m.slug}`} className="group block">
              <div className="h-full rounded-2xl bg-white p-4 ring-1 ring-transparent shadow-[0_10px_28px_-18px_rgba(124,58,237,0.45)] transition-all group-hover:-translate-y-0.5 group-hover:ring-[#D8B4FE]">
                <EmojiBadge emoji={m.emoji} tone={toneFor(m.slug)} size="sm" className="mb-2" />
                <div className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Sport & loisirs</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-sm">
          <Link href="/sport" className="inline-flex items-center rounded-full grad-head-0 px-4 py-2 font-semibold shadow-sm transition-transform hover:-translate-y-0.5">
            → Voir le classement national sport complet
          </Link>
        </div>
        </div>
      </section>

      <section className="band band-white py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FeedbackWidget />
        </div>
      </section>

      <Footer />
    </main>
  );
}
