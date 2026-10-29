import type { Metadata } from "next";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import Link from "@/components/AppLink";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { computeOwnerScores } from "@/lib/owner-scores";
import { climateZoneFor, transitPassFor } from "@/lib/cost-living";
import { scoreColor } from "@/lib/utils";
import { cityAlternatesEn } from "@/lib/i18n";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };
type Seed = (typeof CITIES_SEED)[number];

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) return {};
  return {
    title: `Working remotely from ${c.name} — fibre, coworking, real cost (2026)`,
    description: `${c.name} for remote work: fibre coverage, quality-of-life score, monthly remote-worker budget and the ideal profile. Built on calibrated city data.`,
    alternates: cityAlternatesEn("remote-work", slug),
  };
}

// Coworking density heuristic — derived from population + city tags.
function coworkingDensity(city: Seed): { label: string; count: string; tone: string } {
  const pop = city.population ?? 50000;
  const isMetro = city.characterTags.some((t) =>
    ["métropole", "dynamique", "tech", "étudiant"].includes(t),
  );
  if (pop > 300000 || (pop > 150000 && isMetro)) {
    return { label: "Dense", count: "20-40+ spaces", tone: "text-emerald-700 bg-emerald-100 border-emerald-300" };
  }
  if (pop > 100000 || isMetro) {
    return { label: "Good", count: "10-20 spaces", tone: "text-lime-700 bg-lime-100 border-lime-300" };
  }
  if (pop > 50000) {
    return { label: "Moderate", count: "3-10 spaces", tone: "text-amber-700 bg-amber-100 border-amber-300" };
  }
  return { label: "Limited", count: "0-3 spaces", tone: "text-orange-700 bg-orange-100 border-orange-300" };
}

function profileFor(city: Seed): { match: string; explanation: string } {
  const remote = city.scores.remoteWork;
  const life = city.scores.life;
  const cost = city.scores.cost;
  const culture = city.scores.culture;

  if (remote >= 8 && life >= 8 && cost >= 6.5) {
    return {
      match: "Ideal for senior remote workers",
      explanation:
        "High remote-work score plus quality of life plus a reasonable cost of living — a rare combination, and typically the target of \"leaving Paris\" relocations.",
    };
  }
  if (remote >= 7.5 && culture >= 8) {
    return {
      match: "A fit for creative profiles",
      explanation:
        "Good remote infrastructure and a dense cultural scene — well suited to creative freelancers, journalists and independent consultants.",
    };
  }
  if (remote >= 7 && cost >= 7.5) {
    return {
      match: "Strong budget-to-remote ratio",
      explanation: "Solid infrastructure with a cost of living well below the national average.",
    };
  }
  if (remote >= 7) {
    return {
      match: "Fine for occasional remote work",
      explanation:
        "Infrastructure is fine for 2-3 days a week, but with no particular edge over another city of the same size.",
    };
  }
  if (remote < 5.5) {
    return {
      match: "Not well suited to fully remote work",
      explanation:
        "Network, setting and remote culture sit below average — better suited to an on-site or hybrid arrangement.",
    };
  }
  return {
    match: "Mixed — depends on your situation",
    explanation: "An average remote-work score: neither a good nor a bad pick. Judge it against your own profile.",
  };
}

const ROUGH_HEATING = { H1a: 95, H1b: 90, H1c: 80, H2a: 65, H2b: 60, H2c: 55, H2d: 70, H3: 40 } as const;

export default async function EnCityRemoteWork({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const ownerScores = computeOwnerScores(city);
  const ownerRemote = ownerScores.find((s) => s.key === "score_teletravail")!;
  const ownerSolitude = ownerScores.find((s) => s.key === "score_solitude")!;
  const ownerNoise = ownerScores.find((s) => s.key === "score_bruit")!;
  const ownerAir = ownerScores.find((s) => s.key === "score_qualite_air")!;

  const housing = getHousing(city.slug);
  const zone = climateZoneFor(city.department);
  const transitPass = transitPassFor(city.slug);

  const heating = zone ? ROUGH_HEATING[zone] : 65;
  const housingBudget = (housing?.avgRentT2 ?? 800) + heating + (transitPass ?? 80);

  const cowork = coworkingDensity(city);
  const profile = profileFor(city);

  const SIGNALS = [
    { label: "Remote-work score", value: city.scores.remoteWork, ctx: "Fibre plus remote-friendly setting (official axis)" },
    { label: "Connectivity score", value: ownerRemote.value, ctx: "Department FTTH coverage included" },
    { label: "Quiet", value: ownerNoise.value, ctx: "Matters when you work from the sofa" },
    { label: "Air quality", value: ownerAir.value, ctx: "PM2.5 — relevant when you open the windows" },
    { label: "Social connection", value: ownerSolitude.value, ctx: "Lower isolation risk for people living solo" },
    { label: "Quality of life", value: city.scores.life, ctx: "The air, the water, the everyday" },
  ];

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: city.name, path: `/cities/${slug}` },
    { name: "Remote work", path: `/cities/${slug}/remote-work` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="relative overflow-hidden bg-aurora pt-12 pb-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="mb-3 text-sm text-[var(--text-secondary)]">
            <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
            {" · "}
            <Link href="/cities" className="hover:text-[var(--accent)]">Cities</Link>
            {" · "}
            <Link href={`/cities/${slug}`} className="hover:text-[var(--accent)]">{city.name}</Link>
            {" · "}
            <span>Remote work</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Working remotely from <span className="gradient-text">{city.name}</span>
          </h1>
          <p className="text-[var(--text-secondary)]">
            Remote-work score:{" "}
            <strong className={scoreColor(city.scores.remoteWork)}>
              {city.scores.remoteWork.toFixed(1)}/10
            </strong>{" "}
            · connectivity score (FTTH included):{" "}
            <strong className={scoreColor(ownerRemote.value)}>
              {ownerRemote.value.toFixed(1)}/10
            </strong>
          </p>
        </div>
      </section>

      {/* Verdict + signals — indigo band */}
      <section className="band band-indigo py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
          <p className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Verdict</p>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">{profile.match}</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{profile.explanation}</p>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">The remote-work signals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SIGNALS.map((row) => (
              <div key={row.label} className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{row.label}</p>
                  <p className={`font-mono-data font-bold ${scoreColor(row.value)}`}>
                    {row.value.toFixed(1)}<span className="text-xs text-[var(--text-tertiary)]">/10</span>
                  </p>
                </div>
                <div className="h-1.5 bg-[var(--band-indigo)] rounded-full overflow-hidden mb-2">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#4F46E5] to-[#DB2777]" style={{ width: `${row.value * 10}%` }} />
                </div>
                <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">{row.ctx}</p>
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* Coworking + budget — sky band */}
      <section className="band band-sky py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
        <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-[0_10px_28px_-18px_rgba(8,145,178,0.5)]">
          <div className="flex flex-wrap items-baseline gap-3 mb-2">
            <h2 className="text-lg font-bold"><span className="gradient-text">Coworking density</span></h2>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cowork.tone}`}>
              {cowork.label}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">{cowork.count}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Estimated from population and city tags. A dedicated SIRENE business-registry import
            (NAF codes 70.22Z and 68.20A) would sharpen this.
          </p>
        </div>

        {/* Cost block */}
        <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-[0_10px_28px_-18px_rgba(8,145,178,0.5)]">
          <h2 className="text-lg font-bold mb-3">
            <span className="gradient-text">Remote-worker budget — single person in a 1-bed</span>
          </h2>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between border-b border-[var(--border)]/40 py-1.5">
              <span>Median 1-bed rent</span>
              <span className="font-mono-data font-bold">€{(housing?.avgRentT2 ?? 800).toLocaleString("en-GB")}/mo</span>
            </li>
            <li className="flex justify-between border-b border-[var(--border)]/40 py-1.5">
              <span>Heating (zone {zone ?? "average"})</span>
              <span className="font-mono-data font-bold">€{heating}/mo</span>
            </li>
            <li className="flex justify-between py-1.5">
              <span>{transitPass != null ? "Transit pass" : "Car (estimate, no tram)"}</span>
              <span className="font-mono-data font-bold">€{transitPass ?? 80}/mo</span>
            </li>
          </ul>
          <div className="mt-3 flex items-baseline justify-between gap-3 rounded-xl bg-[var(--band-sky)] px-4 py-3">
            <span className="text-sm font-semibold text-[var(--text-primary)]">Housing + mobility cost</span>
            <span className="font-mono-data font-bold text-xl text-[var(--accent)]">
              €{housingBudget.toLocaleString("en-GB")}/mo
            </span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">
            <Link href={`/cities/${slug}/cost-of-living`} className="underline">
              Full cost-of-living breakdown →
            </Link>
          </p>
        </div>

        </div>
      </section>

      {/* Cross-links — pink band */}
      <section className="band band-pink py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="text-xl font-bold mb-4"><span className="gradient-text">Keep exploring</span></h2>
        <div className="flex flex-wrap gap-3">
          <Link href={`/cities/${slug}`} className="grad-head-0 rounded-full px-5 py-2.5 font-semibold hover:opacity-90">
            Back to {city.name}
          </Link>
          <Link href={`/cities/${slug}/cost-of-living`} className="rounded-full bg-white px-5 py-2.5 font-semibold text-[#3730A3] shadow-sm transition-colors hover:bg-[var(--band-indigo)]">
            Cost of living
          </Link>
          <Link href="/rankings/teletravail" className="rounded-full bg-white px-5 py-2.5 font-semibold text-[#3730A3] shadow-sm transition-colors hover:bg-[var(--band-indigo)]">
            Remote-work ranking
          </Link>
        </div>
        </div>
      </section>

      <section className="band band-white py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FeedbackWidget />
        </div>
      </section>

      <Footer />
    </main>
  );
}
