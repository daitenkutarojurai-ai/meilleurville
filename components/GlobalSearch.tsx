"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

type Hit = {
  type: "ville" | "guide" | "tag" | "glossaire";
  label: string;
  href: string;
  detail?: string;
};

interface Props {
  cities: { slug: string; name: string; region: string; score: number }[];
  guides: { slug: string; title: string; intro: string; category: string; tags: string[] }[];
  tags: { slug: string; label: string; count: number }[];
  glossary: { term: string; def: string; href: string }[];
}

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

const TYPE_META: Record<Hit["type"], { label: string; emoji: string; color: string }> = {
  ville: { label: "Ville", emoji: "🏙️", color: "text-blue-400" },
  guide: { label: "Guide", emoji: "📖", color: "text-violet-400" },
  tag: { label: "Tag", emoji: "🏷️", color: "text-emerald-400" },
  glossaire: { label: "Glossaire", emoji: "📑", color: "text-orange-400" },
};

export function GlobalSearch({ cities, guides, tags, glossary }: Props) {
  const [q, setQ] = useState("");
  const query = normalize(q.trim());

  // Hydrate from ?q= so links like /recherche?q=lyon and the Google sitelinks
  // SearchAction land users on a pre-filled result list.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q");
    if (initial) setQ(initial);
  }, []);

  const allHits: Hit[] = useMemo(() => {
    return [
      ...cities.map<Hit>((c) => ({
        type: "ville",
        label: c.name,
        href: `/villes/${c.slug}`,
        detail: `${c.region} · ${c.score.toFixed(1)}/10`,
      })),
      ...guides.map<Hit>((g) => ({
        type: "guide",
        label: g.title,
        href: `/guides/${g.slug}`,
        detail: g.intro.slice(0, 110) + (g.intro.length > 110 ? "…" : ""),
      })),
      ...tags.map<Hit>((t) => ({
        type: "tag",
        label: t.label,
        href: `/tags/${t.slug}`,
        detail: `${t.count} guides`,
      })),
      ...glossary.map<Hit>((g) => ({
        type: "glossaire",
        label: g.term,
        href: g.href,
        detail: g.def.slice(0, 110) + (g.def.length > 110 ? "…" : ""),
      })),
    ];
  }, [cities, guides, tags, glossary]);

  const index = useMemo(
    () =>
      allHits.map((h) => ({
        hit: h,
        hay: normalize([h.label, h.detail ?? ""].join(" ")),
      })),
    [allHits]
  );

  const results = query
    ? index.filter((x) => x.hay.includes(query)).slice(0, 50).map((x) => x.hit)
    : [];

  const byType = results.reduce<Record<Hit["type"], Hit[]>>(
    (acc, h) => {
      acc[h.type].push(h);
      return acc;
    },
    { ville: [], guide: [], tag: [], glossaire: [] }
  );

  return (
    <div>
      <div className="relative mb-8">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] pointer-events-none"
          aria-hidden
        />
        <input
          type="search"
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ville, guide, thème, terme..."
          aria-label="Recherche globale"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] pl-11 pr-10 py-3.5 text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            aria-label="Effacer"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {!query && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]/50 p-6 text-sm text-[var(--text-secondary)]">
          <p className="font-semibold text-[var(--text-primary)] mb-2">
            Cherchez dans toute la base
          </p>
          <p>
            {cities.length} villes · {guides.length} guides · {tags.length} tags ·{" "}
            {glossary.length} termes glossaire — interrogés en un seul endroit.
          </p>
        </div>
      )}

      {query && results.length === 0 && (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)]/30 p-8 text-center">
          <div className="text-4xl mb-2" aria-hidden>📭</div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Aucun résultat pour « {q} ».
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Essayez avec un autre mot, sans accent, ou en réduisant à un seul terme.
          </p>
        </div>
      )}

      {query && results.length > 0 && (
        <div className="space-y-8">
          {(Object.keys(byType) as Hit["type"][]).map((t) => {
            const hits = byType[t];
            if (hits.length === 0) return null;
            const meta = TYPE_META[t];
            return (
              <section key={t}>
                <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-3 flex items-center gap-2">
                  <span>{meta.emoji}</span>
                  <span className={meta.color}>{meta.label}s</span>
                  <span className="text-[var(--text-tertiary)]">({hits.length})</span>
                </p>
                <div className="space-y-2">
                  {hits.slice(0, 10).map((h) => (
                    <Link
                      key={`${h.type}-${h.href}`}
                      href={h.href}
                      className="block rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)] transition-colors p-3 group"
                    >
                      <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                        {h.label}
                      </p>
                      {h.detail && (
                        <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">
                          {h.detail}
                        </p>
                      )}
                    </Link>
                  ))}
                  {hits.length > 10 && (
                    <p className="text-xs text-[var(--text-tertiary)] pt-1">
                      +{hits.length - 10} autres résultats {meta.label.toLowerCase()}s
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
