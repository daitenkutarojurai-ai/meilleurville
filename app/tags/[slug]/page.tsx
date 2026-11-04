import { Metadata } from "next";
import Link from "@/components/AppLink";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import { GUIDE_CATEGORIES } from "@/data/guides";
import { TAG_SLUGS, getTagLabel, getGuidesForTag, getRelatedTags } from "@/lib/guide-tags";
import { fitTitle } from "@/lib/brand";

// ISR Reads optimization: pure SSG (no Vercel Data Cache layer).
// revalidate=false → page built once at deploy, served from static edge cache.
export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return TAG_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const label = getTagLabel(slug);
  if (!label) return {};
  const guides = getGuidesForTag(slug);
  return {
    title: fitTitle(`${label} · ${guides.length} guides`),
    description: `Tous les guides MaVilleIdéale traitant de « ${label} » : ${guides.length} analyses honnêtes pour choisir où vivre en France.`,
    alternates: { canonical: `/tags/${slug}` },
  };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const label = getTagLabel(slug);
  if (!label) notFound();
  const guides = getGuidesForTag(slug);
  if (guides.length === 0) notFound();
  const related = getRelatedTags(slug, 10);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Guides ${label} · MaVilleIdéale`,
    url: `${baseUrl}/tags/${slug}`,
    description: `${guides.length} guides MaVilleIdéale traitant de ${label}.`,
    inLanguage: "fr-FR",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: baseUrl },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${baseUrl}/guides` },
        { "@type": "ListItem", position: 3, name: "Tags", item: `${baseUrl}/tags` },
        { "@type": "ListItem", position: 4, name: label, item: `${baseUrl}/tags/${slug}` },
      ],
    },
    hasPart: guides.slice(0, 30).map((g) => ({
      "@type": "Article",
      headline: g.title,
      url: `${baseUrl}/guides/${g.slug}`,
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

      <section className="relative overflow-hidden bg-aurora pt-12 pb-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-4">
            <Link href="/" className="hover:text-[var(--text-secondary)]">Accueil</Link>
            <span>/</span>
            <Link href="/guides" className="hover:text-[var(--text-secondary)]">Guides</Link>
            <span>/</span>
            <Link href="/tags" className="hover:text-[var(--text-secondary)]">Tags</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">{label}</span>
          </nav>
          <div className="mb-3 flex items-center gap-3">
            <EmojiBadge emoji="🏷️" tone={toneFor(slug)} />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              <span className="gradient-text">{label}</span>
            </h1>
          </div>
          <p className="text-[var(--text-secondary)]">
            {guides.length} guide{guides.length > 1 ? "s" : ""} avec ce tag.
          </p>
        </div>
      </section>

      {/* Guides — bande indigo */}
      <section className="band band-indigo py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 gap-4">
          {guides.map((g) => {
            const cat = GUIDE_CATEGORIES.find((c) => c.id === g.category);
            return (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group flex h-full flex-col rounded-2xl bg-white p-5 shadow-[0_10px_24px_-18px_rgba(79,70,229,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-16px_rgba(79,70,229,0.6)]"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <EmojiBadge emoji={g.emoji} tone={toneFor(g.slug)} size="sm" />
                  {cat && (
                    <span className={`text-[10px] font-semibold uppercase tracking-wide ${cat.color}`}>
                      {cat.label}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug group-hover:text-[#4338CA] transition-colors">
                  {g.title}
                </p>
                <p className="mt-auto pt-3 text-xs font-medium text-[#6366F1]">{g.readMinutes} min</p>
              </Link>
            );
          })}
        </div>
        </div>
      </section>

      {/* Tags liés + renvois — bande rose */}
      <section className="band band-pink py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {related.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-bold">
              <span className="gradient-text">Tags liés</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/tags/${r.slug}`}
                  className="group inline-flex items-center gap-2 rounded-full bg-white py-1.5 pl-3.5 pr-1.5 text-sm shadow-[0_8px_20px_-16px_rgba(79,70,229,0.7)] ring-1 ring-[#C7D2FE] transition hover:-translate-y-0.5 hover:ring-[#4F46E5]"
                >
                  <span className="font-medium text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors">
                    {r.label}
                  </span>
                  <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-xs font-semibold font-mono-data text-[#4338CA] group-hover:bg-gradient-to-r group-hover:from-[#4F46E5] group-hover:to-[#DB2777] group-hover:text-white">{r.count}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link
            href="/tags"
            className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#4338CA] ring-1 ring-[#C7D2FE] transition hover:ring-[#4F46E5]"
          >
            ← Tous les tags
          </Link>
          <Link
            href="/guides"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-[#4F46E5] to-[#DB2777] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-14px_rgba(79,70,229,0.7)] transition hover:opacity-95"
          >
            Tous les guides →
          </Link>
        </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
