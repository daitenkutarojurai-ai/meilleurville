import type { Metadata } from "next";
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

// « Couleurs » (2026-10-26) : une bande par section, tuiles d'icône en dégradé
// vif (.grad-head-N) par catégorie, comme le hub FR. Le rouge, le vert, l'orange
// et le violet restent réservés aux paliers de score (vigilance des fiches).
const CARD =
  "rounded-2xl bg-[var(--bg-surface)] shadow-[0_10px_30px_-18px_rgba(79,70,229,0.45)] ring-1 ring-[var(--accent)]/10";

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

      <section className="bg-aurora py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 font-mono-data text-xs font-semibold uppercase tracking-widest text-[var(--accent-pink)] shadow-sm ring-1 ring-[var(--accent-pink)]/20">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            Red Flag Radar
          </p>
          <h1 className="mb-4 text-3xl sm:text-5xl font-bold leading-[1.05] tracking-tight text-[var(--text-primary)]">
            What the property listing{" "}
            <span className="font-display italic gradient-text">never tells you.</span>
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)] text-lg">
            We cross-reference open data (Géorisques, ATMO, SSMSI, BRGM) with nine risk
            categories per city — safety, flooding, heat, pollution, seismic risk, cost, transport,
            schools, tourism pressure — before you sign anything.
          </p>
          <ReportCTA variant="inline" locale="en" className="mt-5" kinds={["red-flag", "erreur"]} />
        </div>
      </section>

      <section className="band band-pink py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
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
              className="btn-couleurs hidden sm:inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold shrink-0"
            >
              All cities <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fiches.map((f) => (
              <div key={f.slug} className={CARD}>
              <Link
                href={`/red-flags/${f.slug}`}
                className={`group h-full rounded-2xl border ${f.vigilance.ring} hover:border-[var(--accent-pink)] transition-colors p-4 flex flex-col gap-2`}
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
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border)]">
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
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-4">
            All {CITIES_SEED.length} cities have a report: <code className="text-[var(--text-secondary)]">/red-flags/&lt;city-slug&gt;</code>.
          </p>
        </div>
      </section>

      <section className="band band-sky py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Risk categories", value: "9" },
            { label: "Public sources", value: "6" },
            { label: "Cities covered", value: CITIES_SEED.length.toString() },
            { label: "Open data", value: "100%" },
          ].map(({ label, value }, i) => (
            <div key={label} className={`${CARD} overflow-hidden text-center`}>
              <div className={`grad-head-${i % 6} px-4 py-1.5 font-mono-data text-[10px] font-semibold uppercase tracking-[0.18em]`} aria-hidden="true">
                N° {String(i + 1).padStart(2, "0")}
              </div>
              <div className="px-4 pb-5 pt-4">
                <div className="text-2xl font-bold font-mono-data mb-1 text-[var(--accent)]">{value}</div>
                <div className="text-xs text-[var(--text-secondary)]">{label}</div>
              </div>
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
              <div key={id} className={`${CARD} p-5`}>
                <div className="flex items-center gap-4 mb-3 border-b border-[var(--border)] pb-3">
                  <span
                    className={`grad-head-${i % 6} flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm`}
                    aria-hidden="true"
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <h3 className="min-w-0 flex-1 font-semibold text-[var(--text-primary)]">{label}</h3>
                  <span className="rounded-full bg-[var(--band-sky)] px-2 py-0.5 font-mono-data text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0369A1]" aria-hidden="true">
                    R{i + 1}
                  </span>
                </div>
                <ul className="space-y-1">
                  {examples.map((ex) => (
                    <li key={ex} className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-pink)] flex-shrink-0" />
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* Report CTA — the page's single band-bold block */}
      <section className="band band-bold py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/40" aria-hidden="true">
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
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-[#4338CA] shadow-lg transition-colors hover:bg-[var(--band-pink)] hover:text-[#BE185D]"
          >
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Report an issue
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
