// Ce qui distingue le vote d'une ville (présidentielle 2022), en phrases calculées.
//
// Pourquoi ce module (2026-11-24). `/villes/<slug>/presidentielle-2027` était sorti de
// l'index le 2026-11-04 (lib/fr-index-policy.ts) : chiffres et noms masqués, deux
// villes donnaient le même texte à 0,87-0,88. Les chiffres ne départagent rien dans
// cette mesure ; seuls des mots propres à la ville le font : quels candidats y
// sur-performent, quelles voisines ont voté autrement, où elle se place dans son
// département et sa région, qui gagne le second tour. Tout est calculé sur les
// résultats officiels (ministère de l'Intérieur) : aucune phrase n'est écrite à la main.
//
// Serveur seulement : lit le seed et deux JSON de résultats.

import t2Data from "@/data/presidential-2022-t2.json";
import { CITIES_SEED } from "@/data/cities-seed";
import { allPoliticalLeans, getPoliticalLean } from "@/lib/political-lean";
import { CANDIDATE_BY_KEY, type CandidateKey } from "@/lib/political-lean-meta";
import { NATIONAL_2022_CANDS, NATIONAL_2022_T1_ABSTENTION, NATIONAL_2022_T2 } from "@/data/presidential-2027-polls";
import { inRegion } from "@/lib/place-prep";

/** Un segment de phrase : du texte, ou un lien vers la page présidentielle d'une autre ville. */
export type Seg = string | { slug: string; name: string };

export interface Round2 {
  macron: number;
  lepen: number;
  abstentionPct: number;
  blancsNulsPct: number;
  exprimes: number;
}

const T2 = t2Data as Record<string, Round2>;
export const getRound2 = (slug: string): Round2 | null => T2[slug] ?? null;

// Prépositions de région : lib/place-prep.ts (partagé avec les titres « Où vivre en … ? »).

const fmt = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
// Résultats nationaux officiels : deux décimales, comme le Conseil constitutionnel les publie.
const fmt2 = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
const pts = (n: number) => `${fmt(n)} point${Math.abs(n) >= 2 ? "s" : ""}`;
const nm = (k: CandidateKey) => CANDIDATE_BY_KEY[k].name;
const rankWord = (r: number, adj: string) => (r === 1 ? `le ${adj}` : `le ${r}ᵉ ${adj}`);

function km(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLng = (b.longitude - a.longitude) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

const CITY = new Map(CITIES_SEED.map((c) => [c.slug, c]));

/** Phrases « ce qui distingue <ville> » sur le 1ᵉʳ tour 2022, dans l'ordre d'affichage. */
export function localFacts(slug: string): Seg[][] {
  const city = CITY.get(slug);
  const lean = getPoliticalLean(slug);
  if (!city || !lean) return [];
  const all = allPoliticalLeans().filter((o) => CITY.has(o.slug));
  const N = all.length;
  const name = city.name;
  const link = (s: string): Seg => ({ slug: s, name: CITY.get(s)!.name });
  const out: Seg[][] = [];

  const cands = (Object.entries(lean.cands) as Array<[CandidateKey, number]>)
    .map(([key, pct]) => ({ key, pct }))
    .sort((a, b) => b.pct - a.pct);
  const [a, b, c] = cands;

  // 1. La forme du vote.
  if (a.pct - b.pct < 3) {
    out.push([`À ${name}, le premier tour a tourné au duel serré : ${nm(a.key)} devance ${nm(b.key)} de ${pts(a.pct - b.pct)} seulement.`]);
  } else if (c && a.pct - c.pct < 8) {
    out.push([`Le vote de ${name} se partage entre trois candidats proches : ${nm(a.key)} (${fmt(a.pct)} %), ${nm(b.key)} (${fmt(b.pct)} %) et ${nm(c.key)} (${fmt(c.pct)} %).`]);
  } else if (a.pct >= 35) {
    out.push([`${nm(a.key)} domine nettement le premier tour à ${name} avec ${fmt(a.pct)} %, ${pts(a.pct - b.pct)} devant ${nm(b.key)}.`]);
  } else if (c) {
    out.push([`${nm(a.key)} arrive en tête à ${name} (${fmt(a.pct)} %), devant ${nm(b.key)} (${fmt(b.pct)} %) et ${nm(c.key)} (${fmt(c.pct)} %).`]);
  }

  // 2. Écarts au résultat national, candidat par candidat.
  const gaps = cands.map((x) => ({ ...x, gap: x.pct - NATIONAL_2022_CANDS[x.key] }));
  const over = gaps.filter((g) => g.gap >= 2).sort((p, q) => q.gap - p.gap).slice(0, 2);
  const under = gaps.filter((g) => g.gap <= -2).sort((p, q) => p.gap - q.gap).slice(0, 2);
  if (!over.length && !under.length) {
    out.push([`Le vote de ${name} colle au résultat national : aucun candidat ne s'en écarte de plus de 2 points.`]);
  } else {
    const parts: string[] = [];
    if (over.length) parts.push(over.map((g, i) => `${nm(g.key)} ${i === 0 ? "y fait mieux qu'au niveau national de" : "de"} ${pts(g.gap)}`).join(", "));
    if (under.length) parts.push(under.map((g, i) => `${nm(g.key)} ${i === 0 ? "y recule de" : "de"} ${pts(-g.gap)}`).join(", "));
    out.push([`Rapporté au score national : ${parts.join(" ; ")}.`]);
  }

  // 3. Rang parmi les villes suivies pour l'écart le plus marqué.
  const rankHigh = (k: CandidateKey) => 1 + all.filter((o) => (o.cands[k] ?? 0) > (lean.cands[k] ?? 0)).length;
  const rankLow = (k: CandidateKey) => 1 + all.filter((o) => (o.cands[k] ?? 0) < (lean.cands[k] ?? 0)).length;
  if (over[0] && rankHigh(over[0].key) <= 60) {
    out.push([`C'est ${rankWord(rankHigh(over[0].key), "meilleur score")} de ${nm(over[0].key)} parmi les ${N} villes que nous suivons.`]);
  } else if (under[0] && rankLow(under[0].key) <= 60) {
    out.push([`C'est ${rankWord(rankLow(under[0].key), "score le plus faible")} de ${nm(under[0].key)} parmi les ${N} villes que nous suivons.`]);
  }

  // 4. Dans son département : classement gauche-droite (indice sur les cinq familles).
  const peers = all.filter((o) => CITY.get(o.slug)!.department === city.department).sort((p, q) => p.leanScore - q.leanScore);
  const i = peers.findIndex((o) => o.slug === slug);
  if (peers.length >= 3) {
    const dept = `Dans son département (${city.department})`;
    if (i === 0) out.push([`${dept}, ${name} est la ville qui vote le plus à gauche des ${peers.length} que nous suivons, devant `, link(peers[1].slug), `.`]);
    else if (i === peers.length - 1) out.push([`${dept}, ${name} est la ville qui vote le plus à droite des ${peers.length} que nous suivons, devant `, link(peers[i - 1].slug), `.`]);
    else out.push([`${dept}, ${name} vote plus à droite que `, link(peers[i - 1].slug), ` mais plus à gauche que `, link(peers[i + 1].slug), `.`]);
  } else if (peers.length === 2) {
    const other = peers[1 - i];
    out.push([`${name} vote plus ${i === 0 ? "à gauche" : "à droite"} que `, link(other.slug), `, l'autre ville de son département (${city.department}) que nous suivons.`]);
  }

  // 5. Les voisines : celle qui a voté autrement, sinon celles qui ont voté pareil.
  const near = all
    .filter((o) => o.slug !== slug)
    .map((o) => ({ o, d: km(city, CITY.get(o.slug)!) }))
    .filter((n) => n.d <= 60)
    .sort((p, q) => p.d - q.d);
  const differs = near.find((n) => n.o.topCand && n.o.topCand !== lean.topCand);
  if (differs && lean.topCand) {
    out.push([`À ${Math.round(differs.d)} km, `, link(differs.o.slug), ` a placé ${nm(differs.o.topCand!)} en tête, quand ${name} choisissait ${nm(lean.topCand)}.`]);
  } else if (near.length >= 2 && lean.topCand) {
    out.push([`Ses voisines les plus proches parmi nos villes, `, link(near[0].o.slug), ` et `, link(near[1].o.slug), `, ont elles aussi placé ${nm(lean.topCand)} en tête.`]);
  }

  // 6. Abstention : face au pays, puis rang dans la région.
  const absGap = lean.turnout.abstentionPct - NATIONAL_2022_T1_ABSTENTION;
  const region = all.filter((o) => CITY.get(o.slug)!.region === city.region).sort((p, q) => q.turnout.abstentionPct - p.turnout.abstentionPct);
  const r = region.findIndex((o) => o.slug === slug) + 1;
  const vsNat =
    absGap >= 1 ? `plus forte qu'au niveau national (${fmt2(NATIONAL_2022_T1_ABSTENTION)} %)`
    : absGap <= -1 ? `plus faible qu'au niveau national (${fmt2(NATIONAL_2022_T1_ABSTENTION)} %)`
    : `proche du niveau national (${fmt2(NATIONAL_2022_T1_ABSTENTION)} %)`;
  const upper = r <= region.length / 2;
  // « plus forte qu'au niveau national, mais le 4ᵉ taux le plus bas de la région » : le « mais » marque le contraste.
  const sep = (absGap >= 1 && !upper) || (absGap <= -1 && upper) ? ", mais" : " :";
  const regionPart =
    region.length >= 5
      ? upper
        ? `${sep} ${rankWord(r, "taux le plus élevé")} des ${region.length} villes suivies ${inRegion(city.region)}`
        : `${sep} ${rankWord(region.length - r + 1, "taux le plus bas")} des ${region.length} villes suivies ${inRegion(city.region)}`
      : "";
  out.push([`L'abstention (${fmt(lean.turnout.abstentionPct)} %) y a été ${vsNat}${regionPart}.`]);

  return out;
}

export interface Neighbour {
  slug: string;
  name: string;
  km: number;
  t1Winner: string | null;
  t1Pct: number;
  t2Lepen: number | null;
}

/** Les villes suivies les plus proches (≤ 60 km, 5 au plus) et leur vote 2022. */
export function neighbours(slug: string, max = 5): Neighbour[] {
  const city = CITY.get(slug);
  if (!city) return [];
  return allPoliticalLeans()
    .filter((o) => o.slug !== slug && CITY.has(o.slug))
    .map((o) => ({ o, d: km(city, CITY.get(o.slug)!) }))
    .filter((n) => n.d <= 60)
    .sort((p, q) => p.d - q.d)
    .slice(0, max)
    .map(({ o, d }) => ({
      slug: o.slug,
      name: CITY.get(o.slug)!.name,
      km: Math.round(d),
      t1Winner: o.topCand ? nm(o.topCand) : null,
      t1Pct: o.topCandPct,
      t2Lepen: T2[o.slug]?.lepen ?? null,
    }));
}

/** Phrases du second tour (24 avril 2022) ; vide si la ville n'a pas de résultat. */
export function round2Facts(slug: string): Seg[][] {
  const city = CITY.get(slug);
  const lean = getPoliticalLean(slug);
  const r2 = getRound2(slug);
  if (!city || !lean || !r2) return [];
  const name = city.name;
  const out: Seg[][] = [];
  const macronWins = r2.macron > r2.lepen;
  const winner = macronWins ? "Emmanuel Macron" : "Marine Le Pen";

  out.push([`Au second tour, ${winner} l'emporte à ${name} avec ${fmt(Math.max(r2.macron, r2.lepen))} % des suffrages exprimés.`]);
  const gap = r2.lepen - NATIONAL_2022_T2.lepen;
  const vsNat = `${pts(Math.abs(gap))} ${gap >= 0 ? "de plus" : "de moins"} que son score national (${fmt2(NATIONAL_2022_T2.lepen)} %)`;
  out.push([macronWins ? `Marine Le Pen y obtient ${fmt(r2.lepen)} %, soit ${vsNat}.` : `C'est ${vsNat}.`]);

  if (lean.topCand === "lepen" && macronWins) out.push([`Elle était pourtant arrivée en tête au premier tour : ${name} bascule entre les deux tours.`]);
  else if (lean.topCand === "macron" && !macronWins) out.push([`Emmanuel Macron était pourtant arrivé en tête au premier tour : ${name} bascule entre les deux tours.`]);
  else if (lean.topCand && lean.topCand !== "macron" && lean.topCand !== "lepen")
    out.push([`Au premier tour, c'est ${nm(lean.topCand)} qui était arrivé en tête : aucun des deux finalistes n'y dominait.`]);

  const all = Object.entries(T2).filter(([s]) => CITY.has(s));
  const rank = 1 + all.filter(([, v]) => v.lepen > r2.lepen).length;
  const rankLow = 1 + all.filter(([, v]) => v.lepen < r2.lepen).length;
  if (rank <= 60) out.push([`C'est ${rankWord(rank, "meilleur score")} de Marine Le Pen au second tour parmi les ${all.length} villes que nous suivons.`]);
  else if (rankLow <= 60) out.push([`C'est ${rankWord(rankLow, "score le plus faible")} de Marine Le Pen au second tour parmi les ${all.length} villes que nous suivons.`]);

  const absGap = r2.abstentionPct - NATIONAL_2022_T2.abstentionPct;
  out.push([
    `Abstention au second tour : ${fmt(r2.abstentionPct)} % (${absGap >= 0 ? "+" : ""}${fmt(absGap)} point${Math.abs(absGap) >= 2 ? "s" : ""} par rapport au pays), et ${fmt(r2.blancsNulsPct)} % de bulletins blancs ou nuls.`,
  ]);
  return out;
}
