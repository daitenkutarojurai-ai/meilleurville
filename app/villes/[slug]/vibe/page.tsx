import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { CITIES_SEED } from "@/data/cities-seed";
import { cityVibe, VIBE_META, topCitiesByVibe } from "@/lib/vibe";
import type { VibeTone } from "@/lib/vibe";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { formatScore } from "@/lib/utils";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ slug: c.slug }));
}

const SCORE_COMPONENTS: { key: "global" | "culture" | "nature" | "safety" | "transport" | "cost"; label: string }[] = [
  { key: "global", label: "Qualité de vie globale" },
  { key: "culture", label: "Culture" },
  { key: "nature", label: "Nature" },
  { key: "safety", label: "Sécurité" },
  { key: "transport", label: "Transports" },
  { key: "cost", label: "Coût de la vie" },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const { tone } = cityVibe(city);
  const meta = VIBE_META[tone];
  return {
    title: `Ambiance de ${city.name} · vibe ${meta.label.toLowerCase()} 2026`,
    description: `${city.name} dégage une ambiance ${meta.label.toLowerCase()} : ${meta.desc}. Estimation déterministe dérivée des scores qualité de vie, signaux saisonniers et caractère régional.`,
    alternates: { canonical: `/villes/${slug}/vibe` },
    openGraph: {
      title: `${city.name} — vibe ${meta.emoji} ${meta.label}`,
      description: `${meta.desc}. Score global ${formatScore(city.scores.global)}/10.`,
    },
  };
}

export default async function CityVibePage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const { tone, score, breakdown } = cityVibe(city);
  const meta = VIBE_META[tone];
  const vibeScore = Math.round(score * 20);

  const similarVibe = topCitiesByVibe(tone, CITIES_SEED, 7)
    .filter((c) => c.slug !== city.slug)
    .slice(0, 3);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${slug}` },
    { name: "Ambiance", path: `/villes/${slug}/vibe` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quelle est l'ambiance à ${city.name} ?`,
      a: `${city.name} a une ambiance ${meta.label.toLowerCase()} (${meta.emoji}) : ${meta.desc}. Cette estimation est dérivée des scores de qualité de vie de la ville — pas de données temps réel.`,
    },
    {
      q: `${city.name} est plutôt animée ou calme ?`,
      a: `${city.name} tombe dans la catégorie « ${meta.label} ». Signaux clés : ${breakdown.join(" ; ")}.`,
    },
    {
      q: `Comment est calculée l'ambiance de ${city.name} ?`,
      a: `Le vibe est calculé de façon déterministe à partir des 8 axes de qualité de vie de ${city.name} : score global (${formatScore(city.scores.global)}/10), culture (${formatScore(city.scores.culture)}/10), nature (${formatScore(city.scores.nature)}/10) et sécurité (${formatScore(city.scores.safety)}/10). Aucun signal réseaux sociaux en direct.`,
    },
    {
      q: `Quelles villes françaises partagent la même ambiance que ${city.name} ?`,
      a: `Les villes classées « ${meta.label} » incluent ${similarVibe.map((c) => c.name).join(", ")} — elles partagent un mix de scores similaire qui produit le même caractère ${meta.label.toLowerCase()}.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />

      <section className="border-b border-[var(--border)] bg-[var(--bg-surface)] py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-tertiary)] mb-4">
            <Link href="/" className="hover:underline">Accueil</Link>
            {" / "}
            <Link href="/villes" className="hover:underline">Villes</Link>
            {" / "}
            <Link href={`/villes/${slug}`} className="hover:underline">{city.name}</Link>
            {" / "}
            <span>Ambiance</span>
          </nav>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-2">
            <Zap className="h-3.5 w-3.5" />
            Vibe de la ville
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            L&apos;ambiance à {city.name}
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            Un score d&apos;ambiance déterministe, dérivé des axes qualité de vie, du caractère
            régional et de signaux saisonniers. Clairement étiqueté estimation — ce n&apos;est pas
            de la donnée temps réel.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">

        {/* Main vibe card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="text-6xl" aria-hidden>{meta.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-2xl font-bold ${meta.color}`}>{meta.label}</span>
              <span
                className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700"
                title="Estimation éditoriale — pas de données temps réel"
              >
                ESTIMÉ
              </span>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-3">{meta.desc}.</p>
            {breakdown.length > 0 && (
              <ul className="space-y-1">
                {breakdown.map((b) => (
                  <li key={b} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                    <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="text-4xl font-bold font-mono-data text-[var(--text-primary)]">
              {vibeScore}
            </div>
            <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">/ 100</div>
          </div>
        </div>

        {/* Underlying scores */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Signaux sous-jacents
            </h2>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {SCORE_COMPONENTS.map(({ key, label }) => {
              const s = city.scores[key];
              const pct = Math.round((s / 10) * 100);
              return (
                <div key={key} className="px-5 py-3 flex items-center gap-4">
                  <span className="text-sm text-[var(--text-secondary)] w-40 shrink-0">{label}</span>
                  <div className="relative h-2 flex-1 rounded-full bg-[var(--bg-canvas)] overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: s >= 7 ? "var(--accent)" : s >= 5 ? "#EAB308" : "#EF4444",
                      }}
                    />
                  </div>
                  <span className="font-mono-data text-sm font-bold text-[var(--text-secondary)] w-10 text-right">
                    {formatScore(s)}/10
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* All 5 vibe categories */}
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            Les 5 catégories d&apos;ambiance
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.entries(VIBE_META) as [VibeTone, typeof VIBE_META[VibeTone]][]).map(([key, m]) => (
              <div
                key={key}
                className={`rounded-xl border p-4 ${key === tone ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--border)] bg-[var(--bg-canvas)]"}`}
              >
                <div className={`flex items-center gap-2 text-sm font-bold mb-1 ${m.color}`}>
                  <span aria-hidden>{m.emoji}</span>
                  <span>{m.label}</span>
                  {key === tone && (
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
                      ← {city.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">{m.desc}.</p>
              </div>
            ))}
          </div>
        </div>

        {/* Similar vibe cities */}
        {similarVibe.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
              Villes à l&apos;ambiance similaire
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Autres villes françaises classées « {meta.label} ».
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {similarVibe.map((n) => {
                const nVibe = cityVibe(n);
                const nMeta = VIBE_META[nVibe.tone];
                return (
                  <Link
                    key={n.slug}
                    href={`/villes/${n.slug}/vibe`}
                    className="group flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] px-4 py-3 transition hover:border-[var(--accent)]/40 hover:shadow-md"
                  >
                    <span className="text-2xl" aria-hidden>{nMeta.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] truncate">
                        {n.name}
                      </div>
                      <div className="text-xs text-[var(--text-tertiary)] truncate">
                        {nMeta.label} · {formatScore(n.scores.global)}/10
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Methodology note */}
        <div className="rounded-xl border border-dashed border-[var(--border)] p-4 text-xs text-[var(--text-tertiary)] leading-relaxed">
          <strong className="text-[var(--text-secondary)]">Méthodologie.</strong> Le vibe est
          calculé de façon déterministe depuis les scores statiques du seed — pas de signal
          réseaux sociaux ni d&apos;événementiel en direct. Le ton (Calme / Animé / Festif / Chargé
          / Ressourcant) découle des axes nature, culture, qualité de vie et sécurité. Le score
          numérique (1–5, ramené à 0–100) ajoute un bonus saisonnier pour les villes
          méditerranéennes en été et un incrément weekend. L&apos;offset dérivé du slug rend
          le résultat stable pour le rendu SSG. Estimation clairement assumée ;
          à lire comme un repère éditorial, pas comme une mesure.
        </div>

        <DiscussionCTA citySlug={slug} cityName={city.name} />

        <div className="text-center">
          <Link
            href={`/villes/${slug}`}
            className="inline-flex items-center gap-1 text-sm text-[var(--accent)] underline hover:opacity-80"
          >
            ← Retour à {city.name}
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
