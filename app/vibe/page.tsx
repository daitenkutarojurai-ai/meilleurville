import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CITIES_SEED } from "@/data/cities-seed";
import { VIBE_META, topCitiesByVibe, cityVibe } from "@/lib/vibe";
import type { VibeTone } from "@/lib/vibe";
import type { CitySeed } from "@/data/cities-seed";

export const revalidate = false;
export const dynamicParams = false;

export const metadata: Metadata = {
  title: "Ambiance des villes France — Vibe Map | MaVilleIdeal",
  description:
    "Estimations éditoriales : quelle énergie se dégage de chaque ville française ? Calme, animé, festif, ressourcant, chargé — 352 villes classées par ambiance.",
  alternates: { canonical: "/vibe" },
  openGraph: {
    title: "Vibe Map — Ambiance des villes françaises",
    description: "Quelle énergie se dégage de chaque ville ? Estimation dérivée des scores officiels.",
  },
};

const TONES: VibeTone[] = ["festif", "animé", "ressourcant", "calme", "chargé"];

function CityVibeCard({ city }: { city: CitySeed }) {
  const { tone } = cityVibe(city);
  const meta = VIBE_META[tone];
  return (
    <Link
      href={`/villes/${city.slug}`}
      className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 hover:border-[var(--accent)]/40 hover:shadow-sm transition-all group"
    >
      <span className="text-xl shrink-0" aria-hidden>{meta.emoji}</span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
          {city.name}
        </div>
        <div className="text-xs text-[var(--text-tertiary)] truncate">{city.region}</div>
      </div>
      <span className={`text-xs font-bold shrink-0 ${meta.color}`}>{meta.label}</span>
    </Link>
  );
}

export default function VibePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ambiance des villes françaises — Vibe Map",
    description:
      "Estimation éditoriale de l'ambiance par ville, dérivée des scores officiels de qualité de vie.",
    url: "https://www.mavilleideale.fr/vibe",
    numberOfItems: CITIES_SEED.length,
    itemListElement: TONES.flatMap((tone, toneIdx) =>
      topCitiesByVibe(tone, CITIES_SEED, 6).map((city, i) => ({
        "@type": "ListItem",
        position: toneIdx * 6 + i + 1,
        name: city.name,
        url: `https://www.mavilleideale.fr/villes/${city.slug}`,
      }))
    ),
  };

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Outils", href: "/outils" },
              { label: "Vibe Map" },
            ]}
          />
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="accent">Estimation</Badge>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-700">
              ESTIMÉ
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
            Ambiance des villes — aujourd&apos;hui
          </h1>
          <p className="text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            Ces estimations sont calculées depuis les scores de chaque ville (culture, nature,
            sécurité, qualité de vie), pas des données en temps réel.
            Une ville{" "}<strong>festive</strong> a un score culture élevé. Une ville{" "}
            <strong>ressourcante</strong> a un score nature supérieur au coût contenu.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 space-y-12">
        {TONES.map((tone) => {
          const meta = VIBE_META[tone];
          const cities = topCitiesByVibe(tone, CITIES_SEED, 6);
          return (
            <section key={tone} aria-labelledby={`vibe-${tone}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl" aria-hidden>{meta.emoji}</span>
                <div>
                  <h2
                    id={`vibe-${tone}`}
                    className={`text-lg font-bold ${meta.color}`}
                  >
                    {meta.label}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">{meta.desc}</p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {cities.map((city) => (
                  <CityVibeCard key={city.slug} city={city} />
                ))}
              </div>
            </section>
          );
        })}

        <aside className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/50 px-5 py-4 text-sm text-[var(--text-secondary)] leading-relaxed">
          <strong className="text-[var(--text-primary)]">Méthodologie.</strong>{" "}
          Ces estimations sont entièrement déterministes. Aucun appel API, aucune donnée
          en temps réel. L&apos;ambiance d&apos;une ville est dérivée de ses scores officiels
          (culture, nature, sécurité, qualité de vie globale) selon une grille éditoriale
          fixe. Elles reflètent le caractère structurel d&apos;une ville, pas son actualité.
          Pour des données réelles, consultez les{" "}
          <Link href="/classements" className="underline hover:text-[var(--accent)]">
            classements
          </Link>{" "}
          et les{" "}
          <Link href="/villes" className="underline hover:text-[var(--accent)]">
            fiches villes
          </Link>
          .
        </aside>
      </div>

      <Footer />
    </main>
  );
}
