"use client";
import Link from "next/link";
import { useState } from "react";
import { Search, Sparkles, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

const TRENDING = ["Annecy", "Nantes", "Rennes", "Bordeaux", "Montpellier"];

export function HeroSection() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    const slug = query
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/\s+/g, "-");
    router.push(`/villes/${slug}`);
  }

  return (
    <section className="relative overflow-hidden bg-[var(--bg-canvas)] pt-20 pb-24">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-[var(--accent)]/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full bg-[var(--accent-warm)]/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
        {/* Social proof pill */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-4 py-2 text-sm text-[var(--accent)]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Matching IA · Avis vérifiés · Données locales</span>
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

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-6 mx-auto max-w-xl">
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-2 shadow-xl shadow-black/20 focus-within:border-[var(--accent)]/50 transition-colors">
            <Search className="ml-2 h-5 w-5 flex-shrink-0 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une ville..."
              className="flex-1 bg-transparent py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none"
            />
            <Button type="submit" size="sm">
              Explorer
            </Button>
          </div>
        </form>

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

        {/* Quiz CTA */}
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
