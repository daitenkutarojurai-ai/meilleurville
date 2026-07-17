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
  | "etats-unis"
  | "espagne"
  | "portugal"
  | "pays-bas"
  | "italie"
  | "maroc"
  | "emirats-arabes-unis"
  | "australie"
  | "irlande"
  | "singapour"
  | "japon";

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
  {
    slug: "espagne",
    name: "Espagne",
    flag: "🇪🇸",
    depuisLabel: "l'",
    auLabel: "En",
    currency: "EUR",
    currencyToEurApprox: 1.0,
    netConversionFactor: 0.85, // 100 € nets en Espagne valent environ 85 € de pouvoir d'achat en France hors Paris (coût de la vie plus élevé en France)
    bestSuitedCities: ["perpignan", "hendaye", "bayonne", "biarritz", "saint-jean-de-luz", "toulouse", "montpellier", "pau"],
    intro:
      "Le retour d'Espagne est l'un des plus doux côté change (zone euro) mais l'un des plus contrastés côté pouvoir d'achat : on quitte des loyers et un panier alimentaire 20 à 30 % moins chers qu'en France pour retrouver une fiscalité plus lourde, une administration plus lente et un climat moins clément. Pour les actifs qualifiés, l'écart de salaire net joue en défaveur de l'Espagne (sauf statut Beckham à Madrid) — le retour signifie souvent un meilleur salaire net français. Les villes frontalières (Perpignan, Hendaye, Bayonne, Saint-Jean-de-Luz) restent les ancrages les plus naturels pour conserver un pied au sud des Pyrénées, et Toulouse / Montpellier offrent un climat et un art de vivre proches de la Catalogne ou du Levante.",
    hadVsWillHave: [
      { topic: "Salaire net", had: "1 800-2 500 € net cadre (Madrid / Barcelone)", willHave: "Équivalent ~2 200-3 000 € net en France après charges" },
      { topic: "Loyer T3", had: "1 100-1 700 € (centre Madrid / Barcelone)", willHave: "650-1 200 € (Perpignan, Toulouse, Montpellier, Bayonne)" },
      { topic: "Panier alimentaire", had: "Environ 20-30 % moins cher (Mercadona, marchés)", willHave: "Reprise du niveau français (Lidl / Carrefour, marchés)" },
      { topic: "Santé", had: "SNS publique gratuite (délais variables selon CCAA)", willHave: "Sécu + mutuelle 80-200 €/mois, accès spécialiste souvent plus rapide" },
      { topic: "Fiscalité revenu", had: "~19-30 % effectif (IRPF + cotisations modestes)", willHave: "~25-35 % effectif (TMI + CSG + prélèvements sociaux)" },
      { topic: "Garde d'enfants", had: "Escuela infantil 300-600 €/mois (publique / concertée)", willHave: "Crèche FR 150-400 €/mois après CAF/CMG, maternelle gratuite dès 3 ans" },
      { topic: "Voiture", had: "Carburant ~1,45-1,60 €/L, péages réduits", willHave: "Carburant 1,65-1,85 €/L, péages autoroutiers plus fréquents" },
    ],
    adminPriorities: [
      { step: "Déclarer le retour au consulat & radier", detail: "Avant le départ : se radier du registre des Français établis hors de France et conserver l'attestation, utile pour la CAF et la CPAM.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/R43251" },
      { step: "Baja consulaire & padrón", detail: "Demander la baja del padrón à la mairie espagnole (ayuntamiento) pour stopper la résidence fiscale et les services municipaux. Indispensable pour éviter les relances de l'IBI et de l'IRPF résident." },
      { step: "Sécurité sociale", detail: "Demander le formulaire S1 à la Seguridad Social espagnole avant le départ pour le transmettre à la CPAM. Compter 3-6 semaines pour activation côté français.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32824" },
      { step: "Fiscalité revenu", detail: "Convention fiscale FR-ES (1995) : résidence fiscale française à compter du jour J. Déclaration fractionnée l'année du retour côté français + dernière declaración de la renta en Espagne (modelo 100) la dernière année de résidence." },
      { step: "Permis & scolarité", detail: "Permis espagnol reconnu de droit en France (UE), pas d'échange obligatoire mais demande utile pour récupérer un titre français en cas de perte. Pour les enfants, inscription en mairie + entretien d'équivalence (le système ESO / Bachillerato diffère du collège-lycée français)." },
    ],
    warnings: [
      "Modelo 720 / 721 : si vous déteniez des actifs hors d'Espagne (comptes, placements) supérieurs à 50 000 €, vérifier que la dernière déclaration a bien été déposée — les pénalités espagnoles pour omission, même après le retour, peuvent être lourdes.",
      "Statut Beckham (Madrid principalement) : si vous en bénéficiiez, il prend fin au moment du départ. La fiscalité française récupère alors les revenus à compter du jour J — anticiper avec un conseil fiscal hispano-français pour les stock-options et bonus.",
      "Climat et art de vivre : le contraste est réel hors façade méditerranéenne. Si vous rentrez de Valence ou Séville, viser Perpignan, Montpellier, Toulouse ou la Côte basque plutôt qu'une métropole du nord pour adoucir la transition.",
      "Pension espagnole : les trimestres cotisés à la Seguridad Social sont totalisés au niveau européen avec ceux de l'Assurance retraite française — conservez tous vos vida laboral et bulletins de cotisation.",
    ],
  },
  {
    slug: "portugal",
    name: "Portugal",
    flag: "🇵🇹",
    depuisLabel: "le",
    auLabel: "Au",
    currency: "EUR",
    currencyToEurApprox: 1.0,
    netConversionFactor: 0.8, // 100 € nets au Portugal valent environ 80 € de pouvoir d'achat en France hors Paris (logement et alimentaire plus chers en France)
    bestSuitedCities: ["bordeaux", "bayonne", "biarritz", "saint-jean-de-luz", "pau", "nantes", "toulouse", "montpellier"],
    intro:
      "Le retour du Portugal est en pleine recomposition depuis la réforme du Résident Non Habituel : la fin du RNH classique fin 2023 et l'arrivée du dispositif IFICI plus restreint ont changé l'équation fiscale pour beaucoup de retraités et de cadres français installés à Lisbonne, Porto ou en Algarve. Côté change, aucun choc (zone euro), mais le pouvoir d'achat se contracte au retour : les loyers et le panier alimentaire portugais des dix dernières années ont monté fortement, sans rattraper le niveau français. Les villes les plus naturelles pour la transition sont la façade atlantique (Bordeaux, Bayonne, Biarritz, Saint-Jean-de-Luz, Pau, Nantes) qui rappelle l'art de vivre lusitanien, et l'arc méditerranéen (Toulouse, Montpellier) pour les profils plus solaires.",
    hadVsWillHave: [
      { topic: "Salaire net", had: "1 500-2 500 € net cadre (Lisbonne / Porto)", willHave: "Équivalent ~2 000-2 800 € net en France après charges" },
      { topic: "Loyer T3", had: "1 100-1 800 € (centre Lisbonne / Porto)", willHave: "700-1 300 € (Bordeaux, Bayonne, Pau, Nantes, Toulouse)" },
      { topic: "Panier alimentaire", had: "Environ 15-25 % moins cher (Pingo Doce, Continente, marchés)", willHave: "Reprise du niveau français (Lidl, Carrefour, marchés)" },
      { topic: "Santé", had: "SNS publique gratuite ou symbolique (délais longs) + ADSE / privé courant", willHave: "Sécu + mutuelle 80-200 €/mois, accès spécialiste plus structuré" },
      { topic: "Fiscalité revenu", had: "~14-28 % effectif (IRS standard) ou taux réduit RNH/IFICI selon profil", willHave: "~25-35 % effectif (TMI + CSG + prélèvements sociaux)" },
      { topic: "Garde d'enfants", had: "Crèche privée 350-600 €/mois ou publique sous condition de ressources", willHave: "Crèche FR 150-400 €/mois après CAF/CMG, maternelle gratuite dès 3 ans" },
      { topic: "Voiture", had: "Carburant ~1,70-1,85 €/L, péages autoroutiers fréquents", willHave: "Carburant 1,65-1,85 €/L, péages présents mais réseau ferroviaire plus dense" },
    ],
    adminPriorities: [
      { step: "Déclarer le retour au consulat & radier", detail: "Avant le départ : se radier du registre des Français établis hors de France et conserver l'attestation de radiation, utile pour la CAF et la CPAM.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/R43251" },
      { step: "Mettre à jour le NIF et fermer le dossier fiscal portugais", detail: "Demander la mise à jour de l'adresse fiscale au Portal das Finanças avant de partir, puis transmettre la dernière déclaration de revenus (modelo 3) en tant que résident pour clôturer proprement le dossier. Conserver l'accès au NIF pour les démarches résiduelles." },
      { step: "Sécurité sociale", detail: "Demander le formulaire S1 à la Segurança Social portugaise avant le départ pour le transmettre à la CPAM. Compter 3-6 semaines pour activation côté français.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32824" },
      { step: "Fiscalité revenu", detail: "Convention fiscale FR-PT (1971, révisée 2024) : résidence fiscale française à compter du jour J. Déclaration fractionnée l'année du retour côté français + dernière declaração de IRS au Portugal. Le statut RNH/IFICI prend fin avec le départ — anticiper la sortie avec un conseil fiscal franco-portugais, surtout pour les revenus passifs et de retraite." },
      { step: "Permis & scolarité", detail: "Permis portugais reconnu de droit en France (UE), pas d'échange obligatoire mais demande utile en cas de perte ou de vol. Pour les enfants, inscription en mairie + entretien d'équivalence (le système ensino básico / secundário diffère du collège-lycée français)." },
    ],
    warnings: [
      "Sortie du RNH / IFICI : le statut résident non habituel prend fin avec le départ. Si vous bénéficiiez du taux réduit sur les retraites ou les revenus de source étrangère, anticipez la bascule vers le barème français — l'écart peut représenter plusieurs milliers d'euros par an pour les retraites privées.",
      "Convention fiscale révisée en 2024 : l'avenant vise à éviter la double non-imposition (notamment sur les pensions privées). Vérifiez votre situation avec un conseil fiscal franco-portugais avant de planifier le retour, surtout pour les retraités.",
      "Loyers portugais en hausse : si vous avez gardé un T3 à Lisbonne ou Porto au tarif d'il y a cinq ans, la revente ou la résiliation peut être plus complexe que prévu. Anticipez le préavis de 30 à 90 jours selon le bail et conservez les justificatifs.",
      "Pension portugaise : les trimestres cotisés à la Segurança Social sont totalisés au niveau européen avec ceux de l'Assurance retraite française — conservez tous vos relevés de carrière (carreira contributiva) et bulletins de salaire.",
      "Compte bancaire portugais : garder le compte ouvert 6 à 12 mois après le départ facilite les régularisations IRS, le remboursement de la caution de location et le versement d'éventuels arriérés d'allocations.",
    ],
  },
  {
    slug: "pays-bas",
    name: "Pays-Bas",
    flag: "🇳🇱",
    depuisLabel: "les",
    auLabel: "Aux",
    currency: "EUR",
    currencyToEurApprox: 1.0,
    netConversionFactor: 0.95, // 100 € nets aux Pays-Bas valent environ 95 € de pouvoir d'achat en France hors Paris — niveau de vie globalement comparable, logement plus cher côté NL, alimentaire légèrement moins cher
    bestSuitedCities: ["lille", "roubaix", "tourcoing", "dunkerque", "calais", "valenciennes", "paris", "strasbourg", "reims"],
    intro:
      "Le retour des Pays-Bas n'a pas de choc de change (zone euro) et l'écart de niveau de vie reste mesuré pour la plupart des profils : salaires comparables aux métropoles françaises hors Paris, fiscalité néerlandaise un peu plus lourde sur les hauts revenus, logement structurellement plus cher côté NL. Le vrai sujet, c'est la fin du dispositif fiscal 30 %-régime (déjà raboté en 2024-2026) qui rendait l'expatriation très favorable aux cadres internationaux d'Amsterdam, Eindhoven ou La Haye — sans lui, l'arbitrage fiscal s'inverse fréquemment au profit de la France. Côté ancrage géographique, l'arc Hauts-de-France (Lille, Roubaix, Tourcoing, Valenciennes, Dunkerque, Calais) est connecté à Amsterdam et Rotterdam par Thalys/Eurostar en 3-4 h ; Paris reste l'option télétravail pour conserver un employeur néerlandais à distance.",
    hadVsWillHave: [
      { topic: "Salaire net", had: "3 000-4 500 € net cadre (Amsterdam / Eindhoven / La Haye, hors 30 %-régime)", willHave: "Équivalent ~2 800-3 800 € net en France après charges" },
      { topic: "Loyer T3", had: "1 800-2 800 € (Amsterdam, Utrecht), 1 400-2 000 € (Rotterdam, La Haye, Eindhoven)", willHave: "650-1 200 € (Lille, Reims, Strasbourg), 1 600-2 400 € (Paris)" },
      { topic: "Santé", had: "Zorgverzekering privée obligatoire 140-170 €/mois + franchise 385 €/an", willHave: "Sécu + mutuelle 80-200 €/mois, accès médecin de famille structuré" },
      { topic: "Fiscalité revenu", had: "~36-37 % box 1 jusqu'à 75 k€, 49,5 % au-delà + box 3 sur l'épargne", willHave: "~25-35 % effectif (TMI + CSG + prélèvements sociaux)" },
      { topic: "TVA", had: "21 % standard / 9 % réduit", willHave: "20 % standard / 5,5 % alimentaire" },
      { topic: "Voiture", had: "Carburant ~2,05-2,15 €/L, taxe BPM à l'immatriculation, péages limités", willHave: "Carburant 1,65-1,85 €/L, pas de BPM, péages autoroutiers fréquents" },
      { topic: "Vélo & transports", had: "Réseau cyclable et NS train denses, voiture souvent superflue", willHave: "TER + métro métropoles, dépendance voiture en zone périurbaine" },
      { topic: "Garde d'enfants", had: "Kinderopvang 8-9 €/h avec kinderopvangtoeslag, plafond élevé", willHave: "Crèche FR 150-400 €/mois après CAF/CMG, maternelle gratuite dès 3 ans" },
    ],
    adminPriorities: [
      { step: "Déclarer le retour au consulat & radier", detail: "Avant le départ : se radier du registre des Français établis hors de France et conserver l'attestation, indispensable pour la CAF et la CPAM.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/R43251" },
      { step: "Uitschrijving BRP", detail: "Faire la déclaration de départ (uitschrijving) à la gemeente au moins 5 jours avant le départ effectif : sans elle, vous restez résident fiscal néerlandais et la zorgverzekering continue de courir, déclenchant des relances de la Belastingdienst." },
      { step: "Sécurité sociale", detail: "Demander le formulaire S1 à la Sociale Verzekeringsbank (SVB) avant le départ pour le transmettre à la CPAM. Résilier la zorgverzekering avec la date exacte d'uitschrijving — sinon double prélèvement.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32824" },
      { step: "Fiscalité revenu", detail: "Convention fiscale FR-NL (1973, avenant 2022) : résidence fiscale française à compter du jour J. Déclaration fractionnée l'année du retour côté français + dernière aangifte inkomstenbelasting comme résident côté néerlandais (M-formulier pour année partielle)." },
      { step: "Permis & scolarité", detail: "Permis néerlandais reconnu de droit en France (UE), pas d'échange obligatoire mais demande utile en cas de perte. Pour les enfants, inscription en mairie + entretien d'équivalence (le système basisschool / VMBO / HAVO / VWO diffère du collège-lycée français)." },
    ],
    warnings: [
      "Fin du 30 %-régime : depuis 2024 la facilité fiscale a été plafonnée puis dégressive (30 % → 20 % → 10 % sur cinq ans), et resserrée en 2025-2026 vers ~27 %. Si vous en bénéficiez encore, anticipez la bascule vers le barème néerlandais standard avant le départ — l'écart de net peut être significatif et brouille la comparaison avec la France.",
      "Box 3 (épargne et placements) : les Pays-Bas appliquent une imposition forfaitaire sur les rendements supposés de l'épargne et des placements, contestée depuis l'arrêt Hoge Raad de 2021. Si vous avez réclamé un trop-perçu, le dossier peut courir après le départ — gardez l'accès au DigiD le temps de la régularisation.",
      "Hypotheek et résidence principale : la déductibilité des intérêts d'emprunt (hypotheekrenteaftrek) prend fin avec la perte du statut résident. Si vous gardez le bien aux Pays-Bas en location, le revenu locatif bascule en box 3 et la fiscalité change — consulter un fiscaliste avant le départ.",
      "Pension AOW et complémentaire : les trimestres cotisés à la Sociale Verzekeringsbank sont totalisés au niveau européen avec ceux de l'Assurance retraite française. Les complémentaires (pensioenfonds : ABP, PFZW, PME, PMT) restent acquises mais les conditions de sortie anticipée diffèrent — conservez tous les pensioenoverzicht annuels.",
      "Logement français en zone tendue : si vous ciblez Lille, Paris ou Strasbourg, anticipez 2-3 mois pour décrocher un T3 avec dossier d'expat (employeur étranger sortant, pas de fiches de paie FR récentes). Prévoir un garant Visale ou un employeur français déjà signé avant l'arrivée.",
    ],
  },
  {
    slug: "italie",
    name: "Italie",
    flag: "🇮🇹",
    depuisLabel: "l'",
    auLabel: "En",
    currency: "EUR",
    currencyToEurApprox: 1.0,
    netConversionFactor: 1.0, // 100 € nets en Italie valent environ 100 € de pouvoir d'achat en France hors Paris — coût de la vie globalement comparable, alimentaire un peu moins cher côté IT, logement plus cher dans les grandes métropoles italiennes
    bestSuitedCities: ["nice", "menton", "cannes", "antibes", "lyon", "marseille", "aix-en-provence", "chambery", "grenoble", "bastia", "ajaccio"],
    intro:
      "Le retour d'Italie n'a pas de choc de change (zone euro), et l'écart de niveau de vie est l'un des plus modestes parmi les destinations couvertes : salaires italiens plus bas que les français pour un poste équivalent, mais coût de la vie également plus bas — l'arbitrage net se joue souvent à quelques points près. Le vrai sujet, c'est la fiscalité italienne avec ses régimes spécifiques (impatriati, regime forfettario, flat tax pour les retraités au Sud) qui pouvaient rendre l'expatriation très favorable et dont la sortie ramène mécaniquement vers le barème français. Côté ancrage géographique, la Côte d'Azur (Nice, Menton, Cannes, Antibes) est à moins de 30 minutes de la frontière ligure et permet de garder un pied en Italie ; Lyon offre un TGV vers Turin et Milan en 4-5 h ; la Corse (Bastia, Ajaccio) reste la proximité maritime naturelle.",
    hadVsWillHave: [
      { topic: "Salaire net", had: "1 600-2 600 € net cadre (Milan / Rome / Turin)", willHave: "Équivalent ~2 200-3 000 € net en France après charges" },
      { topic: "Loyer T3", had: "1 300-2 200 € (centre Milan / Rome), 800-1 400 € (Turin / Bologne / Florence)", willHave: "650-1 200 € (Nice, Lyon, Marseille, Aix-en-Provence), 900-1 600 € selon le quartier" },
      { topic: "Panier alimentaire", had: "Environ 10-20 % moins cher (Esselunga, Conad, marchés)", willHave: "Reprise du niveau français (Lidl, Carrefour, marchés)" },
      { topic: "Santé", had: "SSN publique gratuite (qualité variable selon la région : Nord souvent meilleur que Sud)", willHave: "Sécu + mutuelle 80-200 €/mois, accès spécialiste plus uniforme sur le territoire" },
      { topic: "Fiscalité revenu", had: "~23-43 % IRPEF + addizionali régionales et communales (jusqu'à ~3 % cumulés)", willHave: "~25-35 % effectif (TMI + CSG + prélèvements sociaux)" },
      { topic: "Garde d'enfants", had: "Asilo nido 200-600 €/mois selon la commune et le revenu (ISEE)", willHave: "Crèche FR 150-400 €/mois après CAF/CMG, maternelle gratuite dès 3 ans" },
      { topic: "Voiture", had: "Carburant ~1,85-2,00 €/L, péages autoroutiers fréquents, bollo annuel selon le véhicule", willHave: "Carburant 1,65-1,85 €/L, péages présents, pas de taxe annuelle sur le véhicule" },
    ],
    adminPriorities: [
      { step: "Déclarer le retour au consulat & radier", detail: "Avant le départ : se radier du registre des Français établis hors de France et conserver l'attestation de radiation, utile pour la CAF et la CPAM.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/R43251" },
      { step: "Cancellazione AIRE et anagrafe", detail: "Demander la cancellazione de l'AIRE (Anagrafe degli Italiani Residenti all'Estero) si vous y étiez inscrit en tant que résident étranger, et signaler le départ à l'anagrafe communale italienne. Sans cette démarche, vous restez résident fiscal italien et les services municipaux continuent d'être facturés." },
      { step: "Sécurité sociale", detail: "Demander le formulaire S1 à l'INPS avant le départ pour le transmettre à la CPAM. Compter 3-6 semaines pour activation côté français. Si vous étiez à la Tessera Sanitaria régionale, la couverture s'arrête avec le départ.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32824" },
      { step: "Fiscalité revenu", detail: "Convention fiscale FR-IT (1989) : résidence fiscale française à compter du jour J. Déclaration fractionnée l'année du retour côté français + dernière dichiarazione dei redditi (modello 730 ou Redditi PF) comme résident italien. Les régimes spéciaux (impatriati, forfettario, flat tax retraités du Sud) prennent fin avec le départ." },
      { step: "Permis & scolarité", detail: "Permis italien reconnu de droit en France (UE), pas d'échange obligatoire mais demande utile en cas de perte. Pour les enfants, inscription en mairie + entretien d'équivalence (le système scuola primaria / media / superiore diffère du collège-lycée français, mais les équivalences sont bien établies)." },
    ],
    warnings: [
      "Fin des régimes fiscaux spéciaux : le régime impatriati (réduction de 50-70 % de la base imposable sur le revenu d'activité), le regime forfettario (taux unique 15 % pour TNS sous plafond) et la flat tax 7 % pour retraités étrangers au Sud (Pouilles, Calabre, Sicile, Sardaigne) prennent fin avec le départ. Anticiper la bascule vers le barème français avec un conseil fiscal franco-italien, surtout pour les retraités et les indépendants — l'écart peut représenter plusieurs milliers d'euros par an.",
      "IVIE et IVAFE : si vous déteniez un bien immobilier ou des comptes hors d'Italie pendant votre résidence italienne, vérifier que les déclarations IVIE (taxe sur l'immobilier étranger) et IVAFE (taxe sur les actifs financiers étrangers) sont à jour avant le départ — les pénalités italiennes pour omission, même après le retour, peuvent être lourdes.",
      "Logement gardé en Italie : si vous conservez un appartement à Milan, Rome ou Florence en location, le revenu locatif bascule sous la fiscalité non-résident italienne (cedolare secca ou IRPEF selon l'option) et doit être déclaré en France au titre des revenus fonciers étrangers — anticiper le double régime avec un fiscaliste.",
      "Pension italienne : les contributi cotisés auprès de l'INPS sont totalisés au niveau européen avec ceux de l'Assurance retraite française — conservez tous vos estratto conto contributivo et bulletins de cotisation. Les pensions complémentaires (fondi pensione : Cometa, Fonchim, etc.) restent acquises mais les conditions de sortie diffèrent.",
      "Voiture immatriculée en Italie : pour rouler en France, il faut ré-immatriculer le véhicule dans les 6 mois suivant le retour (quitus fiscal douanier + contrôle technique français). Anticiper le coût (taxes éventuelles si véhicule récent).",
    ],
  },
  {
    slug: "maroc",
    name: "Maroc",
    flag: "🇲🇦",
    depuisLabel: "le",
    auLabel: "Au",
    currency: "MAD",
    currencyToEurApprox: 0.092, // 1 MAD ≈ 0,092 € (autour de 10,8 MAD pour 1 € début 2026, estimé)
    netConversionFactor: 0.22, // 100 MAD nets correspondent à environ 22 € de pouvoir d'achat en France hors Paris : la France reste structurellement 2 à 2,5 fois plus chère que le Maroc sur le panier moyen (logement, alimentaire, services)
    bestSuitedCities: ["marseille", "montpellier", "toulouse", "perpignan", "lyon", "bordeaux", "nice", "aix-en-provence", "paris"],
    intro:
      "Le retour du Maroc cumule deux particularités : un choc de change (le dirham n'est que partiellement convertible, les transferts vers l'Europe sont plafonnés et contrôlés par l'Office des changes) et un saut de pouvoir d'achat à l'inverse de la plupart des autres pays couverts — on quitte un coût de la vie sensiblement plus bas (loyers, alimentaire, services) pour retrouver une France beaucoup plus chère, surtout côté logement. Côté fiscal, la convention bilatérale de 1970 (révisée) évite la double imposition mais la résidence fiscale française récupère immédiatement les revenus mondiaux. Côté ancrage géographique, l'arc méditerranéen et atlantique reste le plus naturel pour les retours : Marseille (ferries Tanger-Med, communauté maghrébine dense, vols quotidiens vers Casablanca), Montpellier, Toulouse, Perpignan, Lyon, Bordeaux et Nice cumulent climat doux, vols directs vers le Maroc et écoles internationales pour les enfants scolarisés à l'AEFE.",
    hadVsWillHave: [
      { topic: "Salaire net", had: "15 000-30 000 MAD net cadre (Casablanca, Rabat, Tanger Med)", willHave: "Équivalent ~2 200-3 200 € net en France après charges (cadre métropole)" },
      { topic: "Loyer T3", had: "7 000-15 000 MAD (centre Casablanca, Rabat Agdal, Marrakech Gueliz)", willHave: "650-1 200 € (Marseille, Montpellier, Toulouse, Perpignan), 1 600-2 400 € (Paris)" },
      { topic: "Panier alimentaire", had: "Environ 40-50 % moins cher (Marjane, Carrefour MA, souks)", willHave: "Reprise du niveau français (Lidl, Carrefour, marchés)" },
      { topic: "Santé", had: "CNSS + AMO ou mutuelle CNOPS, cliniques privées courantes (consultations 300-700 MAD)", willHave: "Sécu + mutuelle 80-200 €/mois, plateau technique public plus uniforme sur le territoire" },
      { topic: "Fiscalité revenu", had: "IR progressif de 0 à 38 % au Maroc (tranche marginale élevée dès ~180 000 MAD/an)", willHave: "~25-35 % effectif (TMI + CSG + prélèvements sociaux)" },
      { topic: "Garde d'enfants", had: "Crèche privée 1 500-3 500 MAD/mois, école française AEFE 30 000-80 000 MAD/an", willHave: "Crèche FR 150-400 €/mois après CAF/CMG, maternelle publique gratuite dès 3 ans" },
      { topic: "Voiture", had: "Diesel ~13-14 MAD/L, vignette annuelle modeste, embouteillages Casa/Rabat lourds", willHave: "Diesel 1,65-1,85 €/L, péages autoroutiers fréquents, alternatives TER/TGV plus denses" },
      { topic: "Personnel de maison", had: "Femme de ménage 1 500-3 500 MAD/mois temps plein courant", willHave: "Coût équivalent multiplié par 3-5 en France, rarement temps plein hors familles à très haut revenu" },
    ],
    adminPriorities: [
      { step: "Déclarer le retour au consulat & radier", detail: "Avant le départ : se radier du registre des Français établis hors de France auprès du consulat (Casablanca, Rabat, Tanger, Agadir, Marrakech, Fès) et conserver l'attestation de radiation, utile pour la CAF et la CPAM.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/R43251" },
      { step: "Office des changes & transfert des avoirs", detail: "Le dirham n'est pas une devise librement convertible. Pour rapatrier durablement vos économies, vous avez deux voies : (1) compte en dirhams convertibles si vous étiez salarié d'une entreprise marocaine et inscrit comme résident étranger — dossier à constituer auprès de votre banque marocaine avant le départ ; (2) déclaration à l'Office des changes pour transferts résiduels après le retour. Anticipez : les délais bancaires marocains pour clôtures et transferts peuvent dépasser deux mois." },
      { step: "Sécurité sociale", detail: "Pas de formulaire S1 (le Maroc n'est pas dans l'UE) : ouvrir un dossier CPAM dès l'arrivée avec un justificatif de résidence et la fin d'affiliation à la CNSS ou à votre mutuelle privée marocaine. Prévoir une assurance privée pour le délai d'instruction (3-6 semaines).", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32824" },
      { step: "Fiscalité revenu", detail: "Convention fiscale FR-MA (1970, révisée 1989) : résidence fiscale française à compter du jour J. Déclaration fractionnée l'année du retour côté français + dernière déclaration IR au Maroc (régularisation auprès de la DGI). Pour les binationaux ayant conservé une activité ou un bien locatif au Maroc, les revenus restent imposables au Maroc avec crédit d'impôt en France." },
      { step: "Permis de conduire", detail: "Le permis marocain est échangeable contre un permis français dans les 12 mois suivant le retour grâce à l'accord de réciprocité FR-MA. Au-delà, il faut repasser le code et la conduite. Démarche en ligne via l'ANTS, sur présentation du titre marocain et de la traduction assermentée." },
    ],
    warnings: [
      "Non-convertibilité du dirham : ne tablez pas sur un rapatriement instantané de vos économies. Les transferts vers l'étranger sont soumis à autorisation de l'Office des changes et plafonnés selon votre statut (résident étranger, MRE, salarié sortant). Anticipez 2-6 mois et consultez votre banque marocaine avant le départ.",
      "Régime CFE pour les Français résidant au Maroc : si vous étiez affilié à la Caisse des Français de l'étranger pendant votre séjour, la CFE prend fin au retour. Vous basculez sur la Sécu française dès l'ouverture du dossier CPAM — pas de double cotisation.",
      "Statut MRE (Marocain Résidant à l'Étranger) ou binationaux : la fiscalité française récupère les revenus mondiaux à compter du jour J, y compris les revenus locatifs marocains. Anticipez avec un conseil fiscal franco-marocain, surtout si vous gardez un bien à Casablanca, Marrakech ou Tanger en location.",
      "Pension marocaine (CNSS, CIMR, CMR) : les trimestres cotisés sont totalisés avec ceux de l'Assurance retraite française grâce à la convention de sécurité sociale FR-MA. Conservez tous vos relevés de carrière CNSS et bulletins de paie marocains, ils seront demandés à 62-67 ans.",
      "Scolarité AEFE : si vos enfants étaient au lycée Lyautey, Descartes ou dans le réseau AEFE marocain, le retour vers le système public ou privé français se fait sans démarche d'équivalence (mêmes programmes, mêmes bulletins). Inscription en mairie suffit pour le primaire et le collège.",
      "Climat : le contraste hivernal peut être rude pour qui rentre de Marrakech ou d'Agadir. Privilégier Marseille, Montpellier, Toulouse, Perpignan ou Nice plutôt qu'une métropole du Nord ou de l'Est pour adoucir la transition, surtout la première année.",
    ],
  },
  {
    slug: "emirats-arabes-unis",
    name: "Émirats arabes unis",
    flag: "🇦🇪",
    depuisLabel: "les",
    auLabel: "Aux",
    currency: "AED",
    currencyToEurApprox: 0.25, // 1 AED ≈ 0,25 € (le dirham est arrimé au dollar à 3,6725 AED pour 1 USD ; janv. 2026 estimé)
    netConversionFactor: 0.22, // 100 AED nets correspondent à environ 22 € de pouvoir d'achat en France hors Paris : Dubaï/Abu Dhabi cumulent zéro impôt sur le revenu mais un coût du logement et de l'école très élevés
    bestSuitedCities: ["paris", "nice", "cannes", "antibes", "menton", "aix-en-provence", "marseille", "lyon", "montpellier"],
    intro:
      "Le retour des Émirats cumule trois chocs simultanés : un choc de change (le dirham est arrimé au dollar, partiellement convertible, et les transferts vers l'Europe passent par des banques locales aux frais et délais variables), un choc fiscal majeur (on quitte un revenu salarié sans impôt sur le revenu pour retrouver le barème français à plusieurs étages), et un choc de pouvoir d'achat (Dubaï et Abu Dhabi affichent des loyers premium, mais l'écart de salaire net joue très fortement à leur avantage). Côté fiscal, la convention bilatérale FR-EAU de 1989 évite la double imposition, mais la résidence fiscale française récupère mécaniquement les revenus mondiaux dès le jour J. Côté ancrage géographique, la Côte d'Azur (Nice, Cannes, Antibes, Menton) reste l'option naturelle pour qui cherche la continuité climatique et l'écosystème international ; Paris pour les profils corporate / finance qui gardent un employeur émirien en télétravail ou bascule vers un bureau parisien ; Aix-en-Provence, Marseille, Lyon et Montpellier offrent des compromis entre climat, art de vivre et infrastructures internationales.",
    hadVsWillHave: [
      { topic: "Salaire net", had: "20 000-45 000 AED net cadre (Dubaï / Abu Dhabi, secteur tech, finance, conseil)", willHave: "Équivalent ~3 500-5 500 € net en France après charges (cadre métropole, fiscalité comprise)" },
      { topic: "Loyer T3", had: "12 000-22 000 AED (Marina, Downtown Dubaï, Abu Dhabi Corniche)", willHave: "850-1 600 € (Nice, Lyon, Aix-en-Provence, Marseille), 1 800-2 800 € (Paris)" },
      { topic: "Santé", had: "Assurance privée employeur (Daman, Cigna, Bupa) 700-2 500 AED/mois + co-paiements", willHave: "Sécu + mutuelle 80-200 €/mois, accès médecin de famille et hôpital public sans condition d'emploi" },
      { topic: "Fiscalité revenu", had: "0 % sur le salaire ; 9 % sur le bénéfice d'entreprise au-delà de 375 000 AED depuis juin 2023 ; pas de CSG/RDS", willHave: "~25-40 % effectif (TMI + CSG 9,7 % + prélèvements sociaux selon le profil)" },
      { topic: "Garde d'enfants", had: "Nursery privée 2 000-5 000 AED/mois ; école internationale (GEMS, Nord Anglia, Lycée Français) 40 000-120 000 AED/an", willHave: "Crèche FR 150-400 €/mois après CAF/CMG, maternelle publique gratuite dès 3 ans, école internationale ~6 000-18 000 €/an si maintien" },
      { topic: "Voiture", had: "Essence ~0,75 €/L équivalent, autoroutes Salik à péage électronique, climatisation à plein régime 6 mois/an", willHave: "Carburant 1,65-1,95 €/L, péages autoroutiers fréquents, climatisation rarement nécessaire" },
      { topic: "Personnel de maison", had: "Femme de ménage 1 800-3 500 AED/mois temps plein ou nounou Live-in 2 500-4 500 AED courantes", willHave: "Coût équivalent multiplié par 3-5 en France, rarement temps plein hors familles à très haut revenu" },
      { topic: "TVA & courses", had: "VAT 5 % sur la plupart des biens, alcool taxé à 30 % en sus, alimentation importée souvent chère", willHave: "TVA 20 % standard / 5,5 % alimentaire, panier moyen plus dense en frais et produits locaux abordables" },
    ],
    adminPriorities: [
      { step: "Déclarer le retour au consulat & radier", detail: "Avant le départ : se radier du registre des Français établis hors de France auprès du consulat (Abu Dhabi ou Dubaï) et conserver l'attestation de radiation, utile pour la CAF, la CPAM et les démarches scolaires.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/R43251" },
      { step: "Annulation du visa de résidence & cancellation des comptes", detail: "Demander à l'employeur ou au sponsor l'annulation officielle du visa de résidence émirien et de l'Emirates ID, sinon les services bancaires et téléphoniques restent associés et facturés. La cancellation bancaire peut prendre 4 à 8 semaines : anticiper la clôture des comptes en parallèle de la dernière paie." },
      { step: "Transfert des avoirs & gratuity", detail: "Le dirham est partiellement convertible. Récupérer le gratuity (indemnité de fin de contrat, environ 21 jours de salaire par année d'ancienneté sur les 5 premières années, 30 jours au-delà) avant l'annulation du visa. Privilégier les services de transfert spécialisés (Wise, Lulu Exchange, Al Ansari) plutôt que les virements bancaires classiques pour limiter les frais et les délais." },
      { step: "Sécurité sociale", detail: "Pas de formulaire S1 (les Émirats ne sont pas dans l'UE et il n'existe pas de convention bilatérale de sécurité sociale FR-EAU) : ouvrir un dossier CPAM dès l'arrivée avec un justificatif de résidence et la fin de couverture de l'assureur privé émirien. Prévoir une assurance privée temporaire pour combler le délai d'instruction (3-6 semaines).", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32824" },
      { step: "Fiscalité revenu", detail: "Convention fiscale FR-EAU (1989) : résidence fiscale française à compter du jour J. Déclaration fractionnée l'année du retour côté français + clôture du dossier corporate tax si vous étiez indépendant ou actionnaire d'une free-zone company (DMCC, ADGM, DIFC). Pour les binationaux ayant conservé une activité ou un bien locatif aux EAU, les revenus restent imposables selon la convention avec crédit d'impôt français." },
      { step: "Permis de conduire", detail: "Le permis émirien (UAE driving licence) est échangeable contre un permis français dans les 12 mois suivant le retour grâce à l'accord de réciprocité FR-EAU. Au-delà, il faut repasser le code et la conduite. Démarche en ligne via l'ANTS, sur présentation du titre émirien et de la traduction assermentée en français." },
    ],
    warnings: [
      "Pas de convention de sécurité sociale FR-EAU : aucune totalisation entre les périodes cotisées à la pension émirienne (réservée aux nationaux) et l'Assurance retraite française. Si vous étiez affilié à la Caisse des Français de l'étranger (CFE) pendant votre séjour, c'est la CFE qui permettra de valider les trimestres retraite — conservez tous vos avis de cotisation CFE.",
      "Corporate tax 9 % depuis juin 2023 : si vous étiez actionnaire ou freelance sous licence free-zone (DMCC, IFZA, DIFC), l'impôt sur les sociétés a été introduit au-delà de 375 000 AED de bénéfice annuel. Anticiper la sortie avec un fiscaliste franco-émirien pour les sociétés actives, surtout si vous gardez la structure après le retour (rétention possible pour activité hors France, mais déclaration à l'IFU obligatoire).",
      "Gratuity et indemnité de fin de service : ne signez jamais l'annulation du visa avant d'avoir reçu le solde du gratuity sur votre compte. Une fois le visa annulé, vous n'avez plus de moyen de pression légale efficace côté EAU. En cas de litige, le tribunal du travail (DIFC ou onshore) prend 3 à 9 mois.",
      "Citoyens binationaux ou double résidence : la fiscalité française récupère les revenus mondiaux à compter du jour J, y compris les dividendes ou loyers émiriens. Pour les retours partiels (foyer fiscal en France, activité maintenue à Dubaï), la qualification de résidence fiscale est complexe — un avis fiscal franco-émirien est indispensable.",
      "Scolarité française à l'étranger : si vos enfants étaient au Lycée Français International de Dubaï (LFID), au Lycée Louis Massignon (Abu Dhabi) ou au Lycée Théodore Monod (réseau AEFE), le retour vers le système public ou privé français se fait sans démarche d'équivalence (mêmes programmes, mêmes bulletins). Inscription en mairie suffit pour le primaire, le collège et le lycée.",
      "Climat : le contraste hivernal peut être rude pour qui rentre de Dubaï ou d'Abu Dhabi (été à 45 °C, hivers doux à 20-25 °C). Privilégier Nice, Cannes, Antibes, Menton, Marseille, Aix-en-Provence ou Montpellier plutôt qu'une métropole du Nord ou de l'Est pour adoucir la transition, surtout la première année.",
      "Logement français en zone tendue : si vous ciblez Paris, Nice ou Lyon, anticipez 2-3 mois pour décrocher un T3 avec dossier d'expat (employeur émirien sortant, pas de fiches de paie FR récentes). Prévoir un garant Visale ou un employeur français déjà signé avant l'arrivée, et conserver vos relevés bancaires émiriens pour justifier le revenu d'épargne.",
    ],
  },
  {
    slug: "australie",
    name: "Australie",
    flag: "🇦🇺",
    depuisLabel: "l'",
    auLabel: "En",
    currency: "AUD",
    currencyToEurApprox: 0.61, // 1 AUD ≈ 0,61 € (autour de 1,63 AUD pour 1 € début 2026, estimé — taux fluctuant ces dernières années)
    netConversionFactor: 0.62, // 100 AUD nets correspondent à environ 62 € de pouvoir d'achat en France hors Paris : Sydney et Melbourne cumulent salaires élevés mais l'un des coûts du logement les plus chers au monde
    bestSuitedCities: ["bordeaux", "bayonne", "biarritz", "la-rochelle", "nantes", "marseille", "montpellier", "nice", "lyon", "paris"],
    intro:
      "Le retour d'Australie cumule trois particularités qui n'ont pas d'équivalent ailleurs dans cette liste : un choc de change (le dollar australien a perdu en moyenne 15 à 20 % face à l'euro sur la dernière décennie, ramenant les salaires sydneysiens à des équivalents proches des métropoles françaises), une distance physique majeure qui rend la transition logistique lourde (déménagement maritime 8-12 semaines, billets aller-retour à 1 800-2 500 € par personne) et un système de superannuation qui demande un arbitrage spécifique au moment du départ. Côté fiscal, la convention bilatérale FR-AU de 2006 évite la double imposition mais l'Australie applique un système original (year-end june, Medicare Levy, departure tax sur la super) qu'il faut clôturer proprement avant le retour. Côté ancrage géographique, les Français rentrant de Sydney, Melbourne, Brisbane ou Perth visent souvent la façade atlantique (Bordeaux, Bayonne, Biarritz, La Rochelle, Nantes) pour retrouver la culture surf et océan, ou l'arc méditerranéen (Marseille, Montpellier, Nice) pour la lumière et le climat ; Lyon et Paris restent les options corporate pour les profils tech, finance ou mining qui basculent vers un bureau européen.",
    hadVsWillHave: [
      { topic: "Salaire net", had: "7 500-12 500 AUD net cadre (Sydney / Melbourne, tech, finance, mining, biotech, hors stock & super)", willHave: "Équivalent ~3 200-4 800 € net en France après charges (cadre métropole)" },
      { topic: "Loyer T3", had: "3 500-5 500 AUD (centre Sydney, Inner Melbourne), 2 200-3 200 AUD (Brisbane, Perth, Adelaide)", willHave: "750-1 400 € (Bordeaux, Bayonne, Nantes, Montpellier, Lyon), 1 800-2 800 € (Paris)" },
      { topic: "Panier alimentaire", had: "Coles / Woolworths globalement 20-30 % plus chers qu'en France hors produits locaux", willHave: "Reprise du niveau français (Lidl, Carrefour, marchés), produits frais souvent plus abordables" },
      { topic: "Santé", had: "Medicare publique pour résidents permanents / citoyens (gap fee chez le GP courant), private hospital cover Bupa/Medibank ~150-300 AUD/mois pour éviter la surtaxe Medicare Levy Surcharge", willHave: "Sécu + mutuelle 80-200 €/mois, accès médecin et hôpital public sans gap fee systématique" },
      { topic: "Fiscalité revenu", had: "Tranches 0-19-32,5-37-45 % + Medicare Levy 2 % + Medicare Levy Surcharge 1-1,5 % sans private cover", willHave: "~25-35 % effectif (TMI + CSG 9,7 % + prélèvements sociaux)" },
      { topic: "Garde d'enfants", had: "Childcare 130-200 AUD/jour avant Child Care Subsidy, école française 18 000-30 000 AUD/an (Lycée Condorcet Sydney, programme bilingue Melbourne)", willHave: "Crèche FR 150-400 €/mois après CAF/CMG, maternelle publique gratuite dès 3 ans" },
      { topic: "Voiture", had: "Essence ~1,15 €/L équivalent, rego (vehicle registration) 700-1 100 AUD/an selon l'État, distances longues entre villes", willHave: "Carburant 1,65-1,95 €/L, péages autoroutiers fréquents, réseau ferroviaire dense (TER/TGV/Intercités)" },
      { topic: "Retraite obligatoire", had: "Superannuation employeur 11,5 % puis 12 % en juillet 2025, bloquée jusqu'à 60 ans (preservation age)", willHave: "Retraite par répartition + complémentaire AGIRC-ARRCO, pas d'épargne forcée mais plafond global différent" },
    ],
    adminPriorities: [
      { step: "Déclarer le retour au consulat & radier", detail: "Avant le départ : se radier du registre des Français établis hors de France auprès du consulat (Sydney, Melbourne ou Perth) et conserver l'attestation de radiation, utile pour la CAF, la CPAM et les démarches scolaires.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/R43251" },
      { step: "Departure tax & dossier ATO", detail: "L'année fiscale australienne court du 1ᵉʳ juillet au 30 juin : déposer une tax return de départ couvrant la période de résidence australienne via myTax. Cocher la case de fin de résidence pour basculer en non-resident status. Pour les actifs détenus en Australie (biens immobiliers, actions, ETF, crypto, super), la cessation de résidence fiscale déclenche en principe la deemed disposal (CGT event I1) — option possible pour différer l'imposition jusqu'à la vente effective, à formaliser dans la tax return. Anticiper avec un tax agent franco-australien." },
      { step: "Superannuation", detail: "Les fonds de super restent bloqués jusqu'à 60 ans (preservation age), même après le départ. Deux options : (1) conserver le fonds existant et le gérer à distance jusqu'au retrait (AustralianSuper, REST, UniSuper offrent un accès en ligne aux non-résidents) ; (2) si vous étiez sous Temporary visa, demander le Departing Australia Superannuation Payment (DASP) — soumis à une retenue à la source 35-65 % selon le type de visa et la date de versement. Conserver tous les statements annuels." },
      { step: "Sécurité sociale", detail: "Pas de formulaire S1 (l'Australie n'est pas dans l'UE). La convention bilatérale FR-AU de 2009 sur la sécurité sociale concerne uniquement les pensions de vieillesse et certains détachés, pas l'assurance maladie courante. Ouvrir un dossier CPAM dès l'arrivée avec un justificatif de résidence et la fin de couverture Medicare (formulaire Notice of Ceasing to be a Resident). Prévoir une assurance privée temporaire pour combler le délai d'instruction (3-6 semaines).", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32824" },
      { step: "Fiscalité revenu", detail: "Convention fiscale FR-AU (2006, en vigueur depuis 2009) : résidence fiscale française à compter du jour J. Déclaration fractionnée l'année du retour côté français (formulaire 2042 + 2047 pour les revenus de source australienne post-retour) + dernière tax return australienne avec la case de fin de résidence. Pour les revenus de pension de source australienne (super une fois en phase de retrait), la convention attribue l'imposition à la France avec crédit d'impôt pour la fraction retenue en Australie." },
      { step: "Permis & scolarité", detail: "Permis australien (chaque État/Territoire en délivre un — NSW, VIC, QLD, WA, SA, TAS, ACT, NT) échangeable contre un permis français dans les 12 mois suivant le retour grâce à l'accord de réciprocité FR-AU. Au-delà, il faut repasser le code et la conduite. Démarche en ligne via l'ANTS sur présentation du titre australien et de la traduction assermentée. Pour les enfants : si scolarisés au Lycée Condorcet Sydney ou en immersion bilingue, le retour vers le système français se fait sans démarche d'équivalence. Sinon, entretien d'équivalence avec l'établissement (le système australien primary / secondary / Year 12 / ATAR diffère du collège-lycée français)." },
    ],
    warnings: [
      "Choc de change accumulé : ne convertissez pas vos économies à un taux théorique de 0,75 € pour 1 AUD (niveau 2012). Le taux 2026 oscille autour de 0,58-0,63 €. Un patrimoine de 200 000 AUD vaut désormais ~120 000 € — anticipez la baisse mécanique du pouvoir d'achat avant de signer une promesse de vente en France.",
      "Superannuation et fiscalité française : une fois le retour effectif, les retraits de super sont vus par le fisc français comme des revenus de pension étrangère. La convention FR-AU 2006 attribue l'imposition à la France, avec crédit pour la retenue australienne (15 % en phase pension pour les fonds qualifiés). Pour les binationaux avec super >500 000 AUD, un avis fiscal franco-australien est indispensable avant tout retrait anticipé.",
      "Capital Gains Tax exit : la sortie du statut de résident fiscal australien déclenche l'imposition latente sur les actifs (immobilier, ETF, actions, crypto). Possibilité d'option pour différer (CGT event I1) mais à formaliser dans la tax return de départ — sinon CGT exigible immédiatement sur la plus-value latente.",
      "Distance et coût du retour matériel : déménagement maritime conteneur 20 pieds Sydney→Le Havre 4 500-7 500 € selon volume, délai 8-12 semaines. Vols aller-retour 1 800-2 500 €/personne. Animaux : sortie d'Australie sans quarantaine mais entrée France via UE (PETS pet passport + vaccination antirabique ≥30 j et ≤1 an), 800-1 500 €/animal selon la compagnie cargo. Anticiper 15 000-25 000 € pour une famille avec mobilier, hors voiture (jamais rentable de rapatrier).",
      "Pas de Medicare en France pour les non-citoyens : si vous étiez sous Temporary Skill Shortage 482, Bridging visa ou student visa, Medicare s'arrête net au départ. Aucune équivalence côté français — la CPAM ouvre un dossier comme pour tout résident, et les périodes cotisées à Medicare ne compteront pas pour les trimestres retraite (seules les périodes de travail salarié australien sont totalisées via la convention de sécurité sociale).",
      "Climat : le contraste hivernal peut être rude pour qui rentre de Sydney, Brisbane ou Perth (hivers doux à 15-22 °C). Privilégier Bordeaux, Bayonne, Biarritz, Marseille, Montpellier, Nice ou Aix-en-Provence plutôt qu'une métropole du Nord ou de l'Est pour adoucir la transition, surtout la première année — et si le surf reste central, la côte basque ou les Landes restent les ancrages les plus naturels.",
      "Logement français en zone tendue : si vous ciblez Bordeaux, Nantes, Lyon, Nice ou Paris, anticipez 2-3 mois pour décrocher un T3 avec dossier d'expat (employeur australien sortant, pas de fiches de paie FR récentes). Prévoir un garant Visale ou un employeur français déjà signé avant l'arrivée, et conserver vos relevés bancaires australiens (Commonwealth Bank, ANZ, Westpac, NAB) pour justifier le revenu d'épargne.",
    ],
  },
  {
    slug: "irlande",
    name: "Irlande",
    flag: "🇮🇪",
    depuisLabel: "l'",
    auLabel: "En",
    currency: "EUR",
    currencyToEurApprox: 1.0,
    netConversionFactor: 0.85, // 100 € nets en Irlande valent ~85 € de pouvoir d'achat en France hors Paris : alimentaire et énergie sensiblement plus chers côté irlandais, loyers Dublin parmi les plus tendus d'Europe
    bestSuitedCities: ["rennes", "brest", "saint-malo", "nantes", "bordeaux", "paris", "lyon", "toulouse", "rouen", "cherbourg"],
    intro:
      "Le retour d'Irlande n'a pas de choc de change (zone euro) mais réserve un contraste fiscal et résidentiel marqué. Côté revenu, les salaires bruts élevés de Dublin (siège européen de Google, Meta, LinkedIn, Stripe, Workday, plus la pharma et la finance internationale) sont rapidement absorbés par un système Income Tax + USC + PRSI cumulés et, surtout, par des loyers parmi les plus tendus d'Europe — un T3 dans le centre de Dublin tutoie ou dépasse Paris intra-muros depuis 2022. Côté France, la fiscalité reste plus lourde sur les hauts revenus mais le coût du logement métropole-province redevient absorbable. L'ancrage géographique le plus naturel reste la façade atlantique et la Bretagne : Rennes (capitale tech bretonne, vols directs Dublin 1 h 30, AEFE bilingue), Brest et Saint-Malo (ferry historiques Cork/Rosslare en saison), Nantes et Bordeaux (écosystèmes tech atlantique) ; Paris reste l'option corporate pour les profils finance, conseil et big tech qui basculent vers le bureau européen continental.",
    hadVsWillHave: [
      { topic: "Salaire net", had: "3 000-5 000 € net cadre tech / finance / pharma (Dublin, Cork, Galway, hors stock & RSU)", willHave: "Équivalent ~2 800-3 800 € net en France après charges (cadre métropole)" },
      { topic: "Loyer T3", had: "2 200-3 200 € (centre Dublin), 1 400-2 000 € (banlieue Dublin / Cork / Galway)", willHave: "650-1 200 € (Rennes, Nantes, Bordeaux, Toulouse, Lyon), 1 800-2 800 € (Paris)" },
      { topic: "Panier alimentaire", had: "Tesco / Dunnes / SuperValu : ~15-25 % plus cher qu'en France hors marques discount Lidl/Aldi", willHave: "Reprise du niveau français, produits frais locaux souvent plus abordables" },
      { topic: "Santé", had: "HSE publique (délais hospitaliers longs) + private health cover VHI / Laya / Irish Life ~1 200-2 500 €/an souvent souscrite via l'employeur", willHave: "Sécu + mutuelle 80-200 €/mois, accès médecin de famille et hôpital public plus uniforme" },
      { topic: "Fiscalité revenu", had: "Income Tax 20 % jusqu'à ~42 000 € puis 40 %, + USC 0,5-8 %, + PRSI 4,1 % salarié, soit ~30-48 % effectif", willHave: "~25-35 % effectif (TMI + CSG 9,7 % + prélèvements sociaux)" },
      { topic: "Garde d'enfants", had: "Crèche privée 1 100-1 800 €/mois (Dublin) avant Core Funding / NCS, école française Eurocampus Dublin ~10 000-14 000 €/an", willHave: "Crèche FR 150-400 €/mois après CAF/CMG, maternelle publique gratuite dès 3 ans" },
      { topic: "Voiture", had: "Essence / diesel ~1,75-1,90 €/L, motor tax annuelle 200-700 € selon la cylindrée, autoroutes M50 à péage", willHave: "Carburant 1,65-1,85 €/L, péages autoroutiers fréquents, réseau TER/TGV plus dense" },
      { topic: "TVA", had: "VAT 23 % standard / 13,5 % réduit (énergie, restauration) / 9 % presse", willHave: "TVA 20 % standard / 5,5 % alimentaire / 10 % restauration" },
    ],
    adminPriorities: [
      { step: "Déclarer le retour au consulat & radier", detail: "Avant le départ : se radier du registre des Français établis hors de France auprès du consulat (Dublin) et conserver l'attestation, utile pour la CAF, la CPAM et les démarches scolaires.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/R43251" },
      { step: "Clôturer le dossier Revenue & PPS", detail: "Notifier Revenue (administration fiscale irlandaise) du départ via myAccount et déposer la Form 12 ou Form 11 de l'année du retour avec la case Leaving Ireland. Demander un éventuel tax refund pour l'année partielle (Income Tax + USC + PRSI déjà retenus). Le PPS Number reste valide à vie : le conserver pour les régularisations résiduelles (P21, P60 électroniques, pension state contributory)." },
      { step: "Sécurité sociale", detail: "Demander le formulaire S1 au Department of Social Protection avant le départ pour le transmettre à la CPAM. Compter 3-6 semaines pour activation côté français. Résilier la private health cover (VHI, Laya, Irish Life Health) avec date exacte du départ — la facturation continue par défaut.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32824" },
      { step: "Fiscalité revenu", detail: "Convention fiscale FR-IE (1968) : résidence fiscale française à compter du jour J. Déclaration fractionnée l'année du retour côté français + dernière déclaration irlandaise Form 12 (PAYE) ou Form 11 (chargeable persons) avec déclaration de fin de résidence. Les RSU et stock-options Big Tech acquises en Irlande peuvent rester partiellement imposables côté irlandais selon la période d'attribution — anticiper avec un conseil franco-irlandais." },
      { step: "Permis & scolarité", detail: "Permis irlandais reconnu de droit en France (UE), pas d'échange obligatoire mais demande utile en cas de perte. Pour les enfants, inscription en mairie + entretien d'équivalence (le système irlandais primary 8 ans / secondary 5-6 ans avec Junior Cycle et Leaving Certificate diffère du collège-lycée français, mais les équivalences sont bien établies pour l'entrée en seconde ou en terminale)." },
    ],
    warnings: [
      "Stock-options et RSU Big Tech : un cadre Google, Meta ou Stripe accumule souvent 30-100 k€ de RSU/an. Leur fiscalité à cheval sur deux pays (acquisition côté Irlande, vesting partiel en France après le retour) est complexe — la base taxable irlandaise peut survivre 6-12 mois après le départ. Anticipez la vente avec un fiscaliste franco-irlandais et conservez tous les vesting statements (Schwab, Morgan Stanley ShareWorks, Carta).",
      "Pension irlandaise : la state pension (contributory) repose sur les PRSI contributions cotisées via votre PPS Number. Les trimestres sont totalisés au niveau européen avec ceux de l'Assurance retraite française — conservez tous les Contribution Statements téléchargeables depuis MyWelfare. Les pensions privées d'entreprise (occupational pension schemes, PRSA) restent acquises mais le rachat anticipé pour transfert vers la France peut déclencher une retenue irlandaise.",
      "Logement Dublin gardé en location : si vous conservez un appartement à Dublin loué après le départ, le revenu locatif reste imposable en Irlande (Non-Resident Landlord scheme avec retenue 20 % via le locataire ou un collection agent) et doit être déclaré en France au titre des revenus fonciers étrangers, avec crédit d'impôt selon la convention. Anticiper avec un agent immobilier irlandais et un fiscaliste.",
      "Loyers Dublin tendus : le marché locatif dublinois est l'un des plus saturés d'Europe depuis 2022, avec préavis bailleur souvent court et rent pressure zone partiellement contournée. Anticipez le préavis 30-90 jours selon le bail et le délai 6-10 semaines pour récupérer le deposit via la Residential Tenancies Board.",
      "Climat et lumière : le contraste avec l'Irlande (été frais, pluies fréquentes) est plus doux qu'avec les destinations chaudes, mais le manque de soleil cumulé sur plusieurs années rend la transition agréable vers la façade atlantique (Rennes, Nantes, Bordeaux) ou méditerranéenne (Toulouse, Montpellier). Pas de choc thermique brutal à anticiper.",
      "Compte bancaire irlandais : garder un compte ouvert 6 à 12 mois après le départ (AIB, Bank of Ireland, Revolut Ireland) facilite les régularisations Revenue (P21, refunds), les versements résiduels de RSU et la clôture de la private health cover. Anticipez la non-acceptance des IBAN IE par certains organismes français (la SEPA couvre l'IBAN mais quelques portails publics restent capricieux)."
    ],
  },
  {
    slug: "singapour",
    name: "Singapour",
    flag: "🇸🇬",
    depuisLabel: "",
    auLabel: "À",
    currency: "SGD",
    currencyToEurApprox: 0.68, // 1 SGD ≈ 0,68 € (autour de 1,47 SGD pour 1 € début 2026, estimé — taux plutôt stable ces dernières années grâce au régime de change géré par la MAS)
    netConversionFactor: 0.40, // 100 SGD nets correspondent à environ 40 € de pouvoir d'achat en France hors Paris : Singapour figure systématiquement dans le top 3 des villes les plus chères au monde (EIU Cost of Living Survey), dominé par le logement et l'automobile, mais compense côté salaire brut et fiscalité douce
    bestSuitedCities: ["paris", "nice", "cannes", "antibes", "aix-en-provence", "lyon", "toulouse", "bordeaux", "nantes", "montpellier"],
    intro:
      "Le retour de Singapour cumule trois chocs simultanés qui ne se lisent pas sur la fiche de paie brute : un choc de change (le dollar singapourien est arrimé à un panier de devises géré par la MAS, stable mais dont la conversion vers l'euro peut varier de 10 % sur 24 mois), un choc fiscal majeur (on quitte un barème progressif plafonné à 24 % au-delà d'un million de SGD pour retrouver le barème français cumulé à la CSG et aux prélèvements sociaux, soit 25 à 45 % effectif pour la plupart des cadres), et un choc de coût de la vie inversé qui surprend souvent — Singapour figure systématiquement dans le top 3 mondial des villes les plus chères (EIU Cost of Living Survey), tiré par un logement premium et un COE (Certificate of Entitlement) qui rend le véhicule prohibitif, mais le panier alimentaire et de services quotidiens reste soutenable une fois hors du CBD. Côté fiscal, la convention bilatérale FR-SG de 2015 évite la double imposition et clarifie le traitement des dividendes, intérêts et revenus d'emploi, mais la résidence fiscale française récupère mécaniquement les revenus mondiaux dès le jour J. Côté ancrage géographique, Paris reste l'option corporate la plus naturelle pour les profils finance (Singapour concentre le second hub bancaire d'Asie), tech (Grab, Shopee, ByteDance, ainsi que les bureaux régionaux Google, Meta, Stripe), pharma et hospitalité qui basculent vers les bureaux européens ; la Côte d'Azur (Nice, Cannes, Antibes, Aix-en-Provence) séduit ceux qui veulent conserver un climat doux et une communauté internationale dense après une décennie tropicale ; Toulouse pour les profils aéronautique et défense (Airbus a un lien historique avec Singapour et l'ASEAN), Lyon et Nantes pour les basculent tech et biotech, Bordeaux et Montpellier pour un compromis entre art de vivre et écoles internationales.",
    hadVsWillHave: [
      { topic: "Salaire net", had: "8 000-18 000 SGD net cadre (finance, tech, conseil, hors bonus et stock — Central Business District, Marina Bay, One-North)", willHave: "Équivalent ~3 500-6 000 € net en France après charges (cadre métropole, fiscalité comprise)" },
      { topic: "Loyer T3", had: "4 500-8 500 SGD (Orchard, River Valley, Tanjong Pagar, Novena — condo privé 2-3 chambres)", willHave: "850-1 600 € (Nice, Lyon, Aix-en-Provence, Bordeaux, Nantes), 1 800-2 800 € (Paris)" },
      { topic: "Panier alimentaire", had: "Hawker centres SGD 5-8/repas, supermarchés Cold Storage / FairPrice ~15-25 % plus chers qu'en France sur les produits importés, alcool taxé à ~40 % en sus", willHave: "Reprise du niveau français (Lidl, Carrefour, marchés), produits frais souvent plus abordables, vin de qualité redevient accessible" },
      { topic: "Santé", had: "MediShield Life pour les résidents permanents et citoyens uniquement ; expats sous IPMI (International Private Medical Insurance) via l'employeur — AXA, Cigna, Aetna, Bupa, Pacific Cross — SGD 200-800/mois selon la couverture et l'âge", willHave: "Sécu + mutuelle 80-200 €/mois, accès médecin de famille et hôpital public sans condition d'emploi ; plateau technique moins premium qu'à Mount Elizabeth ou Gleneagles mais uniforme sur le territoire" },
      { topic: "Fiscalité revenu", had: "Barème progressif 0-24 % pour les résidents (top tranche 24 % au-delà de SGD 1 M depuis YA 2024), pas de CSG-RDS, pas d'impôt sur les dividendes ni sur les plus-values", willHave: "~25-40 % effectif (TMI + CSG 9,7 % + prélèvements sociaux 17,2 % sur revenus du capital, IFI éventuel au-delà de 1,3 M€ de patrimoine immobilier net)" },
      { topic: "Garde d'enfants", had: "Childcare centre SGD 1 200-2 200/mois avant subsidies (réservées aux citoyens et PR), école internationale SGD 30 000-50 000/an (LFS — Lycée Français de Singapour, GESS, UWCSEA, Tanglin Trust, Dulwich College)", willHave: "Crèche FR 150-400 €/mois après CAF/CMG, maternelle publique gratuite dès 3 ans, école internationale ~6 000-18 000 €/an si maintien du parcours anglophone" },
      { topic: "Voiture", had: "COE (Certificate of Entitlement) SGD 80 000-140 000 pour 10 ans à ajouter au prix du véhicule, essence SGD 2,80-3,20/L, ERP (Electronic Road Pricing) et parking premium en CBD ; la majorité des expats n'a pas de voiture personnelle", willHave: "Carburant 1,65-1,95 €/L, péages autoroutiers fréquents, réseau TER/TGV dense, coût total de possession divisé par 5-10 vs Singapour" },
      { topic: "Personnel de maison", had: "Foreign Domestic Worker SGD 700-1 100/mois de salaire + SGD 300/mois de charges (levy, insurance, sécurité sociale) + logement fourni, temps plein 6j/7 courant", willHave: "Coût équivalent multiplié par 5-8 en France, quasi impossible en temps plein hors familles à très haut revenu, arbitrage vers services extérieurs ponctuels" },
    ],
    adminPriorities: [
      { step: "Déclarer le retour au consulat & radier", detail: "Avant le départ : se radier du registre des Français établis hors de France auprès du consulat général de France à Singapour et conserver l'attestation de radiation, utile pour la CAF, la CPAM et les démarches scolaires. À anticiper 4-6 semaines avant le vol.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/R43251" },
      { step: "Cancellation de l'Employment Pass & clôture des comptes locaux", detail: "L'employeur ou le sponsor doit annuler l'Employment Pass (EP), le S Pass ou le Dependant's Pass auprès du MOM (Ministry of Manpower) dans les 7 jours suivant la fin de l'emploi, sinon la couverture assurantielle et l'accès aux services bancaires restent formellement suspendus. La cancellation bancaire (DBS, OCBC, UOB, Standard Chartered) peut prendre 3 à 6 semaines : anticiper la clôture, la conversion et le rapatriement en parallèle. Résilier également le contrat SingTel/StarHub/M1 et la carte EZ-Link avant le vol." },
      { step: "CPF pour ex-PR & transfert des avoirs", detail: "Les expats sous Employment Pass ne cotisent pas au Central Provident Fund (CPF réservé aux citoyens et PR). Si vous étiez résident permanent puis avez renoncé à la PR, vous pouvez retirer votre solde CPF (Ordinary Account + Special Account + Medisave) en totalité vers un compte étranger — démarche à instruire auprès du CPF Board avant le départ, comptez 2-4 semaines de traitement. Pour les transferts d'épargne SGD → EUR, privilégier les services spécialisés (Wise, Revolut Business, DBS Treasures) plutôt que les virements bancaires classiques : frais et taux de change nettement plus favorables sur les gros montants." },
      { step: "Sécurité sociale", detail: "Pas de formulaire S1 (Singapour n'est pas dans l'UE et il n'existe pas de convention bilatérale de sécurité sociale FR-SG couvrant l'assurance maladie courante) : ouvrir un dossier CPAM dès l'arrivée avec un justificatif de résidence et la fin de couverture IPMI. Prévoir une assurance privée temporaire (Cigna Global, Allianz Care) pour combler le délai d'instruction (3-8 semaines). Les périodes cotisées à MediShield Life (pour les ex-PR) et l'affiliation à la Caisse des Français de l'étranger (CFE) sont deux mécanismes distincts — la CFE est ce qui permet de valider les trimestres retraite côté français.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32824" },
      { step: "Fiscalité revenu", detail: "Convention fiscale FR-SG (2015, entrée en vigueur 2016) : résidence fiscale française à compter du jour J. Déclaration fractionnée l'année du retour côté français (formulaire 2042 + 2047 pour les revenus de source singapourienne post-retour) + dernière déclaration IRAS avec le formulaire Form IR21 (Tax Clearance) déposé par l'employeur au moins un mois avant la fin de l'emploi. Sans Tax Clearance validé, l'employeur retient légalement le solde de salaire jusqu'à régularisation avec l'IRAS. Pour les binationaux ayant conservé une activité, un compte-titre ou un bien locatif à Singapour, les revenus restent imposables selon la convention avec crédit d'impôt français." },
      { step: "Permis de conduire", detail: "Le permis singapourien (Singapore Driving Licence) est échangeable contre un permis français dans les 12 mois suivant le retour grâce à l'accord de réciprocité FR-SG. Attention à la particularité locale : si vous n'aviez qu'un International Driving Permit adossé à un permis d'un pays tiers (français, australien, britannique), c'est ce dernier qui reste valide en France sans démarche. Au-delà des 12 mois, il faut repasser le code et la conduite. Démarche en ligne via l'ANTS, sur présentation du titre singapourien et de la traduction assermentée en français." },
    ],
    warnings: [
      "Pas de convention de sécurité sociale FR-SG : aucune totalisation entre les périodes cotisées au CPF (Central Provident Fund, réservé aux citoyens et PR singapouriens) et l'Assurance retraite française. Si vous étiez affilié à la Caisse des Français de l'étranger (CFE) pendant votre séjour à Singapour, c'est la CFE qui permettra de valider les trimestres retraite — conservez tous vos avis de cotisation CFE, sans quoi ces années resteront des zéros dans le relevé de carrière.",
      "Choc de coût de la vie inversé : contre-intuitivement, un cadre gagnant SGD 12 000 net à Singapour ne double pas son pouvoir d'achat en rentrant à 5 500 € net en France. Le logement français est nettement plus abordable (un T3 à Nice loue le tiers d'un condo équivalent à Orchard), mais le poste alimentation courante repasse au-dessus du hawker centre singapourien, l'automobile redevient nécessaire hors métropole intra-muros, et la fiscalité récupère l'écart brut sur les revenus. Anticipez un maintien à 60-75 % de votre standard de vie singapourien, pas une amélioration.",
      "Tax Clearance IRAS obligatoire : ne signez jamais votre lettre de démission sans une timeline claire de dépôt du Form IR21 par l'employeur. La retenue de salaire par l'employeur est légale tant que l'IRAS n'a pas validé la clearance, et le déblocage peut prendre 3-8 semaines. Pour les cadres avec bonus différé ou stock vestings post-départ, le Tax Clearance couvre uniquement la période travaillée — les revenus tardifs restent imposables à Singapour au barème non-résident (15 % ou barème progressif, le plus favorable).",
      "Stock-options et RSU asiatiques : un cadre Grab, Shopee, ByteDance ou un profil banking accumule souvent SGD 50-200 k/an de RSU/stock-options. Leur fiscalité à cheval sur deux pays (attribution à Singapour, vesting partiel après le retour en France) est complexe — la base taxable singapourienne peut survivre 6-24 mois selon les grants. Anticipez la vente avec un fiscaliste franco-singapourien et conservez tous les vesting statements (Carta, Shareworks by Morgan Stanley, E*TRADE), notamment pour les stock qui vestent après la Tax Clearance.",
      "Citoyens binationaux ou double résidence : la fiscalité française récupère les revenus mondiaux à compter du jour J, y compris les dividendes ou loyers singapouriens et les gains sur les comptes-titres ouverts à Singapour (DBS Vickers, OCBC Securities, Saxo). Pour les retours partiels (foyer fiscal en France, activité maintenue à Singapour en télétravail), la qualification de résidence fiscale est complexe — un avis fiscal franco-singapourien est indispensable, surtout si votre employeur ne propose pas de bascule vers une entité française.",
      "Scolarité française à l'étranger : si vos enfants étaient au Lycée Français de Singapour (LFS, campus Ang Mo Kio et Serangoon, réseau AEFE), le retour vers le système public ou privé français se fait sans démarche d'équivalence (mêmes programmes, mêmes bulletins). Inscription en mairie suffit pour le primaire, le collège et le lycée. Pour les enfants en cursus international (UWCSEA, GESS, Tanglin Trust, Dulwich College), l'entretien d'équivalence avec l'établissement français cible est indispensable — les programmes IB et IGCSE se transposent bien vers les sections internationales des lycées publics (Paris, Lyon, Nice, Toulouse, Bordeaux) et vers les écoles bilingues privées.",
      "Distance et coût du retour matériel : déménagement maritime conteneur 20 pieds Singapour→Le Havre/Fos-sur-Mer 4 800-8 000 € selon le volume, délai 6-10 semaines via Suez ou route Cap. Vols aller-retour 1 000-1 800 €/personne en économie, 3 000-5 500 € en business. Animaux : sortie de Singapour sous AVA (contrôle vétérinaire, puce ISO, vaccination antirabique ≥30 jours et ≤1 an, titrage sérologique pour l'entrée UE) et entrée France via PET Passport, comptez 800-1 500 €/animal en cargo Air France ou Singapore Airlines. Prévoir 15 000-30 000 € pour une famille avec mobilier, hors voiture (jamais rentable de rapatrier, la conduite à gauche complique aussi l'usage en France).",
      "Climat : le contraste hivernal peut être rude pour qui rentre de Singapour (climat équatorial, 26-32 °C toute l'année, humidité 80-90 %). Privilégier Nice, Cannes, Antibes, Aix-en-Provence, Marseille, Montpellier ou Bordeaux plutôt qu'une métropole du Nord ou de l'Est pour adoucir la transition, surtout la première année — un cadre habitué au climat tropical trouvera un hiver à Lille, Strasbourg ou Reims particulièrement éprouvant les six premiers mois.",
      "Logement français en zone tendue : si vous ciblez Paris, Nice, Lyon ou Bordeaux, anticipez 2-3 mois pour décrocher un T3 avec dossier d'expat (employeur singapourien sortant, pas de fiches de paie FR récentes). Prévoir un garant Visale ou un employeur français déjà signé avant l'arrivée, et conserver vos relevés bancaires singapouriens (DBS, OCBC, UOB, Standard Chartered) et l'attestation de solde CPF pour justifier le revenu d'épargne. Les agences françaises acceptent difficilement les IPMI comme preuve d'assurance santé — activer la CPAM en priorité aide.",
    ],
  },
  {
    slug: "japon",
    name: "Japon",
    flag: "🇯🇵",
    depuisLabel: "le",
    auLabel: "Au",
    currency: "JPY",
    currencyToEurApprox: 0.0058, // 1 JPY ≈ 0,0058 € (yen historiquement faible depuis 2022, autour de 170-175 JPY pour 1 € début 2026, estimé)
    netConversionFactor: 0.75, // 100 000 JPY nets correspondent à environ 750 € de pouvoir d'achat en France hors Paris : Tokyo cumule loyers modérés au regard de son standing mais alimentation, transport et loisirs très abordables
    bestSuitedCities: ["paris", "lyon", "nice", "marseille", "bordeaux", "aix-en-provence", "toulouse", "montpellier", "colmar"],
    intro:
      "Le retour du Japon cumule trois particularités qui structurent toute la préparation : un choc de change historique en défaveur du yen (le JPY a perdu près de 30 % face à l'euro depuis 2022, ramenant les salaires tokyoïtes à des équivalents plus modestes qu'auparavant), un système fiscal et social japonais très structuré (Shakai Hoken, retenue à la source par l'employeur, résidence fiscale mondiale au-delà de 5 ans de séjour) et une distance géographique majeure qui rend la logistique lourde (déménagement maritime 8-12 semaines via Yokohama ou Kobe, billets aller-retour Tokyo-Paris 900-2 200 € par personne). Côté fiscal, la convention bilatérale FR-JP de 1995 (mise à jour par avenant en 2007) évite la double imposition, et la convention de sécurité sociale FR-JP de 2005 (entrée en vigueur en 2007) permet, cas unique en Asie, la totalisation des trimestres retraite entre l'Assurance retraite française et le Kosei Nenkin (retraite salariée japonaise) ou le Kokumin Nenkin (retraite indépendants). Côté ancrage géographique, les Français rentrant de Tokyo, Yokohama, Osaka ou Kyoto visent souvent Paris (Air France direct Roissy-Haneda, écosystème corporate franco-japonais, réseau d'anciens LFI), Lyon (jumelage historique avec Yokohama, capitale gastronomique proche de l'esprit kaiseki, École normale supérieure), la Côte d'Azur (Nice avec sa communauté japonaise historique, Aix-en-Provence pour l'art de vivre méditerranéen), Bordeaux (industrie du vin très connectée au marché japonais premium), Toulouse et Montpellier pour la lumière du Sud, et Colmar (jumelage ancien avec Sanjo).",
    hadVsWillHave: [
      { topic: "Salaire net", had: "500 000-1 200 000 JPY net/mois cadre gaijin (Tokyo, Yokohama, tech, finance, luxe, gastronomie, hors bonus)", willHave: "Équivalent ~2 800-4 500 € net en France après charges (cadre métropole, fiscalité comprise)" },
      { topic: "Loyer 2LDK", had: "180 000-320 000 JPY (centre Tokyo : Shibuya, Meguro, Minato), 120 000-180 000 JPY (Yokohama, Osaka, Kyoto)", willHave: "700-1 300 € (Lyon, Bordeaux, Nantes, Toulouse, Montpellier), 1 500-2 500 € (Paris intramuros)" },
      { topic: "Panier alimentaire", had: "Konbini bento 500-800 JPY, ramen 900-1 200 JPY, riz et poisson très abordables, fruits chers (une pomme 200-400 JPY, un melon 3 000-8 000 JPY)", willHave: "Reprise du niveau français, fruits et vins nettement plus abordables, poisson frais et cuisine japonaise à domicile beaucoup plus chère" },
      { topic: "Santé", had: "Shakai Hoken (assurance salariée) ou Kokumin Kenko Hoken (assurance municipale) : cotisation ~10 % du salaire partagée employeur/salarié, 30 % de reste à charge sur consultations et hospitalisations, plafonnement mensuel", willHave: "Sécu + mutuelle 80-200 €/mois, accès médecin de famille et hôpital public sans reste à charge structurel équivalent" },
      { topic: "Fiscalité revenu", had: "Impôt national progressif 5-45 % + Juminzei local (~10 % forfaitaire) + Kōsei Nenkin 9,15 % salarié, soit ~25-55 % effectif selon le revenu", willHave: "~25-40 % effectif (TMI + CSG 9,7 % + prélèvements sociaux 17,2 % sur revenus du capital)" },
      { topic: "Transport quotidien", had: "Suica/Pasmo métro-JR ~200-400 JPY par trajet, abonnement mensuel employeur remboursé intégralement (teiki-ken), réseau ultra-dense, ponctualité extrême", willHave: "Abonnement TCL Lyon ~65 €/mois, Navigo Paris 88 €/mois, réseau TER/TGV correct mais fréquences et ponctualité en net retrait vs JR" },
      { topic: "Garde d'enfants", had: "Hoikuen (crèche publique) 20 000-70 000 JPY/mois selon revenus municipaux, école internationale (Lycée Français International de Tokyo — LFIT à Takinogawa) 1,3-2,5 M JPY/an, ASIJ ou Nishimachi 2,5-3,5 M JPY/an", willHave: "Crèche FR 150-400 €/mois après CAF/CMG, maternelle publique gratuite dès 3 ans, section internationale japonaise disponible à Paris (Chaptal), Strasbourg (Pontonniers) et Lyon (Cité scolaire internationale)" },
      { topic: "Voiture", had: "Essence 165-180 JPY/L, Shaken (contrôle technique lourd tous les 2 ans, 80 000-180 000 JPY), stationnement obligatoire justifié à l'achat (shako shomeisho), la majorité des expats de Tokyo/Osaka n'a pas de voiture", willHave: "Carburant 1,65-1,95 €/L, contrôle technique tous les 2 ans 80 €, voiture indispensable hors métropole intramuros" },
    ],
    adminPriorities: [
      { step: "Déclarer le retour au consulat & radier", detail: "Avant le départ : se radier du registre des Français établis hors de France auprès du consulat général de France à Tokyo (ou de Kyoto pour le Kansai) et conserver l'attestation de radiation, utile pour la CAF, la CPAM et les démarches scolaires. À anticiper 4-6 semaines avant le vol.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/R43251" },
      { step: "Notification du départ à la mairie & clôture des comptes locaux", detail: "Déposer le tenshutsu todoke (avis de départ) au kuyakusho ou shiyakusho de résidence dans les 14 jours précédant le départ : sans cette formalité, le Juminzei local et l'affiliation Kokumin Kenko Hoken continuent d'être facturés. Restituer la Zairyu Card (carte de résident) à l'immigration à l'aéroport (Narita, Haneda, Kansai) au moment du départ. Résilier les contrats mobile (docomo, au, SoftBank, Rakuten Mobile) et fixe (NTT/JCOM) au moins 30 jours avant le départ pour éviter les pénalités de résiliation anticipée. La clôture bancaire (MUFG, SMBC, Mizuho, Shinsei, Sony Bank) peut prendre 2-4 semaines : anticiper la conversion JPY→EUR en parallèle." },
      { step: "Nenkin (retraite) : lump-sum ou totalisation", detail: "Deux options structurent ce choix. (1) Dattai Ichijikin (lump-sum withdrawal) : versement forfaitaire des cotisations Kosei Nenkin ou Kokumin Nenkin, plafonné à 5 ans de cotisations, avec une retenue à la source de 20,42 % récupérable ensuite via un tax representative resté au Japon. À demander sous 2 ans après le départ. (2) Totalisation via la convention FR-JP 2005 : conserver les périodes cotisées au Japon pour valider les trimestres à l'Assurance retraite française — pertinent si vous prévoyez plus de 5 ans de cotisation ou si vous êtes proche du taux plein. Les deux options s'excluent : le lump-sum efface les périodes pour la totalisation. À arbitrer avec un conseiller franco-japonais." },
      { step: "Sécurité sociale", detail: "Pas de formulaire S1 (le Japon n'est pas dans l'UE). La convention bilatérale de sécurité sociale FR-JP de 2005 couvre uniquement les pensions de vieillesse (Kosei Nenkin, Kokumin Nenkin) et l'invalidité, pas l'assurance maladie courante. Ouvrir un dossier CPAM dès l'arrivée avec un justificatif de résidence et la fin de couverture Shakai Hoken (formulaire de retrait fourni par l'ex-employeur). Prévoir une assurance privée temporaire (April International, Chapka, Cigna Global) pour combler le délai d'instruction (3-6 semaines). L'affiliation à la Caisse des Français de l'étranger (CFE) durant le séjour japonais reste utile pour valider les trimestres retraite côté français.", officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32824" },
      { step: "Fiscalité revenu", detail: "Convention fiscale FR-JP (1995, avenants 2007) : résidence fiscale française à compter du jour J. Déclaration fractionnée l'année du retour côté français (formulaire 2042 + 2047 pour les revenus de source japonaise post-retour) + dernière déclaration japonaise (Kakutei Shinkoku) auprès du bureau des impôts (Zeimusho) avant le 15 mars suivant la fin de l'année fiscale japonaise (calendrier civil au Japon). Si vous étiez au Japon depuis moins de 5 ans, vous restiez fiscalement 'non-permanent resident' — seuls les revenus de source japonaise et les revenus étrangers rapatriés étaient imposés. Au-delà de 5 ans, vous étiez 'permanent resident' et imposé sur le revenu mondial : la sortie déclenche des régularisations potentielles. Pour les binationaux ayant conservé une activité, un compte-titre ou un bien locatif au Japon, les revenus restent imposables selon la convention avec crédit d'impôt français." },
      { step: "Permis de conduire", detail: "Le permis japonais (unten menkyosho) est échangeable contre un permis français dans les 12 mois suivant le retour, grâce à l'accord de réciprocité FR-JP, sous réserve d'avoir résidé au moins 3 mois au Japon après la délivrance du permis japonais. Au-delà des 12 mois, il faut repasser le code et la conduite. La démarche se fait en ligne via l'ANTS, sur présentation du titre japonais et d'une traduction officielle en français (délivrée par la JAF — Japan Automobile Federation, ou une ambassade). Attention : conduite à gauche au Japon, à droite en France — prévoir une période de réadaptation, surtout dans les ronds-points." },
    ],
    warnings: [
      "Convention de sécurité sociale FR-JP 2005 : contrairement à la plupart des pays hors UE, les trimestres cotisés au Japon (Kosei Nenkin ou Kokumin Nenkin) sont totalisables avec ceux de l'Assurance retraite française. Concrètement, un cadre ayant travaillé 8 ans au Japon puis 30 ans en France valide 38 ans côté français (avec paiement partiel japonais à 65 ans). Attention : ce dispositif est mutuellement exclusif avec le Dattai Ichijikin (lump-sum withdrawal). Si vous demandez le lump-sum au départ, vous perdez le bénéfice de la totalisation pour les périodes concernées — à arbitrer avec un conseiller franco-japonais avant de signer.",
      "Choc de change historique : ne convertissez pas vos économies à un taux théorique de 0,009 € pour 1 JPY (niveau 2012-2013). Le taux 2026 oscille autour de 0,0055-0,0062 €. Un patrimoine de 20 M JPY vaut désormais ~115 000 € contre ~180 000 € il y a 12 ans. Anticipez cette baisse mécanique du pouvoir d'achat avant toute promesse de vente immobilière en France, et privilégiez un transfert par plusieurs tranches sur 6-12 mois plutôt qu'un one-shot pour lisser la volatilité EUR/JPY.",
      "Exit tax japonaise (Kokugai Ten-shutsu Zei) : depuis 2015, la sortie du statut de résident fiscal permanent japonais avec des actifs financiers (actions, ETF, dérivés) supérieurs à 100 M JPY (~575 k€) déclenche une imposition sur la plus-value latente. Concerne principalement les cadres seniors, entrepreneurs, dirigeants avec compte-titres SBI, Rakuten Securities, Nomura ou Interactive Brokers Japan. Anticipation obligatoire avec un tax accountant (zeirishi) : options possibles de sursis (5-10 ans) sous garantie et déclaration continue.",
      "Kakutei Shinkoku de départ : la déclaration fiscale japonaise (calendrier civil, du 16 février au 15 mars pour l'année précédente) doit être déposée même pour l'année partielle du départ. Pour les salariés, l'employeur pratique généralement le Nenmatsu Chosei (régularisation de fin d'année) au moment de la démission, mais si vous partez en cours d'année, une déclaration résiduelle par vous-même ou via un tax representative (nozei kanrinin) désigné avant le départ est nécessaire — sinon les remboursements Juminzei ou d'assurance santé restent inaccessibles.",
      "Stock-options et RSU japonaises ou multinationales : un cadre Google Japan, Amazon Japan, Rakuten, Sony ou Uniqlo peut accumuler des RSU ou stock-options attribués au Japon. Leur fiscalité à cheval sur deux pays (attribution japonaise, vesting partiel après le retour en France) est complexe — la base taxable japonaise peut survivre 24-48 mois selon les grants. La convention FR-JP prévoit un crédit d'impôt, mais l'articulation avec le régime fiscal français des attributions gratuites (AGA) et des BSPCE est délicate. Conserver tous les vesting statements (E*TRADE, Shareworks, Carta) et anticiper avec un fiscaliste franco-japonais.",
      "Citoyens binationaux ou double résidence : la fiscalité française récupère les revenus mondiaux à compter du jour J, y compris les dividendes ou loyers japonais et les gains sur les comptes-titres ouverts au Japon (SBI, Rakuten Securities, Nomura, Monex). Pour les retours partiels (foyer fiscal en France, activité maintenue au Japon en télétravail), la qualification de résidence fiscale est complexe — un avis fiscal franco-japonais est indispensable, surtout si votre employeur ne propose pas de bascule vers une entité française ou européenne.",
      "Scolarité française à l'étranger : si vos enfants étaient au Lycée Français International de Tokyo (LFIT, campus Takinogawa, réseau AEFE), le retour vers le système public ou privé français se fait sans démarche d'équivalence (mêmes programmes, mêmes bulletins). Inscription en mairie suffit pour le primaire, le collège et le lycée. Pour les enfants en cursus international ou japonais (ASIJ, Nishimachi, Seisen, écoles publiques japonaises), l'entretien d'équivalence avec l'établissement français cible est indispensable — les sections internationales japonaises des lycées publics de Paris (Chaptal), Strasbourg (Pontonniers) et Lyon (Cité scolaire internationale) sont l'option de continuité linguistique la plus naturelle, avec un bagage biculturel préservé.",
      "Distance et coût du retour matériel : déménagement maritime conteneur 20 pieds Tokyo/Yokohama→Le Havre 5 500-9 000 € selon le volume, délai 8-12 semaines via Suez ou route Cap. Vols aller-retour 900-2 200 €/personne en économie, 3 500-6 500 € en business (Air France, ANA, JAL, Turkish Airlines). Animaux : sortie du Japon sans quarantaine sous certificat MAFF (Ministry of Agriculture, Forestry and Fisheries) avec puce ISO, vaccination antirabique ≥30 jours et ≤1 an, titrage sérologique 180 jours avant le vol (délai incompressible côté Japon). Entrée France via PET Passport, comptez 900-1 800 €/animal en cargo Air France ou ANA. Prévoir 15 000-28 000 € pour une famille avec mobilier, hors voiture (jamais rentable à rapatrier, conduite à gauche au Japon complique aussi l'usage en France).",
      "Climat : le contraste peut être marqué pour qui rentre de Tokyo (climat subtropical humide, étés à 32-37 °C et 80 % d'humidité, hivers doux à 5-10 °C). Le climat de Kyoto ou Osaka est proche mais les hivers y sont légèrement plus rigoureux. Privilégier Nice, Marseille, Aix-en-Provence, Bordeaux ou Montpellier plutôt qu'une métropole du Nord ou de l'Est pour adoucir la transition, surtout la première année — un cadre habitué à la douceur hivernale tokyoïte trouvera Lille, Strasbourg ou Reims particulièrement éprouvants les six premiers mois.",
      "Logement français en zone tendue : si vous ciblez Paris, Nice, Lyon ou Bordeaux, anticipez 2-3 mois pour décrocher un T3 avec dossier d'expat (employeur japonais sortant, pas de fiches de paie FR récentes). Prévoir un garant Visale ou un employeur français déjà signé avant l'arrivée, et conserver vos relevés bancaires japonais (MUFG, SMBC, Mizuho, Shinsei, Sony Bank) et le certificat de retrait du Kosei Nenkin ou du Nenkin Techō (livret de retraite) pour justifier le revenu d'épargne. Les agences françaises acceptent mal les IPMI comme preuve d'assurance santé — activer la CPAM en priorité aide.",
    ],
  },
];

export function getExpatCountry(slug: string): ExpatCountryProfile | undefined {
  return EXPAT_COUNTRIES.find((c) => c.slug === slug);
}
