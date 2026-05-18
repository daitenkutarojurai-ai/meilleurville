// Mapping path-keyword → emoji pour décorer les blocs « Aller plus loin »
// des sous-pages ville. Centralisé ici pour rester cohérent avec le strip
// de sub-pages du profil ville classique (`app/villes/[slug]/CityProfile.tsx`)
// qui utilise les mêmes emojis.

const ICONS: Record<string, string> = {
  // City sub-pages
  air: "🌬️",
  bruit: "🔊",
  climat: "☀️",
  "climat-2040": "🌡️",
  demographie: "👥",
  eau: "💧",
  ecoles: "🎓",
  emploi: "💼",
  fiscalite: "💰",
  louer: "🔑",
  "louer-ou-acheter": "🔑",
  quartiers: "🏘️",
  risques: "⚠️",
  saisons: "🌸",
  sante: "🩺",
  securite: "🛡️",
  "services-publics": "🏛️",
  synthese: "✨",
  teletravail: "💻",
  transports: "🚊",
  velo: "🚲",
  "avis-honnete": "🧭",
  // Hub-level
  villes: "🏙️",
  classements: "📊",
  comparer: "⚖️",
  guides: "📖",
  carte: "🗺️",
  "red-flags": "🚩",
  vacances: "🌴",
  "cadre-de-vie": "🌿",
  "cout-menage": "🏠",
  "calculateur-cout-reel": "🧮",
  gentrification: "📈",
  "salaire-equivalent": "💸",
};

/**
 * Returns an emoji for a given route path. Looks up the last meaningful
 * segment (skipping dynamic segments like [slug]).
 */
export function iconForRoute(path: string): string {
  // Strip query/hash + leading/trailing slash
  const clean = path.split(/[?#]/)[0].replace(/^\/|\/$/g, "");
  const parts = clean.split("/").filter(Boolean);
  // Try last segment first, then walk back
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    if (ICONS[p]) return ICONS[p];
  }
  return "→";
}
