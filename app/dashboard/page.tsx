import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CITIES_SEED } from "@/data/cities-seed";
import Link from "next/link";
import {
  MapPin,
  Star,
  Heart,
  Bell,
  FileText,
  Trophy,
  TrendingUp,
  Sparkles,
  Lock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Mon tableau de bord — MeilleurVille",
  description: "Gérez vos villes sauvegardées, avis, alertes et rapport IA personnalisé.",
};

// Demo data — in production, fetched from DB for authenticated user
const SAVED_CITIES = CITIES_SEED.slice(0, 3);
const MY_REVIEWS = [
  { cityName: "Annecy", score: 9, preview: "Une ville magnifique avec un cadre naturel exceptionnel...", date: "2025-03-15", votes: 23 },
  { cityName: "Nantes", score: 7, preview: "Bonne ville étudiante, les transports sont excellents mais...", date: "2025-01-08", votes: 11 },
];

const BADGE_LEVELS = [
  { level: "Explorateur", minPoints: 0, color: "text-slate-400 border-slate-600" },
  { level: "Cartographe", minPoints: 100, color: "text-blue-600 border-blue-600" },
  { level: "Ambassadeur", minPoints: 500, color: "text-violet-400 border-violet-600" },
  { level: "Légende", minPoints: 2000, color: "text-amber-400 border-amber-600" },
];

export default function DashboardPage() {
  const userPoints = 145;
  const currentBadge = BADGE_LEVELS.filter((b) => userPoints >= b.minPoints).pop()!;
  const nextBadge = BADGE_LEVELS.find((b) => b.minPoints > userPoints);
  const progressPct = nextBadge
    ? Math.round(((userPoints - currentBadge.minPoints) / (nextBadge.minPoints - currentBadge.minPoints)) * 100)
    : 100;

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Avatar */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/20 text-xl font-bold text-[var(--accent)]">
              D
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                  Mon espace
                </h1>
                <Badge
                  variant="default"
                  className={`border ${currentBadge.color}`}
                >
                  {currentBadge.level}
                </Badge>
              </div>
              {/* Progress to next badge */}
              <div className="flex items-center gap-3 max-w-xs">
                <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
                  {userPoints} pts
                  {nextBadge && ` · ${nextBadge.level} dans ${nextBadge.minPoints - userPoints} pts`}
                </span>
              </div>
            </div>
            <Link href="/premium">
              <Button size="sm" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Passer à Pro
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {/* Saved cities */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <h2 className="font-semibold text-[var(--text-primary)]">
                    Villes sauvegardées
                  </h2>
                  <Badge variant="subtle">{SAVED_CITIES.length}</Badge>
                </div>
                <Link href="/villes" className="text-xs text-[var(--accent)] hover:underline">
                  Ajouter →
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {SAVED_CITIES.map((c) => (
                  <Link key={c.slug} href={`/villes/${c.slug}`}>
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:border-[var(--accent)]/40 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-3.5 w-3.5 text-[var(--accent)]" />
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {c.name}
                        </span>
                      </div>
                      <div className="text-2xl font-bold font-mono-data text-emerald-600 mb-1">
                        {c.scores.global.toFixed(1)}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">{c.region}</p>
                      <div className="mt-2 flex items-center gap-1 text-xs text-amber-500">
                        <Bell className="h-3 w-3" />
                        <span className="text-[var(--text-secondary)]">Alertes activées</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* My reviews */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  <h2 className="font-semibold text-[var(--text-primary)]">Mes avis</h2>
                  <Badge variant="subtle">{MY_REVIEWS.length}</Badge>
                </div>
              </div>
              <div className="space-y-3">
                {MY_REVIEWS.map((r) => (
                  <div
                    key={r.cityName}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-[var(--accent)]" />
                        <span className="font-medium text-[var(--text-primary)] text-sm">
                          {r.cityName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-amber-500" />
                        <span className="text-sm font-bold font-mono-data text-[var(--text-primary)]">
                          {r.score}/10
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-2">
                      {r.preview}
                    </p>
                    <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                      <span>{new Date(r.date).toLocaleDateString("fr-FR")}</span>
                      <span className="text-emerald-600">👍 {r.votes} utile</span>
                    </div>
                  </div>
                ))}
                <Button variant="secondary" className="w-full text-sm" size="sm">
                  Écrire un nouvel avis
                </Button>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Stats */}
            <Card>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
                Mes statistiques
              </h3>
              <div className="space-y-3">
                {[
                  { icon: Star, label: "Avis rédigés", value: MY_REVIEWS.length, color: "text-amber-500" },
                  { icon: TrendingUp, label: "Votes utiles reçus", value: 34, color: "text-emerald-600" },
                  { icon: Heart, label: "Villes sauvegardées", value: SAVED_CITIES.length, color: "text-red-500" },
                  { icon: Trophy, label: "Points de contribution", value: userPoints, color: "text-[var(--accent)]" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${color}`} />
                    <span className="flex-1 text-sm text-[var(--text-secondary)]">{label}</span>
                    <span className={`text-sm font-bold font-mono-data ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Pro features (locked) */}
            <Card className="border-[var(--accent)]/20 bg-[var(--accent)]/5">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Fonctionnalités Pro
                </h3>
              </div>
              <div className="space-y-2 mb-4">
                {[
                  "Rapport IA personnalisé",
                  "Profils de quartiers",
                  "Red Flag Radar complet",
                  "Alertes temps réel",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <Lock className="h-3 w-3 text-[var(--accent)]/50 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/premium">
                <Button size="sm" className="w-full gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Essai 7j gratuit
                </Button>
              </Link>
            </Card>

            {/* Badges */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Progression</h3>
              </div>
              <div className="space-y-3">
                {BADGE_LEVELS.map((b) => {
                  const unlocked = userPoints >= b.minPoints;
                  return (
                    <div key={b.level} className={`flex items-center gap-2 ${unlocked ? "" : "opacity-40"}`}>
                      <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-bold ${b.color}`}>
                        {unlocked ? "✓" : "○"}
                      </div>
                      <div className="flex-1">
                        <div className={`text-xs font-medium ${b.color}`}>{b.level}</div>
                        <div className="text-[10px] text-[var(--text-secondary)]">
                          {b.minPoints === 0 ? "Départ" : `${b.minPoints} pts`}
                        </div>
                      </div>
                      {b.level === currentBadge.level && (
                        <Badge variant="accent" className="text-[10px]">Actuel</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
