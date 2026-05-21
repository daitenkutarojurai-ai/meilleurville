import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { EN_GUIDES, EN_GUIDE_CATEGORIES } from "@/data/guides-en";
import { RANKING_META } from "@/lib/rankings";
import { CITIES_COUNT } from "@/lib/site-stats";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Site index · BestCitiesInFrance",
  description: `Complete index of BestCitiesInFrance: ${CITIES_COUNT} cities, all rankings, regions, guides and tools — in one place.`,
  alternates: { canonical: `${EN_BASE}/site-index` },
};

function byInitial<T extends { name: string }>(items: T[]): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const item of items) {
    const k = item.name[0].toUpperCase();
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(item);
  }
  return new Map([...m.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}

const EN_RANKING_HEADLINE: Record<string, string> = {
  "qualite-de-vie": "Best quality of life",
  transport: "Best public transport",
  nature: "Best nature & green space",
  cout: "Most affordable cities",
  securite: "Safest cities",
  culture: "Best culture & nightlife",
  teletravail: "Best for remote work",
  ecoles: "Best schools",
  soleil: "Most sunshine",
  retraite: "Best cities to retire",
  etudiants: "Best student cities",
  familles: "Best cities for families",
  jeunes: "Best cities for young people",
  investissement: "Best buy-to-let investment",
  tourisme: "Most visited cities",
  eco: "Most eco-friendly cities",
  startup: "Best startup ecosystems",
  sport: "Best cities for sport",
  gastronomie: "Best gastronomy",
};

export default function EnSiteIndexPage() {
  const cities = [...CITIES_SEED].sort((a, b) => a.name.localeCompare(b.name));
  const citiesByLetter = byInitial(cities);

  const regions = [...new Set(CITIES_SEED.map((c) => c.region))].sort();

  const guidesByCategory = (Object.keys(EN_GUIDE_CATEGORIES) as Array<keyof typeof EN_GUIDE_CATEGORIES>).map(
    (cat) => ({
      cat,
      label: EN_GUIDE_CATEGORIES[cat],
      guides: EN_GUIDES.filter((g) => g.category === cat),
    })
  ).filter((group) => group.guides.length > 0);

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-tertiary)] mb-4">
            <Link href="/" className="hover:underline">Home</Link>
            {" / "}
            <span>Site index</span>
          </nav>
          <Badge variant="accent" className="mb-3">Site index</Badge>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
            Complete site index
          </h1>
          <p className="text-[var(--text-secondary)] max-w-3xl">
            {cities.length} cities, {EN_GUIDES.length} English guides, {regions.length} regions,
            and all tools — in one place, for quick navigation.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-12">
        {/* Navigation */}
        <section>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Navigation</h2>
          <div className="grid sm:grid-cols-3 gap-2 text-sm">
            {[
              { href: "/", label: "Home" },
              { href: "/cities", label: "All cities" },
              { href: "/rankings", label: "Rankings" },
              { href: "/compare", label: "City comparator" },
              { href: "/map", label: "Interactive map" },
              { href: "/leaderboard", label: "Top cities leaderboard" },
              { href: "/quiz/compatibility", label: "Compatibility quiz" },
              { href: "/red-flags", label: "Red flag radar" },
              { href: "/guides", label: "All guides" },
              { href: "/regions", label: "All regions" },
              { href: "/departments", label: "All departments" },
              { href: "/tools", label: "All tools" },
              { href: "/glossary", label: "Glossary" },
              { href: "/methodology", label: "Methodology" },
              { href: "/faq", label: "FAQ" },
              { href: "/overall-ranking", label: "Overall ranking" },
              { href: "/cycling", label: "Cycle-friendly cities" },
              { href: "/environment", label: "Environmental quality" },
              { href: "/healthcare", label: "Healthcare access" },
              { href: "/safety", label: "City safety" },
              { href: "/employment", label: "Job market" },
              { href: "/demographics", label: "Demographics" },
              { href: "/public-services", label: "Public services" },
              { href: "/own-vs-rent", label: "Own vs rent" },
              { href: "/from-paris", label: "From Paris by train" },
              { href: "/geographic-zones", label: "Geographic zones" },
              { href: "/expat-return", label: "Moving back to France" },
              { href: "/gentrification", label: "Gentrification tracker" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[var(--text-secondary)] hover:text-[var(--accent)] hover:underline"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Rankings */}
        <section>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            Thematic rankings ({Object.keys(RANKING_META).length})
          </h2>
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            {Object.entries(RANKING_META).map(([slug, meta]) => (
              <Link
                key={slug}
                href={`/rankings/${slug}`}
                className="text-[var(--text-secondary)] hover:text-[var(--accent)] hover:underline"
              >
                {EN_RANKING_HEADLINE[slug] ?? meta.headline}
              </Link>
            ))}
          </div>
        </section>

        {/* Regions */}
        <section>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            Regions ({regions.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {regions.map((r) => {
              const slug = r
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
              return (
                <Link
                  key={r}
                  href={`/regions/${slug}`}
                  className="text-[var(--text-secondary)] hover:text-[var(--accent)] hover:underline"
                >
                  {r}
                </Link>
              );
            })}
          </div>
        </section>

        {/* EN Guides by category */}
        <section>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            English guides ({EN_GUIDES.length})
          </h2>
          <div className="space-y-8">
            {guidesByCategory.map(({ cat, label, guides }) => (
              <div key={cat}>
                <p className="text-sm font-semibold uppercase tracking-wide mb-2 text-[var(--text-secondary)]">
                  {label} ({guides.length})
                </p>
                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  {guides.map((g) => (
                    <Link
                      key={g.slug}
                      href={`/guides/${g.slug}`}
                      className="text-[var(--text-secondary)] hover:text-[var(--accent)] hover:underline truncate"
                    >
                      {g.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cities A-Z */}
        <section>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            Cities A–Z ({cities.length})
          </h2>
          <div className="space-y-6">
            {[...citiesByLetter.entries()].map(([letter, list]) => (
              <div key={letter} id={`city-${letter}`}>
                <p className="text-lg font-bold text-[var(--accent)] mb-2 font-mono-data">{letter}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 text-sm">
                  {list.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/cities/${c.slug}`}
                      className="text-[var(--text-secondary)] hover:text-[var(--accent)] hover:underline truncate"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
