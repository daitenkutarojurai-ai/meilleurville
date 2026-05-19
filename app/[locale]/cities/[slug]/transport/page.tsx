import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { scoreColor } from "@/lib/utils";

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
    title: `${c.name} transport — public transit, cycling, walkability (2026)`,
    description: `Public transport, cycling infrastructure and walkability in ${c.name}. What it's like getting around without a car.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/transport` },
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
          <span>Transport</span>
        </nav>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl" aria-hidden>🚉</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Transport in {c.name}
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          Transport score: <span className={`font-mono-data font-bold ${scoreColor(score)}`}>{score.toFixed(1)}/10</span>. {verdict}
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">What the score includes</h2>
        <ul className="text-[var(--text-secondary)] leading-relaxed space-y-2 mb-8">
          <li>· Tram, metro, and bus network coverage and frequency</li>
          <li>· Kilometres of safe cycling infrastructure</li>
          <li>· Walkability — shops and services within 10 minutes on foot</li>
          <li>· TGV or TER rail connection to major cities</li>
          <li>· Shared bikes and scooters availability</li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Getting around</h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
          {c.region ?? "The region"} cities of {c.name}'s size typically run a combination of bus + cycling infrastructure; bigger metros add tram or metro lines.
          For TGV access, check the official SNCF Connect platform — {c.population && c.population > 100000 ? "the city is large enough to be on most TGV routes." : "smaller towns often connect through a nearby TGV hub via TER."}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/cities/${slug}`} className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-white font-semibold hover:opacity-90">Back to {c.name}</Link>
          <Link href="/rankings/mobilite" className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">Car-free cities</Link>
          <Link href="/rankings/cyclistes" className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">Best for cyclists</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
