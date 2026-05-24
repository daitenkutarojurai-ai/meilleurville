import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { cityVibe, VIBE_META, topCitiesByVibe } from "@/lib/vibe";
import type { VibeTone } from "@/lib/vibe";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { formatScore } from "@/lib/utils";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export const revalidate = false;
export const dynamicParams = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

const EN_VIBE_META: Record<VibeTone, { label: string; emoji: string; color: string; desc: string }> = {
  calme: {
    label: "Calm",
    emoji: "🌿",
    color: "text-sky-600",
    desc: "Low footfall, ideal for settling in and switching off.",
  },
  animé: {
    label: "Lively",
    emoji: "✨",
    color: "text-amber-600",
    desc: "Good energy, active shops and a buzzing street scene.",
  },
  festif: {
    label: "Festive",
    emoji: "🎉",
    color: "text-violet-600",
    desc: "Events, nightlife, terraces — city in full swing.",
  },
  chargé: {
    label: "Intense",
    emoji: "🌀",
    color: "text-orange-600",
    desc: "Dense, high-stress, constant movement.",
  },
  ressourcant: {
    label: "Restorative",
    emoji: "🌄",
    color: "text-green-600",
    desc: "Nature within reach, clean air, slow pace.",
  },
};

const SCORE_COMPONENTS = [
  { key: "global" as const, label: "Overall quality of life" },
  { key: "culture" as const, label: "Culture" },
  { key: "nature" as const, label: "Nature" },
  { key: "safety" as const, label: "Safety" },
  { key: "transport" as const, label: "Transport" },
  { key: "cost" as const, label: "Cost of living" },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const { tone } = cityVibe(city);
  const meta = EN_VIBE_META[tone];
  return {
    title: `${city.name} vibe — ${meta.label} city atmosphere | BestCitiesInFrance`,
    description: `${city.name} has a ${meta.label.toLowerCase()} atmosphere: ${meta.desc} Deterministic vibe derived from quality-of-life scores, seasonal signals and city character.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/vibe` },
    openGraph: {
      title: `${city.name} vibe: ${meta.emoji} ${meta.label}`,
      description: `${meta.desc} Score ${formatScore(city.scores.global)}/10.`,
    },
  };
}

export default async function CityVibeENPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const { tone, score, breakdown } = cityVibe(city);
  const meta = EN_VIBE_META[tone];
  const frMeta = VIBE_META[tone];

  const vibeScore = Math.round(score * 20);

  const similarVibe = topCitiesByVibe(tone, CITIES_SEED, 7)
    .filter((c) => c.slug !== city.slug)
    .slice(0, 3);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: city.name, path: `/cities/${slug}` },
    { name: "Vibe", path: `/cities/${slug}/vibe` },
  ]);

  const faq = faqJsonLd([
    {
      q: `What is the vibe like in ${city.name}?`,
      a: `${city.name} has a ${meta.label.toLowerCase()} vibe (${meta.emoji}): ${meta.desc} This is derived from the city's quality-of-life scores — no real-time data.`,
    },
    {
      q: `Is ${city.name} a lively or calm city?`,
      a: `${city.name} falls into the "${meta.label}" category. Key signals: ${breakdown.join("; ")}.`,
    },
    {
      q: `What drives ${city.name}'s vibe score?`,
      a: `The vibe is computed deterministically from ${city.name}'s 8 quality-of-life axes: global score (${formatScore(city.scores.global)}/10), culture (${formatScore(city.scores.culture)}/10), nature (${formatScore(city.scores.nature)}/10) and safety (${formatScore(city.scores.safety)}/10). No live social-media signals.`,
    },
    {
      q: `Which French cities share the same vibe as ${city.name}?`,
      a: `Cities in the "${meta.label}" category include ${similarVibe.map((c) => c.name).join(", ")} — all share a similar mix of scores that produce a ${meta.label.toLowerCase()} character.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />

      <section className="border-b border-[var(--border)] bg-[var(--bg-surface)] py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-tertiary)] mb-4">
            <Link href="/" className="hover:underline">Home</Link>
            {" / "}
            <Link href="/cities" className="hover:underline">Cities</Link>
            {" / "}
            <Link href={`/cities/${slug}`} className="hover:underline">{city.name}</Link>
            {" / "}
            <span>Vibe</span>
          </nav>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-2">
            <Zap className="h-3.5 w-3.5" />
            City atmosphere
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            The vibe in {city.name}
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            A deterministic atmosphere score derived from quality-of-life axes, regional
            character and seasonal signals. Clearly labelled as an estimate — not real-time data.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">

        {/* Main vibe card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="text-6xl" aria-hidden>{meta.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-2xl font-bold ${meta.color}`}>{meta.label}</span>
              <span
                className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700"
                title="Editorial estimate — not derived from real-time data"
              >
                ESTIMATE
              </span>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-3">{meta.desc}</p>
            {breakdown.length > 0 && (
              <ul className="space-y-1">
                {breakdown.map((b) => (
                  <li key={b} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                    <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="text-4xl font-bold font-mono-data text-[var(--text-primary)]">
              {vibeScore}
            </div>
            <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">/ 100</div>
          </div>
        </div>

        {/* Underlying scores */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Underlying signals
            </h2>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {SCORE_COMPONENTS.map(({ key, label }) => {
              const s = city.scores[key];
              const pct = Math.round((s / 10) * 100);
              return (
                <div key={key} className="px-5 py-3 flex items-center gap-4">
                  <span className="text-sm text-[var(--text-secondary)] w-40 shrink-0">{label}</span>
                  <div className="relative h-2 flex-1 rounded-full bg-[var(--bg-canvas)] overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: s >= 7 ? "var(--accent)" : s >= 5 ? "#EAB308" : "#EF4444",
                      }}
                    />
                  </div>
                  <span className="font-mono-data text-sm font-bold text-[var(--text-secondary)] w-10 text-right">
                    {formatScore(s)}/10
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* All 5 vibe types */}
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            The 5 vibe categories
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.entries(EN_VIBE_META) as [VibeTone, typeof EN_VIBE_META[VibeTone]][]).map(([key, m]) => (
              <div
                key={key}
                className={`rounded-xl border p-4 ${key === tone ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--border)] bg-[var(--bg-canvas)]"}`}
              >
                <div className={`flex items-center gap-2 text-sm font-bold mb-1 ${m.color}`}>
                  <span aria-hidden>{m.emoji}</span>
                  <span>{m.label}</span>
                  {key === tone && (
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
                      ← {city.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Similar vibe cities */}
        {similarVibe.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
              Cities with a similar vibe
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Other French cities in the &ldquo;{meta.label}&rdquo; category.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {similarVibe.map((n) => {
                const nVibe = cityVibe(n);
                const nMeta = EN_VIBE_META[nVibe.tone];
                return (
                  <Link
                    key={n.slug}
                    href={`/cities/${n.slug}/vibe`}
                    className="group flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] px-4 py-3 transition hover:border-[var(--accent)]/40 hover:shadow-md"
                  >
                    <span className="text-2xl" aria-hidden>{nMeta.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] truncate">
                        {n.name}
                      </div>
                      <div className="text-xs text-[var(--text-tertiary)] truncate">
                        {nMeta.label} · {formatScore(n.scores.global)}/10
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Methodology note */}
        <div className="rounded-xl border border-dashed border-[var(--border)] p-4 text-xs text-[var(--text-tertiary)] leading-relaxed">
          <strong className="text-[var(--text-secondary)]">Methodology:</strong> The vibe is
          computed deterministically from static seed scores — no live social-media or event data.
          The tone (Calm / Lively / Festive / Intense / Restorative) is derived from the nature,
          culture, life and safety axes. The numeric score (1–5, scaled to 0–100) adds a seasonal
          boost for Mediterranean cities in summer and a weekend energy increment. The slug-derived
          offset makes results stable for SSG. Clearly an estimate; treat as editorial context, not
          a measurement.
        </div>

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
