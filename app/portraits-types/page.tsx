import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CITIES_SEED } from "@/data/cities-seed";
import { computeNicheScores } from "@/lib/niche-scores";
import { scoreColor } from "@/lib/utils";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ArrowRight, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Portraits-types · Qui déménage en France et pourquoi — 2026",
  description:
    "6 profils fictifs illustrant les grandes migrations internes en France : freelances, retraités, étudiants, familles, expats, profils nature. Avec scores de compatibilité réels par ville.",
  alternates: { canonical: "/portraits-types" },
  openGraph: {
    title: "Portraits-types — qui déménage en France et vers où",
    description: "6 archétypes fictifs, 6 villes réelles, des scores calculés. Trouvez le profil qui vous ressemble.",
  },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Portraits-types", path: "/portraits-types" },
]);

// Derive real niche scores for each destination city
function cityNiche(slug: string) {
  const city = CITIES_SEED.find((c) => c.slug === slug)!;
  return { city, niche: computeNicheScores(city) };
}

const PROFILES = [
  {
    id: "camille",
    emoji: "💻",
    name: "Camille",
    age: 31,
    job: "Développeuse frontend freelance",
    origin: "Paris (11e)",
    destinationSlug: "rennes",
    nicheKey: "remote" as const,
    quote:
      "J'avais 2 200 € de loyer pour un T2 miteux en Île-de-France. À Rennes, je paie 750 €, j'ai la fibre 1 Gbit/s et deux parcs à 10 min à pied. Le dernier TGV pour Paris est à 22h38.",
    archetypeLabel: "Télétravaill·eur·euse",
  },
  {
    id: "jf-sylvie",
    emoji: "🌿",
    name: "Jean-François & Sylvie",
    age: 63,
    job: "Retraités — ex-industrie automobile",
    origin: "Mulhouse",
    destinationSlug: "bayonne",
    nicheKey: "retirement" as const,
    quote:
      "On voulait le soleil, la mer, et un TGV pour voir les petits-enfants. On a trouvé les trois à Bayonne — avec le Pays Basque en bonus. On n'a pas regardé en arrière.",
    archetypeLabel: "Retraité·e",
  },
  {
    id: "theo",
    emoji: "🎓",
    name: "Théo",
    age: 22,
    job: "Étudiant en master Économie",
    origin: "Rouen",
    destinationSlug: "bordeaux",
    nicheKey: "studentLife" as const,
    quote:
      "Bordeaux n'est pas donnée, mais les quartiers Victoire et Saint-Michel restent accessibles. La scène culturelle et la vie nocturne compensent largement. Et le tramway va partout.",
    archetypeLabel: "Étudiant·e",
  },
  {
    id: "nadia",
    emoji: "🌍",
    name: "Nadia",
    age: 38,
    job: "Consultante secteur santé, ex-Bruxelles",
    origin: "Bruxelles",
    destinationSlug: "lyon",
    nicheKey: "expat" as const,
    quote:
      "Lyon m'a surprise — plus internationale que je ne le pensais, avec une scène tech et gastronomique en pleine explosion. Moins stressant que Paris, et mieux relié que ce que les gens croient.",
    archetypeLabel: "Profil international",
  },
  {
    id: "clement-laura",
    emoji: "👨‍👩‍👧",
    name: "Clément & Laura",
    age: 34,
    job: "Ingénieur et kinésithérapeute, 2 enfants",
    origin: "Seine-et-Marne",
    destinationSlug: "nantes",
    nicheKey: "remote" as const,
    quote:
      "On voulait une ville où les enfants puissent grandir avec de l'espace et de bons établissements. Nantes cochait tout à un prix qu'on pouvait encore se permettre. On a gagné 40 min de trajet par jour.",
    archetypeLabel: "Famille avec enfants",
  },
  {
    id: "mathieu",
    emoji: "🐕",
    name: "Mathieu",
    age: 27,
    job: "CTO en startup, amoureux de randonnée",
    origin: "Montpellier",
    destinationSlug: "grenoble",
    nicheKey: "petFriendly" as const,
    quote:
      "Mon laptop dans mon sac le matin, les Belledonne à 45 minutes le week-end. Grenoble c'est le meilleur des deux mondes si tu aimes la montagne autant que les écrans. Et mon chien est aux anges.",
    archetypeLabel: "Nature & remote",
  },
] as const;

const POUR_QUI_LINKS = [
  { slug: "teletravailleurs", label: "Télétravailleurs", emoji: "💻" },
  { slug: "retraites", label: "Retraités", emoji: "🌿" },
  { slug: "etudiants", label: "Étudiants", emoji: "🎓" },
  { slug: "freelances", label: "Freelances", emoji: "⚡" },
  { slug: "familles-avec-enfants", label: "Familles", emoji: "👨‍👩‍👧" },
  { slug: "jeunes-actifs", label: "Jeunes actifs", emoji: "🚀" },
  { slug: "sans-voiture", label: "Sans voiture", emoji: "🚲" },
  { slug: "expat-retour", label: "Expats de retour", emoji: "🌍" },
];

export default function PortraitsTypesPage() {
  const profileData = PROFILES.map((p) => {
    const { city, niche } = cityNiche(p.destinationSlug);
    return { ...p, city, niche };
  });

  return (
    <main id="main-content" className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />

      {/* Hero */}
      <section className="relative pt-20 pb-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full border border-amber-200 bg-amber-50/80 text-amber-700 text-xs font-semibold mb-4">
            Personnages fictifs · Illustratif uniquement
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.08]">
            Ils ont tous fait le saut —{" "}
            <span className="font-display gradient-text-anim italic">et voilà ce qu'ils en disent</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed">
            6 archétypes de déménagement interne en France, composés à partir des scores réels de chaque ville.
            Les personnages sont fictifs ; les données, elles, sont calculées.
          </p>
        </div>
      </section>

      {/* Portrait cards */}
      <section className="relative pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {profileData.map((p) => {
              const nicheScore = p.niche[p.nicheKey];
              const color = scoreColor(nicheScore);
              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 flex flex-col gap-4 hover:shadow-lg transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{p.emoji}</span>
                      <div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">
                          {p.name}, {p.age} ans
                        </div>
                        <div className="text-xs text-[var(--text-tertiary)] leading-snug">{p.job}</div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-wide font-semibold text-amber-700 bg-amber-100/70 rounded-full px-2 py-0.5 shrink-0 mt-0.5">
                      Fictif
                    </span>
                  </div>

                  {/* Move arrow */}
                  <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                    <span className="rounded-md bg-[var(--bg-canvas)] border border-[var(--border)] px-2 py-1 font-medium">
                      {p.origin}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    <Link
                      href={`/villes/${p.destinationSlug}`}
                      className="rounded-md bg-[var(--accent)]/10 border border-[var(--accent)]/30 px-2 py-1 font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors"
                    >
                      {p.city.name}
                    </Link>
                  </div>

                  {/* Score badge */}
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-xs text-[var(--text-tertiary)] mb-0.5">{p.archetypeLabel}</div>
                      <div className="text-2xl font-black font-mono-data" style={{ color }}>
                        {nicheScore.toFixed(1)}
                        <span className="text-sm font-normal text-[var(--text-tertiary)]">/10</span>
                      </div>
                    </div>
                    <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(nicheScore / 10) * 100}%`, background: color }}
                      />
                    </div>
                  </div>

                  {/* Quote */}
                  <blockquote className="text-sm text-[var(--text-secondary)] leading-relaxed border-l-2 border-[var(--accent)]/40 pl-3 italic">
                    "{p.quote}"
                  </blockquote>

                  {/* CTA */}
                  <Link
                    href={`/villes/${p.destinationSlug}`}
                    className="mt-auto flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] transition-all px-4 py-2.5 group"
                  >
                    <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      Voir la fiche {p.city.name}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
                  </Link>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-[var(--text-tertiary)] text-center mt-6 max-w-xl mx-auto">
            Les personnages, prénoms, situations familiales et citations sont entièrement fictifs et inventés à des fins illustratives.
            Les scores de compatibilité sont calculés à partir des données réelles des villes (seed MaVilleIdéale 2024–2026).
          </p>
        </div>
      </section>

      {/* Pour-qui bridge */}
      <section className="relative pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              Et vous, quel est votre profil ?
            </h2>
            <p className="text-[var(--text-secondary)] mb-6 max-w-2xl">
              Chaque profil ci-dessous donne accès à un classement top 20 de villes calibré sur les axes qui
              comptent vraiment pour ce mode de vie — pas un score global générique.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              {POUR_QUI_LINKS.map((p) => (
                <Link
                  key={p.slug}
                  href={`/pour-qui/${p.slug}`}
                  className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] transition-all px-3 py-2.5 group"
                >
                  <span className="text-lg">{p.emoji}</span>
                  <span className="text-xs font-semibold text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors">
                    {p.label}
                  </span>
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/city-match"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                ✨ Quiz — trouver ma ville
              </Link>
              <Link
                href="/pour-qui"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] px-5 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Tous les profils de vie →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Score methodology note */}
      <section className="relative pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] px-6 py-5">
            <h2 className="text-sm font-bold text-[var(--text-primary)] mb-2">Comment sont calculés les scores de compatibilité ?</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-3xl">
              Chaque score de compatibilité est une recombinaison pondérée des 8 axes du seed MaVilleIdéale (qualité de vie,
              transport, nature, coût, sécurité, culture, télétravail, écoles) + des caractéristiques géographiques et
              démographiques de la ville. Un profil "télétravailleur" pondère davantage le score remoteWork et le coût ;
              un profil "retraité" pondère la sécurité, le coût et le climat. Aucune donnée déclarative ou communautaire —
              pure recombinaison algorithmique des données publiques calibrées sur la période 2024–2026.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
