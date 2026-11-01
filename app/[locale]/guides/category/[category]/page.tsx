import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import type { EnGuide } from "@/data/guides-en";
import { EN_GUIDES, EN_GUIDE_CATEGORIES } from "@/data/guides-en";
import { clampMeta, fitTitle } from "@/lib/brand";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Category = EnGuide["category"];
type Props = { params: Promise<{ locale: string; category: string }> };

// The EN categories are NOT the FR ones translated: `data/guides-en.ts` has six
// (`city-guide`, `moving`, `remote-work`, `lifestyle`, `family`, `budget`)
// against seven in `lib/guide-categories.ts`, because the EN corpus is native
// content on an expat angle rather than a translation. So this page derives its
// list from EN_GUIDE_CATEGORIES, and the copy below is written per EN category
// — deriving a sentence from the label would just repeat the label.
//
// `h1` exists separately from the label because "City guide guides" is what you
// get otherwise. `emoji` is declared here because EN_GUIDE_CATEGORIES is a plain
// label map. No per-category tint: green, amber, orange and violet are reserved
// for the score tiers ("Couleurs" identity), so tiles use EmojiBadge instead.
const CATEGORY_COPY: Record<
  Category,
  { h1: string; intro: string; emoji: string }
> = {
  "city-guide": {
    h1: "City guides",
    intro:
      "One French city at a time: what there is to do, which neighbourhoods to buy in, what a month actually costs. Written for someone who has never been, not for someone who grew up there.",
    emoji: "🏙️",
  },
  moving: {
    h1: "Moving to France",
    intro:
      "The paperwork and the decisions, in order: visas, health cover, a bank account, a rental without a French guarantor. Then the question those all hang on, which is the region before the town.",
    emoji: "📦",
  },
  "remote-work": {
    h1: "Remote work",
    intro:
      "Working from France for an employer somewhere else: connection speeds that hold a call, coworking outside Paris. Plus the tax and social-security questions that decide where you can legally sit.",
    emoji: "💻",
  },
  lifestyle: {
    h1: "Lifestyle",
    intro:
      "Daily life rather than figures: living without a car, being a student here, retiring there, and what you trade away by picking the coast over the mountains.",
    emoji: "🌅",
  },
  family: {
    h1: "Family",
    intro:
      "Schools, childcare, healthcare and safety, plus what a family-sized flat costs at equal floor area. For the move you make with other people and do not plan to repeat soon.",
    emoji: "👨‍👩‍👧",
  },
  budget: {
    h1: "Budget and cost of living",
    intro:
      "What living somewhere really costs: rent, purchase price per square metre, utilities, transport and local taxes, rather than the number on the listing.",
    emoji: "💰",
  },
};

const CATEGORIES = Object.keys(EN_GUIDE_CATEGORIES) as Category[];

function isCategory(id: string): id is Category {
  return (CATEGORIES as string[]).includes(id);
}

function guidesIn(cat: Category) {
  return EN_GUIDES.filter((g) => g.category === cat).sort((a, b) =>
    (b.updatedAt ?? b.publishedAt).localeCompare(a.updatedAt ?? a.publishedAt),
  );
}

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ locale: "en", category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  if (!isCategory(category)) return {};
  const copy = CATEGORY_COPY[category];
  const count = guidesIn(category).length;
  // No brand suffix: `${h1} guides · ${count} for France` already runs to
  // 40-50 characters, and `hubTitle()` would add 21 more — past what Google
  // renders, so the count would be the part that gets cut.
  return {
    title: fitTitle(`${copy.h1} · ${count} guides for France`),
    // `intro` doubles as the on-page paragraph, so it runs past what a SERP
    // renders (183 chars on `city-guide`). The page keeps the full sentence,
    // only the tag is cut — on a clause boundary, per clampMeta.
    description: clampMeta(copy.intro),
    alternates: { canonical: `${EN_BASE}/guides/category/${category}` },
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
      title: `${copy.h1} guides | BestCitiesInFrance`,
      description: clampMeta(copy.intro),
    },
  };
}

export default async function EnGuideCategoryPage({ params }: Props) {
  const { category } = await params;
  if (!isCategory(category)) notFound();
  const copy = CATEGORY_COPY[category];
  const guides = guidesIn(category);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: copy.h1, path: `/guides/category/${category}` },
  ]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${copy.h1} guides`,
    description: copy.intro,
    numberOfItems: guides.length,
    itemListElement: guides.slice(0, 100).map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${EN_BASE}/guides/${g.slug}`,
      name: g.title,
    })),
  };

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(itemList)} />
      <Navbar />

      {/* Hero, "Couleurs" identity: colour aurora, gradient title. */}
      <section className="relative bg-aurora pt-20 pb-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-tertiary)] mb-4">
            <Link href="/" className="hover:text-[var(--accent)] hover:underline">Home</Link> ·{" "}
            <Link href="/guides" className="hover:text-[var(--accent)] hover:underline">Guides</Link>
          </nav>
          <div className="flex items-center gap-3 mb-4">
            <EmojiBadge emoji={copy.emoji} tone={toneFor(category)} size="md" />
            <span className="rounded-full grad-head-0 px-3 py-1 text-xs font-semibold shadow-[0_8px_18px_-10px_rgba(79,70,229,0.8)]">
              {guides.length} guide{guides.length > 1 ? "s" : ""}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.08]">
            <span className="gradient-text">{copy.h1}</span>
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl sm:text-lg">{copy.intro}</p>
        </div>
      </section>

      {/* Flat list: one link per guide, not a grid of cards. `city-guide`
          alone runs to several hundred guides, and the /guides hub has
          already paid that bill once (2.5 MB of HTML before capping). */}
      <section className="band band-indigo py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <ul className="divide-y divide-[#E0E7FF] rounded-2xl border border-white bg-white p-2 shadow-[0_14px_36px_-22px_rgba(79,70,229,0.55)]">
            {guides.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="group flex items-baseline gap-3 rounded-xl px-3 py-2.5 hover:bg-[#EEF2FF] transition-colors"
                >
                  <span className="shrink-0">{g.emoji}</span>
                  <span className="min-w-0 flex-1 text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{g.title}</span>
                  <span className="shrink-0 rounded-full bg-[#EEF2FF] px-2 py-0.5 text-xs font-medium text-[#4338CA] tabular-nums">
                    {g.readMinutes} min
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Other categories: white tiles with a gradient emoji badge. Green,
          amber, orange and violet are reserved for the score tiers. */}
      <section className="band band-pink py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-5">
            <span className="gradient-text">The other categories</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.filter((c) => c !== category).map((c) => {
              const other = CATEGORY_COPY[c];
              const count = EN_GUIDES.filter((g) => g.category === c).length;
              return (
                <Link
                  key={c}
                  href={`/guides/category/${c}`}
                  className="group flex items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-[0_10px_28px_-18px_rgba(219,39,119,0.55)] hover:-translate-y-0.5 hover:border-[#FBCFE8] transition-all"
                >
                  <EmojiBadge emoji={other.emoji} tone={toneFor(c)} size="sm" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-pink)] transition-colors">{other.h1}</div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                      {count} guide{count > 1 ? "s" : ""}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
