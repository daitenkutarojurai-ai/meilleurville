import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ORIGIN_SLUGS, getOriginCity } from "@/lib/city-commute";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Week-end depuis votre ville · Destinations accessibles en train 2026",
  description:
    "Choisissez votre ville de départ et découvrez toutes les destinations françaises classées par temps de trajet. Idéal pour planifier un week-end ou une escapade.",
  alternates: { canonical: "/depuis" },
  openGraph: {
    title: "Week-end depuis votre ville · Destinations France 2026",
    description:
      "26 grandes villes françaises, toutes leurs destinations à moins de 5h. Estimations SNCF + accès local.",
  },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Depuis votre ville", path: "/depuis" },
]);

export default function DepuisIndexPage() {
  const origins = ORIGIN_SLUGS.map((slug) => getOriginCity(slug)).filter(Boolean);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link>
          <span className="mx-1">›</span>
          <span>Depuis votre ville</span>
        </nav>

        <div className="flex flex-wrap items-baseline gap-3 mb-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            Où partir en week-end depuis votre ville ?
          </h1>
        </div>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Sélectionnez votre ville de départ. Pour chaque destination, on estime le temps de trajet
          le plus rapide (TGV direct, via Paris ou route). Toutes les villes françaises, classées
          par proximité.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>26 villes de départ</Badge>
          <Badge>540 destinations</Badge>
          <Badge>Estimations SNCF + accès local</Badge>
        </div>

        <div className="mt-8">
          <Link href="/depuis-paris" className="block mb-3">
            <Card className="hover:border-[var(--accent)]/40 cursor-pointer transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🗼</span>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">Paris</p>
                    <p className="text-xs text-[var(--text-secondary)]">Île-de-France</p>
                  </div>
                </div>
                <span className="text-xs text-[var(--accent)] underline">Voir les destinations →</span>
              </div>
            </Card>
          </Link>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {origins.map((city) => {
              if (!city) return null;
              return (
                <Link key={city.slug} href={`/depuis/${city.slug}`} className="block">
                  <Card className="hover:border-[var(--accent)]/40 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">{city.name}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{city.region ?? "—"}</p>
                      </div>
                      <span className="text-xs text-[var(--accent)] underline">Voir →</span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        <p className="mt-8 text-xs text-[var(--text-tertiary)]">
          Les temps de trajet sont des estimations basées sur les horaires SNCF publiés (oui.sncf, juin 2025)
          pour les gares principales, et sur une heuristique d'accès local (0,5 min/km) pour les villes
          intermédiaires. Modes retenus : TGV direct, via Paris ou voiture — selon ce qui est le plus rapide.
        </p>
      </section>

      <Footer />
    </main>
  );
}
