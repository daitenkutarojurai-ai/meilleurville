import { Metadata } from "next";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_SEED } from "@/data/cities-seed";
import { CityCard } from "@/components/CityCard";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { ClassementsJumpNav } from "@/components/ClassementsJumpNav";
import Link from "@/components/AppLink";
import {
  Laptop, Home, TreePine, GraduationCap, Palmtree, ArrowRight, Wallet,
  Sun, Shield, Music, Bike, Building2, Heart, Leaf, CloudSun, KeyRound, Rocket,
  ChefHat, Waves,
} from "lucide-react";
import type { City } from "@/lib/types";
import { RANKINGS_COUNT } from "@/lib/site-stats";
import { getRankedCities, type RankingSlug } from "@/lib/rankings";
import { pathAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Classements villes françaises 2026 · Famille, Budget",
  description:
    "Classements des meilleures villes françaises par style de vie : télétravail, famille, retraite, étudiant, nature, budget, soleil, sécurité, culture, mobilité, investissement, logement abordable. Données 2026.",
  openGraph: {
    title: "Classements des meilleures villes françaises 2026",
    description: `${RANKINGS_COUNT} classements thématiques : télétravail, famille, budget, soleil, sécurité, culture, gastronomie, investissement, logement, jeunes actifs et plus.`,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  alternates: pathAlternates("/classements", "/rankings"),
};

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
    reviewCount: 180 + Math.floor(s.scores.global * 30),
    sunshinedays: s.sunshinedays,
    avgTempJuly: s.avgTempJuly,
    avgTempJanuary: s.avgTempJanuary,
  };
}

// Same order as RANKING_META: the « Feuille NN / 19 » number shown here is
// recomputed from RANKING_META on each /classements/[slug] hero.
const CATEGORIES = [
  { slug: "teletravail", label: "Télétravail", icon: Laptop, desc: "Fibre, coworking, café culture, qualité de vie", scoreKey: "remoteWork" },
  { slug: "famille", label: "Famille", icon: Home, desc: "Écoles, sécurité, espaces verts, prix", scoreKey: "schools" },
  { slug: "nature", label: "Nature & Sport", icon: TreePine, desc: "Randonnée, vélo, montagne, mer", scoreKey: "nature" },
  { slug: "etudiant", label: "Étudiant", icon: GraduationCap, desc: "Université, coût, culture, mobilité", scoreKey: "culture" },
  { slug: "retraite", label: "Retraite", icon: Palmtree, desc: "Douceur de vivre, santé, calme, soleil", scoreKey: "life" },
  { slug: "budget", label: "Moins chères", icon: Wallet, desc: "Loyer, coût de la vie, pouvoir d'achat réel", scoreKey: "cost" },
  { slug: "soleil", label: "Soleil & Douceur", icon: Sun, desc: "Ensoleillement, température, qualité de l'air", scoreKey: "nature" },
  { slug: "securite", label: "Sécurité", icon: Shield, desc: "Criminalité, sentiment de sécurité, cohésion sociale", scoreKey: "safety" },
  { slug: "culture", label: "Vie culturelle", icon: Music, desc: "Musées, festivals, patrimoine, théâtres", scoreKey: "culture" },
  { slug: "mobilite", label: "Sans voiture", icon: Bike, desc: "Transports, vélo, marchabilité, TGV", scoreKey: "transport" },
  { slug: "investissement", label: "Investissement", icon: Building2, desc: "Prix accessibles, rendement locatif, attractivité", scoreKey: "cost" },
  { slug: "sante", label: "Santé & Soins", icon: Heart, desc: "Densité médicale, hôpitaux, qualité de l'air, bien-être", scoreKey: "life" },
  { slug: "climat", label: "Climat de confort", icon: CloudSun, desc: "Données réelles : ensoleillement, douceur d'été, clémence d'hiver", scoreKey: "nature" },
  { slug: "logement", label: "Logement abordable", icon: KeyRound, desc: "Données DVF + Observatoires loyers : loyer T2, prix au m², coût de vie", scoreKey: "cost" },
  { slug: "jeunes-actifs", label: "Jeunes actifs", icon: Rocket, desc: "Cadres 25-39 ans, TGV, fibre, culture, premier salaire compatible", scoreKey: "culture" },
  { slug: "gastronomie", label: "Gastronomie", icon: ChefHat, desc: "Étoilés Michelin, Bib Gourmand, AOC, marchés couverts, terroir", scoreKey: "culture" },
  { slug: "ecologie", label: "Écologie & Air", icon: Leaf, desc: "Qualité de l'air, mobilité douce, espaces verts, bas-carbone", scoreKey: "nature" },
  { slug: "cyclistes", label: "Vélo & cyclistes", icon: Bike, desc: "Note FUB, pistes cyclables sécurisées, continuité, intermodalité train+vélo", scoreKey: "transport" },
  { slug: "bord-de-mer", label: "Bord de mer", icon: Waves, desc: "Villes côtières où vivre à l'année — trait de côte SHOM, ensoleillement, patrimoine maritime", scoreKey: "nature" },
] as const;

export default function ClassementsPage() {
  const allCities = CITIES_SEED.map(seedToCity);
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Classements", path: "/classements" },
  ]);

  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <AmbientBackground />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-20 pb-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            Édition 2026 · {CATEGORIES.length} feuilles
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
            Les <span className="font-display gradient-text-anim italic">classements</span>{" "}<br className="hidden sm:block" />
            des villes françaises
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            Avis d&apos;habitants + données officielles, agrégés par style de vie.
            Mis à jour chaque semaine — sans bullshit. Sans filtre de style de vie,{" "}
            <Link href="/avis" className="text-[var(--accent)] hover:underline">
              toutes les notes sont réunies au même endroit
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Quick jump chips with scrollspy */}
      <ClassementsJumpNav
        categories={CATEGORIES.map(({ slug, label }) => ({ slug, label }))}
      />

      {/* Sections */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pb-16 space-y-20">
        {CATEGORIES.map((cat, idx) => {
          // Custom-compute rankings (climat, logement, bord-de-mer) can't be
          // previewed by raw axis sort — fall back to the canonical ranker
          // so the homepage top-3 matches the detail page.
          const usesCustomScorer =
            cat.slug === "climat" || cat.slug === "logement" || cat.slug === "bord-de-mer";
          const top3 = usesCustomScorer
            ? getRankedCities(cat.slug as RankingSlug).slice(0, 3).map((r) => r.city)
            : [...allCities]
                .sort(
                  (a, b) =>
                    b.scores[cat.scoreKey as keyof typeof b.scores] -
                    a.scores[cat.scoreKey as keyof typeof a.scores]
                )
                .slice(0, 3);
          const winner = top3[0];

          return (
            <ScrollReveal key={cat.slug}>
              <section id={`cat-${cat.slug}`} className="scroll-mt-32">
                {/* Section header — one survey-map sheet per category: numbered
                    sheet label, enamel-plaque icon tile, ink title. No per-category
                    colour: greens, amber, violet… are reserved for score tiers. */}
                <div className="flex flex-wrap items-center gap-4 mb-6 border-b border-[var(--border)] pb-4">
                  <div className="plaque !p-0 h-12 w-12 justify-center shrink-0" aria-hidden>
                    <cat.icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                      Feuille {String(idx + 1).padStart(2, "0")} / {String(CATEGORIES.length).padStart(2, "0")}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                        Top villes — {cat.label}
                      </h2>
                      <span className="rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                        N°1 {winner.name}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">{cat.desc}</p>
                  </div>
                  <Link
                    href={`/classements/${cat.slug}`}
                    className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:underline"
                  >
                    Classement complet
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Podium — CityCard already prints the rank, so no medal overlay. */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {top3.map((city, i) => (
                    <CityCard key={city.slug} city={city} rank={i + 1} />
                  ))}
                </div>

                <div className="mt-3 sm:hidden text-right">
                  <Link
                    href={`/classements/${cat.slug}`}
                    className="text-sm font-semibold text-[var(--accent)] hover:underline"
                  >
                    Voir le classement complet →
                  </Link>
                </div>
              </section>
            </ScrollReveal>
          );
        })}
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-10">

        <FeedbackWidget />

      </div>

      <Footer />
    </main>
  );
}
