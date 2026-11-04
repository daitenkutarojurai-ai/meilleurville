import { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge } from "@/components/EmojiBadge";
import { getAllTagsWithCountsEn } from "@/lib/guide-tags-en";
import { EN_GUIDES } from "@/data/guides-en";
import { pathAlternatesEn } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const metadata: Metadata = {
  title: "All tags · Thematic index of the guides | BestCitiesInFrance",
  description:
    "Complete index of BestCitiesInFrance tags. Browse the guides by theme: remote work, moving, housing, city by city, climate, mobility...",
  alternates: pathAlternatesEn("/tags", "/tags"),
};

export default function EnTagsIndexPage() {
  const tags = getAllTagsWithCountsEn();

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="relative overflow-hidden bg-aurora pt-12 pb-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-4">
            <Link href="/" className="hover:text-[var(--text-secondary)]">Home</Link>
            <span>/</span>
            <Link href="/guides" className="hover:text-[var(--text-secondary)]">Guides</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">Tags</span>
          </nav>
          <div className="mb-3 flex items-center gap-3">
            <EmojiBadge emoji="🏷️" tone="indigo" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              <span className="gradient-text">All tags</span>
            </h1>
          </div>
          <p className="text-[var(--text-secondary)]">
            {tags.length} themes to navigate the {EN_GUIDES.length} guides. Sorted by frequency.
          </p>
        </div>
      </section>

      {/* Nuage de tags — bande indigo */}
      <section className="band band-indigo py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="flex flex-wrap gap-2.5">
          {tags.map((t) => (
            <Link
              key={t.slug}
              href={`/tags/${t.slug}`}
              className="group inline-flex items-center gap-2 rounded-full bg-white py-1.5 pl-3.5 pr-1.5 text-sm shadow-[0_8px_20px_-16px_rgba(79,70,229,0.7)] ring-1 ring-[#C7D2FE] transition hover:-translate-y-0.5 hover:ring-[#4F46E5]"
            >
              <span className="font-medium text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors">
                {t.label}
              </span>
              <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-xs font-semibold font-mono-data text-[#4338CA] group-hover:bg-gradient-to-r group-hover:from-[#4F46E5] group-hover:to-[#DB2777] group-hover:text-white">{t.count}</span>
            </Link>
          ))}
        </div>
        </div>
      </section>

      {/* Renvoi — bande rose */}
      <section className="band band-pink py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 flex flex-wrap gap-3">
          <Link
            href="/guides"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-[#4F46E5] to-[#DB2777] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-14px_rgba(79,70,229,0.7)] transition hover:opacity-95"
          >
            ← All guides
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
