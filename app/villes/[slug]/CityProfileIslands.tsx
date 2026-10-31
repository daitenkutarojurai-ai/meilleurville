"use client";
// The only interactive parts of the city profile. CityProfile itself is a
// server component: its ~30 data cards render to HTML and ship no JS. Keep
// this file small — whatever it imports lands in the bundle of every city page.
import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";
import { GraduationCap, Home, Laptop, Sun } from "lucide-react";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { UserScoresCard } from "@/components/UserScoresCard";
import { CityReviewModal } from "@/components/CityReviewModal";
import { cn } from "@/lib/utils";

type Tab = { id: string; label: string };

const noopSubscribe = () => () => {};
// false in the server render and during hydration, true afterwards.
function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
type Panel = { id: string; className: string; children: ReactNode };

// Panels render in the static HTML (SEO + no-JS) and are hidden only after
// hydration — the old conditional render shipped 1 of 4 panels. The wrapper
// carries `data-active-tab` once hydrated so server markup can react to the
// active tab in CSS (see the pink band of the overview panel).
export function CityProfileTabs({ tabs, ariaLabel, panels }: { tabs: Tab[]; ariaLabel: string; panels: Panel[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const hydrated = useHydrated();

  return (
    <>
      <div className="sticky top-[var(--nav-h)] z-40 transition-[top] duration-300 border-b border-[var(--accent)]/15 bg-white/90 backdrop-blur-xl shadow-[0_8px_20px_-16px_rgba(79,70,229,0.55)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div
            role="tablist"
            aria-label={ariaLabel}
            className="flex gap-0 overflow-x-auto"
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              const idx = tabs.findIndex((t) => t.id === activeTab);
              const next = e.key === "ArrowRight"
                ? (idx + 1) % tabs.length
                : (idx - 1 + tabs.length) % tabs.length;
              setActiveTab(tabs[next].id);
              document.getElementById(`city-tab-${tabs[next].id}`)?.focus();
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                id={`city-tab-${tab.id}`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`city-panel-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "whitespace-nowrap px-3.5 py-2.5 sm:px-5 sm:py-4 text-[13px] sm:text-sm font-medium border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)]",
                  activeTab === tab.id
                    ? "border-[var(--accent-pink)] bg-[var(--band-indigo)] text-[var(--accent)]"
                    : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--band-lilac)] hover:text-[var(--text-primary)]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content — painted as its own colour band (« Couleurs »). The two
          full-width blocks of the overview panel carry their own bands
          (sky, pink), so the page reads as a sequence of distinct sections. */}
      <div
        className="band band-indigo mx-auto max-w-7xl px-4 sm:px-6 py-10"
        data-active-tab={hydrated ? activeTab : undefined}
      >
        {panels.map((p) => (
          <div
            key={p.id}
            id={`city-panel-${p.id}`}
            hidden={hydrated && activeTab !== p.id}
            role="tabpanel"
            aria-labelledby={`city-tab-${p.id}`}
            className={p.className}
          >
            {p.children}
          </div>
        ))}
      </div>
    </>
  );
}

const STAGE_ICONS: Record<string, React.ElementType> = {
  famille: Home,
  remote: Laptop,
  retraite: Sun,
  etudiant: GraduationCap,
};

type Stage = { id: string; label: string; bars: Array<{ key: string; label: string; score: number }> };

export function LifeStagePicker({ stages }: { stages: Stage[] }) {
  const [activeStage, setActiveStage] = useState(stages[0].id);
  const stage = stages.find((s) => s.id === activeStage) ?? stages[0];
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        {stages.map((ls) => {
          const Icon = STAGE_ICONS[ls.id];
          return (
            <button
              key={ls.id}
              onClick={() => setActiveStage(ls.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
                activeStage === ls.id
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {ls.label}
            </button>
          );
        })}
      </div>
      <div className="space-y-3">
        {stage.bars.map((b) => (
          <ScoreBar key={b.key} label={b.label} score={b.score} />
        ))}
      </div>
    </>
  );
}

// The review modal is opened from two places (the community-scores card and
// the « Noter cette ville » CTA) and must refresh the community scores once a
// review is posted. A context keeps that state in one island instead of
// turning the whole profile back into a client component.
const ReviewCtx = createContext<{ open: () => void; bumpKey: number } | null>(null);

export function CityReviewProvider({ citySlug, cityName, locale, children }: { citySlug: string; cityName: string; locale: "fr" | "en"; children: ReactNode }) {
  const [reviewOpen, setReviewOpen] = useState(false);
  // Force a remount of UserScoresCard after a new review is posted so the
  // aggregate refreshes (uses key bump rather than a context store).
  const [bumpKey, setBumpKey] = useState(0);
  return (
    <ReviewCtx.Provider value={{ open: () => setReviewOpen(true), bumpKey }}>
      {children}
      <CityReviewModal
        citySlug={citySlug}
        cityName={cityName}
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onPosted={() => setBumpKey((k) => k + 1)}
        locale={locale}
      />
    </ReviewCtx.Provider>
  );
}

export function LiveUserScoresCard({ citySlug, cityName, locale }: { citySlug: string; cityName: string; locale: "fr" | "en" }) {
  const ctx = useContext(ReviewCtx);
  return (
    <UserScoresCard
      key={ctx?.bumpKey ?? 0}
      citySlug={citySlug}
      cityName={cityName}
      onOpenReview={ctx?.open}
      locale={locale}
    />
  );
}

export function RateCityButton({ label }: { label: string }) {
  const ctx = useContext(ReviewCtx);
  return (
    <button
      type="button"
      onClick={() => ctx?.open()}
      className="inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 hover:bg-[var(--accent-hover)] transition-colors"
    >
      {label}
    </button>
  );
}
