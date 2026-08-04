import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { CITIES_SEED } from "@/data/cities-seed";
import { deptToSlug, slugToDept, getAllDepartments } from "@/lib/dept-slug";
import { scoreHex } from "@/lib/utils";
import { ORIGIN_BY_LOCALE, hreflangLanguagesEn } from "@/lib/i18n";
import { jsonLdScript } from "@/lib/jsonld";

const EN_BASE = ORIGIN_BY_LOCALE.en;

// Pure SSG — built once at deploy, served from the static edge cache.
export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; pair: string }> };

// Pairs = every 2-combination of departments within the same region (natural
// rivalries: Rhône vs Isère, Nord vs Pas-de-Calais…). Cross-region pairs are
// deliberately excluded to keep the build small and the comparisons meaningful.
// Mirrors app/comparer-departements/[pair]/page.tsx exactly, so the two locales
// generate the same set of pages.
function allPairs(): Array<[string, string]> {
  const byRegion: Record<string, string[]> = {};
  for (const c of CITIES_SEED) {
    (byRegion[c.region] ??= []).includes(c.department) || byRegion[c.region].push(c.department);
  }
  const pairs: Array<[string, string]> = [];
  for (const depts of Object.values(byRegion)) {
    const sorted = [...depts].sort((a, b) => a.localeCompare(b, "fr"));
    for (let i = 0; i < sorted.length; i++)
      for (let j = i + 1; j < sorted.length; j++) pairs.push([sorted[i], sorted[j]]);
  }
  return pairs;
}

export function generateStaticParams() {
  return allPairs().map(([a, b]) => ({
    locale: "en",
    pair: `${deptToSlug(a)}-vs-${deptToSlug(b)}`,
  }));
}

function parsePair(pair: string): { a: string; b: string } | null {
  for (const dept of getAllDepartments()) {
    const slug = deptToSlug(dept);
    if (pair.startsWith(`${slug}-vs-`)) {
      const b = slugToDept(pair.slice(slug.length + 4));
      if (b && b !== dept) return { a: dept, b };
    }
  }
  return null;
}

// Same axes, same order and same source values as the FR twin — the two pages
// are hreflang alternates, so a differing figure would be a bug.
const AXES = [
  ["global", "Overall score"],
  ["life", "Daily life"],
  ["safety", "Safety"],
  ["cost", "Cost of living"],
  ["transport", "Transport"],
  ["nature", "Nature"],
  ["culture", "Culture"],
  ["schools", "Schools"],
  ["remoteWork", "Remote work"],
] as const;

function deptStats(dept: string) {
  const cities = CITIES_SEED.filter((c) => c.department === dept).sort(
    (a, b) => b.scores.global - a.scores.global
  );
  const avg = (k: (typeof AXES)[number][0]) =>
    cities.reduce((s, c) => s + c.scores[k], 0) / cities.length;
  return { cities, avg };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) return {};
  const { a, b } = parsed;
  return {
    title: `${a} or ${b}: where to live? 2026 comparison`,
    description: `${a} vs ${b} — scores compared on 8 criteria (safety, cost, schools, transport) and the best cities in each French department.`,
    alternates: {
      canonical: `${EN_BASE}/compare-departments/${pair}`,
      languages: hreflangLanguagesEn(`/compare-departments/${pair}`),
    },
    openGraph: {
      // Without `images`, a page-level openGraph replaces the inherited one and
      // the social card vanishes rather than falling back to the root image.
      images: ["/opengraph-image"],
      title: `${a} vs ${b} — which department wins?`,
      description: "Average scores on 8 criteria, top cities on each side, and a verdict.",
    },
  };
}

export default async function EnCompareDepartmentsPair({ params }: Props) {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) notFound();
  const { a, b } = parsed;
  const A = deptStats(a);
  const B = deptStats(b);

  const wins = AXES.filter(([k]) => k !== "global").reduce(
    (acc, [k]) => {
      if (A.avg(k) > B.avg(k) + 0.05) acc.a++;
      else if (B.avg(k) > A.avg(k) + 0.05) acc.b++;
      return acc;
    },
    { a: 0, b: 0 }
  );
  const leader = A.avg("global") >= B.avg("global") ? a : b;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Best Cities in France", item: EN_BASE },
          { "@type": "ListItem", position: 2, name: "Compare departments", item: `${EN_BASE}/compare-departments` },
          { "@type": "ListItem", position: 3, name: `${a} vs ${b}`, item: `${EN_BASE}/compare-departments/${pair}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `${a} or ${b}: which department scores higher overall?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Averaged over the ranked cities of each department — ${a}: ${A.avg("global").toFixed(1)}/10, ${b}: ${B.avg("global").toFixed(1)}/10. ${leader} comes out ahead.`,
            },
          },
          {
            "@type": "Question",
            name: `${a} or ${b}: which is cheaper to live in?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Average cost-of-living score (10 = most affordable) — ${a}: ${A.avg("cost").toFixed(1)}/10, ${b}: ${B.avg("cost").toFixed(1)}/10.`,
            },
          },
          {
            "@type": "Question",
            name: `What is the best city in ${a}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `${A.cities[0].name}, with an overall score of ${A.cities[0].scores.global.toFixed(1)}/10, out of ${A.cities.length} ranked cit${A.cities.length > 1 ? "ies" : "y"}.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <main id="main-content" className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <Navbar />

      <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-3">
          Department comparison
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mb-4">
          {a} or {b}: where should you settle?
        </h1>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-10">
          Two departments of the same French region, compared on the average scores of
          their cities ({A.cities.length} ranked cit{A.cities.length > 1 ? "ies" : "y"} in{" "}
          {a}, {B.cities.length} in {b}). Across the 8 criteria,{" "}
          <strong>{a}</strong> wins {wins.a} and <strong>{b}</strong> wins {wins.b}
          {wins.a === wins.b ? " — a tie, so the detail decides" : ""}. On the overall
          score, the edge goes to <strong>{leader}</strong>.
        </p>

        <Card className="p-5 mb-10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
                <th className="pb-2 pr-3">Criterion</th>
                <th className="pb-2 pr-3 text-right">{a}</th>
                <th className="pb-2 text-right">{b}</th>
              </tr>
            </thead>
            <tbody>
              {AXES.map(([k, label]) => {
                const va = A.avg(k);
                const vb = B.avg(k);
                return (
                  <tr key={k} className="border-t border-[var(--border)]">
                    <td className="py-2 pr-3 font-medium text-[var(--text-secondary)]">{label}</td>
                    <td className="py-2 pr-3 text-right font-bold" style={{ color: scoreHex(va) }}>
                      {va.toFixed(1)}
                      {va > vb + 0.05 ? " ✓" : ""}
                    </td>
                    <td className="py-2 text-right font-bold" style={{ color: scoreHex(vb) }}>
                      {vb.toFixed(1)}
                      {vb > va + 0.05 ? " ✓" : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">
            Every score runs 0 to 10, higher is better — including cost of living, where
            10 means the most affordable.
          </p>
        </Card>

        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          {[
            { dept: a, s: A },
            { dept: b, s: B },
          ].map(({ dept, s }) => (
            <Card key={dept} className="p-5">
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
                Best cities — {dept}
              </h2>
              <ol className="space-y-2">
                {s.cities.slice(0, 5).map((c, i) => (
                  <li key={c.slug} className="flex items-center justify-between text-sm">
                    <span>
                      <span className="font-bold text-[var(--text-tertiary)] mr-2">{i + 1}.</span>
                      <Link href={`/cities/${c.slug}`} className="text-[var(--accent)] hover:underline font-semibold">
                        {c.name}
                      </Link>
                    </span>
                    <span className="font-bold" style={{ color: scoreHex(c.scores.global) }}>
                      {c.scores.global.toFixed(1)}
                    </span>
                  </li>
                ))}
              </ol>
              <Link
                href={`/departments/${deptToSlug(dept)}`}
                className="inline-block mt-4 text-sm text-[var(--accent)] font-semibold hover:underline"
              >
                All cities in {dept} →
              </Link>
            </Card>
          ))}
        </div>

        <Card className="p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Go further</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Compare two specific cities with the{" "}
            <Link href="/compare" className="text-[var(--accent)] underline underline-offset-2">
              city comparator
            </Link>
            , browse the{" "}
            <Link href="/map" className="text-[var(--accent)] underline underline-offset-2">
              map by department
            </Link>{" "}
            or let{" "}
            <Link href="/city-match" className="text-[var(--accent)] underline underline-offset-2">
              City Match
            </Link>{" "}
            decide from your own priorities.
          </p>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
