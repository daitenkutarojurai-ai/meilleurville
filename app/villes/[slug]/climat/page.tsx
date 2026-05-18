import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CITIES_SEED } from "@/data/cities-seed";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { sunshineDays } from "@/lib/utils";

// ISR Reads optimization: pure SSG (no Vercel Data Cache layer).
// revalidate=false → page built once at deploy, served from static edge cache.
export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ slug: c.slug }));
}

type City = (typeof CITIES_SEED)[number];

type ClimateType =
  | { id: "tropical-antilles"; label: "Tropical caribéen"; emoji: "🏝️"; oneLiner: string }
  | { id: "tropical-indien"; label: "Tropical océan Indien"; emoji: "🌴"; oneLiner: string }
  | { id: "equatorial"; label: "Équatorial amazonien"; emoji: "🌿"; oneLiner: string }
  | { id: "mediterranean"; label: "Méditerranéen"; emoji: "🌞"; oneLiner: string }
  | { id: "mountain"; label: "Montagnard"; emoji: "🏔️"; oneLiner: string }
  | { id: "oceanic"; label: "Océanique"; emoji: "🌊"; oneLiner: string }
  | { id: "semi-continental"; label: "Semi-continental"; emoji: "🍇"; oneLiner: string }
  | { id: "oceanic-degraded"; label: "Océanique dégradé"; emoji: "🌤️"; oneLiner: string };

function classifyClimate(c: City): ClimateType {
  const { latitude, longitude, elevation, region } = c;

  // DROM
  if (region === "Martinique" || region === "Guadeloupe") {
    return { id: "tropical-antilles", label: "Tropical caribéen", emoji: "🏝️",
      oneLiner: "Climat chaud toute l'année (≈25–28 °C), saison sèche de décembre à avril, saison humide et cyclonique de juin à novembre." };
  }
  if (region === "La Réunion" || region === "Mayotte") {
    return { id: "tropical-indien", label: "Tropical océan Indien", emoji: "🌴",
      oneLiner: "Climat tropical inversé (été austral chaud et humide, hiver austral plus frais et sec). Microclimats marqués selon l'altitude et l'exposition." };
  }
  if (region === "Guyane") {
    return { id: "equatorial", label: "Équatorial amazonien", emoji: "🌿",
      oneLiner: "Climat équatorial chaud et humide toute l'année, deux saisons des pluies (décembre-février et avril-juin)." };
  }

  // Mountain (elevation > 600m)
  if (elevation && elevation >= 600) {
    return { id: "mountain", label: "Montagnard", emoji: "🏔️",
      oneLiner: "Climat de montagne : étés frais, hivers froids et neigeux, fort écart thermique jour/nuit, ensoleillement souvent supérieur en altitude." };
  }

  // Mediterranean — south of 44° lat AND east of 2° lng (covers PACA, Occitanie côte, Corse)
  if (latitude && latitude < 44 && longitude && longitude > 2) {
    return { id: "mediterranean", label: "Méditerranéen", emoji: "🌞",
      oneLiner: "Étés chauds et secs, hivers doux, ensoleillement généreux (2 600–2 900 h/an), épisodes de mistral ou tramontane selon les zones." };
  }

  // Oceanic — Brittany / Normandy / west of -1° lng
  if (longitude && longitude < -1) {
    return { id: "oceanic", label: "Océanique", emoji: "🌊",
      oneLiner: "Climat océanique tempéré : amplitudes thermiques faibles, pluies réparties toute l'année, étés doux et hivers cléments." };
  }

  // Semi-continental — Grand Est, Bourgogne, est de la France
  if (longitude && longitude > 4.5) {
    return { id: "semi-continental", label: "Semi-continental", emoji: "🍇",
      oneLiner: "Étés chauds parfois orageux, hivers froids avec épisodes de gel marqués, écarts thermiques saisonniers prononcés." };
  }

  // Default — middle France
  return { id: "oceanic-degraded", label: "Océanique dégradé", emoji: "🌤️",
    oneLiner: "Climat de transition entre océanique et continental : étés modérés à chauds, hivers frais, pluies bien réparties." };
}

function bestMonths(t: ClimateType): { best: string; avoid: string } {
  switch (t.id) {
    case "mediterranean":
      return { best: "Mai à juin · Septembre à octobre", avoid: "Juillet–août (chaleur, affluence touristique)" };
    case "mountain":
      return { best: "Juin–septembre (randonnée) · Décembre–mars (ski)", avoid: "Avril & novembre (intersaison, peu d'ouverture)" };
    case "oceanic":
      return { best: "Juin à septembre", avoid: "Novembre–février (tempêtes, jours courts)" };
    case "semi-continental":
      return { best: "Mai à juin · Septembre", avoid: "Janvier–février (gel) · Août (canicules récentes)" };
    case "oceanic-degraded":
      return { best: "Mai à septembre", avoid: "Décembre–février (gris persistant)" };
    case "tropical-antilles":
      return { best: "Décembre à avril (saison sèche, le carême)", avoid: "Septembre–octobre (pic cyclonique)" };
    case "tropical-indien":
      return { best: "Mai à novembre (saison fraîche, sèche)", avoid: "Janvier–mars (saison cyclonique, forte humidité)" };
    case "equatorial":
      return { best: "Septembre à novembre (petite saison sèche)", avoid: "Avril–juin (grande saison des pluies)" };
  }
}

function findSimilarCities(city: City, all: readonly City[], n = 4): City[] {
  // Distance metric across temp + sunshine + elevation, weighted.
  const sun = city.sunshinedays ?? 1900;
  const tj = city.avgTempJuly ?? 22;
  const ta = city.avgTempJanuary ?? 5;
  const el = city.elevation ?? 100;
  return [...all]
    .filter((c) => c.slug !== city.slug)
    .map((c) => ({
      city: c,
      d:
        Math.abs((c.sunshinedays ?? 1900) - sun) / 200 +
        Math.abs((c.avgTempJuly ?? 22) - tj) * 1.5 +
        Math.abs((c.avgTempJanuary ?? 5) - ta) * 1.5 +
        Math.abs((c.elevation ?? 100) - el) / 200,
    }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map((x) => x.city);
}

const NATIONAL_AVG = (() => {
  const sun = CITIES_SEED.map((c) => c.sunshinedays).filter((v): v is number => typeof v === "number");
  const tj = CITIES_SEED.map((c) => c.avgTempJuly).filter((v): v is number => typeof v === "number");
  const ta = CITIES_SEED.map((c) => c.avgTempJanuary).filter((v): v is number => typeof v === "number");
  return {
    sun: Math.round(sun.reduce((a, b) => a + b, 0) / sun.length),
    tj: +(tj.reduce((a, b) => a + b, 0) / tj.length).toFixed(1),
    ta: +(ta.reduce((a, b) => a + b, 0) / ta.length).toFixed(1),
  };
})();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const climate = classifyClimate(city);
  return {
    title: `Climat de ${city.name} · ${climate.label}, températures, ensoleillement | MeilleurVille`,
    description: `Climat ${climate.label.toLowerCase()} à ${city.name} : ${city.avgTempJuly ?? "–"} °C en juillet, ${city.avgTempJanuary ?? "–"} °C en janvier, ${sunshineDays(city.sunshinedays) ?? "–"} jours de soleil par an. Quand y aller, à quoi s'attendre.`,
    alternates: { canonical: `/villes/${slug}/climat` },
    openGraph: {
      title: `Climat de ${city.name} · ${climate.label}`,
      description: `${sunshineDays(city.sunshinedays) ?? "–"} j de soleil · ${city.avgTempJuly ?? "–"}/${city.avgTempJanuary ?? "–"} °C juillet/janvier`,
    },
  };
}

function Diff({ value, baseline, suffix }: { value: number | null; baseline: number; suffix: string }) {
  if (value == null) return <span className="text-[var(--text-tertiary)]">—</span>;
  const d = +(value - baseline).toFixed(1);
  if (Math.abs(d) < 0.5) return <span className="text-[var(--text-tertiary)]">≈ moyenne</span>;
  const positive = d > 0;
  return (
    <span className={positive ? "text-green-500" : "text-orange-500"}>
      {positive ? "+" : ""}{d}{suffix} vs moyenne FR
    </span>
  );
}

export default async function ClimatPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const climate = classifyClimate(city);
  const { best, avoid } = bestMonths(climate);
  const similar = findSimilarCities(city, CITIES_SEED);

  // Ranking among all cities for sunshine
  const sunRank = (() => {
    if (city.sunshinedays == null) return null;
    const sorted = [...CITIES_SEED]
      .filter((c) => typeof c.sunshinedays === "number")
      .sort((a, b) => (b.sunshinedays as number) - (a.sunshinedays as number));
    const idx = sorted.findIndex((c) => c.slug === city.slug);
    return idx >= 0 ? { rank: idx + 1, total: sorted.length } : null;
  })();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `Climat de ${city.name}`,
    "about": city.name,
    "description": `Climat ${climate.label.toLowerCase()} à ${city.name}. ${climate.oneLiner}`,
  };

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${slug}` },
    { name: "Climat", path: `/villes/${slug}/climat` },
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
            <span className="text-[var(--text-secondary)]">Climat</span>
          </nav>
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            {climate.emoji} Climat {climate.label.toLowerCase()}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight leading-[1.05]">
            Climat de{" "}
            <span className="font-display gradient-text-anim italic">{city.name}</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl leading-relaxed">
            {climate.oneLiner}
          </p>
        </div>
      </section>

      {/* Stat strip */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl glass border border-white/50 p-4 shadow-sm">
              <div className="text-xs text-[var(--text-tertiary)] mb-1">☀️ Ensoleillement</div>
              <div className="text-2xl font-black font-mono-data text-[var(--text-primary)]">
                {sunshineDays(city.sunshinedays) ?? "—"}
                <span className="text-sm font-normal text-[var(--text-tertiary)] ml-1">j/an</span>
              </div>
              <div className="text-[11px] mt-1"><Diff value={sunshineDays(city.sunshinedays)} baseline={sunshineDays(NATIONAL_AVG.sun) ?? 0} suffix=" j" /></div>
            </div>
            <div className="rounded-2xl glass border border-white/50 p-4 shadow-sm">
              <div className="text-xs text-[var(--text-tertiary)] mb-1">🌡️ Été (juillet)</div>
              <div className="text-2xl font-black font-mono-data text-[var(--text-primary)]">
                {city.avgTempJuly ?? "—"}
                <span className="text-sm font-normal text-[var(--text-tertiary)] ml-1">°C</span>
              </div>
              <div className="text-[11px] mt-1"><Diff value={city.avgTempJuly} baseline={NATIONAL_AVG.tj} suffix=" °C" /></div>
            </div>
            <div className="rounded-2xl glass border border-white/50 p-4 shadow-sm">
              <div className="text-xs text-[var(--text-tertiary)] mb-1">❄️ Hiver (janvier)</div>
              <div className="text-2xl font-black font-mono-data text-[var(--text-primary)]">
                {city.avgTempJanuary ?? "—"}
                <span className="text-sm font-normal text-[var(--text-tertiary)] ml-1">°C</span>
              </div>
              <div className="text-[11px] mt-1"><Diff value={city.avgTempJanuary} baseline={NATIONAL_AVG.ta} suffix=" °C" /></div>
            </div>
            <div className="rounded-2xl glass border border-white/50 p-4 shadow-sm">
              <div className="text-xs text-[var(--text-tertiary)] mb-1">⛰️ Altitude</div>
              <div className="text-2xl font-black font-mono-data text-[var(--text-primary)]">
                {city.elevation ?? "—"}
                <span className="text-sm font-normal text-[var(--text-tertiary)] ml-1">m</span>
              </div>
              <div className="text-[11px] mt-1 text-[var(--text-tertiary)]">
                {city.elevation != null && city.elevation > 600 ? "Effet montagne" : city.elevation != null && city.elevation < 30 ? "Quasi mer" : "Plaine"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* When to go */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl glass border border-emerald-200/60 bg-emerald-50/40 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-widest text-emerald-700 font-semibold mb-2">✅ Idéal</div>
            <div className="text-base font-semibold text-[var(--text-primary)] leading-snug">{best}</div>
          </div>
          <div className="rounded-2xl glass border border-orange-200/60 bg-orange-50/40 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-widest text-orange-700 font-semibold mb-2">⚠️ À éviter</div>
            <div className="text-base font-semibold text-[var(--text-primary)] leading-snug">{avoid}</div>
          </div>
        </div>
      </section>

      {/* Sunshine ranking */}
      {sunRank && (
        <section className="relative pb-8">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="rounded-2xl glass border border-white/50 p-6 shadow-sm">
              <div className="flex items-baseline gap-3 flex-wrap">
                <div className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold">Classement ensoleillement</div>
                <div className="text-2xl font-black font-mono-data text-[var(--text-primary)]">
                  #{sunRank.rank}<span className="text-base font-normal text-[var(--text-tertiary)]"> / {sunRank.total}</span>
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                {city.name} se classe {sunRank.rank}<sup>e</sup> sur {sunRank.total} villes pour les heures d&apos;ensoleillement annuel —
                {sunRank.rank <= 30 ? " parmi les plus ensoleillées de France." :
                 sunRank.rank <= 100 ? " au-dessus de la moyenne nationale." :
                 sunRank.rank >= sunRank.total - 30 ? " parmi les villes les moins ensoleillées." :
                 " dans la moyenne nationale."}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Similar cities */}
      <section className="relative pb-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
            Villes au climat comparable
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {similar.map((c) => (
              <Link
                key={c.slug}
                href={`/villes/${c.slug}/climat`}
                className="group rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] transition-all px-4 py-3"
              >
                <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                  {c.name}
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5 truncate">
                  {sunshineDays(c.sunshinedays) ?? "—"} j · {c.avgTempJuly ?? "—"}/{c.avgTempJanuary ?? "—"} °C
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
            href="/classements/soleil"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Classement soleil ☀️
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
