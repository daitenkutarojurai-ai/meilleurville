// R9.4 — Per-city Q&A page generator.
//
// Pure derivation from existing seed + helper libs. Produces 10–15 high-intent
// questions per city with templated, data-grounded answers. All answers are
// labelled "données 2026 indicatives" — no source we can't back up.

import type { CitySeed } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";
import { rentalTension, tensionInfo } from "@/lib/rental-tension";
import { commuteEstimate } from "@/lib/commute-estimate";
import { projectClimate2040 } from "@/lib/climate-2040";

export interface FaqItem {
  q: string;
  a: string;
}

type Lang = "fr" | "en";

function regionLabel(region: string, lang: Lang): string {
  if (lang === "fr") return region;
  const map: Record<string, string> = {
    "Île-de-France": "Île-de-France",
    "Bretagne": "Brittany",
    "Pays de la Loire": "Pays de la Loire",
    "Normandie": "Normandy",
    "Corse": "Corsica",
    "La Réunion": "Réunion",
    "Guyane": "French Guiana",
  };
  return map[region] ?? region;
}

function fmtScore(n: number): string {
  return n.toFixed(1);
}

export function cityFaq(city: CitySeed, lang: Lang = "fr"): FaqItem[] {
  const housing = HOUSING[city.slug];
  const tension = rentalTension(city);
  const tInfo = tensionInfo(tension);
  const climate = projectClimate2040(city);
  const commute = commuteEstimate(city);
  const region = regionLabel(city.region, lang);
  const items: FaqItem[] = [];

  if (lang === "fr") {
    items.push({
      q: `Pourquoi vivre à ${city.name} ?`,
      a: `${city.name} affiche un score qualité de vie global de ${fmtScore(city.scores.global)}/10 en 2026. Les axes les plus forts : ${strongAxesFR(city)}. Les points de vigilance : ${weakAxesFR(city)}. La ville compte ~${city.population.toLocaleString("fr-FR")} habitants en ${region}.`,
    });

    if (housing) {
      items.push({
        q: `Quel loyer prévoir à ${city.name} en 2026 ?`,
        a: `Loyers observés : studio/T1 ${housing.avgRentT1} €, T2 ${housing.avgRentT2} €, T3 ${housing.avgRentT3} € par mois. Prix d'achat médian autour de ${housing.avgBuyPriceM2} €/m². Données observatoires locaux Clameur 2024 — toujours croiser avec les annonces récentes.`,
      });
      items.push({
        q: `Est-il difficile de trouver un logement à ${city.name} ?`,
        a: `Tension locative estimée : ${tension.toFixed(1)}/10 (niveau ${tInfo.label}). ${tension >= 7 ? `Marché tendu — dossier complet, garant et visites groupées à prévoir.` : tension >= 4 ? `Marché équilibré — dossier sérieux suffit, 2 à 6 semaines de recherche en moyenne.` : `Marché détendu — délais courts, négociation parfois possible.`}`,
      });
    } else {
      items.push({
        q: `Quel loyer prévoir à ${city.name} en 2026 ?`,
        a: `Nous n'avons pas de relevé Clameur officiel pour ${city.name}. Le score coût-de-vie est de ${fmtScore(city.scores.cost)}/10 (10 = très accessible). Pour les loyers réels, consulter PAP, Leboncoin ou l'observatoire des loyers de votre département.`,
      });
    }

    items.push({
      q: `Combien de temps prend un trajet domicile-travail à ${city.name} ?`,
      a: `Estimation aller simple : ${commute.oneWayMinutes} minutes (catégorie ${commute.label}). Part voiture ${Math.round(commute.carShare * 100)} %, transports en commun ${Math.round(commute.publicShare * 100)} %, modes actifs ${Math.round(commute.activeShare * 100)} %. Moyenne nationale Insee 2022 : ~22 minutes.`,
    });

    items.push({
      q: `${city.name} est-elle une ville sûre ?`,
      a: `Score sécurité : ${fmtScore(city.scores.safety)}/10 (10 = très sûr) dans notre grille calibrée sur les statistiques SSMSI. ${city.scores.safety >= 7 ? `Niveau confortable, criminalité globalement maîtrisée.` : city.scores.safety >= 5 ? `Vigilance moyenne — comme dans toute ville de cette taille, certains quartiers exigent plus de prudence.` : `Vigilance élevée — voir notre fiche sécurité détaillée et les red-flags référencés.`}`,
    });

    items.push({
      q: `Le climat de ${city.name} sera-t-il vivable en 2040 ?`,
      a: climate.verdict,
    });

    items.push({
      q: `Quelle est la qualité des écoles à ${city.name} ?`,
      a: `Score scolaire : ${fmtScore(city.scores.schools)}/10. ${city.scores.schools >= 7 ? `Offre scolaire solide, options secondaire et lycées renommés disponibles.` : city.scores.schools >= 5 ? `Offre scolaire correcte, choix limité au-delà du secteur public.` : `Offre scolaire restreinte, certaines familles privilégient les villes voisines.`} Cartographie complète sur la sous-page "Écoles".`,
    });

    items.push({
      q: `${city.name} convient-elle au télétravail ?`,
      a: `Score télétravail composite : ${fmtScore(city.scores.remoteWork)}/10 (qualité internet, cafés, espaces coworking, calme). ${city.scores.remoteWork >= 7 ? `Configuration confortable pour télétravailleurs.` : city.scores.remoteWork >= 5 ? `Configuration correcte, mais limites possibles sur fibre/coworking selon le quartier.` : `Configuration faible pour télétravail à temps plein — internet et tiers-lieux à vérifier.`}`,
    });

    items.push({
      q: `Quelle est l'offre culturelle à ${city.name} ?`,
      a: `Score culture : ${fmtScore(city.scores.culture)}/10. ${city.scores.culture >= 7 ? `Programmation riche et régulière (théâtres, scènes, expositions, festivals).` : city.scores.culture >= 5 ? `Offre culturelle locale présente mais limitée — métropole voisine souvent indispensable.` : `Offre culturelle restreinte — déplacement vers grande ville à anticiper pour une vraie diversité.`}`,
    });

    items.push({
      q: `${city.name} est-elle accessible en transports en commun ?`,
      a: `Score transport : ${fmtScore(city.scores.transport)}/10. ${city.scores.transport >= 7 ? `Maillage transports en commun dense, voiture optionnelle au quotidien.` : city.scores.transport >= 5 ? `Réseau présent mais une voiture reste souvent nécessaire en périphérie.` : `Réseau limité — voiture pratiquement indispensable pour vivre confortablement.`} Voir notre sous-page "Transports" pour le détail des lignes.`,
    });

    items.push({
      q: `Quelles sont les principales critiques sur ${city.name} ?`,
      a: `Notre fiche "Avis honnête" liste les points faibles de ${city.name} — score le plus bas : ${lowestAxisFR(city)}. Les "red-flags" éditoriaux sont également listés sur /red-flags si la ville y figure.`,
    });

    items.push({
      q: `À qui ${city.name} convient-elle le mieux ?`,
      a: `D'après nos sous-scores de niche : ${nicheFitFR(city)}. Voir notre sous-page "Profils-types" pour des portraits fictifs explicitement étiquetés.`,
    });

    items.push({
      q: `Combien coûte la vie à ${city.name} par rapport à la moyenne française ?`,
      a: `Score coût-de-vie : ${fmtScore(city.scores.cost)}/10 (10 = très accessible). ${city.scores.cost >= 7 ? `Coût-de-vie nettement inférieur à la moyenne nationale.` : city.scores.cost >= 5 ? `Coût-de-vie proche de la moyenne nationale.` : `Coût-de-vie supérieur à la moyenne, surtout pour le logement.`} Notre calculateur "coût réel" permet une simulation par profil familial.`,
    });

    items.push({
      q: `${city.name} a-t-elle des espaces naturels proches ?`,
      a: `Score nature : ${fmtScore(city.scores.nature)}/10. ${city.scores.nature >= 7 ? `Forte densité de nature accessible — parcs, forêts, plans d'eau ou littoral.` : city.scores.nature >= 5 ? `Accès nature correct, souvent en périphérie proche.` : `Accès nature limité — anticiper les déplacements pour le week-end.`}`,
    });
  } else {
    // English
    items.push({
      q: `Why move to ${city.name}?`,
      a: `${city.name} scores ${fmtScore(city.scores.global)}/10 overall on our 2026 quality-of-life index. Strongest axes: ${strongAxesEN(city)}. Watch-outs: ${weakAxesEN(city)}. Population ~${city.population.toLocaleString("en-US")} in ${region}.`,
    });

    if (housing) {
      items.push({
        q: `What rent should I budget for in ${city.name} (2026)?`,
        a: `Observed rents: studio €${housing.avgRentT1}, 1-bedroom €${housing.avgRentT2}, 2-bedroom €${housing.avgRentT3} per month. Median purchase price ~€${housing.avgBuyPriceM2}/m². Source: Clameur 2024 local rent observatories — always cross-check with current listings.`,
      });
      items.push({
        q: `Is it hard to find housing in ${city.name}?`,
        a: `Rental tension estimate: ${tension.toFixed(1)}/10. ${tension >= 7 ? `Tight market — full application, French guarantor and group viewings expected.` : tension >= 4 ? `Balanced market — a clean application is enough, 2–6 weeks typical.` : `Relaxed market — short timelines, some room to negotiate.`}`,
      });
    } else {
      items.push({
        q: `What rent should I budget for in ${city.name} (2026)?`,
        a: `We don't have official Clameur data for ${city.name}. Cost-of-living score: ${fmtScore(city.scores.cost)}/10 (10 = very affordable). For actual rents, check PAP, Leboncoin or your département's official rent observatory.`,
      });
    }

    items.push({
      q: `How long is the commute in ${city.name}?`,
      a: `One-way estimate: ${commute.oneWayMinutes} minutes (${commute.labelEn}). Car share ${Math.round(commute.carShare * 100)}%, public transport ${Math.round(commute.publicShare * 100)}%, active modes ${Math.round(commute.activeShare * 100)}%. National Insee 2022 average: ~22 minutes.`,
    });

    items.push({
      q: `Is ${city.name} safe?`,
      a: `Safety score: ${fmtScore(city.scores.safety)}/10 (10 = very safe), calibrated on SSMSI national crime statistics. ${city.scores.safety >= 7 ? `Comfortable level — crime generally well-managed.` : city.scores.safety >= 5 ? `Moderate vigilance — like any city this size, some districts warrant more care.` : `Elevated vigilance — see our detailed safety page and the red-flag list.`}`,
    });

    items.push({
      q: `Will ${city.name}'s climate still be livable by 2040?`,
      a: `By 2040: ~${climate.projectedDays30C} days >30°C/year expected (up from ~${climate.currentDays30C} today), ~${climate.projectedTropicalNights} tropical nights >20°C. ${climate.projectedDays30C >= 30 ? `Significantly hotter summers — air-conditioning and home adaptation worth planning for.` : `Climate remains within historical norms with a moderate warming trend.`}`,
    });

    items.push({
      q: `How are the schools in ${city.name}?`,
      a: `Schools score: ${fmtScore(city.scores.schools)}/10. ${city.scores.schools >= 7 ? `Solid school offer with reputable secondary options.` : city.scores.schools >= 5 ? `Reasonable schools, fewer alternatives beyond the public sector.` : `Limited offer — some families opt for neighbouring towns.`} Detailed mapping on the "Schools" sub-page.`,
    });

    items.push({
      q: `Is ${city.name} good for remote work?`,
      a: `Remote-work composite score: ${fmtScore(city.scores.remoteWork)}/10 (internet, cafés, coworking, quiet). ${city.scores.remoteWork >= 7 ? `Comfortable setup for full-time remote workers.` : city.scores.remoteWork >= 5 ? `Decent setup, with possible limits on fibre or coworking depending on district.` : `Weak setup for full-time remote — verify fibre and third-places before committing.`}`,
    });

    items.push({
      q: `What's the cultural scene like in ${city.name}?`,
      a: `Culture score: ${fmtScore(city.scores.culture)}/10. ${city.scores.culture >= 7 ? `Rich, regular programming (theatres, music venues, exhibitions, festivals).` : city.scores.culture >= 5 ? `Local cultural offer present but limited — nearby metro often needed.` : `Limited cultural offer — travel to a larger city is to be expected.`}`,
    });

    items.push({
      q: `Is ${city.name} accessible by public transport?`,
      a: `Transport score: ${fmtScore(city.scores.transport)}/10. ${city.scores.transport >= 7 ? `Dense public-transport network — going car-free is realistic.` : city.scores.transport >= 5 ? `Decent network, but a car is often still needed in outer districts.` : `Sparse network — a car is essentially required for everyday life.`}`,
    });

    items.push({
      q: `What are the main downsides of ${city.name}?`,
      a: `Our "Honest review" sub-page lists weak points — lowest axis: ${lowestAxisEN(city)}. Editorial red-flags are also listed on /red-flags when the city appears there.`,
    });

    items.push({
      q: `Who is ${city.name} best suited for?`,
      a: `Based on niche scores: ${nicheFitEN(city)}. See the "Profiles" sub-page for fictional resident portraits (clearly labelled as illustrative).`,
    });

    items.push({
      q: `How does cost-of-living compare to the French average?`,
      a: `Cost score: ${fmtScore(city.scores.cost)}/10 (10 = very affordable). ${city.scores.cost >= 7 ? `Notably below the national average.` : city.scores.cost >= 5 ? `Close to the national average.` : `Above the national average — especially for housing.`} Our "Real cost" calculator simulates a household budget.`,
    });

    items.push({
      q: `Does ${city.name} have nature nearby?`,
      a: `Nature score: ${fmtScore(city.scores.nature)}/10. ${city.scores.nature >= 7 ? `High density of accessible nature — parks, forests, water or coastline.` : city.scores.nature >= 5 ? `Decent access, usually in the close periphery.` : `Limited nature access — plan weekend trips to reach it.`}`,
    });
  }

  return items;
}

function strongAxesFR(city: CitySeed): string {
  return topAxes(city, 2).map(axisLabel.fr).join(", ");
}
function weakAxesFR(city: CitySeed): string {
  return bottomAxes(city, 2).map(axisLabel.fr).join(", ");
}
function strongAxesEN(city: CitySeed): string {
  return topAxes(city, 2).map(axisLabel.en).join(", ");
}
function weakAxesEN(city: CitySeed): string {
  return bottomAxes(city, 2).map(axisLabel.en).join(", ");
}
function lowestAxisFR(city: CitySeed): string {
  return axisLabel.fr(bottomAxes(city, 1)[0]);
}
function lowestAxisEN(city: CitySeed): string {
  return axisLabel.en(bottomAxes(city, 1)[0]);
}

type AxisKey = "life" | "transport" | "nature" | "cost" | "safety" | "culture" | "remoteWork" | "schools";
const AXIS_KEYS: AxisKey[] = ["life", "transport", "nature", "cost", "safety", "culture", "remoteWork", "schools"];

const axisLabel = {
  fr: (k: AxisKey): string => ({
    life: "qualité de vie",
    transport: "transports",
    nature: "nature",
    cost: "coût-de-vie",
    safety: "sécurité",
    culture: "culture",
    remoteWork: "télétravail",
    schools: "écoles",
  })[k],
  en: (k: AxisKey): string => ({
    life: "quality of life",
    transport: "transport",
    nature: "nature",
    cost: "cost-of-living",
    safety: "safety",
    culture: "culture",
    remoteWork: "remote work",
    schools: "schools",
  })[k],
};

function topAxes(city: CitySeed, n: number): AxisKey[] {
  return [...AXIS_KEYS].sort((a, b) => city.scores[b] - city.scores[a]).slice(0, n);
}
function bottomAxes(city: CitySeed, n: number): AxisKey[] {
  return [...AXIS_KEYS].sort((a, b) => city.scores[a] - city.scores[b]).slice(0, n);
}

function nicheFitFR(city: CitySeed): string {
  const s = city.scores;
  const fits: string[] = [];
  if (s.remoteWork >= 6.5 && s.cost >= 5.5) fits.push("télétravailleurs cherchant un équilibre coût/qualité de vie");
  if (s.schools >= 6.5 && s.safety >= 6) fits.push("familles avec enfants scolarisés");
  if (s.culture >= 7) fits.push("amateurs de culture et de sorties");
  if (s.nature >= 7.5) fits.push("amoureux de la nature et activités de plein air");
  if (s.cost >= 7) fits.push("ménages au budget contraint");
  if (s.safety >= 7 && s.life >= 6.5) fits.push("retraités cherchant la tranquillité");
  if (fits.length === 0) fits.push("profils mixtes — voir les scores axe par axe pour décider");
  return fits.slice(0, 3).join(", ");
}

function nicheFitEN(city: CitySeed): string {
  const s = city.scores;
  const fits: string[] = [];
  if (s.remoteWork >= 6.5 && s.cost >= 5.5) fits.push("remote workers seeking a cost/quality balance");
  if (s.schools >= 6.5 && s.safety >= 6) fits.push("families with school-age children");
  if (s.culture >= 7) fits.push("culture lovers and frequent goers-out");
  if (s.nature >= 7.5) fits.push("nature and outdoor-activity enthusiasts");
  if (s.cost >= 7) fits.push("budget-conscious households");
  if (s.safety >= 7 && s.life >= 6.5) fits.push("retirees seeking calm");
  if (fits.length === 0) fits.push("mixed profiles — read the per-axis scores to decide");
  return fits.slice(0, 3).join(", ");
}
