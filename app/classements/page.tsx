import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CITIES_SEED } from "@/data/cities-seed";
import { CityCard } from "@/components/CityCard";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import Link from "next/link";
import {
  Laptop, Home, TreePine, GraduationCap, Palmtree, ArrowRight, Wallet,
  Sun, Shield, Music, Bike, Building2, Heart, Leaf,
} from "lucide-react";
import type { City } from "@/lib/types";

export const metadata: Metadata = {
  title: "Classements villes françaises 2025 — Télétravail, Famille, Budget, Culture",
  description:
    "Classements des meilleures villes françaises par style de vie : télétravail, famille, retraite, étudiant, nature, budget, soleil, sécurité, culture, mobilité, investissement. Données 2025.",
  openGraph: {
    title: "Classements des meilleures villes françaises 2025",
    description:
      "11 classements thématiques : télétravail, famille, budget, soleil, sécurité, culture, investissement et plus.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
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

const CATEGORIES = [
  { slug: "teletravail", label: "Télétravail", emoji: "💻", icon: Laptop, gradient: "from-blue-400 to-sky-500", color: "#3B82F6", desc: "Fibre, coworking, café culture, qualité de vie", scoreKey: "remoteWork" },
  { slug: "famille", label: "Famille", emoji: "🏡", icon: Home, gradient: "from-emerald-400 to-lime-500", color: "#10B981", desc: "Écoles, sécurité, espaces verts, prix", scoreKey: "schools" },
  { slug: "nature", label: "Nature & Sport", emoji: "🌲", icon: TreePine, gradient: "from-green-400 to-emerald-500", color: "#22C55E", desc: "Randonnée, vélo, montagne, mer", scoreKey: "nature" },
  { slug: "etudiant", label: "Étudiant", emoji: "🎓", icon: GraduationCap, gradient: "from-violet-400 to-fuchsia-500", color: "#8B5CF6", desc: "Université, coût, culture, mobilité", scoreKey: "culture" },
  { slug: "retraite", label: "Retraite", emoji: "🌴", icon: Palmtree, gradient: "from-amber-400 to-orange-500", color: "#F59E0B", desc: "Douceur de vivre, santé, calme, soleil", scoreKey: "life" },
  { slug: "budget", label: "Moins chères", emoji: "💸", icon: Wallet, gradient: "from-yellow-400 to-amber-500", color: "#EAB308", desc: "Loyer, coût de la vie, pouvoir d'achat réel", scoreKey: "cost" },
  { slug: "soleil", label: "Soleil & Douceur", emoji: "☀️", icon: Sun, gradient: "from-orange-400 to-rose-400", color: "#F97316", desc: "Ensoleillement, température, qualité de l'air", scoreKey: "nature" },
  { slug: "securite", label: "Sécurité", emoji: "🛡️", icon: Shield, gradient: "from-sky-400 to-cyan-500", color: "#0EA5E9", desc: "Criminalité, sentiment de sécurité, cohésion sociale", scoreKey: "safety" },
  { slug: "culture", label: "Vie culturelle", emoji: "🎭", icon: Music, gradient: "from-purple-400 to-pink-500", color: "#A855F7", desc: "Musées, festivals, patrimoine, théâtres", scoreKey: "culture" },
  { slug: "mobilite", label: "Sans voiture", emoji: "🚲", icon: Bike, gradient: "from-teal-400 to-emerald-500", color: "#14B8A6", desc: "Transports, vélo, marchabilité, TGV", scoreKey: "transport" },
  { slug: "investissement", label: "Investissement", emoji: "📈", icon: Building2, gradient: "from-rose-400 to-pink-500", color: "#F43F5E", desc: "Prix accessibles, rendement locatif, attractivité", scoreKey: "cost" },
  { slug: "sante", label: "Santé & Soins", emoji: "❤️", icon: Heart, gradient: "from-pink-400 to-rose-500", color: "#EC4899", desc: "Densité médicale, hôpitaux, qualité de l'air, bien-être", scoreKey: "life" },
  { slug: "ecologie", label: "Écologie & Air", emoji: "🌿", icon: Leaf, gradient: "from-lime-400 to-green-500", color: "#84CC16", desc: "Qualité de l'air, mobilité douce, espaces verts, bas-carbone", scoreKey: "nature" },
] as const;

export default function ClassementsPage() {
  const allCities = CITIES_SEED.map(seedToCity);

  return (
    <main className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-20 pb-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            🏆 Édition 2025
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
            Les <span className="font-display gradient-text-anim italic">classements</span><br className="hidden sm:block" />
            des villes françaises
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            Avis d&apos;habitants + données officielles, agrégés par style de vie.
            Mis à jour chaque semaine — sans bullshit.
          </p>
        </div>
      </section>

      {/* Quick jump chips */}
      <section className="relative pb-8 sticky top-14 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap gap-2 justify-center rounded-2xl glass border border-white/50 p-3 backdrop-blur-xl shadow-md">
            {CATEGORIES.map((cat) => (
              <a
                key={cat.slug}
                href={`#cat-${cat.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/70 hover:bg-white border border-[var(--border)] hover:border-[var(--accent)]/40 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Sections */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pb-16 space-y-20">
        {CATEGORIES.map((cat) => {
          const sorted = [...allCities].sort(
            (a, b) =>
              b.scores[cat.scoreKey as keyof typeof b.scores] -
              a.scores[cat.scoreKey as keyof typeof a.scores]
          );
          const top3 = sorted.slice(0, 3);
          const winner = top3[0];

          return (
            <ScrollReveal key={cat.slug}>
              <section id={`cat-${cat.slug}`} className="scroll-mt-32">
                {/* Section header */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.gradient} shadow-lg ring-1 ring-white/40`}>
                    <span className="text-2xl">{cat.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                        Top villes — <span style={{ color: cat.color }}>{cat.label}</span>
                      </h2>
                      <span className="rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                        N°1 {winner.name}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">{cat.desc}</p>
                  </div>
                  <Link
                    href={`/classements/${cat.slug}`}
                    className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                    style={{ color: cat.color }}
                  >
                    Classement complet
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Podium (medals) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {top3.map((city, i) => (
                    <div key={city.slug} className="relative">
                      {/* Medal badge */}
                      <div
                        className="absolute -top-2 -left-2 z-10 flex h-9 w-9 items-center justify-center rounded-full text-lg shadow-lg ring-2 ring-white"
                        style={{ background: ["#FCD34D", "#D1D5DB", "#F4A28A"][i] ?? "#FCD34D" }}
                      >
                        {["🥇", "🥈", "🥉"][i]}
                      </div>
                      <CityCard city={city} rank={i + 1} />
                    </div>
                  ))}
                </div>

                <div className="mt-3 sm:hidden text-right">
                  <Link
                    href={`/classements/${cat.slug}`}
                    className="text-sm font-semibold hover:underline"
                    style={{ color: cat.color }}
                  >
                    Voir le classement complet →
                  </Link>
                </div>
              </section>
            </ScrollReveal>
          );
        })}
      </div>

      <Footer />
    </main>
  );
}
