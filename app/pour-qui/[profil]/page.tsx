import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  PROFILE_PAGES,
  getProfile,
  rankByProfile,
} from "@/lib/profile-pages";
import { CITIES_LIGHT } from "@/lib/cities-light";
import { scoreColor } from "@/lib/utils";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";

// ISR Reads optimization: pure SSG (no Vercel Data Cache layer).
// revalidate=false → page built once at deploy, served from static edge cache.
export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ profil: string }> };

export function generateStaticParams() {
  return PROFILE_PAGES.map((p) => ({ profil: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { profil } = await params;
  const p = getProfile(profil);
  if (!p) return {};
  return {
    title: p.metaTitle,
    description: p.metaDescription,
    alternates: { canonical: `/pour-qui/${profil}` },
    openGraph: { title: p.metaTitle, description: p.metaDescription },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { profil } = await params;
  const profile = getProfile(profil);
  if (!profile) notFound();

  const top = rankByProfile(profile, CITIES_LIGHT, 20);
  const others = PROFILE_PAGES.filter((p) => p.slug !== profile.slug);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Pour qui", path: "/pour-qui" },
    { name: profile.label, path: `/pour-qui/${profil}` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: profile.metaTitle,
            description: profile.metaDescription,
            itemListElement: top.slice(0, 10).map((row, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: row.city.name,
              url: `${BASE_URL}/villes/${row.city.slug}`,
            })),
          }),
        }}
      />
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">
            <Link href="/pour-qui" className="hover:underline">
              ← Tous les profils
            </Link>
          </Badge>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl" aria-hidden>
              {profile.emoji}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              Pour {profile.label.toLowerCase()}
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed">{profile.intro}</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
        {/* Top 20 */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Top 20 villes — {profile.label}
          </h2>
          <ol className="space-y-2">
            {top.map((row, i) => (
              <li key={row.city.slug}>
                <Link
                  href={`/villes/${row.city.slug}`}
                  className="flex items-baseline justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 hover:border-[var(--accent)]/40 transition-all"
                >
                  <span className="flex items-baseline gap-3 min-w-0">
                    <span className="font-mono-data text-sm text-[var(--text-tertiary)] w-8 flex-shrink-0">
                      #{i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="font-semibold text-[var(--text-primary)] block truncate">
                        {row.city.name}
                      </span>
                      <span className="text-xs text-[var(--text-tertiary)] truncate">
                        {row.city.region} · {row.reason}
                      </span>
                    </span>
                  </span>
                  <span className="flex-shrink-0">
                    <span className={`font-mono-data font-bold ${scoreColor(row.score)}`}>
                      {row.score.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-[var(--text-tertiary)]"> /10</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* Methodology */}
        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Pondération</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
            Score = moyenne pondérée des axes ci-dessous, sur les {CITIES_COUNT} villes du site.
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {Object.entries(profile.weights).map(([key, w]) => (
              <li key={key} className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]">
                {key} × {w}
              </li>
            ))}
          </ul>
        </Card>

        {/* Other profiles */}
        <section>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">
            Autres profils
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {others.map((p) => (
              <Link
                key={p.slug}
                href={`/pour-qui/${p.slug}`}
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm hover:border-[var(--accent)]/40 transition-colors"
              >
                <span className="text-xl" aria-hidden>
                  {p.emoji}
                </span>
                <span className="text-[var(--text-primary)]">{p.label}</span>
              </Link>
            ))}
          </div>
        </section>

        <p className="text-xs text-[var(--text-tertiary)] text-center">
          Pour un matching personnalisé combinant tous les critères, faites le{" "}
          <Link href="/quiz-compatibilite" className="underline">
            quiz de compatibilité
          </Link>
          .
        </p>
      </div>

      <Footer />
    </main>
  );
}
