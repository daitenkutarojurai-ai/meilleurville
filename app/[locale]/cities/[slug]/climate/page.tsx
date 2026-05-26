import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { scoreColor, sunshineDays } from "@/lib/utils";
import { nearestStation, distanceToNearestKm, CLIMATE_SOURCE } from "@/lib/climate-normals";
import { ClimateChart } from "@/components/ClimateChart";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) return {};
  return {
    title: `${c.name} climate — temperatures, sunshine, rainfall (2026)`,
    description: `Climate in ${c.name}: average temperatures, annual sunshine, rainfall, and what it actually feels like to live there year-round.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/climate` },
  };
}

function classifyClimateEn(c: (typeof CITIES_SEED)[number]): { label: string; emoji: string; line: string } {
  const { latitude, longitude, elevation, region } = c;
  if (region === "Martinique" || region === "Guadeloupe")
    return { label: "Caribbean tropical", emoji: "🏝️", line: "Warm year-round (25–28 °C), dry season December–April, wet and cyclone season June–November." };
  if (region === "La Réunion" || region === "Mayotte")
    return { label: "Indian-Ocean tropical", emoji: "🌴", line: "Reversed-hemisphere tropical climate (warm humid austral summer, cooler drier austral winter). Strong microclimates by altitude." };
  if (region === "Guyane")
    return { label: "Amazon equatorial", emoji: "🌿", line: "Hot and humid year-round, two rainy seasons (December–February, April–June)." };
  if (elevation && elevation >= 600)
    return { label: "Mountain climate", emoji: "🏔️", line: "Cool summers, cold snowy winters, large day-night thermal swings, often more sunshine at altitude." };
  if (latitude && latitude < 44 && longitude && longitude > 2)
    return { label: "Mediterranean", emoji: "🌞", line: "Hot dry summers, mild winters, generous sunshine (2 600–2 900 h/yr), mistral or tramontane episodes." };
  if (longitude && longitude < -1)
    return { label: "Oceanic", emoji: "🌊", line: "Temperate oceanic climate: low thermal swings, rain spread throughout the year, mild summers and gentle winters." };
  if (longitude && longitude > 4.5)
    return { label: "Semi-continental", emoji: "🍇", line: "Warm sometimes stormy summers, cold winters with marked frost episodes, pronounced seasonal swings." };
  return { label: "Degraded oceanic", emoji: "🌤️", line: "Transitional climate between oceanic and continental: moderate-to-warm summers, cool winters, well-distributed rain." };
}

export default async function EnCityClimate({ params }: Props) {
  const { slug } = await params;
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) notFound();

  const climate = classifyClimateEn(c);
  const sunDays = sunshineDays(c.sunshinedays);

  const station = nearestStation(c);
  const stationDist = distanceToNearestKm(c);
  const monthlyNormals =
    station && (stationDist == null || stationDist <= 120)
      ? station.months.map((m) => ({
          tempAvg: m.tempAvg,
          tempMin: m.tempMin,
          tempMax: m.tempMax,
          precipMm: m.precipMm,
          sunHours: m.sunHours,
        }))
      : null;

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-16 pb-8">
        <nav className="mb-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          {" · "}
          <Link href="/cities" className="hover:text-[var(--accent)]">Cities</Link>
          {" · "}
          <Link href={`/cities/${slug}`} className="hover:text-[var(--accent)]">{c.name}</Link>
          {" · "}
          <span>Climate</span>
        </nav>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl" aria-hidden>{climate.emoji}</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Climate in {c.name}
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          <strong className="text-[var(--text-primary)]">{climate.label}.</strong> {climate.line}
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6 grid sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">Annual sunshine</p>
          <p className="font-mono-data text-2xl font-bold text-[var(--text-primary)]">{sunDays} days</p>
          {c.sunshinedays && <p className="text-xs text-[var(--text-tertiary)] mt-1">≈ {c.sunshinedays} hours</p>}
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">July avg</p>
          <p className="font-mono-data text-2xl font-bold text-[var(--text-primary)]">{c.avgTempJuly ? `${c.avgTempJuly} °C` : "—"}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">January avg</p>
          <p className="font-mono-data text-2xl font-bold text-[var(--text-primary)]">{c.avgTempJanuary ? `${c.avgTempJanuary} °C` : "—"}</p>
        </div>
      </section>

      {monthlyNormals && (
        <section className="mx-auto max-w-3xl px-4 sm:px-6 py-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <ClimateChart months={monthlyNormals} source={CLIMATE_SOURCE} stationDist={stationDist} locale="en" />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">What it feels like</h2>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          {c.name}'s nature axis scores{" "}
          <span className={`font-mono-data font-bold ${scoreColor(c.scores.nature)}`}>{c.scores.nature.toFixed(1)}/10</span>{" "}
          — this captures green-space access, air quality (ATMO), and the overall outdoor setting, not just temperatures.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/cities/${slug}`} className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-white font-semibold hover:opacity-90">Back to {c.name}</Link>
          <Link href="/rankings/climat" className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">Comfort climate ranking</Link>
          <Link href="/rankings/soleil" className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">Sunniest cities</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
