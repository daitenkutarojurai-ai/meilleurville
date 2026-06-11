import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { PeopleLikeYouClient } from "@/app/people-like-you/PeopleLikeYouClient";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { CITIES_SEED } from "@/data/cities-seed";
import { CITIES_LIGHT } from "@/lib/cities-light";
import { commonOriginSlugs } from "@/lib/people-like-you";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

export const metadata: Metadata = {
  title: "People Like You — where profiles like yours are moving | BestCitiesInFrance",
  description:
    "11 lifestyle personas × 50 major French cities: see where people like you (family, freelance, retiree…) gain the most by relocating from your current city.",
  alternates: { canonical: `${EN_BASE}/people-like-you` },
  openGraph: {
    title: "People Like You · BestCitiesInFrance",
    description: "Your persona × your origin city → top relocation destinations.",
  },
};

export default function EnPeopleLikeYouPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "People Like You", path: "/people-like-you" },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="border-b border-[var(--border)] bg-[var(--bg-surface)] py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">Personas</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Where people like you are moving
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            Select your lifestyle profile and current city: we calculate where
            people sharing your priorities — budget, family, remote work,
            retirement — tend to gain the most by relocating.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <PeopleLikeYouClient cities={CITIES_LIGHT} locale="en" />
      </div>

      {/* SSG landing pages per departure city — readable without JS, indexable */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-14">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          Per-city &quot;leaving X&quot; landing pages
        </h2>
        <div className="flex flex-wrap gap-2">
          {commonOriginSlugs(CITIES_LIGHT, 24).map((slug) => {
            const c = CITIES_SEED.find((x) => x.slug === slug);
            if (!c) return null;
            return (
              <Link
                key={slug}
                href={`/leaving/${slug}`}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)] transition-all"
              >
                Leaving {c.name}
              </Link>
            );
          })}
        </div>
      </section>

      <Footer />
    </main>
  );
}
