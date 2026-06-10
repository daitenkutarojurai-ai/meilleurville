import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { parisCommuteAll } from "@/lib/paris-commute-rankings";
import { scoreColor, formatScore } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Les villes les plus accessibles depuis Paris en train · Classement 2026",
  description: "Temps de trajet ferroviaire Paris ↔ chaque ville française. Top villes < 1 h, < 2 h, < 3 h depuis Paris-gares. Idéal télétravailleurs et week-end commuters.",
  alternates: { canonical: "/depuis-paris" },
  openGraph: {
    title: "Depuis Paris en train · Classement 2026",
    description: "Temps de trajet TGV/TER Paris ↔ chaque ville française. Estimation horaires SNCF + accès local.",
  },
};

const BUCKETS = [
  { max: 60, label: "Moins d'1 heure", tone: "text-emerald-700 bg-emerald-100 border-emerald-300" },
  { max: 90, label: "1 h à 1 h 30", tone: "text-lime-700 bg-lime-100 border-lime-300" },
  { max: 120, label: "1 h 30 à 2 h", tone: "text-amber-700 bg-amber-100 border-amber-300" },
  { max: 180, label: "2 h à 3 h", tone: "text-orange-700 bg-orange-100 border-orange-300" },
  { max: 300, label: "3 h à 5 h", tone: "text-red-700 bg-red-100 border-red-300" },
] as const;

export default function DepuisParisPage() {
  const all = parisCommuteAll().sort((a, b) => a.commute.minutes - b.commute.minutes);
  const grouped = BUCKETS.map((b, i) => {
    const prevMax = i === 0 ? 0 : BUCKETS[i - 1].max;
    return {
      bucket: b,
      items: all.filter((x) => x.commute.minutes > prevMax && x.commute.minutes <= b.max),
    };
  });

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link>
          <span className="mx-1">›</span>
          <Link href="/depuis" className="hover:underline">Depuis votre ville</Link>
          <span className="mx-1">›</span>
          <span>Paris</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Depuis Paris en train — classement par temps de trajet
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          {all.length} villes triées par durée ferroviaire estimée jusqu&apos;à Paris (horaires
          SNCF jun 2025 pour les villes gares + estimation TER/accès pour les autres).
          Outil clé pour télétravailleurs et navetteurs week-end.
        </p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <Badge>{all.length} villes</Badge>
          <Badge>Horaires SNCF</Badge>
          <Badge>+ accès local estimé</Badge>
        </div>

        {grouped.map(({ bucket, items }) =>
          items.length === 0 ? null : (
            <div key={bucket.label} className="mt-10">
              <div className="flex items-baseline justify-between gap-3 mb-3">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">{bucket.label}</h2>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${bucket.tone}`}>
                  {items.length} ville{items.length > 1 ? "s" : ""}
                </span>
              </div>
              <Card className="overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--bg-surface)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                    <tr>
                      <th className="px-3 py-2 text-left">Ville</th>
                      <th className="px-3 py-2 text-left hidden sm:table-cell">Région</th>
                      <th className="px-3 py-2 text-right">Trajet</th>
                      <th className="px-3 py-2 text-right hidden md:table-cell">Via</th>
                      <th className="px-3 py-2 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(({ city, commute }) => (
                      <tr key={city.slug} className="border-b border-[var(--border)] hover:bg-[var(--bg-surface)]">
                        <td className="px-3 py-2 text-sm">
                          <Link href={`/villes/${city.slug}`} className="font-medium text-[var(--text-primary)] hover:underline">
                            {city.name}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-sm text-[var(--text-secondary)] hidden sm:table-cell">{city.region ?? "—"}</td>
                        <td className="px-3 py-2 text-right text-sm font-mono-data font-semibold tabular-nums">
                          {commute.display}
                        </td>
                        <td className="px-3 py-2 text-right text-[11px] text-[var(--text-tertiary)] hidden md:table-cell">
                          {commute.source === "direct-station"
                            ? "Direct"
                            : commute.viaStation
                              ? `${commute.viaStation} (+${commute.accessKm} km)`
                              : "—"}
                        </td>
                        <td className={`px-3 py-2 text-right text-sm font-mono-data font-bold ${scoreColor(city.scores.global)}`}>
                          {formatScore(city.scores.global)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          ),
        )}

        <div className="mt-10 text-xs text-[var(--text-tertiary)]">
          Méthodologie : pour les villes gares directes Paris, durée publiée par la SNCF (Oui.sncf,
          juin 2025). Pour les autres villes, durée de la gare TGV/TER la plus proche + 0,5 min/km
          d&apos;accès local (TER ou voiture). Outre-mer / Corse : non couvert (pas de rail).
        </div>
      </section>
      <Footer />
    </main>
  );
}
