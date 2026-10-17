// Pré-remplissage du formulaire de contact depuis les boutons « Signaler… »
// semés sur le site (`components/ReportCTA.tsx`). L'URL porte le sujet et,
// le cas échéant, la ville : `/contact?topic=evenement&ville=Lyon`. Le corps
// du message reçoit un gabarit court pour que la demande arrive complète
// (date, lieu, lien) — c'est ce qui manquait aux propositions d'événements.

export type PrefillTopic = "evenement" | "red-flag" | "erreur" | "politique";

const TEMPLATES: Record<PrefillTopic, { fr: string[]; en: string[] }> = {
  evenement: {
    fr: ["Nom de l'événement :", "Date(s) et horaires :", "Lieu / adresse :", "Organisateur et lien officiel :", "Prix (ou gratuit) :"],
    en: ["Event name:", "Date(s) and times:", "Venue / address:", "Organiser and official link:", "Price (or free):"],
  },
  "red-flag": {
    fr: ["Quartier ou rue concernée :", "Le problème (bruit, inondation, pollution…) :", "Depuis quand / à quelle fréquence :"],
    en: ["Neighbourhood or street:", "The issue (noise, flooding, pollution…):", "Since when / how often:"],
  },
  erreur: {
    fr: ["Page concernée :", "Ce qui est faux :", "La bonne information (et sa source) :"],
    en: ["Page:", "What is wrong:", "The correct information (and its source):"],
  },
  politique: {
    fr: ["L'actualité (élection, candidature, conseil municipal…) :", "Date :", "Source (lien) :"],
    en: ["The news (election, candidacy, council decision…):", "Date:", "Source (link):"],
  },
};

const CITY_RE = /^[\p{L}0-9 .'’()-]{1,80}$/u;

export function readCity(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const v = raw.trim();
  return CITY_RE.test(v) ? v : null;
}

export function prefillBody(topic: string, city: string | null, locale: "fr" | "en"): string {
  const tpl = TEMPLATES[topic as PrefillTopic];
  if (!tpl) return "";
  const head = city ? [locale === "fr" ? `Ville : ${city}` : `City: ${city}`] : [];
  return [...head, ...tpl[locale]].join("\n") + "\n";
}
