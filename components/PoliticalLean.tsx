import Link from "@/components/AppLink";
import { Vote, ArrowRight } from "lucide-react";
import {
  BLOC_ORDER,
  BLOC_COLORS,
  BLOC_LABEL,
  type Bloc,
  type PoliticalLean as PoliticalLeanData,
} from "@/lib/political-lean-meta";
import { project2027, BLOC_FIGURES } from "@/lib/presidential-2027";
import { POLLS_2027 } from "@/data/presidential-2027-polls";

// Indicative political-lean metric for a city, from the 2022 presidential
// 1st-round commune result. Pure display: the lean is computed by the caller
// (getPoliticalLean drags a 107 KB JSON — keep it server-side). Shows the
// plurality bloc, a left→right stacked bar of the four blocs, a legend, and a
// sourced "indicatif" caption. Renders nothing if the city has no data.
export function PoliticalLean({
  lean,
  cityName,
  locale = "fr",
}: {
  lean: PoliticalLeanData | null;
  cityName: string;
  locale?: "fr" | "en";
}) {
  const p = lean;
  if (!p) return null;

  const L = BLOC_LABEL[locale];
  const t =
    locale === "en"
      ? {
          heading: "Political lean",
          lead: `In the 2022 presidential first round, ${cityName} leaned`,
          caption: "Estimate · Ministry of the Interior, 2022 1st round · electorate, not municipal politics",
        }
      : {
          heading: "Orientation politique",
          lead: `Au 1ᵉʳ tour de la présidentielle 2022, ${cityName} a voté majoritairement`,
          caption:
            "Estimation · Ministère de l'Intérieur, 1ᵉʳ tour 2022 · vote des habitants, pas la mairie",
        };

  const segments = BLOC_ORDER.filter((b) => p.blocs[b] > 0);
  // Présidentielle 2027 d'abord : c'est la question que les lecteurs se posent.
  const proj = project2027(p.blocs);
  const projSegments = BLOC_ORDER.filter((b) => proj.blocs[b] > 0);
  // Article inclus : « sur la gauche », « sur l'extrême droite ».
  const THE: Record<Bloc, string> =
    locale === "en"
      ? { gauche: "the left", centre: "the centre", droite: "the right", extreme_droite: "the far right" }
      : { gauche: "la gauche", centre: "le centre", droite: "la droite", extreme_droite: "l'extrême droite" };
  const p27 =
    locale === "en"
      ? {
          heading: "2027 presidential election: projection",
          lead: `If ${cityName} moved like the national polls since 2022, the first round would put ahead`,
          close: `Close race: ${proj.margin} pts ahead of ${THE[proj.second]}.`,
          clear: `${proj.margin} pts ahead of ${THE[proj.second]}.`,
          caption: `Mechanical projection, not a local poll: 2022 commune result × national swing of the average of ${POLLS_2027.length} polls (Sept.–Oct. 2026).`,
          past: "In 2022",
        }
      : {
          heading: "Présidentielle 2027 : la projection",
          lead: `Si ${cityName} évoluait comme les sondages nationaux depuis 2022, le 1ᵉʳ tour placerait en tête`,
          close: `Match serré : ${proj.margin} pts d'avance sur ${THE[proj.second]}.`,
          clear: `${proj.margin} pts d'avance sur ${THE[proj.second]}.`,
          caption: `Projection mécanique, pas un sondage local : résultat communal 2022 × évolution nationale de la moyenne de ${POLLS_2027.length} sondages (sept.-oct. 2026).`,
          past: "En 2022",
        };

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]/40 p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-3">
        <Vote className="h-4 w-4 text-[var(--text-secondary)]" />
        {t.heading}
      </h3>

      <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1.5">{p27.heading}</p>
      <p className="text-sm text-[var(--text-secondary)] mb-1">
        {p27.lead}{" "}
        <strong className="font-semibold" style={{ color: BLOC_COLORS[proj.lead] }}>
          {THE[proj.lead]}
        </strong>{" "}
        <span className="tabular-nums font-semibold text-[var(--text-primary)]">({proj.blocs[proj.lead]}%)</span>
        <span className="text-[var(--text-tertiary)]"> · {BLOC_FIGURES[proj.lead]}</span>
      </p>
      <p className="text-xs text-[var(--text-tertiary)] mb-2.5">{proj.close ? p27.close : p27.clear}</p>
      <div
        className="flex h-4 w-full overflow-hidden rounded-full"
        role="img"
        aria-label={projSegments.map((b) => `${L[b]} ${proj.blocs[b]}%`).join(", ")}
      >
        {projSegments.map((b) => (
          <span key={b} style={{ width: `${proj.blocs[b]}%`, backgroundColor: BLOC_COLORS[b] }} title={`${L[b]} · ${proj.blocs[b]}%`} />
        ))}
      </div>
      <ul className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {BLOC_ORDER.map((b) => (
          <li key={b} className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: BLOC_COLORS[b] }} />
              {L[b]}
            </span>
            <span className="tabular-nums font-semibold text-[var(--text-primary)]">{proj.blocs[b]}%</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] leading-snug text-[var(--text-tertiary)]">{p27.caption}</p>

      <p className="mt-4 border-t border-[var(--border)] pt-3 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">{p27.past}</p>
      <p className="text-sm text-[var(--text-secondary)] mb-3">
        {t.lead}{" "}
        <strong className="font-semibold" style={{ color: BLOC_COLORS[p.lean] }}>
          {L[p.lean].toLowerCase()}
        </strong>{" "}
        <span className="tabular-nums text-[var(--text-tertiary)]">({p.topPct}%)</span>
      </p>

      {/* Left → right stacked bar of the four blocs. */}
      <div
        className="flex h-3 w-full overflow-hidden rounded-full"
        role="img"
        aria-label={segments
          .map((b) => `${L[b]} ${p.blocs[b]}%`)
          .join(", ")}
      >
        {segments.map((b) => (
          <span
            key={b}
            style={{ width: `${p.blocs[b]}%`, backgroundColor: BLOC_COLORS[b] }}
            title={`${L[b]} · ${p.blocs[b]}%`}
          />
        ))}
      </div>

      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {BLOC_ORDER.map((b) => (
          <li key={b} className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: BLOC_COLORS[b] }}
              />
              {L[b]}
            </span>
            <span className="tabular-nums text-[var(--text-tertiary)]">{p.blocs[b]}%</span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[11px] leading-snug text-[var(--text-tertiary)]">{t.caption}</p>

      <Link
        href={locale === "fr" ? "/orientation-politique" : "/political-leaning"}
        className="group mt-3 inline-flex min-h-6 items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
      >
        {locale === "fr" ? "Projection 2027 de toutes les villes" : "2027 projection for every city"}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </section>
  );
}
