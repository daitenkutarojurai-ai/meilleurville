import Link from "next/link";
import { ArrowRight, Laptop, Home, TreePine, GraduationCap, Palmtree } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const RANKINGS = [
  {
    slug: "teletravail",
    label: "Télétravail",
    icon: Laptop,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    description: "Fibre, coworking, café culture",
    topCity: "Rennes",
    topScore: "9.1",
  },
  {
    slug: "famille",
    label: "Famille",
    icon: Home,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    description: "Écoles, sécurité, espaces verts",
    topCity: "Annecy",
    topScore: "8.9",
  },
  {
    slug: "nature",
    label: "Nature & Sport",
    icon: TreePine,
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
    description: "Randonnée, vélo, grand air",
    topCity: "Grenoble",
    topScore: "9.4",
  },
  {
    slug: "etudiant",
    label: "Étudiant",
    icon: GraduationCap,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
    description: "Campus, coût, nightlife",
    topCity: "Toulouse",
    topScore: "8.7",
  },
  {
    slug: "retraite",
    label: "Retraite",
    icon: Palmtree,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    description: "Douceur de vivre, santé, calme",
    topCity: "Aix-en-Provence",
    topScore: "8.6",
  },
];

export function RankingPreview() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <Badge variant="accent" className="mb-3">Classements 2025</Badge>
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">
              Classements par style de vie
            </h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              Algorithme composite · mis à jour chaque semaine
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
            return (
              <Link key={r.slug} href={`/classements/${r.slug}`}>
                <div
                  className={`group relative overflow-hidden rounded-2xl border ${r.border} ${r.bg} p-5 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer h-full`}
                >
                  <div
                    className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/20`}
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
                        {r.topCity}
                      </div>
                    </div>
                    <div className={`text-xl font-bold font-mono-data ${r.color}`}>
                      {r.topScore}
                    </div>
                  </div>
                </div>
              </Link>
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
