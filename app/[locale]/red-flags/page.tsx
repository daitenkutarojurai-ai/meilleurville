import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Volume2, Droplets, Wind, Shield, Flame, Zap, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Red Flag Radar · Known city risks & public data 2026 | BestCitiesInFrance",
  description:
    "What property listings never tell you: safety, flooding, heat, pollution, seismic risk, cost, and more. Open-data cross-check for all 540 French cities.",
  alternates: { canonical: `${EN_BASE}/red-flags` },
};

type City = (typeof CITIES_SEED)[number];

function axisSeverity(score: number): number {
  if (score < 4.0) return 4;
  if (score < 5.0) return 3;
  if (score < 6.0) return 2;
  if (score < 7.0) return 1;
  return 0;
}

function enVigilance(c: City) {
  const severities = [
    axisSeverity(c.scores.safety),
    axisSeverity(c.scores.cost),
    axisSeverity(c.scores.transport),
    axisSeverity(c.scores.schools),
  ];
  const score = severities.reduce((a, b) => a + b, 0);
  const criticalCount = severities.filter((s) => s >= 3).length;
  const ratio = score / 16;

  if (ratio >= 0.45) return { score, label: "High vigilance", tone: "text-red-600", ring: "border-red-500/40 bg-red-500/5", criticalCount };
  if (ratio >= 0.28) return { score, label: "Moderate vigilance", tone: "text-orange-600", ring: "border-orange-500/30 bg-orange-500/5", criticalCount };
  if (ratio >= 0.14) return { score, label: "Low-moderate", tone: "text-amber-600", ring: "border-amber-500/30 bg-amber-400/5", criticalCount };
  return { score, label: "Low vigilance", tone: "text-emerald-600", ring: "border-emerald-500/30 bg-emerald-500/5", criticalCount };
}

const FLAG_CATEGORIES = [
  {
    id: "noise",
    label: "Noise",
    icon: Volume2,
    color: "text-orange-600",
    bg: "bg-orange-400/10 border-orange-400/20",
    examples: ["Flight path overhead", "Nearby motorway", "Railway line", "Bar / nightclub"],
  },
  {
    id: "flood",
    label: "Flood & water",
    icon: Droplets,
    color: "text-blue-600",
    bg: "bg-blue-400/10 border-blue-400/20",
    examples: ["Flood risk zone", "Recurring basement flooding", "Flooded cellar", "Urban run-off"],
  },
  {
    id: "pollution",
    label: "Pollution",
    icon: Wind,
    color: "text-purple-600",
    bg: "bg-purple-400/10 border-purple-400/20",
    examples: ["High PM2.5", "Nearby industrial zone", "Contaminated site", "Agricultural pesticides"],
  },
  {
    id: "safety",
    label: "Safety",
    icon: Shield,
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-400/20",
    examples: ["Frequent burglaries", "Recurring vandalism", "Known squat", "Poor street lighting"],
  },
  {
    id: "construction",
    label: "Construction & works",
    icon: Flame,
    color: "text-amber-500",
    bg: "bg-amber-400/10 border-yellow-400/20",
    examples: ["Major works ≥ 2 years", "Scheduled demolition", "Planning changes", "Active developer"],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    icon: Zap,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10 border-emerald-400/20",
    examples: ["No fibre broadband", "Power outages", "Degraded water network", "Poor road condition"],
  },
];

function featuredFiches() {
  return [...CITIES_SEED]
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      department: c.department,
      vigilance: enVigilance(c),
    }))
    .sort((a, b) => b.vigilance.score - a.vigilance.score)
    .slice(0, 18);
}

export default function EnRedFlagsIndex() {
  const fiches = featuredFiches();
  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="bg-gradient-to-b from-red-950/20 to-[var(--bg-canvas)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm text-red-500">
            <AlertTriangle className="h-3.5 w-3.5" />
            Red Flag Radar
          </div>
          <h1 className="mb-3 text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
            What the property listing never tells you.
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)] text-lg">
            We cross-reference open data (Géorisques, ATMO, SSMSI, BRGM) with nine risk
            categories per city — safety, flooding, heat, pollution, seismic risk, cost, transport,
            schools, tourism pressure — before you sign anything.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Risk categories", value: "9", color: "text-red-500" },
            { label: "Public sources", value: "6", color: "text-[var(--text-primary)]" },
            { label: "Cities covered", value: CITIES_SEED.length.toString(), color: "text-emerald-600" },
            { label: "Open data", value: "100%", color: "text-[var(--accent)]" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 text-center shadow-sm">
              <div className={`text-2xl font-bold font-mono-data mb-1 ${color}`}>{value}</div>
              <div className="text-xs text-[var(--text-secondary)]">{label}</div>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                Red-flag reports by city
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Nine risk categories cross-referenced with Géorisques, SSMSI, ATMO and BRGM.
                A report is available for all {CITIES_SEED.length} cities — highest-risk first.
              </p>
            </div>
            <Link
              href="/cities"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:underline shrink-0"
            >
              All cities <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fiches.map((f) => (
              <Link
                key={f.slug}
                href={`/red-flags/${f.slug}`}
                className={`group rounded-2xl border ${f.vigilance.ring} hover:border-red-500/50 hover:shadow-md transition-all p-4 flex flex-col gap-2`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-red-500 transition-colors truncate">
                      {f.name}
                    </div>
                    <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5 truncate">
                      {f.department}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-red-500 flex-shrink-0 transition-colors" />
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border)]/50">
                  <span className={`text-xs font-semibold ${f.vigilance.tone}`}>
                    {f.vigilance.label}
                  </span>
                  {f.vigilance.criticalCount > 0 && (
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                      {f.vigilance.criticalCount} critical signal{f.vigilance.criticalCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            All {CITIES_SEED.length} cities have a report: <code className="text-[var(--text-secondary)]">/red-flags/&lt;city-slug&gt;</code>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Risk categories
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            The six signal families tracked across every city report.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FLAG_CATEGORIES.map(({ id, label, icon: Icon, color, bg, examples }) => (
              <div key={id} className={`rounded-2xl border ${bg.split(" ")[1]} ${bg.split(" ")[0]} p-5`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} mb-4`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <h3 className={`font-semibold ${color} mb-2`}>{label}</h3>
                <ul className="space-y-1">
                  {examples.map((ex) => (
                    <li key={ex} className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-[var(--border)] flex-shrink-0" />
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-950/20 via-[var(--bg-surface)] to-[var(--bg-elevated)] p-8 sm:p-10 text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
            Know a problem that isn&apos;t flagged?
          </h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            Help thousands of people avoid a nasty surprise.
            Verified reports (3+ independent users) are published on the city&apos;s report page.
          </p>
          <Link
            href="/contact?topic=red-flag"
            className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 px-6 py-3 font-semibold hover:bg-red-500/20 transition-colors"
          >
            <AlertTriangle className="h-4 w-4" />
            Report an issue
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
