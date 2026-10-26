import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { CityPhotoBand } from "@/components/CityPhoto";
import { guideCityPhoto } from "@/lib/city-images";
import { Footer } from "@/components/Footer";
import { EN_GUIDES, EN_GUIDE_CATEGORIES, getEnGuide } from "@/data/guides-en";
import { clampMeta } from "@/lib/brand";
import { CITIES_SEED } from "@/data/cities-seed";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { scoreColor } from "@/lib/utils";
import { slugifyTagEn, TAG_SLUGS_EN } from "@/lib/guide-tags-en";
import { suggestNextEnGuides } from "@/lib/guide-suggestions-en";
import { renderRich, stripMd } from "@/lib/link-cities";
import { splitParagraphs } from "@/lib/paragraphs";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { ReadingProgress } from "@/components/ReadingProgress";
import { GrainOverlay } from "@/components/effects/GrainOverlay";
import { Clock, ListOrdered, MapPin, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { GUIDE_CATEGORIES } from "@/lib/guide-categories";
import type { EnGuide } from "@/data/guides-en";

const EN_BASE = ORIGIN_BY_LOCALE.en;

// EN categories borrow the colour of their closest FR category, so the class
// strings stay in lib/guide-categories.ts where Tailwind already scans them.
const EN_TO_FR_CATEGORY: Record<EnGuide["category"], string> = {
  moving: "region",
  "remote-work": "teletravail",
  family: "famille",
  budget: "budget",
  lifestyle: "lifestyle",
  "city-guide": "tourisme",
};
const EN_CATEGORY_STYLE = Object.fromEntries(
  Object.entries(EN_TO_FR_CATEGORY).map(([en, fr]) => [en, GUIDE_CATEGORIES.find((c) => c.id === fr)]),
) as Record<EnGuide["category"], (typeof GUIDE_CATEGORIES)[number] | undefined>;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return EN_GUIDES.map((g) => ({ locale: "en", slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const g = getEnGuide(slug);
  if (!g) return {};
  // Full text stays on the page and in the Article JSON-LD below; only the
  // rendered tag is cut. See the FR twin and /classements/[slug].
  const metaDesc = clampMeta(g.metaDesc);
  return {
    title: g.metaTitle,
    description: metaDesc,
    alternates: { canonical: `${EN_BASE}/guides/${slug}` },
    openGraph: { type: "article", title: g.title, description: metaDesc, images: ["/opengraph-image"] },
  };
}

export default async function EnGuidePage({ params }: Props) {
  const { slug } = await params;
  const g = getEnGuide(slug);
  if (!g) notFound();

  const hero = guideCityPhoto(g.slug, g.relatedCities);
  const relatedCities = g.relatedCities
    .map((s) => CITIES_SEED.find((c) => c.slug === s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const otherGuides = suggestNextEnGuides(g, 3);
  const catMeta = EN_CATEGORY_STYLE[g.category];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.metaDesc,
    datePublished: g.publishedAt,
    dateModified: g.updatedAt,
    inLanguage: "en",
    url: `${EN_BASE}/guides/${g.slug}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${EN_BASE}/guides/${g.slug}` },
    author: { "@type": "Organization", name: "BestCitiesInFrance", url: EN_BASE },
    publisher: {
      "@type": "Organization",
      name: "BestCitiesInFrance",
      url: EN_BASE,
      // /icon.png never existed (404 on both domains), so Google had no
      // publisher logo for any EN guide. Same file as the root Organization.
      logo: { "@type": "ImageObject", url: `${EN_BASE}/icon-512.png`, width: 512, height: 512 },
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: EN_BASE },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${EN_BASE}/guides` },
      { "@type": "ListItem", position: 3, name: g.title, item: `${EN_BASE}/guides/${g.slug}` },
    ],
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: g.sections.map((s) => ({
      "@type": "Question",
      name: s.heading,
      acceptedAnswer: { "@type": "Answer", text: stripMd(s.body) },
    })),
  };

  return (
    <main id="main-content" className="min-h-screen">
      <ReadingProgress />
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Header — same treatment as the FR guide page: ambient wash tinted by the
          category, glass facts strip. The EN page was a bare column of text. */}
      <section className="relative overflow-hidden bg-aurora py-12">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className={cn("absolute -top-28 -right-24 h-80 w-80 rounded-full blur-[110px] opacity-30 animate-drift", catMeta?.glow ?? "bg-[var(--accent)]")} />
          <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-[var(--accent)]/12 blur-[100px] animate-drift" style={{ animationDelay: "2s" }} />
        </div>
        <GrainOverlay opacity={0.14} blend="overlay" />

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
          <nav className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs text-[var(--text-tertiary)] shadow-sm">
            <Link href="/" className="transition-colors hover:text-[var(--text-secondary)]">Home</Link>
            <span>/</span>
            <Link href="/guides" className="transition-colors hover:text-[var(--text-secondary)]">Guides</Link>
            <span>/</span>
            <span className="truncate text-[var(--text-secondary)]">{g.title}</span>
          </nav>

          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl grad-head-5 text-3xl shadow-[0_10px_24px_-10px_rgba(79,70,229,0.7)]">
              {g.emoji}
            </div>
            <Link
              href={`/guides/category/${g.category}`}
              className={cn("rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors hover:brightness-110", catMeta?.bg, catMeta?.color)}
            >
              {EN_GUIDE_CATEGORIES[g.category]}
            </Link>
          </div>

          <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight gradient-text sm:text-4xl">
            {g.title}
          </h1>
          <p className="text-lg leading-relaxed text-[var(--text-secondary)]">{renderRich(g.intro)}</p>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Clock, value: `${g.readMinutes} min`, label: "read" },
              { icon: ListOrdered, value: String(g.sections.length), label: "sections" },
              ...(relatedCities.length
                ? [{ icon: MapPin, value: String(relatedCities.length), label: relatedCities.length > 1 ? "cities mentioned" : "city mentioned" }]
                : []),
              {
                icon: CalendarDays,
                value: new Date(g.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
                label: `updated ${new Date(g.updatedAt).getFullYear()}`,
              },
            ].map(({ icon: Icon, value, label }, i) => (
              <div key={label} className="rounded-2xl bg-white/85 p-4 shadow-[0_8px_22px_-14px_rgba(79,70,229,0.6)]">
                <span className={cn("mb-2 inline-flex h-7 w-7 items-center justify-center rounded-lg", `grad-head-${i % 6}`)}>
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="font-mono-data text-xl font-bold text-[var(--text-primary)]">{value}</div>
                <div className="text-xs text-[var(--text-secondary)]">{label}</div>
              </div>
            ))}
          </div>

          {hero && (
            <CityPhotoBand
              photo={hero.photo}
              cityName={relatedCities.find((c) => c.slug === hero.slug)?.name ?? hero.slug}
              locale="en"
              className="mt-8"
            />
          )}
        </div>
      </section>

      {/* Body — indigo band; TOC, sections and sidebar cards are white. */}
      <section className="band band-indigo">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 lg:flex-row">
          <article className="min-w-0 flex-1">
            <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-[0_12px_30px_-18px_rgba(79,70,229,0.55)]">
              <p className="grad-head-0 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest">
                Contents
              </p>
              <div className="p-5">
              <ol className="space-y-2">
                {g.sections.map((s, i) => (
                  <li key={i}>
                    <a href={`#section-${i}`} className="flex items-start gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]">
                      <span className="mt-0.5 flex-shrink-0 rounded-full bg-[var(--band-indigo)] px-1.5 font-mono text-xs font-semibold text-[var(--accent)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ol>
              </div>
            </div>

            <div className="space-y-6">
              {g.sections.map((s, i) => (
                <section
                  key={i}
                  id={`section-${i}`}
                  className="scroll-mt-24 rounded-2xl bg-white p-5 shadow-[0_12px_30px_-18px_rgba(79,70,229,0.55)] transition-shadow hover:shadow-[0_16px_36px_-16px_rgba(79,70,229,0.6)] sm:p-7"
                >
                  <h2 className="mb-4 flex items-baseline gap-3 text-lg font-bold text-[var(--text-primary)]">
                    <span
                      className={cn(
                        "flex-shrink-0 rounded-full px-2.5 py-0.5 font-mono-data text-xs font-semibold",
                        i % 2 === 0 ? "grad-head-0" : "grad-head-5",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{s.heading}</span>
                  </h2>
                  <div className="space-y-4">
                    {splitParagraphs(s.body).map((para, j) => (
                      <p key={j} className="text-base leading-[1.75] text-[var(--text-secondary)]">{renderRich(para)}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-10">
              <FeedbackWidget locale="en" />
            </div>

          </article>

          <aside className="w-full flex-shrink-0 space-y-6 lg:sticky lg:top-20 lg:w-72 lg:self-start">
            {relatedCities.length > 0 && (
              <div className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_30px_-18px_rgba(79,70,229,0.55)]">
                <p className="grad-head-5 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest">Cities mentioned</p>
                <div className="space-y-1 p-3">
                  {relatedCities.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/cities/${c.slug}`}
                      className="group flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-[var(--band-indigo)]"
                    >
                      <span className="text-sm text-[var(--text-secondary)] transition-colors group-hover:text-[var(--text-primary)]">{c.name}</span>
                      <span className={cn("font-mono-data text-xs font-bold", scoreColor(c.scores.global))}>
                        {c.scores.global.toFixed(1)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <Link
              href="/guides"
              className="flex items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-semibold text-[var(--accent)] shadow-sm transition-colors hover:bg-white/80"
            >
              ← All guides
            </Link>
          </aside>
        </div>
      </div>
      </section>

      {/* Keep reading — tags and suggestions in a sky band, closed by the page's
          single bold call-to-action. */}
      <section className="band band-sky">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {g.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {g.tags.map((tag) => {
              const tagSlug = slugifyTagEn(tag);
              const hasPage = TAG_SLUGS_EN.includes(tagSlug);
              return hasPage ? (
                <Link
                  key={tag}
                  href={`/tags/${tagSlug}`}
                  className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[var(--accent)] shadow-sm transition-colors hover:bg-[var(--accent)] hover:text-white"
                >
                  {tag}
                </Link>
              ) : (
                <span key={tag} className="rounded-full bg-white/70 px-3 py-1 text-xs text-[var(--text-secondary)]">
                  {tag}
                </span>
              );
            })}
          </div>
        )}

        {otherGuides.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-xl font-bold tracking-tight gradient-text">Read next</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {otherGuides.map((o, j) => (
                <Link
                  key={o.slug}
                  href={`/guides/${o.slug}`}
                  className="group rounded-2xl bg-white p-4 shadow-[0_12px_30px_-18px_rgba(79,70,229,0.55)] transition-shadow hover:shadow-[0_16px_36px_-16px_rgba(79,70,229,0.65)]"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl text-xl", `grad-head-${j % 6}`)} aria-hidden>{o.emoji}</span>
                    <span className={cn("text-[10px] font-semibold uppercase tracking-wide", EN_CATEGORY_STYLE[o.category]?.color)}>
                      {EN_GUIDE_CATEGORIES[o.category]}
                    </span>
                  </div>
                  <p className="text-sm font-semibold leading-snug text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
                    {o.title}
                  </p>
                  <p className="mt-2 text-xs text-[var(--text-tertiary)]">{o.readMinutes} min</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="band-bold mt-10 rounded-2xl p-6 shadow-[0_14px_32px_-16px_rgba(109,63,216,0.8)]">
          <p className="mb-1 font-semibold text-[var(--text-primary)]">Find your city in 3 minutes</p>
          <p className="mb-4 text-sm text-[var(--text-secondary)]">
            Answer a few questions on budget, climate and pace of life and get a ranked shortlist of French cities.
          </p>
          <Link
            href="/city-match"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[var(--accent-hover)] transition-colors hover:bg-white/90"
          >
            Take the quiz
          </Link>
        </div>
      </div>
      </section>
      <Footer />
    </main>
  );
}
