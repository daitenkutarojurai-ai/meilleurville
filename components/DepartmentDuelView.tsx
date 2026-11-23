// Pages paires « département A ou département B » (FR /comparer-departements/[pair],
// EN /compare-departments/[pair]) — identité « Couleurs » (2026-10-22).
// Composant serveur, zéro JS. Les pages gardent leur copie, leurs métadonnées
// et leur JSON-LD ; seul l'habillage vit ici :
//   hero en aurore + tableau d'affichage des deux scores globaux,
//   duel critère par critère en bande blanche (en-tête dégradé, notes en
//   pastille de palier pastel + encre foncée pour tenir le contraste AA),
//   meilleures villes en bande indigo (cartes à bandeau dégradé),
//   « Aller plus loin » en bande vive (seul appel à l'action de la page).

import type { ReactNode } from "react";
import Link from "@/components/AppLink";
import { EmojiBadge } from "@/components/EmojiBadge";
import { scoreBg, scoreColor } from "@/lib/utils";

export type DuelRow = { key: string; label: string; va: number; vb: number };
export type DuelSide = {
  dept: string;
  title: string;
  top: Array<{ slug: string; name: string; score: number; href: string }>;
  allHref: string;
  allLabel: string;
};

function ScoreChip({ value, win, big = false }: { value: number; win?: boolean; big?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-bold tabular-nums ${scoreBg(value)} ${scoreColor(value)} ${
        big ? "px-4 py-1.5 text-2xl" : "px-2.5 py-0.5 text-sm"
      }`}
    >
      {value.toFixed(1)}
      {win ? <span aria-hidden="true">✓</span> : null}
    </span>
  );
}

export function DepartmentDuelView({
  a,
  b,
  rows,
  sides,
  eyebrow,
  titleLead,
  titleAccent,
  intro,
  criterionLabel,
  tableNote,
  furtherTitle,
  furtherBody,
}: {
  a: string;
  b: string;
  rows: DuelRow[];
  sides: [DuelSide, DuelSide];
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  intro: ReactNode;
  criterionLabel: string;
  tableNote?: ReactNode;
  furtherTitle: string;
  furtherBody: ReactNode;
}) {
  const global = rows.find((r) => r.key === "global");
  return (
    <>
      <section className="relative overflow-hidden bg-aurora pt-24 pb-12">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <EmojiBadge
              emoji="⚖️"
              tone="indigo"
              size="lg"
              className="shadow-[0_12px_28px_-12px_rgba(79,70,229,0.5)]"
            />
            <div className="min-w-0">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-[#4338CA]">
                {eyebrow}
              </p>
              <h1 className="text-3xl font-bold leading-tight text-[var(--text-primary)] sm:text-4xl">
                {titleLead}{" "}
                <span className="font-display gradient-text italic pr-1">{titleAccent}</span>
              </h1>
            </div>
          </div>
          <div className="mt-5 max-w-3xl leading-relaxed text-[var(--text-secondary)]">{intro}</div>

          {global ? (
            <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-stretch gap-2 sm:gap-4">
              {[
                { name: a, v: global.va, win: global.va > global.vb + 0.05, ring: "ring-[#C7D2FE]" },
                null,
                { name: b, v: global.vb, win: global.vb > global.va + 0.05, ring: "ring-[#FBCFE8]" },
              ].map((s, i) =>
                s ? (
                  <div
                    key={s.name}
                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl bg-white px-3 py-4 text-center shadow-[0_12px_30px_-18px_rgba(79,70,229,0.55)] ring-1 ${s.ring}`}
                  >
                    <span className="text-sm font-bold leading-tight text-[var(--text-primary)] sm:text-base">
                      {s.name}
                    </span>
                    <ScoreChip value={s.v} win={s.win} big />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                      {global.label}
                    </span>
                  </div>
                ) : (
                  <span
                    key={`vs-${i}`}
                    className="self-center text-sm font-black uppercase tracking-widest text-[#DB2777]"
                  >
                    vs
                  </span>
                ),
              )}
            </div>
          ) : null}
        </div>
      </section>

      <section className="band band-white py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_14px_34px_-22px_rgba(79,70,229,0.55)] ring-1 ring-[#C7D2FE]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="grad-head-0">
                  <tr className="text-left text-xs uppercase tracking-wider">
                    <th scope="col" className="px-4 py-3">{criterionLabel}</th>
                    <th scope="col" className="px-3 py-3 text-right">{a}</th>
                    <th scope="col" className="px-4 py-3 text-right">{b}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr
                      key={r.key}
                      className={`border-t border-[#E0E7FF] ${i % 2 === 1 ? "bg-[#F8F9FF]" : ""} ${
                        r.key === "global" ? "bg-[#EEF2FF]" : ""
                      }`}
                    >
                      <th
                        scope="row"
                        className={`px-4 py-2.5 text-left font-semibold ${
                          r.key === "global" ? "text-[#3730A3]" : "text-[var(--text-secondary)]"
                        }`}
                      >
                        {r.label}
                      </th>
                      <td className="px-3 py-2.5 text-right">
                        <ScoreChip value={r.va} win={r.va > r.vb + 0.05} />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <ScoreChip value={r.vb} win={r.vb > r.va + 0.05} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {tableNote ? (
              <p className="border-t border-[#E0E7FF] bg-[#F5F7FF] px-4 py-3 text-xs text-[var(--text-tertiary)]">
                {tableNote}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="band band-indigo py-10">
        <div className="mx-auto grid max-w-4xl gap-6 px-4 sm:grid-cols-2 sm:px-6">
          {sides.map((s, si) => (
            <div
              key={s.dept}
              className={`overflow-hidden rounded-2xl bg-white shadow-[0_14px_34px_-22px_rgba(79,70,229,0.55)] ring-1 ${
                si === 0 ? "ring-[#FBCFE8]" : "ring-[#A5F3FC]"
              }`}
            >
              <div className={`${si === 0 ? "grad-head-1" : "grad-head-2"} px-5 py-3`}>
                <h2 className="text-lg font-bold leading-snug">{s.title}</h2>
              </div>
              <div className="p-5">
                <ol className="space-y-2">
                  {s.top.map((c, i) => (
                    <li key={c.slug} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            si === 0 ? "bg-[#FDF2F8] text-[#9D174D]" : "bg-[#ECFEFF] text-[#155E75]"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <Link
                          href={c.href}
                          className="truncate font-semibold text-[#4338CA] hover:underline"
                        >
                          {c.name}
                        </Link>
                      </span>
                      <ScoreChip value={c.score} />
                    </li>
                  ))}
                </ol>
                <Link
                  href={s.allHref}
                  className={`mt-4 inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ring-1 transition-colors ${
                    si === 0
                      ? "bg-[#FDF2F8] text-[#9D174D] ring-[#FBCFE8] hover:bg-[#FCE7F3]"
                      : "bg-[#ECFEFF] text-[#155E75] ring-[#A5F3FC] hover:bg-[#CFFAFE]"
                  }`}
                >
                  {s.allLabel}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="band band-bold py-10">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:px-6">
          <EmojiBadge emoji="🧭" tone="pink" />
          <div className="min-w-0">
            <h2 className="mb-1 text-xl font-bold text-white">{furtherTitle}</h2>
            <p className="text-sm leading-relaxed text-white/90 [&_a]:font-semibold [&_a]:text-white [&_a]:underline [&_a]:underline-offset-2">
              {furtherBody}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
