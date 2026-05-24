import { MetadataRoute } from "next";
import { CITIES_SEED } from "@/data/cities-seed";
import { RANKING_META } from "@/lib/rankings";
import { GUIDES } from "@/data/guides";
import { EN_GUIDES } from "@/data/guides-en";
import { SEO_PAIRS } from "@/lib/comparer-pairs";
import { SEO_TRIPLETS } from "@/lib/comparer-triplets";
import { QUITTER_PAIRS, pairToSlug } from "@/lib/quitter-pairs";
import { METRO_REGIONS, regionToSlug } from "@/lib/regions";
import { TAG_SLUGS } from "@/lib/guide-tags";
import { RED_FLAG_THEME_SLUGS } from "@/lib/red-flag-themes";

// Locale-aware sitemap. Each Vercel project sets NEXT_PUBLIC_DEFAULT_LOCALE and
// (optionally) NEXT_PUBLIC_BASE_URL — the FR project emits FR URLs at
// mavilleideale.fr, the EN project emits EN URLs at bestcitiesinfrance.com.
const DEFAULT_LOCALE = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "fr") as "fr" | "en";
const FR_URL = process.env.NEXT_PUBLIC_BASE_URL_FR ?? "https://www.mavilleideale.fr";
const EN_URL = process.env.NEXT_PUBLIC_BASE_URL_EN ?? "https://bestcitiesinfrance.com";
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? (DEFAULT_LOCALE === "en" ? EN_URL : FR_URL);
const IS_EN = DEFAULT_LOCALE === "en";

// Honest lastModified values per content family.
// Bump these when the underlying source actually changes.
const CITY_DATA_UPDATED = new Date("2026-05-12"); // last seed + score calibration
const RANKING_UPDATED = new Date("2026-05-12");
const STATIC_UPDATED = new Date("2026-05-12");
const LEGAL_UPDATED = new Date("2026-05-19"); // cgu/confidentialite/mentions-legales

// Order MUST stay stable per locale — the sitemap chunk URL is /sitemap/<index>.xml,
// and that URL is what's listed in robots.txt + (eventually) Search Console.
// EN chunk list is a strict subset (no guides, no per-city sub-pages yet).
const SITEMAP_CHUNKS_FR = [
  "static",
  "guides",
  "cities",
  "city-sub",
  "comparer",
  "comparer-regions",
  "classements",
  "regions",
  "departements",
  "tags",
  "red-flags",
  "calculator",
  "gentrification",
  "quitter",
  "cout-menage",
  "vacances",
] as const;

const SITEMAP_CHUNKS_EN = [
  "en-static",
  "en-cities",
  "en-rankings",
  "en-regions",
  "en-departments",
  "en-city-sub",
  "en-compare",
  "en-compare-regions",
  "en-guides",
  "en-for-who",
  "en-red-flags",
  "en-vacations",
  "en-quiz",
  "en-calculators",
] as const;

const SITEMAP_CHUNKS = IS_EN ? SITEMAP_CHUNKS_EN : SITEMAP_CHUNKS_FR;

/** Number of sitemap chunks for the active locale — consumed by robots.ts
 *  so the advertised chunk URLs always match what generateSitemaps emits. */
export const SITEMAP_CHUNK_COUNT = SITEMAP_CHUNKS.length;

type Chunk = (typeof SITEMAP_CHUNKS_FR)[number] | (typeof SITEMAP_CHUNKS_EN)[number];

export async function generateSitemaps() {
  return SITEMAP_CHUNKS.map((_, id) => ({ id }));
}

function chunkAt(id: number): Chunk | null {
  return SITEMAP_CHUNKS[id] ?? null;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function staticSection(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, lastModified: STATIC_UPDATED, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/quiz`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/quiz-compatibilite`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/expat-retour`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/expat-retour/quiz`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/expat-retour/depuis-suisse`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/expat-retour/depuis-luxembourg`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/expat-retour/depuis-belgique`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/expat-retour/depuis-royaume-uni`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/expat-retour/depuis-canada`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/expat-retour/depuis-allemagne`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/widget`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/vivre-avec`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/vivre-avec/1500-euros`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE_URL}/vivre-avec/2000-euros`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE_URL}/vivre-avec/2500-euros`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE_URL}/vivre-avec/3000-euros`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE_URL}/vivre-avec/4000-euros`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE_URL}/vivre-avec/5000-euros`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE_URL}/pour-qui`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/pour-qui/familles-avec-enfants`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/pour-qui/jeunes-actifs`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/pour-qui/retraites`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/pour-qui/freelances`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/pour-qui/teletravailleurs`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/pour-qui/etudiants`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/pour-qui/sans-voiture`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/pour-qui/premium`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/pour-qui/solo-femme`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/pour-qui/couple-sans-enfant`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/pour-qui/expat-retour`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/pour-qui/primo-accedants`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/salaire-equivalent`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/macro-region`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/macro-region/cote-atlantique`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE_URL}/macro-region/arc-mediterraneen`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE_URL}/macro-region/arc-alpin`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE_URL}/macro-region/sud-ouest-gascon`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE_URL}/macro-region/vallee-du-rhone`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE_URL}/macro-region/ile-de-france-elargie`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE_URL}/simulateur-achat`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/future-you`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/people-like-you`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/climat-2040-timelapse`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/connexion`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/mes-villes`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/city-match`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/quitter`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/cout-menage`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/louer-ou-acheter`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/depuis-paris`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/environnement`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/environnement/cote-atlantique`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/environnement/arc-mediterraneen`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/environnement/arc-alpin`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/environnement/sud-ouest-gascon`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/environnement/vallee-du-rhone`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/environnement/ile-de-france-elargie`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/sante`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/sante/cote-atlantique`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/sante/arc-mediterraneen`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/sante/arc-alpin`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/sante/sud-ouest-gascon`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/sante/vallee-du-rhone`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/sante/ile-de-france-elargie`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/emploi`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/emploi/cote-atlantique`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/emploi/arc-mediterraneen`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/emploi/arc-alpin`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/emploi/sud-ouest-gascon`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/emploi/vallee-du-rhone`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/emploi/ile-de-france-elargie`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/cadre-de-vie`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.95 },
    { url: `${BASE_URL}/cadre-de-vie/cote-atlantique`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/cadre-de-vie/arc-mediterraneen`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/cadre-de-vie/arc-alpin`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/cadre-de-vie/sud-ouest-gascon`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/cadre-de-vie/vallee-du-rhone`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/cadre-de-vie/ile-de-france-elargie`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/cadre-de-vie/personnaliser`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/velo`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/velo/cote-atlantique`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/velo/arc-mediterraneen`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/velo/arc-alpin`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/velo/sud-ouest-gascon`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/velo/vallee-du-rhone`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/velo/ile-de-france-elargie`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/securite`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/securite/cote-atlantique`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/securite/arc-mediterraneen`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/securite/arc-alpin`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/securite/sud-ouest-gascon`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/securite/vallee-du-rhone`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/securite/ile-de-france-elargie`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/demographie`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/demographie/cote-atlantique`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/demographie/arc-mediterraneen`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/demographie/arc-alpin`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/demographie/sud-ouest-gascon`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/demographie/vallee-du-rhone`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/demographie/ile-de-france-elargie`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/palmares`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/palmares/personnaliser`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/palmares/cote-atlantique`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/palmares/arc-mediterraneen`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/palmares/arc-alpin`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/palmares/sud-ouest-gascon`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/palmares/vallee-du-rhone`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/palmares/ile-de-france-elargie`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/services-publics`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/services-publics/cote-atlantique`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/services-publics/arc-mediterraneen`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/services-publics/arc-alpin`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/services-publics/sud-ouest-gascon`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/services-publics/vallee-du-rhone`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/services-publics/ile-de-france-elargie`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/villes`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/classements`, lastModified: RANKING_UPDATED, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/comparer`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/methode`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/red-flags`, lastModified: STATIC_UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/guides`, lastModified: latestGuideUpdate(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/leaderboard`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/donnees`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/synthese`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE_URL}/regions`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/departements`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/carte`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/faq`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/glossaire`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/calendrier-immobilier`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/outils`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/vibe`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.65 },
    { url: `${BASE_URL}/recherche`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/sommaire`, lastModified: latestGuideUpdate(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/mentions-legales`, lastModified: LEGAL_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/confidentialite`, lastModified: LEGAL_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/cgu`, lastModified: LEGAL_UPDATED, changeFrequency: "yearly", priority: 0.3 },
  ];
}

function latestGuideUpdate(): Date {
  const max = GUIDES.reduce((acc, g) => {
    const t = new Date(g.updatedAt).getTime();
    return t > acc ? t : acc;
  }, 0);
  return max ? new Date(max) : STATIC_UPDATED;
}

function guideSection(): MetadataRoute.Sitemap {
  return GUIDES.map((g) => ({
    url: `${BASE_URL}/guides/${g.slug}`,
    lastModified: new Date(g.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));
}

function citySection(): MetadataRoute.Sitemap {
  return CITIES_SEED.map((city) => ({
    url: `${BASE_URL}/villes/${city.slug}`,
    lastModified: CITY_DATA_UPDATED,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
}

function citySubSection(): MetadataRoute.Sitemap {
  return CITIES_SEED.flatMap((city) => [
    {
      url: `${BASE_URL}/villes/${city.slug}/quartiers`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/climat`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/transports`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/ecoles`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/fiscalite`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/saisons`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.55,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/teletravail`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/avis-honnete`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/louer-ou-acheter`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/climat-2040`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.55,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/empreinte`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.55,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/risques`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/eau`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/air`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/bruit`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/sante`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/emploi`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/velo`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/securite`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/demographie`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/services-publics`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/synthese`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    },
  ]);
}

function comparerSection(): MetadataRoute.Sitemap {
  return [
    ...SEO_PAIRS.map(([a, b]) => ({
      url: `${BASE_URL}/comparer/${a}-vs-${b}`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...SEO_PAIRS.map(([a, b]) => ({
      url: `${BASE_URL}/comparer/${a}-vs-${b}/synthese`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
    ...SEO_TRIPLETS.map(([a, b, c]) => ({
      url: `${BASE_URL}/comparer/${a}-vs-${b}-vs-${c}`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.55,
    })),
    ...SEO_TRIPLETS.map(([a, b, c]) => ({
      url: `${BASE_URL}/comparer/${a}-vs-${b}-vs-${c}/synthese`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}

function comparerRegionsSection(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/comparer-regions`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ];
  for (let i = 0; i < METRO_REGIONS.length; i++) {
    for (let j = i + 1; j < METRO_REGIONS.length; j++) {
      const slug = `${regionToSlug(METRO_REGIONS[i])}-vs-${regionToSlug(METRO_REGIONS[j])}`;
      entries.push({
        url: `${BASE_URL}/comparer-regions/${slug}`,
        lastModified: CITY_DATA_UPDATED,
        changeFrequency: "monthly" as const,
        priority: 0.55,
      });
      entries.push({
        url: `${BASE_URL}/comparer-regions/${slug}/synthese`,
        lastModified: CITY_DATA_UPDATED,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      });
    }
  }
  return entries;
}

function classementsSection(): MetadataRoute.Sitemap {
  // Owner-score rankings (F16) — listed inline to avoid drift with
  // lib/owner-rankings.ts (importing it would create a circular ref with
  // CITIES_SEED at sitemap build time).
  const ownerSlugs = [
    "canicule-resistance",
    "calme-sonore",
    "lien-social",
    "securite-nocturne",
    "sans-voiture",
    "teletravail-proprietaire",
    "qualite-air",
    "securite-femme-seule",
    "jeune-actif",
    "famille-proprietaire",
    "meilleur-rapport-qualite-prix",
    "villes-sous-cotees",
    "villes-moins-cheres",
  ];
  return [
    ...Object.keys(RANKING_META).map((slug) => ({
      url: `${BASE_URL}/classements/${slug}`,
      lastModified: RANKING_UPDATED,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...ownerSlugs.map((slug) => ({
      url: `${BASE_URL}/classements/${slug}`,
      lastModified: RANKING_UPDATED,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
  ];
}

function regionsSection(): MetadataRoute.Sitemap {
  const regions = [...new Set(CITIES_SEED.map((c) => c.region))];
  return regions.flatMap((r) => [
    {
      url: `${BASE_URL}/regions/${slugify(r)}`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/regions/${slugify(r)}/synthese`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.72,
    },
  ]);
}

function tagsSection(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/tags`, lastModified: latestGuideUpdate(), changeFrequency: "weekly", priority: 0.6 },
    ...TAG_SLUGS.map((slug) => ({
      url: `${BASE_URL}/tags/${slug}`,
      lastModified: latestGuideUpdate(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}

function redFlagsSection(): MetadataRoute.Sitemap {
  const cityFiches = CITIES_SEED.map((city) => ({
    url: `${BASE_URL}/red-flags/${city.slug}`,
    lastModified: CITY_DATA_UPDATED,
    changeFrequency: "monthly" as const,
    priority: 0.55,
  }));
  // F4 — Thematic red-flag pages
  const themes = RED_FLAG_THEME_SLUGS.map((slug) => ({
    url: `${BASE_URL}/red-flags/${slug}`,
    lastModified: CITY_DATA_UPDATED,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
  return [...themes, ...cityFiches];
}

function gentrificationSection(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/gentrification`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/gentrification/carte`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...CITIES_SEED.map((city) => ({
      url: `${BASE_URL}/gentrification/${city.slug}`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}

function calculatorSection(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/calculateur-cout-reel`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    ...CITIES_SEED.map((city) => ({
      url: `${BASE_URL}/calculateur-cout-reel/${city.slug}`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}

function departementsSection(): MetadataRoute.Sitemap {
  const depts = [...new Set(CITIES_SEED.map((c) => c.department))];
  return depts.flatMap((d) => [
    {
      url: `${BASE_URL}/departements/${slugify(d)}`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "weekly" as const,
      priority: 0.65,
    },
    {
      url: `${BASE_URL}/departements/${slugify(d)}/fiscalite`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.55,
    },
    {
      url: `${BASE_URL}/departements/${slugify(d)}/synthese`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ]);
}

// ----- EN sitemap sections -----
// Mirrors the EN app/[locale]/ tree. Only routes that actually exist on the EN
// build are emitted, so Google never sees a 404 from the sitemap.

function enStaticSection(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/`, lastModified: STATIC_UPDATED, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/cities`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/rankings`, lastModified: RANKING_UPDATED, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/leaderboard`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/regions`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.75 },
    { url: `${BASE_URL}/departments`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.65 },
    { url: `${BASE_URL}/compare`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.75 },
    { url: `${BASE_URL}/guides`, lastModified: STATIC_UPDATED, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/map`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/quiz`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/faq`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.55 },
    { url: `${BASE_URL}/methodology`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.55 },
    { url: `${BASE_URL}/legal-notice`, lastModified: LEGAL_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: LEGAL_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/from-paris`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/gentrification`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.65 },
    { url: `${BASE_URL}/environment`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/cycling`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/own-vs-rent`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/healthcare`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/safety`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/employment`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.65 },
    { url: `${BASE_URL}/demographics`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.65 },
    { url: `${BASE_URL}/public-services`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.65 },
    { url: `${BASE_URL}/expat-return`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/expat-return/from-suisse`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.55 },
    { url: `${BASE_URL}/expat-return/from-luxembourg`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.55 },
    { url: `${BASE_URL}/expat-return/from-belgique`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.55 },
    { url: `${BASE_URL}/expat-return/from-royaume-uni`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.55 },
    { url: `${BASE_URL}/expat-return/from-canada`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.55 },
    { url: `${BASE_URL}/tools`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE_URL}/geographic-zones`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/overall-ranking`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/glossary`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE_URL}/site-index`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/quality-of-life`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/data-sources`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.55 },
    { url: `${BASE_URL}/property-calendar`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.6 },
  ];
}

function enCitySection(): MetadataRoute.Sitemap {
  return CITIES_SEED.map((city) => ({
    url: `${BASE_URL}/cities/${city.slug}`,
    lastModified: CITY_DATA_UPDATED,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
}

function enRankingsSection(): MetadataRoute.Sitemap {
  return Object.keys(RANKING_META).map((slug) => ({
    url: `${BASE_URL}/rankings/${slug}`,
    lastModified: RANKING_UPDATED,
    changeFrequency: "weekly",
    priority: 0.8,
  }));
}

function enRegionsSection(): MetadataRoute.Sitemap {
  const regions = [...new Set(CITIES_SEED.map((c) => c.region).filter(Boolean) as string[])];
  return regions.map((r) => ({
    url: `${BASE_URL}/regions/${slugify(r)}`,
    lastModified: CITY_DATA_UPDATED,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
}

function enDepartmentsSection(): MetadataRoute.Sitemap {
  const depts = [...new Set(CITIES_SEED.map((c) => c.department).filter(Boolean) as string[])];
  return depts.map((d) => ({
    url: `${BASE_URL}/departments/${slugify(d)}`,
    lastModified: CITY_DATA_UPDATED,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
}

function enCitySubSection(): MetadataRoute.Sitemap {
  const subs = [
    "climate", "transport", "schools", "cost-of-living", "healthcare",
    "safety", "air-quality", "employment", "natural-risks", "noise",
    "water", "demographics", "public-services", "cycling", "own-vs-rent",
    "remote-work", "tax", "honest-review", "climate-2040", "overview",
  ] as const;
  return CITIES_SEED.flatMap((c) =>
    subs.map((sub) => ({
      url: `${BASE_URL}/cities/${c.slug}/${sub}`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.55,
    }))
  );
}

function enCompareSection(): MetadataRoute.Sitemap {
  return [
    ...SEO_PAIRS.map(([a, b]) => ({
      url: `${BASE_URL}/compare/${a}-vs-${b}`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...SEO_TRIPLETS.map(([a, b, c]) => ({
      url: `${BASE_URL}/compare/${a}-vs-${b}-vs-${c}`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.55,
    })),
  ];
}

function enCompareRegionsSection(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/compare-regions`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ];
  for (let i = 0; i < METRO_REGIONS.length; i++) {
    for (let j = i + 1; j < METRO_REGIONS.length; j++) {
      entries.push({
        url: `${BASE_URL}/compare-regions/${regionToSlug(METRO_REGIONS[i])}-vs-${regionToSlug(METRO_REGIONS[j])}`,
        lastModified: CITY_DATA_UPDATED,
        changeFrequency: "monthly" as const,
        priority: 0.55,
      });
    }
  }
  return entries;
}

function enGuidesSection(): MetadataRoute.Sitemap {
  return EN_GUIDES.map((g) => ({
    url: `${BASE_URL}/guides/${g.slug}`,
    lastModified: new Date(g.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
}

const EN_FOR_WHO_SLUGS = [
  "families", "young-professionals", "retirees", "freelancers", "remote-workers",
  "students", "car-free", "premium", "women-solo", "couples", "returning-expats",
] as const;

const EN_RED_FLAG_THEME_SLUGS = [
  "buyers-remorse", "car-dependent", "beautiful-brutal-summers", "chronic-air-pollution",
  "natural-hazards", "noise-nightmare", "water-stress", "medical-desert",
  "chronic-unemployment", "quality-of-life-stretched", "cost-explosion",
  "public-services-desert", "anti-cycling", "critical-ageing", "tense-nights", "harsh-winters",
] as const;

function enRedFlagsSection(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/red-flags`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly" as const, priority: 0.75 },
    { url: `${BASE_URL}/red-flags/themes`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly" as const, priority: 0.7 },
    ...CITIES_SEED.map((c) => ({
      url: `${BASE_URL}/red-flags/${c.slug}`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.55,
    })),
    ...EN_RED_FLAG_THEME_SLUGS.map((slug) => ({
      url: `${BASE_URL}/red-flags/themes/${slug}`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
  ];
}

function enForWhoSection(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/for-who`, lastModified: STATIC_UPDATED, changeFrequency: "monthly" as const, priority: 0.75 },
    ...EN_FOR_WHO_SLUGS.map((slug) => ({
      url: `${BASE_URL}/for-who/${slug}`,
      lastModified: STATIC_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

function enVacationsSection(): MetadataRoute.Sitemap {
  const EN_MONTH_SLUGS = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
  ];
  const ACTIVITY_SLUGS = [
    "plage", "montagne", "ski", "citytrip", "vignobles",
    "surf", "thermal", "road-trip", "gastro", "famille",
  ];
  const PROFILE_SLUGS = ["famille", "couple", "solo", "amis", "seniors"];
  const REGION_SLUGS = [
    "auvergne-rhone-alpes", "bourgogne-franche-comte", "bretagne",
    "centre-val-de-loire", "corse", "grand-est", "hauts-de-france",
    "ile-de-france", "normandie", "nouvelle-aquitaine", "occitanie",
    "pays-de-la-loire", "provence-alpes-cote-d-azur",
    "la-reunion", "martinique", "guadeloupe", "guyane", "mayotte",
  ];
  return [
    {
      url: `${BASE_URL}/vacations`,
      lastModified: STATIC_UPDATED,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    ...EN_MONTH_SLUGS.map((slug) => ({
      url: `${BASE_URL}/vacations/month/${slug}`,
      lastModified: STATIC_UPDATED,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...ACTIVITY_SLUGS.map((slug) => ({
      url: `${BASE_URL}/vacations/activity/${slug}`,
      lastModified: STATIC_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...PROFILE_SLUGS.map((slug) => ({
      url: `${BASE_URL}/vacations/profile/${slug}`,
      lastModified: STATIC_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
    ...REGION_SLUGS.map((slug) => ({
      url: `${BASE_URL}/vacations/region/${slug}`,
      lastModified: STATIC_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...CITIES_SEED.map((c) => ({
      url: `${BASE_URL}/vacations/${c.slug}`,
      lastModified: STATIC_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}

function enCalculatorsSection(): MetadataRoute.Sitemap {
  const SALARY_SLUGS = ["1500-euros", "2000-euros", "2500-euros", "3000-euros", "4000-euros", "5000-euros"] as const;
  return [
    { url: `${BASE_URL}/calculator/real-cost`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE_URL}/household-cost`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly" as const, priority: 0.75 },
    { url: `${BASE_URL}/simulator/purchase`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE_URL}/salary-equivalent`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE_URL}/living-on`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly" as const, priority: 0.75 },
    ...SALARY_SLUGS.map((slug) => ({
      url: `${BASE_URL}/living-on/${slug}`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...CITIES_SEED.map((c) => ({
      url: `${BASE_URL}/calculator/real-cost/${c.slug}`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...CITIES_SEED.map((c) => ({
      url: `${BASE_URL}/household-cost/${c.slug}`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.55,
    })),
  ];
}

function enQuizSection(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/quiz`, lastModified: STATIC_UPDATED, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE_URL}/quiz/compatibility`, lastModified: STATIC_UPDATED, changeFrequency: "monthly" as const, priority: 0.8 },
  ];
}

function quitterSection(): MetadataRoute.Sitemap {
  return QUITTER_PAIRS.map((p) => ({
    url: `${BASE_URL}/quitter/${pairToSlug(p)}`,
    lastModified: STATIC_UPDATED,
    changeFrequency: "monthly",
    priority: 0.65,
  }));
}

function coutMenageSection(): MetadataRoute.Sitemap {
  return CITIES_SEED.map((c) => ({
    url: `${BASE_URL}/cout-menage/${c.slug}`,
    lastModified: CITY_DATA_UPDATED,
    changeFrequency: "monthly",
    priority: 0.6,
  }));
}

function vacancesSection(): MetadataRoute.Sitemap {
  const MONTH_SLUGS = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
  ];
  const ACTIVITY_SLUGS = [
    "plage", "montagne", "ski", "citytrip", "vignobles",
    "surf", "thermal", "road-trip", "gastro", "famille",
  ];
  const PROFILE_SLUGS = ["famille", "couple", "solo", "amis", "seniors"];
  const REGION_SLUGS = [
    "auvergne-rhone-alpes", "bourgogne-franche-comte", "bretagne",
    "centre-val-de-loire", "corse", "grand-est", "hauts-de-france",
    "ile-de-france", "normandie", "nouvelle-aquitaine", "occitanie",
    "pays-de-la-loire", "provence-alpes-cote-d-azur",
    "la-reunion", "martinique", "guadeloupe", "guyane", "mayotte",
  ];
  return [
    {
      url: `${BASE_URL}/vacances`,
      lastModified: STATIC_UPDATED,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/vacances/quiz`,
      lastModified: STATIC_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...MONTH_SLUGS.map((slug) => ({
      url: `${BASE_URL}/vacances/mois/${slug}`,
      lastModified: STATIC_UPDATED,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...ACTIVITY_SLUGS.map((slug) => ({
      url: `${BASE_URL}/vacances/activite/${slug}`,
      lastModified: STATIC_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...PROFILE_SLUGS.map((slug) => ({
      url: `${BASE_URL}/vacances/profil/${slug}`,
      lastModified: STATIC_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
    ...REGION_SLUGS.map((slug) => ({
      url: `${BASE_URL}/vacances/region/${slug}`,
      lastModified: STATIC_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...CITIES_SEED.map((c) => ({
      url: `${BASE_URL}/vacances/${c.slug}`,
      lastModified: STATIC_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}

// Next 16 passes `id` as Promise<string>. See:
// node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-sitemaps.md
export default async function sitemap({ id }: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const chunk = chunkAt(Number(await id));
  switch (chunk) {
    case "static": return staticSection();
    case "guides": return guideSection();
    case "cities": return citySection();
    case "city-sub": return citySubSection();
    case "comparer": return comparerSection();
    case "comparer-regions": return comparerRegionsSection();
    case "classements": return classementsSection();
    case "regions": return regionsSection();
    case "departements": return departementsSection();
    case "tags": return tagsSection();
    case "red-flags": return redFlagsSection();
    case "calculator": return calculatorSection();
    case "gentrification": return gentrificationSection();
    case "quitter": return quitterSection();
    case "cout-menage": return coutMenageSection();
    case "vacances": return vacancesSection();
    case "en-static": return enStaticSection();
    case "en-cities": return enCitySection();
    case "en-rankings": return enRankingsSection();
    case "en-regions": return enRegionsSection();
    case "en-departments": return enDepartmentsSection();
    case "en-city-sub": return enCitySubSection();
    case "en-compare": return enCompareSection();
    case "en-compare-regions": return enCompareRegionsSection();
    case "en-guides": return enGuidesSection();
    case "en-for-who": return enForWhoSection();
    case "en-red-flags": return enRedFlagsSection();
    case "en-vacations": return enVacationsSection();
    case "en-quiz": return enQuizSection();
    case "en-calculators": return enCalculatorsSection();
    default: return [];
  }
}
