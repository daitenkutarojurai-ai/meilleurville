// Projection étendue (composite, axes, T3, m², seuil, loyer/point d école, Filosofi, âges, amplitude) + médianes origine/courant.
//   npx tsx --tsconfig tsconfig.json scripts/parent-solo-remeasure/ext.ts /tmp/ext.json
import { CITIES_SEED } from "@/data/cities-seed";
import { parentSoloFit, minIncomeForT3 } from "@/lib/parent-solo";
import { getHousing } from "@/data/housing";
import { cityIncome } from "@/lib/city-income";
import { cityPopulation } from "@/lib/city-population";
const rows = CITIES_SEED.filter(c=>c.population>=20000).map(c=>{const h=getHousing(c.slug)!;const inc=cityIncome(c.slug);const p=cityPopulation(c.slug);
 const a=p?.ages;const tot=a?Object.values(a).reduce((x,y)=>x+y,0):0;const s=c.scores; const ax=[s.cost,s.transport,s.schools,s.safety];
 return {slug:c.slug,name:c.name,region:c.region,ext:(c as any).scoreCohort==="extension",comp:parentSoloFit(c).score,...s,t3:h.avgRentT3,m2:h.avgBuyPriceM2,
  minInc:minIncomeForT3(h.avgRentT3,s.cost), rps:Math.round(h.avgRentT3/s.schools), inc:inc?.medianIncome??null,pov:inc?.povertyRate??null,
  s60:a?Math.round((a.a6074+a.a7589+a.a90p)/tot*1000)/10:null, u30:a?Math.round((a.a0014+a.a1529)/tot*1000)/10:null, amp4:Math.round((Math.max(...ax)-Math.min(...ax))*10)/10,
  amp8:Math.round((Math.max(s.life,s.transport,s.nature,s.cost,s.safety,s.culture,s.remoteWork,s.schools)-Math.min(s.life,s.transport,s.nature,s.cost,s.safety,s.culture,s.remoteWork,s.schools))*10)/10}});
require("fs").writeFileSync(process.argv[2],JSON.stringify(rows));
const med=(a:number[])=>{a=a.filter(x=>x!=null).sort((x,y)=>x-y);const n=a.length;return [n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2,n]};
const o=rows.filter(r=>!r.ext);
for(const k of ["comp","cost","transport","schools","safety","t3","m2","minInc","rps","inc","pov","s60","u30","amp4","amp8"]) console.log(k,JSON.stringify(med(o.map((r:any)=>r[k]))),JSON.stringify(med(rows.map((r:any)=>r[k]))));
