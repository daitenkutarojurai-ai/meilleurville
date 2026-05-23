import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Sparkles, Share2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CityFingerprint } from "@/components/CityFingerprint";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { CITIES_SEED } from "@/data/cities-seed";
import { FINGERPRINT_AXES } from "@/lib/city-fingerprint";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { formatScore, scoreColor, scoreLabel } from "@/lib/utils";

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
  const score = formatScore(city.scores.global);
  return {
    title: `L'empreinte visuelle de ${city.name} · Signature unique`,
    description: `Une forme géométrique générée à partir des 8 axes de score de ${city.name} (global ${score}/10). Chaque ville française a sa propre empreinte — partage la tienne.`,
    alternates: { canonical: `/villes/${slug}/empreinte` },
    openGraph: {
      title: `Empreinte de ${city.name}`,
      description: `Signature visuelle générée à partir des 8 axes de qualité de vie. Score global ${score}/10.`,
    },
  };
}

export default async function CityFingerprintPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${slug}` },
    { name: "Empreinte", path: `/villes/${slug}/empreinte` },
  ]);

  const sorted = [...FINGERPRINT_AXES]
    .map((axis) => ({ ...axis, score: city.scores[axis.key] }))
    .sort((a, b) => b.score - a.score);
  const strongest = sorted.slice(0, 3);
  const weakest = sorted.slice(-2).reverse();

  // Pick 3 "voisines d'empreinte" — closest by sum of squared score differences.
  const neighbours = CITIES_SEED
    .filter((c) => c.slug !== city.slug)
    .map((c) => {
      const distance = FINGERPRINT_AXES.reduce((acc, axis) => {
        const d = (c.scores[axis.key] - city.scores[axis.key]);
        return acc + d * d;
      }, 0);
      return { city: c, distance };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="border-b border-[var(--border)] bg-[var(--bg-surface)] py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">
            <Link href={`/villes/${slug}`} className="hover:underline">
              ← {city.name}
            </Link>
          </Badge>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Empreinte générative
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            La signature visuelle de {city.name}
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            Une forme géométrique unique, calculée à partir des 8 axes de score
            de la ville. Même slug, mêmes scores, même empreinte — déterministe,
            partageable, jamais deux villes identiques.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
        <Card className="overflow-hidden bg-gradient-to-br from-[var(--bg-canvas)] to-[var(--bg-elevated)]">
          <div className="grid items-center gap-8 md:grid-cols-[auto,1fr]">
            <div className="flex justify-center">
              <CityFingerprint city={city} size={380} showFooter={false} />
            </div>
            <div className="min-w-0 space-y-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold">
                  Score global
                </div>
                <div className={`text-5xl font-bold font-mono-data ${scoreColor(city.scores.global)}`}>
                  {formatScore(city.scores.global)}<span className="text-2xl text-[var(--text-tertiary)]">/10</span>
                </div>
                <div className="mt-1 text-sm text-[var(--text-secondary)]">
                  Niveau {scoreLabel(city.scores.global)} · {city.region}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-tertiary)] mb-2">
                  Points forts
                </div>
                <div className="flex flex-wrap gap-2">
                  {strongest.map((a) => (
                    <span
                      key={a.key}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-canvas)] border border-[var(--border)] px-3 py-1 text-xs font-medium"
                    >
                      <span className={scoreColor(a.score)}>●</span>
                      <span>{a.label}</span>
                      <span className="font-mono-data text-[var(--text-tertiary)]">{formatScore(a.score)}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-tertiary)] mb-2">
                  Points faibles
                </div>
                <div className="flex flex-wrap gap-2">
                  {weakest.map((a) => (
                    <span
                      key={a.key}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-canvas)] border border-[var(--border)] px-3 py-1 text-xs font-medium"
                    >
                      <span className={scoreColor(a.score)}>●</span>
                      <span>{a.label}</span>
                      <span className="font-mono-data text-[var(--text-tertiary)]">{formatScore(a.score)}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-[var(--border)] p-3 text-xs text-[var(--text-tertiary)] flex items-start gap-2">
                <Share2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  Capture l&apos;empreinte (clic droit → enregistrer l&apos;image)
                  et compare-la à celle d&apos;une autre ville. Les profils
                  équilibrés font un octogone régulier, les profils typés
                  une étoile pointue.
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            Comment lire l&apos;empreinte
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Chacun des 8 pétales représente un axe de score. Plus le pétale est
            long et coloré, plus la ville est forte sur cet axe. Le polygone
            relie les pointes — c&apos;est la silhouette unique de la ville.
            Les pastilles flottantes autour sont déterministes : elles dépendent
            uniquement du slug, pas des scores, et personnalisent l&apos;empreinte
            même quand deux villes ont des chiffres très proches.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {FINGERPRINT_AXES.map((axis) => {
              const score = city.scores[axis.key];
              return (
                <div
                  key={axis.key}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-canvas)] px-3 py-2"
                >
                  <span className="text-sm text-[var(--text-secondary)]">{axis.label}</span>
                  <span className={`font-mono-data text-sm font-bold ${scoreColor(score)}`}>
                    {formatScore(score)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
            Empreintes voisines
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Les 3 villes dont la silhouette ressemble le plus à celle de {city.name},
            sur l&apos;ensemble des 8 axes.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {neighbours.map(({ city: n }) => (
              <Link
                key={n.slug}
                href={`/villes/${n.slug}/empreinte`}
                className="group flex flex-col items-center rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] p-4 transition hover:border-[var(--accent)]/40 hover:shadow-lg"
              >
                <CityFingerprint city={n} size={180} showLabels={false} showFooter={false} />
                <div className="mt-3 text-center">
                  <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)]">
                    {n.name}
                  </div>
                  <div className={`text-xs font-mono-data ${scoreColor(n.scores.global)}`}>
                    {formatScore(n.scores.global)}/10
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Méthodologie
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            L&apos;empreinte est générée en SVG côté serveur. Géométrie :
            longueur des pétales = score / 10, couleur = palette à 6 paliers
            (`lib/utils.ts` `SCORE_TIERS`). La rotation globale et les
            pastilles orbitales sont seedées par un hash FNV-1a du slug
            (`mulberry32`) pour individualiser deux villes aux scores proches
            — sans modifier la structure portée par les scores. Aucune donnée
            externe, aucun appel API : même slug + mêmes scores → même image.
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

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
        <DiscussionCTA citySlug={city.slug} cityName={city.name} />
      </section>

      <Footer />
    </main>
  );
}
