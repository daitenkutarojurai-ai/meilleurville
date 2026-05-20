import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CityProfileCta } from "@/components/CityProfileCta";
import { HiddenCostsCalculator } from "@/components/HiddenCostsCalculator";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { fiscalityForCity } from "@/lib/fiscalite";
import { climateZoneFor, transitPassFor, type CostCalcInput } from "@/lib/cost-living";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

// ISR Reads optimization: pure SSG (no Vercel Data Cache layer).
// revalidate=false → page built once at deploy, served from static edge cache.
export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ ville: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ ville: c.slug }));
}

function parseFonciereMidpoint(range: string): number | null {
  // "900-1 400 €/an" → 1150
  const cleaned = range.replace(/ /g, " ").replace(/[€/an\s]/g, "");
  const m = cleaned.match(/^(\d+)-(\d+)$/);
  if (!m) return null;
  const lo = Number(m[1]);
  const hi = Number(m[2]);
  if (Number.isNaN(lo) || Number.isNaN(hi)) return null;
  return Math.round((lo + hi) / 2);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ville } = await params;
  const city = CITIES_SEED.find((c) => c.slug === ville);
  if (!city) return {};
  return {
    title: `Coût réel mensuel à ${city.name} 2026 · Calculateur (loyer, voiture, taxes)`,
    description: `Calcul honnête du coût de la vie à ${city.name} : loyer T2 médian, chauffage selon zone climatique, voiture ou transports, taxe foncière, TEOM. Comparatif vs Paris.`,
    alternates: { canonical: `/calculateur-cout-reel/${ville}` },
    openGraph: {
      title: `Coût réel mensuel à ${city.name} · Calculateur 2026`,
      description: `Toutes les charges fixes (loyer, énergie, mobilité, taxes) en une page. Saisissez votre salaire, voyez le reste à vivre.`,
    },
  };
}

export default async function CalculateurCoutReelCityPage({ params }: Props) {
  const { ville } = await params;
  const city = CITIES_SEED.find((c) => c.slug === ville);
  if (!city) notFound();

  const housing = getHousing(city.slug);
  const fisc =
    city.department && city.region
      ? fiscalityForCity({ department: city.department, region: city.region })
      : null;
  const taxeFonciereMidpoint = fisc ? parseFonciereMidpoint(fisc.taxeFonciereT3) : null;
  const zone = climateZoneFor(city.department);
  const transitPass = transitPassFor(city.slug);

  const input: CostCalcInput = {
    citySlug: city.slug,
    cityName: city.name,
    department: city.department,
    region: city.region,
    population: city.population,
    avgRentT2: housing?.avgRentT2 ?? null,
    taxeFonciereAnnualMidpoint: taxeFonciereMidpoint,
  };

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Calculateur coût réel", path: "/calculateur-cout-reel" },
    { name: city.name, path: `/calculateur-cout-reel/${city.slug}` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">
            <Link href="/calculateur-cout-reel" className="hover:underline">
              ← Tous les calculateurs
            </Link>
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Coût réel mensuel à {city.name}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {city.department && `${city.department}, `}
            {city.region}
            {zone && (
              <>
                {" "}
                · Zone climatique <strong>{zone}</strong>
              </>
            )}
            {transitPass != null && (
              <>
                {" "}
                · Abonnement transports {transitPass}€/mois
              </>
            )}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
        {!housing && (
          <Card>
            <p className="text-sm text-amber-700">
              ⚠️ Pas de données loyer T2 indexées pour {city.name}. Le calcul utilise une
              estimation départementale, moins précise.
            </p>
          </Card>
        )}

        <HiddenCostsCalculator input={input} />

        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Ce que le calcul ne prend PAS en compte
          </h3>
          <ul className="text-xs text-[var(--text-secondary)] space-y-1">
            <li>• Mutuelle santé (50-90€/mois en moyenne pour un salarié)</li>
            <li>• Garde d&apos;enfants (crèche, nounou, périscolaire)</li>
            <li>• Frais alimentaires (350-600€/mois pour une personne seule)</li>
            <li>• Loisirs, sport, abonnements numériques</li>
            <li>• Charges de copropriété (souvent 30-100€/mois en plus du loyer)</li>
            <li>• Variations interquartier (peut représenter ±20% sur le loyer)</li>
          </ul>
        </Card>

        <CityProfileCta
          city={city}
          eyebrow="Pour aller plus loin"
          blurb={`Score global, sécurité, transports, climat et avis : la fiche complète de ${city.name}.`}
        />
      </div>

      <Footer />
    </main>
  );
}
