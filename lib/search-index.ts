/**
 * Projection maigre du corpus éditorial pour la palette de recherche.
 *
 * `components/SearchPalette.tsx` est un composant client : importer
 * `@/data/guides` depuis lui expédie au navigateur les ~6 Mo du corpus (le
 * corps de chaque section de chaque guide) plus `CITIES_SEED`, que
 * `data/guides.ts` importe pour ses contrôles d'intégrité — pour n'afficher
 * qu'une liste de titres. Un tableau de littéraux n'est pas tree-shakable.
 *
 * Le fichier JSON est généré par `scripts/build-search-index.mjs`
 * (`npm run search-index`, rejoué automatiquement par `prebuild`) en évaluant
 * les modules réels, donc ces listes ne peuvent pas diverger de ce que le
 * serveur affiche. **Ne rien importer d'autre ici** : ce module est la
 * frontière qui garde le corpus hors du bundle client.
 */
import RAW from "@/data/search-index.json";

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

/** Tous les guides FR, dans l'ordre de `GUIDES`. */
export const SEARCH_GUIDES: readonly SearchIndexGuide[] = RAW.guides;

/**
 * Tags ayant leur page `/tags/[slug]`, du plus fourni au moins fourni —
 * l'ordre et le seuil viennent de `getAllTagsWithCounts()`.
 */
export const SEARCH_TAGS: readonly SearchIndexTag[] = RAW.tags;
