"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Menu, X, Sparkles, Heart, Search,
  Globe2, BarChart3, Scale, MoreHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { FavoriteCount } from "@/components/effects/FavoriteButton";
import { SearchPalette } from "@/components/SearchPalette";
import { BrandMark } from "@/components/BrandMark";
import { DEFAULT_LOCALE } from "@/lib/i18n";

const IS_EN = DEFAULT_LOCALE === "en";

interface NavItem {
  label: string;
  href: string;
  emoji: string;
  /** Match against current pathname for active state. */
  matchPrefix?: string;
}

// Desktop nav: 5 primary text pills (lg+) + 1 secondary at xl. The mobile /
// tablet experience (< lg) is a bottom tab bar — see BOTTOM_TABS below.
const NAV_PRIMARY_FR: NavItem[] = [
  { label: "Explorer",    href: "/villes",      emoji: "🌍", matchPrefix: "/villes" },
  { label: "Classements", href: "/classements", emoji: "📊", matchPrefix: "/classements" },
  { label: "Comparer",    href: "/comparer",    emoji: "⚖️", matchPrefix: "/comparer" },
  { label: "Guides",      href: "/guides",      emoji: "📖", matchPrefix: "/guides" },
  { label: "Red Flags",   href: "/red-flags",   emoji: "🚩", matchPrefix: "/red-flags" },
];
const NAV_SECONDARY_FR: NavItem[] = [
  { label: "Vacances",  href: "/vacances",  emoji: "🌴", matchPrefix: "/vacances" },
];
const CARTE_FR: NavItem = { label: "Carte", href: "/carte", emoji: "🗺️", matchPrefix: "/carte" };
// Folded into the desktop "Plus" overflow menu + the mobile drawer.
const NAV_MOBILE_ONLY_FR: NavItem[] = [
  CARTE_FR,
  { label: "Favoris", href: "/favoris", emoji: "❤️", matchPrefix: "/favoris" },
  { label: "Cadre de vie", href: "/cadre-de-vie", emoji: "🌿", matchPrefix: "/cadre-de-vie" },
  { label: "Simulateur", href: "/#simulateur", emoji: "💸" },
  { label: "Contact", href: "/contact", emoji: "✉️", matchPrefix: "/contact" },
];

// EN nav: routes that actually exist on bestcitiesinfrance.com today.
const NAV_PRIMARY_EN: NavItem[] = [
  { label: "Cities",   href: "/cities",   emoji: "🌍", matchPrefix: "/cities" },
  { label: "Rankings", href: "/rankings", emoji: "📊", matchPrefix: "/rankings" },
  { label: "Compare",  href: "/compare",  emoji: "⚖️", matchPrefix: "/compare" },
  { label: "Guides",   href: "/guides",   emoji: "📖", matchPrefix: "/guides" },
];
const NAV_SECONDARY_EN: NavItem[] = [
  { label: "Map",     href: "/map",     emoji: "🗺️", matchPrefix: "/map" },
  { label: "Regions", href: "/regions", emoji: "📍", matchPrefix: "/regions" },
  { label: "Quiz",    href: "/quiz",    emoji: "✨", matchPrefix: "/quiz" },
];
const NAV_MOBILE_ONLY_EN: NavItem[] = [
  { label: "Departments", href: "/departments", emoji: "🗂️", matchPrefix: "/departments" },
  { label: "About",       href: "/about",       emoji: "ℹ️", matchPrefix: "/about" },
  { label: "FAQ",         href: "/faq",         emoji: "❓", matchPrefix: "/faq" },
];

const NAV_PRIMARY = IS_EN ? NAV_PRIMARY_EN : NAV_PRIMARY_FR;
const NAV_SECONDARY = IS_EN ? NAV_SECONDARY_EN : NAV_SECONDARY_FR;
const NAV_MOBILE_ONLY = IS_EN ? NAV_MOBILE_ONLY_EN : NAV_MOBILE_ONLY_FR;
const NAV_ALL: NavItem[] = [...NAV_PRIMARY, ...NAV_SECONDARY, ...NAV_MOBILE_ONLY];

// Desktop "Plus" overflow menu — secondary actions pulled out of the bar.
const NAV_OVERFLOW: NavItem[] = IS_EN ? [] : [
  CARTE_FR,
  { label: "Contact", href: "/contact", emoji: "✉️", matchPrefix: "/contact" },
];

// Mobile / tablet bottom tab bar — the four highest-intent destinations
// plus a Menu tab that opens the full drawer.
interface BottomTab {
  label: string;
  href: string;
  icon: LucideIcon;
  matchPrefix: string;
}
const BOTTOM_TABS_FR: BottomTab[] = [
  { label: "Explorer",    href: "/villes",      icon: Globe2,    matchPrefix: "/villes" },
  { label: "Classements", href: "/classements", icon: BarChart3, matchPrefix: "/classements" },
  { label: "Quiz",        href: "/quiz",        icon: Sparkles,  matchPrefix: "/quiz" },
  { label: "Comparer",    href: "/comparer",    icon: Scale,     matchPrefix: "/comparer" },
];
const BOTTOM_TABS_EN: BottomTab[] = [
  { label: "Cities",   href: "/cities",   icon: Globe2,    matchPrefix: "/cities" },
  { label: "Rankings", href: "/rankings", icon: BarChart3, matchPrefix: "/rankings" },
  { label: "Quiz",     href: "/quiz",     icon: Sparkles,  matchPrefix: "/quiz" },
  { label: "Compare",  href: "/compare",  icon: Scale,     matchPrefix: "/compare" },
];
const BOTTOM_TABS = IS_EN ? BOTTOM_TABS_EN : BOTTOM_TABS_FR;

function isActivePath(matchPrefix: string | undefined, pathname: string): boolean {
  if (!matchPrefix) return false;
  if (matchPrefix === "/") return pathname === "/";
  return pathname === matchPrefix || pathname.startsWith(matchPrefix + "/");
}

function isActive(item: NavItem, pathname: string): boolean {
  return isActivePath(item.matchPrefix, pathname);
}

function openSearchPalette() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("meilleurville:open-search"));
}

/**
 * Search trigger. `variant="bar"` is the full-width pill that fills the
 * mobile/tablet top bar; `variant="desktop"` is the compact pill in the
 * desktop right-hand cluster.
 */
function SearchTrigger({ variant }: { variant: "bar" | "desktop" }) {
  const [isMac] = useState(() =>
    typeof navigator !== "undefined" && /Mac|iPad|iPhone/.test(navigator.platform)
  );
  const placeholder = IS_EN ? "Search a city…" : "Rechercher une ville…";
  const ariaLabel = IS_EN ? "Open search" : "Ouvrir la recherche";

  if (variant === "bar") {
    return (
      <button
        type="button"
        onClick={openSearchPalette}
        aria-label={ariaLabel}
        className="flex w-full items-center gap-2 rounded-full border border-[var(--border)] bg-white/70 backdrop-blur px-3.5 py-2 text-sm text-[var(--text-tertiary)] transition-colors hover:border-[var(--accent)]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        <Search className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{placeholder}</span>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={openSearchPalette}
      aria-label={ariaLabel}
      className="group inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/60 backdrop-blur px-3 py-1.5 text-xs text-[var(--text-tertiary)] transition-all hover:border-[var(--accent)]/40 hover:bg-white hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      <Search className="h-3.5 w-3.5" />
      <span>{IS_EN ? "Search…" : "Rechercher…"}</span>
      <kbd className="ml-1 hidden xl:inline-flex items-center gap-0.5 rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]">
        {isMac ? "⌘" : "Ctrl"}
        <span>K</span>
      </kbd>
    </button>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);        // mobile drawer
  const [moreOpen, setMoreOpen] = useState(false); // desktop overflow menu
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const moreRef = useRef<HTMLDivElement>(null);

  // Shrink (compact height + shadow) once scrolled. The bar stays pinned at
  // the top at all times — it never hides on scroll-down, so the SectionNav
  // below it always sits flush against it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Click-outside closes the desktop overflow menu.
  useEffect(() => {
    if (!moreOpen) return;
    function onDown(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [moreOpen]);

  return (
    <>
      <SearchPalette />

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <nav
        className={cn(
          "sticky top-0 z-50 transition-[background-color,box-shadow,height] duration-300",
          scrolled
            ? "border-b border-[var(--border)]/60 bg-[var(--bg-canvas)]/75 backdrop-blur-2xl shadow-[0_8px_32px_-12px_rgba(31,58,42,0.10)]"
            : "border-b border-transparent bg-[var(--bg-canvas)]/40 backdrop-blur-md"
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6 transition-[height] duration-300",
            scrolled ? "h-14" : "h-16"
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <BrandMark className="h-8 w-8 rounded-[22%] shadow-lg shadow-[var(--accent)]/30 group-hover:shadow-[var(--accent)]/50 transition-shadow" />
            <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
              {IS_EN ? (
                <>Best<span className="text-[var(--accent)]">CitiesInFrance</span></>
              ) : (
                <>MaVille<span className="text-[var(--accent)]">Ideal</span></>
              )}
            </span>
          </Link>

          {/* Desktop pill nav — lg shows primary, xl adds secondary */}
          <div className="hidden lg:flex items-center gap-0.5 xl:gap-1 flex-1 justify-center min-w-0">
            {[...NAV_PRIMARY, ...NAV_SECONDARY].map((link, i) => {
              const active = isActive(link, pathname);
              const secondary = i >= NAV_PRIMARY.length;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "shrink-0 items-center gap-1.5 rounded-full px-2.5 xl:px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
                    secondary ? "hidden xl:flex" : "flex",
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

          {/* Mobile / tablet: full-width search pill */}
          <div className="lg:hidden flex-1 min-w-0">
            <SearchTrigger variant="bar" />
          </div>

          {/* Desktop right cluster — search · quiz · overflow */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 flex-shrink-0">
            <SearchTrigger variant="desktop" />
            <Link href="/quiz">
              <Button size="md" className="gap-1.5 rounded-full px-3 lg:px-4">
                <Sparkles className="h-4 w-4" />
                <span className="hidden xl:inline">{IS_EN ? "AI Quiz" : "Quiz IA"}</span>
                <span className="xl:hidden">Quiz</span>
              </Button>
            </Link>
            {NAV_OVERFLOW.length > 0 && (
              <div className="relative" ref={moreRef}>
                <button
                  type="button"
                  onClick={() => setMoreOpen((v) => !v)}
                  aria-label={IS_EN ? "More" : "Plus de liens"}
                  aria-expanded={moreOpen}
                  className={cn(
                    "inline-flex items-center rounded-full p-2 transition-colors",
                    moreOpen
                      ? "bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {moreOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)]/95 backdrop-blur-xl p-1.5 shadow-[0_12px_40px_-12px_rgba(31,58,42,0.25)]">
                    {NAV_OVERFLOW.map((link) => {
                      const active = isActive(link, pathname);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMoreOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                            active
                              ? "bg-[var(--accent)] text-white"
                              : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                          )}
                        >
                          <span aria-hidden>{link.emoji}</span>
                          {link.label}
                        </Link>
                      );
                    })}
                    <Link
                      href="/favoris"
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--accent-pink)] transition-colors"
                    >
                      <Heart className="h-4 w-4" />
                      <span>Favoris</span>
                      <span className="ml-auto"><FavoriteCount /></span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Mobile / tablet bottom tab bar ───────────────────────── */}
      <nav
        aria-label={IS_EN ? "Primary" : "Navigation principale"}
        className="lg:hidden fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)]/70 bg-[var(--bg-canvas)]/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          {BOTTOM_TABS.map((tab) => {
            const active = isActivePath(tab.matchPrefix, pathname);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                  active ? "text-[var(--accent)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                {tab.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={IS_EN ? "Open menu" : "Ouvrir le menu"}
            aria-expanded={open}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
              open ? "text-[var(--accent)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            )}
          >
            <Menu className="h-5 w-5" />
            {IS_EN ? "Menu" : "Menu"}
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer (opened from the bottom "Menu" tab) ─────── */}
      {open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={IS_EN ? "Close menu" : "Fermer le menu"}
          tabIndex={-1}
          className="lg:hidden fixed inset-0 z-[54] bg-black/40 backdrop-blur-[2px]"
        />
      )}
      <div
        id="mobile-menu"
        className={cn(
          "lg:hidden fixed inset-x-0 bottom-0 z-[55] rounded-t-3xl border-t border-[var(--border)] bg-[var(--bg-surface)] transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full pointer-events-none"
        )}
      >
        <div className="px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="mx-auto h-1 w-10 rounded-full bg-[var(--border)]" aria-hidden />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={IS_EN ? "Close menu" : "Fermer le menu"}
              className="absolute right-4 rounded-full p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
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
                    "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all active:scale-[0.97]",
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
    </>
  );
}
