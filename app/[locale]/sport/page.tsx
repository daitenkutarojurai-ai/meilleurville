import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { SPORT_LEVEL_COLOR } from "@/lib/sport-leisure";
import { topSportFriendly, bottomSportFriendly } from "@/lib/sport-leisure-rankings";
import { MACRO_REGIONS } from "@/lib/macro-regions";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";
import { pathAlternatesEn } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

export const metadata: Metadata = {
  title: "Most sport-friendly cities in France · 2026 ranking",
  description:
    "National ranking of French cities by everyday sport: facilities, outdoor playground, club scene, climate. Top 30 most sport-friendly cities vs top 20 most challenging. Sources: INJEP · RES · CREPS · DRAJES.",
  alternates: pathAlternatesEn("/sport", "/sport"),
  openGraph: {
    // Sans `images`, un openGraph de page remplace celui hérité de la racine
    // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
    images: ["/opengraph-image"],
    title: "Most sport-friendly cities in France 2026",
    description:
      "Top 30 cities where everyday sport is easy vs top 20 where it stays demanding. INJEP · RES · CREPS · DRAJES.",
  },
};

const EN_MACRO_LABEL: Record<string, string> = {
  "cote-atlantique": "Atlantic Coast",
  "arc-mediterraneen": "Mediterranean Arc",
  "arc-alpin": "Alpine Arc",
  "sud-ouest-gascon": "South-West Gascony",
  "vallee-du-rhone": "Rhône Valley",
  "ile-de-france-elargie": "Greater Île-de-France",
};

const EN_SPORT_LABEL: Record<string, string> = {
  excellent: "Excellent",
  bon: "Good",
  moyen: "Average",
  "limité": "Limited",
};

const MIN_POP = 15_000;

export default function EnSportPage() {
  const best = topSportFriendly(30, MIN_POP);
  const worst = bottomSportFriendly(20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Sport & leisure", path: "/sport" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Which French cities are the most sport-friendly in 2026?",
      a: `According to our composite F70 (facilities, outdoor, clubs, climate), the most sport-friendly cities (population ≥ 15,000) are: ${best
        .slice(0, 5)
        .map((c) => `${c.name} (${c.sport.composite.toFixed(1)}/10)`)
        .join(", ")}. All combine a dense municipal facility network, a usable outdoor playground and a living club scene.`,
    },
    {
      q: "Which cities are the least sport-friendly?",
      a: `Cities of 15,000+ residents with the lowest composite are: ${worst
        .slice(0, 5)
        .map((c) => `${c.name} (${c.sport.composite.toFixed(1)}/10)`)
        .join(", ")}. They typically combine a limited facility network, a monotonous natural setting and a harsh climate.`,
    },
    {
      q: "How is this ranking calculated?",
      a: "Composite aggregating 4 dimensions: facilities (35%, RES INJEP + CREPS / INSEP bonus), outdoor playground (30%, mountains / coast / forest / lakes), club scene (20%, club density + regional sporting identity), climate (15%, sunshine + summer heat + winter cold). Score 0-10, 10 = excellent. Sources: INJEP, RES, sports.gouv.fr, CREPS, DRAJES, FFRandonnée.",
    },
    {
      q: "Where can I find the official RES?",
      a: "The Sport Equipment Register (equipements.sports.gouv.fr) publishes the official map of pools, stadiums, indoor halls and courts by commune. data.gouv.fr offers the full dataset. For elite hubs, see the CREPS network and INSEP.",
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen relative bg-[var(--bg-canvas)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="relative overflow-hidden bg-aurora pt-20 pb-12 sm:pb-14">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-5">
          <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[var(--text-secondary)]">Sport &amp; leisure</span>
        </nav>

        <div className="flex items-center gap-3 mb-3">
          <EmojiBadge emoji="🏅" tone="pink" />
          <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            Sport &amp; leisure
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-1">
          Most sport-friendly cities <span className="font-display gradient-text-anim italic">in France</span>
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Composite index covering four key dimensions of regular sport: municipal facilities,
          outdoor playground, club scene and a workable climate. Score 0-10, 10 = excellent.
          Filtered to cities ≥ 15,000 residents for meaningful indicators.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center rounded-full bg-white/85 px-3 py-1 font-semibold text-[#4338CA] ring-1 ring-[#C7D2FE]">Educational overview</span>
          <span className="inline-flex items-center rounded-full bg-white/85 px-3 py-1 font-semibold text-[#4338CA] ring-1 ring-[#C7D2FE]">4 dimensions · {CITIES_COUNT} cities</span>
          <span className="inline-flex items-center rounded-full bg-white/85 px-3 py-1 font-semibold text-[#4338CA] ring-1 ring-[#C7D2FE]">Facilities 35% · outdoor 30% · clubs 20% · climate 15%</span>
        </div>

        </div>
      </section>

      <section className="band band-indigo py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Top sport-friendly */}
        <h2 className="text-2xl font-bold gradient-text">
          Top 30 — Most sport-friendly cities
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities combining an elite hub (CREPS / INSEP), a dense club scene, a usable natural
          setting and a climate that supports regular activity.
        </p>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#EEF2FF] text-xs uppercase tracking-wide text-[#4338CA]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Region</th>
                  <th className="px-3 py-2 text-right">Composite</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Facil.</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Outdoor</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Clubs</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Climate</th>
                </tr>
              </thead>
              <tbody>
                {best.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[#E0E7FF]">
                    <td className="px-3 py-2 font-bold tabular-nums text-[#4338CA]">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/sports-leisure`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${SPORT_LEVEL_COLOR[c.sport.level]}`}>
                        {c.sport.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {EN_SPORT_LABEL[c.sport.level] ?? c.sport.level}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.sport.facilities.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.sport.outdoor.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.sport.clubs.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.sport.climate.score.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Score reading: 10 = ideal for regular sport. Score &gt; 7 = a deeply sporty city (a complete
          playground).
        </p>

        </div>
      </section>

      <section className="band band-pink py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Worst */}
        <h2 className="text-2xl font-bold gradient-text">
          Top 20 — Least sport-friendly cities
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities of 15,000+ residents combining limited facilities, a monotonous natural setting
          and a thin club scene. Sport stays possible but takes a trip or a private membership.
        </p>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_-18px_rgba(219,39,119,0.45)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#FCE7F3] text-xs uppercase tracking-wide text-[#9D174D]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Region</th>
                  <th className="px-3 py-2 text-right">Composite</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Facil.</th>
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
                        href={`/cities/${c.slug}/sports-leisure`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
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

      <section className="band band-sky py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Methodology */}
        <h2 className="text-xl font-bold gradient-text">Methodology</h2>
        <div className="mt-3 rounded-2xl bg-white p-5 sm:p-6 shadow-[0_10px_28px_-18px_rgba(8,145,178,0.5)]">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Facilities (35%)</strong> — proxy
              derived from the INJEP Sport Equipment Register (pools, stadiums, indoor halls,
              multi-purpose courts) correlated with population and metropolitan status. Bonus for
              elite hubs (CREPS network — Vichy, Talence, Strasbourg, Châtenay-Malabry, Nantes,
              Poitiers; INSEP Vincennes; ENVSN Saint-Pierre-Quiberon; top alpine resorts such as
              Tignes / Val d&apos;Isère).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Outdoor playground (30%)</strong> —
              the sum of natural training grounds within easy reach: mountains (Alps, Pyrenees,
              Massif Central, Vosges, Jura, Corsica), coastline (Channel, Atlantic, Mediterranean,
              overseas), a major forest, an alpine lake or a navigable river. At least two assets
              combined = score &gt; 8/10.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Club scene (20%)</strong> — density of
              the local club tissue. Bonus for departments with a strong sporting identity (Basque
              Country, Auvergne-Rhône-Alpes, Brittany, PACA, south-west rugby). Penalty for
              ultra-isolated rural Centre/East in demographic decline (Creuse, Cantal, Lozère…) and
              the most stretched DROM (Mayotte, French Guiana).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Climate (15%)</strong> — annual
              sunshine + winter temperature + summer temperature. Bonus for the Mediterranean arc
              and the southern Atlantic coast (a near year-round sport season). Penalty for heatwave
              summers (July mean &gt; 27 °C) and very cold winters.
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            City-level score. Your experience also depends on the neighbourhood (whether you live
            next to a sports complex or not) and the discipline. For the full equipment-by-equipment
            view, see{" "}
            <a href="https://equipements.sports.gouv.fr" target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline">
              equipements.sports.gouv.fr
            </a>
            .
          </p>
        </div>

        </div>
      </section>

      <section className="band band-lilac py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* By geographic zone */}
        <h2 className="text-xl font-bold gradient-text">By geographic zone</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Sport-friendliness varies sharply between the Alpine arc (outstanding outdoor playground)
          and Greater Île-de-France (dense facilities but a limited natural setting). View restricted
          to each large geographic zone.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link key={m.slug} href={`/sport/${m.slug}`} className="group block">
              <div className="h-full rounded-2xl bg-white p-4 ring-1 ring-transparent shadow-[0_10px_28px_-18px_rgba(124,58,237,0.45)] transition-all group-hover:-translate-y-0.5 group-hover:ring-[#D8B4FE]">
                <EmojiBadge emoji={m.emoji} tone={toneFor(m.slug)} size="sm" className="mb-2" />
                <div className="text-sm font-semibold text-[var(--text-primary)]">{EN_MACRO_LABEL[m.slug] ?? m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Sport index</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Cross-links */}
        <h2 className="mt-12 text-xl font-bold gradient-text">See also</h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/cycling" className="group block">
            <div className="h-full rounded-2xl bg-white p-4 ring-1 ring-transparent shadow-[0_10px_28px_-18px_rgba(124,58,237,0.45)] transition-all group-hover:-translate-y-0.5 group-hover:ring-[#D8B4FE]">
              <EmojiBadge emoji="🚲" tone="sky" size="sm" className="mb-2" />
              <div className="text-sm font-semibold text-[var(--text-primary)]">Cycling mobility</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Everyday cyclability</div>
            </div>
          </Link>
          <Link href="/quality-of-life" className="group block">
            <div className="h-full rounded-2xl bg-white p-4 ring-1 ring-transparent shadow-[0_10px_28px_-18px_rgba(124,58,237,0.45)] transition-all group-hover:-translate-y-0.5 group-hover:ring-[#D8B4FE]">
              <EmojiBadge emoji="🌿" tone="aqua" size="sm" className="mb-2" />
              <div className="text-sm font-semibold text-[var(--text-primary)]">Quality of life</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Mega-index: env + healthcare + jobs</div>
            </div>
          </Link>
          <Link href="/rankings" className="group block">
            <div className="h-full rounded-2xl bg-white p-4 ring-1 ring-transparent shadow-[0_10px_28px_-18px_rgba(124,58,237,0.45)] transition-all group-hover:-translate-y-0.5 group-hover:ring-[#D8B4FE]">
              <EmojiBadge emoji="🏆" tone="indigo" size="sm" className="mb-2" />
              <div className="text-sm font-semibold text-[var(--text-primary)]">All rankings</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Life, transport, safety…</div>
            </div>
          </Link>
        </div>
        </div>
      </section>

      <section className="band band-white py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FeedbackWidget locale="en" />
        </div>
      </section>

      <Footer />
    </main>
  );
}
