"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, MapPin, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { FavoriteCount } from "@/components/effects/FavoriteButton";
import { SearchPalette } from "@/components/SearchPalette";

interface NavItem {
  label: string;
  href: string;
  emoji: string;
  /** Match against current pathname for active state. */
  matchPrefix?: string;
}

const NAV_LINKS: NavItem[] = [
  { label: "Classements", href: "/classements", emoji: "📊", matchPrefix: "/classements" },
  { label: "Comparer",    href: "/comparer",    emoji: "⚖️", matchPrefix: "/comparer" },
  { label: "Explorer",    href: "/villes",      emoji: "🌍", matchPrefix: "/villes" },
  { label: "Carte",       href: "/carte",       emoji: "🗺️", matchPrefix: "/carte" },
  { label: "Simulateur",  href: "/#simulateur", emoji: "💸" },
  { label: "Guides",      href: "/guides",      emoji: "📖", matchPrefix: "/guides" },
  { label: "Red Flags",   href: "/red-flags",   emoji: "🚩", matchPrefix: "/red-flags" },
];

function isActive(item: NavItem, pathname: string): boolean {
  if (!item.matchPrefix) return false;
  if (item.matchPrefix === "/") return pathname === "/";
  return pathname === item.matchPrefix || pathname.startsWith(item.matchPrefix + "/");
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
    <SearchPalette />
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
          "mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 transition-[height] duration-300",
          scrolled ? "h-14" : "h-16"
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/30 group-hover:shadow-[var(--accent)]/50 transition-shadow">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
            Meilleur<span className="text-[var(--accent)]">Ville</span>
          </span>
        </Link>

        {/* Desktop pill nav — same look as SectionNav, emoji + label */}
        <div className="hidden lg:flex items-center gap-1 flex-1 justify-center min-w-0 overflow-x-auto scrollbar-none">
          {NAV_LINKS.map((link) => {
            const active = isActive(link, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
                  active
                    ? "bg-[var(--accent)] text-white shadow-sm shadow-[var(--accent)]/40"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                )}
              >
                <span aria-hidden>{link.emoji}</span>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop CTA — visible from md so favoris/quiz are always reachable on tablet */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <Link
            href="/favoris"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-pink)] hover:bg-[var(--bg-elevated)] transition-colors"
            aria-label="Mes favoris"
          >
            <Heart className="h-4 w-4" />
            <FavoriteCount />
          </Link>
          <Link href="/quiz">
            <Button size="md" className="gap-2 rounded-full">
              <Sparkles className="h-4 w-4" />
              Quiz IA
            </Button>
          </Link>
        </div>

        {/* Hamburger — visible below lg (tablet + mobile) */}
        <button
          className="lg:hidden rounded-full p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
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
          open ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="border-t border-[var(--border)] bg-[var(--bg-surface)] px-4 py-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {NAV_LINKS.map((link) => {
              const active = isActive(link, pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                    active
                      ? "bg-[var(--accent)] text-white shadow-sm"
                      : "border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <span aria-hidden>{link.emoji}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="pt-3 border-t border-[var(--border)]">
            <Link href="/quiz" onClick={() => setOpen(false)}>
              <Button size="md" className="w-full gap-2 rounded-full">
                <Sparkles className="h-4 w-4" />
                Quiz IA — Trouvez ma ville
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}
