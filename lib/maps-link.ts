// Liens Google Maps — forme documentée, sans clé d'API
// (https://developers.google.com/maps/documentation/urls/get-started).
// Nom + ville ouvre la fiche du lieu (horaires, avis, itinéraire) ; des
// coordonnées seules ne poseraient qu'une épingle anonyme.

export function mapsPlaceUrl(name: string, cityName: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${cityName}`)}`;
}

/** Itinéraire depuis la position de l'utilisateur jusqu'au point. */
export function mapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/** Recherche d'une catégorie de lieux dans la ville (« pharmacie, Lyon »). */
export function mapsNearbyUrl(what: string, cityName: string, department?: string): string {
  const where = department ? `${cityName} (${department})` : cityName;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${what} ${where}`)}`;
}
