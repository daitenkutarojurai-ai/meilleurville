// Remplacements exacts (une seule occurrence exigée) dans un guide parent solo FR/EN, updatedAt mis à jour.
// usage: node apply.mjs edits.json   — edits: [{file,slug,date,pairs:[[old,new],...]}]
import fs from "fs";
for(const e of JSON.parse(fs.readFileSync(process.argv[2]))){
  let src=fs.readFileSync(e.file,"utf8");
  const key=e.file.includes("-en")?`slug: "single-parent-in-${e.slug}-2026"`:`slug: "parent-solo-a-${e.slug}-2026"`;
  const i=src.indexOf(key), j=src.indexOf("\n  },\n",i); if(i<0) throw key;
  let seg=src.slice(i,j);
  for(const [o,n] of e.pairs){ const c=seg.split(o).length-1; if(c!==1) throw new Error(`${key}: ${c}x «${o}»`); seg=seg.replace(o,()=>n); }
  seg=seg.replace(/updatedAt: "[0-9-]+"/,`updatedAt: "${e.date}"`);
  if(/\b363\b/.test(seg)) console.log("WARN 363 left in",key,[...seg.matchAll(/.{60}\b363\b.{20}/g)].map(m=>m[0]));
  fs.writeFileSync(e.file,src.slice(0,i)+seg+src.slice(j)); console.log("ok",key,e.pairs.length);
}
