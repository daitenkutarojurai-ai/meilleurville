// Live route since 2026-08-06 (F62). It stayed parked as `page.pending.tsx`
// while `data/city-biodiversity.json` was `{}`: `output: "export"` fails the
// build on an empty `generateStaticParams()`, which it cannot tell from a
// missing one.
//
// This page and its FR twin `app/villes/[slug]/biodiversite/` are hreflang
// alternates: they exist on both sides or on neither, and they show the SAME
// numbers (both read the same `biodiversityProfile`). Never unpark one alone.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { CityPhotoBand } from "@/components/CityPhoto";
import { cityPhoto } from "@/lib/city-images";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CITIES_SEED } from "@/data/cities-seed";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { cityAlternatesEn } from "@/lib/i18n";
import { scoreColor, scoreBg } from "@/lib/utils";
import {
  biodiversityProfile,
  hasBiodiversityData,
  groupLabel,
  speciesName,
  GROUP_ORDER,
  MIN_OCCURRENCES,
  MIN_OBSERVERS,
  PROTECTION_KIND_COUNT,
  protectionLabel,
  inpnUrl,
  BIODIVERSITY_MEASURABLE_COUNT,
  recordConcentration,
  SCORE_LEGEND_EN,
  GBIF_CREDIT,
  GBIF_URL,
  INPN_CREDIT,
  INPN_URL,
  OSM_CREDIT_EN,
  PARKS_PER_CITY_CAP,
  type SpeciesGroup,
} from "@/lib/biodiversity";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

/** Same conditional SSG as the FR twin — hreflang alternates must exist on both
 *  sides or neither, and they must show the same numbers. */
export function generateStaticParams() {
  return CITIES_SEED.filter((c) => hasBiodiversityData(c.slug)).map((c) => ({
    locale: "en",
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  const profile = biodiversityProfile(slug);
  if (!city || !profile) return {};

  const { raw, richness, richnessPending } = profile;
  // Title and description held under 60 / 160 characters across all 302 cities
  // (measured, not estimated — long names like Sainte-Geneviève-des-Bois set the
  // bound). The original ran over on 117 titles and 239 descriptions, and what
  // got cut in the SERP was the figures. Same lengths as the FR twin.
  const description = richness
    ? `${raw.species} species around ${city.name}, across ${raw.occurrences.toLocaleString("en-GB")} observations. Richness at equal survey effort: ${richness.score}/10. GBIF data.`
    : richnessPending === "incomparable" || richnessPending === "calibration"
      ? `${raw.species} species around ${city.name}, across ${raw.occurrences.toLocaleString("en-GB")} observations. Birds, insects and plants within ${raw.radiusKm} km. GBIF data.`
      : richnessPending === "precision"
        ? `Around ${city.name}, recorded richness is too imprecise to rank: our crawl cut the species list short. GBIF data.`
        : `Around ${city.name}, too few observations to publish a score: ${raw.occurrences.toLocaleString("en-GB")} observations from ${raw.observers} recorders. GBIF data.`;

  return {
    title: `${city.name} biodiversity · species and nature`,
    description,
    alternates: cityAlternatesEn("biodiversity", slug),
    openGraph: {
      // Without `images`, a page-level openGraph replaces the inherited one
      // wholesale — the social card vanished instead of falling back to it.
      images: ["/opengraph-image"],
      title: `Biodiversity in ${city.name}`,
      description: richness
        ? `${raw.species} species recorded within ${raw.radiusKm} km · ${richness.score}/10 at equal survey effort`
        : richnessPending === "incomparable" || richnessPending === "calibration"
          ? `${raw.species} species recorded within ${raw.radiusKm} km`
          : richnessPending === "precision"
            ? `Richness bracketed, not yet precise enough to rank — the raw measurements are shown instead`
            : `Survey effort too thin for a score — the raw measurements are shown instead`,
    },
  };
}

function ComponentBar({
  emoji,
  title,
  score,
  detail,
  missing,
}: {
  emoji: string;
  title: string;
  score: number | null;
  detail: string;
  missing?: string;
}) {
  return (
    <div className="rounded-2xl glass border border-white/50 p-5 shadow-sm">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <div className="text-sm font-semibold text-[var(--text-primary)]">
          {emoji} {title}
        </div>
        {score != null ? (
          <div className={`text-2xl font-black font-mono-data ${scoreColor(score)}`}>
            {score.toFixed(1)}
            <span className="text-xs font-normal text-[var(--text-tertiary)]">/10</span>
          </div>
        ) : (
          <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
            not measured
          </div>
        )}
      </div>
      {score != null && (
        <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden mb-2">
          <div
            className={`h-full rounded-full ${scoreBg(score)}`}
            style={{ width: `${Math.max(2, score * 10)}%` }}
          />
        </div>
      )}
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        {score != null ? detail : missing}
      </p>
    </div>
  );
}

export default async function BiodiversityPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const profile = biodiversityProfile(slug);
  if (!profile) notFound();

  const {
    raw,
    richness,
    richnessPending,
    protection,
    protectionPending,
    protectedAreas,
    greenSpace,
    greenSpacePending,
    greenSpaceTruncated,
    overall,
  } = profile;
  const photo = cityPhoto(city.slug);
  const concentration = recordConcentration(raw);

  const nb = (v: number) => v.toLocaleString("en-GB");

  // Same three states as the French twin, and the same rule: only a commune
  // that has not been ingested reads "not measured". One ingested with no
  // perimeter at all has been measured, and says so.
  const protectionDetail = protectedAreas
    ? `${nb(protectedAreas.weightedCoverage)} % of the ${protectedAreas.radiusKm} km disc under protection, ` +
      `weighted by level (${nb(protectedAreas.rawCoverage)} % under any designation at all). ` +
      `${nb(protectedAreas.areasTotal)} site${protectedAreas.areasTotal > 1 ? "s" : ""} recorded.`
    : "";
  const protectionMissing =
    protectionPending === "calibration" && protectedAreas
      ? protectedAreas.areasTotal === 0
        ? `No protected site within ${protectedAreas.radiusKm} km. That is a measurement, not missing data.`
        : `${nb(protectedAreas.weightedCoverage)} % of the disc under weighted protection. The rank out of 10 waits until more cities are ingested.`
      : `French INPN boundaries (Natura 2000, ZNIEFF, nature reserves, parks) are not integrated yet for this commune. "Not measured" means we do not know — not that there are none.`;

  const groups = GROUP_ORDER.map((g) => ({ id: g, count: raw.groups[g] ?? 0 })).filter(
    (g) => g.count > 0,
  );
  const groupMax = Math.max(1, ...groups.map((g) => g.count));

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: city.name, path: `/cities/${slug}` },
    { name: "Biodiversity", path: `/cities/${slug}/biodiversity` },
  ]);

  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Biodiversity recorded around ${city.name}`,
    description: richness
      ? `Species recorded within ${raw.radiusKm} km of ${city.name} since ${raw.yearFrom}, richness normalised to equal survey effort, and urban green space.`
      : `Species recorded within ${raw.radiusKm} km of ${city.name} since ${raw.yearFrom}, and urban green space. Raw counts: these records are not comparable between cities.`,
    creator: { "@type": "Organization", name: "BestCitiesInFrance" },
    isBasedOn: GBIF_URL,
    license: "https://creativecommons.org/licenses/by/4.0/",
    dateModified: raw.crawledAt,
    spatialCoverage: {
      "@type": "Place",
      name: city.name,
      geo: {
        "@type": "GeoCoordinates",
        latitude: city.latitude,
        longitude: city.longitude,
      },
    },
    variableMeasured: [
      // A truncated count is published as a minimum, not as a value: minValue
      // alone is how schema.org says "at least".
      raw.speciesTruncated
        ? { "@type": "PropertyValue", name: "Distinct species recorded", minValue: raw.species }
        : { "@type": "PropertyValue", name: "Distinct species recorded", value: raw.species },
      { "@type": "PropertyValue", name: "Observations", value: raw.occurrences },
      { "@type": "PropertyValue", name: "Distinct recorders", value: raw.observers },
      ...(richness
        ? [
            {
              "@type": "PropertyValue",
              name: `Species expected in ${raw.rarefiedN} observations (rarefaction)`,
              // Bracketed when the species facet was truncated: publish the
              // interval actually known, not its lower bound dressed up as a
              // measurement. Same numbers as the French twin.
              ...(raw.rarefiedExact
                ? { value: raw.rarefied }
                : { minValue: raw.rarefied, maxValue: raw.rarefiedUpper }),
            },
          ]
        : []),
    ],
  };

  return (
    <main id="main-content" className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(datasetJsonLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />

      <section className="relative pt-20 pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-5">
            <Link href="/cities" className="hover:text-[var(--text-secondary)]">Cities</Link>
            <span>/</span>
            <Link href={`/cities/${slug}`} className="hover:text-[var(--text-secondary)]">{city.name}</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">Biodiversity</span>
          </nav>
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            🦋 Biodiversity
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight leading-[1.05]">
            What lives around{" "}
            <span className="font-display gradient-text-anim italic">{city.name}</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl leading-relaxed">
            {richness ? (
              <>
                {raw.species.toLocaleString("en-GB")} species have been recorded within{" "}
                {raw.radiusKm} km since {raw.yearFrom}, across{" "}
                {raw.occurrences.toLocaleString("en-GB")} observations submitted by{" "}
                {raw.observers.toLocaleString("en-GB")} recorders. The score below normalises that
                richness to equal survey effort — without it, you would be ranking cities by their
                number of naturalists rather than by their nature.
              </>
            ) : richnessPending === "incomparable" ? (
              <>
                {raw.species.toLocaleString("en-GB")} species have been recorded within{" "}
                {raw.radiusKm} km since {raw.yearFrom}, across{" "}
                {raw.occurrences.toLocaleString("en-GB")} observations submitted by{" "}
                {raw.observers.toLocaleString("en-GB")} recorders. Those figures are what has been{" "}
                <strong>observed and submitted</strong> here. We no longer turn them into a score
                out of 10: the ranking we built from them tracked the kind of recording programme
                operating around each city, not what lives there. Details at the bottom of the page.
              </>
            ) : richnessPending === "calibration" ? (
              <>
                {raw.species.toLocaleString("en-GB")} species have been recorded within{" "}
                {raw.radiusKm} km since {raw.yearFrom}. The score out of 10 arrives once enough
                cities have been surveyed for &ldquo;better than N% of the others&rdquo; to mean
                anything — the measurements themselves are already here.
              </>
            ) : richnessPending === "precision" ? (
              <>
                {raw.occurrences.toLocaleString("en-GB")} observations have been submitted here by{" "}
                {raw.observers.toLocaleString("en-GB")} recorders — ample to measure. What is
                missing is on <strong>our</strong> side: the species list GBIF returned was cut
                short, so richness is only bracketed. We would rather not rank the city on an
                interval that wide. The counts themselves are exact and shown below.
              </>
            ) : (
              <>
                Too few naturalist observations have been submitted here to publish a richness
                score. That is <strong>not</strong> a verdict on the ecology: it is a verdict on the
                data. What has been measured is shown as-is below.
              </>
            )}
          </p>
        </div>

        {photo && <CityPhotoBand photo={photo} cityName={city.name} className="mt-8" />}
      </section>

      <section className="relative pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {richness ? (
            <div className="rounded-2xl glass border border-white/50 p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <div className="text-xs text-[var(--text-tertiary)] mb-1">
                    Richness at equal survey effort
                  </div>
                  <div className={`text-5xl font-black font-mono-data ${scoreColor(richness.score)}`}>
                    {richness.score.toFixed(1)}
                    <span className="text-lg font-normal text-[var(--text-tertiary)]">/10</span>
                  </div>
                </div>
                <div className="text-sm text-[var(--text-secondary)] max-w-lg leading-relaxed">
                  {SCORE_LEGEND_EN}. Better than {richness.percentile}% of the{" "}
                  {BIODIVERSITY_MEASURABLE_COUNT} cities surveyed well enough to be compared. You
                  would expect{" "}
                  <strong>
                    {raw.rarefiedExact ? "" : "at least "}
                    {richness.value.toLocaleString("en-GB")} species
                  </strong>{" "}
                  here in a random sample of {raw.rarefiedN} observations — that figure, identical
                  for every city, is the one that is comparable.
                  {!raw.rarefiedExact && (
                    <>
                      {" "}
                      Because the species list was cut short at collection, this is a lower bound
                      (at most {raw.rarefiedUpper?.toLocaleString("en-GB")}): {city.name}&rsquo;s
                      true rank can only be better.
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : richnessPending === "incomparable" ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                Why there is no richness score
              </div>
              <div className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-3">
                <p>
                  We published a richness score until 10 August 2026, then withdrew it. Checked
                  across all 540 cities, it correlated <strong>−0.77</strong> with how concentrated
                  the local records are — the share of observations held by a handful of species —
                  and only <strong>+0.10</strong> with the number of species actually recorded. It
                  was not ranking nature; it was ranking the kind of recording programme operating
                  around each city.
                </p>
                <p>
                  The reason is technical, and fits in one sentence: a field observation and an
                  ultrasonic detector&apos;s automatic contact count for the same thing in GBIF.
                  Wherever such a device runs, a single species can take up most of the
                  observations and swamp the calculation.
                  {concentration != null && (
                    <>
                      {" "}
                      Here, the five most-recorded species account for{" "}
                      <strong>
                        {(concentration * 100).toLocaleString("en-GB", {
                          maximumFractionDigits: 0,
                        })}
                        %
                      </strong>{" "}
                      of observations.
                    </>
                  )}
                </p>
                <p>
                  The result was visible on screen: Guadeloupe and French Guiana — by far the most
                  species-rich French territories — came out last, and the département alone
                  explained <strong>56%</strong> of the score. We would rather show the raw counts,
                  which are exact, and draw no conclusion from them, than keep a ranking that was
                  wrong but looked good. Fixing it means going back to GBIF and weighting by
                  dataset: that is collection work, not display work.
                </p>
              </div>
            </div>
          ) : richnessPending === "calibration" ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                Measured, but not yet comparable
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                The survey record for {city.name} is solid:{" "}
                <strong>{raw.occurrences.toLocaleString("en-GB")} observations</strong> from{" "}
                <strong>{raw.observers.toLocaleString("en-GB")}</strong> recorders, and{" "}
                <strong>{raw.rarefied?.toLocaleString("en-GB")} species</strong> expected per{" "}
                {raw.rarefiedN} observations. But our mark out of 10 is a rank — it says
                &ldquo;better than N% of other cities&rdquo; — and only{" "}
                {BIODIVERSITY_MEASURABLE_COUNT} cities have been surveyed so far. Publishing one now
                would mean scoring a city by how far our crawl has got. The figures below are true
                today.
              </p>
            </div>
          ) : richnessPending === "precision" ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <div className="text-sm font-semibold text-amber-900 mb-2">
                Richness bracketed, not ranked
              </div>
              <p className="text-sm text-amber-900/80 leading-relaxed">
                Rarefaction needs the complete list of species and their counts. For {city.name}{" "}
                that list runs past what our collection retrieved in one pass, so all we know is
                that the number of species expected per {raw.rarefiedN} observations falls{" "}
                <strong>
                  between {raw.rarefied?.toLocaleString("en-GB")} and{" "}
                  {raw.rarefiedUpper?.toLocaleString("en-GB")}
                </strong>
                . Both bounds are sound, but the gap between them is wide enough to move the city in
                the ranking — the rank would then report where our collection stopped, not what
                lives here. This is our shortcoming and it is fixable: the city will be re-run with
                deeper paging.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <div className="text-sm font-semibold text-amber-900 mb-2">
                Survey effort too thin — no score published
              </div>
              <p className="text-sm text-amber-900/80 leading-relaxed">
                A richness figure needs at least {MIN_OCCURRENCES} observations and{" "}
                {MIN_OBSERVERS} distinct recorders to mean anything. Here:{" "}
                <strong>{raw.occurrences.toLocaleString("en-GB")} observations</strong> from{" "}
                <strong>{raw.observers}</strong> people. Below that, a species count mostly measures
                how many naturalists passed through and what those particular people look at. We
                would rather say so than fill the gap with a departmental average.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="relative pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
            Three different things, measured three different ways
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-2xl leading-relaxed">
            They do not substitute for one another: a city can be ringed by protected land and have
            no park of its own, or the reverse. We show them separately rather than melted into a
            single number.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <ComponentBar
              emoji="🦋"
              title="Species richness"
              score={richness?.score ?? null}
              detail={`${raw.species.toLocaleString("en-GB")} species recorded, normalised to a common sample of ${raw.rarefiedN} observations. GBIF, ${raw.radiusKm} km radius, since ${raw.yearFrom}.`}
              missing={
                richnessPending === "incomparable"
                  ? `${raw.species.toLocaleString("en-GB")} species recorded here — an exact count, but not comparable between cities: the score built from these records ranked recording programmes, not nature. Withdrawn on 10 August 2026.`
                  : richnessPending === "calibration"
                  ? `${raw.rarefied?.toLocaleString("en-GB")} species expected per ${raw.rarefiedN} observations${raw.rarefiedExact ? "" : " (lower bound)"}. The rank out of 10 waits until more cities are surveyed.`
                  : richnessPending === "precision"
                    ? `Between ${raw.rarefied?.toLocaleString("en-GB")} and ${raw.rarefiedUpper?.toLocaleString("en-GB")} species expected per ${raw.rarefiedN} observations: too wide an interval to rank.`
                  : `Only ${raw.occurrences.toLocaleString("en-GB")} observations: below the ${MIN_OCCURRENCES} floor, the statistic does not exist.`
              }
            />
            <ComponentBar
              emoji="🛡️"
              title="Protected areas"
              score={protection?.score ?? null}
              detail={protectionDetail}
              missing={protectionMissing}
            />
            <ComponentBar
              emoji="🌳"
              title="Urban green space"
              score={greenSpace?.score ?? null}
              detail={
                greenSpace
                  ? greenSpaceTruncated
                    ? `At least ${greenSpace.value.toLocaleString("en-GB")} m² of named parks per resident. The OpenStreetMap survey stops at the commune's ${PARKS_PER_CITY_CAP} largest parks: the smaller ones beyond that are not counted, so this figure is a floor.`
                    : `${greenSpace.value.toLocaleString("en-GB")} m² of named parks per resident. Mapped on OpenStreetMap, whose coverage varies from town to town.`
                  : ""
              }
              missing={
                greenSpacePending === "data"
                  ? "The OpenStreetMap survey has not covered this commune yet."
                  : "OpenStreetMap maps no named park for this commune. That is a gap in the map rather than a finding on the ground: an unmapped commune and a commune without greenery look identical in the data. We publish no score rather than a misleading zero."
              }
            />
          </div>

          {overall == null && (
            <p className="text-xs text-[var(--text-tertiary)] mt-3 leading-relaxed max-w-3xl">
              <strong className="text-[var(--text-secondary)]">No overall score yet.</strong> It
              needs all three components, and{" "}
              {[
                richness ? null : "species richness",
                protection ? null : "protected areas",
                greenSpace ? null : "green space",
              ]
                .filter(Boolean)
                .join(" and ")}{" "}
              {[richness, protection, greenSpace].filter((c) => !c).length > 1 ? "are" : "is"} still
              missing here. Reweighting the components we do have to paper over the gap would
              produce a number that does not measure what its name claims.
              {!protection && (
                <>
                  {" "}
                  Protected areas are the heaviest of the three: a Natura 2000 boundary exists
                  regardless of who turns up to record it, so it is the one component immune to the
                  effort bias.
                </>
              )}
            </p>
          )}
        </div>
      </section>

      {protectedAreas && (
        <section className="relative pb-8">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
              Protected areas within {protectedAreas.radiusKm} km
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              {protectedAreas.areasTotal === 0 ? (
                <>
                  No protected site recorded within this radius. That is a measurement result, not
                  missing data: the national layers were run over this disc and found nothing.
                </>
              ) : (
                <>
                  Areas are measured on the share of each site that falls inside the radius, not on
                  the whole site. French designations nest inside one another — a ZNIEFF I almost
                  always sits within a ZNIEFF II — so the coverage above does not add them up: every
                  patch of ground counts once, at the strongest level of protection that applies to
                  it.
                </>
              )}
            </p>
            {protectedAreas.areas.length > 0 && (
              <div className="space-y-2">
                {protectedAreas.areas.map((a, i) => {
                  const href = inpnUrl(a);
                  const label = a.name ?? a.id ?? protectionLabel(a.kind, "en");
                  return (
                    <div
                      key={`${a.kind}-${a.id ?? i}`}
                      className="flex items-baseline gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-[var(--text-primary)] truncate">
                          {href ? (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-[var(--accent)] hover:underline"
                            >
                              {label}
                            </a>
                          ) : (
                            label
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--text-tertiary)]">
                          {protectionLabel(a.kind, "en")}
                          {a.distanceKm > 0
                            ? ` · ${nb(a.distanceKm)} km away`
                            : " · the city centre sits inside it"}
                        </div>
                      </div>
                      <div className="shrink-0 text-right text-sm font-mono-data text-[var(--text-primary)]">
                        {nb(Math.round(a.areaHa))}
                        <span className="text-[11px] font-normal text-[var(--text-tertiary)]">
                          {" "}
                          ha
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {protectedAreas.areasTruncated && (
              <p className="text-[11px] text-[var(--text-tertiary)] mt-2">
                {nb(protectedAreas.areasTotal)} sites in total; the {protectedAreas.areas.length}{" "}
                largest are listed. The coverage figure above counts them all.
              </p>
            )}
            {protectedAreas.kinds.length < PROTECTION_KIND_COUNT && (
              <p className="text-[11px] text-[var(--text-tertiary)] mt-2">
                Partial pass: {protectedAreas.kinds.length} of the {PROTECTION_KIND_COUNT} national
                layers were available ({protectedAreas.kinds.map((k) => protectionLabel(k, "en")).join(", ")}).
                The coverage figure is therefore a floor.
              </p>
            )}
          </div>
        </section>
      )}

      {groups.length > 0 && (
        <section className="relative pb-8">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">By major group</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Distinct species, not observations — otherwise this would mostly describe what people
              photograph the most.
            </p>
            <div className="space-y-2">
              {groups.map((g) => (
                <div key={g.id} className="flex items-center gap-3">
                  <div className="w-28 shrink-0 text-sm text-[var(--text-secondary)]">
                    {groupLabel(g.id as SpeciesGroup, "en")}
                  </div>
                  <div className="flex-1 h-5 rounded-md bg-[var(--border)] overflow-hidden">
                    <div
                      className="h-full rounded-md bg-emerald-500/70"
                      style={{ width: `${Math.max(2, (g.count / groupMax) * 100)}%` }}
                    />
                  </div>
                  <div className="w-16 shrink-0 text-right text-sm font-mono-data text-[var(--text-primary)]">
                    {g.count.toLocaleString("en-GB")}
                  </div>
                </div>
              ))}
            </div>
            {raw.groupsTruncated.length > 0 && (
              <p className="text-[11px] text-[var(--text-tertiary)] mt-2">
                Groups capped by the API's facet paging (the true total is higher):{" "}
                {raw.groupsTruncated.map((g) => groupLabel(g, "en")).join(", ")}.
              </p>
            )}
          </div>
        </section>
      )}

      {raw.topSpecies.length > 0 && (
        <section className="relative pb-8">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
              The species you are most likely to see
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              The most-recorded in the area — so the easiest to spot, not the rarest.
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {raw.topSpecies.map((sp) => (
                <div
                  key={sp.key}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3"
                >
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    {speciesName(sp, "en")}
                  </div>
                  {sp.vernacularEn && sp.scientificName && (
                    <div className="text-xs italic text-[var(--text-tertiary)]">
                      {sp.scientificName}
                    </div>
                  )}
                  <div className="text-[11px] text-[var(--text-tertiary)] mt-1">
                    {sp.count.toLocaleString("en-GB")} observations
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {raw.threatenedSpecies > 0 && (
        <section className="relative pb-8">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="rounded-2xl glass border border-white/50 p-5 shadow-sm">
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                ⚠️ {raw.threatenedSpecies} threatened species recorded in the area
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Listed as vulnerable, endangered or critically endangered on the{" "}
                <strong>global</strong> IUCN Red List. Read it carefully: that is the species'
                global status, not the French national red list — a species common here can be
                threatened elsewhere, and the reverse. National statuses will come from the INPN.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="relative pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">How this is measured</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Observations", value: raw.occurrences.toLocaleString("en-GB") },
              {
                label: "Recorders",
                value: `${raw.observers.toLocaleString("en-GB")}${raw.observersTruncated ? "+" : ""}`,
              },
              {
                label: "Distinct species",
                value: `${raw.species.toLocaleString("en-GB")}${raw.speciesTruncated ? "+" : ""}`,
              },
              { label: "Datasets", value: raw.datasets.toLocaleString("en-GB") },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl glass border border-white/50 p-4 shadow-sm">
                <div className="text-xs text-[var(--text-tertiary)] mb-1">{s.label}</div>
                <div className="text-2xl font-black font-mono-data text-[var(--text-primary)]">
                  {s.value}
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-xs text-[var(--text-secondary)] leading-relaxed space-y-2">
            <p>
              <strong className="text-[var(--text-primary)]">The trap this score avoids.</strong> A
              raw observation count measures how many naturalists type records into a phone. Paris
              beats any Pyrenean valley on volume — and a distinct-species count inherits the same
              bias, because species accumulate with sampling: look ten times longer and you will
              find more of them.
            </p>
            <p>
              <strong className="text-[var(--text-primary)]">The correction.</strong> We compute the
              number of species expected in a random sample of {raw.rarefiedN} observations
              (Hurlbert rarefaction, 1971), so every city is compared at the same effort. Below{" "}
              {MIN_OCCURRENCES} observations or {MIN_OBSERVERS} recorders we publish no score: you
              cannot subsample more than you have.
            </p>
            <p>
              <strong className="text-[var(--text-primary)]">The limit of the calculation.</strong>{" "}
              Rarefaction needs the complete list of species and their counts. When that list runs
              past what one collection pass retrieves — the case for the best-surveyed cities — the
              exact figure is not knowable; we bracket it between two sound bounds and report the
              lower one as such, prefixed with &ldquo;at least&rdquo;. If the interval is too wide
              to separate the city from its neighbours, no rank is published.
            </p>
            <p>
              <strong className="text-[var(--text-primary)]">What the city is compared to.</strong>{" "}
              Collection now covers all {CITIES_SEED.length} cities on this site, so the population
              is no longer a work in progress. The rank is read among the{" "}
              {BIODIVERSITY_MEASURABLE_COUNT} of them that are surveyed well enough to be compared;
              the rest are held back by the survey-effort and precision thresholds set out above,
              not by any gap in our crawl. So it reads &ldquo;better than N% of the French cities we
              can measure&rdquo; rather than &ldquo;better than N% of French cities&rdquo;. The raw
              counts do not depend on other cities at all.
            </p>
            <p>
              <strong className="text-[var(--text-primary)]">The perimeter.</strong> A{" "}
              {raw.radiusKm} km circle around the city centre, georeferenced observations since{" "}
              {raw.yearFrom}, freely licensed records only (CC0 and CC BY). The radius deliberately
              spills past the commune: nature does not stop at administrative boundaries.
            </p>
          </div>
        </div>
      </section>

      <section className="relative pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-xs text-[var(--text-tertiary)] leading-relaxed">
            <strong className="text-[var(--text-secondary)]">Sources:</strong> occurrence data from{" "}
            <a href={GBIF_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
              {GBIF_CREDIT}
            </a>
            , retrieved {raw.crawledAt} ({raw.licenses.join(", ")}).{" "}
            {protectedAreas && (
              <>
                Protected areas:{" "}
                <a
                  href={INPN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] hover:underline"
                >
                  {INPN_CREDIT}
                </a>
                , boundaries as of {protectedAreas.crawledAt}, intersected on a{" "}
                {protectedAreas.gridStepM} m grid.{" "}
              </>
            )}
            Green space: {OSM_CREDIT_EN},
            licensed ODbL. Figures come from the GBIF search API, which does not mint a download
            DOI; the access date and query perimeter are stated so the calculation is reproducible.
          </div>
        </div>
      </section>

      <section className="relative pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex gap-3 flex-wrap">
          <Link
            href={`/cities/${slug}`}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            ← Full profile of {city.name}
          </Link>
          <Link
            href={`/cities/${slug}/parks`}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            🌳 Parks in {city.name}
          </Link>
          <Link
            href={`/cities/${slug}/air-quality`}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            🌬️ Air quality
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
        <DiscussionCTA citySlug={city.slug} cityName={city.name} locale="en" />
      </section>

      <Footer />
    </main>
  );
}
