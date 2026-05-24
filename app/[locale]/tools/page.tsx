import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT, GUIDES_COUNT } from "@/lib/site-stats";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Tools · Quiz, calculator, map, rankings | BestCitiesInFrance",
  description: `All BestCitiesInFrance tools to choose, compare, and simulate. Compatibility quiz, cost calculator, interactive map, city comparator, leaderboard.`,
  alternates: { canonical: `${EN_BASE}/tools` },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Tools", path: "/tools" },
]);

type Tool = {
  href: string;
  emoji: string;
  title: string;
  desc: string;
  cta: string;
};

const TOOLS: Tool[] = [
  {
    href: "/quiz/compatibility",
    emoji: "✨",
    title: "Compatibility quiz",
    desc: `Answer 10 questions about your priorities (climate, budget, schools, mobility) — we rank ${CITIES_COUNT} cities against your personal profile.`,
    cta: "Take the quiz",
  },
  {
    href: "/compare",
    emoji: "⚖️",
    title: "City comparator",
    desc: "Compare two cities side by side across 8 criteria (quality of life, transport, cost, safety, climate, schools...). Decision in 30 seconds.",
    cta: "Compare two cities",
  },
  {
    href: "/map",
    emoji: "🗺️",
    title: "Interactive heatmap",
    desc: "All French cities on a colour-coded map, filtered by criterion (nature, transport, cost...). Zoom and click to see the full city profile.",
    cta: "Open the map",
  },
  {
    href: "/leaderboard",
    emoji: "🏆",
    title: `Top ${CITIES_COUNT} cities`,
    desc: `The global ranking of all ${CITIES_COUNT} cities, sortable and filterable by region, size, or thematic score. The quick reference.`,
    cta: "See the ranking",
  },
  {
    href: "/calculator/real-cost",
    emoji: "💸",
    title: "Real monthly cost calculator",
    desc: "What does it actually cost to live in a given city? Rent, heating, mobility, taxes — all in one simulation.",
    cta: "Open the calculator",
  },
  {
    href: "/salary-equivalent",
    emoji: "💼",
    title: "Salary equivalent",
    desc: "How much do you need to earn in another city to keep the same standard of living? Converts based on rent, heating, mobility, and taxes.",
    cta: "Calculate equivalent",
  },
  {
    href: "/simulator/purchase",
    emoji: "🏠",
    title: "Property purchase simulator",
    desc: "Enter your budget and target floor area — see the top affordable cities and the monthly loan payment.",
    cta: "Simulate a purchase",
  },
  {
    href: "/red-flags",
    emoji: "🚩",
    title: "Red flag radar",
    desc: "Before buying or moving: the red flags nobody tells you about (perceived safety, climate risk, tight market, declining services).",
    cta: "Check red flags",
  },
  {
    href: "/rankings",
    emoji: "📊",
    title: "19 thematic rankings",
    desc: `${CITIES_COUNT} cities ranked by quality of life, safety, schools, nature, cost, remote work, and more. ${GUIDES_COUNT} guides included.`,
    cta: "Browse rankings",
  },
];

export default function EnToolsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "BestCitiesInFrance tools",
    description: "Interactive tools and references to help you choose where to live in France",
    numberOfItems: TOOLS.length,
    itemListElement: TOOLS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.title,
      description: t.desc,
      url: `${EN_BASE}${t.href}`,
    })),
  };

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-tertiary)] mb-4">
            <Link href="/" className="hover:underline">Home</Link>
            {" / "}
            <span>Tools</span>
          </nav>
          <Badge variant="accent" className="mb-3">Tools</Badge>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
            {TOOLS.length} tools to choose where to live
          </h1>
          <p className="text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            Quizzes, calculators, comparators, and maps. Everything you need to decide
            — with real data, no fluff.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 gap-4">
          {TOOLS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 hover:border-[var(--accent)] transition-colors flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{t.emoji}</span>
                <h2 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {t.title}
                </h2>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-1 mb-4">
                {t.desc}
              </p>
              <span className="text-sm font-semibold text-[var(--accent)] group-hover:underline">
                {t.cta} →
              </span>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
