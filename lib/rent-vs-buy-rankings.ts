// Seed/HOUSING-bound builders, split out of lib/rent-vs-buy so the base module
// (types + constants + VERDICT_META) stays seed-free for client cards.
import { HOUSING } from "@/data/housing";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  REF_SURFACE_M2,
  APPORT_RATIO,
  DUREE_ANS,
  TAUX_ANNUEL,
  NOTAIRE_ANCIEN,
  CHARGES_PROPRIO_PCT,
  mensualite,
  verdictFor,
  type RentVsBuyData,
} from "@/lib/rent-vs-buy";

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

export function buildAllRentVsBuy(): RentVsBuyData[] {
  return CITIES_SEED.map((c) => buildRentVsBuy(c.slug)).filter((x): x is RentVsBuyData => x !== null);
}
