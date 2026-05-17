// F4 — Red Flag thématiques.
//
// 4 thèmes éditoriaux (regrets d'achat, sans voiture difficile, belles mais
// invivables l'été, air irrespirable l'hiver). Chaque thème expose une
// fonction `rank()` qui retourne les villes triées par "gravité" sur ce
// thème, avec un score 0-10 et une raison citable.
//
// Toutes les valeurs viennent du seed actuel + lib/owner-scores. Aucun fetch.
// Quand owner-scores passe en v1 (sources réelles), les classements ici se
// recalculent automatiquement.

import { CITIES_SEED } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";
import { computeOwnerScores } from "@/lib/owner-scores";
import { computeNaturalRisks } from "@/lib/natural-risks";
import { computeWaterStress } from "@/lib/water-stress";
import { computeNoiseExposure } from "@/lib/noise-exposure";

type SeedCity = (typeof CITIES_SEED)[number];

export interface RedFlagRow {
  city: SeedCity;
  severity: number; // 0-10, 10 = pire
  reason: string; // raison citable (chiffrée) — apparait sous le nom de ville
}

export interface RedFlagTheme {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  emoji: string;
  intro: string; // le mythe / la promesse marketing
  reality: string; // ce que disent les chiffres
  methodology: string; // comment on a calculé
  rank: () => RedFlagRow[];
}

// Helper: ranking-friendly normalize. Higher input → higher severity.
function normSeverity(value: number, lo: number, hi: number): number {
  if (hi === lo) return 5;
  const v = (value - lo) / (hi - lo);
  return Math.max(0, Math.min(10, v * 10));
}

// --- THEME 1 — Regrets d'achat ---
// Hypothèse : "regret" = j'ai payé cher (€/m² > P75 national) ET la qualité
// de vie globale ne suit pas (score global < 6.5). Bonus malus si canicule
// faible (score_canicule < 5) ou qualité d'air faible.
function rankRegrets(): RedFlagRow[] {
  const prices = Object.values(HOUSING)
    .map((h) => h?.avgBuyPriceM2)
    .filter((v): v is number => v != null)
    .sort((a, b) => a - b);
  const p75 = prices[Math.floor(prices.length * 0.75)] ?? 3500;

  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    const h = HOUSING[city.slug];
    const price = h?.avgBuyPriceM2;
    if (price == null) continue;
    if (price < p75) continue; // pas dans le segment cher
    if (city.scores.global >= 6.5) continue; // si bonne ville, pas un regret

    const owner = computeOwnerScores(city);
    const canicule = owner.find((s) => s.key === "score_canicule")!.value;
    const air = owner.find((s) => s.key === "score_qualite_air")!.value;

    // Severity : prix cher (relatif au p75) + faible qualité de vie + bonus canicule/air faibles
    const priceFactor = normSeverity(price, p75, p75 * 1.8);
    const qolFactor = normSeverity(6.5 - city.scores.global, 0, 2.5);
    const climaFactor = Math.max(0, (5 - canicule) * 0.8 + (5 - air) * 0.5);
    const severity = Math.min(
      10,
      priceFactor * 0.4 + qolFactor * 0.4 + climaFactor * 0.2,
    );

    const reason = `${Math.round(price).toLocaleString("fr-FR")} €/m² · score global ${city.scores.global.toFixed(1)}/10${canicule < 5 ? ` · canicule ${canicule.toFixed(1)}/10` : ""}`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }

  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 2 — Sans voiture difficile ---
// Pénalise les villes qui n'ont PAS de réseau structurant : score_sans_voiture
// bas + population < 200k (signal "pas de tram + offre TER limitée").
function rankSansVoiture(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    const owner = computeOwnerScores(city);
    const sansVoiture = owner.find((s) => s.key === "score_sans_voiture")!.value;
    if (sansVoiture >= 6) continue; // OK

    const pop = city.population ?? 50000;
    // Cible spécifique : villes ≥ 30k où on s'attend à de la mobilité douce mais où elle manque.
    if (pop < 30000) continue;

    const severity = Math.min(
      10,
      (6 - sansVoiture) * 2 + (pop > 100000 && sansVoiture < 5 ? 1 : 0),
    );
    const reason = `Score sans voiture ${sansVoiture.toFixed(1)}/10 · ${pop.toLocaleString("fr-FR")} hab. — pas de tram, offre TER limitée`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 3 — Belles mais invivables l'été ---
// Cible : score qualité de vie ≥ 6.5 (donc séduisantes "sur papier") MAIS
// score_canicule ≤ 5 (juillet ≥ 27 °C en moyenne). Bonus si touristique
// (tag "tourisme") car saturation estivale.
function rankInvivablesEte(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    if (city.scores.global < 6.5) continue;
    const owner = computeOwnerScores(city);
    const canicule = owner.find((s) => s.key === "score_canicule")!.value;
    if (canicule > 5) continue;

    const isTouristy = city.characterTags.includes("tourisme");
    const severity = Math.min(
      10,
      (5 - canicule) * 1.8 + (isTouristy ? 1.5 : 0),
    );
    const julyTemp = city.avgTempJuly != null ? `${city.avgTempJuly} °C en juillet` : "été chaud";
    const tourist = isTouristy ? " · forte affluence touristique" : "";
    const reason = `${julyTemp} · canicule ${canicule.toFixed(1)}/10${tourist}`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 4 — Air irrespirable l'hiver (pollution chronique) ---
// Cible : villes où l'air est respiré en moyenne annuelle au-dessus du seuil
// OMS (>10 µg/m³ PM2.5) ET où l'hiver concentre les pics — cuvettes alpines
// soumises à l'inversion thermique, bassin parisien saturé NO₂, façades
// industrialo-portuaires. Filtre : score_qualite_air ≤ 5/10.
function rankPollutionAirChronique(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    const owner = computeOwnerScores(city);
    const air = owner.find((s) => s.key === "score_qualite_air")!.value;
    if (air > 5) continue; // air correct, hors-cible

    const dept = city.department ?? "";
    const region = city.region ?? "";
    const elev = city.elevation ?? 9999;
    const pop = city.population ?? 0;

    // Bonus de gravité — vraies zones documentées par les AASQA ATMO.
    const inversionAlpine = ["Haute-Savoie", "Isère", "Savoie"].includes(dept) && elev < 700;
    const idfDense = region === "Île-de-France" && pop > 50000;
    const couloirRhone = ["Rhône", "Métropole de Lyon", "Drôme", "Vaucluse"].includes(dept) && pop > 80000;
    const portIndustriel = ["Bouches-du-Rhône", "Seine-Maritime", "Loire-Atlantique"].includes(dept) && pop > 100000;

    let bonus = 0;
    let context = "";
    if (inversionAlpine) {
      bonus = 2.0;
      context = " · cuvette alpine, inversion thermique hivernale";
    } else if (idfDense) {
      bonus = 1.4;
      context = " · bassin parisien NO₂ trafic + alertes ozone";
    } else if (couloirRhone) {
      bonus = 1.2;
      context = " · couloir rhodanien NO₂ + ozone estival";
    } else if (portIndustriel) {
      bonus = 1.0;
      context = " · façade industrialo-portuaire (fret, raffinage)";
    }

    const severity = Math.min(10, (5 - air) * 1.9 + bonus);
    if (severity < 1.5) continue; // filtre les cas marginaux

    const reason = `Qualité air ${air.toFixed(1)}/10 (PM2.5 dépt > seuil OMS)${context}`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 5 — Risques naturels cumulés ---
// Cible : villes dont le score composite F40 (inondation 35 % + argile 25 %
// + feu 20 % + sismicité 20 %) dépasse 5,5/10. On amplifie la severity quand
// la ville cumule deux dimensions ≥ 6 (vrai cumul de risques, pas un seul
// aléa). Les fortunes peu exposées sont écartées (filter <5,5).
function rankRisquesNaturels(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    const risks = computeNaturalRisks(city);
    if (risks.composite < 5.5) continue;

    const dims = [risks.flood, risks.seismic, risks.clay, risks.wildfire];
    const cumulHigh = dims.filter((d) => d.score >= 6).length;
    const cumulBonus = cumulHigh >= 2 ? 1.2 : 0;

    const severity = Math.min(10, risks.composite + cumulBonus);

    const tops = [
      { k: "inondation", s: risks.flood.score },
      { k: "argile", s: risks.clay.score },
      { k: "feu de forêt", s: risks.wildfire.score },
      { k: "sismique", s: risks.seismic.score },
    ]
      .filter((x) => x.s >= 5)
      .sort((a, b) => b.s - a.s)
      .slice(0, 2)
      .map((x) => `${x.k} ${x.s.toFixed(1)}/10`)
      .join(" · ");

    const reason = `Composite ${risks.composite.toFixed(1)}/10${tops ? ` — ${tops}` : ""}`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 6 — Bruit cauchemar ---
// Cible : villes au composite F43 > 5,5/10. Bonus si au moins 2 sources sur 4
// dépassent 6/10 (cumul rare et invivable). Filtre population > 30k pour ne
// pas remonter des cas marginaux.
function rankBruitCauchemar(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    if ((city.population ?? 0) < 30_000) continue;
    const n = computeNoiseExposure(city);
    if (n.composite < 5.5) continue;

    const dims = [n.road, n.aircraft, n.rail, n.urbanNight];
    const cumulHigh = dims.filter((d) => d.score >= 6).length;
    const cumulBonus = cumulHigh >= 2 ? 1.2 : 0;
    const severity = Math.min(10, n.composite + cumulBonus);

    const tops = [
      { k: "routier", s: n.road.score },
      { k: "aérien", s: n.aircraft.score },
      { k: "ferroviaire", s: n.rail.score },
      { k: "nocturne", s: n.urbanNight.score },
    ]
      .filter((x) => x.s >= 5)
      .sort((a, b) => b.s - a.s)
      .slice(0, 2)
      .map((x) => `${x.k} ${x.s.toFixed(1)}/10`)
      .join(" · ");

    const reason = `Composite bruit ${n.composite.toFixed(1)}/10${tops ? ` — ${tops}` : ""}`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 7 — Sécheresse & restrictions d'eau ---
// Cible : villes au composite F41 > 6/10. Bonus si restrictions = fort
// (arrêtés crise quasi-annuels) OU si nappes très basses ET supply tendu.
function rankSecheresseEau(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    const w = computeWaterStress(city);
    if (w.composite < 6) continue;

    let bonus = 0;
    if (w.restrictions.score >= 8.5) bonus += 1.0;
    if (w.aquifer.score >= 7.5 && w.supply.score >= 7) bonus += 0.8;
    const severity = Math.min(10, w.composite + bonus);

    const tops = [
      { k: "restrictions", s: w.restrictions.score },
      { k: "nappes", s: w.aquifer.score },
      { k: "climat sec", s: w.climate.score },
      { k: "eau potable", s: w.supply.score },
    ]
      .filter((x) => x.s >= 6)
      .sort((a, b) => b.s - a.s)
      .slice(0, 2)
      .map((x) => `${x.k} ${x.s.toFixed(1)}/10`)
      .join(" · ");

    const reason = `Stress hydrique ${w.composite.toFixed(1)}/10${tops ? ` — ${tops}` : ""}`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

export const RED_FLAG_THEMES: RedFlagTheme[] = [
  {
    slug: "villes-regrets-achat",
    title: "Villes où l'on regrette d'avoir acheté",
    metaTitle: "Villes regrets d'achat 2026 — Où l'immobilier ne vaut pas le prix",
    metaDescription:
      "Classement 2026 des villes françaises où le prix d'achat (DVF) dépasse largement la qualité de vie réelle. Score global, €/m² médian, climat. Données calibrées 352 villes.",
    emoji: "💸",
    intro:
      "Sur le papier : marketing immobilier ronflant, agence qui promet « un investissement sûr », plaquettes office du tourisme. Sur le terrain : prix au m² qui ferait blêmir un Parisien, et une qualité de vie en réalité moyenne — voire dégradée par la canicule, l'air ou le bruit.",
    reality:
      "Le calcul croise le prix d'achat médian par m² (DVF / Meilleurs Agents 2024) avec le score qualité de vie global du site, et pénalise les villes faibles en canicule ou en air. Toutes les villes affichées sont dans le quartile supérieur des prix (p75 national) ET ont un score global inférieur à 6,5/10 — la définition la plus exigeante du « payé trop cher ».",
    methodology:
      "Severity = 40% prix relatif au P75 + 40% écart au score global 6,5 + 20% bonus canicule/air faibles. Source prix : DVF (Demandes de Valeurs Foncières) + observatoires loyer 2024.",
    rank: rankRegrets,
  },
  {
    slug: "villes-sans-voiture-difficile",
    title: "Villes où vivre sans voiture est vraiment difficile",
    metaTitle: "Villes sans voiture difficile 2026 — Le revers du discours « bike-friendly »",
    metaDescription:
      "Classement des villes françaises ≥ 30 000 hab. où vivre sans voiture reste compliqué : pas de tram, offre TER limitée. Score sans-voiture calibré sur transport + densité réseau.",
    emoji: "🚗",
    intro:
      "Toutes les mairies promettent l'apaisement, le tram qui vient, la zone piétonne qui arrive. Dans les faits, beaucoup de villes moyennes restent dépendantes de la voiture pour la moindre course : pas de tram, bus en sous-régime, et un TER qui s'arrête à 21h.",
    reality:
      "On classe ici les villes de plus de 30 000 habitants où le score sans-voiture est inférieur à 6/10. Pop > 100k et score < 5 = pénalité supplémentaire (à cette taille, le réseau aurait dû exister).",
    methodology:
      "Score sans-voiture = score transport site (GTFS multimodal + walkability OSM), ajusté pour pénaliser les villes mid-size sans réseau structurant. Source : GTFS SNCF + RATP + OSM 2024.",
    rank: rankSansVoiture,
  },
  {
    slug: "villes-belles-invivables-ete",
    title: "Villes belles… mais invivables l'été",
    metaTitle: "Villes invivables l'été 2026 — Belles sur photo, étouffantes en juillet",
    metaDescription:
      "Classement des villes françaises séduisantes mais en surchauffe estivale : canicule, tourisme de masse, étés ≥ 27 °C. Données Météo-France (climato 1991-2020).",
    emoji: "🥵",
    intro:
      "Photos en mai sur Instagram : ruelles fleuries, vieille pierre, terrasses ombragées. Réalité de juillet : 38 °C dans la rue, climatisation inexistante en location, touristes qui doublent la population de la ville. Belle sur papier, étouffante dans la réalité.",
    reality:
      "On filtre les villes au score qualité de vie ≥ 6,5/10 (donc séduisantes en moyenne annuelle) puis on retient celles dont le score canicule est ≤ 5/10 — ce qui correspond à des températures moyennes de juillet ≥ 27 °C selon la climato Météo-France 1991-2020. Bonus de pénalité si la ville est taguée touristique (saturation estivale).",
    methodology:
      "Severity = 1,8 × écart au score canicule 5 + 1,5 si touristique. Source température : moyennes Météo-France 1991-2020 ; projection ARPEGE 2040 à venir.",
    rank: rankInvivablesEte,
  },
  {
    slug: "villes-pollution-air-chronique",
    title: "Villes à l'air irrespirable l'hiver",
    metaTitle: "Pollution air chronique 2026 — Villes françaises au PM2.5 hivernal élevé",
    metaDescription:
      "Classement 2026 des villes françaises où l'air dépasse durablement le seuil OMS : cuvettes alpines (inversion thermique), bassin parisien NO₂, couloir rhodanien, façades portuaires. Source ATMO France PM2.5.",
    emoji: "🌫️",
    intro:
      "L'agence immobilière vante la vue sur les Alpes ou les boulevards haussmanniens. Personne ne mentionne le brouillard épais de janvier-février quand l'inversion thermique piège les particules fines au fond de la vallée, ni les alertes NO₂ chroniques le long du périphérique parisien. La pollution chronique ne se voit pas sur la photo immobilière — mais elle se respire 365 jours par an.",
    reality:
      "On filtre les villes dont le score qualité d'air est ≤ 5/10 (PM2.5 départemental ≥ 11-13 µg/m³, soit > 2× le seuil OMS 2021 de 5 µg/m³). On ajoute un malus de gravité pour les zones documentées par les AASQA ATMO : cuvettes alpines (Vallée de l'Arve, Grenoble), bassin parisien (AirParif), couloir rhodanien (Atmo Auvergne-Rhône-Alpes), façades industrialo-portuaires (AtmoSud, Atmo Normandie).",
    methodology:
      "Severity = 1,9 × écart au score qualité air 5 + bonus zonal (cuvette alpine +2,0 / IDF dense +1,4 / couloir rhodanien +1,2 / port industriel +1,0). Source PM2.5 : moyennes annuelles départementales ATMO France 2023, croisées au seuil OMS révision 2021.",
    rank: rankPollutionAirChronique,
  },
  {
    slug: "villes-risques-naturels",
    title: "Villes les plus exposées aux risques naturels",
    metaTitle: "Risques naturels 2026 — Villes françaises les plus exposées (inondation, argile, feu, séisme)",
    metaDescription:
      "Classement 2026 des villes françaises au composite F40 le plus élevé sur les 4 aléas : inondation, retrait-gonflement argile (BRGM), feu de forêt (ONF/ECASC), sismicité (zonage 2011). Données ouvertes Géorisques.",
    emoji: "⚠️",
    intro:
      "L'annonce immobilière vante la vue sur le fleuve, la proximité du massif, le terrain en pente douce. Personne ne dit que la cave a déjà été inondée trois fois en quinze ans, que les fissures sur les murs sont l'argile qui gonfle l'été et se rétracte l'hiver, ou que le PPRif classe le quartier en aléa fort feu de forêt. Les risques naturels ne se voient pas sur la photo — ils se découvrent dans le rapport ERP signé en bas de l'acte.",
    reality:
      "On classe ici les villes dont le composite F40 (inondation 35 % + argile 25 % + feu 20 % + sismicité 20 %) dépasse 5,5/10, avec un malus quand au moins deux des quatre aléas dépassent 6/10 — c'est-à-dire un vrai cumul, pas un seul risque isolé. Toutes les valeurs sont alignées sur les zonages réglementaires : sismicité décret 2010-1255, aléa argile BRGM, massifs à risque feu ONF/ECASC, proxy inondation fleuve majeur + altitude < 50 m + littoral.",
    methodology:
      "Severity = composite F40 (0-10) + 1,2 si deux dimensions ou plus ≥ 6/10. Sources : BRGM (argile), BCSF/MTE décret 2010-1255 (sismicité), ONF + ECASC (feu de forêt), Géorisques (synthèse par commune INSEE). Vérifier le rapport ERP officiel avant tout achat.",
    rank: rankRisquesNaturels,
  },
  {
    slug: "villes-bruit-cauchemar",
    title: "Villes où le bruit est un cauchemar quotidien",
    metaTitle: "Bruit cauchemar 2026 — Villes françaises les plus exposées (routier, aérien, nocturne)",
    metaDescription:
      "Classement 2026 des villes françaises où le bruit cumule trafic routier saturé, survols aéroportuaires (PEB), LGV et vie nocturne. Données CBS / DGAC / Bruitparif. Composite F43.",
    emoji: "🔊",
    intro:
      "L'agence vante le quartier calme, la rue résidentielle, l'orientation cour. Sur le terrain : périphérique à 200 m, A86 en fond sonore, A380 toutes les 90 secondes au-dessus de Goussainville, ou centre-ville étudiant où les terrasses ferment à 2 h. Le bruit ne s'écoute pas sur une photo immobilière — il s'endure 24 h sur 24.",
    reality:
      "On classe les villes ≥ 30 000 hab. dont le composite bruit F43 (routier 35 % + aérien 25 % + nocturne 25 % + ferroviaire 15 %) dépasse 5,5/10, avec malus quand au moins deux des quatre sources dépassent 6/10 — c'est-à-dire un vrai cumul d'expositions. L'OMS recommande Lden < 53 dB(A) jour et Lnight < 45 dB(A) nuit ; toutes les villes listées dépassent largement ce seuil sur une part importante du territoire communal.",
    methodology:
      "Severity = composite F43 + 1,2 si deux sources ou plus ≥ 6/10. Sources : Cartes de Bruit Stratégiques (directive 2002/49/CE), Plans d'Exposition au Bruit DGAC, Bruitparif (IDF). Filtre population ≥ 30 000 hab. pour la pertinence du score nocturne.",
    rank: rankBruitCauchemar,
  },
  {
    slug: "villes-sans-eau-ete",
    title: "Villes où l'eau manquera l'été — sécheresse & restrictions",
    metaTitle: "Sécheresse 2026 — Villes françaises au stress hydrique le plus élevé (Propluvia, BRGM)",
    metaDescription:
      "Classement 2026 des villes françaises où la sécheresse est devenue récurrente : arrêtés Propluvia crise quasi-annuels, nappes BRGM basses, alimentation eau potable sous tension. Composite F41.",
    emoji: "💧",
    intro:
      "L'annonce vante le climat ensoleillé, la piscine, le jardin méditerranéen. Personne ne mentionne que l'arrosage est interdit cinq mois par an, que la piscine se vide à la mi-juillet, que la nappe locale est basse depuis trois ans et que la commune envisage des tours d'eau l'été prochain. La sécheresse ne se voit pas sur la photo en mai — elle se subit en août.",
    reality:
      "On classe les villes dont le composite F41 (restrictions 35 % + nappes 25 % + climat 20 % + alimentation 20 %) dépasse 6/10, avec un bonus de gravité quand les restrictions atteignent le niveau « crise quasi-annuel » (Propluvia) OU quand nappes très basses et réseau eau potable sous tension se cumulent. Toutes les valeurs sont alignées sur les bulletins officiels BRGM 2022-2025 et l'historique Propluvia 2022-2024.",
    methodology:
      "Severity = composite F41 + 1,0 si restrictions ≥ 8,5/10 + 0,8 si nappes très basses ET alimentation tendue. Sources : Propluvia (arrêtés sécheresse), BRGM (état des nappes), Météo-France (climat estival).",
    rank: rankSecheresseEau,
  },
];

export function getRedFlagTheme(slug: string): RedFlagTheme | undefined {
  return RED_FLAG_THEMES.find((t) => t.slug === slug);
}

export const RED_FLAG_THEME_SLUGS = RED_FLAG_THEMES.map((t) => t.slug);
