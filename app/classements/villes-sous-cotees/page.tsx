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
  title: "Villes françaises sous-cotées 2026 · Petites villes à découvrir",
  description:
    "Top 30 villes françaises sous-cotées : < 80 000 habitants, qualité de vie ≥ 6/10, prix m² accessibles. Les pépites discrètes que personne ne mentionne.",
  alternates: { canonical: "/classements/villes-sous-cotees" },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Classements", path: "/classements" },
  { name: "Villes sous-cotées", path: "/classements/villes-sous-cotees" },
]);

// Critères "sous-cotée" :
// - Population < 80 000 (sinon c'est déjà connu)
// - Score qualité de vie ≥ 6.0 (sinon ce n'est pas une bonne ville)
// - Prix m² < 3 500 (sinon ce n'est pas accessible)
// - Pas une commune touristique de bord de mer / lac très exposée (filtrée par tag)

const TOURIST_HOTSPOTS = new Set([
  "saint-malo",
  "annecy",
  "biarritz",
  "deauville",
  "honfleur",
  "carcassonne",
  "menton",
  "saint-tropez",
  "sarlat-la-caneda",
]);

export default function VillesSousCoteesPage() {
  const median = (() => {
    const prices = Object.values(HOUSING).map((h) => h.avgBuyPriceM2).sort((a, b) => a - b);
    return prices[Math.floor(prices.length / 2)] ?? 3000;
  })();

  const rows = CITIES_SEED
    .filter((c) => (c.population ?? 0) > 0 && (c.population ?? 0) < 80000)
    .filter((c) => c.scores.global >= 6.0)
    .filter((c) => !TOURIST_HOTSPOTS.has(c.slug))
    .map((city) => {
      const h = HOUSING[city.slug];
      return { city, housing: h };
    })
    .filter((r) => r.housing != null && r.housing.avgBuyPriceM2 < median * 1.1)
    .map(({ city, housing }) => ({
      city,
      priceM2: housing!.avgBuyPriceM2,
      rentT2: housing!.avgRentT2,
      // Sub-score = (qualité de vie / 10) × (médiane / prix) — high when good and cheap
      subScore: (city.scores.global / 10) * (median / housing!.avgBuyPriceM2),
    }))
    .sort((a, b) => b.subScore - a.subScore)
    .slice(0, 30);

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
            name: "Villes françaises sous-cotées 2026",
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
            Villes françaises sous-cotées
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            Top 30 petites villes (&lt; 80 000 hab.) où la qualité de vie est solide et le
            prix m² accessible. Les pépites discrètes — celles dont personne ne parle.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-6">
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
            Critères de sélection
          </h2>
          <ul className="text-sm text-[var(--text-secondary)] space-y-1">
            <li>✅ Population &lt; 80 000 (échappe au radar des palmarès métros)</li>
            <li>✅ Score qualité de vie ≥ 6,0/10 (vraiment vivable)</li>
            <li>✅ Prix m² &lt; 110 % de la médiane nationale ({median.toLocaleString("fr-FR")} €/m²)</li>
            <li>❌ Pas une destination touristique premium (Annecy, Biarritz, Saint-Malo — déjà sur-cotées)</li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">
            Score sous-coté = (qualité de vie ÷ 10) × (médiane prix ÷ prix m²). Plus c&apos;est haut,
            plus la combinaison qualité/prix est avantageuse pour la taille de ville.
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
                  <span className="text-xs text-[var(--text-tertiary)] truncate">
                    {row.city.region} · {(row.city.population ?? 0).toLocaleString("fr-FR")} hab. · {row.priceM2.toLocaleString("fr-FR")} €/m² · loyer T2 {row.rentT2}€/mois
                  </span>
                </span>
                <span className="text-right flex-shrink-0">
                  <span className={`font-mono-data font-bold ${scoreColor(row.city.scores.global)} block`}>
                    {row.city.scores.global.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">qualité de vie</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>

        {rows.length === 0 && (
          <Card>
            <p className="text-sm text-[var(--text-secondary)]">
              Aucune ville ne satisfait actuellement les 4 critères dans le seed. Cela peut
              changer à la prochaine calibration.
            </p>
          </Card>
        )}

        <Card>
          <p className="text-sm text-[var(--text-secondary)]">
            Voir aussi :{" "}
            <Link href="/classements/meilleur-rapport-qualite-prix" className="underline text-[var(--accent)]">
              meilleur rapport qualité/prix (toutes tailles)
            </Link>{" "}
            ·{" "}
            <Link href="/gentrification" className="underline text-[var(--accent)]">
              index de gentrification (montent vite)
            </Link>{" "}
            ·{" "}
            <Link href="/simulateur-achat" className="underline text-[var(--accent)]">
              simulateur d&apos;achat
            </Link>
            .
          </p>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
