import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "@/components/AppLink";
import { AlertTriangle, Volume2, Droplets, Wind, Shield, Flame, Zap, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { pathAlternatesEn } from "@/lib/i18n";
import { ReportCTA } from "@/components/ReportCTA";

export const metadata: Metadata = {
  title: "Red Flag Radar · City risks 2026 | BestCitiesInFrance",
  description:
    `What property listings never tell you: safety, flooding, heat, pollution, seismic risk, cost, and more. Open-data cross-check for all ${CITIES_SEED.length} French cities.`,
  alternates: pathAlternatesEn("/red-flags", "/red-flags"),
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

// Carte & plaque (CLAUDE.md) : chaque famille de red flag est un symbole de
// légende hachuré brique, comme sur la RedFlagTeaser de la home. Le rouge, le
// vert, l'orange et le violet restent réservés aux paliers de score.
const HATCH: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(135deg, color-mix(in srgb, var(--accent-pink) 16%, transparent) 0 2px, transparent 2px 6px)",
};

const FLAG_CATEGORIES = [
  {
    id: "noise",
    label: "Noise",
    icon: Volume2,
    examples: ["Flight path overhead", "Nearby motorway", "Railway line", "Bar / nightclub"],
  },
  {
    id: "flood",
    label: "Flood & water",
    icon: Droplets,
    examples: ["Flood risk zone", "Recurring basement flooding", "Flooded cellar", "Urban run-off"],
  },
  {
    id: "pollution",
    label: "Pollution",
    icon: Wind,
    examples: ["High PM2.5", "Nearby industrial zone", "Contaminated site", "Agricultural pesticides"],
  },
  {
    id: "safety",
    label: "Safety",
    icon: Shield,
    examples: ["Frequent burglaries", "Recurring vandalism", "Known squat", "Poor street lighting"],
  },
  {
    id: "construction",
    label: "Construction & works",
    icon: Flame,
    examples: ["Major works ≥ 2 years", "Scheduled demolition", "Planning changes", "Active developer"],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    icon: Zap,
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

      <section className="topo-bg border-b border-[var(--border)] bg-[var(--bg-canvas)]">
        {/* Voile papier : le relief reste lisible sans traverser le texte. */}
        <div className="bg-[var(--bg-canvas)]/80 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="mb-4 inline-flex items-center gap-2 border-b border-[var(--accent-pink)]/40 pb-1 font-mono-data text-xs font-semibold uppercase tracking-widest text-[var(--accent-pink)]">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            Red Flag Radar
          </p>
          <h1 className="mb-4 text-3xl sm:text-5xl font-bold leading-[1.05] tracking-tight text-[var(--text-primary)]">
            What the property listing{" "}
            <span className="font-display italic text-[var(--accent-pink)]">never tells you.</span>
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)] text-lg">
            We cross-reference open data (Géorisques, ATMO, SSMSI, BRGM) with nine risk
            categories per city — safety, flooding, heat, pollution, seismic risk, cost, transport,
            schools, tourism pressure — before you sign anything.
          </p>
          <ReportCTA variant="inline" locale="en" className="mt-5" kinds={["red-flag", "erreur"]} />
        </div>
      </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-14">
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
                className={`group rounded-md border ${f.vigilance.ring} hover:border-[var(--accent-pink)] transition-colors p-4 flex flex-col gap-2`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-pink)] transition-colors truncate">
                      {f.name}
                    </div>
                    <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5 truncate">
                      {f.department}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent-pink)] flex-shrink-0 transition-colors" />
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-dashed border-[var(--border)]">
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-md border border-[var(--text-primary)]/15 bg-[var(--text-primary)]/15">
          {[
            { label: "Risk categories", value: "9" },
            { label: "Public sources", value: "6" },
            { label: "Cities covered", value: CITIES_SEED.length.toString() },
            { label: "Open data", value: "100%" },
          ].map(({ label, value }, i) => (
            <div key={label} className="bg-[var(--bg-surface)] px-4 py-5 text-center">
              <div className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--text-tertiary)] mb-2" aria-hidden="true">
                N° {String(i + 1).padStart(2, "0")}
              </div>
              <div className="text-2xl font-bold font-mono-data mb-1 text-[var(--accent)]">{value}</div>
              <div className="text-xs text-[var(--text-secondary)]">{label}</div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Risk categories
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            The six signal families tracked across every city report.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FLAG_CATEGORIES.map(({ id, label, icon: Icon, examples }, i) => (
              <div key={id} className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                <div className="flex items-center gap-4 mb-3 border-b border-[var(--text-primary)]/15 pb-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-2 border-[var(--accent-pink)] bg-[var(--bg-surface)] text-[var(--accent-pink)]"
                    style={HATCH}
                    aria-hidden="true"
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <h3 className="min-w-0 flex-1 font-semibold text-[var(--text-primary)]">{label}</h3>
                  <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]" aria-hidden="true">
                    R{i + 1}
                  </span>
                </div>
                <ul className="space-y-1">
                  {examples.map((ex) => (
                    <li key={ex} className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                      <span className="h-px w-2 bg-[var(--accent-pink)] flex-shrink-0" />
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="topo-bg rounded-md border border-[var(--border)] bg-[var(--bg-canvas)] p-1.5">
        <div className="rounded border border-[var(--text-primary)]/15 bg-[var(--bg-surface)]/90 p-8 sm:p-10 text-center">
          <span className="plaque plaque-small mx-auto mb-4 flex h-12 w-12 items-center justify-center" aria-hidden="true">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
            Know a problem that isn&apos;t flagged?
          </h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            Help thousands of people avoid a nasty surprise.
            Verified reports (3+ independent users) are published on the city&apos;s report page.
          </p>
          <Link
            href="/contact?topic=red-flag"
            className="inline-flex items-center gap-2 rounded-sm border-2 border-[var(--accent-pink)] bg-[var(--bg-surface)] px-6 py-3 font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--accent-pink)] hover:text-white"
          >
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Report an issue
          </Link>
        </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
