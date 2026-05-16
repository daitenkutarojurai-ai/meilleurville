import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { WidgetGenerator } from "@/components/WidgetGenerator";
import { CITIES_SEED } from "@/data/cities-seed";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Widget MeilleurVille — Intégrer un badge ville 2026 (gratuit)",
  description:
    "Générez un widget gratuit < 10 KB à intégrer sur votre site (agence immo, blog, marketplace) : badge score ville, top 3 critères, comparatif 2 villes. Backlink dofollow inclus.",
  alternates: { canonical: "/widget" },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Widget", path: "/widget" },
]);

export default function WidgetGeneratorPage() {
  // Pass a lean list to client component — slug + name only to keep bundle small.
  const cities = CITIES_SEED.map((c) => ({ slug: c.slug, name: c.name, region: c.region ?? "" }))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));

  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <AmbientBackground />
      <Navbar />

      <section className="pt-20 pb-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <Badge variant="accent" className="mb-3">
            🧩 Widget gratuit
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight leading-[1.1]">
            Intégrez un badge ville sur votre site
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            iframe sécurisée, &lt; 10 KB, sans tracking. 3 formats : badge score global,
            top 3 critères, comparatif 2 villes. Le lien « Source : MeilleurVille » est
            obligatoire et fait office de backlink dofollow.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <WidgetGenerator cities={cities} />
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-16 space-y-4">
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">
            Conditions d&apos;utilisation
          </h2>
          <ul className="text-sm text-[var(--text-secondary)] space-y-2">
            <li>✅ <strong>Gratuit</strong> à vie pour tout site éditorial, blog, agence immo ou outil indépendant.</li>
            <li>✅ <strong>Pas de tracking</strong>, pas de cookies, pas d&apos;analytics tiers dans l&apos;iframe.</li>
            <li>✅ <strong>Backlink dofollow</strong> obligatoire vers la fiche ville ou le comparatif — c&apos;est la contrepartie.</li>
            <li>✅ <strong>Open Graph correct</strong> côté MeilleurVille : la fiche cible a une OG image dédiée.</li>
            <li>⚠️ Pas d&apos;usage commercial qui revend les scores comme votre data propre.</li>
            <li>⚠️ Pas de modification de l&apos;HTML/CSS de l&apos;iframe — sinon le widget peut être désactivé.</li>
          </ul>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Pourquoi un widget ?
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Vous présentez des biens immobiliers sur 200 communes ? Un score ville
            attaché à chaque annonce booste la confiance (et le SEO si vos pages
            sont indexées). Le widget reste statique côté serveur — pas de
            tracking, pas de risque GDPR à intégrer.
          </p>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
