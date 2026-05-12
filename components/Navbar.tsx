"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, MapPin, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { FavoriteCount } from "@/components/effects/FavoriteButton";

const NAV_LINKS = [
  { label: "Classements", href: "/classements" },
  { label: "Comparer", href: "/comparer" },
  { label: "Explorer", href: "/villes" },
  { label: "Carte", href: "/carte" },
  { label: "Guides", href: "/guides" },
  { label: "Red Flags", href: "/red-flags" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-[var(--border)]/60 bg-[var(--bg-canvas)]/75 backdrop-blur-2xl shadow-[0_8px_32px_-12px_rgba(31,58,42,0.10)]"
          : "border-b border-transparent bg-[var(--bg-canvas)]/40 backdrop-blur-md"
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 transition-[height] duration-300",
          scrolled ? "h-14" : "h-16"
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/30 group-hover:shadow-[var(--accent)]/50 transition-shadow">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
            Meilleur<span className="text-[var(--accent)]">Ville</span>
          </span>
        </Link>

        {/* Desktop nav — visible from lg (1024px) to avoid overflow at md */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA — visible from md so favoris/quiz are always reachable on tablet */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/favoris"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-pink)] hover:bg-[var(--bg-elevated)] transition-colors"
            aria-label="Mes favoris"
          >
            <Heart className="h-4 w-4" />
            <FavoriteCount />
          </Link>
          <Link href="/quiz">
            <Button size="md" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Quiz IA
            </Button>
          </Link>
        </div>

        {/* Hamburger — visible below lg (tablet + mobile) */}
        <button
          className="lg:hidden rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile/tablet backdrop */}
      {open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Fermer le menu"
          tabIndex={-1}
          className="lg:hidden fixed inset-x-0 top-14 bottom-0 -z-10 bg-black/30 backdrop-blur-[2px]"
        />
      )}

      {/* Mobile/tablet menu */}
      <div
        id="mobile-menu"
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-200",
          open ? "max-h-80" : "max-h-0"
        )}
      >
        <div className="border-t border-[var(--border)] bg-[var(--bg-surface)] px-4 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[var(--border)]">
            <Link href="/quiz" onClick={() => setOpen(false)}>
              <Button size="md" className="w-full gap-2">
                <Sparkles className="h-4 w-4" />
                Quiz IA — Trouvez ma ville
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
