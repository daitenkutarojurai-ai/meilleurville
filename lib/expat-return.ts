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
  | "maroc";

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
];

export function getExpatCountry(slug: string): ExpatCountryProfile | undefined {
  return EXPAT_COUNTRIES.find((c) => c.slug === slug);
}
