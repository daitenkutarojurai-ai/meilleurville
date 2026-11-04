import type { Guide } from "@/data/guides";
import type { GuideCardData } from "@/components/GuideCard";

/** Les champs d'une carte de guide, intro coupée à ~200 caractères (la carte la
 *  borne à deux lignes ; elle reste assez longue pour servir à la recherche).
 *  Partagé par app/guides/page.tsx et /guides/cards.json : la grille compare
 *  les deux listes par slug, elles doivent donner les mêmes cartes. */
export function guideCardProjection(g: Guide): GuideCardData {
  const { slug, title, intro, category, emoji, readMinutes, publishedAt, updatedAt, tags } = g;
  return {
    slug, title, category, emoji, readMinutes, publishedAt, updatedAt, tags,
    intro: intro.length > 200 ? intro.slice(0, 200).replace(/\s+\S*$/, "") + "…" : intro,
  };
}

/** Cartes rendues avant « afficher tout ». Ici et pas dans GuidesGrid : une
 *  valeur importée d'un module "use client" arrive côté serveur en référence
 *  client, pas en nombre. */
export const GUIDES_INITIAL_VISIBLE = 60;
