"use client";
import { useEffect, useState } from "react";
import { Sparkles, ChevronRight, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface AISummary {
  strengths: string;
  weaknesses: string;
  bestFor: string[];
  notIdealFor: string[];
  tagline: string;
  fallback?: boolean;
}

interface Props {
  citySlug: string;
  cityName: string;
  locale?: "fr" | "en";
}

export function AISummaryCard({ citySlug, cityName, locale = "fr" }: Props) {
  const t = (fr: string, en: string) => (locale === "en" ? en : fr);
  const [data, setData] = useState<AISummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/cities/${citySlug}/summary`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad response"))))
      .then((d) => {
        if (!d || !Array.isArray(d.bestFor) || !Array.isArray(d.notIdealFor)) {
          setError(true);
        } else {
          setData(d);
        }
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [citySlug]);

  if (loading) {
    return (
      <Card className="border-[var(--accent)]/20">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-[var(--accent)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">{t("Analyse IA", "AI analysis")}</span>
          <Loader2 className="h-3.5 w-3.5 text-[var(--text-secondary)] animate-spin ml-auto" />
        </div>
        <div className="space-y-2">
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-5/6" />
          <div className="skeleton h-3 w-4/6" />
        </div>
      </Card>
    );
  }

  if (error || !data) return null;

  return (
    <Card className="border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent)]/5 to-[var(--bg-surface)]">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)]/15 border border-[var(--accent)]/20">
          <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
        </div>
        <span className="text-sm font-semibold text-[var(--text-primary)]">{t("Analyse IA", "AI analysis")} — {cityName}</span>
        {data.fallback && (
          <Badge variant="subtle" className="ml-auto text-[10px]">{t("Automatique", "Automated")}</Badge>
        )}
      </div>

      {data.tagline && (
        <p className={cn("text-xs font-medium mb-4 mt-1", "text-[var(--accent)]")}>
          &quot;{data.tagline}&quot;
        </p>
      )}

      <div className="space-y-4">
        {/* Strengths */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-600">{t("Points forts", "Strengths")}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{data.strengths}</p>
        </div>

        {/* Weaknesses */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <XCircle className="h-3.5 w-3.5 text-red-500" />
            <span className="text-xs font-semibold text-red-500">{t("Points faibles", "Weaknesses")}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{data.weaknesses}</p>
        </div>

        {/* Best for */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] text-emerald-600 font-medium mb-1.5">{t("Idéal pour", "Ideal for")}</p>
            <div className="space-y-1">
              {data.bestFor.map((p) => (
                <div key={p} className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                  <ChevronRight className="h-2.5 w-2.5 text-emerald-600 flex-shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-red-500 font-medium mb-1.5">{t("Moins adapté", "Less suited for")}</p>
            <div className="space-y-1">
              {data.notIdealFor.map((p) => (
                <div key={p} className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                  <ChevronRight className="h-2.5 w-2.5 text-red-500 flex-shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
