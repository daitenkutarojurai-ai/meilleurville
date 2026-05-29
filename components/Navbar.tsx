"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Menu, X, Sparkles, Search,
  Globe2, BarChart3, Scale,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { AccountButton } from "@/components/effects/AccountButton";
import { SearchPaletteLauncher } from "@/components/SearchPaletteLauncher";
import { BrandMark } from "@/components/BrandMark";
import { DEFAULT_LOCALE } from "@/lib/i18n";

const IS_EN = DEFAULT_LOCALE === "en";

interface NavItem {
  label: string;
  href: string;
  emoji: string;
  matchPrefix?: string;
}

interface MenuGroup {
  title: string;
  items: NavItem[];
}

// Desktop top bar — 4 compact pills, short labels to save space
const NAV_PRIMARY_FR: NavItem[] = [
  { label: "Villes",    href: "/villes",      emoji: "🌍", matchPrefix: "/villes" },
  { label: "Top",       href: "/classements", emoji: "📊", matchPrefix: "/classements" },
  { label: "VS",        href: "/comparer",    emoji: "⚖️", matchPrefix: "/comparer" },
  { label: "Red Flags", href: "/red-flags",   emoji: "🚩", matchPrefix: "/red-flags" },
];
const NAV_PRIMARY_EN: NavItem[] = [
  { label: "Cities",  href: "/cities",   emoji: "🌍", matchPrefix: "/cities" },
  { label: "Top",     href: "/rankings", emoji: "📊", matchPrefix: "/rankings" },
  { label: "VS",      href: "/compare",  emoji: "⚖️", matchPrefix: "/compare" },
  { label: "Guides",  href: "/guides",   emoji: "📖", matchPrefix: "/guides" },
];

// Desktop burger — full mega-menu, 4 grouped columns
const MENU_GROUPS_FR: MenuGroup[] = [
  {
    title: "Explorer",
    items: [
      { label: "Toutes les villes", href: "/villes",        emoji: "🌍" },
      { label: "Carte interactive",  href: "/carte",         emoji: "🗺️" },
      { label: "Par région",         href: "/regions",       emoji: "📍" },
      { label: "Par département",    href: "/departements",  emoji: "🗂️" },
      { label: "Leaderboard",        href: "/leaderboard",   emoji: "🏆" },
      { label: "Vacances",           href: "/vacances",      emoji: "🌴" },
    ],
  },
  {
    title: "Outils",
    items: [
      { label: "City Match",      href: "/city-match",  emoji: "💘" },
      { label: "Quiz IA",         href: "/quiz",        emoji: "✨" },
      { label: "Comparer villes", href: "/comparer",    emoji: "⚖️" },
      { label: "Classements",     href: "/classements", emoji: "📊" },
      { label: "Synthèse",        href: "/synthese",    emoji: "📋" },
      { label: "Red Flag Radar",  href: "/red-flags",   emoji: "🚩" },
    ],
  },
  {
    title: "Contenu",
    items: [
      { label: "Guides pratiques",  href: "/guides",        emoji: "📖" },
      { label: "Cadre de vie",      href: "/cadre-de-vie",  emoji: "🌿" },
      { label: "Glossaire",         href: "/glossaire",     emoji: "📚" },
      { label: "Méthodologie",      href: "/methode",       emoji: "🔬" },
      { label: "Données & Sources", href: "/donnees",       emoji: "📈" },
    ],
  },
  {
    title: "À propos",
    items: [
      { label: "Notre mission", href: "/about",    emoji: "ℹ️" },
      { label: "FAQ",           href: "/faq",      emoji: "❓" },
      { label: "Contact",       href: "/contact",  emoji: "✉️" },
      { label: "Favoris",       href: "/favoris",  emoji: "❤️" },
      { label: "Sommaire",      href: "/sommaire", emoji: "🗒️" },
    ],
  },
];
const MENU_GROUPS_EN: MenuGroup[] = [
  {
    title: "Explore",
    items: [
      { label: "All cities",  href: "/cities",      emoji: "🌍" },
      { label: "Map",         href: "/map",         emoji: "🗺️" },
      { label: "Regions",     href: "/regions",     emoji: "📍" },
      { label: "Departments", href: "/departments", emoji: "🗂️" },
      { label: "Leaderboard", href: "/leaderboard", emoji: "🏆" },
    ],
  },
  {
    title: "Tools",
    items: [
      { label: "Quiz",            href: "/quiz",            emoji: "✨" },
      { label: "Compare",         href: "/compare",         emoji: "⚖️" },
      { label: "Rankings",        href: "/rankings",        emoji: "📊" },
      { label: "For who",         href: "/for-who",         emoji: "👥" },
      { label: "Niche rankings",  href: "/niche-rankings",  emoji: "📊" },
      { label: "Red flags",       href: "/red-flags",       emoji: "🚩" },
      { label: "Vacations",       href: "/vacations",       emoji: "🌴" },
    ],
  },
  {
    title: "Guides",
    items: [
      { label: "Guides",           href: "/guides",           emoji: "📖" },
      { label: "Cheapest cities",  href: "/cheapest-cities",  emoji: "💶" },
      { label: "Best value",       href: "/best-value-cities", emoji: "💎" },
      { label: "Search",           href: "/search",           emoji: "🔍" },
      { label: "Methodology",      href: "/methodology",      emoji: "🔬" },
    ],
  },
  {
    title: "About",
    items: [
      { label: "About",   href: "/about",   emoji: "ℹ️" },
      { label: "FAQ",     href: "/faq",     emoji: "❓" },
      { label: "Contact", href: "/contact", emoji: "✉️" },
    ],
  },
];

// Mobile slide-up drawer — all sections as pill chips
const NAV_ALL_FR: NavItem[] = [
  { label: "Toutes les villes", href: "/villes",        emoji: "🌍", matchPrefix: "/villes" },
  { label: "Carte",             href: "/carte",         emoji: "🗺️", matchPrefix: "/carte" },
  { label: "Régions",           href: "/regions",       emoji: "📍", matchPrefix: "/regions" },
  { label: "Départements",      href: "/departements",  emoji: "🗂️", matchPrefix: "/departements" },
  { label: "Classements",       href: "/classements",   emoji: "📊", matchPrefix: "/classements" },
  { label: "Leaderboard",       href: "/leaderboard",   emoji: "🏆", matchPrefix: "/leaderboard" },
  { label: "Comparer",          href: "/comparer",      emoji: "⚖️", matchPrefix: "/comparer" },
  { label: "City Match",        href: "/city-match",    emoji: "💘", matchPrefix: "/city-match" },
  { label: "Quiz IA",           href: "/quiz",          emoji: "✨", matchPrefix: "/quiz" },
  { label: "Red Flag Radar",    href: "/red-flags",     emoji: "🚩", matchPrefix: "/red-flags" },
  { label: "Synthèse",          href: "/synthese",      emoji: "📋", matchPrefix: "/synthese" },
  { label: "Guides",            href: "/guides",        emoji: "📖", matchPrefix: "/guides" },
  { label: "Vacances",          href: "/vacances",      emoji: "🌴", matchPrefix: "/vacances" },
  { label: "Cadre de vie",      href: "/cadre-de-vie",  emoji: "🌿", matchPrefix: "/cadre-de-vie" },
  { label: "Favoris",           href: "/favoris",       emoji: "❤️", matchPrefix: "/favoris" },
  { label: "FAQ",               href: "/faq",           emoji: "❓", matchPrefix: "/faq" },
  { label: "Contact",           href: "/contact",       emoji: "✉️", matchPrefix: "/contact" },
];
const NAV_ALL_EN: NavItem[] = [
  { label: "Cities",          href: "/cities",           emoji: "🌍", matchPrefix: "/cities" },
  { label: "Rankings",        href: "/rankings",         emoji: "📊", matchPrefix: "/rankings" },
  { label: "Compare",         href: "/compare",          emoji: "⚖️", matchPrefix: "/compare" },
  { label: "Guides",          href: "/guides",           emoji: "📖", matchPrefix: "/guides" },
  { label: "Map",             href: "/map",              emoji: "🗺️", matchPrefix: "/map" },
  { label: "Regions",         href: "/regions",          emoji: "📍", matchPrefix: "/regions" },
  { label: "Departments",     href: "/departments",      emoji: "🗂️", matchPrefix: "/departments" },
  { label: "Quiz",            href: "/quiz",             emoji: "✨", matchPrefix: "/quiz" },
  { label: "For who",         href: "/for-who",          emoji: "👥", matchPrefix: "/for-who" },
  { label: "Niche rankings",  href: "/niche-rankings",   emoji: "📊", matchPrefix: "/niche-rankings" },
  { label: "Red flags",       href: "/red-flags",        emoji: "🚩", matchPrefix: "/red-flags" },
  { label: "Vacations",       href: "/vacations",        emoji: "🌴", matchPrefix: "/vacations" },
  { label: "Cheapest cities", href: "/cheapest-cities",  emoji: "💶", matchPrefix: "/cheapest-cities" },
  { label: "Search",          href: "/search",           emoji: "🔍", matchPrefix: "/search" },
  { label: "About",           href: "/about",            emoji: "ℹ️", matchPrefix: "/about" },
  { label: "FAQ",             href: "/faq",              emoji: "❓", matchPrefix: "/faq" },
  { label: "Contact",         href: "/contact",          emoji: "✉️", matchPrefix: "/contact" },
];

// Mobile bottom tab bar — 4 highest-intent + Menu
interface BottomTab {
  label: string;
  href: string;
  icon: LucideIcon;
  matchPrefix: string;
}
const BOTTOM_TABS_FR: BottomTab[] = [
  { label: "Villes",  href: "/villes",      icon: Globe2,    matchPrefix: "/villes" },
  { label: "Top",     href: "/classements", icon: BarChart3, matchPrefix: "/classements" },
  { label: "Quiz",    href: "/quiz",        icon: Sparkles,  matchPrefix: "/quiz" },
  { label: "VS",      href: "/comparer",    icon: Scale,     matchPrefix: "/comparer" },
];
const BOTTOM_TABS_EN: BottomTab[] = [
  { label: "Cities",   href: "/cities",   icon: Globe2,    matchPrefix: "/cities" },
  { label: "Rankings", href: "/rankings", icon: BarChart3, matchPrefix: "/rankings" },
  { label: "Quiz",     href: "/quiz",     icon: Sparkles,  matchPrefix: "/quiz" },
  { label: "Compare",  href: "/compare",  icon: Scale,     matchPrefix: "/compare" },
];

const NAV_PRIMARY = IS_EN ? NAV_PRIMARY_EN : NAV_PRIMARY_FR;
const MENU_GROUPS = IS_EN ? MENU_GROUPS_EN : MENU_GROUPS_FR;
const NAV_ALL = IS_EN ? NAV_ALL_EN : NAV_ALL_FR;
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
      <span>{IS_EN ? "Search…" : "Chercher…"}</span>
      <kbd className="ml-1 hidden xl:inline-flex items-center gap-0.5 rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]">
        {isMac ? "⌘" : "Ctrl"}
        <span>K</span>
      </kbd>
    </button>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);        // mobile drawer
  const [menuOpen, setMenuOpen] = useState(false); // desktop mega-menu
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Click outside or Escape closes the desktop mega-menu
  useEffect(() => {
    if (!menuOpen) return;
    function onDown(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Close mega-menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <>
      <SearchPaletteLauncher />

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <nav
        ref={navRef}
        className={cn(
          "sticky top-0 z-50 transition-[background-color,box-shadow] duration-300",
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

          {/* Desktop: compact primary pills */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center min-w-0">
            {NAV_PRIMARY.map((link) => {
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

          {/* Mobile / tablet: full-width search pill */}
          <div className="lg:hidden flex-1 min-w-0">
            <SearchTrigger variant="bar" />
          </div>

          {/* Desktop right cluster — search · account · quiz · burger */}
          <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
            <SearchTrigger variant="desktop" />
            <AccountButton />
            <Link href="/quiz">
              <Button size="md" className="gap-1.5 rounded-full px-3 lg:px-4">
                <Sparkles className="h-4 w-4" />
                <span>{IS_EN ? "Quiz" : "Quiz IA"}</span>
              </Button>
            </Link>
            {/* Burger — opens full mega-menu */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={IS_EN ? "All sections" : "Toutes les sections"}
              aria-expanded={menuOpen}
              aria-controls="desktop-mega-menu"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
                menuOpen
                  ? "border-[var(--accent)]/50 bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              )}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              <span>Menu</span>
            </button>
          </div>
        </div>

        {/* ── Desktop mega-menu dropdown ──────────────────────────── */}
        <div
          id="desktop-mega-menu"
          className={cn(
            "hidden lg:block absolute left-0 right-0 top-full border-b border-[var(--border)]/60 bg-[var(--bg-canvas)]/97 backdrop-blur-2xl shadow-[0_16px_48px_-8px_rgba(31,58,42,0.20)] transition-[opacity,transform] duration-200 origin-top",
            menuOpen
              ? "opacity-100 scale-y-100 pointer-events-auto"
              : "opacity-0 scale-y-95 pointer-events-none"
          )}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 grid grid-cols-4 gap-8">
            {MENU_GROUPS.map((group) => (
              <div key={group.title}>
                <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">
                  {group.title}
                </h4>
                <ul className="space-y-0.5">
                  {group.items.map(({ label, href, emoji }) => {
                    const active = isActivePath(href, pathname);
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          onClick={() => setMenuOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
                            active
                              ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                              : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                          )}
                        >
                          <span aria-hidden className="w-5 text-center text-base">{emoji}</span>
                          {label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          {/* Bottom CTA strip */}
          <div className="border-t border-[var(--border)]/40 bg-[var(--bg-elevated)]/40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
              <p className="text-xs text-[var(--text-tertiary)]">
                {IS_EN
                  ? "Not sure where to start? Try the quiz."
                  : "Pas sûr(e) par où commencer ? Essayez le quiz."}
              </p>
              <Link href="/quiz" onClick={() => setMenuOpen(false)}>
                <Button size="sm" className="gap-1.5 rounded-full">
                  <Sparkles className="h-3.5 w-3.5" />
                  {IS_EN ? "Find my city" : "Trouver ma ville"}
                </Button>
              </Link>
            </div>
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
            Menu
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer backdrop ────────────────────────────────── */}
      {open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={IS_EN ? "Close menu" : "Fermer le menu"}
          tabIndex={-1}
          className="lg:hidden fixed inset-0 z-[54] bg-black/40 backdrop-blur-[2px]"
        />
      )}

      {/* ── Mobile slide-up drawer ────────────────────────────────── */}
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
