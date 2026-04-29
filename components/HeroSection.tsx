"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Search, Sparkles, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { CITIES_SEED } from "@/data/cities-seed";

const TRENDING = ["Annecy", "Nantes", "Rennes", "Bordeaux", "Montpellier", "Lyon"];

interface SearchResult {
  slug: string;
  name: string;
  region: string;
  score: number;
}

export function HeroSection() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 1) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const q = query.toLowerCase();
    const results = CITIES_SEED.filter(
      (c) => c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q)
    )
      .sort((a, b) => {
        const aStart = a.name.toLowerCase().startsWith(q) ? 0 : 1;
        const bStart = b.name.toLowerCase().startsWith(q) ? 0 : 1;
        return aStart !== bStart ? aStart - bStart : b.scores.global - a.scores.global;
      })
      .slice(0, 6)
      .map((c) => ({ slug: c.slug, name: c.name, region: c.region, score: c.scores.global }));
    setSuggestions(results);
    setOpen(results.length > 0);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (suggestions.length > 0) {
      router.push(`/villes/${suggestions[0].slug}`);
      setOpen(false);
      return;
    }
    if (!query.trim()) return;
    const slug = query
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/\s+/g, "-");
    router.push(`/villes/${slug}`);
  }

  function pickCity(slug: string) {
    setOpen(false);
    setQuery("");
    router.push(`/villes/${slug}`);
  }

  return (
    <section className="relative overflow-hidden bg-[var(--bg-canvas)] pt-20 pb-24">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-[var(--accent)]/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full bg-[var(--accent-warm)]/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
        {/* Social proof pill */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-4 py-2 text-sm text-[var(--accent)]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{CITIES_SEED.length}+ villes · Matching IA · Avis vérifiés · Données locales</span>
        </div>

        {/* Headline */}
        <h1 className="mb-5 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
          Trouvez la ville{" "}
          <span className="gradient-text">qui vous ressemble.</span>
        </h1>

        <p className="mb-10 mx-auto max-w-2xl text-lg sm:text-xl text-[var(--text-secondary)] leading-relaxed">
          Classements intelligents, avis d'habitants authentiques et quiz IA pour
          prendre la meilleure décision de votre vie.
        </p>

        {/* Search bar with autocomplete */}
        <div ref={containerRef} className="relative mb-6 mx-auto max-w-xl">
          <form onSubmit={handleSearch}>
            <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-2 shadow-xl shadow-black/20 focus-within:border-[var(--accent)]/50 transition-colors">
              <Search className="ml-2 h-5 w-5 flex-shrink-0 text-[var(--text-secondary)]" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => suggestions.length > 0 && setOpen(true)}
                placeholder="Rechercher une ville..."
                className="flex-1 bg-transparent py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none"
                autoComplete="off"
              />
              <Button type="submit" size="sm">
                Explorer
              </Button>
            </div>
          </form>

          {/* Dropdown */}
          {open && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-xl shadow-black/20 overflow-hidden">
              {suggestions.map((r) => (
                <button
                  key={r.slug}
                  onClick={() => pickCity(r.slug)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-3.5 w-3.5 text-[var(--text-tertiary)] flex-shrink-0" />
                    <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {r.name}
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)]">{r.region}</span>
                  </div>
                  <span className="text-xs font-bold font-mono-data text-[var(--accent)]">{r.score.toFixed(1)}</span>
                </button>
              ))}
              <Link
                href="/villes"
                className="flex items-center justify-center gap-1 py-2.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] border-t border-[var(--border)] transition-colors"
                onClick={() => setOpen(false)}
              >
                Voir toutes les villes →
              </Link>
            </div>
          )}
        </div>

        {/* Trending */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <span className="text-xs text-[var(--text-secondary)]">Tendance :</span>
          {TRENDING.map((city) => (
            <Link
              key={city}
              href={`/villes/${city.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-")}`}
              className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)]"
            >
              <MapPin className="h-2.5 w-2.5" />
              {city}
            </Link>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/quiz">
            <Button size="lg" className="gap-2 text-base shadow-2xl shadow-[var(--accent)]/20 accent-pulse">
              <Sparkles className="h-5 w-5" />
              Lancer le Quiz IA
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/classements">
            <Button size="lg" variant="secondary" className="text-base">
              Voir les classements 2025
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
