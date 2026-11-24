import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { VillesSearch } from "@/components/VillesSearch";
import { EmojiBadge } from "@/components/EmojiBadge";
import { CITIES_LIGHT, LEAN_META } from "@/lib/cities-light";
import { t, pathAlternatesEn } from "@/lib/i18n";
import { CITIES_COUNT } from "@/lib/site-stats";

export const metadata: Metadata = {
  title: "Explore every French city · Reviews & 2027 rankings",
  description: `${CITIES_COUNT} French cities profiled with calibrated quality-of-life scores, resident reviews and local data. Filter by region, lifestyle and terrain.`,
  alternates: pathAlternatesEn("/villes", "/cities"),
};

export default function EnCitiesIndex() {
  const count = CITIES_LIGHT.length;
  const avg = (
    CITIES_LIGHT.reduce((s, c) => s + c.scores.global, 0) / count
  ).toFixed(1);

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      {/* Hero in aurora, emoji badge, gradient title (« Couleurs » identity) */}
      <section className="relative overflow-hidden bg-aurora pt-14 pb-12 sm:pt-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <EmojiBadge emoji="🧭" tone="indigo" size="lg" className="mb-5 shadow-[0_12px_28px_-12px_rgba(79,70,229,0.6)]" />
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            🌍 {count} profiled cities
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05] mb-4 gradient-text">
            {t("cities.title", "en")}
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            {t("cities.intro", "en")}
          </p>
          <dl className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-2 sm:gap-3">
            <div className="rounded-2xl bg-white/85 px-2 py-3 shadow-[0_10px_24px_-16px_rgba(79,70,229,0.6)] ring-1 ring-[#C7D2FE]">
              <dt className="sr-only">Cities</dt>
              <dd className="font-mono-data text-2xl font-bold text-[#4338CA]">{count}</dd>
              <dd className="text-xs text-[var(--text-secondary)]">cities</dd>
            </div>
            <div className="rounded-2xl bg-white/85 px-2 py-3 shadow-[0_10px_24px_-16px_rgba(219,39,119,0.6)] ring-1 ring-[#FBCFE8]">
              <dt className="sr-only">Average score</dt>
              <dd className="font-mono-data text-2xl font-bold text-[#BE185D]">{avg}</dd>
              <dd className="text-xs text-[var(--text-secondary)]">average score /10</dd>
            </div>
          </dl>
          <p className="mt-6 text-[var(--text-secondary)] max-w-2xl mx-auto">
            Filter and sort here, or start from{" "}
            <Link href="/reviews" className="font-medium text-[var(--accent)] hover:underline">
              the ratings themselves and what residents wrote about them
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Search + grid on a sky band */}
      <section className="band band-sky">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <VillesSearch cities={CITIES_LIGHT} leanMeta={LEAN_META} locale="en" />
        </div>
      </section>

      {/* The grid renders its first 60 cards only (the rest on click). This index
          keeps a plain HTML link to every city, readable without JavaScript. */}
      <section className="band band-lilac">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <details className="group overflow-hidden rounded-2xl bg-white shadow-[0_14px_32px_-20px_rgba(124,58,237,0.6)]">
            <summary className="grad-head-4 flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
              <span aria-hidden className="text-lg leading-none">🔤</span>
              <span className="flex-1">A → Z index of all {count} cities</span>
              <span aria-hidden className="text-lg leading-none transition-transform group-open:rotate-45">+</span>
            </summary>
            <ul className="columns-2 gap-x-6 p-5 text-sm sm:columns-3 lg:columns-4 [&_a]:inline-block [&_a]:py-1.5 [&_a]:text-[var(--text-secondary)] [&_a:hover]:text-[var(--accent)]">
              {[...CITIES_LIGHT]
                .sort((a, b) => a.name.localeCompare(b.name, "fr"))
                .map((c) => (
                  <li key={c.slug}>
                    <Link href={`/cities/${c.slug}`}>{c.name}</Link>
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
