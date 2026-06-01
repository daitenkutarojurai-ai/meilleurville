import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { EN_GUIDE_CATEGORIES } from "@/data/guides-en";
import {
  TAG_SLUGS_EN,
  getTagLabelEn,
  getGuidesForTagEn,
  getRelatedTagsEn,
} from "@/lib/guide-tags-en";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export const revalidate = false;
export const dynamicParams = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return TAG_SLUGS_EN.map((slug) => ({ locale: "en", slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const label = getTagLabelEn(slug);
  if (!label) return {};
  const guides = getGuidesForTagEn(slug);
  return {
    title: `${label} · ${guides.length} BestCitiesInFrance guides`,
    description: `Every BestCitiesInFrance guide about "${label}": ${guides.length} honest reads to choose where to live in France.`,
    alternates: { canonical: `${EN_BASE}/tags/${slug}` },
  };
}

export default async function EnTagPage({ params }: Props) {
  const { slug } = await params;
  const label = getTagLabelEn(slug);
  if (!label) notFound();
  const guides = getGuidesForTagEn(slug);
  if (guides.length === 0) notFound();
  const related = getRelatedTagsEn(slug, 10);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${label} guides · BestCitiesInFrance`,
    url: `${EN_BASE}/tags/${slug}`,
    description: `${guides.length} BestCitiesInFrance guides about ${label}.`,
    inLanguage: "en",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: EN_BASE },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${EN_BASE}/guides` },
        { "@type": "ListItem", position: 3, name: "Tags", item: `${EN_BASE}/tags` },
        { "@type": "ListItem", position: 4, name: label, item: `${EN_BASE}/tags/${slug}` },
      ],
    },
    hasPart: guides.slice(0, 30).map((g) => ({
      "@type": "Article",
      headline: g.title,
      url: `${EN_BASE}/guides/${g.slug}`,
      datePublished: g.publishedAt,
      dateModified: g.updatedAt,
    })),
  };

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-4">
            <Link href="/" className="hover:text-[var(--text-secondary)]">Home</Link>
            <span>/</span>
            <Link href="/guides" className="hover:text-[var(--text-secondary)]">Guides</Link>
            <span>/</span>
            <Link href="/tags" className="hover:text-[var(--text-secondary)]">Tags</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">{label}</span>
          </nav>
          <Badge variant="accent" className="mb-3">Tag</Badge>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">{label}</h1>
          <p className="text-[var(--text-secondary)]">
            {guides.length} guide{guides.length > 1 ? "s" : ""} with this tag.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 gap-4">
          {guides.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 hover:border-[var(--accent)] transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{g.emoji}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]">
                  {EN_GUIDE_CATEGORIES[g.category]}
                </span>
              </div>
              <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug group-hover:text-[var(--accent)] transition-colors">
                {g.title}
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-2">{g.readMinutes} min</p>
            </Link>
          ))}
        </div>

        {related.length > 0 && (
          <section className="mt-12 pt-8 border-t border-[var(--border)]">
            <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-4">
              Related tags
            </p>
            <div className="flex flex-wrap gap-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/tags/${r.slug}`}
                  className="group inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-sm hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-colors"
                >
                  <span className="text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {r.label}
                  </span>
                  <span className="text-xs font-mono-data text-[var(--text-tertiary)]">{r.count}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/tags"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            ← All tags
          </Link>
          <Link
            href="/guides"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            All guides →
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
