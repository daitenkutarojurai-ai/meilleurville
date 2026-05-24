"use client";

import { useState } from "react";
import { CommentSection } from "@/components/CommentSection";
import { QASection } from "@/components/QASection";
import { cn } from "@/lib/utils";

interface CityDiscussionTabsProps {
  citySlug: string;
  cityName: string;
}

const TABS = [
  { id: "reviews", label: "Avis & discussions" },
  { id: "qa", label: "Questions & réponses" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function CityDiscussionTabs({ citySlug, cityName }: CityDiscussionTabsProps) {
  const [active, setActive] = useState<TabId>("reviews");

  return (
    <div>
      {/* Two-pill tab switcher */}
      <div
        role="tablist"
        aria-label="Sections discussion"
        className="mb-6 inline-flex rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-1 gap-1"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`disc-tab-${tab.id}`}
            role="tab"
            aria-selected={active === tab.id}
            aria-controls={`disc-panel-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => setActive(tab.id)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                const idx = TABS.findIndex((t) => t.id === active);
                const next = e.key === "ArrowRight"
                  ? (idx + 1) % TABS.length
                  : (idx - 1 + TABS.length) % TABS.length;
                setActive(TABS[next].id);
              }
            }}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)] whitespace-nowrap",
              active === tab.id
                ? "bg-[var(--bg-canvas)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div
        id="disc-panel-reviews"
        role="tabpanel"
        aria-labelledby="disc-tab-reviews"
        hidden={active !== "reviews"}
      >
        {active === "reviews" && (
          <CommentSection
            topic={`city:${citySlug}`}
            title={`Témoignages sur ${cityName}`}
            showRating
            subscribeContext={cityName}
            emptyHint={`Vous avez vécu ou visité ${cityName} ? Racontez-nous : ce que vous avez aimé, ce qui vous a surpris, vos coups de cœur de quartier…`}
          />
        )}
      </div>

      <div
        id="disc-panel-qa"
        role="tabpanel"
        aria-labelledby="disc-tab-qa"
        hidden={active !== "qa"}
      >
        {active === "qa" && (
          <QASection citySlug={citySlug} cityName={cityName} />
        )}
      </div>
    </div>
  );
}
