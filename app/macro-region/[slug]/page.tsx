import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MACRO_REGIONS, getMacroRegion } from "@/lib/macro-regions";
import { rankInMacroRegion } from "@/lib/macro-regions-rankings";
import { scoreColor } from "@/lib/utils";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

// ISR Reads optimization: pure SSG (no Vercel Data Cache layer).
// revalidate=false → page built once at deploy, served from static edge cache.
export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return MACRO_REGIONS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const macro = getMacroRegion(slug);
  if (!macro) return {};
  return {
    title: macro.metaTitle,
    description: macro.metaDescription,
    alternates: { canonical: `/macro-region/${slug}` },
    openGraph: { title: macro.metaTitle, description: macro.metaDescription },
  };
}

export default async function MacroRegionPage({ params }: Props) {
  const { slug } = await params;
  const macro = getMacroRegion(slug);
  if (!macro) notFound();

  const top = rankInMacroRegion(macro, 30);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Macro-régions", path: "/macro-region" },
    { name: macro.label, path: `/macro-region/${slug}` },
  ]);
  const others = MACRO_REGIONS.filter((m) => m.slug !== slug);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: macro.metaTitle,
            description: macro.metaDescription,
            itemListElement: top.slice(0, 10).map((city, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: city.name,
              url: `${BASE_URL}/villes/${city.slug}`,
            })),
          }),
        }}
      />
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">
            <Link href="/macro-region" className="hover:underline">
              ← Toutes les macro-régions
            </Link>
          </Badge>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl" aria-hidden>
              {macro.emoji}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              {macro.label}
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed">{macro.intro}</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
        {/* Top */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Top {top.length} villes — {macro.label}
          </h2>
          <ol className="space-y-2">
            {top.map((city, i) => (
              <li key={city.slug}>
                <Link
                  href={`/villes/${city.slug}`}
                  className="flex items-baseline justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 hover:border-[var(--accent)]/40 transition-all"
                >
                  <span className="flex items-baseline gap-3 min-w-0">
                    <span className="font-mono-data text-sm text-[var(--text-tertiary)] w-8 flex-shrink-0">
                      #{i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="font-semibold text-[var(--text-primary)] block truncate">
                        {city.name}
                      </span>
                      <span className="text-xs text-[var(--text-tertiary)] truncate">
                        {city.department} · {city.region}
                      </span>
                    </span>
                  </span>
                  <span className={`font-mono-data font-bold ${scoreColor(city.scores.global)} flex-shrink-0`}>
                    {city.scores.global.toFixed(1)}
                    <span className="text-xs text-[var(--text-tertiary)]"> /10</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Départements inclus
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {macro.departments.map((d) => (
              <span
                key={d}
                className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]"
              >
                {d}
              </span>
            ))}
          </div>
        </Card>

        <section>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">
            Autres macro-régions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {others.map((m) => (
              <Link
                key={m.slug}
                href={`/macro-region/${m.slug}`}
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm hover:border-[var(--accent)]/40 transition-colors"
              >
                <span className="text-xl" aria-hidden>
                  {m.emoji}
                </span>
                <span className="text-[var(--text-primary)]">{m.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
