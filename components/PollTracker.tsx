// Suivi des sondages du 1er tour 2027 (`data/presidential-2027-polls.ts`).
// Composant serveur, zéro JS. Forme choisie : une rangée par candidat avec la
// fourchette des enquêtes (min → max) et la moyenne en point. Chaque rangée
// est nommée en toutes lettres, donc l'identité ne repose jamais sur la
// couleur ; le tableau des enquêtes en dessous sert de vue accessible.

import {
  BLOC_2027,
  CANDIDATE_2027_NAME,
  POLLS_2027,
  POLLS_2027_AS_OF,
  type Candidate2027,
} from "@/data/presidential-2027-polls";
import { BLOC_COLORS, BLOC_LABEL } from "@/lib/political-lean-meta";

const AXIS_MAX = 40;

function fmt(n: number): string {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
}

export function PollTracker({ showTable = true }: { showTable?: boolean }) {
  const cands = new Map<Candidate2027, number[]>();
  for (const p of POLLS_2027)
    for (const [k, v] of Object.entries(p.scores) as Array<[Candidate2027, number]>) {
      cands.set(k, [...(cands.get(k) ?? []), v]);
    }
  const rows = [...cands.entries()]
    .map(([key, vals]) => ({
      key,
      vals,
      min: Math.min(...vals),
      max: Math.max(...vals),
      avg: Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10,
    }))
    .sort((a, b) => b.avg - a.avg);
  const pctX = (v: number) => `${(Math.min(v, AXIS_MAX) / AXIS_MAX) * 100}%`;
  const asOf = new Date(POLLS_2027_AS_OF + "T12:00:00Z").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            Intentions de vote au 1ᵉʳ tour · {POLLS_2027.length} dernières enquêtes
          </p>
          <p className="text-[11px] text-[var(--text-tertiary)]">Mis à jour le {asOf}</p>
        </div>
        <ol className="space-y-2.5">
          {rows.map((r) => {
            const color = BLOC_COLORS[BLOC_2027[r.key]];
            return (
              <li key={r.key} className="grid grid-cols-[7.5rem_1fr_3rem] items-center gap-3 sm:grid-cols-[9rem_1fr_3.5rem]">
                <span className="truncate text-sm font-medium text-[var(--text-primary)]">
                  {CANDIDATE_2027_NAME[r.key]}
                  <span className="ml-1 hidden text-[11px] font-normal text-[var(--text-tertiary)] sm:inline">
                    {BLOC_LABEL.fr[BLOC_2027[r.key]].toLowerCase()}
                  </span>
                </span>
                <span
                  className="relative h-5"
                  title={`${CANDIDATE_2027_NAME[r.key]} : de ${fmt(r.min)} à ${fmt(r.max)} % selon les instituts, moyenne ${fmt(r.avg)} % (${r.vals.length} enquête${r.vals.length > 1 ? "s" : ""})`}
                >
                  <span className="absolute inset-y-[9px] left-0 right-0 rounded-full bg-[var(--bg-elevated)]" aria-hidden />
                  <span
                    className="absolute inset-y-[6px] rounded-full opacity-35"
                    style={{ left: pctX(r.min), width: `calc(${pctX(r.max)} - ${pctX(r.min)} + 4px)`, backgroundColor: color }}
                    aria-hidden
                  />
                  <span
                    className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[var(--bg-surface)]"
                    style={{ left: pctX(r.avg), backgroundColor: color }}
                    aria-hidden
                  />
                </span>
                <span className="text-right text-sm font-bold tabular-nums text-[var(--text-primary)]">{fmt(r.avg)} %</span>
              </li>
            );
          })}
        </ol>
        <div className="mt-2 grid grid-cols-[7.5rem_1fr_3rem] gap-3 text-[10px] text-[var(--text-tertiary)] sm:grid-cols-[9rem_1fr_3.5rem]" aria-hidden>
          <span />
          <span className="flex justify-between tabular-nums">
            <span>0 %</span>
            <span>10</span>
            <span>20</span>
            <span>30</span>
            <span>40 %</span>
          </span>
          <span />
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-[var(--text-tertiary)]">
          Point : moyenne des enquêtes qui testent le candidat. Bande : écart entre l&apos;institut le plus bas et le plus haut.
          Un candidat absent d&apos;une enquête (hypothèse non testée) n&apos;est pas compté à zéro. Scores tels que publiés,
          hypothèse avec la candidate RN testée par tous les instituts.
        </p>
      </div>

      {showTable && (
        <details className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--text-primary)]">
            Voir le détail des {POLLS_2027.length} enquêtes
          </summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-xs tabular-nums">
              <thead>
                <tr className="text-left text-[var(--text-tertiary)]">
                  <th className="py-1.5 pr-2 font-semibold">Institut</th>
                  <th className="py-1.5 pr-2 font-semibold">Terrain</th>
                  <th className="py-1.5 pr-2 font-semibold">Échantillon</th>
                  {rows.map((r) => (
                    <th key={r.key} className="py-1.5 px-1 text-right font-semibold">
                      {CANDIDATE_2027_NAME[r.key]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {POLLS_2027.map((p, i) => (
                  <tr key={i} className="border-t border-[var(--border)] text-[var(--text-secondary)]">
                    <td className="py-1.5 pr-2 font-medium text-[var(--text-primary)]">{p.institute}</td>
                    <td className="py-1.5 pr-2 whitespace-nowrap">{p.fieldwork}</td>
                    <td className="py-1.5 pr-2">{p.sample.toLocaleString("fr-FR")}</td>
                    {rows.map((r) => (
                      <td key={r.key} className="py-1.5 px-1 text-right">
                        {p.scores[r.key] !== undefined ? fmt(p.scores[r.key]!) : "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-[var(--text-tertiary)]">
            « — » : candidat non testé dans cette enquête. Source de la liste : notices des instituts, recensées par la page
            Wikipédia « Liste de sondages sur l&apos;élection présidentielle française de 2027 ».
          </p>
        </details>
      )}
    </div>
  );
}
