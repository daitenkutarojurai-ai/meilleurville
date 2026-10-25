// Projection des valeurs rendues (composite parent solo, 9 axes, T3, m²) des villes ≥ 20 000 hab.
import { CITIES_SEED } from "@/data/cities-seed";
import { parentSoloFit } from "@/lib/parent-solo";
import { getHousing } from "@/data/housing";
const rows = CITIES_SEED.filter(c=>c.population>=20000).map(c=>{const h=getHousing(c.slug);return {slug:c.slug,ext:(c as any).scoreCohort==="extension",v:{composite:parentSoloFit(c).score,...c.scores, t3:h?.avgRentT3??null, m2:h?.avgBuyPriceM2??null}}});
require("fs").writeFileSync(process.argv[2],JSON.stringify(rows));
