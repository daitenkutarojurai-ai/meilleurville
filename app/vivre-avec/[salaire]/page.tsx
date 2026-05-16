import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  SALARY_BRACKETS,
  parseSalaryFromSlug,
  slugForSalary,
  buildSalaryLanding,
} from "@/lib/vivre-avec";
import { scoreColor } from "@/lib/utils";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

// ISR Reads optimization: pure SSG (no Vercel Data Cache layer).
// revalidate=false → page built once at deploy, served from static edge cache.
export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ salaire: string }> };

export function generateStaticParams() {
  return SALARY_BRACKETS.map((s) => ({ salaire: slugForSalary(s) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { salaire } = await params;
  const salary = parseSalaryFromSlug(salaire);
  if (!salary) return {};
  return {
    title: `Vivre avec ${salary} €/mois en France 2026 — Top 10 villes adaptées`,
    description: `Salaire net ${salary} €/mois : où vivre confortablement en France ? Top 10 villes compatibles avec budget logement ${Math.round(salary * 0.33)} €, calcul du reste à vivre + comparatif Paris.`,
    alternates: { canonical: `/vivre-avec/${salaire}` },
    openGraph: {
      title: `Vivre avec ${salary} €/mois — Quelles villes ?`,
      description: `Top 10 villes compatibles + breakdown coût réel pour la #1.`,
    },
  };
}

function fmtEuro(value: number): string {
  return `${value.toLocaleString("fr-FR")} €`;
}

export default async function VivreAvecPage({ params }: Props) {
  const { salaire } = await params;
  const salary = parseSalaryFromSlug(salaire);
  if (!salary) notFound();

  const landing = buildSalaryLanding(salary);
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Vivre avec", path: "/vivre-avec" },
    { name: `${salary} €/mois`, path: `/vivre-avec/${salaire}` },
  ]);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Vivre avec ${salary} €/mois en France — Top 10 villes`,
            itemListElement: landing.topMatches.slice(0, 10).map((m, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: m.city.name,
              url: `${BASE_URL}/villes/${m.city.slug}`,
            })),
          }),
        }}
      />
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">
            <Link href="/vivre-avec" className="hover:underline">
              ← Tous les salaires
            </Link>
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Vivre avec {fmtEuro(salary)}/mois en France
          </h1>
          <p className="text-[var(--text-secondary)]">
            Budget logement raisonnable : {fmtEuro(landing.budget)}/mois (33 % du net). Top 10 villes
            où ce budget tient + simulation reste à vivre.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
        {/* Top 10 */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Top 10 villes compatibles
          </h2>
          <ol className="space-y-2">
            {landing.topMatches.map((m, i) => (
              <li key={m.city.slug}>
                <Link
                  href={`/villes/${m.city.slug}`}
                  className="flex items-baseline justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 hover:border-[var(--accent)]/40 transition-colors"
                >
                  <span className="flex items-baseline gap-3 min-w-0">
                    <span className="font-mono-data text-sm text-[var(--text-tertiary)] w-8 flex-shrink-0">
                      #{i + 1}
                    </span>
                    <span className="font-semibold text-[var(--text-primary)] truncate">
                      {m.city.name}
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)] truncate">
                      {m.city.region}
                    </span>
                  </span>
                  <span className="flex items-baseline gap-2 flex-shrink-0">
                    <span className="text-xs text-[var(--text-tertiary)]">
                      Score qdv {m.city.scores.global.toFixed(1)}
                    </span>
                    <span className="font-mono-data font-bold text-[var(--accent)] text-sm">
                      {m.score.toFixed(0)}% match
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* Cost breakdown for #1 */}
        {landing.topCity && (
          <section>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              Exemple concret : votre budget à {landing.topCity.name}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Simulation coût mensuel fixe avec un salaire net de {fmtEuro(salary)}.
            </p>
            <Card>
              <ul className="space-y-2 text-sm">
                {[
                  { label: "Loyer T2 médian", value: landing.topCity.breakdown.rentT2 },
                  { label: "Chauffage", value: landing.topCity.breakdown.heating },
                  ...(landing.topCity.breakdown.transitPass
                    ? [{ label: "Abonnement transports", value: landing.topCity.breakdown.transitPass }]
                    : [
                        { label: "Assurance voiture", value: landing.topCity.breakdown.carInsurance },
                        { label: "Carburant + entretien", value: landing.topCity.breakdown.fuelCommute },
                        { label: "Parking", value: landing.topCity.breakdown.parking },
                      ]),
                  { label: "Taxe foncière (mensualisée)", value: landing.topCity.breakdown.taxeFonciere },
                  { label: "TEOM", value: landing.topCity.breakdown.teom },
                ].map((row) => (
                  <li key={row.label} className="flex items-baseline justify-between border-b border-[var(--border)]/40 last:border-b-0 py-1.5">
                    <span className="text-[var(--text-primary)]">{row.label}</span>
                    <span className="font-mono-data font-bold text-[var(--text-primary)]">{fmtEuro(row.value)}</span>
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-[var(--border)]">
                <div className="text-center">
                  <p className="text-xs text-[var(--text-secondary)]">Coût fixe / mois</p>
                  <p className="font-mono-data font-bold text-xl text-[var(--text-primary)]">
                    {fmtEuro(landing.topCity.breakdown.totalFixed)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-[var(--text-secondary)]">Reste à vivre</p>
                  <p className={`font-mono-data font-bold text-xl ${landing.topCity.remaining < 0 ? "text-red-600" : landing.topCity.remaining < salary * 0.3 ? "text-amber-600" : "text-emerald-600"}`}>
                    {fmtEuro(landing.topCity.remaining)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-[var(--text-secondary)]">Vs Paris</p>
                  <p className={`font-mono-data font-bold text-xl ${landing.topCity.remaining > landing.topCity.parisRemaining ? "text-emerald-600" : "text-red-600"}`}>
                    {landing.topCity.remaining > landing.topCity.parisRemaining ? "+" : ""}
                    {fmtEuro(landing.topCity.remaining - landing.topCity.parisRemaining)}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-center">
                <Link
                  href={`/calculateur-cout-reel/${landing.topCity.slug}`}
                  className="text-sm underline text-[var(--accent)]"
                >
                  Personnaliser le calcul →
                </Link>
              </div>
            </Card>
          </section>
        )}

        {/* CTA */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/quiz-compatibilite">
            <Badge variant="accent" className="px-4 py-2 text-sm cursor-pointer">
              ✨ Affiner avec le quiz
            </Badge>
          </Link>
          <Link href="/calculateur-cout-reel">
            <Badge variant="default" className="px-4 py-2 text-sm cursor-pointer">
              💰 Calculateur par ville
            </Badge>
          </Link>
          <Link href="/vivre-avec">
            <Badge variant="default" className="px-4 py-2 text-sm cursor-pointer">
              Autres salaires
            </Badge>
          </Link>
        </div>

        <p className="text-xs text-[var(--text-tertiary)] text-center">
          Calcul indicatif sur la base d&apos;une vie « moyenne » (couple sans enfants, mode hybride,
          priorité budget). Pour un calcul personnalisé, faites le quiz ou allez sur le calculateur.
        </p>
      </div>

      <Footer />
    </main>
  );
}
