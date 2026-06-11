import type { Metadata } from "next";
import { CITIES_LIGHT } from "@/lib/cities-light";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_COUNT } from "@/lib/site-stats";
import {
  MONTHS,
  indexToMonthSlug,
  formatMonthLabel,
  type MonthIndex,
} from "@/lib/vacation-seasons";
import { ACTIVITY_DEFS, ACTIVITIES } from "@/lib/vacation-activities";
import {
  topCitiesForMonth,
  VACATION_PROFILES,
  VACATION_PROFILE_DEFS,
} from "@/lib/vacation-fit";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { MapPin, ChevronRight, Calendar, Sparkles } from "lucide-react";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Où partir en vacances en France 2026 · guide mois par mois",
  description: `Le bon mois, la bonne destination. Classement honnête des ${CITIES_COUNT} villes françaises pour vos vacances : plage, montagne, citytrip, vignobles. Données climat + affluence + budget.`,
  alternates: { canonical: "/vacances" },
  openGraph: {
    title: "Vacances en France · où partir, quand, pour quoi",
    description: "Mois par mois, activité par activité. Sans bullshit, sans top-10 magiques.",
  },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Vacances", path: "/vacances" },
]);

function getCurrentMonthIndex(): MonthIndex {
  // Server-rendered at build time → on prend la date du build, suffisant pour
  // un hub SSG. Quand on builde en mai, le hub met mai en avant ; rebuild
  // mensuel via CI gardera ça frais.
  const m = (new Date().getMonth() + 1) as MonthIndex;
  return m;
}

export default function VacancesHub() {
  const currentMonth = getCurrentMonthIndex();
  const topCurrent = topCitiesForMonth(currentMonth, CITIES_LIGHT, { limit: 6 });
  const currentMonthLabel = formatMonthLabel(currentMonth);
  const currentSlug = indexToMonthSlug(currentMonth);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="relative overflow-hidden pt-14 pb-12 sm:pt-16 sm:pb-14">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-aurora opacity-40" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-tertiary)] mb-3" aria-label="Fil d'Ariane">
            <Link href="/" className="hover:underline">Accueil</Link>
            <span className="mx-1">·</span>
            <span className="text-[var(--text-secondary)]">Vacances</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-3">
            Où partir en vacances <span className="font-display italic gradient-text-anim">en France</span> ?
          </h1>
          <p className="text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Le bon mois, la bonne destination, le bon budget. {CITIES_COUNT} villes classées
            sur la base du climat réel, de l&apos;affluence touristique et du score d&apos;adéquation
            par activité. Pas de top-10 magique, pas de listicles d&apos;agence.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <Badge>Climat 1991-2020</Badge>
            <Badge>Affluence par mois</Badge>
            <Badge>Sans paywall, sans bullshit</Badge>
          </div>
          <div className="mt-6">
            <Link
              href="/vacances/quiz"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] text-white text-sm font-semibold px-5 py-2.5 hover:bg-[var(--accent-hover)] transition-colors shadow-sm shadow-[var(--accent)]/30"
            >
              <Sparkles className="h-4 w-4" />
              Lancer le quiz · 5 questions, 3 destinations
            </Link>
          </div>
        </div>
      </section>

      {/* Top du mois en cours */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              À privilégier en {currentMonthLabel.toLowerCase()}
            </h2>
          </div>
          <Link
            href={`/vacances/mois/${currentSlug}`}
            className="text-sm font-medium text-[var(--accent)] hover:underline"
          >
            Top 30 du mois →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topCurrent.map(({ city, fit }) => (
            <Link
              key={city.slug}
              href={`/villes/${city.slug}`}
              className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
            >
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <h3 className="text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                  {city.name}
                </h3>
                <span className="text-sm font-bold font-mono-data text-[var(--accent)] shrink-0">
                  {fit.score.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-snug">
                {fit.whyOneLine}
              </p>
              <p className="text-[11px] text-[var(--text-tertiary)] mt-1.5 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {city.department}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Par mois */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-10">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-[var(--text-secondary)]" />
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Où partir en France selon le mois
          </h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mb-5 max-w-3xl">
          Chaque mois a son meilleur trio destination/activité. On y va&nbsp;?
        </p>
        <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {MONTHS.map((slug, idx) => {
            const month = (idx + 1) as MonthIndex;
            const label = formatMonthLabel(month);
            const isCurrent = month === currentMonth;
            return (
              <Link
                key={slug}
                href={`/vacances/mois/${slug}`}
                className={`group rounded-xl border px-4 py-3 transition-all hover:shadow-md ${
                  isCurrent
                    ? "border-[var(--accent)]/40 bg-[var(--accent)]/5"
                    : "border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Par activité */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-10">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          Par envie
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-5 max-w-3xl">
          Dix angles classiques. Pour chaque activité, les destinations qui
          coch ent vraiment la case — pas les listicles d&apos;agence.
        </p>
        <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {ACTIVITIES.map((slug) => {
            const def = ACTIVITY_DEFS[slug];
            return (
              <Link
                key={slug}
                href={`/vacances/activite/${slug}`}
                className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
                title={def.intro}
              >
                <div className="flex items-center gap-1.5">
                  <span aria-hidden>{def.emoji}</span>
                  <span className="text-xs font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                    {def.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Par profil */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-12">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          Selon avec qui vous partez
        </h2>
        <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {VACATION_PROFILES.map((p) => {
            const def = VACATION_PROFILE_DEFS[p];
            return (
              <Link
                key={p}
                href={`/vacances/profil/${p}`}
                className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
                title={def.intro}
              >
                <div className="flex items-center gap-1.5">
                  <span aria-hidden>{def.emoji}</span>
                  <span className="text-xs font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                    {def.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Méthodo discrète */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        <Card className="bg-[var(--bg-elevated)]/50">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Comment on classe ces destinations
          </h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Quatre signaux par ville et par mois : <strong>climat</strong> (température
            interpolée depuis les normales 1991-2020, jours de pluie et ensoleillement
            par régime climatique), <strong>affluence touristique</strong> (pic d&apos;été
            partout, ski en hiver, vignobles en mi-saison), <strong>adéquation à
            l&apos;activité</strong> (la plage demande de la chaleur, le ski demande
            de l&apos;altitude), et le <strong>profil voyageur</strong> (famille,
            couple, solo, amis, seniors). Le score combine ces signaux selon ce que
            vous cherchez. Voir aussi la <Link href="/methode" className="underline">méthodologie globale du site</Link>.
          </p>
        </Card>
      </section>

      <Footer />
    </main>
  );
}
