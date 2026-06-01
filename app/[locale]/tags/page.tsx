import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { getAllTagsWithCountsEn } from "@/lib/guide-tags-en";
import { EN_GUIDES } from "@/data/guides-en";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const metadata: Metadata = {
  title: "All tags · Thematic index of the guides | BestCitiesInFrance",
  description:
    "Complete index of BestCitiesInFrance tags. Browse the guides by theme: remote work, moving, housing, city by city, climate, mobility...",
  alternates: { canonical: `${EN_BASE}/tags` },
};

export default function EnTagsIndexPage() {
  const tags = getAllTagsWithCountsEn();

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-4">
            <Link href="/" className="hover:text-[var(--text-secondary)]">Home</Link>
            <span>/</span>
            <Link href="/guides" className="hover:text-[var(--text-secondary)]">Guides</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">Tags</span>
          </nav>
          <Badge variant="accent" className="mb-3">Index</Badge>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">All tags</h1>
          <p className="text-[var(--text-secondary)]">
            {tags.length} themes to navigate the {EN_GUIDES.length} guides. Sorted by frequency.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <Link
              key={t.slug}
              href={`/tags/${t.slug}`}
              className="group inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-sm hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-colors"
            >
              <span className="text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                {t.label}
              </span>
              <span className="text-xs font-mono-data text-[var(--text-tertiary)]">{t.count}</span>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/guides"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            ← All guides
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
