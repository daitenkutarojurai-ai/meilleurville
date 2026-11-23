import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DepartmentDuelView, type DuelSide } from "@/components/DepartmentDuelView";
import { CITIES_SEED } from "@/data/cities-seed";
import { deptToSlug, slugToDept, getAllDepartments } from "@/lib/dept-slug";
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

  const side = (dept: string, s: typeof A): DuelSide => ({
    dept,
    title: `Best cities — ${dept}`,
    top: s.cities.slice(0, 5).map((c) => ({
      slug: c.slug,
      name: c.name,
      score: c.scores.global,
      href: `/cities/${c.slug}`,
    })),
    allHref: `/departments/${deptToSlug(dept)}`,
    allLabel: `All cities in ${dept} →`,
  });

  return (
    <main id="main-content" className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
      <Navbar />

      <DepartmentDuelView
        a={a}
        b={b}
        rows={AXES.map(([k, label]) => ({ key: k, label, va: A.avg(k), vb: B.avg(k) }))}
        sides={[side(a, A), side(b, B)]}
        eyebrow="Department comparison"
        titleLead={`${a} or ${b}:`}
        titleAccent="where should you settle?"
        criterionLabel="Criterion"
        intro={
          <p>
            Two departments of the same French region, compared on the average scores of
            their cities ({A.cities.length} ranked cit{A.cities.length > 1 ? "ies" : "y"} in{" "}
            {a}, {B.cities.length} in {b}). Across the 8 criteria,{" "}
            <strong>{a}</strong> wins {wins.a} and <strong>{b}</strong> wins {wins.b}
            {wins.a === wins.b ? " — a tie, so the detail decides" : ""}. On the overall
            score, the edge goes to <strong>{leader}</strong>.
          </p>
        }
        tableNote={
          <>
            Every score runs 0 to 10, higher is better — including cost of living, where
            10 means the most affordable.
          </>
        }
        furtherTitle="Go further"
        furtherBody={
          <>
            Compare two specific cities with the <Link href="/compare">city comparator</Link>,
            browse the <Link href="/map">map by department</Link> or let{" "}
            <Link href="/city-match">City Match</Link> decide from your own priorities.
          </>
        }
      />

      <Footer />
    </main>
  );
}
