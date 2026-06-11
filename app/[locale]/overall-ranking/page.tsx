import type { Metadata } from "next";
import { CITIES_LIGHT } from "@/lib/cities-light";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  topSynthesisGlobal,
  bottomSynthesisGlobal,
  SYNTHESIS_LEVEL_COLOR,
} from "@/lib/city-synthesis";
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
  title: `Overall ranking 2026 · Best quality of life in France across all dimensions`,
  description: `National ranking of ${CITIES_COUNT} French cities across 8 data dimensions (environment, healthcare, employment, quality of life, cycling, safety, demographics, public services). Top 30 most favourable profiles vs top 20 most strained.`,
  alternates: { canonical: `${EN_BASE}/overall-ranking` },
};

const EN_MACRO_LABEL: Record<string, string> = {
  "cote-atlantique": "Atlantic Coast",
  "arc-mediterraneen": "Mediterranean Arc",
  "arc-alpin": "Alpine Arc",
  "sud-ouest-gascon": "South-West Gascony",
  "vallee-du-rhone": "Rhône Valley",
  "ile-de-france-elargie": "Greater Île-de-France",
};

const EN_SYNTHESIS_LABEL: Record<string, string> = {
  excellent: "Excellent",
  bon: "Good",
  moyen: "Moderate",
  tendu: "Strained",
};

const EN_AXIS_LABEL: Record<string, string> = {
  "Cadre de vie": "Quality of life",
  "Environnement": "Environment",
  "Santé": "Healthcare",
  "Emploi": "Employment",
  "Vélo": "Cycling",
  "Sécurité": "Safety",
  "Démographie": "Demographics",
  "Services publics": "Public services",
};

const MIN_POP = 15_000;

export default function EnOverallRankingPage() {
  const top = topSynthesisGlobal(CITIES_LIGHT, 30, MIN_POP);
  const bottom = bottomSynthesisGlobal(CITIES_LIGHT, 20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Overall ranking", path: "/overall-ranking" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Which French cities have the best overall profile across all dimensions?",
      a: `According to our F61 composite (arithmetic mean of 8 normalised scores, 10 = excellent), the most favourable cities (population ≥ 15,000) are: ${top
        .slice(0, 5)
        .map((c) => `${c.name} (${c.synthesis.global}/10)`)
        .join(", ")}.`,
    },
    {
      q: "Which French cities are most strained across all dimensions?",
      a: `Cities of 15,000+ residents with the lowest composite are: ${bottom
        .slice(0, 5)
        .map((c) => `${c.name} (${c.synthesis.global}/10)`)
        .join(", ")}. They typically accumulate strains across multiple axes — healthcare, employment, public services, and demographics simultaneously.`,
    },
    {
      q: "How is this ranking calculated?",
      a: "Arithmetic mean of 8 data-cluster composites (environment, healthcare, employment, quality of life, cycling, safety, demographics, public services). All axes are normalised to a 10 = excellent convention. Clusters originally scored 10 = worst (healthcare, employment, safety, demographics, public services) are inverted via 10 − composite. Deterministic and reproducible.",
    },
    {
      q: "What does the consistency column mean?",
      a: "The standard deviation between the 8 axes measures whether a city's profile is uniform (≤ 1.2 = consistent) or contrasted (≥ 2 = marked strengths and strains). A city scoring average across the board is very different from one that excels on 4 dimensions but struggles on 4 others — the mean alone doesn't tell the full story.",
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
          Overall ranking — best quality of life across all dimensions
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          A unified ranking aggregating 8 data composites (environment, healthcare,
          employment, quality of life, cycling, safety, demographics, public services)
          into a single score 0-10, where 10 = excellent. Filtered to cities with
          15,000+ residents for meaningful indicators.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>8 unified axes</Badge>
          <Badge>{CITIES_COUNT} cities synthesised</Badge>
          <Badge>Normalised arithmetic mean</Badge>
        </div>

        <Link
          href="/quiz/compatibility"
          className="mt-6 block rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 hover:border-[var(--accent)] hover:shadow-md transition-all p-5 group"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                ✨ Personalise this ranking — weight the 8 axes yourself
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Compatibility quiz · rank cities against your priorities
              </div>
            </div>
            <span className="shrink-0 text-[var(--accent)] text-sm font-semibold">→</span>
          </div>
        </Link>

        {/* Top 30 */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — most favourable overall profiles
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities of 15,000+ residents with the highest synthesis score. The score
          reflects the average across 8 dimensions; the consistency column shows
          whether the profile is uniform or contrasted (standard deviation between axes).
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Region</th>
                  <th className="px-3 py-2 text-right">Global</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Consistency</th>
                  <th className="px-3 py-2 text-left hidden md:table-cell">Strength #1</th>
                  <th className="px-3 py-2 text-left hidden md:table-cell">Tension #1</th>
                </tr>
              </thead>
              <tbody>
                {top.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${SYNTHESIS_LEVEL_COLOR[c.synthesis.level]}`}>
                        {c.synthesis.global.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {EN_SYNTHESIS_LABEL[c.synthesis.level] ?? c.synthesis.level}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                      ±{c.synthesis.spread.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] hidden md:table-cell text-xs">
                      {c.synthesis.strengths[0] && (
                        <>{EN_AXIS_LABEL[c.synthesis.strengths[0].label] ?? c.synthesis.strengths[0].label}{" "}
                        {c.synthesis.strengths[0].score.toFixed(1)}</>
                      )}
                    </td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] hidden md:table-cell text-xs">
                      {c.synthesis.tensions[0] && (
                        <>{EN_AXIS_LABEL[c.synthesis.tensions[0].label] ?? c.synthesis.tensions[0].label}{" "}
                        {c.synthesis.tensions[0].score.toFixed(1)}</>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Score reading: global = arithmetic mean of 8 axes (convention 10 = excellent).
          Consistency = standard deviation between the 8 axes. Score ≥ 7 + consistency ≤ 1.2 = very
          favourable and homogeneous profile.
        </p>

        {/* Bottom 20 */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — most strained overall profiles
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities of 15,000+ residents with the lowest composite. They typically accumulate
          strains across multiple axes — often healthcare + employment + public services +
          demographics simultaneously (the "quadruple burden" of rural decline or
          post-industrial basins in transition).
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Region</th>
                  <th className="px-3 py-2 text-right">Global</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Consistency</th>
                  <th className="px-3 py-2 text-left hidden md:table-cell">Tension #1</th>
                </tr>
              </thead>
              <tbody>
                {bottom.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {c.synthesis.global.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                      ±{c.synthesis.spread.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] hidden md:table-cell text-xs">
                      {c.synthesis.tensions[0] && (
                        <>{EN_AXIS_LABEL[c.synthesis.tensions[0].label] ?? c.synthesis.tensions[0].label}{" "}
                        {c.synthesis.tensions[0].score.toFixed(1)}</>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* By macro-region */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">By geographic zone</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          The overall ranking broken down by macro-region — Atlantic coast, Mediterranean arc, Alpine arc and more.
          Each view restricts to cities in that zone only.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link key={m.slug} href={`/overall-ranking/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{EN_MACRO_LABEL[m.slug] ?? m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Top favourable + strained</div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Methodology */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">Methodology</h2>
        <Card className="mt-3">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
            This ranking aggregates 8 data-cluster composites using a unified convention
            of <strong className="text-[var(--text-primary)]">10 = excellent</strong>.
            Clusters originally scored on a "10 = worst" scale (healthcare, employment,
            safety, demographics, public services) are inverted via{" "}
            <code className="px-1 mx-0.5 rounded bg-[var(--bg-elevated)] text-xs">10 − composite</code>.
            Environment uses <code className="px-1 mx-0.5 rounded bg-[var(--bg-elevated)] text-xs">healthScore</code>{" "}
            directly (already positive-oriented). Cycling and quality of life are natively positive.
          </p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
            <strong className="text-[var(--text-primary)]">Global score:</strong> arithmetic
            mean of the 8 axes (each axis already carries its own internal weighting documented
            on its dedicated sub-page). No additional weighting between clusters — an editorial
            choice of neutrality. To weight by personal preference, use the compatibility quiz.
          </p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)]">Consistency (standard deviation):</strong>{" "}
            measures profile homogeneity. ≤ 1.2 = very consistent profile; ≥ 2 = highly
            contrasted profile (major strengths and marked strains simultaneously). Useful for
            distinguishing "average across the board" from "excellent on 4 dimensions, strained
            on 4 others".
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Deterministic and reproducible calculation. Sources for each cluster are documented
            on its dedicated sub-page. No invented figures.
          </p>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">See also</h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/synthesis" className="block">
            <Card className="hover:shadow-md transition-shadow h-full border-[var(--accent)]/30 bg-[var(--accent)]/5">
              <div className="text-2xl mb-1">🧭</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">8-axis synthesis hub</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Full pyramid: city → region → France</div>
            </Card>
          </Link>
          <Link href="/rankings" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">📊</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">19 thematic rankings</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Life, transport, safety…</div>
            </Card>
          </Link>
          <Link href="/quiz/compatibility" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">✨</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Compatibility quiz</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Match cities to your profile</div>
            </Card>
          </Link>
          <Link href="/red-flags" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🚩</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Red flags</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Pitfalls before you move</div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
