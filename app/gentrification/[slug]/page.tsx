import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";
import { computeGentrification, rankGentrification, TRAJECTORY_META } from "@/lib/gentrification";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const row = computeGentrification(city);
  const traj = TRAJECTORY_META[row.trajectory];
  return {
    title: `Gentrification ${city.name} 2026 — ${traj.label} · Score ${row.score.toFixed(0)}/100`,
    description: `${city.name} : trajectoire ${traj.label.toLowerCase()} (score ${row.score.toFixed(1)}/100). Évolution prix immobilier, démographie 25-35 ans, ouvertures et télétravailleurs. Analyse complète.`,
    alternates: { canonical: `/gentrification/${slug}` },
    openGraph: {
      title: `${city.name} — Gentrification ${traj.label}`,
      description: `Score composite ${row.score.toFixed(1)}/100 sur 4 signaux : prix, démographie, ouvertures, télétravail.`,
    },
  };
}

export default async function GentrificationCityPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const row = computeGentrification(city);
  const traj = TRAJECTORY_META[row.trajectory];
  const housing = HOUSING[city.slug];

  // Rank vs others
  const all = rankGentrification();
  const rank = all.findIndex((r) => r.city.slug === city.slug) + 1;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Gentrification", path: "/gentrification" },
    { name: city.name, path: `/gentrification/${slug}` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">
            <Link href="/gentrification" className="hover:underline">
              ← Index gentrification
            </Link>
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Gentrification à {city.name}
          </h1>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-sm font-semibold ${traj.tone}`}>
              {traj.label}
            </span>
            <span className="text-sm text-[var(--text-secondary)]">
              {city.region} · {city.population?.toLocaleString("fr-FR") ?? "—"} hab.
            </span>
            <span className="ml-auto text-[var(--text-secondary)] text-sm">
              <strong className="font-mono-data text-xl text-[var(--accent)]">{row.score.toFixed(1)}</strong>
              <span className="text-xs">/100</span> · rang national #{rank}
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
        {/* Trajectory description */}
        <Card>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)]">Trajectoire {traj.label.toLowerCase()} :</strong>{" "}
            {traj.desc}
          </p>
        </Card>

        {/* 4 signals */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Les 4 signaux composites
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {row.signals.map((s) => (
              <Card key={s.key}>
                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{s.label}</p>
                  <p className="font-mono-data font-bold text-lg text-[var(--text-primary)]">
                    {s.value.toFixed(1)}<span className="text-xs text-[var(--text-tertiary)]">/10</span>
                  </p>
                </div>
                <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-[var(--accent)]"
                    style={{ width: `${s.value * 10}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">{s.source}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Housing context if known */}
        {housing && (
          <Card>
            <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">
              Contexte immobilier actuel
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Loyer T2 médian</p>
                <p className="font-mono-data font-bold text-[var(--text-primary)]">
                  {housing.avgRentT2} €/mois
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Loyer T3 médian</p>
                <p className="font-mono-data font-bold text-[var(--text-primary)]">
                  {housing.avgRentT3} €/mois
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Prix achat / m²</p>
                <p className="font-mono-data font-bold text-[var(--text-primary)]">
                  {housing.avgBuyPriceM2.toLocaleString("fr-FR")} €
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Score qualité vie</p>
                <p className="font-mono-data font-bold text-[var(--text-primary)]">
                  {city.scores.global.toFixed(1)}/10
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* CTA */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href={`/villes/${city.slug}`}>
            <Badge variant="default" className="px-4 py-2 text-sm cursor-pointer hover:opacity-90">
              Fiche complète {city.name}
            </Badge>
          </Link>
          <Link href={`/calculateur-cout-reel/${city.slug}`}>
            <Badge variant="default" className="px-4 py-2 text-sm cursor-pointer hover:opacity-90">
              💰 Calculer le coût réel
            </Badge>
          </Link>
          <Link href="/gentrification">
            <Badge variant="accent" className="px-4 py-2 text-sm cursor-pointer hover:opacity-90">
              📈 Voir le top national
            </Badge>
          </Link>
        </div>

        <p className="text-xs text-[var(--text-tertiary)] text-center">
          Score v0 — proxy dérivé du seed actuel. À recalculer dès que DVF + Insee recensement +
          flux SIRENE seront branchés en build-time. Cette page se met à jour automatiquement.
        </p>
      </div>

      <Footer />
    </main>
  );
}
