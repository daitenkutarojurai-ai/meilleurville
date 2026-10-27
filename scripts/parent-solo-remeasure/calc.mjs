// Rangs et paliers d une ville sur la cohorte d origine (363) puis le corpus courant (416), + franchissements du seuil.
//   node scripts/parent-solo-remeasure/calc.mjs <slug> /tmp/ext.json
import fs from "fs";
const R=JSON.parse(fs.readFileSync(process.argv[3]));const O=R.filter(r=>!r.ext);
const slug=process.argv[2];const c=R.find(r=>r.slug===slug);
const K=["comp","cost","transport","schools","safety","t3","m2","minInc","rps","inc","pov","s60","u30","amp4"];
const st=(S,k,x,asc)=>{const v=S.filter(r=>r[k]!=null);return {rank:v.filter(r=>asc?r[k]<x:r[k]>x).length+1,tie:v.filter(r=>r[k]===x).length,n:v.length}};
console.log(c.name,c.region,JSON.stringify(c));
for(const k of K){if(c[k]==null)continue;const a=st(O,k,c[k],false),b=st(R,k,c[k],false),a2=st(O,k,c[k],true),b2=st(R,k,c[k],true);
 console.log(k.padEnd(9),c[k],`desc ${a.rank}(${a.tie})/${a.n} -> ${b.rank}(${b.tie})/${b.n}   asc ${a2.rank} -> ${b2.rank}`);}
const cross=S=>S.filter(r=>r.inc!=null&&r.inc*1.3/12>=r.minInc).length;
console.log("crossing",cross(O),"/",O.filter(r=>r.inc!=null).length,"->",cross(R),"/",R.filter(r=>r.inc!=null).length);
console.log("ext in region:",R.filter(r=>r.ext&&r.region===c.region).map(r=>r.name+" "+r.comp).join(", ")||"none");
console.log("ext tied comp:",R.filter(r=>r.ext&&r.comp===c.comp).map(r=>r.name).join(", ")||"none");
