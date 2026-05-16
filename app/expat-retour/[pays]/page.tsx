import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EXPAT_COUNTRIES, getExpatCountry } from "@/lib/expat-return";
import { CITIES_SEED } from "@/data/cities-seed";
import { scoreColor } from "@/lib/utils";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

type Props = { params: Promise<{ pays: string }> };

// URL format = /expat-retour/depuis-suisse. Next 16 only supports a fully
// dynamic folder name (e.g. `[pays]`), not a hybrid `depuis-[pays]`. So the
// `pays` param VALUE carries the full prefixed slug ("depuis-suisse") and we
// strip the prefix to look up the country profile.
function stripDepuisPrefix(slug: string): string {
  return slug.startsWith("depuis-") ? slug.slice("depuis-".length) : slug;
}

export function generateStaticParams() {
  return EXPAT_COUNTRIES.map((c) => ({ pays: `depuis-${c.slug}` }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pays } = await params;
  const country = getExpatCountry(stripDepuisPrefix(pays));
  if (!country) return {};
  return {
    title: `Rentrer en France depuis ${country.name} 2026 — Guide pratique | MeilleurVille`,
    description: `Salaire net, loyer, fiscalité, santé, admin : ce qui change vraiment quand on rentre en France depuis ${country.name}. Avec villes recommandées (frontalières + métropoles).`,
    alternates: { canonical: `/expat-retour/${pays}` },
    openGraph: {
      title: `Rentrer de ${country.name} en France — Guide 2026`,
      description: country.intro.slice(0, 160),
    },
  };
}

export default async function ExpatRetourCountryPage({ params }: Props) {
  const { pays } = await params;
  const country = getExpatCountry(stripDepuisPrefix(pays));
  if (!country) notFound();

  const bestCities = country.bestSuitedCities
    .map((slug) => CITIES_SEED.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => c != null);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Expat retour", path: "/expat-retour" },
    { name: country.name, path: `/expat-retour/${pays}` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">
            <Link href="/expat-retour" className="hover:underline">
              ← Expat retour
            </Link>
          </Badge>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-5xl" aria-hidden>
              {country.flag}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              Rentrer en France depuis le {country.name}
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed">{country.intro}</p>
          {country.currency !== "EUR" && (
            <p className="text-xs text-[var(--text-tertiary)] mt-3">
              Taux de change indicatif (janv. 2026) : 1 {country.currency} ≈ {country.currencyToEurApprox} €
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
        {/* Had vs will have */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Ce que vous aviez vs ce que vous aurez
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Comparatif réaliste, valeurs médianes. À ajuster selon votre profession et votre ville française cible.
          </p>
          <Card>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-2 font-semibold text-[var(--text-primary)]">Critère</th>
                  <th className="text-left py-2 font-semibold text-[var(--text-secondary)]">
                    {country.flag} Au {country.name}
                  </th>
                  <th className="text-left py-2 font-semibold text-[var(--text-secondary)]">
                    🇫🇷 En France
                  </th>
                </tr>
              </thead>
              <tbody>
                {country.hadVsWillHave.map((row) => (
                  <tr key={row.topic} className="border-b border-[var(--border)]/40">
                    <td className="py-3 pr-3 font-medium text-[var(--text-primary)]">{row.topic}</td>
                    <td className="py-3 pr-3 text-xs text-[var(--text-secondary)]">{row.had}</td>
                    <td className="py-3 text-xs text-[var(--text-secondary)]">{row.willHave}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        {/* Best cities */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Villes françaises les plus adaptées
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Sélection éditoriale : villes frontalières si ça a du sens, sinon métropoles avec
            scolarisation internationale + transports vers l&apos;ancien lieu de vie.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {bestCities.map((city) => (
              <Link
                key={city.slug}
                href={`/villes/${city.slug}`}
                className="block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
              >
                <div className="flex items-baseline justify-between mb-1">
                  <p className="font-semibold text-[var(--text-primary)]">{city.name}</p>
                  <span className={`font-mono-data font-bold ${scoreColor(city.scores.global)}`}>
                    {city.scores.global.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-tertiary)]">{city.region}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Admin priorities */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Démarches administratives prioritaires
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Ordre conseillé. Délai total : prévoir 2-3 mois entre la décision et l&apos;arrivée sereine.
          </p>
          <Card>
            <ol className="space-y-4">
              {country.adminPriorities.map((step, i) => (
                <li key={step.step} className="flex gap-3">
                  <span className="font-mono-data text-[var(--accent)] font-bold text-lg shrink-0">
                    {i + 1}.
                  </span>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{step.step}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{step.detail}</p>
                    {step.officialUrl && (
                      <a
                        href={step.officialUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                        className="text-xs text-[var(--accent)] underline mt-1 inline-block"
                      >
                        Source officielle →
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </section>

        {/* Warnings */}
        {country.warnings.length > 0 && (
          <Card>
            <h3 className="text-sm font-semibold text-amber-700 mb-2">⚠️ Points de vigilance</h3>
            <ul className="text-xs text-[var(--text-secondary)] space-y-2">
              {country.warnings.map((w) => (
                <li key={w} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Quiz CTA */}
        <Card>
          <div className="flex items-center gap-4">
            <span className="text-3xl" aria-hidden>
              ✨
            </span>
            <div className="flex-1">
              <p className="font-semibold text-[var(--text-primary)]">
                Précisez avec le quiz expat
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                5 minutes pour affiner par salaire actuel, situation familiale et profession.
              </p>
            </div>
            <Link
              href="/expat-retour/quiz"
              className="rounded-full bg-[var(--accent)] text-white px-4 py-2 text-sm font-semibold shadow-sm hover:opacity-90"
            >
              Faire le quiz →
            </Link>
          </div>
        </Card>

        <p className="text-xs text-[var(--text-tertiary)] text-center">
          Données indicatives (taux de change janvier 2026, médianes). Ce guide est consultatif et
          ne remplace pas un expert-comptable bilingue ou le service consulaire.
        </p>
      </div>

      <Footer />
    </main>
  );
}
