// Bloc d'ouverture des pages /orientation-politique et /political-leaning :
// la projection 2027 ville par ville passe AVANT le rappel 2022 — c'est ce que
// les lecteurs viennent chercher. Composant serveur, zéro JS (liste complète
// dans un <details>).

import Link from "@/components/AppLink";
import { BLOC_ORDER, BLOC_COLORS, BLOC_LABEL, type Bloc } from "@/lib/political-lean-meta";
import {
  POLL_AVERAGE_BLOCS,
  pollAverageCandidates,
  project2027,
  BLOC_FIGURES,
  type Projection2027,
} from "@/lib/presidential-2027";
import { CANDIDATE_2027_NAME, BLOC_2027, POLLS_2027 } from "@/data/presidential-2027-polls";

export interface HubCityRow {
  slug: string;
  name: string;
  blocs2022: Record<Bloc, number>;
}

function Bar({ blocs, tall }: { blocs: Record<Bloc, number>; tall?: boolean }) {
  return (
    <div className={`flex w-full overflow-hidden rounded-full ${tall ? "h-4" : "h-2"}`} aria-hidden>
      {BLOC_ORDER.filter((b) => blocs[b] > 0).map((b) => (
        <span key={b} style={{ width: `${blocs[b]}%`, backgroundColor: BLOC_COLORS[b] }} />
      ))}
    </div>
  );
}

export function Projection2027Hub({ rows, locale }: { rows: HubCityRow[]; locale: "fr" | "en" }) {
  const t = (fr: string, en: string) => (locale === "fr" ? fr : en);
  const L = BLOC_LABEL[locale];
  const cityHref = (slug: string) => (locale === "fr" ? `/villes/${slug}` : `/cities/${slug}`);

  const projected: Array<HubCityRow & { p: Projection2027 }> = rows
    .map((r) => ({ ...r, p: project2027(r.blocs2022) }))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  const leadCount = new Map<Bloc, number>();
  for (const r of projected) leadCount.set(r.p.lead, (leadCount.get(r.p.lead) ?? 0) + 1);
  const closest = [...projected].sort((a, b) => a.p.margin - b.p.margin).slice(0, 12);
  const strongest = (b: Bloc) =>
    [...projected].sort((x, y) => y.p.blocs[b] - x.p.blocs[b]).slice(0, 5);
  const cands = pollAverageCandidates().slice(0, 8);

  return (
    <section aria-labelledby="projection-2027" className="rounded-3xl border border-[var(--accent)]/25 bg-[var(--bg-surface)] p-4 sm:p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
        {t("Présidentielle 2027", "2027 presidential election")}
      </p>
      <h2 id="projection-2027" className="mt-1 text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
        {t("Qui arriverait en tête dans votre ville ?", "Who would come first in your city?")}
      </h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        {t(
          `Projection du 1ᵉʳ tour pour ${projected.length} villes : le vote 2022 de chaque commune, déplacé comme les sondages nationaux depuis 2022.`,
          `First-round projection for ${projected.length} cities: each town's 2022 vote, shifted the way national polls have moved since 2022.`,
        )}
      </p>

      {/* Compteurs par famille en tête */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {BLOC_ORDER.map((b) => (
          <div key={b} className="rounded-xl border border-[var(--border)] p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: BLOC_COLORS[b] }} />
              {L[b]}
            </div>
            <div className="mt-1 text-2xl font-bold tabular-nums" style={{ color: BLOC_COLORS[b] }}>
              {leadCount.get(b) ?? 0}
            </div>
            <div className="text-[11px] text-[var(--text-tertiary)]">
              {t("villes en tête", "cities ahead")} · {BLOC_FIGURES[b]}
            </div>
          </div>
        ))}
      </div>

      {/* Moyenne nationale */}
      <div className="mt-5">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          {t(`Moyenne nationale de ${POLLS_2027.length} sondages`, `National average of ${POLLS_2027.length} polls`)}
        </p>
        <Bar blocs={POLL_AVERAGE_BLOCS} tall />
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--text-secondary)]">
          {cands.map(({ key, pct }) => (
            <span key={key} className="whitespace-nowrap">
              <span className="font-semibold" style={{ color: BLOC_COLORS[BLOC_2027[key]] }}>
                {CANDIDATE_2027_NAME[key]}
              </span>{" "}
              <span className="tabular-nums">{pct.toLocaleString(locale === "fr" ? "fr-FR" : "en-GB")}%</span>
            </span>
          ))}
        </div>
      </div>

      {/* Les matchs les plus serrés */}
      <div className="mt-6">
        <h3 className="text-base font-bold text-[var(--text-primary)]">
          {t("Les villes les plus serrées", "The closest cities")}
        </h3>
        <ol className="mt-2 grid gap-2 sm:grid-cols-2">
          {closest.map((r) => (
            <li key={r.slug}>
              <Link
                href={cityHref(r.slug)}
                className="block rounded-xl border border-[var(--border)] px-3 py-2.5 transition-colors hover:border-[var(--accent)]/50"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-[var(--text-primary)]">{r.name}</span>
                  <span className="shrink-0 text-xs tabular-nums text-[var(--text-tertiary)]">
                    {t("écart", "gap")} {r.p.margin} pts
                  </span>
                </div>
                <div className="mt-1.5"><Bar blocs={r.p.blocs} /></div>
                <div className="mt-1 text-[11px] text-[var(--text-secondary)]">
                  <span style={{ color: BLOC_COLORS[r.p.lead] }} className="font-semibold">{L[r.p.lead]}</span>{" "}
                  {r.p.blocs[r.p.lead]}% ·{" "}
                  <span style={{ color: BLOC_COLORS[r.p.second] }} className="font-semibold">{L[r.p.second]}</span>{" "}
                  {r.p.blocs[r.p.second]}%
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>

      {/* Bastions projetés */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {BLOC_ORDER.map((b) => (
          <div key={b} className="rounded-xl border border-[var(--border)] p-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: BLOC_COLORS[b] }} />
              {t(`Plus forts scores projetés — ${L[b].toLowerCase()}`, `Highest projected — ${L[b].toLowerCase()}`)}
            </p>
            <ol className="mt-1.5 space-y-1">
              {strongest(b).map((r) => (
                <li key={r.slug} className="flex items-baseline justify-between gap-2 text-sm">
                  <Link href={cityHref(r.slug)} className="truncate text-[var(--text-secondary)] hover:text-[var(--accent)] hover:underline">
                    {r.name}
                  </Link>
                  <span className="shrink-0 tabular-nums font-semibold" style={{ color: BLOC_COLORS[b] }}>{r.p.blocs[b]}%</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      {/* Toutes les villes, sans JS */}
      <details className="mt-6 rounded-xl border border-[var(--border)]">
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-[var(--accent)]">
          {t(`Voir la projection des ${projected.length} villes (A → Z)`, `See the projection for all ${projected.length} cities (A → Z)`)}
        </summary>
        <ul className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
          {projected.map((r) => (
            <li key={r.slug} className="flex items-center gap-3 px-4 py-2">
              <Link href={cityHref(r.slug)} className="w-32 shrink-0 truncate text-sm text-[var(--text-primary)] hover:text-[var(--accent)] hover:underline sm:w-48">
                {r.name}
              </Link>
              <div className="min-w-0 flex-1"><Bar blocs={r.p.blocs} /></div>
              <span className="w-24 shrink-0 text-right text-xs sm:w-32">
                <span className="font-semibold" style={{ color: BLOC_COLORS[r.p.lead] }}>{L[r.p.lead]}</span>{" "}
                <span className="tabular-nums text-[var(--text-tertiary)]">{r.p.blocs[r.p.lead]}%</span>
              </span>
            </li>
          ))}
        </ul>
      </details>

      <details className="mt-3 text-xs text-[var(--text-tertiary)]">
        <summary className="cursor-pointer font-semibold text-[var(--text-secondary)]">
          {t("Méthode et sondages utilisés", "Method and polls used")}
        </summary>
        <p className="mt-2 leading-relaxed">
          {t(
            "Pour chaque famille politique, on divise la moyenne des sondages 2027 par son score national de 2022 (Conseil constitutionnel), puis on applique ce rapport au résultat 2022 de chaque commune (Ministère de l'Intérieur) et on ramène le total à 100 %. L'hypothèse — chaque ville bouge comme le pays — est forte : c'est une projection mécanique, pas un sondage local, et les candidatures ne sont pas encore officielles.",
            "For each political family, the 2027 poll average is divided by its 2022 national score (Constitutional Council); that ratio is applied to each town's 2022 result (Ministry of the Interior) and the total is scaled back to 100%. The assumption — every city moves like the country — is a strong one: this is a mechanical projection, not a local poll, and candidacies are not official yet.",
          )}
        </p>
        <ul className="mt-2 space-y-0.5">
          {POLLS_2027.map((p, i) => (
            <li key={i}>
              {p.institute} · {p.fieldwork} · {p.sample.toLocaleString(locale === "fr" ? "fr-FR" : "en-GB")} {t("personnes", "respondents")}
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
