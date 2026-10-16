// Rangée de raccourcis Google Maps pour une ville (« Pharmacies », « Piscines »…).
// Composant serveur, zéro JS : de simples liens externes, assez grands pour le
// doigt (≥ 36 px), qui ouvrent l'appli Maps sur téléphone.

import { MapPin } from "lucide-react";
import { mapsNearbyUrl } from "@/lib/maps-link";

export type MapsTopic = "sante" | "sport" | "ecoles" | "commerces" | "services" | "famille" | "sorties";

// Requête envoyée à Maps en français (meilleurs résultats locaux), libellé
// affiché traduit.
const TOPICS: Record<MapsTopic, Array<{ q: string; fr: string; en: string }>> = {
  sante: [
    { q: "médecin généraliste", fr: "Médecins généralistes", en: "GPs" },
    { q: "pharmacie", fr: "Pharmacies", en: "Pharmacies" },
    { q: "urgences hôpital", fr: "Urgences", en: "Emergency rooms" },
    { q: "dentiste", fr: "Dentistes", en: "Dentists" },
    { q: "laboratoire d'analyses médicales", fr: "Laboratoires", en: "Medical labs" },
  ],
  sport: [
    { q: "piscine", fr: "Piscines", en: "Swimming pools" },
    { q: "salle de sport", fr: "Salles de sport", en: "Gyms" },
    { q: "stade", fr: "Stades", en: "Stadiums" },
    { q: "club de sport", fr: "Clubs", en: "Sports clubs" },
    { q: "parc", fr: "Parcs", en: "Parks" },
  ],
  ecoles: [
    { q: "crèche", fr: "Crèches", en: "Nurseries" },
    { q: "école maternelle", fr: "Maternelles", en: "Nursery schools" },
    { q: "école élémentaire", fr: "Écoles primaires", en: "Primary schools" },
    { q: "collège", fr: "Collèges", en: "Middle schools" },
    { q: "lycée", fr: "Lycées", en: "High schools" },
  ],
  commerces: [
    { q: "supermarché", fr: "Supermarchés", en: "Supermarkets" },
    { q: "marché", fr: "Marchés", en: "Markets" },
    { q: "boulangerie", fr: "Boulangeries", en: "Bakeries" },
    { q: "bureau de tabac", fr: "Tabacs-presse", en: "Newsagents" },
  ],
  services: [
    { q: "mairie", fr: "Mairie", en: "Town hall" },
    { q: "France services", fr: "France services", en: "France services" },
    { q: "bureau de poste", fr: "La Poste", en: "Post offices" },
    { q: "commissariat gendarmerie", fr: "Police", en: "Police" },
  ],
  famille: [
    { q: "crèche", fr: "Crèches", en: "Nurseries" },
    { q: "aire de jeux", fr: "Aires de jeux", en: "Playgrounds" },
    { q: "école élémentaire", fr: "Écoles", en: "Schools" },
    { q: "pédiatre", fr: "Pédiatres", en: "Paediatricians" },
    { q: "CAF caisse d'allocations familiales", fr: "CAF", en: "CAF office" },
  ],
  sorties: [
    { q: "musée", fr: "Musées", en: "Museums" },
    { q: "restaurant", fr: "Restaurants", en: "Restaurants" },
    { q: "bar", fr: "Bars", en: "Bars" },
    { q: "cinéma", fr: "Cinémas", en: "Cinemas" },
    { q: "parc", fr: "Parcs", en: "Parks" },
  ],
};

export function MapsQuickSearch({
  topic,
  cityName,
  department,
  locale = "fr",
  className = "",
}: {
  topic: MapsTopic;
  cityName: string;
  department?: string;
  locale?: "fr" | "en";
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
        {locale === "fr" ? `Trouver sur Google Maps à ${cityName}` : `Find on Google Maps in ${cityName}`}
      </p>
      <ul className="flex flex-wrap gap-2">
        {TOPICS[topic].map((t) => (
          <li key={t.q}>
            <a
              href={mapsNearbyUrl(t.q, cityName, department)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <MapPin className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden="true" />
              {locale === "fr" ? t.fr : t.en}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
