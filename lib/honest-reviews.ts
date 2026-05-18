// F27 — Honest Reviews v0
//
// Synthesises a per-city honest review by combining three signal sources :
//   1. Seed axis scores (life, transport, nature, cost, safety, culture,
//      remoteWork, schools)
//   2. Owner scores (10 dimensions: canicule, solitude, bruit, securite_nocturne,
//      sans_voiture, teletravail, qualite_air, securite_femme_seule, jeune_actif,
//      famille)
//   3. Profile-fit ranking — where this city sits among 352 in each of the 10
//      lifestyle profiles (familles, jeunes actifs, retraités, freelances, etc.).
//
// Output is editorial-flavoured but deterministic — same city always yields
// the same review. No fake quotes, no invented numbers.

import { CITIES_SEED, type CitySeed } from "@/data/cities-seed";
import { computeOwnerScores, type OwnerScore } from "@/lib/owner-scores";
import { PROFILE_PAGES, rankByProfile, type ProfileDef } from "@/lib/profile-pages";

export interface HonestReviewBullet {
  label: string;
  detail: string;
  score: number;
  source: "axis" | "owner";
}

export interface HonestReviewProfileFit {
  profile: ProfileDef;
  rank: number; // 1 = best of 352
  score: number;
  reason: string;
  /** True when the fit is just "moins bon" plutôt que rédhibitoire — used to
      soften the wording in the « À éviter si » block when the city has no
      profile in the bottom 30 (donc rien de vraiment disqualifiant). */
  soft?: boolean;
}

export interface HonestReview {
  city: CitySeed;
  /** 3-4 strongest signals (≥ 7.5 / 10) */
  strengths: HonestReviewBullet[];
  /** 3 weakest signals (≤ 4.5 / 10) */
  weaknesses: HonestReviewBullet[];
  /** Up to 2 profiles where city ranks in top 30 */
  perfectFor: HonestReviewProfileFit[];
  /** Up to 2 profiles où la ville ressort moins. Quand aucun profil n'est
      dans le bottom 30 (rien de rédhibitoire), on remonte malgré tout les
      deux moins bonnes correspondances — flaggées `soft: true` pour que la
      UI les présente comme une nuance, pas une mise en garde. */
  avoidIf: HonestReviewProfileFit[];
  /** One-liner verdict */
  oneLine: string;
}

const AXIS_LABELS: Record<keyof CitySeed["scores"], { label: string; pro: string; con: string }> = {
  global: { label: "Score global", pro: "Excellence générale", con: "Plusieurs axes en retrait" },
  life: { label: "Qualité de vie", pro: "Art de vivre quotidien soigné", con: "Quotidien sans signe distinctif" },
  transport: { label: "Transports", pro: "Réseau dense, on se passe de voiture", con: "Voiture quasi obligatoire" },
  nature: { label: "Nature", pro: "Accès direct nature/eau/montagne", con: "Très peu d'espaces naturels accessibles" },
  cost: { label: "Coût de la vie", pro: "Loyers et prix accessibles", con: "Pouvoir d'achat sous pression" },
  safety: { label: "Sécurité", pro: "Sentiment de sécurité élevé", con: "Insécurité ressentie significative" },
  culture: { label: "Culture", pro: "Scène culturelle dense, festivals", con: "Offre culturelle pauvre" },
  remoteWork: { label: "Télétravail", pro: "Fibre + coworking + cadre", con: "Conditions remote en retrait" },
  schools: { label: "Écoles", pro: "Offre scolaire de premier plan", con: "Offre scolaire dans la moyenne basse" },
};

const OWNER_LABELS_PRO: Record<string, string> = {
  score_canicule: "Bien tempéré l'été",
  score_solitude: "Tissu social fort, on ne s'y sent pas seul",
  score_bruit: "Calme sonore au-dessus de la moyenne",
  score_securite_nocturne: "Sortir le soir sans crainte",
  score_sans_voiture: "Vivable sans voiture",
  score_teletravail: "Très bon cadre pour télétravailler",
  score_qualite_air: "Qualité de l'air remarquable",
  score_securite_femme_seule: "Sentiment de sécurité solo-femme",
  score_jeune_actif: "Communauté 25-35 ans dynamique",
  score_famille: "Très bien pour élever des enfants",
};

const OWNER_LABELS_CON: Record<string, string> = {
  score_canicule: "Étés de plus en plus chauds",
  score_solitude: "Isolement social fréquent (forte part de ménages seuls)",
  score_bruit: "Nuisances sonores marquées",
  score_securite_nocturne: "Vigilance la nuit dans certains quartiers",
  score_sans_voiture: "Sans voiture, la vie est compliquée",
  score_teletravail: "Couverture fibre et coworking limités",
  score_qualite_air: "Qualité de l'air dégradée",
  score_securite_femme_seule: "Sentiment de sécurité solo-femme en retrait",
  score_jeune_actif: "Démographie jeune peu représentée",
  score_famille: "Pas le meilleur choix pour une famille",
};

function axisAsBullet(city: CitySeed, key: keyof CitySeed["scores"], mode: "pro" | "con"): HonestReviewBullet {
  const meta = AXIS_LABELS[key];
  const score = city.scores[key];
  return {
    label: meta.label,
    detail: mode === "pro" ? meta.pro : meta.con,
    score,
    source: "axis",
  };
}

function ownerAsBullet(s: OwnerScore, mode: "pro" | "con"): HonestReviewBullet {
  return {
    label: s.label,
    detail: (mode === "pro" ? OWNER_LABELS_PRO[s.key] : OWNER_LABELS_CON[s.key]) ?? s.label,
    score: s.value,
    source: "owner",
  };
}

// Cache profile rankings so we don't recompute 352 × 10 = 3520 scores on every
// city page render.
let profileRankCache: Map<string, Map<string, { rank: number; score: number; reason: string }>> | null = null;

function getProfileRanks(): Map<string, Map<string, { rank: number; score: number; reason: string }>> {
  if (profileRankCache) return profileRankCache;
  profileRankCache = new Map();
  for (const profile of PROFILE_PAGES) {
    const ranked = rankByProfile(profile, CITIES_SEED.length);
    const map = new Map<string, { rank: number; score: number; reason: string }>();
    ranked.forEach((row, idx) => {
      map.set(row.city.slug, { rank: idx + 1, score: row.score, reason: row.reason });
    });
    profileRankCache.set(profile.slug, map);
  }
  return profileRankCache;
}

function buildOneLine(city: CitySeed, strengths: HonestReviewBullet[], weaknesses: HonestReviewBullet[]): string {
  const top = strengths[0];
  const worst = weaknesses[0];
  const namedStrength = top ? top.detail.toLowerCase() : `score global ${city.scores.global.toFixed(1)}/10`;
  if (worst && worst.score < 4.0) {
    return `${city.name} brille par ${namedStrength}, mais ${worst.detail.toLowerCase()}.`;
  }
  if (worst && worst.score < 5.0) {
    return `${city.name} marque des points sur ${namedStrength} ; reste vigilant·e sur ${worst.label.toLowerCase()}.`;
  }
  return `${city.name} : un profil solide avec ${namedStrength}, sans gros défaut majeur.`;
}

export function buildHonestReview(city: CitySeed): HonestReview {
  // 1. Axis bullets — top + bottom 3 (skip "global" since it's a meta-axis)
  const axisEntries: Array<{ key: keyof CitySeed["scores"]; score: number }> = (Object.keys(city.scores) as Array<keyof CitySeed["scores"]>)
    .filter((k) => k !== "global")
    .map((k) => ({ key: k, score: city.scores[k] }));

  const owner = computeOwnerScores(city);

  // Strengths : top 4 across axis + owner, score ≥ 7.0
  const strengthCandidates: HonestReviewBullet[] = [
    ...axisEntries.filter((e) => e.score >= 7.0).map((e) => axisAsBullet(city, e.key, "pro")),
    ...owner.filter((s) => s.value >= 7.0).map((s) => ownerAsBullet(s, "pro")),
  ];
  // Sort by score desc, dedupe by label, keep 4
  strengthCandidates.sort((a, b) => b.score - a.score);
  const strengths = dedupe(strengthCandidates).slice(0, 4);

  // Weaknesses : bottom 3 across axis + owner, score ≤ 4.8
  const weaknessCandidates: HonestReviewBullet[] = [
    ...axisEntries.filter((e) => e.score <= 4.8).map((e) => axisAsBullet(city, e.key, "con")),
    ...owner.filter((s) => s.value <= 4.8).map((s) => ownerAsBullet(s, "con")),
  ];
  weaknessCandidates.sort((a, b) => a.score - b.score);
  const weaknesses = dedupe(weaknessCandidates).slice(0, 3);

  // Profile fit : look up rank in each profile, pick top-30 → perfectFor, bottom-30 → avoidIf
  const ranks = getProfileRanks();
  const fits: HonestReviewProfileFit[] = PROFILE_PAGES.map((p) => {
    const r = ranks.get(p.slug)!.get(city.slug)!;
    return { profile: p, rank: r.rank, score: r.score, reason: r.reason };
  });
  const total = CITIES_SEED.length;
  const perfectFor = fits.filter((f) => f.rank <= 30).sort((a, b) => a.rank - b.rank).slice(0, 2);
  let avoidIf: HonestReviewProfileFit[] = fits
    .filter((f) => f.rank >= total - 30)
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 2);
  if (avoidIf.length === 0) {
    // Aucun profil rédhibitoire — on remonte les 2 moins bonnes
    // correspondances (rank au-dessous de la médiane) et on les flagge
    // `soft` pour que la UI les présente comme un simple « moins fort
    // pour ce profil » plutôt qu'une mise en garde.
    avoidIf = fits
      .filter((f) => f.rank > total / 2)
      .sort((a, b) => b.rank - a.rank)
      .slice(0, 2)
      .map((f) => ({ ...f, soft: true }));
  }

  const oneLine = buildOneLine(city, strengths, weaknesses);

  return { city, strengths, weaknesses, perfectFor, avoidIf, oneLine };
}

function dedupe(bullets: HonestReviewBullet[]): HonestReviewBullet[] {
  const seen = new Set<string>();
  const out: HonestReviewBullet[] = [];
  for (const b of bullets) {
    const key = b.label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(b);
  }
  return out;
}
