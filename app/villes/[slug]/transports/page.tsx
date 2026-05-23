import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CITIES_SEED } from "@/data/cities-seed";
import { getTransit, transitTags, type Transit } from "@/lib/transit";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

// ISR Reads optimization: pure SSG (no Vercel Data Cache layer).
// revalidate=false → page built once at deploy, served from static edge cache.
export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ slug: c.slug }));
}

type City = (typeof CITIES_SEED)[number];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const t = getTransit(slug);
  const tags = transitTags(t);
  const summary = tags.length
    ? `${tags.join(" · ")} — score transports ${city.scores.transport.toFixed(1)}/10.`
    : `Score transports ${city.scores.transport.toFixed(1)}/10. Réseau urbain limité, mobilité majoritairement voiture/bus.`;
  return {
    title: `Transports à ${city.name} · Métro, tram, TGV, vélo | MaVilleIdeal`,
    description: `Réseau de transports à ${city.name} : ${summary} Sans-voiture, accessibilité, comparé à ${CITIES_SEED.length} villes.`,
    alternates: { canonical: `/villes/${slug}/transports` },
    openGraph: {
      title: `Transports à ${city.name}`,
      description: summary,
    },
  };
}

const SCORE_AVG = (() => {
  const values = CITIES_SEED.map((c) => c.scores.transport);
  return +(values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
})();

function transportSummary(city: City, t: Transit): string {
  const tags = transitTags(t);
  const score = city.scores.transport;
  if (tags.includes("Métro") && tags.includes("Tramway") && tags.includes("TGV")) {
    return `${city.name} fait partie des rares villes françaises à combiner métro, tramway et desserte TGV — un cas où vivre sans voiture est non seulement possible mais souvent plus efficace.`;
  }
  if (tags.includes("Métro")) {
    return `${city.name} dispose d'un métro et d'un réseau urbain dense. Vivre sans voiture y est tout à fait viable, surtout en centre-ville et le long des lignes structurantes.`;
  }
  if (tags.includes("Tramway") && tags.includes("TGV")) {
    return `${city.name} combine un tramway moderne et une desserte TGV — bon compromis entre mobilité urbaine quotidienne et accessibilité nationale.`;
  }
  if (tags.includes("Tramway")) {
    return `${city.name} s'appuie sur un tramway moderne plus un réseau de bus. Le centre se vit bien sans voiture ; les périphéries restent dépendantes.`;
  }
  if (tags.includes("TGV")) {
    return `${city.name} est sur le réseau TGV — pratique pour Paris ou un autre hub — mais la mobilité interne reste majoritairement voiture/bus.`;
  }
  if (score >= 6) {
    return `${city.name} ne dispose ni de métro ni de tramway, mais le réseau de bus et la marchabilité du centre permettent une vie quotidienne sans voiture pour qui choisit bien son quartier.`;
  }
  return `${city.name} reste une ville où la voiture est largement nécessaire au quotidien. Privilégier un logement central pour réduire les trajets motorisés.`;
}

function findSimilarTransitCities(city: City, all: readonly City[], n = 4): City[] {
  return [...all]
    .filter((c) => c.slug !== city.slug)
    .map((c) => ({ city: c, d: Math.abs(c.scores.transport - city.scores.transport) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map((x) => x.city);
}

const FEATURES: Array<{ key: keyof Transit; label: string; emoji: string; desc: string }> = [
  { key: "metro", label: "Métro", emoji: "🚇", desc: "Réseau métro lourd ou léger en service." },
  { key: "tram", label: "Tramway", emoji: "🚊", desc: "Tramway moderne sur rails ou pneus." },
  { key: "rer", label: "RER", emoji: "🚆", desc: "Lignes RER A–E (Île-de-France uniquement)." },
  { key: "tgv", label: "TGV", emoji: "🚄", desc: "Service TGV inOui ou Ouigo en gare principale." },
  { key: "bhns", label: "BHNS", emoji: "🚌", desc: "Bus à haut niveau de service en site propre." },
];

export default async function TransportsPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const t = getTransit(slug);
  const tags = transitTags(t);
  const summary = transportSummary(city, t);
  const similar = findSimilarTransitCities(city, CITIES_SEED);
  const score = city.scores.transport;
  const vsAvg = +(score - SCORE_AVG).toFixed(1);

  // Rank by transport score
  const sorted = [...CITIES_SEED].sort((a, b) => b.scores.transport - a.scores.transport);
  const rank = sorted.findIndex((c) => c.slug === city.slug) + 1;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `Transports à ${city.name}`,
    "about": city.name,
    "description": summary,
  };

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${slug}` },
    { name: "Transports", path: `/villes/${slug}/transports` },
  ]);

  return (
    <main id="main-content" className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />

      <section className="relative pt-20 pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-5">
            <Link href="/villes" className="hover:text-[var(--text-secondary)]">Villes</Link>
            <span>/</span>
            <Link href={`/villes/${slug}`} className="hover:text-[var(--text-secondary)]">{city.name}</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">Transports</span>
          </nav>
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            🚊 Mobilité & réseaux
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight leading-[1.05]">
            Transports à{" "}
            <span className="font-display gradient-text-anim italic">{city.name}</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl leading-relaxed">
            {summary}
          </p>
        </div>
      </section>

      {/* Score strip */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl glass border border-white/50 p-4 shadow-sm">
              <div className="text-xs text-[var(--text-tertiary)] mb-1">Score transports</div>
              <div className="text-3xl font-black font-mono-data text-[var(--text-primary)]">
                {score.toFixed(1)}<span className="text-base font-normal text-[var(--text-tertiary)]"> / 10</span>
              </div>
              <div className="text-[11px] mt-1">
                {Math.abs(vsAvg) < 0.3 ? (
                  <span className="text-[var(--text-tertiary)]">≈ moyenne FR</span>
                ) : vsAvg > 0 ? (
                  <span className="text-emerald-600">+{vsAvg} vs moyenne FR</span>
                ) : (
                  <span className="text-orange-600">{vsAvg} vs moyenne FR</span>
                )}
              </div>
            </div>
            <div className="rounded-2xl glass border border-white/50 p-4 shadow-sm">
              <div className="text-xs text-[var(--text-tertiary)] mb-1">Classement national</div>
              <div className="text-3xl font-black font-mono-data text-[var(--text-primary)]">
                #{rank}<span className="text-base font-normal text-[var(--text-tertiary)]"> / {sorted.length}</span>
              </div>
              <div className="text-[11px] mt-1 text-[var(--text-tertiary)]">
                {rank <= 20 ? "Top 20" : rank <= 50 ? "Top 50" : rank <= 100 ? "Top 100" : "Hors top 100"}
              </div>
            </div>
            <div className="rounded-2xl glass border border-white/50 p-4 shadow-sm">
              <div className="text-xs text-[var(--text-tertiary)] mb-1">Réseaux confirmés</div>
              <div className="text-base font-semibold text-[var(--text-primary)] leading-snug pt-1">
                {tags.length > 0 ? tags.join(" · ") : <span className="text-[var(--text-tertiary)] font-normal">Bus + voiture</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Réseaux disponibles</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {FEATURES.map((f) => {
              const present = !!t[f.key];
              return (
                <div
                  key={f.key}
                  className={`rounded-2xl border p-4 shadow-sm ${
                    present
                      ? "border-emerald-200/60 bg-emerald-50/40"
                      : "border-[var(--border)] bg-[var(--bg-canvas)] opacity-60"
                  }`}
                >
                  <div className="text-2xl mb-1">{f.emoji}</div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">{f.label}</div>
                  <div className={`text-[11px] mt-1 ${present ? "text-emerald-700" : "text-[var(--text-tertiary)]"}`}>
                    {present ? "Présent" : "Absent"}
                  </div>
                </div>
              );
            })}
            <div
              className={`rounded-2xl border p-4 shadow-sm ${
                t.velo
                  ? "border-emerald-200/60 bg-emerald-50/40"
                  : "border-[var(--border)] bg-[var(--bg-canvas)] opacity-60"
              }`}
            >
              <div className="text-2xl mb-1">🚲</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Vélo</div>
              <div className={`text-[11px] mt-1 ${t.velo ? "text-emerald-700" : "text-[var(--text-tertiary)]"}`}>
                {t.velo === "fort" ? "Réseau fort" : t.velo === "moyen" ? "Réseau correct" : "Limité"}
              </div>
            </div>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">
            Données réseau hand-curées à partir des cartes publiques RATP / SNCF / GART. Une absence indique que nous n&apos;avons pas confirmé la présence du réseau, pas nécessairement qu&apos;il n&apos;existe pas.
          </p>
        </div>
      </section>

      {/* Similar */}
      <section className="relative pb-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Villes au profil transports comparable</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {similar.map((c) => (
              <Link
                key={c.slug}
                href={`/villes/${c.slug}/transports`}
                className="group rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] transition-all px-4 py-3"
              >
                <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                  {c.name}
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                  Score {c.scores.transport.toFixed(1)} · {transitTags(getTransit(c.slug)).slice(0, 3).join(" · ") || "Bus"}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer nav */}
      <section className="relative pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex gap-3 flex-wrap">
          <Link
            href={`/villes/${slug}`}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            ← Profil complet de {city.name}
          </Link>
          <Link
            href="/classements/mobilite"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Classement sans voiture 🚲
          </Link>
          <Link
            href="/villes"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Toutes les villes
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
        <DiscussionCTA citySlug={city.slug} cityName={city.name} />
      </section>

      <Footer />
    </main>
  );
}
