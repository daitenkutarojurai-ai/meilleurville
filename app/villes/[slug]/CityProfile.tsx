"use client";
import { useState } from "react";
import Link from "next/link";
import { MapPin, Star, Sun, Thermometer, Users, TrendingUp, Home, Laptop, GraduationCap, Shield, Bus, TreePine, ChevronRight, ChevronDown, Check, X, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { CityDiscussionTabs } from "@/components/CityDiscussionTabs";
import { AlerteForm } from "@/components/AlerteForm";
import { FavoriteButton } from "@/components/effects/FavoriteButton";
import { FollowCityButton } from "@/components/FollowCityButton";
import { GrainOverlay } from "@/components/effects/GrainOverlay";
import { AISummaryCard } from "@/components/AISummaryCard";
import { UserVsOfficialScore } from "@/components/UserVsOfficialScore";
import { SimilarCities } from "@/components/SimilarCities";
import { OwnerScoresCard } from "@/components/OwnerScoresCard";
import { UserScoresCard } from "@/components/UserScoresCard";
import { CityReviewModal } from "@/components/CityReviewModal";
import { HonestReviewCard } from "@/components/HonestReviewCard";
import { DistancesCard } from "@/components/DistancesCard";
import { RentVsBuyCard } from "@/components/RentVsBuyCard";
import { GeographicNeighborsCard } from "@/components/GeographicNeighborsCard";
import { Climate2040Card } from "@/components/Climate2040Card";
import { PoliticalLean } from "@/components/PoliticalLean";
import { NaturalRisksCard } from "@/components/NaturalRisksCard";
import { WaterStressCard } from "@/components/WaterStressCard";
import { AirQualityCard } from "@/components/AirQualityCard";
import { NoiseCard } from "@/components/NoiseCard";
import { HealthcareCard } from "@/components/HealthcareCard";
import { EmploymentCard } from "@/components/EmploymentCard";
import { CyclingCard } from "@/components/CyclingCard";
import { SportLeisureCard } from "@/components/SportLeisureCard";
import { SafetyDeepCard } from "@/components/SafetyDeepCard";
import { DemographyCard } from "@/components/DemographyCard";
import { PublicServicesCard } from "@/components/PublicServicesCard";
import { QolHeroBadge } from "@/components/QolHeroBadge";
import { CityFingerprint } from "@/components/CityFingerprint";
import { VibeWidget } from "@/components/VibeWidget";
import { getNeighborhoods } from "@/data/neighborhoods";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { buildCityNarrative } from "@/lib/city-narrative";
import { computeNicheScores, TERRAIN_LABELS } from "@/lib/niche-scores";
import { RANKING_META, getRankedCities } from "@/lib/rankings";
import { formatNumber, formatScore, scoreColor, cn, sunshineDays, sunshineHours } from "@/lib/utils";
import { internetScore, internetLabel } from "@/lib/internet-score";
import { rentalTension, tensionInfo } from "@/lib/rental-tension";
import type { CitySeed } from "@/data/cities-seed";
import type { RankingSlug } from "@/lib/rankings";

const SCORE_LABELS: Array<{ key: keyof CitySeed["scores"]; label: string; icon: React.ElementType }> = [
  { key: "life", label: "Qualité de vie", icon: Star },
  { key: "transport", label: "Transport", icon: Bus },
  { key: "nature", label: "Nature", icon: TreePine },
  { key: "cost", label: "Coût de la vie", icon: TrendingUp },
  { key: "safety", label: "Sécurité", icon: Shield },
  { key: "culture", label: "Culture", icon: Star },
  { key: "remoteWork", label: "Télétravail", icon: Laptop },
  { key: "schools", label: "Écoles", icon: GraduationCap },
];

const LIFE_STAGES = [
  { id: "famille", label: "Famille", icon: Home, keys: ["safety", "schools", "nature", "cost"] },
  { id: "remote", label: "Remote", icon: Laptop, keys: ["remoteWork", "transport", "cost", "culture"] },
  { id: "retraite", label: "Retraite", icon: Sun, keys: ["nature", "safety", "cost", "life"] },
  { id: "etudiant", label: "Étudiant", icon: GraduationCap, keys: ["culture", "transport", "cost", "life"] },
];

// Editorial section rule — uppercase eyebrow + fading divider. Replaces the
// flat "wall of cards" look with grouped, scannable sections.
function SectionRule({ emoji, label, first }: { emoji: string; label: string; first?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 mb-4", first ? "mt-0" : "mt-10")}>
      <span className="text-base" aria-hidden>{emoji}</span>
      <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-secondary)] whitespace-nowrap">
        {label}
      </h3>
      <span className="h-px flex-1 bg-gradient-to-r from-[var(--border)] to-transparent" />
    </div>
  );
}

export function CityProfile({ city, locale = "fr" }: { city: CitySeed & { reviewCount?: number }; locale?: "fr" | "en" }) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const sub = (fr: string, en: string) => `/${locale === "en" ? "cities" : "villes"}/${city.slug}/${locale === "en" ? en : fr}`;
  const [activeStage, setActiveStage] = useState("famille");
  const neighborhoods = getNeighborhoods(city.slug);
  const housing = getHousing(city.slug);
  const [activeTab, setActiveTab] = useState("overview");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  // Force a remount of UserScoresCard after a new review is posted so the
  // aggregate refreshes (uses key bump rather than a context store).
  const [reviewBumpKey, setReviewBumpKey] = useState(0);

  const stage = LIFE_STAGES.find((s) => s.id === activeStage)!;
  const narrative = buildCityNarrative(city, housing, locale);
  const niche = computeNicheScores(city);

  const STAGE_LABELS: Record<string, string> = locale === "en"
    ? { famille: "Family", remote: "Remote", retraite: "Retirement", etudiant: "Student" }
    : { famille: "Famille", remote: "Remote", retraite: "Retraite", etudiant: "Étudiant" };

  const SCORE_AXIS_LABELS: Record<keyof CitySeed["scores"], string> = locale === "en"
    ? { global: "Overall", life: "Quality of life", transport: "Transport", nature: "Nature", cost: "Cost of living", safety: "Safety", culture: "Culture", remoteWork: "Remote work", schools: "Schools" }
    : { global: "Score global", life: "Qualité de vie", transport: "Transport", nature: "Nature", cost: "Coût de la vie", safety: "Sécurité", culture: "Culture", remoteWork: "Télétravail", schools: "Écoles" };

  const TERRAIN_LABELS_LOCALE: Record<string, string> = locale === "en"
    ? { mer: "🌊 Sea / coast", montagne: "⛰️ Mountains", plaine: "🌾 Plains", vallee: "🍇 Valley" }
    : TERRAIN_LABELS;

  const TABS = [
    { id: "overview", label: L("Vue d'ensemble", "Overview") },
    { id: "scores", label: L("Scores détaillés", "Detailed scores") },
    { id: "reviews", label: L("Avis", "Reviews") },
    { id: "data", label: L("Données", "Data") },
  ];

  return (
    <div>
      {/* Hero — premium */}
      <section className="relative overflow-hidden pt-10 pb-14 sm:pt-14 sm:pb-16">
        {/* Aurora + grain */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-aurora opacity-50" />
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[var(--accent)]/12 blur-[120px] animate-drift" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[var(--accent-warm)]/12 blur-[100px] animate-drift" style={{ animationDelay: "2s" }} />
        </div>
        <GrainOverlay opacity={0.18} blend="overlay" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <nav
            aria-label={L("Fil d'Ariane", "Breadcrumb")}
            className="flex flex-wrap items-center gap-2 text-sm text-[var(--text-secondary)] mb-4"
          >
            <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">{L("Accueil", "Home")}</Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <Link href={locale === "en" ? "/cities" : "/villes"} className="hover:text-[var(--text-primary)] transition-colors">{L("Villes", "Cities")}</Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <Link
              href={`/${locale === "en" ? "regions" : "regions"}/${city.region.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              {city.region}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <Link
              href={`/${locale === "en" ? "departments" : "departements"}/${city.department.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              {city.department}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <span className="text-[var(--text-primary)]" aria-current="page">{city.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {city.characterTags.map((tag) => (
                  <Badge key={tag} variant="subtle" className="capitalize">
                    {tag}
                  </Badge>
                ))}
                <FavoriteButton slug={city.slug} className="!ml-1" label />
                <FollowCityButton citySlug={city.slug} cityName={city.name} />
              </div>
              <h1 className="text-5xl sm:text-7xl font-bold text-[var(--text-primary)] mb-3 tracking-tight leading-[1.02]">
                <span className="font-display gradient-text-anim italic">{city.name}</span>
              </h1>
              <p className="text-[var(--text-secondary)] text-lg">
                <MapPin className="inline h-4 w-4 mr-1 text-[var(--accent)]" />
                {city.department} · {city.region}
                {city.population && ` · ${formatNumber(city.population)} hab.`}
              </p>
            </div>

            {/* Global score — glass card */}
            <div className="relative rounded-3xl border border-white/60 glass-strong p-6 text-center min-w-[180px] shadow-2xl shadow-[var(--accent)]/10">
              <div className="absolute -top-1 left-4 right-4 h-2 rounded-b-full bg-gradient-to-r from-[var(--accent)] via-emerald-400 to-lime-400 opacity-80" aria-hidden />
              <div className={`text-6xl font-bold font-mono-data mb-1 ${scoreColor(city.scores.global)}`}>
                {formatScore(city.scores.global)}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)] mb-2 font-semibold">{L("Score global / 10", "Overall score / 10")}</div>
              {/* No review count here — the old "{n} avis" was synthesized
                  (180 + score×30), violating the no-fake-figures rule. */}
              <div className="flex items-center justify-center gap-1 text-sm text-[var(--text-secondary)]">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                <span>{L("8 axes notés", "8 scored axes")}</span>
              </div>
            </div>
          </div>

          {/* Quick stats — glass tiles with gradient icons */}
          <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {city.sunshinedays && (
              <div className="group rounded-2xl glass border border-white/50 p-4 hover:shadow-lg transition-shadow">
                <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-orange-400 shadow-md ring-1 ring-white/40 group-hover:scale-110 transition-transform">
                  <Sun className="h-4 w-4 text-white" />
                </div>
                <div className="text-2xl font-bold font-mono-data text-[var(--text-primary)]">
                  {sunshineDays(city.sunshinedays)}<span className="text-base text-[var(--text-tertiary)]"> j</span>
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  {L("de soleil / an", "of sun / year")}
                  <span className="block text-[10px] text-[var(--text-tertiary)] font-mono-data">
                    ({sunshineHours(city.sunshinedays)})
                  </span>
                </div>
              </div>
            )}
            {city.avgTempJuly && (
              <div className="group rounded-2xl glass border border-white/50 p-4 hover:shadow-lg transition-shadow">
                <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-300 to-orange-400 shadow-md ring-1 ring-white/40 group-hover:scale-110 transition-transform">
                  <Thermometer className="h-4 w-4 text-white" />
                </div>
                <div className="text-2xl font-bold font-mono-data text-[var(--text-primary)]">
                  {city.avgTempJuly}<span className="text-base text-[var(--text-tertiary)]">°C</span>
                </div>
                <div className="text-xs text-[var(--text-secondary)]">{L("temp. juillet", "July temp.")}</div>
              </div>
            )}
            {city.avgTempJanuary && (
              <div className="group rounded-2xl glass border border-white/50 p-4 hover:shadow-lg transition-shadow">
                <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-300 to-cyan-400 shadow-md ring-1 ring-white/40 group-hover:scale-110 transition-transform">
                  <Thermometer className="h-4 w-4 text-white" />
                </div>
                <div className="text-2xl font-bold font-mono-data text-[var(--text-primary)]">
                  {city.avgTempJanuary}<span className="text-base text-[var(--text-tertiary)]">°C</span>
                </div>
                <div className="text-xs text-[var(--text-secondary)]">{L("temp. janvier", "January temp.")}</div>
              </div>
            )}
            {city.elevation && (
              <div className="group rounded-2xl glass border border-white/50 p-4 hover:shadow-lg transition-shadow">
                <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-lime-400 shadow-md ring-1 ring-white/40 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div className="text-2xl font-bold font-mono-data text-[var(--text-primary)]">
                  {city.elevation}<span className="text-base text-[var(--text-tertiary)]">m</span>
                </div>
                <div className="text-xs text-[var(--text-secondary)]">{L("altitude", "elevation")}</div>
              </div>
            )}
          </div>

          {/* F56 — Cadre de Vie badge */}
          <QolHeroBadge city={city} locale={locale} />
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-14 z-40 border-b border-[var(--border)] bg-[var(--bg-canvas)]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div
            role="tablist"
            aria-label={L(`Sections du profil de ${city.name}`, `${city.name} profile sections`)}
            className="flex gap-0 overflow-x-auto"
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              const idx = TABS.findIndex((t) => t.id === activeTab);
              const next = e.key === "ArrowRight"
                ? (idx + 1) % TABS.length
                : (idx - 1 + TABS.length) % TABS.length;
              setActiveTab(TABS[next].id);
              const el = document.getElementById(`city-tab-${TABS[next].id}`);
              el?.focus();
            }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                id={`city-tab-${tab.id}`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`city-panel-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "whitespace-nowrap px-5 py-4 text-sm font-medium border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)]",
                  activeTab === tab.id
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        {activeTab === "overview" && (
          <div
            id="city-panel-overview"
            role="tabpanel"
            aria-labelledby="city-tab-overview"
            className="grid gap-6 lg:grid-cols-3">
            {/* Scores */}
            <div className="lg:col-span-2 space-y-6">
              {/* Summary — intro + pros/cons + notable */}
              <Card className="card-sheen">
                <div className="mb-6 rounded-2xl border-l-[3px] border-[var(--accent)] bg-gradient-to-br from-[var(--accent)]/[0.06] via-transparent to-[var(--accent-warm)]/[0.04] py-4 pl-5 pr-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent)] mb-2.5">
                    {L("Le verdict", "The verdict")} · {city.name}
                  </p>
                  <p className="lead-paragraph drop-cap">
                    {narrative.intro}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 mb-5">
                  <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-700 mb-3">
                      <Check className="h-4 w-4" />
                      {L("Ce qu'on aime", "What we like")}
                    </h3>
                    <ul className="space-y-2">
                      {narrative.pros.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
                          <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="leading-snug">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-rose-200/70 bg-rose-50/60 p-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-rose-700 mb-3">
                      <X className="h-4 w-4" />
                      {L("Les points faibles", "The weak spots")}
                    </h3>
                    <ul className="space-y-2">
                      {narrative.cons.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
                          <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                          <span className="leading-snug">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--border)] bg-gradient-to-br from-[var(--bg-elevated)]/70 to-[var(--bg-elevated)]/30 ring-1 ring-black/[0.03] p-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-3">
                    <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                    {L("À savoir", "Good to know")}
                  </h3>
                  <ul className="space-y-2">
                    {narrative.notable.map((n, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                        <span className="leading-snug">{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              {/* Featured — political orientation, surfaced prominently (full
                  main-column width + accent frame) rather than buried in the grid. */}
              <div className="rounded-3xl bg-gradient-to-br from-[var(--accent)]/[0.07] via-transparent to-[var(--accent-warm)]/[0.05] ring-1 ring-[var(--accent)]/15 p-1.5 shadow-sm">
                <PoliticalLean slug={city.slug} cityName={city.name} locale={locale} />
              </div>

              {/* Niche scores — pour qui cette ville est-elle faite ? */}
              <Card>
                <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                  {L(`Pour qui ${city.name} est-elle faite ?`, `Who is ${city.name} right for?`)}
                </h2>
                <p className="text-xs text-[var(--text-tertiary)] mb-4">
                  {L("Scores dérivés des indicateurs officiels. Plus le score est haut, plus le profil colle.", "Scores derived from official indicators. The higher the score, the better the fit.")}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: L("🌍 Expats", "🌍 Expats"), val: niche.expat, hint: L("Ouverture internationale, transport, services anglophones", "International openness, transport, English-speaking services") },
                    { label: L("💻 Télétravail", "💻 Remote work"), val: niche.remote, hint: L("Fibre, coworkings, art de vivre", "Fibre internet, coworking spaces, lifestyle") },
                    { label: L("🐶 Animaux", "🐶 Pets"), val: niche.petFriendly, hint: L("Espaces verts, calme, vétérinaires", "Green spaces, quiet, vets") },
                    { label: L("🌿 Retraite", "🌿 Retirement"), val: niche.retirement, hint: L("Sécurité, santé, climat doux, calme", "Safety, healthcare, mild climate, quiet") },
                    { label: L("🎓 Étudiant", "🎓 Students"), val: niche.studentLife, hint: L("Universités, vie nocturne, loyers", "Universities, nightlife, rents") },
                  ].map((n) => {
                    const color =
                      n.val >= 7.5 ? "from-purple-500 to-violet-400"
                      : n.val >= 7.0 ? "from-green-500 to-lime-400"
                      : n.val >= 6.0 ? "from-lime-400 to-amber-300"
                      : n.val >= 5.0 ? "from-amber-400 to-orange-300"
                      : n.val >= 4.0 ? "from-orange-400 to-red-400"
                      : "from-red-500 to-rose-400";
                    const txt =
                      n.val >= 7.5 ? "text-purple-500"
                      : n.val >= 7.0 ? "text-green-500"
                      : n.val >= 6.0 ? "text-lime-500"
                      : n.val >= 5.0 ? "text-amber-400"
                      : n.val >= 4.0 ? "text-orange-500"
                      : "text-red-500";
                    return (
                      <div
                        key={n.label}
                        title={n.hint}
                        className="rounded-xl border border-[var(--border)] bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-elevated)]/40 ring-1 ring-black/[0.03] p-3 transition-shadow hover:shadow-md"
                      >
                        <div className="flex items-baseline justify-between mb-1.5">
                          <span className="text-xs font-semibold text-[var(--text-secondary)]">{n.label}</span>
                          <span className={`text-base font-bold font-mono-data ${txt}`}>{n.val.toFixed(1)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${color}`}
                            style={{ width: `${(n.val / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="rounded-xl border border-[var(--border)] bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-elevated)]/40 ring-1 ring-black/[0.03] p-3 flex flex-col justify-center transition-shadow hover:shadow-md">
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold mb-1">
                      {L("Terrain", "Terrain")}
                    </div>
                    <div className="text-sm font-bold text-[var(--text-primary)]">
                      {TERRAIN_LABELS_LOCALE[niche.terrain]}
                    </div>
                  </div>
                </div>
              </Card>

              {/* F3 — Profils propriétaires (10 scores avec source) */}
              <OwnerScoresCard city={city} locale={locale} />

              {/* Vue selon profil de vie */}
              <Card>
                <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                  {L("Cette ville selon votre profil", "This city for your profile")}
                </h2>
                <p className="text-xs text-[var(--text-tertiary)] mb-4">
                  {L("Choisissez un profil de vie : on n'affiche que les 4 axes qui pèsent vraiment pour cette étape.", "Pick a life stage: we only show the 4 axes that actually matter at that point.")}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {LIFE_STAGES.map((ls) => {
                    const Icon = ls.icon;
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
                        <Icon className="h-4 w-4" />
                        {STAGE_LABELS[ls.id]}
                      </button>
                    );
                  })}
                </div>
                <div className="space-y-3">
                  {stage.keys.map((key) => {
                    const meta = SCORE_LABELS.find((s) => s.key === key);
                    const score = city.scores[key as keyof typeof city.scores];
                    if (!meta) return null;
                    return (
                      <ScoreBar
                        key={key}
                        label={SCORE_AXIS_LABELS[key as keyof CitySeed["scores"]]}
                        score={score}
                      />
                    );
                  })}
                </div>
              </Card>

              {/* F27 — Honest Review (algorithmic synthesis) */}
              <HonestReviewCard city={city} locale={locale} />

              {/* Témoignages — pointer to the now-adjacent CommentSection */}
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">
                    {L("Témoignages d'habitants", "Resident testimonials")}
                  </h2>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-3 leading-relaxed">
                  {L("Les retours de la communauté sont juste après les onglets : note globale et ressenti par catégorie. Lisez ou partagez en quelques secondes.", "Community feedback sits right below the tabs: overall rating and category-by-category sentiment. Read it or add yours in seconds.")}
                </p>
                <a
                  href="#discussions"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:underline"
                >
                  {L("Lire et participer →", "Read and join in →")}
                </a>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <VibeWidget city={city} locale={locale} />
              <UserScoresCard
                key={reviewBumpKey}
                citySlug={city.slug}
                cityName={city.name}
                onOpenReview={() => setReviewOpen(true)}
                locale={locale}
              />
              <UserVsOfficialScore
                topic={`city:${city.slug}`}
                officialGlobal={city.scores.global}
                cityName={city.name}
                locale={locale}
              />
              <AISummaryCard citySlug={city.slug} cityName={city.name} locale={locale} />
              {/* All scores mini */}
              <Card>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
                  {L("Tous les scores", "All scores")}
                </h3>
                <div className="space-y-2.5">
                  {SCORE_LABELS.map(({ key }) => {
                    const score = city.scores[key];
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-xs text-[var(--text-secondary)]">{SCORE_AXIS_LABELS[key]}</span>
                        <span className={`text-sm font-bold font-mono-data ${scoreColor(score)}`}>
                          {formatScore(score)}
                        </span>
                      </div>
                    );
                  })}
                  <div className="border-t border-[var(--border)] pt-2.5 space-y-2.5">
                    {(() => {
                      const inet = internetScore(city);
                      const iLabel = internetLabel(inet);
                      const tension = rentalTension(city);
                      const tLabel = tensionInfo(tension);
                      return (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[var(--text-secondary)]">
                              {L("Qualité internet", "Internet quality")}
                            </span>
                            <span className={`text-sm font-bold font-mono-data ${iLabel.color}`} title={iLabel.label}>
                              {inet.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[var(--text-secondary)]">
                              {L("Tension locative", "Rental pressure")}
                            </span>
                            <span className={`text-xs font-semibold ${tLabel.color}`} title={tLabel.label}>
                              {tLabel.shortLabel}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-3 leading-relaxed">
                  {L("Internet : estimation ARCEP couverture fibre 2024 par région. Tension locative : dérivée des loyers Clameur / Observatoire des loyers.", "Internet: ARCEP 2024 regional fibre-coverage estimate. Rental pressure: derived from Clameur / rent observatory data.")}
                </p>
              </Card>

              {/* Housing summary */}
              {housing && (
                <Card>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Home className="h-4 w-4 text-[var(--text-secondary)]" />
                    {L("Loyers & Immobilier", "Rent & property")}
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      { label: L("T1 / mois", "Studio / mo"), value: `${housing.avgRentT1} €` },
                      { label: L("T2 / mois", "1-bed / mo"), value: `${housing.avgRentT2} €` },
                      { label: L("T3 / mois", "2-bed / mo"), value: `${housing.avgRentT3} €` },
                      { label: L("Achat / m²", "Buy / m²"), value: `${housing.avgBuyPriceM2.toLocaleString(locale === "en" ? "en-GB" : "fr-FR")} €` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-xs text-[var(--text-secondary)]">{label}</span>
                        <span className="text-sm font-bold font-mono-data text-[var(--text-primary)]">{value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] mt-3">{L("Médiane indicative · DVF 2024", "Indicative median · DVF 2024")}</p>
                </Card>
              )}

              {/* CTA — partager son expérience via la discussion */}
              <Card className="border-[var(--accent)]/20 bg-[var(--accent)]/5">
                <div className="text-center">
                  <Users className="h-8 w-8 text-[var(--accent)] mx-auto mb-3" />
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                    {L(`Vous habitez ${city.name} ?`, `Do you live in ${city.name}?`)}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mb-4">
                    {L(`Notez ${city.name} en 8 catégories et partagez votre ressenti : vos notes alimentent la note communauté affichée en haut de cette page.`, `Rate ${city.name} across 8 categories and share what it's really like — your ratings feed the community score shown at the top of this page.`)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setReviewOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    {L("Noter cette ville →", "Rate this city →")}
                  </button>
                </div>
              </Card>
            </div>

            {/* Données & analyse — full-width grid below the two columns.
                Data-rich cards (distances, rent-vs-buy, voisinage, climat 2040,
                classements thématiques, similar cities) used to live in the
                right rail and stretched it past the main column height, leaving
                an empty middle band on scroll. Now displayed as a balanced grid
                so the page reads as one block on desktop and stacks cleanly
                on mobile. */}
            <div className="lg:col-span-3">
              <h2 className="font-display text-2xl text-[var(--text-primary)] mb-1">
                {L("Données", "Data")} &amp; {L("analyse", "analysis")}
              </h2>
              <p className="text-sm text-[var(--text-tertiary)] mb-6">
                {L(`Tout ${city.name}, regroupé par thème — sources officielles, sans bullshit.`, `Everything about ${city.name}, grouped by theme — official sources, no fluff.`)}
              </p>

              <SectionRule emoji="🛡️" label={L("Sécurité & société", "Safety & society")} first />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <SafetyDeepCard city={city} locale={locale} />
                <DemographyCard city={city} locale={locale} />
                <HealthcareCard city={city} locale={locale} />
                <PublicServicesCard city={city} locale={locale} />
              </div>

              <SectionRule emoji="🏡" label={L("Logement, coût & emploi", "Housing, cost & jobs")} />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <RentVsBuyCard citySlug={city.slug} locale={locale} />
                <EmploymentCard city={city} locale={locale} />
              </div>

              <SectionRule emoji="🌍" label={L("Climat & environnement", "Climate & environment")} />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Climate2040Card city={city} locale={locale} />
                <NaturalRisksCard city={city} locale={locale} />
                <WaterStressCard city={city} locale={locale} />
                <AirQualityCard city={city} locale={locale} />
                <NoiseCard city={city} locale={locale} />
                <CyclingCard city={city} locale={locale} />
                {locale !== "en" && <SportLeisureCard city={city} locale={locale} />}
              </div>

              <SectionRule emoji="🧭" label={L("Repères & classements", "Benchmarks & rankings")} />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <DistancesCard city={city} locale={locale} />
                <GeographicNeighborsCard citySlug={city.slug} cityName={city.name} locale={locale} />
                <Card>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[var(--text-secondary)]" />
                    {L("Classements thématiques", "Themed rankings")}
                  </h3>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    {(Object.keys(RANKING_META) as RankingSlug[]).map((slug) => {
                      const meta = RANKING_META[slug];
                      const ranked = getRankedCities(slug);
                      const entry = ranked.find((e) => e.city.slug === city.slug);
                      if (!entry) return null;
                      return (
                        <Link
                          key={slug}
                          href={`/${locale === "en" ? "rankings" : "classements"}/${slug}`}
                          className="flex items-center justify-between gap-2 hover:bg-[var(--bg-elevated)] rounded-md px-1.5 py-1 -mx-1.5 transition-colors group min-w-0"
                        >
                          <span className="text-[11px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 min-w-0">
                            <span aria-hidden>{meta.emoji}</span>
                            <span className="truncate">{meta.label}</span>
                          </span>
                          <span className={`text-[11px] font-bold font-mono-data shrink-0 ${meta.color}`}>
                            #{entry.rank}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                  <Link
                    href={locale === "en" ? "/rankings" : "/classements"}
                    className="mt-3 block text-xs text-[var(--accent)] hover:underline"
                  >
                    {L("Voir tous les classements →", "See all rankings →")}
                  </Link>
                </Card>
                <Card>
                  <SimilarCities city={city} locale={locale} />
                </Card>
              </div>
            </div>

            {/* Sub-pages strip — full-width below the two columns. Was in the
                right rail but inflated it past main column height, leaving an
                empty middle band on scroll. Now displayed prominently for
                discovery + better balance. */}
            <div className="lg:col-span-3">
              <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">
                {L(`Explorer ${city.name} en détail`, `Explore ${city.name} in detail`)}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <a
                  href={sub("quartiers", "neighbourhoods")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("🏘️ Quartiers", "🏘️ Neighbourhoods")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {neighborhoods.length > 0 ? L(`${neighborhoods.length} quartiers analysés`, `${neighborhoods.length} neighbourhoods analysed`) : L("Sécurité, loyers, ambiance", "Safety, rents, atmosphere")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("climat", "climate")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("☀️ Climat", "☀️ Climate")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {city.sunshinedays ? L(`${sunshineDays(city.sunshinedays)} j soleil · ${city.avgTempJuly ?? "—"}/${city.avgTempJanuary ?? "—"} °C`, `${sunshineDays(city.sunshinedays)} sunny days · ${city.avgTempJuly ?? "—"}/${city.avgTempJanuary ?? "—"} °C`) : L("Températures, ensoleillement", "Temperatures, sunshine")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("transports", "transport")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("🚊 Transports", "🚊 Transport")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Métro, tram, TGV, vélo", "Metro, tram, high-speed rail, bike")} · {city.scores.transport.toFixed(1)}/10
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("ecoles", "schools")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("🎓 Écoles", "🎓 Schools")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Université, CPGE", "Universities, prep schools")} · {city.scores.schools.toFixed(1)}/10
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("fiscalite", "tax")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("💰 Fiscalité", "💰 Local taxes")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Taxe foncière, THRS, DMTO", "Property tax, second-home tax, transfer duties")} · {city.department}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("saisons", "seasons")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("🌸 Saisons", "🌸 Seasons")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Printemps · été · automne · hiver", "Spring · summer · autumn · winter")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("teletravail", "remote-work")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("💻 Télétravail", "💻 Remote work")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Fibre, coworking, profil idéal", "Fibre, coworking, ideal profile")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("cout-de-la-vie", "cost-of-living")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("🪙 Coût de la vie", "🪙 Cost of living")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Loyers, achat, budget mensuel réaliste", "Rents, purchase, realistic monthly budget")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={locale === "en" ? `/household-cost/${city.slug}` : `/cout-menage/${city.slug}`}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("🏠 Coût ménage", "🏠 Household cost")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Solo · couple · famille · retraité", "Single · couple · family · retiree")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("risques", "natural-risks")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("⚠️ Risques naturels", "⚠️ Natural risks")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Inondation · sismicité · argile · feux", "Flooding · seismicity · clay soil · wildfire")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("eau", "water")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("💧 Stress hydrique", "💧 Water stress")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Sécheresse · nappes · restrictions", "Drought · groundwater · restrictions")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("air", "air-quality")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {locale === "en" ? "🌬️ Air quality" : <>🌬️ Qualité de l&apos;air</>}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("NO2 · particules · ozone · pollens", "NO2 · particulates · ozone · pollen")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("bruit", "noise")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("🔊 Bruit", "🔊 Noise")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Routier · aérien · ferroviaire · nocturne", "Road · air · rail · night-time")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("sante", "healthcare")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("🩺 Accès aux soins", "🩺 Healthcare access")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Médecins · spécialistes · urgences", "GPs · specialists · A&E")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("emploi", "employment")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("💼 Marché du travail", "💼 Job market")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Chômage · dynamisme · salaires", "Unemployment · momentum · pay")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("velo", "cycling")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("🚲 Vélo", "🚲 Cycling")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Réseau · relief · sécurité · climat", "Network · terrain · safety · climate")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("securite", "safety")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("🛡️ Sécurité", "🛡️ Safety")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Biens · personnes · nuit · VFFS", "Property · persons · night · domestic violence")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("demographie", "demographics")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("👥 Démographie", "👥 Demographics")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Vieillis. · jeunes · trajectoire · renouv.", "Ageing · youth · trajectory · renewal")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("services-publics", "public-services")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("🏛️ Services publics", "🏛️ Public services")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Écoles · médiath. · Poste · mairie", "Schools · libraries · post office · town hall")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("a-faire", "things-to-do")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("🎯 Que faire ici ?", "🎯 Things to do here")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Activités, sorties, bons plans 2026", "Activities, days out, local tips 2026")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("sport", "sports-leisure")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("🏋️ Sport & loisirs", "🏋️ Sport & leisure")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Équipements · outdoor · clubs · climat", "Facilities · outdoor · clubs · climate")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("avis-honnete", "honest-review")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("🧭 Avis honnête", "🧭 Honest review")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Synthèse algorithmique — pour qui, contre qui", "Algorithmic synthesis — who it fits, who it doesn't")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("louer-ou-acheter", "own-vs-rent")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("🔑 Louer ou acheter", "🔑 Own vs rent")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Seuil de rentabilité, mensualités, scénarios", "Break-even point, monthly payments, scenarios")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("climat-2040", "climate-2040")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("🌡️ Climat 2040", "🌡️ Climate 2040")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Projections ARPEGE — canicule, sécheresse, été", "ARPEGE projections — heatwaves, drought, summer")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={locale === "en" ? `/vacations/${city.slug}` : `/vacances/${city.slug}`}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("🌴 Vacances ici", "🌴 Holidays here")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Quand y aller, quoi y faire, hôtels", "When to go, what to do, hotels")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("s-installer", "get-settled")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {locale === "en" ? "📦 Get settled" : <>📦 S&apos;installer</>}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Logement, internet, démarches admin", "Housing, internet, admin paperwork")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("connexion-internet", "internet-quality")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("🌐 Connexion internet", "🌐 Internet quality")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Fibre, débit, couverture", "Fibre, speed, coverage")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("logement", "housing")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("🏠 Logement", "🏠 Housing")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Loyers, tension marché, quartiers", "Rents, market pressure, neighbourhoods")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("tension-locative", "rental-market")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("🔑 Tension locative", "🔑 Rental market")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Délai, candidats/annonce, dossier requis", "Wait time, applicants per listing, paperwork needed")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("profils", "profiles")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("👤 Profils de vie", "👤 Life profiles")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Expats, retraités, étudiants, télétravail", "Expats, retirees, students, remote workers")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("questions", "questions")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("❓ Questions fréquentes", "❓ Frequent questions")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("13 réponses chiffrées 2026", "13 data-backed answers, 2026")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("agenda", "calendar")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("📅 Agenda mois par mois", "📅 Month-by-month calendar")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Festivals, marchés, saisons 2026", "Festivals, markets, seasons 2026")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("mentalite-locale", "local-mindset")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("✨ Mentalité locale", "✨ Local mindset")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Tempo, ouverture, café, archetype régional", "Pace, openness, café culture, regional archetype")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("vibe", "vibe")}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("⚡ Ambiance de la ville", "⚡ City vibe")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Calme, animé, festif, ressourcant — estimé", "Calm, lively, festive, restorative — estimated")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("synthese", "synthesis")}
                  className="flex items-center justify-between rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 hover:border-[var(--accent)] hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("✨ Synthèse 8 axes", "✨ 8-axis synthesis")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Tous les composites en un écran", "Every composite on one screen")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
                <a
                  href={sub("empreinte", "fingerprint")}
                  className="flex items-center justify-between rounded-xl border border-[var(--accent)]/30 bg-gradient-to-br from-[var(--accent)]/10 to-[var(--bg-surface)] hover:border-[var(--accent)] hover:shadow-md transition-all px-5 py-4 group sm:col-span-2 lg:col-span-1"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L("🌸 Empreinte de la ville", "🌸 City fingerprint")}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {L("Signature visuelle unique, dérivée des 8 axes", "Unique visual signature, derived from the 8 axes")}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === "scores" && (
          <div id="city-panel-scores" role="tabpanel" aria-labelledby="city-tab-scores" className="max-w-2xl space-y-6">
            <Card className="overflow-hidden">
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-6">
                <div className="shrink-0">
                  <CityFingerprint city={city} size={260} showFooter={false} locale={locale} />
                </div>
                <div className="min-w-0 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-elevated)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                    <Sparkles className="h-3 w-3" /> {L("Empreinte générative", "Generative fingerprint")}
                  </div>
                  <h2 className="mt-2 text-lg font-bold text-[var(--text-primary)]">
                    {L(`La signature visuelle de ${city.name}`, `The visual signature of ${city.name}`)}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {L("Une forme unique, calculée à partir des 8 axes de score. Plus un pétale est long et coloré, plus la ville est forte sur cet axe — la silhouette globale révèle son profil d'un coup d'œil.", "A unique shape, computed from the 8 score axes. The longer and more vivid a petal, the stronger the city on that axis — the overall silhouette reveals its profile at a glance.")}
                  </p>
                  <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                    {L("Deux villes n'ont jamais la même empreinte.", "No two cities share the same fingerprint.")}
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">
                {L("Scores détaillés", "Detailed scores")} — {city.name}
              </h2>
              <div className="space-y-4">
                {SCORE_LABELS.map(({ key, icon: Icon }) => (
                  <div key={key} className="flex items-center gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--bg-elevated)]">
                      <Icon className="h-4 w-4 text-[var(--text-secondary)]" />
                    </div>
                    <div className="flex-1">
                      <ScoreBar label={SCORE_AXIS_LABELS[key]} score={city.scores[key]} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "reviews" && (
          <div id="city-panel-reviews" role="tabpanel" aria-labelledby="city-tab-reviews" className="max-w-3xl">
            <Card>
              <div className="text-center py-6">
                <div className="text-4xl mb-3">💬</div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                  {L("Les vrais témoignages sont en bas de la page", "The real testimonials are at the bottom of the page")}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-5">
                  {L(`Pas de faux avis ici. La discussion sur ${city.name} est ouverte plus bas — lisez les retours et partagez le vôtre.`, `No fake reviews here. The discussion about ${city.name} is open below — read what people say and add your own.`)}
                </p>
                <a
                  href="#discussions"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors"
                >
                  {L("Aller aux témoignages →", "Go to testimonials →")}
                </a>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "data" && (
          <div id="city-panel-data" role="tabpanel" aria-labelledby="city-tab-data" className="max-w-2xl">
            <Card>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">
                {L("Données brutes", "Raw data")} — {city.name}
              </h2>
              <div className="space-y-3">
                {[
                  { label: L("Code INSEE", "INSEE code"), value: city.inseeCode ?? "—" },
                  { label: L("Population", "Population"), value: formatNumber(city.population ?? 0) + L(" hab.", " inhab.") },
                  { label: L("Département", "Department"), value: city.department ?? "—" },
                  { label: L("Région", "Region"), value: city.region ?? "—" },
                  { label: L("Altitude", "Elevation"), value: city.elevation ? `${city.elevation} m` : "—" },
                  { label: L("Ensoleillement / an", "Sunshine / year"), value: city.sunshinedays ? L(`${sunshineDays(city.sunshinedays)} j (${sunshineHours(city.sunshinedays)})`, `${sunshineDays(city.sunshinedays)} days (${sunshineHours(city.sunshinedays)})`) : "—" },
                  { label: L("Temp. moyenne juillet", "Avg. July temp."), value: city.avgTempJuly ? `${city.avgTempJuly}°C` : "—" },
                  { label: L("Temp. moyenne janvier", "Avg. January temp."), value: city.avgTempJanuary ? `${city.avgTempJanuary}°C` : "—" },
                  ...(housing ? [
                    { label: L("Loyer moyen T1", "Avg. studio rent"), value: `${housing.avgRentT1} ${L("€/mois", "€/mo")}` },
                    { label: L("Loyer moyen T2", "Avg. 1-bed rent"), value: `${housing.avgRentT2} ${L("€/mois", "€/mo")}` },
                    { label: L("Loyer moyen T3", "Avg. 2-bed rent"), value: `${housing.avgRentT3} ${L("€/mois", "€/mo")}` },
                    { label: L("Prix achat moyen", "Avg. purchase price"), value: `${housing.avgBuyPriceM2.toLocaleString(locale === "en" ? "en-GB" : "fr-FR")} €/m²` },
                  ] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
                    <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Discussions — moved up so the testimonial CTAs (#discussions anchor)
          land somewhere meaningful instead of scrolling to the very bottom. */}
      <section className="border-t border-[var(--border)] py-10">
        <div id="discussions" className="mx-auto max-w-5xl px-4 sm:px-6 scroll-mt-24">
          <CityDiscussionTabs citySlug={city.slug} cityName={city.name} locale={locale} />
          <div className="mt-4 max-w-sm">
            <AlerteForm citySlug={city.slug} cityName={city.name} locale={locale} />
          </div>
        </div>
      </section>

      {/* FAQ accordion */}
      <section className="border-t border-[var(--border)] bg-[var(--bg-surface)] py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
            {L("Questions fréquentes", "Frequently asked questions")} — {city.name}
          </h2>
          <div className="space-y-2">
            {[
              {
                q: L(`Quelle est la qualité de vie à ${city.name} ?`, `What is quality of life like in ${city.name}?`),
                a: L(
                  `${city.name} obtient un score global de ${city.scores.global.toFixed(1)}/10, ce qui reflète une qualité de vie ${city.scores.global >= 7.5 ? "exceptionnelle" : city.scores.global >= 7.0 ? "excellente" : city.scores.global >= 6.0 ? "bonne" : city.scores.global >= 5.0 ? "correcte" : "en dessous de la moyenne"}. La ville est connue pour ${city.characterTags.slice(0, 3).join(", ")}. Les habitants apprécient particulièrement ${city.scores.nature >= 7.5 ? "la proximité avec la nature, " : ""}${city.scores.culture >= 7.5 ? "la vie culturelle, " : ""}${city.scores.safety >= 7.5 ? "la sécurité du quotidien" : "le cadre de vie"}.`,
                  `${city.name} scores ${city.scores.global.toFixed(1)}/10 overall, reflecting ${city.scores.global >= 7.5 ? "exceptional" : city.scores.global >= 7.0 ? "excellent" : city.scores.global >= 6.0 ? "good" : city.scores.global >= 5.0 ? "decent" : "below-average"} quality of life. The city is known for ${city.characterTags.slice(0, 3).join(", ")}. Residents especially value ${city.scores.nature >= 7.5 ? "easy access to nature, " : ""}${city.scores.culture >= 7.5 ? "the cultural scene, " : ""}${city.scores.safety >= 7.5 ? "everyday safety" : "the overall living environment"}.`
                ),
              },
              {
                q: L(`Quel est le coût de la vie à ${city.name} ?`, `What is the cost of living in ${city.name}?`),
                a: housing
                  ? L(
                      `Le loyer médian pour un T2 à ${city.name} est de ${housing.avgRentT2} €/mois, et un T3 autour de ${housing.avgRentT3} €/mois. Le prix à l'achat s'établit aux alentours de ${housing.avgBuyPriceM2.toLocaleString("fr-FR")} €/m². Le score coût de la vie est de ${city.scores.cost.toFixed(1)}/10 — ${city.scores.cost >= 7.5 ? "la ville offre un excellent rapport qualité-prix" : city.scores.cost >= 6 ? "les prix restent raisonnables comparé aux grandes métropoles" : "le coût de la vie est dans la moyenne nationale"}.`,
                      `In ${city.name}, the median rent is about ${housing.avgRentT2} €/mo for a 1-bedroom and around ${housing.avgRentT3} €/mo for a 2-bedroom. Buying runs at roughly ${housing.avgBuyPriceM2.toLocaleString("en-GB")} €/m². The cost-of-living score is ${city.scores.cost.toFixed(1)}/10 — ${city.scores.cost >= 7.5 ? "the city offers excellent value for money" : city.scores.cost >= 6 ? "prices stay reasonable compared with the big metros" : "the cost of living sits around the national average"}.`
                    )
                  : L(
                      `${city.name} obtient un score coût de la vie de ${city.scores.cost.toFixed(1)}/10. ${city.scores.cost >= 7.5 ? "La ville est reconnue pour son excellent pouvoir d'achat et ses loyers abordables." : city.scores.cost >= 6 ? "Le coût de la vie y est raisonnable par rapport aux grandes métropoles françaises." : "Les prix reflètent la demande d'une ville dynamique."}`,
                      `${city.name} scores ${city.scores.cost.toFixed(1)}/10 on cost of living. ${city.scores.cost >= 7.5 ? "The city is known for strong purchasing power and affordable rents." : city.scores.cost >= 6 ? "The cost of living is reasonable compared with the big French metros." : "Prices reflect the demand of a busy, in-demand city."}`
                    ),
              },
              {
                q: L(`${city.name} est-elle une bonne ville pour les familles ?`, `Is ${city.name} a good city for families?`),
                a: L(
                  `Pour les familles, ${city.name} présente un score sécurité de ${city.scores.safety.toFixed(1)}/10 et un score écoles de ${city.scores.schools.toFixed(1)}/10. ${city.scores.safety >= 7.5 && city.scores.schools >= 7.5 ? `La ville cumule sécurité rassurante et offre scolaire de qualité — un choix privilégié pour élever des enfants.` : city.scores.nature >= 7.5 ? `La présence d'espaces verts et de parcs (score nature ${city.scores.nature.toFixed(1)}/10) est un atout majeur pour les familles.` : `Comme dans toute ville française de cette taille, l'offre en équipements familiaux est présente.`}`,
                  `For families, ${city.name} scores ${city.scores.safety.toFixed(1)}/10 on safety and ${city.scores.schools.toFixed(1)}/10 on schools. ${city.scores.safety >= 7.5 && city.scores.schools >= 7.5 ? `It combines reassuring safety with quality schooling — a strong choice for raising children.` : city.scores.nature >= 7.5 ? `Plenty of green space and parks (nature score ${city.scores.nature.toFixed(1)}/10) is a major plus for families.` : `Like any French city this size, the usual family amenities are in place.`}`
                ),
              },
              {
                q: L(`Peut-on télétravailler à ${city.name} ?`, `Can you work remotely from ${city.name}?`),
                a: L(
                  `${city.name} obtient un score télétravail de ${city.scores.remoteWork.toFixed(1)}/10. ${city.scores.remoteWork >= 7.5 ? `La ville figure parmi les meilleures destinations pour le travail à distance en France : couverture fibre quasi totale, espaces de coworking, et coût de la vie permettant de vivre confortablement avec un salaire remote.` : city.scores.remoteWork >= 7.0 ? `La couverture fibre est bonne et plusieurs espaces de coworking sont disponibles. Le score qualité de vie (${city.scores.life.toFixed(1)}/10) en fait une ville agréable pour les télétravailleurs.` : `La ville dispose des infrastructures numériques de base. Le score transport (${city.scores.transport.toFixed(1)}/10) permet également des déplacements ponctuels vers les grandes métropoles.`}`,
                  `${city.name} scores ${city.scores.remoteWork.toFixed(1)}/10 for remote work. ${city.scores.remoteWork >= 7.5 ? `It ranks among the best remote-work spots in France: near-total fibre coverage, coworking spaces, and a cost of living that lets you live comfortably on a remote salary.` : city.scores.remoteWork >= 7.0 ? `Fibre coverage is good and several coworking spaces are available. The quality-of-life score (${city.scores.life.toFixed(1)}/10) makes it a pleasant base for remote workers.` : `The city has the basic digital infrastructure. The transport score (${city.scores.transport.toFixed(1)}/10) also allows occasional trips to the big metros.`}`
                ),
              },
              {
                q: L(`Quels sont les transports en commun à ${city.name} ?`, `What is public transport like in ${city.name}?`),
                a: L(
                  `Le score transport de ${city.name} est de ${city.scores.transport.toFixed(1)}/10. ${city.scores.transport >= 7.5 ? `La ville dispose d'un réseau de transport exceptionnel : métro, tramway ou bus à haute fréquence, et connexions TGV permettent de se passer facilement de voiture.` : city.scores.transport >= 7.0 ? `Le réseau de transports en commun est bien développé avec des lignes de bus et/ou tramway régulières. La ville est correctement reliée au réseau TER.` : `Les transports en commun couvrent les besoins essentiels. Pour les déplacements quotidiens hors centre-ville, une voiture peut s'avérer utile.`}`,
                  `${city.name}'s transport score is ${city.scores.transport.toFixed(1)}/10. ${city.scores.transport >= 7.5 ? `The city has an outstanding network: metro, tram or high-frequency buses plus high-speed rail links make it easy to live without a car.` : city.scores.transport >= 7.0 ? `Public transport is well developed, with regular bus and/or tram lines. The city is reasonably connected to the regional rail network.` : `Public transport covers the essentials. For daily trips outside the centre, a car can come in handy.`}`
                ),
              },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-[var(--border)] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-[var(--bg-canvas)] hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  <span className="text-sm font-medium text-[var(--text-primary)]">{item.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 flex-shrink-0 text-[var(--text-tertiary)] transition-transform",
                      openFaq === i && "rotate-180"
                    )}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 py-4 bg-[var(--bg-surface)] border-t border-[var(--border)]">
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compare bar */}
      <div className="border-t border-[var(--border)] bg-[var(--bg-surface)] py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-[var(--text-secondary)] flex-shrink-0">{L(`Comparer ${city.name} avec :`, `Compare ${city.name} with:`)}</span>
            {CITIES_SEED.filter((c) => c.slug !== city.slug)
              .sort((a, b) => {
                const aRegion = a.region === city.region ? 0 : 1;
                const bRegion = b.region === city.region ? 0 : 1;
                return aRegion !== bRegion ? aRegion - bRegion : b.scores.global - a.scores.global;
              })
              .slice(0, 6)
              .map((c) => (
                <a
                  key={c.slug}
                  href={`/${locale === "en" ? "compare" : "comparer"}/${[city.slug, c.slug].sort().join("-vs-")}`}
                  className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
                >
                  {c.name}
                </a>
              ))}
          </div>
        </div>
      </div>

      <CityReviewModal
        citySlug={city.slug}
        cityName={city.name}
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onPosted={() => setReviewBumpKey((k) => k + 1)}
        locale={locale}
      />
    </div>
  );
}
