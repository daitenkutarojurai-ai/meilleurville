import { CITIES_SEED } from "@/data/cities-seed";
import Link from "next/link";

const RECENT_CONTRIBUTIONS = [
  { type: "avis", city: "Nantes", handle: "Marie_L", text: "Bonne qualité de vie mais les loyers ont explosé ces 2 ans.", time: "il y a 2h" },
  { type: "red-flag", city: "Bordeaux", handle: "Pierre_D", text: "Chantier tramway ligne C jusqu'à fin 2026, fort bruit.", time: "il y a 4h" },
  { type: "avis", city: "Rennes", handle: "Sophie_K", text: "Les pistes cyclables sont vraiment excellentes, je ne prends plus ma voiture.", time: "il y a 6h" },
  { type: "red-flag", city: "Lyon", handle: "Thomas_M", text: "Pollution atmosphérique importante en hiver (inversions).", time: "il y a 8h" },
  { type: "avis", city: "Annecy", handle: "Laura_B", text: "Immobilier devenu inaccessible sauf pour les primo-accédants très aisés.", time: "il y a 12h" },
  { type: "avis", city: "Strasbourg", handle: "Felix_H", text: "Vélo vraiment irremplaçable ici. La ville est flat, c'est incroyable.", time: "il y a 1j" },
];

const TOP_CONTRIBUTORS = [
  { handle: "Cartographe_FR", badge: "Légende", points: 3420, contributions: 87 },
  { handle: "Marie_L", badge: "Ambassadeur", points: 1245, contributions: 34 },
  { handle: "VilleHunter", badge: "Ambassadeur", points: 890, contributions: 28 },
  { handle: "RennesLocal", badge: "Cartographe", points: 245, contributions: 12 },
  { handle: "Thomas_M", badge: "Cartographe", points: 178, contributions: 9 },
];

const BADGE_COLORS: Record<string, string> = {
  Légende: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  Ambassadeur: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  Cartographe: "text-blue-600 bg-blue-400/10 border-blue-400/20",
  Explorateur: "text-slate-400 bg-slate-400/10 border-slate-400/20",
};

export function ContributionStats() {
  const totalCities = CITIES_SEED.length;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Stats */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-5">Activité de la communauté</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "47k+", label: "Avis publiés" },
            { value: "1.4k", label: "Red Flags" },
            { value: `${totalCities}`, label: "Villes couvertes" },
            { value: "12k+", label: "Contributeurs" },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-xl bg-[var(--bg-elevated)] p-3 text-center">
              <div className="text-xl font-black font-mono-data text-[var(--accent)]">{value}</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{label}</div>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <Link
            href="/villes"
            className="block w-full text-center text-sm font-semibold text-white bg-[var(--accent)] hover:opacity-90 transition-opacity rounded-xl py-2.5"
          >
            Contribuer →
          </Link>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Activité récente</h3>
        <div className="space-y-3">
          {RECENT_CONTRIBUTIONS.map((c, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                c.type === "red-flag" ? "bg-red-500/15 text-red-500" : "bg-emerald-500/15 text-emerald-600"
              }`}>
                {c.type === "red-flag" ? "🚩" : "⭐"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-[var(--text-primary)] truncate">
                  <span className="text-[var(--accent)]">{c.handle}</span>
                  {" · "}
                  <Link href={`/villes/${CITIES_SEED.find(ci => ci.name === c.city)?.slug ?? ""}`} className="hover:underline">
                    {c.city}
                  </Link>
                </div>
                <div className="text-xs text-[var(--text-secondary)] truncate">{c.text}</div>
                <div className="text-xs text-[var(--text-tertiary)]">{c.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top contributors */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Top contributeurs</h3>
        <div className="space-y-3">
          {TOP_CONTRIBUTORS.map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="text-sm font-bold text-[var(--text-tertiary)] w-5 text-right font-mono">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--text-primary)] truncate">{c.handle}</div>
                <div className="text-xs text-[var(--text-tertiary)]">{c.contributions} contributions</div>
              </div>
              <span className={`text-xs font-medium border rounded-full px-2 py-0.5 flex-shrink-0 ${BADGE_COLORS[c.badge]}`}>
                {c.badge}
              </span>
            </div>
          ))}
        </div>
        <Link href="/leaderboard" className="mt-4 block text-center text-xs text-[var(--accent)] hover:underline font-medium">
          Voir le leaderboard →
        </Link>
      </div>
    </div>
  );
}
