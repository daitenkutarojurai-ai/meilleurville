// ⚠️ PARKED — rename to `page.tsx` with the FIRST batch of GBIF data.
//
// The page is finished and typechecked; it is not a route yet. Single reason:
// `output: "export"` rejects a `generateStaticParams()` that returns an empty
// array, and it is empty while `data/city-biodiversity.json` is `{}`. Next
// cannot tell "no params" from "no function" and fails the build with
// "missing generateStaticParams()".
//
// The file keeps its `.tsx` extension so `npx tsc --noEmit` still checks it —
// it cannot rot while it waits. Once the crawl covers even one city,
// `git mv page.pending.tsx page.tsx` (here and on the FR twin
// `app/villes/[slug]/biodiversite/`) is all it takes: the sitemap and the 🦋
// CityProfile card are already wired to the same `hasBiodiversityData` gate.
//
// Both files must be re-activated TOGETHER: they are hreflang alternates, so
// they exist on both sides or on neither.
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
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { scoreColor, scoreBg } from "@/lib/utils";
import {
  biodiversityProfile,
  hasBiodiversityData,
  groupLabel,
  speciesName,
  GROUP_ORDER,
  MIN_OCCURRENCES,
  MIN_OBSERVERS,
  PROTECTED_RADIUS_KM,
  BIODIVERSITY_MEASURABLE_COUNT,
  SCORE_LEGEND_EN,
  GBIF_CREDIT,
  GBIF_URL,
  OSM_CREDIT_EN,
  type SpeciesGroup,
} from "@/lib/biodiversity";

const EN_BASE = ORIGIN_BY_LOCALE.en;

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
  const description = richness
    ? `${raw.species} species recorded around ${city.name} across ${raw.occurrences.toLocaleString("en-GB")} observations. Richness at equal survey effort: ${richness.score}/10. Birds, insects, plants — GBIF data.`
    : richnessPending === "calibration"
      ? `${raw.species} species recorded around ${city.name} across ${raw.occurrences.toLocaleString("en-GB")} observations. Birds, insects, plants and green space, measured within ${raw.radiusKm} km. GBIF data.`
      : `Around ${city.name}, naturalist survey effort is too thin to publish a score: ${raw.occurrences.toLocaleString("en-GB")} observations from ${raw.observers} recorders. What is measured is shown as-is. GBIF data.`;

  return {
    title: `Biodiversity in ${city.name} · species, nature and green space`,
    description,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/biodiversity` },
    openGraph: {
      title: `Biodiversity in ${city.name}`,
      description: richness
        ? `${raw.species} species recorded within ${raw.radiusKm} km · ${richness.score}/10 at equal survey effort`
        : richnessPending === "calibration"
          ? `${raw.species} species recorded within ${raw.radiusKm} km`
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

  const { raw, richness, richnessPending, protection, greenSpace, overall } = profile;
  const photo = cityPhoto(city.slug);

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
    description: `Species recorded within ${raw.radiusKm} km of ${city.name} since ${raw.yearFrom}, richness normalised to equal survey effort, and urban green space.`,
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
      { "@type": "PropertyValue", name: "Distinct species recorded", value: raw.species },
      { "@type": "PropertyValue", name: "Observations", value: raw.occurrences },
      { "@type": "PropertyValue", name: "Distinct recorders", value: raw.observers },
      ...(richness
        ? [
            {
              "@type": "PropertyValue",
              name: `Species expected in ${raw.rarefiedN} observations (rarefaction)`,
              value: raw.rarefied,
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
            ) : richnessPending === "calibration" ? (
              <>
                {raw.species.toLocaleString("en-GB")} species have been recorded within{" "}
                {raw.radiusKm} km since {raw.yearFrom}. The score out of 10 arrives once enough
                cities have been surveyed for &ldquo;better than N% of the others&rdquo; to mean
                anything — the measurements themselves are already here.
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
                  would expect <strong>{richness.value.toLocaleString("en-GB")} species</strong> here
                  in a random sample of {raw.rarefiedN} observations — that figure, identical for
                  every city, is the one that is comparable.
                </div>
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
                richnessPending === "calibration"
                  ? `${raw.rarefied?.toLocaleString("en-GB")} species expected per ${raw.rarefiedN} observations. The rank out of 10 waits until more cities are surveyed.`
                  : `Only ${raw.occurrences.toLocaleString("en-GB")} observations: below the ${MIN_OCCURRENCES} floor, the statistic does not exist.`
              }
            />
            <ComponentBar
              emoji="🛡️"
              title="Protected areas"
              score={protection?.score ?? null}
              detail={`Protected sites within ${PROTECTED_RADIUS_KM} km, weighted by their level of protection.`}
              missing={`French INPN boundaries (Natura 2000, ZNIEFF, nature reserves, parks) are not integrated yet. "Not measured" means we do not know — not that there are none.`}
            />
            <ComponentBar
              emoji="🌳"
              title="Urban green space"
              score={greenSpace?.score ?? null}
              detail={
                greenSpace
                  ? `${greenSpace.value.toLocaleString("en-GB")} m² of named parks per resident. Mapped on OpenStreetMap, whose coverage varies from town to town.`
                  : ""
              }
              missing="No named park is mapped on OpenStreetMap for this commune."
            />
          </div>

          {overall == null && (
            <p className="text-xs text-[var(--text-tertiary)] mt-3 leading-relaxed max-w-3xl">
              <strong className="text-[var(--text-secondary)]">No overall score yet.</strong> It
              would need all three components, and protected areas are still missing — which is the
              heaviest of the three: a Natura 2000 boundary exists regardless of who turns up to
              record it, so it is the one component immune to the effort bias. Reweighting the other
              two to paper over the gap would produce a number that does not measure what its name
              claims.
            </p>
          )}
        </div>
      </section>

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
            , retrieved {raw.crawledAt} ({raw.licenses.join(", ")}). Green space: {OSM_CREDIT_EN},
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
