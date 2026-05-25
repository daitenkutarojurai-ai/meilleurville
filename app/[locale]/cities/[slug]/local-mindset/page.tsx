import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Sparkles, ArrowLeft, Users, Coffee, Mountain, Heart, Globe2 } from "lucide-react";
import { CITIES_SEED } from "@/data/cities-seed";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { cityMindset } from "@/lib/city-mindset";

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
  return {
    title: `Local mindset of ${city.name} 2026 — vibe, sociability, tempo`,
    description: `What it actually feels like to live in ${city.name} socially: tempo, openness, café culture, civic life, regional archetype. 2026 derived synthesis.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/local-mindset` },
  };
}

export default async function EnLocalMindsetPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const m = cityMindset(city);
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: city.name, path: `/cities/${city.slug}` },
    { name: "Local mindset", path: `/cities/${city.slug}/local-mindset` },
  ]);

  const cards = [
    { icon: Users, title: "Daily tempo", value: m.tempo.level, body: m.tempo.rationaleEn },
    { icon: Globe2, title: "Social openness", value: m.openness.level, body: m.openness.rationaleEn },
    { icon: Coffee, title: "Café culture", value: m.cafeCulture.level, body: m.cafeCulture.rationaleEn },
    {
      icon: Mountain,
      title: "Outdoor orientation",
      value: `${m.outdoorOrientation.labelEn} (${m.outdoorOrientation.score}/10)`,
      body: "Composite: nature score + sunshine + proximity to sea/mountain + bike culture.",
    },
    {
      icon: Heart,
      title: "Civic / associative life",
      value: `${m.associativeLife.labelEn} (${m.associativeLife.score}/10)`,
      body: "Composite: culture + safety, population-adjusted (very small towns are structurally thinner).",
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <main id="main-content" className="min-h-screen bg-[var(--bg-canvas)]">
        <Navbar />
        <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] p-2.5">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                  Local mindset — {city.name}
                </h1>
                <p className="text-sm text-[var(--text-tertiary)] mt-1">
                  2026 synthesis derived from seed + tags + regional archetype. Indicative — every individual experiences a city differently.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="mb-8 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)] mb-2">
                <Globe2 className="h-4 w-4" />
                Regional archetype — {city.region}
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {m.regionalArchetype.en}
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {cards.map((card, i) => (
                <li
                  key={i}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-tertiary)] mb-2">
                    <card.icon className="h-4 w-4" />
                    {card.title}
                  </div>
                  <div className="text-lg font-semibold text-[var(--text-primary)] capitalize">
                    {card.value}
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                    {card.body}
                  </p>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-xs text-[var(--text-tertiary)] leading-relaxed">
              Method: every dimension is derived through transparent rules from the 8 seed axes (population, transport, culture, safety, nature, remote work), climate (sunshine, temperatures), editorial character tags and regional archetype. No sociological-survey data is used — this is an honest synthesis of quantitative signals, not a psychological portrait.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/cities/${city.slug}/profiles`}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)]/40"
              >
                Resident profiles →
              </Link>
              <Link
                href={`/cities/${city.slug}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:underline"
              >
                <ArrowLeft className="h-4 w-4" /> Back to {city.name}
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
