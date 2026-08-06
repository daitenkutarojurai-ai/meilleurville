import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RANKING_META, getRankedCities, type RankingSlug } from "@/lib/rankings";
import { rankingEn } from "@/lib/rankings-en";
import { scoreColor } from "@/lib/utils";
import { ORIGIN_BY_LOCALE, hreflangLanguagesEn } from "@/lib/i18n";
import { jsonLdScript } from "@/lib/jsonld";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  // Cross-product locale × slug. Only EN is generated here (the parent
  // [locale] layout 404s anything other than "en").
  return Object.keys(RANKING_META).map((slug) => ({ locale: "en", slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!(slug in RANKING_META)) return {};
  const en = rankingEn(slug, RANKING_META[slug as RankingSlug]);
  return {
    title: en.headline,
    description: en.description,
    alternates: { canonical: `${EN_BASE}/rankings/${slug}`, languages: hreflangLanguagesEn(`/rankings/${slug}`) },
    openGraph: { title: en.headline, description: en.description, images: ["/opengraph-image"] },
    twitter: { card: "summary_large_image" },
  };
}

export default async function EnRankingDetailPage({ params }: Props) {
  const { slug } = await params;
  if (!(slug in RANKING_META)) notFound();

  const meta = RANKING_META[slug as RankingSlug];
  const en = rankingEn(slug, meta);
  const ranked = getRankedCities(slug as RankingSlug);
  const top30 = ranked.slice(0, 30);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: en.headline,
        url: `${EN_BASE}/rankings/${slug}`,
        numberOfItems: ranked.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: top30.slice(0, 25).map((r, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: r.city.name,
          url: `${EN_BASE}/cities/${r.city.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: EN_BASE },
          { "@type": "ListItem", position: 2, name: "Rankings", item: `${EN_BASE}/rankings` },
          { "@type": "ListItem", position: 3, name: en.label, item: `${EN_BASE}/rankings/${slug}` },
        ],
      },
    ],
  };

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(itemListJsonLd)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-16 pb-8">
        <nav className="mb-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          {" · "}
          <Link href="/rankings" className="hover:text-[var(--accent)]">Rankings</Link>
          {" · "}
          <span>{en.label}</span>
        </nav>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-5xl" aria-hidden>{meta.emoji}</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-tight">
            {en.headline}
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg max-w-3xl">
          {en.description}
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">
          Top {top30.length} · {en.label}
        </h2>
        <ol className="space-y-2">
          {top30.map((r) => (
            <li key={r.city.slug}>
              <Link
                href={`/cities/${r.city.slug}`}
                className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 transition-all hover:border-[var(--accent)]/40 hover:shadow-lg"
              >
                <span className="font-mono-data text-xl font-bold w-10 text-[var(--text-tertiary)]">
                  #{r.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[var(--text-primary)] truncate">{r.city.name}</h3>
                  <p className="text-xs text-[var(--text-secondary)] truncate">
                    {r.city.region ?? ""}{r.city.department ? ` · ${r.city.department}` : ""}
                  </p>
                </div>
                <span
                  className={`font-mono-data font-bold text-2xl ${scoreColor(r.score)}`}
                  aria-label={`Score ${r.score} out of 10`}
                >
                  {r.score.toFixed(1)}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
          <h2 className="text-lg font-bold mb-3 text-[var(--text-primary)]">Methodology</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{en.methodology}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
          <h2 className="text-lg font-bold mb-3 text-[var(--text-primary)]">What we look at</h2>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            {en.why.map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden className="text-[var(--accent)]">·</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </main>
  );
}
