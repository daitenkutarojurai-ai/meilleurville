import { Metadata } from "next";
import { MapPin } from "lucide-react";
import { mapsPlaceUrl } from "@/lib/maps-link";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { CityPhotoBand } from "@/components/CityPhoto";
import { cityPhoto } from "@/lib/city-images";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CITIES_SEED } from "@/data/cities-seed";
import { getNeighborhoods } from "@/data/neighborhoods";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { cityAlternates } from "@/lib/i18n";

// ISR Reads optimization: pure SSG (no Vercel Data Cache layer).
// revalidate=false → page built once at deploy, served from static edge cache.
export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  return {
    title: `Quartiers de ${city.name} · Quel quartier choisir ?`,
    description: `Comparatif des quartiers de ${city.name} : sécurité, loyers, transports, ambiance. Trouvez le quartier fait pour vous.`,
    alternates: cityAlternates("quartiers", slug),
  };
}

const TYPE_LABELS: Record<string, string> = {
  "centre-ville": "Centre-ville",
  résidentiel: "Résidentiel",
  étudiant: "Étudiant",
  branché: "Branché",
  populaire: "Populaire",
  pavillonnaire: "Pavillonnaire",
};

// Familles indigo / rose / cyan seulement : vert, lime, ambre, orange, rouge et
// violet sont réservés aux paliers de score (identité « Couleurs »).
const TYPE_COLORS: Record<string, string> = {
  "centre-ville": "text-[#3730A3] bg-[#E0E7FF]",
  résidentiel: "text-[#155E75] bg-[#CFFAFE]",
  étudiant: "text-[#9D174D] bg-[#FCE7F3]",
  branché: "text-[#86198F] bg-[#FAE8FF]",
  populaire: "text-[#075985] bg-[#E0F2FE]",
  pavillonnaire: "text-[#1E40AF] bg-[#DBEAFE]",
};

function scoreColor(s: number) {
  if (s >= 7.5) return "text-purple-600";
  if (s >= 7.0) return "text-green-700";
  if (s >= 6.0) return "text-lime-700";
  if (s >= 5.0) return "text-amber-700";
  if (s >= 4.0) return "text-orange-700";
  return "text-red-600";
}

const SCORE_KEYS: Array<{ key: "safety" | "transport" | "nature" | "cost" | "nightlife"; label: string }> = [
  { key: "safety", label: "Sécurité" },
  { key: "transport", label: "Transport" },
  { key: "nature", label: "Nature" },
  { key: "cost", label: "Coût" },
  { key: "nightlife", label: "Vie nocturne" },
];

export default async function QuartiersPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const photo = cityPhoto(city.slug);

  const neighborhoods = getNeighborhoods(slug);

  const jsonLd = neighborhoods.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Quartiers de ${city.name}`,
    "description": `Comparatif des quartiers de ${city.name} : sécurité, loyers, transports, ambiance.`,
    "numberOfItems": neighborhoods.length,
    "itemListElement": neighborhoods.map((n, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": `${n.name} — ${city.name}`,
      "description": n.summary,
    })),
  } : null;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${slug}` },
    { name: "Quartiers", path: `/villes/${slug}/quartiers` },
  ]);

  return (
    <main id="main-content" className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />

      <section className="relative overflow-hidden bg-aurora pt-20 pb-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-5">
            <Link href="/villes" className="hover:text-[var(--text-secondary)]">Villes</Link>
            <span>/</span>
            <Link href={`/villes/${slug}`} className="hover:text-[var(--text-secondary)]">{city.name}</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">Quartiers</span>
          </nav>
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            🏘️ Profils de quartiers
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight leading-[1.05]">
            Quartiers de{" "}
            <span className="font-display gradient-text-anim italic">{city.name}</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl">
            {neighborhoods.length > 0
              ? `${neighborhoods.length} quartiers analysés — sécurité, loyers, transports, ambiance.`
              : "Données de quartiers en cours de collecte pour cette ville."}
          </p>
        </div>

        {photo && (
          <CityPhotoBand photo={photo} cityName={city.name} className="mt-8" />
        )}
      </section>

      {/* Fiches quartier — bande indigo */}
      <section className="band band-indigo py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-6">
        {neighborhoods.length === 0 ? (
          <div className="rounded-2xl bg-white shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)] p-12 text-center">
            <div className="text-4xl mb-4">🏗️</div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Données en cours de collecte
            </h2>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-6">
              Les profils de quartiers pour {city.name} arrivent dans notre prochaine mise à jour.
              Vous pouvez contribuer en soumettant votre avis.
            </p>
            <Link
              href={`/villes/${slug}`}
              className="grad-head-0 inline-flex items-center gap-2 rounded-full font-semibold px-5 py-2.5 text-sm hover:opacity-90 transition-opacity"
            >
              ← Profil de {city.name}
            </Link>
          </div>
        ) : (
          <>
            {neighborhoods.map((n) => (
              <article key={n.slug} className="rounded-2xl bg-white shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)] p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Left: info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h2 className="text-lg font-bold text-[var(--text-primary)]">{n.name}</h2>
                      <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${TYPE_COLORS[n.type] ?? "text-[#3730A3] bg-[#E0E7FF]"}`}>
                        {TYPE_LABELS[n.type] ?? n.type}
                      </span>
                      <a
                        href={mapsPlaceUrl(n.name, city.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto inline-flex min-h-8 items-center gap-1 rounded-full bg-[var(--band-indigo)] px-3 py-1 text-xs font-semibold text-[#3730A3] transition-colors hover:bg-[#DCD7FF]"
                      >
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        Voir sur Google Maps
                      </a>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                      {n.summary}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {n.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[var(--band-sky)] text-[#1E3A8A]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: scores + rent */}
                  <div className="w-full sm:w-52 flex-shrink-0">
                    <div className="rounded-xl bg-[var(--band-indigo)] p-4 mb-3 text-center">
                      <div className={`text-3xl font-black font-mono-data ${scoreColor(n.scores.global)}`}>
                        {n.scores.global.toFixed(1)}
                      </div>
                      <div className="text-xs text-[var(--text-tertiary)] mt-0.5">Score global</div>
                    </div>
                    <div className="space-y-2">
                      {SCORE_KEYS.map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between text-xs">
                          <span className="text-[var(--text-tertiary)]">{label}</span>
                          <span className={`font-bold font-mono-data ${scoreColor(n.scores[key])}`}>
                            {n.scores[key].toFixed(1)}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E0E7FF] mt-2">
                        <span className="text-[var(--text-tertiary)]">Loyer T2 moy.</span>
                        <span className="font-bold text-[var(--text-primary)]">{n.avgRentT2}€/mois</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </>
        )}
      </div>
      </section>

      {/* Tableau comparatif — bande ciel */}
      {neighborhoods.length > 1 && (
        <section className="band band-sky py-10">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <div className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
                <div className="grad-head-2 px-5 py-4">
                  <h2 className="text-sm font-semibold">Tableau comparatif</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E0E7FF] bg-[var(--band-indigo)]">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-[#3730A3]">Critère</th>
                        {neighborhoods.map((n) => (
                          <th key={n.slug} className="px-4 py-3 text-center text-xs font-semibold text-[var(--text-primary)]">{n.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {([...SCORE_KEYS, { key: "global" as const, label: "Score global" }]).map(({ key, label }) => {
                        const vals = neighborhoods.map((n) => key === "global" ? n.scores.global : n.scores[key as keyof typeof n.scores]);
                        const best = Math.max(...vals);
                        return (
                          <tr key={key} className="border-b border-[#EEF0FB] last:border-0">
                            <td className="px-5 py-3 text-xs text-[var(--text-secondary)]">{label}</td>
                            {vals.map((v, i) => (
                              <td key={i} className="px-4 py-3 text-center">
                                <span className={`font-bold font-mono-data text-xs ${scoreColor(v)} ${v === best ? "rounded-full bg-[var(--band-indigo)] px-2 py-0.5 ring-1 ring-[#4F46E5]/40" : ""}`}>{v.toFixed(1)}</span>
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                      <tr className="bg-white">
                        <td className="px-5 py-3 text-xs text-[var(--text-secondary)]">Loyer T2</td>
                        {neighborhoods.map((n) => {
                          const cheapest = Math.min(...neighborhoods.map((x) => x.avgRentT2));
                          return (
                            <td key={n.slug} className="px-4 py-3 text-center">
                              <span className={`font-bold text-xs ${n.avgRentT2 === cheapest ? "rounded-full bg-[var(--band-indigo)] px-2 py-0.5 text-[#3730A3] ring-1 ring-[#4F46E5]/40" : "text-[var(--text-primary)]"}`}>{n.avgRentT2}€</span>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
        </section>
      )}

      {/* Renvois + discussion — bande blanche */}
      <section className="band band-white py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-8">
          <div className="flex gap-3 flex-wrap">
            <Link
              href={`/villes/${slug}`}
              className="rounded-full bg-[var(--band-indigo)] px-4 py-2.5 text-sm font-semibold text-[#3730A3] transition-colors hover:bg-[#DCD7FF]"
            >
              ← Profil complet de {city.name}
            </Link>
            <Link
              href="/villes"
              className="rounded-full bg-[var(--band-indigo)] px-4 py-2.5 text-sm font-semibold text-[#3730A3] transition-colors hover:bg-[#DCD7FF]"
            >
              Toutes les villes
            </Link>
          </div>
          <div className="mx-auto max-w-3xl">
            <DiscussionCTA citySlug={city.slug} cityName={city.name} />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
