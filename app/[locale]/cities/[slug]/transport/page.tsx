import type { Metadata } from "next";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import Link from "@/components/AppLink";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { cityAlternatesEn } from "@/lib/i18n";
import { scoreColor } from "@/lib/utils";

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
    title: `${c.name} transport — public transit, cycling, walkability (2026)`,
    description: `Public transport, cycling infrastructure and walkability in ${c.name}. What it's like getting around without a car.`,
    alternates: cityAlternatesEn("transport", slug),
  };
}

function transportVerdict(score: number): string {
  if (score >= 8) return "Excellent. You can comfortably go car-free.";
  if (score >= 7) return "Strong. Public transport covers most needs, car is optional.";
  if (score >= 6) return "Decent. A car is helpful but not strictly necessary in the city centre.";
  if (score >= 5) return "Average. Outside the centre, expect to want a car.";
  if (score >= 4) return "Limited. Car-dependent for anything beyond local errands.";
  return "Weak. Without a car, daily life will be a constant negotiation.";
}

export default async function EnCityTransport({ params }: Props) {
  const { slug } = await params;
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) notFound();

  const score = c.scores.transport;
  const verdict = transportVerdict(score);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: c.name, path: `/cities/${slug}` },
    { name: "Transport", path: `/cities/${slug}/transport` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />
      <section className="relative overflow-hidden bg-aurora pt-20 pb-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <nav className="mb-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          {" · "}
          <Link href="/cities" className="hover:text-[var(--accent)]">Cities</Link>
          {" · "}
          <Link href={`/cities/${slug}`} className="hover:text-[var(--accent)]">{c.name}</Link>
          {" · "}
          <span>Transport</span>
        </nav>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl" aria-hidden>🚉</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Transport in <span className="gradient-text">{c.name}</span>
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          Transport score: <span className={`font-mono-data font-bold ${scoreColor(score)}`}>{score.toFixed(1)}/10</span>. {verdict}
        </p>
        </div>
      </section>

      {/* What the score includes — indigo band */}
      <section className="band band-indigo py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">What the score includes</h2>
        <ul className="text-[var(--text-secondary)] leading-relaxed space-y-2">
          <li>· Tram, metro, and bus network coverage and frequency</li>
          <li>· Kilometres of safe cycling infrastructure</li>
          <li>· Walkability — shops and services within 10 minutes on foot</li>
          <li>· TGV or TER rail connection to major cities</li>
          <li>· Shared bikes and scooters availability</li>
        </ul>
        </div>
        </div>
      </section>

      {/* Getting around — sky band */}
      <section className="band band-sky py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-xl font-bold mb-3"><span className="gradient-text">Getting around</span></h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
          {c.region ?? "The region"} cities of {c.name}'s size typically run a combination of bus + cycling infrastructure; bigger metros add tram or metro lines.
          For TGV access, check the official SNCF Connect platform — {c.population && c.population > 100000 ? "the city is large enough to be on most TGV routes." : "smaller towns often connect through a nearby TGV hub via TER."}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/cities/${slug}`} className="grad-head-0 rounded-full px-5 py-2.5 font-semibold hover:opacity-90">Back to {c.name}</Link>
          <Link href="/rankings/mobilite" className="rounded-full bg-[var(--band-indigo)] px-5 py-2.5 font-semibold text-[#3730A3] transition-colors hover:bg-[#DCD7FF]">Car-free cities</Link>
          <Link href="/rankings/cyclistes" className="rounded-full bg-[var(--band-indigo)] px-5 py-2.5 font-semibold text-[#3730A3] transition-colors hover:bg-[#DCD7FF]">Best for cyclists</Link>
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
