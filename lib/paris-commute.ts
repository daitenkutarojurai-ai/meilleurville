// F32 — Temps Paris par ville
//
// Pour chaque ville, estime le temps de trajet ferroviaire jusqu'à Paris :
//  - Si la ville figure dans le tableau curé (TGV/TER direct), on prend la
//    durée publiée par la SNCF (Oui.sncf, juin 2025).
//  - Sinon, on prend la durée de la ville TGV la plus proche + 0,5 min/km
//    d'accès local en TER ou voiture (heuristique conservative).
//
// Pure compute depuis CITIES_SEED.lat/long — aucune dépendance externe.
// Tag explicite « Estimation SNCF + accès » pour l'UI.

import { CITIES_SEED, type CitySeed } from "@/data/cities-seed";
import { haversineKm } from "@/lib/distances";

export interface TgvStation {
  /** Slug d'une ville de CITIES_SEED, ou un nom court pour les hubs hors seed */
  slug: string;
  name: string;
  /** Latitude / longitude de la gare */
  lat: number;
  lon: number;
  /** Durée trajet à Paris la plus rapide (minutes, hors transit) */
  parisMin: number;
  /** Tronçon principal */
  line: "Sud-Est" | "Atlantique" | "Nord" | "Est" | "Sud-Ouest" | "Méditerranée" | "Normandie" | "Auvergne" | "Pyrénées" | "Bretagne" | "Côte Azur" | "Centre";
}

// Stations TGV/Intercités/TER directes vers Paris — temps Oui.sncf (jun 2025).
// Sélection : tous les hubs > 1 train direct/jour.
export const TGV_STATIONS: TgvStation[] = [
  // LGV Sud-Est
  { slug: "lyon", name: "Lyon Part-Dieu", lat: 45.7605, lon: 4.8593, parisMin: 117, line: "Sud-Est" },
  { slug: "saint-etienne", name: "Saint-Étienne", lat: 45.4309, lon: 4.3865, parisMin: 165, line: "Sud-Est" },
  { slug: "avignon", name: "Avignon TGV", lat: 43.9229, lon: 4.7864, parisMin: 160, line: "Méditerranée" },
  { slug: "aix-en-provence", name: "Aix-en-Provence TGV", lat: 43.4554, lon: 5.3175, parisMin: 180, line: "Méditerranée" },
  { slug: "marseille", name: "Marseille Saint-Charles", lat: 43.3030, lon: 5.3802, parisMin: 185, line: "Méditerranée" },
  { slug: "nice", name: "Nice-Ville", lat: 43.7045, lon: 7.2614, parisMin: 345, line: "Côte Azur" },
  { slug: "toulon", name: "Toulon", lat: 43.1267, lon: 5.9303, parisMin: 225, line: "Méditerranée" },
  { slug: "montpellier", name: "Montpellier Sud-de-France", lat: 43.5947, lon: 3.9234, parisMin: 200, line: "Méditerranée" },
  { slug: "nimes", name: "Nîmes Pont-du-Gard", lat: 43.8590, lon: 4.3633, parisMin: 175, line: "Méditerranée" },
  { slug: "perpignan", name: "Perpignan", lat: 42.6963, lon: 2.8742, parisMin: 305, line: "Méditerranée" },
  { slug: "valence", name: "Valence TGV", lat: 44.9911, lon: 4.9740, parisMin: 130, line: "Sud-Est" },
  { slug: "dijon", name: "Dijon", lat: 47.3236, lon: 5.0274, parisMin: 95, line: "Sud-Est" },
  { slug: "macon", name: "Mâcon Loché", lat: 46.2851, lon: 4.7960, parisMin: 100, line: "Sud-Est" },
  { slug: "besancon", name: "Besançon Franche-Comté TGV", lat: 47.3076, lon: 5.9595, parisMin: 130, line: "Sud-Est" },
  { slug: "mulhouse", name: "Mulhouse", lat: 47.7407, lon: 7.3431, parisMin: 165, line: "Est" },
  // LGV Atlantique
  { slug: "tours", name: "Tours / Saint-Pierre-des-Corps", lat: 47.3853, lon: 0.7136, parisMin: 65, line: "Atlantique" },
  { slug: "poitiers", name: "Poitiers", lat: 46.5800, lon: 0.3375, parisMin: 85, line: "Atlantique" },
  { slug: "angouleme", name: "Angoulême", lat: 45.6604, lon: 0.1538, parisMin: 110, line: "Atlantique" },
  { slug: "bordeaux", name: "Bordeaux Saint-Jean", lat: 44.8267, lon: -0.5562, parisMin: 130, line: "Atlantique" },
  { slug: "agen", name: "Agen", lat: 44.2078, lon: 0.6172, parisMin: 200, line: "Sud-Ouest" },
  { slug: "toulouse", name: "Toulouse Matabiau", lat: 43.6113, lon: 1.4540, parisMin: 245, line: "Sud-Ouest" },
  { slug: "pau", name: "Pau", lat: 43.2964, lon: -0.3781, parisMin: 280, line: "Pyrénées" },
  { slug: "tarbes", name: "Tarbes", lat: 43.2415, lon: 0.0676, parisMin: 320, line: "Pyrénées" },
  { slug: "bayonne", name: "Bayonne", lat: 43.4929, lon: -1.4744, parisMin: 240, line: "Sud-Ouest" },
  { slug: "biarritz", name: "Biarritz", lat: 43.4593, lon: -1.5453, parisMin: 250, line: "Sud-Ouest" },
  { slug: "dax", name: "Dax", lat: 43.7129, lon: -1.0581, parisMin: 220, line: "Sud-Ouest" },
  // LGV Bretagne/Atlantique Ouest
  { slug: "le-mans", name: "Le Mans", lat: 47.9826, lon: 0.1922, parisMin: 60, line: "Atlantique" },
  { slug: "rennes", name: "Rennes", lat: 48.1037, lon: -1.6722, parisMin: 90, line: "Bretagne" },
  { slug: "saint-malo", name: "Saint-Malo", lat: 48.6470, lon: -2.0078, parisMin: 165, line: "Bretagne" },
  { slug: "quimper", name: "Quimper", lat: 47.9942, lon: -4.0915, parisMin: 245, line: "Bretagne" },
  { slug: "brest", name: "Brest", lat: 48.3886, lon: -4.4948, parisMin: 220, line: "Bretagne" },
  { slug: "lorient", name: "Lorient", lat: 47.7548, lon: -3.3702, parisMin: 200, line: "Bretagne" },
  { slug: "vannes", name: "Vannes", lat: 47.6573, lon: -2.7600, parisMin: 170, line: "Bretagne" },
  { slug: "nantes", name: "Nantes", lat: 47.2178, lon: -1.5417, parisMin: 125, line: "Atlantique" },
  { slug: "angers", name: "Angers Saint-Laud", lat: 47.4646, lon: -0.5567, parisMin: 95, line: "Atlantique" },
  { slug: "la-roche-sur-yon", name: "La Roche-sur-Yon", lat: 46.6705, lon: -1.4259, parisMin: 195, line: "Atlantique" },
  { slug: "la-rochelle", name: "La Rochelle", lat: 46.1547, lon: -1.1485, parisMin: 175, line: "Atlantique" },
  // LGV Nord
  { slug: "lille", name: "Lille Europe / Flandres", lat: 50.6390, lon: 3.0712, parisMin: 62, line: "Nord" },
  { slug: "arras", name: "Arras", lat: 50.2870, lon: 2.7820, parisMin: 50, line: "Nord" },
  { slug: "valenciennes", name: "Valenciennes", lat: 50.3540, lon: 3.5180, parisMin: 110, line: "Nord" },
  { slug: "amiens", name: "Amiens", lat: 49.8907, lon: 2.3120, parisMin: 75, line: "Nord" },
  { slug: "douai", name: "Douai", lat: 50.3713, lon: 3.0775, parisMin: 75, line: "Nord" },
  { slug: "calais", name: "Calais-Fréthun", lat: 50.9213, lon: 1.8124, parisMin: 95, line: "Nord" },
  { slug: "boulogne-sur-mer", name: "Boulogne-sur-Mer", lat: 50.7264, lon: 1.6147, parisMin: 165, line: "Nord" },
  { slug: "dunkerque", name: "Dunkerque", lat: 51.0344, lon: 2.3768, parisMin: 110, line: "Nord" },
  // LGV Est
  { slug: "reims", name: "Reims", lat: 49.2589, lon: 4.0349, parisMin: 45, line: "Est" },
  { slug: "metz", name: "Metz", lat: 49.1093, lon: 6.1779, parisMin: 85, line: "Est" },
  { slug: "nancy", name: "Nancy", lat: 48.6892, lon: 6.1646, parisMin: 90, line: "Est" },
  { slug: "strasbourg", name: "Strasbourg", lat: 48.5847, lon: 7.7349, parisMin: 110, line: "Est" },
  { slug: "colmar", name: "Colmar", lat: 48.0734, lon: 7.3464, parisMin: 140, line: "Est" },
  { slug: "epinal", name: "Épinal", lat: 48.1721, lon: 6.4475, parisMin: 140, line: "Est" },
  { slug: "verdun", name: "Verdun", lat: 49.1593, lon: 5.3895, parisMin: 90, line: "Est" },
  { slug: "troyes", name: "Troyes", lat: 48.2933, lon: 4.0837, parisMin: 90, line: "Est" },
  // Normandie / Polt / Auvergne
  { slug: "rouen", name: "Rouen-Rive-Droite", lat: 49.4480, lon: 1.0945, parisMin: 70, line: "Normandie" },
  { slug: "le-havre", name: "Le Havre", lat: 49.4938, lon: 0.1078, parisMin: 125, line: "Normandie" },
  { slug: "caen", name: "Caen", lat: 49.1738, lon: -0.3473, parisMin: 110, line: "Normandie" },
  { slug: "evreux", name: "Évreux", lat: 49.0250, lon: 1.1383, parisMin: 55, line: "Normandie" },
  { slug: "cherbourg-en-cotentin", name: "Cherbourg", lat: 49.6536, lon: -1.6191, parisMin: 180, line: "Normandie" },
  { slug: "deauville", name: "Trouville-Deauville", lat: 49.3624, lon: 0.0833, parisMin: 130, line: "Normandie" },
  { slug: "orleans", name: "Orléans", lat: 47.9082, lon: 1.9054, parisMin: 70, line: "Centre" },
  { slug: "bourges", name: "Bourges", lat: 47.0834, lon: 2.4014, parisMin: 110, line: "Centre" },
  { slug: "chartres", name: "Chartres", lat: 48.4441, lon: 1.4806, parisMin: 60, line: "Centre" },
  { slug: "limoges", name: "Limoges Bénédictins", lat: 45.8348, lon: 1.2629, parisMin: 195, line: "Auvergne" },
  { slug: "brive-la-gaillarde", name: "Brive", lat: 45.1532, lon: 1.4823, parisMin: 240, line: "Auvergne" },
  { slug: "clermont-ferrand", name: "Clermont-Ferrand", lat: 45.7770, lon: 3.0918, parisMin: 205, line: "Auvergne" },
  { slug: "vichy", name: "Vichy", lat: 46.1228, lon: 3.4316, parisMin: 165, line: "Auvergne" },
  { slug: "moulins", name: "Moulins", lat: 46.5644, lon: 3.3294, parisMin: 130, line: "Auvergne" },
  { slug: "nevers", name: "Nevers", lat: 46.9897, lon: 3.1581, parisMin: 105, line: "Centre" },
  // Alpes
  { slug: "grenoble", name: "Grenoble", lat: 45.1909, lon: 5.7137, parisMin: 180, line: "Sud-Est" },
  { slug: "chambery", name: "Chambéry", lat: 45.5715, lon: 5.9210, parisMin: 180, line: "Sud-Est" },
  { slug: "annecy", name: "Annecy", lat: 45.9020, lon: 6.1226, parisMin: 220, line: "Sud-Est" },
  { slug: "annemasse", name: "Annemasse", lat: 46.1942, lon: 6.2360, parisMin: 240, line: "Sud-Est" },
  { slug: "thonon-les-bains", name: "Thonon-les-Bains", lat: 46.3711, lon: 6.4767, parisMin: 270, line: "Sud-Est" },
  { slug: "albertville", name: "Albertville", lat: 45.6779, lon: 6.3923, parisMin: 245, line: "Sud-Est" },
  { slug: "bourg-en-bresse", name: "Bourg-en-Bresse", lat: 46.2056, lon: 5.2256, parisMin: 115, line: "Sud-Est" },
];

// Cap fallback time to a reasonable max (DROM, Corse → no rail to Paris).
const NO_RAIL_MAX_MIN = 600; // > 10h, equivalent to "no direct rail"

export interface ParisCommute {
  minutes: number;
  /** Format lisible (1h57, 3h05, …) */
  display: string;
  /** Comment c'est calculé */
  source: "direct-station" | "via-nearby-station" | "unavailable";
  /** Station TGV/TER de référence (cas indirect) */
  viaStation?: string;
  /** Km d'accès depuis la ville jusqu'à la station */
  accessKm?: number;
}

function formatMinutes(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h === 0) return `${min}min`;
  if (min === 0) return `${h}h`;
  return `${h}h${min.toString().padStart(2, "0")}`;
}

export function parisCommute(city: CitySeed): ParisCommute {
  // 1. Direct match — ville curée
  const direct = TGV_STATIONS.find((s) => s.slug === city.slug);
  if (direct) {
    return {
      minutes: direct.parisMin,
      display: formatMinutes(direct.parisMin),
      source: "direct-station",
    };
  }

  // 2. Pas de coords → unavailable
  if (city.latitude == null || city.longitude == null) {
    return { minutes: NO_RAIL_MAX_MIN, display: "—", source: "unavailable" };
  }
  // DROM → no rail
  const inMetro = city.longitude >= -6 && city.longitude <= 10 && city.latitude >= 40 && city.latitude <= 52;
  if (!inMetro) {
    return { minutes: NO_RAIL_MAX_MIN, display: "—", source: "unavailable" };
  }

  // 3. Trouve la station TGV la plus proche, ajoute 0,5 min/km d'accès local
  const cityPt = { lat: city.latitude, lon: city.longitude };
  let nearest: { station: TgvStation; km: number } | null = null;
  for (const s of TGV_STATIONS) {
    const km = haversineKm(cityPt, { lat: s.lat, lon: s.lon });
    if (!nearest || km < nearest.km) nearest = { station: s, km };
  }
  if (!nearest) {
    return { minutes: NO_RAIL_MAX_MIN, display: "—", source: "unavailable" };
  }
  // 0,5 min/km = 120 km/h équivalent TER + correspondance — un peu optimiste
  // mais conservateur sur courte distance et trafic.
  const accessMin = Math.round(nearest.km * 0.5);
  const total = nearest.station.parisMin + accessMin;
  return {
    minutes: total,
    display: formatMinutes(total),
    source: "via-nearby-station",
    viaStation: nearest.station.name,
    accessKm: Math.round(nearest.km),
  };
}

export function parisCommuteAll(): Array<{ city: CitySeed; commute: ParisCommute }> {
  return CITIES_SEED.map((city) => ({ city, commute: parisCommute(city) })).filter(
    (r) => r.commute.source !== "unavailable",
  );
}
