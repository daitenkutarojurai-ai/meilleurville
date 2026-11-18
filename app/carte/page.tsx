import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { CITIES_LIGHT, LEAN_META, RENT_T2_BY_SLUG } from "@/lib/cities-light";
import { CarteClient } from "./CarteClient";
import { EmojiBadge } from "@/components/EmojiBadge";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { hubTitle } from "@/lib/brand";
import { pathAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: hubTitle("Carte des villes · Qualité de vie"),
  description:
    `Carte interactive des meilleures villes de France : visualisez les scores de qualité de vie, coût de la vie, nature, sécurité sur une carte. ${CITIES_SEED.length}+ villes.`,
  alternates: pathAlternates("/carte", "/map"),
};

const carteBreadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Carte", path: "/carte" },
]);

export default function CartePage() {
  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(carteBreadcrumb)} />
      <Navbar />

      <section className="relative overflow-hidden bg-aurora py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <EmojiBadge emoji="🗺️" tone="indigo" size="lg" className="shrink-0 shadow-[0_12px_28px_-12px_rgba(79,70,229,0.6)]" />
            <div className="min-w-0">
              <Badge variant="accent" className="mb-3">Carte interactive</Badge>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight gradient-text mb-3">
                Carte des villes françaises
              </h1>
              <p className="text-[var(--text-secondary)] max-w-2xl">
                {CITIES_SEED.length} villes visualisées par score. La taille et la couleur de chaque point reflètent le critère sélectionné.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="band band-sky">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <CarteClient cities={CITIES_LIGHT} rentT2BySlug={RENT_T2_BY_SLUG} leanMeta={LEAN_META} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
