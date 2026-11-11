// Jumelles FR ↔ EN des pages « pour qui ».
//
// `/pour-qui/[profil]` et `/for-who/[slug]` sont deux routes dynamiques dont les
// slugs ne se traduisent pas mécaniquement (`familles-avec-enfants` ↔ `families`)
// et dont le côté EN ne couvre que 13 des 39 profils. Les deux pages existaient
// sans se déclarer (audit 2026-11-11 : aucun hreflang sur les 39 pages FR). Cette
// table est la seule source du rapprochement ; `npm run hreflang:check` vérifie
// que chaque slug est bien généré de chaque côté. Module serveur (il importe
// lib/i18n) : ne pas le lire depuis un composant client.
import { pathAlternates, pathAlternatesEn } from "@/lib/i18n";

export const PROFILE_PAGE_EN_SLUG: Record<string, string> = {
  "familles-avec-enfants": "families",
  "jeunes-actifs": "young-professionals",
  "retraites": "retirees",
  "freelances": "freelancers",
  "teletravailleurs": "remote-workers",
  "etudiants": "students",
  "sans-voiture": "car-free",
  "premium": "premium",
  "solo-femme": "women-solo",
  "couple-sans-enfant": "couples",
  "expat-retour": "returning-expats",
  "primo-accedants": "first-time-buyers",
  "familles-monoparentales": "single-parents",
};

/** `alternates` d'une page `/pour-qui/<profil>` : canonical seul sans jumelle EN. */
export function profilePageAlternates(frSlug: string) {
  const enSlug = PROFILE_PAGE_EN_SLUG[frSlug];
  return enSlug
    ? pathAlternates(`/pour-qui/${frSlug}`, `/for-who/${enSlug}`)
    : { canonical: `/pour-qui/${frSlug}` };
}

/** `alternates` de `/for-who/<slug>` ; `null` si la table ne connaît pas la paire. */
export function profilePageAlternatesEn(frSlug: string, enSlug: string) {
  return PROFILE_PAGE_EN_SLUG[frSlug] === enSlug
    ? pathAlternatesEn(`/pour-qui/${frSlug}`, `/for-who/${enSlug}`)
    : null;
}
