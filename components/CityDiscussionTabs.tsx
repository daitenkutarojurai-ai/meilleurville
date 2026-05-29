"use client";

import { useState } from "react";
import { CommentSection } from "@/components/CommentSection";
import { QASection } from "@/components/QASection";
import { cn } from "@/lib/utils";

interface CityDiscussionTabsProps {
  citySlug: string;
  cityName: string;
  locale?: "fr" | "en";
}

type TabId = "reviews" | "qa";

const TAB_IDS: readonly TabId[] = ["reviews", "qa"] as const;

export function CityDiscussionTabs({ citySlug, cityName, locale = "fr" }: CityDiscussionTabsProps) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const [active, setActive] = useState<TabId>("reviews");

  const tabs: { id: TabId; label: string }[] = [
    { id: "reviews", label: L("Avis & discussions", "Reviews & discussion") },
    { id: "qa", label: L("Questions & réponses", "Questions & answers") },
  ];

  return (
    <div>
      {/* Two-pill tab switcher */}
      <div
        role="tablist"
        aria-label={L("Sections discussion", "Discussion sections")}
        className="mb-6 inline-flex rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-1 gap-1"
      >
        {tabs.map((tab) => (
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
                const idx = TAB_IDS.findIndex((t) => t === active);
                const next = e.key === "ArrowRight"
                  ? (idx + 1) % TAB_IDS.length
                  : (idx - 1 + TAB_IDS.length) % TAB_IDS.length;
                setActive(TAB_IDS[next]);
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
            title={L(`Témoignages sur ${cityName}`, `Firsthand accounts of ${cityName}`)}
            showRating
            subscribeContext={cityName}
            emptyHint={L(
              `Vous avez vécu ou visité ${cityName} ? Racontez-nous : ce que vous avez aimé, ce qui vous a surpris, vos coups de cœur de quartier…`,
              `Lived in or visited ${cityName}? Tell us: what you liked, what surprised you, the neighbourhoods you loved…`
            )}
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
