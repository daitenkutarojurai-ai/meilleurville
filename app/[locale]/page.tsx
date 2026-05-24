import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { NewsletterSection } from "@/components/NewsletterSection";
import { CITIES_SEED } from "@/data/cities-seed";
import { EN_GUIDES } from "@/data/guides-en";
import { t, ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { CITIES_COUNT } from "@/lib/site-stats";
import { scoreColor } from "@/lib/utils";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "BestCitiesInFrance · Find the French city that fits you",
  description: `Independent rankings, lifestyle quiz, and city comparisons across ${CITIES_COUNT} French cities. Find where to live, work, or retire in France — with real data, no fluff.`,
  alternates: {
    canonical: `${EN_BASE}/`,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "BestCitiesInFrance",
    url: `${EN_BASE}/`,
    title: "BestCitiesInFrance · Find the French city that fits you",
    description: `Independent rankings + lifestyle quiz across ${CITIES_COUNT} French cities. No fluff, no sponsored content.`,
  },
};

const TOOLS = [
  { href: "/city-match", emoji: "🌸", title: "City Match", desc: "8 questions, your top 3 cities — live as you answer" },
  { href: "/compare", emoji: "⚖️", title: "Compare cities", desc: "Side-by-side scoring on 8 axes" },
  { href: "/quiz", emoji: "🎯", title: "Lifestyle quiz", desc: "Map your priorities to the right city profile" },
  { href: "/future-you", emoji: "🔮", title: "Future You", desc: "Simulate your life in 3 French cities" },
  { href: "/map", emoji: "🗺️", title: "Interactive map", desc: "All 352 cities coloured by overall score" },
  { href: "/leaderboard", emoji: "🏆", title: "Full ranking", desc: `All ${CITIES_COUNT} cities ranked globally` },
];

const QUICK_LINKS = [
  { href: "/rankings/securite", label: "Safest cities" },
  { href: "/rankings/soleil", label: "Sunniest cities" },
  { href: "/rankings/transport", label: "Best transport" },
  { href: "/rankings/couts", label: "Most affordable" },
  { href: "/rankings/teletravel", label: "Remote-work friendly" },
  { href: "/rankings/nature", label: "Best for nature" },
  { href: "/overall-ranking", label: "Overall ranking" },
  { href: "/red-flags", label: "Red flags by city" },
];

export default function EnHomePage() {
  const top = [...CITIES_SEED]
    .sort((a, b) => b.scores.global - a.scores.global)
    .slice(0, 6);

  const featuredGuides = EN_GUIDES.filter((g) =>
    ["moving-to-france-where-to-live-2026", "best-french-cities-remote-work-2026",
     "retiring-in-france-best-cities-2026", "cost-of-living-france-by-city-2026",
     "leaving-paris-best-french-cities-2026", "best-french-cities-families-2026"].includes(g.slug)
  ).slice(0, 6);

  return (
    <main id="main-content" className="min-h-screen relative">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-24 pb-12 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-5 tracking-tight leading-[1.05]">
          {t("home.hero.title", "en")}
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
          {t("home.hero.subtitle", "en")}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/city-match"
            className="rounded-full bg-[var(--accent)] px-6 py-3 text-white font-semibold shadow-md hover:opacity-90"
          >
            Find my city match →
          </Link>
          <Link
            href="/cities"
            className="rounded-full border border-[var(--border)] px-6 py-3 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
          >
            {t("home.hero.ctaCities", "en")}
          </Link>
          <Link
            href="/guides"
            className="rounded-full border border-[var(--border)] px-6 py-3 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
          >
            Relocation guides
          </Link>
        </div>
        <p className="mt-5 text-xs text-[var(--text-tertiary)]">
          {CITIES_COUNT} cities · 19 ranking categories · independent, no sponsored results
        </p>
      </section>

      {/* Top cities */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-[var(--text-primary)]">
          Top 6 highest-rated cities
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {top.map((city, i) => (
            <li key={city.slug}>
              <Link
                href={`/cities/${city.slug}`}
                className="block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 transition-all hover:border-[var(--accent)]/40 hover:shadow-lg"
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">#{i + 1}</span>
                  <span className={`font-mono-data font-bold text-2xl ${scoreColor(city.scores.global)}`}>
                    {city.scores.global.toFixed(1)}
                  </span>
                </div>
                <h3 className="mt-1 text-lg font-bold text-[var(--text-primary)]">{city.name}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{city.region ?? ""}</p>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            Full ranking — all {CITIES_COUNT} cities →
          </Link>
        </div>
      </section>

      {/* Tools */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10 border-t border-[var(--border)]">
        <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Tools</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">Interactive tools to find, compare, and simulate your next city.</p>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TOOLS.map((tool) => (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="flex flex-col gap-1 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 h-full transition-all hover:border-[var(--accent)]/40 hover:shadow-md"
              >
                <span className="text-2xl" aria-hidden>{tool.emoji}</span>
                <span className="font-semibold text-sm text-[var(--text-primary)]">{tool.title}</span>
                <span className="text-xs text-[var(--text-secondary)]">{tool.desc}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Quick category links */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10 border-t border-[var(--border)]">
        <h2 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">Rankings by category</h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-all hover:border-[var(--accent)]/40 hover:shadow-sm"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Guides */}
      {featuredGuides.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10 border-t border-[var(--border)]">
          <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Relocation guides</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            {EN_GUIDES.length} guides — no fluff, no postcards.{" "}
            <Link href="/guides" className="text-[var(--accent)] hover:underline">Browse all →</Link>
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredGuides.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="flex flex-col h-full rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 transition-all hover:border-[var(--accent)]/40 hover:shadow-md"
                >
                  <span className="text-2xl mb-2" aria-hidden>{g.emoji}</span>
                  <h3 className="font-bold text-sm text-[var(--text-primary)] leading-snug mb-1">{g.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-auto pt-2">{g.readMinutes} min read</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* About strip */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10 border-t border-[var(--border)]">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Independent, data-led, no fluff</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              No sponsored cities. No tourist-board descriptions. Scores are calculated from public data
              (INSEE, SSMSI, Météo-France, DGFiP) and calibrated against editorial knowledge.
              The methodology is documented and the numbers are honest about what they measure.
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Link href="/methodology" className="text-sm text-[var(--accent)] hover:underline">Our methodology →</Link>
            <Link href="/about" className="text-sm text-[var(--accent)] hover:underline">About this site →</Link>
            <Link href="/data-sources" className="text-sm text-[var(--accent)] hover:underline">Data sources →</Link>
          </div>
        </div>
      </section>

      <NewsletterSection locale="en" />
      <Footer />
    </main>
  );
}
