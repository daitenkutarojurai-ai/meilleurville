import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  topMostAtRisk,
  topLeastAtRisk,
  type RiskLevel,
} from "@/lib/natural-risks";
import { CITIES_LIGHT } from "@/lib/cities-light";
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
  title: "Natural risks in France · 2026 city ranking",
  description:
    "Where flooding, seismic activity, clay-shrinkage and wildfires stack up in France. Top 30 most-exposed cities vs top 20 safest — BCSF · BRGM · ONF sources.",
  alternates: { canonical: `${EN_BASE}/natural-risks` },
  openGraph: {
    title: "Natural risks in France · 2026 city ranking",
    description:
      "Top 30 most-exposed cities vs top 20 safest across flood, seismic, clay shrinkage and wildfire hazards.",
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

const EN_LEVEL_LABEL: Record<RiskLevel, string> = {
  faible: "Low",
  modere: "Moderate",
  eleve: "Elevated",
  fort: "High",
};

const EN_LEVEL_COLOR: Record<RiskLevel, string> = {
  faible: "text-emerald-600",
  modere: "text-amber-600",
  eleve: "text-orange-600",
  fort: "text-red-600",
};

const EN_HAZARD_LABEL = {
  flood: "Flood",
  seismic: "Seismic",
  clay: "Clay shrinkage",
  wildfire: "Wildfire",
} as const;

const MIN_POP = 15_000;

export default function EnNaturalRisksHubPage() {
  const most = topMostAtRisk(CITIES_LIGHT, 30, MIN_POP);
  const least = topLeastAtRisk(CITIES_LIGHT, 20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Natural risks", path: "/natural-risks" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Which French cities are the most exposed to natural risks?",
      a: `Cities of 15,000+ residents with the highest composite risk score are: ${most
        .slice(0, 5)
        .map((e) => `${e.city.name} (${e.composite.toFixed(1)}/10)`)
        .join(
          ", ",
        )}. Score 0-10 (10 = maximum exposure) derived from 4 hazards: flooding (35%), clay shrinkage (25%), wildfire (20%), seismic activity (20%).`,
    },
    {
      q: "Which French cities have the lowest natural-risk exposure?",
      a: `Cities of 15,000+ residents with the calmest profile are: ${least
        .slice(0, 5)
        .map((e) => `${e.city.name} (${e.composite.toFixed(1)}/10)`)
        .join(
          ", ",
        )}. These cities have no major river, no low-lying coastline, no flammable forest nearby, and sit in seismic zone 1.`,
    },
    {
      q: "How is this composite risk score calculated?",
      a: "Composite 0-10 (10 = maximum exposure) weighted across 4 hazards: flood risk (35%, derived from major-river tag + elevation + coastline), clay-shrinkage subsidence (25%, BRGM departmental hazard level), wildfire (20%, ONF/ECASC classification) and seismic activity (20%, 2011 regulatory zoning). Flood is weighted highest because it is the hazard most often materialising as an insurance claim.",
    },
    {
      q: "Why filter at 15,000 residents?",
      a: `Below 15,000 residents, exposure varies strongly at the micro-local scale (low bank vs hilltop, hamlet vs town centre). The national ranking is restricted to meaningful cities; per-city pages still cover the ${CITIES_COUNT} cities in the dataset. For an address-level check, the official Géorisques portal remains the reference.`,
    },
    {
      q: "Do these scores replace an official PPRI?",
      a: "No. They are educational summaries at the municipal scale, useful to compare several cities before a project. For an official flood-risk prevention plan (PPRI), a technological-risk plan (PPRT) or the statutory état des risques (ERP, mandatory at sale), consult Géorisques with the exact address.",
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
            Home
          </Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Natural risks in France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Where flooding, seismic activity, clay-shrinkage subsidence and
          wildfire pile up — and where you sleep quietly. Score 0-10 (10 =
          maximum exposure), built from the 2011 regulatory seismic zoning
          (BCSF), the BRGM clay-shrinkage hazard, the ONF / ECASC wildfire
          classification and a flood proxy derived from major river and
          elevation. 15,000-resident minimum for ranking reliability.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Sources: BCSF · BRGM · ONF</Badge>
          <Badge>{CITIES_COUNT} cities referenced</Badge>
          <Badge>Educational summary · not a PPRI</Badge>
        </div>

        {/* Most exposed */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — Most-exposed cities
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities of 15,000+ residents with the highest composite score. No
          surprise: low-elevation river towns (Garonne, Rhône, Adour, Var),
          low-lying Mediterranean and Atlantic coastal municipalities,
          agglomerations in seismic zone 3 or 4 (Alpine arc, Pyrenean arc,
          French West Indies), and those stacking strong clay + flammable
          forest nearby.
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">
                    Level
                  </th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">
                    Top hazard
                  </th>
                </tr>
              </thead>
              <tbody>
                {most.map((e, i) => {
                  const top = [
                    { k: EN_HAZARD_LABEL.flood, v: e.flood },
                    { k: EN_HAZARD_LABEL.seismic, v: e.seismic },
                    { k: EN_HAZARD_LABEL.clay, v: e.clay },
                    { k: EN_HAZARD_LABEL.wildfire, v: e.wildfire },
                  ].sort((a, b) => b.v - a.v)[0];
                  return (
                    <tr
                      key={e.city.slug}
                      className="border-t border-[var(--border)]"
                    >
                      <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">
                        {i + 1}
                      </td>
                      <td className="px-3 py-2">
                        <Link
                          href={`/cities/${e.city.slug}/natural-risks`}
                          className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                        >
                          {e.city.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-[var(--text-tertiary)]">
                        {e.city.region}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="font-bold tabular-nums text-red-600">
                          {e.composite.toFixed(1)}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                          /10
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right hidden sm:table-cell">
                        <span
                          className={`text-xs font-semibold ${EN_LEVEL_COLOR[e.level]}`}
                        >
                          {EN_LEVEL_LABEL[e.level]}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right hidden md:table-cell text-xs text-[var(--text-tertiary)]">
                        {top.k} ({top.v.toFixed(0)})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Least exposed */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — Calmest cities
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities of 15,000+ residents with the lowest risk profile. Often:
          inland plateau or hill towns in seismic zone 1, no major river
          crossing, outside any flammable forest belt. Home insurers rarely
          apply catastrophe-natural surcharges there.
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">
                    Level
                  </th>
                </tr>
              </thead>
              <tbody>
                {least.map((e, i) => (
                  <tr
                    key={e.city.slug}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${e.city.slug}/natural-risks`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {e.city.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">
                      {e.city.region}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-emerald-600">
                        {e.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        /10
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span
                        className={`text-xs font-semibold ${EN_LEVEL_COLOR[e.level]}`}
                      >
                        {EN_LEVEL_LABEL[e.level]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Methodology */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Methodology
        </h2>
        <Card className="mt-3">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">
                Flooding (35%)
              </strong>{" "}
              — proxy combining the presence of a major river crossing the
              municipality (Seine, Rhône, Loire, Garonne, Marne, Saône, Adour,
              Charente, Dordogne, Var, Aude…), the elevation (low &lt; 30 m,
              very low &lt; 10 m) and coastal position. This is the hazard
              most often materialising as a home-insurance claim, hence the
              highest weight.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Clay shrinkage (25%)
              </strong>{" "}
              — BRGM shrink-swell hazard (low / moderate / high) by
              department. The 2003-2023 drought sequence made this risk very
              visible: cracked houses, expensive underpinning. Concentrated in
              the Paris Basin, the South-West and the Aquitaine Basin.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Wildfire (20%)
              </strong>{" "}
              — ONF + ECASC classification of departments with Mediterranean
              massifs (PACA, Corsica, Languedoc), Landes resinous forests and
              Provençal scrubland. Peak season June-September.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Seismic activity (20%)
              </strong>{" "}
              — 2011 regulatory zoning (decree 2010-1255), zones 1 to 5.
              Stable per department. Zone 5 = French West Indies only, zone 4
              = Alpes-Maritimes + southern Pyrenees, zone 3 = Alpine arc +
              Pyrenean arc + Alsace + Var. The Paris Basin and Brittany sit in
              zone 1.
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            These scores summarise hazards at the municipal scale. Within a
            single municipality, exposure can vary strongly (river bank vs
            hilltop, forest edge vs town centre). For an address-level
            diagnostic, the Géorisques portal remains the reference.
          </p>
        </Card>

        {/* Macro-region breakdown */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          By geographic zone
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Natural-risk geography is anything but uniform: the Atlantic coast
          combines coastal submersion with river flooding, the Mediterranean
          arc adds wildfire and clay, the Alpine arc concentrates seismic
          activity, and Gascon South-West stacks strong clay + river
          flooding.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link
              key={m.slug}
              href={`/natural-risks/${m.slug}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {EN_MACRO_LABEL[m.slug] ?? m.label}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">
                  Natural risks
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Cross-links */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          See also
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/environment" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🌳</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Environment ranking
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Air, noise, water, aggregated risks
              </div>
            </Card>
          </Link>
          <Link href="/climate-2040-timelapse" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🌡️</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Climate 2040
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Heatwaves, tropical nights
              </div>
            </Card>
          </Link>
          <Link
            href="https://www.georisques.gouv.fr/mes-risques/connaitre-les-risques-pres-de-chez-moi"
            target="_blank"
            rel="noopener"
            className="block"
          >
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🗺️</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Address-level check
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Official Géorisques tool
              </div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
