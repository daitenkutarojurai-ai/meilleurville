import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { computePublicServices, type ServicesLevel } from "@/lib/public-services";
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
    title: `${c.name} public services — schools, library, post office (2026)`,
    description: `Public-service coverage in ${c.name}: schools, library, post office and town hall. How well the everyday admin of life is served.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/public-services` },
  };
}

const LEVEL_LABEL: Record<ServicesLevel, string> = {
  excellent: "Excellent",
  correct: "Adequate",
  tendu: "Strained",
  desertique: "Service desert",
};

const HERO_VERDICT: Record<ServicesLevel, string> = {
  excellent: "Public services are excellent — schools, library, post office and town hall are all close at hand.",
  correct: "Public-service coverage is adequate: the essentials are there, some require a short trip.",
  tendu: "Public services are strained. Expect to travel for some everyday admin — confirm what's actually local before you commit.",
  desertique: "This is close to a public-service desert. Day-to-day admin will mean regular trips elsewhere — a real factor without a car.",
};

const DIMS: { key: "schools" | "library" | "postOffice" | "cityHall"; label: string; note: string }[] = [
  { key: "schools", label: "Schools", note: "Crèche, primary, collège, lycée coverage" },
  { key: "library", label: "Library", note: "Public library / médiathèque" },
  { key: "postOffice", label: "Post office", note: "La Poste + France Services point" },
  { key: "cityHall", label: "Town hall", note: "In-person administrative services" },
];

export default async function EnCityPublicServices({ params }: Props) {
  const { slug } = await params;
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) notFound();

  const services = computePublicServices(c);
  // The lib composite is 0-10 where 10 = worst (service desert). "10 = best".
  const score = Math.round((10 - services.composite) * 10) / 10;

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
          <span>Public services</span>
        </nav>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl" aria-hidden>🏛️</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Public services in {c.name}
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          Coverage score: <span className={`font-mono-data font-bold ${scoreColor(score)}`}>{score.toFixed(1)}/10</span>{" "}
          ({LEVEL_LABEL[services.level]}). {HERO_VERDICT[services.level]}
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6 grid sm:grid-cols-2 gap-3">
        {DIMS.map((d) => {
          const dim = services[d.key];
          const dimScore = Math.round((10 - dim.score) * 10) / 10;
          return (
            <div key={d.key} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold text-[var(--text-primary)]">{d.label}</p>
                <span className={`font-mono-data font-bold ${scoreColor(dimScore)}`}>{dimScore.toFixed(1)}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {LEVEL_LABEL[dim.level]} — {d.note}
              </p>
            </div>
          );
        })}
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">The quiet day-to-day factor</h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-8">
          Public-service coverage rarely makes anyone's wishlist, then quietly shapes daily life. France has worked to plug gaps with France Services one-stop points, but rural and shrinking towns still thin out — a missing local post office or a collège a long bus ride away adds up over years. If you won't have a car, weight this heavily.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link href={`/cities/${slug}`} className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-white font-semibold hover:opacity-90">Back to {c.name}</Link>
          <Link href={`/cities/${slug}/schools`} className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">{c.name} schools</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
