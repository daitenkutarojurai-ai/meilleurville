import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { seasonalStats, TOURISM_LOAD_BADGES, type SeasonStats } from "@/lib/seasons";
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
  if (!city) return {};
  return {
    title: `Vivre à ${city.name} selon la saison — Climat, tourisme, prix 2026`,
    description: `Tout savoir sur les saisons à ${city.name} : températures par saison, ensoleillement, pression touristique. Quel mois est le meilleur pour s'installer ou visiter ?`,
    alternates: { canonical: `/villes/${slug}/saisons` },
    openGraph: {
      title: `${city.name} — Vivre par saison`,
      description: `Climat saison par saison, affluence touristique, signatures locales.`,
    },
  };
}

const SEASON_EMOJI: Record<SeasonStats["season"], string> = {
  printemps: "🌷",
  ete: "☀️",
  automne: "🍂",
  hiver: "❄️",
};

export default async function CitySaisonsPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const seasons = seasonalStats(city);
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${slug}` },
    { name: "Saisons", path: `/villes/${slug}/saisons` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">
            <Link href={`/villes/${slug}`} className="hover:underline">
              ← {city.name}
            </Link>
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Vivre à {city.name} selon la saison
          </h1>
          <p className="text-[var(--text-secondary)]">
            Quatre saisons, quatre ambiances : températures, ensoleillement, pression
            touristique et ce qui se passe vraiment chaque trimestre.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-6">
        {seasons.map((s) => {
          const badge = TOURISM_LOAD_BADGES[s.tourismLoad];
          return (
            <Card key={s.season}>
              <div className="flex flex-wrap items-baseline gap-3 mb-4">
                <span className="text-3xl" aria-hidden>
                  {SEASON_EMOJI[s.season]}
                </span>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">{s.label}</h2>
                  <p className="text-xs text-[var(--text-tertiary)]">{s.months}</p>
                </div>
                <span
                  className={`ml-auto inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.tone}`}
                >
                  Affluence : {badge.label}
                </span>
              </div>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                {s.signature}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="rounded-xl bg-[var(--bg-elevated)] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                    Moyenne
                  </p>
                  <p className="font-mono-data font-bold text-lg text-[var(--text-primary)]">
                    {s.avgTemp} °C
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--bg-elevated)] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                    Max diurne
                  </p>
                  <p className="font-mono-data font-bold text-lg text-[var(--text-primary)]">
                    {s.avgTempHigh} °C
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--bg-elevated)] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                    Soleil / jour
                  </p>
                  <p className="font-mono-data font-bold text-lg text-[var(--text-primary)]">
                    {s.sunshineHoursPerDay} h
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--bg-elevated)] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                    Pluie / mois
                  </p>
                  <p className="font-mono-data font-bold text-lg text-[var(--text-primary)]">
                    {s.rainyDaysPerMonth} j
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] p-3">
                <p className="text-xs text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">Tourisme {badge.label.toLowerCase()} :</strong>{" "}
                  {s.tourismExplanation}
                </p>
              </div>

              <p className="text-[11px] text-[var(--text-tertiary)] mt-3">
                Source : {s.source}
              </p>
            </Card>
          );
        })}

        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Méthodologie
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Températures moyennes : Météo-France climato 1991-2020 (juillet / janvier dans le seed
            ville, interpolation linéaire pour les saisons intermédiaires). Ensoleillement par
            saison : facteur saisonnier × moyenne annuelle. Affluence touristique : déduite des
            tags ville + région côtière/montagne. Sources réelles à brancher : Open-Meteo
            (climatologie quotidienne), DGE Suivi des Métriques de la Demande Touristique,
            InsideAirbnb (couverture variable).
          </p>
        </Card>

        <div className="text-center">
          <Link
            href={`/villes/${slug}`}
            className="inline-flex items-center gap-1 text-sm text-[var(--accent)] underline hover:opacity-80"
          >
            ← Retour à la fiche {city.name}
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
