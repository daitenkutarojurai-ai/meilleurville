// ⚠️ PARKED — renommer en `page.tsx` avec le PREMIER lot de données GBIF.
//
// La page est finie et typée ; elle n'est pas encore une route. Raison unique :
// `output: "export"` refuse un `generateStaticParams()` qui renvoie un tableau
// vide, et il est vide tant que `data/city-biodiversity.json` vaut `{}`. Next
// ne distingue pas « aucun paramètre » de « fonction absente » et casse le
// build avec « missing generateStaticParams() ».
//
// Ce fichier reste en `.tsx` donc `npx tsc --noEmit` continue de le vérifier :
// il ne peut pas pourrir en attendant. Le jour où le crawl couvre ne serait-ce
// qu'une ville, `git mv page.pending.tsx page.tsx` (ici et sur la jumelle EN
// `app/[locale]/cities/[slug]/biodiversity/`) suffit — le sitemap et la carte
// 🦋 de CityProfile sont déjà câblés sur la même condition `hasBiodiversityData`.
//
// Les deux fichiers doivent être réactivés ENSEMBLE : ce sont des alternates
// hreflang, ils existent des deux côtés ou d'aucun.
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
import { scoreColor, scoreBg } from "@/lib/utils";
import { cityAlternates } from "@/lib/i18n";
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
  SCORE_LEGEND_FR,
  GBIF_CREDIT,
  GBIF_URL,
  INPN_CREDIT,
  INPN_URL,
  OSM_CREDIT,
  type SpeciesGroup,
} from "@/lib/biodiversity";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

/**
 * SSG only over cities whose GBIF crawl has landed in
 * data/city-biodiversity.json. Same rule as F59's /parcs: a city with no data
 * emits no route, because a page saying "on ne sait pas" for 500 slugs is noise
 * to index. As the crawl advances batch by batch, slugs pop into the build.
 *
 * Note the deliberate asymmetry with the effort floor: a crawled-but-thin city
 * DOES get a page. Its data exists, it just says the observation effort is too
 * low to score — and that is a real, useful answer, unlike silence.
 */
export function generateStaticParams() {
  return CITIES_SEED.filter((c) => hasBiodiversityData(c.slug)).map((c) => ({
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
    ? `${raw.species} espèces recensées autour de ${city.name} sur ${raw.occurrences.toLocaleString("fr-FR")} observations. Richesse ramenée à effort d'observation égal : ${richness.score}/10. Oiseaux, insectes, flore — données GBIF.`
    : richnessPending === "calibration"
      ? `${raw.species} espèces recensées autour de ${city.name} sur ${raw.occurrences.toLocaleString("fr-FR")} observations. Oiseaux, insectes, flore et espaces verts, mesurés dans un rayon de ${raw.radiusKm} km. Données GBIF.`
      : `Autour de ${city.name}, l'effort d'observation naturaliste est trop faible pour publier un score : ${raw.occurrences.toLocaleString("fr-FR")} observations, ${raw.observers} observateurs. Ce qui est mesuré est affiché tel quel. Données GBIF.`;

  return {
    title: `Biodiversité à ${city.name} · espèces, nature et espaces verts`,
    description,
    alternates: cityAlternates("biodiversite", slug),
    openGraph: {
      title: `Biodiversité à ${city.name}`,
      description: richness
        ? `${raw.species} espèces recensées dans un rayon de ${raw.radiusKm} km · ${richness.score}/10 à effort d'observation égal`
        : richnessPending === "calibration"
          ? `${raw.species} espèces recensées dans un rayon de ${raw.radiusKm} km`
          : `Effort d'observation insuffisant pour un score — les mesures brutes sont affichées`,
    },
  };
}

/** Barre d'une composante. `null` = donnée absente, et ça se lit. */
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
            {score.toFixed(1).replace(".", ",")}
            <span className="text-xs font-normal text-[var(--text-tertiary)]">/10</span>
          </div>
        ) : (
          <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
            non mesuré
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

export default async function BiodiversitePage({ params }: Props) {
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
    overall,
  } = profile;
  const photo = cityPhoto(city.slug);

  const nb = (v: number) => v.toLocaleString("fr-FR");

  // Trois états à distinguer, et un seul se dit « non mesuré » : la commune
  // n'est pas encore ingérée. Une commune ingérée sans aucun périmètre a été
  // mesurée — la page l'écrit, plutôt que de laisser croire à un trou de
  // données.
  const protectionDetail = protectedAreas
    ? `${nb(protectedAreas.weightedCoverage)} % du disque de ${protectedAreas.radiusKm} km sous protection, ` +
      `pondéré par le niveau (${nb(protectedAreas.rawCoverage)} % sous un zonage quelconque). ` +
      `${nb(protectedAreas.areasTotal)} périmètre${protectedAreas.areasTotal > 1 ? "s" : ""} relevé${protectedAreas.areasTotal > 1 ? "s" : ""}.`
    : "";
  const protectionMissing =
    protectionPending === "calibration" && protectedAreas
      ? protectedAreas.areasTotal === 0
        ? `Aucun périmètre protégé à moins de ${protectedAreas.radiusKm} km. C'est une mesure, pas une absence de donnée.`
        : `${nb(protectedAreas.weightedCoverage)} % du disque sous protection pondérée. Le rang sur 10 attend que davantage de villes soient ingérées.`
      : `Les périmètres INPN (Natura 2000, ZNIEFF, réserves, parcs) ne sont pas encore intégrés pour cette commune. « Non mesuré » veut dire que nous ne savons pas — pas qu'il n'y en a aucun.`;

  const groups = GROUP_ORDER.map((g) => ({ id: g, count: raw.groups[g] ?? 0 })).filter(
    (g) => g.count > 0,
  );
  const groupMax = Math.max(1, ...groups.map((g) => g.count));

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${slug}` },
    { name: "Biodiversité", path: `/villes/${slug}/biodiversite` },
  ]);

  // Dataset plutôt qu'Article : la page expose une mesure et ses conditions de
  // production, avec sa licence et sa date d'accès.
  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Biodiversité observée autour de ${city.name}`,
    description: `Espèces recensées dans un rayon de ${raw.radiusKm} km autour de ${city.name} depuis ${raw.yearFrom}, richesse ramenée à effort d'observation égal, et espaces verts urbains.`,
    creator: { "@type": "Organization", name: "MaVilleIdéale" },
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
      { "@type": "PropertyValue", name: "Espèces distinctes recensées", value: raw.species },
      { "@type": "PropertyValue", name: "Observations", value: raw.occurrences },
      { "@type": "PropertyValue", name: "Observateurs distincts", value: raw.observers },
      ...(richness
        ? [
            {
              "@type": "PropertyValue",
              name: `Espèces attendues pour ${raw.rarefiedN} observations (raréfaction)`,
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
            <Link href="/villes" className="hover:text-[var(--text-secondary)]">Villes</Link>
            <span>/</span>
            <Link href={`/villes/${slug}`} className="hover:text-[var(--text-secondary)]">{city.name}</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">Biodiversité</span>
          </nav>
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            🦋 Biodiversité
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight leading-[1.05]">
            Ce qui vit autour de{" "}
            <span className="font-display gradient-text-anim italic">{city.name}</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl leading-relaxed">
            {richness ? (
              <>
                {raw.species.toLocaleString("fr-FR")} espèces ont été recensées dans un rayon de{" "}
                {raw.radiusKm} km depuis {raw.yearFrom}, sur{" "}
                {raw.occurrences.toLocaleString("fr-FR")} observations déposées par{" "}
                {raw.observers.toLocaleString("fr-FR")} naturalistes. Le score ci-dessous ramène
                cette richesse à effort d&apos;observation égal — sans quoi on classerait les villes
                par nombre de naturalistes, pas par nature.
              </>
            ) : richnessPending === "calibration" ? (
              <>
                {raw.species.toLocaleString("fr-FR")} espèces ont été recensées dans un rayon de{" "}
                {raw.radiusKm} km depuis {raw.yearFrom}. La note sur 10 arrivera quand assez de
                villes auront été relevées pour que « mieux que N&nbsp;% des autres » veuille dire
                quelque chose — les mesures, elles, sont déjà là.
              </>
            ) : (
              <>
                Trop peu d&apos;observations naturalistes ont été déposées ici pour publier un score
                de richesse. Ce n&apos;est <strong>pas</strong> un constat de pauvreté écologique :
                c&apos;est un constat sur la donnée. Ce qui est mesuré est affiché tel quel, plus bas.
              </>
            )}
          </p>
        </div>

        {photo && <CityPhotoBand photo={photo} cityName={city.name} className="mt-8" />}
      </section>

      {/* ── Le score, ou l'absence de score assumée ────────────────────── */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {richness ? (
            <div className="rounded-2xl glass border border-white/50 p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <div className="text-xs text-[var(--text-tertiary)] mb-1">
                    Richesse à effort d&apos;observation égal
                  </div>
                  <div className={`text-5xl font-black font-mono-data ${scoreColor(richness.score)}`}>
                    {richness.score.toFixed(1).replace(".", ",")}
                    <span className="text-lg font-normal text-[var(--text-tertiary)]">/10</span>
                  </div>
                </div>
                <div className="text-sm text-[var(--text-secondary)] max-w-lg leading-relaxed">
                  {SCORE_LEGEND_FR}. Mieux que {richness.percentile} % des{" "}
                  {BIODIVERSITY_MEASURABLE_COUNT} villes suffisamment relevées pour être comparées.
                  On attend <strong>{richness.value.toLocaleString("fr-FR")} espèces</strong> ici
                  dans un échantillon de {raw.rarefiedN} observations tirées au hasard — c&apos;est
                  ce nombre-là, identique pour toutes les villes, qui est comparable.
                </div>
              </div>
            </div>
          ) : richnessPending === "calibration" ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                Mesure faite, comparaison pas encore possible
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Le relevé de {city.name} est solide :{" "}
                <strong>{raw.occurrences.toLocaleString("fr-FR")} observations</strong> par{" "}
                <strong>{raw.observers.toLocaleString("fr-FR")}</strong> naturalistes, et{" "}
                <strong>{raw.rarefied?.toLocaleString("fr-FR")} espèces</strong> attendues pour{" "}
                {raw.rarefiedN} observations. Mais notre note sur 10 est un rang : elle dit « mieux
                que N&nbsp;% des autres villes », et seules{" "}
                {BIODIVERSITY_MEASURABLE_COUNT} villes sont relevées à ce jour. En publier une
                maintenant reviendrait à noter une ville d&apos;après l&apos;avancement de notre
                crawl. Les chiffres ci-dessous, eux, sont vrais dès aujourd&apos;hui.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <div className="text-sm font-semibold text-amber-900 mb-2">
                Effort d&apos;observation insuffisant — aucun score publié
              </div>
              <p className="text-sm text-amber-900/80 leading-relaxed">
                Il faut au moins {MIN_OCCURRENCES} observations et {MIN_OBSERVERS} observateurs
                distincts pour qu&apos;un chiffre de richesse veuille dire quelque chose. Ici :{" "}
                <strong>{raw.occurrences.toLocaleString("fr-FR")} observations</strong> déposées par{" "}
                <strong>{raw.observers}</strong> personnes. En dessous, le nombre d&apos;espèces
                mesure surtout combien de naturalistes sont passés, et ce que ces personnes-là
                regardent. Nous préférons le dire plutôt que de combler avec une moyenne
                départementale.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Les trois composantes, séparées ────────────────────────────── */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
            Trois choses différentes, trois mesures différentes
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-2xl leading-relaxed">
            Elles ne se remplacent pas : une ville peut être entourée d&apos;espaces protégés et
            n&apos;avoir aucun parc à soi, ou l&apos;inverse. Nous les affichons séparément plutôt
            que fondues dans un chiffre unique.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <ComponentBar
              emoji="🦋"
              title="Richesse d'espèces"
              score={richness?.score ?? null}
              detail={`${raw.species.toLocaleString("fr-FR")} espèces recensées, ramenées à un échantillon commun de ${raw.rarefiedN} observations. Source GBIF, rayon ${raw.radiusKm} km, depuis ${raw.yearFrom}.`}
              missing={
                richnessPending === "calibration"
                  ? `${raw.rarefied?.toLocaleString("fr-FR")} espèces attendues pour ${raw.rarefiedN} observations. Le rang sur 10 attend que davantage de villes soient relevées.`
                  : `${raw.occurrences.toLocaleString("fr-FR")} observations seulement : sous le seuil de ${MIN_OCCURRENCES}, la statistique n'existe pas.`
              }
            />
            <ComponentBar
              emoji="🛡️"
              title="Zones protégées"
              score={protection?.score ?? null}
              detail={protectionDetail}
              missing={protectionMissing}
            />
            <ComponentBar
              emoji="🌳"
              title="Espaces verts urbains"
              score={greenSpace?.score ?? null}
              detail={
                greenSpace
                  ? `${greenSpace.value.toLocaleString("fr-FR")} m² de parcs nommés par habitant. Relevé OpenStreetMap, complétude inégale d'une commune à l'autre.`
                  : ""
              }
              missing="Aucun parc nommé n'est référencé sur OpenStreetMap pour cette commune."
            />
          </div>

          {overall == null && (
            <p className="text-xs text-[var(--text-tertiary)] mt-3 leading-relaxed max-w-3xl">
              <strong className="text-[var(--text-secondary)]">
                Pas de score global pour l&apos;instant.
              </strong>{" "}
              Il demande les trois composantes, et{" "}
              {[
                richness ? null : "la richesse d'espèces",
                protection ? null : "les zones protégées",
                greenSpace ? null : "les espaces verts",
              ]
                .filter(Boolean)
                .join(" et ")}{" "}
              {[richness, protection, greenSpace].filter((c) => !c).length > 1
                ? "manquent"
                : "manque"}{" "}
              encore ici. Repondérer les composantes disponibles pour combler le trou donnerait un
              nombre qui ne mesure pas ce que son nom annonce.
              {!protection && (
                <>
                  {" "}
                  Les zones protégées sont la plus lourde des trois : un périmètre Natura 2000
                  existe indépendamment de qui vient l&apos;observer, donc c&apos;est la seule
                  composante qui échappe au biais d&apos;effort.
                </>
              )}
            </p>
          )}
        </div>
      </section>

      {/* ── Zones protégées ────────────────────────────────────────────── */}
      {protectedAreas && (
        <section className="relative pb-8">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
              Zones protégées à moins de {protectedAreas.radiusKm} km
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              {protectedAreas.areasTotal === 0 ? (
                <>
                  Aucun périmètre protégé recensé dans ce rayon. C&apos;est un résultat de mesure,
                  pas une donnée manquante : les couches nationales ont été passées sur ce disque
                  et n&apos;y ont rien trouvé.
                </>
              ) : (
                <>
                  Surfaces mesurées sur la part du périmètre qui tombe dans le rayon, pas sur le
                  site entier. Les zonages s&apos;emboîtent — une ZNIEFF I est presque toujours
                  incluse dans une ZNIEFF II — donc la couverture ci-dessus ne les additionne pas :
                  chaque parcelle de terrain compte une fois, au niveau de protection le plus fort
                  qui s&apos;y applique.
                </>
              )}
            </p>
            {protectedAreas.areas.length > 0 && (
              <div className="space-y-2">
                {protectedAreas.areas.map((a, i) => {
                  const href = inpnUrl(a);
                  const label = a.name ?? a.id ?? protectionLabel(a.kind);
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
                          {protectionLabel(a.kind)}
                          {a.distanceKm > 0
                            ? ` · à ${nb(a.distanceKm)} km`
                            : " · le centre-ville est dedans"}
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
                {nb(protectedAreas.areasTotal)} périmètres au total ; les{" "}
                {protectedAreas.areas.length} plus étendus sont listés. La couverture affichée plus
                haut les compte tous.
              </p>
            )}
            {protectedAreas.kinds.length < PROTECTION_KIND_COUNT && (
              <p className="text-[11px] text-[var(--text-tertiary)] mt-2">
                Passe partielle : {protectedAreas.kinds.length} des {PROTECTION_KIND_COUNT} couches
                nationales étaient disponibles ({protectedAreas.kinds.map((k) => protectionLabel(k)).join(", ")}).
                La couverture est donc un minimum.
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── Qui vit là ─────────────────────────────────────────────────── */}
      {groups.length > 0 && (
        <section className="relative pb-8">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
              Par grand groupe
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Nombre d&apos;espèces distinctes, pas d&apos;observations — sinon on décrirait surtout
              ce que les gens photographient le plus.
            </p>
            <div className="space-y-2">
              {groups.map((g) => (
                <div key={g.id} className="flex items-center gap-3">
                  <div className="w-28 shrink-0 text-sm text-[var(--text-secondary)]">
                    {groupLabel(g.id as SpeciesGroup)}
                  </div>
                  <div className="flex-1 h-5 rounded-md bg-[var(--border)] overflow-hidden">
                    <div
                      className="h-full rounded-md bg-emerald-500/70"
                      style={{ width: `${Math.max(2, (g.count / groupMax) * 100)}%` }}
                    />
                  </div>
                  <div className="w-16 shrink-0 text-right text-sm font-mono-data text-[var(--text-primary)]">
                    {g.count.toLocaleString("fr-FR")}
                  </div>
                </div>
              ))}
            </div>
            {raw.groupsTruncated.length > 0 && (
              <p className="text-[11px] text-[var(--text-tertiary)] mt-2">
                Groupes plafonnés par la pagination de l&apos;API (le vrai total est plus élevé) :{" "}
                {raw.groupsTruncated.map((g) => groupLabel(g)).join(", ")}.
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── Espèces les plus observées ─────────────────────────────────── */}
      {raw.topSpecies.length > 0 && (
        <section className="relative pb-8">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
              Les espèces que vous croiserez le plus
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Les plus observées du secteur — donc les plus faciles à voir, pas les plus rares.
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {raw.topSpecies.map((sp) => (
                <div
                  key={sp.key}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3"
                >
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    {speciesName(sp)}
                  </div>
                  {sp.vernacularFr && sp.scientificName && (
                    <div className="text-xs italic text-[var(--text-tertiary)]">
                      {sp.scientificName}
                    </div>
                  )}
                  <div className="text-[11px] text-[var(--text-tertiary)] mt-1">
                    {sp.count.toLocaleString("fr-FR")} observations
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Espèces menacées ───────────────────────────────────────────── */}
      {raw.threatenedSpecies > 0 && (
        <section className="relative pb-8">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="rounded-2xl glass border border-white/50 p-5 shadow-sm">
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                ⚠️ {raw.threatenedSpecies} espèces menacées observées dans le secteur
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Classées vulnérable, en danger ou en danger critique sur la liste rouge{" "}
                <strong>mondiale</strong> de l&apos;UICN. Attention à la lecture : c&apos;est le
                statut mondial de l&apos;espèce, pas la liste rouge nationale française — une espèce
                commune ici peut être menacée ailleurs, et l&apos;inverse. Les statuts nationaux
                viendront de l&apos;INPN.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Méthode & effort ───────────────────────────────────────────── */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">
            Comment c&apos;est mesuré
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Observations", value: raw.occurrences.toLocaleString("fr-FR") },
              {
                label: "Observateurs",
                value: `${raw.observers.toLocaleString("fr-FR")}${raw.observersTruncated ? "+" : ""}`,
              },
              {
                label: "Espèces distinctes",
                value: `${raw.species.toLocaleString("fr-FR")}${raw.speciesTruncated ? "+" : ""}`,
              },
              { label: "Jeux de données", value: raw.datasets.toLocaleString("fr-FR") },
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
              <strong className="text-[var(--text-primary)]">
                Le piège que ce score évite.
              </strong>{" "}
              Le nombre brut d&apos;observations mesure d&apos;abord combien de naturalistes
              saisissent des données sur leur téléphone. Paris écrase n&apos;importe quelle vallée
              pyrénéenne en volume — et le nombre d&apos;espèces distinctes hérite du même biais,
              parce que les espèces s&apos;accumulent avec l&apos;échantillonnage : cherchez dix
              fois plus longtemps, vous trouverez plus d&apos;espèces.
            </p>
            <p>
              <strong className="text-[var(--text-primary)]">La correction.</strong> On calcule le
              nombre d&apos;espèces attendu dans un échantillon de {raw.rarefiedN} observations
              tirées au hasard (raréfaction de Hurlbert, 1971). Toutes les villes sont donc
              comparées au même effort. En dessous de {MIN_OCCURRENCES} observations ou{" "}
              {MIN_OBSERVERS} observateurs, on ne publie pas de score : on ne sous-échantillonne pas
              plus que ce qu&apos;on a.
            </p>
            <p>
              <strong className="text-[var(--text-primary)]">Le périmètre.</strong> Cercle de{" "}
              {raw.radiusKm} km autour du centre-ville, observations géolocalisées depuis{" "}
              {raw.yearFrom}, enregistrements sous licence libre uniquement (CC0 et CC BY). Un
              rayon de {raw.radiusKm} km déborde volontairement la commune : la nature ne
              s&apos;arrête pas aux limites administratives.
            </p>
          </div>
        </div>
      </section>

      {/* ── Attribution — condition de licence ─────────────────────────── */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-xs text-[var(--text-tertiary)] leading-relaxed">
            <strong className="text-[var(--text-secondary)]">Sources :</strong> données
            d&apos;occurrence{" "}
            <a href={GBIF_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
              {GBIF_CREDIT}
            </a>
            , extraction du {raw.crawledAt} ({raw.licenses.join(", ")}).{" "}
            {protectedAreas && (
              <>
                Zones protégées :{" "}
                <a
                  href={INPN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] hover:underline"
                >
                  {INPN_CREDIT}
                </a>
                , périmètres du {protectedAreas.crawledAt}, croisés sur une grille de{" "}
                {protectedAreas.gridStepM} m.{" "}
              </>
            )}
            Espaces verts :{" "}
            {OSM_CREDIT}, sous licence ODbL. Les chiffres proviennent de l&apos;API de recherche
            GBIF, qui ne génère pas de DOI de téléchargement ; la date d&apos;accès et le périmètre
            de la requête sont indiqués pour que le calcul soit reproductible.
          </div>
        </div>
      </section>

      <section className="relative pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex gap-3 flex-wrap">
          <Link
            href={`/villes/${slug}`}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            ← Profil complet de {city.name}
          </Link>
          <Link
            href={`/villes/${slug}/parcs`}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            🌳 Parcs de {city.name}
          </Link>
          <Link
            href={`/villes/${slug}/air`}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            🌬️ Qualité de l&apos;air
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
        <DiscussionCTA citySlug={city.slug} cityName={city.name} />
      </section>

      <Footer />
    </main>
  );
}
