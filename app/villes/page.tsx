import { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge } from "@/components/EmojiBadge";
import { scoreHex } from "@/lib/utils";
import { VillesSearch } from "@/components/VillesSearch";
import { CITIES_SEED } from "@/data/cities-seed";
import { CITIES_LIGHT, LEAN_META } from "@/lib/cities-light";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";
import { pathAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Explorer toutes les villes françaises · Avis & Classements",
  description: `Découvrez les meilleures villes françaises : avis d'habitants, scores de qualité de vie, données locales. ${CITIES_COUNT} communes analysées et comparées.`,
  alternates: pathAlternates("/villes", "/cities"),
};

export default function VillesPage() {
  const count = CITIES_SEED.length;
  const avg = (CITIES_SEED.reduce((s, c) => s + c.scores.global, 0) / count).toFixed(1);
  const topPct = Math.round((CITIES_SEED.filter((c) => c.scores.global >= 7.5).length / count) * 100);
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      {/* Hero en aurore, pastille emoji, titre dégradé (identité « Couleurs ») */}
      <section className="relative overflow-hidden bg-aurora pt-14 pb-12 sm:pt-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <EmojiBadge emoji="🧭" tone="indigo" size="lg" className="mb-5 shadow-[0_12px_28px_-12px_rgba(79,70,229,0.6)]" />
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            🌍 {count} villes profilées
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
            Explorez la France,{" "}
            <span className="font-display gradient-text-anim italic">ville par ville</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            Scores calibrés sur Insee + Ministère Intérieur,{" "}
            <Link href="/avis" className="font-medium text-[var(--accent)] hover:underline">
              avis d&apos;habitants
            </Link>
            , données locales. Filtrez, triez, comparez — sans bullshit.
          </p>

          {/* Honest mini stats, en tuiles pastel */}
          <dl className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-2xl bg-white/85 px-2 py-3 shadow-[0_10px_24px_-16px_rgba(79,70,229,0.6)] ring-1 ring-[#C7D2FE]">
              <dt className="sr-only">Villes</dt>
              <dd className="font-mono-data text-2xl font-bold text-[#4338CA]">{count}</dd>
              <dd className="text-xs text-[var(--text-secondary)]">villes</dd>
            </div>
            <div className="rounded-2xl bg-white/85 px-2 py-3 shadow-[0_10px_24px_-16px_rgba(219,39,119,0.6)] ring-1 ring-[#FBCFE8]">
              <dt className="sr-only">Score moyen</dt>
              <dd className="font-mono-data text-2xl font-bold text-[#BE185D]">{avg}</dd>
              <dd className="text-xs text-[var(--text-secondary)]">/10 score moyen</dd>
            </div>
            <div className="rounded-2xl bg-white/85 px-2 py-3 shadow-[0_10px_24px_-16px_rgba(8,145,178,0.6)] ring-1 ring-[#A5F3FC]">
              <dt className="sr-only">Part des villes notées 7,5 ou plus</dt>
              <dd className="flex items-center justify-center gap-1.5 font-mono-data text-2xl font-bold text-[#0E7490]">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: scoreHex(7.5) }} aria-hidden />
                {topPct}%
              </dd>
              <dd className="text-xs text-[var(--text-secondary)]">avec score ≥ 7.5</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Recherche + grille en bande ciel */}
      <section className="band band-sky">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <VillesSearch cities={CITIES_LIGHT} leanMeta={LEAN_META} />
        </div>
      </section>

      {/* La grille ne rend que ses 60 premières cartes (le reste au clic). Cet
          index donne un lien HTML vers chaque ville, lisible sans JavaScript :
          deux balises par ville, styles portés par la liste. */}
      <section className="band band-lilac">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <details className="group overflow-hidden rounded-2xl bg-white shadow-[0_14px_32px_-20px_rgba(124,58,237,0.6)]">
            <summary className="grad-head-4 flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
              <span aria-hidden className="text-lg leading-none">🔤</span>
              <span className="flex-1">Index A → Z des {CITIES_LIGHT.length} villes</span>
              <span aria-hidden className="text-lg leading-none transition-transform group-open:rotate-45">+</span>
            </summary>
            <ul className="columns-2 gap-x-6 p-5 text-sm sm:columns-3 lg:columns-4 [&_a]:inline-block [&_a]:py-1.5 [&_a]:text-[var(--text-secondary)] [&_a:hover]:text-[var(--accent)]">
              {[...CITIES_LIGHT]
                .sort((a, b) => a.name.localeCompare(b.name, "fr"))
                .map((c) => (
                  <li key={c.slug}>
                    <Link href={`/villes/${c.slug}`}>{c.name}</Link>
                  </li>
                ))}
            </ul>
          </details>
        </div>
      </section>

      <Footer />
    </main>
  );
}
