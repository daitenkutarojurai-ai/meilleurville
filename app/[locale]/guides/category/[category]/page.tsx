import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import type { EnGuide } from "@/data/guides-en";
import { EN_GUIDES, EN_GUIDE_CATEGORIES } from "@/data/guides-en";
import { clampMeta } from "@/lib/brand";
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
// get otherwise. `emoji`/`bg`/`color` are declared here rather than imported:
// EN_GUIDE_CATEGORIES is a plain label map, and Tailwind only scans literal
// class names.
const CATEGORY_COPY: Record<
  Category,
  { h1: string; intro: string; emoji: string; bg: string; color: string }
> = {
  "city-guide": {
    h1: "City guides",
    intro:
      "One French city at a time: what there is to do, which neighbourhoods to buy in, what a month actually costs. Written for someone who has never been, not for someone who grew up there.",
    emoji: "🏙️",
    bg: "bg-cyan-400/10 border-cyan-400/20",
    color: "text-cyan-400",
  },
  moving: {
    h1: "Moving to France",
    intro:
      "The paperwork and the decisions, in order: visas, health cover, a bank account, a rental without a French guarantor. Then the question those all hang on, which is the region before the town.",
    emoji: "📦",
    bg: "bg-orange-400/10 border-orange-400/20",
    color: "text-orange-400",
  },
  "remote-work": {
    h1: "Remote work",
    intro:
      "Working from France for an employer somewhere else: connection speeds that hold a call, coworking outside Paris. Plus the tax and social-security questions that decide where you can legally sit.",
    emoji: "💻",
    bg: "bg-blue-400/10 border-blue-400/20",
    color: "text-blue-400",
  },
  lifestyle: {
    h1: "Lifestyle",
    intro:
      "Daily life rather than figures: living without a car, being a student here, retiring there, and what you trade away by picking the coast over the mountains.",
    emoji: "🌅",
    bg: "bg-violet-400/10 border-violet-400/20",
    color: "text-violet-400",
  },
  family: {
    h1: "Family",
    intro:
      "Schools, childcare, healthcare and safety, plus what a family-sized flat costs at equal floor area. For the move you make with other people and do not plan to repeat soon.",
    emoji: "👨‍👩‍👧",
    bg: "bg-emerald-400/10 border-emerald-400/20",
    color: "text-emerald-400",
  },
  budget: {
    h1: "Budget and cost of living",
    intro:
      "What living somewhere really costs: rent, purchase price per square metre, utilities, transport and local taxes, rather than the number on the listing.",
    emoji: "💰",
    bg: "bg-yellow-400/10 border-yellow-400/20",
    color: "text-yellow-400",
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
    title: `${copy.h1} · ${count} guides for France`,
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

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-tertiary)] mb-3">
            <Link href="/" className="hover:underline">Home</Link> ·{" "}
            <Link href="/guides" className="hover:underline">Guides</Link>
          </nav>
          <Badge variant="accent" className="mb-3">
            {copy.emoji} {guides.length} guide{guides.length > 1 ? "s" : ""}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
            {copy.h1}
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl">{copy.intro}</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-12">
        {/* Flat list: one link per guide, not a grid of cards. `city-guide`
            alone runs to several hundred guides, and the /guides hub has
            already paid that bill once (2.5 MB of HTML before capping). */}
        <ul className="space-y-1">
          {guides.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
                className="flex items-baseline gap-3 rounded-lg px-3 py-2 hover:bg-[var(--bg-subtle)] transition-colors"
              >
                <span className="shrink-0">{g.emoji}</span>
                <span className="min-w-0 flex-1 text-sm text-[var(--text-primary)]">{g.title}</span>
                <span className="shrink-0 text-xs text-[var(--text-tertiary)] tabular-nums">
                  {g.readMinutes} min
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            The other categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.filter((c) => c !== category).map((c) => {
              const other = CATEGORY_COPY[c];
              const count = EN_GUIDES.filter((g) => g.category === c).length;
              return (
                <Link
                  key={c}
                  href={`/guides/category/${c}`}
                  className={`rounded-xl border px-4 py-3 hover:brightness-110 transition-all ${other.bg}`}
                >
                  <div className="text-xl mb-1">{other.emoji}</div>
                  <div className={`text-sm font-semibold ${other.color}`}>{other.h1}</div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    {count} guide{count > 1 ? "s" : ""}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
