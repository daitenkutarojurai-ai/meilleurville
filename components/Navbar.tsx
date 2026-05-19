"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, MapPin, Sparkles, Heart, Search, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { FavoriteCount } from "@/components/effects/FavoriteButton";
import { SearchPalette } from "@/components/SearchPalette";
import { DEFAULT_LOCALE } from "@/lib/i18n";

const IS_EN = DEFAULT_LOCALE === "en";

interface NavItem {
  label: string;
  href: string;
  emoji: string;
  /** Match against current pathname for active state. */
  matchPrefix?: string;
}

// FR nav: 4 primary (always visible lg+) + secondary at xl + mobile-only extras.
// Cadre de vie a été sorti de la barre (trop niche pour un slot primaire) ;
// Red Flags + Carte remontent en secondaire visible dès xl.
const NAV_PRIMARY_FR: NavItem[] = [
  { label: "Explorer",    href: "/villes",      emoji: "🌍", matchPrefix: "/villes" },
  { label: "Classements", href: "/classements", emoji: "📊", matchPrefix: "/classements" },
  { label: "Comparer",    href: "/comparer",    emoji: "⚖️", matchPrefix: "/comparer" },
  { label: "Guides",      href: "/guides",      emoji: "📖", matchPrefix: "/guides" },
];
const NAV_SECONDARY_FR: NavItem[] = [
  { label: "Carte",     href: "/carte",     emoji: "🗺️", matchPrefix: "/carte" },
  { label: "Red Flags", href: "/red-flags", emoji: "🚩", matchPrefix: "/red-flags" },
  { label: "Vacances",  href: "/vacances",  emoji: "🌴", matchPrefix: "/vacances" },
];
const NAV_MOBILE_ONLY_FR: NavItem[] = [
  { label: "Cadre de vie", href: "/cadre-de-vie", emoji: "🌿", matchPrefix: "/cadre-de-vie" },
  { label: "Simulateur", href: "/#simulateur", emoji: "💸" },
  { label: "Contact", href: "/contact", emoji: "✉️", matchPrefix: "/contact" },
];

// EN nav: only routes that actually exist on bestcitiesinfrance.com today.
const NAV_PRIMARY_EN: NavItem[] = [
  { label: "Cities",   href: "/cities",   emoji: "🌍", matchPrefix: "/cities" },
  { label: "Rankings", href: "/rankings", emoji: "📊", matchPrefix: "/rankings" },
  { label: "Quiz",     href: "/quiz",     emoji: "✨", matchPrefix: "/quiz" },
];
const NAV_SECONDARY_EN: NavItem[] = [];
const NAV_MOBILE_ONLY_EN: NavItem[] = [];

const NAV_PRIMARY = IS_EN ? NAV_PRIMARY_EN : NAV_PRIMARY_FR;
const NAV_SECONDARY = IS_EN ? NAV_SECONDARY_EN : NAV_SECONDARY_FR;
const NAV_MOBILE_ONLY = IS_EN ? NAV_MOBILE_ONLY_EN : NAV_MOBILE_ONLY_FR;
const NAV_ALL: NavItem[] = [...NAV_PRIMARY, ...NAV_SECONDARY, ...NAV_MOBILE_ONLY];

function isActive(item: NavItem, pathname: string): boolean {
  if (!item.matchPrefix) return false;
  if (item.matchPrefix === "/") return pathname === "/";
  return pathname === item.matchPrefix || pathname.startsWith(item.matchPrefix + "/");
}

function openSearchPalette() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("meilleurville:open-search"));
}

function SearchTrigger({ compact = false }: { compact?: boolean }) {
  // Lazy initialiser: read once at mount, no setState-in-effect dance.
  const [isMac] = useState(() =>
    typeof navigator !== "undefined" && /Mac|iPad|iPhone/.test(navigator.platform)
  );
  if (compact) {
    return (
      <button
        type="button"
        onClick={openSearchPalette}
        aria-label={IS_EN ? "Open search (Cmd+K)" : "Ouvrir la recherche (Cmd+K)"}
        className="rounded-full p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        <Search className="h-4 w-4" />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={openSearchPalette}
      aria-label={IS_EN ? "Open search (Cmd+K)" : "Ouvrir la recherche (Cmd+K)"}
      className="group hidden xl:inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/60 backdrop-blur px-3 py-1.5 text-xs text-[var(--text-tertiary)] hover:border-[var(--accent)]/40 hover:bg-white hover:text-[var(--text-primary)] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      <Search className="h-3.5 w-3.5" />
      <span>{IS_EN ? "Search…" : "Rechercher…"}</span>
      <kbd className="ml-1 inline-flex items-center gap-0.5 rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]">
        {isMac ? "⌘" : "Ctrl"}
        <span>K</span>
      </kbd>
    </button>
  );
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
            {IS_EN ? (
              <>Best<span className="text-[var(--accent)]">CitiesInFrance</span></>
            ) : (
              <>Meilleur<span className="text-[var(--accent)]">Ville</span></>
            )}
          </span>
        </Link>

        {/* Desktop pill nav — fits at lg without scroll; xl reveals secondary */}
        <div className="hidden lg:flex items-center gap-0.5 xl:gap-1 flex-1 justify-center min-w-0">
          {NAV_PRIMARY.map((link) => {
            const active = isActive(link, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 xl:px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
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
          {NAV_SECONDARY.map((link) => {
            const active = isActive(link, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "hidden xl:flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
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

        {/* Desktop CTA — compact at md/lg, roomier at xl */}
        <div className="hidden md:flex items-center gap-1 lg:gap-1.5 xl:gap-2 flex-shrink-0">
          <SearchTrigger />
          {/* Compact search icon for md/lg where the full pill is hidden */}
          <div className="xl:hidden">
            <SearchTrigger compact />
          </div>
          {!IS_EN && (
            <Link
              href="/favoris"
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-pink)] hover:bg-[var(--bg-elevated)] transition-colors"
              aria-label="Mes favoris"
            >
              <Heart className="h-4 w-4" />
              <FavoriteCount />
            </Link>
          )}
          {!IS_EN && (
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full p-2 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-colors"
              aria-label="Contact"
            >
              <Mail className="h-4 w-4" />
            </Link>
          )}
          <Link href="/quiz">
            <Button size="md" className="gap-1.5 rounded-full px-3 lg:px-4">
              <Sparkles className="h-4 w-4" />
              <span className="hidden xl:inline">{IS_EN ? "AI Quiz" : "Quiz IA"}</span>
              <span className="xl:hidden">Quiz</span>
            </Button>
          </Link>
        </div>

        {/* Mobile: compact search icon next to hamburger */}
        <div className="md:hidden flex items-center gap-1">
          <SearchTrigger compact />
        </div>

        {/* Hamburger — visible below lg (tablet + mobile) */}
        <button
          className="lg:hidden rounded-full p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          onClick={() => setOpen(!open)}
          aria-label={open ? (IS_EN ? "Close menu" : "Fermer le menu") : (IS_EN ? "Open menu" : "Ouvrir le menu")}
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
          aria-label={IS_EN ? "Close menu" : "Fermer le menu"}
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
            {NAV_ALL.map((link) => {
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
                {IS_EN ? "AI Quiz — Find my city" : "Quiz IA — Trouvez ma ville"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}
