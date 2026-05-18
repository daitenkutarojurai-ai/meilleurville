import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CITIES_SEED } from "@/data/cities-seed";
import { getEducation, educationTags, type Education } from "@/lib/education";
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

const SCORE_AVG = (() => {
  const values = CITIES_SEED.map((c) => c.scores.schools);
  return +(values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
})();

function summary(city: City, e: Education): string {
  const tags = educationTags(e);
  const score = city.scores.schools;
  if (e.university && (e.ingenieur?.length || e.commerce?.length) && e.cpge) {
    return `${city.name} est un pôle d'enseignement supérieur complet : université, CPGE, et ${e.ingenieur?.length ? "écoles d'ingénieur" : ""}${e.ingenieur?.length && e.commerce?.length ? " + " : ""}${e.commerce?.length ? "écoles de commerce" : ""} sur place. Bon point pour les familles avec adolescents et les profils étudiants.`;
  }
  if (e.university) {
    return `${city.name} accueille une université (${e.university}) et propose ${tags.length > 1 ? "plusieurs filières post-bac" : "une offre post-bac de proximité"}. Vie étudiante présente, écosystème de stages plus modeste qu'en métropole de tête.`;
  }
  if (score >= 6) {
    return `${city.name} n'est pas une ville universitaire de premier plan, mais le tissu de lycées (général + technologique) reste solide. Pour le post-bac, beaucoup d'élèves se déplacent vers la métropole régionale la plus proche.`;
  }
  return `${city.name} est avant tout une ville pour la scolarité avant le supérieur. Compter sur un déménagement ou un internat pour les filières sélectives.`;
}

function findSimilarCities(city: City, all: readonly City[], n = 4): City[] {
  return [...all]
    .filter((c) => c.slug !== city.slug)
    .map((c) => ({ city: c, d: Math.abs(c.scores.schools - city.scores.schools) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map((x) => x.city);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const e = getEducation(slug);
  const tags = educationTags(e);
  const desc = tags.length
    ? `Enseignement supérieur à ${city.name} : ${tags.join(" · ")}. Score écoles ${city.scores.schools.toFixed(1)}/10.`
    : `Score écoles ${city.scores.schools.toFixed(1)}/10. Tissu de lycées et offre post-bac à ${city.name}.`;
  return {
    title: `Écoles & études à ${city.name} · Université, CPGE, écoles | MeilleurVille`,
    description: desc,
    alternates: { canonical: `/villes/${slug}/ecoles` },
    openGraph: { title: `Écoles à ${city.name}`, description: desc },
  };
}

export default async function EcolesPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const e = getEducation(slug);
  const tags = educationTags(e);
  const score = city.scores.schools;
  const vsAvg = +(score - SCORE_AVG).toFixed(1);
  const similar = findSimilarCities(city, CITIES_SEED);

  const sorted = [...CITIES_SEED].sort((a, b) => b.scores.schools - a.scores.schools);
  const rank = sorted.findIndex((c) => c.slug === city.slug) + 1;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `Écoles et études supérieures à ${city.name}`,
    "about": city.name,
    "description": summary(city, e),
  };

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${slug}` },
    { name: "Écoles", path: `/villes/${slug}/ecoles` },
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
            <span className="text-[var(--text-secondary)]">Écoles</span>
          </nav>
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            🎓 Écoles &amp; études supérieures
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight leading-[1.05]">
            Écoles à{" "}
            <span className="font-display gradient-text-anim italic">{city.name}</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl leading-relaxed">
            {summary(city, e)}
          </p>
        </div>
      </section>

      {/* Score strip */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl glass border border-white/50 p-4 shadow-sm">
              <div className="text-xs text-[var(--text-tertiary)] mb-1">Score écoles</div>
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
              <div className="text-xs text-[var(--text-tertiary)] mb-1">Filières confirmées</div>
              <div className="text-base font-semibold text-[var(--text-primary)] leading-snug pt-1">
                {tags.length > 0 ? tags.join(" · ") : <span className="text-[var(--text-tertiary)] font-normal">Lycées seulement</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Established schools */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-4">
          {e.university && (
            <div className="rounded-2xl glass border border-white/50 p-5 shadow-sm">
              <div className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-1">🏛️ Université</div>
              <div className="text-lg font-semibold text-[var(--text-primary)]">{e.university}</div>
            </div>
          )}
          {e.cpge && (
            <div className="rounded-2xl glass border border-white/50 p-5 shadow-sm">
              <div className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-1">📚 Classes préparatoires (CPGE)</div>
              <div className="text-sm text-[var(--text-secondary)]">
                Au moins un lycée propose des classes préparatoires aux grandes écoles (scientifique, commerciale, ou littéraire).
              </div>
            </div>
          )}
          {e.iep && (
            <div className="rounded-2xl glass border border-white/50 p-5 shadow-sm">
              <div className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-1">🏛️ Sciences Po</div>
              <div className="text-sm text-[var(--text-secondary)]">
                Campus IEP / Sciences Po présent en ville.
              </div>
            </div>
          )}
          {e.ingenieur && e.ingenieur.length > 0 && (
            <div className="rounded-2xl glass border border-white/50 p-5 shadow-sm">
              <div className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">⚙️ Écoles d&apos;ingénieurs</div>
              <ul className="text-sm text-[var(--text-primary)] space-y-1">
                {e.ingenieur.map((s) => <li key={s}>• {s}</li>)}
              </ul>
            </div>
          )}
          {e.commerce && e.commerce.length > 0 && (
            <div className="rounded-2xl glass border border-white/50 p-5 shadow-sm">
              <div className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">💼 Écoles de commerce</div>
              <ul className="text-sm text-[var(--text-primary)] space-y-1">
                {e.commerce.map((s) => <li key={s}>• {s}</li>)}
              </ul>
            </div>
          )}
          {e.artsDesign && e.artsDesign.length > 0 && (
            <div className="rounded-2xl glass border border-white/50 p-5 shadow-sm">
              <div className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">🎨 Beaux-Arts &amp; design</div>
              <ul className="text-sm text-[var(--text-primary)] space-y-1">
                {e.artsDesign.map((s) => <li key={s}>• {s}</li>)}
              </ul>
            </div>
          )}
          {tags.length === 0 && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] p-5">
              <div className="text-sm text-[var(--text-secondary)]">
                Pas de filière post-bac sélective recensée à {city.name} dans notre base. Les lycéens orientés CPGE / écoles s&apos;orientent vers la métropole régionale la plus proche.
              </div>
            </div>
          )}
          <p className="text-xs text-[var(--text-tertiary)]">
            Liste basée sur les données MESR / Conférence des grandes écoles. Une absence indique que nous n&apos;avons pas confirmé la présence du cursus, pas nécessairement qu&apos;il n&apos;existe pas.
          </p>
        </div>
      </section>

      {/* Similar */}
      <section className="relative pb-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Villes au profil scolaire comparable</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {similar.map((c) => (
              <Link
                key={c.slug}
                href={`/villes/${c.slug}/ecoles`}
                className="group rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] transition-all px-4 py-3"
              >
                <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                  {c.name}
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                  Score {c.scores.schools.toFixed(1)} · {educationTags(getEducation(c.slug)).slice(0, 2).join(" · ") || "Lycées"}
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
            href="/classements/famille"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Classement famille 🏡
          </Link>
          <Link
            href="/classements/etudiant"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Classement étudiant 🎓
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
