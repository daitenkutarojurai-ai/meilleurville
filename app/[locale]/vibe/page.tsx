import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { VIBE_META, topCitiesByVibe, cityVibe } from "@/lib/vibe";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import type { VibeTone } from "@/lib/vibe";
import type { CitySeed } from "@/data/cities-seed";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

export const metadata: Metadata = {
  title: "City Vibe Map France — energy & atmosphere by city | BestCitiesInFrance",
  description:
    "Which energy does each French city give off? Calm, lively, festive, restorative, intense — 352 cities ranked by atmosphere. Deterministic estimates, not real-time data.",
  alternates: { canonical: `${EN_BASE}/vibe` },
  openGraph: {
    title: "City Vibe Map — atmosphere of French cities",
    description: "What energy does each city give off? Derived from official quality-of-life scores.",
  },
};

const EN_TONE_LABELS: Record<VibeTone, { label: string; desc: string }> = {
  calme: { label: "Calm", desc: "Few crowds, ideal for settling in" },
  animé: { label: "Lively", desc: "Good energy, active shops and cafés" },
  festif: { label: "Festive", desc: "Events, nightlife, café terraces" },
  chargé: { label: "Intense", desc: "Dense, busy, constant movement" },
  ressourcant: { label: "Restorative", desc: "Nature nearby, fresh air, green spaces" },
};

const TONES: VibeTone[] = ["festif", "animé", "ressourcant", "calme", "chargé"];

function CityVibeCard({ city }: { city: CitySeed }) {
  const { tone } = cityVibe(city);
  const meta = VIBE_META[tone];
  const enLabel = EN_TONE_LABELS[tone];
  return (
    <Link
      href={`/cities/${city.slug}/vibe`}
      className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 hover:border-[var(--accent)]/40 hover:shadow-sm transition-all group"
    >
      <span className="text-xl shrink-0" aria-hidden>{meta.emoji}</span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
          {city.name}
        </div>
        <div className="text-xs text-[var(--text-tertiary)] truncate">{city.region}</div>
      </div>
      <span className={`text-xs font-bold shrink-0 ${meta.color}`}>{enLabel.label}</span>
    </Link>
  );
}

export default function EnVibePage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "City Vibe", path: "/vibe" },
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "French cities by vibe",
    description: "352 French cities grouped by atmosphere: calm, lively, festive, restorative, intense.",
    numberOfItems: CITIES_SEED.length,
    itemListElement: TONES.map((tone, i) => {
      const meta = VIBE_META[tone];
      const enMeta = EN_TONE_LABELS[tone];
      const count = CITIES_SEED.filter((c) => cityVibe(c).tone === tone).length;
      return {
        "@type": "ListItem",
        position: i + 1,
        name: `${meta.emoji} ${enMeta.label} cities`,
        description: `${count} cities — ${enMeta.desc}`,
      };
    }),
  };

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">ESTIMATE · not real-time</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            City Vibe Map
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            Which atmosphere does each French city give off? A deterministic estimate
            derived from quality-of-life scores, size and character tags — not
            real-time social media data. Refreshes with each data update.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-12">
        {TONES.map((tone) => {
          const meta = VIBE_META[tone];
          const enMeta = EN_TONE_LABELS[tone];
          const cities = topCitiesByVibe(tone, CITIES_SEED, 6);
          return (
            <section key={tone}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl" aria-hidden>{meta.emoji}</span>
                <div>
                  <h2 className={`text-xl font-bold ${meta.color}`}>{enMeta.label}</h2>
                  <p className="text-sm text-[var(--text-secondary)]">{enMeta.desc}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {cities.map((city) => (
                  <CityVibeCard key={city.slug} city={city} />
                ))}
              </div>
            </section>
          );
        })}

        <div className="rounded-xl border border-dashed border-[var(--border)] p-4 text-xs text-[var(--text-tertiary)] leading-relaxed">
          <strong className="text-[var(--text-secondary)]">Method:</strong> The vibe is computed
          from a weighted combination of culture, safety, transport and nature scores plus city
          size and geographic context (coastal, mountain, metropolitan…). It is not scraped from
          social media. All cities get the same deterministic formula — no editorial override.
        </div>
      </div>

      <Footer />
    </main>
  );
}
