import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { PeopleLikeYouClient } from "./PeopleLikeYouClient";
import { commonOriginSlugs } from "@/lib/people-like-you";
import { CITIES_SEED } from "@/data/cities-seed";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

export const revalidate = false;
export const dynamicParams = false;

export const metadata: Metadata = {
  title: "Les profils comme vous vont là — recommandations de destinations 2026",
  description:
    "Choisissez votre profil de vie (famille, freelance, retraité·e, jeune actif…) et votre ville actuelle : on calcule les destinations où des gens comme vous s'épanouissent davantage.",
  alternates: { canonical: "/people-like-you" },
  openGraph: {
    title: "People like you",
    description: "Persona × ville d'origine → top destinations.",
  },
};

export default function PeopleLikeYouPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "People like you", path: "/people-like-you" },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="border-b border-[var(--border)] bg-[var(--bg-surface)] py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">Profils types</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Les profils comme vous vont là
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            Sélectionnez votre profil de vie et la ville que vous envisagez de
            quitter : on calcule les destinations où des gens avec un profil
            similaire seraient mieux placés sur leurs priorités. Plus la barre
            verte est haute, plus le gain est sensible.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <PeopleLikeYouClient />
      </div>

      {/* SSG landing pages per departure city — readable without JS, indexable */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-14">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          Pages dédiées « quitter X » par ville de départ
        </h2>
        <div className="flex flex-wrap gap-2">
          {commonOriginSlugs(24).map((slug) => {
            const c = CITIES_SEED.find((x) => x.slug === slug);
            if (!c) return null;
            return (
              <Link
                key={slug}
                href={`/ou-vont-les-gens/${slug}`}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)] transition-all"
              >
                Quitter {c.name}
              </Link>
            );
          })}
        </div>
      </section>

      <Footer />
    </main>
  );
}
