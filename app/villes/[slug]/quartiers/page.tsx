import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CITIES_SEED } from "@/data/cities-seed";
import { getNeighborhoods } from "@/data/neighborhoods";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  return {
    title: `Quartiers de ${city.name} — Quel quartier choisir ? | MeilleurVille`,
    description: `Comparatif des quartiers de ${city.name} : sécurité, loyers, transports, ambiance. Trouvez le quartier fait pour vous.`,
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

const TYPE_COLORS: Record<string, string> = {
  "centre-ville": "text-blue-600 bg-blue-400/10 border-blue-400/20",
  résidentiel: "text-emerald-600 bg-emerald-500/10 border-emerald-400/20",
  étudiant: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  branché: "text-pink-400 bg-pink-400/10 border-pink-400/20",
  populaire: "text-orange-600 bg-orange-400/10 border-orange-400/20",
  pavillonnaire: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

function scoreColor(s: number) {
  if (s >= 8) return "text-emerald-600";
  if (s >= 6) return "text-amber-400";
  return "text-red-500";
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

  return (
    <main className="min-h-screen">
      <Navbar />
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-5">
            <Link href="/villes" className="hover:text-[var(--text-secondary)]">Villes</Link>
            <span>/</span>
            <Link href={`/villes/${slug}`} className="hover:text-[var(--text-secondary)]">{city.name}</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">Quartiers</span>
          </nav>
          <Badge variant="accent" className="mb-3">Profils de quartiers</Badge>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Quartiers de {city.name}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {neighborhoods.length > 0
              ? `${neighborhoods.length} quartiers analysés — sécurité, loyers, transports, ambiance.`
              : "Données de quartiers en cours de collecte pour cette ville."}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-8">
        {neighborhoods.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-12 text-center">
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
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] text-white font-semibold px-5 py-2.5 text-sm hover:opacity-90 transition-opacity"
            >
              ← Profil de {city.name}
            </Link>
          </div>
        ) : (
          <>
            {neighborhoods.map((n) => (
              <Card key={n.slug}>
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Left: info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h2 className="text-lg font-bold text-[var(--text-primary)]">{n.name}</h2>
                      <span className={`text-xs font-medium border rounded-full px-2.5 py-0.5 ${TYPE_COLORS[n.type] ?? "text-[var(--text-secondary)] bg-[var(--bg-elevated)] border-[var(--border)]"}`}>
                        {TYPE_LABELS[n.type] ?? n.type}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                      {n.summary}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {n.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-tertiary)]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: scores + rent */}
                  <div className="w-full sm:w-52 flex-shrink-0">
                    <div className="rounded-xl bg-[var(--bg-elevated)] p-4 mb-3 text-center">
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
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border)] mt-2">
                        <span className="text-[var(--text-tertiary)]">Loyer T2 moy.</span>
                        <span className="font-bold text-[var(--text-primary)]">{n.avgRentT2}€/mois</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Comparison table */}
            {neighborhoods.length > 1 && (
              <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
                <div className="bg-[var(--bg-surface)] px-5 py-4 border-b border-[var(--border)]">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Tableau comparatif</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)]">
                        <th className="text-left px-5 py-3 text-xs font-medium text-[var(--text-tertiary)]">Critère</th>
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
                          <tr key={key} className="border-b border-[var(--border)] last:border-0">
                            <td className="px-5 py-3 text-xs text-[var(--text-secondary)]">{label}</td>
                            {vals.map((v, i) => (
                              <td key={i} className="px-4 py-3 text-center">
                                <span className={`font-bold font-mono-data text-xs ${v === best ? "text-emerald-600" : scoreColor(v)}`}>{v.toFixed(1)}</span>
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                      <tr className="border-b border-[var(--border)] bg-[var(--bg-surface)]">
                        <td className="px-5 py-3 text-xs text-[var(--text-secondary)]">Loyer T2</td>
                        {neighborhoods.map((n) => {
                          const cheapest = Math.min(...neighborhoods.map((x) => x.avgRentT2));
                          return (
                            <td key={n.slug} className="px-4 py-3 text-center">
                              <span className={`font-bold text-xs ${n.avgRentT2 === cheapest ? "text-emerald-600" : "text-[var(--text-primary)]"}`}>{n.avgRentT2}€</span>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Premium lock teaser */}
            <div className="rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-8 text-center">
              <div className="text-2xl mb-3">🔒</div>
              <h3 className="font-bold text-[var(--text-primary)] mb-2">
                Profils de quartiers complets
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-5 max-w-md mx-auto">
                Les abonnés Pro accèdent aux données détaillées : prix au m², qualité des écoles par quartier,
                densité médicale, criminalité par type d'acte.
              </p>
              <Link
                href="/quiz"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] text-white font-semibold px-6 py-3 text-sm hover:opacity-90 transition-opacity"
              >
                ✨ Passer Pro — 9,90€/mois
              </Link>
            </div>
          </>
        )}

        <div className="flex gap-3 flex-wrap">
          <Link
            href={`/villes/${slug}`}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            ← Profil complet de {city.name}
          </Link>
          <Link
            href="/villes"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Toutes les villes
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
