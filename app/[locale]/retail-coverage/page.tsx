import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  topBestCommerce,
  topWorstCommerce,
  type CommerceLevel,
} from "@/lib/commerce";
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
  title: "Retail coverage in France · 2026 city ranking",
  description:
    "Where French cities have the densest retail offer and where downtown is thinning. Top 30 best-covered cities vs top 20 in retail stress (INSEE BPE, Procos).",
  alternates: { canonical: `${EN_BASE}/retail-coverage` },
  openGraph: {
    title: "Retail coverage in France · 2026 ranking",
    description:
      "Top 30 cities with the densest retail offer vs top 20 where downtown vitality is weakest. Coverage, proximity, big-box, downtown.",
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

const EN_LEVEL_LABEL: Record<CommerceLevel, string> = {
  exceptionnel: "Exceptional",
  solide: "Solid",
  correct: "Adequate",
  limite: "Limited",
};

const EN_LEVEL_COLOR: Record<CommerceLevel, string> = {
  exceptionnel: "text-emerald-600",
  solide: "text-lime-600",
  correct: "text-amber-600",
  limite: "text-orange-600",
};

const MIN_POP = 15_000;

export default function EnRetailHubPage() {
  const best = topBestCommerce(CITIES_LIGHT, 30, MIN_POP);
  const worst = topWorstCommerce(CITIES_LIGHT, 20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Retail coverage", path: "/retail-coverage" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Which French cities have the best retail coverage?",
      a: `Cities of 15,000+ residents with the highest retail-coverage score are: ${best
        .slice(0, 5)
        .map((e) => `${e.city.name} (${e.commerce.composite.toFixed(1)}/10)`)
        .join(
          ", ",
        )}. Score 0-10 derived from four dimensions (coverage & diversity, markets & proximity, big-box, downtown vitality). 10 = excellent coverage.`,
    },
    {
      q: "Where is retail coverage weakest in France?",
      a: `Cities of 15,000+ residents with the lowest score are: ${worst
        .slice(0, 5)
        .map((e) => `${e.city.name} (${e.commerce.composite.toFixed(1)}/10)`)
        .join(
          ", ",
        )}. Typically: mid-sized cities (20,000-60,000 residents) without a heritage or tourism draw — the target profile of the "Action Cœur de Ville" programme (ANCT) against downtown devitalisation.`,
    },
    {
      q: "How is this retail-coverage score calculated?",
      a: "Score 0-10 (10 = excellent coverage) combining four dimensions: overall coverage (35%, density/diversity correlated with population), markets & proximity (25%, independent-shop fabric and gastronomy), big-box retail (15%, peripheral hubs), downtown vitality (25%, a proxy for retail vacancy). Derived from the city profile, not a field count.",
    },
    {
      q: "Why a 15,000-resident filter?",
      a: `Below 15,000 residents, retail supply is structurally limited and depends heavily on the nearest hub — comparing communes of very different sizes loses meaning. The national ranking is restricted to meaningful cities; per-city pages cover all ${CITIES_COUNT} cities in the dataset.`,
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
          Retail coverage in France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Where the retail offer is dense and diversified, and where downtown
          devitalisation is gaining ground. Score 0-10 (10 = excellent coverage)
          built from four dimensions: density &amp; diversity, markets &amp;
          proximity, peripheral big-box, downtown vitality. Filtered to cities
          of 15,000+ residents for ranking reliability.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Sources: INSEE BPE, Procos, Action Cœur de Ville</Badge>
          <Badge>{CITIES_COUNT} cities referenced</Badge>
          <Badge>Honest proxy · no field count</Badge>
        </div>

        {/* Best coverage */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — cities with the densest retail offer
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities of 15,000+ residents with the highest score. Typically: large
          regional metropolises, dynamic prefectures, heritage-heavy tourist
          centres, mid-sized towns with a strong gastronomic or market
          identity.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Region</th>
                  <th className="px-3 py-2 text-right">Score</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">
                    Level
                  </th>
                </tr>
              </thead>
              <tbody>
                {best.map((e, i) => (
                  <tr
                    key={e.city.slug}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${e.city.slug}/retail`}
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
                        {e.commerce.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        /10
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span
                        className={`text-xs font-semibold ${EN_LEVEL_COLOR[e.commerce.level]}`}
                      >
                        {EN_LEVEL_LABEL[e.commerce.level]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Worst coverage */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — cities where retail is most limited
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities of 15,000+ residents with the lowest score. Dominant profile:
          mid-sized cities (20,000-60,000 residents) without a heritage or
          tourism draw, suburbs without a proper high street, industrial basins
          under reconversion, overseas (DROM) communes. Frequent target of the
          "Action Cœur de Ville" programme (ANCT) against downtown retail
          vacancy.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Region</th>
                  <th className="px-3 py-2 text-right">Score</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">
                    Level
                  </th>
                </tr>
              </thead>
              <tbody>
                {worst.map((e, i) => (
                  <tr
                    key={e.city.slug}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${e.city.slug}/retail`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {e.city.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">
                      {e.city.region}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-orange-600">
                        {e.commerce.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        /10
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span
                        className={`text-xs font-semibold ${EN_LEVEL_COLOR[e.commerce.level]}`}
                      >
                        {EN_LEVEL_LABEL[e.commerce.level]}
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
                Coverage &amp; diversity (35%)
              </strong>{" "}
              — density of the retail offer, primarily correlated with catchment
              size (population), adjusted for the city&apos;s character
              (metropolis, prefecture, overall dynamism).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Markets &amp; proximity (25%)
              </strong>{" "}
              — independent-shop fabric and food retailers, regular markets,
              gastronomy. A heritage or tourist centre lifts this dimension
              noticeably.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Big-box retail (15%)
              </strong>{" "}
              — presence of large-format hubs and peripheral retail parks
              (hypermarkets, DIY, furniture).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Downtown vitality (25%)
              </strong>{" "}
              — a proxy for retail vacancy. Mid-sized cities (20,000-60,000
              residents) without a heritage or tourism draw are the most
              exposed to devitalisation (the target of the "Action Cœur de
              Ville" programme).
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Score derived from the city profile (population, character, quality
            of life and cultural offer), not a field count. For the exact number
            of shops per commune, see{" "}
            <a
              href="https://www.insee.fr/fr/metadonnees/source/serie/s1161"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              INSEE&apos;s Base permanente des équipements (BPE)
            </a>{" "}
            ; for downtown vacancy, Procos publications.
          </p>
        </Card>

        {/* Macro-region breakdown */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          By geographic zone
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Retail coverage is anything but uniform: regional metropolises pull
          their macro-region up, while rural sub-prefectures and industrial
          basins under reconversion concentrate the stress. Worth breaking down
          territory by territory.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link
              key={m.slug}
              href={`/retail-coverage/${m.slug}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {EN_MACRO_LABEL[m.slug] ?? m.label}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">
                  Density + downtown
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
          <Link href="/public-services" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🏛️</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Public services
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Post office, town hall, schools, library
              </div>
            </Card>
          </Link>
          <Link href="/quality-of-life" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🌿</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Quality of life
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Environment, healthcare, employment mega-hub
              </div>
            </Card>
          </Link>
          <Link
            href="https://agence-cohesion-territoires.gouv.fr/action-coeur-de-ville-42"
            target="_blank"
            rel="noopener"
            className="block"
          >
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🏬</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Action Cœur de Ville
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                ANCT programme · mid-sized cities
              </div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
