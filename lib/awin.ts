/**
 * Programmes Awin (éditeur 2903693, espace publicitaire mavilleideale.fr).
 *
 * Un programme n'est affiché que si `joined: true`, c'est-à-dire accepté par
 * l'annonceur dans l'interface Awin : un lien vers un programme en attente
 * redirige bien, mais ne rapporte rien. Candidatures envoyées le 2026-11-25 ;
 * passer `joined` à true au fur et à mesure des acceptations
 * (ui.awin.com → Annonceurs → Mes programmes).
 *
 * Pas de script Awin (MasterTag, Convert-a-Link) : la politique de
 * confidentialité promet zéro traceur tiers sur le site. Les liens `cread.php`
 * suffisent, Awin ne pose ses cookies qu'après le clic, sur son propre domaine.
 */

export const AWIN_PUBLISHER_ID = "2903693";

export type AwinPlacement = "installation" | "vacances";

export interface AwinProgramme {
  mid: number;
  name: string;
  joined: boolean;
  placement: AwinPlacement;
  /** Intitulé du lien, à l'infinitif ou nominal, sans superlatif. */
  label: string;
  /** Une phrase factuelle sur ce que fait le service. */
  blurb: string;
  /** Réservé aux destinations de montagne (`activityFitness(city, "montagne") >= 5`). */
  mountainOnly?: boolean;
}

export const AWIN_PROGRAMMES: AwinProgramme[] = [
  // Installation : check-list « s'installer à… »
  { mid: 126967, name: "AnyVan", joined: false, placement: "installation", label: "Devis de déménagement AnyVan", blurb: "Déménageurs et transport de meubles, devis en ligne." },
  { mid: 11216, name: "Rent A Car", joined: false, placement: "installation", label: "Louer un utilitaire avec Rent A Car", blurb: "Location d'utilitaires et de voitures, agences de proximité." },
  { mid: 7218, name: "Appart'City", joined: false, placement: "installation", label: "Logement temporaire Appart'City", blurb: "Appart-hôtels à la nuit ou au mois, le temps de trouver un bail." },
  { mid: 48701, name: "Ohm Énergie", joined: false, placement: "installation", label: "Ouvrir son contrat d'électricité avec Ohm Énergie", blurb: "Fournisseur d'électricité, souscription en ligne." },
  { mid: 19021, name: "LesFurets", joined: false, placement: "installation", label: "Comparer les assurances habitation sur LesFurets", blurb: "Comparateur d'assurances habitation et auto." },
  { mid: 19041, name: "Hiscox", joined: false, placement: "installation", label: "Assurance habitation Hiscox", blurb: "Assureur spécialisé, logements et objets de valeur." },
  { mid: 30641, name: "HomeServe", joined: false, placement: "installation", label: "Dépannage maison HomeServe", blurb: "Plomberie, électricité, serrurerie : contrats d'assistance et dépannages." },
  // Vacances : pages /vacances
  { mid: 130039, name: "SNCF Connect", joined: false, placement: "vacances", label: "Billets de train sur SNCF Connect", blurb: "Trains et cars en France, réservation et horaires." },
  { mid: 67556, name: "Holidu", joined: false, placement: "vacances", label: "Locations de vacances sur Holidu", blurb: "Comparateur de locations de vacances." },
  { mid: 116941, name: "Gites.fr", joined: false, placement: "vacances", label: "Gîtes sur Gites.fr", blurb: "Gîtes et maisons de vacances en France." },
  { mid: 13329, name: "Les Castels", joined: false, placement: "vacances", label: "Campings Les Castels", blurb: "Collection de campings en France." },
  { mid: 6989, name: "lastminute.com", joined: false, placement: "vacances", label: "Séjours sur lastminute.com", blurb: "Séjours, vols + hôtel, offres de dernière minute." },
  { mid: 13143, name: "Montagne Vacances", joined: false, placement: "vacances", label: "Séjours sur Montagne Vacances", blurb: "Locations et séjours à la montagne.", mountainOnly: true },
];

/** Lien de suivi Awin. `clickref` = emplacement + ville, lisible dans les rapports Awin. */
export function awinLink(mid: number, clickref: string): string {
  const url = new URL("https://www.awin1.com/cread.php");
  url.searchParams.set("awinmid", String(mid));
  url.searchParams.set("awinaffid", AWIN_PUBLISHER_ID);
  url.searchParams.set("clickref", clickref.slice(0, 50));
  return url.toString();
}

export function activeAwinProgrammes(placement: AwinPlacement, opts: { mountain?: boolean } = {}): AwinProgramme[] {
  return AWIN_PROGRAMMES.filter(
    (p) => p.joined && p.placement === placement && (!p.mountainOnly || opts.mountain),
  );
}
