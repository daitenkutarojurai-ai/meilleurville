import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Sparkles, Share2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { CityFingerprint } from "@/components/CityFingerprint";
import { CITIES_SEED } from "@/data/cities-seed";
import { FINGERPRINT_AXES } from "@/lib/city-fingerprint";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { formatScore, scoreColor, scoreLabel } from "@/lib/utils";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const score = formatScore(city.scores.global);
  return {
    title: `${city.name} city fingerprint · visual signature | BestCitiesInFrance`,
    description: `A unique geometric signature generated from ${city.name}'s 8 quality-of-life axes (overall score ${score}/10). Every French city has its own fingerprint — deterministic and shareable.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/fingerprint` },
    openGraph: {
      title: `${city.name} city fingerprint`,
      description: `Visual signature from 8 quality-of-life axes. Overall score ${score}/10.`,
    },
  };
}

export default async function CityFingerprintENPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const sorted = [...FINGERPRINT_AXES]
    .map((axis) => ({ ...axis, score: city.scores[axis.key] }))
    .sort((a, b) => b.score - a.score);
  const strongest = sorted.slice(0, 3);
  const weakest = sorted.slice(-2).reverse();

  const neighbours = CITIES_SEED
    .filter((c) => c.slug !== city.slug)
    .map((c) => {
      const distance = FINGERPRINT_AXES.reduce((acc, axis) => {
        const d = c.scores[axis.key] - city.scores[axis.key];
        return acc + d * d;
      }, 0);
      return { city: c, distance };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  const EN_AXIS_LABELS: Record<string, string> = {
    life: "Quality of life",
    transport: "Transport",
    nature: "Nature",
    cost: "Cost of living",
    safety: "Safety",
    culture: "Culture",
    remoteWork: "Remote work",
    schools: "Schools",
  };

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="border-b border-[var(--border)] bg-[var(--bg-surface)] py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-tertiary)] mb-4">
            <Link href="/" className="hover:underline">Home</Link>
            {" / "}
            <Link href="/cities" className="hover:underline">Cities</Link>
            {" / "}
            <Link href={`/cities/${slug}`} className="hover:underline">{city.name}</Link>
            {" / "}
            <span>Fingerprint</span>
          </nav>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Generative fingerprint
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            The visual signature of {city.name}
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            A unique geometric shape generated from {city.name}&apos;s 8 quality-of-life scores.
            Same slug, same scores, same fingerprint — deterministic and shareable.
            No two cities look the same.
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
                  Overall score
                </div>
                <div className={`text-5xl font-bold font-mono-data ${scoreColor(city.scores.global)}`}>
                  {formatScore(city.scores.global)}<span className="text-2xl text-[var(--text-tertiary)]">/10</span>
                </div>
                <div className="mt-1 text-sm text-[var(--text-secondary)]">
                  {scoreLabel(city.scores.global)} · {city.region}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-tertiary)] mb-2">
                  Strengths
                </div>
                <div className="flex flex-wrap gap-2">
                  {strongest.map((a) => (
                    <span
                      key={a.key}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-canvas)] border border-[var(--border)] px-3 py-1 text-xs font-medium"
                    >
                      <span className={scoreColor(a.score)}>●</span>
                      <span>{EN_AXIS_LABELS[a.key] ?? a.label}</span>
                      <span className="font-mono-data text-[var(--text-tertiary)]">{formatScore(a.score)}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-tertiary)] mb-2">
                  Weaknesses
                </div>
                <div className="flex flex-wrap gap-2">
                  {weakest.map((a) => (
                    <span
                      key={a.key}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-canvas)] border border-[var(--border)] px-3 py-1 text-xs font-medium"
                    >
                      <span className={scoreColor(a.score)}>●</span>
                      <span>{EN_AXIS_LABELS[a.key] ?? a.label}</span>
                      <span className="font-mono-data text-[var(--text-tertiary)]">{formatScore(a.score)}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-[var(--border)] p-3 text-xs text-[var(--text-tertiary)] flex items-start gap-2">
                <Share2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  Right-click → save image to capture the fingerprint.
                  Compare it with another city — balanced cities produce a regular octagon;
                  specialised cities make a pointed star.
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            How to read the fingerprint
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Each of the 8 petals represents a score axis. The longer and more vivid the petal,
            the stronger the city on that axis. The polygon connects the tips — that&apos;s the
            city&apos;s unique silhouette. The floating dots around the shape are deterministic:
            they depend only on the slug, personalising the fingerprint even when two cities
            have very similar scores.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {FINGERPRINT_AXES.map((axis) => {
              const score = city.scores[axis.key];
              return (
                <div
                  key={axis.key}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-canvas)] px-3 py-2"
                >
                  <span className="text-sm text-[var(--text-secondary)]">
                    {EN_AXIS_LABELS[axis.key] ?? axis.label}
                  </span>
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
            Similar fingerprints
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            The 3 cities whose silhouette is closest to {city.name}&apos;s, across all 8 axes.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {neighbours.map(({ city: n }) => (
              <Link
                key={n.slug}
                href={`/cities/${n.slug}/fingerprint`}
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
            How it works
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            The fingerprint is generated as an SVG on the server. Geometry: petal length =
            score / 10, colour = 6-tier palette (<code>lib/utils.ts SCORE_TIERS</code>).
            The global rotation and orbital dots are seeded by an FNV-1a hash of the slug
            (mulberry32) to individualise two cities with similar scores — without altering
            the structure the scores produce. No external data, no API calls: same slug +
            same scores → same image.
          </p>
        </Card>

        <div className="text-center">
          <Link
            href={`/cities/${slug}`}
            className="inline-flex items-center gap-1 text-sm text-[var(--accent)] underline hover:opacity-80"
          >
            ← Back to {city.name}
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
