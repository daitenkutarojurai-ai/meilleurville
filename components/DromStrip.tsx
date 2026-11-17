import Link from "@/components/AppLink";
import { scoreHex } from "@/lib/utils";

// Minimal city shape — the parent (FranceHeatmap / CarteClient) passes its
// CityLight rows; importing the seed here would ship it in the client bundle
// since this component renders inside "use client" trees.
export interface DromCity {
  slug: string;
  name: string;
  region: string;
  scores: { global: number };
}

const DROM = [
  { name: "Guadeloupe", emoji: "🌴", region: "Guadeloupe", regionSlug: "guadeloupe" },
  { name: "Martinique", emoji: "🌺", region: "Martinique", regionSlug: "martinique" },
  { name: "Guyane", emoji: "🌿", region: "Guyane", regionSlug: "guyane" },
  { name: "La Réunion", emoji: "🌋", region: "La Réunion", regionSlug: "la-reunion" },
  { name: "Mayotte", emoji: "🐢", region: "Mayotte", regionSlug: "mayotte" },
] as const;

// scoreHex imported from @/lib/utils — single source of truth

export function DromStrip({ locale = "fr", cities }: { locale?: "fr" | "en"; cities: DromCity[] }) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const cityHref = (slug: string) => (locale === "en" ? `/cities/${slug}` : `/villes/${slug}`);
  // Group DROM cities by region from the passed rows
  const byRegion = DROM.map((r) => ({
    ...r,
    cities: cities.filter((c) => c.region === r.region)
      .sort((a, b) => b.scores.global - a.scores.global),
  })).filter((r) => r.cities.length > 0);

  if (byRegion.length === 0) return null;

  // Identité « Couleurs » : chaque territoire porte un bandeau dégradé vif
  // (rotation grad-head-0…4, familles indigo / rose / ciel / cyan / lilas) sur une
  // carte blanche ; les villes deviennent des lignes nom + note, la pastille garde
  // la couleur de palier (seul endroit où vert/ambre/rouge… apparaissent).
  const fmt = (n: number) => (locale === "en" ? n.toFixed(1) : n.toFixed(1).replace(".", ","));
  return (
    <div className="@container relative mt-5">
      <div className="flex items-center justify-between gap-2 mb-2.5 px-1">
        {/* Le bandeau vit sur le fond nuit indigo des deux cartes : libellé et lien en clair. */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 text-[11px] uppercase tracking-widest text-white font-semibold ring-1 ring-white/20">
          <span aria-hidden="true">🏝️</span>
          {L("Outre-mer", "Overseas")}
        </span>
        <Link
          href="/regions"
          className="text-[11px] text-[#C7D2FE] hover:text-white hover:underline font-medium"
        >
          {L("Toutes les régions →", "All regions →")}
        </Link>
      </div>
      <div className="grid grid-cols-2 @md:grid-cols-3 @3xl:grid-cols-5 gap-2.5">
        {byRegion.map((r, i) => (
          <div
            key={r.regionSlug}
            className={`group flex flex-col overflow-hidden rounded-2xl bg-[var(--bg-surface)] shadow-[0_6px_18px_-8px_rgba(15,10,60,0.55)] ring-1 ring-white/40 transition-transform hover:-translate-y-0.5 ${
              i === byRegion.length - 1 && byRegion.length % 2 === 1 ? "col-span-2 @md:col-span-1" : ""
            }`}
          >
            <Link
              href={`/regions/${r.regionSlug}`}
              className={`grad-head-${i % 5} flex items-center gap-1.5 px-2.5 py-2 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white`}
              aria-label={`${L("Région", "Region")} ${r.name}`}
            >
              <span aria-hidden="true" className="shrink-0 text-base leading-none drop-shadow-sm">
                {r.emoji}
              </span>
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-bold text-white group-hover:underline">{r.name}</span>
              <span className="shrink-0 rounded-full bg-[#1E1B4B]/35 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white">
                {r.cities.length}
              </span>
            </Link>
            <ul className="flex flex-1 flex-col gap-0.5 p-2">
              {r.cities.slice(0, 4).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={cityHref(c.slug)}
                    className="flex items-center gap-1.5 rounded-lg px-1.5 py-0.5 text-[11.5px] text-[var(--text-primary)] hover:bg-[#EEF2FF] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)]"
                    title={`${c.name} — ${c.scores.global.toFixed(1)}/10`}
                  >
                    <span className="min-w-0 flex-1 truncate">{c.name.replace(/\s*\(.*\)\s*$/, "")}</span>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#EEF2FF] px-1.5 py-0.5 text-[10.5px] font-bold tabular-nums text-[var(--text-primary)]">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: scoreHex(c.scores.global) }}
                      />
                      {fmt(c.scores.global)}
                    </span>
                  </Link>
                </li>
              ))}
              {r.cities.length > 4 && (
                <li className="mt-auto">
                  <Link
                    href={`/regions/${r.regionSlug}`}
                    className="block rounded-lg px-1.5 py-1 text-[11px] font-semibold text-[var(--accent)] hover:bg-[#EEF2FF] hover:underline"
                  >
                    {L(`+${r.cities.length - 4} autres villes`, `+${r.cities.length - 4} more`)}
                  </Link>
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
