"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Search, Sparkles, ArrowRight, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { CITIES_SEED } from "@/data/cities-seed";
import { WordsReveal, FadeBlurIn } from "@/components/effects/WordsReveal";
import { MagneticButton } from "@/components/effects/MagneticButton";
import { GrainOverlay } from "@/components/effects/GrainOverlay";

const TRENDING = ["Annecy", "Nantes", "Rennes", "Bordeaux", "Montpellier", "Lyon"];

interface SearchResult {
  slug: string;
  name: string;
  region: string;
  score: number;
}

const FLOATING_DOTS = [
  { name: "Annecy",      lng: 6.13, lat: 45.90, score: 9.0 },
  { name: "Bordeaux",    lng: -0.58, lat: 44.84, score: 8.6 },
  { name: "Lyon",        lng: 4.83, lat: 45.76, score: 8.5 },
  { name: "Nantes",      lng: -1.55, lat: 47.22, score: 8.7 },
  { name: "Strasbourg",  lng: 7.75, lat: 48.58, score: 8.2 },
  { name: "Montpellier", lng: 3.88, lat: 43.61, score: 8.4 },
];

export function HeroSection() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const stage = el.querySelector<HTMLElement>("[data-tilt-stage]");
    function onMove(e: PointerEvent) {
      if (!el || !stage) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      stage.style.transform = `perspective(1400px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateZ(0)`;
    }
    function onLeave() {
      if (stage) stage.style.transform = "perspective(1400px) rotateX(0) rotateY(0)";
    }
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  useEffect(() => {
    if (query.length < 1) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const q = normalize(query);
    const results = CITIES_SEED.filter(
      (c) => normalize(c.name).includes(q) || normalize(c.region).includes(q)
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
    <section
      ref={heroRef}
      className="relative overflow-hidden pt-24 pb-32 sm:pt-28"
    >
      {/* Aurora wash above the global ambient — adds extra colour to the hero only */}
      <div className="pointer-events-none absolute inset-0 -z-[1]" aria-hidden>
        <div className="absolute inset-0 bg-aurora opacity-50" />
        <GrainOverlay opacity={0.25} blend="overlay" />
      </div>

      {/* Floating city dots — desktop only, behind the headline */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
        {FLOATING_DOTS.map((d, i) => {
          const x = ((d.lng + 5) / 14) * 100;
          const y = ((52 - d.lat) / 11) * 100;
          return (
            <div
              key={d.name}
              className="absolute animate-drift"
              style={{
                left: `${x}%`,
                top: `${Math.max(8, Math.min(72, y))}%`,
                animationDelay: `${i * 0.4}s`,
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[var(--accent)]/40 blur-md scale-150" />
                <div className="relative flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                  <span className="font-medium text-[var(--text-primary)]">{d.name}</span>
                  <span className="font-mono-data text-[10px] text-[var(--accent)]">
                    {d.score.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        data-tilt-stage
        className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center"
        style={{ transformStyle: "preserve-3d", transition: "transform 0.4s cubic-bezier(0.2,0.7,0.2,1)" }}
      >
        <FadeBlurIn delay={0}>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
            </span>
            <span className="font-medium text-[var(--text-secondary)]">
              {`${CITIES_SEED.length} villes · 8 axes de notation · 12 classements`}
            </span>
          </div>
        </FadeBlurIn>

        <h1 className="mb-6 text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-bold tracking-tight leading-[1.02] text-[var(--text-primary)]">
          <WordsReveal text="Là où vous serez" perWord={0.08} startDelay={0.15} />
          <br />
          <WordsReveal
            text="heureux de vivre."
            accentRange={[0, 2]}
            perWord={0.1}
            startDelay={0.55}
            className="font-display"
          />
        </h1>

        <FadeBlurIn delay={1.05}>
          <p className="mb-10 mx-auto max-w-2xl text-lg sm:text-xl text-[var(--text-secondary)] leading-relaxed">
            Comparez les villes françaises pour de vrai. Avis d&apos;habitants,
            coût de la vie, météo, nature, transports — tout au même endroit, sans
            chichi.
          </p>
        </FadeBlurIn>

        <FadeBlurIn delay={1.2}>
          <div ref={containerRef} className="relative mb-7 mx-auto max-w-xl">
            <form onSubmit={handleSearch}>
              <div className="group flex items-center gap-2 rounded-2xl glass-strong p-2 shadow-2xl shadow-[var(--accent)]/10 ring-1 ring-white/40 transition-all focus-within:shadow-[var(--accent)]/25 focus-within:ring-[var(--accent)]/30">
                <Search className="ml-2 h-5 w-5 flex-shrink-0 text-[var(--text-secondary)] transition-transform group-focus-within:scale-110" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setOpen(true)}
                  placeholder="Quelle ville vous fait rêver ?"
                  className="flex-1 bg-transparent py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none"
                  autoComplete="off"
                />
                <Button type="submit" size="sm">
                  C&apos;est parti
                </Button>
              </div>
            </form>

            {open && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl glass-strong shadow-2xl shadow-[var(--accent)]/15 overflow-hidden border border-white/40">
                {suggestions.map((r) => (
                  <button
                    key={r.slug}
                    onClick={() => pickCity(r.slug)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--accent-soft)]/60 transition-colors text-left group"
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
                  className="flex items-center justify-center gap-1 py-2.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] border-t border-white/40 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Voir toutes les villes →
                </Link>
              </div>
            )}
          </div>
        </FadeBlurIn>

        <FadeBlurIn delay={1.35}>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            <span className="text-xs font-medium text-[var(--text-secondary)]">✨ On en parle :</span>
            {TRENDING.map((city) => (
              <Link
                key={city}
                href={`/villes/${city.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-")}`}
                className="flex items-center gap-1 rounded-full glass px-3 py-1 text-xs text-[var(--text-secondary)] transition-all hover:text-[var(--accent)] hover:shadow-md hover:-translate-y-0.5"
              >
                <MapPin className="h-2.5 w-2.5" />
                {city}
              </Link>
            ))}
          </div>
        </FadeBlurIn>

        <FadeBlurIn delay={1.5}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <MagneticButton strength={0.3}>
              <Link href="/quiz">
                <Button size="lg" className="gap-2 text-base shadow-2xl shadow-[var(--accent)]/30 accent-pulse shine">
                  <Sparkles className="h-5 w-5" />
                  Faire le quiz (3 min)
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.25}>
              <Link href="/classements">
                <Button size="lg" variant="secondary" className="text-base">
                  Voir le top des villes
                </Button>
              </Link>
            </MagneticButton>
          </div>
        </FadeBlurIn>

        <FadeBlurIn delay={1.7}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[var(--text-tertiary)]">
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-[var(--accent-warm)] text-[var(--accent-warm)]" />
              <span>Données ouvertes · 2025</span>
            </span>
            <span className="hidden sm:inline">·</span>
            <span>Sources : Insee, Min. Intérieur, observatoires loyers</span>
            <span className="hidden sm:inline">·</span>
            <span>Indépendant — sans pub</span>
          </div>
        </FadeBlurIn>
      </div>
    </section>
  );
}
