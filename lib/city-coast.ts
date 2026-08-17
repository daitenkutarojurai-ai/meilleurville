/**
 * Distance à la mer ouverte, en kilomètres, par slug de ville.
 *
 * Généré par `scripts/city-coast.mjs` (`npm run coast`) depuis le polygone
 * océan Natural Earth 10m, rastérisé puis filtré sur la largeur du plan d'eau :
 * un fleuve de 500 m n'est pas la mer, une baie de 10 km l'est. C'est ce qui
 * sépare Bordeaux (19 km) et Nantes (26 km) de La Rochelle (0,1 km) — les trois
 * étaient « bord de mer » du temps où le test lisait les tags de caractère.
 *
 * Le fichier fait 10 Ko : il peut voyager dans un bundle client, contrairement
 * au seed. `lib/city-match.ts` en dépend et est importé par le quiz.
 */
import COAST from "@/data/city-coast.json";

const KM: Record<string, number> = COAST;

/** Distance à la mer ouverte en km, `null` si la ville n'est pas au fichier. */
export function coastDistanceKm(slug: string): number | null {
  return KM[slug] ?? null;
}

/** Seuil « les pieds dans l'eau » : au-delà, on parle de proximité, pas de littoral. */
export const COASTAL_KM = 5;
