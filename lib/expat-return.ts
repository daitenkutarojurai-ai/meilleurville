// F11 — Expat Retour.
//
// Profils par pays d'origine pour les Français rentrant. Chaque profil contient :
//  - taux de change moyen (€ pour 1 unité de devise locale, jan 2026)
//  - équivalent net pour un même niveau de vie
//  - "ce que tu avais vs ce que tu auras" : items concrets (logement, voiture,
//    santé, fiscalité, services)
//  - admin retour France : 5 étapes prioritaires + lien officiel
//
// Données indicatives, à valider en début d'année avec BCE / OFII. Mention
// systématique : "consultatif, ne remplace pas le conseil d'un expert-comptable
// ou du consulat".

export type ExpatCountry = "suisse" | "luxembourg" | "belgique" | "royaume-uni" | "canada";

export interface ExpatCountryProfile {
  slug: ExpatCountry;
  name: string;
  flag: string;
  currency: string;
  currencyToEurApprox: number; // 1 unité locale = X €, janvier 2026 estimé
  netConversionFactor: number; // pour 100 unités locales nettes, tu retrouves ~ X € en France pour vivre pareil (pouvoir d'achat)
  bestSuitedCities: string[]; // slugs CITIES_SEED
  hadVsWillHave: Array<{ topic: string; had: string; willHave: string }>;
  adminPriorities: Array<{ step: string; detail: string; officialUrl?: string }>;
  intro: string;
  warnings: string[];
}

export const EXPAT_COUNTRIES: ExpatCountryProfile[] = [
  {
    slug: "suisse",
    name: "Suisse",
    flag: "🇨🇭",
    currency: "CHF",
    currencyToEurApprox: 1.07, // 1 CHF ≈ 1,07 €
    netConversionFactor: 0.55, // 100 CHF nets = ~55 € pour conserver le même niveau de vie en province
    bestSuitedCities: ["annecy", "thonon-les-bains", "annemasse", "chambery", "grenoble", "lyon", "dijon", "besancon"],
    intro:
      "Le retour de Suisse est probablement le plus violent côté revenu : salaires bruts élevés et fiscalité douce vs un système français lourd en charges. Les villes frontalières (Annecy, Annemasse, Thonon) restent attractives car elles permettent de garder l'emploi suisse. Sinon, viser une métropole secondaire avec un coût de vie bien inférieur à Genève / Zurich.",
    hadVsWillHave: [
      { topic: "Salaire net", had: "100 CHF nets", willHave: "Équivalent ~55 € de pouvoir d'achat (province métropole)" },
      { topic: "Loyer T3", had: "2 800-4 000 CHF (Genève / Lausanne)", willHave: "1 100-1 800 € (Annecy / Lyon / Grenoble)" },
      { topic: "Santé", had: "Assurance LAMal 350-500 CHF/mois (franchise)", willHave: "Sécu + mutuelle 80-200 €/mois" },
      { topic: "Fiscalité revenu", had: "12-25 % effectif", willHave: "20-35 % (TMI + CSG + prélèvements sociaux)" },
      { topic: "Voiture", had: "Diesel à 1.60 CHF/L", willHave: "Diesel à 1.65 €/L (vignette régionale en moins)" },
      { topic: "Garde d'enfants", had: "1 800-3 000 CHF/mois crèche", willHave: "0-450 €/mois après CAF/CMG" },
    ],
    adminPriorities: [
      { step: "Déclarer le retour au consulat & radier", detail: "Avant le départ : se radier du registre des Français à l'étranger, demander attestation de radiation.", officialUrl: "https://www.service-public.fr/particuliers/vosdroits/F33899" },
      { step: "Sécurité sociale", detail: "Transférer le formulaire S1 si vous restez frontalier, sinon ouvrir un dossier CPAM à l'arrivée (Inscription + 3 mois d'attestation d'emploi suisse)." },
      { step: "Fiscalité", detail: "Déclaration revenus rentrée fractionnée année du retour. Maintenir compte bancaire suisse une année (CFE + 3169 Bis si revenus suisses résiduels)." },
      { step: "Permis de conduire", detail: "Permis suisse échangeable contre permis français dans les 12 mois suivant le retour, sinon il faut le repasser." },
      { step: "Scolarité enfants", detail: "Inscription mairie + dossier ASE si déjà scolarisés en CH (équivalences souvent simples vers le collège public)." },
    ],
    warnings: [
      "Maintenir le statut frontalier = garder l'emploi CH + résider à ≤ 60 min de la frontière (Annecy / Annemasse / Thonon / Pontarlier / Mulhouse).",
      "L'impôt CH retenu à la source n'est pas remboursé : déclarer en France et utiliser la convention CH-FR pour ne pas être imposé deux fois.",
      "L'AVS suisse (retraite) reste acquise — exporter les droits via formulaire 7000 EU.",
    ],
  },
  {
    slug: "luxembourg",
    name: "Luxembourg",
    flag: "🇱🇺",
    currency: "EUR",
    currencyToEurApprox: 1.0,
    netConversionFactor: 0.65,
    bestSuitedCities: ["metz", "nancy", "strasbourg", "thionville", "longwy"],
    intro:
      "Le retour du Luxembourg n'a pas le choc de change de la Suisse, mais le différentiel reste majeur sur les salaires nets (LU = 15 % d'impôts effectif vs 25-35 % FR). Beaucoup de Français y restent frontaliers : Metz, Thionville et Longwy sont les ancrages côté France les plus pratiques.",
    hadVsWillHave: [
      { topic: "Salaire net", had: "5 000 € nets cadre LU", willHave: "Équivalent ~3 200 € net en France après charges" },
      { topic: "Loyer T3", had: "1 800-2 500 € à Luxembourg-Ville", willHave: "700-1 100 € à Metz / Nancy" },
      { topic: "TVA", had: "16-17 % (avantage produits)", willHave: "20 % FR standard" },
      { topic: "Carburant", had: "1.40-1.50 € L", willHave: "1.65-1.85 € L" },
      { topic: "Fiscalité revenu", had: "~15 % effectif (célibataire)", willHave: "25-35 % effectif" },
    ],
    adminPriorities: [
      { step: "Maintien ou bascule frontalier", detail: "Si vous gardez l'emploi LU : statut frontalier OK tant que ≥ 75 % du revenu vient du LU et que le pays de résidence change (déclaration des deux côtés)." },
      { step: "Sécurité sociale", detail: "Maintien CNS LU si frontalier + ouverture S1 vers CPAM pour la couverture FR.", officialUrl: "https://www.service-public.fr/particuliers/vosdroits/F33899" },
      { step: "Fiscalité revenu", detail: "Convention LU-FR : imposition au LU, déclaration informative en FR + correction CSG sur revenus non salariés." },
      { step: "Permis", detail: "Permis luxembourgeois reconnu de droit en France — pas d'échange." },
      { step: "Banque", detail: "Garder compte LU une année (allocations familiales rétroactives, primes de fin d'année). RIB FR à ouvrir avant rentrée scolaire." },
    ],
    warnings: [
      "Le 13e mois LU est imposé en France si vous changez de résidence en cours d'année — anticiper avec un expert-comptable.",
      "Les Français de Luxembourg-Ville payent des loyers parmi les plus chers d'Europe : ne pas reproduire ce niveau de dépense au retour.",
    ],
  },
  {
    slug: "belgique",
    name: "Belgique",
    flag: "🇧🇪",
    currency: "EUR",
    currencyToEurApprox: 1.0,
    netConversionFactor: 0.95,
    bestSuitedCities: ["lille", "valenciennes", "tourcoing", "roubaix", "amiens", "reims"],
    intro:
      "Le retour de Belgique est le moins douloureux financièrement : même devise, salaires nets comparables (Belgique paye moins en brut mais ses charges sont proches du système français). Le vrai sujet : la qualité administrative belge est souvent meilleure (santé rapide, mutuelle simple) — anticiper le contraste.",
    hadVsWillHave: [
      { topic: "Salaire net", had: "2 800 € cadre Bruxelles", willHave: "2 600-2 900 € en France équivalent" },
      { topic: "Loyer T3", had: "1 100-1 600 € Bruxelles / Anvers", willHave: "650-1 100 € Lille / Reims / Amiens" },
      { topic: "Santé", had: "Mutuelle + ticket modérateur faible", willHave: "Sécu + mutuelle (compter remboursement plus lent)" },
      { topic: "Garde", had: "Crèche subventionnée (~500€)", willHave: "Crèche FR (~150-400€ après CAF) ou nounou (1 000€ avant aides)" },
      { topic: "Fiscalité revenu", had: "~30-35 % effectif", willHave: "~25-32 % effectif" },
    ],
    adminPriorities: [
      { step: "Sécurité sociale", detail: "Demander le formulaire S1 pour transférer la couverture maladie. Compter 3-6 semaines pour activation côté français.", officialUrl: "https://www.service-public.fr/particuliers/vosdroits/F33899" },
      { step: "Fiscalité revenu", detail: "Déclaration partagée année du retour : revenus belges déclarés en Belgique, revenus français à compter du jour J en France." },
      { step: "Permis", detail: "Permis belge reconnu de droit en France — pas d'échange." },
      { step: "Allocations familiales", detail: "Demander attestation des montants reçus en Belgique + dossier CAF FR dès l'installation (rétroactif 3 mois)." },
      { step: "Scolarité", detail: "Bulletins belges équivalents au système FR — inscription mairie + entretien avec l'établissement pour ajustement." },
    ],
    warnings: [
      "Garder une copie du carnet de mutuelle belge — souvent demandée pour certaines démarches santé en France les 12 premiers mois.",
      "Les indépendants belges (statut d'indépendant complémentaire) doivent fermer leur INASTI avant de redevenir TNS français — éviter le double cumul.",
    ],
  },
  {
    slug: "royaume-uni",
    name: "Royaume-Uni",
    flag: "🇬🇧",
    currency: "GBP",
    currencyToEurApprox: 1.18, // 1 GBP ≈ 1,18 €
    netConversionFactor: 0.7,
    bestSuitedCities: ["lille", "rennes", "nantes", "rouen", "lyon", "bordeaux"],
    intro:
      "Le retour du Royaume-Uni post-Brexit est devenu une démarche officielle complète. Les salaires londoniens, une fois convertis en € et ajustés pour le coût de la vie français, restent confortables hors Paris. Lille (Eurostar) et Rennes (TGV proche) sont des bons compromis pour garder un pied au UK le temps de la transition.",
    hadVsWillHave: [
      { topic: "Salaire net", had: "£ 50k brut/an Londres ~£ 3 100 net/mois", willHave: "~3 100 € équivalent province FR (TMI + charges)" },
      { topic: "Loyer T3", had: "£ 1 800-2 800 Londres zone 2-3", willHave: "850-1 500 € Lyon / Bordeaux / Rennes" },
      { topic: "Santé", had: "NHS gratuit (avec délais)", willHave: "Sécu + mutuelle (~150 €/mois) — accès spécialiste plus rapide" },
      { topic: "Voiture", had: "Insurance £ 800-2 000/an (jeunes / Londres)", willHave: "600-800 €/an en province" },
      { topic: "Fiscalité revenu", had: "20-40 % TMI + NIC", willHave: "Pelvis 11-30 % + CSG 9.7 %" },
    ],
    adminPriorities: [
      { step: "Brexit & permis de séjour", detail: "Si vous résidiez avant le 31/12/2020 : Settled Status à conserver. Si après : visa de travail UK à gérer côté employeur britannique avant le retour FR." },
      { step: "Sécurité sociale", detail: "Demander le S1 NHS → CPAM (formulaire d'inscription rapide).", officialUrl: "https://www.service-public.fr/particuliers/vosdroits/F33899" },
      { step: "Fiscalité revenu", detail: "Convention UK-FR (1968) : éviter la double imposition. P85 (formulaire HMRC sortie) + déclaration FR année du retour." },
      { step: "Permis de conduire", detail: "Échange du permis UK contre permis FR dans les 12 mois (gratuit). Au-delà, repasser le code + conduite." },
      { step: "Compte bancaire", detail: "Garder le compte UK 12 mois (HMRC remboursements potentiels). Ouvrir compte FR dès le retour pour CAF + salaires." },
    ],
    warnings: [
      "Le change EUR/GBP a beaucoup varié depuis le Brexit — ne pas convertir des £ à un taux théorique de 1,40 €, le taux 2026 est autour de 1,15-1,20 €.",
      "Pension UK (state + private) : exportable mais déclaration FR obligatoire — déclarer en revenus étrangers + bénéficier de la convention.",
    ],
  },
  {
    slug: "canada",
    name: "Canada",
    flag: "🇨🇦",
    currency: "CAD",
    currencyToEurApprox: 0.68, // 1 CAD ≈ 0,68 €
    netConversionFactor: 0.85, // 100 CAD nets = ~85 € de pouvoir d'achat équivalent en France
    bestSuitedCities: ["nantes", "rennes", "bordeaux", "lyon", "montpellier", "lille"],
    intro:
      "Le retour du Canada (le plus souvent du Québec) est moins difficile financièrement que la Suisse, mais l'écart de fiscalité est sensible : système canadien plus simple, moins de retenues, vs le système FR à plusieurs étages. Bonus du retour : récupérer l'écosystème social et la sécu publique français après plusieurs années de complémentaire privée canadienne.",
    hadVsWillHave: [
      { topic: "Salaire net", had: "60 000 CAD bruts/an Montréal", willHave: "~3 300 € net/mois équivalent France" },
      { topic: "Loyer T3", had: "1 800-2 500 CAD Montréal", willHave: "850-1 500 € Lyon / Bordeaux / Nantes" },
      { topic: "Santé", had: "RAMQ gratuit Québec (délais)", willHave: "Sécu + mutuelle (accès rapide privé possible)" },
      { topic: "Voiture", had: "Carburant 1.70 CAD/L, assurance 1 200-1 800 CAD/an", willHave: "Carburant 1.70-1.90 €/L, assurance ~600 €/an" },
      { topic: "Garde", had: "CPE 8.85 CAD/jour Québec", willHave: "Crèche FR 150-400 €/mois (après CAF/CMG)" },
    ],
    adminPriorities: [
      { step: "Statut de résidence", detail: "Conserver permis de résidence canadien si retour temporaire (résidence permanente perdue après 3 ans absence cumulée sur 5)." },
      { step: "Sécurité sociale", detail: "Inscription CPAM dès l'arrivée — apporter attestation départ RAMQ + 1 fiche de paie canadienne récente.", officialUrl: "https://www.service-public.fr/particuliers/vosdroits/F33899" },
      { step: "Fiscalité revenu", detail: "Convention FR-CA (1976) : résidence fiscale française à compter du jour J. Déclaration FR + final return canadien (T1 départ)." },
      { step: "Permis", detail: "Permis canadien (ON / QC / BC) échangeable en FR dans les 12 mois — démarche en ligne ANTS." },
      { step: "Retraite", detail: "RRQ / RPC à demander à 60 ans avec un dossier rétroactif ; transfert REER vers PEA non possible (déclarer le REER comme revenu de capital)." },
    ],
    warnings: [
      "Si vous avez un PEL canadien (CELI / REER), le déclarer en France comme revenu d'épargne — ne PAS oublier, sanctions importantes.",
      "Les Français du Canada vivent souvent avec une voiture grande taille (SUV) — anticiper qu'à Lyon / Nantes / Lille la circulation est plus contraignante.",
    ],
  },
];

export function getExpatCountry(slug: string): ExpatCountryProfile | undefined {
  return EXPAT_COUNTRIES.find((c) => c.slug === slug);
}
