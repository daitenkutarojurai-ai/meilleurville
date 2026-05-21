import Link from "next/link";
import { ArrowRight, Laptop, Home, TreePine, GraduationCap, Palmtree } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { TiltCard } from "@/components/effects/TiltCard";
import { Spotlight } from "@/components/effects/Spotlight";
import { getRankedCities, type RankingSlug } from "@/lib/rankings";
import { scoreColor } from "@/lib/utils";

const RANKINGS = [
  {
    slug: "teletravail",
    label: "Télétravail",
    icon: Laptop,
    color: "text-blue-600",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    description: "Fibre, coworking, café culture",
  },
  {
    slug: "famille",
    label: "Famille",
    icon: Home,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
    border: "border-emerald-400/20",
    description: "Écoles, sécurité, espaces verts",
  },
  {
    slug: "nature",
    label: "Nature & Sport",
    icon: TreePine,
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
    description: "Randonnée, vélo, grand air",
  },
  {
    slug: "etudiant",
    label: "Étudiant",
    icon: GraduationCap,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
    description: "Campus, coût, nightlife",
  },
  {
    slug: "retraite",
    label: "Retraite",
    icon: Palmtree,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    description: "Douceur de vivre, santé, calme",
  },
];

export function RankingPreview() {
  return (
    <section id="classements" className="py-8 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <Badge variant="accent" className="mb-3">Classements 2026</Badge>
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">
              Classements par style de vie
            </h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              Algorithme composite · données 2026
            </p>
          </div>
          <Link
            href="/classements"
            className="hidden sm:flex items-center gap-1 text-sm text-[var(--accent)] hover:underline"
          >
            Tous les classements
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {RANKINGS.map((r) => {
            const Icon = r.icon;
            // Real #1 city + score, derived from the live ranking engine —
            // no hardcoded preview numbers (those drifted above the 8.6 clamp).
            const top = getRankedCities(r.slug as RankingSlug)[0];
            return (
              <TiltCard key={r.slug} max={6} scale={1.025} className="h-full">
                <Link href={`/classements/${r.slug}`} className="block h-full">
                  <Spotlight className={`group relative overflow-hidden rounded-2xl border ${r.border} ${r.bg} p-5 cursor-pointer h-full backdrop-blur-sm transition-shadow hover:shadow-xl shine`}>
                    <div className="relative z-10" style={{ transform: "translateZ(20px)" }}>
                      <div
                        className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 ring-1 ring-white/40 backdrop-blur shadow-sm`}
                      >
                        <Icon className={`h-5 w-5 ${r.color}`} />
                      </div>
                      <h3 className={`font-semibold ${r.color} mb-1`}>{r.label}</h3>
                      <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
                        {r.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-[var(--text-secondary)]">N°1</div>
                          <div className="text-sm font-semibold text-[var(--text-primary)]">
                            {top.city.name}
                          </div>
                        </div>
                        <div className={`text-2xl font-bold font-mono-data ${scoreColor(top.score)}`}>
                          {top.score.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </Spotlight>
                </Link>
              </TiltCard>
            );
          })}
        </div>

        <div className="mt-4 sm:hidden text-center">
          <Link
            href="/classements"
            className="text-sm text-[var(--accent)] hover:underline inline-flex items-center gap-1"
          >
            Tous les classements
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
