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
import { computeQualityOfLife } from "@/lib/quality-of-life-index";
import { householdBreakdownFor } from "@/lib/household-cost";
import { computeCyclingMobility } from "@/lib/cycling-mobility";
import { computeSafetyDeep } from "@/lib/safety-deep";
import { computeDemography } from "@/lib/demography";
import { computePublicServices } from "@/lib/public-services";

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
    const b = householdBreakdownFor(city.slug, "famille");
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
];

export function getRedFlagTheme(slug: string): RedFlagTheme | undefined {
  return RED_FLAG_THEMES.find((t) => t.slug === slug);
}

export const RED_FLAG_THEME_SLUGS = RED_FLAG_THEMES.map((t) => t.slug);
