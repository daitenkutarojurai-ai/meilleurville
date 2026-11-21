import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ToolsHub, type HubGroup } from "@/components/ToolsHub";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT, GUIDES_COUNT } from "@/lib/site-stats";
import { ORIGIN_BY_LOCALE, pathAlternatesEn } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Tools · Quiz, calculator, map, rankings | BestCitiesInFrance",
  description: `All BestCitiesInFrance tools to choose, compare, and simulate. Compatibility quiz, cost calculator, interactive map, city comparator, leaderboard.`,
  alternates: pathAlternatesEn("/outils", "/tools"),
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Tools", path: "/tools" },
]);

type GroupId = "find" | "budget" | "explore";

const GROUPS: (HubGroup & { id: GroupId })[] = [
  { id: "find", emoji: "🎯", title: "Find your city", lead: "Quizzes, an AI copilot and projections: your priorities in, a shortlist of cities out." },
  { id: "budget", emoji: "💶", title: "Budget and calculators", lead: "Rent, salary, purchase price: what a city actually leaves you each month." },
  { id: "explore", emoji: "🧭", title: "Compare and explore", lead: "Maps, rankings, the comparator and red flags to settle between finalists." },
];

type Tool = {
  href: string;
  emoji: string;
  title: string;
  desc: string;
  cta: string;
  group: GroupId;
};

const TOOLS: Tool[] = [
  {
    href: "/city-match",
    group: "find",
    emoji: "🌸",
    title: "City Match",
    desc: `8 questions, 90 seconds. Top 3 cities updated live as you answer + a surprise match, and a shareable link. No email required.`,
    cta: "Start City Match",
  },
  {
    href: "/copilot",
    group: "find",
    emoji: "🤖",
    title: "AI Relocation Copilot",
    desc: "Ask in plain English: budget, profile, priorities. The AI knows all ${CITIES_COUNT} French cities — rents, quality-of-life scores, taxes — and answers in seconds.",
    cta: "Talk to the copilot",
  },
  {
    href: "/future-you",
    group: "find",
    emoji: "✨",
    title: "Future You — life in numbers",
    desc: "Salary, household, lifestyle, priorities: monthly leftover, free hours per week, stress level, and climate match in your top 3 cities.",
    cta: "Simulate my life",
  },
  {
    href: "/people-like-you",
    group: "find",
    emoji: "👥",
    title: "People like you",
    desc: "11 persona profiles × 50 major cities: where people like you (family, freelance, retiree…) would gain by moving from your current city.",
    cta: "See destinations",
  },
  {
    href: "/quiz/compatibility",
    group: "find",
    emoji: "✨",
    title: "Compatibility quiz",
    desc: `Answer 10 questions about your priorities (climate, budget, schools, mobility) — we rank ${CITIES_COUNT} cities against your personal profile.`,
    cta: "Take the quiz",
  },
  {
    href: "/compare",
    group: "explore",
    emoji: "⚖️",
    title: "City comparator",
    desc: "Compare two cities side by side across 8 criteria (quality of life, transport, cost, safety, climate, schools...). Decision in 30 seconds.",
    cta: "Compare two cities",
  },
  {
    href: "/map",
    group: "explore",
    emoji: "🗺️",
    title: "Interactive heatmap",
    desc: "All French cities on a colour-coded map, filtered by criterion (nature, transport, cost...). Zoom and click to see the full city profile.",
    cta: "Open the map",
  },
  {
    href: "/leaderboard",
    group: "explore",
    emoji: "🏆",
    title: `Top ${CITIES_COUNT} cities`,
    desc: `The global ranking of all ${CITIES_COUNT} cities, sortable and filterable by region, size, or thematic score. The quick reference.`,
    cta: "See the ranking",
  },
  {
    href: "/calculator/real-cost",
    group: "budget",
    emoji: "💸",
    title: "Real monthly cost calculator",
    desc: "What does it actually cost to live in a given city? Rent, heating, mobility, taxes — all in one simulation.",
    cta: "Open the calculator",
  },
  {
    href: "/salary-equivalent",
    group: "budget",
    emoji: "💼",
    title: "Salary equivalent",
    desc: "How much do you need to earn in another city to keep the same standard of living? Converts based on rent, heating, mobility, and taxes.",
    cta: "Calculate equivalent",
  },
  {
    href: "/simulator/purchase",
    group: "budget",
    emoji: "🏠",
    title: "Property purchase simulator",
    desc: "Enter your budget and target floor area — see the top affordable cities and the monthly loan payment.",
    cta: "Simulate a purchase",
  },
  {
    href: "/red-flags",
    group: "explore",
    emoji: "🚩",
    title: "Red flag radar",
    desc: "Before buying or moving: the red flags nobody tells you about (perceived safety, climate risk, tight market, declining services).",
    cta: "Check red flags",
  },
  {
    href: "/rankings",
    group: "explore",
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

      <ToolsHub
        tools={TOOLS}
        groups={GROUPS}
        breadcrumb={
          <nav className="mb-4 text-xs text-[var(--text-tertiary)]">
            <Link href="/" className="hover:underline">Home</Link>
            {" / "}
            <span>Tools</span>
          </nav>
        }
        eyebrow="Tools"
        titleLead={`${TOOLS.length} tools to`}
        titleAccent="choose where to live"
        intro="Quizzes, calculators, comparators, and maps. Everything you need to decide — with real data, no fluff."
        countLabel={(n) => `${n} tool${n > 1 ? "s" : ""}`}
        jumpLabel="Tool families"
      />

      <Footer />
    </main>
  );
}
