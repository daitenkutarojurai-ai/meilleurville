import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { rankGentrification, TRAJECTORY_META } from "@/lib/gentrification";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";

export const metadata: Metadata = {
  title: "Index de gentrification 2026 · Villes qui montent en France",
  description: `Classement des villes françaises où la gentrification accélère : prix immobilier, démographie 25-35 ans, ouvertures (cafés / coworking), télétravailleurs. ${CITIES_COUNT} villes, score composite 0-100.`,
  alternates: { canonical: "/gentrification" },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Index de gentrification", path: "/gentrification" },
]);

export default function GentrificationIndex() {
  const top30 = rankGentrification(30);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";

  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Villes françaises en gentrification 2026",
            itemListElement: top30.slice(0, 10).map((row, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: row.city.name,
              url: `${BASE_URL}/villes/${row.city.slug}`,
            })),
          }),
        }}
      />
      <AmbientBackground />
      <Navbar />

      <section className="pt-20 pb-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <Badge variant="accent" className="mb-3">
            📈 Index de gentrification 2026
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.1]">
            Les villes françaises qui montent
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            Quatre signaux composites : niveau de prix vs qualité de vie (DVF proxy),
            démographie 25-35 ans, ouvertures cafés / coworking, hausse télétravailleurs.
            Score 0-100 sur les {CITIES_COUNT} villes du site. Données et formules ouvertes.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-8">
        {/* Méthode */}
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
            Comment lire ce classement
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
            Une ville en haut du classement ne veut pas dire « bon investissement immobilier » —
            ça veut dire que <strong>les signaux de marché et démographiques convergent</strong>
            vers une intensification dans les 5 ans. À chacun d&apos;en tirer la lecture qui lui parle :
            opportunité, vigilance, ou simple curiosité sociologique.
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            Tous les scores sont en proxy v0 (dérivés du seed actuel + housing). Sources réelles à
            brancher : DVF (Demandes de Valeurs Foncières), Insee recensement, flux SIRENE quotidien.
          </p>
        </Card>

        {/* Top */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Top 30 villes</h2>
            <Link href="/gentrification/carte" className="text-sm underline text-[var(--accent)]">
              Voir la carte →
            </Link>
          </div>
          <ol className="space-y-3">
            {top30.map((row, i) => {
              const traj = TRAJECTORY_META[row.trajectory];
              return (
                <li key={row.city.slug}>
                  <Link href={`/gentrification/${row.city.slug}`} className="block">
                    <Card className="hover:border-[var(--accent)]/40 transition-colors cursor-pointer">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 text-center">
                          <span className="font-mono-data text-2xl font-bold text-[var(--text-tertiary)]">
                            #{i + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="text-lg font-bold text-[var(--text-primary)]">{row.city.name}</span>
                            <span className="text-xs text-[var(--text-tertiary)]">{row.city.region}</span>
                            <span
                              className={`ml-auto inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${traj.tone}`}
                            >
                              {traj.label}
                            </span>
                          </div>
                          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {row.signals.map((s) => (
                              <div key={s.key} className="text-[11px]">
                                <p className="text-[var(--text-tertiary)] truncate">{s.label}</p>
                                <p className="font-mono-data font-bold text-[var(--text-primary)]">
                                  {s.value.toFixed(1)}/10
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="font-mono-data text-2xl font-bold text-[var(--accent)]">
                            {row.score.toFixed(1)}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                            / 100
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Trajectory legend */}
        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            Légende des trajectoires
          </h3>
          <ul className="space-y-2 text-xs">
            {Object.entries(TRAJECTORY_META).map(([k, v]) => (
              <li key={k} className="flex items-start gap-2">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold flex-shrink-0 ${v.tone}`}>
                  {v.label}
                </span>
                <span className="text-[var(--text-secondary)]">{v.desc}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
