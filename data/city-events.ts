// Agenda daté par ville — événements RÉELS, avec date, lieu et source.
//
// À ne pas confondre avec `lib/city-agenda.ts`, qui DÉRIVE un calendrier
// annuel indicatif (fêtes nationales, saisons) sans aucune date précise. Ici,
// chaque entrée est un événement daté qu'on peut vérifier : soit transmis par
// son organisateur (formulaire de contact), soit publié par l'organisateur ou
// la ville sur un site officiel. Pas d'entrée sans `source` lisible.
//
// Ajouter un événement :
//   - `id` stable (sert d'ancre `#id` sur /villes/[slug]/agenda — c'est le lien
//     qu'on renvoie à l'organisateur, donc ne jamais le renommer après coup) ;
//   - `start` / `end` en ISO 8601 avec fuseau (`+01:00` l'hiver, `+02:00` l'été),
//     ou une date seule `YYYY-MM-DD` pour un événement sur plusieurs jours ;
//   - `citySlug` déclaré dans CITIES_SEED (vérifié par `npm run integrity`).
// Les événements terminés disparaissent seuls de la page au build suivant.

import { CITIES_SEED } from "@/data/cities-seed";
import { assertKnownSlugs, assertUniqueSlugs } from "@/lib/data-integrity";

export interface CityEvent {
  id: string;
  citySlug: string;
  title: string;
  titleEn: string;
  /** ISO 8601. Avec heure (`2026-11-08T15:00:00+01:00`) ou date seule (`2026-12-05`). */
  start: string;
  /** Dernier jour inclus (date seule) ou fin horaire. Absent = un seul jour. */
  end?: string;
  venue: string;
  address?: string;
  body: string;
  bodyEn: string;
  /** Tarifs, en clair. Absent = non communiqué. */
  price?: string;
  priceEn?: string;
  free?: boolean;
  /** Billetterie ou page officielle de l'événement. */
  url?: string;
  organizer: string;
  /** Qui atteste la date — lisible par un humain, jamais un chemin du dépôt. */
  source: string;
  sourceUrl?: string;
  kind: "concert" | "festival" | "fete" | "marche" | "spectacle" | "cinema";
}

export const CITY_EVENTS: CityEvent[] = [
  {
    id: "dans-ma-boite-de-jazz-2026-11-08",
    citySlug: "orleans",
    title: "Dans ma boîte de jazz — hommage à Michel Jonasz",
    titleEn: "Dans ma boîte de jazz — a tribute to Michel Jonasz",
    start: "2026-11-08T15:00:00+01:00",
    venue: "Espace Saint-Euverte",
    address: "9 boulevard Saint-Euverte, 45000 Orléans",
    body: "L'association EGCM Project revisite les chansons de Michel Jonasz entre jazz, blues, bossa-nova et chanson française. Sur scène avec le groupe : la chorale orléanaise Oliphonia, dirigée par Olga Kaplan, et de jeunes choristes du collège Sainte-Croix – Saint-Euverte. Un après-midi qui réunit plusieurs générations autour d'un répertoire que tout le monde connaît.",
    bodyEn: "The EGCM Project association revisits Michel Jonasz's songs through jazz, blues, bossa nova and French chanson. On stage with the band: Orléans choir Oliphonia, conducted by Olga Kaplan, and young singers from the Sainte-Croix – Saint-Euverte school. An afternoon that brings several generations together around a much-loved repertoire.",
    price: "15 € · 10 € pour les parents de choristes et les moins de 12 ans · gratuit pour les frères et sœurs des choristes. Billets sur HelloAsso et sur place.",
    priceEn: "€15 · €10 for choir members' parents and under-12s · free for choir members' siblings. Tickets on HelloAsso and at the door.",
    url: "https://www.helloasso.com/associations/egcm-project",
    organizer: "EGCM Project",
    source: "Communiqué de l'organisateur (EGCM Project), octobre 2026",
    kind: "concert",
  },
  {
    id: "festival-lumiere-2026",
    citySlug: "lyon",
    title: "Festival Lumière 2026",
    titleEn: "Lumière Film Festival 2026",
    start: "2026-10-10",
    end: "2026-10-18",
    venue: "Institut Lumière et salles de la Métropole de Lyon",
    body: "Le festival du cinéma classique, dans la ville où les frères Lumière ont inventé le cinématographe : plus de 400 séances de films restaurés dans toute la métropole. Le Prix Lumière 2026 est remis à Joel et Ethan Coen.",
    bodyEn: "The classic-film festival, in the city where the Lumière brothers invented the cinematograph: over 400 screenings of restored films across the metropolitan area. The 2026 Lumière Award goes to Joel and Ethan Coen.",
    url: "https://www.festival-lumiere.org/",
    organizer: "Institut Lumière",
    source: "Institut Lumière (festival-lumiere.org)",
    sourceUrl: "https://www.festival-lumiere.org/",
    kind: "cinema",
  },
  {
    id: "fetes-saint-nicolas-nancy-2026",
    citySlug: "nancy",
    title: "Fêtes de Saint-Nicolas — grand défilé",
    titleEn: "Saint Nicholas Festival — grand parade",
    start: "2026-11-20",
    end: "2027-01-03",
    venue: "Centre-ville et place Stanislas",
    body: "Six semaines de fêtes, inscrites au patrimoine culturel immatériel de la France. Temps fort : le grand défilé du samedi 5 décembre, qui s'achève place Stanislas par un vidéo-mapping et un feu d'artifice.",
    bodyEn: "Six weeks of festivities, listed as French intangible cultural heritage. Highlight: the grand parade on Saturday 5 December, ending on Place Stanislas with projection mapping and fireworks.",
    free: true,
    url: "https://saint-nicolas.nancy.fr/",
    organizer: "Ville de Nancy",
    source: "Ville de Nancy (saint-nicolas.nancy.fr)",
    sourceUrl: "https://saint-nicolas.nancy.fr/",
    kind: "fete",
  },
  {
    id: "trans-musicales-2026",
    citySlug: "rennes",
    title: "48es Rencontres Trans Musicales",
    titleEn: "48th Rencontres Trans Musicales",
    start: "2026-12-02",
    end: "2026-12-06",
    venue: "Parc Expo de Rennes et salles du centre-ville",
    body: "Le festival de découverte créé en 1979, qui a fait connaître Björk, Nirvana ou Daft Punk avant tout le monde : une centaine d'artistes émergents venus du monde entier, la plupart inconnus du public au moment de leur passage.",
    bodyEn: "The discovery festival founded in 1979, which introduced Björk, Nirvana and Daft Punk before anyone else: around a hundred emerging artists from all over the world, most of them unknown to the public when they play.",
    url: "https://www.lestrans.com/",
    organizer: "Association Trans Musicales",
    source: "Association Trans Musicales (lestrans.com)",
    sourceUrl: "https://www.lestrans.com/",
    kind: "festival",
  },
  {
    id: "fete-des-lumieres-2026",
    citySlug: "lyon",
    title: "Fête des Lumières 2026",
    titleEn: "Festival of Lights 2026",
    start: "2026-12-05",
    end: "2026-12-08",
    venue: "Presqu'île, Vieux-Lyon et Fourvière",
    body: "Quatre soirs où des artistes du monde entier mettent en lumière façades, places et monuments de la ville. Gratuit. Les hôtels se remplissent des mois à l'avance et le centre est en partie piéton le soir.",
    bodyEn: "Four nights when artists from around the world light up the city's facades, squares and monuments. Free. Hotels fill up months ahead and parts of the centre are pedestrian-only in the evening.",
    free: true,
    url: "https://www.fetedeslumieres.lyon.fr/",
    organizer: "Ville de Lyon",
    source: "Ville de Lyon (fetedeslumieres.lyon.fr)",
    sourceUrl: "https://www.fetedeslumieres.lyon.fr/",
    kind: "fete",
  },
];

assertKnownSlugs({
  refs: CITY_EVENTS.map((e) => ({ slug: e.citySlug, sourceLabel: `CITY_EVENTS « ${e.id} »` })),
  known: new Set(CITIES_SEED.map((c) => c.slug)),
  contextLabel: "data/city-events.ts",
});
assertUniqueSlugs({ slugs: CITY_EVENTS.map((e) => e.id), contextLabel: "data/city-events.ts (id)" });
for (const e of CITY_EVENTS) {
  for (const d of [e.start, e.end]) {
    if (d !== undefined && Number.isNaN(Date.parse(d))) {
      throw new Error(`[data-integrity] data/city-events.ts : date illisible « ${d} » (${e.id})`);
    }
  }
  if (!e.source.trim()) throw new Error(`[data-integrity] data/city-events.ts : « ${e.id} » sans source`);
}
