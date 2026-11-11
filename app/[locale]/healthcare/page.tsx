import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { HEALTH_LEVEL_LABEL, HEALTH_LEVEL_COLOR, CHU_SITE_COUNT, type HealthLevel } from "@/lib/healthcare-access";
import { topBestAccess, topDeserts } from "@/lib/healthcare-access-rankings";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";
import { pathAlternatesEn } from "@/lib/i18n";
import { MACRO_REGIONS } from "@/lib/macro-regions";

export const revalidate = false;

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const metadata: Metadata = {
  title: "Healthcare access in France · hospitals vs deserts 2026",
  description:
    "French cities ranked by healthcare access: GPs, specialists, A&E, pharmacies. Top 30 best-served cities vs top 20 hardest to get care in.",
  alternates: pathAlternatesEn("/sante", "/healthcare"),
  openGraph: {
    // Sans `images`, un openGraph de page remplace celui hérité de la racine
    // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
    images: ["/opengraph-image"],
    title: "Healthcare access in France · hospitals vs deserts 2026",
    description:
      "Top 30 best-served cities (GPs + specialists + A&E) vs top 20 confirmed medical deserts.",
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

const EN_HEALTH_LABEL: Record<HealthLevel, string> = {
  facile: "Easy",
  correct: "Adequate",
  tendu: "Strained",
  desert: "Medical desert",
};

const MIN_POP = 10_000;

export default function HealthcareHubPage() {
  const best = topBestAccess(30, MIN_POP);
  const deserts = topDeserts(20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Healthcare", path: "/healthcare" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Which French cities have the best healthcare access?",
      a: `Based on our composite index (GPs, specialists, A&E, pharmacies), the cities ≥ 10,000 residents with the best healthcare access are: ${best
        .slice(0, 5)
        .map((c) => `${c.name} (${(10 - c.access.composite).toFixed(1)}/10)`)
        .join(", ")}. Score 10 = excellent access.`,
    },
    {
      q: "Which cities are medical deserts?",
      a: `The cities ≥ 10,000 residents with the lowest healthcare access composite (most difficult) are: ${deserts
        .slice(0, 5)
        .map((c) => `${c.name} (${(10 - c.access.composite).toFixed(1)}/10)`)
        .join(", ")}. They combine low GP access (at or near the official under-served threshold), no emergency department in town and distant specialists. Cities below the under-served threshold are ranked on /red-flags/themes/medical-desert.`,
    },
    {
      q: "How is this ranking calculated?",
      a: "Composite of 4 dimensions: GPs (35%, measured with the DREES localised potential accessibility indicator, 2024), specialists (25%, estimated: measured distance to the nearest university-hospital site, then large agglomeration > medium city > rural), A&E (25%, emergency department recorded in the town by INSEE, otherwise the measured distance to the nearest town that has one, + mountain penalty), pharmacies (15%, pharmacies recorded by INSEE per resident). Score 0-10, 10 = excellent access. Three dimensions are measured for 591 of 593 cities; Mamoudzou and Pierrefitte-sur-Seine, outside the datasets, keep an estimate. No figure says which doctors take new patients, and this is not the ARS zoning in force.",
    },
    {
      q: "What if I cannot find a GP?",
      a: "The ARS (Regional Health Agency) for each department maintains a list of GPs accepting new patients. Ameli (ameli.fr) offers a directory with availability. Doctolib filters by 'new patients accepted'. The CPAM can also assign a GP via the 'médecin traitant' online service.",
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
          Healthcare access in France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Composite index covering four key dimensions of healthcare access: GPs, specialists,
          A&E/emergency services, and pharmacies. Score 0-10, 10 = excellent access. GPs, A&E and
          pharmacies are measured (DREES, INSEE); specialists are estimated. Filtered to cities
          ≥ 10,000 residents.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Measured: DREES APL 2024 · INSEE BPE 2025</Badge>
          <Badge>Specialists: estimate</Badge>
          <Badge>4 dimensions · {CITIES_COUNT} cities</Badge>
          <Badge>GP 35% · specialists 25% · A&E 25% · pharmacies 15%</Badge>
        </div>

        {/* Top 30 best access */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — Best healthcare access
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities close to a university-hospital site, with GP access above the national average and an
          emergency department in town. High composite score = easy access.
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">GPs</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Spec.</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">A&amp;E</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Pharma.</th>
                </tr>
              </thead>
              <tbody>
                {best.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/healthcare`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${HEALTH_LEVEL_COLOR[c.access.level]}`}>
                        {(10 - c.access.composite).toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {EN_HEALTH_LABEL[c.access.level] ?? HEALTH_LEVEL_LABEL[c.access.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                      {(10 - c.access.generalistes.score).toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                      {(10 - c.access.specialistes.score).toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">
                      {(10 - c.access.urgences.score).toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">
                      {(10 - c.access.pharmacies.score).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Sub-score reading: 10 = excellent access, 0 = medical desert.
        </p>

        {/* Top 20 medical deserts */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — Hardest healthcare access
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities ≥ 10,000 combining low GP access, no emergency department in town and distant
          specialists. Low composite score = difficult access. Cities below the official
          under-served threshold are ranked on{" "}
          <Link href="/red-flags/themes/medical-desert" className="text-[var(--accent)] hover:underline">
            the medical-desert page
          </Link>
          .
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">GPs</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Spec.</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">A&amp;E</th>
                </tr>
              </thead>
              <tbody>
                {deserts.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/healthcare`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {(10 - c.access.composite).toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        /10
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                      {(10 - c.access.generalistes.score).toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                      {(10 - c.access.specialistes.score).toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">
                      {(10 - c.access.urgences.score).toFixed(1)}
                    </td>
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
              <strong className="text-[var(--text-primary)]">GPs (35%)</strong> —{" "}
              <strong className="text-[var(--text-primary)]">measured</strong> with the DREES
              localised potential accessibility (APL), 2024: GP consultations within reach per
              resident per year, counting doctors in neighbouring towns. Below 1.5 is very low
              access, below 2.5 an under-served area; the national average is 3.72.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Specialists (25%)</strong> — distance
              to the nearest university-hospital site, across the {CHU_SITE_COUNT} host communes on
              record: full access under 10 km, degraded access out to 30 km, then large agglomeration
              &gt; medium city &gt; rural. The distance is measured between commune centroids; wait
              times are not.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">A&E (25%)</strong> — whether INSEE
              records an emergency department in the town (permanent facilities database, 2025);
              without one, the straight-line distance to the nearest town that has one, with a
              mountain penalty because roads are longer than the straight line. Being near a university hospital can only improve the score, never lower it.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Pharmacies (15%)</strong> — pharmacies
              recorded in the town by INSEE, per resident. French average: about one per 3,300 residents.
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Specialists remain an <strong>estimate</strong> and no appointment delay is
            recorded. Mamoudzou and Pierrefitte-sur-Seine, outside the APL dataset, keep the
            estimate on all four dimensions.
            Precise zoning and GP incentive schemes are published by the ARS, and the situation
            changes quickly with retirements — check GP availability on Ameli before relocating.
          </p>
        </Card>

        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">By geographic zone</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          This ranking broken down by macro-region — each view shows only cities in that geographic zone.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link key={m.slug} href={`/healthcare/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{EN_MACRO_LABEL[m.slug] ?? m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Healthcare access</div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Cross-links */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">See also</h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/cities" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🏙️</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">All cities</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Browse all {CITIES_COUNT} cities by score
              </div>
            </Card>
          </Link>
          <Link href="/red-flags" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🚨</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Red flags</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Cities with critical warning signals
              </div>
            </Card>
          </Link>
          <Link href="/rankings" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">All rankings</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Life, transport, safety...
              </div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
