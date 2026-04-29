export interface HousingData {
  avgRentT1: number;
  avgRentT2: number;
  avgRentT3: number;
  avgBuyPriceM2: number;
}

export const HOUSING: Record<string, HousingData> = {
  annecy:          { avgRentT1: 750, avgRentT2: 1100, avgRentT3: 1450, avgBuyPriceM2: 5500 },
  nantes:          { avgRentT1: 600, avgRentT2: 850,  avgRentT3: 1150, avgBuyPriceM2: 4200 },
  rennes:          { avgRentT1: 590, avgRentT2: 820,  avgRentT3: 1100, avgBuyPriceM2: 3800 },
  bordeaux:        { avgRentT1: 650, avgRentT2: 900,  avgRentT3: 1200, avgBuyPriceM2: 4500 },
  montpellier:     { avgRentT1: 620, avgRentT2: 850,  avgRentT3: 1150, avgBuyPriceM2: 3900 },
  strasbourg:      { avgRentT1: 580, avgRentT2: 800,  avgRentT3: 1080, avgBuyPriceM2: 3800 },
  toulouse:        { avgRentT1: 620, avgRentT2: 850,  avgRentT3: 1150, avgBuyPriceM2: 4000 },
  grenoble:        { avgRentT1: 560, avgRentT2: 750,  avgRentT3: 1020, avgBuyPriceM2: 3200 },
  nice:            { avgRentT1: 780, avgRentT2: 1100, avgRentT3: 1500, avgBuyPriceM2: 5200 },
  lyon:            { avgRentT1: 720, avgRentT2: 1000, avgRentT3: 1380, avgBuyPriceM2: 5000 },
  brest:           { avgRentT1: 480, avgRentT2: 650,  avgRentT3: 850,  avgBuyPriceM2: 2500 },
  "aix-en-provence": { avgRentT1: 760, avgRentT2: 1050, avgRentT3: 1400, avgBuyPriceM2: 5000 },
  "clermont-ferrand": { avgRentT1: 480, avgRentT2: 680, avgRentT3: 900, avgBuyPriceM2: 2400 },
  dijon:           { avgRentT1: 520, avgRentT2: 720,  avgRentT3: 950,  avgBuyPriceM2: 2600 },
  tours:           { avgRentT1: 510, avgRentT2: 700,  avgRentT3: 940,  avgBuyPriceM2: 2700 },
  reims:           { avgRentT1: 490, avgRentT2: 680,  avgRentT3: 900,  avgBuyPriceM2: 2300 },
  metz:            { avgRentT1: 500, avgRentT2: 680,  avgRentT3: 910,  avgBuyPriceM2: 2300 },
  "le-mans":       { avgRentT1: 470, avgRentT2: 650,  avgRentT3: 870,  avgBuyPriceM2: 1900 },
  poitiers:        { avgRentT1: 480, avgRentT2: 660,  avgRentT3: 880,  avgBuyPriceM2: 2100 },
  limoges:         { avgRentT1: 440, avgRentT2: 600,  avgRentT3: 800,  avgBuyPriceM2: 1600 },
  caen:            { avgRentT1: 510, avgRentT2: 700,  avgRentT3: 930,  avgBuyPriceM2: 2500 },
  pau:             { avgRentT1: 490, avgRentT2: 680,  avgRentT3: 900,  avgBuyPriceM2: 2400 },
  biarritz:        { avgRentT1: 730, avgRentT2: 1000, avgRentT3: 1400, avgBuyPriceM2: 6500 },
  "la-rochelle":   { avgRentT1: 600, avgRentT2: 820,  avgRentT3: 1100, avgBuyPriceM2: 4200 },
  marseille:       { avgRentT1: 590, avgRentT2: 820,  avgRentT3: 1100, avgBuyPriceM2: 3500 },
  perpignan:       { avgRentT1: 470, avgRentT2: 650,  avgRentT3: 870,  avgBuyPriceM2: 2300 },
  rouen:           { avgRentT1: 520, avgRentT2: 720,  avgRentT3: 950,  avgBuyPriceM2: 2600 },
  toulon:          { avgRentT1: 560, avgRentT2: 780,  avgRentT3: 1050, avgBuyPriceM2: 3200 },
  amiens:          { avgRentT1: 490, avgRentT2: 680,  avgRentT3: 900,  avgBuyPriceM2: 2200 },
  besancon:        { avgRentT1: 490, avgRentT2: 680,  avgRentT3: 900,  avgBuyPriceM2: 2300 },
  angers:          { avgRentT1: 540, avgRentT2: 750,  avgRentT3: 1000, avgBuyPriceM2: 3000 },
  "le-havre":      { avgRentT1: 470, avgRentT2: 650,  avgRentT3: 870,  avgBuyPriceM2: 2000 },
  "saint-etienne": { avgRentT1: 420, avgRentT2: 580,  avgRentT3: 770,  avgBuyPriceM2: 1500 },
  orleans:         { avgRentT1: 510, avgRentT2: 700,  avgRentT3: 930,  avgBuyPriceM2: 2400 },
  lille:           { avgRentT1: 580, avgRentT2: 800,  avgRentT3: 1080, avgBuyPriceM2: 3500 },
  quimper:         { avgRentT1: 510, avgRentT2: 700,  avgRentT3: 940,  avgBuyPriceM2: 2800 },
  valence:         { avgRentT1: 490, avgRentT2: 680,  avgRentT3: 900,  avgBuyPriceM2: 2400 },
  bayonne:         { avgRentT1: 660, avgRentT2: 900,  avgRentT3: 1200, avgBuyPriceM2: 4500 },
  montauban:       { avgRentT1: 470, avgRentT2: 650,  avgRentT3: 860,  avgBuyPriceM2: 2200 },
  troyes:          { avgRentT1: 470, avgRentT2: 650,  avgRentT3: 860,  avgBuyPriceM2: 2000 },
  angouleme:       { avgRentT1: 450, avgRentT2: 620,  avgRentT3: 820,  avgBuyPriceM2: 1800 },
  lorient:         { avgRentT1: 500, avgRentT2: 680,  avgRentT3: 900,  avgBuyPriceM2: 2800 },
  arles:           { avgRentT1: 510, avgRentT2: 700,  avgRentT3: 930,  avgBuyPriceM2: 3200 },
  colmar:          { avgRentT1: 550, avgRentT2: 750,  avgRentT3: 1000, avgBuyPriceM2: 3000 },
  "saint-malo":    { avgRentT1: 580, avgRentT2: 800,  avgRentT3: 1080, avgBuyPriceM2: 4000 },
  avignon:         { avgRentT1: 540, avgRentT2: 750,  avgRentT3: 1000, avgBuyPriceM2: 3000 },
  chambery:        { avgRentT1: 590, avgRentT2: 820,  avgRentT3: 1100, avgBuyPriceM2: 3600 },
  frejus:          { avgRentT1: 620, avgRentT2: 850,  avgRentT3: 1150, avgBuyPriceM2: 3800 },
  libourne:        { avgRentT1: 520, avgRentT2: 720,  avgRentT3: 960,  avgBuyPriceM2: 2800 },
  nimes:           { avgRentT1: 520, avgRentT2: 720,  avgRentT3: 960,  avgBuyPriceM2: 2800 },
  gap:             { avgRentT1: 490, avgRentT2: 680,  avgRentT3: 900,  avgBuyPriceM2: 2500 },
  vannes:          { avgRentT1: 620, avgRentT2: 850,  avgRentT3: 1150, avgBuyPriceM2: 3900 },
  cherbourg:       { avgRentT1: 450, avgRentT2: 620,  avgRentT3: 820,  avgBuyPriceM2: 1900 },
  tarbes:          { avgRentT1: 420, avgRentT2: 580,  avgRentT3: 770,  avgBuyPriceM2: 1600 },
  nancy:           { avgRentT1: 510, avgRentT2: 710,  avgRentT3: 950,  avgBuyPriceM2: 2400 },
};

export function getHousing(slug: string): HousingData | undefined {
  return HOUSING[slug];
}
