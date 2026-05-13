import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { GUIDE_CATEGORIES } from "@/data/guides";
import { TAG_SLUGS, getTagLabel, getGuidesForTag } from "@/lib/guide-tags";

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
    title: `${label} — ${guides.length} guides MeilleurVille`,
    description: `Tous les guides MeilleurVille traitant de « ${label} » : ${guides.length} analyses honnêtes pour choisir où vivre en France.`,
    alternates: { canonical: `/tags/${slug}` },
  };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const label = getTagLabel(slug);
  if (!label) notFound();
  const guides = getGuidesForTag(slug);
  if (guides.length === 0) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://meilleurville.fr";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Guides ${label} — MeilleurVille`,
    url: `${baseUrl}/tags/${slug}`,
    description: `${guides.length} guides MeilleurVille traitant de ${label}.`,
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

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
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
          <Badge variant="accent" className="mb-3">Tag</Badge>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">{label}</h1>
          <p className="text-[var(--text-secondary)]">
            {guides.length} guide{guides.length > 1 ? "s" : ""} avec ce tag.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 gap-4">
          {guides.map((g) => {
            const cat = GUIDE_CATEGORIES.find((c) => c.id === g.category);
            return (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 hover:border-[var(--accent)] transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{g.emoji}</span>
                  {cat && (
                    <span className={`text-[10px] font-semibold uppercase tracking-wide ${cat.color}`}>
                      {cat.label}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug group-hover:text-[var(--accent)] transition-colors">
                  {g.title}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-2">{g.readMinutes} min</p>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/tags"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            ← Tous les tags
          </Link>
          <Link
            href="/guides"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Tous les guides →
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
