import type { Metadata } from "next";
import { CITIES_LIGHT, type CityLight } from "@/lib/cities-light";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BookingCTA } from "@/components/BookingCTA";
import { CITIES_COUNT } from "@/lib/site-stats";
import { getTransit, type Transit } from "@/lib/transit";
import { monthSignal, type MonthIndex } from "@/lib/vacation-seasons";
import {
  CROSSINGS,
  enCrossingSlug,
  getEnCrossing,
} from "@/lib/vacation-crossing";
import {
  EN_MONTH_SLUGS,
  EN_PROFILE_LABEL,
  enMonthLabel,
  enWhyLine,
} from "@/lib/vacation-en";
import {
  topCitiesForMonth,
  topCitiesForProfile,
  BUDGET_TIER_LABEL,
  VACATION_PROFILES,
  VACATION_PROFILE_DEFS,
  type VacationProfile,
} from "@/lib/vacation-fit";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE, pathAlternatesEn } from "@/lib/i18n";
import {
  MapPin,
  Thermometer,
  CloudRain,
  Users,
  TrainFront,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// Jumelle EN de /vacances/ou-partir/[combo] (croisement mois × profil).
//
// Même moteur, mêmes chiffres : ce sont des alternates hreflang, un écart de
// nombre entre les deux serait un bug. Rien n'est saisi à la main ici — tout
// sort de lib/vacation-fit, lib/vacation-seasons et lib/transit, comme côté FR.
//
// L'adressage (un seul segment ASCII, et pourquoi les slugs de profil diffèrent
// de /vacations/profile/[profile]) est documenté dans lib/vacation-crossing.ts.

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; combo: string }> };

export function generateStaticParams() {
  return CROSSINGS.map((c) => ({ locale: "en", combo: c.enSlug }));
}

// « Where to go in April … » : le libellé du profil ne s'insère pas tel quel,
// il faut la tournure prépositionnelle.
const PROFILE_PHRASE: Record<VacationProfile, string> = {
  famille: "with the family",
  monoparental: "as a single parent",
  couple: "as a couple",
  solo: "on your own",
  celibataire: "if you're single",
  amis: "with friends",
  seniors: "as a senior",
};

// Ce que le profil regarde en premier — les poids réels sont ceux de
// `profileFit`, cette phrase ne fait que les nommer au lecteur.
const PROFILE_PIVOT: Record<VacationProfile, string> = {
  famille: "everyday safety, quality of life, green space and schools",
  monoparental: "safety, public transport and cost — one adult, one budget",
  couple: "cultural life, quality of life and setting",
  solo: "safety, cultural life and ease of getting around",
  celibataire:
    "density of cultural and social life, so you don't land in an empty resort",
  amis: "cultural life, nightlife, transport and a shared budget",
  seniors: "safety, quality of life, green space and cost",
};

const POOL_SIZE = 60;
const TOP_SHOWN = 12;
const COMPARE_DEPTH = 15;

// Décimale anglaise : le point, pas la virgule. Le nombre est le même que côté
// FR, seule la façon de l'écrire change.
function dec1(n: number): string {
  return n.toFixed(1);
}

function crowdLabel(c: number): string {
  return c <= 2 ? "Quiet" : c === 3 ? "Moderate" : "Very busy";
}

// `transitTags` (lib/transit) rend du français. On refait la table ici plutôt
// que d'angliciser la lib, qui sert d'abord les pages FR.
function enTransitTags(t: Transit): string[] {
  const out: string[] = [];
  if (t.metro) out.push("Metro");
  if (t.rer) out.push("RER");
  if (t.tram) out.push("Tram");
  if (t.tgv) out.push("TGV");
  if (t.bhns) out.push("Bus rapid transit");
  if (t.velo === "fort") out.push("Strong cycling network");
  else if (t.velo === "moyen") out.push("Cycling network");
  return out;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { combo } = await params;
  const crossing = getEnCrossing(combo);
  if (!crossing) return {};
  const slug = crossing.profile;
  const month = enMonthLabel(crossing.month);
  const phrase = PROFILE_PHRASE[slug];
  return {
    // 44-58 caractères selon le mois et le profil, sous la coupure SERP.
    title: `Where to go in ${month} ${phrase} · France 2026`,
    description: `Where to go in France in ${month} ${phrase}: climate, crowds, budget and car-free access. Ranked across ${CITIES_COUNT} towns and cities, not an agency top 10.`,
    alternates: pathAlternatesEn(
      `/vacances/ou-partir/${crossing.slug}`,
      `/vacations/where-to-go/${combo}`,
    ),
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaîtrait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
      title: `Where to go in ${month} ${phrase}`,
      description: `${EN_PROFILE_LABEL[slug]}, ranked for ${month}: climate, crowds and budget on ${CITIES_COUNT} French destinations.`,
    },
  };
}

interface CarFreePick {
  city: CityLight;
  score: number;
  tags: string[];
}

// Arriver en train ET tenir sur place sans louer de voiture. Mêmes seuils que
// la page FR : gare TGV/RER d'un côté, réseau lourd ou score transport
// suffisant de l'autre.
function carFreePicks(pool: ReturnType<typeof topCitiesForMonth>): CarFreePick[] {
  return pool
    .map(({ city, fit }) => {
      const t = getTransit(city.slug);
      const arrivable = !!(t.tgv || t.rer);
      const local = !!(t.metro || t.tram || t.bhns) || city.scores.transport >= 6.8;
      if (!arrivable || !local) return null;
      return { city, score: fit.score, tags: enTransitTags(t) };
    })
    .filter((d): d is CarFreePick => d !== null)
    .slice(0, 8);
}

export default async function WhereToGoPage({ params }: Props) {
  const { combo } = await params;
  const crossing = getEnCrossing(combo);
  if (!crossing) notFound();
  const { month: idx, profile: slug, enMonthSlug } = crossing;
  const label = enMonthLabel(idx);
  const profileLabel = EN_PROFILE_LABEL[slug];
  const phrase = PROFILE_PHRASE[slug];

  // Même seuil de population que le classement par profil (8 000 hab.), pour
  // que la comparaison des deux classements porte sur le même vivier.
  const pool = topCitiesForMonth(idx, CITIES_LIGHT, {
    profile: slug,
    limit: POOL_SIZE,
    minPop: 8_000,
  });
  const top = pool.slice(0, TOP_SHOWN);
  const profileOnly = topCitiesForProfile(slug, CITIES_LIGHT, { limit: POOL_SIZE });

  const signals = top.map(({ city }) => monthSignal(city, idx));
  const median = (xs: number[]) => {
    const s = [...xs].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : Math.round(((s[mid - 1] + s[mid]) / 2) * 10) / 10;
  };
  const medTemp = median(signals.map((s) => s.tempAvg));
  const medRain = median(signals.map((s) => s.rainDays));
  const calmShare = signals.filter((s) => s.crowded <= 2).length;

  // Ce que le mois change : entrants et sortants face au classement du profil
  // seul (le même profil, sans contrainte de saison).
  const profileTopSlugs = new Set(profileOnly.slice(0, COMPARE_DEPTH).map((r) => r.city.slug));
  const monthTopSlugs = new Set(pool.slice(0, COMPARE_DEPTH).map((r) => r.city.slug));
  const entrantsAll = pool.slice(0, COMPARE_DEPTH).filter((r) => !profileTopSlugs.has(r.city.slug));
  const sortantsAll = profileOnly
    .slice(0, COMPARE_DEPTH)
    .filter((r) => !monthTopSlugs.has(r.city.slug));
  const entrants = entrantsAll.slice(0, 6);
  const sortants = sortantsAll.slice(0, 6);

  const carFree = carFreePicks(pool);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: `${EN_BASE}/` },
    { name: "Vacations", path: `${EN_BASE}/vacations` },
    { name: label, path: `${EN_BASE}/vacations/month/${enMonthSlug}` },
    { name: profileLabel, path: `${EN_BASE}/vacations/where-to-go/${combo}` },
  ]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Where to go in France in ${label} ${phrase} — best destinations`,
    itemListElement: top.slice(0, 10).map(({ city }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${EN_BASE}/cities/${city.slug}`,
      name: city.name,
    })),
  };

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(itemList)} />
      <Navbar />

      <section className="relative overflow-hidden pt-12 pb-10 sm:pt-14">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-aurora opacity-30" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-tertiary)] mb-3" aria-label="Breadcrumb">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="mx-1">·</span>
            <Link href="/vacations" className="hover:underline">Vacations</Link>
            <span className="mx-1">·</span>
            <Link href={`/vacations/month/${enMonthSlug}`} className="hover:underline">{label}</Link>
            <span className="mx-1">·</span>
            <span className="text-[var(--text-secondary)]">{profileLabel}</span>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-3">
            Where to go in{" "}
            <span className="font-display italic gradient-text-anim">{label}</span>{" "}
            {phrase}?
          </h1>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            A general ranking for the month says nothing about who is travelling. This one
            crosses the two: {label}&apos;s climate and crowd levels on one side, what this
            profile looks at first on the other — {PROFILE_PIVOT[slug]}.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <Badge>{pool.length} destinations ranked</Badge>
            <Badge>{dec1(medTemp)} °C median across the top {TOP_SHOWN}</Badge>
            <Badge>{medRain} rainy days</Badge>
            <Badge>
              {calmShare}/{TOP_SHOWN} with low crowds
            </Badge>
          </div>
        </div>
      </section>

      {/* Top du mois pour ce profil */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          Top {TOP_SHOWN} in {label} {phrase}
        </h2>
        <div className="space-y-3">
          {top.map(({ city, fit }, i) => {
            const sig = monthSignal(city, idx);
            return (
              <Card key={city.slug}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:gap-1 shrink-0">
                    <span className="text-2xl font-bold font-mono-data text-[var(--text-tertiary)]">
                      #{i + 1}
                    </span>
                    <span className="text-xl font-bold font-mono-data text-[var(--accent)]">
                      {dec1(fit.score)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
                      <Link
                        href={`/cities/${city.slug}`}
                        className="text-lg font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                      >
                        {city.name}
                      </Link>
                      <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {city.department}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-snug mb-2">
                      {enWhyLine(city, { month: idx })}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)]">
                        <Thermometer className="h-3 w-3" />
                        {dec1(sig.tempAvg)} °C
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)]">
                        <CloudRain className="h-3 w-3" />
                        {sig.rainDays} rainy days
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)]">
                        <Users className="h-3 w-3" />
                        {crowdLabel(sig.crowded)}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)] font-mono-data">
                        {profileLabel} score: {dec1(fit.profileScore)}/10
                      </span>
                      <span className="inline-flex items-center rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)] font-mono-data">
                        {BUDGET_TIER_LABEL[fit.budgetTier]}
                      </span>
                    </div>
                    <div className="mt-3">
                      <BookingCTA cityName={city.name} variant="compact" month={idx} locale="en" />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Ce que le mois change */}
      {(entrants.length > 0 || sortants.length > 0) && (
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
            What {label} changes
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-2xl">
            Compared with the{" "}
            <Link href={`/vacations/profile/${slug}`} className="underline">
              {profileLabel.toLowerCase()}
            </Link>{" "}
            ranking taken across the whole year, on the same pool of towns:{" "}
            <strong>
              {entrantsAll.length} of the top {COMPARE_DEPTH} change
            </strong>{" "}
            once you fix a date.{" "}
            {entrantsAll.length >= COMPARE_DEPTH / 2
              ? `In ${label}, the season decides more than the profile does.`
              : `The profile's core holds up well in ${label}.`}{" "}
            The clearest moves are below.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                {label} brings these in
              </h3>
              {entrants.length === 0 ? (
                <p className="text-xs text-[var(--text-tertiary)]">
                  None: in {label}, the top of this profile&apos;s ranking doesn&apos;t move.
                </p>
              ) : (
                <ul className="space-y-2">
                  {entrants.map(({ city, fit }) => {
                    const sig = monthSignal(city, idx);
                    return (
                      <li key={city.slug} className="text-sm">
                        <Link
                          href={`/cities/${city.slug}`}
                          className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                        >
                          {city.name}
                        </Link>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {" "}— {dec1(sig.tempAvg)} °C, {sig.rainDays} rainy days,{" "}
                          {crowdLabel(sig.crowded).toLowerCase()} · score {dec1(fit.score)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
            <Card>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
                <ArrowDownRight className="h-4 w-4 text-amber-600" />
                And these it pushes back
              </h3>
              {sortants.length === 0 ? (
                <p className="text-xs text-[var(--text-tertiary)]">
                  None: this profile&apos;s safe bets hold up in {label} too.
                </p>
              ) : (
                <ul className="space-y-2">
                  {sortants.map(({ city }) => {
                    const sig = monthSignal(city, idx);
                    return (
                      <li key={city.slug} className="text-sm">
                        <Link
                          href={`/cities/${city.slug}`}
                          className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                        >
                          {city.name}
                        </Link>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {" "}— {dec1(sig.tempAvg)} °C, {sig.rainDays} rainy days,{" "}
                          {crowdLabel(sig.crowded).toLowerCase()} this month
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>
          <p className="mt-3 text-xs text-[var(--text-tertiary)]">
            Being pushed back is not being ruled out: these towns still score well for this
            profile, they are simply less in their season in {label}.
          </p>
        </section>
      )}

      {/* Sans voiture */}
      {carFree.length >= 2 && (
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
            <TrainFront className="h-5 w-5 text-[var(--accent)]" aria-hidden />
            {label} without renting a car
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-2xl">
            {slug === "monoparental"
              ? "One adult at the wheel also means one adult who doesn't have to drive if you take the train. These destinations from this month's ranking are reachable by TGV (high-speed rail) or RER (the Paris regional network), and get around afterwards on metro, tram or bus rapid transit — or score high enough on transport to skip the rental."
              : "These destinations from this month's ranking are reachable by TGV (high-speed rail) or RER (the Paris regional network), and get around afterwards on metro, tram or bus rapid transit — or score high enough on transport to skip the rental."}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {carFree.map(({ city, score, tags }) => (
              <Link
                key={city.slug}
                href={`/cities/${city.slug}`}
                className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                    {city.name}
                  </span>
                  <span className="text-xs font-mono-data font-bold text-[var(--accent)] shrink-0">
                    {dec1(score)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-[var(--text-tertiary)]">
                  {tags.length > 0
                    ? tags.join(" · ")
                    : `Transport score ${dec1(city.scores.transport)}/10`}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Croisements */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
          Same profile, month by month
        </h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {EN_MONTH_SLUGS.map((_, i) => {
            const mi = (i + 1) as MonthIndex;
            if (mi === idx) return null;
            return (
              <Link
                key={mi}
                href={`/vacations/where-to-go/${enCrossingSlug(mi, slug)}`}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
              >
                {enMonthLabel(mi)}
              </Link>
            );
          })}
        </div>

        <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
          Same month, travelling with someone else
        </h2>
        <div className="flex flex-wrap gap-2">
          {VACATION_PROFILES.filter((p) => p !== slug).map((p) => (
            <Link
              key={p}
              href={`/vacations/where-to-go/${enCrossingSlug(idx, p)}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
            >
              <span aria-hidden>{VACATION_PROFILE_DEFS[p].emoji}</span>
              {EN_PROFILE_LABEL[p]}
            </Link>
          ))}
          <Link
            href={`/vacations/month/${enMonthSlug}`}
            className="rounded-full bg-[var(--accent)] text-white px-3 py-1 text-xs font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            ← All of {label}
          </Link>
          <Link
            href={`/vacations/profile/${slug}`}
            className="rounded-full border border-[var(--accent)]/40 px-3 py-1 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
          >
            {profileLabel} all year round
          </Link>
        </div>
      </section>

      {/* Méthodo */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-14">
        <Card className="bg-[var(--bg-elevated)]/40">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            How this ranking is built
          </h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Composite score = seasonal fit (~45%) + traveller profile (~25%) + the town&apos;s
            overall quality (~30%). The{" "}
            <strong>{profileLabel.toLowerCase()}</strong> profile recombines the site&apos;s
            scores differently ({PROFILE_PIVOT[slug]}). Monthly climate comes from
            Météo-France 1991-2020 normals at the nearest weather station, filled in by
            interpolation where a station doesn&apos;t publish the variable; crowd levels are
            estimated from the town&apos;s characteristics and adjusted by month. Population
            filter ≥ 8,000, the same one the profile ranking uses — that is what makes the
            two comparable.
            <br /><br />
            <strong>Read it the right way round:</strong> the season weighs more than the
            profile in the composite. This page answers &ldquo;among what holds up in{" "}
            {label}, what suits this profile best&rdquo;, not &ldquo;what is the best
            destination for this profile&rdquo;. For that second question, the{" "}
            <Link href={`/vacations/profile/${slug}`} className="underline">
              profile ranking
            </Link>{" "}
            is the right entry point.
            <br /><br />
            <strong>Known limits:</strong> climate interpolated to ±1.5 °C, no real-time
            pricing, crowd levels qualitative (1-5) rather than counted.
            <Link href="/methodology" className="underline ml-1">Full methodology</Link>.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>Météo-France climate data</Badge>
            <Badge>{CITIES_COUNT} towns scored</Badge>
          </div>
        </Card>
      </section>

      <Footer />
    </main>
  );
}
