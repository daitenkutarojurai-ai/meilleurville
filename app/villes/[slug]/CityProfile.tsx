"use client";
import { useState } from "react";
import Link from "next/link";
import { MapPin, Star, Sun, Thermometer, Users, TrendingUp, Home, Laptop, GraduationCap, Shield, Bus, TreePine, ChevronRight, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { Button } from "@/components/ui/Button";
import { CommentSection } from "@/components/CommentSection";
import { FavoriteButton } from "@/components/effects/FavoriteButton";
import { GrainOverlay } from "@/components/effects/GrainOverlay";
import { AISummaryCard } from "@/components/AISummaryCard";
import { SimilarCities } from "@/components/SimilarCities";
import { getNeighborhoods } from "@/data/neighborhoods";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { RANKING_META, getRankedCities } from "@/lib/rankings";
import { formatNumber, formatScore, scoreColor, cn, sunshineDays, sunshineHours } from "@/lib/utils";
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

export function CityProfile({ city }: { city: CitySeed & { reviewCount?: number } }) {
  const [activeStage, setActiveStage] = useState("famille");
  const neighborhoods = getNeighborhoods(city.slug);
  const housing = getHousing(city.slug);
  const [activeTab, setActiveTab] = useState("overview");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const stage = LIFE_STAGES.find((s) => s.id === activeStage)!;

  const TABS = [
    { id: "overview", label: "Vue d'ensemble" },
    { id: "scores", label: "Scores détaillés" },
    { id: "reviews", label: "Avis" },
    { id: "data", label: "Données" },
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
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--text-secondary)] mb-4">
            <a href="/villes" className="hover:text-[var(--text-primary)] transition-colors">Villes</a>
            <ChevronRight className="h-3.5 w-3.5" />
            <a
              href={`/regions/${city.region.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              {city.region}
            </a>
            <ChevronRight className="h-3.5 w-3.5" />
            <a
              href={`/departements/${city.department.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              {city.department}
            </a>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[var(--text-primary)]">{city.name}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {city.characterTags.map((tag) => (
                  <Badge key={tag} variant="subtle" className="capitalize">
                    {tag}
                  </Badge>
                ))}
                <FavoriteButton slug={city.slug} className="!ml-1" label />
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
              <div className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)] mb-2 font-semibold">Score global / 10</div>
              <div className="flex items-center justify-center gap-1 text-sm text-[var(--text-secondary)]">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                <span>{city.reviewCount ?? 180} avis</span>
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
                  de soleil / an
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
                <div className="text-xs text-[var(--text-secondary)]">temp. juillet</div>
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
                <div className="text-xs text-[var(--text-secondary)]">temp. janvier</div>
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
                <div className="text-xs text-[var(--text-secondary)]">altitude</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-16 z-40 border-b border-[var(--border)] bg-[var(--bg-canvas)]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex gap-0 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "whitespace-nowrap px-5 py-4 text-sm font-medium border-b-2 transition-colors",
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
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Scores */}
            <div className="lg:col-span-2 space-y-6">
              {/* Life Stage Lens */}
              <Card>
                <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
                  Life Stage Lens
                </h2>
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
                        {ls.label}
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
                        label={meta.label}
                        score={score}
                      />
                    );
                  })}
                </div>
              </Card>

              {/* Témoignages — pointer to real CommentSection at the bottom */}
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">
                    Témoignages d&apos;habitants
                  </h2>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-3 leading-relaxed">
                  Cette section affiche les vrais retours postés par la communauté.
                  Les premiers témoignages apparaissent en bas de la page.
                </p>
                <a
                  href="#discussions"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:underline"
                >
                  Lire et participer →
                </a>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <AISummaryCard citySlug={city.slug} cityName={city.name} />
              {/* All scores mini */}
              <Card>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
                  Tous les scores
                </h3>
                <div className="space-y-2.5">
                  {SCORE_LABELS.map(({ key, label }) => {
                    const score = city.scores[key];
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-xs text-[var(--text-secondary)]">{label}</span>
                        <span className={`text-sm font-bold font-mono-data ${scoreColor(score)}`}>
                          {formatScore(score)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Housing summary */}
              {housing && (
                <Card>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Home className="h-4 w-4 text-[var(--text-secondary)]" />
                    Loyers & Immobilier
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      { label: "T1 / mois", value: `${housing.avgRentT1} €` },
                      { label: "T2 / mois", value: `${housing.avgRentT2} €` },
                      { label: "T3 / mois", value: `${housing.avgRentT3} €` },
                      { label: "Achat / m²", value: `${housing.avgBuyPriceM2.toLocaleString("fr-FR")} €` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-xs text-[var(--text-secondary)]">{label}</span>
                        <span className="text-sm font-bold font-mono-data text-[var(--text-primary)]">{value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] mt-3">Médiane indicative · DVF 2024</p>
                </Card>
              )}

              {/* Thematic rankings */}
              <Card>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[var(--text-secondary)]" />
                  Classements thématiques
                </h3>
                <div className="space-y-2">
                  {(Object.keys(RANKING_META) as RankingSlug[]).map((slug) => {
                    const meta = RANKING_META[slug];
                    const ranked = getRankedCities(slug);
                    const entry = ranked.find((e) => e.city.slug === city.slug);
                    if (!entry) return null;
                    return (
                      <Link
                        key={slug}
                        href={`/classements/${slug}`}
                        className="flex items-center justify-between hover:bg-[var(--bg-elevated)] rounded-lg px-2 py-1.5 -mx-2 transition-colors group"
                      >
                        <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5">
                          <span>{meta.emoji}</span>
                          {meta.label}
                        </span>
                        <span className={`text-xs font-bold font-mono-data ${meta.color}`}>
                          #{entry.rank}
                        </span>
                      </Link>
                    );
                  })}
                </div>
                <Link
                  href="/classements"
                  className="mt-3 block text-xs text-[var(--accent)] hover:underline"
                >
                  Voir tous les classements →
                </Link>
              </Card>

              {/* Similar cities */}
              <Card>
                <SimilarCities city={city} />
              </Card>

              {/* Neighborhoods link */}
              <a
                href={`/villes/${city.slug}/quartiers`}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
              >
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    🏘️ Quartiers de {city.name}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  {neighborhoods.length > 0 ? `${neighborhoods.length} quartiers analysés` : "Sécurité, loyers, ambiance par quartier"}
                </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
              </a>

              {/* CTA — partager son expérience via la discussion */}
              <Card className="border-[var(--accent)]/20 bg-[var(--accent)]/5">
                <div className="text-center">
                  <Users className="h-8 w-8 text-[var(--accent)] mx-auto mb-3" />
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                    Vous habitez {city.name} ?
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mb-4">
                    Partagez votre expérience dans la discussion ouverte plus bas — votre témoignage aide ceux qui cherchent où vivre.
                  </p>
                  <a
                    href="#discussions"
                    className="inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 hover:bg-emerald-700 transition-colors"
                  >
                    Aller à la discussion →
                  </a>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "scores" && (
          <div className="max-w-2xl">
            <Card>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">
                Scores détaillés — {city.name}
              </h2>
              <div className="space-y-4">
                {SCORE_LABELS.map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--bg-elevated)]">
                      <Icon className="h-4 w-4 text-[var(--text-secondary)]" />
                    </div>
                    <div className="flex-1">
                      <ScoreBar label={label} score={city.scores[key]} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="max-w-3xl">
            <Card>
              <div className="text-center py-6">
                <div className="text-4xl mb-3">💬</div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                  Les vrais témoignages sont en bas de la page
                </h3>
                <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-5">
                  Pas de faux avis ici. La discussion sur {city.name} est ouverte plus bas — lisez les retours et partagez le vôtre.
                </p>
                <a
                  href="#discussions"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] text-white px-5 py-2.5 text-sm font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Aller aux témoignages →
                </a>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "data" && (
          <div className="max-w-2xl">
            <Card>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">
                Données brutes — {city.name}
              </h2>
              <div className="space-y-3">
                {[
                  { label: "Code INSEE", value: city.inseeCode ?? "—" },
                  { label: "Population", value: formatNumber(city.population ?? 0) + " hab." },
                  { label: "Département", value: city.department ?? "—" },
                  { label: "Région", value: city.region ?? "—" },
                  { label: "Altitude", value: city.elevation ? `${city.elevation} m` : "—" },
                  { label: "Ensoleillement / an", value: city.sunshinedays ? `${sunshineDays(city.sunshinedays)} j (${sunshineHours(city.sunshinedays)})` : "—" },
                  { label: "Temp. moyenne juillet", value: city.avgTempJuly ? `${city.avgTempJuly}°C` : "—" },
                  { label: "Temp. moyenne janvier", value: city.avgTempJanuary ? `${city.avgTempJanuary}°C` : "—" },
                  ...(housing ? [
                    { label: "Loyer moyen T1", value: `${housing.avgRentT1} €/mois` },
                    { label: "Loyer moyen T2", value: `${housing.avgRentT2} €/mois` },
                    { label: "Loyer moyen T3", value: `${housing.avgRentT3} €/mois` },
                    { label: "Prix achat moyen", value: `${housing.avgBuyPriceM2.toLocaleString("fr-FR")} €/m²` },
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

      {/* FAQ accordion */}
      <section className="border-t border-[var(--border)] bg-[var(--bg-surface)] py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
            Questions fréquentes — {city.name}
          </h2>
          <div className="space-y-2">
            {[
              {
                q: `Quelle est la qualité de vie à ${city.name} ?`,
                a: `${city.name} obtient un score global de ${city.scores.global.toFixed(1)}/10, ce qui reflète une qualité de vie ${city.scores.global >= 8.5 ? "excellente" : city.scores.global >= 7.5 ? "très bonne" : city.scores.global >= 6.5 ? "bonne" : "correcte"}. La ville est connue pour ${city.characterTags.slice(0, 3).join(", ")}. Les habitants apprécient particulièrement ${city.scores.nature >= 7.5 ? "la proximité avec la nature, " : ""}${city.scores.culture >= 7.5 ? "la vie culturelle, " : ""}${city.scores.safety >= 7.5 ? "la sécurité du quotidien" : "le cadre de vie"}.`,
              },
              {
                q: `Quel est le coût de la vie à ${city.name} ?`,
                a: housing
                  ? `Le loyer médian pour un T2 à ${city.name} est de ${housing.avgRentT2} €/mois, et un T3 autour de ${housing.avgRentT3} €/mois. Le prix à l'achat s'établit aux alentours de ${housing.avgBuyPriceM2.toLocaleString("fr-FR")} €/m². Le score coût de la vie est de ${city.scores.cost.toFixed(1)}/10 — ${city.scores.cost >= 7.5 ? "la ville offre un excellent rapport qualité-prix" : city.scores.cost >= 6 ? "les prix restent raisonnables comparé aux grandes métropoles" : "le coût de la vie est dans la moyenne nationale"}.`
                  : `${city.name} obtient un score coût de la vie de ${city.scores.cost.toFixed(1)}/10. ${city.scores.cost >= 7.5 ? "La ville est reconnue pour son excellent pouvoir d'achat et ses loyers abordables." : city.scores.cost >= 6 ? "Le coût de la vie y est raisonnable par rapport aux grandes métropoles françaises." : "Les prix reflètent la demande d'une ville dynamique."}`,
              },
              {
                q: `${city.name} est-elle une bonne ville pour les familles ?`,
                a: `Pour les familles, ${city.name} présente un score sécurité de ${city.scores.safety.toFixed(1)}/10 et un score écoles de ${city.scores.schools.toFixed(1)}/10. ${city.scores.safety >= 7.5 && city.scores.schools >= 7.5 ? `La ville cumule sécurité rassurante et offre scolaire de qualité — un choix privilégié pour élever des enfants.` : city.scores.nature >= 7.5 ? `La présence d'espaces verts et de parcs (score nature ${city.scores.nature.toFixed(1)}/10) est un atout majeur pour les familles.` : `Comme dans toute ville française de cette taille, l'offre en équipements familiaux est présente.`}`,
              },
              {
                q: `Peut-on télétravailler à ${city.name} ?`,
                a: `${city.name} obtient un score télétravail de ${city.scores.remoteWork.toFixed(1)}/10. ${city.scores.remoteWork >= 8 ? `La ville figure parmi les meilleures destinations pour le travail à distance en France : couverture fibre quasi totale, espaces de coworking, et coût de la vie permettant de vivre confortablement avec un salaire remote.` : city.scores.remoteWork >= 7 ? `La couverture fibre est bonne et plusieurs espaces de coworking sont disponibles. Le score qualité de vie (${city.scores.life.toFixed(1)}/10) en fait une ville agréable pour les télétravailleurs.` : `La ville dispose des infrastructures numériques de base. Le score transport (${city.scores.transport.toFixed(1)}/10) permet également des déplacements ponctuels vers les grandes métropoles.`}`,
              },
              {
                q: `Quels sont les transports en commun à ${city.name} ?`,
                a: `Le score transport de ${city.name} est de ${city.scores.transport.toFixed(1)}/10. ${city.scores.transport >= 8.5 ? `La ville dispose d'un réseau de transport exceptionnel : métro, tramway ou bus à haute fréquence, et connexions TGV permettent de se passer facilement de voiture.` : city.scores.transport >= 7 ? `Le réseau de transports en commun est bien développé avec des lignes de bus et/ou tramway régulières. La ville est correctement reliée au réseau TER.` : `Les transports en commun couvrent les besoins essentiels. Pour les déplacements quotidiens hors centre-ville, une voiture peut s'avérer utile.`}`,
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
            <span className="text-xs text-[var(--text-secondary)] flex-shrink-0">Comparer {city.name} avec :</span>
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
                  href={`/comparer/${[city.slug, c.slug].sort().join("-vs-")}`}
                  className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
                >
                  {c.name}
                </a>
              ))}
          </div>
        </div>
      </div>

      {/* Discussions */}
      <div id="discussions" className="mx-auto max-w-5xl px-4 sm:px-6 pb-16 scroll-mt-24">
        <CommentSection
          topic={`city:${city.slug}`}
          title={`Témoignages sur ${city.name}`}
          showRating
          emptyHint={`Vous avez vécu ou visité ${city.name} ? Racontez-nous : ce que vous avez aimé, ce qui vous a surpris, vos coups de cœur de quartier…`}
        />
      </div>

    </div>
  );
}
