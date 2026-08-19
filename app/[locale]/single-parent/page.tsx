import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { parentSoloFit, fitLabel, minIncomeForT3 } from "@/lib/parent-solo";
import { scoreColor } from "@/lib/utils";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";
import { ORIGIN_BY_LOCALE, pathAlternatesEn } from "@/lib/i18n";
import { Users, ChevronRight } from "lucide-react";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;

// Ranking with a population floor: the composite spikes on tiny communes
// where cost/safety are structurally favourable but school and transit
// signals go noisy. Same 20 000 threshold as the FR side and F52.
const MIN_POP = 20_000;
const TOP_N = 30;
const BOTTOM_N = 10;

interface Row {
  slug: string;
  name: string;
  region: string;
  department: string;
  fit: number;
  label: string;
  breakdown: { cost: number; transport: number; schools: number; safety: number };
  rentT3: number | null;
  minIncome: number | null;
}

function buildRows(): Row[] {
  const rows: Row[] = [];
  for (const city of CITIES_SEED) {
    if (city.population < MIN_POP) continue;
    const f = parentSoloFit(city);
    const housing = getHousing(city.slug);
    const rentT3 = housing?.avgRentT3 ?? null;
    const minIncome = rentT3 ? minIncomeForT3(rentT3, city.scores.cost) : null;
    rows.push({
      slug: city.slug,
      name: city.name,
      region: city.region,
      department: city.department,
      fit: f.score,
      label: fitLabel(f.score).label,
      breakdown: f.breakdown,
      rentT3,
      minIncome,
    });
  }
  return rows;
}

export function generateStaticParams() {
  return [{ locale: "en" }];
}

export const metadata: Metadata = {
  title: "Single parent in France 2026 — French cities that actually work",
  description:
    "Top 30 French cities where single-parent life holds: cost, transit, schools, safety. Weighted composite of 4 axes, estimated minimum income to rent a T3.",
  alternates: pathAlternatesEn("/parent-solo", "/single-parent"),
  openGraph: {
    // Sans `images`, un openGraph de page remplace celui hérité de la racine
    // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
    images: ["/opengraph-image"],
    title: "Single parent in France · French cities that actually work in 2026",
    description:
      "One income, one driver. Ranking of 4 axes (cost, transit, schools, safety) across 540 French cities. No sugarcoating.",
  },
};

export default function SingleParentHubPage() {
  const rows = buildRows();
  const top = [...rows].sort((a, b) => b.fit - a.fit || a.name.localeCompare(b.name, "en")).slice(0, TOP_N);
  const bottom = [...rows]
    .sort((a, b) => a.fit - b.fit || a.name.localeCompare(b.name, "en"))
    .slice(0, BOTTOM_N);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Single parent", path: "/single-parent" },
  ]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "French cities best suited to single-parent life",
    numberOfItems: top.length,
    itemListElement: top.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: r.name,
      url: `${EN_BASE}/cities/${r.slug}/single-parent`,
      description: `Fit ${r.fit.toFixed(1)}/10 (${r.label.toLowerCase()}) · cost ${r.breakdown.cost.toFixed(1)}, transit ${r.breakdown.transport.toFixed(1)}, schools ${r.breakdown.schools.toFixed(1)}, safety ${r.breakdown.safety.toFixed(1)}`,
    })),
  };

  const faq = faqJsonLd([
    {
      q: "Which French cities are the most viable for single parents?",
      a: `On our single-parent composite (cost 30% + transit 20% + schools 25% + safety 25%, same weights as the City Match profile), the 5 top cities with ≥ ${MIN_POP.toLocaleString("en-GB")} inhabitants are: ${top
        .slice(0, 5)
        .map((c) => `${c.name} (${c.fit.toFixed(1)}/10)`)
        .join(", ")}. These cities combine a cost of living a single income can carry, a transit network that absorbs the unexpected when no one else can step in, a dense school and after-school offering, and a level of safety that keeps school pickups and evening returns calm.`,
    },
    {
      q: "How is the single-parent fit score calculated?",
      a: "Explicit editorial weighting: cost of living 0.30 · transit 0.20 · schools 0.25 · safety 0.25 (total 1.00). The 4 axes come from the seed (data/cities-seed.ts), calibrated against public sources (Insee, SSMSI, rental observatories). The result stays on a 0-10 scale with the same convention as the individual axes (10 = excellent). Formula identical to the 'single-parent' profile in lib/city-match.ts.",
    },
    {
      q: "Why does this ranking differ from the overall ranking?",
      a: "The overall ranking (/overall-ranking) averages the 8 site composites — useful when no profile is specified. The single-parent score re-prioritises the 4 axes that actually matter when you're the only one driving, earning and doing pickups: nature, culture and remote work move to the back seat. A city that ranks high globally can look average here if cost spikes or transit can't absorb the everyday.",
    },
    {
      q: "What minimum budget covers a 3-bedroom rental as a single parent?",
      a: `On the one-third-of-net-income rule (33%, stretched to 35% in the tightest markets where the cost score falls below 5), the thresholds vary a lot from city to city. For the top 5: ${top
        .slice(0, 5)
        .filter((r) => r.minIncome)
        .map((r) => `${r.name} €${r.minIncome}/month net (T3 €${r.rentT3})`)
        .join(", ")}. Below that, activate a housing lever (social, intermediate, flat-share with another single parent) or fall back to a T2 with a shared bedroom.`,
    },
    {
      q: "Are there French benefits specific to single parents?",
      a: "Yes, several. ASF (Allocation de soutien familial) is paid to parents raising a child alone. There is a single-parent RSA top-up, a Complément mode de garde (CMG) significantly boosted for single parents, and APL/ALF for rent. School canteen, after-school care and holiday centres are billed on a sliding scale by 'quotient familial' — request 'priorité famille monoparentale' (single-parent priority) on your file; it is granted on demand, not automatically. The CCAS (Centre communal d'action sociale) is the right first door for municipal and département-level aid.",
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(itemList)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <AmbientBackground />
      <Navbar />

      <section className="relative overflow-hidden py-12 sm:py-16 border-b border-[var(--border)]">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-5">
            <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">Single parent</span>
          </nav>

          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            🧑‍🍼 Single parent
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-4">
            French cities that actually work when you're raising a child alone
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            One income, one driver, one adult morning and evening. What that actually
            changes, city by city — no clichés, no condescending praise. Weighted
            composite of 4 axes (cost 30% · transit 20% · schools 25% · safety 25%),
            the same formula as the City Match profile.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-xs">
            <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-[var(--text-secondary)]">
              {rows.length} cities ranked
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-[var(--text-secondary)]">
              Population ≥ {MIN_POP.toLocaleString("en-GB")} inhabitants
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-[var(--text-secondary)]">
              4 weighted axes
            </span>
          </div>
        </div>
      </section>

      {/* CTAs to City Match and the profile page */}
      <section className="py-8 border-b border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/city-match"
            className="group flex items-center justify-between rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-5 py-4 hover:border-[var(--accent)] hover:shadow-md transition-all"
          >
            <div>
              <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                ✨ Personalise via City Match
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                The "single parent" profile is already weighted here; the quiz layers in your other criteria.
              </div>
            </div>
            <span className="shrink-0 text-[var(--accent)] text-sm font-semibold">→</span>
          </Link>
          <Link
            href="/for-who/single-parents"
            className="group flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
          >
            <div>
              <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                👥 Read the "single parents" profile page
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Editorial angle on the profile (different from the composite score below).
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
          </Link>
        </div>
      </section>

      {/* Top 30 */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-5 w-5 text-[var(--accent)] shrink-0" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Top {TOP_N} — where single-parent life holds without painful trade-offs
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-3xl">
            Cities with ≥ {MIN_POP.toLocaleString("en-GB")} inhabitants at the best composite score.
            The "min income" column applies the one-third-of-net rule to the real T3 rent. Below
            that threshold, you need a housing lever.
          </p>

          <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left hidden lg:table-cell">Department</th>
                  <th className="px-3 py-2 text-right">Fit</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Cost</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Transit</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Schools</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Safety</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">T3</th>
                  <th className="px-3 py-2 text-right">Min. income</th>
                </tr>
              </thead>
              <tbody>
                {top.map((r, i) => (
                  <tr key={r.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${r.slug}/single-parent`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                      >
                        {r.name}
                      </Link>
                      <div className="text-[11px] text-[var(--text-tertiary)] lg:hidden">{r.department}</div>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)] hidden lg:table-cell">
                      {r.department}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${scoreColor(r.fit)}`}>
                        {r.fit.toFixed(1)}
                      </span>
                      <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">
                        {r.label}
                      </div>
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums hidden md:table-cell ${scoreColor(r.breakdown.cost)}`}>
                      {r.breakdown.cost.toFixed(1)}
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums hidden md:table-cell ${scoreColor(r.breakdown.transport)}`}>
                      {r.breakdown.transport.toFixed(1)}
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums hidden md:table-cell ${scoreColor(r.breakdown.schools)}`}>
                      {r.breakdown.schools.toFixed(1)}
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums hidden md:table-cell ${scoreColor(r.breakdown.safety)}`}>
                      {r.breakdown.safety.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                      {r.rentT3 ? `€${r.rentT3}` : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-primary)] font-semibold">
                      {r.minIncome ? `€${r.minIncome}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">
            Reading: composite = cost × 0.30 + transit × 0.20 + schools × 0.25 + safety × 0.25.
            Min income = T3 rent ÷ 33% (35% if cost &lt; 5). T3 rent from{" "}
            <code className="text-[11px]">data/housing.ts</code>. Cities without an individual rent
            show "—" and are linked out to the regional observatories.
          </p>
        </div>
      </section>

      {/* Bottom 10 */}
      <section className="py-10 sm:py-14 border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
            The {BOTTOM_N} cities that penalise the single-parent profile
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-3xl">
            Cities with ≥ {MIN_POP.toLocaleString("en-GB")} inhabitants at the lowest composite —
            typically high cost + weak transit, or below-average safety even when the cost is fine.
            Not a condemnation: a signal that single-parent life here demands more organisation, more
            benefits (CAF, CCAS, social housing) and a careful neighbourhood check before signing.
          </p>

          <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left hidden lg:table-cell">Department</th>
                  <th className="px-3 py-2 text-right">Fit</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Cost</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Transit</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Schools</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Safety</th>
                </tr>
              </thead>
              <tbody>
                {bottom.map((r, i) => (
                  <tr key={r.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${r.slug}/single-parent`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                      >
                        {r.name}
                      </Link>
                      <div className="text-[11px] text-[var(--text-tertiary)] lg:hidden">{r.department}</div>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)] hidden lg:table-cell">
                      {r.department}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${scoreColor(r.fit)}`}>
                        {r.fit.toFixed(1)}
                      </span>
                      <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">
                        {r.label}
                      </div>
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums hidden md:table-cell ${scoreColor(r.breakdown.cost)}`}>
                      {r.breakdown.cost.toFixed(1)}
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums hidden md:table-cell ${scoreColor(r.breakdown.transport)}`}>
                      {r.breakdown.transport.toFixed(1)}
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums hidden md:table-cell ${scoreColor(r.breakdown.schools)}`}>
                      {r.breakdown.schools.toFixed(1)}
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums hidden md:table-cell ${scoreColor(r.breakdown.safety)}`}>
                      {r.breakdown.safety.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-10 sm:py-14 border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Methodology</h2>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-5 max-w-3xl space-y-3 text-sm text-[var(--text-secondary)] leading-relaxed">
            <p>
              <strong className="text-[var(--text-primary)]">Formula.</strong>{" "}
              fit = cost × 0.30 + transit × 0.20 + schools × 0.25 + safety × 0.25.
              Weights sum to 1.00, so the result stays on 0-10 like the individual axes.
              Identical to the{" "}
              <code className="text-xs px-1 rounded bg-[var(--bg-elevated)]">single-parent</code>{" "}
              profile in{" "}
              <code className="text-xs px-1 rounded bg-[var(--bg-elevated)]">lib/city-match.ts</code>.
            </p>
            <p>
              <strong className="text-[var(--text-primary)]">Why these 4 axes.</strong>{" "}
              Cost (30%) because one income covers the whole budget. Transit (20%) because
              you're the only driver — the network has to absorb the unexpected (medical
              appointments, school closures, activities that run late). Schools and after-school
              care (25%) because juggling breaks down without evening care that holds. Safety
              (25%) because a late school pickup or a return home after an activity is not the
              same in every neighbourhood. Nature, culture, remote work are secondary in a
              single-parent setup — they don't enter the composite.
            </p>
            <p>
              <strong className="text-[var(--text-primary)]">20 000-inhabitant floor.</strong>{" "}
              Below that threshold the transit and school axes get noisy, and the composite
              artificially spikes on rural communes that don't offer a comparable network or
              school density. All individual city pages remain accessible via{" "}
              <code className="text-xs px-1 rounded bg-[var(--bg-elevated)]">/cities/&lt;slug&gt;/single-parent</code>{" "}
              regardless of population.
            </p>
            <p>
              <strong className="text-[var(--text-primary)]">Minimum T3 income.</strong>{" "}
              Real T3 rent (data/housing.ts) ÷ 33% of net income, stretched to 35% when the city's
              cost score is below 5 (very tight markets where landlords often accept 40% with a
              Visale guarantee or a family guarantor). Rounded to the nearest €50.
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              Sources: Insee (population, salaries), SSMSI (safety), regional observatories
              (rents), and editorial calibration documented in{" "}
              <code className="text-xs">lib/score-calibration.ts</code>. Deterministic and
              reproducible calculation. No invented figures.
            </p>
          </div>
        </div>
      </section>

      {/* Cross-links */}
      <section className="py-10 border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Go further
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/city-match"
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition-all px-4 py-3"
            >
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                💘 City Match
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                8 questions, 90 sec, top 3 cities that fit
              </div>
            </Link>
            <Link
              href="/for-who/single-parents"
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition-all px-4 py-3"
            >
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                👥 Single-parents profile
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Editorial angle on the "For who" page
              </div>
            </Link>
            <Link
              href="/vacations/profile/monoparental"
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition-all px-4 py-3"
            >
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                🌴 Single-parent holidays
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Destinations that work with one adult
              </div>
            </Link>
            <Link
              href="/overall-ranking"
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition-all px-4 py-3"
            >
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                🏆 Overall ranking
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Mean of the 8 axes — no profile specified
              </div>
            </Link>
            <Link
              href="/map"
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition-all px-4 py-3"
            >
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                🗺️ Interactive map
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Visualise the {CITIES_COUNT} cities on the site
              </div>
            </Link>
            <Link
              href="/compare"
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition-all px-4 py-3"
            >
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                ⚖️ Compare 2 cities
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Head-to-head across 8 axes + lifestyle verdict
              </div>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
