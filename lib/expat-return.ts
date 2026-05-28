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

export type ExpatCountry =
  | "suisse"
  | "luxembourg"
  | "belgique"
  | "royaume-uni"
  | "canada"
  | "allemagne"
  | "etats-unis";

export interface ExpatCountryProfile {
  slug: ExpatCountry;
  name: string;
  flag: string;
  depuisLabel?: string; // article après "Rentrer en France depuis" (défaut "le", ex. "les" pour les États-Unis)
  auLabel?: string; // en-tête de colonne du tableau (défaut "Au", ex. "Aux" pour les États-Unis)
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
      { step: "Déclarer le retour au consulat & radier", detail: "Avant le départ : se radier du registre des Français à l'étranger, demander attestation de radiation.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/R43251" },
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
      { step: "Sécurité sociale", detail: "Maintien CNS LU si frontalier + ouverture S1 vers CPAM pour la couverture FR.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32824" },
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
      { step: "Sécurité sociale", detail: "Demander le formulaire S1 pour transférer la couverture maladie. Compter 3-6 semaines pour activation côté français.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32824" },
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
      { step: "Sécurité sociale", detail: "Demander le S1 NHS → CPAM (formulaire d'inscription rapide).", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32824" },
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
      { step: "Sécurité sociale", detail: "Inscription CPAM dès l'arrivée — apporter attestation départ RAMQ + 1 fiche de paie canadienne récente.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32824" },
      { step: "Fiscalité revenu", detail: "Convention FR-CA (1976) : résidence fiscale française à compter du jour J. Déclaration FR + final return canadien (T1 départ)." },
      { step: "Permis", detail: "Permis canadien (ON / QC / BC) échangeable en FR dans les 12 mois — démarche en ligne ANTS." },
      { step: "Retraite", detail: "RRQ / RPC à demander à 60 ans avec un dossier rétroactif ; transfert REER vers PEA non possible (déclarer le REER comme revenu de capital)." },
    ],
    warnings: [
      "Si vous avez un PEL canadien (CELI / REER), le déclarer en France comme revenu d'épargne — ne PAS oublier, sanctions importantes.",
      "Les Français du Canada vivent souvent avec une voiture grande taille (SUV) — anticiper qu'à Lyon / Nantes / Lille la circulation est plus contraignante.",
    ],
  },
  {
    slug: "allemagne",
    name: "Allemagne",
    flag: "🇩🇪",
    currency: "EUR",
    currencyToEurApprox: 1.0,
    netConversionFactor: 0.9, // pas de choc de change ; léger ajustement de pouvoir d'achat selon la ville cible
    bestSuitedCities: ["strasbourg", "mulhouse", "colmar", "forbach", "sarreguemines", "saint-louis-haut-rhin", "metz", "lyon"],
    intro:
      "Le retour d'Allemagne n'a pas de choc de change (zone euro), mais le différentiel de salaire net joue dans les deux sens : un profil qualifié de Munich ou Francfort gagnait davantage, un salarié de l'Est allemand souvent l'équivalent du niveau français. Le vrai sujet, c'est la fiscalité française à plusieurs étages et le coût du logement dans les métropoles allemandes. Avantage géographique : les villes frontalières d'Alsace et de Moselle (Strasbourg, Mulhouse, Colmar, Forbach, Sarreguemines) permettent souvent de conserver l'emploi allemand sous le statut de frontalier.",
    hadVsWillHave: [
      { topic: "Salaire net", had: "2 800-3 500 € net cadre (Munich / Francfort)", willHave: "Équivalent ~2 600-3 200 € net en France après charges" },
      { topic: "Loyer T3", had: "1 200-1 900 € (Munich, Francfort, Hambourg)", willHave: "650-1 200 € (Strasbourg, Metz, Mulhouse)" },
      { topic: "Santé", had: "Assurance publique GKV (~7-8 % du salaire) ou privée PKV", willHave: "Sécu + mutuelle 80-200 €/mois" },
      { topic: "Fiscalité revenu", had: "~30-40 % effectif (impôt + cotisations + Soli)", willHave: "~25-35 % effectif (TMI + CSG + prélèvements sociaux)" },
      { topic: "Voiture", had: "Carburant ~1,75 €/L, autoroutes gratuites", willHave: "Carburant 1,65-1,85 €/L, péages autoroutiers" },
      { topic: "Garde d'enfants", had: "Kita souvent gratuite ou ~100-300 €/mois selon le Land", willHave: "Crèche FR 150-400 €/mois après CAF/CMG" },
    ],
    adminPriorities: [
      { step: "Déclarer le retour au consulat & radier", detail: "Avant le départ : se radier du registre des Français établis hors de France et demander l'attestation de radiation.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/R43251" },
      { step: "Clôturer le domicile allemand", detail: "Faire l'Abmeldung (déclaration de départ) au Bürgeramt avant de partir : sans elle, l'impôt local et la redevance audiovisuelle (Rundfunkbeitrag) continuent de courir." },
      { step: "Sécurité sociale", detail: "Ouvrir un dossier CPAM à l'arrivée avec l'attestation de fin d'affiliation à la Krankenkasse ; demander le formulaire S1 si vous restez frontalier en emploi allemand.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32824" },
      { step: "Fiscalité revenu", detail: "Convention fiscale FR-DE : résidence fiscale française à compter du jour J. Déclaration fractionnée l'année du retour côté français + Steuererklärung de départ côté allemand." },
      { step: "Permis & scolarité", detail: "Permis allemand reconnu de droit en France (UE), pas d'échange obligatoire. Pour les enfants, inscription en mairie + entretien d'équivalence avec l'établissement (le système Gymnasium / Realschule diffère du collège-lycée français)." },
    ],
    warnings: [
      "Le statut de frontalier permet de garder un emploi allemand depuis Strasbourg, Mulhouse, Colmar, Forbach ou Sarreguemines : il suppose de résider et travailler dans les zones frontalières définies par la convention et de rentrer chez soi régulièrement.",
      "Pensez à clôturer l'Anmeldung par une Abmeldung et à résilier le Rundfunkbeitrag : oubliés, ils génèrent des relances et des frais après votre retour.",
      "Les droits à la retraite cotisés auprès de la Deutsche Rentenversicherung sont conservés et totalisés au niveau européen — conservez tous vos relevés de cotisation.",
    ],
  },
  {
    slug: "etats-unis",
    name: "États-Unis",
    flag: "🇺🇸",
    depuisLabel: "les",
    auLabel: "Aux",
    currency: "USD",
    currencyToEurApprox: 0.92, // 1 USD ≈ 0,92 € (EUR/USD autour de 1,08 début 2026, estimé)
    netConversionFactor: 0.72, // 100 USD nets ≈ 72 € de pouvoir d'achat pour vivre pareil en province
    bestSuitedCities: ["paris", "lyon", "bordeaux", "nantes", "toulouse", "montpellier", "nice", "rennes"],
    intro:
      "Le retour des États-Unis cumule deux chocs : un choc de change (le dollar pèse moins qu'un euro) et un choc de modèle social. On quitte des salaires bruts élevés, une assurance santé privée chère et une fiscalité à plusieurs niveaux (fédéral, État, FICA) pour retrouver la Sécu, des charges plus lourdes mais une couverture maladie qui ne dépend plus de l'employeur. Le vrai sujet n'est pas le niveau de vie — il reste confortable hors Paris — mais la double fiscalité quand on est binational : les États-Unis taxent leurs citoyens sur le revenu mondial, à vie. Les métropoles connectées à l'international (Paris, Lyon, Bordeaux, Nantes, Toulouse) facilitent la transition, notamment pour garder un employeur américain en télétravail.",
    hadVsWillHave: [
      { topic: "Salaire net", had: "6 000-9 000 USD net/mois (cadre tech / finance, hors stock-options)", willHave: "Équivalent ~3 500-4 500 € net en France après charges" },
      { topic: "Loyer T3", had: "3 000-5 000 USD (New York / San Francisco / Boston)", willHave: "900-1 600 € (Lyon, Bordeaux, Nantes, Toulouse)" },
      { topic: "Santé", had: "Assurance privée 500-1 500 USD/mois (prime employeur + franchise élevée)", willHave: "Sécu + mutuelle 80-200 €/mois, sans condition d'emploi" },
      { topic: "Garde d'enfants", had: "Daycare 1 500-2 500 USD/mois (grandes villes)", willHave: "Crèche 150-400 €/mois après CAF/CMG, ou maternelle gratuite dès 3 ans" },
      { topic: "Fiscalité revenu", had: "Federal + State + FICA, ~25-40 % effectif selon l'État", willHave: "~25-40 % effectif (TMI + CSG + prélèvements sociaux)" },
      { topic: "Voiture", had: "Carburant ~0,80-1,00 €/L équivalent, assurance modérée", willHave: "Carburant 1,65-1,95 €/L, assurance ~600-800 €/an en province" },
    ],
    adminPriorities: [
      { step: "Déclarer le retour au consulat & radier", detail: "Avant le départ : se radier du registre des Français établis hors de France et conserver l'attestation de radiation, utile pour la CAF et la CPAM.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/R43251" },
      { step: "Sécurité sociale", detail: "Pas de formulaire S1 (les États-Unis ne sont pas dans l'UE) : ouvrir un dossier CPAM dès l'arrivée avec un justificatif de résidence et la fin de couverture de l'assureur américain. Prévoir une assurance privée pour le délai d'instruction.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32824" },
      { step: "Fiscalité revenu", detail: "Convention fiscale FR-US (1994) : résidence fiscale française à compter du jour J. Déclaration fractionnée en France l'année du retour + dernière déclaration américaine (1040 dual-status). FBAR à déposer si comptes étrangers dépassant 10 000 USD." },
      { step: "Permis de conduire", detail: "L'échange du permis dépend de l'État d'émission : seuls les États ayant un accord de réciprocité avec la France permettent l'échange sans repasser l'examen. Sinon, repasser le code et la conduite. Démarche en ligne via l'ANTS." },
      { step: "Épargne retraite (401(k) / IRA)", detail: "Conserver les relevés et déclarer les comptes en France : la fiscalité des retraits diffère et les fonds américains (PFIC) sont lourdement taxés pour les binationaux. Ne rien liquider avant un avis fiscal transatlantique." },
    ],
    warnings: [
      "Citoyenneté américaine ou binationalité : les États-Unis taxent sur le revenu mondial à vie. Vous continuerez à déclarer (1040, FBAR, FATCA) même résident fiscal français — consultez un conseil fiscal franco-américain avant le retour.",
      "Aucune totalisation santé entre les deux pays : la couverture américaine s'arrête net. Ouvrez la CPAM immédiatement et gardez une assurance privée temporaire pour combler le délai.",
      "Le change EUR/USD varie fortement : ne convertissez pas vos dollars à un taux théorique de 1,15 €, le taux 2026 est plutôt autour de 0,90-0,95 € pour 1 USD.",
      "Stock-options et RSU acquis aux États-Unis : leur imposition à cheval sur deux pays est complexe — anticipez la vente et la déclaration avec un expert-comptable.",
    ],
  },
];

export function getExpatCountry(slug: string): ExpatCountryProfile | undefined {
  return EXPAT_COUNTRIES.find((c) => c.slug === slug);
}
