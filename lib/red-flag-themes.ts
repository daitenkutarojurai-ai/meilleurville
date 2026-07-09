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
import { computeHealthcareAccess } from "@/lib/healthcare-access";
import { computeEmploymentMarket } from "@/lib/employment-market";
import { climateZoneFor } from "@/lib/cost-living";
import { computeQualityOfLife } from "@/lib/quality-of-life-index";
import { householdBreakdownFor } from "@/lib/household-cost";
import { computeCyclingMobility } from "@/lib/cycling-mobility";
import { computeSafetyDeep } from "@/lib/safety-deep";
import { computeDemography } from "@/lib/demography";
import { computePublicServices } from "@/lib/public-services";
import { computeSportLeisure } from "@/lib/sport-leisure";
import { housingTensionFor } from "@/lib/housing-tension";
import { internetScore, internetLabel } from "@/lib/internet-score";
import { fiscalityForCity } from "@/lib/fiscalite";
import { getEducation } from "@/lib/education";
import { haversineKm } from "@/lib/distances";
import { sunshineDays } from "@/lib/utils";
import { projectClimate2040 } from "@/lib/climate-2040";

// Tag patterns that signal a strong seasonal/touristic vocation. Matched on
// the joined character-tags string (lowercased) of each city seed entry.
const SEASONAL_TAGS_REGEX = /balnéaire|station-balnéaire|stations de ski|\bski\b|tourisme|thermalisme/i;
const STRONG_STATION_REGEX = /station-balnéaire|stations de ski|thermalisme/i;

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
// Cible : villes dont le score composite (inondation 35 % + argile 25 %
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
// Cible : villes au composite > 5,5/10. Bonus si au moins 2 sources sur 4
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
// Cible : villes au composite > 6/10. Bonus si restrictions = fort
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

// --- THEME 8 — Désert médical ---
// Cible : villes au composite > 6,5/10. Bonus si MG = désert + urgences
// = tendu (cumul vital). Filtre population > 10k pour pertinence dept.
function rankDesertMedical(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    if ((city.population ?? 0) < 10_000) continue;
    const h = computeHealthcareAccess(city);
    if (h.composite < 6.5) continue;

    let bonus = 0;
    if (h.generalistes.score >= 8.5 && h.urgences.score >= 6.5) bonus += 1.2;
    if (h.specialistes.score >= 7) bonus += 0.5;
    const severity = Math.min(10, h.composite + bonus);

    const tops = [
      { k: "généralistes", s: h.generalistes.score },
      { k: "spécialistes", s: h.specialistes.score },
      { k: "urgences", s: h.urgences.score },
      { k: "pharmacies", s: h.pharmacies.score },
    ]
      .filter((x) => x.s >= 6)
      .sort((a, b) => b.s - a.s)
      .slice(0, 2)
      .map((x) => `${x.k} ${x.s.toFixed(1)}/10`)
      .join(" · ");

    const reason = `Composite accès soins ${h.composite.toFixed(1)}/10${tops ? ` — ${tops}` : ""}`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 9 — Chômage élevé ---
// Cible : villes au composite > 6,5/10. Bonus quand chômage dept ≥ 7,5/10
// (« sinistré ») ET dynamisme entrepreneurial ≥ 6,5/10 se cumulent — vrai
// décrochage économique, pas un seul indicateur défavorable.
function rankChomageEleve(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    if ((city.population ?? 0) < 15_000) continue;
    const e = computeEmploymentMarket(city);
    if (e.composite < 6.5) continue;

    let bonus = 0;
    if (e.unemployment.score >= 7.5 && e.dynamism.score >= 6.5) bonus += 1.2;
    if (e.salary.score >= 7) bonus += 0.5;
    const severity = Math.min(10, e.composite + bonus);

    const tops = [
      { k: "chômage", s: e.unemployment.score },
      { k: "salaire", s: e.salary.score },
      { k: "dynamisme", s: e.dynamism.score },
      { k: "mix sectoriel", s: e.sectorMix.score },
    ]
      .filter((x) => x.s >= 6)
      .sort((a, b) => b.s - a.s)
      .slice(0, 2)
      .map((x) => `${x.k} ${x.s.toFixed(1)}/10`)
      .join(" · ");

    const reason = `Marché du travail ${e.composite.toFixed(1)}/10${tops ? ` — ${tops}` : ""}`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 10 — Cadre de vie tendu ---
// Cible : villes au composite ≤ 4,5/10. Bonus quand au moins 2 piliers
// sur 3 (env / santé / emploi) sont ≤ 4/10 — cumul réel, pas un seul pilier.
function rankCadreDeVieTendu(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    if ((city.population ?? 0) < 15_000) continue;
    const q = computeQualityOfLife(city);
    if (q.score > 4.5) continue;

    const weakPillars = [q.envScore, q.healthScore, q.jobScore].filter((s) => s <= 4).length;
    let bonus = 0;
    if (weakPillars >= 2) bonus += 1.2;
    if (q.score <= 3.5) bonus += 0.6;
    // Severity inversée : composite faible = pire ; on rescale (5 − qol) × 2 sur [0;10].
    const severity = Math.min(10, Math.max(0, (5 - q.score) * 2 + bonus));

    const tops = [
      { k: "environnement", s: q.envScore },
      { k: "santé", s: q.healthScore },
      { k: "emploi", s: q.jobScore },
    ]
      .sort((a, b) => a.s - b.s)
      .slice(0, 2)
      .map((x) => `${x.k} ${x.s.toFixed(1)}/10`)
      .join(" · ");

    const reason = `Cadre de vie ${q.score.toFixed(1)}/10${tops ? ` — ${tops}` : ""}`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 11 — Coûts explosifs vs salaire local ---
// Ratio coût mensuel famille (lib/household-cost) / salaire net médian
// dept (proxy depuis salary.score). Severity = rescaled ratio.
const SALARY_PROXY: Record<number, number> = {
  // map salary.score → € net médian dept estimé
  1: 2500,   // Paris & petite couronne
  2.5: 2200, // Bonnes métropoles (Rennes, Nantes, Lyon, Toulouse, Bordeaux…)
  4.5: 2050, // Moyenne nationale
  6: 1900,   // Bas
  8: 1750,   // Très bas (DROM, ruraux)
};

function rankCoutsExplosifs(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    if ((city.population ?? 0) < 20_000) continue;
    const b = householdBreakdownFor(city, "famille");
    if (b.total == null) continue;

    const e = computeEmploymentMarket(city);
    const salary = SALARY_PROXY[e.salary.score] ?? 2050;
    const ratio = b.total / salary;
    if (ratio < 0.6) continue; // coût famille < 60 % du salaire médian dept = OK

    // Severity scaled : ratio 0.6 → 5, ratio 1.0 → 10 (coût == salaire = explosif).
    const severity = Math.min(10, normSeverity(ratio, 0.6, 1.0));
    const pct = Math.round(ratio * 100);
    const reason = `Coût famille ${Math.round(b.total).toLocaleString("fr-FR")} €/mois vs salaire médian dept ≈ ${salary.toLocaleString("fr-FR")} € — ratio ${pct} %`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 12 — Désert de services publics ---
// Cible : composite ≥ 6,5 (déficit max). Bonus quand écoles ET Poste
// sont tous deux ≥ 6,5 (vrai double déficit, pas un seul axe).
function rankDesertServicesPublics(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    if ((city.population ?? 0) < 10_000) continue;
    const s = computePublicServices(city);
    if (s.composite < 6.5) continue;

    let bonus = 0;
    if (s.schools.score >= 6.5 && s.postOffice.score >= 6.5) bonus += 1.2;
    if (s.cityHall.score >= 6.5) bonus += 0.4;
    const severity = Math.min(10, s.composite + bonus);

    const tops = [
      { k: "écoles", s: s.schools.score },
      { k: "Poste", s: s.postOffice.score },
      { k: "mairie", s: s.cityHall.score },
      { k: "médiath.", s: s.library.score },
    ]
      .filter((x) => x.s >= 5.5)
      .sort((a, b) => b.s - a.s)
      .slice(0, 2)
      .map((x) => `${x.k} ${x.s.toFixed(1)}/10`)
      .join(" · ");

    const reason = `Services publics ${s.composite.toFixed(1)}/10${tops ? ` — ${tops}` : ""}`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 13 — Anti-vélo ---
// cyclabilité : 10 = excellent (convention inverse !). Red flag = composite ≤ 4,5.
// Severity inversée (5 − cycling) × 2 sur [0;10]. Bonus quand réseau ET topographie
// sont tous deux faibles (combo bloquant : pas de pistes ET ça grimpe).
function rankAntiVelo(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    if ((city.population ?? 0) < 15_000) continue;
    const c = computeCyclingMobility(city);
    if (c.composite > 4.5) continue;

    let bonus = 0;
    if (c.network.score <= 4 && c.topography.score <= 4) bonus += 1.2;
    if (c.safety.score <= 4) bonus += 0.4;
    // Severity inversée : composite faible = pire ; rescale (5 − cycling) × 2.
    const severity = Math.min(10, Math.max(0, (5 - c.composite) * 2 + bonus));

    // Cycling : score haut = bon. Pour le red flag on remonte les axes les plus faibles.
    const tops = [
      { k: "réseau", s: c.network.score },
      { k: "topographie", s: c.topography.score },
      { k: "sécurité", s: c.safety.score },
      { k: "climat", s: c.climate.score },
    ]
      .sort((a, b) => a.s - b.s)
      .slice(0, 2)
      .map((x) => `${x.k} ${x.s.toFixed(1)}/10`)
      .join(" · ");

    const reason = `Cyclabilité ${c.composite.toFixed(1)}/10${tops ? ` — ${tops}` : ""}`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 14 — Vieillissement critique ---
// Cible : composite ≥ 7 (vieillissement marqué + décroissance).
// Bonus quand ageing ET trajectory sont tous deux ≥ 7 (cumul réel :
// pyramide haute + solde négatif = dynamique d'extinction lente).
function rankVieillissementCritique(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    if ((city.population ?? 0) < 10_000) continue;
    const d = computeDemography(city);
    if (d.composite < 7) continue;

    let bonus = 0;
    if (d.ageing.score >= 7 && d.trajectory.score >= 7) bonus += 1.2;
    if (d.youngActives.score >= 7) bonus += 0.4;
    const severity = Math.min(10, d.composite + bonus);

    const tops = [
      { k: "vieillis.", s: d.ageing.score },
      { k: "trajectoire", s: d.trajectory.score },
      { k: "jeunes actifs", s: d.youngActives.score },
      { k: "natalité", s: d.renewal.score },
    ]
      .filter((x) => x.s >= 6)
      .sort((a, b) => b.s - a.s)
      .slice(0, 2)
      .map((x) => `${x.k} ${x.s.toFixed(1)}/10`)
      .join(" · ");

    const reason = `Démographie ${d.composite.toFixed(1)}/10${tops ? ` — ${tops}` : ""}`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 15 — Nuit tendue ---
// nocturnal ≥ 6,5 (rixes / agressions nocturnes). Bonus quand persons ≥ 6
// (atteintes aux personnes corroborent), bonus si touristique/festif (saturation
// nocturne). Indicateur dédié pour étudiants / sortie nocturne / femmes seules.
function rankNuitTendue(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    if ((city.population ?? 0) < 15_000) continue;
    const s = computeSafetyDeep(city);
    if (s.nocturnal.score < 6.5) continue;

    const tags = (city.characterTags ?? []).join(" ").toLowerCase();
    const isFestif = /festif|étudiant|touristique|nocturne/.test(tags);

    let bonus = 0;
    if (s.persons.score >= 6) bonus += 0.8;
    if (isFestif) bonus += 0.6;
    // Severity = nocturnal direct (déjà 0-10, 10 = pire) + bonus.
    const severity = Math.min(10, s.nocturnal.score + bonus);

    const tops = [
      { k: "nocturne", s: s.nocturnal.score },
      { k: "personnes", s: s.persons.score },
      { k: "biens", s: s.property.score },
    ]
      .filter((x) => x.s >= 5.5)
      .sort((a, b) => b.s - a.s)
      .slice(0, 2)
      .map((x) => `${x.k} ${x.s.toFixed(1)}/10`)
      .join(" · ");

    const reason = `Sécurité nocturne ${s.nocturnal.score.toFixed(1)}/10${tops ? ` — ${tops}` : ""}${isFestif ? " · centre festif" : ""}`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 16 — Hiver rude ---
// Cible : villes où l'hiver est le plus dur, sur deux dimensions cumulables —
// le froid (température moyenne de janvier basse) et la grisaille (faible
// ensoleillement annuel, proxy honnête du manque de lumière hivernale, terrain
// de la déprime saisonnière). Une ville peut entrer par le froid seul (villes
// d'altitude), par la grisaille seule (façade Nord), ou par le cumul des deux
// — c'est ce cumul qui obtient le malus de gravité.
function rankHiverRude(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    const janT = city.avgTempJanuary;
    const sun = city.sunshinedays;
    if (janT == null || sun == null) continue;

    // Froid : 5 °C de moyenne en janvier → 0, -1 °C → 10.
    const coldFactor = normSeverity(5 - janT, 0, 6);
    // Grisaille : 1 950 h de soleil/an → 0, 1 480 h → 10.
    const greyFactor = normSeverity(1950 - sun, 0, 470);
    if (coldFactor < 3.5 && greyFactor < 3.5) continue; // hiver clément

    const bothHarsh = coldFactor >= 5 && greyFactor >= 5;
    const severity = Math.min(
      10,
      coldFactor * 0.5 + greyFactor * 0.5 + (bothHarsh ? 1.2 : 0),
    );
    if (severity < 5) continue;

    const days = sunshineDays(sun);
    const reason = `${janT.toFixed(1).replace(".", ",")} °C de moyenne en janvier · ${days} jours de soleil/an${bothHarsh ? " — froid ET grisaille cumulés" : ""}`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 17 — Logement locatif introuvable ---
// Cible : villes dont le proxy de tension locative dépasse 7,5/10 — c'est-à-dire
// classées « tendu » ou « très tendu » par lib/housing-tension. Bonus quand le
// loyer T2 dépasse 1,5× la médiane nationale (signal de marché vraiment serré,
// pas juste d'une demande modérément élevée). Indicateur dédié aux locataires
// (étudiants, jeunes actifs, expatriés revenant en France) qui se posent la
// vraie question : « est-ce que je vais réussir à signer un bail avant
// l'épuisement de mes droits à l'allocation logement ? ».
function rankLogementIntrouvable(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    const tension = housingTensionFor(city);
    if (!tension) continue;
    if (tension.value < 7.5) continue; // hors « tendu » et « très tendu »

    const rentBonus = tension.rentRatio >= 1.5 ? 1.0 : tension.rentRatio >= 1.2 ? 0.4 : 0;
    const severity = Math.min(10, tension.value + rentBonus);

    const pct = Math.round((tension.rentRatio - 1) * 100);
    const rentNote = pct > 0
      ? `loyer T2 +${pct} % vs médiane nationale`
      : pct < 0
        ? `loyer T2 ${pct} % vs médiane nationale`
        : `loyer T2 dans la médiane nationale`;
    const reason = `Marché ${tension.level} (${tension.value.toFixed(1)}/10) · ${rentNote}`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 19 — Fuite des jeunes actifs (25-35 ans) ---
// Cible : villes ≥ 10 000 hab. dont le déficit de jeunes actifs 25-35 ans
// (lib/demography `youngActives`) dépasse 5,5/10. Distinct de
// `villes-vieillissement-critique` : on ne réclame pas un composite démo
// élevé — une ville peut hémorragier ses 25-35 ans sans que la pyramide
// senior bascule (industrielle en décrochage, sous-préfecture sans pôle
// universitaire). On filtre d'ailleurs les cas où le composite démographique
// est déjà extrême (≥ 8,5) pour éviter la duplication avec le thème
// vieillissement. Severity amplifiée par : trajectoire négative (solde
// naturel + migratoire), chômage de département élevé (effet push),
// dynamisme entrepreneurial faible (peu de création d'établissements
// SIRENE) et petite taille (< 25 000 hab. : pas la masse critique pour
// retenir un actif diplômé qui veut sa carrière).
function rankFuiteJeunesActifs(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    const pop = city.population ?? 0;
    if (pop < 10_000) continue;
    const d = computeDemography(city);
    if (d.youngActives.score < 5.5) continue;
    if (d.composite >= 8.5) continue; // chasse gardée du thème vieillissement

    const e = computeEmploymentMarket(city);

    // Contributions linéaires (et non par paliers) pour éviter que les villes
    // des départements très âgés saturent toutes à 10/10. La déficience
    // jeunes actifs porte la moitié du signal, le reste se répartit entre
    // trajectoire, marché du travail et masse critique.
    const yaContribution = d.youngActives.score * 0.55;
    const trajContribution = Math.max(0, d.trajectory.score - 5) * 0.18;
    const unempContribution = Math.max(0, e.unemployment.score - 5) * 0.16;
    const dynContribution = Math.max(0, e.dynamism.score - 5) * 0.10;
    const popMalus = pop < 25_000 ? 0.4 : pop < 40_000 ? 0.2 : 0;
    let severity = yaContribution + trajContribution + unempContribution + dynContribution + popMalus;
    // Plage utile : on remappe vers une échelle où ~3 = négligeable, ~10 = pire.
    severity = severity * 1.7;
    severity = Math.min(10, severity);
    if (severity < 6) continue;

    const trajLabel = d.trajectory.score >= 7
      ? "trajectoire critique"
      : d.trajectory.score >= 6
        ? "trajectoire en érosion"
        : "trajectoire stable";
    const reason = `Déficit jeunes actifs ${d.youngActives.score.toFixed(1)}/10 · ${trajLabel} · chômage ${e.unemployment.score.toFixed(1)}/10`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 18 — Mono-touristique / saison morte ---
// Cible : villes ≤ 80 000 hab. dont les character-tags signalent une vocation
// saisonnière (balnéaire, ski, thermalisme, tourisme) ET dont le mix sectoriel
// est faiblement diversifié (sectorMix.score ≥ 5,5 — proxy aligné sur les
// `MONO_TOURISM_DEPTS` de lib/employment-market). Severity amplifiée par
// l'intensité de la dépendance (tags « station-balnéaire » / « stations de
// ski » / « thermalisme » = +1,5), par la petite taille (< 30 000 hab. =
// +1,0, car le tissu privé non-touristique n'a pas la masse critique) et
// par un score global élevé (≥ 6,5 = +0,5, la « belle façade » qui cache
// une saisonnalité brutale).
function rankMonoTouristique(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    const tags = (city.characterTags ?? []).join(" ");
    if (!SEASONAL_TAGS_REGEX.test(tags)) continue;
    const pop = city.population ?? 0;
    if (pop > 80_000) continue; // exclut Nice, Cannes, Antibes : tourisme dilué dans une vraie économie urbaine

    const e = computeEmploymentMarket(city);
    // Une ville est éligible si :
    //   (a) le sectorMix INSEE la flagge déjà comme mono-touristique (≥ 5,5/10)
    //   OU
    //   (b) ses character-tags affichent explicitement une vocation forte de
    //       station (station-balnéaire / stations de ski / thermalisme).
    // Sans (b), un département non tagué mono-tourism (ex. Savoie, Vosges,
    // Charente-Maritime) ne pourrait pas remonter même quand la commune est
    // évidemment saisonnière. C'est l'astuce qui rend le classement honnête.
    const sectorFlag = e.sectorMix.score >= 5.5;
    const stationFlag = STRONG_STATION_REGEX.test(tags);
    if (!sectorFlag && !stationFlag) continue;

    // Severity = max du score sectorMix (déjà 0-10, 10 = pire) et d'un proxy
    // dérivé du tag, pour ne pas sous-coter une station alpine qui ne tombe
    // pas dans MONO_TOURISM_DEPTS.
    const tagBase = stationFlag ? 6.8 : /balnéaire|\bski\b/i.test(tags) ? 6 : 0;
    let severity = Math.max(e.sectorMix.score, tagBase);

    if (stationFlag) severity += 1.5;
    else if (/balnéaire|\bski\b/i.test(tags)) severity += 1.0;
    if (pop > 0 && pop < 30_000) severity += 1.0;
    if (city.scores.global >= 6.5) severity += 0.5;
    severity = Math.min(10, severity);
    if (severity < 6) continue;

    const popLabel = pop > 0 ? `${pop.toLocaleString("fr-FR")} hab.` : "petite commune";
    const flavour = /thermalisme/i.test(tags)
      ? "station thermale"
      : /station-balnéaire/i.test(tags)
        ? "station balnéaire"
        : /stations de ski|\bski\b/i.test(tags)
          ? "économie ski-dépendante"
          : /balnéaire/i.test(tags)
            ? "économie balnéaire"
            : "tissu mono-touristique";
    const sectorLabel = sectorFlag
      ? `mix sectoriel ${e.sectorMix.score.toFixed(1)}/10`
      : "tag station explicite";
    const reason = `${flavour.charAt(0).toUpperCase() + flavour.slice(1)} · ${sectorLabel} · ${popLabel}`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 20 — Internet précaire ---
// Cible : villes dont l'`internetScore` (lib/internet-score) tombe à ≤ 5/10. Le
// score blend le `remoteWork` seed (60 %), le bonus régional ARCEP fibre, le
// bonus urbain pour les 30 plus grandes villes, et la pénalité dépt à
// couverture chronique faible (Creuse, Cantal, Lozère, Hautes-Alpes,
// Aveyron…). Severity amplifiée quand la population est < 10 000 hab. (la
// densité conditionne le déploiement FTTH des derniers kilomètres) et quand
// le score remoteWork seed est lui-même très faible (≤ 4) — signal de
// double peine pour les télétravailleurs. Indicateur dédié aux freelances,
// digital nomads et expats numériques qui se posent la vraie question :
// « ce point sur la carte tient-il une visio HD à 14 h sans coupure ? ».
function rankInternetPrecaire(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    const score = internetScore(city);
    if (score > 5) continue;

    const pop = city.population ?? 0;
    let severity = (10 - score) * 1.6;
    if (pop > 0 && pop < 10_000) severity += 0.6;
    if (city.scores.remoteWork <= 4) severity += 0.4;
    severity = Math.min(10, severity);
    if (severity < 6) continue;

    const tier = internetLabel(score);
    const popLabel = pop > 0 ? `${pop.toLocaleString("fr-FR")} hab.` : "petite commune";
    const reason = `Connectivité ${tier.label.toLowerCase()} (${score.toFixed(1)}/10) · ${popLabel} · score télétravail seed ${city.scores.remoteWork.toFixed(1)}/10`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 21 — Isolement social ---
// Cible : villes des départements à forte part de ménages d'une personne
// (proxy `score_solitude` de lib/owner-scores, basé sur l'Insee recensement
// 2020) dont le « lien social » passe sous 6,5/10 — c'est-à-dire les grandes
// métropoles et leurs couronnes denses, où l'on vit entouré sans être lié.
// Severity = blend isolement résidentiel (poids 0,45) + anonymat lié à la
// taille (poids 0,55) : le paradoxe du « seul au milieu de la foule » se joue
// d'abord dans les très grandes villes, où la densité humaine ne crée par
// elle-même aucune relation. Indicateur dédié aux néo-arrivants, étudiants et
// expats de retour qui se posent la vraie question : « vais-je réussir à me
// faire un cercle d'amis ici, ou rester un visage anonyme de plus ? ».
function rankIsolementSocial(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    const owner = computeOwnerScores(city);
    const lien = owner.find((s) => s.key === "score_solitude")!.value;
    if (lien >= 6.5) continue; // lien social correct — hors cible

    const pop = city.population ?? 50_000;
    // Isolement résidentiel : lien 7/10 → 0, lien 3/10 (Paris) → 10.
    const isolationFactor = normSeverity(7 - lien, 0, 4);
    // Anonymat : 80 000 hab. → 0, ≥ 600 000 hab. → 10.
    const anonymityFactor = normSeverity(pop, 80_000, 600_000);
    const severity = Math.min(10, isolationFactor * 0.45 + anonymityFactor * 0.55);

    const note = pop >= 200_000
      ? "anonymat de la grande métropole"
      : "forte part de ménages d'une personne";
    const reason = `Lien social ${lien.toFixed(1).replace(".", ",")}/10 · ${pop.toLocaleString("fr-FR")} hab. — ${note}`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 20 — Pauvres en sport ---
// Cible : composite F70 ≤ 4,5 (10 = excellent, donc faible = pire).
// Bonus +1,2 quand équipements ET clubs sont tous deux ≤ 4 (combo
// bloquant : ni piscine/gymnase municipal correct ni tissu associatif
// pour compenser). Bonus +0,4 quand le cadre outdoor est lui aussi
// limité (≤ 4) — la nature ne sauve même pas le quotidien sportif.
function rankPauvreEnSport(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    if ((city.population ?? 0) < 15_000) continue;
    const s = computeSportLeisure(city);
    if (s.composite > 4.5) continue;

    let bonus = 0;
    if (s.facilities.score <= 4 && s.clubs.score <= 4) bonus += 1.2;
    if (s.outdoor.score <= 4) bonus += 0.4;
    // Severity inversée : composite faible = pire. Rescale (5 − composite) × 2.
    const severity = Math.min(10, Math.max(0, (5 - s.composite) * 2 + bonus));

    // Remonte les deux axes les plus faibles pour la raison citable.
    const tops = [
      { k: "équipements", v: s.facilities.score },
      { k: "outdoor", v: s.outdoor.score },
      { k: "clubs", v: s.clubs.score },
      { k: "climat", v: s.climate.score },
    ]
      .sort((a, b) => a.v - b.v)
      .slice(0, 2)
      .map((x) => `${x.k} ${x.v.toFixed(1)}/10`)
      .join(" · ");

    const reason = `Composite sport ${s.composite.toFixed(1)}/10${tops ? ` — ${tops}` : ""}`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 23 — Fiscalité immobilière lourde ---
// Cible : villes des départements en tier fiscal `elevee`, `tres-elevee` ou
// `particulier` (Paris) selon `lib/fiscalite` (DGFiP / OFL 2024). On amplifie
// par le prix d'achat médian au m² (DVF / Meilleurs Agents) — un taux élevé
// sur une base cadastrale faible reste supportable, c'est la combinaison
// « taux élevé + base élevée » qui plombe vraiment le primo-accédant et le
// propriétaire occupant. Bonus quand la commune est en zone tendue (THRS
// majoration jusqu'à +60 % autorisée depuis 2023), bonus quand la population
// dépasse 100 000 hab. (densité urbaine = bases cadastrales tirées vers le
// haut). Indicateur dédié aux acheteurs qui se posent la vraie question :
// « combien va peser la taxe foncière + THRS éventuelle dans mon budget
// mensuel une fois le crédit signé ? ».
const FISCAL_TIER_BASE: Record<string, number> = {
  faible: 0,
  moderee: 2,
  elevee: 6,
  "tres-elevee": 8,
  particulier: 7.5,
};

function rankFiscaliteLourde(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    const dept = city.department;
    const region = city.region;
    if (!dept || !region) continue;

    const fisc = fiscalityForCity({ department: dept, region });
    const tierBase = FISCAL_TIER_BASE[fisc.tier] ?? 0;
    if (tierBase < 6) continue; // hors-cible : tier faible ou modérée

    const price = HOUSING[city.slug]?.avgBuyPriceM2;
    const pop = city.population ?? 0;

    // Bonus prix : 3 000 €/m² → 0, 6 000 €/m² → 2,0 (le tier inclut déjà
    // l'effet base cadastrale ; on évite de double-compter en plafonnant bas).
    const priceBonus = price != null
      ? Math.max(0, Math.min(2.0, (price - 3000) / 1500))
      : 0;
    // Bonus zone tendue : THRS majoration disponible (jusqu'à +60 %).
    const zoneBonus = fisc.zoneTendue ? 0.8 : 0;
    // Bonus densité urbaine : 100k → 0,2 ; 500k → 0,9 ; Paris (2,1 M) → ~1,5.
    const popBonus = pop > 50_000
      ? Math.max(0, Math.min(1.5, Math.log10(pop / 50_000) * 1.05))
      : 0;

    const severity = Math.min(10, tierBase + priceBonus + zoneBonus + popBonus);
    if (severity < 6.5) continue;

    const priceLabel = price != null
      ? `${Math.round(price).toLocaleString("fr-FR")} €/m²`
      : "base cadastrale dept élevée";
    const zoneLabel = fisc.zoneTendue ? " · zone tendue (THRS jusqu'à +60 %)" : "";
    const reason = `${fisc.tierLabel} · ${priceLabel} · taxe foncière estimée ${fisc.taxeFonciereT3}${zoneLabel}`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 24 — Désert culturel ---
// Cible : villes ≥ 15 000 hab. dont le score culture du seed tombe ≤ 4,5/10 —
// c'est-à-dire les communes où l'offre culturelle structurelle (musées,
// scènes labellisées, cinémas indépendants, scène musicale, librairies)
// reste maigre malgré une taille où l'on s'attendrait normalement à un
// minimum. On amplifie quand la médiathèque municipale est elle aussi
// fragile (score library ≥ 5/10 dans `computePublicServices`, convention
// 10 = pire) — combo signalétique d'un investissement public culturel
// faible. Bonus quand aucun tag character culturel (culturel / culture /
// patrimoine / bohème) n'apparaît dans le seed (signal de vocation
// non-culturelle assumée). Bonus quand la ville cumule un score
// transport faible (sortir hors ville coûte du temps et de l'argent).
// Indicateur dédié aux profils urbains (étudiants, cadres trentenaires,
// retraités actifs culturels) qui se posent la vraie question : « est-ce
// que j'aurai assez à voir, écouter, lire sur place sans devoir partir
// chaque samedi à 80 km ? ».
function rankDesertCulturel(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    const pop = city.population ?? 0;
    if (pop < 15_000) continue; // exclut les communes rurales où la déficience est attendue
    const cultureScore = city.scores.culture;
    if (cultureScore > 4.5) continue;

    const services = computePublicServices(city);
    const libraryScore = services.library.score; // convention : 10 = pire
    const tags = (city.characterTags ?? []).join(" ").toLowerCase();
    const hasCulturalTag = /culturel|culture|patrimoine|bohème|étudiant|historique|festival/.test(tags);

    // Base : (5 − culture) × 2 — 0 à culture=5, 8 à culture=1.
    let severity = (5 - cultureScore) * 2;
    // Bonus médiathèque fragile : library ≥ 5 = +0,8, library ≥ 7 = +1,4 (cumul).
    if (libraryScore >= 7) severity += 1.4;
    else if (libraryScore >= 5) severity += 0.8;
    // Bonus pas de tag culturel : la ville n'a même pas la vocation affichée.
    if (!hasCulturalTag) severity += 0.5;
    // Bonus isolement : transport seed ≤ 4 (sortir hors ville reste coûteux).
    if (city.scores.transport <= 4) severity += 0.6;
    // Bonus taille : 30k à 80k hab. = +0,5 (taille où l'on s'attend à un cinéma
    // d'art et essai + une scène labellisée minimum ; au-delà, les grandes
    // métropoles ont presque toujours une offre).
    if (pop >= 30_000 && pop <= 80_000) severity += 0.5;

    severity = Math.min(10, severity);
    if (severity < 6) continue;

    const libNote = libraryScore >= 7
      ? "médiathèque tendue"
      : libraryScore >= 5
        ? "médiathèque limite"
        : "médiathèque correcte";
    const tagNote = hasCulturalTag ? "" : " · pas de vocation culturelle affichée";
    const reason = `Culture ${cultureScore.toFixed(1)}/10 · ${libNote}${tagNote}`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 25 — Sans enseignement supérieur — les enfants devront partir à 18 ans ---
// Cible : villes ≥ 30 000 hab. qui n'ancrent ni université, ni école d'ingénieur,
// ni école de commerce, ni Sciences Po, ni CPGE notable selon `lib/education`
// (curation MESR / CPU / CGE / Conférence des grandes écoles 2024). Une simple
// antenne universitaire compte pour moitié — pas la même densité d'offre qu'un
// vrai campus. Filtre clé : on EXCLUT les communes qui se situent dans le bassin
// universitaire d'une grande métropole (≤ 30 km à vol d'oiseau d'un véritable
// pôle universitaire), car leurs ados accèdent à un campus en RER/tram quotidien
// — Aubervilliers, Drancy, Tourcoing, Mérignac ne sont pas en désert
// supérieur, leurs résidents fréquentent Sorbonne, Lille, Bordeaux. Severity
// amplifiée par : taille de la commune (plus la ville est grande, plus la part
// de bacheliers contraints au déménagement est élevée en volume), score culture
// seed faible (pas de tissu para-éducatif qui compenserait), score remoteWork
// seed faible (pas de tertiaire qualifié qui retiendrait les diplômés revenus
// du parcours). Indicateur dédié aux familles qui se posent la vraie question :
// « si je m'installe ici, dans 8 ans mes ados devront-ils déménager pour
// étudier à 100 km ? ».
// Pôles universitaires de référence : on dérive automatiquement la liste des
// communes de CITIES_SEED dont `lib/education` documente une présence
// universitaire — y compris les campus délocalisés (qui restent un lieu
// d'études quotidien pour les communes voisines) et les pôles ultramarins
// (Pointe-à-Pitre, Fort-de-France, Saint-Pierre-Réunion). On exclut
// uniquement les « Antenne X » sans campus physique anchored, qui n'ouvrent
// qu'une ou deux licences. C'est la même curation MESR / CPU que le reste de
// l'indicateur — sans liste hard-codée à maintenir.
function buildUniversityHubs(): Array<{ lat: number; lon: number }> {
  const hubs: Array<{ lat: number; lon: number }> = [];
  for (const c of CITIES_SEED) {
    if (c.latitude == null || c.longitude == null) continue;
    const e = getEducation(c.slug);
    if (!e.university) continue;
    // Exclure les antennes pédagogiques sans campus anchored.
    if (/^antenne\b/i.test(e.university)) continue;
    hubs.push({ lat: c.latitude, lon: c.longitude });
  }
  return hubs;
}

let _UNIVERSITY_HUBS: Array<{ lat: number; lon: number }> | null = null;
function getUniversityHubs(): Array<{ lat: number; lon: number }> {
  if (_UNIVERSITY_HUBS == null) _UNIVERSITY_HUBS = buildUniversityHubs();
  return _UNIVERSITY_HUBS;
}

function distanceToNearestUniHubKm(lat: number, lon: number): number {
  const hubs = getUniversityHubs();
  let best = Number.POSITIVE_INFINITY;
  for (const hub of hubs) {
    const d = haversineKm({ lat, lon }, { lat: hub.lat, lon: hub.lon });
    if (d < best) best = d;
  }
  return best;
}

function rankSansEnseignementSuperieur(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    const pop = city.population ?? 0;
    if (pop < 30_000) continue; // hors-cible : sous 30k, l'absence est attendue

    const edu = getEducation(city.slug);

    // Présence pondérée. Université ancrée pèse double (vrai campus complet) ;
    // école d'ingénieur ancrée pèse 1,5 (filière clé). Antenne / CPGE / IEP /
    // commerce comptent 1 chacun. Arts-design 0,5 (filière étroite).
    const isAnnexe = edu.university
      ? /antenne|campus|p[oô]le|annexe|cufr|proche/i.test(edu.university)
      : false;
    let presence = 0;
    if (edu.university) presence += isAnnexe ? 1 : 2;
    if (edu.cpge) presence += 1;
    if (edu.ingenieur && edu.ingenieur.length > 0) presence += 1.5;
    if (edu.commerce && edu.commerce.length > 0) presence += 1;
    if (edu.iep) presence += 1;
    if (edu.artsDesign && edu.artsDesign.length > 0) presence += 0.5;

    if (presence > 1.5) continue; // offre suffisante — hors-cible

    // Filtre clé : exclure les communes du bassin universitaire d'une grande
    // métropole. À 30 km d'un pôle universitaire, un étudiant accède au campus
    // en RER / tram / TER quotidien — ce n'est pas un désert supérieur, c'est
    // une banlieue résidentielle d'aire universitaire.
    if (city.latitude == null || city.longitude == null) continue;
    const distKm = distanceToNearestUniHubKm(city.latitude, city.longitude);
    if (distKm < 30) continue;

    // Base 5 : ville ≥ 30 000 hab. sans offre post-bac réelle.
    let severity = 5;
    if (presence === 0) severity += 2.0;
    else if (presence <= 1.0) severity += 0.9;

    // Bonus taille : impacte plus de familles en valeur absolue.
    if (pop >= 70_000) severity += 1.5;
    else if (pop >= 50_000) severity += 1.0;
    else if (pop >= 40_000) severity += 0.5;

    // Bonus isolement : plus le pôle universitaire est loin, plus le
    // déménagement de l'ado devient lourd (chambre étudiante + double foyer).
    if (distKm >= 80) severity += 0.8;
    else if (distKm >= 60) severity += 0.4;

    // Bonus écosystème faible : culture ≤ 5/10 ET / OU remoteWork ≤ 5/10
    // = pas de tertiaire qualifié qui retiendrait les diplômés revenus.
    if (city.scores.culture <= 5) severity += 0.4;
    if (city.scores.remoteWork <= 5) severity += 0.3;

    severity = Math.min(10, severity);
    if (severity < 6) continue;

    const offerParts: string[] = [];
    if (edu.university) offerParts.push(isAnnexe ? "antenne universitaire" : "université");
    if (edu.cpge) offerParts.push("CPGE");
    if (edu.ingenieur?.length) offerParts.push("école d'ingénieur");
    if (edu.commerce?.length) offerParts.push("école de commerce");
    if (edu.iep) offerParts.push("IEP");
    if (edu.artsDesign?.length) offerParts.push("école d'art");
    const offerLabel = offerParts.length > 0
      ? `offre rachitique (${offerParts.join(", ")})`
      : "aucune offre post-bac structurée";

    const reason = `${pop.toLocaleString("fr-FR")} hab. · ${offerLabel} · pôle universitaire à ${Math.round(distKm)} km`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 25 — Atteintes aux biens : cambriolages, vols véhicules, dégradations ---
// Distinct du thème `villes-nuit-tendue` (sous-score nocturnal) et du score
// safety global (composite 4 dimensions) — on isole ici la dimension
// `property` de lib/safety-deep, qui pèse 35 % du composite et concentre
// cambriolages, vols véhicules, dégradations volontaires SSMSI. Cible :
// villes ≥ 30 000 hab. dont le sous-score property dépasse 6,5/10. Bonus
// quand atteintes aux personnes corroborent (cumul ≥ 6), bonus métropole +
// score global ≥ 6,5 (la « belle vitrine » qui dissimule un fond de
// cambriolages chronique), bonus quand la ville est explicitement
// touristique > 30k hab. (saturation saisonnière des effractions sur les
// résidences secondaires et véhicules de location).
function rankVolsCambriolages(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    if ((city.population ?? 0) < 30_000) continue;
    const s = computeSafetyDeep(city);
    if (s.property.score < 6.5) continue;

    const tags = (city.characterTags ?? []).join(" ").toLowerCase();
    const isMetro = /métropole/.test(tags);
    const isTouristic = /tourisme|touristique|côte|plage|station/.test(tags);

    let bonus = 0;
    if (s.persons.score >= 6) bonus += 0.8;
    if (isMetro && city.scores.global >= 6.5) bonus += 0.5;
    if (isTouristic && (city.population ?? 0) > 30_000) bonus += 0.4;
    // Severity = sous-score property direct (déjà 0-10, 10 = pire) + bonus.
    const severity = Math.min(10, s.property.score + bonus);

    const tops = [
      { k: "biens", s: s.property.score },
      { k: "personnes", s: s.persons.score },
      { k: "nocturne", s: s.nocturnal.score },
    ]
      .filter((x) => x.s >= 5.5)
      .sort((a, b) => b.s - a.s)
      .slice(0, 2)
      .map((x) => `${x.k} ${x.s.toFixed(1)}/10`)
      .join(" · ");

    const contextParts: string[] = [];
    if (isMetro) contextParts.push("hyper-centre métropole");
    else if (isTouristic) contextParts.push("pression touristique");
    const context = contextParts.length > 0 ? ` · ${contextParts.join(" · ")}` : "";

    const reason = `Atteintes aux biens ${s.property.score.toFixed(1)}/10${tops ? ` — ${tops}` : ""}${context}`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 27 — Péril côtier : érosion littorale & submersion marine ---
// Distinct du thème `villes-risques-naturels` (composite national 4 aléas :
// inondation + argile + feu + séisme) — on isole ici la dimension spécifique
// du « trait de côte » : recul du rivage par érosion (côtes sableuses
// d'Aquitaine, Vendée, Pas-de-Calais), affaissement / éboulement de
// falaises (côte d'Albâtre, Manche), et submersion marine récurrente sur
// les bas littoraux (Camargue, étangs languedociens, golfe du Morbihan).
// Cible : villes ≥ 1 000 hab. en département littoral métropolitain ou
// DROM, d'altitude ≤ 25 m, présentant un tag character explicitement côtier
// (plage / balnéaire / dune / port / littoral / atlantique / méditerranée /
// manche). Severity composée à partir de l'altitude (le facteur le plus
// déterminant — sous 5 m, la submersion centennale est probable), du
// risque inondation calculé par lib/natural-risks (corroboration), et
// d'un malus de façade aligné sur les zones d'érosion documentées par
// l'observatoire BRGM TRAIT 2023. Le filtre tag character évite de
// remonter les communes de département littoral mais situées à 25 km
// dans les terres (Bayonne, Toulon hyper-centre, Aubagne) — l'érosion
// est un phénomène de bord de mer immédiat, pas d'arrière-pays.
//
// Sources : BRGM TRAIT (Indicateur national de l'érosion côtière),
// liste réglementaire des communes exposées au recul du trait de côte
// (article L. 321-15 Code de l'environnement, décret 2022-750 modifié
// 2024), ONERC (Observatoire national des effets du réchauffement
// climatique), GIEC AR6 WGII (élévation niveau mer +0,3 à +1,0 m d'ici
// 2100 selon scénario SSP).
// Atlantique sableuse — reculs documentés 1-5 m/an par BRGM TRAIT
// (Soulac, Lacanau, Capbreton, La Faute-sur-Mer, Île de Ré).
const COASTAL_DEPTS_ATLANTIC_SANDY = new Set([
  "Vendée",
  "Charente-Maritime",
  "Gironde",
  "Landes",
]);
// Atlantique granitique / autres côtes de la façade Atlantique.
const COASTAL_DEPTS_ATLANTIC_OTHER = new Set([
  "Ille-et-Vilaine",
  "Côtes-d'Armor",
  "Finistère",
  "Morbihan",
  "Loire-Atlantique",
  "Pyrénées-Atlantiques",
]);
// Façade Manche / Mer du Nord : Opale, Albâtre, Nacre, Cotentin —
// érosion de falaise documentée (Étretat ~20 cm/an).
const COASTAL_DEPTS_CHANNEL = new Set([
  "Nord",
  "Pas-de-Calais",
  "Somme",
  "Seine-Maritime",
  "Calvados",
  "Manche",
]);
// Méditerranée basse — Camargue, étangs languedociens : submersion
// marine récurrente sur lagunes à < 5 m d'altitude.
const COASTAL_DEPTS_MED_LOW = new Set(["Hérault", "Aude", "Gard"]);
// Reste de la façade méditerranéenne — exposition variable selon site.
const COASTAL_DEPTS_MED_OTHER = new Set([
  "Pyrénées-Orientales",
  "Bouches-du-Rhône",
  "Var",
  "Alpes-Maritimes",
  "Corse-du-Sud",
  "Haute-Corse",
]);
const COASTAL_DEPTS_DROM = new Set([
  "Guadeloupe",
  "Martinique",
  "Guyane",
  "La Réunion",
  "Mayotte",
]);
const COASTAL_TAG_REGEX = /plage|plages|balnéaire|station-balnéaire|dune|littoral|atlantique|méditerranée|manche|port|côte|presqu'île|golfe|estuaire|lagune|étang/i;

function rankErosionCotiere(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    const dept = city.department;
    if (!dept) continue;

    const isAtlanticSandy = COASTAL_DEPTS_ATLANTIC_SANDY.has(dept);
    const isAtlanticOther = COASTAL_DEPTS_ATLANTIC_OTHER.has(dept);
    const isChannel = COASTAL_DEPTS_CHANNEL.has(dept);
    const isMedLow = COASTAL_DEPTS_MED_LOW.has(dept);
    const isMedOther = COASTAL_DEPTS_MED_OTHER.has(dept);
    const isDrom = COASTAL_DEPTS_DROM.has(dept);
    if (
      !isAtlanticSandy &&
      !isAtlanticOther &&
      !isChannel &&
      !isMedLow &&
      !isMedOther &&
      !isDrom
    )
      continue;

    const elev = city.elevation ?? 9999;
    if (elev > 25) continue; // hors-cible : pas de bord de mer immédiat

    const tags = (city.characterTags ?? []).join(" ");
    if (!COASTAL_TAG_REGEX.test(tags)) continue;

    const pop = city.population ?? 0;
    if (pop < 1_000) continue; // filtre les hameaux non commercialisés

    // Facteur altitude : 25 m → 0, 0 m → 10. C'est le driver dominant —
    // sous 5 m, la submersion centennale est attendue (Géorisques PPRL).
    const altFactor = normSeverity(25 - elev, 0, 25);

    // Corroboration risque inondation lib/natural-risks (0-10, 10 = pire).
    // Capté à 0,8× pour ne pas double-compter le facteur littoral déjà
    // présent dans floodRisk.
    const risks = computeNaturalRisks(city);
    const floodContribution = risks.flood.score * 0.25;

    // Malus de façade — alignés sur l'observatoire BRGM TRAIT 2023.
    // Atlantique sableuse (Aquitaine, Vendée, Pas-de-Calais nord) : recul
    // documenté de 1 à 5 m/an localement (Soulac, Lacanau, La Faute).
    // Méditerranée bas (Camargue, étangs languedociens) : submersion
    // marine récurrente sur lagunes saumâtres. Manche / Albâtre : recul
    // de falaise (Étretat 20 cm/an). DROM : cyclones tropicaux + houle.
    let facadeBonus = 0;
    let facadeLabel = "";
    if (isAtlanticSandy) {
      facadeBonus = 1.7;
      facadeLabel = "Atlantique sableuse (recul BRGM 1-5 m/an)";
    } else if (isAtlanticOther) {
      facadeBonus = 1.2;
      facadeLabel = "façade Atlantique";
    } else if (isChannel) {
      facadeBonus = 1.0;
      facadeLabel = "Manche / Mer du Nord (Opale, Albâtre, Cotentin)";
    } else if (isMedLow) {
      facadeBonus = 1.5;
      facadeLabel = "Méditerranée basse (Camargue / étangs)";
    } else if (isMedOther) {
      facadeBonus = 1.0;
      facadeLabel = "Méditerranée littorale";
    } else if (isDrom) {
      facadeBonus = 1.4;
      facadeLabel = "DROM (cyclones + houle)";
    }

    // Bonus tag explicitement « station-balnéaire » ou « dune » — exposition
    // documentée par concentration touristique et urbanisation du cordon.
    const isStation = /station-balnéaire/i.test(tags);
    const isDune = /\bdune\b/i.test(tags);
    let tagBonus = 0;
    if (isStation) tagBonus += 0.4;
    if (isDune) tagBonus += 0.5;

    // Bonus population : > 20 000 hab. = enjeu de protection majeur
    // (digues, brise-lames, rechargement de plage à financer).
    const popBonus = pop >= 50_000 ? 0.5 : pop >= 20_000 ? 0.3 : 0;

    const severity = Math.min(
      10,
      altFactor * 0.5 + floodContribution + facadeBonus + tagBonus + popBonus,
    );
    if (severity < 5) continue;

    const elevLabel = `${elev} m d'altitude`;
    const floodLabel = risks.flood.score >= 6 ? ` · PPRL probable (inondation ${risks.flood.score.toFixed(1)}/10)` : "";
    const reason = `${elevLabel} · ${facadeLabel}${floodLabel}`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 28 — Chauffage hivernal coûteux — facture ADEME vs salaire local ---
// Distinct du thème `villes-hiver-rude` (qui mesure le froid + grisaille pour
// l'inconfort humain) et du thème `villes-couts-explosifs` (composite famille
// loyer + chauffage + mobilité + taxes). Ici on isole spécifiquement le poids
// de la facture chauffage rapportée au salaire net médian départemental — la
// vraie question du précaire énergétique : « quelle fraction de mon salaire
// part dans le chauffage chaque mois ? ». Cible : villes dont la zone
// climatique RT2012 (ADEME / arrêté 28/12/2012) impose une facture mensuelle
// ≥ 80 € pour un T2 (45 m²), bonus altitude > 700 m (saison de chauffe
// allongée et plus intense), pénalité salaire bas (le même 95 €/mois pèse 5,4 %
// pour un Briançonnais et 3,2 % pour un Parisien). Indicateur dédié aux
// primo-locataires, retraités, familles monoparentales et étudiants
// boursiers qui se posent la vraie question : « la pièce où je vais dormir
// l'hiver, je vais pouvoir la chauffer sans rogner sur les courses ? ».
//
// Sources sous-jacentes : ADEME 2024 (coût moyen mensuel chauffage par zone
// climatique RT2012, mix électrique/gaz), arrêté ministériel 28/12/2012
// (zonage H1a/H1b/H1c/H2a/H2b/H2c/H2d/H3), INSEE DADS (salaire net médian
// départemental, proxy v0 du tableau SALARY_PROXY), ONPE (Observatoire
// national de la précarité énergétique — un ménage est en précarité quand
// la facture énergétique > 8 % du revenu).
const HEATING_BASE_BY_ZONE: Record<string, number> = {
  H1a: 95, // Nord-Est continental — Hauts-de-France, Normandie est, Picardie
  H1b: 90, // Centre-Est froid — Lorraine, Vosges, Marne, Ardennes
  H1c: 80, // Centre / Île-de-France / Massif Central nord — saison étendue
  H2a: 65, // Ouest atlantique tempéré — Bretagne, Pays de la Loire
  H2b: 60, // Centre-Ouest — Limousin, Périgord, Lot
  H2c: 55, // Sud-Ouest — Gironde, Landes, Pyrénées, Aude
  H2d: 70, // Vallée du Rhône et Alpes — saisons rudes en altitude
  H3: 40,  // Méditerranée — chauffage marginal
};

function rankChauffageHivernalCouteux(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    if (!city.department) continue;
    const zone = climateZoneFor(city.department);
    if (!zone) continue;
    const baseHeating = HEATING_BASE_BY_ZONE[zone];
    if (baseHeating == null) continue;

    // Bonus altitude : saison de chauffe rallongée et intensifiée. Briançon
    // (1 320 m), Barcelonnette (1 132 m), Chamonix (1 035 m) consomment
    // structurellement plus que la moyenne de leur département H2d. ADEME
    // documente +20 % d'énergie au-dessus de 800 m, +35 % au-dessus de 1 200 m.
    const elev = city.elevation ?? 0;
    let heating = baseHeating;
    if (elev >= 1200) heating += 40;
    else if (elev >= 700) heating += 25;
    else if (elev >= 400) heating += 12;

    // Salaire dept proxy v0 — voir SALARY_PROXY plus haut (Paris/petite couronne
    // 2 500 € · bonnes métropoles 2 200 € · médiane 2 050 € · bas 1 900 €
    // · très bas 1 750 €).
    const e = computeEmploymentMarket(city);
    const salary = SALARY_PROXY[e.salary.score] ?? 2050;
    const ratio = heating / salary; // part du salaire net qui part en chauffage

    // Severity : 3 % → 0, 4 % → 3,3, 5 % → 6,7, 6 % → 10. Seuil ONPE
    // précarité énergétique = 8 % du revenu pour la facture énergie globale,
    // dont le chauffage représente en moyenne 60-70 % (ADEME) → seuil
    // proxy chauffage seul ≈ 5,5 %.
    const ratioFactor = normSeverity(ratio * 100, 3, 6);
    if (ratioFactor < 4.5) continue;

    // Bonus petite commune : parc ancien fioul / électrique direct sans
    // chaudière collective gaz — surcoût documenté ONRE (Observatoire
    // national de la rénovation énergétique).
    const pop = city.population ?? 0;
    const popBonus = pop > 0 && pop < 30_000 ? 0.5 : 0;
    // Bonus janvier très froid en plaine : isolation moyenne, T° de
    // consigne maintenue plus longtemps.
    const cold = city.avgTempJanuary ?? 999;
    const coldBonus = cold <= 1.5 ? 0.4 : 0;

    const severity = Math.min(10, ratioFactor + popBonus + coldBonus);
    if (severity < 6) continue;

    const pct = ratio * 100;
    const elevLabel = elev >= 700 ? ` · ${elev} m d'altitude` : "";
    const salaryLabel = `salaire dept ≈ ${salary.toLocaleString("fr-FR")} €/mois`;
    const reason = `${heating} €/mois chauffage T2 (zone ${zone}${elevLabel}) · ${salaryLabel} — ${pct.toFixed(1).replace(".", ",")} %`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME — Climat 2040 dégradé ---
// Cible : villes dont la projection ARPEGE 2040 (lib/climate-2040) cumule
//   1. une hausse marquée des températures de juillet vs 1991-2020,
//   2. un nombre élevé de jours > 30 °C estimés en 2040,
//   3. un nombre élevé de nuits tropicales (> 20 °C) en 2040.
// Filtre population ≥ 15 000 hab. pour rester sur des bassins urbains où la
// projection a un sens habitable. Différence avec `villes-belles-invivables-ete`
// (qui regarde la canicule d'aujourd'hui, 1991-2020) : ici on regarde 2040 — un
// décalage temporel qui rebat les cartes (couloir rhodanien, Sud-Ouest, Corse,
// Île-de-France interne s'imposent là où, aujourd'hui, seul le pourtour
// méditerranéen affichait des indicateurs critiques).
function rankClimat2040Deteriore(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    const pop = city.population ?? 0;
    if (pop < 15000) continue;
    const proj = projectClimate2040(city);
    if (proj.projectedJulyC == null) continue;

    const deltaJuly = proj.macroRegion.deltaJulyC;
    const projDays30 = proj.projectedDays30C;
    const projNights = proj.projectedTropicalNights;

    // Pondération : la canicule diurne (jours > 30) et les nuits tropicales
    // (qui empêchent de récupérer) sont les deux signaux dominants. La hausse
    // moyenne de juillet pèse moins (proxy macro-région, déjà reflété dans les
    // deux autres) mais reste un indicateur séparé pour départager.
    const factorHausse = normSeverity(deltaJuly, 1.5, 2.6);
    const factorDays = normSeverity(projDays30, 25, 75);
    const factorNights = normSeverity(projNights, 12, 65);

    // Bonus combo : quand jours ≥ 7/10 ET nuits ≥ 7/10, c'est un climat
    // estival doublement dégradé (jour ET nuit) — situation où la
    // climatisation cesse d'être un confort pour devenir une nécessité.
    const comboBonus = factorDays >= 7 && factorNights >= 7 ? 1.0 : 0;
    // Petit bonus de gravité quand la commune est explicitement balnéaire ou
    // station thermale (saturation touristique estivale qui amplifie l'inconfort).
    const tagBonus = SEASONAL_TAGS_REGEX.test(city.characterTags.join(" ")) ? 0.3 : 0;

    const severity = Math.min(
      10,
      factorHausse * 0.25 + factorDays * 0.38 + factorNights * 0.37 + comboBonus + tagBonus,
    );
    if (severity < 6) continue;

    const reason = `${proj.macroRegion.label} · +${deltaJuly.toFixed(1)} °C en juillet · ~${projDays30} j/an > 30 °C · ~${projNights} nuits tropicales en 2040`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 30 — Déficit de soleil hivernal ---
// Distinct de `villes-hiver-rude` (qui combine froid ET grisaille, et ne se
// déclenche que quand les deux facteurs cumulent). Ici, on isole le seul
// déficit de lumière : on retient les villes au cumul annuel d'insolation
// faible (≤ 1 950 h, en deçà de la médiane métropolitaine) ET situées
// au-dessus du 45,5e parallèle (effet de raccourcissement du jour en
// décembre-janvier, plus marqué au nord). Conséquence : on remonte les
// communes océaniques douces (Brest, Cherbourg, Saint-Brieuc), invisibles
// dans `hiver-rude` parce que leur janvier reste tiède (6-7 °C) mais où la
// lumière disponible chute en dessous de 5 h/jour cinq mois sur douze.
// Indicateur dédié aux profils sensibles au trouble affectif saisonnier (TAS),
// aux télétravailleurs qui passent la journée derrière une fenêtre, et aux
// retraités qui sortent peu — pour qui « il fait jour » ne suffit pas à
// remplacer « il fait soleil ».
function rankDeficitSoleilHiver(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    const sun = city.sunshinedays;
    const lat = city.latitude;
    const janT = city.avgTempJanuary;
    if (sun == null || lat == null || janT == null) continue;
    if (sun > 1950) continue; // hors périmètre : insolation correcte
    if (lat < 45.5) continue; // trop méridional : jour de décembre encore long

    // Facteur grisaille (1 950 h → 0, 1 450 h → 10). On capte la pénurie
    // structurelle, pas la légère variation interannuelle.
    const sunFactor = normSeverity(1950 - sun, 0, 500);
    // Facteur latitude (45,5° → 0, 51° → 10). À 51° N (Dunkerque, Calais),
    // le solstice ne donne que 7 h 50 de jour ; à 45,5° N (Valence, Grenoble),
    // c'est encore 9 h 00 — 1 h 10 d'écart sur la journée la plus courte.
    const latFactor = normSeverity(lat, 45.5, 51);
    // Bonus combo : quand l'insolation est rare (≥ 6/10) ET que la latitude
    // amplifie (≥ 6/10), on cumule deux signaux concordants — situation typique
    // des dépressions hivernales prolongées des plaines du Nord et du Nord-Est.
    const comboBonus = sunFactor >= 6 && latFactor >= 6 ? 0.9 : 0;
    // Bonus froid : un janvier sous 4 °C alourdit le ressenti (besoin de
    // chauffage continu, sortie courte, exposition au peu de lumière limitée).
    // Distinct de `villes-hiver-rude` qui exige les deux ≥ 5 simultanément.
    const coldBonus = janT < 4 ? 0.5 : 0;

    const severity = Math.min(10, sunFactor * 0.5 + latFactor * 0.45 + comboBonus + coldBonus);
    if (severity < 6) continue;

    const days = sunshineDays(sun);
    const reason = `${days} jours-équivalents de soleil/an · ${lat.toFixed(1).replace(".", ",")}° N · ${janT.toFixed(1).replace(".", ",")} °C en janvier`;
    rows.push({ city, severity: Math.round(severity * 10) / 10, reason });
  }
  return rows.sort((a, b) => b.severity - a.severity).slice(0, 12);
}

// --- THEME 31 — Embouteillages quotidiens (congestion routière chronique) ---
// Cible : villes prises dans un couloir routier saturé aux heures de pointe,
// où le maillage transport n'est pas assez dense pour offrir une alternative
// crédible à la voiture. Distinct de `villes-sans-voiture-difficile` (qui vise
// les villes moyennes sans réseau structurant, souvent < 200k hab.) et de
// `villes-anti-velo` (qui pénalise le vélo utilitaire). Ici : la voiture
// existe, elle domine, mais elle est prise dans un tuyau — périphérique,
// rocade, autoroute urbaine — sur lequel le trafic pendulaire dépasse la
// capacité 4-5 heures par jour.
//
// Filtre : population ≥ 40 000 hab. (bassin de commuting réel) ET score
// transport ∈ [3,5 ; 6,5] (assez de réseau pour attirer les commuteurs mais
// pas assez pour absorber le pic — trop bas = ville rurale, trop haut = tram
// dense qui décharge la route). Bonus documenté selon les couloirs recensés :
// couronne IDF (A6/A10/A86/A15/A4), Marseille (A7/A55/A50), Lyon (A6/A7/A46),
// Riviera (A8/A57), frontière genevoise (A40/A41), rocade bordelaise (A630),
// périphérique nantais (N844), rocade toulousaine (A620/A621), cuvette
// grenobloise (A48/A480), métropole lilloise (A1/A22). Références : Bison
// Futé archives 2022-2024, Sytadin (DIRIF) et cartes SIREDO (voie rapide
// interurbaine).
function rankEmbouteillagesQuotidiens(): RedFlagRow[] {
  const rows: RedFlagRow[] = [];
  for (const city of CITIES_SEED) {
    const pop = city.population ?? 0;
    if (pop < 40_000) continue;
    const transport = city.scores.transport;
    if (transport >= 7) continue; // réseau lourd, hors périmètre
    if (transport < 3.5) continue; // ville isolée — autre problème (cf. `villes-sans-voiture-difficile`)

    const dept = city.department ?? "";
    const region = city.region ?? "";
    const isParis = city.slug === "paris";
    if (isParis) continue; // Paris intra-muros : la voiture est marginale, hors périmètre

    // Couloirs routiers saturés recensés — bonus zonal étalonné sur la
    // fréquence des dépassements de capacité aux heures de pointe.
    const idfCouronne = region === "Île-de-France" && dept !== "Paris";
    const marseillePeriphery = dept === "Bouches-du-Rhône" && pop > 40_000;
    const lyonPeriphery = ["Rhône", "Métropole de Lyon"].includes(dept) && pop > 45_000;
    const rivieraA8 = ["Alpes-Maritimes", "Var"].includes(dept) && pop > 40_000;
    const genevaBorder = dept === "Haute-Savoie" && pop > 40_000;
    const bordeauxRocade = dept === "Gironde" && pop > 45_000;
    const nantesPeripherique = dept === "Loire-Atlantique" && pop > 45_000;
    const toulouseRocade = dept === "Haute-Garonne" && pop > 45_000;
    const grenobleCuvette = dept === "Isère" && pop > 45_000;
    const lilleA1 = ["Nord", "Pas-de-Calais"].includes(dept) && pop > 55_000;

    let bonus = 0;
    let context = "";
    if (idfCouronne) { bonus = 2.2; context = " · couronne francilienne (A6/A10/A86/A15/A4)"; }
    else if (marseillePeriphery) { bonus = 2.0; context = " · A7/A55/A50, tunnel Prado-Carénage"; }
    else if (lyonPeriphery) { bonus = 1.9; context = " · A6/A7/A46, tunnel Fourvière"; }
    else if (grenobleCuvette) { bonus = 1.8; context = " · A48/A480, cuvette grenobloise"; }
    else if (rivieraA8) { bonus = 1.7; context = " · A8/A57 Riviera, saturation permanente"; }
    else if (genevaBorder) { bonus = 1.7; context = " · A40/A41 frontalier Genève"; }
    else if (bordeauxRocade) { bonus = 1.5; context = " · rocade A630 bordelaise"; }
    else if (nantesPeripherique) { bonus = 1.5; context = " · périphérique N844 nantais"; }
    else if (toulouseRocade) { bonus = 1.5; context = " · A620/A621 rocade toulousaine"; }
    else if (lilleA1) { bonus = 1.2; context = " · A1/A22 métropole lilloise"; }
    if (bonus === 0) continue; // hors couloir documenté

    // Signal transport intermédiaire : trop faible = commuters à l'arrêt,
    // trop élevé = décharge par le rail. La zone de tension est 3,5-6,5.
    const transportFactor = normSeverity(6.5 - transport, 0, 3);
    // Population : plus la ville est grosse, plus le flux pendulaire est
    // dense. Plateau à 250 000 hab. (au-delà, saturation totale — les 350k+
    // de Marseille, Nice, Toulouse pèsent au max).
    const popFactor = normSeverity(pop, 40_000, 250_000);
    // Bonus combo : coût du logement élevé (score.cost bas) → commuters
    // logés loin → trajets plus longs, saturation aux extrémités du bassin.
    const costPressure = city.scores.cost <= 5 ? 0.6 : 0;

    // Formule : base 2,0 (être dans un couloir saturé documenté est déjà
    // un signal fort) + bonus zonal pondéré + facteurs modulateurs
    // (transport intermédiaire, taille du bassin, tension coût).
    const severity = Math.min(
      10,
      2.0 + bonus * 1.3 + transportFactor * 0.35 + popFactor * 0.3 + costPressure,
    );
    if (severity < 5.5) continue;

    const reason = `Transport ${transport.toFixed(1)}/10 · ${pop.toLocaleString("fr-FR")} hab.${context}`;
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
      "Classement 2026 des villes françaises au composite le plus élevé sur les 4 aléas : inondation, retrait-gonflement argile (BRGM), feu de forêt (ONF/ECASC), sismicité (zonage 2011). Données ouvertes Géorisques.",
    emoji: "⚠️",
    intro:
      "L'annonce immobilière vante la vue sur le fleuve, la proximité du massif, le terrain en pente douce. Personne ne dit que la cave a déjà été inondée trois fois en quinze ans, que les fissures sur les murs sont l'argile qui gonfle l'été et se rétracte l'hiver, ou que le PPRif classe le quartier en aléa fort feu de forêt. Les risques naturels ne se voient pas sur la photo — ils se découvrent dans le rapport ERP signé en bas de l'acte.",
    reality:
      "On classe ici les villes dont le composite (inondation 35 % + argile 25 % + feu 20 % + sismicité 20 %) dépasse 5,5/10, avec un malus quand au moins deux des quatre aléas dépassent 6/10 — c'est-à-dire un vrai cumul, pas un seul risque isolé. Toutes les valeurs sont alignées sur les zonages réglementaires : sismicité décret 2010-1255, aléa argile BRGM, massifs à risque feu ONF/ECASC, proxy inondation fleuve majeur + altitude < 50 m + littoral.",
    methodology:
      "Severity = composite (0-10) + 1,2 si deux dimensions ou plus ≥ 6/10. Sources : BRGM (argile), BCSF/MTE décret 2010-1255 (sismicité), ONF + ECASC (feu de forêt), Géorisques (synthèse par commune INSEE). Vérifier le rapport ERP officiel avant tout achat.",
    rank: rankRisquesNaturels,
  },
  {
    slug: "villes-bruit-cauchemar",
    title: "Villes où le bruit est un cauchemar quotidien",
    metaTitle: "Bruit cauchemar 2026 — Villes françaises les plus exposées (routier, aérien, nocturne)",
    metaDescription:
      "Classement 2026 des villes françaises où le bruit cumule trafic routier saturé, survols aéroportuaires (PEB), LGV et vie nocturne. Données CBS / DGAC / Bruitparif. Composite agrégé.",
    emoji: "🔊",
    intro:
      "L'agence vante le quartier calme, la rue résidentielle, l'orientation cour. Sur le terrain : périphérique à 200 m, A86 en fond sonore, A380 toutes les 90 secondes au-dessus de Goussainville, ou centre-ville étudiant où les terrasses ferment à 2 h. Le bruit ne s'écoute pas sur une photo immobilière — il s'endure 24 h sur 24.",
    reality:
      "On classe les villes ≥ 30 000 hab. dont le composite bruit (routier 35 % + aérien 25 % + nocturne 25 % + ferroviaire 15 %) dépasse 5,5/10, avec malus quand au moins deux des quatre sources dépassent 6/10 — c'est-à-dire un vrai cumul d'expositions. L'OMS recommande Lden < 53 dB(A) jour et Lnight < 45 dB(A) nuit ; toutes les villes listées dépassent largement ce seuil sur une part importante du territoire communal.",
    methodology:
      "Severity = composite + 1,2 si deux sources ou plus ≥ 6/10. Sources : Cartes de Bruit Stratégiques (directive 2002/49/CE), Plans d'Exposition au Bruit DGAC, Bruitparif (IDF). Filtre population ≥ 30 000 hab. pour la pertinence du score nocturne.",
    rank: rankBruitCauchemar,
  },
  {
    slug: "villes-sans-eau-ete",
    title: "Villes où l'eau manquera l'été — sécheresse & restrictions",
    metaTitle: "Sécheresse 2026 — Villes françaises au stress hydrique le plus élevé (Propluvia, BRGM)",
    metaDescription:
      "Classement 2026 des villes françaises où la sécheresse est devenue récurrente : arrêtés Propluvia crise quasi-annuels, nappes BRGM basses, alimentation eau potable sous tension. Composite agrégé.",
    emoji: "💧",
    intro:
      "L'annonce vante le climat ensoleillé, la piscine, le jardin méditerranéen. Personne ne mentionne que l'arrosage est interdit cinq mois par an, que la piscine se vide à la mi-juillet, que la nappe locale est basse depuis trois ans et que la commune envisage des tours d'eau l'été prochain. La sécheresse ne se voit pas sur la photo en mai — elle se subit en août.",
    reality:
      "On classe les villes dont le composite (restrictions 35 % + nappes 25 % + climat 20 % + alimentation 20 %) dépasse 6/10, avec un bonus de gravité quand les restrictions atteignent le niveau « crise quasi-annuel » (Propluvia) OU quand nappes très basses et réseau eau potable sous tension se cumulent. Toutes les valeurs sont alignées sur les bulletins officiels BRGM 2022-2025 et l'historique Propluvia 2022-2024.",
    methodology:
      "Severity = composite + 1,0 si restrictions ≥ 8,5/10 + 0,8 si nappes très basses ET alimentation tendue. Sources : Propluvia (arrêtés sécheresse), BRGM (état des nappes), Météo-France (climat estival).",
    rank: rankSecheresseEau,
  },
  {
    slug: "villes-desert-medical",
    title: "Villes désert médical — accès aux soins critique",
    metaTitle: "Désert médical 2026 — Villes françaises où trouver un médecin est devenu impossible",
    metaDescription:
      "Classement 2026 des villes françaises ≥ 10 000 hab. où l'accès aux soins est critique : MG non remplacés, spécialistes saturés, urgences éloignées. Composite, sources DREES / CNOM / ARS.",
    emoji: "🩺",
    intro:
      "L'agence vante le calme, le prix au m² accessible, la maison de ville. Personne ne mentionne que le dernier médecin généraliste de la commune part en retraite en juin sans repreneur, que le cabinet de dermato le plus proche est à 1 h 30 de route avec un délai de 8 mois, ou que les urgences les plus proches sont à 45 min sans héliportage la nuit. Le désert médical ne se voit pas sur une photo immobilière — il se découvre en cherchant un médecin traitant à 22 h pour un enfant qui a 40 °C.",
    reality:
      "On classe les villes ≥ 10 000 hab. dont le composite dépasse 6,5/10, avec un malus quand généralistes en désert avéré (DREES &lt; 80/100k + plus de 50 % MG &gt; 60 ans) ET urgences éloignées se cumulent — c'est-à-dire un vrai problème vital, pas un seul indicateur. Toutes les valeurs sont alignées sur les statistiques DREES 2023-2024 et le zonage ZIP/ZAC de l'ARS.",
    methodology:
      "Severity = composite + 1,2 si MG = désert ET urgences ≥ 6,5/10 + 0,5 si spécialistes ≥ 7/10. Sources : DREES (densité médicale par département), Atlas démographique CNOM (vieillissement et remplacement), zonage ZIP/ZAC ARS, Conférence des Doyens (CHU).",
    rank: rankDesertMedical,
  },
  {
    slug: "villes-chomage-eleve",
    title: "Villes au chômage chronique — marché du travail sinistré",
    metaTitle: "Chômage chronique 2026 — Villes françaises au marché du travail le plus tendu",
    metaDescription:
      "Classement 2026 des villes françaises ≥ 15 000 hab. cumulant chômage INSEE élevé, faible dynamisme SIRENE et salaires médians bas. Composite, sources INSEE / DARES / DADS / SIRENE.",
    emoji: "📉",
    intro:
      "L'agence vante la maison de ville à 1 200 €/mois, le centre-ville charmant, la possibilité de tout payer cash. Personne ne mentionne que le bassin d'emploi local est sinistré depuis la fermeture du dernier site industriel, que le taux de chômage dépasse 11 % et que la création nette d'entreprises est négative depuis trois ans. Le chômage chronique ne se voit pas sur la photo immobilière — il se découvre en cherchant un emploi six mois après l'installation.",
    reality:
      "On classe les villes ≥ 15 000 hab. dont le composite (chômage 35 % + salaire 25 % + dynamisme 20 % + mix 20 %) dépasse 6,5/10, avec un malus quand chômage en désert ET dynamisme faible se cumulent — c'est-à-dire un vrai décrochage, pas un seul indicateur. Toutes les valeurs sont alignées sur les statistiques INSEE T4 2024 et la base SIRENE.",
    methodology:
      "Severity = composite + 1,2 si chômage ≥ 7,5/10 ET dynamisme ≥ 6,5/10 + 0,5 si salaires ≥ 7/10. Sources : INSEE (taux de chômage trimestriel par dept), DADS (salaires nets médians), SIRENE (création nette d'entreprises), DARES (bassins d'emploi en reconversion).",
    rank: rankChomageEleve,
  },
  {
    slug: "villes-cadre-de-vie-tendu",
    title: "Villes au cadre de vie tendu — cumul environnement + santé + emploi",
    metaTitle: "Cadre de vie tendu 2026 — Villes françaises au composite le plus faible",
    metaDescription:
      "Classement 2026 des villes françaises ≥ 15 000 hab. au méga-index Cadre de Vie le plus bas : cumul environnement dégradé + accès aux soins difficile + marché du travail tendu. Composite agrégé.",
    emoji: "😓",
    intro:
      "Sur le papier : maison accessible, fiscalité raisonnable, vie de quartier. Sur le terrain : air médiocre, désert médical, marché du travail sinistré. Quand un seul pilier dérape, on s'adapte ; quand deux ou trois piliers s'effondrent en même temps, le projet de vie devient une succession de compromis perdants. Le cadre de vie tendu ne se voit pas sur la photo — il se subit à chaque appel chez le médecin, à chaque recherche d'emploi, à chaque pic de pollution.",
    reality:
      "On classe les villes ≥ 15 000 hab. dont le méga-index (environnement 35 % + santé 30 % + emploi 35 %) est inférieur ou égal à 4,5/10, avec un malus quand au moins 2 des 3 piliers tombent sous 4/10 — c'est-à-dire un cumul réel, pas un seul pilier faible. Toutes les valeurs sont dérivées des composites (env), (santé), (emploi).",
    methodology:
      "Severity = (5 −) × 2 + 1,2 si au moins 2 piliers ≤ 4/10 + 0,6 si ≤ 3,5/10. Sources : ATMO / CITEPA / RNSA (env), DREES / CNOM / ARS (santé), INSEE / DADS / SIRENE (emploi). Composite agrégé site (méga-index).",
    rank: rankCadreDeVieTendu,
  },
  {
    slug: "villes-couts-explosifs",
    title: "Villes aux coûts explosifs — quand le ménage famille pèse plus que le salaire local",
    metaTitle: "Coûts explosifs 2026 — Villes où le coût famille dépasse le salaire médian dept",
    metaDescription:
      "Classement 2026 des villes françaises ≥ 20 000 hab. où le coût mensuel d'un ménage famille (lib) dépasse 60 % du salaire net médian départemental. Loyer, chauffage, mobilité, taxes.",
    emoji: "💥",
    intro:
      "L'agence vante le « bon plan » d'une grande métropole, le quartier qui monte, l'investissement de la décennie. Personne ne fait le calcul élémentaire : loyer T3 famille + chauffage + mobilité voiture + taxe foncière + TEOM + cantine = X €/mois ; salaire net médian du département = Y €/mois ; X / Y = ratio qui devrait alerter. Quand le ratio dépasse 60 %, il ne reste plus rien pour l'imprévu, les vacances, l'épargne — la machine à explosion programmée.",
    reality:
      "On calcule pour chaque ville ≥ 20 000 hab. le coût mensuel d'un ménage famille (loyer T3 + chauffage zone ADEME + mobilité voiture + taxes + cantine), puis on le rapporte au salaire net médian départemental (proxy INSEE DADS). Toutes les villes affichées dépassent 60 % du salaire ; au-delà de 80 %, le ménage médian est techniquement étranglé.",
    methodology:
      "Severity = ratio coût-famille / salaire-médian-dept, rescalé sur [0,6 ; 1,0] → [5 ; 10]. Sources : DVF + observatoires loyer (rents), ADEME (chauffage), France Assureurs (auto), DGFiP (taxe foncière), INSEE DADS (salaires médians). Filtre population ≥ 20 000 hab.",
    rank: rankCoutsExplosifs,
  },
  {
    slug: "villes-desert-services-publics",
    title: "Villes en désert de services publics — la double peine du rural et des DROM tendus",
    metaTitle: "Désert services publics 2026 — Villes françaises au maillage rompu",
    metaDescription:
      "Classement 2026 des villes ≥ 10 000 hab. au composite services publics ≥ 6,5/10 : écoles, La Poste & France Services, mairie, médiathèque. Sources DEPP / CAF / La Poste / ANCT.",
    emoji: "🏛️",
    intro:
      "La carte vitale change d'adresse, la Poste a fermé, le collège du chef-lieu est à 15 km, la mairie ouvre 2 demi-journées par semaine. Aucun de ces signaux ne se voit sur une plaquette immobilière, mais cumulés ils définissent ce que vivre dans un « désert de services » veut dire au quotidien — démarches reportées, école par car, file d'attente à Pôle Emploi à 30 min de route.",
    reality:
      "On classe les villes ≥ 10 000 hab. dont le composite dépasse 6,5/10 (10 = pire). Bonus +1,2 quand écoles ET La Poste sont tous deux en désert (≥ 6,5/10) — cumul réel, pas un seul axe. Les DROM tendus (Mayotte, Guyane) et l'arrière-pays rural Centre/Est (Creuse, Cantal, Lozère, Nièvre, Allier) dominent.",
    methodology:
      "Severity = composite + 1,2 si écoles ET Poste ≥ 6,5 + 0,4 si mairie ≥ 6,5. Pondération composite : écoles 35 % · mairie 25 % · Poste 25 % · médiathèque 15 %. Sources : DEPP (annuaire), CAF (crèche), La Poste (bureaux + APC + RPC), ANCT (Maisons France Services, ~2 800 en 2024), BNF (lecture publique).",
    rank: rankDesertServicesPublics,
  },
  {
    slug: "villes-anti-velo",
    title: "Villes où le vélo au quotidien reste hors de portée",
    metaTitle: "Villes anti-vélo 2026 — Où le vélo quotidien reste hors d'atteinte",
    metaDescription:
      "Classement 2026 des villes ≥ 15 000 hab. au composite cyclabilité ≤ 4,5/10 : faible réseau, relief, dangerosité, climat hostile. Sources Baromètre FUB + EuroVelo + Vélo & Territoires.",
    emoji: "🚲",
    intro:
      "Toutes les mairies promettent leur plan vélo. Dans les faits, certaines villes restent structurellement hostiles : pas de pistes continues, relief de massif central qui décourage le quotidien, périphérique saturé d'usagers, climat venté ou pluvieux 200 jours par an. Le vélo y est un sport de week-end, pas un mode de déplacement utilitaire.",
    reality:
      "On classe les villes ≥ 15 000 hab. dont le composite (réseau + topographie + sécurité + climat) tombe ≤ 4,5/10. La convention est inversée vs les autres clusters : 10 = excellent. Bonus +1,2 quand le réseau ET la topographie sont tous deux ≤ 4 (combo bloquant : pas de pistes ET ça grimpe).",
    methodology:
      "Severity = (5 − composite) × 2 + bonus combo. Pondération composite : réseau 35 % · topographie 25 % · sécurité 25 % · climat 15 %. Sources : Baromètre FUB (Fédération des Usagers de la Bicyclette), Vélo & Territoires (réseau structurant), EuroVelo, données altitude & climat seed.",
    rank: rankAntiVelo,
  },
  {
    slug: "villes-vieillissement-critique",
    title: "Villes en vieillissement critique — pyramide étroite à la base et solde négatif",
    metaTitle: "Vieillissement critique 2026 — Villes françaises en décroissance démographique",
    metaDescription:
      "Classement 2026 des villes ≥ 10 000 hab. au composite démographique ≥ 7/10 : seniors 60+, déficit jeunes actifs, solde naturel + migratoire négatif. Source INSEE RP + Bilan démographique.",
    emoji: "🕰️",
    intro:
      "La maison à 80 k€ est tentante, le notaire confirme « un beau patrimoine », l'agent immobilier parle d'investissement. Personne ne mentionne le contexte : la commune perd 1 % de sa population par an depuis 30 ans, la médiane d'âge dépasse 50, l'école ferme une classe tous les 3 ans, et la pharmacie cherche un repreneur qui ne vient jamais. Démographie négative = services qui se rétractent = patrimoine qui se dévalorise.",
    reality:
      "On classe les villes ≥ 10 000 hab. dont le composite dépasse 7/10. Bonus +1,2 quand le vieillissement ET la trajectoire sont tous deux ≥ 7 — pyramide haute (seniors > 35 %) ET solde démographique négatif structurel cumulés. Limousin entier, Creuse, Cantal, Nièvre, Indre, bassins industriels Nord en reconversion dominent.",
    methodology:
      "Severity = composite + 1,2 si ageing ET trajectory ≥ 7 + 0,4 si jeunes actifs ≥ 7. Pondération composite : vieillissement 30 % · trajectoire 30 % · jeunes actifs 25 % · renouvellement 15 %. Sources : INSEE Recensement de Population, Bilan démographique annuel, projection OMPHALE 2070 par zone d'emploi.",
    rank: rankVieillissementCritique,
  },
  {
    slug: "villes-nuit-tendue",
    title: "Villes à la sécurité nocturne tendue — centres festifs sous pression",
    metaTitle: "Sécurité nocturne tendue 2026 — Villes françaises festives sous pression SSMSI",
    metaDescription:
      "Classement 2026 des villes ≥ 15 000 hab. dont le sous-score sécurité nocturne dépasse 6,5/10 : rixes, agressions nocturnes concentrées sur les centres festifs / étudiants / touristiques. Source SSMSI.",
    emoji: "🌙",
    intro:
      "La sécurité globale dit « moyenne », mais le ressenti nocturne dans certaines hyper-centres festifs, étudiants ou touristiques est tout autre : rixes en sortie de boîte, agressions sur le retour de soirée, signalements concentrés sur 4 rues du centre. Indicateur particulièrement pertinent pour étudiantes, jeunes actifs, femmes seules en sortie nocturne.",
    reality:
      "On isole le sous-score « sécurité nocturne » du cluster (rixes / agressions nocturnes SSMSI) et on classe les villes ≥ 15 000 hab. dont ce sous-score dépasse 6,5/10. Bonus +0,8 quand les atteintes aux personnes corroborent (persons ≥ 6), bonus +0,6 quand la ville est explicitement taguée festive / étudiante / touristique.",
    methodology:
      "Severity = sous-score nocturnal + bonus combos. Pondération : biens 35 % · personnes 30 % · nuit 20 % · VFFS 15 %. Sources : SSMSI (Service statistique ministériel de la sécurité intérieure), atteintes nocturnes / rixes ; interstats.fr. Caveat : un taux élevé peut refléter à la fois une réalité plus tendue ET un meilleur signalement.",
    rank: rankNuitTendue,
  },
  {
    slug: "villes-logement-introuvable",
    title: "Villes où le logement locatif est introuvable",
    metaTitle: "Logement introuvable 2026 — Marché locatif le plus serré",
    metaDescription:
      "Classement 2026 des villes où décrocher un bail est une bataille : marché tendu, loyer T2 bien au-dessus de la médiane. Proxy DGALN-aligned.",
    emoji: "🔑",
    intro:
      "L'annonce alléchante reste en ligne huit minutes. Les visites sont collectives, douze candidats au pas de la porte, dossier déjà imprimé en trois exemplaires. L'agence ne rappelle pas, ou demande deux garants et trois bulletins de salaire pour un T2 à 950 €. Sur le papier, le marché est « dynamique » ; pour le locataire, la même réalité s'appelle simplement : introuvable. Cette tension ne se voit ni sur une carte des prix ni dans une plaquette de ville — elle se découvre quand on a deux semaines pour signer un bail et qu'on n'a vu aucun bien correct.",
    reality:
      "On classe les villes dont le proxy de tension locative dépasse 7,5/10 — soit la catégorie « tendu » et « très tendu » de la grille DGALN. Concrètement : un loyer T2 supérieur à la médiane nationale, un prix d'achat qui suit, une population qui maintient la demande, et des scores qualité de vie + sécurité qui rendent la ville désirable. Quand ces signaux se cumulent, le marché bascule de « concurrentiel » à « bloquant pour les profils sans garant ni CDI long ». Toutes les villes affichées passent le seuil 7,5/10 et la plupart cumulent un loyer T2 ≥ 20 % au-dessus de la médiane nationale.",
    methodology:
      "Severity = tension (0-10, 10 = pire) + 1,0 si loyer T2 ≥ 1,5× médiane nationale, + 0,4 si ≥ 1,2×. Pondération de la tension : loyer T2 vs médiane 55 % · prix d'achat m² 25 % · population (bonus > 200k, malus < 30k) · désirabilité life + safety. Proxy aligné sur la liste DGALN « zones tendues » (~1100 communes) que le seed n'expose pas directement. Sources sous-jacentes : DVF (prix), observatoires loyer 2024, INSEE (population), scores propriétaires site.",
    rank: rankLogementIntrouvable,
  },
  {
    slug: "villes-hiver-rude",
    title: "Villes où l'hiver est le plus rude",
    metaTitle: "Hiver rude 2026 — Villes françaises les plus dures en janvier",
    metaDescription:
      "Classement 2026 des villes françaises au pire hiver : janvier glacial et grisaille tenace cumulés. Températures et ensoleillement Météo-France 1991-2020.",
    emoji: "❄️",
    intro:
      "L'annonce immobilière vante toujours la ville sous son meilleur jour : photos prises en mai, terrasses au soleil, jardin verdoyant. Personne ne montre le mois de janvier — la gelée qui colle au pare-brise tous les matins, le ciel bas qui ne se lève pas avant midi, et ces semaines entières où l'on ne voit pas une heure de soleil. L'hiver ne se voit pas sur une photo de printemps : il se traverse, quatre mois par an.",
    reality:
      "On croise deux dimensions cumulables : le froid (température moyenne de janvier, climato Météo-France 1991-2020) et la grisaille (ensoleillement annuel, proxy honnête du manque de lumière hivernale — terrain bien documenté de la déprime saisonnière). Une ville peut figurer au classement par le froid seul (villes d'altitude et plateaux), par la grisaille seule (façade Nord et Manche) ou, le pire des cas, par le cumul des deux — c'est ce cumul qui reçoit le malus de gravité. Les villes méditerranéennes et l'Outre-mer en sont, logiquement, totalement absents.",
    methodology:
      "Severity = 50% facteur froid (5 °C en janvier → 0, -1 °C → 10) + 50% facteur grisaille (1 950 h de soleil/an → 0, 1 480 h → 10), + 1,2 de malus quand les deux facteurs dépassent 5/10 (hiver à la fois glacial et sombre). Sources : moyennes climatiques Météo-France 1991-2020 (température de janvier, durée d'insolation annuelle).",
    rank: rankHiverRude,
  },
  {
    slug: "villes-mono-touristiques",
    title: "Villes mono-touristiques — la saison morte qui plombe",
    metaTitle: "Villes mono-touristiques 2026 — La saison morte qui plombe",
    metaDescription:
      "Classement 2026 des villes françaises au tissu mono-touristique : économie dépendante d'une saison, vie locale en sommeil hors-saison. Mix sectoriel INSEE.",
    emoji: "🏖️",
    intro:
      "Sur la plaquette : carte postale, photo prise en août, terrasses pleines, plage à 800 m. Personne ne montre la même rue en février — vitrines aux volets baissés, restaurants fermés six mois sur douze, écoles sous-remplies, médecin parti à 60 km. Une économie dont la saison fait 80 % du chiffre d'affaires n'est pas un mode de vie : c'est un calendrier de chômage technique partagé par tout le bassin.",
    reality:
      "On classe les villes ≤ 80 000 habitants dont le score `sectorMix` (lib/employment-market) signale une faible diversification — typiquement les départements `Var`, `Alpes-Maritimes`, `Hautes-Alpes`, `Pyrénées-Orientales`, les deux Corses, et les stations balnéaires / ski / thermalisme isolées dans des territoires sinon ruraux. Le score base 7/10 du modèle « mono-tourism » est amplifié par un malus de petite taille (< 30 000 hab. : pas de tissu privé non-touristique pour compenser) et par un bonus quand la ville présente un score global élevé — la « belle façade » qui dissimule une économie sous perfusion saisonnière.",
    methodology:
      "Severity = score sectorMix + 1,5 si tag explicite station-balnéaire / stations de ski / thermalisme (sinon +1,0 pour tag balnéaire / ski) + 1,0 si population < 30 000 hab. + 0,5 si score global ≥ 6,5. Filtre : population > 0 et ≤ 80 000 hab., severity ≥ 6/10. Source : MONO_TOURISM_DEPTS (Insee — répartition de l'emploi par secteur 2024) + character-tags du seed propriétaire (vocations affichées).",
    rank: rankMonoTouristique,
  },
  {
    slug: "villes-fuite-jeunes-actifs",
    title: "Villes que les 25-35 ans quittent en silence",
    metaTitle: "Villes fuite jeunes actifs 2026 — 25-35 ans en départ",
    metaDescription:
      "Classement 2026 des villes françaises que les jeunes actifs 25-35 ans quittent : déficit démographique INSEE, trajectoire, chômage, dynamisme SIRENE.",
    emoji: "🎒",
    intro:
      "Le scénario ne se voit pas sur les plaquettes d'attractivité. Les 18-22 ans partent étudier à Lyon, Bordeaux ou Toulouse, certains envisagent vaguement de revenir « plus tard, quand ce sera le moment de fonder une famille »… et ne reviennent jamais. À 30 ans, la promotion entière a basculé sur les pôles métropolitains, et la ville se retrouve avec une démographie de couvercle : les seniors qui restent, les ados qui partiront, et un trou béant en haut de la pyramide active. C'est l'inverse exact du discours de revitalisation des centres-villes.",
    reality:
      "On croise le score `youngActives` de `lib/demography` (proxy INSEE recensement de la part des 25-35 ans) avec la `trajectory` (solde naturel + migratoire, Bilan démographique INSEE) et le score chômage de `lib/employment-market` (INSEE T4 2024). Les villes qui remontent sont rarement spectaculaires — pas de fait divers, pas de pollution — mais elles cumulent trois signaux : déficit structurel de jeunes actifs, solde démographique négatif et marché du travail tendu côté demandeur. Bonus pour les sous-préfectures < 25 000 hab. où l'absence de masse critique rend la rétention encore plus difficile. Le filtre exclut volontairement les villes déjà dominées par le pic vieillissement (composite démographique ≥ 8,5) — celles-là sont dans `villes-vieillissement-critique`.",
    methodology:
      "Severity = (0,55 × youngActives + 0,18 × max(0, trajectory−5) + 0,16 × max(0, chômage−5) + 0,10 × max(0, dynamisme−5) + malus taille +0,4 si <25 000 hab. ou +0,2 si <40 000 hab.) × 1,7, clampé à 10/10. Filtre : population ≥ 10 000 hab., composite démographique < 8,5 (pour ne pas dupliquer le thème vieillissement), severity ≥ 6/10. Sources : INSEE recensement (structure par âge 25-35), Bilan démographique INSEE 2024 (solde naturel + migratoire), INSEE taux de chômage T4 2024, SIRENE (flux d'établissements).",
    rank: rankFuiteJeunesActifs,
  },
  {
    slug: "villes-internet-precaire",
    title: "Villes où le très haut débit reste un compromis",
    metaTitle: "Internet précaire 2026 — Villes au débit limité",
    metaDescription:
      "Classement 2026 des villes françaises où la fibre n'est pas arrivée : ADSL plafonné, 4G fixe saturée, dépts ARCEP peu denses (Creuse, Cantal, Lozère).",
    emoji: "📡",
    intro:
      "L'annonce immobilière vante le calme, la vue, le prix au m² accessible. Personne ne mentionne que la fibre s'arrête au prochain hameau, que l'ADSL plafonne à 12 Mbps en aval et 1 Mbps en amont, et que la 4G fixe sature deux jours par semaine quand le voisin lance Netflix. Sur le papier, la France est « presque entièrement fibrée » ; pour le télétravailleur qui doit tenir une visio quotidienne, la même réalité s'appelle simplement : compromis permanent.",
    reality:
      "On classe les villes dont l'`internetScore` calculé tombe à 5/10 ou moins. Le score blend le sous-score `remoteWork` du seed (60 %), un bonus régional aligné sur les taux de couverture ARCEP T4 2024 par région, un bonus urbain pour les 30 plus grandes villes (densité FTTH systématique) et une pénalité quand le département figure dans la liste ARCEP « zones peu denses non rentables » historiquement défaillantes — Creuse, Cantal, Lozère, Hautes-Alpes, Aveyron, Ariège, Gers, Haute-Loire, Vosges, Meuse, Haute-Marne, Corrèze, Alpes-de-Haute-Provence. Une commune peut figurer ici par effet de densité seule (DROM dispersés, Corse rurale), par effet de département peu dense seul, ou — c'est le pire des cas — par cumul des deux.",
    methodology:
      "Severity = (10 − internetScore) × 1,6 + 0,6 si population < 10 000 hab. + 0,4 si remoteWork seed ≤ 4/10. Filtre : internetScore ≤ 5/10, severity ≥ 6/10. Sources sous-jacentes : ARCEP « Observatoire du marché des communications électroniques » T4 2024 (taux de locaux raccordables FTTH par région), zones peu denses non rentables ARCEP, scores seed propriétaire. Caveat : la couverture évolue trimestriellement — un raccordement neuf à 200 m du logement peut changer le ressenti sans changer le score moyen départemental.",
    rank: rankInternetPrecaire,
  },
  {
    slug: "villes-isolement-social",
    title: "Villes où l'on se sent le plus seul",
    metaTitle: "Villes où l'on se sent le plus seul — Isolement 2026",
    metaDescription:
      "Classement 2026 des villes françaises où le lien social est le plus fragile : forte part de ménages d'une personne (Insee) et anonymat des grandes métropoles.",
    emoji: "🫥",
    intro:
      "Sur le papier : « grande ville qui ne dort jamais », vie culturelle foisonnante, des milliers de gens à rencontrer. Dans la réalité, beaucoup de néo-arrivants vivent l'inverse — des semaines sans une vraie conversation, des voisins qu'on ne croise jamais sur le palier, une métropole pleine de monde où l'on reste pourtant un visage anonyme de plus. Le lien social ne se voit pas sur une photo de centre-ville animé.",
    reality:
      "On s'appuie sur le score « lien social », un proxy bâti sur la part de ménages d'une seule personne au niveau départemental (Insee, recensement 2020) : plus cette part grimpe, plus l'isolement résidentiel devient la norme. Selon ce proxy, à Paris plus de la moitié des ménages sont des personnes seules ; les Hauts-de-Seine et les cœurs de métropole (Lyon, Nice) suivent de près. On retient les villes dont le lien social passe sous 6,5/10, puis on amplifie le score par la taille : c'est le paradoxe du « seul au milieu de la foule », où la densité humaine ne crée par elle-même aucune relation. Une grande ville ne vous isole pas mécaniquement, mais elle ne fait rien non plus pour vous intégrer — tout repose sur votre énergie sociale.",
    methodology:
      "Severity = 0,45 × isolement résidentiel (écart au score lien social, borné à lien 3/10) + 0,55 × anonymat lié à la taille (population, plafonnée à 600 000 hab.), clampé à 10/10. Filtre : lien social < 6,5/10, top 12. Proxy v0 : part de ménages d'une personne par département (Insee, recensement 2020), bonus petites communes. À enrichir avec la part de +75 ans isolés, le taux d'adhésion associative (Insee/DJEPVA) et la mobilité résidentielle entrante. Caveat : se sentir seul reste une expérience individuelle — ce classement mesure un terrain de probabilité, pas une fatalité.",
    rank: rankIsolementSocial,
  },
  {
    slug: "villes-pauvres-en-sport",
    title: "Villes où la pratique sportive régulière reste compliquée",
    metaTitle: "Villes pauvres en sport 2026 — Pratique régulière compliquée",
    metaDescription:
      "Classement 2026 des villes ≥ 15 000 hab. au composite sport & loisirs ≤ 4,5/10 : peu d'équipements municipaux, tissu associatif fragile, cadre outdoor limité. Sources INJEP/RES + DRAJES + Météo-France.",
    emoji: "🏟️",
    intro:
      "Le discours municipal vante les « équipements rénovés », la plaquette met en avant une photo de stade ou de piscine. Sur le terrain, le même quotidien ressemble à : un seul gymnase scolaire ouvert au public, une piscine couverte intercommunale à 18 km, un club de tennis qui ne prend plus d'inscriptions, et le créneau cardio du mardi soir à six mois d'attente. Faire du sport régulièrement y devient une logistique permanente, pas une habitude. Les profils les plus pénalisés : familles qui veulent inscrire deux enfants à deux disciplines, jeunes actifs sans voiture, retraités qui cherchent un encadrement médicalisé.",
    reality:
      "On classe les villes ≥ 15 000 hab. dont le composite sport (équipements RES + cadre outdoor + tissu associatif + climat propice) tombe ≤ 4,5/10. La convention est positive : 10 = excellent pour la pratique, donc faible = pire. Bonus +1,2 quand équipements ET clubs sont tous deux ≤ 4 — combo bloquant où ni l'offre municipale ni le tissu associatif ne tiennent. Bonus +0,4 quand le cadre outdoor est lui aussi limité (≤ 4), c'est-à-dire quand la nature ne sauve même pas la sortie footing. On retrouve massivement les petites sous-préfectures rurales en déprise (Creuse, Cantal, Lozère, Indre), les bassins industriels en reconversion sans relance sportive, et les communes péri-urbaines sans massif forestier ni façade naturelle proche.",
    methodology:
      "Severity = (5 − composite) × 2 + 1,2 si équipements ET clubs ≤ 4 + 0,4 si outdoor ≤ 4, clampé à 10/10. Pondération du composite : équipements 35 % · cadre outdoor 30 % · vie associative 20 % · climat 15 %. Sources sous-jacentes : RES INJEP (Recensement des Équipements Sportifs, sports.gouv.fr) pour piscines / stades / gymnases, DRAJES/DDETSPP pour le maillage clubs et licenciés, IGN + Météo-France pour relief et climatologie 1991-2020, FFRandonnée pour la densité GR/PR. Caveat : un nouvel équipement intercommunal mis en service après 2024 peut faire bouger la note d'une commune sans changer la moyenne départementale du seed.",
    rank: rankPauvreEnSport,
  },
  {
    slug: "villes-fiscalite-lourde",
    title: "Villes à la fiscalité immobilière la plus lourde",
    metaTitle: "Fiscalité lourde 2026 — Villes au foncier le plus pesant",
    metaDescription:
      "Classement 2026 des villes françaises où la fiscalité immobilière pèse le plus : taxe foncière élevée, zone tendue (THRS), base cadastrale tirée par le prix au m². Source DGFiP / OFL.",
    emoji: "🧾",
    intro:
      "L'annonce vante le quartier qui monte, le bien rare, le prix au m² « encore raisonnable ». Personne ne sort le dernier avis de taxe foncière du vendeur, ni ne mentionne que la commune est en zone tendue (THRS majoration jusqu'à +60 % depuis 2023), ni que les DMTO ajouteront près de 6 % au prix d'achat le jour de la signature. La fiscalité immobilière ne se voit pas sur la plaquette — elle se découvre sur le premier appel de taxe foncière, six mois après l'emménagement.",
    reality:
      "On classe les villes dont le département figure en tier `élevée` ou `très élevée` selon `lib/fiscalité` (DGFiP / Observatoire des finances locales 2024), Paris incluse comme cas particulier. On amplifie par le prix d'achat médian au m² (DVF / observatoires loyer 2024) — un taux élevé sur une base cadastrale faible reste supportable, c'est la combinaison « taux élevé + base élevée » qui plombe vraiment le primo-accédant. Bonus de gravité quand la commune est en zone tendue (THRS majoration disponible) et quand la densité urbaine tire les bases cadastrales vers le haut. Toutes les villes affichées dépassent 6,5/10 de severity composite.",
    methodology:
      "Severity = base tier (`élevée` 6 / `très élevée` 8 / Paris 7,5) + bonus prix (3 000 €/m² → 0, 6 000 €/m² → +2) + 0,8 si zone tendue + max(0 ; log₁₀(pop/50 000) × 1,05) plafonné à +1,5. Clampé à 10/10, filtré à severity ≥ 6,5. Sources : DGFiP cahiers OFL 2024 (taux moyens taxe foncière par dépt), décrets zone tendue 2023 (THRS), DVF + observatoires loyer 2024 (prix au m²), INSEE (population). Caveat : la taxe foncière communale varie de ±30 % autour de la moyenne dépt — vérifier impérativement l'avis du vendeur.",
    rank: rankFiscaliteLourde,
  },
  {
    slug: "villes-desert-culturel",
    title: "Villes où l'offre culturelle reste maigre",
    metaTitle: "Désert culturel 2026 — Villes à l'offre limitée",
    metaDescription:
      "Classement 2026 des villes ≥ 15 000 hab. au score culture ≤ 4,5/10 : peu de scènes labellisées, cinémas d'art et essai rares, médiathèque municipale tendue. Sources DEPS-MC + BNF.",
    emoji: "🎭",
    intro:
      "Sur la plaquette, on parle de « centre-ville vivant » et d'une photo de festival annuel. Dans la réalité du quotidien, le même contour donne : un seul cinéma multiplexe qui programme la même affiche que partout, pas de scène nationale labellisée, une médiathèque ouverte quatre jours par semaine, et la programmation culturelle estivale réduite à deux concerts gratuits sur la place du marché. Pour le profil urbain qui aime sortir, lire, voir une exposition un dimanche pluvieux, la ville devient rapidement un déplacement obligatoire à 80 kilomètres de chez soi.",
    reality:
      "On classe les villes ≥ 15 000 hab. dont le score culture du seed tombe ≤ 4,5/10. La convention est positive : 10 = excellent pour l'offre culturelle, donc faible = pire. On amplifie le score quand la médiathèque municipale (via `computePublicServices`, convention 10 = pire) est elle-même fragile — combo bloquant où ni la scène culturelle ni l'investissement public lecture ne tiennent. Bonus quand aucun character-tag culturel (culturel, patrimoine, étudiant, festival, bohème, historique) ne ressort du seed : la commune n'affiche même pas la culture comme vocation. Bonus supplémentaire quand le score transport est lui aussi ≤ 4 (sortir hors ville coûte du temps et de l'argent — l'isolement culturel se cumule avec l'isolement modal). On retrouve massivement les sous-préfectures industrielles en reconversion, les villes péri-urbaines satellites sans politique culturelle propre, et les communes côtières qui vivent la saison touristique mais pas le reste de l'année.",
    methodology:
      "Severity = (5 − culture seed) × 2 + 1,4 si médiathèque ≥ 7/10 (ou +0,8 si médiathèque ≥ 5/10) + 0,5 si aucun tag culturel (culturel / patrimoine / étudiant / festival / bohème / historique) + 0,6 si transport seed ≤ 4 + 0,5 si population 30 000-80 000 hab. (taille où une scène labellisée et un cinéma indépendant deviennent attendus). Clampé à 10/10, filtré à severity ≥ 6. Sources sous-jacentes : DEPS-MC (Département des études, de la prospective et des statistiques du ministère de la Culture) pour les labels scènes nationales / SMAC / centres dramatiques, BNF observatoire 2024 pour les médiathèques, CNC pour le maillage cinéma art et essai, character-tags du seed propriétaire (vocations affichées). Caveat : la culture associative (MJC, ciné-clubs, festivals citoyens) ne remonte pas systématiquement dans les nomenclatures — une ville en saisie peut avoir une vraie scène alternative non labellisée.",
    rank: rankDesertCulturel,
  },
  {
    slug: "villes-sans-enseignement-superieur",
    title: "Villes où les enfants devront partir étudier ailleurs",
    metaTitle: "Sans enseignement supérieur 2026 — Top 12 villes ≥ 30k hab.",
    metaDescription:
      "Classement 2026 des villes ≥ 30 000 hab. sans université, école d'ingénieur, école de commerce ni Sciences Po. Source MESR / CGE 2024.",
    emoji: "🎓",
    intro:
      "L'agence vante le calme, la maison de ville accessible, l'école primaire à 200 m, le collège à 1 km. Personne ne projette le scénario à 8 ans : un bachelier qui veut une licence universitaire ou une école d'ingénieur n'aura aucune option sur place. Il faudra trouver une chambre étudiante à Lyon, Toulouse ou Rennes, financer un loyer en plus du foyer parental, et la trajectoire familiale bascule. L'absence d'enseignement supérieur ne se voit pas sur une plaquette immobilière — elle se découvre quand le premier ado arrive en terminale et que les portes ouvertes se font toutes à 100 km.",
    reality:
      "On classe les villes ≥ 30 000 habitants dont l'offre post-bac, telle que documentée par la curation MESR / CPU / Conférence des grandes écoles, reste rachitique : ni université ancrée (un vrai campus avec offre disciplinaire), ni école d'ingénieur, ni école de commerce, ni Sciences Po, ni CPGE notable. Une simple antenne universitaire (campus délocalisé, IUT seul, antenne de quelques licences) compte pour moitié — la densité d'offre n'est pas la même qu'un campus complet, et un étudiant qui veut un master spécialisé devra partir de toute façon. On retrouve massivement des préfectures de département moyennes, des sous-préfectures industrielles en reconversion, des stations balnéaires habitées toute l'année, et des satellites péri-urbains qui n'ont jamais investi dans leur propre offre supérieure.",
    methodology:
      "Severity = base 5 (≥ 30 000 hab. sans offre réelle) + 2,0 si aucune dimension présente / +0,9 si une seule dimension faible (CPGE ou commerce isolée) + bonus taille (≥ 70k +1,5 / ≥ 50k +1,0 / ≥ 40k +0,5) + 0,4 si culture seed ≤ 5/10 + 0,3 si remoteWork seed ≤ 5/10. Présence pondérée : université ancrée = 2, antenne universitaire = 1, école d'ingénieur = 1,5, CPGE / commerce / IEP = 1, école d'art = 0,5. Filtre : population ≥ 30 000 hab., présence ≤ 1,5, severity ≥ 6. Sources : curation MESR (Ministère de l'Enseignement Supérieur et de la Recherche), CPU (Conférence des présidents d'université), Conférence des grandes écoles (CGE 2024), seed propriétaire (culture, remoteWork). Caveat : un IUT seul ou un BTS public ne suffit pas — l'indicateur cible le décrochage licence/master/grande école, pas le bac+2 technologique généralement disponible.",
    rank: rankSansEnseignementSuperieur,
  },
  {
    slug: "villes-vols-cambriolages",
    title: "Villes où cambriolages et vols de véhicules pèsent au quotidien",
    metaTitle: "Vols & cambriolages 2026 — Villes les plus touchées",
    metaDescription:
      "Classement 2026 des villes ≥ 30 000 hab. où le sous-score « atteintes aux biens » dépasse 6,5/10 : cambriolages, vols de véhicules, dégradations volontaires. Source SSMSI.",
    emoji: "🔓",
    intro:
      "Le score safety global dit « ville moyenne » et l'annonce immobilière vante la rue résidentielle, le parking sécurisé, l'alarme incluse. Sur le terrain : voiture retrouvée fracturée le mardi matin, cave du logement collectif visitée, scooter du voisin volé deux fois en six mois, et la même conversation chez le carreleur la troisième fois qu'on remplace une vitre arrière. Les atteintes aux biens — cambriolages, vols véhicules, dégradations — ne tuent pas, mais elles érodent la vie quotidienne et le portefeuille avec une régularité qui n'apparaît jamais sur une plaquette.",
    reality:
      "On isole le sous-score `property` de `lib/safety-deep` — la dimension qui pèse 35 % du composite safety et regroupe cambriolages d'habitation, vols et tentatives de vols de véhicules, vols dans véhicule et dégradations volontaires SSMSI. On retient les villes ≥ 30 000 hab. dont ce sous-score dépasse 6,5/10. Bonus de gravité quand les atteintes aux personnes corroborent (un signal isolé peut tenir à un fait divers ; un cumul biens + personnes ≥ 6 trahit une réalité de bassin). Bonus quand la commune est une grande métropole avec un score global ≥ 6,5/10 — la « belle vitrine » désirable qui dissimule un fond de cambriolages chronique. Bonus enfin quand la ville est explicitement touristique > 30 000 hab. : saturation saisonnière des effractions sur résidences secondaires et véhicules de location, particulièrement documentée sur la façade méditerranéenne et le littoral atlantique.",
    methodology:
      "Severity = sous-score property + 0,8 si personnes ≥ 6/10 + 0,5 si métropole avec score global ≥ 6,5 + 0,4 si touristique > 30 000 hab. Pondération du composite safety-deep : biens 35 % · personnes 30 % · nocturne 20 % · violences sexistes 15 %. Sources sous-jacentes : SSMSI (Service statistique ministériel de la sécurité intérieure, interstats.fr — séries communales atteintes aux biens), Insee population, character-tags du seed propriétaire (vocation métropole / touristique). Caveat : un taux élevé peut refléter à la fois une vraie pression et un meilleur taux de plainte ; les vols de vélos en libre-service ne sont pas comptés dans le périmètre SSMSI standard.",
    rank: rankVolsCambriolages,
  },
  {
    slug: "villes-erosion-cotiere",
    title: "Villes en péril côtier — érosion littorale & submersion marine",
    metaTitle: "Érosion côtière 2026 — Villes du littoral les plus exposées",
    metaDescription:
      "Classement 2026 des villes du littoral français les plus exposées au recul du trait de côte : érosion, falaise, submersion. Sources BRGM TRAIT + GIEC AR6.",
    emoji: "🌊",
    intro:
      "L'annonce vend la vue mer, la plage à 200 m, la dune qui protège du vent. Personne ne ressort la photo aérienne de 1950 : des villas alignées là où s'étend aujourd'hui un terrain nu à 80 m du bord. Des blockhaus de la Seconde Guerre engloutis à chaque marée haute. La falaise d'Étretat qui perd 20 cm chaque année. Le recul du trait de côte ne se lit pas sur une plaquette prise à marée basse en juillet ; il se découvre dans l'État des Risques annexé à l'acte — ou pire, un matin d'hiver, quand la mer touche le jardin pour la première fois.",
    reality:
      "Le classement retient les communes des départements littoraux métropolitains (Atlantique, Méditerranée, Manche, Mer du Nord) et DROM, à moins de 25 m d'altitude, dotées d'un tag character explicitement côtier (plage, balnéaire, dune, port, littoral, atlantique, méditerranée, manche, golfe, étang, lagune). Le filtre tag écarte volontairement les arrière-pays d'un département pourtant maritime — hyper-centre de Bayonne, Aubagne, vieille ville de Toulon — parce que l'érosion se joue au ras de la mer, pas en moyenne départementale. La façade Atlantique sableuse, d'Aquitaine à la Vendée, concentre les reculs les plus rapides documentés par BRGM TRAIT : 1 à 5 m/an localement à Soulac, Lacanau, La Faute-sur-Mer. La Camargue et les étangs languedociens cumulent altitude < 5 m et submersion marine récurrente. La côte d'Albâtre, elle, voit ses falaises de craie s'effacer de 20 cm/an. Rien de symétrique entre les façades : tout dépend du substrat (sable, craie, granite), de la manière dont le cordon dunaire a été urbanisé, et de la fréquence des tempêtes hivernales (Xynthia 2010, Klaus 2009).",
    methodology:
      "Severity = 0,5 × facteur altitude (25 m → 0, 0 m → 10) + 0,25 × score inondation `lib/natural-risks` (corroboration) + malus de façade (Aquitaine sableuse / Vendée / Charente-Maritime +1,7 ; Hérault / Aude / Gard bas méditerranéens +1,5 ; DROM +1,4 ; reste façade Atlantique +1,2 ; Méditerranée littorale +1,0 ; Nord Opale +1,0) + bonus tag explicite (station-balnéaire +0,4 ; dune +0,5) + bonus enjeu population (≥ 50 000 hab. +0,5 ; ≥ 20 000 hab. +0,3). Clampé à 10/10, filtré à severity ≥ 5. Sources sous-jacentes : observatoire BRGM TRAIT 2023 (Indicateur national de l'érosion côtière, prim.net), liste réglementaire des communes exposées au recul du trait de côte (article L. 321-15 Code de l'environnement, décret 2022-750 modifié 2024 — environ 320 communes inscrites), ONERC (rapport annuel 2024), GIEC AR6 WGII (élévation du niveau marin de +0,3 à +1,0 m d'ici 2100 selon scénario SSP1-2.6 à SSP5-8.5). Caveat : le recul du trait de côte évolue trimestriellement — un rechargement de plage en 2024 (Lacanau, Soulac) peut temporairement masquer une dynamique de fond. Vérifier impérativement le PPRL local et l'État des Risques (ERP) avant tout achat de bien littoral.",
    rank: rankErosionCotiere,
  },
  {
    slug: "villes-chauffage-hivernal-couteux",
    title: "Villes où le chauffage hivernal pèse le plus sur le salaire local",
    metaTitle: "Chauffage hivernal coûteux 2026 — Précarité énergétique latente",
    metaDescription:
      "Classement 2026 des villes françaises où la facture chauffage T2 (ADEME) pèse le plus dans le salaire net médian départemental. Zone climatique, altitude, salaire INSEE.",
    emoji: "🥶",
    intro:
      "L'agence vante la cheminée, le radiateur en fonte, la « belle hauteur sous plafond ». Personne ne sort la dernière facture EDF du vendeur, ni ne mentionne que le département est en zone climatique H1a-b-c (ADEME), que l'altitude rallonge la saison de chauffe d'un mois, et que le salaire médian local rend cette facture insoutenable sept mois sur douze. La précarité énergétique ne se voit pas sur la photo immobilière prise en mai — elle se découvre à la première relève de compteur en février, quand le prélèvement automatique dépasse le rappel de loyer.",
    reality:
      "On calcule pour chaque ville la facture mensuelle moyenne de chauffage d'un T2 (~45 m²) à partir des références ADEME 2024 par zone climatique RT2012 — 95 €/mois en H1a (Nord-Est continental), 90 €/mois en H1b (Lorraine, Vosges, Marne), 80 €/mois en H1c (Île-de-France, Massif Central nord) — corrigée à la hausse pour l'altitude (+12 € au-delà de 400 m, +25 € au-delà de 700 m, +40 € au-delà de 1 200 m, alignement ADEME consommation surface chauffée). On rapporte ensuite cette facture au salaire net médian départemental (INSEE DADS, proxy v0) pour obtenir le ratio « part du salaire qui part en chauffage ». L'Observatoire national de la précarité énergétique fixe à 8 % du revenu disponible le seuil de précarité pour la facture énergie globale — le chauffage à lui seul, selon l'ADEME, en représente 60-70 %, soit un seuil proxy de 5,5 % du salaire pour le poste « chauffer son logement ». Toutes les villes affichées dépassent ce seuil, certaines approchent les 7-8 %, et la corrélation avec les départements en salaire net médian bas (Creuse, Cantal, Lozère, Vosges, Haute-Marne) ou en altitude marquée (Briançonnais, Vercors, Pyrénées habitées) saute aux yeux.",
    methodology:
      "Severity = normSeverity(ratio chauffage/salaire × 100, 3 → 0, 6 → 10) + 0,5 si population < 30 000 hab. (parc ancien fioul/électrique direct) + 0,4 si température moyenne janvier ≤ 1,5 °C en plaine (consigne chauffe maintenue plus longtemps). Filtre : zone climatique connue (DROM exclus, hors périmètre ADEME RT2012), ratioFactor ≥ 4,5/10, severity ≥ 6/10. Pondération facture par zone (ADEME 2024) : H1a 95 € · H1b 90 € · H1c 80 € · H2a 65 € · H2b 60 € · H2c 55 € · H2d 70 € · H3 40 €. Bonus altitude : ≥ 400 m +12 € · ≥ 700 m +25 € · ≥ 1 200 m +40 € (saison de chauffe étendue, consommation surface chauffée majorée). Salaire dept proxy v0 dérivé du score employment-market (Paris/petite couronne ≈ 2 500 € · bonnes métropoles 2 200 € · médiane nationale 2 050 € · bas 1 900 € · très bas 1 750 €). Sources : ADEME 2024 (coût moyen mensuel chauffage par zone climatique RT2012), arrêté ministériel 28/12/2012 (zonage thermique), INSEE DADS 2023 (salaire net médian dept), ONPE (Observatoire national de la précarité énergétique). Caveat : la facture réelle dépend du DPE du logement (un G consomme 4 à 5 fois plus qu'un C), du mix énergétique (un fioul à 2 200 €/an + entretien chaudière contre un gaz collectif à 850 €/an), du comportement (T° de consigne) et du tarif réglementé en vigueur — vérifier impérativement la dernière facture du vendeur ou du locataire sortant avant signature.",
    rank: rankChauffageHivernalCouteux,
  },
  {
    slug: "villes-climat-2040-deteriore",
    title: "Villes au climat 2040 le plus dégradé — projection ARPEGE",
    metaTitle: "Climat 2040 dégradé 2026 — Villes les plus exposées",
    metaDescription:
      "Classement 2026 des villes ≥ 15 000 hab. dont la projection 2040 cumule hausse de juillet, jours > 30 °C et nuits tropicales. Source Météo-France ARPEGE.",
    emoji: "🌡️",
    intro:
      "L'annonce immobilière vante le climat d'aujourd'hui — étés tempérés, nuits agréables, jardin verdoyant. Sur l'horizon d'un crédit sur 20 ans, le climat de la ville aura déjà changé : la moyenne de juillet pourrait grimper de 2 °C, les jours > 30 °C doubler, les nuits tropicales devenir banales. Acheter en 2026, c'est habiter dans la projection 2040 — pas dans la photo de l'agence prise en mai dernier.",
    reality:
      "On classe les villes ≥ 15 000 habitants dont la projection climatique 2040 (lib/climate-2040, deltas ARPEGE par macro-région) cumule trois signaux : hausse marquée de juillet, jours > 30 °C estimés en 2040, nuits tropicales (> 20 °C) projetées. La différence avec villes-belles-invivables-ete (qui regarde le climat actuel 1991-2020) est temporelle : ici, le couloir rhodanien, le Sud-Ouest, la Corse, l'arrière-pays méditerranéen et l'Île-de-France interne s'imposent — pas seulement le pourtour méditerranéen. Bonus de gravité quand jours ET nuits dépassent 7/10 (climat estival doublement dégradé, climatisation devenue nécessité) ou quand la commune est balnéaire / thermale (saturation touristique estivale amplifiée par la chaleur).",
    methodology:
      "Severity = 0,25 × facteur hausse juillet (1,5 °C → 0, 2,6 °C → 10) + 0,38 × facteur jours > 30 °C (25 → 0, 75 → 10) + 0,37 × facteur nuits tropicales (12 → 0, 65 → 10) + 1,0 si jours ET nuits ≥ 7/10 + 0,3 si tag saisonnier (balnéaire / station / thermalisme / tourisme). Clampé à 10/10, filtré à severity ≥ 6 et population ≥ 15 000 hab. Sources sous-jacentes : Météo-France ARPEGE (deltas RCP4.5/8.5 par macro-région climatique 2040 vs normales 1991-2020), seed propriétaire (avgTempJuly, latitude, longitude, region, population). Caveat : les modèles climatiques régionaux ont une incertitude de ±0,5 °C ; la projection est indicative et exclut les effets locaux d'îlot de chaleur urbain (qui peuvent ajouter 1-3 °C à Paris, Lyon, Toulouse). Vérifier le rapport Drias 2020 pour le détail au niveau communal.",
    rank: rankClimat2040Deteriore,
  },
  {
    slug: "villes-deficit-soleil-hiver",
    title: "Villes en déficit chronique de soleil l'hiver",
    metaTitle: "Déficit de soleil hivernal 2026 — Top 12 villes les plus sombres",
    metaDescription:
      "Classement 2026 des villes françaises au-dessus du 45,5e parallèle avec ≤ 1 950 h de soleil/an : Bretagne, Normandie, Hauts-de-France, Lorraine. Insolation, latitude, janvier.",
    emoji: "☁️",
    intro:
      "L'annonce vante la maison de ville, le jardin, la mer ou la campagne à 10 minutes — photos prises en juillet, à 19 h, ciel dégagé. Personne ne mentionne que de novembre à février, le jour se lève à 8 h 45 et baisse à 17 h, que les couches nuageuses océaniques ou continentales s'installent durablement, et qu'une vraie journée ensoleillée devient un événement qu'on attend deux semaines. Le déficit de lumière hivernale ne se voit pas sur une plaquette immobilière prise au printemps — il se découvre au premier hiver, quand le télétravailleur s'aperçoit qu'il quitte son bureau à 17 h dans l'obscurité, ou quand le retraité réalise qu'il n'a pas vu le soleil de la semaine.",
    reality:
      "On classe les villes au cumul annuel d'insolation ≤ 1 950 h (sous la médiane métropolitaine d'environ 2 000 h, Météo-France normales 1991-2020) ET situées au-dessus du 45,5e parallèle, où le raccourcissement du jour autour du solstice devient sensible (à 51° N — Dunkerque, Calais, Lille — le 21 décembre donne 7 h 50 de jour utile contre 9 h 00 à 45,5° N). La différence avec `villes-hiver-rude` est nette : ce thème-ci se déclenche dès que la lumière manque, indépendamment de la température. On y retrouve donc les communes océaniques aux hivers doux (Brest, Cherbourg, Saint-Brieuc, Quimper) — invisibles dans `hiver-rude` parce que leur janvier reste tiède (5-7 °C) mais où le ciel reste bouché 200 jours par an — aux côtés des plaines continentales nordiques (Lille, Reims, Strasbourg, Metz) où grisaille et froid se cumulent. La distinction compte pour les profils sensibles au trouble affectif saisonnier (TAS) : ce qui pèse, ce n'est pas la température, c'est l'absence prolongée de lumière. Bonus de gravité quand insolation faible et latitude élevée concordent (cumul typique des dépressions hivernales prolongées du Nord et du Nord-Est), bonus supplémentaire quand le janvier descend sous 4 °C (chauffage continu, sortie courte, exposition réduite au peu de lumière disponible).",
    methodology:
      "Severity = 0,5 × facteur grisaille (1 950 h → 0, 1 450 h → 10) + 0,45 × facteur latitude (45,5° → 0, 51° → 10) + 0,9 si grisaille ET latitude ≥ 6/10 cumulés + 0,5 si janvier < 4 °C. Clampé à 10/10, filtré à severity ≥ 6, latitude ≥ 45,5° N, insolation ≤ 1 950 h/an. Conversion en jours-équivalents : insolation annuelle ÷ 9,5 (proxy d'une journée pleinement ensoleillée). Sources sous-jacentes : Météo-France normales climatiques 1991-2020 (cumul d'insolation par station, station de référence départementale), seed propriétaire (latitude, avgTempJanuary). Caveat : le cumul annuel masque la répartition saisonnière — une ville à 1 700 h dont 80 % tombent entre avril et septembre est plus dure à vivre l'hiver qu'une ville à 1 750 h mieux répartie. La distance à la station de mesure peut introduire un écart de ±50-100 h pour les communes éloignées d'un point Météo-France. Vérifier les normales locales (donneesclimatiques.meteofrance.com) avant tout déménagement avec sensibilité au TAS connue.",
    rank: rankDeficitSoleilHiver,
  },
  {
    slug: "villes-embouteillages-quotidiens",
    title: "Villes prises dans les embouteillages quotidiens",
    metaTitle: "Embouteillages quotidiens 2026 — Villes bloquées aux pics",
    metaDescription:
      "Classement 2026 des villes françaises ≥ 40 000 hab. bloquées aux heures de pointe : A86, A7, A8, cuvette grenobloise. Score transport + couloirs saturés.",
    emoji: "🚥",
    intro:
      "L'agence immobilière insiste sur les « 15 minutes de la gare » et le « quart d'heure du centre commercial » — chronométrés à 11 h un dimanche de septembre. La réalité de novembre à mars, du lundi au vendredi, entre 7 h 30 et 9 h 15 puis entre 17 h et 19 h 30 : le tuyau sature. La rocade bordelaise passe de 20 à 55 minutes, la A7 lyonnaise se transforme en parking sur 12 km, le tunnel Fourvière avale son bouchon quotidien, l'A86 francilienne accroche à Rueil dès 7 h 40. Les commutateurs perdent 1 h à 1 h 30 par jour de trajet — soit 300 heures par an, l'équivalent de six semaines de travail passées au volant, moteur allumé, dans l'attente que le convoi redémarre. Le prix cognitif (fatigue, irritabilité, sommeil raccourci) et le prix financier (carburant, entretien, péage, dépréciation accélérée) ne figurent nulle part sur l'annonce.",
    reality:
      "Le calcul filtre les villes de plus de 40 000 habitants dont le score transport se situe dans une zone de tension (3,5 à 6,5/10) — c'est-à-dire assez de réseau pour attirer les commutateurs mais pas assez pour absorber le pic aux heures de pointe. On ne retient ensuite que les communes situées dans un couloir routier documenté par les archives Bison Futé 2022-2024 et par les cartes SIREDO (relevés autoroutiers) : couronne francilienne saturée sur A6/A10/A86/A15/A4, Marseille sur A7/A55/A50 et son tunnel du Prado, Lyon sur A6/A7/A46 et Fourvière, Riviera sur A8/A57, frontière genevoise sur A40/A41 (pendulaires vers Genève), rocade bordelaise A630, périphérique nantais N844, rocade toulousaine A620/A621, cuvette grenobloise sur A48/A480, métropole lilloise sur A1/A22. Les grandes villes qui disposent d'un tram fluide et déchargent significativement la route (Strasbourg, Nantes intra-muros, Bordeaux centre) tombent hors périmètre par le plafond du score transport — le classement n'attrape que les nœuds où le pendulaire reste captif de sa voiture.",
    methodology:
      "Severity = 0,35 × facteur transport (6,5 → 0, 3,5 → 10) + 0,25 × facteur population (40 000 → 0, 400 000 → 10) + bonus zonal (couronne IDF +2,2 / Marseille +2,0 / Lyon +1,9 / cuvette grenobloise +1,8 / Riviera +1,7 / frontière Genève +1,7 / Bordeaux +1,5 / Nantes +1,5 / Toulouse +1,5 / Lille +1,2) + 0,5 si le score coût est ≤ 5/10 (bonus commutation longue distance : housing cher → logés en périphérie → trajets plus longs, saturation aux extrémités du bassin). Clampé à 10/10, filtré à severity ≥ 5, transport ∈ [3,5 ; 6,5], population ≥ 40 000 hab., Paris intra-muros exclu (la voiture y est déjà marginale). Sources sous-jacentes : Bison Futé (archives des sections rouges et noires par week-end 2022-2024), Sytadin (Direction des Routes d'Île-de-France, données temps réel autoroutes A1-A15-A86-A104), Cartes SIREDO (Ministère de la Transition écologique, comptages autoroutiers permanents), seed propriétaire (scores.transport, scores.cost, population, department). Caveat : le score transport agrège l'offre TC + walkability OSM et ne mesure pas directement la congestion routière ; on l'utilise ici comme proxy inverse (peu de TC + population élevée + couloir saturé documenté = pression congestion). L'écart intra-communal peut être fort (Vitrolles centre vs zone Fos, Vénissieux Minguettes vs Perrache) — la donnée porte sur la commune entière. Vérifier les cartes de saturation Bison Futé + les temps de trajet Waze/Google réels sur un mardi matin de novembre avant tout achat en couronne péri-urbaine.",
    rank: rankEmbouteillagesQuotidiens,
  },
];

export function getRedFlagTheme(slug: string): RedFlagTheme | undefined {
  return RED_FLAG_THEMES.find((t) => t.slug === slug);
}

export const RED_FLAG_THEME_SLUGS = RED_FLAG_THEMES.map((t) => t.slug);
