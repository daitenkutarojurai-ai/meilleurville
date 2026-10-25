const U=["zéro","un","deux","trois","quatre","cinq","six","sept","huit","neuf","dix","onze","douze","treize","quatorze","quinze","seize","dix-sept","dix-huit","dix-neuf"];
const T={2:"vingt",3:"trente",4:"quarante",5:"cinquante",6:"soixante"};
function fr99(n){ if(n<20)return U[n]; if(n<70){const t=Math.floor(n/10),u=n%10; return T[t]+(u==0?"":u==1?" et un":"-"+U[u]);}
 if(n<80){const u=n-60; return "soixante"+(u==11?" et onze":"-"+U[u]);}
 const u=n-80; return u==0?"quatre-vingts":"quatre-vingt-"+U[u]; }
export function frCard(n){ if(n<100)return fr99(n); const c=Math.floor(n/100),r=n%100;
 const head=c==1?"cent":U[c]+" cent"+(r==0?"s":""); if(r==0)return head; return head+" "+fr99(r).replace(/^quatre-vingts$/,"quatre-vingts"); }
export function frOrd(n){ if(n==1)return "première"; let c=frCard(n);
 c=c.replace(/quatre-vingts$/,"quatre-vingt").replace(/cents$/,"cent");
 if(c.endsWith("cinq"))return c+"uième"; if(c.endsWith("neuf"))return c.slice(0,-1)+"vième";
 if(c.endsWith("e"))return c.slice(0,-1)+"ième"; return c+"ième"; }
const EU=["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
const ET={2:"twenty",3:"thirty",4:"forty",5:"fifty",6:"sixty",7:"seventy",8:"eighty",9:"ninety"};
export function enCard(n){ if(n<20)return EU[n]; if(n<100){const t=Math.floor(n/10),u=n%10;return ET[t]+(u?"-"+EU[u]:"");}
 const c=Math.floor(n/100),r=n%100; return EU[c]+" hundred"+(r?" and "+enCard(r):""); }
export function enSuf(n){const s=["th","st","nd","rd"],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);}
