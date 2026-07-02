// V11 — Couverture commerciale par ville.
//
// 4 dimensions dérivées du seed (population, characterTags, scores life/culture).
// Aucune dépendance externe, aucun dataset per-city supplémentaire.
//
// Sources de référence (toutes publiques, pour cross-check éditorial) :
//   - INSEE BPE (Base permanente des équipements) : nombre de commerces par
//     commune (alimentaire, non-alimentaire, services) — actualisée chaque année.
//   - Procos / CCI : taux de vacance commerciale des centres-villes.
//   - Programme "Action Cœur de Ville" (ANCT) : communes moyennes en revitalisation.
//
// **Convention** : tous les scores 0-10, 10 = couverture commerciale excellente
// (dense, diversifiée, centre-ville vivant). Score faible = offre limitée /
// risque de désert commercial. C'est la convention d'affichage standard
// (10 = excellent) — pas d'inversion nécessaire avant affichage.

import type { CityLight } from "@/lib/cities-light";

export type CommerceLevel = "exceptionnel" | "solide" | "correct" | "limite";

export interface CommerceDimension {
  /** 0-10, 10 = excellent */
  score: number;
  level: CommerceLevel;
  reason: string;
}

export interface Commerce {
  /** Composite 0-10, 10 = couverture excellente */
  composite: number;
  level: CommerceLevel;
  coverage: CommerceDimension;   // densité / diversité de l'offre
  proximity: CommerceDimension;  // marchés & commerce de proximité
  bigBox: CommerceDimension;     // grandes surfaces & zones commerciales
  centreVille: CommerceDimension; // vitalité du centre-ville (anti-désert)
  signature: string;
}

function levelFromScore(s: number): CommerceLevel {
  if (s >= 7.5) return "exceptionnel";
  if (s >= 6) return "solide";
  if (s >= 4.5) return "correct";
  return "limite";
}

const clamp = (n: number) => Math.max(0.5, Math.min(9.7, n));

// Population → densité commerciale de base. La couverture retail suit très
// largement la taille de la ville (aire de chalandise). Courbe log douce.
function coverageFromPop(pop: number): number {
  if (pop >= 500_000) return 8.8;
  if (pop >= 200_000) return 8.2;
  if (pop >= 100_000) return 7.4;
  if (pop >= 50_000) return 6.6;
  if (pop >= 30_000) return 5.9;
  if (pop >= 20_000) return 5.2;
  if (pop >= 10_000) return 4.4;
  if (pop >= 5_000) return 3.6;
  return 2.8;
}

export function computeCommerce(city: CityLight): Commerce {
  const pop = city.population ?? 0;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const life = city.scores.life;
  const culture = city.scores.culture;

  const has = (t: string) => tags.includes(t);

  // ─── Couverture commerciale (densité + diversité) ──────────────────────
  let cov = coverageFromPop(pop);
  if (has("métropole")) cov += 0.6;
  if (has("dynamique")) cov += 0.4;
  if (has("préfecture")) cov += 0.4;
  if (has("tourisme")) cov += 0.3;
  if (has("étudiant")) cov += 0.3;
  if (has("populaire")) cov += 0.2;
  if (has("calme")) cov -= 0.5;
  if (has("résidentiel")) cov -= 0.4;
  if (has("banlieueparisienne")) cov -= 0.3; // effet ville-dortoir sur le retail propre
  cov += (life - 5.7) * 0.25;
  cov = clamp(cov);
  const coverage: CommerceDimension = {
    score: cov,
    level: levelFromScore(cov),
    reason:
      cov >= 7.5
        ? `Offre commerciale dense et très diversifiée : grandes enseignes, indépendants, spécialistes. Peu de trajets nécessaires pour l'essentiel.`
        : cov >= 6
          ? `Bonne couverture : la plupart des besoins courants et spécialisés se trouvent sur place.`
          : cov >= 4.5
            ? `Couverture correcte pour le quotidien ; l'offre spécialisée peut demander un déplacement vers un pôle plus grand.`
            : `Offre limitée — dépendance probable à une ville voisine pour le non-alimentaire et les enseignes spécialisées.`,
  };

  // ─── Commerce de proximité & marchés ───────────────────────────────────
  let prox = 5.4 + (culture - 5.7) * 0.3;
  if (has("marché")) prox += 1.4;
  if (has("gastronomie")) prox += 0.7;
  if (has("authenticité")) prox += 0.6;
  if (has("médiéval") || has("historique") || has("patrimoine")) prox += 0.5;
  if (has("tourisme")) prox += 0.5;
  if (has("populaire")) prox += 0.4;
  if (pop >= 30_000) prox += 0.4;
  if (has("banlieueparisienne")) prox -= 0.4;
  if (has("résidentiel") && !has("marché")) prox -= 0.3;
  prox = clamp(prox);
  const proximity: CommerceDimension = {
    score: prox,
    level: levelFromScore(prox),
    reason:
      prox >= 7.5
        ? `Marchés vivants et tissu d'indépendants riche : primeurs, boulangeries, cavistes, commerces de bouche bien représentés.`
        : prox >= 6
          ? `Commerce de proximité solide, avec au moins un marché régulier et des indépendants actifs.`
          : prox >= 4.5
            ? `Proximité correcte : boulangeries et supérettes couvrent le quotidien, l'offre indépendante reste modeste.`
            : `Proximité fragile : peu d'indépendants, marché épisodique, quotidien centré sur la grande distribution.`,
  };

  // ─── Grandes surfaces & zones commerciales périphériques ───────────────
  let big = coverageFromPop(pop) - 0.3;
  if (has("banlieueparisienne")) big += 0.6; // zones commerciales denses en périph.
  if (has("préfecture")) big += 0.4;
  if (has("populaire")) big += 0.3;
  if (has("calme") || has("montagne")) big -= 0.6;
  if (has("médiéval") || has("village")) big -= 0.4;
  if (pop < 15_000) big -= 0.5;
  big = clamp(big);
  const bigBox: CommerceDimension = {
    score: big,
    level: levelFromScore(big),
    reason:
      big >= 7.5
        ? `Zones commerciales périphériques complètes : hypermarchés, retail parks, enseignes de bricolage et d'ameublement à proximité immédiate.`
        : big >= 6
          ? `Grandes surfaces bien implantées, généralement en périphérie accessible en voiture.`
          : big >= 4.5
            ? `Au moins un pôle de grande distribution ; l'offre en enseignes spécialisées peut nécessiter un trajet.`
            : `Peu ou pas de grande surface sur place — les gros achats impliquent un déplacement vers un pôle voisin.`,
  };

  // ─── Vitalité du centre-ville (anti-désert commercial) ─────────────────
  // Les petites préfectures/sous-préfectures et villes moyennes sont les plus
  // exposées à la vacance commerciale (Procos, Action Cœur de Ville).
  let centre = 6.2 + (culture - 5.7) * 0.35;
  if (has("tourisme")) centre += 1.0;
  if (has("médiéval") || has("historique") || has("patrimoine")) centre += 0.6;
  if (has("dynamique")) centre += 0.5;
  if (has("étudiant")) centre += 0.5;
  if (has("marché")) centre += 0.4;
  if (has("métropole")) centre += 0.4;
  // Ville moyenne (20-60k) sans atout patrimonial/touristique : zone de risque.
  const midSize = pop >= 20_000 && pop < 60_000;
  const hasDraw = has("tourisme") || has("médiéval") || has("historique") || has("patrimoine") || has("étudiant");
  if (midSize && !hasDraw) centre -= 1.2;
  if (has("industriel") || has("industrie")) centre -= 0.6;
  if (has("banlieueparisienne")) centre -= 0.7; // pas de vrai centre marchand
  if (has("ANRU")) centre -= 0.5;
  centre = clamp(centre);
  const centreVille: CommerceDimension = {
    score: centre,
    level: levelFromScore(centre),
    reason:
      centre >= 7.5
        ? `Centre-ville marchand vivant : rues commerçantes animées, faible vacance, terrasses et flânerie.`
        : centre >= 6
          ? `Centre-ville commerçant plutôt actif, avec une vacance contenue.`
          : centre >= 4.5
            ? `Centre-ville correct mais fragile : quelques cellules vides, concurrence de la périphérie.`
            : `Centre-ville en tension : vacance commerciale visible, dynamique captée par les zones périphériques (profil "Action Cœur de Ville").`,
  };

  const composite = clamp(
    coverage.score * 0.35 +
      proximity.score * 0.25 +
      bigBox.score * 0.15 +
      centreVille.score * 0.25,
  );
  const level = levelFromScore(composite);

  const signature =
    level === "exceptionnel"
      ? `${city.name} offre une couverture commerciale de premier plan : on y trouve à peu près tout sur place, du marché de quartier aux grandes enseignes.`
      : level === "solide"
        ? `${city.name} dispose d'une offre commerciale solide et équilibrée entre proximité, centre-ville et grandes surfaces.`
        : level === "correct"
          ? `${city.name} couvre le quotidien sans difficulté ; l'offre spécialisée ou le centre-ville marchand y sont plus limités.`
          : `${city.name} a une offre commerciale restreinte : le quotidien se gère, mais les achats spécialisés dépendent souvent d'une ville voisine.`;

  return { composite, level, coverage, proximity, bigBox, centreVille, signature };
}

export const COMMERCE_LEVEL_LABEL: Record<CommerceLevel, string> = {
  exceptionnel: "Exceptionnel",
  solide: "Solide",
  correct: "Correct",
  limite: "Limité",
};

export const COMMERCE_LEVEL_COLOR: Record<CommerceLevel, string> = {
  exceptionnel: "text-emerald-600",
  solide: "text-lime-600",
  correct: "text-amber-600",
  limite: "text-orange-600",
};

export const COMMERCE_LEVEL_BG: Record<CommerceLevel, string> = {
  exceptionnel: "bg-emerald-50 border-emerald-200",
  solide: "bg-lime-50 border-lime-200",
  correct: "bg-amber-50 border-amber-200",
  limite: "bg-orange-50 border-orange-200",
};
