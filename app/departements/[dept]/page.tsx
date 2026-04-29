import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { CityCard } from "@/components/CityCard";
import { CITIES_SEED } from "@/data/cities-seed";
import type { City } from "@/lib/types";

type Props = { params: Promise<{ dept: string }> };

function deptToSlug(dept: string): string {
  return dept
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function slugToDept(slug: string): string | undefined {
  const depts = [...new Set(CITIES_SEED.map((c) => c.department))];
  return depts.find((d) => deptToSlug(d) === slug);
}

export function generateStaticParams() {
  const depts = [...new Set(CITIES_SEED.map((c) => c.department))];
  return depts.map((d) => ({ dept: deptToSlug(d) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dept: deptSlug } = await params;
  const dept = slugToDept(deptSlug);
  if (!dept) return {};
  const cities = CITIES_SEED.filter((c) => c.department === dept);
  const topCity = [...cities].sort((a, b) => b.scores.global - a.scores.global)[0];
  return {
    title: `Meilleures villes ${dept} 2025 — Qualité de vie & Classements`,
    description: `Découvrez les ${cities.length} meilleures villes du département ${dept} : scores qualité de vie, comparaisons, avis d'habitants. N°1 : ${topCity?.name} (${topCity?.scores.global}/10).`,
    openGraph: {
      title: `Villes de ${dept} — MeilleurVille`,
      description: `${cities.length} villes analysées · Top : ${topCity?.name} ${topCity?.scores.global}/10`,
    },
  };
}

function seedToCity(s: (typeof CITIES_SEED)[number]): City {
  return {
    id: s.slug,
    slug: s.slug,
    name: s.name,
    region: s.region,
    department: s.department,
    population: s.population,
    latitude: s.latitude,
    longitude: s.longitude,
    scores: s.scores,
    characterTags: s.characterTags,
    reviewCount: 150 + Math.floor(s.scores.global * 25),
    sunshinedays: s.sunshinedays,
    avgTempJuly: s.avgTempJuly,
    avgTempJanuary: s.avgTempJanuary,
  };
}

function regionToSlug(region: string): string {
  return region
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function DeptPage({ params }: Props) {
  const { dept: deptSlug } = await params;
  const deptName = slugToDept(deptSlug);
  if (!deptName) notFound();

  const cities = CITIES_SEED.filter((c) => c.department === deptName)
    .sort((a, b) => b.scores.global - a.scores.global);

  if (cities.length === 0) notFound();

  const region = cities[0].region;
  const top3 = cities.slice(0, 3);
  const rest = cities.slice(3);
  const avgScore = cities.reduce((s, c) => s + c.scores.global, 0) / cities.length;

  const avgCriteria = {
    nature: cities.reduce((s, c) => s + c.scores.nature, 0) / cities.length,
    cost: cities.reduce((s, c) => s + c.scores.cost, 0) / cities.length,
    safety: cities.reduce((s, c) => s + c.scores.safety, 0) / cities.length,
    transport: cities.reduce((s, c) => s + c.scores.transport, 0) / cities.length,
    culture: cities.reduce((s, c) => s + c.scores.culture, 0) / cities.length,
  };

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-5">
            <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/departements" className="hover:text-[var(--text-secondary)] transition-colors">Départements</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">{deptName}</span>
          </nav>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">📍</div>
            <div>
              <Badge variant="accent" className="mb-2">Département</Badge>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
                {deptName}
              </h1>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">
                Région {region} ·{" "}
                <Link href={`/regions/${regionToSlug(region)}`} className="text-[var(--accent)] hover:underline">
                  voir la région →
                </Link>
              </p>
            </div>
          </div>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            {cities.length} ville{cities.length > 1 ? "s" : ""} analysée{cities.length > 1 ? "s" : ""} · Score moyen {avgScore.toFixed(1)}/10 · Données 2025
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {Object.entries(avgCriteria).map(([key, val]) => (
              <div key={key} className="rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] px-4 py-2 text-center">
                <div className="text-sm font-bold font-mono-data text-[var(--accent)]">{val.toFixed(1)}</div>
                <div className="text-[10px] text-[var(--text-tertiary)] capitalize">{key}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-10">
        <section>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            Top {Math.min(3, cities.length)} en {deptName}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {top3.map((city, i) => (
              <CityCard key={city.slug} city={seedToCity(city)} rank={i + 1} />
            ))}
          </div>
        </section>

        {rest.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
              Toutes les villes ({cities.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((city, i) => (
                <CityCard key={city.slug} city={seedToCity(city)} rank={i + 4} />
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-wrap gap-3 pt-4">
          <Link href="/departements" className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            ← Tous les départements
          </Link>
          <Link href={`/regions/${regionToSlug(region)}`} className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Région {region} →
          </Link>
          <Link href="/classements" className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Classements thématiques →
          </Link>
          <Link href="/quiz" className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-4 py-2.5 text-sm text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors">
            ✨ Quiz : trouver ma ville →
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
