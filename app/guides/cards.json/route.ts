import { GUIDES } from "@/data/guides";
import { guideCardProjection } from "@/lib/guide-card-projection";

// Toutes les cartes de /guides, chargées par GuidesGrid au premier filtre,
// recherche ou « afficher tout ». Les passer en props les sérialisait deux fois
// dans le HTML de la page (DOM + charge RSC) : 1,5 Mo sur 2 Mo, pour 60 cartes
// affichées. Fichier statique, mis en cache comme le reste de l'export.
export const dynamic = "force-static";

export async function GET() {
  return Response.json(GUIDES.map(guideCardProjection));
}
