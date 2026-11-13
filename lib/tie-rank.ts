/**
 * Rang de compétition (« 1, 2, 2, 4 ») sur une liste déjà triée par valeur décroissante.
 *
 * Les notes publiées ont une décimale : sur 593 villes, le score global ne prend
 * qu'une cinquantaine de valeurs, et les égalités commencent dès la 2ᵉ place.
 * Numéroter `i + 1` fabrique un départage que la note ne fait pas (Fontainebleau
 * « 2ᵉ » et Amboise « 3ᵉ » à 7,9 toutes les deux). Convention : `CLAUDE.md`
 * § « Un classement ne publie un rang que là où le score départage ».
 * Zéro import : utilisable depuis un composant client.
 */
export function competitionRanks(values: readonly number[]): number[] {
  const ranks: number[] = [];
  for (let i = 0; i < values.length; i++) {
    ranks.push(i > 0 && values[i] === values[i - 1] ? ranks[i - 1] : i + 1);
  }
  return ranks;
}

/** Vrai si au moins deux des `n` premières valeurs (triées) sont égales. */
export function hasTieInTop(values: readonly number[], n: number): boolean {
  for (let i = 1; i < Math.min(n, values.length); i++) if (values[i] === values[i - 1]) return true;
  // Une égalité qui franchit la limite compte aussi : le n-ième n'est pas départagé du suivant.
  return values.length > n && n > 0 && values[n - 1] === values[n];
}
