import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EN_GUIDES, EN_GUIDE_CATEGORIES, getEnGuide } from "@/data/guides-en";
import { CITIES_SEED } from "@/data/cities-seed";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { scoreColor } from "@/lib/utils";
import { slugifyTagEn, TAG_SLUGS_EN } from "@/lib/guide-tags-en";
import { suggestNextEnGuides } from "@/lib/guide-suggestions-en";
import { renderRich, stripMd } from "@/lib/link-cities";
import { FeedbackWidget } from "@/components/FeedbackWidget";

const EN_BASE = ORIGIN_BY_LOCALE.en;

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
  return {
    title: g.metaTitle,
    description: g.metaDesc,
    alternates: { canonical: `${EN_BASE}/guides/${slug}` },
    openGraph: { type: "article", title: g.title, description: g.metaDesc },
  };
}

export default async function EnGuidePage({ params }: Props) {
  const { slug } = await params;
  const g = getEnGuide(slug);
  if (!g) notFound();

  const relatedCities = g.relatedCities
    .map((s) => CITIES_SEED.find((c) => c.slug === s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const otherGuides = suggestNextEnGuides(g, 3);

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
      logo: { "@type": "ImageObject", url: `${EN_BASE}/icon.png` },
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
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <article className="mx-auto max-w-3xl px-4 sm:px-6 pt-16 pb-12">
        <nav className="mb-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          {" · "}
          <Link href="/guides" className="hover:text-[var(--accent)]">Guides</Link>
          {" · "}
          <span>{EN_GUIDE_CATEGORIES[g.category]}</span>
        </nav>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-5xl" aria-hidden>{g.emoji}</span>
          <span className="text-xs uppercase tracking-wide text-[var(--accent)] font-semibold">
            {EN_GUIDE_CATEGORIES[g.category]} · {g.readMinutes} min read
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight mb-6 leading-tight">
          {g.title}
        </h1>
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-10">{renderRich(g.intro)}</p>

        {g.sections.map((s) => (
          <section key={s.heading} className="mb-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">{s.heading}</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">{renderRich(s.body)}</p>
          </section>
        ))}

        <div className="my-8">
          <FeedbackWidget locale="en" />
        </div>

        {relatedCities.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Cities mentioned</h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {relatedCities.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/cities/${c.slug}`}
                    className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm hover:border-[var(--accent)]/40"
                  >
                    <span className="text-[var(--text-primary)] truncate">{c.name}</span>
                    <span className={`font-mono-data font-bold ${scoreColor(c.scores.global)}`}>
                      {c.scores.global.toFixed(1)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {g.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-[var(--border)]">
            {g.tags.map((tag) => {
              const tagSlug = slugifyTagEn(tag);
              const hasPage = TAG_SLUGS_EN.includes(tagSlug);
              return hasPage ? (
                <Link
                  key={tag}
                  href={`/tags/${tagSlug}`}
                  className="text-xs px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)]/40 transition-colors"
                >
                  {tag}
                </Link>
              ) : (
                <span key={tag} className="text-xs px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)]">
                  {tag}
                </span>
              );
            })}
          </div>
        )}

        {otherGuides.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Read next</h2>
            <ul className="space-y-2">
              {otherGuides.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={`/guides/${o.slug}`}
                    className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 hover:border-[var(--accent)]/40"
                  >
                    <span aria-hidden className="text-2xl">{o.emoji}</span>
                    <span className="text-[var(--text-primary)] font-medium">{o.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
      <Footer />
    </main>
  );
}
