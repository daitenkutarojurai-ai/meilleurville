import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  topBestInternet,
  topPoorInternet,
  type InternetTier,
} from "@/lib/internet-score";
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
  title: "Fibre & internet coverage in France · 2026 ranking by city",
  description:
    "Where fibre is widely deployed in France and where the connection is still patchy. Top 30 best-connected cities vs top 20 worst — ARCEP Q4 2024 data.",
  alternates: { canonical: `${EN_BASE}/internet-quality` },
  openGraph: {
    title: "Fibre & internet coverage in France · 2026 ranking",
    description:
      "Top 30 cities with fully deployed FTTH vs top 20 where connections stay patchy. Regional estimate from ARCEP Q4 2024.",
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

const EN_TIER_SHORT: Record<InternetTier, string> = {
  "tres-bonne": "Excellent",
  bonne: "Good",
  correcte: "Fair",
  limitee: "Limited",
};

const MIN_POP = 15_000;

export default function EnInternetHubPage() {
  const best = topBestInternet(CITIES_LIGHT, 30, MIN_POP);
  const worst = topPoorInternet(CITIES_LIGHT, 20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Internet coverage", path: "/internet-quality" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Which French cities have the best fibre coverage?",
      a: `Cities of 15,000+ residents with the highest internet score are: ${best
        .slice(0, 5)
        .map((e) => `${e.city.name} (${e.score.toFixed(1)}/10)`)
        .join(
          ", ",
        )}. Score 0-10 derived from ARCEP Q4 2024 regional FTTH coverage, urban density and the city's remote-work score. 10 = fully deployed FTTH.`,
    },
    {
      q: "Where is fibre still missing in France?",
      a: `Cities of 15,000+ residents with the lowest score are: ${worst
        .slice(0, 5)
        .map((e) => `${e.city.name} (${e.score.toFixed(1)}/10)`)
        .join(
          ", ",
        )}. Coverage stays patchy (partial FTTH, FTTLA cable, VDSL2 or even ADSL depending on the exact address) — real-world quality depends on building-level rollouts.`,
    },
    {
      q: "How is this internet score calculated?",
      a: "Score 0-10 (10 = excellent fibre coverage) combining the city's remote-work seed score (60%), a regional bonus aligned on ARCEP Q4 2024 FTTH connectable rates per region, an urban-density bonus for the 30 largest cities, and a penalty when the department appears on ARCEP's list of low-density unprofitable zones.",
    },
    {
      q: "Why a 15,000-resident filter?",
      a: `Below 15,000 residents, the score is less reliable: fibre coverage there depends heavily on the public-initiative network (RIP) currently being rolled out, building by building. The national ranking is restricted to meaningful cities; per-city pages cover all ${CITIES_COUNT} cities in the dataset.`,
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
          Internet coverage in France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Where fibre is widely deployed and where it still lags. Score 0-10
          (10 = fully deployed FTTH) built from regional connectable rates
          (ARCEP Q4 2024), adjusted by urban density and the department status
          (low-density unprofitable zones flagged by ARCEP). Filtered to cities
          of 15,000+ residents for ranking reliability.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Source: ARCEP Q4 2024</Badge>
          <Badge>{CITIES_COUNT} cities referenced</Badge>
          <Badge>Honest proxy · no invented speeds</Badge>
        </div>

        {/* Best connected */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — Best-connected cities
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities of 15,000+ residents with the highest score. Often: large
          metropolitan areas, the dense Paris inner ring, attractive PACA and
          Occitanie agglomerations that saw rapid fibre rollouts since 2020.
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
                        href={`/cities/${e.city.slug}/internet-quality`}
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
                        {e.score.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        /10
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span className={`text-xs font-semibold ${e.info.color}`}>
                        {EN_TIER_SHORT[e.info.tier]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Worst connected */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — Worst-fibred cities
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities of 15,000+ residents with the lowest score: rural department
          capitals (Creuse, Cantal, Lozère, Ariège…), mid-mountain
          sub-prefectures, scattered overseas (DROM) towns. Always test
          availability at the exact address before signing.
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
                        href={`/cities/${e.city.slug}/internet-quality`}
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
                        {e.score.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        /10
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span className={`text-xs font-semibold ${e.info.color}`}>
                        {EN_TIER_SHORT[e.info.tier]}
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
                Remote-work seed score
              </strong>{" "}
              — 60% of the score. A proprietary sub-score calibrated on the
              share of professionals, declared coverage and observed
              remote-work practice at city level.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                ARCEP Q4 2024 regional bonus
              </strong>{" "}
              — FTTH connectable rate per region. Île-de-France, PACA and
              Occitanie pull the top of the ranking; Bourgogne-Franche-Comté,
              Centre-Val de Loire and Corsica still trail.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Urban density bonus
              </strong>{" "}
              — +0.3 on the score for the 30 largest cities, where ISP
              competition and building-by-building rollouts are now
              systematic.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Low-density penalty
              </strong>{" "}
              — −1.0 when the department appears on ARCEP&apos;s list of
              &quot;low-density unprofitable zones&quot; (Creuse, Corrèze,
              Ariège, Cantal, Lozère, Aveyron, Gers, Hautes-Alpes,
              Haute-Loire, Alpes-de-Haute-Provence, Haute-Marne, Meuse,
              Vosges).
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Regional estimate: coverage evolves quarterly and varies building
            by building — always test the exact address eligibility on
            telecom.gouv.fr before signing.
          </p>
        </Card>

        {/* Macro-region breakdown */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          By geographic zone
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Fibre coverage is anything but uniform: the Atlantic and
          Mediterranean façades accelerated from 2021 on, while the Alpine and
          Gascon hinterlands still rely heavily on public-initiative networks
          currently being deployed.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link
              key={m.slug}
              href={`/internet-quality/${m.slug}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {EN_MACRO_LABEL[m.slug] ?? m.label}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">
                  Fibre + slow connections
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
          <Link href="/rankings/teletravail" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">💻</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Remote-work ranking
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Seed remoteWork score
              </div>
            </Card>
          </Link>
          <Link href="/rental-tension" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🔑</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Rental market pressure
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Hard-to-find vs accessible
              </div>
            </Card>
          </Link>
          <Link
            href="https://www.telecom.gouv.fr/accueil-telecom/deploiement-des-reseaux/la-couverture-du-territoire/la-couverture-fixe-et-mobile-en-france"
            target="_blank"
            rel="noopener"
            className="block"
          >
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🔌</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Test my address
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Official ARCEP / telecom.gouv.fr tool
              </div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
