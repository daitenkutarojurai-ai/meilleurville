// Remesure des rangs « sur les 363 » de la série parent solo (FR parent-solo-a-*, EN single-parent-in-*)
// sur le corpus courant. Chaque ancien chiffre est d'abord VÉRIFIÉ sur la cohorte d'origine (363 villes
// de plus de 20 000 hab.) ; seul un chiffre vérifié est remplacé. Un guide n'est réécrit que si TOUTES ses
// occurrences de 363 sont résolues et que ses mentions de médiane sont qualitatives. Voir
// docs/extension-villes.md, journal du 2026-10-25.
//   npx -y tsx --tsconfig tsconfig.json scripts/parent-solo-remeasure/rows.ts /tmp/rows.json
//   node scripts/parent-solo-remeasure/fix.mjs /tmp/rows.json dry /tmp/log.txt          # rapport
//   node scripts/parent-solo-remeasure/fix.mjs /tmp/rows.json apply /tmp/log.txt <slugs> # slugs = paires FR∩EN
import fs from "fs";
import {frCard,frOrd,enCard,enSuf} from "./words.mjs";
const rows=JSON.parse(fs.readFileSync(process.argv[2])); const APPLY=process.argv[3]==="apply";
const orig=rows.filter(r=>!r.ext), N0=363, N1=rows.length;
const by=Object.fromEntries(rows.map(r=>[r.slug,r]));
const rank=(set,m,x,asc)=>set.filter(r=>r.v[m]!=null&&(asc?r.v[m]<x:r.v[m]>x)).length+1;
const size=(set,m,x)=>set.filter(r=>r.v[m]===x).length;
// token tables
const FRO={},FRC={},ENC={};
for(let n=1;n<=430;n++){FRO[frOrd(n)]=n;FRC[frCard(n)]=n;ENC[enCard(n)]=n;}
FRO["1re"]=1;
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const alt=o=>Object.keys(o).sort((a,b)=>b.length-a.length).map(esc).join("|");
const reFRO=new RegExp(`(?<![\\p{L}-])(${alt(FRO)})(?![\\p{L}-])`,"gu");
const reFRC=new RegExp(`(?<![\\p{L}-])(${alt(FRC)}|\\d+)(?![\\p{L}-])`,"gu");
const reENO=/(?<![\w])(\d+)(st|nd|rd|th)\b/g;
const reENC=new RegExp(`(?<![\\w-])(${alt(ENC)}|\\d+)(?![\\w-])`,"g");
const METRICS=["composite","global","life","transport","nature","cost","safety","culture","remoteWork","schools"];
function valueBefore(s,fr){ // last X,Y/10 or rent
  const re=fr?/(\d+),(\d)\/10|(\d[\d\u202f\u00a0 ]*)\s?€/g:/(\d+)\.(\d)\/10|€\s?([\d,]+)/g; let last=null,m;
  while((m=re.exec(s))){ if(m[1]!=null) last={x:+(m[1]+"."+m[2]),money:false,at:m.index}; else {const v=+m[3].replace(/[^\d]/g,""); if(v>=200) last={x:v,money:true,at:m.index};} }
  return last; }
let JOINT=false;
function resolve(city,val,dir,kind,stated){ // kind rank|size
  JOINT=false;
  if(kind==="rank" && city && !city.ext && !val.money && city.v.composite===val.x){ const r0=rank(orig,"composite",val.x,false), s0=size(orig,"composite",val.x);
    if(stated>=r0 && stated<=r0+s0-1){ JOINT=size(rows,"composite",val.x)>1; return rank(rows,"composite",val.x,false); } }
  const metrics=val.money?["t3","m2"]:METRICS; const outs=new Set(); const tryCity=c=>{for(const m of metrics){ if(c.v[m]!==val.x) continue;
      const old=kind==="rank"?rank(orig,m,val.x,dir):size(orig,m,val.x); if(old!==stated) continue;
      outs.add(kind==="rank"?rank(rows,m,val.x,dir):size(rows,m,val.x)); }};
  if(city && !city.ext) tryCity(city); if(!outs.size) for(const c of orig) tryCity(c);
  return outs.size===1?[...outs][0]:null; }
const ALLOW=process.argv[5]?new Set(process.argv[5].split(",")):null; const log=[]; let stats={guides:0,full:0,occ:0,ok:0};
const OKMED=[/médiane de transactions/,/médiane des? transactions/,/median of (registered|recorded) transactions/,/median level of living/,/niveau de vie médian/,/médiane du batch|median value of the batch/,/median (salary|income|household|single-parent household)/,/at the local median|local median|commune's (own )?median|this commune's median|its own median/,/corpus median of (20|24|€)/,/against a median of 20/,/single median income/,/median figure counts/];
const SIMPLE_FR=/(?<!un point |demi-point |dixièmes |d'un point |cran )(?:(?:tout )?juste |nettement |largement |très |bien )?(au-dessus|sous) de la médiane du classement (?:fixée à|qui s'établit à|établie à|qui se situe à|à) 5,5\/10/g;
const SIMPLE_EN=/(?<!point |tenths |half a point )(?:(?:just|well|comfortably) )?(above|below) the ranking's median of 5\.5\/10/g;
function medianOk(seg,fr){ let s=seg.replace(fr?SIMPLE_FR:SIMPLE_EN,"§");
  for(const m of s.matchAll(/[^.;"]{0,80}(médiane|median)[^.;"]{0,80}/g)){ if(!OKMED.some(r=>r.test(m[0]))) return false; } return true; }
function processSeg(seg,slug,fr){
  const city=by[slug];
  if(!medianOk(seg,fr)) { if(/\b363\b/.test(seg)) log.push("MEDIAN-SKIP "+slug); return {seg,full:false}; }
  seg=seg.replace(fr?SIMPLE_FR:SIMPLE_EN,x=>x.replace(fr?"5,5":"5.5",fr?"5,4":"5.4")); const occ=[...seg.matchAll(/\b363\b/g)].map(m=>m.index); if(!occ.length) return {seg,full:true,n:0};
  const edits=[]; let allok=true;
  for(const i of occ){
    let a=Math.max(seg.lastIndexOf(". ",i),seg.lastIndexOf('"',i),seg.lastIndexOf(" : ",i),seg.lastIndexOf("; ",i),seg.lastIndexOf("— ",i),seg.lastIndexOf(", ",i-1-25>0?i-25:0)); a=Math.max(0,a);
    a=Math.max(seg.lastIndexOf(". ",i),seg.lastIndexOf('"',i)); 
    const before=seg.slice(a,i), after=seg.slice(i+3,i+3+90);
    let ok=false; const loc=[];
    // rank token: last ordinal in before
    const ordRe=fr?reFRO:reENO; let om,lastO=null; ordRe.lastIndex=0; while((om=ordRe.exec(before))) lastO=om;
    const tail=before.slice(lastO?lastO.index:0);
    const dir=/plus basse|moins ch|lowest|cheapest|least/i.test(tail)?true:false;
    // size token: palier de N / one of N / with N other
    const sizeRe=fr?new RegExp(`palier de (${reFRC.source.slice(reFRC.source.indexOf("(")+1,reFRC.source.lastIndexOf(")(?!"))}) communes`,"u"):null;
    const segBefore=before.slice(-110);
    let sm=null;
    if(fr){ const m=segBefore.match(/palier de ([\p{L} -]+?|\d+) communes( sur (les )?$| sur (les )?)/u); if(m && FRC[m[1]]!=null||m&&/^\d+$/.test(m?.[1]??"")) sm={tok:m[1],n:FRC[m[1]]??+m[1],idx:a+before.length-segBefore.length+segBefore.lastIndexOf(m[1]),other:false}; }
    else { const m=segBefore.match(/(?:one of|tied exactly with) ([a-z -]+?|\d+) (other )?communes (out )?of the $/); if(m && (ENC[m[1]]!=null||/^\d+$/.test(m[1]))) sm={tok:m[1],n:ENC[m[1]]??+m[1],idx:a+before.length-segBefore.length+segBefore.lastIndexOf(m[1]),other:!!m[2]}; }
    const near = lastO && (before.length-(lastO.index+lastO[0].length))<45;
    const val=valueBefore(before,fr);
    if(sm && val){ const st=sm.n+(sm.other?1:0); const nw=resolve(city,val,dir,"size",st);
      if(nw!=null){ const outN=nw-(sm.other?1:0); edits.push({at:sm.idx,len:sm.tok.length,txt:/^\d+$/.test(sm.tok)?String(outN):(fr?frCard(outN):enCard(outN))}); ok=true; } }
    else if(near && val){ const st=fr?FRO[lastO[1]]:+lastO[1]; const nw=resolve(city,val,dir,"rank",st);
      if(nw!=null){ const tok=lastO[0]; let txt=fr?(tok==="1re"?(nw==1?"1re":nw+"e"):frOrd(nw)):enSuf(nw);
        if(!fr && JOINT && !/joint $/.test(before.slice(0,lastO.index))) txt="joint "+txt;
        if(fr && tok!=="1re" && /^\d/.test(tok)) txt=nw+"e";
        edits.push({at:a+lastO.index,len:tok.length,txt}); ok=true;
        // palier after 363
        const pm=after.match(fr?/^[^.;]{0,40}?palier de ([\p{L} -]+?|\d+) communes/u:/^[^.;]{0,40}?(?:shared with|tied with) ([a-z -]+?|\d+) other/);
        if(pm){ const n=fr?(FRC[pm[1]]??+pm[1]):(ENC[pm[1]]??+pm[1]); const st2=n+(fr?0:1); const ns=resolve(city,val,dir,"size",st2);
          if(ns==null) ok=false; else { const o2=ns-(fr?0:1); edits.push({at:i+3+after.indexOf(pm[1],pm.index),len:pm[1].length,txt:/^\d+$/.test(pm[1])?String(o2):(fr?frCard(o2):enCard(o2))}); } } } }
    if(ok) edits.push({at:i,len:3,txt:String(N1)}); else { allok=false; log.push(`UNRES ${slug} :: ${before.slice(-120).replace(/\n/g," ")}⟦363⟧${after.slice(0,40)}`); }
    stats.occ++; if(ok) stats.ok++;
  }
  if(!allok) return {seg,full:false};
  edits.sort((x,y)=>y.at-x.at); let s=seg; const seen=new Set();
  for(const e of edits){ if(seen.has(e.at)) continue; seen.add(e.at); s=s.slice(0,e.at)+e.txt+s.slice(e.at+e.len); }
  return {seg:s,full:true,n:occ.length};
}
for(const [file,re,fr] of [["data/guides.ts",/slug: "parent-solo-a-([a-z0-9-]+)-2026"/g,true],["data/guides-en.ts",/slug: "single-parent-in-([a-z0-9-]+)-2026"/g,false]]){
  let txt=fs.readFileSync(file,"utf8"); const ms=[...txt.matchAll(re)]; let out="",pos=0,changed=[];
  for(const m of ms){ const end=txt.indexOf("\n  },\n",m.index); const seg=txt.slice(m.index,end); stats.guides++;
    const r=processSeg(seg,m[1],fr); const keep=r.full&&(!ALLOW||ALLOW.has(m[1])); if(keep&&r.n){stats.full++; changed.push(m[1]);}
    out+=txt.slice(pos,m.index)+(keep?r.seg:seg); pos=end; }
  out+=txt.slice(pos); if(APPLY) fs.writeFileSync(file,out);
  log.push(`${file} changed ${changed.length}: ${changed.join(",")}`);
}
fs.writeFileSync(process.argv[4]??"/dev/stdout",log.join("\n")); console.log(stats);
