"use client";

import { useEffect, useState } from "react";
import { Users, Star, BarChart3 } from "lucide-react";

interface Comment {
  id: string;
  rating?: number;
}

interface Props {
  topic: string;
  officialGlobal: number;
  cityName: string;
}

const MIN_VOTES = 5;

export function UserVsOfficialScore({ topic, officialGlobal, cityName }: Props) {
  const [items, setItems] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/comments?topic=${encodeURIComponent(topic)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setItems(Array.isArray(d.items) ? d.items : []);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [topic]);

  const ratings = items.map((c) => c.rating).filter((r): r is number => typeof r === "number");
  const voteCount = ratings.length;
  const avgRating = voteCount > 0 ? ratings.reduce((a, b) => a + b, 0) / voteCount : 0;
  // Map 1-5 stars to 2-10 scale for parity with official score
  const userOnTen = avgRating > 0 ? avgRating * 2 : 0;
  const enough = voteCount >= MIN_VOTES;
  const delta = userOnTen - officialGlobal;

  const officialPct = (officialGlobal / 10) * 100;
  const userPct = (userOnTen / 10) * 100;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-4 w-4 text-[var(--accent)]" />
        <h3 className="text-sm font-bold text-[var(--text-primary)]">
          Score officiel vs avis habitants
        </h3>
      </div>

      {loading ? (
        <p className="text-xs text-[var(--text-tertiary)]">Chargement…</p>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Star className="h-3 w-3 text-amber-500" />
                  Score MeilleurVille
                </span>
                <span className="text-sm font-bold font-mono-data text-[var(--accent)]">
                  {officialGlobal.toFixed(1)} / 10
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all duration-700"
                  style={{ width: `${officialPct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Users className="h-3 w-3 text-[var(--accent-warm)]" />
                  Avis habitants
                  {voteCount > 0 && (
                    <span className="text-[10px] font-mono-data text-[var(--text-tertiary)]">
                      ({voteCount} vote{voteCount > 1 ? "s" : ""})
                    </span>
                  )}
                </span>
                <span className="text-sm font-bold font-mono-data text-[var(--text-primary)]">
                  {enough ? `${userOnTen.toFixed(1)} / 10` : "Pas assez de votes"}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                {enough ? (
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-700"
                    style={{ width: `${userPct}%` }}
                  />
                ) : (
                  <div className="h-full w-full bg-[repeating-linear-gradient(45deg,var(--bg-elevated),var(--bg-elevated)_4px,#e5e7eb_4px,#e5e7eb_8px)]" />
                )}
              </div>
            </div>
          </div>

          {enough ? (
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {Math.abs(delta) < 0.4
                ? `Les habitants confirment le score officiel : convergence à ${Math.abs(delta).toFixed(1)} pt près.`
                : delta > 0
                ? `Les habitants notent ${cityName} ${delta.toFixed(1)} pt au-dessus du score officiel — la ville est sous-cotée selon eux.`
                : `Les habitants notent ${cityName} ${Math.abs(delta).toFixed(1)} pt sous le score officiel — perception plus sévère.`}
            </p>
          ) : (
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
              Il faut au moins {MIN_VOTES} avis avec note pour comparer. Soyez le premier à noter dans la discussion plus bas.
            </p>
          )}
        </>
      )}
    </div>
  );
}
