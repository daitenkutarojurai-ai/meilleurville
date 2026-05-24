import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PROFILE_PAGES } from "@/lib/profile-pages";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Pour qui · Villes françaises adaptées à votre profil 2026",
  description: `${PROFILE_PAGES.length} profils de vie, ${PROFILE_PAGES.length} classements top 20 calibrés sur les axes qui comptent : familles, couples, jeunes actifs, retraités, freelances, étudiants, primo-accédants, et plus.`,
  alternates: { canonical: "/pour-qui" },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Pour qui", path: "/pour-qui" },
]);

export default function PourQuiIndex() {
  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <AmbientBackground />
      <Navbar />

      <section className="pt-20 pb-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <Badge variant="accent" className="mb-3">
            👥 Top villes par profil
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
            Pour qui est faite chaque ville ?
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            {PROFILE_PAGES.length} profils de vie, {PROFILE_PAGES.length} classements top 20 calibrés sur les axes qui
            comptent pour chacun. Plus précis qu&apos;un score global générique.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROFILE_PAGES.map((p) => (
            <Link key={p.slug} href={`/pour-qui/${p.slug}`} className="block">
              <Card className="hover:border-[var(--accent)]/40 cursor-pointer transition-colors h-full">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl" aria-hidden>
                    {p.emoji}
                  </span>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">{p.label}</h2>
                </div>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-3">{p.intro}</p>
                <p className="text-[11px] text-[var(--accent)] mt-3 underline">
                  Voir le top 20 →
                </p>
              </Card>
            </Link>
          ))}
        </div>

        <Card>
          <p className="text-sm text-[var(--text-secondary)]">
            Pour un matching plus fin combinant TOUS vos critères, faites le{" "}
            <Link href="/quiz-compatibilite" className="underline text-[var(--accent)]">
              quiz de compatibilité
            </Link>{" "}
            — 10 questions, top 5 villes avec contribution par critère.
          </p>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
