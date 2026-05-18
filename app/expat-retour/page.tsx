import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EXPAT_COUNTRIES } from "@/lib/expat-return";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";

export const metadata: Metadata = {
  title: "Expat retour France 2026 — Guide pratique pour rentrer | MeilleurVille",
  description:
    "Vous rentrez de Suisse, Luxembourg, Belgique, UK ou Canada en France ? Comparatif salaire / coût de la vie / fiscalité / admin par pays + quiz adapté + suggestions de villes.",
  alternates: { canonical: "/expat-retour" },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Expat retour France", path: "/expat-retour" },
]);

export default function ExpatRetourIndex() {
  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <AmbientBackground />
      <Navbar />

      <section className="pt-20 pb-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <Badge variant="accent" className="mb-3">
            ✈️ Expat retour
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.1]">
            Rentrer en France après l&apos;expatriation
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            Salaires, fiscalité, santé, admin : ce qui change vraiment en rentrant de
            Suisse, Luxembourg, Belgique, UK ou Canada. Plus un quiz adapté pour trouver la
            bonne ville côté France.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-10">
        {/* Countries grid */}
        <section>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            Choisissez votre pays d&apos;origine
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXPAT_COUNTRIES.map((country) => (
              <Link
                key={country.slug}
                href={`/expat-retour/depuis-${country.slug}`}
                className="block"
              >
                <Card className="hover:border-[var(--accent)]/40 transition-colors cursor-pointer h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl" aria-hidden>
                      {country.flag}
                    </span>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                      Depuis le {country.name === "Royaume-Uni" ? "Royaume-Uni" : country.name}
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-3">
                    {country.intro.slice(0, 160)}…
                  </p>
                  <p className="text-xs text-[var(--accent)] mt-3 underline">
                    Voir le guide complet →
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Quiz CTA */}
        <Card>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span className="text-4xl" aria-hidden>
              ✨
            </span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
                Pas sûr de la ville française adaptée ?
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Le quiz expat (5 minutes) recoupe votre profil avec les {CITIES_COUNT} villes du site et
                pondère selon le contexte de votre retour.
              </p>
            </div>
            <Link
              href="/expat-retour/quiz"
              className="rounded-full bg-[var(--accent)] text-white px-5 py-2.5 text-sm font-semibold whitespace-nowrap shadow-sm hover:opacity-90"
            >
              Faire le quiz →
            </Link>
          </div>
        </Card>

        {/* Admin guide */}
        <Card>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
            Admin retour France — les 5 démarches incontournables
          </h2>
          <ol className="space-y-3 text-sm text-[var(--text-secondary)]">
            <li className="flex gap-3">
              <span className="font-mono-data text-[var(--accent)] font-bold">1.</span>
              <div>
                <strong className="text-[var(--text-primary)]">Radiation du registre consulaire</strong>{" "}
                — avant le départ, signaler la fin de résidence à l&apos;étranger via{" "}
                <a
                  href="https://www.service-public.fr/particuliers/vosdroits/F33899"
                  className="underline"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  service-public.fr
                </a>
                .
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-mono-data text-[var(--accent)] font-bold">2.</span>
              <div>
                <strong className="text-[var(--text-primary)]">Sécurité sociale (S1 ou inscription CPAM)</strong>{" "}
                — anticiper 3-6 semaines de délai. Garder l&apos;ancienne couverture santé jusqu&apos;à activation FR.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-mono-data text-[var(--accent)] font-bold">3.</span>
              <div>
                <strong className="text-[var(--text-primary)]">Fiscalité (déclaration FR + final return pays d&apos;origine)</strong>{" "}
                — l&apos;année du retour est fractionnée. Faire valider par un expert-comptable bilingue.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-mono-data text-[var(--accent)] font-bold">4.</span>
              <div>
                <strong className="text-[var(--text-primary)]">Permis de conduire</strong>{" "}
                — règles d&apos;échange spécifiques par pays (voir guide pays). 12 mois max pour échanger
                un permis CH / UK / CA.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-mono-data text-[var(--accent)] font-bold">5.</span>
              <div>
                <strong className="text-[var(--text-primary)]">Scolarité enfants + allocations CAF</strong>{" "}
                — inscription mairie + dossier CAF dès l&apos;arrivée (rétroactif 3 mois).
              </div>
            </li>
          </ol>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Ce guide est consultatif et ne remplace pas le conseil d&apos;un expert-comptable ou
            d&apos;un consulat. Liens officiels sur chaque fiche pays.
          </p>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
