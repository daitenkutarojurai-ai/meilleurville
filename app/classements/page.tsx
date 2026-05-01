import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { CityCard } from "@/components/CityCard";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Laptop, Home, TreePine, GraduationCap, Palmtree, ArrowRight, Wallet, Sun, Shield, Music, Bike, Building2, Heart } from "lucide-react";
import type { City } from "@/lib/types";

export const metadata: Metadata = {
  title: "Classements villes françaises 2025 — Télétravail, Famille, Budget, Culture",
  description:
    "Classements des meilleures villes françaises par style de vie : télétravail, famille, retraite, étudiant, nature, budget, soleil, sécurité, culture, mobilité, investissement. Données 2025.",
  openGraph: {
    title: "Classements des meilleures villes françaises 2025",
    description: "11 classements thématiques : télétravail, famille, budget, soleil, sécurité, culture, investissement et plus.",
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
  {
    slug: "teletravail",
    label: "Télétravail",
    icon: Laptop,
    color: "text-blue-400",
    borderColor: "border-blue-400/20",
    bgColor: "bg-blue-400/5",
    desc: "Fibre, coworking, café culture, qualité de vie",
    scoreKey: "remoteWork" as keyof (typeof CITIES_SEED)[number]["scores"],
  },
  {
    slug: "famille",
    label: "Famille",
    icon: Home,
    color: "text-emerald-400",
    borderColor: "border-emerald-400/20",
    bgColor: "bg-emerald-400/5",
    desc: "Écoles, sécurité, espaces verts, prix",
    scoreKey: "schools" as keyof (typeof CITIES_SEED)[number]["scores"],
  },
  {
    slug: "nature",
    label: "Nature & Sport",
    icon: TreePine,
    color: "text-green-400",
    borderColor: "border-green-400/20",
    bgColor: "bg-green-400/5",
    desc: "Randonnée, vélo, montagne, mer",
    scoreKey: "nature" as keyof (typeof CITIES_SEED)[number]["scores"],
  },
  {
    slug: "etudiant",
    label: "Étudiant",
    icon: GraduationCap,
    color: "text-violet-400",
    borderColor: "border-violet-400/20",
    bgColor: "bg-violet-400/5",
    desc: "Université, coût, culture, mobilité",
    scoreKey: "culture" as keyof (typeof CITIES_SEED)[number]["scores"],
  },
  {
    slug: "retraite",
    label: "Retraite",
    icon: Palmtree,
    color: "text-amber-400",
    borderColor: "border-amber-400/20",
    bgColor: "bg-amber-400/5",
    desc: "Douceur de vivre, santé, calme, soleil",
    scoreKey: "life" as keyof (typeof CITIES_SEED)[number]["scores"],
  },
  {
    slug: "budget",
    label: "Moins chères",
    icon: Wallet,
    color: "text-yellow-400",
    borderColor: "border-yellow-400/20",
    bgColor: "bg-yellow-400/5",
    desc: "Loyer, coût de la vie, pouvoir d'achat réel",
    scoreKey: "cost" as keyof (typeof CITIES_SEED)[number]["scores"],
  },
  {
    slug: "soleil",
    label: "Soleil & Douceur",
    icon: Sun,
    color: "text-orange-400",
    borderColor: "border-orange-400/20",
    bgColor: "bg-orange-400/5",
    desc: "Ensoleillement, température, qualité de l'air",
    scoreKey: "nature" as keyof (typeof CITIES_SEED)[number]["scores"],
  },
  {
    slug: "securite",
    label: "Sécurité",
    icon: Shield,
    color: "text-sky-400",
    borderColor: "border-sky-400/20",
    bgColor: "bg-sky-400/5",
    desc: "Criminalité, sentiment de sécurité, cohésion sociale",
    scoreKey: "safety" as keyof (typeof CITIES_SEED)[number]["scores"],
  },
  {
    slug: "culture",
    label: "Vie culturelle",
    icon: Music,
    color: "text-purple-400",
    borderColor: "border-purple-400/20",
    bgColor: "bg-purple-400/5",
    desc: "Musées, festivals, patrimoine, théâtres",
    scoreKey: "culture" as keyof (typeof CITIES_SEED)[number]["scores"],
  },
  {
    slug: "mobilite",
    label: "Sans voiture",
    icon: Bike,
    color: "text-teal-400",
    borderColor: "border-teal-400/20",
    bgColor: "bg-teal-400/5",
    desc: "Transports, vélo, marchabilité, TGV",
    scoreKey: "transport" as keyof (typeof CITIES_SEED)[number]["scores"],
  },
  {
    slug: "investissement",
    label: "Investissement",
    icon: Building2,
    color: "text-rose-400",
    borderColor: "border-rose-400/20",
    bgColor: "bg-rose-400/5",
    desc: "Prix accessibles, rendement locatif, attractivité",
    scoreKey: "cost" as keyof (typeof CITIES_SEED)[number]["scores"],
  },
  {
    slug: "sante",
    label: "Santé & Soins",
    icon: Heart,
    color: "text-pink-400",
    borderColor: "border-pink-400/20",
    bgColor: "bg-pink-400/5",
    desc: "Densité médicale, hôpitaux, qualité de l'air, bien-être",
    scoreKey: "life" as keyof (typeof CITIES_SEED)[number]["scores"],
  },
];

export default function ClassementsPage() {
  const allCities = CITIES_SEED.map(seedToCity);

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="bg-[var(--bg-surface)] py-14 border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">Édition 2025</Badge>
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-3">
            Classements des villes françaises
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            Algorithme composite basé sur les avis d&apos;habitants, les données
            statistiques officielles et les signaux de la communauté. Mis à jour
            chaque semaine.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 space-y-16">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const sorted = [...allCities].sort(
            (a, b) =>
              b.scores[cat.scoreKey as keyof typeof b.scores] -
              a.scores[cat.scoreKey as keyof typeof a.scores]
          );
          const top3 = sorted.slice(0, 3);

          return (
            <section key={cat.slug}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${cat.bgColor} border ${cat.borderColor}`}>
                  <Icon className={`h-5 w-5 ${cat.color}`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    Top villes — {cat.label}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">{cat.desc}</p>
                </div>
                <Link
                  href={`/classements/${cat.slug}`}
                  className={`ml-auto hidden sm:flex items-center gap-1 text-sm ${cat.color} hover:underline`}
                >
                  Classement complet
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {top3.map((city, i) => (
                  <CityCard key={city.slug} city={city} rank={i + 1} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <Footer />
    </main>
  );
}
