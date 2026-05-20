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
  title: "Villes les moins chères de France 2026 · Loyer T2 le plus bas",
  description:
    "Top 50 des villes françaises où se loger coûte le moins cher en 2026. Classement par loyer T2 médian croissant — données observatoires des loyers (ANIL) et prix m² DVF.",
  alternates: { canonical: "/classements/villes-moins-cheres" },
  openGraph: {
    title: "Villes les moins chères de France 2026",
    description:
      "Top 50 des villes où le loyer T2 est le plus bas. Le coût du logement, sans le filtre marketing.",
    type: "website",
  },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Classements", path: "/classements" },
  { name: "Villes les moins chères", path: "/classements/villes-moins-cheres" },
]);

export default function VillesMoinsCheresPage() {
  const rows = CITIES_SEED
    .map((city) => {
      const housing = HOUSING[city.slug];
      if (!housing) return null;
      return {
        city,
        rentT1: housing.avgRentT1,
        rentT2: housing.avgRentT2,
        rentT3: housing.avgRentT3,
        priceM2: housing.avgBuyPriceM2,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r != null)
    .sort((a, b) => a.rentT2 - b.rentT2 || a.priceM2 - b.priceM2)
    .slice(0, 50);

  // Repère national : loyer T2 médian sur l'ensemble des villes documentées.
  const medianT2 = (() => {
    const all = Object.values(HOUSING)
      .map((h) => h.avgRentT2)
      .sort((a, b) => a - b);
    return all[Math.floor(all.length / 2)] ?? 700;
  })();

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
            name: "Villes les moins chères de France 2026",
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
            Villes les moins chères de France
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            Les 50 villes où se loger coûte le moins cher en 2026. Un seul critère de
            tri : le loyer T2 médian. Le prix nu, sans le filtre marketing.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-6">
        <Card>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)]">Lecture :</strong> ce classement
            range les villes par loyer T2 croissant. Sans surprise, la tête de liste est
            occupée par des communes de la diagonale des faibles densités — Creuse, Cantal,
            Haute-Vienne — où un deux-pièces se loue souvent sous les 450 €/mois, soit
            largement en dessous du loyer T2 médian national ({medianT2.toLocaleString("fr-FR")} €).
            Loyer bas et marché de l&apos;emploi tendu vont souvent de pair : à confronter
            impérativement au score de qualité de vie affiché à droite de chaque ligne.
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">
            Tri : loyer T2 médian croissant, puis prix au m² croissant en cas d&apos;égalité.
            Le chiffre vert/orange à droite est la note de qualité de vie (sur 10), pas le loyer.
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
                    {row.city.region} · {(row.city.population ?? 0).toLocaleString("fr-FR")} hab. · T1 {row.rentT1}€ · T3 {row.rentT3}€ · achat {row.priceM2.toLocaleString("fr-FR")} €/m²
                  </span>
                </span>
                <span className="text-right flex-shrink-0">
                  <span className="font-mono-data font-bold text-[var(--accent)] block">
                    {row.rentT2}€
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">loyer T2/mois</span>
                </span>
                <span className="text-right flex-shrink-0 w-12">
                  <span className={`font-mono-data font-bold ${scoreColor(row.city.scores.global)} block`}>
                    {row.city.scores.global.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">qualité</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>

        {rows.length === 0 && (
          <Card>
            <p className="text-sm text-[var(--text-secondary)]">
              Aucune ville n&apos;est actuellement documentée dans l&apos;index logement.
            </p>
          </Card>
        )}

        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Limites du classement
          </h3>
          <ul className="text-xs text-[var(--text-secondary)] space-y-1">
            <li>• Le loyer T2 affiché est un médian par ville — les écarts interquartier atteignent facilement ±25 %.</li>
            <li>• Un loyer bas n&apos;est pas un bon plan en soi : il reflète souvent une demande faible (population qui décline, peu d&apos;emplois). Croiser avec la note de qualité de vie et la fiche complète de la ville.</li>
            <li>• Le classement ne couvre que les villes pour lesquelles un loyer médian est documenté ; les communes hors index sont absentes.</li>
            <li>• Pour un raisonnement achat plutôt que location, voir le classement rapport qualité/prix ci-dessous.</li>
          </ul>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Sources</h3>
          <ul className="text-xs text-[var(--text-secondary)] space-y-1">
            <li>
              • Loyers : réseau des{" "}
              <a
                href="https://www.observatoires-des-loyers.org"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="underline"
              >
                Observatoires Locaux des Loyers
              </a>{" "}
              (OLL), piloté par l&apos;ANIL pour le Ministère du Logement.
            </li>
            <li>
              • Prix au m² : base{" "}
              <a
                href="https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="underline"
              >
                Demandes de Valeurs Foncières (DVF)
              </a>{" "}
              publiée sur data.gouv.fr.
            </li>
            <li>• Population : recensement Insee.</li>
          </ul>
        </Card>

        <Card>
          <p className="text-sm text-[var(--text-secondary)]">
            Voir aussi :{" "}
            <Link href="/classements/meilleur-rapport-qualite-prix" className="underline text-[var(--accent)]">
              meilleur rapport qualité/prix
            </Link>{" "}
            ·{" "}
            <Link href="/classements/villes-sous-cotees" className="underline text-[var(--accent)]">
              villes sous-cotées
            </Link>{" "}
            ·{" "}
            <Link href="/classements/budget" className="underline text-[var(--accent)]">
              classement « moins chères » officiel
            </Link>
            .
          </p>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
