import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";
import { scoreColor } from "@/lib/utils";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Meilleur rapport qualité/prix 2026 — Villes françaises sous-cotées",
  description:
    "Top 50 villes françaises au meilleur rapport qualité de vie / prix m² 2026. Indicateur unique : score qualité de vie pondéré par le prix immobilier. Les bons plans sous-cotés.",
  alternates: { canonical: "/classements/meilleur-rapport-qualite-prix" },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Classements", path: "/classements" },
  { name: "Meilleur rapport qualité/prix", path: "/classements/meilleur-rapport-qualite-prix" },
]);

// Score "rapport qualité/prix" = score global × 10 000 / prix m²
// Plus la valeur est haute, mieux c'est. Normalisé en 0-100 pour lisibilité.
function valueScore(globalScore: number, pricePerM2: number): number {
  if (pricePerM2 <= 0) return 0;
  // Anchor : Paris 6e ≈ 13 000 €/m² avec score 7 = ratio 5,4
  //          Limoges ≈ 1 600 €/m² avec score 6 = ratio 37,5
  // Multiplied to give readable 0-100 range
  return Math.round((globalScore / pricePerM2) * 10_000 * 10) / 10;
}

export default function MeilleurRapportPage() {
  const rows = CITIES_SEED
    .map((city) => {
      const housing = HOUSING[city.slug];
      if (!housing) return null;
      return {
        city,
        priceM2: housing.avgBuyPriceM2,
        rentT2: housing.avgRentT2,
        value: valueScore(city.scores.global, housing.avgBuyPriceM2),
      };
    })
    .filter((r): r is NonNullable<typeof r> => r != null)
    .sort((a, b) => b.value - a.value)
    .slice(0, 50);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";

  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Villes françaises au meilleur rapport qualité/prix 2026",
            itemListElement: rows.slice(0, 10).map((row, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: row.city.name,
              url: `${BASE_URL}/villes/${row.city.slug}`,
            })),
          }),
        }}
      />
      <AmbientBackground />
      <Navbar />

      <section className="pt-20 pb-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <Badge variant="accent" className="mb-3">
            <Link href="/classements" className="hover:underline">
              ← Classements
            </Link>
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
            Meilleur rapport qualité/prix
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            Les 50 villes où vous obtenez le plus de qualité de vie par euro investi.
            Score global ÷ prix au m². Les bons plans sous-cotés.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-6">
        <Card>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)]">Lecture :</strong> Limoges,
            Saint-Étienne, Le Mans et autres villes du « ventre mou » immobilier français
            offrent souvent un meilleur ratio qualité de vie / prix que les métropoles
            sur-cotées. Ce classement les remonte à leur juste place.
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">
            Score affiché = (score qualité de vie × 10 000) ÷ prix m². Plus c&apos;est haut,
            plus le rapport est favorable.
          </p>
        </Card>

        <ol className="space-y-2">
          {rows.map((row, i) => (
            <li key={row.city.slug}>
              <Link
                href={`/villes/${row.city.slug}`}
                className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 hover:border-[var(--accent)]/40 transition-all"
              >
                <span className="font-mono-data text-sm text-[var(--text-tertiary)] w-8 flex-shrink-0">
                  #{i + 1}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="font-semibold text-[var(--text-primary)] block truncate">
                    {row.city.name}
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {row.city.region} · loyer T2 {row.rentT2}€/mois · achat {row.priceM2.toLocaleString("fr-FR")} €/m²
                  </span>
                </span>
                <span className="text-right flex-shrink-0">
                  <span className={`font-mono-data font-bold ${scoreColor(row.city.scores.global)} block`}>
                    {row.city.scores.global.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">
                    {row.value.toFixed(1)} pts/€
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Limites du score
          </h3>
          <ul className="text-xs text-[var(--text-secondary)] space-y-1">
            <li>• Le prix m² est un médian par ville — les variations interquartier peuvent être de ±30 %.</li>
            <li>• Les très petites villes (&lt; 30 000 hab.) gagnent mécaniquement (prix bas) mais peuvent avoir un faible nombre d&apos;acquéreurs réels (revente difficile).</li>
            <li>• Les villes hors de l&apos;index HOUSING (~50 villes) sont absentes du classement.</li>
            <li>• N&apos;intègre pas la dynamique : une ville en gentrification rapide peut être sous-cotée aujourd&apos;hui et sur-cotée dans 5 ans (voir{" "}
              <Link href="/gentrification" className="underline">
                l&apos;index de gentrification
              </Link>
              ).
            </li>
          </ul>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
