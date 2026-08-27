// Route en ligne depuis le 2026-08-06 (F62). Elle est restée garée en
// `page.pending.tsx` tant que `data/city-biodiversity.json` valait `{}` :
// `output: "export"` casse le build sur un `generateStaticParams()` vide, qu'il
// ne distingue pas d'une fonction absente.
//
// Cette page et sa jumelle EN `app/[locale]/cities/[slug]/biodiversity/` sont
// des alternates hreflang : elles existent des deux côtés ou d'aucun, et
// affichent les MÊMES nombres (elles lisent le même `biodiversityProfile`).
// Ne jamais en dégarer une seule.
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
  isMeasuredProtection,
  type ProtectionTerritory,
  BIODIVERSITY_MEASURABLE_COUNT,
  recordConcentration,
  SCORE_LEGEND_FR,
  GBIF_CREDIT,
  GBIF_URL,
  PROTECTED_AREAS_CREDIT,
  PROTECTED_AREAS_URL,
  OSM_CREDIT,
  PARKS_PER_CITY_CAP,
  type SpeciesGroup,
} from "@/lib/biodiversity";
import {
  PROTECTION_MEDIAN_COVERAGE,
  PROTECTION_RANKED_COUNT,
} from "@/lib/protected-areas-ranking";

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

  const { raw, richness, richnessPending, protection, protectedAreas } = profile;
  // Titre et description tenus sous 60 / 160 caractères sur les 540 villes
  // (mesuré, pas estimé — Château-Gontier-sur-Mayenne fait la borne des deux
  // côtés). La version d'origine dépassait sur 117 titres et 239 descriptions :
  // ce qui se faisait couper en SERP, c'était les chiffres.
  //
  // La queue générique « Oiseaux, insectes, flore, dans un rayon de N km » a
  // laissé la place au chiffre de couverture protégée : depuis le 26/08 c'est
  // la seule mesure comparable que la page publie, et un tail sans chiffre
  // pousse hors du snippet ce qu'un lecteur cherche (CLAUDE.md § meta ≤ 160).
  const areas = protectedAreas && isMeasuredProtection(protectedAreas) ? protectedAreas : null;
  const protectionClause = !areas
    ? null
    : areas.areasTotal === 0
      ? `Aucun périmètre protégé à moins de ${areas.radiusKm} km.`
      : `${areas.weightedCoverage.toLocaleString("fr-FR")} % du disque de ${areas.radiusKm} km sous protection${protection ? ` (${protection.score.toLocaleString("fr-FR")}/10)` : ""}.`;
  const sources = `Données GBIF${areas ? " et IGN" : ""}.`;
  // Même « au moins » que dans le corps de page : sur les 27 villes dont la
  // pagination a coupé la liste d'espèces, l'effectif est un plancher.
  const species = raw.speciesTruncated
    ? `Au moins ${raw.species.toLocaleString("fr-FR")}`
    : raw.species.toLocaleString("fr-FR");
  const head = richness
    ? `${species} espèces autour ${deVilleStr(city.name)}, sur ${raw.occurrences.toLocaleString("fr-FR")} observations. Richesse à effort d'observation égal : ${richness.score}/10.`
    : richnessPending === "incomparable" || richnessPending === "calibration"
      ? `${species} espèces autour ${deVilleStr(city.name)}, sur ${raw.occurrences.toLocaleString("fr-FR")} observations.`
      : richnessPending === "precision"
        ? `Autour ${deVilleStr(city.name)}, la richesse relevée est trop imprécise pour un rang : notre collecte a coupé la liste d'espèces.`
        : `Autour ${deVilleStr(city.name)}, trop peu d'observations pour un score : ${raw.occurrences.toLocaleString("fr-FR")} observations, ${raw.observers} observateurs.`;
  // Garde de longueur : la clause de protection saute plutôt que de faire
  // couper la description en SERP. Mesuré, aucune des 540 ne l'atteint (147 au
  // pire) — elle couvre les branches rares et les noms qui s'allongeraient.
  const withClause = [head, protectionClause, sources].filter(Boolean).join(" ");
  const description = withClause.length <= 160 ? withClause : `${head} ${sources}`;

  // Le suffixe éditorial saute quand il ferait dépasser 60 : sur un nom long,
  // c'est « nature » qui se faisait couper, pas le nom de la ville.
  const title = `Biodiversité ${aVille(city.name)} · espèces et nature`;

  return {
    title: title.length <= 60 ? title : `Biodiversité ${aVille(city.name)}`,
    description,
    alternates: cityAlternates("biodiversite", slug),
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
      title: `Biodiversité ${aVille(city.name)}`,
      description: richness
        ? `${species} espèces recensées dans un rayon de ${raw.radiusKm} km · ${richness.score}/10 à effort d'observation égal`
        : richnessPending === "incomparable" || richnessPending === "calibration"
          ? `${species} espèces recensées dans un rayon de ${raw.radiusKm} km${protection ? ` · zones protégées ${protection.score.toLocaleString("fr-FR")}/10` : ""}`
          : richnessPending === "precision"
            ? `Richesse encadrée, pas encore assez précise pour un rang — les mesures brutes sont affichées`
            : `Effort d'observation insuffisant pour un score — les mesures brutes sont affichées`,
    },
  };
}

/**
 * « autour de Albi », « Biodiversité à Le Havre », « Parcs de Les Abymes » :
 * les 540 noms du seed portent leur article, et les coller derrière une
 * préposition sans élider ni contracter donnait du faux français sur **88
 * villes** — 69 à initiale vocalique, 16 en « Le », 3 en « Les ». C'est la même
 * règle que les slugs de la série tourisme (`-au-tampon-`, `-aux-abymes-`,
 * cf. CLAUDE.md), appliquée cette fois à la copie.
 *
 * Volontairement local à cette page : le dépôt n'a aucun helper de ce genre
 * (vérifié ce run), et les autres sous-pages ville ont le même défaut — le
 * corriger partout est une passe à part, pas un effet de bord de F62.
 *
 * Le « h » est laissé hors élision (Honfleur, Hyères, Hendaye : h aspiré), et
 * le « y » aussi — les deux usages coexistent et « de Yerres » ne choque pas,
 * là où un « d'Yerres » erroné se verrait.
 */
function deVille(name: string): { prefix: string; rest: string } {
  if (name.startsWith("Le ")) return { prefix: "du ", rest: name.slice(3) };
  if (name.startsWith("Les ")) return { prefix: "des ", rest: name.slice(4) };
  if (/^[AEIOUÀÂÉÈÊÎÏÔÖÛÜ]/.test(name)) return { prefix: "d'", rest: name };
  return { prefix: "de ", rest: name };
}

/** Même chose pour « à » : à Albi, au Havre, aux Abymes, à La Rochelle. */
function aVille(name: string): string {
  if (name.startsWith("Le ")) return `au ${name.slice(3)}`;
  if (name.startsWith("Les ")) return `aux ${name.slice(4)}`;
  return `à ${name}`;
}

/** Forme plate de deVille, pour les chaînes (métadonnées, JSON-LD). */
function deVilleStr(name: string): string {
  const { prefix, rest } = deVille(name);
  return `${prefix}${rest}`;
}

/** Libellés des territoires, au site d'affichage (convention CLAUDE.md #6 — la
 *  lib garde les clés, la page porte la copie, et la jumelle EN la sienne). */
const TERRITORY_LABEL_FR: Record<ProtectionTerritory, string> = {
  metropole: "la France métropolitaine",
  guadeloupe: "la Guadeloupe",
  martinique: "la Martinique",
  guyane: "la Guyane",
  reunion: "La Réunion",
  mayotte: "Mayotte",
};

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
    greenSpacePending,
    greenSpaceTruncated,
    overall,
  } = profile;
  const photo = cityPhoto(city.slug);
  const concentration = recordConcentration(raw);

  const nb = (v: number) => v.toLocaleString("fr-FR");

  // 27 des 540 villes ont vu leur liste d'espèces coupée par la pagination de
  // l'API — les mieux relevées, Paris et sa petite couronne en tête. Leur
  // effectif est un PLANCHER, pas un total : le JSON-LD le disait déjà
  // (`minValue`), la prose écrivait « 6 000 espèces ont été recensées » et,
  // deux écrans plus bas, « un effectif exact ». Même traitement que le « au
  // moins » des espaces verts plafonnés par F59.
  const speciesPhraseCap = raw.speciesTruncated
    ? `Au moins ${nb(raw.species)}`
    : nb(raw.species);

  // Quatre états à distinguer, et deux seulement se disent « non mesuré » : la
  // commune pas encore ingérée, et la commune ingérée hors du périmètre des
  // couches (outre-mer sur une passe continentale). Une commune ingérée sans
  // aucun périmètre, elle, a bien été mesurée — la page l'écrit, plutôt que de
  // laisser croire à un trou de données.
  const measuredAreas = protectedAreas && isMeasuredProtection(protectedAreas) ? protectedAreas : null;
  const protectionDetail = measuredAreas
    ? `${nb(measuredAreas.weightedCoverage)} % du disque de ${measuredAreas.radiusKm} km sous protection, ` +
      `pondéré par le niveau (${nb(measuredAreas.rawCoverage)} % sous un zonage quelconque). ` +
      `${nb(measuredAreas.areasTotal)} périmètre${measuredAreas.areasTotal > 1 ? "s" : ""} relevé${measuredAreas.areasTotal > 1 ? "s" : ""}.`
    : "";
  const protectionMissing =
    protectionPending === "scope"
      ? `L'inventaire national des zonages traité ici ne couvre pas ${TERRITORY_LABEL_FR[protectedAreas?.territory ?? "metropole"]} : les périmètres ultramarins sont publiés dans des fichiers séparés, et Natura 2000 ne s'applique pas aux régions ultrapériphériques. Nous ne savons donc rien de la protection autour de cette commune — ce n'est pas qu'il n'y en a pas.`
      : protectionPending === "calibration" && measuredAreas
        ? measuredAreas.areasTotal === 0
          ? `Aucun périmètre protégé à moins de ${measuredAreas.radiusKm} km. C'est une mesure, pas une absence de donnée.`
          : `${nb(measuredAreas.weightedCoverage)} % du disque sous protection pondérée. Le rang sur 10 attend que davantage de villes soient ingérées.`
        : `Les périmètres réglementaires (réserves, parcs nationaux et régionaux, arrêtés de biotope, Natura 2000) ne sont pas encore intégrés pour cette commune. « Non mesuré » veut dire que nous ne savons pas — pas qu'il n'y en a aucun.`;

  // Ce qui manque à l'agrégat, et la raison de chaque absence. Une composante
  // retirée parce que sa mesure ne mesurait pas ce qu'elle annonçait n'est pas
  // une composante en retard de collecte : les deux se disaient « manque
  // encore » avant, ce qui laissait croire que la note de richesse allait
  // arriver — elle demande un recrawl GBIF pondéré par jeu de données.
  const missingComponents: string[] = [];
  if (!richness)
    missingComponents.push(
      richnessPending === "incomparable"
        ? "la richesse d'espèces, dont le rang a été retiré le 10 août 2026 parce qu'il classait les programmes de saisie"
        : richnessPending === "precision"
          ? "la richesse d'espèces, encadrée ici trop largement pour être classée"
          : richnessPending === "calibration"
            ? "la richesse d'espèces, mesurée mais pas encore comparable"
            : "la richesse d'espèces, faute d'un effort d'observation suffisant ici",
    );
  if (!protection)
    missingComponents.push(
      protectionPending === "scope"
        ? "les zones protégées, qu'aucune des couches passées ici ne couvre"
        : "les zones protégées, pas encore relevées pour cette commune",
    );
  if (!greenSpace)
    missingComponents.push(
      greenSpacePending === "mapping"
        ? "les espaces verts, qu'OpenStreetMap ne cartographie pas ici"
        : "les espaces verts, pas encore relevés pour cette commune",
    );

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
    name: `Biodiversité observée autour ${deVilleStr(city.name)}`,
    description: richness
      ? `Espèces recensées dans un rayon de ${raw.radiusKm} km autour ${deVilleStr(city.name)} depuis ${raw.yearFrom}, richesse ramenée à effort d'observation égal, et espaces verts urbains.`
      : `Espèces recensées dans un rayon de ${raw.radiusKm} km autour ${deVilleStr(city.name)} depuis ${raw.yearFrom}, et espaces verts urbains. Effectifs bruts : ces relevés ne sont pas comparables d'une ville à l'autre.`,
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
      // Un décompte tronqué s'annonce comme un minimum, pas comme une valeur :
      // `minValue` seul est la façon dont schema.org dit « au moins ».
      raw.speciesTruncated
        ? { "@type": "PropertyValue", name: "Espèces distinctes recensées", minValue: raw.species }
        : { "@type": "PropertyValue", name: "Espèces distinctes recensées", value: raw.species },
      { "@type": "PropertyValue", name: "Observations", value: raw.occurrences },
      { "@type": "PropertyValue", name: "Observateurs distincts", value: raw.observers },
      ...(richness
        ? [
            {
              "@type": "PropertyValue",
              name: `Espèces attendues pour ${raw.rarefiedN} observations (raréfaction)`,
              // Encadrée quand la facette espèces a été tronquée : on publie
              // l'intervalle réellement connu, pas sa borne basse déguisée en
              // mesure.
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
            Ce qui vit autour {deVille(city.name).prefix}
            <span className="font-display gradient-text-anim italic">
              {deVille(city.name).rest}
            </span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl leading-relaxed">
            {richness ? (
              <>
                {speciesPhraseCap} espèces ont été recensées dans un rayon de{" "}
                {raw.radiusKm} km depuis {raw.yearFrom}, sur{" "}
                {raw.occurrences.toLocaleString("fr-FR")} observations déposées par{" "}
                {raw.observers.toLocaleString("fr-FR")} naturalistes. Le score ci-dessous ramène
                cette richesse à effort d&apos;observation égal — sans quoi on classerait les villes
                par nombre de naturalistes, pas par nature.
              </>
            ) : richnessPending === "incomparable" ? (
              <>
                {speciesPhraseCap} espèces ont été recensées dans un rayon de{" "}
                {raw.radiusKm} km depuis {raw.yearFrom}, sur{" "}
                {raw.occurrences.toLocaleString("fr-FR")} observations déposées par{" "}
                {raw.observers.toLocaleString("fr-FR")} naturalistes. Ces chiffres sont ce qui a été{" "}
                <strong>observé et saisi</strong> ici. Nous n&apos;en tirons plus de note sur 10 :
                le classement que nous en faisions mesurait le type de programme de saisie qui
                opère autour de la ville, pas ce qui y vit. Le détail est en bas de page.
              </>
            ) : richnessPending === "calibration" ? (
              <>
                {speciesPhraseCap} espèces ont été recensées dans un rayon de{" "}
                {raw.radiusKm} km depuis {raw.yearFrom}. La note sur 10 arrivera quand assez de
                villes auront été relevées pour que « mieux que N&nbsp;% des autres » veuille dire
                quelque chose — les mesures, elles, sont déjà là.
              </>
            ) : richnessPending === "precision" ? (
              <>
                {raw.occurrences.toLocaleString("fr-FR")} observations ont été déposées ici par{" "}
                {raw.observers.toLocaleString("fr-FR")} naturalistes — largement de quoi mesurer. Ce
                qui manque vient de <strong>notre</strong> côté : la liste d&apos;espèces renvoyée
                par GBIF a été coupée avant la fin, si bien que la richesse n&apos;est
                qu&apos;encadrée. Nous préférons ne pas classer la ville sur un intervalle aussi
                large. Les effectifs, eux, sont exacts et affichés plus bas.
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
                  On attend{" "}
                  <strong>
                    {raw.rarefiedExact ? "" : "au moins "}
                    {richness.value.toLocaleString("fr-FR")} espèces
                  </strong>{" "}
                  ici dans un échantillon de {raw.rarefiedN} observations tirées au hasard —
                  c&apos;est ce nombre-là, identique pour toutes les villes, qui est comparable.
                  {!raw.rarefiedExact && (
                    <>
                      {" "}
                      La liste d&apos;espèces ayant été coupée à la collecte, ce chiffre est une
                      borne basse (au plus {raw.rarefiedUpper?.toLocaleString("fr-FR")}) : le rang
                      réel {deVilleStr(city.name)} ne peut être que meilleur.
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : richnessPending === "incomparable" ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                Pourquoi il n&apos;y a pas de note de richesse
              </div>
              <div className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-3">
                <p>
                  Nous avons publié une note de richesse jusqu&apos;au 10 août 2026, puis nous
                  l&apos;avons retirée. En la vérifiant sur les 540 villes, elle s&apos;est révélée
                  corrélée à <strong>−0,77</strong> avec la concentration des relevés — la part des
                  observations que se partagent quelques espèces — et à <strong>+0,10</strong>{" "}
                  seulement avec le nombre d&apos;espèces réellement recensées. Elle ne classait pas
                  la nature : elle classait le type de programme de saisie qui opère autour de
                  chaque ville.
                </p>
                <p>
                  La raison est technique et tient en une phrase : une observation de terrain et un
                  contact enregistré automatiquement par un détecteur à ultrasons comptent pour la
                  même chose dans GBIF. Là où un tel dispositif tourne, une seule espèce peut
                  occuper l&apos;essentiel des observations et écraser le calcul.
                  {concentration != null && (
                    <>
                      {" "}
                      Ici, les cinq espèces les plus enregistrées représentent{" "}
                      <strong>
                        {(concentration * 100).toLocaleString("fr-FR", {
                          maximumFractionDigits: 0,
                        })}{" "}
                        %
                      </strong>{" "}
                      des observations.
                    </>
                  )}
                </p>
                <p>
                  Le résultat se voyait à l&apos;écran : la Guadeloupe et la Guyane, de loin les
                  territoires français les plus riches en espèces, sortaient derniers, et le
                  département expliquait à lui seul <strong>56 %</strong> de la note. Nous
                  préférons afficher les effectifs bruts, qui sont exacts, et ne rien en conclure,
                  plutôt que de garder un classement faux parce qu&apos;il était joli. Réparer
                  demande de repasser par GBIF en pondérant par jeu de données — c&apos;est du
                  travail de collecte, pas d&apos;affichage.
                </p>
              </div>
            </div>
          ) : richnessPending === "calibration" ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                Mesure faite, comparaison pas encore possible
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Le relevé {deVilleStr(city.name)} est solide :{" "}
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
          ) : richnessPending === "precision" ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <div className="text-sm font-semibold text-amber-900 mb-2">
                Richesse encadrée, pas classée
              </div>
              <p className="text-sm text-amber-900/80 leading-relaxed">
                La raréfaction demande la liste complète des espèces et de leurs effectifs. Pour{" "}
                {city.name}, cette liste dépasse ce que notre collecte a ramené en une passe : nous
                savons seulement que le nombre d&apos;espèces attendu pour {raw.rarefiedN}{" "}
                observations se situe{" "}
                <strong>
                  entre {raw.rarefied?.toLocaleString("fr-FR")} et{" "}
                  {raw.rarefiedUpper?.toLocaleString("fr-FR")}
                </strong>
                . Ces deux bornes sont sûres, mais l&apos;écart entre elles suffirait à déplacer la
                ville dans le classement — le rang dirait alors où notre collecte s&apos;est
                arrêtée, pas ce qui vit ici. C&apos;est un défaut de notre côté, réparable&nbsp;:
                la ville sera reprise avec une pagination plus profonde.
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
              detail={`${speciesPhraseCap} espèces recensées, ramenées à un échantillon commun de ${raw.rarefiedN} observations. Source GBIF, rayon ${raw.radiusKm} km, depuis ${raw.yearFrom}.`}
              missing={
                richnessPending === "incomparable"
                  ? `${speciesPhraseCap} espèces recensées ici — un effectif ${raw.speciesTruncated ? "sûr, mais plafonné par notre pagination" : "exact"}, et de toute façon pas comparable d'une ville à l'autre : la note tirée de ces relevés classait les programmes de saisie, pas la nature. Retirée le 10 août 2026.`
                  : richnessPending === "calibration"
                  ? `${raw.rarefied?.toLocaleString("fr-FR")} espèces attendues pour ${raw.rarefiedN} observations${raw.rarefiedExact ? "" : " (borne basse)"}. Le rang sur 10 attend que davantage de villes soient relevées.`
                  : richnessPending === "precision"
                    ? `Entre ${raw.rarefied?.toLocaleString("fr-FR")} et ${raw.rarefiedUpper?.toLocaleString("fr-FR")} espèces attendues pour ${raw.rarefiedN} observations : l'intervalle est trop large pour un rang.`
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
                  ? greenSpaceTruncated
                    ? `Au moins ${greenSpace.value.toLocaleString("fr-FR")} m² de parcs nommés par habitant. Le relevé OpenStreetMap s'arrête aux ${PARKS_PER_CITY_CAP} plus grands parcs de la commune : les suivants, tous plus petits, ne sont pas comptés. Le chiffre est donc un plancher.`
                    : `${greenSpace.value.toLocaleString("fr-FR")} m² de parcs nommés par habitant. Relevé OpenStreetMap, complétude inégale d'une commune à l'autre.`
                  : ""
              }
              missing={
                greenSpacePending === "data"
                  ? "Le relevé OpenStreetMap n'a pas encore couvert cette commune."
                  : "OpenStreetMap ne référence aucun parc nommé pour cette commune, et c'est une lacune de la carte, pas un constat sur le terrain : une commune non cartographiée et une commune sans verdure y sont indiscernables. On ne publie donc pas de score plutôt qu'un zéro trompeur."
              }
            />
          </div>

          {overall == null && (
            <p className="text-xs text-[var(--text-tertiary)] mt-3 leading-relaxed max-w-3xl">
              <strong className="text-[var(--text-secondary)]">
                Pas de score global pour l&apos;instant.
              </strong>{" "}
              {/* Chaque composante absente dit POURQUOI elle l'est. « Manque »
                  convenait quand les trois étaient en cours de collecte ; il est
                  faux pour la richesse, dont la mesure existe et dont c'est le
                  RANG qui a été retiré comme invalide, et il le serait pour une
                  commune qu'OSM ne cartographie pas. Un agrégat absent par
                  décision ne se raconte pas comme un agrégat absent par retard. */}
              Il demande les trois composantes, et il en manque{" "}
              {[richness, protection, greenSpace].filter((c) => !c).length > 1 ? "plusieurs" : "une"}{" "}
              ici :{" "}
              {missingComponents.join(" ; ")}. Repondérer les composantes disponibles pour combler
              le trou donnerait un nombre qui ne mesure pas ce que son nom annonce.
              {protection ? (
                <>
                  {" "}
                  Les zones protégées, elles, portent bien une note ci-dessus : un périmètre Natura
                  2000 existe indépendamment de qui vient l&apos;observer, donc c&apos;est la seule
                  des trois qui échappe au biais d&apos;effort, et c&apos;est le chiffre comparable
                  de cette page.
                </>
              ) : (
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
      {/* Hors périmètre : la section entière disparaît. Une liste vide sous un
          titre « Zones protégées à moins de 15 km » se lit comme un zéro, et
          c'est précisément ce que la commune n'a pas mesuré. */}
      {measuredAreas && (
        <section className="relative pb-8">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
              Zones protégées à moins de {measuredAreas.radiusKm} km
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              {measuredAreas.areasTotal === 0 ? (
                <>
                  Aucun périmètre protégé recensé dans ce rayon. C&apos;est un résultat de mesure,
                  pas une donnée manquante : les couches nationales ont été passées sur ce disque
                  et n&apos;y ont rien trouvé.
                </>
              ) : (
                <>
                  Surfaces mesurées sur la part du périmètre qui tombe dans le rayon, pas sur le
                  site entier. Les zonages s&apos;emboîtent — un site Natura 2000 chevauche
                  couramment une réserve et un parc régional — donc la couverture ci-dessus ne les
                  additionne pas : chaque parcelle de terrain compte une fois, au niveau de
                  protection le plus fort qui s&apos;y applique.
                </>
              )}
            </p>
            {measuredAreas.areas.length > 0 && (
              <div className="space-y-2">
                {measuredAreas.areas.map((a, i) => {
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
            {measuredAreas.areasTruncated && (
              <p className="text-[11px] text-[var(--text-tertiary)] mt-2">
                {nb(measuredAreas.areasTotal)} périmètres au total ; les{" "}
                {measuredAreas.areas.length} plus étendus sont listés. La couverture affichée plus
                haut les compte tous.
              </p>
            )}
            {measuredAreas.kinds.length < PROTECTION_KIND_COUNT && (
              <p className="text-[11px] text-[var(--text-tertiary)] mt-2">
                Passe partielle : {measuredAreas.kinds.length} des {PROTECTION_KIND_COUNT} couches
                nationales étaient disponibles ({measuredAreas.kinds.map((k) => protectionLabel(k)).join(", ")}).
                La couverture est donc un minimum.
              </p>
            )}
            <p className="text-[11px] text-[var(--text-tertiary)] mt-3">
              Repère : la médiane des {PROTECTION_RANKED_COUNT} villes mesurées est de{" "}
              {nb(PROTECTION_MEDIAN_COVERAGE)} % du disque.{" "}
              <Link href="/espaces-proteges" className="text-[var(--accent)] hover:underline">
                Voir le classement national
              </Link>
              .
            </p>
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
                demanderaient la liste rouge du MNHN, dont la publication n&apos;est pas revenue
                en ligne depuis la cyberattaque de juillet 2025.
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
            {/* Cette moitié du bloc décrit la fabrication d'un rang. Tant qu'aucun
                rang n'est publié — c'est le cas de toutes les villes depuis le
                10/08 — la décrire au présent démentirait la page elle-même, qui
                vient d'expliquer plus haut pourquoi le rang a été retiré. */}
            {richness ? (
              <>
                <p>
                  <strong className="text-[var(--text-primary)]">
                    Le piège que ce score évite.
                  </strong>{" "}
                  Le nombre brut d&apos;observations mesure d&apos;abord combien de naturalistes
                  saisissent des données sur leur téléphone. Paris écrase n&apos;importe quelle
                  vallée pyrénéenne en volume — et le nombre d&apos;espèces distinctes hérite du
                  même biais, parce que les espèces s&apos;accumulent avec l&apos;échantillonnage :
                  cherchez dix fois plus longtemps, vous trouverez plus d&apos;espèces.
                </p>
                <p>
                  <strong className="text-[var(--text-primary)]">La correction.</strong> On calcule
                  le nombre d&apos;espèces attendu dans un échantillon de {raw.rarefiedN}{" "}
                  observations tirées au hasard (raréfaction de Hurlbert, 1971). Toutes les villes
                  sont donc comparées au même effort. En dessous de {MIN_OCCURRENCES} observations
                  ou {MIN_OBSERVERS} observateurs, on ne publie pas de score : on ne
                  sous-échantillonne pas plus que ce qu&apos;on a.
                </p>
                <p>
                  <strong className="text-[var(--text-primary)]">La limite du calcul.</strong> La
                  raréfaction a besoin de la liste complète des espèces et de leurs effectifs. Quand
                  cette liste dépasse ce que la collecte ramène en une passe — le cas des villes les
                  mieux relevées — le chiffre exact n&apos;est pas connaissable&nbsp;; on
                  l&apos;encadre alors entre deux bornes sûres et on annonce la borne basse comme
                  telle, précédée d&apos;un « au moins ». Si l&apos;intervalle est trop large pour
                  départager la ville de ses voisines, aucun rang n&apos;est publié.
                </p>
                <p>
                  <strong className="text-[var(--text-primary)]">
                    À quoi la ville est comparée.
                  </strong>{" "}
                  La collecte couvre désormais les {CITIES_SEED.length} villes du site : la
                  population de comparaison n&apos;est plus un chantier en cours. Le rang se lit
                  parmi les {BIODIVERSITY_MEASURABLE_COUNT} d&apos;entre elles assez relevées pour
                  être comparées&nbsp;; les autres sont écartées par les seuils d&apos;effort et de
                  précision énoncés plus haut, pas par un trou dans notre crawl. Cela se lit donc
                  « mieux que N&nbsp;% des villes françaises que nous savons mesurer », pas « mieux
                  que N&nbsp;% des villes françaises ». Les effectifs bruts, eux, ne dépendent pas
                  des autres villes.
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong className="text-[var(--text-primary)]">
                    Ce que ces chiffres disent, et ce qu&apos;ils ne disent pas.
                  </strong>{" "}
                  Les effectifs ci-dessus sont ceux {deVilleStr(city.name)} : espèces, observations,
                  observateurs, groupes représentés. Ils ne se comparent pas d&apos;une ville à
                  l&apos;autre. Le nombre brut d&apos;observations mesure d&apos;abord combien de
                  naturalistes saisissent des données ici, et le nombre d&apos;espèces hérite du
                  même biais, parce que les espèces s&apos;accumulent avec l&apos;échantillonnage :
                  cherchez dix fois plus longtemps, vous trouverez plus d&apos;espèces.
                </p>
                <p>
                  <strong className="text-[var(--text-primary)]">
                    La correction que nous appliquions ne suffisait pas.
                  </strong>{" "}
                  Nous ramenions chaque ville à un échantillon commun de {raw.rarefiedN}{" "}
                  observations (raréfaction de Hurlbert, 1971) pour les comparer à effort égal. Le
                  calcul suppose que les enregistrements sont des tirages comparables — or un
                  contact de détecteur automatique et une sortie de terrain pèsent pareil dans
                  GBIF, et cette hypothèse tombe. Le rang qui en sortait a été retiré le 10 août
                  2026 ; le détail et les corrélations mesurées sont plus haut sur cette page.
                </p>
                <p>
                  <strong className="text-[var(--text-primary)]">
                    Comment lire la page en attendant.
                  </strong>{" "}
                  Les deux autres composantes ne dépendent pas de qui vient observer : un périmètre
                  protégé existe par arrêté, un parc est cartographié au sol.{" "}
                  {protection ? (
                    <>
                      Les zones protégées sont donc la mesure à lire ici : elles sont relevées sur
                      les {CITIES_SEED.length} villes du site, à partir des mêmes tracés pour
                      toutes, et c&apos;est la composante qui pèserait le plus lourd dans
                      l&apos;agrégat le jour où la richesse redeviendrait comparable
                      {greenSpace ? ". Les espaces verts portent une note eux aussi" : ""}.
                    </>
                  ) : (
                    <>
                      {greenSpace
                        ? "C'est pourquoi les espaces verts portent une note ici,"
                        : "C'est de ce côté que la mesure est solide,"}{" "}
                      et pourquoi les zones protégées en porteront la plus lourde une fois relevées
                      pour cette commune.
                    </>
                  )}{" "}
                  Pour les espèces, prenez les effectifs pour ce qu&apos;ils sont
                  — l&apos;état de la connaissance naturaliste autour {deVilleStr(city.name)}, qui est en soi
                  une information sur le territoire, pas un palmarès.
                </p>
              </>
            )}
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
            {measuredAreas && (
              <>
                Zones protégées :{" "}
                <a
                  href={PROTECTED_AREAS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] hover:underline"
                >
                  {PROTECTED_AREAS_CREDIT}
                </a>
                , périmètres du {measuredAreas.crawledAt}, croisés sur une grille de{" "}
                {measuredAreas.gridStepM} m. Seules les protections
                réglementaires sont comptées — réserves naturelles, parcs nationaux et
                régionaux, arrêtés de protection, Natura 2000. Une ZNIEFF est un
                inventaire sans portée juridique : elle n&apos;entre pas dans le calcul.{" "}
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
            ← Profil complet {deVilleStr(city.name)}
          </Link>
          <Link
            href={`/villes/${slug}/parcs`}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            🌳 Parcs {deVilleStr(city.name)}
          </Link>
          <Link
            href={`/villes/${slug}/air`}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            🌬️ Qualité de l&apos;air
          </Link>
          <Link
            href="/parcs"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            🌿 Répertoire des parcs et espaces verts
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
