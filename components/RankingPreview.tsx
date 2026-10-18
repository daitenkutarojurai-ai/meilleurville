import Link from "@/components/AppLink";
import { ArrowRight, Laptop, Home, TreePine, GraduationCap, Palmtree } from "lucide-react";
import { getRankedCities, RANKING_META, type RankingSlug } from "@/lib/rankings";
import { scoreColor, scoreHex } from "@/lib/utils";

// Five lifestyle rankings previewed on the home. No per-category colour:
// blue/green/violet/amber tiles read as score tiers (CLAUDE.md « Carte &
// plaque »), so each card is one survey-map sheet with an enamel-plaque icon.
const RANKINGS: {
  slug: RankingSlug;
  label: string;
  labelEn: string;
  icon: typeof Laptop;
  description: string;
  descriptionEn: string;
}[] = [
  {
    slug: "teletravail",
    label: "Télétravail",
    labelEn: "Remote work",
    icon: Laptop,
    description: "Fibre, coworking, café culture",
    descriptionEn: "Fast fibre, coworking, café culture",
  },
  {
    slug: "famille",
    label: "Famille",
    labelEn: "Family",
    icon: Home,
    description: "Écoles, sécurité, espaces verts",
    descriptionEn: "Schools, safety, green space",
  },
  {
    slug: "nature",
    label: "Nature & Sport",
    labelEn: "Nature & Sport",
    icon: TreePine,
    description: "Randonnée, vélo, grand air",
    descriptionEn: "Hiking, cycling, the outdoors",
  },
  {
    slug: "etudiant",
    label: "Étudiant",
    labelEn: "Students",
    icon: GraduationCap,
    description: "Campus, coût, nightlife",
    descriptionEn: "Campus, cost, nightlife",
  },
  {
    slug: "retraite",
    label: "Retraite",
    labelEn: "Retirement",
    icon: Palmtree,
    description: "Douceur de vivre, santé, calme",
    descriptionEn: "Easy living, healthcare, quiet",
  },
];

// Same sheet numbering as the /classements hub (« Feuille NN / 19 »).
const SHEET_ORDER = Object.keys(RANKING_META) as RankingSlug[];
const pad2 = (n: number) => String(n).padStart(2, "0");

export function RankingPreview({ locale = "fr" }: { locale?: "fr" | "en" } = {}) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const rankingsHref = locale === "en" ? "/rankings" : "/classements";
  return (
    <section id="classements" className="py-8 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 font-mono-data text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
              {L(
                `Classements 2026 · ${SHEET_ORDER.length} feuilles`,
                `2026 Rankings · ${SHEET_ORDER.length} sheets`,
              )}
            </p>
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">
              {L("Classements par style de vie", "Rankings by lifestyle")}
            </h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              {L("Algorithme composite · données 2026", "Composite algorithm · 2026 data")}
            </p>
          </div>
          <Link
            href={rankingsHref}
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline"
          >
            {L("Tous les classements", "All rankings")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {RANKINGS.map((r) => {
            const Icon = r.icon;
            // Real #1 city + score, derived from the live ranking engine —
            // no hardcoded preview numbers (those drifted above the 8.6 clamp).
            const top = getRankedCities(r.slug)[0];
            const sheet = SHEET_ORDER.indexOf(r.slug) + 1;
            return (
              <Link
                key={r.slug}
                href={locale === "en" ? `/rankings/${r.slug}` : `/classements/${r.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] transition-colors hover:border-[var(--accent)]"
              >
                <div className="topo-bg flex items-center gap-3 border-b border-[var(--border)] bg-[var(--bg-canvas)] px-4 py-3">
                  <span className="plaque !p-0 h-10 w-10 shrink-0 justify-center" aria-hidden="true">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                    {L("Feuille", "Sheet")} {pad2(sheet)} / {pad2(SHEET_ORDER.length)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-semibold text-[var(--text-primary)]">{L(r.label, r.labelEn)}</h3>
                  <p className="mt-1 flex-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                    {L(r.description, r.descriptionEn)}
                  </p>
                  <div className="mt-4 flex items-end justify-between border-t border-dashed border-[var(--border)] pt-3">
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                        {L("N°1", "#1")}
                      </div>
                      <div className="truncate text-sm font-semibold text-[var(--text-primary)]">
                        {top.city.name}
                      </div>
                    </div>
                    <div className={`text-2xl font-bold font-mono-data ${scoreColor(top.score)}`}>
                      {top.score.toFixed(1)}
                      <span className="sr-only"> {L("sur", "out of")} 10</span>
                    </div>
                  </div>
                </div>
                <div className="h-1.5" style={{ background: scoreHex(top.score) }} aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
