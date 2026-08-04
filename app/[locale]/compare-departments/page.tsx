import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { CITIES_SEED } from "@/data/cities-seed";
import { deptToSlug } from "@/lib/dept-slug";
import { ORIGIN_BY_LOCALE, hreflangLanguagesEn } from "@/lib/i18n";
import { jsonLdScript } from "@/lib/jsonld";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Compare French departments — every neighbouring duel",
  description:
    "390 department duels: average scores on 8 criteria, the best cities on each side, a verdict backed by figures. Rhône or Isère? Nord or Pas-de-Calais?",
  alternates: {
    canonical: `${EN_BASE}/compare-departments`,
    languages: hreflangLanguagesEn("/compare-departments"),
  },
  openGraph: {
    // A page-level openGraph replaces the inherited one wholesale: without
    // `images` the social card disappears instead of falling back to the root.
    images: ["/opengraph-image"],
    title: "Compare French departments side by side",
    description: "Average scores, best cities and a verdict for every pair of neighbouring departments.",
  },
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Best Cities in France", item: EN_BASE },
    { "@type": "ListItem", position: 2, name: "Compare departments", item: `${EN_BASE}/compare-departments` },
  ],
};

// Same grouping as the FR hub: pairs are built inside a region, so the two
// sides are genuine alternatives for the same move.
function pairsByRegion(): Array<[string, Array<[string, string]>]> {
  const byRegion: Record<string, string[]> = {};
  for (const c of CITIES_SEED) {
    (byRegion[c.region] ??= []).includes(c.department) || byRegion[c.region].push(c.department);
  }
  return Object.entries(byRegion)
    .map(([region, depts]): [string, Array<[string, string]>] => {
      const sorted = [...depts].sort((a, b) => a.localeCompare(b, "fr"));
      const pairs: Array<[string, string]> = [];
      for (let i = 0; i < sorted.length; i++)
        for (let j = i + 1; j < sorted.length; j++) pairs.push([sorted[i], sorted[j]]);
      return [region, pairs];
    })
    .filter(([, pairs]) => pairs.length > 0)
    .sort((a, b) => a[0].localeCompare(b[0], "fr"));
}

export default function EnCompareDepartmentsIndex() {
  const groups = pairsByRegion();
  const total = groups.reduce((s, [, p]) => s + p.length, 0);

  return (
    <main id="main-content" className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumb) }} />
      <Navbar />

      <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-3">
          Comparator
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mb-4">
          Compare two French departments
        </h1>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
          {total} duels between departments of the same region: average scores on 8
          criteria, the best cities on each side, and a verdict backed by figures.
          A <em>département</em> is the administrative tier between the region and the
          town — it runs secondary schools, social services and part of the road
          network, and it is the number you see on French number plates. Two departments
          in the same region can still differ sharply on rent, safety and commuting.
        </p>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-10">
          To compare two specific cities, use the{" "}
          <Link href="/compare" className="text-[var(--accent)] underline underline-offset-2">
            city comparator
          </Link>
          ; for whole regions, the{" "}
          <Link href="/compare-regions" className="text-[var(--accent)] underline underline-offset-2">
            region comparator
          </Link>
          .
        </p>

        <div className="space-y-6">
          {groups.map(([region, pairs]) => (
            <Card key={region} className="p-5">
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">{region}</h2>
              <div className="flex flex-wrap gap-2">
                {pairs.map(([a, b]) => (
                  <Link
                    key={`${a}-${b}`}
                    href={`/compare-departments/${deptToSlug(a)}-vs-${deptToSlug(b)}`}
                    className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)] transition-colors"
                  >
                    {a} vs {b}
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
