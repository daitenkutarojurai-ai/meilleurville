import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GuideCard } from "@/components/GuideCard";
import { Badge } from "@/components/ui/Badge";
import { GUIDES, GUIDE_CATEGORIES } from "@/data/guides";
import { CITIES_SEED } from "@/data/cities-seed";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) return {};
  return {
    title: guide.metaTitle,
    description: guide.metaDesc,
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDesc,
      type: "article",
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) notFound();

  const relatedGuides = GUIDES.filter((g) => guide.relatedGuides.includes(g.slug));
  const relatedCities = CITIES_SEED.filter((c) => guide.relatedCities.includes(c.slug));
  const catMeta = GUIDE_CATEGORIES.find((c) => c.id === guide.category);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://meilleurville.fr";
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.intro,
    url: `${baseUrl}/guides/${guide.slug}`,
    dateModified: guide.updatedAt,
    author: { "@type": "Organization", name: "MeilleurVille" },
    publisher: {
      "@type": "Organization",
      name: "MeilleurVille",
      url: baseUrl,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "MeilleurVille", item: baseUrl },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${baseUrl}/guides` },
        { "@type": "ListItem", position: 3, name: guide.title, item: `${baseUrl}/guides/${guide.slug}` },
      ],
    },
  };

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <Navbar />

      {/* Article header */}
      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-5">
            <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/guides" className="hover:text-[var(--text-secondary)] transition-colors">Guides</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)] truncate">{guide.title}</span>
          </nav>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center text-3xl flex-shrink-0">
              {guide.emoji}
            </div>
            <div>
              {catMeta && (
                <span className={`text-xs font-semibold uppercase tracking-wide ${catMeta.color}`}>
                  {catMeta.label}
                </span>
              )}
              <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                {guide.readMinutes} min · Mis à jour le{" "}
                {new Date(guide.updatedAt).toLocaleDateString("fr-FR", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-4 leading-snug">
            {guide.title}
          </h1>
          <p className="text-[var(--text-secondary)] leading-relaxed text-base">
            {guide.intro}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main article */}
          <article className="flex-1 min-w-0">
            {/* Table of contents */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 mb-8">
              <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-3">
                Table des matières
              </p>
              <ol className="space-y-2">
                {guide.sections.map((s, i) => (
                  <li key={i}>
                    <a
                      href={`#section-${i}`}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors flex items-start gap-2"
                    >
                      <span className="text-[var(--text-tertiary)] font-mono text-xs mt-0.5 flex-shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </div>

            {/* Sections */}
            <div className="space-y-10">
              {guide.sections.map((section, i) => (
                <section key={i} id={`section-${i}`}>
                  <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 scroll-mt-20">
                    <span className="text-[var(--text-tertiary)] font-mono text-sm mr-2">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {section.heading}
                  </h2>
                  <p className="text-[var(--text-secondary)] leading-relaxed text-base">
                    {section.body}
                  </p>
                </section>
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-[var(--border)]">
              {guide.tags.map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)]">
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA after article */}
            <div className="mt-10 rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-6">
              <p className="font-semibold text-[var(--text-primary)] mb-1">
                Trouvez votre ville en 3 minutes
              </p>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Notre quiz IA analyse vos priorités et vous recommande les villes faites pour vous.
              </p>
              <Link
                href="/quiz"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] text-white font-semibold px-5 py-2.5 text-sm hover:opacity-90 transition-opacity"
              >
                ✨ Faire le quiz
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
            {/* Related cities */}
            {relatedCities.length > 0 && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-3">
                  Villes mentionnées
                </p>
                <div className="space-y-2">
                  {relatedCities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/villes/${city.slug}`}
                      className="flex items-center justify-between group rounded-lg hover:bg-[var(--bg-elevated)] px-2 py-1.5 transition-colors"
                    >
                      <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                        {city.name}
                      </span>
                      <span className="text-xs font-bold font-mono-data text-[var(--accent)]">
                        {city.scores.global.toFixed(1)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Comparator CTA */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
              <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-2">
                Comparer ces villes
              </p>
              <p className="text-xs text-[var(--text-secondary)] mb-3">
                Analysez les critères côte à côte avec notre comparateur.
              </p>
              <Link
                href="/comparer"
                className="block text-center text-xs font-semibold text-[var(--accent)] border border-[var(--accent)]/30 rounded-lg py-2 hover:bg-[var(--accent)]/5 transition-colors"
              >
                Ouvrir le comparateur →
              </Link>
            </div>

            {/* Related guides */}
            {relatedGuides.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-3">
                  Guides associés
                </p>
                <div className="space-y-3">
                  {relatedGuides.map((g) => (
                    <GuideCard key={g.slug} guide={g} />
                  ))}
                </div>
              </div>
            )}

            {/* Pro CTA */}
            <div className="rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-5">
              <p className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-2">Pro</p>
              <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                Rapport IA personnalisé
              </p>
              <p className="text-xs text-[var(--text-secondary)] mb-3">
                Obtenez un PDF sur mesure avec analyse de compatibilité, budget, Red Flags et checklist déménagement.
              </p>
              <Link
                href="/premium"
                className="block text-center text-xs font-semibold bg-[var(--accent)] text-white rounded-lg py-2 hover:opacity-90 transition-opacity"
              >
                Essai 7j gratuit →
              </Link>
            </div>

            {/* All guides link */}
            <Link
              href="/guides"
              className="flex items-center justify-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] rounded-xl py-3 transition-colors"
            >
              ← Tous les guides
            </Link>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );
}
