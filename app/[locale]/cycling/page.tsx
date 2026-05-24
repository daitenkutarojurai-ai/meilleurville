import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  topCyclable,
  topNonCyclable,
  CYCLING_LEVEL_COLOR,
} from "@/lib/cycling-mobility";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { MACRO_REGIONS } from "@/lib/macro-regions";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Most cycle-friendly cities in France · 2026 ranking",
  description:
    "National ranking of French cities by everyday cyclability: cycle network, topography, safety, climate. Top 30 most cycle-friendly cities vs top 20 most challenging. Sources: FUB · Vélo & Territoires · Géovélo.",
  alternates: { canonical: `${EN_BASE}/cycling` },
};

const EN_MACRO_LABEL: Record<string, string> = {
  "cote-atlantique": "Atlantic Coast",
  "arc-mediterraneen": "Mediterranean Arc",
  "arc-alpin": "Alpine Arc",
  "sud-ouest-gascon": "South-West Gascony",
  "vallee-du-rhone": "Rhône Valley",
  "ile-de-france-elargie": "Greater Île-de-France",
};

const EN_CYCLING_LABEL: Record<string, string> = {
  excellent: "Excellent",
  bon: "Good",
  moyen: "Moderate",
  difficile: "Challenging",
};

const MIN_POP = 15_000;

export default function EnCyclingPage() {
  const best = topCyclable(30, MIN_POP);
  const worst = topNonCyclable(20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cycling", path: "/cycling" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Which French cities are the most cycle-friendly in 2026?",
      a: `According to our composite F57 (network, topography, safety, climate), the most cycle-friendly cities (population ≥ 15,000) are: ${best
        .slice(0, 5)
        .map((c) => `${c.name} (${c.cycling.composite.toFixed(1)}/10)`)
        .join(", ")}. All combine a dense cycle network, flat topography, and a strong cycling policy.`,
    },
    {
      q: "Which cities are the hardest to cycle in?",
      a: `Cities of 15,000+ residents with the lowest composite are: ${worst
        .slice(0, 5)
        .map((c) => `${c.name} (${c.cycling.composite.toFixed(1)}/10)`)
        .join(", ")}. They typically combine steep terrain, minimal cycling infrastructure, and heavy traffic.`,
    },
    {
      q: "How is this ranking calculated?",
      a: "Composite aggregating 4 dimensions: cycle network (35%, FUB Barometer + Vélo & Territoires + EuroVelo presence), topography (25%, altitude + hilly/flat department), safety (25%, urban density × segregated infrastructure), climate (15%, sunshine + wind + winter). Score 0-10, 10 = excellent. Sources: FUB, Vélo & Territoires, Géovélo, INSEE.",
    },
    {
      q: "Where can I find the official FUB cycling barometer?",
      a: "The FUB Cities Cycling Barometer (parlons-velo.fr) publishes the official citizen-survey ranking every 2 years. Vélo & Territoires (velo-territoires.org) maps Local Cycling Masterplan deployment by EPCI. Géovélo (geovelo.fr) provides safe routing via its mobile app.",
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
          Most cycle-friendly cities in France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Composite index covering four key dimensions of everyday cyclability: infrastructure
          network, topography, safety, and climate. Score 0-10, 10 = excellent. Filtered to
          cities ≥ 15,000 residents for meaningful indicators.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Educational overview</Badge>
          <Badge>4 dimensions · {CITIES_COUNT} cities</Badge>
          <Badge>Network 35% · topography 25% · safety 25% · climate 15%</Badge>
        </div>

        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — Most cycle-friendly cities
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities regularly recognised in FUB / Vélo & Territoires rankings, crossed by a
          major EuroVelo route, or benefiting from a naturally flat landscape.
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Network</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Terrain</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Safety</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Climate</th>
                </tr>
              </thead>
              <tbody>
                {best.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/cycling`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${CYCLING_LEVEL_COLOR[c.cycling.level]}`}>
                        {c.cycling.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {EN_CYCLING_LABEL[c.cycling.level] ?? c.cycling.level}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.cycling.network.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.cycling.topography.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.cycling.safety.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.cycling.climate.score.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Score reading: 10 = ideal for everyday cycling. Score &gt; 7 = deeply cycle-friendly city.
        </p>

        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — Most challenging cities for cycling
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities of 15,000+ residents combining steep terrain, minimal cycling infrastructure, and
          heavy traffic. Cycling is possible with an e-bike but impractical for daily commuting
          without assistance.
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Network</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Terrain</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Safety</th>
                </tr>
              </thead>
              <tbody>
                {worst.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/cycling`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
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

        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">Methodology</h2>
        <Card className="mt-3">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Cycle network (35%)</strong> —
              cities regularly ranked by the FUB Barometer / Vélo & Territoires (Strasbourg,
              Grenoble, Rennes, Nantes, Bordeaux, La Rochelle, Chambéry, Annecy, Caen,
              Lorient…) + metropolitan status + presence on a major EuroVelo route (EV1
              Vélodyssée, EV3 Scandibérique, EV6 Loire, EV8 Mediterranean, EV17 ViaRhôna).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Topography (25%)</strong> —
              penalty for hilly departments (Massif Central, Alps, Pyrenees, Vosges, Jura,
              Corsica) and altitude &gt; 500 m. Bonus for plains (Beauce, Aquitaine, Loire,
              Picardie-Flandre). Above a 4% average gradient, muscle-powered cycling becomes
              impractical for daily use.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Safety (25%)</strong> —
              combines urban density (traffic proxy) and level of segregated cycling
              infrastructure. Cycle-friendly cities compensate for density with separated
              lanes and widespread 30 km/h zones; non-cycle-friendly large cities combine
              heavy traffic and infrastructure gaps.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Climate (15%)</strong> —
              annual sunshine, winter temperature, and prevailing wind. Bonus for sunny
              South (outside the windy Rhône corridor). Penalty for the Atlantic coast
              (dominant strong winds) and cold winters (ice risk).
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            City-level score. Experience varies greatly by neighbourhood (city centre vs.
            peri-urban fringes without infrastructure). For real-time routing, Géovélo and
            OpenStreetMap provide the most up-to-date cycling maps.
          </p>
        </Card>

        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">By geographic zone</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          This ranking broken down by macro-region — each view shows only cities in that geographic zone.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link key={m.slug} href={`/cycling/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{EN_MACRO_LABEL[m.slug] ?? m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Cycling index</div>
              </Card>
            </Link>
          ))}
        </div>

        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">See also</h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/environment" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🌬️</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Environmental quality</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Air, noise, water, risks</div>
            </Card>
          </Link>
          <Link href="/rankings" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">All rankings</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Life, transport, safety…</div>
            </Card>
          </Link>
          <Link href="/red-flags" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🚩</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Red flags</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Pitfalls to avoid</div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
