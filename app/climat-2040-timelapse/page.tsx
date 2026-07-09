import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { TimelapseClient } from "./TimelapseClient";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_LIGHT_METRO } from "@/lib/cities-light";

export const revalidate = false;
export const dynamicParams = false;

export const metadata: Metadata = {
  title: "Climat 2040 timelapse — France année par année",
  description:
    "Faites défiler les années 2026 → 2040 et regardez la France se réchauffer en direct. Projection ARPEGE / GIEC interpolée par macro-région, sur 540 villes.",
  alternates: { canonical: "/climat-2040-timelapse" },
  openGraph: {
    title: "Climat 2040 timelapse",
    description: "France année par année, 2026 → 2040.",
  },
};

export default function Climat2040TimelapsePage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Climat 2040 timelapse", path: "/climat-2040-timelapse" },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="border-b border-[var(--border)] bg-[var(--bg-surface)] py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">Visualisation climat</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Climat 2040 — France en accéléré
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            Glissez le curseur, appuyez sur lecture : chaque ville passe du bleu
            au rouge à mesure qu&apos;on avance dans le temps. Choisissez la métrique
            qui vous parle — température moyenne juillet, jours caniculaires, ou
            nuits tropicales.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <TimelapseClient cities={CITIES_LIGHT_METRO} />

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">À lire aussi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/red-flags/villes-climat-2040-deteriore" className="block">
              <Card className="hover:border-[var(--accent)]/40 cursor-pointer transition-colors h-full">
                <div className="text-2xl mb-1">🌡️</div>
                <p className="font-semibold text-[var(--text-primary)]">
                  Villes au climat 2040 le plus dégradé
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Le classement des villes ≥ 15 000 hab. dont juillet, jours &gt; 30 °C et
                  nuits tropicales projetées cumulent le plus.
                </p>
              </Card>
            </Link>
            <Link href="/red-flags/villes-erosion-cotiere" className="block">
              <Card className="hover:border-[var(--accent)]/40 cursor-pointer transition-colors h-full">
                <div className="text-2xl mb-1">🌊</div>
                <p className="font-semibold text-[var(--text-primary)]">
                  Villes en péril côtier — érosion & submersion
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  L&apos;autre versant de la projection ARPEGE : élévation du niveau marin
                  GIEC AR6, recul du trait de côte BRGM sur la façade atlantique et méditerranéenne.
                </p>
              </Card>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
