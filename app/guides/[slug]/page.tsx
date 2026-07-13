import { Metadata } from "next";
import { Clock, ListOrdered, MapPin, CalendarDays } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { GrainOverlay } from "@/components/effects/GrainOverlay";
import { cn } from "@/lib/utils";
import { CityPhotoBand } from "@/components/CityPhoto";
import { guideCityPhoto } from "@/lib/city-images";
import { Footer } from "@/components/Footer";
import { GuideCard } from "@/components/GuideCard";
import { CommentSection } from "@/components/CommentSection";
import { GUIDES, GUIDE_CATEGORIES } from "@/data/guides";
import { CITIES_SEED } from "@/data/cities-seed";
import { renderRich, stripMd } from "@/lib/link-cities";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { suggestNextGuides } from "@/lib/guide-suggestions";
import { slugifyTag, TAG_SLUGS } from "@/lib/guide-tags";
import { GuidePoiCard } from "@/components/GuidePoiCard";
import { guidePois } from "@/lib/guide-pois";
import { ReadingProgress } from "@/components/ReadingProgress";

// ISR Reads optimization: pure SSG (no Vercel Data Cache layer).
// revalidate=false → page built once at deploy, served from static edge cache.
export const revalidate = false;
export const dynamicParams = false;

// Build-time freshness reference — captured once at module load so render is
// pure (no Date.now() inside the component body, which the React 19 linter flags).
const BUILD_NOW = Date.now();

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
    alternates: { canonical: `/guides/${slug}` },
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
  const nextGuides = suggestNextGuides(guide, 3);

  // Prev/next siblings within the same category, ordered by publish date so
  // navigation feels editorial rather than alphabetical.
  const siblings = GUIDES.filter((g) => g.category === guide.category).sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
  );
  const idx = siblings.findIndex((g) => g.slug === guide.slug);
  const prevGuide = idx > 0 ? siblings[idx - 1] : null;
  const nextSibling = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const relatedCities = CITIES_SEED.filter((c) => guide.relatedCities.includes(c.slug));
  const hero = guideCityPhoto(guide.slug, guide.relatedCities);
  const pois = guidePois(guide.slug);
  const heroCityName = hero ? CITIES_SEED.find((c) => c.slug === hero.slug)?.name ?? hero.slug : null;
  const catMeta = GUIDE_CATEGORIES.find((c) => c.id === guide.category);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";
  const articleWordCount = guide.sections.reduce(
    (n, s) => n + (s.body?.match(/\S+/g)?.length ?? 0),
    (guide.intro?.match(/\S+/g)?.length ?? 0)
  );
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: stripMd(guide.intro),
    url: `${baseUrl}/guides/${guide.slug}`,
    image: [`${baseUrl}/guides/${guide.slug}/opengraph-image`],
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    inLanguage: "fr-FR",
    keywords: guide.tags?.join(", "),
    wordCount: articleWordCount,
    timeRequired: `PT${guide.readMinutes}M`,
    author: { "@type": "Organization", name: "MaVilleIdeal", url: baseUrl },
    publisher: {
      "@type": "Organization",
      name: "MaVilleIdeal",
      url: baseUrl,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "MaVilleIdeal", item: baseUrl },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${baseUrl}/guides` },
        { "@type": "ListItem", position: 3, name: guide.title, item: `${baseUrl}/guides/${guide.slug}` },
      ],
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.sections.map((s) => ({
      "@type": "Question",
      name: s.heading,
      acceptedAnswer: { "@type": "Answer", text: stripMd(s.body) },
    })),
  };

  return (
    <main id="main-content" className="min-h-screen">
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Navbar />

      {/* Article header */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--bg-surface)] py-12">
        {/* Ambient wash, tinted by the guide's category — the page was a flat
            white slab before, with nothing to anchor the eye above the fold. */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-aurora opacity-40" />
          <div className={cn("absolute -top-28 -right-24 h-80 w-80 rounded-full blur-[110px] opacity-30 animate-drift", catMeta?.glow ?? "bg-[var(--accent)]")} />
          <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-[var(--accent)]/12 blur-[100px] animate-drift" style={{ animationDelay: "2s" }} />
        </div>
        <GrainOverlay opacity={0.14} blend="overlay" />

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-5">
            <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/guides" className="hover:text-[var(--text-secondary)] transition-colors">Guides</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)] truncate">{guide.title}</span>
          </nav>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-white/50 glass text-3xl shadow-lg">
              {guide.emoji}
            </div>
            {catMeta && (
              <Link
                href={`/guides?categorie=${catMeta.id}`}
                className={cn("rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors hover:brightness-110", catMeta.bg, catMeta.color)}
              >
                {catMeta.emoji} {catMeta.label}
              </Link>
            )}
          </div>

          <h1 className="mb-4 text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-[var(--text-primary)]">
            {guide.title}
          </h1>
          <p className="text-lg leading-relaxed text-[var(--text-secondary)]">
            {renderRich(guide.intro)}
          </p>

          {/* Glass facts strip — replaces the lone grey "7 min · Mis à jour le…" line */}
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Clock, value: `${guide.readMinutes} min`, label: "de lecture" },
              { icon: ListOrdered, value: String(guide.sections.length), label: "sections" },
              ...(relatedCities.length
                ? [{ icon: MapPin, value: String(relatedCities.length), label: relatedCities.length > 1 ? "villes citées" : "ville citée" }]
                : []),
              {
                icon: CalendarDays,
                value: new Date(guide.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
                label: `mis à jour ${new Date(guide.updatedAt).getFullYear()}`,
              },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="rounded-2xl border border-white/50 glass p-4">
                <Icon className={cn("mb-2 h-4 w-4", catMeta?.color ?? "text-[var(--accent)]")} aria-hidden />
                <div className="font-mono-data text-xl font-bold text-[var(--text-primary)]">{value}</div>
                <div className="text-xs text-[var(--text-secondary)]">{label}</div>
              </div>
            ))}
          </div>

          {hero && heroCityName && (
            <CityPhotoBand photo={hero.photo} cityName={heroCityName} className="mt-8" />
          )}
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main article */}
          <article className="flex-1 min-w-0">
            {/* Table of contents */}
            <div className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-sm">
              <p className={cn("mb-3 text-xs font-semibold uppercase tracking-widest", catMeta?.color ?? "text-[var(--text-tertiary)]")}>
                Table des matières
              </p>
              <ol className="space-y-2">
                {guide.sections.map((s, i) => (
                  <li key={i}>
                    <a
                      href={`#section-${i}`}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors flex items-start gap-2"
                    >
                      <span className={`font-mono text-xs mt-0.5 flex-shrink-0 ${catMeta?.color ?? "text-[var(--text-tertiary)]"}`}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </div>

            {/* Sections — each on its own raised card. As flat paragraphs on a
                white page, ten sections read as one undifferentiated wall. */}
            <div className="space-y-6">
              {guide.sections.map((section, i) => {
                const poi = pois?.[String(i)];
                return (
                  <section
                    key={i}
                    id={`section-${i}`}
                    className="scroll-mt-24 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-sm transition-shadow hover:shadow-md sm:p-7"
                  >
                    <h2 className="mb-4 flex items-baseline gap-3 text-lg font-bold text-[var(--text-primary)]">
                      <span
                        className={cn(
                          "flex-shrink-0 rounded-lg border px-2 py-0.5 font-mono-data text-xs",
                          catMeta?.bg ?? "border-[var(--border)] bg-[var(--bg-elevated)]",
                          catMeta?.color ?? "text-[var(--text-tertiary)]",
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{section.heading}</span>
                    </h2>
                    <p className="text-base leading-[1.75] text-[var(--text-secondary)]">
                      {renderRich(section.body, { linkify: true, excludeSlug: guide.relatedCities[0] })}
                    </p>
                    {poi && heroCityName && <GuidePoiCard poi={poi} cityName={heroCityName} />}
                  </section>
                );
              })}
            </div>

            <div className="mt-10">
              <FeedbackWidget />
            </div>

            {/* Tags — linked when the tag has a /tags/[slug] aggregate page */}
            <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-[var(--border)]">
              {guide.tags.map((tag) => {
                const tagSlug = slugifyTag(tag);
                const hasPage = TAG_SLUGS.includes(tagSlug);
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

            {/* Lire ensuite — auto-suggested by category + city + tag overlap */}
            {nextGuides.length > 0 && (
              <div className="mt-10">
                <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-4">
                  Lire ensuite
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  {nextGuides.map((g) => {
                    const cat = GUIDE_CATEGORIES.find((c) => c.id === g.category);
                    return (
                      <Link
                        key={g.slug}
                        href={`/guides/${g.slug}`}
                        className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:border-[var(--accent)] transition-colors"
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
                        <p className="text-xs text-[var(--text-tertiary)] mt-2">
                          {g.readMinutes} min
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Prev / next within category */}
            {(prevGuide || nextSibling) && (
              <nav aria-label="Navigation guides" className="mt-10 grid sm:grid-cols-2 gap-3">
                {prevGuide ? (
                  <Link
                    href={`/guides/${prevGuide.slug}`}
                    rel="prev"
                    className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:border-[var(--accent)] transition-colors"
                  >
                    <p className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-1">
                      ← Guide précédent
                    </p>
                    <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                      {prevGuide.emoji} {prevGuide.title}
                    </p>
                  </Link>
                ) : (
                  <div />
                )}
                {nextSibling && (
                  <Link
                    href={`/guides/${nextSibling.slug}`}
                    rel="next"
                    className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:border-[var(--accent)] transition-colors sm:text-right"
                  >
                    <p className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-1">
                      Guide suivant →
                    </p>
                    <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                      {nextSibling.emoji} {nextSibling.title}
                    </p>
                  </Link>
                )}
              </nav>
            )}

            {/* CTA after article */}
            <div className="mt-10 rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-6">
              <p className="font-semibold text-[var(--text-primary)] mb-1">
                Trouvez votre ville en 3 minutes
              </p>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Notre quiz IA analyse vos priorités et vous recommande les villes faites pour vous.
              </p>
              <Link
                href="/city-match"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] text-white font-semibold px-5 py-2.5 text-sm hover:opacity-90 transition-opacity"
              >
                ✨ Faire le quiz
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-6 lg:sticky lg:top-20 lg:self-start">
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

            {/* Compare pairs between related cities */}
            {relatedCities.length >= 2 && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-3">
                  Comparer ces villes
                </p>
                <div className="space-y-2">
                  {relatedCities.slice(0, 4).flatMap((cityA, i) =>
                    relatedCities.slice(i + 1, i + 3).map((cityB) => (
                      <Link
                        key={`${cityA.slug}-vs-${cityB.slug}`}
                        href={`/comparer/${cityA.slug}-vs-${cityB.slug}`}
                        className="flex items-center justify-between group rounded-lg hover:bg-[var(--bg-elevated)] px-2 py-1.5 transition-colors"
                      >
                        <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                          {cityA.name} vs {cityB.name}
                        </span>
                        <span className="text-xs text-[var(--accent)]">→</span>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Related guides */}
            {relatedGuides.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-3">
                  Guides associés
                </p>
                <div className="space-y-3">
                  {relatedGuides.map((g) => (
                    <GuideCard key={g.slug} guide={g} now={BUILD_NOW} />
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
                href="/city-match"
                className="block text-center text-xs font-semibold bg-[var(--accent)] text-white rounded-xl py-2 hover:bg-[var(--accent-hover)] transition-colors"
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

      <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        <CommentSection
          topic={`guide:${guide.slug}`}
          title="Vos retours sur ce guide"
          emptyHint="Une remarque, une question, un point que vous voulez ajouter ? Lancez la discussion."
        />
      </div>

      <Footer />
    </main>
  );
}
