// R11.6 — animated VS battle UI for /comparer/[pair].
// Pure server component: CSS keyframes only, zero JS. Each row reveals in
// sequence, bars fill from the centre outwards, the winning side stays vivid
// and the loser fades, the final verdict pulses.

import { scoreColor, scoreHex } from "@/lib/utils";
import type { CitySeed } from "@/data/cities-seed";

type ScoreShape = CitySeed["scores"];

const ROWS: Array<{ key: keyof ScoreShape; label: string; icon: string }> = [
  { key: "global",     label: "Global",     icon: "⭐" },
  { key: "life",       label: "Qualité",    icon: "✨" },
  { key: "transport",  label: "Transport",  icon: "🚊" },
  { key: "nature",     label: "Nature",     icon: "🌳" },
  { key: "cost",       label: "Coût",       icon: "💰" },
  { key: "safety",     label: "Sécurité",   icon: "🛡️" },
  { key: "culture",    label: "Culture",    icon: "🎭" },
  { key: "remoteWork", label: "Remote",     icon: "💻" },
  { key: "schools",    label: "Écoles",     icon: "🎓" },
];

interface CityInput {
  name: string;
  slug: string;
  region?: string | null;
  scores: ScoreShape;
}

interface Props {
  a: CityInput;
  b: CityInput;
}

const KEYFRAMES = `
@keyframes vsb-in-left  { from { transform: translateX(-28px) scale(.94); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes vsb-in-right { from { transform: translateX(28px)  scale(.94); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes vsb-pop {
  0%   { transform: scale(0.35) rotate(-14deg); opacity: 0; }
  55%  { transform: scale(1.22) rotate(6deg);   opacity: 1; }
  80%  { transform: scale(0.94) rotate(-2deg); }
  100% { transform: scale(1)    rotate(0);      opacity: 1; }
}
@keyframes vsb-ring {
  0%   { transform: scale(0.85); opacity: 0.55; }
  70%  { transform: scale(1.85); opacity: 0; }
  100% { transform: scale(1.85); opacity: 0; }
}
@keyframes vsb-bar-l { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes vsb-bar-r { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes vsb-row-in { from { transform: translateY(6px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes vsb-flash {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
  50%      { box-shadow: 0 0 22px 6px rgba(34, 197, 94, 0.45); }
}
.vsb-in-l    { animation: vsb-in-left  .6s ease-out 0s both; }
.vsb-in-r    { animation: vsb-in-right .6s ease-out 0s both; }
.vsb-pop     { animation: vsb-pop      .75s cubic-bezier(.34,1.56,.64,1) .25s both; }
.vsb-ring    { animation: vsb-ring     1.8s ease-out .45s both; }
.vsb-bar-l   { transform-origin: right center; animation: vsb-bar-l .8s cubic-bezier(.22,.61,.36,1) both; }
.vsb-bar-r   { transform-origin: left  center; animation: vsb-bar-r .8s cubic-bezier(.22,.61,.36,1) both; }
.vsb-row-in  { animation: vsb-row-in .45s ease-out both; }
.vsb-flash   { animation: vsb-flash 1.8s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .vsb-in-l, .vsb-in-r, .vsb-pop, .vsb-ring,
  .vsb-bar-l, .vsb-bar-r, .vsb-row-in, .vsb-flash { animation: none !important; transform: none !important; }
}
`;

export function VsBattle({ a, b }: Props) {
  const wins = ROWS.reduce(
    (acc, { key }) => {
      const va = a.scores[key];
      const vb = b.scores[key];
      if (va > vb) acc.a++;
      else if (vb > va) acc.b++;
      else acc.tie++;
      return acc;
    },
    { a: 0, b: 0, tie: 0 },
  );
  const winner = wins.a > wins.b ? a : wins.b > wins.a ? b : null;
  const total = ROWS.length;
  const verdictDelay = 0.55 + ROWS.length * 0.13 + 0.55;

  return (
    <div className="relative">
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      <div className="grid grid-cols-[1fr,auto,1fr] items-stretch gap-2 sm:gap-6">
        <div className="vsb-in-l rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-500/15 to-blue-500/0 p-3 sm:p-6 text-center">
          <div className="text-[10px] sm:text-xs uppercase tracking-widest text-blue-500 font-semibold mb-1">Challenger A</div>
          <div className="text-lg sm:text-3xl font-bold text-[var(--text-primary)] leading-tight">{a.name}</div>
          {a.region && (
            <div className="text-[10px] sm:text-xs text-[var(--text-tertiary)] mt-0.5 truncate">{a.region}</div>
          )}
          <div className={`mt-2 text-2xl sm:text-4xl font-bold font-mono-data ${scoreColor(a.scores.global)}`}>
            {a.scores.global.toFixed(1)}
            <span className="text-sm sm:text-base text-[var(--text-tertiary)]">/10</span>
          </div>
          <div className="mt-1 text-[9px] sm:text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">
            {wins.a} axe{wins.a > 1 ? "s" : ""} gagné{wins.a > 1 ? "s" : ""}
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="vsb-ring absolute h-14 w-14 sm:h-20 sm:w-20 rounded-full bg-amber-400/40 pointer-events-none" aria-hidden />
          <div className="vsb-pop relative z-10 flex h-12 w-12 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 text-white shadow-2xl font-extrabold text-base sm:text-3xl ring-4 ring-[var(--bg-canvas)]">
            VS
          </div>
        </div>

        <div className="vsb-in-r rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-500/15 to-violet-500/0 p-3 sm:p-6 text-center">
          <div className="text-[10px] sm:text-xs uppercase tracking-widest text-violet-500 font-semibold mb-1">Challenger B</div>
          <div className="text-lg sm:text-3xl font-bold text-[var(--text-primary)] leading-tight">{b.name}</div>
          {b.region && (
            <div className="text-[10px] sm:text-xs text-[var(--text-tertiary)] mt-0.5 truncate">{b.region}</div>
          )}
          <div className={`mt-2 text-2xl sm:text-4xl font-bold font-mono-data ${scoreColor(b.scores.global)}`}>
            {b.scores.global.toFixed(1)}
            <span className="text-sm sm:text-base text-[var(--text-tertiary)]">/10</span>
          </div>
          <div className="mt-1 text-[9px] sm:text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">
            {wins.b} axe{wins.b > 1 ? "s" : ""} gagné{wins.b > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 sm:p-6">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-5">
          Le duel critère par critère
        </h2>
        <div className="space-y-4 sm:space-y-5">
          {ROWS.map(({ key, label, icon }, i) => {
            const va = a.scores[key];
            const vb = b.scores[key];
            const aWins = va > vb;
            const bWins = vb > va;
            const tie = !aWins && !bWins;
            const baseDelay = 0.55 + i * 0.13;
            const barDelay = baseDelay + 0.12;
            const badgeDelay = baseDelay + 0.55;
            const aColor = scoreHex(va);
            const bColor = scoreHex(vb);

            return (
              <div
                key={key}
                className="vsb-row-in"
                style={{ animationDelay: `${baseDelay}s` }}
              >
                <div className="grid grid-cols-[auto,1fr,auto,1fr,auto] items-center gap-1.5 sm:gap-3">
                  <span
                    className={`w-8 sm:w-10 text-right text-xs sm:text-sm font-bold font-mono-data tabular-nums ${aWins ? scoreColor(va) : "text-[var(--text-tertiary)]"}`}
                  >
                    {va.toFixed(1)}
                  </span>
                  <div className="h-2.5 sm:h-3 rounded-l-full bg-[var(--bg-elevated)] overflow-hidden flex justify-end">
                    <div
                      className="vsb-bar-l h-full rounded-l-full"
                      style={{
                        width: `${(va / 10) * 100}%`,
                        background: aWins ? aColor : `${aColor}55`,
                        animationDelay: `${barDelay}s`,
                        boxShadow: aWins ? `0 0 10px ${aColor}88` : undefined,
                        opacity: aWins ? 1 : 0.65,
                      }}
                    />
                  </div>
                  <div className="text-[10px] sm:text-xs font-semibold text-[var(--text-secondary)] text-center px-1 leading-tight whitespace-nowrap">
                    <span className="block text-sm sm:text-base" aria-hidden>{icon}</span>
                    <span className="block">{label}</span>
                  </div>
                  <div className="h-2.5 sm:h-3 rounded-r-full bg-[var(--bg-elevated)] overflow-hidden">
                    <div
                      className="vsb-bar-r h-full rounded-r-full"
                      style={{
                        width: `${(vb / 10) * 100}%`,
                        background: bWins ? bColor : `${bColor}55`,
                        animationDelay: `${barDelay}s`,
                        boxShadow: bWins ? `0 0 10px ${bColor}88` : undefined,
                        opacity: bWins ? 1 : 0.65,
                      }}
                    />
                  </div>
                  <span
                    className={`w-8 sm:w-10 text-xs sm:text-sm font-bold font-mono-data tabular-nums ${bWins ? scoreColor(vb) : "text-[var(--text-tertiary)]"}`}
                  >
                    {vb.toFixed(1)}
                  </span>
                </div>
                <div
                  className="vsb-row-in mt-1.5 flex justify-center"
                  style={{ animationDelay: `${badgeDelay}s` }}
                >
                  {tie ? (
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-[var(--bg-elevated)] text-[var(--text-tertiary)]">
                      = Égalité
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${aWins ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" : "bg-violet-500/15 text-violet-500 dark:text-violet-300"}`}
                    >
                      ✓ {(aWins ? a : b).name}
                      <span className="opacity-70">+{Math.abs(va - vb).toFixed(1)}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="vsb-row-in vsb-flash mt-8 rounded-2xl border border-emerald-400/40 p-5 sm:p-6 text-center"
          style={{
            animationDelay: `${verdictDelay}s, ${verdictDelay + 0.4}s`,
            animationFillMode: "both, both",
            background:
              "linear-gradient(135deg, rgba(34, 197, 94, 0.14), rgba(16, 185, 129, 0.04))",
          }}
        >
          <div className="text-[10px] sm:text-xs uppercase tracking-widest text-emerald-600 font-bold mb-1">
            Verdict final
          </div>
          {winner ? (
            <>
              <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                🏆 {winner.name} l&apos;emporte
              </p>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                {winner === a ? wins.a : wins.b} axes gagnés sur {total} ·
                écart {Math.abs(a.scores.global - b.scores.global).toFixed(1)} pt au global
              </p>
            </>
          ) : (
            <>
              <p className="text-xl sm:text-2xl font-bold text-amber-500">
                ⚖️ Égalité parfaite
              </p>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                {wins.a}–{wins.b} sur les axes décisifs · le choix dépend de tes priorités
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
