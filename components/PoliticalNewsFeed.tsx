// Fil d'actualité politique (`data/political-news.ts`). Composant serveur,
// zéro JS : chaque entrée a une ancre `#<id>` stable et un lien vers sa source.
// Avec `citySlug`, les actualités de la ville passent en tête, suivies du
// national.

import { ExternalLink, Newspaper } from "lucide-react";
import {
  POLITICAL_NEWS,
  POLITICAL_NEWS_AS_OF,
  POLITICAL_NEWS_KIND_LABEL,
  type PoliticalNews,
} from "@/data/political-news";
import { ReportCTA } from "@/components/ReportCTA";

function dateLabel(iso: string): string {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function politicalNewsFor(citySlug?: string): PoliticalNews[] {
  const byDate = [...POLITICAL_NEWS].sort((a, b) => b.date.localeCompare(a.date));
  if (!citySlug) return byDate;
  const local = byDate.filter((n) => n.cities?.includes(citySlug));
  const national = byDate.filter((n) => !n.cities?.length);
  return [...local, ...national];
}

export function PoliticalNewsFeed({
  limit = 6,
  citySlug,
  cityName,
  title = "L'actualité politique",
  showCta = true,
}: {
  limit?: number;
  citySlug?: string;
  cityName?: string;
  title?: string;
  showCta?: boolean;
}) {
  const items = politicalNewsFor(citySlug).slice(0, limit);
  if (!items.length) return null;
  return (
    <section aria-labelledby="actu-politique">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="actu-politique" className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
          <Newspaper className="h-5 w-5 text-[var(--accent)]" aria-hidden />
          {title}
        </h2>
        <p className="text-[11px] text-[var(--text-tertiary)]">Fil mis à jour le {dateLabel(POLITICAL_NEWS_AS_OF)}</p>
      </div>
      <ol className="relative space-y-3 border-l-2 border-[var(--border)] pl-5">
        {items.map((n) => {
          const local = citySlug && n.cities?.includes(citySlug);
          return (
            <li key={n.id} id={n.id} className="relative scroll-mt-24">
              <span
                className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-[var(--bg-canvas)] bg-[var(--accent)]"
                aria-hidden
              />
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px]">
                  <time dateTime={n.date} className="font-semibold text-[var(--accent)]">
                    {dateLabel(n.date)}
                  </time>
                  <span className="rounded-full border border-[var(--border)] px-2 py-0.5 font-medium text-[var(--text-secondary)]">
                    {POLITICAL_NEWS_KIND_LABEL[n.kind]}
                  </span>
                  {local && cityName && <span className="plaque plaque-small">{cityName}</span>}
                </div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">{n.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">{n.summary}</p>
                <a
                  href={n.sourceUrl}
                  target="_blank"
                  rel="noopener"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:underline"
                >
                  Source : {n.source}
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              </div>
            </li>
          );
        })}
      </ol>
      {showCta && (
        <ReportCTA
          className="mt-4"
          kinds={["politique"]}
          cityName={cityName}
          title={cityName ? `Une actualité politique à ${cityName} ?` : "Une actualité politique dans votre ville ?"}
          text="Candidature, décision du conseil municipal, réunion publique : envoyez-nous le lien de la source, on vérifie et on l'ajoute au fil."
        />
      )}
    </section>
  );
}
