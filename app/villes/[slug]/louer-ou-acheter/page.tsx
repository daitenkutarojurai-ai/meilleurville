import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { buildRentVsBuy, VERDICT_META, REF_SURFACE_M2 } from "@/lib/rent-vs-buy";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

// ISR Reads optimization: pure SSG (no Vercel Data Cache layer).
// revalidate=false → page built once at deploy, served from static edge cache.
export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  const data = buildRentVsBuy(slug);
  if (!city) return {};
  const ratioLabel = data ? `Ratio prix/loyer : ${data.rentToPriceRatio} (${VERDICT_META[data.verdict].label.toLowerCase()})` : "Comparatif détaillé";
  return {
    title: `Louer ou acheter à ${city.name} 2026 — ${ratioLabel}`,
    description: data
      ? `Faut-il louer ou acheter à ${city.name} ? Ratio prix/loyer ${data.rentToPriceRatio}, mensualité prêt T3 ${data.monthlyMortgage} €, payback apport ${data.paybackYears ? data.paybackYears + " ans" : "n/a"}. Données HOUSING + barèmes 2026.`
      : `Faut-il louer ou acheter à ${city.name} ? Données loyer / prix m² + simulation prêt 25 ans pour décider.`,
    alternates: { canonical: `/villes/${slug}/louer-ou-acheter` },
    openGraph: {
      title: `Louer ou acheter à ${city.name} ?`,
      description: `Ratio prix/loyer + simulation prêt 25 ans + payback de l'apport. Verdict basé sur les médians du site.`,
    },
  };
}

function StatRow({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-[var(--border)]/50 py-2 last:border-0">
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      <span className={`text-sm font-mono-data font-semibold tabular-nums ${tone ?? "text-[var(--text-primary)]"}`}>{value}</span>
    </div>
  );
}

export default async function LouerOuAcheterPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const data = buildRentVsBuy(slug);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Louer ou acheter", path: `/villes/${city.slug}/louer-ou-acheter` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link> ·{" "}
          <Link href="/villes" className="hover:underline">Villes</Link> ·{" "}
          <Link href={`/villes/${city.slug}`} className="hover:underline">{city.name}</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Louer ou acheter à {city.name} ?
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Ratio prix/loyer (PER immobilier), simulation prêt 25 ans, payback de l&apos;apport.
          Tout dérivé des médians loyer T3 + prix m² du site et des barèmes bancaires
          janvier 2026.
        </p>

        {!data ? (
          <Card className="mt-6">
            <p className="text-sm text-[var(--text-secondary)]">
              Pas assez de données loyer/prix pour <strong>{city.name}</strong> dans la base
              HOUSING. Voir la <Link href={`/villes/${city.slug}`} className="underline">fiche
              ville</Link> pour les médians disponibles.
            </p>
          </Card>
        ) : (
          <>
            {/* Verdict */}
            <Card className="mt-6">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Verdict</p>
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${VERDICT_META[data.verdict].tone}`}>
                    {VERDICT_META[data.verdict].label}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Ratio prix/loyer</p>
                  <p className="text-3xl font-bold font-mono-data tabular-nums text-[var(--text-primary)]">
                    {data.rentToPriceRatio}
                  </p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">années de loyer</p>
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {VERDICT_META[data.verdict].advice}
              </p>
            </Card>

            {/* Données brutes */}
            <h2 className="mt-8 text-lg font-semibold text-[var(--text-primary)]">Les chiffres</h2>
            <p className="text-xs text-[var(--text-tertiary)] mb-3">
              Surface de référence : T3 médian {REF_SURFACE_M2} m². Médians loyers + prix m²
              issus des observatoires loyers et DVF.
            </p>
            <Card>
              <StatRow label="Prix d'achat T3" value={`${data.priceT3.toLocaleString("fr-FR")} €`} />
              <StatRow label="Loyer T3 annuel" value={`${data.rentT3Annual.toLocaleString("fr-FR")} €`} />
              <StatRow label="Apport (10 %)" value={`${data.apport.toLocaleString("fr-FR")} €`} />
              <StatRow label="Frais notaire (7,5 %)" value={`${data.notaryFees.toLocaleString("fr-FR")} €`} />
              <StatRow label="Cash à mobiliser" value={`${data.totalCashIn.toLocaleString("fr-FR")} €`} />
            </Card>

            {/* Simulation mensuelle */}
            <h2 className="mt-8 text-lg font-semibold text-[var(--text-primary)]">Comparatif mensuel</h2>
            <p className="text-xs text-[var(--text-tertiary)] mb-3">
              Prêt amortissable 25 ans à 3,4 % TAEG (barèmes bancaires médians janvier 2026).
              Charges propriétaire = 1,2 % du prix / an (taxe foncière + entretien + assurance PNO).
            </p>
            <Card>
              <StatRow label="Mensualité prêt" value={`${data.monthlyMortgage.toLocaleString("fr-FR")} €/mois`} />
              <StatRow label="+ Charges propriétaire" value={`${data.monthlyOwnerCharges.toLocaleString("fr-FR")} €/mois`} />
              <StatRow label="= Coût acheteur" value={`${(data.monthlyMortgage + data.monthlyOwnerCharges).toLocaleString("fr-FR")} €/mois`} />
              <StatRow label="Loyer T3 (locataire)" value={`${Math.round(data.rentT3Annual / 12).toLocaleString("fr-FR")} €/mois`} />
              <StatRow
                label="Écart"
                value={`${data.monthlySavingsVsRent > 0 ? "−" : "+"}${Math.abs(Math.round(data.monthlySavingsVsRent))} €/mois`}
                tone={data.monthlySavingsVsRent > 0 ? "text-emerald-700" : "text-red-700"}
              />
            </Card>

            <Card className="mt-6">
              <p className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Payback de l&apos;apport</p>
              {data.paybackYears != null ? (
                <p className="text-sm text-[var(--text-secondary)]">
                  Avec {data.totalCashIn.toLocaleString("fr-FR")} € de cash mobilisé (apport + notaire) et une
                  économie de loyer de <strong className="text-[var(--text-primary)]">{Math.round(data.monthlySavingsVsRent)} €/mois</strong>,
                  vous récupérez votre mise en <strong className="text-[var(--text-primary)]">{data.paybackYears} ans</strong>
                  — à partir de là, propriétaire = gain net.
                </p>
              ) : (
                <p className="text-sm text-[var(--text-secondary)]">
                  Le coût mensuel acheteur (mensualité + charges) dépasse le loyer T3 : aucun payback de l&apos;apport via
                  l&apos;économie locative. L&apos;achat ne se justifie ici que par la plus-value à la revente
                  (au-delà de notre périmètre — voir la <Link href="/methode" className="underline">méthodologie</Link>).
                </p>
              )}
            </Card>

            {/* Cross-links */}
            <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Aller plus loin</h2>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href={`/calculateur-cout-reel/${city.slug}`} className="block">
                <Card className="hover:shadow-md transition-shadow h-full">
                  <div className="text-xs uppercase text-[var(--text-tertiary)]">Calculateur</div>
                  <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Coût réel mensuel — locataire</div>
                </Card>
              </Link>
              <Link href={`/cout-menage/${city.slug}`} className="block">
                <Card className="hover:shadow-md transition-shadow h-full">
                  <div className="text-xs uppercase text-[var(--text-tertiary)]">Coût ménage</div>
                  <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Solo / couple / famille / retraité</div>
                </Card>
              </Link>
              <Link href="/simulateur-achat" className="block">
                <Card className="hover:shadow-md transition-shadow h-full">
                  <div className="text-xs uppercase text-[var(--text-tertiary)]">Simulateur</div>
                  <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Top villes accessibles selon budget</div>
                </Card>
              </Link>
              <Link href="/louer-ou-acheter" className="block">
                <Card className="hover:shadow-md transition-shadow h-full">
                  <div className="text-xs uppercase text-[var(--text-tertiary)]">Classement</div>
                  <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Les villes les plus acheteuses de France</div>
                </Card>
              </Link>
            </div>
          </>
        )}

        <div className="mt-10 text-xs text-[var(--text-tertiary)]">
          <Badge>Estimation</Badge> Médians loyer/prix + barème bancaire janvier 2026. Votre situation réelle peut différer
          (apport plus élevé, taux négocié, frais agence, dispositif fiscal Pinel/Denormandie).
        </div>
      </section>

      <Footer />
    </main>
  );
}
