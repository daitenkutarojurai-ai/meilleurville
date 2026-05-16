// F29 — Louer ou acheter (par ville)
//
// Pour chaque ville couverte par HOUSING, calcule :
//  - Prix d'achat T3 estimé (avg_m² × 65 m²)
//  - Loyer T3 annuel (avg_rent_T3 × 12)
//  - Rent-to-price ratio (PER immobilier) = prix_achat / loyer_annuel
//    Plus le ratio est bas, plus l'achat est rentable vs location.
//    < 15 → fortement acheteur — l'achat s'amortit vite
//    15-20 → acheteur — bon équilibre
//    20-25 → équilibré — dépend de la durée de séjour
//    > 25 → locataire — l'achat coûte trop cher pour ce qu'on louerait
//  - Années pour amortir l'apport (10 % du prix) à raison de l'économie de loyer
//    (loyer évité − mensualité prêt − charges propriétaire)
//
// Tout dérivé de HOUSING (avgRentT3, avgBuyPriceM2). Zéro dépendance externe.

import { HOUSING } from "@/data/housing";
import { CITIES_SEED, type CitySeed } from "@/data/cities-seed";

// Surface de référence T3 ~ 65 m² (médiane Insee T3 France 2023).
export const REF_SURFACE_M2 = 65;

// Hypothèses prêt immobilier (cohérent avec F23 simulateur-achat).
// Mises à jour janvier 2026 d'après les barèmes des principales banques FR.
const APPORT_RATIO = 0.10; // 10 % du prix
const DUREE_ANS = 25;
const TAUX_ANNUEL = 0.034; // 3,4 % HT TAEG indicatif jan 2026
const NOTAIRE_ANCIEN = 0.075; // 7,5 % frais notaire ancien
const CHARGES_PROPRIO_PCT = 0.012; // 1,2 % du prix / an (taxe foncière + entretien + assurance PNO)

export type RentVsBuyVerdict =
  | "fortement-acheteur"
  | "acheteur"
  | "equilibre"
  | "locataire"
  | "fortement-locataire";

export interface RentVsBuyData {
  citySlug: string;
  cityName: string;
  rentT3Annual: number;
  priceT3: number;
  rentToPriceRatio: number;
  verdict: RentVsBuyVerdict;
  monthlyMortgage: number;
  monthlyOwnerCharges: number;
  monthlySavingsVsRent: number; // loyer - (mensualité + charges propriétaire)
  notaryFees: number;
  apport: number;
  totalCashIn: number; // apport + notaire
  paybackYears: number | null; // années pour récupérer le cash via économie loyer (positive only)
}

// Mensualité d'un prêt amortissable classique
function mensualite(capital: number, tauxAnnuel: number, dureeAns: number): number {
  const n = dureeAns * 12;
  const i = tauxAnnuel / 12;
  if (i === 0) return capital / n;
  return (capital * i) / (1 - Math.pow(1 + i, -n));
}

function verdictFor(ratio: number): RentVsBuyVerdict {
  if (ratio < 13) return "fortement-acheteur";
  if (ratio < 18) return "acheteur";
  if (ratio < 24) return "equilibre";
  if (ratio < 30) return "locataire";
  return "fortement-locataire";
}

export function buildRentVsBuy(citySlug: string): RentVsBuyData | null {
  const h = HOUSING[citySlug];
  if (!h?.avgRentT3 || !h?.avgBuyPriceM2) return null;
  const city = CITIES_SEED.find((c) => c.slug === citySlug);
  if (!city) return null;

  const priceT3 = Math.round(h.avgBuyPriceM2 * REF_SURFACE_M2);
  const rentT3Annual = h.avgRentT3 * 12;
  const rentToPriceRatio = priceT3 / rentT3Annual;

  const apport = Math.round(priceT3 * APPORT_RATIO);
  const notaryFees = Math.round(priceT3 * NOTAIRE_ANCIEN);
  const totalCashIn = apport + notaryFees;
  const empruntee = priceT3 - apport;
  const monthlyMortgage = Math.round(mensualite(empruntee, TAUX_ANNUEL, DUREE_ANS));
  const monthlyOwnerCharges = Math.round((priceT3 * CHARGES_PROPRIO_PCT) / 12);
  const monthlySavingsVsRent = h.avgRentT3 - monthlyMortgage - monthlyOwnerCharges;

  // Payback : combien d'années pour récupérer apport + notaire via l'économie de loyer.
  // Si l'économie est négative (acheter coûte plus cher que louer mensuellement),
  // le payback n'a pas de sens — on renvoie null.
  const annualSavings = monthlySavingsVsRent * 12;
  const paybackYears = annualSavings > 0 ? Math.round((totalCashIn / annualSavings) * 10) / 10 : null;

  return {
    citySlug: city.slug,
    cityName: city.name,
    rentT3Annual,
    priceT3,
    rentToPriceRatio: Math.round(rentToPriceRatio * 10) / 10,
    verdict: verdictFor(rentToPriceRatio),
    monthlyMortgage,
    monthlyOwnerCharges,
    monthlySavingsVsRent,
    notaryFees,
    apport,
    totalCashIn,
    paybackYears,
  };
}

export const VERDICT_META: Record<RentVsBuyVerdict, { label: string; tone: string; advice: string }> = {
  "fortement-acheteur": {
    label: "Fortement acheteur",
    tone: "text-emerald-700 bg-emerald-100 border-emerald-300",
    advice: "Le ratio prix/loyer est très bas : l'achat s'amortit en moins de 13 ans de loyer. Achat conseillé même pour un séjour de 5-7 ans.",
  },
  acheteur: {
    label: "Acheteur",
    tone: "text-lime-700 bg-lime-100 border-lime-300",
    advice: "L'achat reste avantageux dès lors que vous restez 6-8 ans minimum. Le marché propose un bon équilibre prix/loyer.",
  },
  equilibre: {
    label: "Équilibré",
    tone: "text-amber-700 bg-amber-100 border-amber-300",
    advice: "Achat ou location se valent. Choix dépend de la durée de séjour : > 10 ans → achat, sinon location.",
  },
  locataire: {
    label: "Locataire",
    tone: "text-orange-700 bg-orange-100 border-orange-300",
    advice: "Les prix d'achat sont élevés relativement aux loyers. Louer permet de garder de la flexibilité sans payer l'écart.",
  },
  "fortement-locataire": {
    label: "Fortement locataire",
    tone: "text-red-700 bg-red-100 border-red-300",
    advice: "Le ratio prix/loyer est très tendu : l'achat ne s'amortit qu'au-delà de 30 ans de loyer. Louer reste rationnel pour la plupart des profils.",
  },
};

export function buildAllRentVsBuy(): RentVsBuyData[] {
  return CITIES_SEED.map((c) => buildRentVsBuy(c.slug)).filter((x): x is RentVsBuyData => x !== null);
}
