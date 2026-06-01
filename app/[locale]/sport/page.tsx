import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  topSportFriendly,
  bottomSportFriendly,
  SPORT_LEVEL_COLOR,
} from "@/lib/sport-leisure";
import { MACRO_REGIONS } from "@/lib/macro-regions";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Most sport-friendly cities in France · 2026 ranking",
  description:
    "National ranking of French cities by everyday sport: facilities, outdoor playground, club scene, climate. Top 30 most sport-friendly cities vs top 20 most challenging. Sources: INJEP · RES · CREPS · DRAJES.",
  alternates: { canonical: `${EN_BASE}/sport` },
  openGraph: {
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
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Home</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Most sport-friendly cities in France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Composite index covering four key dimensions of regular sport: municipal facilities,
          outdoor playground, club scene and a workable climate. Score 0-10, 10 = excellent.
          Filtered to cities ≥ 15,000 residents for meaningful indicators.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Educational overview</Badge>
          <Badge>4 dimensions · {CITIES_COUNT} cities</Badge>
          <Badge>Facilities 35% · outdoor 30% · clubs 20% · climate 15%</Badge>
        </div>

        {/* Top sport-friendly */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — Most sport-friendly cities
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities combining an elite hub (CREPS / INSEP), a dense club scene, a usable natural
          setting and a climate that supports regular activity.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
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
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
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
        </Card>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Score reading: 10 = ideal for regular sport. Score &gt; 7 = a deeply sporty city (a complete
          playground).
        </p>

        {/* Worst */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — Least sport-friendly cities
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities of 15,000+ residents combining limited facilities, a monotonous natural setting
          and a thin club scene. Sport stays possible but takes a trip or a private membership.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
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
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
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
        </Card>

        {/* Methodology */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">Methodology</h2>
        <Card className="mt-3">
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
        </Card>

        {/* By geographic zone */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">By geographic zone</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Sport-friendliness varies sharply between the Alpine arc (outstanding outdoor playground)
          and Greater Île-de-France (dense facilities but a limited natural setting). View restricted
          to each large geographic zone.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link key={m.slug} href={`/sport/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{EN_MACRO_LABEL[m.slug] ?? m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Sport index</div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Cross-links */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">See also</h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/cycling" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🚲</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Cycling mobility</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Everyday cyclability</div>
            </Card>
          </Link>
          <Link href="/quality-of-life" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🌿</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Quality of life</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Mega-index: env + healthcare + jobs</div>
            </Card>
          </Link>
          <Link href="/rankings" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">All rankings</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Life, transport, safety…</div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
