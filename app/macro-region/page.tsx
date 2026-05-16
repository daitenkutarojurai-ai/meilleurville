import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MACRO_REGIONS, citiesInMacroRegion } from "@/lib/macro-regions";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Macro-régions françaises 2026 — Côte, arc, vallée par zone géographique",
  description:
    "6 macro-régions thématiques au-delà du découpage administratif : côte atlantique, arc méditerranéen, arc alpin, sud-ouest gascon, vallée du Rhône, Île-de-France élargie.",
  alternates: { canonical: "/macro-region" },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Macro-régions", path: "/macro-region" },
]);

export default function MacroRegionsIndex() {
  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <AmbientBackground />
      <Navbar />

      <section className="pt-20 pb-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <Badge variant="accent" className="mb-3">
            🗺️ Macro-régions
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
            Au-delà des régions administratives
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            6 macro-régions thématiques qui correspondent à des projets de vie réels :
            la côte atlantique, l&apos;arc méditerranéen, l&apos;arc alpin, le sud-ouest gascon,
            la vallée du Rhône, l&apos;Île-de-France élargie.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => {
            const count = citiesInMacroRegion(m).length;
            return (
              <Link key={m.slug} href={`/macro-region/${m.slug}`} className="block">
                <Card className="hover:border-[var(--accent)]/40 cursor-pointer transition-colors h-full">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl" aria-hidden>
                      {m.emoji}
                    </span>
                    <h2 className="text-base font-bold text-[var(--text-primary)]">{m.label}</h2>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-3 mb-2">{m.intro}</p>
                  <p className="text-[11px] text-[var(--text-tertiary)]">
                    {count} villes profilées · {m.departments.length} départements
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>

        <Card>
          <p className="text-sm text-[var(--text-secondary)]">
            Voir aussi :{" "}
            <Link href="/regions" className="underline text-[var(--accent)]">
              régions administratives
            </Link>{" "}
            ·{" "}
            <Link href="/comparer-regions" className="underline text-[var(--accent)]">
              comparer 2 régions
            </Link>{" "}
            ·{" "}
            <Link href="/departements" className="underline text-[var(--accent)]">
              tous les départements
            </Link>
            .
          </p>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
