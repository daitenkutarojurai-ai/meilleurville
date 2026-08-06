/**
 * Projection maigre du corpus éditorial pour la palette de recherche.
 *
 * `components/SearchPalette.tsx` est un composant client : importer
 * `@/data/guides` depuis lui expédie au navigateur les ~6 Mo du corpus (le
 * corps de chaque section de chaque guide) plus `CITIES_SEED`, que
 * `data/guides.ts` importe pour ses contrôles d'intégrité — pour n'afficher
 * qu'une liste de titres. Un tableau de littéraux n'est pas tree-shakable.
 *
 * Les fichiers JSON sont générés par `scripts/build-search-index.mjs`
 * (`npm run search-index`, rejoué automatiquement par `prebuild`) en évaluant
 * les modules réels, donc ces listes ne peuvent pas diverger de ce que le
 * serveur affiche. **Ne rien importer d'autre ici** : ce module est la
 * frontière qui garde le corpus hors du bundle client.
 *
 * Deux corpus, deux projections. `mavilleideale.fr` sert `data/guides.ts`,
 * `bestcitiesinfrance.com` sert `data/guides-en.ts` : la palette servait le
 * français sur le domaine anglais tant qu'il n'y avait qu'un index. Le choix
 * se fait sur `process.env.NEXT_PUBLIC_DEFAULT_LOCALE` — lu directement plutôt
 * que via `DEFAULT_LOCALE` de `@/lib/i18n`, pour ne rien importer d'autre ici
 * et pour que la valeur soit inlinée au build : la branche morte, et le JSON
 * qu'elle référence, tombent alors du bundle (un domaine = un build, la valeur
 * est figée). Vérifié sur ce ternaire exact : bundle FR 187 Ko (= le seul JSON
 * FR), bundle EN 98 Ko (= le seul JSON EN). Si un jour l'élimination n'a plus
 * lieu, le surcoût reste borné à l'autre fichier — sans commune mesure avec
 * les 5,9 Mo que ce module a supprimés.
 */
import RAW_FR from "@/data/search-index.json";
import RAW_EN from "@/data/search-index.en.json";

export interface SearchIndexGuide {
  slug: string;
  title: string;
  emoji: string;
}

export interface SearchIndexTag {
  slug: string;
  label: string;
  count: number;
}

const RAW = process.env.NEXT_PUBLIC_DEFAULT_LOCALE === "en" ? RAW_EN : RAW_FR;

/** Tous les guides de la locale du build, dans l'ordre du corpus. */
export const SEARCH_GUIDES: readonly SearchIndexGuide[] = RAW.guides;

/**
 * Tags ayant leur page `/tags/[slug]`, du plus fourni au moins fourni —
 * l'ordre et le seuil viennent de `getAllTagsWithCounts()` (FR) ou de
 * `getAllTagsWithCountsEn()` (EN).
 */
export const SEARCH_TAGS: readonly SearchIndexTag[] = RAW.tags;
